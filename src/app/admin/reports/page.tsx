'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'
import { 
  Download, FileText, Calendar, DollarSign, Users, TrendingUp, 
  Filter, Mail, Clock, BarChart3, PieChart as PieChartIcon,
  FileSpreadsheet, FileImage, Settings, RefreshCw
} from 'lucide-react'

// Mock data para reportes
const revenueData = [
  { month: 'Ene', revenue: 45000, bookings: 120, avgPrice: 375 },
  { month: 'Feb', revenue: 52000, bookings: 140, avgPrice: 371 },
  { month: 'Mar', revenue: 48000, bookings: 128, avgPrice: 375 },
  { month: 'Abr', revenue: 61000, bookings: 165, avgPrice: 370 },
  { month: 'May', revenue: 58000, bookings: 155, avgPrice: 374 },
  { month: 'Jun', revenue: 67000, bookings: 180, avgPrice: 372 },
  { month: 'Jul', revenue: 72000, bookings: 195, avgPrice: 369 }
]

const courseRevenueData = [
  { name: 'Cabo Real Golf Club', revenue: 125000, bookings: 340, percentage: 35 },
  { name: 'Cabo del Sol Golf Club', revenue: 98000, bookings: 265, percentage: 28 },
  { name: 'Solmar Golf Links', revenue: 87000, bookings: 230, percentage: 24 },
  { name: 'Otros Campos', revenue: 45000, bookings: 120, percentage: 13 }
]

const userEngagementData = [
  { month: 'Ene', newUsers: 85, activeUsers: 450, retention: 68 },
  { month: 'Feb', newUsers: 92, activeUsers: 485, retention: 71 },
  { month: 'Mar', newUsers: 78, activeUsers: 520, retention: 69 },
  { month: 'Abr', newUsers: 105, activeUsers: 580, retention: 73 },
  { month: 'May', newUsers: 98, activeUsers: 615, retention: 75 },
  { month: 'Jun', newUsers: 112, activeUsers: 670, retention: 77 },
  { month: 'Jul', newUsers: 125, activeUsers: 720, retention: 79 }
]

const bookingTrendsData = [
  { hour: '06:00', bookings: 12 },
  { hour: '07:00', bookings: 28 },
  { hour: '08:00', bookings: 45 },
  { hour: '09:00', bookings: 62 },
  { hour: '10:00', bookings: 58 },
  { hour: '11:00', bookings: 52 },
  { hour: '12:00', bookings: 38 },
  { hour: '13:00', bookings: 35 },
  { hour: '14:00', bookings: 48 },
  { hour: '15:00', bookings: 55 },
  { hour: '16:00', bookings: 42 },
  { hour: '17:00', bookings: 25 }
]

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']

export default function ReportsPage() {
  const { t } = useLanguage()
  const [dateRange, setDateRange] = useState('last30days')
  const [selectedCourse, setSelectedCourse] = useState('all')
  const [reportType, setReportType] = useState('revenue')
  const [isGenerating, setIsGenerating] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Simular actualización de datos
  const refreshData = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setLastUpdated(new Date())
      setIsGenerating(false)
    }, 2000)
  }

  // Funciones de exportación
  const exportToCSV = (data: any[], filename: string) => {
    const csvContent = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const exportToPDF = async (reportName: string) => {
    setIsGenerating(true)
    // Simular generación de PDF
    setTimeout(() => {
      setIsGenerating(false)
      // En una implementación real, aquí se generaría el PDF
      alert(`Reporte PDF "${reportName}" generado exitosamente`)
    }, 3000)
  }

  const scheduleReport = () => {
    alert('Funcionalidad de programación de reportes configurada')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              📈 Panel de Reportes Empresariales
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-2">
              Análisis avanzado y reportería para toma de decisiones estratégicas
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              Actualizado: {lastUpdated.toLocaleTimeString()}
            </Badge>
            <Button 
              onClick={refreshData} 
              disabled={isGenerating}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Filtros y Controles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros y Configuración
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="dateRange">Período</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last7days">Últimos 7 días</SelectItem>
                    <SelectItem value="last30days">Últimos 30 días</SelectItem>
                    <SelectItem value="last3months">Últimos 3 meses</SelectItem>
                    <SelectItem value="last6months">Últimos 6 meses</SelectItem>
                    <SelectItem value="lastyear">Último año</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="course">Campo</Label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los campos</SelectItem>
                    <SelectItem value="cabo-real">Cabo Real Golf Club</SelectItem>
                    <SelectItem value="cabo-sol">Cabo del Sol Golf Club</SelectItem>
                    <SelectItem value="solmar">Solmar Golf Links</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="reportType">Tipo de Reporte</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="revenue">Ingresos</SelectItem>
                    <SelectItem value="bookings">Reservas</SelectItem>
                    <SelectItem value="users">Usuarios</SelectItem>
                    <SelectItem value="performance">Rendimiento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button onClick={scheduleReport} variant="outline" className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  Programar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPIs Principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Ingresos Totales
                  </p>
                  <p className="text-2xl font-bold text-green-600">$355,000</p>
                  <p className="text-xs text-green-500 mt-1">+12.5% vs mes anterior</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Total Reservas
                  </p>
                  <p className="text-2xl font-bold text-blue-600">955</p>
                  <p className="text-xs text-blue-500 mt-1">+8.3% vs mes anterior</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Usuarios Activos
                  </p>
                  <p className="text-2xl font-bold text-purple-600">720</p>
                  <p className="text-xs text-purple-500 mt-1">+15.2% vs mes anterior</p>
                </div>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Precio Promedio
                  </p>
                  <p className="text-2xl font-bold text-orange-600">$372</p>
                  <p className="text-xs text-orange-500 mt-1">-1.2% vs mes anterior</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reportes Detallados */}
        <Tabs defaultValue="revenue" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="revenue">Ingresos</TabsTrigger>
            <TabsTrigger value="bookings">Reservas</TabsTrigger>
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="performance">Rendimiento</TabsTrigger>
          </TabsList>

          {/* Reporte de Ingresos */}
          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Ingresos Mensuales</CardTitle>
                    <CardDescription>Evolución de ingresos por mes</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => exportToCSV(revenueData, 'ingresos-mensuales')}
                    >
                      <FileSpreadsheet className="w-4 h-4 mr-1" />
                      CSV
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => exportToPDF('Reporte de Ingresos Mensuales')}
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      PDF
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Ingresos']} />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#10b981" 
                        fill="#10b981" 
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Ingresos por Campo</CardTitle>
                    <CardDescription>Distribución de ingresos por campo de golf</CardDescription>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => exportToCSV(courseRevenueData, 'ingresos-por-campo')}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Exportar
                  </Button>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={courseRevenueData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="revenue"
                      >
                        {courseRevenueData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Ingresos']} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Tabla de Detalles */}
            <Card>
              <CardHeader>
                <CardTitle>Detalle de Ingresos por Campo</CardTitle>
                <CardDescription>Análisis detallado de rendimiento por campo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Campo</th>
                        <th className="text-right p-3">Ingresos</th>
                        <th className="text-right p-3">Reservas</th>
                        <th className="text-right p-3">Precio Promedio</th>
                        <th className="text-right p-3">% del Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courseRevenueData.map((course, index) => (
                        <tr key={index} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800">
                          <td className="p-3 font-medium">{course.name}</td>
                          <td className="p-3 text-right text-green-600 font-semibold">
                            ${course.revenue.toLocaleString()}
                          </td>
                          <td className="p-3 text-right">{course.bookings}</td>
                          <td className="p-3 text-right">
                            ${Math.round(course.revenue / course.bookings)}
                          </td>
                          <td className="p-3 text-right">
                            <Badge variant="secondary">{course.percentage}%</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reporte de Reservas */}
          <TabsContent value="bookings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tendencias de Reservas</CardTitle>
                  <CardDescription>Reservas por hora del día</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={bookingTrendsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="bookings" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Reservas vs Precio Promedio</CardTitle>
                  <CardDescription>Correlación entre reservas y precios</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="bookings" fill="#3b82f6" name="Reservas" />
                      <Line 
                        yAxisId="right" 
                        type="monotone" 
                        dataKey="avgPrice" 
                        stroke="#f59e0b" 
                        name="Precio Promedio"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reporte de Usuarios */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Análisis de Usuarios</CardTitle>
                <CardDescription>Métricas de engagement y retención</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={userEngagementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="newUsers" 
                      stroke="#10b981" 
                      name="Nuevos Usuarios"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="activeUsers" 
                      stroke="#3b82f6" 
                      name="Usuarios Activos"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="retention" 
                      stroke="#f59e0b" 
                      name="Retención (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reporte de Rendimiento */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <BarChart3 className="w-12 h-12 mx-auto text-blue-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Tasa de Conversión</h3>
                  <p className="text-3xl font-bold text-blue-600">23.5%</p>
                  <p className="text-sm text-slate-600 mt-2">+2.1% vs mes anterior</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <PieChartIcon className="w-12 h-12 mx-auto text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Satisfacción Cliente</h3>
                  <p className="text-3xl font-bold text-green-600">4.7/5</p>
                  <p className="text-sm text-slate-600 mt-2">Basado en 245 reseñas</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-12 h-12 mx-auto text-purple-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Tiempo Promedio</h3>
                  <p className="text-3xl font-bold text-purple-600">3.2min</p>
                  <p className="text-sm text-slate-600 mt-2">Tiempo de reserva</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Acciones Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>Exportación y programación de reportes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={() => exportToPDF('Reporte Completo Mensual')}
                disabled={isGenerating}
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <FileText className="w-6 h-6" />
                <span>Reporte PDF Completo</span>
                <span className="text-xs opacity-75">Incluye todos los análisis</span>
              </Button>

              <Button 
                variant="outline"
                onClick={() => exportToCSV([...revenueData, ...userEngagementData], 'datos-completos')}
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <FileSpreadsheet className="w-6 h-6" />
                <span>Exportar Datos CSV</span>
                <span className="text-xs opacity-75">Para análisis externo</span>
              </Button>

              <Button 
                variant="outline"
                onClick={scheduleReport}
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <Mail className="w-6 h-6" />
                <span>Programar Envío</span>
                <span className="text-xs opacity-75">Reportes automáticos</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

