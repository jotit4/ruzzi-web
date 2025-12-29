
import React, { useState } from 'react';
import Button from '../components/Button';
import { MapPin, Phone, Mail, Clock, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';

const ContactPage = () => {
  const { createLead } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'Consulta General',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Create Lead in CRM
      await createLead({
        name: formData.name,
        email: formData.email,
        client_name: formData.name,
        client_email: formData.email,
        client_phone: formData.phone,
        property_id: '', // No property selected for contact form
        booking_date: new Date().toISOString(),
        notes: `${formData.type}: ${formData.message}`,
        created_by: 'web_contact',
        updated_by: 'web_contact'
      });

      // 2. Send Email Notification
      // We don't block the UI for email sending failure, but we log it
      const { error: emailError } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          type: formData.type,
          message: formData.message
        }
      });

      if (emailError) {
        console.error('Error sending email:', emailError);
        // Optional: Notify user or just fail silently regarding email, but lead is created.
      }

      alert('Gracias ' + formData.name + '. Tu consulta ha sido enviada y registrada.');
      setFormData({ name: '', email: '', phone: '', type: 'Consulta General', message: '' });
    } catch (error) {
      alert('Error al enviar el formulario. Por favor intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const inputClasses = "w-full px-4 py-3 bg-white text-black border border-gray-200 rounded-md focus:ring-1 focus:ring-gold focus:border-gold outline-none transition-all placeholder:text-gray-400";
  const labelClasses = "block text-sm font-medium text-navy mb-1.5";

  return (
    <div className="animate-in fade-in duration-500 min-h-[calc(100vh-80px)] bg-cream flex items-center justify-center py-12 md:py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="bg-white rounded-xl shadow-premium overflow-hidden flex flex-col lg:flex-row h-full min-h-[700px]">

          <div className="lg:w-1/2 p-10 lg:p-16 flex flex-col justify-center">
            <div className="mb-10">
              <h2 className="text-4xl font-serif font-bold text-navy mb-3">CONTACTO</h2>
              <div className="h-1 w-16 bg-gold mb-6"></div>
              <p className="text-gray-500">Estamos aquí para asesorarte en tu próxima inversión.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className={labelClasses}>Nombre Completo</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={inputClasses}
                />
              </div>

              <div>
                <label className={labelClasses}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={inputClasses}
                />
              </div>

              <div>
                <label className={labelClasses}>Teléfono</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={inputClasses}
                />
              </div>

              <div>
                <label className={labelClasses}>Tipo de Consulta</label>
                <div className="relative">
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className={`${inputClasses} appearance-none cursor-pointer`}
                  >
                    <option>Consulta General</option>
                    <option>Ventas</option>
                    <option>Alquileres</option>
                    <option>Inversiones</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                  </div>
                </div>
              </div>

              <div>
                <label className={labelClasses}>Mensaje</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className={`${inputClasses} resize-none`}
                />
              </div>

              <Button type="submit" fullWidth size="lg" disabled={isSubmitting} className="mt-4 shadow-lg">
                {isSubmitting ? 'Enviando...' : 'Enviar Consulta'}
              </Button>
            </form>
          </div>

          <div className="lg:w-1/2 bg-gray-100 relative min-h-[400px] lg:min-h-full">
            <div className="absolute inset-0 z-0">
              <img src="/contact-office.png" alt="Oficina Ruzzi" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-cream/20 mix-blend-overlay"></div>
            </div>

            <div className="absolute inset-0 p-10 flex flex-col justify-end pointer-events-none">
              <div className="bg-white/95 backdrop-blur-sm p-8 rounded-lg shadow-2xl pointer-events-auto max-w-sm ml-auto mr-auto lg:mr-0 border border-white">
                <h3 className="font-serif font-bold text-xl text-navy mb-6 border-b border-gray-100 pb-4">
                  Información de Contacto
                </h3>

                <ul className="space-y-5">
                  <li className="flex items-start gap-4">
                    <div className="mt-1 text-gold shrink-0">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-navy text-sm">Dirección Comercial</p>
                      <p className="text-gray-500 text-sm leading-relaxed">Docta manzana 81 lote 05 etapa 4,<br />Córdoba, Argentina</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="mt-1 text-gold shrink-0">
                      <Phone size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-navy text-sm">Teléfono Directo</p>
                      <a href="tel:+5493518178057" className="text-gray-500 text-sm hover:text-gold transition-colors">+54 9 3518 17-8057</a>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="mt-1 text-gold shrink-0">
                      <Mail size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-navy text-sm">Correo Electrónico</p>
                      <a href="mailto:Ruzziventas@gmail.com" className="text-gray-500 text-sm hover:text-gold transition-colors">Ruzziventas@gmail.com</a>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="mt-1 text-gold shrink-0">
                      <Clock size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-navy text-sm">Horarios de Atención</p>
                      <p className="text-gray-500 text-sm">Lunes a Viernes: 9:00 - 18:00</p>
                    </div>
                  </li>
                </ul>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <a href="#" className="flex items-center justify-center gap-2 text-navy hover:text-gold font-medium text-sm transition-colors">
                    <Lock size={14} /> Política de Privacidad
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
