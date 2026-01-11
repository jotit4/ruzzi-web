
import React from 'react';
import { Briefcase, BarChart3, Shield } from 'lucide-react';
import { SocialEmbed } from '../components/SocialEmbed';
import { useApp } from '../context/AppContext';

const AboutPage = () => {
  const { webConfig } = useApp();
  const socialConfig = webConfig?.socialEmbeds?.['about'];

  // Default values allow the page to work before config is saved
  const aboutConfig = webConfig?.about || {
    hero: {
      title: "GRUPO RUZZI",
      description1: "Somos una empresa desarrollista e inmobiliaria dedicada al desarrollo de proyectos habitacionales de calidad. Nos especializamos en la construcción de dúplex y casas, y ofrecemos soluciones tanto para la compra, inversión y alquiler de viviendas.",
      description2: "Trabajamos de manera integral en cada proyecto, desde el desarrollo y la construcción hasta la comercialización y gestión inmobiliaria, garantizando calidad constructiva, cumplimiento de plazos y transparencia en cada etapa."
    },
    whatWeDo: {
      title: "QUÉ HACEMOS",
      description1: "Desarrollamos y construimos viviendas modernas, funcionales y confortables, pensadas para familias que buscan su hogar y para inversores que desean proyectos sólidos y rentables.",
      description2: "Además, contamos con una cartera de propiedades destinadas al alquiler, ofreciendo opciones confiables y bien ubicadas para quienes buscan vivir o invertir.",
      image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      quote: "Nuestros proyectos combinan diseño eficiente, materiales de primera calidad y una planificación que asegura durabilidad y valor a largo plazo."
    },
    commitment: {
      subtitle: "Nuestra Promesa",
      title: "NUESTRO COMPROMISO",
      description: "Brindar soluciones habitacionales integrales, creando hogares para familias, oportunidades de inversión seguras y opciones de alquiler que cumplen con altos estándares de calidad.",
      quote: "Construimos y administramos espacios pensados para el presente, con una visión clara hacia el futuro."
    },
    values: {
      title: "Nuestros Valores",
      subtitle: "Los pilares que sostienen cada una de nuestras operaciones",
      items: [
        { title: "Compromiso", description: "Asumimos la responsabilidad de cumplir con la palabra dada, excediendo las expectativas en cada interacción." },
        { title: "Integridad", description: "Operamos con total transparencia y ética, construyendo relaciones duraderas basadas en la confianza." },
        { title: "Profesionalismo", description: "Brindamos un asesoramiento experto y riguroso, respaldado por un conocimiento profundo del mercado." }
      ]
    }
  };

  return (
    <div className="animate-in fade-in duration-500 bg-white">

      {/* Hero Section - GRUPO RUZZI */}
      <div className="relative bg-navy text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold opacity-5 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>

        <div className="container mx-auto px-4 py-20 lg:py-28 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-8 tracking-tight">
              {aboutConfig.hero.title}
            </h1>
            <div className="w-24 h-1 bg-gold mx-auto mb-10"></div>

            <p className="text-lg md:text-xl text-gray-200 leading-relaxed font-light mb-8">
              {aboutConfig.hero.description1}
            </p>
            <p className="text-lg md:text-xl text-gray-200 leading-relaxed font-light">
              {aboutConfig.hero.description2}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20 space-y-24">

        {/* QUÉ HACEMOS Section */}
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="w-full md:w-1/2">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-gold/10 rounded-full -z-10"></div>
              <img
                src={aboutConfig.whatWeDo.image}
                alt="Desarrollo Ruzzi"
                className="rounded-lg shadow-xl w-full object-cover h-[400px]"
              />
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-navy/5 rounded-full -z-10"></div>
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px w-12 bg-gold"></div>
              <h2 className="text-3xl font-serif font-bold text-navy">{aboutConfig.whatWeDo.title}</h2>
            </div>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              {aboutConfig.whatWeDo.description1}
            </p>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              {aboutConfig.whatWeDo.description2}
            </p>
            <div className="p-6 bg-cream/50 rounded-lg border-l-4 border-gold">
              <p className="text-navy font-medium italic">
                "{aboutConfig.whatWeDo.quote}"
              </p>
            </div>
          </div>
        </div>

        {/* NUESTRO COMPROMISO Section (Replacing Vision) */}
        {/* NUESTRO COMPROMISO Section (Enhanced High-Contrast Design) */}
        <section className="relative py-16 overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-navy z-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl transform -translate-x-1/4 translate-y-1/4"></div>
          </div>

          <div className="relative z-10 max-w-6xl mx-auto px-8 md:px-12 flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-5/12">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-gold to-white rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="aspect-square bg-white/5 backdrop-blur-sm rounded-2xl relative overflow-hidden flex flex-col items-center justify-center p-8 border border-white/10 shadow-2xl">
                  <Shield className="w-32 h-32 text-gold mb-6 drop-shadow-[0_0_15px_rgba(212,175,55,0.3)] animate-pulse-slow" strokeWidth={1} />
                  <div className="h-px w-16 bg-gradient-to-r from-transparent via-gold to-transparent opacity-50"></div>
                </div>
              </div>
            </div>

            <div className="w-full md:w-7/12 text-center md:text-left">
              <span className="text-gold font-bold tracking-widest uppercase text-sm mb-2 block">{aboutConfig.commitment.subtitle}</span>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-8 leading-tight">
                {aboutConfig.commitment.title}
              </h2>

              <div className="space-y-6">
                <p className="text-xl text-gray-200 leading-relaxed font-light">
                  {aboutConfig.commitment.description}
                </p>

                <div className="flex items-start gap-4 pt-4">
                  <div className="w-1 h-12 bg-gold mt-1 rounded-full"></div>
                  <p className="text-lg text-white/90 italic leading-relaxed">
                    "{aboutConfig.commitment.quote}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <div className="text-center max-w-6xl mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl font-serif font-bold text-navy mb-4">{aboutConfig.values.title}</h2>
            <p className="text-gray-500">{aboutConfig.values.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {aboutConfig.values.items.map((value, index) => (
              <div key={index} className="group p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-gold/30 transition-all duration-300">
                <div className="w-16 h-16 bg-navy/5 rounded-2xl flex items-center justify-center mx-auto mb-6 text-navy group-hover:bg-navy group-hover:text-gold transition-colors duration-300">
                  {index === 0 ? <Shield size={32} strokeWidth={1.5} /> :
                    index === 1 ? <Briefcase size={32} strokeWidth={1.5} /> :
                      <BarChart3 size={32} strokeWidth={1.5} />}
                </div>
                <h3 className="font-serif font-bold text-xl text-navy mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
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