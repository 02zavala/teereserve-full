'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'
import { 
  Calendar, DollarSign, Users, Star, TrendingUp, TrendingDown,
  MapPin, Clock, Phone, Mail, Eye, Edit, Trash2, CheckCircle,
  AlertCircle, Filter, Download, RefreshCw
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface DashboardMetrics {
  totalBookings: number
  totalRevenue: number
  dailyRevenue: number
  activeUsers: number
  averageRating: number
  topCourse: string
  recentBookings: BookingData[]
  revenueData: RevenueData[]
  coursePopularity: CourseData[]
  userActivity: UserActivityData[]
  recentReviews: ReviewData[]
}

interface BookingData {
  id: string
  courseName: string
  customerName: string
  date: string
  time: string
  players: number
  amount: number
  status: 'confirmed' | 'pending' | 'cancelled'
  createdAt: string
}

interface RevenueData {
  date: string
  revenue: number
  bookings: number
}

interface CourseData {
  name: string
  bookings: number
  revenue: number
  rating: number
}

interface UserActivityData {
  date: string
  newUsers: number
  activeUsers: number
  bookings: number
}

interface ReviewData {
  id: string
  courseName: string
  customerName: string
  rating: number
  comment: string
  date: string
  status: 'pending' | 'approved' | 'rejected'
}

export default function AdminDashboard() {
  const { t } = useLanguage()
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDateRange, setSelectedDateRange] = useState('7d')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [selectedDateRange])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Simulate API call - In production, this would fetch real data
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const mockData: DashboardMetrics = {
        totalBookings: 1247,
        totalRevenue: 187650,
        dailyRevenue: 8420,
        activeUsers: 892,
        averageRating: 4.7,
        topCourse: 'Cabo Real Golf Club',
        recentBookings: [
          {
            id: 'TRG-001',
            courseName: 'Cabo Real Golf Club',
            customerName: 'Oscar Gómez Test',
            date: '2025-07-15',
            time: '09:00',
            players: 4,
            amount: 560,
            status: 'confirmed',
            createdAt: '2025-07-13T17:27:00Z'
          },
          {
            id: 'TRG-002',
            courseName: 'El Dorado Golf Course',
            customerName: 'María González',
            date: '2025-07-16',
            time: '14:30',
            players: 2,
            amount: 280,
            status: 'confirmed',
            createdAt: '2025-07-13T16:45:00Z'
          },
          {
            id: 'TRG-003',
            courseName: 'Palmilla Golf Club',
            customerName: 'Carlos Rodríguez',
            date: '2025-07-17',
            time: '11:00',
            players: 3,
            amount: 525,
            status: 'pending',
            createdAt: '2025-07-13T15:30:00Z'
          }
        ],
        revenueData: [
          { date: '07/07', revenue: 12400, bookings: 18 },
          { date: '08/07', revenue: 15600, bookings: 22 },
          { date: '09/07', revenue: 18200, bookings: 26 },
          { date: '10/07', revenue: 14800, bookings: 21 },
          { date: '11/07', revenue: 16900, bookings: 24 },
          { date: '12/07', revenue: 19500, bookings: 28 },
          { date: '13/07', revenue: 21300, bookings: 31 }
        ],
        coursePopularity: [
          { name: 'Cabo Real Golf Club', bookings: 156, revenue: 43680, rating: 4.8 },
          { name: 'El Dorado Golf Course', bookings: 134, revenue: 37520, rating: 4.6 },
          { name: 'Palmilla Golf Club', bookings: 128, revenue: 35840, rating: 4.7 },
          { name: 'Querencia Golf Club', bookings: 98, revenue: 27440, rating: 4.5 }
        ],
        userActivity: [
          { date: '07/07', newUsers: 12, activeUsers: 156, bookings: 18 },
          { date: '08/07', newUsers: 18, activeUsers: 168, bookings: 22 },
          { date: '09/07', newUsers: 15, activeUsers: 172, bookings: 26 },
          { date: '10/07', newUsers: 22, activeUsers: 185, bookings: 21 },
          { date: '11/07', newUsers: 19, activeUsers: 191, bookings: 24 },
          { date: '12/07', newUsers: 25, activeUsers: 203, bookings: 28 },
          { date: '13/07', newUsers: 28, activeUsers: 218, bookings: 31 }
        ],
        recentReviews: [
          {
            id: 'REV-001',
            courseName: 'Cabo Real Golf Club',
            customerName: 'Ana Martínez',
            rating: 5,
            comment: 'Experiencia increíble! Las vistas al mar son espectaculares y el campo está en perfectas condiciones.',
            date: '2025-07-13',
            status: 'pending'
          },
          {
            id: 'REV-002',
            courseName: 'El Dorado Golf Course',
            customerName: 'Roberto Silva',
            rating: 4,
            comment: 'Muy buen campo, staff amable y instalaciones limpias. Definitivamente regresaré.',
            date: '2025-07-12',
            status: 'approved'
          }
        ]
      }
      
      setMetrics(mockData)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadDashboardData()
    setRefreshing(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      case 'cancelled': return <AlertCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-golf-green-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Cargando Dashboard</h2>
          <p className="text-gray-600">Obteniendo métricas y datos...</p>
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error al cargar datos</h2>
          <p className="text-gray-600 mb-4">No se pudieron obtener las métricas del dashboard</p>
          <Button onClick={loadDashboardData} className="bg-golf-green-600 hover:bg-golf-green-700">
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  const COLORS = ['#059669', '#0891b2', '#7c3aed', '#dc2626', '#ea580c']

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
              <p className="text-gray-600 mt-1">Panel de control y métricas de TeeReserve Golf</p>
            </div>
            <div className="flex items-center space-x-4">
              <select 
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-golf-green-500"
              >
                <option value="7d">Últimos 7 días</option>
                <option value="30d">Últimos 30 días</option>
                <option value="90d">Últimos 90 días</option>
              </select>
              <Button 
                onClick={handleRefresh}
                disabled={refreshing}
                variant="outline"
                className="flex items-center"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Reservas</p>
                  <p className="text-3xl font-bold text-gray-900">{metrics.totalBookings.toLocaleString()}</p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +12% vs mes anterior
                  </p>
                </div>
                <div className="bg-golf-green-100 p-3 rounded-full">
                  <Calendar className="w-6 h-6 text-golf-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                  <p className="text-3xl font-bold text-gray-900">{formatCurrency(metrics.totalRevenue)}</p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +18% vs mes anterior
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
                  <p className="text-3xl font-bold text-gray-900">{metrics.activeUsers.toLocaleString()}</p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +8% vs mes anterior
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rating Promedio</p>
                  <p className="text-3xl font-bold text-gray-900">{metrics.averageRating}</p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +0.2 vs mes anterior
                  </p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campo de Pruebas Destacado */}
        <Card className="mb-8 border-golf-green-200 bg-golf-green-50">
          <CardHeader>
            <CardTitle className="flex items-center text-golf-green-800">
              <MapPin className="w-5 h-5 mr-2" />
              Campo Habilitado para Pruebas y Demos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white rounded-lg p-6 border border-golf-green-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Cabo Real Golf Club</h3>
                  <p className="text-gray-600">Los Cabos, Baja California Sur</p>
                  <div className="flex items-center mt-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium ml-1">4.8 (245 reseñas)</span>
                  </div>
                </div>
                <Badge className="bg-golf-green-600 text-white">
                  Campo de Pruebas Activo
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">URL de Prueba:</span>
                  <p className="text-golf-green-600 break-all">
                    https://3000-ir6bvc8pzlmik99be008e-497a3f57.manusvm.computer/courses/1
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Funcionalidades Activas:</span>
                  <p className="text-gray-600">Reservas, Pagos Test, Confirmaciones</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Estado:</span>
                  <p className="text-green-600 font-medium">✅ Listo para demos</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts and Analytics */}
        <Tabs defaultValue="revenue" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="revenue">Ingresos</TabsTrigger>
            <TabsTrigger value="bookings">Reservas</TabsTrigger>
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="reviews">Reseñas</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ingresos por Día</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={metrics.revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Area type="monotone" dataKey="revenue" stroke="#059669" fill="#059669" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Popularidad por Campo</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={metrics.coursePopularity}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="bookings"
                      >
                        {metrics.coursePopularity.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Reservas Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{booking.customerName}</p>
                          <p className="text-sm text-gray-600">{booking.courseName}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(booking.date).toLocaleDateString('es-ES')} a las {booking.time}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{formatCurrency(booking.amount)}</p>
                        <p className="text-sm text-gray-600">{booking.players} jugadores</p>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Actividad de Usuarios</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={metrics.userActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="newUsers" stroke="#059669" name="Nuevos Usuarios" />
                    <Line type="monotone" dataKey="activeUsers" stroke="#0891b2" name="Usuarios Activos" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Reseñas Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.recentReviews.map((review) => (
                    <div key={review.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{review.customerName}</span>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <Badge className={getStatusColor(review.status)}>
                          {review.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{review.courseName}</p>
                      <p className="text-gray-800">{review.comment}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(review.date).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

