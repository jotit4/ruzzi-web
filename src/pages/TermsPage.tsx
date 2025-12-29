import React from 'react';
import { Gavel, Scale, AlertCircle, CheckCircle2 } from 'lucide-react';

const TermsPage = () => {
    return (
        <div className="animate-in fade-in duration-500 bg-white">
            {/* Header */}
            <div className="bg-navy py-16 text-center text-white">
                <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">Términos y Condiciones</h1>
                <p className="text-gold uppercase tracking-widest text-sm">Normas de uso de nuestros servicios</p>
            </div>

            <div className="container mx-auto px-4 py-16 max-w-4xl text-gray-700 leading-relaxed space-y-12">

                <div className="bg-cream/30 p-8 rounded-xl border border-gold/20">
                    <p>
                        Bienvenido al sitio web de <strong>Ruzzi Desarrollos</strong>. Al acceder y utilizar este sitio, usted acepta cumplir y estar sujeto a los siguientes Términos y Condiciones. Si no está de acuerdo con alguna parte de estos términos, le rogamos no utilizar nuestros servicios.
                    </p>
                </div>

                <div className="space-y-10">

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Scale className="text-gold" size={24} />
                            <h2 className="text-2xl font-serif font-bold text-navy">1. Uso del Sitio Web</h2>
                        </div>
                        <p className="mb-4">El contenido de este sitio web es para su información general y uso personal. Está sujeto a cambios sin previo aviso.</p>
                        <ul className="list-disc pl-6 space-y-2 marker:text-gold">
                            <li>No está permitido el uso de este sitio de manera que cause, o pueda causar, daño al sitio o menoscabo de la disponibilidad o accesibilidad del mismo.</li>
                            <li>Está prohibido el uso de este sitio para cualquier fin ilícito, ilegal, fraudulento o dañino.</li>
                        </ul>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <AlertCircle className="text-gold" size={24} />
                            <h2 className="text-2xl font-serif font-bold text-navy">2. Propiedad Intelectual</h2>
                        </div>
                        <p>
                            Todo el contenido de este sitio web, incluyendo pero no limitado a textos, gráficos, logotipos, imágenes y software, es propiedad de <strong>Ruzzi Desarrollos</strong> o de sus proveedores de contenido y está protegido por las leyes de propiedad intelectual de Argentina y tratados internacionales.
                        </p>
                        <p className="mt-2">
                            Se prohíbe estrictamente la reproducción, distribución o transmisión de cualquier contenido sin nuestro consentimiento previo por escrito.
                        </p>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <CheckCircle2 className="text-gold" size={24} />
                            <h2 className="text-2xl font-serif font-bold text-navy">3. Información de Propiedades</h2>
                        </div>
                        <p>
                            Hacemos todo lo posible para asegurar que la información de las propiedades listadas sea precisa y actual. Sin embargo:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 marker:text-gold mt-2">
                            <li>Los precios, disponibilidad y descripciones están sujetos a cambios sin previo aviso.</li>
                            <li>Las imágenes son ilustrativas y pueden no reflejar exactamente el estado actual de la propiedad.</li>
                            <li>Recomendamos verificar todos los detalles directamente con nuestros asesores antes de tomar cualquier decisión de inversión o compromiso.</li>
                        </ul>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Gavel className="text-gold" size={24} />
                            <h2 className="text-2xl font-serif font-bold text-navy">4. Limitación de Responsabilidad</h2>
                        </div>
                        <p>
                            Ruzzi Desarrollos no será responsable por ningún daño directo, indirecto, incidental, especial o consecuente que resulte del uso o la imposibilidad de uso de este sitio web o de la información contenida en él.
                        </p>
                    </section>

                    <section className="border-t border-gray-200 pt-8">
                        <h2 className="text-xl font-serif font-bold text-navy mb-4">Jurisdicción</h2>
                        <p>
                            Estos términos se regirán e interpretarán de acuerdo con las leyes de la República Argentina. Cualquier disputa relacionada con estos términos estará sujeta a la jurisdicción exclusiva de los tribunales ordinarios de la ciudad de Córdoba.
                        </p>
                    </section>

                </div>
            </div>
        </div>
    );
};

export default TermsPage;
