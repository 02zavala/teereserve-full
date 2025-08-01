"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface Affiliate {
  id: string
  user: {
    id: string
    name: string
    email: string
    phone?: string
  }
  commissionRate: number
  referralCode: string
  createdAt: string
  updatedAt: string
  commissions: {
    id: string
    amount: number
    status: string
    createdAt: string
  }[]
}

export default function AffiliatesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [affiliates, setAffiliates] = useState<Affiliate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/auth/signin")
      return
    }

    fetchAffiliates()
  }, [session, status, router])

  const fetchAffiliates = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/affiliates")
      
      if (!response.ok) {
        throw new Error("Error al cargar afiliados")
      }

      const data = await response.json()
      setAffiliates(data.affiliates || [])
    } catch (error) {
      console.error("Error fetching affiliates:", error)
      setError("Error al cargar la lista de afiliados")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN"
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  }

  const getTotalCommissions = (affiliate: Affiliate) => {
    return affiliate.commissions.reduce((total, commission) => {
      return total + parseFloat(commission.amount.toString())
    }, 0)
  }

  const getPendingCommissions = (affiliate: Affiliate) => {
    return affiliate.commissions
      .filter(c => c.status.toLowerCase() === "pending")
      .reduce((total, commission) => {
        return total + parseFloat(commission.amount.toString())
      }, 0)
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
                Gestión de Afiliados
              </h1>
              <p className="text-golf-green-700">
                Administra afiliados, comisiones y códigos de referencia
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
                Total Afiliados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-golf-green-700">
                {affiliates.length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-golf-green-600">
                Comisiones Totales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-golf-green-700">
                {formatCurrency(
                  affiliates.reduce((total, affiliate) => 
                    total + getTotalCommissions(affiliate), 0
                  )
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-golf-green-600">
                Comisiones Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-golf-green-700">
                {formatCurrency(
                  affiliates.reduce((total, affiliate) => 
                    total + getPendingCommissions(affiliate), 0
                  )
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-golf-green-600">
                Tasa Promedio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-golf-green-700">
                {affiliates.length > 0 
                  ? `${(affiliates.reduce((total, affiliate) => 
                      total + parseFloat(affiliate.commissionRate.toString()), 0
                    ) / affiliates.length).toFixed(1)}%`
                  : "0%"
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Affiliates Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-golf-green-600">Lista de Afiliados</CardTitle>
            <CardDescription>
              Todos los afiliados registrados con sus comisiones y códigos de referencia
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={fetchAffiliates} className="bg-golf-green-600 hover:bg-golf-green-700">
                  Reintentar
                </Button>
              </div>
            ) : affiliates.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-golf-green-700">No hay afiliados registrados</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-golf-beige-300">
                      <th className="text-left py-3 px-4 font-semibold text-golf-green-600">
                        Afiliado
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-golf-green-600">
                        Código de Referencia
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-golf-green-600">
                        Tasa de Comisión
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-golf-green-600">
                        Comisiones Totales
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-golf-green-600">
                        Pendientes
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-golf-green-600">
                        Registro
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {affiliates.map((affiliate) => (
                      <tr key={affiliate.id} className="border-b border-golf-beige-200 hover:bg-golf-beige-50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-golf-green-700">
                              {affiliate.user.name || "Sin nombre"}
                            </div>
                            <div className="text-sm text-golf-green-600">
                              {affiliate.user.email}
                            </div>
                            {affiliate.user.phone && (
                              <div className="text-sm text-golf-green-600">
                                {affiliate.user.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="font-mono">
                            {affiliate.referralCode}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-golf-green-700">
                          {parseFloat(affiliate.commissionRate.toString()).toFixed(1)}%
                        </td>
                        <td className="py-3 px-4 text-golf-green-700 font-medium">
                          {formatCurrency(getTotalCommissions(affiliate))}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-golf-green-700 font-medium">
                            {formatCurrency(getPendingCommissions(affiliate))}
                          </div>
                          {getPendingCommissions(affiliate) > 0 && (
                            <Badge className={getStatusBadgeColor("pending")} variant="outline">
                              Pendiente
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-golf-green-700 text-sm">
                          {formatDate(affiliate.createdAt)}
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

