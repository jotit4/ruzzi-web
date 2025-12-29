import { useState, useEffect } from 'react';
import { supabase, DbProfile, DbRole } from '../lib/supabase';
import { useAuth } from './useSupabase';

export interface UserProfile extends DbProfile {
  role?: DbRole;
}

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }

        if (!profileData) {
          setError('Perfil de usuario no encontrado');
          setLoading(false);
          return;
        }

        // Get user role if available - CORREGIDO: Separar las consultas
        const { data: userRoleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role_id')
          .eq('user_id', user.id)
          .maybeSingle();

        let roleData = null;
        if (userRoleData?.role_id) {
          const { data: roleInfo, error: roleInfoError } = await supabase
            .from('roles')
            .select('*')
            .eq('id', userRoleData.role_id)
            .maybeSingle();
          
          if (!roleInfoError) {
            roleData = roleInfo;
          }
        }

        const profile: UserProfile = {
          ...profileData,
          role: roleData || undefined
        };

        setProfile(profile);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  return { profile, loading, error };
}

export function useRolePermissions() {
  const { profile } = useUserProfile();
  
  const hasPermission = (permission: string): boolean => {
    if (!profile?.role?.permissions) return false;
    
    // Check if the permission exists in the role permissions object
    return !!profile.role.permissions[permission];
  };

  const isSuperAdmin = (): boolean => {
    return profile?.role?.name === 'super_admin';
  };

  const isAdmin = (): boolean => {
    return profile?.role?.name === 'admin' || isSuperAdmin();
  };

  const isAgent = (): boolean => {
    return profile?.role?.name === 'agent' || isAdmin();
  };

  const isViewer = (): boolean => {
    return profile?.role?.name === 'viewer' || isAgent();
  };

  const getUserRole = () => {
    return profile?.role?.name || 'unknown';
  };

  return {
    hasPermission,
    isSuperAdmin,
    isAdmin,
    isAgent,
    isViewer,
    getUserRole,
    profile
  };
}
