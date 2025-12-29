
import React from 'react';
import { Property } from '../types';
import { MapPin, Bed, Bath, Maximize } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PropertyCardProps {
  property: Property;
  compact?: boolean;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, compact = false }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/propiedad/${property.id}`);
  };

  return (
    <div
      onClick={handleViewDetails}
      className="group bg-white rounded-lg overflow-hidden shadow-card hover:shadow-premium transition-all duration-300 cursor-pointer border border-gray-100 flex flex-col h-full"
    >
      <div className="relative overflow-hidden h-64">
        <img
          src={property.image || property.full_images?.find(i => i.is_primary)?.image_url || property.full_images?.[0]?.image_url || '/placeholder-image.jpg'}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-navy/0 group-hover:bg-navy/10 transition-colors duration-300"></div>
        <div className="absolute top-4 right-4 bg-navy text-white text-[10px] px-3 py-1.5 font-medium uppercase tracking-widest shadow-lg">
          {property.status === 'available' ? 'Venta' : 'Alquiler'}
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <div className="flex flex-col mb-4">
          <h3 className="text-xl font-serif font-bold text-navy group-hover:text-gold transition-colors line-clamp-1 mb-1">
            {property.title}
          </h3>
          <div className="flex items-center text-gray-500 text-sm">
            <MapPin size={14} className="text-gold mr-1" />
            <span className="truncate">{property.location?.address || property.address || property.location?.city || 'Ubicación no disponible'}</span>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="text-2xl font-bold text-gold font-serif">
            {property.currency} {property.price.toLocaleString()}
          </div>
        </div>

        {!compact && (
          <div className="flex justify-between items-center border-t border-gray-100 pt-4 mt-auto">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-navy mb-1">
                <Bed size={18} />
              </div>
              <span className="text-xs text-gray-500 font-medium">{property.bedrooms} Dorm.</span>
            </div>
            <div className="w-px h-8 bg-gray-200"></div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-navy mb-1">
                <Bath size={18} />
              </div>
              <span className="text-xs text-gray-500 font-medium">{property.bathrooms} Baños</span>
            </div>
            <div className="w-px h-8 bg-gray-200"></div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-navy mb-1">
                <Maximize size={18} />
              </div>
              <span className="text-xs text-gray-500 font-medium">{property.area || property.area_total || 0} m²</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyCard;
