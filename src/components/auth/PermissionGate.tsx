'use client'

import React from 'react'
import { usePermissions } from '@/hooks/usePermissions'
import { ROLES, PERMISSIONS } from '@/lib/permissions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, User, Lock, CheckCircle, XCircle } from 'lucide-react'

interface PermissionGateProps {
  permission?: string
  role?: string
  minRoleLevel?: number
  courseId?: string
  showError?: boolean
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function PermissionGate({
  permission,
  role,
  minRoleLevel,
  courseId,
  showError = false,
  fallback,
  children
}: PermissionGateProps) {
  const { hasPermission, hasRole, hasMinRoleLevel, currentUser } = usePermissions()

  // For testing purposes, we'll simulate a user with SuperAdmin role
  const mockUser = {
    id: 'test-user',
    role: 'superadmin',
    permissions: Object.keys(PERMISSIONS),
    courseIds: ['test-course-1', 'test-course-2']
  }

  let hasAccess = true

  // Check permission
  if (permission) {
    hasAccess = hasAccess && mockUser.permissions.includes(permission)
  }

  // Check role
  if (role) {
    hasAccess = hasAccess && mockUser.role === role
  }

  // Check minimum role level
  if (minRoleLevel) {
    const userRole = ROLES[mockUser.role as keyof typeof ROLES]
    hasAccess = hasAccess && userRole && userRole.level <= minRoleLevel
  }

  // Check course access
  if (courseId) {
    hasAccess = hasAccess && (
      mockUser.role === 'superadmin' || 
      mockUser.courseIds.includes(courseId)
    )
  }

  if (!hasAccess) {
    if (showError) {
      return (
        <Alert className="border-red-200 bg-red-50">
          <Lock className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Access denied. Required: {permission || role || `Role level ${minRoleLevel}`}
          </AlertDescription>
        </Alert>
      )
    }
    return fallback || null
  }

  return <>{children}</>
}

// Permission checking components
export function Can({ permission, children, fallback }: { permission: string, children: React.ReactNode, fallback?: React.ReactNode }) {
  return (
    <PermissionGate permission={permission} fallback={fallback}>
      {children}
    </PermissionGate>
  )
}

export function IsRole({ role, children, fallback }: { role: string, children: React.ReactNode, fallback?: React.ReactNode }) {
  return (
    <PermissionGate role={role} fallback={fallback}>
      {children}
    </PermissionGate>
  )
}

export function MinRoleLevel({ level, children, fallback }: { level: number, children: React.ReactNode, fallback?: React.ReactNode }) {
  return (
    <PermissionGate minRoleLevel={level} fallback={fallback}>
      {children}
    </PermissionGate>
  )
}

// Permission debugger for testing
export function PermissionDebugger() {
  const mockUser = {
    id: 'test-user',
    role: 'superadmin',
    permissions: Object.keys(PERMISSIONS),
    courseIds: ['test-course-1', 'test-course-2']
  }

  const roleInfo = ROLES[mockUser.role as keyof typeof ROLES]

  return (
    <div className="space-y-6">
      {/* Current User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Current User (Mock)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700">User ID</p>
              <p className="text-sm text-gray-600">{mockUser.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Role</p>
              <Badge variant="outline">{roleInfo?.displayName}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Role Level</p>
              <p className="text-sm text-gray-600">{roleInfo?.level}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Permissions</p>
              <p className="text-sm text-gray-600">{mockUser.permissions.length} permissions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* All Roles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Available Roles</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(ROLES).map((role) => (
              <div key={role.id} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{role.displayName}</h4>
                  <Badge variant={role.id === mockUser.role ? 'default' : 'outline'}>
                    Level {role.level}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{role.description}</p>
                <p className="text-xs text-gray-500">{role.permissionNames.length} permissions</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Permission Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lock className="h-5 w-5" />
            <span>Permission Categories</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {['courses', 'bookings', 'users', 'forms', 'affiliate', 'analytics', 'system'].map((module) => {
              const modulePermissions = Object.values(PERMISSIONS).filter(p => p.module === module)
              const hasModuleAccess = modulePermissions.some(p => mockUser.permissions.includes(p.id))
              
              return (
                <div key={module} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium capitalize">{module}</h4>
                    <div className="flex items-center space-x-2">
                      {hasModuleAccess ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <Badge variant="outline">{modulePermissions.length} permissions</Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {modulePermissions.map((permission) => {
                      const hasPermission = mockUser.permissions.includes(permission.id)
                      return (
                        <div
                          key={permission.id}
                          className={`text-xs p-2 rounded ${
                            hasPermission 
                              ? 'bg-green-50 text-green-800 border border-green-200' 
                              : 'bg-gray-50 text-gray-600 border border-gray-200'
                          }`}
                        >
                          {permission.action}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Permission Tests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5" />
            <span>Permission Tests</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { test: 'Can create courses', permission: 'courses.create' },
              { test: 'Can manage bookings', permission: 'bookings.manage' },
              { test: 'Can view analytics', permission: 'analytics.view' },
              { test: 'Can manage forms', permission: 'forms.create' },
              { test: 'Can manage affiliates', permission: 'affiliate.manage_all' },
              { test: 'Can access system settings', permission: 'system.settings' }
            ].map(({ test, permission }) => {
              const hasPermission = mockUser.permissions.includes(permission)
              return (
                <div key={permission} className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">{test}</span>
                  <div className="flex items-center space-x-2">
                    {hasPermission ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <Badge variant={hasPermission ? 'default' : 'outline'}>
                      {hasPermission ? 'Allowed' : 'Denied'}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

