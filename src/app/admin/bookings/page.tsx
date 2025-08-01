"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Calendar, 
  Search, 
  Filter,
  Download,
  Eye,
  MapPin,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Booking {
  id: string
  bookingDate: string
  teeTime: string
  numberOfPlayers: number
  totalPrice: number
  status: 'confirmed' | 'cancelled' | 'completed' | 'pending'
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded'
  createdAt: string
  user: {
    id: string
    name: string
    email: string
  }
  golfCourse: {
    id: string
    name: string
    location: string
  }
  discountCode?: {
    code: string
    discountAmount: number
  }
  affiliate?: {
    referralCode: string
    commissionAmount: number
  }
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      // Mock data - replace with actual API call
      const mockBookings: Booking[] = [
        {
          id: '1',
          bookingDate: '2024-12-15',
          teeTime: '09:00',
          numberOfPlayers: 4,
          totalPrice: 11200,
          status: 'confirmed',
          paymentStatus: 'paid',
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          user: {
            id: 'user1',
            name: 'Juan Pérez',
            email: 'juan@example.com'
          },
          golfCourse: {
            id: 'cabo-real',
            name: 'Cabo Real Golf Club',
            location: 'Los Cabos, BCS'
          },
          discountCode: {
            code: 'WELCOME10',
            discountAmount: 1120
          }
        },
        {
          id: '2',
          bookingDate: '2024-12-14',
          teeTime: '14:30',
          numberOfPlayers: 2,
          totalPrice: 5600,
          status: 'completed',
          paymentStatus: 'paid',
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          user: {
            id: 'user2',
            name: 'María González',
            email: 'maria@example.com'
          },
          golfCourse: {
            id: 'cabo-real',
            name: 'Cabo Real Golf Club',
            location: 'Los Cabos, BCS'
          },
          affiliate: {
            referralCode: 'TEE123',
            commissionAmount: 280
          }
        },
        {
          id: '3',
          bookingDate: '2024-12-16',
          teeTime: '11:00',
          numberOfPlayers: 3,
          totalPrice: 5400,
          status: 'cancelled',
          paymentStatus: 'refunded',
          createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
          user: {
            id: 'user3',
            name: 'Carlos Rodríguez',
            email: 'carlos@example.com'
          },
          golfCourse: {
            id: 'la-ceiba',
            name: 'Club de Golf La Ceiba',
            location: 'Mérida, Yucatán'
          }
        },
        {
          id: '4',
          bookingDate: '2024-12-17',
          teeTime: '08:00',
          numberOfPlayers: 1,
          totalPrice: 3500,
          status: 'pending',
          paymentStatus: 'pending',
          createdAt: new Date(Date.now() - 86400000 * 0.5).toISOString(),
          user: {
            id: 'user4',
            name: 'Ana López',
            email: 'ana@example.com'
          },
          golfCourse: {
            id: 'el-camaleon',
            name: 'El Camaleón Golf Club',
            location: 'Playa del Carmen, QR'
          }
        }
      ]
      
      setBookings(mockBookings)
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.golfCourse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter
    const matchesPayment = paymentFilter === 'all' || booking.paymentStatus === paymentFilter
    
    let matchesDate = true
    if (dateFilter !== 'all') {
      const bookingDate = new Date(booking.createdAt)
      const now = new Date()
      
      switch (dateFilter) {
        case 'today':
          matchesDate = bookingDate.toDateString() === now.toDateString()
          break
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          matchesDate = bookingDate >= weekAgo
          break
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          matchesDate = bookingDate >= monthAgo
          break
      }
    }
    
    return matchesSearch && matchesStatus && matchesPayment && matchesDate
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Confirmada
        </Badge>
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Completada
        </Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 border-red-200">
          <XCircle className="h-3 w-3 mr-1" />
          Cancelada
        </Badge>
      case 'pending':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">
          <Clock className="h-3 w-3 mr-1" />
          Pendiente
        </Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentBadge = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Pagado</Badge>
      case 'pending':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Pendiente</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Fallido</Badge>
      case 'refunded':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Reembolsado</Badge>
      default:
        return <Badge variant="outline">{paymentStatus}</Badge>
    }
  }

  const totalRevenue = bookings
    .filter(b => b.paymentStatus === 'paid')
    .reduce((sum, booking) => sum + booking.totalPrice, 0)

  const totalBookings = bookings.length
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'completed').length
  const pendingBookings = bookings.filter(b => b.status === 'pending').length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Historial de Reservas</h1>
          <p className="text-gray-600">
            Administra todas las reservas realizadas en la plataforma
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros Avanzados
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reservas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12% desde el mes pasado
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{confirmedBookings}</div>
            <p className="text-xs text-muted-foreground">
              {((confirmedBookings / totalBookings) * 100).toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalRevenue.toLocaleString()} MXN
            </div>
            <p className="text-xs text-muted-foreground">
              Pagos confirmados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingBookings}</div>
            <p className="text-xs text-muted-foreground">
              Requieren atención
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por cliente, email, campo o ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="confirmed">Confirmadas</SelectItem>
                  <SelectItem value="completed">Completadas</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="cancelled">Canceladas</SelectItem>
                </SelectContent>
              </Select>

              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Pago" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="paid">Pagado</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="failed">Fallido</SelectItem>
                  <SelectItem value="refunded">Reembolsado</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Fecha" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="week">Última semana</SelectItem>
                  <SelectItem value="month">Último mes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Reservas</CardTitle>
          <CardDescription>
            {filteredBookings.length} de {bookings.length} reservas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      #{booking.id}
                    </div>
                    {getStatusBadge(booking.status)}
                    {getPaymentBadge(booking.paymentStatus)}
                    
                    {booking.discountCode && (
                      <Badge variant="outline" className="text-purple-600 border-purple-200">
                        {booking.discountCode.code}
                      </Badge>
                    )}
                    
                    {booking.affiliate && (
                      <Badge variant="outline" className="text-blue-600 border-blue-200">
                        Afiliado: {booking.affiliate.referralCode}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        ${booking.totalPrice.toLocaleString()} MXN
                      </div>
                      {booking.discountCode && (
                        <div className="text-xs text-gray-500">
                          Descuento: -${booking.discountCode.discountAmount.toLocaleString()}
                        </div>
                      )}
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Cliente</span>
                    </div>
                    <p className="text-gray-900">{booking.user.name}</p>
                    <p className="text-gray-500">{booking.user.email}</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Campo</span>
                    </div>
                    <p className="text-gray-900">{booking.golfCourse.name}</p>
                    <p className="text-gray-500">{booking.golfCourse.location}</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Fecha y Hora</span>
                    </div>
                    <p className="text-gray-900">
                      {format(new Date(booking.bookingDate), 'dd MMM yyyy', { locale: es })}
                    </p>
                    <p className="text-gray-500">{booking.teeTime} - {booking.numberOfPlayers} jugadores</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Reservado</span>
                    </div>
                    <p className="text-gray-900">
                      {format(new Date(booking.createdAt), 'dd MMM yyyy', { locale: es })}
                    </p>
                    <p className="text-gray-500">
                      {format(new Date(booking.createdAt), 'HH:mm', { locale: es })}
                    </p>
                  </div>
                </div>
                
                {booking.affiliate && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        Comisión de afiliado ({booking.affiliate.referralCode}):
                      </span>
                      <span className="font-medium text-blue-600">
                        ${booking.affiliate.commissionAmount.toLocaleString()} MXN
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {filteredBookings.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No se encontraron reservas</p>
                <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

