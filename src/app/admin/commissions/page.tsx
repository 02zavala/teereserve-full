"use client"

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  DollarSign, 
  Clock, 
  CheckCircle, 
  X,
  Filter,
  Download,
  Users,
  Calendar,
  MapPin
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Commission {
  id: string
  amount: number
  status: string
  createdAt: string
  affiliate: {
    id: string
    referralCode: string
    user: {
      name: string
      email: string
    }
  }
  booking: {
    id: string
    bookingDate: string
    numberOfPlayers: number
    totalPrice: number
    user: {
      name: string
      email: string
    }
    golfCourse: {
      name: string
      location: string
    }
  }
}

interface CommissionSummary {
  total: number
  pending: number
  paid: number
  count: number
}

export default function AdminCommissionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [summary, setSummary] = useState<CommissionSummary>({
    total: 0,
    pending: 0,
    paid: 0,
    count: 0
  })
  const [loading, setLoading] = useState(true)
  const [selectedCommissions, setSelectedCommissions] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [affiliateFilter, setAffiliateFilter] = useState<string>(searchParams?.get('affiliateId') || 'all')

  // Redirect if not authenticated or not SuperAdmin
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }
    
    if (session.user.role !== 'SuperAdmin') {
      router.push('/denied')
      return
    }
  }, [session, status, router])

  // Fetch commissions
  useEffect(() => {
    if (session?.user.role === 'SuperAdmin') {
      fetchCommissions()
    }
  }, [session, statusFilter, affiliateFilter])

  const fetchCommissions = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (affiliateFilter !== 'all') params.append('affiliateId', affiliateFilter)

      const response = await fetch(`/api/commissions?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setCommissions(data.commissions || [])
        setSummary(data.summary || { total: 0, pending: 0, paid: 0, count: 0 })
      } else {
        console.error('Failed to fetch commissions')
      }
    } catch (error) {
      console.error('Error fetching commissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateCommissionStatus = async (commissionId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/commissions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: commissionId, status: newStatus }),
      })

      if (response.ok) {
        fetchCommissions()
      } else {
        console.error('Failed to update commission status')
      }
    } catch (error) {
      console.error('Error updating commission status:', error)
    }
  }

  const bulkUpdateCommissions = async (newStatus: string) => {
    if (selectedCommissions.length === 0) return

    try {
      const response = await fetch('/api/commissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          commissionIds: selectedCommissions, 
          status: newStatus 
        }),
      })

      if (response.ok) {
        setSelectedCommissions([])
        fetchCommissions()
      } else {
        console.error('Failed to bulk update commissions')
      }
    } catch (error) {
      console.error('Error bulk updating commissions:', error)
    }
  }

  const toggleCommissionSelection = (commissionId: string) => {
    setSelectedCommissions(prev => 
      prev.includes(commissionId)
        ? prev.filter(id => id !== commissionId)
        : [...prev, commissionId]
    )
  }

  const selectAllCommissions = () => {
    if (selectedCommissions.length === commissions.length) {
      setSelectedCommissions([])
    } else {
      setSelectedCommissions(commissions.map(c => c.id))
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Comisiones</h1>
          <p className="text-gray-600">
            Revisa y aprueba pagos de comisiones a afiliados
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Comisiones</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${summary.total.toLocaleString()} MXN
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.count} comisiones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ${summary.pending.toLocaleString()} MXN
            </div>
            <p className="text-xs text-muted-foreground">
              Requieren aprobación
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${summary.paid.toLocaleString()} MXN
            </div>
            <p className="text-xs text-muted-foreground">
              Ya transferidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa Promedio</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5.2%</div>
            <p className="text-xs text-muted-foreground">
              Comisión promedio
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Bulk Actions */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">Filtros:</span>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="paid">Pagadas</SelectItem>
                  <SelectItem value="cancelled">Canceladas</SelectItem>
                </SelectContent>
              </Select>

              <Select value={affiliateFilter} onValueChange={setAffiliateFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Afiliado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {/* Add affiliate options dynamically */}
                </SelectContent>
              </Select>
            </div>

            {selectedCommissions.length > 0 && (
              <div className="flex gap-2 items-center">
                <span className="text-sm text-gray-600">
                  {selectedCommissions.length} seleccionadas
                </span>
                <Button
                  size="sm"
                  onClick={() => bulkUpdateCommissions('paid')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Marcar como Pagadas
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => bulkUpdateCommissions('cancelled')}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Commissions List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Comisiones</CardTitle>
              <CardDescription>
                Todas las comisiones generadas por afiliados
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedCommissions.length === commissions.length && commissions.length > 0}
                onCheckedChange={selectAllCommissions}
              />
              <span className="text-sm">Seleccionar todo</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {commissions.length > 0 ? (
            <div className="space-y-4">
              {commissions.map((commission) => (
                <div key={commission.id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-4 mb-4">
                    <Checkbox
                      checked={selectedCommissions.includes(commission.id)}
                      onCheckedChange={() => toggleCommissionSelection(commission.id)}
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant={
                              commission.status === 'paid' ? 'default' :
                              commission.status === 'pending' ? 'secondary' : 'destructive'
                            }
                          >
                            {commission.status === 'paid' ? 'Pagado' :
                             commission.status === 'pending' ? 'Pendiente' : 'Cancelado'}
                          </Badge>
                          <span className="font-bold text-green-600 text-lg">
                            ${commission.amount.toLocaleString()} MXN
                          </span>
                          <Badge variant="outline" className="font-mono">
                            {commission.affiliate.referralCode}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          {commission.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => updateCommissionStatus(commission.id, 'paid')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Aprobar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateCommissionStatus(commission.id, 'cancelled')}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Rechazar
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Users className="h-3 w-3 text-gray-400" />
                              <span className="font-medium">Afiliado:</span>
                              <span>{commission.affiliate.user.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3 text-gray-400" />
                              <span className="font-medium">Campo:</span>
                              <span>{commission.booking.golfCourse.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              <span className="font-medium">Fecha de juego:</span>
                              <span>
                                {format(new Date(commission.booking.bookingDate), 'dd MMM yyyy', { locale: es })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="space-y-1">
                            <div>
                              <span className="font-medium">Cliente:</span>
                              <span className="ml-2">{commission.booking.user.name}</span>
                            </div>
                            <div>
                              <span className="font-medium">Jugadores:</span>
                              <span className="ml-2">{commission.booking.numberOfPlayers}</span>
                            </div>
                            <div>
                              <span className="font-medium">Total reserva:</span>
                              <span className="ml-2">${commission.booking.totalPrice.toLocaleString()} MXN</span>
                            </div>
                            <div>
                              <span className="font-medium">Generada:</span>
                              <span className="ml-2">
                                {format(new Date(commission.createdAt), 'dd MMM yyyy HH:mm', { locale: es })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No hay comisiones para mostrar</p>
              <p className="text-sm">Las comisiones aparecerán cuando los afiliados generen reservas</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

