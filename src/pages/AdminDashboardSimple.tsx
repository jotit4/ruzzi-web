import React, { useState } from 'react';
import { 
  Users, Building, BarChart3, Plus, Search, 
  LogOut, CheckCircle, MessageSquare, Edit2, Trash2, 
  ArrowUpRight, X, Save, Upload, MapPin, DollarSign,
  Shield, UserCog, Calendar, Phone, Mail, Eye, Settings
} from 'lucide-react';
import Logo from '../components/Logo';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useSupabase';
import { useRolePermissions } from '../hooks/useUserProfile';
import Button from '../components/Button';

type TabType = 'overview' | 'properties' | 'leads' | 'users' | 'settings';

const AdminDashboardSimple: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { user, signOut } = useAuth();
  const { hasPermission, isSuperAdmin, isAdmin, getUserRole } = useRolePermissions();
  const navigate = useNavigate();

  console.log('🔄 AdminDashboardSimple rendered:', { 
    user: user?.email, 
    activeTab,
    hasManageProps: hasPermission('manage_properties')
  });

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleDeleteProperty = async (id: string) => {
    if (window.confirm('Esta seguro de eliminar esta propiedad? Esta accion no se puede deshacer.')) {
      console.log('🗑️ Deleting property:', id);
      // TODO: Implement delete logic
    }
  };

  const handlePropertyModal = () => {
    console.log('➕ Opening property modal');
    // TODO: Implement modal logic
  };

  // Mock data for demonstration
  const mockProperties = [
    {
      id: '1',
      title: 'Residencia Aria',
      location: 'Docta Urbanización, Córdoba',
      price: 1250000,
      currency: 'USD',
      bedrooms: 4,
      bathrooms: 4,
      area: 280,
      type: 'Casa',
      status: 'For Sale',
      featured: true,
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400'
    },
    {
      id: '2',
      title: 'Luxury Villa Lago',
      location: 'Barrio Privado El Bosque',
      price: 980000,
      currency: 'USD',
      bedrooms: 4,
      bathrooms: 3,
      area: 350,
      type: 'Casa',
      status: 'For Sale',
      featured: true,
      image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400'
    },
    {
      id: '3',
      title: 'Luminoso Loft Central',
      location: 'Centro Urbano Docta',
      price: 350000,
      currency: 'USD',
      bedrooms: 2,
      bathrooms: 2,
      area: 120,
      type: 'Departamento',
      status: 'For Sale',
      featured: false,
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400'
    }
  ];

  const filteredProperties = mockProperties.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      
      {/* Sidebar */}
      <aside className="w-full lg:w-72 bg-navy text-white flex flex-col shrink-0">
        <div className="p-8 border-b border-white/10">
          <Logo className="h-8 w-auto text-white" />
          <p className="text-[10px] font-bold text-gold mt-2 uppercase tracking-[0.2em]">Panel Administrativo</p>
          <div className="mt-3 px-3 py-2 bg-white/10 rounded-lg">
            <p className="text-[10px] text-gray-400 uppercase">Rol Actual</p>
            <p className="text-sm font-bold text-white capitalize">
              {isSuperAdmin() ? 'Super Administrador' : 
               isAdmin() ? 'Administrador' : 
               getUserRole() || 'Usuario'}
            </p>
          </div>
        </div>

        <nav className="flex-grow p-4 space-y-2 mt-4">
          {[
            { id: 'overview', icon: BarChart3, label: 'Dashboard', permission: 'view_dashboard' },
            { id: 'properties', icon: Building, label: 'Propiedades', permission: 'manage_properties' },
            { id: 'leads', icon: Users, label: 'Leads & CRM', permission: 'manage_leads' },
            { id: 'users', icon: UserCog, label: 'Usuarios', permission: 'manage_users', adminOnly: true },
            { id: 'settings', icon: Settings, label: 'Configuracion', permission: 'manage_settings', adminOnly: true }
          ].filter(tab => {
            if (tab.adminOnly && !isAdmin()) return false;
            return hasPermission(tab.permission) || isAdmin();
          }).map(tab => (
            <button 
              key={tab.id}
              onClick={() => {
                console.log('🔄 Switching to tab:', tab.id);
                setActiveTab(tab.id as TabType);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === tab.id ? 'bg-gold text-white shadow-lg' : 'hover:bg-white/5 text-gray-400'}`}
            >
              <tab.icon size={20} /> <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="px-4 py-2 mb-2 bg-white/5 rounded-lg">
            <p className="text-[10px] text-gray-400 uppercase">Conectado a</p>
            <p className="text-sm font-bold text-gold">Supabase</p>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/10 text-red-400 transition-all">
            <LogOut size={20} /> <span className="font-medium">Cerrar Sesion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-6 lg:p-10 overflow-y-auto max-h-screen">
        
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-serif font-bold text-navy capitalize">
              {activeTab === 'overview' ? 'Vista General' : 
               activeTab === 'properties' ? 'Gestion de Inmuebles' : 
               activeTab === 'leads' ? 'Panel de Leads' :
               activeTab === 'users' ? 'Gestion de Usuarios' : 'Configuracion'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">RUZZI v2.0 - Sistema de Gestion Inmobiliaria (Version Simplificada)</p>
          </div>
          <div className="flex gap-4">
            <div className="hidden md:flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-gray-200">
               <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
               <span className="text-xs font-bold text-navy uppercase tracking-tighter">Supabase: Activo</span>
            </div>
          </div>
        </header>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Leads Totales', value: '12', icon: <Users className="text-blue-500" />, trend: '+12%', up: true },
                { label: 'Propiedades', value: '4', icon: <Building className="text-gold" />, trend: '0%', up: null },
                { label: 'Visitas Web', value: '12,400', icon: <BarChart3 className="text-purple-500" />, trend: '+8.4%', up: true },
                { label: 'Conv. Rate', value: '2.3%', icon: <CheckCircle className="text-green-500" />, trend: '+0.2%', up: true }
              ].map((stat, idx) => (
                <div key={idx} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-gray-50 rounded-lg">{stat.icon}</div>
                    <div className={`flex items-center text-xs font-bold ${stat.up === true ? 'text-green-500' : 'text-gray-400'}`}>
                      {stat.up && <ArrowUpRight size={14} />}
                      {stat.trend}
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-navy">{stat.value}</h3>
                  <p className="text-gray-400 text-xs font-semibold uppercase mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-bold text-blue-800 mb-2">✅ Version Simplificada Funcionando</h3>
              <p className="text-blue-700 text-sm">
                Esta es una version simplificada del dashboard que elimina hooks complejos para identificar el problema. 
                Si esta version funciona correctamente, el problema está en los hooks o el contexto complejo.
              </p>
            </div>
          </div>
        )}

        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {(() => {
              console.log('🏠 Rendering Properties Tab (Simple):', { 
                propertiesCount: filteredProperties.length, 
                mockData: true 
              });
              return null;
            })()}

            {/* Search and Actions */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 flex gap-4 items-center">
              <div className="relative flex-grow max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Buscar inmueble..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-gold" 
                />
              </div>
              <Button size="sm" onClick={handlePropertyModal} disabled={!hasPermission('manage_properties') && !isAdmin()}>
                <Plus size={18} className="mr-2" /> Nuevo Inmueble
              </Button>
            </div>

            {/* Properties Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="p-6 border-b border-gray-50">
                <div className="flex items-center gap-4">
                  <h3 className="font-serif font-bold text-navy text-xl">Gestión de Propiedades (Simplificado)</h3>
                  <span className="text-sm text-gray-500">
                    {filteredProperties.length} de {mockProperties.length} propiedades (datos de prueba)
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-bold">
                        <tr>
                            <th className="px-6 py-4">Inmueble</th>
                            <th className="px-6 py-4">Ubicacion</th>
                            <th className="px-6 py-4">Precio</th>
                            <th className="px-6 py-4">Detalles</th>
                            <th className="px-6 py-4">Estado</th>
                            <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredProperties.map(prop => (
                            <tr key={prop.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <img src={prop.image} className="w-12 h-12 rounded object-cover shadow-sm" alt="prop" />
                                        <div>
                                            <p className="font-bold text-navy leading-tight">{prop.title}</p>
                                            <p className="text-[10px] text-gray-400 uppercase font-bold">{prop.type}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <MapPin size={14} className="text-gray-400" />
                                    {prop.location}
                                  </div>
                                </td>
                                <td className="px-6 py-4 font-bold text-gold">${prop.price.toLocaleString()}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                  {prop.bedrooms} hab | {prop.bathrooms} banos | {prop.area}m2
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${prop.status === 'For Sale' ? 'bg-green-100 text-green-700' : prop.status === 'Sold' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {prop.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex gap-2 justify-end">
                                        <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors" title="Ver">
                                          <Eye size={16}/>
                                        </button>
                                        {(hasPermission('manage_properties') || isAdmin()) && (
                                          <button className="p-2 text-gray-400 hover:text-navy transition-colors" title="Editar">
                                            <Edit2 size={16}/>
                                          </button>
                                        )}
                                        {(hasPermission('manage_properties') || isAdmin()) && (
                                          <button onClick={() => handleDeleteProperty(prop.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Eliminar">
                                            <Trash2 size={16}/>
                                          </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs placeholder */}
        {(activeTab === 'leads' || activeTab === 'users' || activeTab === 'settings') && (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <h3 className="text-xl font-bold text-navy mb-4">
              {activeTab === 'leads' ? 'Panel de Leads' :
               activeTab === 'users' ? 'Gestión de Usuarios' : 'Configuración'}
            </h3>
            <p className="text-gray-500">Módulo en desarrollo. Solo el dashboard y propiedades están disponibles en esta versión simplificada.</p>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminDashboardSimple;