// Advanced Permission System for TeeReserve V2.0

export interface Permission {
  id: string
  name: string
  displayName: string
  description?: string
  module: string
  action: string
}

export interface Role {
  id: string
  name: string
  displayName: string
  description?: string
  level: number
  isSystemRole: boolean
  permissions: Permission[]
}

export interface UserWithPermissions {
  id: string
  email: string
  name?: string
  role: Role
  courseId?: string
  userPermissions?: UserPermission[]
}

export interface UserPermission {
  id: string
  permissionId: string
  granted: boolean
  permission: Permission
}

// ============================================================================
// PERMISSION DEFINITIONS
// ============================================================================

export const PERMISSIONS: Record<string, Permission> = {
  // Course Management
  'courses.create': {
    id: 'courses.create',
    name: 'courses.create',
    displayName: 'Create Courses',
    description: 'Create new golf courses',
    module: 'courses',
    action: 'create'
  },
  'courses.read': {
    id: 'courses.read',
    name: 'courses.read',
    displayName: 'View Courses',
    description: 'View golf course information',
    module: 'courses',
    action: 'read'
  },
  'courses.update': {
    id: 'courses.update',
    name: 'courses.update',
    displayName: 'Edit Courses',
    description: 'Edit golf course information',
    module: 'courses',
    action: 'update'
  },
  'courses.delete': {
    id: 'courses.delete',
    name: 'courses.delete',
    displayName: 'Delete Courses',
    description: 'Delete golf courses',
    module: 'courses',
    action: 'delete'
  },
  'courses.manage': {
    id: 'courses.manage',
    name: 'courses.manage',
    displayName: 'Manage Courses',
    description: 'Full course management access',
    module: 'courses',
    action: 'manage'
  },

  // Booking Management
  'bookings.create': {
    id: 'bookings.create',
    name: 'bookings.create',
    displayName: 'Create Bookings',
    description: 'Create new bookings',
    module: 'bookings',
    action: 'create'
  },
  'bookings.read': {
    id: 'bookings.read',
    name: 'bookings.read',
    displayName: 'View Bookings',
    description: 'View booking information',
    module: 'bookings',
    action: 'read'
  },
  'bookings.update': {
    id: 'bookings.update',
    name: 'bookings.update',
    displayName: 'Edit Bookings',
    description: 'Edit booking information',
    module: 'bookings',
    action: 'update'
  },
  'bookings.delete': {
    id: 'bookings.delete',
    name: 'bookings.delete',
    displayName: 'Cancel Bookings',
    description: 'Cancel bookings',
    module: 'bookings',
    action: 'delete'
  },
  'bookings.manage': {
    id: 'bookings.manage',
    name: 'bookings.manage',
    displayName: 'Manage Bookings',
    description: 'Full booking management access',
    module: 'bookings',
    action: 'manage'
  },

  // Form Builder
  'forms.create': {
    id: 'forms.create',
    name: 'forms.create',
    displayName: 'Create Forms',
    description: 'Create new forms',
    module: 'forms',
    action: 'create'
  },
  'forms.read': {
    id: 'forms.read',
    name: 'forms.read',
    displayName: 'View Forms',
    description: 'View form schemas and submissions',
    module: 'forms',
    action: 'read'
  },
  'forms.update': {
    id: 'forms.update',
    name: 'forms.update',
    displayName: 'Edit Forms',
    description: 'Edit form schemas',
    module: 'forms',
    action: 'update'
  },
  'forms.delete': {
    id: 'forms.delete',
    name: 'forms.delete',
    displayName: 'Delete Forms',
    description: 'Delete forms and submissions',
    module: 'forms',
    action: 'delete'
  },
  'forms.publish': {
    id: 'forms.publish',
    name: 'forms.publish',
    displayName: 'Publish Forms',
    description: 'Publish forms to make them public',
    module: 'forms',
    action: 'publish'
  },
  'forms.submissions': {
    id: 'forms.submissions',
    name: 'forms.submissions',
    displayName: 'View Submissions',
    description: 'View form submissions',
    module: 'forms',
    action: 'submissions'
  },

  // User Management
  'users.create': {
    id: 'users.create',
    name: 'users.create',
    displayName: 'Create Users',
    description: 'Create new users',
    module: 'users',
    action: 'create'
  },
  'users.read': {
    id: 'users.read',
    name: 'users.read',
    displayName: 'View Users',
    description: 'View user information',
    module: 'users',
    action: 'read'
  },
  'users.update': {
    id: 'users.update',
    name: 'users.update',
    displayName: 'Edit Users',
    description: 'Edit user information',
    module: 'users',
    action: 'update'
  },
  'users.delete': {
    id: 'users.delete',
    name: 'users.delete',
    displayName: 'Delete Users',
    description: 'Delete users',
    module: 'users',
    action: 'delete'
  },
  'users.manage': {
    id: 'users.manage',
    name: 'users.manage',
    displayName: 'Manage Users',
    description: 'Full user management access',
    module: 'users',
    action: 'manage'
  },

  // Analytics & Reports
  'analytics.read': {
    id: 'analytics.read',
    name: 'analytics.read',
    displayName: 'View Analytics',
    description: 'View analytics and reports',
    module: 'analytics',
    action: 'read'
  },
  'analytics.export': {
    id: 'analytics.export',
    name: 'analytics.export',
    displayName: 'Export Analytics',
    description: 'Export analytics data',
    module: 'analytics',
    action: 'export'
  },

  // Financial Management
  'finance.read': {
    id: 'finance.read',
    name: 'finance.read',
    displayName: 'View Financial Data',
    description: 'View financial reports and data',
    module: 'finance',
    action: 'read'
  },
  'finance.manage': {
    id: 'finance.manage',
    name: 'finance.manage',
    displayName: 'Manage Finances',
    description: 'Manage financial settings and reports',
    module: 'finance',
    action: 'manage'
  },

  // System Administration
  'system.admin': {
    id: 'system.admin',
    name: 'system.admin',
    displayName: 'System Administration',
    description: 'Full system administration access',
    module: 'system',
    action: 'admin'
  },
  'system.settings': {
    id: 'system.settings',
    name: 'system.settings',
    displayName: 'System Settings',
    description: 'Manage system settings',
    module: 'system',
    action: 'settings'
  },

  // Reviews & Content
  'reviews.read': {
    id: 'reviews.read',
    name: 'reviews.read',
    displayName: 'View Reviews',
    description: 'View course reviews',
    module: 'reviews',
    action: 'read'
  },
  'reviews.moderate': {
    id: 'reviews.moderate',
    name: 'reviews.moderate',
    displayName: 'Moderate Reviews',
    description: 'Moderate and manage reviews',
    module: 'reviews',
    action: 'moderate'
  },

  // Affiliate System
  'affiliate.register': {
    id: 'affiliate.register',
    name: 'affiliate.register',
    displayName: 'Register as Affiliate',
    description: 'Register as an affiliate partner',
    module: 'affiliate',
    action: 'register'
  },
  'affiliate.view_own': {
    id: 'affiliate.view_own',
    name: 'affiliate.view_own',
    displayName: 'View Own Affiliate Data',
    description: 'View own affiliate statistics and earnings',
    module: 'affiliate',
    action: 'view_own'
  },
  'affiliate.track_bookings': {
    id: 'affiliate.track_bookings',
    name: 'affiliate.track_bookings',
    displayName: 'Track Affiliate Bookings',
    description: 'Track bookings made through affiliate links',
    module: 'affiliate',
    action: 'track_bookings'
  },
  'affiliate.view_commissions': {
    id: 'affiliate.view_commissions',
    name: 'affiliate.view_commissions',
    displayName: 'View Commissions',
    description: 'View commission history and earnings',
    module: 'affiliate',
    action: 'view_commissions'
  },
  'affiliate.generate_links': {
    id: 'affiliate.generate_links',
    name: 'affiliate.generate_links',
    displayName: 'Generate Affiliate Links',
    description: 'Generate tracking links for courses',
    module: 'affiliate',
    action: 'generate_links'
  },
  'affiliate.manage_all': {
    id: 'affiliate.manage_all',
    name: 'affiliate.manage_all',
    displayName: 'Manage All Affiliates',
    description: 'Manage all affiliate accounts and commissions',
    module: 'affiliate',
    action: 'manage_all'
  },

  // Notifications
  'notifications.manage': {
    id: 'notifications.manage',
    name: 'notifications.manage',
    displayName: 'Manage Notifications',
    description: 'Manage notification templates and settings',
    module: 'notifications',
    action: 'manage'
  },
  'notifications.view': {
    id: 'notifications.view',
    name: 'notifications.view',
    displayName: 'View Notifications',
    description: 'View notifications and preferences',
    module: 'notifications',
    action: 'view'
  },

  // Analytics & Reports (Enhanced)
  'analytics.view': {
    id: 'analytics.view',
    name: 'analytics.view',
    displayName: 'View Analytics',
    description: 'View analytics dashboards and data',
    module: 'analytics',
    action: 'view'
  },
  'reports.generate': {
    id: 'reports.generate',
    name: 'reports.generate',
    displayName: 'Generate Reports',
    description: 'Generate and export reports',
    module: 'reports',
    action: 'generate'
  },
  'reports.manage': {
    id: 'reports.manage',
    name: 'reports.manage',
    displayName: 'Manage Reports',
    description: 'Manage scheduled reports and settings',
    module: 'reports',
    action: 'manage'
  },

  // Billing & Payments
  'billing.view': {
    id: 'billing.view',
    name: 'billing.view',
    displayName: 'View Billing',
    description: 'View billing information and invoices',
    module: 'billing',
    action: 'view'
  },
  'billing.manage': {
    id: 'billing.manage',
    name: 'billing.manage',
    displayName: 'Manage Billing',
    description: 'Manage subscriptions, payments and billing',
    module: 'billing',
    action: 'manage'
  },

  // Communication
  'chat.view': {
    id: 'chat.view',
    name: 'chat.view',
    displayName: 'View Chat',
    description: 'View chat conversations',
    module: 'chat',
    action: 'view'
  },
  'chat.manage': {
    id: 'chat.manage',
    name: 'chat.manage',
    displayName: 'Manage Chat',
    description: 'Manage chat conversations and settings',
    module: 'chat',
    action: 'manage'
  },
  'whatsapp.send': {
    id: 'whatsapp.send',
    name: 'whatsapp.send',
    displayName: 'Send WhatsApp',
    description: 'Send WhatsApp messages',
    module: 'whatsapp',
    action: 'send'
  },

  // Marketing & CRM
  'marketing.view': {
    id: 'marketing.view',
    name: 'marketing.view',
    displayName: 'View Marketing',
    description: 'View marketing campaigns and analytics',
    module: 'marketing',
    action: 'view'
  },
  'marketing.manage': {
    id: 'marketing.manage',
    name: 'marketing.manage',
    displayName: 'Manage Marketing',
    description: 'Create and manage marketing campaigns',
    module: 'marketing',
    action: 'manage'
  },
  'loyalty.view': {
    id: 'loyalty.view',
    name: 'loyalty.view',
    displayName: 'View Loyalty',
    description: 'View loyalty program and points',
    module: 'loyalty',
    action: 'view'
  },
  'loyalty.manage': {
    id: 'loyalty.manage',
    name: 'loyalty.manage',
    displayName: 'Manage Loyalty',
    description: 'Manage loyalty program and rewards',
    module: 'loyalty',
    action: 'manage'
  }
}

// ============================================================================
// ROLE DEFINITIONS
// ============================================================================

export const ROLES: Record<string, Omit<Role, 'permissions'> & { permissionNames: string[] }> = {
  'super-admin': {
    id: 'super-admin',
    name: 'super-admin',
    displayName: 'Super Administrator',
    description: 'Full system access and control',
    level: 1,
    isSystemRole: true,
    permissionNames: Object.keys(PERMISSIONS) // All permissions
  },

  'course-owner': {
    id: 'course-owner',
    name: 'course-owner',
    displayName: 'Course Owner',
    description: 'Owns and manages golf courses',
    level: 2,
    isSystemRole: true,
    permissionNames: [
      'courses.read', 'courses.update', 'courses.manage',
      'bookings.read', 'bookings.update', 'bookings.manage',
      'forms.create', 'forms.read', 'forms.update', 'forms.delete', 'forms.publish', 'forms.submissions',
      'users.read', 'users.update', // Can manage their course staff
      'analytics.read', 'analytics.export', 'analytics.view',
      'finance.read', 'finance.manage',
      'reviews.read', 'reviews.moderate',
      'notifications.manage', 'notifications.view',
      'reports.generate', 'reports.manage',
      'billing.view', 'billing.manage',
      'chat.view', 'chat.manage', 'whatsapp.send',
      'marketing.view', 'marketing.manage',
      'loyalty.view', 'loyalty.manage',
      'affiliate.manage_all'
    ]
  },

  'course-manager': {
    id: 'course-manager',
    name: 'course-manager',
    displayName: 'Course Manager',
    description: 'Manages daily operations of a golf course',
    level: 3,
    isSystemRole: true,
    permissionNames: [
      'courses.read', 'courses.update',
      'bookings.create', 'bookings.read', 'bookings.update', 'bookings.delete',
      'forms.create', 'forms.read', 'forms.update', 'forms.submissions',
      'users.read', // Can view course staff
      'analytics.read', 'analytics.view',
      'finance.read',
      'reviews.read', 'reviews.moderate',
      'notifications.view',
      'reports.generate',
      'billing.view',
      'chat.view', 'chat.manage',
      'marketing.view',
      'loyalty.view'
    ]
  },

  'course-staff': {
    id: 'course-staff',
    name: 'course-staff',
    displayName: 'Course Staff',
    description: 'Front desk and operational staff',
    level: 4,
    isSystemRole: true,
    permissionNames: [
      'courses.read',
      'bookings.create', 'bookings.read', 'bookings.update',
      'forms.read', 'forms.submissions',
      'reviews.read',
      'notifications.view',
      'chat.view',
      'loyalty.view'
    ]
  },

  'customer': {
    id: 'customer',
    name: 'customer',
    displayName: 'Customer',
    description: 'Golf course customers',
    level: 5,
    isSystemRole: true,
    permissionNames: [
      'courses.read',
      'bookings.create', 'bookings.read', // Can only read their own bookings
      'reviews.read', // Can read reviews and create their own
      'notifications.view',
      'loyalty.view'
    ]
  },

  'affiliate': {
    id: 'affiliate',
    name: 'affiliate',
    displayName: 'Affiliate Partner',
    description: 'Affiliate marketing partners who earn commissions',
    level: 5, // Same level as customer but with additional affiliate permissions
    isSystemRole: true,
    permissionNames: [
      // All customer permissions
      'courses.read',
      'bookings.create', 'bookings.read',
      'reviews.read',
      'notifications.view',
      'loyalty.view',
      
      // Affiliate-specific permissions
      'affiliate.register',
      'affiliate.view_own',
      'affiliate.track_bookings',
      'affiliate.view_commissions',
      'affiliate.generate_links'
    ]
  }
}

// ============================================================================
// PERMISSION CHECKING FUNCTIONS
// ============================================================================

export class PermissionChecker {
  private user: UserWithPermissions

  constructor(user: UserWithPermissions) {
    this.user = user
  }

  /**
   * Check if user has a specific permission
   */
  hasPermission(permissionName: string): boolean {
    // Super admin has all permissions
    if (this.user.role.level === 1) {
      return true
    }

    // Check role permissions
    const hasRolePermission = this.user.role.permissions.some(
      p => p.name === permissionName
    )

    // Check user-specific permission overrides
    const userPermission = this.user.userPermissions?.find(
      up => up.permission.name === permissionName
    )

    // User permission overrides role permission
    if (userPermission) {
      return userPermission.granted
    }

    return hasRolePermission
  }

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(permissionNames: string[]): boolean {
    return permissionNames.some(permission => this.hasPermission(permission))
  }

  /**
   * Check if user has all of the specified permissions
   */
  hasAllPermissions(permissionNames: string[]): boolean {
    return permissionNames.every(permission => this.hasPermission(permission))
  }

  /**
   * Check if user can access a specific module
   */
  canAccessModule(moduleName: string): boolean {
    const modulePermissions = Object.values(PERMISSIONS)
      .filter(p => p.module === moduleName)
      .map(p => p.name)

    return this.hasAnyPermission(modulePermissions)
  }

  /**
   * Check if user can perform an action on a module
   */
  canPerformAction(moduleName: string, action: string): boolean {
    const permissionName = `${moduleName}.${action}`
    return this.hasPermission(permissionName)
  }

  /**
   * Check if user can manage a specific course
   */
  canManageCourse(courseId: string): boolean {
    // Super admin can manage any course
    if (this.user.role.level === 1) {
      return true
    }

    // Course owner/manager can only manage their assigned course
    if (this.user.courseId === courseId) {
      return this.hasAnyPermission(['courses.manage', 'courses.update'])
    }

    return false
  }

  /**
   * Get all permissions for the user
   */
  getAllPermissions(): Permission[] {
    const rolePermissions = this.user.role.permissions
    const userPermissionOverrides = this.user.userPermissions || []

    // Start with role permissions
    const permissions = new Map<string, Permission>()
    rolePermissions.forEach(p => permissions.set(p.name, p))

    // Apply user permission overrides
    userPermissionOverrides.forEach(up => {
      if (up.granted) {
        permissions.set(up.permission.name, up.permission)
      } else {
        permissions.delete(up.permission.name)
      }
    })

    return Array.from(permissions.values())
  }

  /**
   * Get permissions grouped by module
   */
  getPermissionsByModule(): Record<string, Permission[]> {
    const allPermissions = this.getAllPermissions()
    const grouped: Record<string, Permission[]> = {}

    allPermissions.forEach(permission => {
      if (!grouped[permission.module]) {
        grouped[permission.module] = []
      }
      grouped[permission.module].push(permission)
    })

    return grouped
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create a permission checker instance for a user
 */
export function createPermissionChecker(user: UserWithPermissions): PermissionChecker {
  return new PermissionChecker(user)
}

/**
 * Get role by name
 */
export function getRoleByName(roleName: string): Role | null {
  const roleConfig = ROLES[roleName]
  if (!roleConfig) return null

  return {
    ...roleConfig,
    permissions: roleConfig.permissionNames.map(name => PERMISSIONS[name]).filter(Boolean)
  }
}

/**
 * Get all available roles
 */
export function getAllRoles(): Role[] {
  return Object.values(ROLES).map(roleConfig => ({
    ...roleConfig,
    permissions: roleConfig.permissionNames.map(name => PERMISSIONS[name]).filter(Boolean)
  }))
}

/**
 * Get permissions by module
 */
export function getPermissionsByModule(moduleName: string): Permission[] {
  return Object.values(PERMISSIONS).filter(p => p.module === moduleName)
}

/**
 * Simple permission check function for use in API routes
 */
export function hasPermission(roleName: string, permissionName: string): boolean {
  const role = getRoleByName(roleName);
  if (!role) return false;
  
  // Super admin has all permissions
  if (role.level === 1) return true;
  
  return role.permissions.some(p => p.name === permissionName);
}

/**
 * Check if a role can be assigned by another role
 */
export function canAssignRole(assignerRole: Role, targetRole: Role): boolean {
  // Super admin can assign any role
  if (assignerRole.level === 1) {
    return true
  }

  // Can only assign roles with higher level numbers (lower privileges)
  return assignerRole.level < targetRole.level
}

/**
 * Get default role for new users
 */
export function getDefaultRole(): Role {
  return getRoleByName('customer')!
}

/**
 * Validate permission name format
 */
export function isValidPermissionName(permissionName: string): boolean {
  const pattern = /^[a-z]+\.[a-z]+$/
  return pattern.test(permissionName)
}

/**
 * Create permission name
 */
export function createPermissionName(module: string, action: string): string {
  return `${module.toLowerCase()}.${action.toLowerCase()}`
}

