import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { getTenantIdFromRequest } from "./lib/tenant"

export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl
    const tenantId = await getTenantIdFromRequest(req);
    const res = NextResponse.next();

    if (tenantId) {
      res.headers.set("x-tenant-id", tenantId);
    }

    // Rutas que requieren autenticación
    const protectedRoutes = ['/dashboard', '/admin', '/course-dashboard', '/affiliate/dashboard']
    
    // Verificar si la ruta actual está protegida
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
    
    if (isProtectedRoute && !token) {
      // Redirigir a login si no hay token
      return NextResponse.redirect(new URL('/auth/signin', req.url))
    }

    // Verificar permisos específicos por rol
    if (token && isProtectedRoute) {
      const userRole = token.role as string
      
      // Rutas de admin solo para super_admin y admin
      if (pathname.startsWith('/admin') && !['super_admin', 'admin'].includes(userRole)) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
      
      // Rutas de campo solo para golf_course y course_manager
      if (pathname.startsWith('/course-dashboard') && !['golf_course', 'course_manager', 'super_admin'].includes(userRole)) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
      
      // Rutas de afiliado solo para affiliate
      if (pathname.startsWith('/affiliate') && !['affiliate', 'super_admin'].includes(userRole)) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    return res
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Permitir acceso a rutas públicas
        const publicRoutes = ['/', '/courses', '/auth', '/api/auth']
        const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
        
        if (isPublicRoute) {
          return true
        }
        
        // Para rutas protegidas, verificar que hay token
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/course-dashboard/:path*',
    '/affiliate/:path*',
    '/bookings/:path*'
  ]
}

