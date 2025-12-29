import React from 'react';
import { Shield, AlertCircle } from 'lucide-react';
import { useRolePermissions } from '../hooks/useUserProfile';

interface RoleGuardProps {
  children: React.ReactNode;
  permission?: string;
  adminOnly?: boolean;
  superAdminOnly?: boolean;
  fallback?: React.ReactNode;
  showMessage?: boolean;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  permission,
  adminOnly = false,
  superAdminOnly = false,
  fallback = null,
  showMessage = true
}) => {
  const { hasPermission, isAdmin, isSuperAdmin, getUserRole } = useRolePermissions();

  // Check permissions
  let hasAccess = false;

  if (superAdminOnly) {
    hasAccess = isSuperAdmin();
  } else if (adminOnly) {
    hasAccess = isAdmin();
  } else if (permission) {
    hasAccess = hasPermission(permission) || isAdmin();
  } else {
    hasAccess = true;
  }

  if (!hasAccess) {
    if (fallback) return <>{fallback}</>;
    
    if (showMessage) {
      return (
        <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <div>
            <p className="text-sm font-medium text-yellow-800">Acceso Restringido</p>
            <p className="text-xs text-yellow-600">
              Necesitas permisos adicionales ({permission || 'administrador'}) para acceder a esta sección.
              Rol actual: <span className="font-medium">{getUserRole()}</span>
            </p>
          </div>
        </div>
      );
    }

    return null;
  }

  return <>{children}</>;
};

export default RoleGuard;
