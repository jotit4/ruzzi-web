import React, { createContext, useContext, useEffect, useState } from 'react';
import { Property, WebConfig, UserProfile, Lead } from '../types';
import { supabase } from '../lib/supabase';

interface AppContextType {
  // User state
  user: any;
  userProfile: any;
  isAuthenticated: boolean;
  loading: boolean;

  // Properties - UI state only
  properties: Property[];
  propertiesLoading: boolean;


  // Stats - UI state only
  stats: { totalProperties: number };
  statsLoading: boolean;

  // Web Config - CMS
  webConfig: WebConfig | null;
  webConfigLoading: boolean;
  refreshWebConfig: () => Promise<void>;
  updateWebConfig: (config: WebConfig) => Promise<void>;

  // Simplified functions - just API calls to Edge Functions
  refreshProperties: () => Promise<void>;
  createProperty: (data: Omit<Property, 'id'>) => Promise<Property>;
  updateProperty: (id: string, data: Partial<Property>) => Promise<Property>;
  deleteProperty: (id: string) => Promise<void>;

  // Leads
  createLead: (data: Omit<Lead, 'id' | 'created_at' | 'status'>) => Promise<Lead>;

  // Users - Admin UI
  users: UserProfile[];
  usersLoading: boolean;
  refreshUsers: () => Promise<void>;
  createUser: (data: any) => Promise<UserProfile>;
  updateUser: (id: string, data: any) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;

  // Auth functions
  login: (email: string, password: string) => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(false);
  const [stats, setStats] = useState({
    totalProperties: 0
  });
  const [statsLoading, setStatsLoading] = useState(false);
  const [webConfig, setWebConfig] = useState<WebConfig | null>(null);
  const [webConfigLoading, setWebConfigLoading] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Initialize Supabase auth listener and get initial session
  useEffect(() => {
    console.log('[AppContext] Initializing auth listener and checking initial session...');

    const initializeAuth = async () => {
      try {
        // En algunos navegadores, el acceso al storage puede tener un micro-delay
        const { data: { session } } = await supabase.auth.getSession();
        console.log('[AppContext] Initial session check:', session?.user?.email);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('[AppContext] Error fetching initial session:', error);
      } finally {
        // Aseguramos que el estado de carga solo cambie después de intentar recuperar la sesión
        setLoading(false);
      }
    };

    initializeAuth();

    // 2. Set up listener for future changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[AppContext] Auth state changed:', event, session?.user?.email);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load data based on authentication state
  useEffect(() => {
    if (user) {
      // Load admin data when user is authenticated
      loadInitialData();
    } else {
      // Load public properties when user is not authenticated
      loadPublicProperties();
      refreshWebConfig();
      // Clear admin data
      setStats({
        totalProperties: 0
      });
      setWebConfig(null);
    }
  }, [user]);

  const loadInitialData = async () => {
    try {
      // Only load admin data when user is authenticated
      if (user) {
        await Promise.all([
          refreshProperties(),
          refreshStats(),
          refreshUsers(),
          refreshWebConfig()
        ]);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const refreshProperties = async () => {
    if (!user) return;

    setPropertiesLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke('properties-crud', {
        body: { action: 'list', limit: 100 },
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setProperties(response.data || []);
      console.log(`✅ Loaded ${response.data?.length || 0} properties`);
    } catch (error) {
      console.error('Error refreshing properties:', error);
    } finally {
      setPropertiesLoading(false);
    }
  };

  const loadPublicProperties = async () => {
    setPropertiesLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke('properties-crud', {
        body: { action: 'list', limit: 20 },
        headers: {
          Authorization: `Bearer ${session?.access_token || ''}`
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setProperties(response.data || []);
      console.log(`✅ Loaded ${response.data?.length || 0} public properties`);
    } catch (error) {
      console.error('Error loading public properties:', error);
      // Set empty array on error to prevent infinite loading
      setProperties([]);
    } finally {
      setPropertiesLoading(false);
    }
  };

  const createProperty = async (data: Omit<Property, 'id'>) => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await supabase.functions.invoke('properties-crud', {
      body: { action: 'create', data },
      headers: {
        Authorization: `Bearer ${session?.access_token}`
      }
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    // Add to local state immediately for optimistic UI
    const newProperty = response.data;
    setProperties(prev => [newProperty, ...prev]);

    return newProperty;
  };

  const createLead = async (data: Omit<Lead, 'id' | 'created_at' | 'status'>) => {
    console.log('[AppContext] createLead called', data);
    try {
      // In a real app this would call an Edge Function or insert into a table
      // For now we'll just log it and return a mock lead to satisfy the interface
      // or try to insert into a 'leads' table if it exists

      const { error } = await supabase.from('leads').insert([{
        ...data,
        status: 'new'
      }]);

      if (error) {
        console.warn('Could not insert lead into DB, likely missing table. Proceeding strictly with UI.', error);
      }

      const mockLead: Lead = {
        id: Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        status: 'new',
        ...data
      };

      return mockLead;
    } catch (error) {
      console.error('Error creating lead:', error);
      throw error;
    }
  };

  const updateProperty = async (id: string, data: Partial<Property>) => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await supabase.functions.invoke('properties-crud', {
      body: { action: 'update', data: { ...data, id } },
      headers: {
        Authorization: `Bearer ${session?.access_token}`
      }
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    // Update local state
    const updatedProperty = response.data;
    setProperties(prev => prev.map(p => p.id === id ? updatedProperty : p));

    return updatedProperty;
  };

  const deleteProperty = async (id: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await supabase.functions.invoke('properties-crud', {
      body: { action: 'delete', data: { id } },
      headers: {
        Authorization: `Bearer ${session?.access_token}`
      }
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    // Remove from local state
    setProperties(prev => prev.filter(p => p.id !== id));
  };



  const refreshWebConfig = async () => {
    setWebConfigLoading(true);
    try {
      const { data, error } = await supabase
        .from('web_settings')
        .select('value')
        .eq('key', 'home_config')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // If not found, use a default config (though migration should have added it)
          console.log('[AppContext] No web config found, using defaults');
        } else {
          throw error;
        }
      }

      if (data?.value) {
        setWebConfig(data.value as WebConfig);
      }
    } catch (error) {
      console.error('Error refreshing web config:', error);
    } finally {
      setWebConfigLoading(false);
    }
  };

  const updateWebConfig = async (config: WebConfig) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { error } = await supabase
        .from('web_settings')
        .upsert({
          key: 'home_config',
          value: config,
          updated_at: new Date().toISOString(),
          updated_by: user?.id
        }, { onConflict: 'key' });

      if (error) throw error;
      setWebConfig(config);
      console.log('✅ Web config updated successfully');
    } catch (error) {
      console.error('Error updating web config:', error);
      throw error;
    }
  };

  const refreshStats = async () => {
    setStatsLoading(true);
    try {
      // Calculate stats from local data
      setStats({
        totalProperties: properties.length,
      });
    } catch (error) {
      console.error('Error refreshing stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const refreshUsers = async () => {
    if (!user) return;
    setUsersLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke('users-crud', {
        body: { action: 'list' },
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      if (response.error) throw new Error(response.error.message);
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error refreshing users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const createUser = async (userData: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await supabase.functions.invoke('users-crud', {
      body: { action: 'create', data: userData },
      headers: { Authorization: `Bearer ${session?.access_token}` }
    });
    if (response.error) throw new Error(response.error.message);
    const newUser = response.data;
    // Refresh list to be sure we have the computed profile
    await refreshUsers();
    return newUser;
  };

  const updateUser = async (id: string, userData: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await supabase.functions.invoke('users-crud', {
      body: { action: 'update', data: { ...userData, id } },
      headers: { Authorization: `Bearer ${session?.access_token}` }
    });
    if (response.error) throw new Error(response.error.message);

    // Update local state
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...userData } : u));
  };

  const deleteUser = async (id: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await supabase.functions.invoke('users-crud', {
      body: { action: 'delete', data: { id } },
      headers: { Authorization: `Bearer ${session?.access_token}` }
    });
    if (response.error) throw new Error(response.error.message);

    // Update local state
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const value: AppContextType = {
    user,
    userProfile,
    isAuthenticated: !!user,
    loading,
    properties,
    propertiesLoading,
    stats,
    statsLoading,
    webConfig,
    webConfigLoading,
    refreshProperties,
    createProperty,
    updateProperty,
    deleteProperty,
    createLead,
    refreshWebConfig,
    updateWebConfig,

    users,
    usersLoading,
    refreshUsers,
    createUser,
    updateUser,
    deleteUser,
    login,
    logout,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
