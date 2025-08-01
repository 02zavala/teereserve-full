'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Bell,
  Mail,
  Smartphone,
  Calendar,
  Download,
  Play,
  Pause,
  Settings,
  ArrowLeft,
  RefreshCw,
  Filter,
  Search,
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  Zap,
  Shield,
  Target,
  Send,
  Eye,
  Edit,
  Trash2,
  Plus,
  AlertCircle,
  Info,
  MessageSquare
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
  PieChart, 
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import Link from 'next/link';
import { 
  automatedReportsSystem, 
  type ReportTemplate, 
  type AlertRule, 
  type GeneratedReport,
  type NotificationTemplate 
} from '@/lib/automated-reports';

export default function AutomatedReportsDemo() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [recentReports, setRecentReports] = useState<GeneratedReport[]>([]);
  const [systemStats, setSystemStats] = useState<Record<string, any>>({});
  const [upcomingReports, setUpcomingReports] = useState<any[]>([]);

  useEffect(() => {
    loadReportsData();
  }, []);

  const loadReportsData = async () => {
    setLoading(true);
    
    // Simular carga de datos
    await new Promise(resolve => setTimeout(resolve, 1500));

    const templates = automatedReportsSystem.getReportTemplates();
    const alerts = automatedReportsSystem.getAlertRules();
    const stats = automatedReportsSystem.getSystemStats();
    const upcoming = automatedReportsSystem.getUpcomingReports();

    // Generar reportes recientes mock
    const mockRecentReports = await Promise.all([
      automatedReportsSystem.generateReport('executive_weekly'),
      automatedReportsSystem.generateReport('financial_monthly'),
      automatedReportsSystem.generateReport('marketing_weekly')
    ]);

    setReportTemplates(templates);
    setAlertRules(alerts);
    setRecentReports(mockRecentReports);
    setSystemStats(stats);
    setUpcomingReports(upcoming);
    setLoading(false);
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      'low': 'bg-blue-100 text-blue-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-orange-100 text-orange-800',
      'critical': 'bg-red-100 text-red-800'
    };
    return colors[severity] || colors['medium'];
  };

  const getSeverityIcon = (severity: string) => {
    const icons = {
      'low': Info,
      'medium': AlertCircle,
      'high': AlertTriangle,
      'critical': Shield
    };
    return icons[severity] || AlertCircle;
  };

  const getReportTypeColor = (type: string) => {
    const colors = {
      'executive': 'bg-purple-100 text-purple-800',
      'financial': 'bg-green-100 text-green-800',
      'operational': 'bg-blue-100 text-blue-800',
      'marketing': 'bg-orange-100 text-orange-800',
      'customer': 'bg-pink-100 text-pink-800'
    };
    return colors[type] || colors['executive'];
  };

  const getFrequencyIcon = (frequency: string) => {
    const icons = {
      'daily': Clock,
      'weekly': Calendar,
      'monthly': Calendar,
      'quarterly': Calendar,
      'on_demand': Play
    };
    return icons[frequency] || Clock;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Cargando Sistema de Reportes...</h2>
          <p className="text-gray-500">Inicializando reportes automáticos y alertas</p>
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
              <Link href="/demo/crm-system" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5" />
                Volver a CRM
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="h-6 w-6 text-blue-600" />
                  Sistema de Reportes Automáticos
                  <Badge className="bg-blue-100 text-blue-800 ml-2">v2.1.0</Badge>
                </h1>
                <p className="text-gray-600">Reportes programados, alertas automáticas y notificaciones inteligentes</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2">
                <Search className="h-4 w-4" />
                Buscar
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
                <Plus className="h-4 w-4" />
                Nuevo Reporte
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Banner del sistema */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                <FileText className="h-6 w-6" />
                📊 Sistema de Reportes Inteligente Activo
              </h2>
              <p className="text-blue-100">
                Reportes automáticos • Alertas en tiempo real • Notificaciones push • Análisis predictivo
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{systemStats.reports_generated_today}</div>
              <div className="text-sm text-blue-200">Reportes generados hoy</div>
            </div>
          </div>
        </div>

        {/* Tabs de navegación */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Resumen General', icon: BarChart3 },
                { id: 'reports', label: 'Reportes Programados', icon: FileText },
                { id: 'alerts', label: 'Alertas y Umbrales', icon: AlertTriangle },
                { id: 'notifications', label: 'Notificaciones', icon: Bell },
                { id: 'analytics', label: 'Analytics del Sistema', icon: TrendingUp }
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
                        <FileText className="h-4 w-4 text-blue-500" />
                        Reportes Activos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">{systemStats.active_report_templates}</div>
                      <p className="text-xs text-green-600 mt-1">de {systemStats.total_report_templates} totales</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        Alertas Activas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">{systemStats.active_alert_rules}</div>
                      <p className="text-xs text-green-600 mt-1">de {systemStats.total_alert_rules} totales</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        Reportes Hoy
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">{systemStats.reports_generated_today}</div>
                      <p className="text-xs text-green-600 mt-1">+2 vs ayer</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-purple-500" />
                        Uptime Sistema
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">{systemStats.system_uptime}</div>
                      <p className="text-xs text-green-600 mt-1">Últimas 24h</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Próximos Reportes Programados</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {upcomingReports.slice(0, 5).map((item, index) => {
                          const FrequencyIcon = getFrequencyIcon(item.template.frequency);
                          return (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <FrequencyIcon className="h-5 w-5 text-gray-500" />
                                <div>
                                  <p className="font-medium text-gray-900">{item.template.name}</p>
                                  <p className="text-sm text-gray-600">{item.template.frequency}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">{item.time_until}</p>
                                <Badge className={getReportTypeColor(item.template.report_type)}>
                                  {item.template.report_type}
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Actividad de Alertas (24h)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={[
                          { hour: '00:00', alerts: 0 },
                          { hour: '03:00', alerts: 1 },
                          { hour: '06:00', alerts: 0 },
                          { hour: '09:00', alerts: 3 },
                          { hour: '12:00', alerts: 2 },
                          { hour: '15:00', alerts: 1 },
                          { hour: '18:00', alerts: 4 },
                          { hour: '21:00', alerts: 2 }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="hour" />
                          <YAxis />
                          <Tooltip />
                          <Area type="monotone" dataKey="alerts" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Reportes Recientes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentReports.map((report, index) => {
                        const template = reportTemplates.find(t => t.template_id === report.template_id);
                        return (
                          <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <FileText className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{template?.name}</p>
                                <p className="text-sm text-gray-600">
                                  Generado: {new Date(report.generated_at).toLocaleString('es-MX')}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Tamaño: {(report.file_size_bytes / 1024 / 1024).toFixed(1)}MB • 
                                  Tiempo: {report.generation_time_ms}ms
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getReportTypeColor(template?.report_type || 'executive')}>
                                {template?.report_type}
                              </Badge>
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Completado
                              </Badge>
                              <Button variant="outline" size="sm" className="gap-1">
                                <Download className="h-3 w-3" />
                                Descargar
                              </Button>
                              <Button variant="outline" size="sm" className="gap-1">
                                <Eye className="h-3 w-3" />
                                Ver
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Tab: Reportes Programados */}
            {activeTab === 'reports' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Plantillas de Reportes</h3>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nueva Plantilla
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {reportTemplates.map((template, index) => {
                    const FrequencyIcon = getFrequencyIcon(template.frequency);
                    return (
                      <Card key={index} className="relative">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg flex items-center gap-2">
                                <FrequencyIcon className="h-5 w-5 text-blue-600" />
                                {template.name}
                              </CardTitle>
                              <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                            </div>
                            <div className="flex gap-1">
                              <Badge className={getReportTypeColor(template.report_type)}>
                                {template.report_type}
                              </Badge>
                              {template.is_active ? (
                                <Badge className="bg-green-100 text-green-800">Activo</Badge>
                              ) : (
                                <Badge className="bg-gray-100 text-gray-800">Inactivo</Badge>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Frecuencia:</span>
                              <div className="font-semibold capitalize">{template.frequency}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Próxima ejecución:</span>
                              <div className="font-semibold">
                                {new Date(template.next_generation).toLocaleString('es-MX')}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600">Destinatarios:</span>
                              <div className="font-semibold">{template.recipients.length}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Métricas:</span>
                              <div className="font-semibold">{template.metrics.length}</div>
                            </div>
                          </div>

                          <div className="pt-3 border-t">
                            <p className="text-sm text-gray-600 mb-2">Destinatarios principales:</p>
                            <div className="flex flex-wrap gap-1">
                              {template.recipients.slice(0, 3).map((recipient, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {recipient.role}
                                </Badge>
                              ))}
                              {template.recipients.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{template.recipients.length - 3} más
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button variant="outline" size="sm" className="gap-1 flex-1">
                              <Play className="h-3 w-3" />
                              Ejecutar Ahora
                            </Button>
                            <Button variant="outline" size="sm" className="gap-1">
                              <Edit className="h-3 w-3" />
                              Editar
                            </Button>
                            <Button variant="outline" size="sm" className="gap-1">
                              <Settings className="h-3 w-3" />
                              Config
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab: Alertas y Umbrales */}
            {activeTab === 'alerts' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Reglas de Alertas</h3>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nueva Alerta
                  </Button>
                </div>

                <div className="space-y-4">
                  {alertRules.map((rule, index) => {
                    const SeverityIcon = getSeverityIcon(rule.severity);
                    return (
                      <Card key={index} className="relative">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`p-2 rounded-lg ${getSeverityColor(rule.severity).replace('text-', 'bg-').replace('800', '100')}`}>
                                <SeverityIcon className={`h-5 w-5 ${getSeverityColor(rule.severity).split(' ')[1]}`} />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{rule.name}</h4>
                                <p className="text-sm text-gray-600">{rule.description}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                  <span>Métrica: {rule.metric_name}</span>
                                  <span>Umbral: {rule.condition.operator} {rule.condition.threshold_value}</span>
                                  <span>Activaciones: {rule.trigger_count}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge className={getSeverityColor(rule.severity)}>
                                {rule.severity.toUpperCase()}
                              </Badge>
                              {rule.is_active ? (
                                <Badge className="bg-green-100 text-green-800">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Activa
                                </Badge>
                              ) : (
                                <Badge className="bg-gray-100 text-gray-800">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Inactiva
                                </Badge>
                              )}
                              <div className="flex gap-1">
                                <Button variant="outline" size="sm">
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  {rule.is_active ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                                </Button>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Canales de notificación:</span>
                                <div className="flex gap-1 mt-1">
                                  {rule.notification_channels.map((channel, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      {channel.type === 'email' && <Mail className="h-3 w-3 mr-1" />}
                                      {channel.type === 'sms' && <Smartphone className="h-3 w-3 mr-1" />}
                                      {channel.type === 'push' && <Bell className="h-3 w-3 mr-1" />}
                                      {channel.type}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-600">Límites de frecuencia:</span>
                                <div className="font-semibold">
                                  {rule.frequency_limit.max_alerts_per_hour}/hora, {rule.frequency_limit.max_alerts_per_day}/día
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-600">Última activación:</span>
                                <div className="font-semibold">
                                  {rule.last_triggered ? new Date(rule.last_triggered).toLocaleString('es-MX') : 'Nunca'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab: Notificaciones */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-500" />
                        Emails Enviados Hoy
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">47</div>
                      <p className="text-xs text-green-600 mt-1">+12% vs ayer</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <Bell className="h-4 w-4 text-orange-500" />
                        Push Notifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">23</div>
                      <p className="text-xs text-green-600 mt-1">+5% vs ayer</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-green-500" />
                        SMS Enviados
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">8</div>
                      <p className="text-xs text-red-600 mt-1">-2 vs ayer</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Historial de Notificaciones Recientes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { type: 'email', title: 'Reporte Ejecutivo Semanal', recipient: 'ceo@teereserve.golf', time: '08:00', status: 'enviado' },
                        { type: 'push', title: 'Pico Alto de Reservas', recipient: 'operations_team', time: '11:45', status: 'enviado' },
                        { type: 'email', title: 'Alerta: Caída en Conversión', recipient: 'marketing@teereserve.golf', time: '10:30', status: 'enviado' },
                        { type: 'sms', title: 'Alerta Crítica Sistema', recipient: '+52-664-***-4567', time: '03:15', status: 'enviado' },
                        { type: 'email', title: 'Reporte Financiero Mensual', recipient: 'cfo@teereserve.golf', time: '09:00', status: 'enviado' }
                      ].map((notification, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              {notification.type === 'email' && <Mail className="h-4 w-4 text-blue-600" />}
                              {notification.type === 'push' && <Bell className="h-4 w-4 text-orange-600" />}
                              {notification.type === 'sms' && <Smartphone className="h-4 w-4 text-green-600" />}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{notification.title}</p>
                              <p className="text-sm text-gray-600">Para: {notification.recipient}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{notification.time}</p>
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {notification.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Tab: Analytics del Sistema */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Reportes Generados por Día</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={[
                          { day: 'Lun', reports: 12 },
                          { day: 'Mar', reports: 8 },
                          { day: 'Mié', reports: 15 },
                          { day: 'Jue', reports: 10 },
                          { day: 'Vie', reports: 18 },
                          { day: 'Sáb', reports: 6 },
                          { day: 'Dom', reports: 4 }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="reports" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Distribución de Alertas por Severidad</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Baja', value: 45, color: '#3b82f6' },
                              { name: 'Media', value: 30, color: '#f59e0b' },
                              { name: 'Alta', value: 20, color: '#ea580c' },
                              { name: 'Crítica', value: 5, color: '#dc2626' }
                            ]}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            dataKey="value"
                          >
                            {[
                              { name: 'Baja', value: 45, color: '#3b82f6' },
                              { name: 'Media', value: 30, color: '#f59e0b' },
                              { name: 'Alta', value: 20, color: '#ea580c' },
                              { name: 'Crítica', value: 5, color: '#dc2626' }
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Rendimiento del Sistema</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">99.8%</div>
                        <p className="text-sm text-gray-600">Uptime</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">1.2s</div>
                        <p className="text-sm text-gray-600">Tiempo Promedio de Generación</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">98.5%</div>
                        <p className="text-sm text-gray-600">Tasa de Entrega</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">0.2%</div>
                        <p className="text-sm text-gray-600">Tasa de Error</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Footer del sistema */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
          <div className="text-center">
            <h3 className="text-lg font-bold mb-2">📊 Sistema de Reportes Automáticos v2.1.0</h3>
            <p className="text-blue-100 mb-4">
              Reportes programados, alertas inteligentes y notificaciones en tiempo real
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-semibold">📋 Reportes Automáticos</div>
                <div className="text-blue-200">Generación programada</div>
              </div>
              <div>
                <div className="font-semibold">🚨 Alertas Inteligentes</div>
                <div className="text-blue-200">Umbrales dinámicos</div>
              </div>
              <div>
                <div className="font-semibold">📱 Notificaciones Push</div>
                <div className="text-blue-200">Multi-canal</div>
              </div>
              <div>
                <div className="font-semibold">📈 Analytics Avanzados</div>
                <div className="text-blue-200">Métricas en tiempo real</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

