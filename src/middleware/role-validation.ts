import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export type UserRole = 'super_admin' | 'admin' | 'golf_course' | 'course_manager' | 'affiliate' | 'client';

export interface RolePermissions {
  canManageTenants: boolean;
  canManageUsers: boolean;
  canManageCourses: boolean;
  canManageBookings: boolean;
  canViewReports: boolean;
  canManageAffiliates: boolean;
  canManageDiscounts: boolean;
  canViewAllData: boolean;
}

export const rolePermissions: Record<UserRole, RolePermissions> = {
  super_admin: {
    canManageTenants: true,
    canManageUsers: true,
    canManageCourses: true,
    canManageBookings: true,
    canViewReports: true,
    canManageAffiliates: true,
    canManageDiscounts: true,
    canViewAllData: true,
  },
  admin: {
    canManageTenants: false,
    canManageUsers: true,
    canManageCourses: true,
    canManageBookings: true,
    canViewReports: true,
    canManageAffiliates: true,
    canManageDiscounts: true,
    canViewAllData: true,
  },
  golf_course: {
    canManageTenants: false,
    canManageUsers: true,
    canManageCourses: true,
    canManageBookings: true,
    canViewReports: true,
    canManageAffiliates: true,
    canManageDiscounts: true,
    canViewAllData: false,
  },
  course_manager: {
    canManageTenants: false,
    canManageUsers: false,
    canManageCourses: true,
    canManageBookings: true,
    canViewReports: true,
    canManageAffiliates: false,
    canManageDiscounts: false,
    canViewAllData: false,
  },
  affiliate: {
    canManageTenants: false,
    canManageUsers: false,
    canManageCourses: false,
    canManageBookings: false,
    canViewReports: true,
    canManageAffiliates: false,
    canManageDiscounts: false,
    canViewAllData: false,
  },
  client: {
    canManageTenants: false,
    canManageUsers: false,
    canManageCourses: false,
    canManageBookings: false,
    canViewReports: false,
    canManageAffiliates: false,
    canManageDiscounts: false,
    canViewAllData: false,
  },
};

export function hasPermission(userRole: UserRole, permission: keyof RolePermissions): boolean {
  return rolePermissions[userRole][permission];
}

export async function validateRolePermission(
  request: NextRequest,
  requiredPermission: keyof RolePermissions
): Promise<NextResponse | null> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = session.user.role as UserRole;
    
    if (!hasPermission(userRole, requiredPermission)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    return null; // Allow access
  } catch (error) {
    console.error('Error validating role permission:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export function withRolePermission(requiredPermission: keyof RolePermissions) {
  return function (handler: Function) {
    return async (request: NextRequest, context?: any) => {
      const permissionError = await validateRolePermission(request, requiredPermission);
      if (permissionError) {
        return permissionError;
      }

      return handler(request, context);
    };
  };
}

export function requireRoles(allowedRoles: UserRole[]) {
  return function (handler: Function) {
    return async (request: NextRequest, context?: any) => {
      try {
        const session = await getServerSession(authOptions);
        
        if (!session) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userRole = session.user.role as UserRole;
        
        if (!allowedRoles.includes(userRole)) {
          return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        return handler(request, context);
      } catch (error) {
        console.error('Error validating role:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
      }
    };
  };
}

