// Authentication and Authorization Middleware for TeeReserve V2.0

import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { createPermissionChecker, UserWithPermissions, getRoleByName } from '@/lib/permissions'

export interface AuthenticatedRequest extends NextRequest {
  user?: UserWithPermissions
  permissions?: ReturnType<typeof createPermissionChecker>
}

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================

/**
 * Verify JWT token and extract user information
 */
export async function authenticateUser(request: NextRequest): Promise<UserWithPermissions | null> {
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    })

    if (!token || !token.sub) {
      return null
    }

    // In a real implementation, you would fetch user data from database
    // For now, we'll simulate user data based on token
    const userData: UserWithPermissions = {
      id: token.sub,
      email: token.email || '',
      name: token.name || undefined,
      role: getRoleByName('customer')!, // Default role
      courseId: undefined, // Would be fetched from database
      userPermissions: [] // Would be fetched from database
    }

    return userData
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

/**
 * Require authentication middleware
 */
export function requireAuth() {
  return async (request: NextRequest) => {
    const user = await authenticateUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Add user to request context
    const response = NextResponse.next()
    response.headers.set('x-user-id', user.id)
    response.headers.set('x-user-role', user.role.name)
    
    return response
  }
}

// ============================================================================
// AUTHORIZATION MIDDLEWARE
// ============================================================================

/**
 * Require specific permission middleware
 */
export function requirePermission(permissionName: string) {
  return async (request: NextRequest) => {
    const user = await authenticateUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const permissions = createPermissionChecker(user)
    
    if (!permissions.hasPermission(permissionName)) {
      return NextResponse.json(
        { 
          error: 'Insufficient permissions',
          required: permissionName,
          userRole: user.role.name
        },
        { status: 403 }
      )
    }

    return NextResponse.next()
  }
}

/**
 * Require any of the specified permissions
 */
export function requireAnyPermission(permissionNames: string[]) {
  return async (request: NextRequest) => {
    const user = await authenticateUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const permissions = createPermissionChecker(user)
    
    if (!permissions.hasAnyPermission(permissionNames)) {
      return NextResponse.json(
        { 
          error: 'Insufficient permissions',
          required: permissionNames,
          userRole: user.role.name
        },
        { status: 403 }
      )
    }

    return NextResponse.next()
  }
}

/**
 * Require specific role middleware
 */
export function requireRole(roleName: string) {
  return async (request: NextRequest) => {
    const user = await authenticateUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (user.role.name !== roleName) {
      return NextResponse.json(
        { 
          error: 'Insufficient role',
          required: roleName,
          userRole: user.role.name
        },
        { status: 403 }
      )
    }

    return NextResponse.next()
  }
}

/**
 * Require minimum role level middleware
 */
export function requireMinRoleLevel(minLevel: number) {
  return async (request: NextRequest) => {
    const user = await authenticateUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (user.role.level > minLevel) {
      return NextResponse.json(
        { 
          error: 'Insufficient role level',
          required: `Level ${minLevel} or higher`,
          userLevel: user.role.level
        },
        { status: 403 }
      )
    }

    return NextResponse.next()
  }
}

/**
 * Require course ownership or management
 */
export function requireCourseAccess(courseIdParam: string = 'courseId') {
  return async (request: NextRequest) => {
    const user = await authenticateUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Extract course ID from URL parameters
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const courseIdIndex = pathParts.findIndex(part => part === courseIdParam) + 1
    const courseId = pathParts[courseIdIndex] || url.searchParams.get(courseIdParam)

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID required' },
        { status: 400 }
      )
    }

    const permissions = createPermissionChecker(user)
    
    // Super admin can access any course
    if (user.role.level === 1) {
      return NextResponse.next()
    }

    // Check if user can manage this specific course
    if (!permissions.canManageCourse(courseId)) {
      return NextResponse.json(
        { 
          error: 'Cannot access this course',
          courseId,
          userCourseId: user.courseId
        },
        { status: 403 }
      )
    }

    return NextResponse.next()
  }
}

// ============================================================================
// UTILITY MIDDLEWARE
// ============================================================================

/**
 * Add user context to request
 */
export function addUserContext() {
  return async (request: NextRequest) => {
    const user = await authenticateUser(request)
    
    if (user) {
      const response = NextResponse.next()
      response.headers.set('x-user-id', user.id)
      response.headers.set('x-user-role', user.role.name)
      response.headers.set('x-user-course', user.courseId || '')
      return response
    }

    return NextResponse.next()
  }
}

/**
 * Log user activity
 */
export function logActivity(action: string, resource: string) {
  return async (request: NextRequest) => {
    const user = await authenticateUser(request)
    
    if (user) {
      // In a real implementation, you would log to database
      console.log(`User ${user.id} performed ${action} on ${resource}`, {
        userId: user.id,
        userRole: user.role.name,
        action,
        resource,
        timestamp: new Date().toISOString(),
        ip: request.ip || request.headers.get('x-forwarded-for'),
        userAgent: request.headers.get('user-agent')
      })
    }

    return NextResponse.next()
  }
}

/**
 * Rate limiting middleware
 */
export function rateLimit(maxRequests: number = 100, windowMs: number = 60000) {
  const requests = new Map<string, { count: number; resetTime: number }>()

  return async (request: NextRequest) => {
    const user = await authenticateUser(request)
    const identifier = user?.id || request.ip || 'anonymous'
    const now = Date.now()

    const userRequests = requests.get(identifier)
    
    if (!userRequests || now > userRequests.resetTime) {
      requests.set(identifier, { count: 1, resetTime: now + windowMs })
      return NextResponse.next()
    }

    if (userRequests.count >= maxRequests) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil((userRequests.resetTime - now) / 1000)
        },
        { status: 429 }
      )
    }

    userRequests.count++
    return NextResponse.next()
  }
}

// ============================================================================
// MIDDLEWARE COMPOSITION
// ============================================================================

/**
 * Compose multiple middleware functions
 */
export function composeMiddleware(...middlewares: Array<(request: NextRequest) => Promise<NextResponse>>) {
  return async (request: NextRequest) => {
    for (const middleware of middlewares) {
      const response = await middleware(request)
      if (response.status !== 200) {
        return response
      }
    }
    return NextResponse.next()
  }
}

/**
 * Create API route protection
 */
export function protectApiRoute(options: {
  requireAuth?: boolean
  permissions?: string[]
  anyPermission?: boolean
  roles?: string[]
  minRoleLevel?: number
  courseAccess?: boolean
  rateLimit?: { maxRequests: number; windowMs: number }
  logActivity?: { action: string; resource: string }
}) {
  const middlewares: Array<(request: NextRequest) => Promise<NextResponse>> = []

  // Add rate limiting if specified
  if (options.rateLimit) {
    middlewares.push(rateLimit(options.rateLimit.maxRequests, options.rateLimit.windowMs))
  }

  // Add authentication if required
  if (options.requireAuth) {
    middlewares.push(requireAuth())
  }

  // Add role-based access control
  if (options.minRoleLevel) {
    middlewares.push(requireMinRoleLevel(options.minRoleLevel))
  }

  if (options.roles && options.roles.length > 0) {
    middlewares.push(requireRole(options.roles[0])) // For simplicity, check first role
  }

  // Add permission-based access control
  if (options.permissions && options.permissions.length > 0) {
    if (options.anyPermission) {
      middlewares.push(requireAnyPermission(options.permissions))
    } else {
      middlewares.push(requirePermission(options.permissions[0])) // For simplicity, check first permission
    }
  }

  // Add course access control
  if (options.courseAccess) {
    middlewares.push(requireCourseAccess())
  }

  // Add activity logging
  if (options.logActivity) {
    middlewares.push(logActivity(options.logActivity.action, options.logActivity.resource))
  }

  return composeMiddleware(...middlewares)
}

// ============================================================================
// HELPER FUNCTIONS FOR API ROUTES
// ============================================================================

/**
 * Get authenticated user from request
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<UserWithPermissions | null> {
  return await authenticateUser(request)
}

/**
 * Check if user has permission (for use in API routes)
 */
export async function checkPermission(request: NextRequest, permissionName: string): Promise<boolean> {
  const user = await authenticateUser(request)
  if (!user) return false

  const permissions = createPermissionChecker(user)
  return permissions.hasPermission(permissionName)
}

/**
 * Get user permissions (for use in API routes)
 */
export async function getUserPermissions(request: NextRequest): Promise<ReturnType<typeof createPermissionChecker> | null> {
  const user = await authenticateUser(request)
  if (!user) return null

  return createPermissionChecker(user)
}

