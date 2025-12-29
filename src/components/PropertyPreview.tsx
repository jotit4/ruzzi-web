
import React from 'react';
import { Property } from '../types';
import { Bed, Bath, Square, MapPin, Check } from 'lucide-react';

interface PropertyPreviewProps {
    property: Partial<Property>;
    features?: string[];
}

const PropertyPreview: React.FC<PropertyPreviewProps> = ({ property, features }) => {
    // Use property.full_images or property.gallery
    const mainImage = property.image || (property.full_images?.[0]?.image_url) || "https://images.unsplash.com/photo-1564013467402-9fef2297af13?auto=format&fit=crop&q=80&w=1000";
    const gallery = property.gallery || property.full_images?.map(img => img.image_url) || [];

    return (
        <div className="bg-white min-h-full overflow-y-auto font-sans text-gray-900 border-l border-gray-200">
            {/* Header / Hero Preview */}
            <div className="relative h-72 bg-gray-900 overflow-hidden">
                <img
                    src={mainImage}
                    className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700"
                    alt="Preview"
                />
                <div className="absolute top-4 left-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${property.status === 'available' ? 'bg-green-500 text-white' :
                            property.status === 'reserved' ? 'bg-yellow-500 text-white' :
                                property.status === 'sold' ? 'bg-red-500 text-white' :
                                    'bg-blue-500 text-white'
                        }`}>
                        {property.status === 'available' ? 'Disponible' :
                            property.status === 'reserved' ? 'Reservado' :
                                property.status === 'sold' ? 'Vendido' :
                                    'En Obra'}
                    </span>
                </div>
                <div className="absolute bottom-6 left-6 text-white">
                    <h1 className="text-4xl font-serif font-bold drop-shadow-lg leading-tight">{property.title || 'Título de Propiedad'}</h1>
                    <p className="flex items-center gap-1.5 text-sm mt-2 opacity-90 font-medium">
                        <MapPin size={16} className="text-gold" />
                        {property.address || 'Ubicación no especificada'}
                    </p>
                </div>
            </div>

            <div className="p-6 space-y-8">
                {/* Basic Stats */}
                <div className="flex justify-between items-center bg-navy/5 p-5 rounded-2xl border border-navy/5">
                    <div className="text-3xl font-serif font-bold text-gold">
                        <span className="text-sm font-sans mr-1 text-navy opacity-60 uppercase tracking-tighter">{property.currency || 'USD'}</span>
                        {property.price?.toLocaleString() || '0'}
                    </div>
                    <div className="flex gap-4 text-gray-500">
                        <div className="flex items-center gap-1">
                            <Bed size={18} />
                            <span className="text-sm font-semibold">{property.bedrooms || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Bath size={18} />
                            <span className="text-sm font-semibold">{property.bathrooms || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Square size={18} />
                            <span className="text-sm font-semibold">{property.area_total || 0} m²</span>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">Descripción</h3>
                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                        {property.description || 'Sin descripción disponible.'}
                    </p>
                </div>

                {/* Features / Amenities */}
                {features && features.length > 0 && (
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">Características</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {features.map((feat, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                                    <div className="w-5 h-5 bg-gold/10 rounded-full flex items-center justify-center text-gold">
                                        <Check size={12} strokeWidth={3} />
                                    </div>
                                    {feat}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Gallery Preview Grid */}
                {gallery.length > 0 && (
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">Galería ({gallery.length})</h3>
                        <div className="grid grid-cols-3 gap-2">
                            {gallery.slice(0, 6).map((img, i) => (
                                <div key={i} className="aspect-square rounded-lg overflow-hidden border border-gray-100">
                                    <img src={img} className="w-full h-full object-cover" alt={`Gallery ${i}`} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PropertyPreview;
