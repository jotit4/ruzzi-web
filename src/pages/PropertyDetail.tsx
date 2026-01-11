import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import { Bed, Bath, Maximize, MapPin, Share2, Calendar, Check, ChevronLeft, ChevronRight, Play, Star } from 'lucide-react';
import ScrollContactForm from '../components/ScrollContactForm';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { properties, propertiesLoading } = useApp();

  // Find the specific property
  const property = properties.find(p => p.id === id);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Safe gallery access
  const gallery = property?.gallery?.length ? property.gallery : property?.full_images?.map(i => i.image_url) || [];
  const defaultImage = property?.image || property?.full_images?.find(i => i.is_primary)?.image_url || gallery[0] || '';

  // Images are just the gallery now, as videos are separate
  const images = [...gallery];
  if (images.length === 0 && defaultImage) images.push(defaultImage);

  // Videos from the new column
  const videos = property?.video_urls || [];

  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  const mediaList = [...images, ...videos];
  const currentMedia = mediaList[currentMediaIndex] || defaultImage;

  // Helper to detect if media is a video (either by extension or if it came from video_urls)
  // For external links (youtube/vimeo), we'll need a better check or assume based on index
  const isVideo = (url: string) => {
    return videos.includes(url) || /\.(mp4|webm|ogg|mov)$/i.test(url);
  };
  const isCurrentMediaVideo = isVideo(currentMedia);

  // Show loading state while fetching
  if (propertiesLoading && !property) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-gold/50 rounded-full mb-4"></div>
          <div className="text-navy font-serif text-xl">Cargando propiedad...</div>
        </div>
      </div>
    );
  }

  // Show error if property not found after loading
  if (!property) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-4xl font-serif text-navy mb-4">Propiedad no encontrada</h2>
          <Button onClick={() => navigate('/')}>Volver al Inicio</Button>
        </div>
      </div>
    );
  }

  const nextImage = () => {
    if (mediaList.length > 0) {
      setCurrentMediaIndex((prev) => (prev + 1) % mediaList.length);
    }
  };

  const prevImage = () => {
    if (mediaList.length > 0) {
      setCurrentMediaIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 bg-cream min-h-screen">
      <div className="flex flex-col lg:flex-row h-full">
        {/* Gallery Section */}
        <div className="lg:w-[60%] bg-black relative h-[50vh] lg:h-[calc(100vh-80px)] overflow-hidden flex items-center justify-center">
          {isCurrentMediaVideo ? (
            <video
              src={currentMedia}
              className="w-full h-full object-contain"
              controls
              autoPlay
              muted
              loop
            />
          ) : (
            <img
              src={currentMedia}
              className="w-full h-full object-cover opacity-90"
              alt={property.title}
            />
          )}

          {gallery.length > 1 && (
            <>
              <>
                <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm z-10"><ChevronLeft /></button>
                <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm z-10"><ChevronRight /></button>
              </>
            </>
          )}
        </div>

        {/* Info Section */}
        <div className="lg:w-[40%] bg-cream p-4 lg:p-6 overflow-y-auto flex flex-col h-full">
          <div className="space-y-4 flex-grow">
            <div className="flex flex-wrap gap-2">
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm ${property.status === 'available' ? 'bg-green-500 text-white' :
                property.status === 'reserved' ? 'bg-yellow-500 text-white' :
                  property.status === 'sold' ? 'bg-red-500 text-white' :
                    'bg-blue-500 text-white'
                }`}>
                {property.status === 'available' ? 'Venta' :
                  property.status === 'reserved' ? 'Reservado' :
                    property.status === 'sold' ? 'Vendido' :
                      'En Obra'}
              </span>
              {property.is_featured && (
                <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-gold text-white shadow-sm flex items-center gap-1">
                  <Star size={12} fill="white" /> Destacado
                </span>
              )}
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl lg:text-3xl font-serif font-bold text-navy leading-tight">{property.title}</h1>

              <div className="flex items-center text-gray-400 gap-2">
                <MapPin size={16} className="text-gold" />
                <span className="text-base font-medium">{property.location?.address || property.address || 'Ubicación Premium'}</span>
              </div>
            </div>

            <div className="text-2xl lg:text-3xl font-serif font-bold text-gold">
              <span className="text-xs font-sans mr-2 text-navy opacity-50 uppercase tracking-tighter">{property.currency}</span>
              {property.price.toLocaleString()}
            </div>

            <div className="h-px bg-gray-200 w-full"></div>

            <p className="text-gray-600 leading-relaxed text-sm italic pr-2">
              "{property.description || 'Sin descripción disponible.'}"
            </p>

            <div className="grid grid-cols-4 gap-2">
              <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-50 flex flex-col items-center justify-center">
                <Bed className="text-gold mb-1" size={16} />
                <span className="block font-bold text-navy text-base">{property.bedrooms || 0}</span>
                <span className="text-[9px] text-gray-400 uppercase font-bold tracking-widest mt-0.5">Dorm.</span>
              </div>
              <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-50 flex flex-col items-center justify-center">
                <Bath className="text-gold mb-1" size={16} />
                <span className="block font-bold text-navy text-base">{property.bathrooms || 0}</span>
                <span className="text-[9px] text-gray-400 uppercase font-bold tracking-widest mt-0.5">Baños</span>
              </div>
              <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-50 flex flex-col items-center justify-center">
                <Maximize className="text-gold mb-1" size={16} />
                <span className="block font-bold text-navy text-base">{property.area_total || property.area || 0}</span>
                <span className="text-[9px] text-gray-400 uppercase font-bold tracking-widest mt-0.5">m²</span>
              </div>
              <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-50 flex flex-col items-center justify-center">
                <Calendar className="text-gold mb-1" size={16} />
                <span className="block font-bold text-navy text-base">{property.year_built || property.parking_spaces || '-'}</span>
                <span className="text-[9px] text-gray-400 uppercase font-bold tracking-widest mt-0.5">
                  {property.year_built ? 'Año' : (property.parking_spaces ? 'Coch.' : 'Var')}
                </span>
              </div>
            </div>

            {/* Features List */}
            {property.features && property.features.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-navy border-b border-gold/30 pb-1 inline-block">Amenities</h3>
                <div className="grid grid-cols-2 gap-2">
                  {property.features.slice(0, 6).map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 text-gray-700 bg-white/50 p-1.5 rounded-lg">
                      <div className="w-4 h-4 bg-gold/10 rounded-full flex items-center justify-center text-gold">
                        <Check size={10} strokeWidth={3} />
                      </div>
                      <span className="text-xs font-medium truncate">{feat.feature_name}</span>
                    </div>
                  ))}
                  {property.features.length > 6 && (<span className="text-xs text-gray-400 italic pl-2">+{property.features.length - 6} más...</span>)}
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 mt-auto sticky bottom-0 bg-gradient-to-t from-cream via-cream to-transparent pb-4 z-20 px-1">
            <Button
              fullWidth
              size="lg"
              onClick={() => navigate('/contacto')}
              className="h-14 text-sm tracking-[0.2em] font-bold shadow-[0_4px_14px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(212,175,55,0.4)] transform active:scale-[0.98] transition-all bg-navy text-white hover:bg-navy-dark border border-navy"
            >
              CONTACTAR
            </Button>
          </div>

        </div>
      </div>

      {/* Immersive Section */}
      {/* Immersive Section / Vertical Gallery */}
      <section className="bg-navy relative min-h-[50vh] flex flex-col items-center justify-center overflow-hidden py-12">
        {videos.length > 0 ? (
          <div className="w-full h-[85vh] relative">
            <video src={videos[0]} className="w-full h-full object-cover" controls playsInline />
            <div className="absolute top-0 left-0 w-full p-8 bg-gradient-to-b from-black/50 to-transparent">
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-white tracking-wide drop-shadow-lg">Experiencia Inmersiva</h2>
            </div>
          </div>
        ) : (
          <div className="w-full relative">
            <div className="text-center mb-10 px-4">
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-2 tracking-wide">Galería Inmersiva</h2>
              <p className="text-gold uppercase tracking-[0.2em] text-sm">Explora cada detalle</p>
            </div>

            <div className="flex flex-col gap-4 px-4 max-w-7xl mx-auto">
              {images.map((img, idx) => (
                <div key={idx} className="space-y-4">
                  <div className="w-full relative group">
                    <img
                      src={img}
                      alt={`Vista ${idx + 1}`}
                      className="w-full h-auto object-cover rounded-sm shadow-2xl transition-transform duration-700 hover:scale-[1.01]"
                      loading="lazy"
                    />
                  </div>

                  {/* Interstitial Quote every 2 images */}
                  {(idx + 1) % 2 === 0 && (idx + 1) < images.length && (
                    <div className="py-24 flex items-center justify-center bg-navy/5 rounded-sm my-8 border-y border-gold/20">
                      <div className="text-center max-w-2xl px-6">
                        <span className="text-gold text-4xl font-serif">"</span>
                        <h3 className="text-2xl md:text-3xl font-serif text-navy italic font-medium leading-relaxed my-4">
                          {[
                            "No compras una propiedad, inviertes en tu legado.",
                            "El escenario perfecto para los momentos que importan.",
                            "Exclusividad y diseño en cada rincón.",
                            "Donde la arquitectura abraza tus sueños."
                          ][(idx % 4)]}
                        </h3>
                        <div className="h-0.5 w-12 bg-gold mx-auto"></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {images.length === 0 && (
                <div className="w-full h-[60vh]">
                  <img src="/immersive-placeholder.png" alt="Inmersive Placeholder" className="w-full h-full object-cover opacity-60" />
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      <ScrollContactForm propertyId={property.id} propertyTitle={property.title} />
    </div >
  );
};

export default PropertyDetail;
