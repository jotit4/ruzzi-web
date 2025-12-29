
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Instagram, Facebook, Linkedin, Phone, Mail, MapPin, Home, Search, Heart, MessageSquare, Lock } from 'lucide-react';
import { NAV_LINKS } from '../constants';
import Logo from './Logo';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Redirigir a la página de propiedades con el query de búsqueda
      window.location.href = `/propiedades?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      {/* Top Bar */}
      <div className="bg-navy text-white">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-12 text-sm">
            <div className="flex items-center space-x-6">
              <a href="tel:+5493518178057" className="flex items-center gap-2 hover:text-gold transition-colors" title="Llamar">
                <Phone size={16} />
              </a>
              <a href="mailto:Ruzziventas@gmail.com" className="flex items-center gap-2 hover:text-gold transition-colors" title="Enviar Correo">
                <Mail size={16} />
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="hover:text-gold transition-colors flex items-center gap-1">
                <Lock size={14} />
                <span>Acceso Staff</span>
              </Link>
              <span>|</span>
              <div className="flex gap-3">
                <a href="#" className="hover:text-gold transition-colors">
                  <Instagram size={16} />
                </a>
                <a href="#" className="hover:text-gold transition-colors">
                  <Facebook size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <Logo className="h-14 w-auto text-navy" />
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                placeholder="Buscar propiedades, ubicaciones, proyectos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 px-6 pr-16 border-2 border-gray-300 rounded-full focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 text-gray-700 placeholder-gray-500"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gold hover:bg-gold/90 text-white p-3 rounded-full transition-colors"
              >
                <Search size={20} />
              </button>
            </form>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link
              to="/propiedades"
              className={`text-sm font-medium transition-colors ${location.pathname === '/propiedades' ? 'text-gold' : 'text-navy hover:text-gold'
                }`}
            >
              Propiedades
            </Link>
            <Link
              to="/nosotros"
              className={`text-sm font-medium transition-colors ${location.pathname === '/nosotros' ? 'text-gold' : 'text-navy hover:text-gold'
                }`}
            >
              Nosotros
            </Link>
            <Link
              to="/contacto"
              className={`text-sm font-medium transition-colors ${location.pathname === '/contacto' ? 'text-gold' : 'text-navy hover:text-gold'
                }`}
            >
              Contacto
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-navy hover:text-gold transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Search Bar - Mobile */}
        <div className="lg:hidden pb-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Buscar propiedades..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 px-4 pr-12 border border-gray-300 rounded-full focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 text-gray-700 placeholder-gray-500 text-sm"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gold hover:bg-gold/90 text-white p-2 rounded-full transition-colors"
            >
              <Search size={16} />
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 animate-in slide-in-from-top-2 absolute w-full shadow-xl">
          <div className="px-6 py-6 space-y-4">
            <Link
              to="/"
              className={`block py-3 text-lg font-medium border-b border-gray-100 ${location.pathname === '/' ? 'text-gold' : 'text-navy'
                }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Inicio
            </Link>
            <Link
              to="/propiedades"
              className={`block py-3 text-lg font-medium border-b border-gray-100 ${location.pathname === '/propiedades' ? 'text-gold' : 'text-navy'
                }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Propiedades
            </Link>
            <Link
              to="/nosotros"
              className={`block py-3 text-lg font-medium border-b border-gray-100 ${location.pathname === '/nosotros' ? 'text-gold' : 'text-navy'
                }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Nosotros
            </Link>
            <Link
              to="/contacto"
              className={`block py-3 text-lg font-medium border-b border-gray-100 ${location.pathname === '/contacto' ? 'text-gold' : 'text-navy'
                }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Contacto
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

const Footer = () => {
  return (
    <footer className="bg-navy text-white pt-20 pb-10 border-t-2 border-gold">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div className="mb-6">
              <Logo className="h-14 w-auto" />
            </div>
            <p className="text-white text-sm leading-relaxed font-light">
              Transformamos visiones en realidades habitables. Líderes en desarrollo inmobiliario premium y urbanización inteligente en Córdoba.
            </p>
          </div>

          <div>
            <h4 className="text-xl font-serif font-semibold mb-8 text-gold">Navegación</h4>
            <ul className="space-y-4 text-sm text-white">
              <li><Link to="/" className="hover:text-gold transition-colors flex items-center gap-2"><span className="w-1 h-1 bg-gold rounded-full"></span>Inicio</Link></li>
              <li><Link to="/propiedades" className="hover:text-gold transition-colors flex items-center gap-2"><span className="w-1 h-1 bg-gold rounded-full"></span>Propiedades</Link></li>
              <li><Link to="/nosotros" className="hover:text-gold transition-colors flex items-center gap-2"><span className="w-1 h-1 bg-gold rounded-full"></span>Nosotros</Link></li>
              <li><Link to="/contacto" className="hover:text-gold transition-colors flex items-center gap-2"><span className="w-1 h-1 bg-gold rounded-full"></span>Contacto</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-serif font-semibold mb-8 text-gold">Contacto</h4>
            <ul className="space-y-5 text-sm text-white">
              <li className="flex items-start gap-4 group">
                <div className="p-2 bg-white/5 rounded-full group-hover:bg-gold group-hover:text-navy transition-all">
                  <MapPin size={16} />
                </div>
                <span className="leading-relaxed">Docta manzana 81 lote 05 etapa 4,<br />Córdoba, Argentina</span>
              </li>
              <li className="flex items-center gap-4 group">
                <a href="tel:+5493518178057" className="p-2 bg-white/5 rounded-full group-hover:bg-gold group-hover:text-navy transition-all flex items-center gap-3">
                  <Phone size={16} />
                  <span className="group-hover:text-navy transition-colors">Llamar ahora</span>
                </a>
              </li>
              <li className="flex items-center gap-4 group">
                <a href="mailto:Ruzziventas@gmail.com" className="p-2 bg-white/5 rounded-full group-hover:bg-gold group-hover:text-navy transition-all flex items-center gap-3">
                  <Mail size={16} />
                  <span className="group-hover:text-navy transition-colors">Enviar correo</span>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-serif font-semibold mb-8 text-gold">Síguenos</h4>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center hover:bg-gold hover:border-gold hover:text-white transition-all duration-300">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center hover:bg-gold hover:border-gold hover:text-white transition-all duration-300">
                <Facebook size={18} />
              </a>

            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 font-medium uppercase tracking-wider">
          <p>© 2025 RUZZI Desarrollos. Todos los derechos reservados.</p>
          <div className="flex gap-8 mt-4 md:mt-0">
            <Link to="/login" className="hover:text-gold transition-colors flex items-center gap-1">
              <Lock size={10} /> Acceso Staff
            </Link>
            <Link to="/privacidad" className="hover:text-gold transition-colors">Privacidad</Link>
            <Link to="/terminos" className="hover:text-gold transition-colors">Términos</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

const MobileBottomNav = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-16">
        <Link to="/" className={`flex flex-col items-center p-2 transition-colors ${isActive('/') ? 'text-gold' : 'text-gray-400'}`}>
          <Home size={22} strokeWidth={isActive('/') ? 2.5 : 2} />
          <span className="text-[10px] mt-1 font-medium">Inicio</span>
        </Link>
        <Link to="/propiedades" className={`flex flex-col items-center p-2 transition-colors ${isActive('/propiedades') ? 'text-gold' : 'text-gray-400'}`}>
          <Search size={22} strokeWidth={isActive('/propiedades') ? 2.5 : 2} />
          <span className="text-[10px] mt-1 font-medium">Buscar</span>
        </Link>
        <Link to="/ruzzi-ai" className={`flex flex-col items-center p-2 transition-colors ${isActive('/ruzzi-ai') ? 'text-gold' : 'text-gray-400'}`}>
          <Sparkles size={22} strokeWidth={isActive('/ruzzi-ai') ? 2.5 : 2} />
          <span className="text-[10px] mt-1 font-medium">Ruzzi AI</span>
        </Link>
        <Link to="/contacto" className={`flex flex-col items-center p-2 transition-colors ${isActive('/contacto') ? 'text-gold' : 'text-gray-400'}`}>
          <MessageSquare size={22} strokeWidth={isActive('/contacto') ? 2.5 : 2} />
          <span className="text-[10px] mt-1 font-medium">Contacto</span>
        </Link>
      </div>
    </div>
  );
}

const Sparkles = ({ size, strokeWidth, className }: { size: number, strokeWidth?: number, className?: string }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>
);

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-cream selection:bg-gold selection:text-white">
      <Header />
      <main className="flex-grow pb-16 lg:pb-0">
        {children}
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Layout;
