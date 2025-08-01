'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { UserRole, hasPermission, RolePermissions } from '@/middleware/role-validation';

interface RoleProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  requiredPermission?: keyof RolePermissions;
  fallbackPath?: string;
  loadingComponent?: ReactNode;
  unauthorizedComponent?: ReactNode;
}

export function RoleProtectedRoute({
  children,
  allowedRoles,
  requiredPermission,
  fallbackPath = '/dashboard',
  loadingComponent,
  unauthorizedComponent,
}: RoleProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/signin');
      return;
    }

    const userRole = session.user.role as UserRole;

    // Check role-based access
    if (allowedRoles && !allowedRoles.includes(userRole)) {
      router.push(fallbackPath);
      return;
    }

    // Check permission-based access
    if (requiredPermission && !hasPermission(userRole, requiredPermission)) {
      router.push(fallbackPath);
      return;
    }
  }, [session, status, router, allowedRoles, requiredPermission, fallbackPath]);

  if (status === 'loading') {
    return loadingComponent || <div className="p-6">Loading...</div>;
  }

  if (!session) {
    return <div className="p-6">Redirecting to login...</div>;
  }

  const userRole = session.user.role as UserRole;

  // Check role-based access
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return unauthorizedComponent || <div className="p-6">Access denied</div>;
  }

  // Check permission-based access
  if (requiredPermission && !hasPermission(userRole, requiredPermission)) {
    return unauthorizedComponent || <div className="p-6">Insufficient permissions</div>;
  }

  return <>{children}</>;
}

// Convenience components for specific roles
export function SuperAdminRoute({ children, ...props }: Omit<RoleProtectedRouteProps, 'allowedRoles'>) {
  return (
    <RoleProtectedRoute allowedRoles={['super_admin']} {...props}>
      {children}
    </RoleProtectedRoute>
  );
}

export function AdminRoute({ children, ...props }: Omit<RoleProtectedRouteProps, 'allowedRoles'>) {
  return (
    <RoleProtectedRoute allowedRoles={['super_admin', 'admin']} {...props}>
      {children}
    </RoleProtectedRoute>
  );
}

export function GolfCourseRoute({ children, ...props }: Omit<RoleProtectedRouteProps, 'allowedRoles'>) {
  return (
    <RoleProtectedRoute allowedRoles={['super_admin', 'admin', 'golf_course']} {...props}>
      {children}
    </RoleProtectedRoute>
  );
}

export function CourseManagerRoute({ children, ...props }: Omit<RoleProtectedRouteProps, 'allowedRoles'>) {
  return (
    <RoleProtectedRoute allowedRoles={['super_admin', 'admin', 'golf_course', 'course_manager']} {...props}>
      {children}
    </RoleProtectedRoute>
  );
}

export function AffiliateRoute({ children, ...props }: Omit<RoleProtectedRouteProps, 'allowedRoles'>) {
  return (
    <RoleProtectedRoute allowedRoles={['super_admin', 'affiliate']} {...props}>
      {children}
    </RoleProtectedRoute>
  );
}

