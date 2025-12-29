import React, { useState, useEffect } from 'react';
import { Send, Bot, User, ArrowRight, Sparkles, Building2, TrendingUp, ShieldCheck } from 'lucide-react';
import Button from '../components/Button';
import { useApp } from '../context/AppContext';
import { Property } from '../types';

const RuzziAIPage = () => {
  const { properties, createLead } = useApp();
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '¡Hola! Soy Ruzzi AI, tu asesor inmobiliario inteligente. Estoy aquí para realizar una entrevista consultiva y ayudarte a encontrar la inversión o el hogar perfecto en Córdoba. ¿Qué buscas principalmente hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const generateAIResponse = (userMessage: string, properties: Property[]) => {
    const safeProperties = Array.isArray(properties) ? properties : [];
    const msg = userMessage.toLowerCase();

    // Análisis inteligente basado en el mensaje del usuario
    if (msg.includes('casa') || msg.includes('vivienda') || msg.includes('vivir')) {
      const availableHouses = safeProperties.filter(p => p.type === 'house' && p.status === 'available');
      if (availableHouses.length > 0) {
        return `Tengo ${availableHouses.length} casas disponibles para vivir. Te recomiendo revisar la "${availableHouses[0].title}" por $${availableHouses[0].price.toLocaleString()} en ${availableHouses[0].location}. ¿Te interesa programar una visita?`;
      }
      return "Te ayudo a encontrar la casa perfecta para tu familia. ¿Tienes algún presupuesto específico o zona preferida en Docta?";
    }

    if (msg.includes('invertir') || msg.includes('inversión') || msg.includes('renta')) {
      const investmentProperties = safeProperties.filter(p => p.status === 'available');
      if (investmentProperties.length > 0) {
        return `Para inversiones, tengo ${investmentProperties.length} propiedades con excelente potencial. La "${investmentProperties[0].title}" por $${investmentProperties[0].price.toLocaleString()} está en zona de alta revalorización. ¿Cuál es tu perfil de riesgo?`;
      }
      return "Como asesor de inversiones, analizo el ROI de cada propiedad. ¿Prefieres lotes, departamentos o casas para tu portafolio?";
    }

    if (msg.includes('departamento') || msg.includes('apto')) {
      const apartments = safeProperties.filter(p => p.type === 'apartment' && p.status === 'available');
      if (apartments.length > 0) {
        return `Tengo ${apartments.length} departamentos disponibles. El "${apartments[0].title}" ofrece ${apartments[0].bedrooms} dormitorios y ${apartments[0].bathrooms} baños por $${apartments[0].price.toLocaleString()}. ¿Buscas para inversión o vivienda propia?`;
      }
      return "Los departamentos en Docta tienen alta demanda por su ubicación estratégica. ¿Tienes preferencias de cantidad de dormitorios?";
    }

    if (msg.includes('precio') || msg.includes('presupuesto') || msg.includes('costo')) {
      if (safeProperties.length > 0) {
        const minPrice = Math.min(...safeProperties.map(p => p.price));
        const maxPrice = Math.max(...safeProperties.map(p => p.price));
        return `Nuestro rango de precios va desde $${minPrice.toLocaleString()} hasta $${maxPrice.toLocaleString()}. Tengo opciones para diferentes presupuestos. ¿Cuál es tu rango ideal?`;
      }
      return "Tengo opciones en diferentes rangos de precio. ¿Buscas algo hasta $500k, $1M, o más?";
    }

    if (msg.includes('ubicación') || msg.includes('zona') || msg.includes('donde')) {
      const locations = [...new Set(safeProperties.map(p => p.location))];
      return `Trabajamos en ubicaciones premium como ${locations.slice(0, 3).join(', ')}. ¿Tienes alguna zona específica en mente?`;
    }

    if (msg.includes('visita') || msg.includes('conocer') || msg.includes('ver')) {
      return "Perfecto, puedo agendar una visita personalizada. ¿Tienes disponibilidad esta semana? También puedo enviarte un dossier detallado de las propiedades de tu interés.";
    }

    // Respuesta genérica inteligente
    return "Entiendo tu consulta. Como especialista en Docta Urbanización, tengo acceso a nuestro catálogo completo. ¿Buscas algo específico o prefieres que te muestre nuestras mejores opciones actuales?";
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsTyping(true);

    // Simular procesamiento de IA
    setTimeout(() => {
      const aiResponse = generateAIResponse(userMsg, properties);
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickAction = (action: string) => {
    setInput(action);
    setTimeout(() => {
      const event = new Event('submit', { bubbles: true, cancelable: true });
      const form = document.querySelector('form');
      if (form) form.dispatchEvent(event);
    }, 100);
  };

  const handleCreateLeadFromChat = async () => {
    // Crear lead a partir de la conversación
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'user') {
      await createLead({
        name: 'Usuario RUZZI AI',
        email: 'usuario@ruzzi-ai.com',
        client_name: 'Usuario RUZZI AI',
        client_email: 'usuario@ruzzi-ai.com',
        client_phone: '+54 351 000-0000',
        property_id: '', // No specific property
        booking_date: new Date().toISOString(),
        notes: `Consulta generada en RUZZI AI: ${lastMessage.content}`,
        created_by: null,
        updated_by: null
      });
      alert('¡Excelente! Tu consulta ha sido registrada. Un asesor humano te contactará pronto.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-cream flex flex-col">
      {/* Header AI */}
      <div className="bg-navy py-12 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-gold rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="inline-flex items-center gap-2 bg-gold/20 text-gold px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles size={14} /> Nueva Tecnología
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">RUZZI AI</h1>
          <p className="text-gray-400 max-w-xl mx-auto">Tu asesor digital 24/7 para decisiones inteligentes en Real Estate.</p>
        </div>
      </div>

      <div className="flex-grow container mx-auto px-4 py-10 max-w-5xl flex flex-col lg:flex-row gap-10">

        {/* Chat Area */}
        <div className="flex-grow bg-white rounded-2xl shadow-premium border border-gray-100 flex flex-col h-[600px] overflow-hidden">
          <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gold text-white rounded-full flex items-center justify-center">
                <Bot size={18} />
              </div>
              <span className="font-bold text-navy text-sm">Asesor Inteligente</span>
            </div>
            <span className="text-[10px] font-bold text-green-500 uppercase flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> Online
            </span>
          </div>

          <div className="flex-grow overflow-y-auto p-6 space-y-6">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl flex gap-3 ${msg.role === 'user' ? 'bg-navy text-white rounded-tr-none' : 'bg-gray-50 text-navy rounded-tl-none border border-gray-100'}`}>
                  {msg.role === 'assistant' && <Bot className="shrink-0 text-gold" size={20} />}
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  {msg.role === 'user' && <User className="shrink-0 text-gold/50" size={20} />}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-none p-4 flex gap-3">
                  <Bot className="shrink-0 text-gold" size={20} />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="p-4 border-t border-gray-100 bg-white">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu consulta aquí..."
                className="w-full pl-6 pr-14 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-gold transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-gold text-white rounded-lg flex items-center justify-center hover:bg-gold-dark transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>

        {/* Info Sidebar */}
        <div className="lg:w-80 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-serif font-bold text-navy mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-gold" /> Capacidades AI
            </h3>
            <ul className="space-y-4 text-xs font-medium text-gray-500">
              <li className="flex gap-2">
                <CheckCircle className="text-green-500 shrink-0" size={14} /> Clasificación de Perfil de Inversión
              </li>
              <li className="flex gap-2">
                <CheckCircle className="text-green-500 shrink-0" size={14} /> Recomendaciones de Stock Real
              </li>
              <li className="flex gap-2">
                <CheckCircle className="text-green-500 shrink-0" size={14} /> Proyección de ROI estimada
              </li>
            </ul>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-serif font-bold text-navy mb-4 flex items-center gap-2">
              <Building2 size={20} className="text-gold" /> Consultas Rápidas
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => handleQuickAction('Busco una casa para vivir con mi familia')}
                className="w-full text-left p-3 text-xs bg-gray-50 hover:bg-gold/10 rounded-lg transition-colors border border-gray-100 hover:border-gold/30"
              >
                🏠 Casas para vivir
              </button>
              <button
                onClick={() => handleQuickAction('Quiero invertir en propiedades')}
                className="w-full text-left p-3 text-xs bg-gray-50 hover:bg-gold/10 rounded-lg transition-colors border border-gray-100 hover:border-gold/30"
              >
                📈 Oportunidades de inversión
              </button>
              <button
                onClick={() => handleQuickAction('Necesito departamentos')}
                className="w-full text-left p-3 text-xs bg-gray-50 hover:bg-gold/10 rounded-lg transition-colors border border-gray-100 hover:border-gold/30"
              >
                🏢 Departamentos disponibles
              </button>
              <button
                onClick={() => handleQuickAction('¿Cuál es el rango de precios?')}
                className="w-full text-left p-3 text-xs bg-gray-50 hover:bg-gold/10 rounded-lg transition-colors border border-gray-100 hover:border-gold/30"
              >
                💰 Consulta de precios
              </button>
            </div>
          </div>

          <div className="bg-navy text-white p-6 rounded-2xl shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-20 transform group-hover:scale-125 transition-transform">
              <ShieldCheck size={40} />
            </div>
            <h4 className="font-serif font-bold text-lg mb-2">Seguridad Ruzzi</h4>
            <p className="text-xs text-gray-400 leading-relaxed">Toda tu información está protegida bajo estándares de privacidad corporativos.</p>
          </div>

          <Button
            variant="outline"
            fullWidth
            className="border-gray-300"
            onClick={handleCreateLeadFromChat}
          >
            📞 Contactar Humano
          </Button>

          <Button
            variant="primary"
            fullWidth
            className="bg-gold hover:bg-gold-dark"
            onClick={() => handleQuickAction('Quiero programar una visita')}
          >
            🏠 Agendar Visita
          </Button>
        </div>
      </div>
    </div>
  );
};

const CheckCircle = ({ className, size }: { className: string, size: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);

export default RuzziAIPage;
