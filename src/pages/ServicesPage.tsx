import React from 'react';
import { SERVICES } from '../constants';
import { Briefcase, BarChart3, Shield, Building, Clipboard, Scale, ArrowRight } from 'lucide-react';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';

const ServicesPage = () => {
  const navigate = useNavigate();

  const getIcon = (iconName: string) => {
    switch(iconName) {
      case 'briefcase': return <Briefcase size={32} />;
      case 'chart': return <BarChart3 size={32} />;
      case 'shield': return <Shield size={32} />;
      case 'building': return <Building size={32} />;
      case 'clipboard': return <Clipboard size={32} />;
      case 'scale': return <Scale size={32} />;
      default: return <Briefcase size={32} />;
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      
      {/* Hero Header */}
      <div className="bg-navy py-20 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
             <div className="absolute transform rotate-45 -right-20 -top-20 w-96 h-96 bg-gold rounded-full blur-3xl"></div>
             <div className="absolute transform -rotate-12 -left-20 bottom-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          </div>
          <div className="relative z-10 container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">Nuestros Servicios</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">Soluciones integrales diseñadas para maximizar el valor de tu inversión inmobiliaria.</p>
          </div>
      </div>

      {/* Services Grid */}
      <div className="container mx-auto px-4 py-20">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {SERVICES.map((service) => (
                 <div key={service.id} className="group bg-white p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-gold/30 transition-all duration-300 flex flex-col">
                     <div className="w-16 h-16 bg-navy text-gold rounded-lg flex items-center justify-center mb-6 group-hover:bg-gold group-hover:text-white transition-colors">
                         {getIcon(service.icon)}
                     </div>
                     <h3 className="font-serif font-bold text-2xl text-navy mb-4">{service.title}</h3>
                     <p className="text-gray-600 mb-8 leading-relaxed flex-grow">{service.description}</p>
                     
                     <div className="pt-6 border-t border-gray-100">
                         <button className="flex items-center text-gold font-semibold hover:tracking-wide transition-all group-hover:text-navy">
                             Saber más <ArrowRight size={16} className="ml-2" />
                         </button>
                     </div>
                 </div>
             ))}
         </div>
      </div>

      {/* CTA Section */}
      <div className="bg-cream py-16">
          <div className="container mx-auto px-4">
              <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 border-l-8 border-gold">
                  <div className="md:w-2/3">
                      <h2 className="text-3xl font-serif font-bold text-navy mb-4">¿Necesitas asesoramiento personalizado?</h2>
                      <p className="text-gray-600 text-lg">Nuestro equipo de expertos está listo para ayudarte a tomar las mejores decisiones para tu patrimonio.</p>
                  </div>
                  <div className="md:w-1/3 text-right">
                      <Button variant="primary" size="lg" onClick={() => navigate('/contacto')}>
                          Contactar Ahora
                      </Button>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default ServicesPage;