
import React from 'react';
import { Briefcase, BarChart3, Shield } from 'lucide-react';
import { SocialEmbed } from '../components/SocialEmbed';
import { useApp } from '../context/AppContext';

const AboutPage = () => {
  const { webConfig } = useApp();
  const socialConfig = webConfig?.socialEmbeds?.['about'];

  return (
    <div className="animate-in fade-in duration-500 bg-white">

      {/* Hero Section - Mission */}
      {/* Usamos un diseño más limpio y tipográfico */}
      <div className="relative bg-navy text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold opacity-5 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>

        <div className="container mx-auto px-4 py-20 lg:py-28 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-8 tracking-tight">
              QUIÉNES SOMOS
            </h1>
            <div className="w-24 h-1 bg-gold mx-auto mb-10"></div>

            <p className="text-lg md:text-xl text-gray-200 leading-relaxed font-light mb-8">
              <strong className="text-gold font-semibold">Ruzzi Desarrollista</strong> nace en Córdoba con una premisa clara: elevar el estándar del mercado.
              Buscamos brindar un servicio <span className="text-white font-medium">profesional y responsable</span> de intermediación en la compra, venta y alquiler de inmuebles.
            </p>
            <p className="text-lg md:text-xl text-gray-200 leading-relaxed font-light">
              Nuestro objetivo es satisfacer al cliente atendiendo, comprendiendo y trabajando sobre sus
              necesidades inmobiliarias específicas, aportando valor real a los inversores en bienes raíces.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20 space-y-24">

        {/* Vision Section */}
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="w-full md:w-1/2 relative">
            {/* Abstract decorative element representing vision */}
            <div className="aspect-square bg-gray-100 rounded-2xl relative overflow-hidden flex items-center justify-center p-8 border border-gray-200">
              <div className="absolute inset-0 bg-pattern-grid opacity-10"></div>
              <div className="text-center">
                <div className="text-6xl text-gold/20 font-serif font-bold mb-2">VISIÓN</div>
                <BarChart3 className="w-24 h-24 text-navy mx-auto opacity-80" strokeWidth={1.5} />
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <h2 className="text-3xl font-serif font-bold text-navy mb-6">Nuestra Visión</h2>
            <p className="text-xl text-gray-600 leading-relaxed border-l-4 border-gold pl-6 italic">
              "Ser una empresa líder en servicios inmobiliarios, referente absoluto de profesionalismo y atención personalizada."
            </p>
          </div>
        </div>

        {/* Values Section */}
        <div className="text-center max-w-6xl mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl font-serif font-bold text-navy mb-4">Nuestros Valores</h2>
            <p className="text-gray-500">Los pilares que sostienen cada una de nuestras operaciones</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Value 1 */}
            <div className="group p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-gold/30 transition-all duration-300">
              <div className="w-16 h-16 bg-navy/5 rounded-2xl flex items-center justify-center mx-auto mb-6 text-navy group-hover:bg-navy group-hover:text-gold transition-colors duration-300">
                <Shield size={32} strokeWidth={1.5} />
              </div>
              <h3 className="font-serif font-bold text-xl text-navy mb-3">Compromiso</h3>
              <p className="text-gray-600 leading-relaxed">
                Asumimos la responsabilidad de cumplir con la palabra dada, excediendo las expectativas en cada interacción.
              </p>
            </div>

            {/* Value 2 */}
            <div className="group p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-gold/30 transition-all duration-300">
              <div className="w-16 h-16 bg-navy/5 rounded-2xl flex items-center justify-center mx-auto mb-6 text-navy group-hover:bg-navy group-hover:text-gold transition-colors duration-300">
                <Briefcase size={32} strokeWidth={1.5} />
              </div>
              <h3 className="font-serif font-bold text-xl text-navy mb-3">Integridad</h3>
              <p className="text-gray-600 leading-relaxed">
                Operamos con total transparencia y ética, construyendo relaciones duraderas basadas en la confianza.
              </p>
            </div>

            {/* Value 3 */}
            <div className="group p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-gold/30 transition-all duration-300">
              <div className="w-16 h-16 bg-navy/5 rounded-2xl flex items-center justify-center mx-auto mb-6 text-navy group-hover:bg-navy group-hover:text-gold transition-colors duration-300">
                <BarChart3 size={32} strokeWidth={1.5} />
              </div>
              <h3 className="font-serif font-bold text-xl text-navy mb-3">Profesionalismo</h3>
              <p className="text-gray-600 leading-relaxed">
                Brindamos un asesoramiento experto y riguroso, respaldado por un conocimiento profundo del mercado.
              </p>
            </div>
          </div>
        </div>

        {/* Social Media Embed Section */}
        {socialConfig?.enabled && socialConfig?.url && (
          <div className="pt-8 pb-8">
            <div className="flex items-center gap-4 mb-10 max-w-6xl mx-auto px-4">
              <div className="h-px bg-gray-200 flex-grow"></div>
              <h2 className="text-2xl font-serif font-bold text-gray-400 uppercase tracking-widest">Social Feed</h2>
              <div className="h-px bg-gray-200 flex-grow"></div>
            </div>

            <div className="w-full max-w-6xl mx-auto px-4 flex justify-center">
              <SocialEmbed url={socialConfig.url} width="100%" captioned={false} />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AboutPage;