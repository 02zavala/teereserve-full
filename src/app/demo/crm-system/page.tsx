'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users,
  UserCheck,
  Target,
  TrendingUp,
  Mail,
  Phone,
  Calendar,
  Star,
  DollarSign,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowLeft,
  RefreshCw,
  Download,
  Filter,
  Search,
  BarChart3,
  PieChart,
  Zap,
  Award,
  Heart,
  Flame
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
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import Link from 'next/link';
import { crmSystem, type CustomerProfile, type LeadScore, type SegmentPerformance } from '@/lib/crm-system';

export default function CRMSystemDemo() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [customerProfiles, setCustomerProfiles] = useState<CustomerProfile[]>([]);
  const [leadScores, setLeadScores] = useState<LeadScore[]>([]);
  const [segmentPerformance, setSegmentPerformance] = useState<SegmentPerformance[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);

  useEffect(() => {
    loadCRMData();
  }, []);

  const loadCRMData = async () => {
    setLoading(true);
    
    // Simular carga de datos
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generar datos mock
    const mockCustomers = [
      crmSystem.generateDetailedCustomerProfile('customer_001'),
      crmSystem.generateDetailedCustomerProfile('customer_002'),
      crmSystem.generateDetailedCustomerProfile('customer_003')
    ];

    const mockLeads = [
      crmSystem.calculateLeadScore(mockCustomers[0]),
      crmSystem.calculateLeadScore(mockCustomers[1]),
      crmSystem.calculateLeadScore(mockCustomers[2])
    ];

    const mockSegments = crmSystem.analyzeCustomerSegmentation(mockCustomers);

    setCustomerProfiles(mockCustomers);
    setLeadScores(mockLeads);
    setSegmentPerformance(mockSegments);
    setSelectedCustomer(mockCustomers[0]);
    setLoading(false);
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'hot': 'bg-red-100 text-red-800',
      'warm': 'bg-orange-100 text-orange-800',
      'cold': 'bg-blue-100 text-blue-800',
      'nurture': 'bg-gray-100 text-gray-800'
    };
    return colors[priority] || colors['nurture'];
  };

  const getPriorityIcon = (priority: string) => {
    const icons = {
      'hot': Flame,
      'warm': TrendingUp,
      'cold': Activity,
      'nurture': Clock
    };
    return icons[priority] || Clock;
  };

  const getSegmentColor = (segment: string) => {
    const colors = {
      'vip_champions': '#FFD700',
      'loyal_enthusiasts': '#32CD32',
      'casual_players': '#87CEEB',
      'at_risk': '#FFA07A'
    };
    return colors[segment] || '#87CEEB';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Cargando Sistema CRM...</h2>
          <p className="text-gray-500">Analizando perfiles de clientes y segmentación</p>
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
              <Link href="/demo/predictive-analytics" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5" />
                Volver a Analytics
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Users className="h-6 w-6 text-blue-600" />
                  Sistema CRM Avanzado
                  <Badge className="bg-blue-100 text-blue-800 ml-2">v3.0.0</Badge>
                </h1>
                <p className="text-gray-600">Segmentación inteligente y automatización de campañas</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2">
                <Search className="h-4 w-4" />
                Buscar Cliente
              </Button>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filtros
              </Button>
              <Button variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Actualizar
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Banner del sistema */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                <Users className="h-6 w-6" />
                👥 Sistema CRM Inteligente Activo
              </h2>
              <p className="text-blue-100">
                Segmentación automática • Scoring de leads • Automatización de campañas • Perfiles 360°
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">3,247</div>
              <div className="text-sm text-blue-200">Clientes activos</div>
            </div>
          </div>
        </div>

        {/* Tabs de navegación */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Resumen General', icon: BarChart3 },
                { id: 'segments', label: 'Segmentación', icon: PieChart },
                { id: 'leads', label: 'Scoring de Leads', icon: Target },
                { id: 'profiles', label: 'Perfiles Detallados', icon: UserCheck },
                { id: 'campaigns', label: 'Campañas', icon: Mail }
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Tab: Resumen General */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        Total Clientes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">3,247</div>
                      <p className="text-xs text-green-600 mt-1">+12.5% vs mes anterior</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <Target className="h-4 w-4 text-orange-500" />
                        Leads Calificados
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">156</div>
                      <p className="text-xs text-green-600 mt-1">+8.3% vs mes anterior</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        LTV Promedio
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">$485</div>
                      <p className="text-xs text-green-600 mt-1">+15.2% vs mes anterior</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-purple-500" />
                        Tasa de Conversión
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">23.8%</div>
                      <p className="text-xs text-green-600 mt-1">+3.1% vs mes anterior</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Distribución por Segmentos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsPieChart>
                          <Pie
                            data={[
                              { name: 'VIP Champions', value: 15, color: '#FFD700' },
                              { name: 'Entusiastas Leales', value: 35, color: '#32CD32' },
                              { name: 'Jugadores Casuales', value: 30, color: '#87CEEB' },
                              { name: 'En Riesgo', value: 20, color: '#FFA07A' }
                            ]}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            dataKey="value"
                          >
                            {[
                              { name: 'VIP Champions', value: 15, color: '#FFD700' },
                              { name: 'Entusiastas Leales', value: 35, color: '#32CD32' },
                              { name: 'Jugadores Casuales', value: 30, color: '#87CEEB' },
                              { name: 'En Riesgo', value: 20, color: '#FFA07A' }
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Evolución de Clientes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={[
                          { month: 'Ene', nuevos: 45, total: 2890 },
                          { month: 'Feb', nuevos: 52, total: 2942 },
                          { month: 'Mar', nuevos: 48, total: 2990 },
                          { month: 'Abr', nuevos: 61, total: 3051 },
                          { month: 'May', nuevos: 58, total: 3109 },
                          { month: 'Jun', nuevos: 67, total: 3176 },
                          { month: 'Jul', nuevos: 71, total: 3247 }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Area type="monotone" dataKey="total" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                          <Area type="monotone" dataKey="nuevos" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Tab: Segmentación */}
            {activeTab === 'segments' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {segmentPerformance.map((segment, index) => (
                    <Card key={segment.segment_id} className="border-l-4" style={{ borderLeftColor: getSegmentColor(segment.segment_id) }}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getSegmentColor(segment.segment_id) }}
                          ></div>
                          {segment.segment_name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Clientes:</span>
                            <div className="font-semibold">{segment.metrics.total_customers.toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Ingresos:</span>
                            <div className="font-semibold text-green-600">${segment.metrics.revenue.toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">LTV Promedio:</span>
                            <div className="font-semibold">${segment.metrics.avg_booking_value}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Satisfacción:</span>
                            <div className="font-semibold">{segment.metrics.satisfaction_score}/5</div>
                          </div>
                        </div>
                        <div className="pt-2 border-t">
                          <p className="text-xs text-gray-600 mb-2">Insights principales:</p>
                          <ul className="text-xs text-gray-700 space-y-1">
                            {segment.insights.slice(0, 2).map((insight, i) => (
                              <li key={i}>• {insight}</li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Rendimiento por Segmento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={segmentPerformance}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="segment_name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="metrics.revenue" fill="#3b82f6" name="Ingresos" />
                        <Bar dataKey="metrics.total_customers" fill="#10b981" name="Clientes" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Tab: Scoring de Leads */}
            {activeTab === 'leads' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {leadScores.map((lead, index) => {
                    const PriorityIcon = getPriorityIcon(lead.priority_level);
                    return (
                      <Card key={lead.lead_id} className="relative">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">Lead #{lead.lead_id.slice(-3)}</CardTitle>
                            <Badge className={getPriorityColor(lead.priority_level)}>
                              <PriorityIcon className="h-3 w-3 mr-1" />
                              {lead.priority_level.toUpperCase()}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600">{lead.score}</div>
                            <p className="text-sm text-gray-600">Score Total</p>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Conversión:</span>
                              <span className="font-semibold">{(lead.conversion_probability * 100).toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>LTV Estimado:</span>
                              <span className="font-semibold text-green-600">${lead.estimated_ltv}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Próximo Contacto:</span>
                              <span className="font-semibold">{lead.next_contact_date}</span>
                            </div>
                          </div>

                          <div className="pt-3 border-t">
                            <p className="text-sm font-medium text-gray-700 mb-2">Acciones recomendadas:</p>
                            <ul className="text-xs text-gray-600 space-y-1">
                              {lead.recommended_actions.slice(0, 3).map((action, i) => (
                                <li key={i}>• {action}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="pt-2">
                            <p className="text-xs text-gray-500">
                              Asignado a: {lead.assigned_sales_rep}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Distribución de Scores</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={[
                        { range: '0-20', count: 45, color: '#ef4444' },
                        { range: '21-40', count: 78, color: '#f97316' },
                        { range: '41-60', count: 124, color: '#eab308' },
                        { range: '61-80', count: 89, color: '#22c55e' },
                        { range: '81-100', count: 34, color: '#3b82f6' }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Tab: Perfiles Detallados */}
            {activeTab === 'profiles' && selectedCustomer && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <UserCheck className="h-5 w-5" />
                        Perfil del Cliente
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Información Personal</h4>
                          <div className="space-y-2 text-sm">
                            <div><span className="text-gray-600">Nombre:</span> {selectedCustomer.personal_info.name}</div>
                            <div><span className="text-gray-600">Email:</span> {selectedCustomer.personal_info.email}</div>
                            <div><span className="text-gray-600">Teléfono:</span> {selectedCustomer.personal_info.phone}</div>
                            <div><span className="text-gray-600">Ubicación:</span> {selectedCustomer.personal_info.location.city}, {selectedCustomer.personal_info.location.country}</div>
                            <div><span className="text-gray-600">Idioma:</span> {selectedCustomer.personal_info.preferred_language}</div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Perfil de Golf</h4>
                          <div className="space-y-2 text-sm">
                            <div><span className="text-gray-600">Handicap:</span> {selectedCustomer.golf_profile.handicap}</div>
                            <div><span className="text-gray-600">Nivel:</span> {selectedCustomer.golf_profile.skill_level}</div>
                            <div><span className="text-gray-600">Tipo de Campo:</span> {selectedCustomer.golf_profile.preferred_course_type}</div>
                            <div><span className="text-gray-600">Horario Favorito:</span> {selectedCustomer.golf_profile.favorite_tee_time}</div>
                            <div><span className="text-gray-600">Tamaño de Grupo:</span> {selectedCustomer.golf_profile.typical_group_size} personas</div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <h4 className="font-semibold text-gray-900 mb-3">Comportamiento de Reservas</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Total Reservas:</span>
                            <div className="font-semibold">{selectedCustomer.booking_behavior.total_bookings}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Valor Promedio:</span>
                            <div className="font-semibold">${selectedCustomer.booking_behavior.avg_booking_value}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Frecuencia:</span>
                            <div className="font-semibold">{selectedCustomer.booking_behavior.booking_frequency}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Cancelaciones:</span>
                            <div className="font-semibold">{(selectedCustomer.booking_behavior.cancellation_rate * 100).toFixed(1)}%</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5" />
                        Métricas de Satisfacción
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <RadarChart data={[
                          { metric: 'Satisfacción General', value: selectedCustomer.satisfaction_scores.overall_satisfaction },
                          { metric: 'Calidad del Campo', value: selectedCustomer.satisfaction_scores.course_quality_rating },
                          { metric: 'Calidad del Servicio', value: selectedCustomer.satisfaction_scores.service_quality_rating },
                          { metric: 'Relación Calidad-Precio', value: selectedCustomer.satisfaction_scores.value_for_money_rating },
                          { metric: 'Recomendación', value: selectedCustomer.satisfaction_scores.likelihood_to_recommend / 2 }
                        ]}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="metric" />
                          <PolarRadiusAxis angle={90} domain={[0, 5]} />
                          <Radar name="Satisfacción" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Perfil Financiero
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">${selectedCustomer.financial_profile.lifetime_value}</div>
                        <p className="text-sm text-gray-600">Valor de por Vida</p>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Gasto Promedio:</span>
                          <span className="font-semibold">${selectedCustomer.financial_profile.avg_spend_per_visit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sensibilidad al Precio:</span>
                          <span className="font-semibold">{selectedCustomer.financial_profile.price_sensitivity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Método de Pago:</span>
                          <span className="font-semibold">{selectedCustomer.financial_profile.payment_method_preference}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Engagement
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Apertura de Emails:</span>
                          <span className="font-semibold">{(selectedCustomer.engagement_metrics.email_open_rate * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Uso de App:</span>
                          <span className="font-semibold">{(selectedCustomer.engagement_metrics.app_usage_frequency * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Participación en Reviews:</span>
                          <span className="font-semibold">{(selectedCustomer.engagement_metrics.review_participation * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Referidos:</span>
                          <span className="font-semibold">{selectedCustomer.engagement_metrics.referral_count}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Segmentación
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-center">
                        <Badge 
                          className="text-white"
                          style={{ backgroundColor: getSegmentColor(selectedCustomer.segment_info.current_segment) }}
                        >
                          {selectedCustomer.segment_info.current_segment.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Riesgo de Churn:</span>
                          <span className="font-semibold text-red-600">{(selectedCustomer.segment_info.risk_score * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Score de Oportunidad:</span>
                          <span className="font-semibold text-green-600">{(selectedCustomer.segment_info.opportunity_score * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-xs text-gray-600 mb-1">Próxima acción:</p>
                        <p className="text-xs font-medium">{selectedCustomer.segment_info.next_best_action}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Tab: Campañas */}
            {activeTab === 'campaigns' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-500" />
                        Campañas Activas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">24</div>
                      <p className="text-xs text-green-600 mt-1">+6 esta semana</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        Tasa de Apertura
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">68.5%</div>
                      <p className="text-xs text-green-600 mt-1">+4.2% vs promedio</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <Zap className="h-4 w-4 text-orange-500" />
                        Conversiones
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">342</div>
                      <p className="text-xs text-green-600 mt-1">+18.7% vs mes anterior</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-purple-500" />
                        ROI de Campañas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">4.2x</div>
                      <p className="text-xs text-green-600 mt-1">+0.8x vs objetivo</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Rendimiento de Campañas por Segmento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { segment: 'VIP Champions', sent: 125, opened: 106, clicked: 48, converted: 31, roi: 8.5 },
                        { segment: 'Entusiastas Leales', sent: 450, opened: 315, clicked: 126, converted: 27, roi: 3.8 },
                        { segment: 'Jugadores Casuales', sent: 500, opened: 300, clicked: 90, converted: 12, roi: 2.1 },
                        { segment: 'En Riesgo', sent: 175, opened: 88, clicked: 18, converted: 3, roi: 1.2 }
                      ].map((campaign, index) => (
                        <div key={index} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-medium text-gray-900">{campaign.segment}</h4>
                            <Badge className={`${
                              campaign.roi > 5 ? 'bg-green-100 text-green-800' :
                              campaign.roi > 3 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              ROI: {campaign.roi}x
                            </Badge>
                          </div>
                          <div className="grid grid-cols-5 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Enviados:</span>
                              <div className="font-semibold">{campaign.sent}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Abiertos:</span>
                              <div className="font-semibold">{campaign.opened}</div>
                              <div className="text-xs text-gray-500">{((campaign.opened / campaign.sent) * 100).toFixed(1)}%</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Clicks:</span>
                              <div className="font-semibold">{campaign.clicked}</div>
                              <div className="text-xs text-gray-500">{((campaign.clicked / campaign.opened) * 100).toFixed(1)}%</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Conversiones:</span>
                              <div className="font-semibold">{campaign.converted}</div>
                              <div className="text-xs text-gray-500">{((campaign.converted / campaign.clicked) * 100).toFixed(1)}%</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Ingresos:</span>
                              <div className="font-semibold text-green-600">${(campaign.converted * 150).toLocaleString()}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Footer del sistema */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-lg">
          <div className="text-center">
            <h3 className="text-lg font-bold mb-2">👥 Sistema CRM Inteligente v3.0.0</h3>
            <p className="text-blue-100 mb-4">
              Segmentación automática, scoring de leads y automatización de campañas de última generación
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-semibold">🎯 Segmentación Inteligente</div>
                <div className="text-blue-200">Clustering automático</div>
              </div>
              <div>
                <div className="font-semibold">📊 Scoring de Leads</div>
                <div className="text-blue-200">Algoritmo multi-factor</div>
              </div>
              <div>
                <div className="font-semibold">🤖 Automatización</div>
                <div className="text-blue-200">Campañas inteligentes</div>
              </div>
              <div>
                <div className="font-semibold">📈 Analytics 360°</div>
                <div className="text-blue-200">Perfiles completos</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

