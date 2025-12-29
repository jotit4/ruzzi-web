
import { Property, TeamMember, Service, Lead, AdminStats } from './types';

export const NAV_LINKS = [
  { label: 'INICIO', href: '/' },
  { label: 'PROPIEDADES', href: '/propiedades' },
  { label: 'SERVICIOS', href: '/servicios' },
  { label: 'RUZZI AI', href: '/ruzzi-ai' },
  { label: 'NOSOTROS', href: '/nosotros' },
  { label: 'CONTACTO', href: '/contacto' },
  { label: 'ADMIN', href: '/admin' },
];

export const MOCK_PROPERTIES: Property[] = [
  {
    id: '1',
    title: 'Residencia Aria',
    description: 'Una obra maestra de la arquitectura moderna. Residencia Aria combina lujo y funcionalidad con espacios abiertos y luminosidad natural.',
    price: 1250000,
    currency: 'USD',
    property_type_id: 'house_001',
    development_id: 'docta_001',
    address: 'Docta Urbanización, Córdoba',
    latitude: -31.4201,
    longitude: -64.1888,
    area_total: 280,
    area_built: 280,
    bedrooms: 4,
    bathrooms: 4,
    parking_spaces: 2,
    status: 'available',
    availability_date: '2024-06-01',
    commission_rate: 3.0,
    is_featured: true,
    is_published: true,
    created_by: 'admin_001',
    updated_by: 'admin_001',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-05-15T10:00:00Z',
    // Extended properties
    location: {
      city: 'Córdoba',
      address: 'Docta Urbanización',
      coordinates: { lat: -31.4201, lng: -64.1888 }
    },
    type: 'house',
    area: 280,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
    gallery: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'
    ],
    date: '2024-06-01',
    featured: true
  },
  {
    id: '2',
    title: 'Luxury Villa Lago',
    description: 'Villa exclusiva con vista al lago central. Acabados de mármol y madera natural.',
    price: 980000,
    currency: 'USD',
    property_type_id: 'house_002',
    development_id: 'bosque_001',
    address: 'Barrio Privado El Bosque',
    latitude: -31.4150,
    longitude: -64.1900,
    area_total: 350,
    area_built: 350,
    bedrooms: 4,
    bathrooms: 3,
    parking_spaces: 3,
    status: 'available',
    availability_date: '2024-07-01',
    commission_rate: 2.5,
    is_featured: true,
    is_published: true,
    created_by: 'admin_001',
    updated_by: 'admin_001',
    created_at: '2024-02-01T10:00:00Z',
    updated_at: '2024-05-10T10:00:00Z',
    // Extended properties
    location: {
      city: 'Córdoba',
      address: 'Barrio Privado El Bosque',
      coordinates: { lat: -31.4150, lng: -64.1900 }
    },
    type: 'house',
    area: 350,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
    gallery: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'],
    date: '2024-07-01',
    featured: true
  },
  {
    id: '3',
    title: 'Luminoso Loft Central',
    description: 'Loft de diseño industrial en el corazón del distrito comercial.',
    price: 350000,
    currency: 'USD',
    property_type_id: 'apartment_001',
    development_id: 'centro_001',
    address: 'Centro Urbano Docta',
    latitude: -31.4200,
    longitude: -64.1875,
    area_total: 120,
    area_built: 120,
    bedrooms: 2,
    bathrooms: 2,
    parking_spaces: 1,
    status: 'available',
    availability_date: '2024-05-01',
    commission_rate: 4.0,
    is_featured: false,
    is_published: true,
    created_by: 'admin_001',
    updated_by: 'admin_001',
    created_at: '2024-03-01T10:00:00Z',
    updated_at: '2024-05-01T10:00:00Z',
    // Extended properties
    location: {
      city: 'Córdoba',
      address: 'Centro Urbano Docta',
      coordinates: { lat: -31.4200, lng: -64.1875 }
    },
    type: 'apartment',
    area: 120,
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
    gallery: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'],
    date: '2024-05-01',
    featured: false
  }
];

export const MOCK_LEADS: Lead[] = [
  { 
    id: '1', 
    client_name: 'Carlos Gomez', 
    client_email: 'carlos@example.com', 
    client_phone: '3514445566', 
    property_id: '1', 
    booking_date: '2024-05-15T10:00:00Z', 
    status: 'pending', 
    notes: 'Interesado en Residencia Aria', 
    created_by: 'admin_001', 
    updated_by: 'admin_001',
    // Legacy properties for compatibility
    name: 'Carlos Gomez',
    email: 'carlos@example.com', 
    phone: '3514445566', 
    type: 'Ventas', 
    message: 'Interesado en Residencia Aria', 
    date: '2024-05-15',
    assignedTo: 'admin_001'
  },
  { 
    id: '2', 
    client_name: 'Maria Lopez', 
    client_email: 'm.lopez@gmail.com', 
    client_phone: '3519998877', 
    property_id: '2', 
    booking_date: '2024-05-14T14:30:00Z', 
    status: 'confirmed', 
    notes: '¿Aceptan propiedades como parte de pago?', 
    created_by: 'admin_001', 
    updated_by: 'admin_001',
    // Legacy properties for compatibility
    name: 'Maria Lopez',
    email: 'm.lopez@gmail.com', 
    phone: '3519998877', 
    type: 'Consulta General', 
    message: '¿Aceptan propiedades como parte de pago?', 
    date: '2024-05-14',
    assignedTo: 'admin_001'
  },
  { 
    id: '3', 
    client_name: 'Roberto Sanchez', 
    client_email: 'roberto.s@outlook.com', 
    client_phone: '3517776655', 
    property_id: '3', 
    booking_date: '2024-05-10T09:15:00Z', 
    status: 'completed', 
    notes: 'Busco terrenos en Docta Etapa 2', 
    created_by: 'admin_001', 
    updated_by: 'admin_001',
    // Legacy properties for compatibility
    name: 'Roberto Sanchez',
    email: 'roberto.s@outlook.com', 
    phone: '3517776655', 
    type: 'Inversiones', 
    message: 'Busco terrenos en Docta Etapa 2', 
    date: '2024-05-10',
    assignedTo: 'admin_001'
  },
];

export const ADMIN_STATS: AdminStats = {
  totalProperties: 42,
  totalLeads: 154,
  totalSales: 12,
  monthlyRevenue: 875000,
  // Optional properties maintained for backward compatibility
  activeProperties: 42,
  totalViews: 12400,
  conversionRate: 3.2
};

export const TEAM_MEMBERS: TeamMember[] = [
  { id: '1', name: 'Laura Gándz', role: 'CEO Fundadora', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
  { id: '2', name: 'Javier Torres', role: 'Director de Operaciones', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
  { id: '3', name: 'Ana Belén Suto', role: 'Jefa de Marketing', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
];

export const SERVICES: Service[] = [
  { id: '1', title: 'Consultoría Estratégica', description: 'Análisis profundo del mercado para inversiones seguras.', icon: 'briefcase' },
  { id: '2', title: 'Gestión de Inversiones', description: 'Maximizamos el retorno de tu capital inmobiliario.', icon: 'chart' },
  { id: '3', title: 'Soluciones Patrimoniales', description: 'Protección y crecimiento de activos familiares.', icon: 'shield' },
  { id: '4', title: 'Desarrollo de Proyectos', description: 'Planificación y ejecución integral de obras civiles.', icon: 'building' },
  { id: '5', title: 'Tasaciones Profesionales', description: 'Valoración real basada en datos de mercado actuales.', icon: 'clipboard' },
  { id: '6', title: 'Asesoría Legal', description: 'Soporte jurídico especializado en Real Estate.', icon: 'scale' },
];
