'use client'

import { useState, useEffect } from 'react'
import { ROLES, PERMISSIONS } from '@/lib/permissions'

interface User {
  id: string
  role: string
  permissions: string[]
  courseIds: string[]
}

export function usePermissions() {
  // Mock user for testing - in real app this would come from auth context
  const [currentUser] = useState<User>({
    id: 'test-user',
    role: 'superadmin',
    permissions: Object.keys(PERMISSIONS),
    courseIds: ['test-course-1', 'test-course-2']
  })

  const hasPermission = (permission: string, courseId?: string): boolean => {
    if (!currentUser) return false
    
    // SuperAdmin has all permissions
    if (currentUser.role === 'superadmin') return true
    
    // Check if user has the specific permission
    if (!currentUser.permissions.includes(permission)) return false
    
    // If courseId is specified, check if user has access to that course
    if (courseId && !currentUser.courseIds.includes(courseId)) return false
    
    return true
  }

  const hasRole = (role: string): boolean => {
    if (!currentUser) return false
    return currentUser.role === role
  }

  const hasMinRoleLevel = (minLevel: number): boolean => {
    if (!currentUser) return false
    
    const userRole = ROLES[currentUser.role as keyof typeof ROLES]
    if (!userRole) return false
    
    return userRole.level <= minLevel
  }

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!currentUser) return false
    return permissions.some(permission => hasPermission(permission))
  }

  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!currentUser) return false
    return permissions.every(permission => hasPermission(permission))
  }

  const canAccessCourse = (courseId: string): boolean => {
    if (!currentUser) return false
    
    // SuperAdmin can access all courses
    if (currentUser.role === 'superadmin') return true
    
    // Check if user has access to specific course
    return currentUser.courseIds.includes(courseId)
  }

  const getUserPermissions = (): string[] => {
    return currentUser?.permissions || []
  }

  const getUserRole = () => {
    if (!currentUser) return null
    return ROLES[currentUser.role as keyof typeof ROLES] || null
  }

  return {
    currentUser,
    hasPermission,
    hasRole,
    hasMinRoleLevel,
    hasAnyPermission,
    hasAllPermissions,
    canAccessCourse,
    getUserPermissions,
    getUserRole,
    isAuthenticated: !!currentUser,
    isLoading: false // In real app, this would track auth loading state
  }
}

