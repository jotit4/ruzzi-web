import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://keagelriuwimopdpehdp.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlYWdlbHJpdXdpbW9wZHBlaGRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0NTM2MTYsImV4cCI6MjA4MjAyOTYxNn0.lN1s9xVnXmjT70Ixs4tgBIuBxwiZGiiuE_zwnQk-u-Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  }
});

// Database types
export interface DbProperty {
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
}

export interface DbPropertyImage {
  id: string;
  property_id: string;
  image_url: string;
  alt_text: string | null;
  is_primary: boolean;
  display_order: number;
  uploaded_by: string | null;
  created_at: string;
}

export interface DbPropertyFeature {
  id: string;
  property_id: string;
  feature_name: string;
  feature_value: string | null;
  display_order: number;
  created_at: string;
}

export interface DbLead {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  lead_source_id: string | null;
  interested_property_id: string | null;
  budget_min: number | null;
  budget_max: number | null;
  preferred_location: string | null;
  property_type_preference: string | null;
  status: 'new' | 'contacted' | 'interested' | 'appointment' | 'negotiating' | 'closed' | 'discarded';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_by: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbDevelopment {
  id: string;
  name: string;
  description: string | null;
  location: string;
  city: string;
  province: string;
  latitude: number | null;
  longitude: number | null;
  total_area: number | null;
  construction_status: 'planning' | 'construction' | 'completed';
  delivery_date: string | null;
  amenities: string[];
  images: string[];
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  position: string | null;
  department: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbRole {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  permissions: Record<string, unknown>;
  created_at: string;
}

export interface DbLeadSource {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface DbPropertyType {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  created_at: string;
}
