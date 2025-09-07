import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Lock } from 'lucide-react';

interface RoleBasedAccessProps {
  children: ReactNode;
  requiredRole?: 'Owner' | 'Planner' | 'Collaborator' | 'Viewer';
  fallback?: ReactNode;
  showFallback?: boolean;
}

export function RoleBasedAccess({ 
  children, 
  requiredRole = 'Viewer', 
  fallback,
  showFallback = true 
}: RoleBasedAccessProps) {
  const { hasPermission, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blush"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return showFallback ? (
      <Alert className="border-red-200 bg-red-50">
        <Lock className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          Please log in to access this feature.
        </AlertDescription>
      </Alert>
    ) : null;
  }

  if (!hasPermission(requiredRole)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return showFallback ? (
      <Alert className="border-amber-200 bg-amber-50">
        <Shield className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          You need {requiredRole} access or higher to use this feature.
        </AlertDescription>
      </Alert>
    ) : null;
  }

  return <>{children}</>;
}

interface EditableContentProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function EditableContent({ children, fallback }: EditableContentProps) {
  const { canEdit } = useAuth();

  if (!canEdit()) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}

interface CollaboratorManagementProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function CollaboratorManagement({ children, fallback }: CollaboratorManagementProps) {
  const { canManageCollaborators } = useAuth();

  if (!canManageCollaborators()) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}