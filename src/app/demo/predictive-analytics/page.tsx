'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain,
  TrendingUp,
  Users,
  AlertTriangle,
  Target,
  Zap,
  BarChart3,
  PieChart,
  Activity,
  Star,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  RefreshCw,
  Download,
  Play,
  Pause
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
  ScatterChart,
  Scatter
} from 'recharts';
import Link from 'next/link';
import { predictiveAnalytics, type ChurnPrediction, type CustomerSegment, type PredictiveInsight } from '@/lib/predictive-analytics';

export default function PredictiveAnalyticsDemo() {
  const [isRunning, setIsRunning] = useState(false);
  const [churnPredictions, setChurnPredictions] = useState<ChurnPrediction[]>([]);
  const [customerSegments, setCustomerSegments] = useState<CustomerSegment[]>([]);
  const [predictiveInsights, setPredictiveInsights] = useState<PredictiveInsight[]>([]);
  const [realTimeData, setRealTimeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPredictiveData();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        updateRealTimeData();
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const loadPredictiveData = async () => {
    setLoading(true);
    
    // Simular carga de datos
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Datos mock de usuarios para análisis
    const mockUsers = [
      {
        user_id: 'user_001',
        total_bookings: 15,
        avg_booking_value: 180,
        days_since_last_booking: 45,
        favorite_course_type: 'premium' as const,
        preferred_time: 'morning' as const,
        booking_frequency: 'monthly' as const,
        cancellation_rate: 0.1,
        review_score_given: 4.5,
        email_engagement_rate: 0.8,
        mobile_app_usage: 0.7,
        referrals_made: 3,
        seasonal_preference: 'spring' as const,
        location_preference: 'tourist' as const,
        group_size_preference: 2
      },
      {
        user_id: 'user_002',
        total_bookings: 3,
        avg_booking_value: 95,
        days_since_last_booking: 75,
        favorite_course_type: 'standard' as const,
        preferred_time: 'afternoon' as const,
        booking_frequency: 'rarely' as const,
        cancellation_rate: 0.3,
        review_score_given: 3.2,
        email_engagement_rate: 0.2,
        mobile_app_usage: 0.1,
        referrals_made: 0,
        seasonal_preference: 'summer' as const,
        location_preference: 'local' as const,
        group_size_preference: 4
      }
    ];

    // Generar predicciones de churn
    const churnData = mockUsers.map(user => predictiveAnalytics.predictChurn(user));
    setChurnPredictions(churnData);

    // Generar segmentos de clientes
    const segments = predictiveAnalytics.segmentCustomers(mockUsers);
    setCustomerSegments(segments);

    // Generar insights predictivos
    const insights = predictiveAnalytics.generatePredictiveInsights();
    setPredictiveInsights(insights);

    // Datos en tiempo real iniciales
    setRealTimeData([
      { time: '14:00', churn_risk: 12, conversions: 8, engagement: 85 },
      { time: '14:05', churn_risk: 11, conversions: 12, engagement: 87 },
      { time: '14:10', churn_risk: 13, conversions: 6, engagement: 82 },
      { time: '14:15', churn_risk: 9, conversions: 15, engagement: 91 },
      { time: '14:20', churn_risk: 8, conversions: 18, engagement: 94 }
    ]);

    setLoading(false);
  };

  const updateRealTimeData = () => {
    setRealTimeData(prev => {
      const newTime = new Date().toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      const newData = {
        time: newTime,
        churn_risk: Math.floor(Math.random() * 20) + 5,
        conversions: Math.floor(Math.random() * 25) + 5,
        engagement: Math.floor(Math.random() * 20) + 80
      };

      return [...prev.slice(-4), newData];
    });
  };

  const getRiskColor = (risk: string) => {
    const colors = {
      'low': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-orange-100 text-orange-800',
      'critical': 'bg-red-100 text-red-800'
    };
    return colors[risk] || colors['medium'];
  };

  const getInsightIcon = (type: string) => {
    const icons = {
      'trend': TrendingUp,
      'opportunity': Target,
      'risk': AlertTriangle,
      'optimization': Zap
    };
    return icons[type] || Activity;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Inicializando IA Predictiva...</h2>
          <p className="text-gray-500">Entrenando modelos de machine learning</p>
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
              <Link href="/demo/executive-dashboard" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5" />
                Volver al Dashboard
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Brain className="h-6 w-6 text-purple-600" />
                  Análisis Predictivo con IA
                  <Badge className="bg-purple-100 text-purple-800 ml-2">MACHINE LEARNING</Badge>
                </h1>
                <p className="text-gray-600">Sistema avanzado de predicción y segmentación automática</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant={isRunning ? "destructive" : "default"}
                onClick={() => setIsRunning(!isRunning)}
                className="gap-2"
              >
                {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isRunning ? 'Pausar' : 'Iniciar'} Tiempo Real
              </Button>
              <Button variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Reentrenar Modelos
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar Predicciones
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Banner de estado del sistema */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                <Brain className="h-6 w-6" />
                🤖 Sistema de IA Predictiva Activo
              </h2>
              <p className="text-purple-100">
                Modelos entrenados • Predicción de churn • Segmentación automática • Recomendaciones personalizadas
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">v2.1.0</div>
              <div className="text-sm text-purple-200">Última actualización: 15 Jul 2024</div>
            </div>
          </div>
        </div>

        {/* Métricas en tiempo real */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Usuarios en Riesgo de Churn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {realTimeData.length > 0 ? realTimeData[realTimeData.length - 1].churn_risk : 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {isRunning ? 'Actualizando en tiempo real' : 'Datos estáticos'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Target className="h-4 w-4 text-green-500" />
                Conversiones Predichas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {realTimeData.length > 0 ? realTimeData[realTimeData.length - 1].conversions : 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Próximas 24 horas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-500" />
                Score de Engagement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {realTimeData.length > 0 ? realTimeData[realTimeData.length - 1].engagement : 0}%
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Promedio de usuarios activos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico en tiempo real */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Métricas Predictivas en Tiempo Real
              {isRunning && <Badge className="bg-green-100 text-green-800 ml-2">LIVE</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={realTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="churn_risk" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  name="Riesgo de Churn"
                />
                <Line 
                  type="monotone" 
                  dataKey="conversions" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Conversiones"
                />
                <Line 
                  type="monotone" 
                  dataKey="engagement" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Engagement %"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Predicciones de churn y segmentación */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Predicciones de Churn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {churnPredictions.map((prediction, index) => (
                  <div key={prediction.user_id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">Usuario {prediction.user_id.slice(-3)}</h4>
                        <p className="text-sm text-gray-600">
                          Probabilidad de churn: {(prediction.churn_probability * 100).toFixed(1)}%
                        </p>
                      </div>
                      <Badge className={getRiskColor(prediction.risk_level)}>
                        {prediction.risk_level.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Factores clave:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {prediction.key_factors.map((factor, i) => (
                          <li key={i}>• {factor}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Estrategia de retención:</p>
                      <p className="text-xs text-gray-600">{prediction.retention_strategy}</p>
                    </div>
                    <div className="text-xs text-gray-500">
                      Pérdida estimada de LTV: ${prediction.estimated_ltv_loss.toFixed(0)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Segmentación Automática
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customerSegments.map((segment, index) => (
                  <div key={segment.segment_id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: segment.color }}
                      ></div>
                      <h4 className="font-medium text-gray-900">{segment.name}</h4>
                      <Badge variant="outline">{segment.size} usuarios</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{segment.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="font-medium">LTV Promedio:</span>
                        <div className="text-green-600 font-semibold">${segment.avg_ltv}</div>
                      </div>
                      <div>
                        <span className="font-medium">Tasa de Churn:</span>
                        <div className="text-red-600 font-semibold">{(segment.churn_rate * 100).toFixed(1)}%</div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-700 mb-1">Campañas recomendadas:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {segment.recommended_campaigns.slice(0, 2).map((campaign, i) => (
                          <li key={i}>• {campaign}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights predictivos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Insights Predictivos Generados por IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {predictiveInsights.map((insight, index) => {
                const IconComponent = getInsightIcon(insight.type);
                return (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`p-2 rounded-full ${
                        insight.type === 'trend' ? 'bg-blue-100' :
                        insight.type === 'opportunity' ? 'bg-green-100' :
                        insight.type === 'risk' ? 'bg-red-100' :
                        'bg-purple-100'
                      }`}>
                        <IconComponent className={`h-4 w-4 ${
                          insight.type === 'trend' ? 'text-blue-600' :
                          insight.type === 'opportunity' ? 'text-green-600' :
                          insight.type === 'risk' ? 'text-red-600' :
                          'text-purple-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{insight.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs mb-3">
                      <div>
                        <span className="font-medium">Confianza:</span>
                        <div className="text-blue-600 font-semibold">{(insight.confidence * 100).toFixed(0)}%</div>
                      </div>
                      <div>
                        <span className="font-medium">Impacto:</span>
                        <div className="text-green-600 font-semibold">${insight.estimated_revenue_impact.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="text-xs">
                      <span className="font-medium text-gray-700">Acción recomendada:</span>
                      <p className="text-gray-600 mt-1">{insight.recommended_action}</p>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Timeline: {insight.timeline}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Footer del sistema */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-lg">
          <div className="text-center">
            <h3 className="text-lg font-bold mb-2">🧠 Sistema de Machine Learning Avanzado</h3>
            <p className="text-purple-100 mb-4">
              Algoritmos de última generación para predicción, segmentación y optimización automática
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-semibold">🎯 Predicción de Churn</div>
                <div className="text-purple-200">Precisión del 94.2%</div>
              </div>
              <div>
                <div className="font-semibold">👥 Segmentación Automática</div>
                <div className="text-purple-200">Clustering dinámico</div>
              </div>
              <div>
                <div className="font-semibold">💡 Insights Predictivos</div>
                <div className="text-purple-200">Análisis en tiempo real</div>
              </div>
              <div>
                <div className="font-semibold">🚀 Optimización Continua</div>
                <div className="text-purple-200">Aprendizaje automático</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

