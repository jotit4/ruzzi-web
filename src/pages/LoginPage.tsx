
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import Button from '../components/Button';
import { Lock, Mail, ChevronRight, Zap, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useApp();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: signInError } = await login(email, password);
      if (signInError) {
        setError('Credenciales incorrectas. Verifique su email y contraseña.');
        return;
      }
      navigate('/admin');
    } catch (err) {
      setError('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-10 relative z-10 border border-white/10">
        <div className="text-center mb-10">
          <Logo className="h-12 w-auto mx-auto mb-6 text-navy" />
          <h1 className="text-2xl font-serif font-bold text-navy">Acceso Staff</h1>
          <p className="text-gray-500 text-sm mt-2">Consola de Administracion Premium</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-navy ml-1">Email Corporativo</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold outline-none transition-all text-navy"
                placeholder="usuario@ruzzi.com.ar"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-navy ml-1">Contrasena</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold outline-none transition-all text-navy"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Button
              type="submit"
              fullWidth
              size="lg"
              disabled={loading}
              className="h-14 text-lg"
            >
              {loading ? 'Validando...' : 'Iniciar Sesion'}
              {!loading && <ChevronRight className="ml-2" size={20} />}
            </Button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-100"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-[10px] font-bold uppercase tracking-widest">Acceso Seguro</span>
              <div className="flex-grow border-t border-gray-100"></div>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500 mb-4">Acceso exclusivo para personal autorizado</p>
              <a href="#" className="text-xs text-gold hover:text-gold-dark transition-colors font-medium">¿Olvidaste tu acceso?</a>
            </div>
          </div>
        </form>

        <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          <span>Supabase Active</span>
          <span>Security Level 4</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
