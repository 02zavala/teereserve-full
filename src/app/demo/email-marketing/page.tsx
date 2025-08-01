'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Send, 
  Users, 
  TrendingUp, 
  Eye, 
  MousePointer, 
  DollarSign,
  Calendar,
  Settings,
  Plus,
  Play,
  Pause,
  BarChart3,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  ArrowLeft
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import Link from 'next/link';

export default function EmailMarketingDemo() {
  const [campaigns, setCampaigns] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  // Datos mock para demostración
  const mockCampaigns = [
    {
      id: 1,
      name: 'Campaña de Bienvenida',
      type: 'welcome',
      status: 'active',
      subject: '¡Bienvenido a TeeReserve Golf! 🏌️‍♂️',
      sent: 245,
      opened: 156,
      clicked: 34,
      conversions: 12,
      revenue: 1850,
      createdAt: '2024-07-15',
      lastSent: '2024-07-18'
    },
    {
      id: 2,
      name: 'Recordatorios de Reserva',
      type: 'reminder',
      status: 'active',
      subject: 'Recordatorio: Tu tee time es mañana',
      sent: 89,
      opened: 78,
      clicked: 23,
      conversions: 8,
      revenue: 0,
      createdAt: '2024-07-10',
      lastSent: '2024-07-18'
    },
    {
      id: 3,
      name: 'Ofertas de Verano',
      type: 'promotional',
      status: 'paused',
      subject: '🌞 Ofertas especiales de verano - 25% OFF',
      sent: 1250,
      opened: 487,
      clicked: 89,
      conversions: 23,
      revenue: 3450,
      createdAt: '2024-07-01',
      lastSent: '2024-07-16'
    },
    {
      id: 4,
      name: 'Newsletter Semanal',
      type: 'newsletter',
      status: 'active',
      subject: 'TeeReserve Weekly: Lo mejor del golf',
      sent: 892,
      opened: 334,
      clicked: 67,
      conversions: 15,
      revenue: 2100,
      createdAt: '2024-06-15',
      lastSent: '2024-07-17'
    }
  ];

  const mockAnalytics = {
    totalSent: 2476,
    totalOpened: 1055,
    totalClicked: 213,
    totalConversions: 58,
    totalRevenue: 7400,
    openRate: 42.6,
    clickRate: 8.6,
    conversionRate: 2.3,
    revenuePerEmail: 2.99
  };

  const performanceData = [
    { date: '2024-07-11', sent: 156, opened: 67, clicked: 12, conversions: 3 },
    { date: '2024-07-12', sent: 203, opened: 89, clicked: 18, conversions: 5 },
    { date: '2024-07-13', sent: 178, opened: 76, clicked: 15, conversions: 4 },
    { date: '2024-07-14', sent: 234, opened: 98, clicked: 21, conversions: 7 },
    { date: '2024-07-15', sent: 289, opened: 134, clicked: 28, conversions: 9 },
    { date: '2024-07-16', sent: 267, opened: 112, clicked: 24, conversions: 6 },
    { date: '2024-07-17', sent: 298, opened: 145, clicked: 31, conversions: 8 },
    { date: '2024-07-18', sent: 312, opened: 156, clicked: 34, conversions: 12 }
  ];

  const segmentData = [
    { name: 'Usuarios Nuevos', value: 35, color: '#8884d8' },
    { name: 'Usuarios Activos', value: 45, color: '#82ca9d' },
    { name: 'Alto Valor', value: 15, color: '#ffc658' },
    { name: 'Inactivos', value: 5, color: '#ff7c7c' }
  ];

  useEffect(() => {
    setCampaigns(mockCampaigns);
    setAnalytics(mockAnalytics);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'paused': return <Pause className="h-4 w-4" />;
      case 'draft': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getCampaignTypeIcon = (type: string) => {
    switch (type) {
      case 'welcome': return '👋';
      case 'reminder': return '⏰';
      case 'promotional': return '🎯';
      case 'newsletter': return '📰';
      default: return '📧';
    }
  };

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
                  <Mail className="h-6 w-6 text-blue-600" />
                  Email Marketing
                  <Badge className="bg-purple-100 text-purple-800 ml-2">DEMO</Badge>
                </h1>
                <p className="text-gray-600">Sistema automatizado de campañas de email</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2">
                <Settings className="h-4 w-4" />
                Configuración
              </Button>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nueva Campaña
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Banner de demostración */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">🚀 Sistema de Email Marketing Automatizado</h2>
              <p className="text-purple-100">
                Campañas inteligentes, segmentación avanzada y analytics en tiempo real para maximizar conversiones
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">94.2%</div>
              <div className="text-sm text-purple-200">Tasa de entrega</div>
            </div>
          </div>
        </div>

        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Emails Enviados</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics?.totalSent.toLocaleString()}</p>
                  <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" />
                    +12% vs semana anterior
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Send className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tasa de Apertura</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics?.openRate}%</p>
                  <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" />
                    +3.2% vs promedio industria
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tasa de Clics</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics?.clickRate}%</p>
                  <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" />
                    +1.8% vs promedio industria
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <MousePointer className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ingresos Generados</p>
                  <p className="text-2xl font-bold text-gray-900">${analytics?.totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" />
                    +18% vs mes anterior
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos de rendimiento */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Rendimiento de Emails (Últimos 7 días)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value, name) => [value, name === 'sent' ? 'Enviados' : name === 'opened' ? 'Abiertos' : name === 'clicked' ? 'Clics' : 'Conversiones']}
                  />
                  <Line type="monotone" dataKey="sent" stroke="#8884d8" strokeWidth={2} name="sent" />
                  <Line type="monotone" dataKey="opened" stroke="#82ca9d" strokeWidth={2} name="opened" />
                  <Line type="monotone" dataKey="clicked" stroke="#ffc658" strokeWidth={2} name="clicked" />
                  <Line type="monotone" dataKey="conversions" stroke="#ff7c7c" strokeWidth={2} name="conversions" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Distribución por Segmentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={segmentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {segmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Lista de campañas */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Campañas Activas
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Filtrar</Button>
                <Button variant="outline" size="sm">Exportar</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {campaigns.map((campaign: any) => (
                <div key={campaign.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{getCampaignTypeIcon(campaign.type)}</div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                        <p className="text-sm text-gray-600">{campaign.subject}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge className={getStatusColor(campaign.status)}>
                            {getStatusIcon(campaign.status)}
                            <span className="ml-1 capitalize">{campaign.status}</span>
                          </Badge>
                          <span className="text-xs text-gray-500">
                            Último envío: {new Date(campaign.lastSent).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">{campaign.sent}</p>
                        <p className="text-xs text-gray-500">Enviados</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">
                          {((campaign.opened / campaign.sent) * 100).toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-500">Apertura</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">
                          {((campaign.clicked / campaign.sent) * 100).toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-500">Clics</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">${campaign.revenue}</p>
                        <p className="text-xs text-gray-500">Ingresos</p>
                      </div>
                      
                      <div className="flex gap-2">
                        {campaign.status === 'active' ? (
                          <Button variant="outline" size="sm">
                            <Pause className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm">
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Insights y recomendaciones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Insights Automáticos con IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800">📈 Mejora Detectada</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Los emails enviados los martes tienen 23% más apertura que otros días
                  </p>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800">🎯 Oportunidad</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Los usuarios inactivos responden bien a ofertas de 20%+ de descuento
                  </p>
                </div>
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="font-medium text-purple-800">🤖 IA Recomendación</h4>
                  <p className="text-sm text-purple-700 mt-1">
                    Optimizar líneas de asunto con emojis aumenta apertura en 15%
                  </p>
                </div>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-800">⚠️ Atención</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    La tasa de cancelación aumentó 5% en la última semana
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                Próximas Acciones Automatizadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Campaña de reactivación</p>
                    <p className="text-xs text-gray-600">Para 156 usuarios inactivos - Auto-trigger en 2 días</p>
                  </div>
                  <Button size="sm">Crear</Button>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Newsletter semanal</p>
                    <p className="text-xs text-gray-600">Programada para mañana 9:00 AM</p>
                  </div>
                  <Button size="sm" variant="outline">Ver</Button>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">A/B Test resultados</p>
                    <p className="text-xs text-gray-600">Línea de asunto optimizada - Ganador: +18% apertura</p>
                  </div>
                  <Button size="sm" variant="outline">Aplicar</Button>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Segmentación IA</p>
                    <p className="text-xs text-gray-600">Nuevos segmentos detectados automáticamente</p>
                  </div>
                  <Button size="sm" variant="outline">Revisar</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer de demostración */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-lg">
          <div className="text-center">
            <h3 className="text-lg font-bold mb-2">🎯 Sistema Completamente Automatizado</h3>
            <p className="text-green-100 mb-4">
              Campañas inteligentes que se optimizan automáticamente usando IA y machine learning
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-semibold">✅ Segmentación Automática</div>
                <div className="text-green-200">Basada en comportamiento y preferencias</div>
              </div>
              <div>
                <div className="font-semibold">🤖 Optimización IA</div>
                <div className="text-green-200">Horarios, contenido y frecuencia</div>
              </div>
              <div>
                <div className="font-semibold">📊 Analytics Avanzados</div>
                <div className="text-green-200">ROI, LTV y predicciones</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

