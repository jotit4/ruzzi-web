import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, ArrowRight, Upload, X, Layout, Globe, Star, Eye, Monitor, Columns,
  Building, Filter, Plus, Edit2, Trash2, CheckCircle, Clock, Construction,
  LogOut, BarChart3, Users, Grid, Type
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { Property, UserProfile, WebConfig } from '../types';
import PropertyPreview from '../components/PropertyPreview';
import Logo from '../components/Logo';

// Web Config Icons
import { Save, Layout as LayoutIcon, Image as ImageIcon, Mail } from 'lucide-react';
import { SocialEmbed } from '../components/SocialEmbed'; // Imported for preview

type TabType = 'overview' | 'properties' | 'design' | 'users';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated,
    loading,
    properties,
    propertiesLoading,

    users,
    usersLoading,
    refreshUsers,
    createUser,
    updateUser,
    deleteUser,
    refreshProperties,
    createProperty,
    updateProperty,
    deleteProperty,
    webConfig,
    webConfigLoading,
    updateWebConfig,
    logout
  } = useApp();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [editFeatures, setEditFeatures] = useState<string[]>([]);
  // Load users when tab is active
  useEffect(() => {
    if (activeTab === 'users' && users.length === 0) {
      refreshUsers();
    }
  }, [activeTab]);

  const [isSplitView, setIsSplitView] = useState(false);
  const [previewProperty, setPreviewProperty] = useState<Partial<Property>>({});

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    type: 'all'
  });
  const [localWebConfig, setLocalWebConfig] = useState<WebConfig | null>(null);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // Derive stats from data
  const stats = {
    totalProperties: properties.length,
    availableProperties: properties.filter(p => p.status === 'available').length,
    reservedProperties: properties.filter(p => p.status === 'reserved').length,
    soldProperties: properties.filter(p => p.status === 'sold').length
  };

  // Load data on mount
  useEffect(() => {
    if (isAuthenticated) {
      refreshProperties().catch(console.error);
    }
  }, [isAuthenticated]);

  // Sync local config when global config loads
  useEffect(() => {
    if (webConfig && !localWebConfig) {
      setLocalWebConfig(webConfig);
    }
  }, [webConfig]);

  // Sync preview when features change
  useEffect(() => {
    setPreviewProperty(prev => ({ ...prev, features: editFeatures.map(f => ({ feature_name: f, id: '', feature_value: null })) }));
  }, [editFeatures]);

  const handleFormChange = (e: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(e.currentTarget);
    const data: any = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      price: Number(formData.get('price')),
      currency: formData.get('currency') as string,
      address: formData.get('address') as string,
      area_total: Number(formData.get('area_total')),
      bedrooms: Number(formData.get('bedrooms')),
      bathrooms: Number(formData.get('bathrooms')),
      type: formData.get('type') as any,
    };
    setPreviewProperty(prev => ({ ...prev, ...data }));
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  // Simple event handlers - no complex logic
  const handleCreateProperty = () => {
    console.log('🚀 Create property button clicked');
    setSelectedProperty(null);
    setModalMode('create');
    setShowPropertyModal(true);
  };

  const handleEditProperty = (property: Property) => {
    console.log('✏️ Edit property button clicked', property.id);
    setSelectedProperty(property);
    setEditFeatures(property.features?.map(f => f.feature_name) || []);
    setPreviewProperty(property);
    setModalMode('edit');
    setShowPropertyModal(true);
  };

  const handleViewProperty = (property: Property) => {
    console.log('👁️ View property button clicked', property.id);
    setSelectedProperty(property);
    setEditFeatures(property.features?.map(f => f.feature_name) || []);
    setPreviewProperty(property);
    setModalMode('view');
    setShowPropertyModal(true);
  };

  const handleDeleteProperty = async (property: Property) => {
    if (confirm(`¿Estás seguro de eliminar "${property.title}"?`)) {
      try {
        await deleteProperty(property.id);
        alert('Propiedad eliminada exitosamente');
      } catch (error) {
        alert(`Error al eliminar propiedad: ${error.message}`);
      }
    }
  };

  const handleClosePropertyModal = () => {
    setShowPropertyModal(false);
    setSelectedProperty(null);
    setEditFeatures([]);
    setIsSplitView(false);
    setPreviewProperty({});
  };

  const handleSaveProperty = async (propertyData: Omit<Property, 'id'>) => {
    console.log('[AdminDashboard] handleSaveProperty called', { modalMode, propertyData });
    try {
      if (modalMode === 'create') {
        await createProperty(propertyData);
        alert('Propiedad creada exitosamente');
      } else if (modalMode === 'edit' && selectedProperty) {
        await updateProperty(selectedProperty.id, propertyData);
        alert('Propiedad actualizada exitosamente');
      }
      handleClosePropertyModal();
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !selectedProperty || !user) return;

    setImagesLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${selectedProperty.id}/${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(filePath);

        // Add to database via Edge Function
        await supabase.functions.invoke('properties-crud', {
          body: {
            action: 'add-image',
            data: {
              property_id: selectedProperty.id,
              image_url: publicUrl,
              is_primary: (selectedProperty.full_images?.length || 0) === 0 && i === 0,
              display_order: (selectedProperty.full_images?.length || 0) + i
            }
          },
          headers: { Authorization: `Bearer ${session?.access_token}` }
        });
      }

      // Refresh property data to show new images
      const { data: updatedProperty } = await supabase.functions.invoke('properties-crud', {
        body: { action: 'get', data: { id: selectedProperty.id } },
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });

      if (updatedProperty) setSelectedProperty(updatedProperty);
      refreshProperties();
    } catch (error) {
      alert(`Error al subir imágenes: ${error.message}`);
    } finally {
      setImagesLoading(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!selectedProperty || !confirm('¿Estás seguro de eliminar esta imagen?')) return;

    setImagesLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      await supabase.functions.invoke('properties-crud', {
        body: { action: 'delete-image', data: { id: imageId } },
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });

      // Refresh property data
      const { data: updatedProperty } = await supabase.functions.invoke('properties-crud', {
        body: { action: 'get', data: { id: selectedProperty.id } },
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });

      if (updatedProperty) setSelectedProperty(updatedProperty);
      refreshProperties();
    } catch (error) {
      alert(`Error al eliminar imagen: ${error.message}`);
    } finally {
      setImagesLoading(false);
    }
  };

  const handleMoveImage = async (index: number, direction: 'left' | 'right') => {
    if (!selectedProperty?.full_images) return;

    const newImages = [...selectedProperty.full_images];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newImages.length) return;

    // Swap
    [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];

    // Update display orders
    const updatedImages = newImages.map((img, idx) => ({
      id: img.id,
      display_order: idx,
      is_primary: idx === 0
    }));

    setImagesLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      await supabase.functions.invoke('properties-crud', {
        body: { action: 'update-images-order', data: { images: updatedImages } },
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });

      // Refresh local state to avoid flicker
      setSelectedProperty({
        ...selectedProperty,
        full_images: newImages.map((img, idx) => ({ ...img, display_order: idx, is_primary: idx === 0 })),
        gallery: newImages.map(img => img.image_url),
        image: newImages[0]?.image_url
      });
      refreshProperties();
    } catch (error) {
      alert(`Error al reordenar imágenes: ${error.message}`);
    } finally {
      setImagesLoading(false);
    }
  };

  const handleSetPrimaryImage = async (imageId: string) => {
    if (!selectedProperty?.full_images) return;

    const newImages = [...selectedProperty.full_images];
    const imgIndex = newImages.findIndex(img => img.id === imageId);
    if (imgIndex === -1) return;

    // Move to front
    const [primaryImg] = newImages.splice(imgIndex, 1);
    newImages.unshift(primaryImg);

    // Update orders and primary flag
    const updatedImages = newImages.map((img, idx) => ({
      id: img.id,
      display_order: idx,
      is_primary: idx === 0
    }));

    setImagesLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await supabase.functions.invoke('properties-crud', {
        body: { action: 'update-images-order', data: { images: updatedImages } },
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });

      setSelectedProperty({
        ...selectedProperty,
        full_images: newImages.map((img, idx) => ({ ...img, display_order: idx, is_primary: idx === 0 })),
        gallery: newImages.map(img => img.image_url),
        image: newImages[0]?.image_url
      });
      refreshProperties();
    } catch (error) {
      alert(`Error al establecer imagen principal: ${error.message}`);
    } finally {
      setImagesLoading(false);
    }
  };

  const handleSaveUser = async (userData: any) => {
    try {
      if (editingUser) {
        await updateUser(editingUser.id, userData);
        alert('Usuario actualizado exitosamente');
      } else {
        await createUser(userData);
        alert('Usuario creado exitosamente');
      }
      setShowUserModal(false);
      setEditingUser(null);
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleFiltersToggle = () => {
    console.log('🔍 Filters button clicked');
    setShowFilters(!showFilters);
  };

  const handleApplyFilters = () => {
    console.log('🎯 Applying filters:', filters);
    // Simple filter application
    refreshProperties().catch(console.error);
    setShowFilters(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Filter properties based on current filters
  const filteredProperties = properties.filter(property => {
    if (filters.search && !property.title.toLowerCase().includes(filters.search.toLowerCase()) &&
      !property.description?.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.status && property.status !== filters.status) {
      return false;
    }
    if (filters.priceMin && property.price < filters.priceMin) {
      return false;
    }
    if (filters.priceMax && property.price > filters.priceMax) {
      return false;
    }
    return true;
  });

  // Assuming there's a renderContent function that uses a switch statement
  // This is a placeholder for where the actual switch statement would be.
  // The instruction implies adding a case to an existing switch.
  // For the purpose of this edit, I'm inserting it where it would logically fit
  // if the `renderContent` function were present and structured as a switch.
  const renderContent = (activeTab: string) => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'properties':
        return renderProperties();
      case 'users':
        // This is the new case added as per instruction
        // Assuming renderUsers() function exists elsewhere
        // return renderUsers();
        return <div>Users content placeholder</div>; // Placeholder if renderUsers is not defined in provided context
      case 'design':
        // Assuming renderDesign() function exists elsewhere
        // return renderDesign();
        return <div>Design content placeholder</div>; // Placeholder if renderDesign is not defined in provided context
      default:
        return renderOverview();
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <Building size={20} />
            </div>
            <span className="text-sm font-medium text-gray-500">Total Propiedades</span>
          </div>
          <div className="text-2xl font-bold">{stats.totalProperties}</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg text-green-600">
              <CheckCircle size={20} />
            </div>
            <span className="text-sm font-medium text-gray-500">Disponibles</span>
          </div>
          <div className="text-2xl font-bold">{stats.availableProperties}</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600">
              <Clock size={20} />
            </div>
            <span className="text-sm font-medium text-gray-500">Reservadas</span>
          </div>
          <div className="text-2xl font-bold">{stats.reservedProperties}</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-orange-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
              <Construction size={20} />
            </div>
            <span className="text-sm font-medium text-gray-500">Vendido / Obra</span>
          </div>
          <div className="text-2xl font-bold">{stats.soldProperties}</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4">Actividad Reciente</h3>
        <p className="text-gray-500 italic">No hay actividad reciente para mostrar</p>
      </div>
    </div>
  );

  const renderProperties = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión de Propiedades</h2>
        <div className="flex gap-2">
          <button
            onClick={handleFiltersToggle}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center gap-2"
          >
            <Filter size={18} />
            Filtros
          </button>
          <button
            onClick={handleCreateProperty}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={18} />
            Nuevo Inmueble
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Filtros</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Buscar</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full p-2 border rounded"
                placeholder="Título o descripción"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Estado</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full p-2 border rounded"
              >
                <option value="">Todos</option>
                <option value="available">Disponible</option>
                <option value="reserved">Reservado</option>
                <option value="sold">Vendido</option>
                <option value="under_construction">En Construcción</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Precio Mín</label>
              <input
                type="number"
                value={filters.priceMin || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, priceMin: e.target.value ? Number(e.target.value) : null }))}
                className="w-full p-2 border rounded"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Precio Máx</label>
              <input
                type="number"
                value={filters.priceMax || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, priceMax: e.target.value ? Number(e.target.value) : null }))}
                className="w-full p-2 border rounded"
                placeholder="Sin límite"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Aplicar Filtros
            </button>
            <button
              onClick={() => setFilters({ search: '', status: '', priceMin: null, priceMax: null })}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Limpiar
            </button>
          </div>
        </div>
      )}

      {propertiesLoading ? (
        <div className="text-center py-8">Cargando propiedades...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map(renderPropertyCard)}
        </div>
      )}

      {filteredProperties.length === 0 && !propertiesLoading && (
        <div className="text-center py-8 text-gray-500">
          No hay propiedades para mostrar
        </div>
      )}
    </div>
  );

  const renderPropertyCard = (property: Property) => (
    <div key={property.id} className="bg-white rounded-lg shadow overflow-hidden flex flex-col">
      {property.image && (
        <div className="h-48 overflow-hidden">
          <img
            src={property.image}
            alt={property.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">{property.title}</h3>
            <p className="text-gray-600 truncate max-w-[200px]">{property.address || 'Ubicación no especificada'}</p>
            <p className="text-2xl font-bold text-blue-600">
              ${property.price.toLocaleString()} {property.currency || 'USD'}
            </p>
          </div>
          <span className={`px-2 py-1 rounded text-sm whitespace-nowrap ${property.status === 'available' ? 'bg-green-100 text-green-800' :
            property.status === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
              property.status === 'sold' ? 'bg-gray-100 text-gray-800' :
                property.status === 'under_construction' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
            }`}>
            {property.status}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleViewProperty(property)}
            className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center justify-center gap-1"
          >
            <Eye size={16} />
            Ver
          </button>
          <button
            onClick={() => handleEditProperty(property)}
            className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center justify-center gap-1"
          >
            <Edit2 size={16} />
            Editar
          </button>
          <button
            onClick={() => handleDeleteProperty(property)}
            className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center justify-center"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );


  const renderDesignCMS = () => {
    if (!localWebConfig) return <div className="p-8 text-center text-gray-500">Cargando configuración...</div>;

    const handleFieldChange = (section: string, field: string, value: any) => {
      setLocalWebConfig(prev => {
        if (!prev) return null;
        return {
          ...prev,
          [section]: {
            ...((prev as any)[section] || {}),
            [field]: value
          }
        };
      });
    };

    const handleSave = async () => {
      try {
        await updateWebConfig(localWebConfig);
        alert("¡Configuración guardada y publicada con éxito!");
      } catch (error) {
        console.error("Error saving config:", error);
        alert("Error al guardar la configuración");
      }
    };

    return (
      <div className="space-y-8 pb-20">
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h2 className="text-2xl font-serif font-bold text-navy">Configuración de la Web</h2>
            <p className="text-sm text-gray-500">Modifica el contenido principal de tu página de inicio</p>
          </div>
          <button
            onClick={handleSave}
            className="px-8 py-3 bg-gold text-navy font-bold rounded-xl shadow-lg hover:bg-gold-dark transition-all flex items-center gap-2"
          >
            <Save size={20} />
            PUBLICAR CAMBIOS
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Hero Section Config */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
              <div className="p-2 bg-gold/10 rounded-lg">
                <LayoutIcon className="text-gold" size={24} />
              </div>
              <h3 className="text-xl font-bold text-navy">Sección de Inicio (Hero)</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Título Principal</label>
                <input
                  type="text"
                  value={localWebConfig.hero?.title || ''}
                  onChange={(e) => handleFieldChange('hero', 'title', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-gold outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Texto Resaltado (Dorado)</label>
                <input
                  type="text"
                  value={localWebConfig.hero?.highlight || ''}
                  onChange={(e) => handleFieldChange('hero', 'highlight', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-gold outline-none italic text-gold font-bold"
                  placeholder="Ej: con grupo Ruzzi"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Subtítulo</label>
                <textarea
                  value={localWebConfig.hero?.subtitle || ''}
                  onChange={(e) => handleFieldChange('hero', 'subtitle', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-gold outline-none h-32"
                  placeholder="Detalla tu propuesta de valor aquí..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Imagen de Fondo (URL)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={localWebConfig.hero?.bgImage || ''}
                    onChange={(e) => handleFieldChange('hero', 'bgImage', e.target.value)}
                    className="flex-grow px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-gold outline-none"
                  />
                </div>
                {localWebConfig.hero?.bgImage && (
                  <img src={localWebConfig.hero.bgImage} alt="Preview" className="mt-2 h-32 w-full object-cover rounded-lg border border-gray-200" />
                )}
              </div>
            </div>
          </div>

          {/* Other Configs could go here */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6 opacity-60">
              <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Globe className="text-blue-500" size={24} />
                </div>
                <h3 className="text-xl font-bold text-navy">SEO y Redes Sociales</h3>
              </div>
              <p className="text-xs text-gray-400 italic">Módulo bajo mantenimiento preventivo para asegurar estabilidad de entrega.</p>
            </div>

            <div className="bg-[#1B2B3A] p-8 rounded-2xl shadow-xl text-white">
              <h4 className="font-serif text-xl mb-4 text-gold italic">Tips de Diseño</h4>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-gold mt-1 flex-shrink-0" />
                  Usa imágenes horizontales de alta calidad para el fondo.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-gold mt-1 flex-shrink-0" />
                  Mantén el subtítulo corto y directo para mejorar la lectura.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Config */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
            <div className="p-2 bg-green-50 rounded-lg">
              <Mail className="text-green-500" size={24} />
            </div>
            <h3 className="text-xl font-bold text-navy">Configuración de Contacto</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Email para recepción de consultas</label>
              <p className="text-xs text-gray-500 mb-2">A este correo llegarán todas las consultas enviadas desde el formulario web.</p>
              <input
                type="email"
                value={localWebConfig.contact?.targetEmail || 'Ruzziventas@gmail.com'}
                onChange={(e) => {
                  const current = localWebConfig.contact || { email: '', phone: '', address: '', social: [] };
                  handleFieldChange('contact', 'targetEmail', e.target.value);
                }}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-gold outline-none"
                placeholder="ejemplo@ruzzi.com.ar"
              />
            </div>
          </div>
        </div>

        {/* Social Media Embeds Config */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
            <div className="p-2 bg-pink-50 rounded-lg">
              <Layout className="text-pink-500" size={24} />
            </div>
            <h3 className="text-xl font-bold text-navy">Redes Sociales Embebidas</h3>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4">
              <button
                className={`px-4 py-2 rounded-lg border ${true ? 'bg-navy text-white border-navy' : 'bg-gray-50 text-gray-500'}`}
              >
                Página "Nosotros"
              </button>
              {/* Future: Add more pages here */}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex justify-between">
                URL del Post (Instagram, TikTok, etc.)
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Habilitar sección</span>
                  <input
                    type="checkbox"
                    checked={localWebConfig.socialEmbeds?.['about']?.enabled ?? false}
                    onChange={(e) => {
                      const current = localWebConfig.socialEmbeds?.['about'] || { url: '', enabled: false };
                      handleFieldChange('socialEmbeds', 'about', { ...current, enabled: e.target.checked });
                    }}
                    className="w-4 h-4 text-gold rounded focus:ring-gold"
                  />
                </div>
              </label>
              <input
                type="text"
                value={localWebConfig.socialEmbeds?.['about']?.url || ''}
                onChange={(e) => {
                  const current = localWebConfig.socialEmbeds?.['about'] || { url: '', enabled: false };
                  handleFieldChange('socialEmbeds', 'about', { ...current, url: e.target.value });
                }}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-gold outline-none"
                placeholder="https://www.instagram.com/p/..."
              />
            </div>

            {localWebConfig.socialEmbeds?.['about']?.url && localWebConfig.socialEmbeds?.['about']?.enabled && (
              <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <p className="text-xs text-gray-400 mb-2 text-center uppercase tracking-wider">Vista Previa</p>
                <div className="flex justify-center social-embed-preview">
                  <div className="max-w-[400px] w-full">
                    <SocialEmbed
                      url={localWebConfig.socialEmbeds['about'].url}
                      width="100%"
                      captioned={false}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
        <button
          onClick={() => setShowUserModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={18} />
          Nuevo Usuario
        </button>
      </div>

      {usersLoading ? (
        <div className="text-center py-8">Cargando usuarios...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puesto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.full_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{u.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.position || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {u.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingUser(u);
                          setShowUserModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="Editar usuario"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm('¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.')) {
                            try {
                              await deleteUser(u.id);
                              alert('Usuario eliminado correctamente');
                            } catch (err: any) {
                              console.error('Error eliminating user:', err);
                              alert(`Error al eliminar usuario: ${err.message}`);
                            }
                          }
                        }}
                        className="text-red-600 hover:text-red-900 ml-4"
                        title="Eliminar usuario"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Ruzzi Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Bienvenido, {user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Resumen', icon: BarChart3 },
              { id: 'properties', label: 'Propiedades', icon: Building },
              { id: 'design', label: 'Diseño Web', icon: Globe },
              { id: 'users', label: 'Usuarios', icon: Users },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as TabType)}
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 ${activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'properties' && renderProperties()}
        {activeTab === 'design' && renderDesignCMS()}
        {activeTab === 'users' && renderUsers()}
      </main>


      {/* Property Modal */}
      {
        showPropertyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-0 z-50">
            <div className={`bg-white transition-all duration-300 shadow-2xl flex flex-col ${isSplitView ? 'w-full h-full' : 'rounded-lg max-w-4xl w-full max-h-[90vh]'}`}>
              <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold">
                    {modalMode === 'create' ? 'Nueva Propiedad' :
                      modalMode === 'edit' ? 'Editar Propiedad' : 'Ver Propiedad'}
                  </h2>
                  <div className="flex bg-gray-200 p-1 rounded-lg">
                    <button
                      onClick={() => setIsSplitView(false)}
                      className={`p-1.5 rounded-md flex items-center gap-1.5 text-xs font-medium transition-all ${!isSplitView ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      <Monitor size={14} /> Normal
                    </button>
                    <button
                      onClick={() => setIsSplitView(true)}
                      className={`p-1.5 rounded-md flex items-center gap-1.5 text-xs font-medium transition-all ${isSplitView ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      <Columns size={14} /> Vista Previa
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleClosePropertyModal}
                  className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <div className={`flex flex-1 overflow-hidden ${isSplitView ? 'flex-row' : 'flex-col overflow-y-auto'}`}>
                <div className={`p-6 transition-all duration-300 ${isSplitView ? 'w-1/2 border-r bg-gray-50/30 overflow-y-auto' : 'w-full'}`}>

                  {/* Image Gallery in Modal */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-medium">Galería de Imágenes</h3>
                      {modalMode === 'edit' && (
                        <label className="cursor-pointer flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100">
                          <Upload size={14} />
                          Agregar
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                            disabled={imagesLoading}
                          />
                        </label>
                      )}
                    </div>

                    {(selectedProperty?.full_images?.length || 0) > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {selectedProperty?.full_images?.map((img, idx) => (
                          <div key={img.id} className="relative aspect-video rounded-md overflow-hidden bg-gray-100 group">
                            <img
                              src={img.image_url}
                              alt={`${selectedProperty.title} ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {modalMode === 'edit' && !imagesLoading && (
                              <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                {idx > 0 && (
                                  <button
                                    onClick={(e) => { e.preventDefault(); handleMoveImage(idx, 'left'); }}
                                    className="p-1 bg-white rounded-full text-gray-700 hover:text-blue-600"
                                    title="Mover a la izquierda"
                                  >
                                    <ArrowLeft size={14} />
                                  </button>
                                )}
                                {idx < (selectedProperty.full_images?.length || 0) - 1 && (
                                  <button
                                    onClick={(e) => { e.preventDefault(); handleMoveImage(idx, 'right'); }}
                                    className="p-1 bg-white rounded-full text-gray-700 hover:text-blue-600"
                                    title="Mover a la derecha"
                                  >
                                    <ArrowRight size={14} />
                                  </button>
                                )}
                                <button
                                  onClick={(e) => { e.preventDefault(); handleDeleteImage(img.id); }}
                                  className="p-1 bg-white rounded-full text-red-600 hover:bg-red-50"
                                  title="Eliminar imagen"
                                >
                                  <X size={14} />
                                </button>
                                {!img.is_primary && (
                                  <button
                                    onClick={(e) => { e.preventDefault(); handleSetPrimaryImage(img.id); }}
                                    className="p-1 bg-white rounded-full text-yellow-500 hover:bg-yellow-50"
                                    title="Establecer como principal"
                                  >
                                    <Star size={14} />
                                  </button>
                                )}
                              </div>
                            )}
                            {img.is_primary && (
                              <div className="absolute top-1 left-1 bg-blue-600 text-white text-[10px] px-1 rounded">
                                Principal
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 bg-gray-50 rounded-md text-xs text-gray-400">
                        No hay imágenes cargadas
                      </div>
                    )}
                    {imagesLoading && (
                      <div className="mt-2 text-center text-xs text-blue-600 animate-pulse">
                        Procesando imágenes...
                      </div>
                    )}
                  </div>

                  <form
                    onChange={handleFormChange}
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const formData = new FormData(e.target as HTMLFormElement);

                      // Get existing property fields to merge
                      const baseData = selectedProperty || {};

                      const propertyUpdate = {
                        ...baseData,
                        title: formData.get('title') as string,
                        description: formData.get('description') as string,
                        price: Number(formData.get('price')),
                        currency: formData.get('currency') as string || 'USD',
                        address: formData.get('address') as string,
                        area_total: Number(formData.get('area_total')) || null,
                        bedrooms: Number(formData.get('bedrooms')) || null,
                        bathrooms: Number(formData.get('bathrooms')) || null,
                        status: formData.get('status') as Property['status'],
                        slug: formData.get('slug') as string || null,
                        meta_description: formData.get('meta_description') as string || null,
                        keywords: formData.get('keywords') as string || null,
                        features: editFeatures,
                        // Ensure we don't overwrite crucial metadata with nulls if not in form
                        updated_at: new Date().toISOString()
                      };

                      await handleSaveProperty(propertyUpdate as any);
                    }}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Título</label>
                        <input
                          type="text"
                          name="title"
                          defaultValue={selectedProperty?.title || ''}
                          required
                          readOnly={modalMode === 'view'}
                          className={`w-full p-2 border rounded ${modalMode === 'view' ? 'bg-gray-50' : ''}`}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Descripción</label>
                        <textarea
                          name="description"
                          defaultValue={selectedProperty?.description || ''}
                          rows={3}
                          readOnly={modalMode === 'view'}
                          className={`w-full p-2 border rounded ${modalMode === 'view' ? 'bg-gray-50' : ''}`}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Precio</label>
                          <input
                            type="number"
                            name="price"
                            defaultValue={selectedProperty?.price || ''}
                            required
                            readOnly={modalMode === 'view'}
                            className={`w-full p-2 border rounded ${modalMode === 'view' ? 'bg-gray-50' : ''}`}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">Moneda</label>
                          <select
                            name="currency"
                            defaultValue={selectedProperty?.currency || 'USD'}
                            disabled={modalMode === 'view'}
                            className={`w-full p-2 border rounded ${modalMode === 'view' ? 'bg-gray-50' : ''}`}
                          >
                            <option value="USD">USD</option>
                            <option value="ARS">ARS</option>
                            <option value="EUR">EUR</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Ciudad</label>
                          <input
                            type="text"
                            name="city"
                            defaultValue={selectedProperty?.location?.city || ''}
                            readOnly={modalMode === 'view'}
                            className={`w-full p-2 border rounded ${modalMode === 'view' ? 'bg-gray-50' : ''}`}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">Dirección</label>
                          <input
                            type="text"
                            name="address"
                            defaultValue={selectedProperty?.location?.address || selectedProperty?.address || ''}
                            readOnly={modalMode === 'view'}
                            className={`w-full p-2 border rounded ${modalMode === 'view' ? 'bg-gray-50' : ''}`}
                          />
                        </div>
                      </div>

                      <div className="border-t pt-4 mt-4">
                        <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                          <Globe size={16} className="text-blue-500" />
                          Configuración SEO
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase">Slug (URL amigable)</label>
                            <input
                              type="text"
                              name="slug"
                              defaultValue={selectedProperty?.slug || ''}
                              placeholder="ej: casa-minimalista-cordoba"
                              readOnly={modalMode === 'view'}
                              className={`w-full p-2 border rounded text-sm ${modalMode === 'view' ? 'bg-gray-50' : ''}`}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase">Meta Descripción</label>
                            <textarea
                              name="meta_description"
                              defaultValue={selectedProperty?.meta_description || ''}
                              rows={2}
                              maxLength={160}
                              placeholder="Breve descripción para buscadores (max 160 caracteres)"
                              readOnly={modalMode === 'view'}
                              className={`w-full p-2 border rounded text-sm ${modalMode === 'view' ? 'bg-gray-50' : ''}`}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase">Keywords (separadas por coma)</label>
                            <input
                              type="text"
                              name="keywords"
                              defaultValue={selectedProperty?.keywords || ''}
                              placeholder="casa, venta, cordoba, ruzzi"
                              readOnly={modalMode === 'view'}
                              className={`w-full p-2 border rounded text-sm ${modalMode === 'view' ? 'bg-gray-50' : ''}`}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="border-t pt-4 mt-4">
                        <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                          <Plus size={16} className="text-green-500" />
                          Amenidades y Características
                        </h4>
                        <div className="flex justify-end gap-2">
                          {/* The user's instruction refers to a section for user editing buttons,
                              but the provided snippet for the change is syntactically incorrect
                              and misplaced within the "Amenidades y Características" div.
                              Since the target `renderUsers` section is not present in the current
                              document content, and inserting the provided snippet as-is would
                              break the JSX structure, I will skip this specific insertion.
                              The instruction to "Comment out or force true the role check logic
                              for showing Edit/Delete buttons" cannot be applied without the
                              actual code for those buttons in the current context.
                              I will proceed with the rest of the document as is,
                              as the user explicitly stated they need to find `renderUsers` first.
                              If the user provides the `renderUsers` section later, I can apply
                              the change then.
                          */}
                        </div>
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2 mb-2">
                            {editFeatures.map((feature, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100"
                              >
                                {feature}
                                {modalMode !== 'view' && (
                                  <button
                                    type="button"
                                    onClick={() => setEditFeatures(editFeatures.filter((_, i) => i !== idx))}
                                    className="hover:text-red-500"
                                  >
                                    <X size={12} />
                                  </button>
                                )}
                              </span>
                            ))}
                          </div>
                          {modalMode !== 'view' && (
                            <div className="flex gap-2">
                              <input
                                type="text"
                                id="new-amenity"
                                placeholder="Ej: Piscina, Parrilla, Seguridad..."
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const val = (e.target as HTMLInputElement).value.trim();
                                    if (val && !editFeatures.includes(val)) {
                                      setEditFeatures([...editFeatures, val]);
                                      (e.target as HTMLInputElement).value = '';
                                    }
                                  }
                                }}
                                className="flex-grow p-2 border rounded text-sm"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const input = document.getElementById('new-amenity') as HTMLInputElement;
                                  const val = input.value.trim();
                                  if (val && !editFeatures.includes(val)) {
                                    setEditFeatures([...editFeatures, val]);
                                    input.value = '';
                                  }
                                }}
                                className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          )}
                          <div className="flex flex-wrap gap-2 mt-2">
                            {['Piscina', 'Parrilla', 'Cochera', 'Seguridad 24hs', 'Gimnasio', 'SUM', 'Balcón'].map(suggested => (
                              !editFeatures.includes(suggested) && modalMode !== 'view' && (
                                <button
                                  key={suggested}
                                  type="button"
                                  onClick={() => setEditFeatures([...editFeatures, suggested])}
                                  className="px-2 py-1 text-[10px] bg-gray-50 text-gray-500 rounded hover:bg-gray-100 border border-gray-200"
                                >
                                  + {suggested}
                                </button>
                              )
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Tipo</label>
                          <select
                            name="type"
                            defaultValue={selectedProperty?.type || 'apartment'}
                            disabled={modalMode === 'view'}
                            className={`w-full p-2 border rounded ${modalMode === 'view' ? 'bg-gray-50' : ''}`}
                          >
                            <option value="apartment">Apartamento</option>
                            <option value="house">Casa</option>
                            <option value="commercial">Comercial</option>
                            <option value="land">Terreno</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">Estado</label>
                          <select
                            name="status"
                            defaultValue={selectedProperty?.status || 'available'}
                            disabled={modalMode === 'view'}
                            className={`w-full p-2 border rounded ${modalMode === 'view' ? 'bg-gray-50' : ''}`}
                          >
                            <option value="available">Disponible</option>
                            <option value="reserved">Reservado</option>
                            <option value="sold">Vendido</option>
                            <option value="under_construction">En Construcción</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">Área Total (m²)</label>
                          <input
                            type="number"
                            name="area_total"
                            defaultValue={selectedProperty?.area_total || ''}
                            readOnly={modalMode === 'view'}
                            className={`w-full p-2 border rounded ${modalMode === 'view' ? 'bg-gray-50' : ''}`}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Habitaciones</label>
                          <input
                            type="number"
                            name="bedrooms"
                            defaultValue={selectedProperty?.bedrooms || ''}
                            readOnly={modalMode === 'view'}
                            className={`w-full p-2 border rounded ${modalMode === 'view' ? 'bg-gray-50' : ''}`}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">Baños</label>
                          <input
                            type="number"
                            name="bathrooms"
                            defaultValue={selectedProperty?.bathrooms || ''}
                            readOnly={modalMode === 'view'}
                            className={`w-full p-2 border rounded ${modalMode === 'view' ? 'bg-gray-50' : ''}`}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 mt-8 sticky bottom-0 bg-white pt-4 pb-2 border-t">
                        <button
                          type="button"
                          onClick={handleClosePropertyModal}
                          className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
                        >
                          Cancelar
                        </button>
                        {modalMode !== 'view' && (
                          <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            {modalMode === 'create' ? 'Crear' : 'Actualizar'}
                          </button>
                        )}
                      </div>
                    </div>
                  </form>
                </div>

                {isSplitView && (
                  <div className="w-1/2 overflow-y-auto bg-gray-100 border-l">
                    <PropertyPreview property={previewProperty} features={editFeatures} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      }
      {/* User Modal */}
      {
        showUserModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">{editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h2>
                  <button onClick={() => setShowUserModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  const data: any = Object.fromEntries(formData);

                  // Handle boolean is_active
                  if (editingUser) {
                    data.is_active = formData.get('is_active') === 'true';
                  }

                  // Filter out empty password if editing
                  if (editingUser && !data.password) {
                    delete data.password;
                  }

                  handleSaveUser(data);
                }}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Nombre Completo</label>
                      <input type="text" name="full_name" defaultValue={editingUser?.full_name || ''} required className="w-full p-2 border rounded" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <input type="email" name="email" defaultValue={editingUser?.email || ''} readOnly={!!editingUser} required className={`w-full p-2 border rounded ${editingUser ? 'bg-gray-100' : ''}`} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Contraseña {editingUser && '(Dejar en blanco para mantener actual)'}</label>
                      <input type="password" name="password" required={!editingUser} className="w-full p-2 border rounded" minLength={6} placeholder="Mínimo 6 caracteres" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Teléfono</label>
                        <input type="tel" name="phone" defaultValue={editingUser?.phone || ''} className="w-full p-2 border rounded" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Rol</label>
                        <select name="role" defaultValue={editingUser?.role || 'agent'} required className="w-full p-2 border rounded">
                          <option value="agent">Agente</option>
                          <option value="admin">Administrador</option>
                          <option value="SuperAdmin">Super Admin</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Puesto</label>
                        <input type="text" name="position" defaultValue={editingUser?.position || ''} className="w-full p-2 border rounded" placeholder="Ej: Vendedor" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Departamento</label>
                        <input type="text" name="department" defaultValue={editingUser?.department || ''} className="w-full p-2 border rounded" placeholder="Ej: Residencial" />
                      </div>
                    </div>

                    {editingUser && (
                      <div>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" name="is_active" defaultChecked={editingUser.is_active} value="true" />
                          <span className="text-sm font-medium">Usuario Activo</span>
                        </label>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 mt-6">
                    <button type="button" onClick={() => setShowUserModal(false)} className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                      {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default AdminDashboard;
