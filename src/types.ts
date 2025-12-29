
export interface Property {
  id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  property_type_id: string | null;
  development_id: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  area_total: number | null;
  area_built: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  parking_spaces: number | null;
  status: 'available' | 'reserved' | 'sold' | 'under_construction';
  availability_date: string | null;
  commission_rate: number | null;
  is_featured: boolean;
  is_published: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  // Extended properties
  location?: {
    city?: string;
    address?: string;
    coordinates?: { lat: number; lng: number };
  };
  type?: 'apartment' | 'house' | 'commercial' | 'land';
  area?: number;
  image?: string;
  gallery?: string[];
  video_urls?: string[];
  full_images?: {
    id: string;
    image_url: string;
    is_primary: boolean;
    display_order: number;
  }[];
  date?: string;
  featured?: boolean;
  slug?: string;
  meta_description?: string;
  keywords?: string;
  seo_metadata?: any;
  features?: {
    id: string;
    feature_name: string;
    feature_value: string | null;
  }[];
}

export interface WebConfig {
  hero: {
    title: string;
    subtitle: string;
    bgImage: string;
    buttonText: string;
    buttonLink: string;
  };
  sections: {
    id: string;
    name: string;
    isVisible: boolean;
    order: number;
  }[];
  contact?: {
    targetEmail?: string;
    email: string;
    phone: string;
    address: string;
    social: { platform: string; url: string }[];
  };
  socialEmbeds?: {
    [key: string]: {
      enabled: boolean;
      url: string;
      title?: string;
    };
  };
  puck_data?: {
    content: any[];
    root: any;
  };
}

export interface PropertyFormData {
  title: string;
  description: string;
  price: number;
  currency: string;
  address: string;
  area_total: number;
  bedrooms: number;
  bathrooms: number;
  property_type_id: string;
  development_id: string;
  status: string;
  is_featured: boolean;
  parking_spaces?: number;
  year_built?: number;
  available_from?: string;
  commission_rate?: number;
  features?: string[];
  latitude?: number;
  longitude?: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface NavLink {
  label: string;
  href: string;
  icon?: string;
}


export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  position?: string;
  department?: string;
  is_active: boolean;
  created_at: string;
  role?: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'agent' | 'editor';
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'SuperAdmin' | 'Agent';
}
