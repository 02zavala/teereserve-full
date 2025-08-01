'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { User, Shield, Building2, LogIn } from 'lucide-react'

interface ProtectedDashboardLinkProps {
  className?: string
  showIcon?: boolean
}

export function ProtectedDashboardLink({ 
  className = "text-green-100 hover:text-white transition-colors flex items-center group",
  showIcon = true 
}: ProtectedDashboardLinkProps) {
  const { data: session, status } = useSession()

  // Si está cargando, mostrar estado de carga
  if (status === 'loading') {
    return (
      <div className={className}>
        {showIcon && (
          <span className="w-1 h-1 bg-green-400 rounded-full mr-3 group-hover:bg-white transition-colors"></span>
        )}
        <span className="opacity-50">Cargando...</span>
      </div>
    )
  }

  // Si no hay sesión, redirigir al login
  if (!session) {
    return (
      <Link href="/auth/signin" className={className}>
        {showIcon && (
          <span className="w-1 h-1 bg-green-400 rounded-full mr-3 group-hover:bg-white transition-colors"></span>
        )}
        <LogIn className="w-4 h-4 mr-2" />
        Iniciar Sesión
      </Link>
    )
  }

  // Determinar la ruta del dashboard según el rol
  const getDashboardRoute = () => {
    const userRole = session.user?.role?.toLowerCase()
    
    switch (userRole) {
      case 'super_admin':
      case 'admin':
        return '/admin'
      case 'golf_course':
      case 'course_manager':
        return '/course-dashboard'
      case 'affiliate':
        return '/affiliate/dashboard'
      default:
        return '/dashboard' // Dashboard de jugador/usuario regular
    }
  }

  // Determinar el icono según el rol
  const getDashboardIcon = () => {
    const userRole = session.user?.role?.toLowerCase()
    
    switch (userRole) {
      case 'super_admin':
      case 'admin':
        return <Shield className="w-4 h-4 mr-2" />
      case 'golf_course':
      case 'course_manager':
        return <Building2 className="w-4 h-4 mr-2" />
      default:
        return <User className="w-4 h-4 mr-2" />
    }
  }

  // Determinar el texto según el rol
  const getDashboardText = () => {
    const userRole = session.user?.role?.toLowerCase()
    
    switch (userRole) {
      case 'super_admin':
        return 'Panel Super Admin'
      case 'admin':
        return 'Panel Administrativo'
      case 'golf_course':
      case 'course_manager':
        return 'Gestión del Campo'
      case 'affiliate':
        return 'Panel de Afiliado'
      default:
        return 'Mi Dashboard'
    }
  }

  return (
    <Link href={getDashboardRoute()} className={className}>
      {showIcon && (
        <span className="w-1 h-1 bg-green-400 rounded-full mr-3 group-hover:bg-white transition-colors"></span>
      )}
      {getDashboardIcon()}
      {getDashboardText()}
    </Link>
  )
}

