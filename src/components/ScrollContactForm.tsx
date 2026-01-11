import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Button from './Button';
import { X, Send, Phone } from 'lucide-react';
import { toast } from 'sonner';

interface ScrollContactFormProps {
    propertyId?: string;
    propertyTitle?: string;
}

const ScrollContactForm: React.FC<ScrollContactFormProps> = ({ propertyId, propertyTitle }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true); // Start expanded when it appears? Or collapsed? Better expanded to catch attention.
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const { createLead } = useApp();

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Show after scrolling down 600px
            if (!hasSubmitted && window.scrollY > 600) {
                setIsVisible(true);
            } else if (window.scrollY < 300) {
                // Optionally hide if scrolled back to top
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [hasSubmitted]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await createLead({
                client_name: formData.name || 'Cliente Web',
                client_email: '', // Optional in this mini form
                client_phone: formData.phone,
                property_id: propertyId,
                booking_date: new Date().toISOString(),
                notes: `Consulta rápida desde PropertyDetail: ${propertyTitle}`,
                created_by: 'web_scroll_form',
                updated_by: 'web_scroll_form'
            });

            toast.success('¡Gracias! Te contactaremos a la brevedad.');
            setHasSubmitted(true);
            setIsVisible(false); // Hide after success
        } catch (error) {
            console.error(error);
            toast.error('Error al enviar. Intenta por WhatsApp.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isVisible) return null;

    return (
        <div className={`fixed bottom-0 right-0 z-40 transition-transform duration-500 ease-in-out ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
            {/* Desktop / Tablet View - Floating Card */}
            <div className="hidden md:block mr-24 mb-6"> {/* mr-24 to avoid overlap with WhatsApp button */}
                <div className={`bg-white shadow-2xl rounded-xl border border-gold/20 overflow-hidden w-80 transition-all duration-300 ${isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none h-0'}`}>
                    <div className="bg-navy p-4 flex justify-between items-center">
                        <h3 className="text-white font-serif font-bold text-sm">¿Te interesa esta propiedad?</h3>
                        <button onClick={() => setIsExpanded(false)} className="text-white/70 hover:text-white">
                            <X size={16} />
                        </button>
                    </div>
                    <div className="p-5">
                        <p className="text-xs text-gray-500 mb-4">Déjanos tus datos para coordinar una visita privada.</p>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <input
                                type="text"
                                placeholder="Tu Nombre"
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm focus:border-gold outline-none"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                            <input
                                type="tel"
                                placeholder="Tu Teléfono / WhatsApp"
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm focus:border-gold outline-none"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                required
                            />
                            <Button
                                type="submit"
                                fullWidth
                                size="sm"
                                disabled={isSubmitting}
                                className="text-xs py-2 shadow-md"
                            >
                                {isSubmitting ? 'Enviando...' : 'SOLICITAR INFO'}
                            </Button>
                        </form>
                    </div>
                </div>
                {/* Minimized Trigger if needed? For now just hide if closed */}
                {!isExpanded && (
                    <button
                        onClick={() => setIsExpanded(true)}
                        className="absolute bottom-6 right-0 bg-navy text-white px-4 py-2 rounded-lg shadow-lg font-bold text-sm tracking-wide flex items-center gap-2 animate-bounce-subtle"
                    >
                        <Phone size={14} className="text-gold" /> CONSULTAR
                    </button>
                )}
            </div>

            {/* Mobile View - Bottom Sheetish */}
            <div className="md:hidden w-full bg-white border-t border-gold/30 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] p-4 pb- safe-area-bottom">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-serif font-bold text-navy text-sm">¿Te interesa? Te contactamos ahora.</h3>
                    <button onClick={() => setIsVisible(false)} className="text-gray-400 p-1"><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="tel"
                        placeholder="Tu Celular..."
                        className="flex-grow px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm focus:border-gold outline-none"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                    />
                    <Button
                        type="submit"
                        size="sm"
                        disabled={isSubmitting}
                        className="whitespace-nowrap px-4 py-2"
                    >
                        <Send size={14} />
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default ScrollContactForm;
