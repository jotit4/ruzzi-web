import { useState, useEffect, useCallback } from 'react';
import { supabase, DbProperty, DbLead, DbPropertyImage, DbDevelopment, DbPropertyType, DbLeadSource } from '../lib/supabase';
import { Property, Lead } from '../types';
import { User, Session } from '@supabase/supabase-js';

// Convert DB property to frontend Property type
function mapDbToProperty(
  dbProp: DbProperty,
  images: DbPropertyImage[],
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
    description: dbProp.description,
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
    // Extended properties
    location: {
      city: dbProp.address,
      address: dbProp.address,
      coordinates: dbProp.latitude && dbProp.longitude ? {
        lat: dbProp.latitude,
        lng: dbProp.longitude
      } : undefined
    },
    type: typeMap[propertyType?.name || 'casa'] || 'house',
    area: dbProp.area_total || dbProp.area_built,
    image: primaryImage?.image_url || '',
    gallery: images.map(img => img.image_url),
    date: dbProp.created_at.split('T')[0],
    featured: dbProp.is_featured
  };
}

// Convert DB lead to frontend Lead type
function mapDbToLead(dbLead: DbLead): Lead {
  const statusMap: Record<string, Lead['status']> = {
    new: 'pending',
    contacted: 'confirmed',
    interested: 'confirmed',
    appointment: 'confirmed',
    negotiating: 'confirmed',
    closed: 'completed',
    discarded: 'cancelled'
  };

  return {
    id: dbLead.id,
    client_name: `${dbLead.first_name} ${dbLead.last_name}`,
    client_email: dbLead.email || '',
    client_phone: dbLead.phone || '',
    property_id: dbLead.interested_property_id || '',
    booking_date: dbLead.created_at,
    status: statusMap[dbLead.status] || 'pending',
    notes: dbLead.notes,
    created_by: dbLead.created_by,
    updated_by: null,
    // Legacy properties for compatibility
    name: `${dbLead.first_name} ${dbLead.last_name}`,
    email: dbLead.email || '',
    phone: dbLead.phone || '',
    type: dbLead.property_type_preference || 'Consulta General',
    message: dbLead.notes || '',
    date: dbLead.created_at.split('T')[0],
    assignedTo: dbLead.assigned_to || undefined
  };
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return { user, session, loading, signIn, signUp, signOut, isAuthenticated: !!user };
}

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
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

      const [imagesRes, typesRes] = await Promise.all([
        supabase.from('property_images').select('*').in('property_id', propIds),
        supabase.from('property_types').select('*')
      ]);

      const images = imagesRes.data || [];
      const types = typesRes.data || [];

      const mapped = props.map(p => {
        const propImages = images.filter(img => img.property_id === p.id);
        const propType = types.find(t => t.id === p.property_type_id);
        return mapDbToProperty(p, propImages, propType);
      });

      setProperties(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching properties');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const addProperty = async (property: Omit<Property, 'id'>) => {
    const { data: typeData } = await supabase
      .from('property_types')
      .select('id')
      .eq('name', property.type === 'house' ? 'casa' : property.type === 'apartment' ? 'departamento' : property.type === 'land' ? 'lote' : 'casa')
      .maybeSingle();

    const { data, error } = await supabase
      .from('properties')
      .insert({
        title: property.title,
        description: property.description,
        price: property.price,
        currency: property.currency,
        property_type_id: typeData?.id || null,
        development_id: property.development_id,
        address: property.address,
        latitude: property.latitude,
        longitude: property.longitude,
        area_total: property.area_total,
        area_built: property.area_built,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        parking_spaces: property.parking_spaces,
        status: property.status || 'available',
        availability_date: property.availability_date,
        commission_rate: property.commission_rate,
        is_featured: property.is_featured || false,
        is_published: property.is_published !== false,
        created_by: property.created_by,
        updated_by: property.updated_by
      })
      .select()
      .maybeSingle();

    if (error) throw error;

    if (data && property.image) {
      await supabase.from('property_images').insert({
        property_id: data.id,
        image_url: property.image,
        is_primary: true,
        display_order: 0
      });
    }

    await fetchProperties();
    return data;
  };

  const updateProperty = async (property: Property) => {
    const { error } = await supabase
      .from('properties')
      .update({
        title: property.title,
        description: property.description,
        price: property.price,
        currency: property.currency,
        property_type_id: property.property_type_id,
        development_id: property.development_id,
        address: property.address,
        latitude: property.latitude,
        longitude: property.longitude,
        area_total: property.area_total,
        area_built: property.area_built,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        parking_spaces: property.parking_spaces,
        status: property.status,
        availability_date: property.availability_date,
        commission_rate: property.commission_rate,
        is_featured: property.is_featured,
        is_published: property.is_published,
        updated_by: property.updated_by,
        updated_at: new Date().toISOString()
      })
      .eq('id', property.id);

    if (error) throw error;
    await fetchProperties();
  };

  const deleteProperty = async (id: string) => {
    const { error } = await supabase.from('properties').delete().eq('id', id);
    if (error) throw error;
    await fetchProperties();
  };

  return { properties, loading, error, addProperty, updateProperty, deleteProperty, refetch: fetchProperties };
}

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (leadsError) throw leadsError;
      setLeads((data || []).map(mapDbToLead));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching leads');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const addLead = async (lead: Omit<Lead, 'id' | 'date' | 'status'>) => {
    const nameParts = lead.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const { data: sourceData } = await supabase
      .from('lead_sources')
      .select('id')
      .eq('name', 'website')
      .maybeSingle();

    const { error } = await supabase.from('leads').insert({
      first_name: firstName,
      last_name: lastName,
      email: lead.email,
      phone: lead.phone,
      notes: lead.message,
      property_type_preference: lead.type,
      lead_source_id: sourceData?.id || null,
      status: 'new',
      priority: 'medium'
    });

    if (error) throw error;
    await fetchLeads();
  };

  const updateLeadStatus = async (id: string, status: Lead['status']) => {
    const statusMap: Record<Lead['status'], DbLead['status']> = {
      pending: 'new',
      confirmed: 'contacted',
      completed: 'closed',
      cancelled: 'discarded'
    };

    const { error } = await supabase
      .from('leads')
      .update({ status: statusMap[status] })
      .eq('id', id);

    if (error) throw error;
    await fetchLeads();
  };

  return { leads, loading, error, addLead, updateLeadStatus, refetch: fetchLeads };
}

export function useDevelopments() {
  const [developments, setDevelopments] = useState<DbDevelopment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('developments')
      .select('*')
      .eq('is_active', true)
      .order('name')
      .then(({ data }) => {
        setDevelopments(data || []);
        setLoading(false);
      });
  }, []);

  return { developments, loading };
}

export function usePropertyTypes() {
  const [propertyTypes, setPropertyTypes] = useState<DbPropertyType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('property_types')
      .select('*')
      .order('display_name')
      .then(({ data }) => {
        setPropertyTypes(data || []);
        setLoading(false);
      });
  }, []);

  return { propertyTypes, loading };
}

export function useLeadSources() {
  const [leadSources, setLeadSources] = useState<DbLeadSource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('lead_sources')
      .select('*')
      .eq('is_active', true)
      .order('display_name')
      .then(({ data }) => {
        setLeadSources(data || []);
        setLoading(false);
      });
  }, []);

  return { leadSources, loading };
}

export function useAdminStats() {
  const [stats, setStats] = useState({ totalLeads: 0, activeProperties: 0, totalViews: 0, conversionRate: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('leads').select('id', { count: 'exact', head: true }),
      supabase.from('properties').select('id', { count: 'exact', head: true }).eq('is_published', true),
      supabase.from('leads').select('id', { count: 'exact', head: true }).eq('status', 'completed')
    ]).then(([leadsRes, propsRes, closedRes]) => {
      const totalLeads = leadsRes.count || 0;
      const activeProperties = propsRes.count || 0;
      const closedLeads = closedRes.count || 0;
      const conversionRate = totalLeads > 0 ? (closedLeads / totalLeads) * 100 : 0;

      setStats({
        totalLeads,
        activeProperties,
        totalViews: 12400 + totalLeads * 5,
        conversionRate: parseFloat(conversionRate.toFixed(1))
      });
      setLoading(false);
    });
  }, []);

  return { stats, loading };
}
