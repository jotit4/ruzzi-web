import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import WebRenderer from '../components/WebRenderer';
import PropertyCard from '../components/PropertyCard';
import Button from '../components/Button';
import { Search } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const { properties, webConfig } = useApp();
  const featuredProperties = (Array.isArray(properties) ? properties : []).slice(0, 3);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/propiedades');
  };

  // Prevent Flash of Default Content (FOUC)
  // If webConfig is loading or not yet available, show a loader
  if (!webConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  // Render logic using webConfig data
  return (
    <div className="animate-in fade-in duration-700">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={webConfig?.hero?.bgImage || "https://images.unsplash.com/photo-1600607686527-6fb886090705?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"}
            alt="Luxury Home"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#1B2B3A]/90 via-transparent to-[#1B2B3A]/30"></div>
        </div>

        <div className="container mx-auto px-6 z-10 relative flex flex-col items-center text-center mt-10">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 leading-tight drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
            {webConfig?.hero?.title || "Encuentra tu hogar perfecto"} <br />
            <span className="italic text-gold drop-shadow-sm">{webConfig?.hero?.highlight || "con grupo Ruzzi"}</span>
          </h1>
          <p className="text-lg md:text-xl text-white font-medium mb-12 max-w-2xl tracking-wide drop-shadow-md whitespace-pre-wrap">
            {webConfig?.hero?.subtitle || "Desarrollos inmobiliarios premium en la urbanización más inteligente y segura de Córdoba."}
          </p>

          <div className="w-full max-w-4xl bg-white/95 backdrop-blur-md p-4 rounded-xl border border-white/20 shadow-2xl">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
              <div className="flex-grow relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="text-gold h-5 w-5" />
                </div>
                <input type="text" placeholder="Buscar por ubicación, tipo o precio..." className="w-full pl-12 pr-4 py-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold bg-white text-black placeholder:text-gray-400 shadow-inner" />
              </div>
              <Button type="submit" variant="primary" className="md:w-auto w-full py-4 px-8 text-lg shadow-lg">BUSCAR PROPIEDADES</Button>
            </form>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-24 bg-cream relative">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-xl">
              <span className="text-gold font-bold tracking-widest uppercase text-sm mb-2 block">Exclusividad</span>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-navy mb-4">Propiedades Destacadas</h2>
              <div className="h-1 w-24 bg-gold mb-4"></div>
              <p className="text-gray-500 font-light text-lg">Una selección curada de nuestras residencias más exclusivas.</p>
            </div>
            <Button variant="outline" className="hidden md:inline-flex" onClick={() => navigate('/propiedades')}>Ver Catálogo Completo</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      </section>

      {/* New CTA Section - High Contrast */}
      <section className="py-24 bg-navy relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6 tracking-tight">
            Todo comienza con un sueño. <br />
            <span className="text-gold italic">Hablemos.</span>
          </h2>
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-light leading-relaxed">
            Permítenos guiarte hacia tu próxima gran inversión o el hogar que siempre has deseado. La excelencia es nuestro estándar.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/contacto')}
              className="px-10 py-5 text-lg shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] border-gold/50"
            >
              CONTACTAR ASESOR
            </Button>
            <Button
              variant="custom"
              size="lg"
              onClick={() => window.open('https://wa.me/5493518178057', '_blank')}
              className="px-10 py-5 text-lg border-transparent bg-[#25D366] text-white hover:bg-[#20bd5a] hover:shadow-[0_0_20px_rgba(37,211,102,0.4)] transition-all transform hover:scale-105"
            >
              WHATSAPP
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
