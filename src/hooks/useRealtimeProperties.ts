import { useState, useEffect, useCallback } from 'react';
import { supabase, DbProperty, DbPropertyImage, DbPropertyFeature, DbPropertyType } from '../lib/supabase';
import { Property } from '../types';
import { RealtimeChannel } from '@supabase/supabase-js';

// Convert DB property to frontend Property type
function mapDbToProperty(
  dbProp: DbProperty,
  images: DbPropertyImage[],
  features: DbPropertyFeature[],
  propertyType?: DbPropertyType
): Property {
  const primaryImage = images.find(img => img.is_primary) || images[0];
  const statusMap: Record<string, Property['status']> = {
    available: 'available',
    reserved: 'reserved',
    sold: 'sold',
    under_construction: 'under_construction'
  };
  const typeMap: Record<string, Property['type']> = {
    casa: 'house',
    departamento: 'apartment',
    lote: 'land',
    complejo: 'house',
    comercial: 'commercial'
  };

  return {
    id: dbProp.id,
    title: dbProp.title,
    description: dbProp.description || null,
    price: dbProp.price,
    currency: dbProp.currency,
    property_type_id: dbProp.property_type_id,
    development_id: dbProp.development_id,
    address: dbProp.address,
    latitude: dbProp.latitude,
    longitude: dbProp.longitude,
    area_total: dbProp.area_total,
    area_built: dbProp.area_built,
    bedrooms: dbProp.bedrooms,
    bathrooms: dbProp.bathrooms,
    parking_spaces: dbProp.parking_spaces,
    status: statusMap[dbProp.status] || 'available',
    availability_date: dbProp.availability_date,
    commission_rate: dbProp.commission_rate,
    is_featured: dbProp.is_featured,
    is_published: dbProp.is_published,
    created_by: dbProp.created_by,
    updated_by: dbProp.updated_by,
    created_at: dbProp.created_at,
    updated_at: dbProp.updated_at,
    location: {
      city: '',
      address: dbProp.address || ''
    },
    area: dbProp.area_total || dbProp.area_built || 0,
    image: primaryImage?.image_url || '',
    gallery: images.map(img => img.image_url),
    type: typeMap[propertyType?.name || 'casa'] || 'house',
    featured: dbProp.is_featured
  };
}

export function useRealtimeProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  const fetchProperties = useCallback(async () => {
    try {
      const { data: props, error: propsError } = await supabase
        .from('properties')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      
      if (propsError) throw propsError;

      if (!props || props.length === 0) {
        setProperties([]);
        return;
      }

      const propIds = props.map(p => p.id);

      const [imagesRes, featuresRes, typesRes] = await Promise.all([
        supabase.from('property_images').select('*').in('property_id', propIds),
        supabase.from('property_features').select('*').in('property_id', propIds),
        supabase.from('property_types').select('*')
      ]);

      const images = imagesRes.data || [];
      const features = featuresRes.data || [];
      const types = typesRes.data || [];

      const mapped = props.map(p => {
        const propImages = images.filter(img => img.property_id === p.id);
        const propFeatures = features.filter(f => f.property_id === p.id);
        const propType = types.find(t => t.id === p.property_type_id);
        return mapDbToProperty(p, propImages, propFeatures, propType);
      });

      setProperties(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching properties');
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePropertyInList = useCallback((updatedProperty: Property) => {
    setProperties(prev => {
      const index = prev.findIndex(p => p.id === updatedProperty.id);
      if (index !== -1) {
        const newList = [...prev];
        newList[index] = updatedProperty;
        return newList;
      }
      return [updatedProperty, ...prev];
    });
  }, []);

  const removePropertyFromList = useCallback((propertyId: string) => {
    setProperties(prev => prev.filter(p => p.id !== propertyId));
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchProperties();

    // Setup realtime subscription (temporarily disabled to fix infinite re-renders)
    const propertiesChannel = supabase
      .channel('properties-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'properties' },
        async (payload) => {
          console.log('Properties change received!', payload);
          
          if (payload.eventType === 'INSERT') {
            // Fetch the new property with related data
            const newProperty = payload.new as DbProperty;
            
            const [imagesRes, featuresRes, typesRes] = await Promise.all([
              supabase.from('property_images').select('*').eq('property_id', newProperty.id),
              supabase.from('property_features').select('*').eq('property_id', newProperty.id),
              supabase.from('property_types').select('*').eq('id', newProperty.property_type_id)
            ]);

            const mappedProperty = mapDbToProperty(
              newProperty,
              imagesRes.data || [],
              featuresRes.data || [],
              typesRes.data?.[0]
            );

            updatePropertyInList(mappedProperty);
          } else if (payload.eventType === 'UPDATE') {
            // Fetch the updated property with related data
            const updatedProperty = payload.new as DbProperty;
            
            const [imagesRes, featuresRes, typesRes] = await Promise.all([
              supabase.from('property_images').select('*').eq('property_id', updatedProperty.id),
              supabase.from('property_features').select('*').eq('property_id', updatedProperty.id),
              supabase.from('property_types').select('*').eq('id', updatedProperty.property_type_id)
            ]);

            const mappedProperty = mapDbToProperty(
              updatedProperty,
              imagesRes.data || [],
              featuresRes.data || [],
              typesRes.data?.[0]
            );

            updatePropertyInList(mappedProperty);
          } else if (payload.eventType === 'DELETE') {
            const deletedProperty = payload.old as DbProperty;
            removePropertyFromList(deletedProperty.id);
          }
        }
      )
      .subscribe();

    setChannel(propertiesChannel);

    return () => {
      propertiesChannel.unsubscribe();
    };
  }, []); // Remove dependencies to fix infinite re-renders

  const addProperty = async (property: Omit<Property, 'id'>) => {
    console.log('🏠 [HOOK] addProperty called with:', property);
    
    const { data: typeData } = await supabase
      .from('property_types')
      .select('id')
      .eq('name', property.type === 'house' ? 'casa' : property.type === 'apartment' ? 'departamento' : property.type === 'land' ? 'lote' : 'comercial')
      .maybeSingle();

    const { data, error } = await supabase
      .from('properties')
      .insert({
        title: property.title,
        description: property.description,
        price: property.price,
        currency: property.currency,
        address: typeof property.location === 'string' ? property.location : property.location?.address,
        area_total: property.area,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        property_type_id: typeData?.id || null,
        is_featured: property.featured || false,
        is_published: true,
        status: 'available'
      })
      .select()
      .maybeSingle();

    if (error) {
      console.error('❌ [HOOK] addProperty database error:', error);
      throw error;
    }

    console.log('✅ [HOOK] addProperty database success:', data);

    if (data && property.image) {
      await supabase.from('property_images').insert({
        property_id: data.id,
        image_url: property.image,
        is_primary: true,
        display_order: 0
      });
    }



    return data;
  };

  const updateProperty = async (property: Property) => {
    console.log('🔄 [HOOK] updateProperty called with:', property);
    const { error } = await supabase
      .from('properties')
      .update({
        title: property.title,
        description: property.description,
        price: property.price,
        currency: property.currency,
        address: typeof property.location === 'string' ? property.location : property.location?.address,
        area_total: property.area,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        is_featured: property.featured || false,
        updated_at: new Date().toISOString()
      })
      .eq('id', property.id);

    if (error) {
      console.error('❌ [HOOK] updateProperty database error:', error);
      throw error;
    }
    
    console.log('✅ [HOOK] updateProperty database success');
  };

  const deleteProperty = async (id: string) => {
    console.log('🗑️ [HOOK] deleteProperty called with id:', id);
    const { error } = await supabase.from('properties').delete().eq('id', id);
    if (error) {
      console.error('❌ [HOOK] deleteProperty database error:', error);
      throw error;
    }
    console.log('✅ [HOOK] deleteProperty database success');
  };

  return { 
    properties, 
    loading, 
    error, 
    addProperty, 
    updateProperty, 
    deleteProperty, 
    refetch: fetchProperties,
    isConnected: !!channel 
  };
}
