import React from 'react';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

const PrivacyPage = () => {
    return (
        <div className="animate-in fade-in duration-500 bg-white">
            {/* Header */}
            <div className="bg-navy py-16 text-center text-white">
                <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">Política de Privacidad</h1>
                <p className="text-gold uppercase tracking-widest text-sm">Tu confianza es nuestro mayor activo</p>
            </div>

            <div className="container mx-auto px-4 py-16 max-w-4xl text-gray-700 leading-relaxed space-y-12">

                {/* Intro */}
                <div className="bg-cream/30 p-8 rounded-xl border border-gold/20">
                    <p className="text-lg mb-4">
                        En <strong>Ruzzi Desarrollos</strong>, nos comprometemos a proteger la privacidad y la seguridad de los datos personales de nuestros clientes, inversores y visitantes del sitio web.
                    </p>
                    <p>
                        Esta Política de Privacidad describe cómo recopilamos, utilizamos y salvaguardamos su información cuando visita nuestro sitio web o utiliza nuestros servicios inmobiliarios. Al acceder a nuestros servicios, usted acepta las prácticas descritas en esta política.
                    </p>
                </div>

                {/* Sections */}
                <div className="space-y-8">

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Eye className="text-gold" size={24} />
                            <h2 className="text-2xl font-serif font-bold text-navy">1. Información que Recopilamos</h2>
                        </div>
                        <p className="mb-4">Podemos recopilar información personal que usted nos proporciona voluntariamente, incluyendo pero no limitado a:</p>
                        <ul className="list-disc pl-6 space-y-2 marker:text-gold">
                            <li><strong>Datos de Identificación:</strong> Nombre completo, número de documento, dirección postal.</li>
                            <li><strong>Datos de Contacto:</strong> Dirección de correo electrónico, número de teléfono.</li>
                            <li><strong>Intereses Inmobiliarios:</strong> Preferencias de búsqueda, presupuesto, tipo de propiedad deseada.</li>
                            <li><strong>Información Técnica:</strong> Datos sobre su dispositivo, dirección IP y comportamiento de navegación en nuestro sitio.</li>
                        </ul>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <FileText className="text-gold" size={24} />
                            <h2 className="text-2xl font-serif font-bold text-navy">2. Uso de la Información</h2>
                        </div>
                        <p className="mb-4">Utilizamos su información personal para los siguientes fines legítimos:</p>
                        <ul className="list-disc pl-6 space-y-2 marker:text-gold">
                            <li>Facilitar la compra, venta o alquiler de propiedades.</li>
                            <li>Responder a sus consultas y proporcionar asesoramiento inmobiliario personalizado.</li>
                            <li>Enviarle información relevante sobre nuevas oportunidades de inversión o desarrollos (siempre que haya dado su consentimiento).</li>
                            <li>Mejorar la funcionalidad y experiencia de usuario en nuestro sitio web.</li>
                            <li>Cumplir con obligaciones legales y regulatorias vigentes en la República Argentina.</li>
                        </ul>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Lock className="text-gold" size={24} />
                            <h2 className="text-2xl font-serif font-bold text-navy">3. Protección de Datos</h2>
                        </div>
                        <p>
                            Implementamos medidas de seguridad técnicas y organizativas adecuadas para proteger sus datos personales contra el acceso no autorizado, la alteración, divulgación o destrucción. Nuestro equipo está capacitado en el manejo confidencial de la información sensible.
                        </p>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Shield className="text-gold" size={24} />
                            <h2 className="text-2xl font-serif font-bold text-navy">4. Sus Derechos</h2>
                        </div>
                        <p className="mb-4">
                            Como titular de los datos, usted tiene derecho a:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 marker:text-gold">
                            <li>Acceder a sus datos personales que poseemos.</li>
                            <li>Solicitar la rectificación de datos incorrectos o desactualizados.</li>
                            <li>Solicitar la supresión de sus datos cuando ya no sean necesarios para los fines que fueron recogidos.</li>
                            <li>Oponerse al tratamiento de sus datos para fines de marketing directo.</li>
                        </ul>
                        <p className="mt-4 text-sm bg-gray-50 p-4 rounded-lg">
                            Para ejercer cualquiera de estos derechos, por favor contáctenos a través de <strong>Ruzziventas@gmail.com</strong>.
                        </p>
                    </section>

                    <section className="border-t border-gray-200 pt-8">
                        <h2 className="text-xl font-serif font-bold text-navy mb-4">Cambios en esta Política</h2>
                        <p>
                            Nos reservamos el derecho de actualizar esta Política de Privacidad en cualquier momento. Cualquier cambio significativo será notificado a través de nuestro sitio web. Le recomendamos revisar esta página periódicamente.
                        </p>
                        <p className="mt-4 text-sm text-gray-500">Última actualización: Diciembre 2025</p>
                    </section>

                </div>
            </div>
        </div>
    );
};

export default PrivacyPage;
