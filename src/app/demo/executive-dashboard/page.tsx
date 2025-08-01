'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  DollarSign, 
  Calendar,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Globe,
  Mail,
  Smartphone,
  Clock,
  Star,
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Filter,
  Download,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import Link from 'next/link';

export default function ExecutiveDashboard() {
  const [timeRange, setTimeRange] = useState('30d');
  const [metrics, setMetrics] = useState<any>(null);
  const [conversionFunnel, setConversionFunnel] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [userSegments, setUserSegments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Datos mock para demostración
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Métricas principales
      setMetrics({
        totalRevenue: 187350,
        revenueGrowth: 18.5,
        totalBookings: 1247,
        bookingsGrowth: 12.3,
        avgBookingValue: 150.24,
        avgBookingGrowth: 5.7,
        customerLifetimeValue: 450.75,
        clvGrowth: 8.9,
        activeUsers: 892,
        userGrowth: 15.2,
        conversionRate: 11.7,
        conversionGrowth: 2.1,
        churnRate: 8.2,
        churnChange: -1.5,
        nps: 8.7,
        npsChange: 0.3
      });

      // Datos de ingresos por día
      setRevenueData([
        { date: '2024-07-01', revenue: 4200, bookings: 28, users: 156 },
        { date: '2024-07-02', revenue: 3800, bookings: 25, users: 142 },
        { date: '2024-07-03', revenue: 5100, bookings: 34, users: 189 },
        { date: '2024-07-04', revenue: 4600, bookings: 31, users: 167 },
        { date: '2024-07-05', revenue: 6200, bookings: 41, users: 203 },
        { date: '2024-07-06', revenue: 5800, bookings: 39, users: 198 },
        { date: '2024-07-07', revenue: 7100, bookings: 47, users: 234 },
        { date: '2024-07-08', revenue: 5400, bookings: 36, users: 178 },
        { date: '2024-07-09', revenue: 4900, bookings: 33, users: 165 },
        { date: '2024-07-10', revenue: 6800, bookings: 45, users: 221 },
        { date: '2024-07-11', revenue: 5200, bookings: 35, users: 172 },
        { date: '2024-07-12', revenue: 7500, bookings: 50, users: 245 },
        { date: '2024-07-13', revenue: 6900, bookings: 46, users: 218 },
        { date: '2024-07-14', revenue: 8200, bookings: 55, users: 267 },
        { date: '2024-07-15', revenue: 7800, bookings: 52, users: 251 },
        { date: '2024-07-16', revenue: 6100, bookings: 41, users: 195 },
        { date: '2024-07-17', revenue: 5700, bookings: 38, users: 183 },
        { date: '2024-07-18', revenue: 8900, bookings: 59, users: 289 }
      ]);

      // Funnel de conversión
      setConversionFunnel([
        { name: 'Visitantes', value: 10000, fill: '#8884d8' },
        { name: 'Explorar Campos', value: 6500, fill: '#82ca9d' },
        { name: 'Ver Detalles', value: 3250, fill: '#ffc658' },
        { name: 'Iniciar Reserva', value: 1625, fill: '#ff7c7c' },
        { name: 'Completar Pago', value: 1170, fill: '#8dd1e1' }
      ]);

      // Segmentos de usuarios
      setUserSegments([
        { name: 'Usuarios VIP', value: 15, color: '#FFD700', count: 134 },
        { name: 'Usuarios Activos', value: 45, color: '#32CD32', count: 401 },
        { name: 'Usuarios Nuevos', value: 25, color: '#87CEEB', count: 223 },
        { name: 'Usuarios Inactivos', value: 15, color: '#FFA07A', count: 134 }
      ]);

      setLoading(false);
    };

    loadDashboardData();
  }, [timeRange]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Cargando Dashboard Ejecutivo...</h2>
          <p className="text-gray-500">Analizando métricas de negocio</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5" />
                Volver al Dashboard
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                  Dashboard Ejecutivo
                  <Badge className="bg-purple-100 text-purple-800 ml-2">AVANZADO</Badge>
                </h1>
                <p className="text-gray-600">Analytics avanzados y métricas de negocio</p>
              </div>
            </div>
            <div className="flex gap-3">
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="7d">Últimos 7 días</option>
                <option value="30d">Últimos 30 días</option>
                <option value="90d">Últimos 90 días</option>
                <option value="1y">Último año</option>
              </select>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filtros
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
              <Button className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Actualizar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Banner de estado */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">📊 Sistema de Analytics Avanzado Activo</h2>
              <p className="text-green-100">
                Tracking en tiempo real • Machine Learning • Análisis predictivo • Segmentación automática
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">99.9%</div>
              <div className="text-sm text-green-200">Uptime del sistema</div>
            </div>
          </div>
        </div>

        {/* KPIs principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.totalRevenue)}</p>
                  <p className={`text-xs flex items-center gap-1 mt-1 ${
                    metrics.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metrics.revenueGrowth > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                    {formatPercentage(metrics.revenueGrowth)} vs mes anterior
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Reservas</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.totalBookings.toLocaleString()}</p>
                  <p className={`text-xs flex items-center gap-1 mt-1 ${
                    metrics.bookingsGrowth > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metrics.bookingsGrowth > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                    {formatPercentage(metrics.bookingsGrowth)} vs mes anterior
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Valor Promedio</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.avgBookingValue)}</p>
                  <p className={`text-xs flex items-center gap-1 mt-1 ${
                    metrics.avgBookingGrowth > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metrics.avgBookingGrowth > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                    {formatPercentage(metrics.avgBookingGrowth)} vs mes anterior
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.activeUsers.toLocaleString()}</p>
                  <p className={`text-xs flex items-center gap-1 mt-1 ${
                    metrics.userGrowth > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metrics.userGrowth > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                    {formatPercentage(metrics.userGrowth)} vs mes anterior
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Users className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Métricas secundarias */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">LTV del Cliente</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(metrics.customerLifetimeValue)}</p>
                  <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                    <ArrowUp className="h-3 w-3" />
                    {formatPercentage(metrics.clvGrowth)}
                  </p>
                </div>
                <Star className="h-5 w-5 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tasa de Conversión</p>
                  <p className="text-xl font-bold text-gray-900">{metrics.conversionRate}%</p>
                  <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                    <ArrowUp className="h-3 w-3" />
                    {formatPercentage(metrics.conversionGrowth)}
                  </p>
                </div>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tasa de Churn</p>
                  <p className="text-xl font-bold text-gray-900">{metrics.churnRate}%</p>
                  <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                    <ArrowDown className="h-3 w-3" />
                    {formatPercentage(metrics.churnChange)}
                  </p>
                </div>
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Net Promoter Score</p>
                  <p className="text-xl font-bold text-gray-900">{metrics.nps}/10</p>
                  <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                    <ArrowUp className="h-3 w-3" />
                    +{metrics.npsChange}
                  </p>
                </div>
                <CheckCircle className="h-5 w-5 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Tendencia de Ingresos (Últimos 18 días)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString('es-ES')}
                    formatter={(value, name) => [
                      name === 'revenue' ? formatCurrency(value as number) : value,
                      name === 'revenue' ? 'Ingresos' : name === 'bookings' ? 'Reservas' : 'Usuarios'
                    ]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Segmentación de Usuarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={userSegments}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {userSegments.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Porcentaje']} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Funnel de conversión y métricas adicionales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Funnel de Conversión
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversionFunnel.map((step, index) => {
                  const conversionRate = index === 0 ? 100 : (step.value / conversionFunnel[0].value) * 100;
                  const dropOffRate = index === 0 ? 0 : ((conversionFunnel[index - 1].value - step.value) / conversionFunnel[index - 1].value) * 100;
                  
                  return (
                    <div key={step.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: step.fill }}
                        ></div>
                        <div>
                          <p className="font-medium text-gray-900">{step.name}</p>
                          <p className="text-sm text-gray-600">{step.value.toLocaleString()} usuarios</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{conversionRate.toFixed(1)}%</p>
                        {index > 0 && (
                          <p className="text-xs text-red-600">-{dropOffRate.toFixed(1)}% drop-off</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Insights de IA y Predicciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Predicción Positiva
                  </h4>
                  <p className="text-sm text-green-700 mt-1">
                    Se proyecta un crecimiento del 25% en reservas para el próximo mes
                  </p>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Oportunidad Detectada
                  </h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Los usuarios alemanes tienen 40% más probabilidad de reservar campos premium
                  </p>
                </div>
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="font-medium text-purple-800 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Recomendación de IA
                  </h4>
                  <p className="text-sm text-purple-700 mt-1">
                    Optimizar horarios de email marketing: enviar martes 9:00 AM (+23% apertura)
                  </p>
                </div>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-800 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Alerta de Retención
                  </h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    67 usuarios en riesgo de churn - activar campaña de retención
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer del dashboard */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
          <div className="text-center">
            <h3 className="text-lg font-bold mb-2">🚀 Analytics Avanzados con Machine Learning</h3>
            <p className="text-blue-100 mb-4">
              Sistema completo de análisis predictivo, segmentación automática y optimización de conversiones
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-semibold">📊 Tracking en Tiempo Real</div>
                <div className="text-blue-200">Eventos, conversiones y comportamiento</div>
              </div>
              <div>
                <div className="font-semibold">🤖 IA Predictiva</div>
                <div className="text-blue-200">Churn, LTV y recomendaciones</div>
              </div>
              <div>
                <div className="font-semibold">🎯 Optimización Automática</div>
                <div className="text-blue-200">Campañas, precios y experiencia</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

