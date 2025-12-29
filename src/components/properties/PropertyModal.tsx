import React, { useState, useEffect } from 'react';
import {
  X, Save, Upload, MapPin, DollarSign, Home,
  Bed, Bath, Square, Building, Star,
  Calendar, Tag, AlertCircle, CheckCircle,
  Image as ImageIcon, Trash2, Move, Plus,
  FileText, Eye, Settings, RefreshCw
} from 'lucide-react';
import Button from '../Button';
import { Property, PropertyFormData } from '../../types';
import { usePropertyTypes, useDevelopments } from '../../hooks/useSupabase';
import { supabase } from '../../lib/supabase';

interface PropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  property?: Property | null;
  mode: 'create' | 'edit' | 'view';
  onSave: (property: PropertyFormData, images: File[]) => Promise<void>;
  onUpdate?: (property: Property, propertyData: PropertyFormData) => Promise<void>;
  onDelete?: (propertyId: string) => Promise<void>;
  onStatusChange?: (propertyId: string, status: Property['status']) => Promise<void>;
}

interface UploadProgress {
  [key: string]: number;
}

const PropertyModal: React.FC<PropertyModalProps> = ({
  isOpen,
  onClose,
  property,
  mode,
  onSave,
  onUpdate,
  onDelete,
  onStatusChange
}) => {
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    description: '',
    price: 0,
    currency: 'USD',
    address: '',
    area_total: 0,
    bedrooms: 0,
    bathrooms: 0,
    property_type_id: '',
    development_id: '',
    status: 'available',
    is_featured: false,
    parking_spaces: 0,
    year_built: new Date().getFullYear(),
    available_from: '',
    commission_rate: 3,
    latitude: 0,
    longitude: 0
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'images'>('basic');

  const { propertyTypes } = usePropertyTypes();
  const { developments } = useDevelopments();

  // Property status options
  const statusOptions = [
    { value: 'available', label: 'Disponible', color: 'green' },
    { value: 'reserved', label: 'Reservado', color: 'yellow' },
    { value: 'sold', label: 'Vendido', color: 'red' },
    { value: 'under_construction', label: 'En Construcción', color: 'blue' },
    { value: 'off_market', label: 'Fuera del Mercado', color: 'gray' }
  ];

  // Property type mapping
  const typeMapping: Record<string, string> = {
    'House': 'casa',
    'Apartment': 'departamento',
    'Land': 'lote',
    'Complex': 'complejo'
  };

  // Initialize form data when property changes
  useEffect(() => {
    if (property && mode === 'edit') {
      const propertyTypeId = propertyTypes.find(pt =>
        typeMapping[property.type] === pt.name
      )?.id || '';

      setFormData({
        title: property.title,
        description: property.description,
        price: property.price,
        currency: property.currency,
        address: property.location?.address || property.address || '',
        area_total: property.area,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        property_type_id: propertyTypeId,
        development_id: '',
        status: property.status,
        is_featured: property.featured,
        parking_spaces: 0,
        year_built: new Date().getFullYear(),
        available_from: '',
        commission_rate: 3,

        latitude: 0,
        longitude: 0
      });

      if (property.gallery && property.gallery.length > 0) {
        setExistingImages(property.gallery);
      }
    } else if (mode === 'create') {
      setFormData({
        title: '',
        description: '',
        price: 0,
        currency: 'USD',
        address: '',
        area_total: 0,
        bedrooms: 0,
        bathrooms: 0,
        property_type_id: '',
        development_id: '',
        status: 'available',
        is_featured: false,
        parking_spaces: 0,
        year_built: new Date().getFullYear(),
        available_from: '',
        commission_rate: 3,
        latitude: 0,
        longitude: 0
      });
      setExistingImages([]);
      setDeletedImages([]);
    }
  }, [property, mode, propertyTypes]);

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es obligatorio';
    }

    if (formData.price <= 0) {
      newErrors.price = 'El precio debe ser mayor a 0';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es obligatoria';
    }

    if (formData.area_total <= 0) {
      newErrors.area_total = 'El área debe ser mayor a 0';
    }

    if (formData.bedrooms < 0) {
      newErrors.bedrooms = 'El número de habitaciones no puede ser negativo';
    }

    if (formData.bathrooms < 0) {
      newErrors.bathrooms = 'El número de baños no puede ser negativo';
    }

    if (formData.commission_rate < 0 || formData.commission_rate > 100) {
      newErrors.commission_rate = 'La comisión debe estar entre 0 y 100%';
    }

    if (formData.year_built < 1900 || formData.year_built > new Date().getFullYear() + 10) {
      newErrors.year_built = 'Año de construcción inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setUploading(true);

    try {
      if (mode === 'create') {
        await onSave(formData, selectedFiles);
      } else if (mode === 'edit' && property && onUpdate) {
        // Handle property update with image management
        await onUpdate(property, formData);
      }

      onClose();
    } catch (error) {
      console.error('Error saving property:', error);
      setErrors({ general: 'Error al guardar la propiedad' });
    } finally {
      setUploading(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files);

    // Validate files
    const validFiles = newFiles.filter(file => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        alert(`Archivo ${file.name} no es un tipo válido. Solo JPEG, PNG, WebP y GIF están permitidos.`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert(`Archivo ${file.name} es demasiado grande. Máximo 10MB permitido.`);
        return false;
      }
      return true;
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  // Remove selected file
  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Remove existing image
  const removeExistingImage = (imageUrl: string) => {
    setDeletedImages(prev => [...prev, imageUrl]);
    setExistingImages(prev => prev.filter(img => img !== imageUrl));
  };

  // Undo image deletion
  const undoImageDeletion = (imageUrl: string) => {
    setDeletedImages(prev => prev.filter(img => img !== imageUrl));
    setExistingImages(prev => [...prev, imageUrl]);
  };

  if (!isOpen) return null;

  const isViewMode = mode === 'view';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-navy to-navy-light">
          <div>
            <h3 className="font-bold text-white text-xl">
              {mode === 'create' ? 'Nueva Propiedad' :
                mode === 'edit' ? 'Editar Propiedad' :
                  'Ver Propiedad'}
            </h3>
            <p className="text-gray-300 text-sm mt-1">
              {mode === 'create' ? 'Complete todos los datos para crear una nueva propiedad' :
                mode === 'edit' ? 'Modifique los datos de la propiedad' :
                  'Información detallada de la propiedad'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white transition-colors"
            disabled={uploading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        {!isViewMode && (
          <div className="px-6 pt-4 border-b border-gray-100">
            <div className="flex space-x-1">
              {[
                { id: 'basic', label: 'Básicos', icon: Home },
                { id: 'details', label: 'Detalles', icon: Settings },
                { id: 'images', label: 'Imágenes', icon: ImageIcon }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === tab.id
                      ? 'bg-gold text-white'
                      : 'text-gray-600 hover:text-navy hover:bg-gray-50'
                      }`}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-6">
          <form id="property-form" onSubmit={handleSubmit} className="space-y-6">

            {/* Basic Information Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-navy mb-2">
                      Título de la Propiedad *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-gold outline-none transition-colors ${errors.title ? 'border-red-300' : 'border-gray-200'
                        }`}
                      placeholder="Ej: Residencia Premium Centro Docta"
                      disabled={isViewMode}
                    />
                    {errors.title && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.title}
                      </p>
                    )}
                  </div>

                  {/* Price and Currency */}
                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">
                      Precio *
                    </label>
                    <div className="relative">
                      <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-gold outline-none transition-colors ${errors.price ? 'border-red-300' : 'border-gray-200'
                          }`}
                        placeholder="0.00"
                        disabled={isViewMode}
                      />
                    </div>
                    {errors.price && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.price}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">
                      Moneda
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold outline-none"
                      disabled={isViewMode}
                    >
                      <option value="USD">USD - Dólares</option>
                      <option value="ARS">ARS - Pesos Argentinos</option>
                      <option value="EUR">EUR - Euros</option>
                    </select>
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-navy mb-2">
                      Dirección *
                    </label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-gold outline-none transition-colors ${errors.address ? 'border-red-300' : 'border-gray-200'
                          }`}
                        placeholder="Dirección completa"
                        disabled={isViewMode}
                      />
                    </div>
                    {errors.address && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.address}
                      </p>
                    )}
                  </div>

                  {/* Property Type and Development */}
                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">
                      Tipo de Propiedad
                    </label>
                    <select
                      value={formData.property_type_id}
                      onChange={(e) => setFormData({ ...formData, property_type_id: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold outline-none"
                      disabled={isViewMode}
                    >
                      <option value="">Seleccionar tipo...</option>
                      {propertyTypes.map(pt => (
                        <option key={pt.id} value={pt.id}>{pt.display_name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">
                      Desarrollo Inmobiliario
                    </label>
                    <select
                      value={formData.development_id}
                      onChange={(e) => setFormData({ ...formData, development_id: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold outline-none"
                      disabled={isViewMode}
                    >
                      <option value="">Ninguno</option>
                      {developments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Property Details */}
                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">
                      Área Total (m²) *
                    </label>
                    <div className="relative">
                      <Square size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.area_total}
                        onChange={(e) => setFormData({ ...formData, area_total: parseFloat(e.target.value) || 0 })}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-gold outline-none transition-colors ${errors.area_total ? 'border-red-300' : 'border-gray-200'
                          }`}
                        placeholder="0.00"
                        disabled={isViewMode}
                      />
                    </div>
                    {errors.area_total && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.area_total}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">
                      Habitaciones
                    </label>
                    <div className="relative">
                      <Bed size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        min="0"
                        value={formData.bedrooms}
                        onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) || 0 })}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-gold outline-none transition-colors ${errors.bedrooms ? 'border-red-300' : 'border-gray-200'
                          }`}
                        placeholder="0"
                        disabled={isViewMode}
                      />
                    </div>
                    {errors.bedrooms && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.bedrooms}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">
                      Baños
                    </label>
                    <div className="relative">
                      <Bath size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        min="0"
                        value={formData.bathrooms}
                        onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) || 0 })}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-gold outline-none transition-colors ${errors.bathrooms ? 'border-red-300' : 'border-gray-200'
                          }`}
                        placeholder="0"
                        disabled={isViewMode}
                      />
                    </div>
                    {errors.bathrooms && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.bathrooms}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">
                      Cocheras
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.parking_spaces}
                      onChange={(e) => setFormData({ ...formData, parking_spaces: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold outline-none"
                      placeholder="0"
                      disabled={isViewMode}
                    />
                  </div>

                  {/* Status and Featured */}
                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">
                      Estado de la Propiedad
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold outline-none"
                      disabled={isViewMode}
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">
                      Año de Construcción
                    </label>
                    <input
                      type="number"
                      min="1900"
                      max={new Date().getFullYear() + 10}
                      value={formData.year_built}
                      onChange={(e) => setFormData({ ...formData, year_built: parseInt(e.target.value) || new Date().getFullYear() })}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-gold outline-none transition-colors ${errors.year_built ? 'border-red-300' : 'border-gray-200'
                        }`}
                      placeholder={new Date().getFullYear().toString()}
                      disabled={isViewMode}
                    />
                    {errors.year_built && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.year_built}
                      </p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-navy mb-2">
                    Descripción
                  </label>
                  <div className="relative">
                    <FileText size={16} className="absolute left-3 top-3 text-gray-400" />
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold outline-none resize-none"
                      placeholder="Descripción detallada de la propiedad, características especiales, amenities, etc."
                      disabled={isViewMode}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Continue with other tabs... */}

          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {mode === 'create' ? 'Complete todos los campos obligatorios' :
                mode === 'edit' ? 'Los cambios se guardarán inmediatamente' :
                  'Vista de solo lectura'}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={uploading}
              >
                {isViewMode ? 'Cerrar' : 'Cancelar'}
              </Button>

              {!isViewMode && (
                <Button
                  type="submit"
                  form="property-form"
                  disabled={uploading}
                  className="min-w-[120px]"
                >
                  {uploading ? (
                    <RefreshCw size={16} className="animate-spin mr-2" />
                  ) : (
                    <Save size={16} className="mr-2" />
                  )}
                  {uploading ? 'Guardando...' :
                    mode === 'create' ? 'Crear Propiedad' :
                      'Actualizar'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div >
    </div >
  );
};

export default PropertyModal;
