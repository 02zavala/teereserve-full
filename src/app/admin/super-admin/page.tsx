"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: {
    name: string
    description?: string
  }
  createdAt: string
  updatedAt: string
}

export default function SuperAdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/auth/signin")
      return
    }

    // Check if user has admin privileges (you can adjust this logic)
    // For now, we'll allow access and let the API handle authorization
    fetchUsers()
  }, [session, status, router])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/users")
      
      if (!response.ok) {
        throw new Error("Error al cargar usuarios")
      }

      const data = await response.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error("Error fetching users:", error)
      setError("Error al cargar la lista de usuarios")
    } finally {
      setLoading(false)
    }
  }

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case "superadmin":
        return "bg-red-100 text-red-800"
      case "admin":
        return "bg-blue-100 text-blue-800"
      case "golfcourse":
        return "bg-green-100 text-green-800"
      case "promoter":
        return "bg-purple-100 text-purple-800"
      case "client":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-golf-green-50 to-golf-beige-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-golf-green-600 mx-auto mb-4"></div>
          <p className="text-golf-green-700">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-golf-green-50 to-golf-beige-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-golf-green-600 mb-2">
                Panel de Super Administrador
              </h1>
              <p className="text-golf-green-700">
                Gestión completa de usuarios y roles del sistema
              </p>
            </div>
            <Link href="/admin">
              <Button variant="outline" className="border-golf-green-600 text-golf-green-600 hover:bg-golf-green-50">
                ← Volver al Admin
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-golf-green-600">
                Total Usuarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-golf-green-700">
                {users.length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-golf-green-600">
                Administradores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-golf-green-700">
                {users.filter(u => u.role.name.toLowerCase().includes("admin")).length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-golf-green-600">
                Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-golf-green-700">
                {users.filter(u => u.role.name.toLowerCase() === "client").length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-golf-green-600">
                Campos de Golf
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-golf-green-700">
                {users.filter(u => u.role.name.toLowerCase() === "golfcourse").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-golf-green-600">Lista de Usuarios</CardTitle>
            <CardDescription>
              Todos los usuarios registrados en el sistema con sus roles y información
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={fetchUsers} className="bg-golf-green-600 hover:bg-golf-green-700">
                  Reintentar
                </Button>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-golf-green-700">No hay usuarios registrados</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-golf-beige-300">
                      <th className="text-left py-3 px-4 font-semibold text-golf-green-600">
                        Usuario
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-golf-green-600">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-golf-green-600">
                        Teléfono
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-golf-green-600">
                        Rol
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-golf-green-600">
                        Registro
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-golf-beige-200 hover:bg-golf-beige-50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-golf-green-700">
                              {user.name || "Sin nombre"}
                            </div>
                            <div className="text-sm text-golf-green-600">
                              ID: {user.id.slice(0, 8)}...
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-golf-green-700">
                          {user.email}
                        </td>
                        <td className="py-3 px-4 text-golf-green-700">
                          {user.phone || "No especificado"}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getRoleBadgeColor(user.role.name)}>
                            {user.role.name}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-golf-green-700 text-sm">
                          {formatDate(user.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

