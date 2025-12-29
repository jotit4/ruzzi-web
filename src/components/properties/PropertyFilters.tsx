import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, X, MapPin, DollarSign, Home, 
  Bed, Bath, Square, Building, Calendar,
  SlidersHorizontal, RotateCcw, ChevronDown
} from 'lucide-react';
import Button from '../Button';
import { usePropertyTypes, useDevelopments } from '../../hooks/useSupabase';

export interface PropertyFilters {
  search: string;
  priceMin: number | null;
  priceMax: number | null;
  location: string;
  propertyType: string;
  development: string;
  status: string;
  bedrooms: number | null;
  bathrooms: number | null;
  areaMin: number | null;
  areaMax: number | null;
  featured: boolean | null;
  sortBy: 'price_asc' | 'price_desc' | 'date_asc' | 'date_desc' | 'area_asc' | 'area_desc';
}

interface PropertyFiltersProps {
  filters: PropertyFilters;
  onFiltersChange: (filters: PropertyFilters) => void;
  onReset: () => void;
  isOpen: boolean;
  onToggle: () => void;
  propertyCount: number;
  totalCount: number;
}

const PropertyFilters: React.FC<PropertyFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
  isOpen,
  onToggle,
  propertyCount,
  totalCount
}) => {
  const [localFilters, setLocalFilters] = useState<PropertyFilters>(filters);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const { propertyTypes } = usePropertyTypes();
  const { developments } = useDevelopments();

  // Property status options
  const statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'available', label: 'Disponible' },
    { value: 'reserved', label: 'Reservado' },
    { value: 'sold', label: 'Vendido' },
    { value: 'under_construction', label: 'En Construcción' },
    { value: 'off_market', label: 'Fuera del Mercado' }
  ];

  // Sort options
  const sortOptions = [
    { value: 'price_asc', label: 'Precio: Menor a Mayor' },
    { value: 'price_desc', label: 'Precio: Mayor a Menor' },
    { value: 'date_asc', label: 'Fecha: Más Antiguo' },
    { value: 'date_desc', label: 'Fecha: Más Reciente' },
    { value: 'area_asc', label: 'Área: Menor a Mayor' },
    { value: 'area_desc', label: 'Área: Mayor a Menor' }
  ];

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Apply filters
  const applyFilters = () => {
    onFiltersChange(localFilters);
    onToggle(); // Close filters panel
  };

  // Reset all filters
  const handleReset = () => {
    const resetFilters: PropertyFilters = {
      search: '',
      priceMin: null,
      priceMax: null,
      location: '',
      propertyType: '',
      development: '',
      status: '',
      bedrooms: null,
      bathrooms: null,
      areaMin: null,
      areaMax: null,
      featured: null,
      sortBy: 'date_desc'
    };
    
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
    onReset();
  };

  // Toggle filter section
  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return (
      localFilters.search ||
      localFilters.priceMin !== null ||
      localFilters.priceMax !== null ||
      localFilters.location ||
      localFilters.propertyType ||
      localFilters.development ||
      localFilters.status ||
      localFilters.bedrooms !== null ||
      localFilters.bathrooms !== null ||
      localFilters.areaMin !== null ||
      localFilters.areaMax !== null ||
      localFilters.featured !== null ||
      localFilters.sortBy !== 'date_desc'
    );
  };

  return (
    <>
      {/* Filter Toggle Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggle}
          className="flex items-center gap-2"
        >
          <Filter size={16} />
          Filtros
          {hasActiveFilters() && (
            <span className="bg-gold text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
              !
            </span>
          )}
        </Button>
        
        <div className="text-sm text-gray-600">
          Mostrando {propertyCount} de {totalCount} propiedades
        </div>
      </div>

      {/* Filters Panel */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:relative lg:bg-transparent lg:inset-auto lg:z-auto">
          <div className="bg-white lg:rounded-xl border border-gray-100 shadow-lg lg:shadow-sm lg:border lg:w-80 max-h-[90vh] lg:max-h-[600px] overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center lg:rounded-t-xl bg-gray-50">
              <h3 className="font-bold text-navy flex items-center gap-2">
                <SlidersHorizontal size={18} />
                Filtros Avanzados
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="text-gray-500 hover:text-navy"
                >
                  <RotateCcw size={14} />
                </Button>
                <button
                  onClick={onToggle}
                  className="lg:hidden text-gray-400 hover:text-navy"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
              
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-navy mb-2">
                  Búsqueda
                </label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={localFilters.search}
                    onChange={(e) => setLocalFilters({...localFilters, search: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold outline-none"
                    placeholder="Buscar por título o descripción..."
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-navy mb-2">
                  Ubicación
                </label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={localFilters.location}
                    onChange={(e) => setLocalFilters({...localFilters, location: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold outline-none"
                    placeholder="Ciudad, barrio o zona..."
                  />
                </div>
              </div>

              {/* Price Range */}
              <div>
                <button
                  onClick={() => toggleSection('price')}
                  className="w-full flex justify-between items-center text-sm font-medium text-navy mb-2"
                >
                  <span>Rango de Precio</span>
                  <ChevronDown size={16} className={`transition-transform ${activeSection === 'price' ? 'rotate-180' : ''}`} />
                </button>
                
                {activeSection === 'price' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Mínimo</label>
                        <div className="relative">
                          <DollarSign size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="number"
                            min="0"
                            value={localFilters.priceMin || ''}
                            onChange={(e) => setLocalFilters({
                              ...localFilters, 
                              priceMin: e.target.value ? parseInt(e.target.value) : null
                            })}
                            className="w-full pl-8 pr-2 py-2 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-gold outline-none"
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Máximo</label>
                        <div className="relative">
                          <DollarSign size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="number"
                            min="0"
                            value={localFilters.priceMax || ''}
                            onChange={(e) => setLocalFilters({
                              ...localFilters, 
                              priceMax: e.target.value ? parseInt(e.target.value) : null
                            })}
                            className="w-full pl-8 pr-2 py-2 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-gold outline-none"
                            placeholder="∞"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Quick price ranges */}
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'Hasta $500K', min: 0, max: 500000 },
                        { label: '$500K - $1M', min: 500000, max: 1000000 },
                        { label: '$1M - $2M', min: 1000000, max: 2000000 },
                        { label: 'Más de $2M', min: 2000000, max: null }
                      ].map((range) => (
                        <button
                          key={range.label}
                          onClick={() => setLocalFilters({
                            ...localFilters,
                            priceMin: range.min,
                            priceMax: range.max
                          })}
                          className="text-xs py-1 px-2 border border-gray-200 rounded hover:bg-gray-50 hover:border-gold transition-colors"
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Property Type */}
              <div>
                <button
                  onClick={() => toggleSection('type')}
                  className="w-full flex justify-between items-center text-sm font-medium text-navy mb-2"
                >
                  <span>Tipo de Propiedad</span>
                  <ChevronDown size={16} className={`transition-transform ${activeSection === 'type' ? 'rotate-180' : ''}`} />
                </button>
                
                {activeSection === 'type' && (
                  <select
                    value={localFilters.propertyType}
                    onChange={(e) => setLocalFilters({...localFilters, propertyType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold outline-none text-sm"
                  >
                    <option value="">Todos los tipos</option>
                    {propertyTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.display_name}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Status */}
              <div>
                <button
                  onClick={() => toggleSection('status')}
                  className="w-full flex justify-between items-center text-sm font-medium text-navy mb-2"
                >
                  <span>Estado</span>
                  <ChevronDown size={16} className={`transition-transform ${activeSection === 'status' ? 'rotate-180' : ''}`} />
                </button>
                
                {activeSection === 'status' && (
                  <select
                    value={localFilters.status}
                    onChange={(e) => setLocalFilters({...localFilters, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold outline-none text-sm"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Bedrooms & Bathrooms */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <button
                    onClick={() => toggleSection('bedrooms')}
                    className="w-full flex justify-between items-center text-sm font-medium text-navy mb-2"
                  >
                    <span>Habitaciones</span>
                    <ChevronDown size={16} className={`transition-transform ${activeSection === 'bedrooms' ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {activeSection === 'bedrooms' && (
                    <select
                      value={localFilters.bedrooms || ''}
                      onChange={(e) => setLocalFilters({
                        ...localFilters, 
                        bedrooms: e.target.value ? parseInt(e.target.value) : null
                      })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold outline-none text-sm"
                    >
                      <option value="">Cualquier cantidad</option>
                      {[1, 2, 3, 4, 5, 6].map(num => (
                        <option key={num} value={num}>{num}+ habitaciones</option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <button
                    onClick={() => toggleSection('bathrooms')}
                    className="w-full flex justify-between items-center text-sm font-medium text-navy mb-2"
                  >
                    <span>Baños</span>
                    <ChevronDown size={16} className={`transition-transform ${activeSection === 'bathrooms' ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {activeSection === 'bathrooms' && (
                    <select
                      value={localFilters.bathrooms || ''}
                      onChange={(e) => setLocalFilters({
                        ...localFilters, 
                        bathrooms: e.target.value ? parseInt(e.target.value) : null
                      })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold outline-none text-sm"
                    >
                      <option value="">Cualquier cantidad</option>
                      {[1, 2, 3, 4, 5].map(num => (
                        <option key={num} value={num}>{num}+ baños</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Area Range */}
              <div>
                <button
                  onClick={() => toggleSection('area')}
                  className="w-full flex justify-between items-center text-sm font-medium text-navy mb-2"
                >
                  <span>Rango de Área (m²)</span>
                  <ChevronDown size={16} className={`transition-transform ${activeSection === 'area' ? 'rotate-180' : ''}`} />
                </button>
                
                {activeSection === 'area' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Mínimo</label>
                      <div className="relative">
                        <Square size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="number"
                          min="0"
                          value={localFilters.areaMin || ''}
                          onChange={(e) => setLocalFilters({
                            ...localFilters, 
                            areaMin: e.target.value ? parseInt(e.target.value) : null
                          })}
                          className="w-full pl-8 pr-2 py-2 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-gold outline-none"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Máximo</label>
                      <div className="relative">
                        <Square size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="number"
                          min="0"
                          value={localFilters.areaMax || ''}
                          onChange={(e) => setLocalFilters({
                            ...localFilters, 
                            areaMax: e.target.value ? parseInt(e.target.value) : null
                          })}
                          className="w-full pl-8 pr-2 py-2 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-gold outline-none"
                          placeholder="∞"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Development */}
              <div>
                <button
                  onClick={() => toggleSection('development')}
                  className="w-full flex justify-between items-center text-sm font-medium text-navy mb-2"
                >
                  <span>Desarrollo</span>
                  <ChevronDown size={16} className={`transition-transform ${activeSection === 'development' ? 'rotate-180' : ''}`} />
                </button>
                
                {activeSection === 'development' && (
                  <select
                    value={localFilters.development}
                    onChange={(e) => setLocalFilters({...localFilters, development: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold outline-none text-sm"
                  >
                    <option value="">Todos los desarrollos</option>
                    {developments.map(dev => (
                      <option key={dev.id} value={dev.id}>{dev.name}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Featured */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-navy">
                  <input
                    type="checkbox"
                    checked={localFilters.featured === true}
                    onChange={(e) => setLocalFilters({
                      ...localFilters,
                      featured: e.target.checked ? true : null
                    })}
                    className="w-4 h-4 rounded border-gray-300 text-gold focus:ring-gold"
                  />
                  Solo propiedades destacadas
                </label>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-navy mb-2">
                  Ordenar por
                </label>
                <select
                  value={localFilters.sortBy}
                  onChange={(e) => setLocalFilters({...localFilters, sortBy: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold outline-none text-sm"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 lg:rounded-b-xl">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="flex-1"
                >
                  Limpiar
                </Button>
                <Button
                  size="sm"
                  onClick={applyFilters}
                  className="flex-1"
                >
                  Aplicar Filtros
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PropertyFilters;
