import React, { useState } from 'react';
import { Filter, Search, X } from 'lucide-react';
import Button from '../Button';
import { PropertyFilters as PropertyFiltersType } from './PropertyFilters';

interface SimpleFiltersProps {
  filters: PropertyFiltersType;
  onFiltersChange: (filters: PropertyFiltersType) => void;
  onReset: () => void;
  isOpen: boolean;
  onToggle: () => void;
  propertyCount: number;
  totalCount: number;
}

const SimpleFilters: React.FC<SimpleFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
  isOpen,
  onToggle,
  propertyCount,
  totalCount
}) => {
  const [localSearch, setLocalSearch] = useState(filters.search);

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    onFiltersChange({
      ...filters,
      search: value
    });
  };

  const handleReset = () => {
    setLocalSearch('');
    onReset();
  };

  console.log('🔍 [SIMPLE_FILTERS] Component rendered, isOpen:', isOpen);

  return (
    <div className="flex items-center gap-4">
      {/* Simple Search Input */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={localSearch}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold outline-none"
          placeholder="Buscar propiedades..."
        />
      </div>

      {/* Simple Filter Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('🎯 [SIMPLE_FILTERS] Button clicked, calling onToggle');
          onToggle();
        }}
        className="flex items-center gap-2"
      >
        <Filter size={16} />
        Filtros
        <span className="bg-gold text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
          🔧
        </span>
      </Button>
      
      <div className="text-sm text-gray-600">
        Mostrando {propertyCount} de {totalCount} propiedades
      </div>

      {/* Reset Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleReset}
        className="text-gray-500"
      >
        <X size={14} />
        Limpiar
      </Button>
    </div>
  );
};

export default SimpleFilters;
