
import React from 'react';
import PropertyCard from '../components/PropertyCard';
import { Filter, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';

const PropertiesPage = () => {
  const { properties, propertiesLoading } = useApp();

  // Validación defensiva para evitar crash cuando properties no es un array
  const safeProperties = Array.isArray(properties) ? properties : [];

  return (
    <div className="container mx-auto px-4 py-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
        <h1 className="text-4xl font-serif font-bold text-navy">Nuestras Propiedades</h1>

        <div className="flex gap-3 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-bold text-navy hover:border-gold hover:text-gold transition-all shadow-sm">
            Filtros
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-bold text-navy hover:border-gold hover:text-gold transition-all shadow-sm">
            Ubicación
          </button>
        </div>
      </div>

      {propertiesLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
        </div>
      ) : safeProperties.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No hay propiedades disponibles en este momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {safeProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertiesPage;
