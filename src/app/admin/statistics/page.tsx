"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  MapPin,
  Download,
  RefreshCw
} from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface StatisticsData {
  revenueData: Array<{
    month: string
    revenue: number
    bookings: number
  }>
  userGrowthData: Array<{
    month: string
    users: number
    newUsers: number
  }>
  golfCourseData: Array<{
    name: string
    bookings: number
    revenue: number
  }>
  bookingStatusData: Array<{
    name: string
    value: number
    color: string
  }>
  monthlyStats: {
    totalRevenue: number
    totalBookings: number
    totalUsers: number
    averageBookingValue: number
    revenueGrowth: number
    bookingGrowth: number
    userGrowth: number
  }
}

export default function AdminStatisticsPage() {
  const [data, setData] = useState<StatisticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('6months')

  useEffect(() => {
    fetchStatistics()
  }, [timeRange])

  const fetchStatistics = async () => {
    try {
      // Mock data - replace with actual API call
      const mockData: StatisticsData = {
        revenueData: [
          { month: 'Jun', revenue: 145000, bookings: 52 },
          { month: 'Jul', revenue: 189000, bookings: 68 },
          { month: 'Ago', revenue: 234000, bookings: 84 },
          { month: 'Sep', revenue: 198000, bookings: 71 },
          { month: 'Oct', revenue: 267000, bookings: 96 },
          { month: 'Nov', revenue: 312000, bookings: 112 },
          { month: 'Dic', revenue: 289000, bookings: 104 }
        ],
        userGrowthData: [
          { month: 'Jun', users: 850, newUsers: 45 },
          { month: 'Jul', users: 920, newUsers: 70 },
          { month: 'Ago', users: 1050, newUsers: 130 },
          { month: 'Sep', users: 1180, newUsers: 130 },
          { month: 'Oct', users: 1340, newUsers: 160 },
          { month: 'Nov', users: 1520, newUsers: 180 },
          { month: 'Dic', users: 1680, newUsers: 160 }
        ],
        golfCourseData: [
          { name: 'Cabo Real Golf Club', bookings: 245, revenue: 686000 },
          { name: 'El Camaleón Golf Club', bookings: 312, revenue: 1092000 },
          { name: 'Club de Golf La Ceiba', bookings: 189, revenue: 340200 },
          { name: 'Golf Club Bosques', bookings: 67, revenue: 147400 }
        ],
        bookingStatusData: [
          { name: 'Completadas', value: 68, color: '#10B981' },
          { name: 'Confirmadas', value: 22, color: '#3B82F6' },
          { name: 'Pendientes', value: 7, color: '#F59E0B' },
          { name: 'Canceladas', value: 3, color: '#EF4444' }
        ],
        monthlyStats: {
          totalRevenue: 2847650,
          totalBookings: 813,
          totalUsers: 1680,
          averageBookingValue: 3502,
          revenueGrowth: 15.2,
          bookingGrowth: 8.7,
          userGrowth: 12.3
        }
      }
      
      setData(mockData)
    } catch (error) {
      console.error('Error fetching statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    const isPositive = value >= 0
    return (
      <span className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
        {Math.abs(value).toFixed(1)}%
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!data) {
    return <div>Error loading statistics</div>
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Estadísticas y Análisis</h1>
          <p className="text-gray-600">
            Métricas de rendimiento y análisis de la plataforma
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Último mes</SelectItem>
              <SelectItem value="3months">3 meses</SelectItem>
              <SelectItem value="6months">6 meses</SelectItem>
              <SelectItem value="1year">1 año</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchStatistics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(data.monthlyStats.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatPercentage(data.monthlyStats.revenueGrowth)} desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reservas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.monthlyStats.totalBookings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {formatPercentage(data.monthlyStats.bookingGrowth)} desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Registrados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.monthlyStats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {formatPercentage(data.monthlyStats.userGrowth)} desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Promedio</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.monthlyStats.averageBookingValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Por reserva
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Ingresos y Reservas por Mes</CardTitle>
            <CardDescription>
              Evolución de ingresos y número de reservas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? formatCurrency(Number(value)) : value,
                    name === 'revenue' ? 'Ingresos' : 'Reservas'
                  ]}
                />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.1}
                  name="Ingresos"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="bookings"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  name="Reservas"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Crecimiento de Usuarios</CardTitle>
            <CardDescription>
              Usuarios totales y nuevos registros por mes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="users"
                  stackId="1"
                  stroke="#8B5CF6"
                  fill="#8B5CF6"
                  name="Usuarios Totales"
                />
                <Area
                  type="monotone"
                  dataKey="newUsers"
                  stackId="2"
                  stroke="#F59E0B"
                  fill="#F59E0B"
                  name="Nuevos Usuarios"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Golf Course Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Rendimiento por Campo</CardTitle>
            <CardDescription>
              Reservas e ingresos por campo de golf
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.golfCourseData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? formatCurrency(Number(value)) : value,
                    name === 'revenue' ? 'Ingresos' : 'Reservas'
                  ]}
                />
                <Legend />
                <Bar dataKey="bookings" fill="#3B82F6" name="Reservas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Booking Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Reservas</CardTitle>
            <CardDescription>
              Distribución por estado de las reservas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.bookingStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.bookingStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Golf Courses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Campos Más Populares
            </CardTitle>
            <CardDescription>
              Ranking por número de reservas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.golfCourseData
                .sort((a, b) => b.bookings - a.bookings)
                .map((course, index) => (
                  <div key={course.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{course.name}</p>
                        <p className="text-sm text-gray-600">{course.bookings} reservas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">
                        {formatCurrency(course.revenue)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(course.revenue / course.bookings)} promedio
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tendencias Mensuales
            </CardTitle>
            <CardDescription>
              Comparación con el mes anterior
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Ingresos</p>
                  <p className="text-sm text-gray-600">Crecimiento mensual</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(data.monthlyStats.totalRevenue)}</p>
                  {formatPercentage(data.monthlyStats.revenueGrowth)}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Reservas</p>
                  <p className="text-sm text-gray-600">Nuevas reservas</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{data.monthlyStats.totalBookings}</p>
                  {formatPercentage(data.monthlyStats.bookingGrowth)}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Usuarios</p>
                  <p className="text-sm text-gray-600">Registros nuevos</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{data.monthlyStats.totalUsers}</p>
                  {formatPercentage(data.monthlyStats.userGrowth)}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Valor Promedio</p>
                  <p className="text-sm text-gray-600">Por reserva</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(data.monthlyStats.averageBookingValue)}</p>
                  <span className="text-sm text-gray-600">Estable</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

