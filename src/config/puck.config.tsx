
import React from 'react';
import type { Config } from "@measured/puck";
import PropertyCard from '../components/PropertyCard';
import Button from '../components/Button';
import { Search, Layout, Image as ImageIcon, Type, Grid } from 'lucide-react';

// Tipos para los componentes de Puck
export type PuckConfigProps = {
    Hero: {
        title: string;
        highlight: string;
        subtitle: string;
        bgImage: string;
        showSearch: boolean;
        overlayOpacity: number;
    };
    FeaturedProperties: {
        title: string;
        tag: string;
        subtitle: string;
        count: number;
    };
    TextSection: {
        title: string;
        content: string;
        align: 'left' | 'center';
        padding: 'small' | 'medium' | 'large';
    };
};

export const config: Config<PuckConfigProps> = {
    categories: {
        layout: {
            components: ["Hero", "FeaturedProperties"]
        },
        content: {
            components: ["TextSection"]
        }
    },
    components: {
        Hero: {
            label: "Cabecera Principal (Hero)",
            fields: {
                title: { type: "text", label: "Título Principal" },
                highlight: { type: "text", label: "Texto Resaltado (Gold)" },
                subtitle: { type: "textarea", label: "Subtítulo" },
                bgImage: { type: "text", label: "URL de Imagen de Fondo" },
                showSearch: {
                    type: "radio",
                    label: "Mostrar Buscador",
                    options: [{ label: "Sí", value: true }, { label: "No", value: false }]
                },
                overlayOpacity: {
                    type: "number",
                    label: "Opacidad del Fondo (0-1)",
                    min: 0,
                    max: 1,
                    step: 0.1
                }
            },
            defaultProps: {
                title: "Encuentra tu hogar perfecto",
                highlight: "con grupo Ruzzi",
                subtitle: "Desarrollos inmobiliarios premium en la urbanización más inteligente y segura de Córdoba.",
                bgImage: "https://images.unsplash.com/photo-1600607686527-6fb886090705?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
                showSearch: true,
                overlayOpacity: 0.5,
            },
            render: ({ title, highlight, subtitle, bgImage, showSearch, overlayOpacity }) => (
                <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <img src={bgImage} alt="Hero Background" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity }}></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1B2B3A]/90 via-transparent to-[#1B2B3A]/30"></div>
                    </div>
                    <div className="container mx-auto px-6 z-10 relative flex flex-col items-center text-center">
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 leading-tight drop-shadow-lg">
                            {title} <br />
                            <span className="italic text-[#FBC701]">{highlight}</span>
                        </h1>
                        <p className="text-lg md:text-xl text-white font-medium mb-12 max-w-2xl tracking-wide">
                            {subtitle}
                        </p>
                        {showSearch && (
                            <div className="w-full max-w-4xl bg-white/95 backdrop-blur-md p-4 rounded-xl border border-white/20 shadow-2xl">
                                <div className="flex flex-col md:flex-row gap-3">
                                    <div className="flex-grow relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Search className="text-[#FBC701] h-5 w-5" />
                                        </div>
                                        <input type="text" placeholder="Buscar por ubicación, tipo o precio..." className="w-full pl-12 pr-4 py-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FBC701] bg-white text-black placeholder:text-gray-400 shadow-inner" readOnly />
                                    </div>
                                    <button className="md:w-auto w-full py-4 px-8 text-lg bg-[#FBC701] text-[#1B2B3A] font-bold rounded-lg shadow-lg hover:bg-[#D4A800] transition-all">BUSCAR PROPIEDADES</button>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            ),
        },
        FeaturedProperties: {
            label: "Grilla de Propiedades",
            fields: {
                tag: { type: "text", label: "Etiqueta Superior" },
                title: { type: "text", label: "Título" },
                subtitle: { type: "text", label: "Subtítulo" },
                count: { type: "number", label: "Cantidad a mostrar", min: 1, max: 9 },
            },
            defaultProps: {
                tag: "Exclusividad",
                title: "Propiedades Destacadas",
                subtitle: "Una selección curada de nuestras residencias más exclusivas.",
                count: 3,
            },
            render: ({ tag, title, subtitle, count }) => {
                return (
                    <section className="py-24 bg-[#F5F2EE] relative">
                        <div className="container mx-auto px-6">
                            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                                <div className="max-w-xl">
                                    <span className="text-[#FBC701] font-bold tracking-widest uppercase text-sm mb-2 block">{tag}</span>
                                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#1B2B3A] mb-4">{title}</h2>
                                    <div className="h-1 w-24 bg-[#FBC701] mb-4"></div>
                                    <p className="text-gray-500 font-light text-lg">{subtitle}</p>
                                </div>
                                <button className="hidden md:inline-flex border-2 border-[#1B2B3A] text-[#1B2B3A] px-6 py-2 font-bold rounded-lg hover:bg-[#1B2B3A] hover:text-white transition-all">Ver Catálogo Completo</button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                {[...Array(Math.min(count, 3))].map((_, i) => (
                                    <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 flex flex-col">
                                        <div className="h-64 bg-gray-200 animate-pulse relative">
                                            <div className="absolute top-4 left-4 bg-[#FBC701] text-[#1B2B3A] text-[10px] font-bold px-2 py-1 rounded">DESTAQUE</div>
                                        </div>
                                        <div className="p-6">
                                            <div className="w-1/2 h-4 bg-gray-200 mb-2 rounded"></div>
                                            <div className="w-3/4 h-6 bg-gray-300 mb-4 rounded"></div>
                                            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                                <div className="w-1/3 h-5 bg-[#FBC701]/20 rounded"></div>
                                                <div className="w-1/4 h-4 bg-gray-100 rounded"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {count > 3 && (
                                <p className="text-center mt-10 text-gray-400 italic text-sm">(+ {count - 3} propiedades adicionales se cargarán en la web)</p>
                            )}
                        </div>
                    </section>
                );
            },
        },
        TextSection: {
            label: "Sección de Texto",
            fields: {
                title: { type: "text", label: "Título" },
                content: { type: "textarea", label: "Contenido" },
                align: {
                    type: "radio",
                    label: "Alineación",
                    options: [{ label: "Izquierda", value: "left" }, { label: "Centro", value: "center" }]
                },
                padding: {
                    type: "select",
                    label: "Espaciado (Padding)",
                    options: [
                        { label: "Pequeño", value: "small" },
                        { label: "Mediano", value: "medium" },
                        { label: "Grande", value: "large" }
                    ]
                }
            },
            defaultProps: {
                title: "Nuestra Filosofía",
                content: "En Grupo Ruzzi, no solo vendemos propiedades; construimos el futuro de la vida inteligente en Córdoba.",
                align: "center",
                padding: "medium",
            },
            render: ({ title, content, align, padding }) => {
                const py = padding === 'small' ? 'py-12' : padding === 'large' ? 'py-32' : 'py-20';
                return (
                    <section className={`${py} bg-white border-b border-gray-50`}>
                        <div className={`container mx-auto px-6 ${align === 'center' ? 'text-center' : 'text-left'}`}>
                            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#1B2B3A] mb-6">{title}</h2>
                            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed whitespace-pre-line">{content}</p>
                        </div>
                    </section>
                );
            }
        }
    },
};
