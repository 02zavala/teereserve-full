'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Smartphone,
  Wifi,
  WifiOff,
  Download,
  Bell,
  Zap,
  Shield,
  Globe,
  Monitor,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Database,
  Clock,
  Settings,
  Play,
  Pause,
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import PWAManager from '@/components/PWAManager';
import usePWA from '@/hooks/usePWA';

export default function PWAFeaturesDemo() {
  const [loading, setLoading] = useState(true);
  const [activeDemo, setActiveDemo] = useState('overview');
  const [demoNotifications, setDemoNotifications] = useState<any[]>([]);
  
  const {
    isInstallable,
    isInstalled,
    isOffline,
    isUpdateAvailable,
    notificationPermission,
    showNotification
  } = usePWA();

  useEffect(() => {
    // Simular carga
    setTimeout(() => setLoading(false), 1500);
  }, []);

  const sendDemoNotification = async (type: string) => {
    const notifications = {
      booking: {
        title: '🏌️ Reserva Confirmada',
        body: 'Tu reserva en Cabo Real Golf Club para mañana a las 10:00 AM ha sido confirmada.',
        icon: '/icons/icon-192x192.png',
        tag: 'booking-confirmed'
      },
      reminder: {
        title: '⏰ Recordatorio de Tee Time',
        body: 'Tu tee time es en 1 hora. ¡Prepárate para jugar!',
        icon: '/icons/icon-192x192.png',
        tag: 'tee-time-reminder'
      },
      weather: {
        title: '🌤️ Condiciones del Campo',
        body: 'Clima perfecto para golf: 24°C, soleado con viento ligero.',
        icon: '/icons/icon-192x192.png',
        tag: 'weather-update'
      },
      promotion: {
        title: '🎯 Oferta Especial',
        body: '30% de descuento en green fees este fin de semana. ¡Reserva ahora!',
        icon: '/icons/icon-192x192.png',
        tag: 'special-offer'
      }
    };

    const notification = notifications[type];
    if (notification) {
      await showNotification(notification.title, {
        body: notification.body,
        icon: notification.icon,
        tag: notification.tag,
        requireInteraction: true,
        actions: [
          { action: 'view', title: 'Ver Detalles' },
          { action: 'dismiss', title: 'Descartar' }
        ]
      });

      // Agregar a la lista de demo
      setDemoNotifications(prev => [
        {
          ...notification,
          timestamp: new Date().toLocaleTimeString('es-MX'),
          id: Date.now()
        },
        ...prev.slice(0, 4)
      ]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Cargando PWA Features...</h2>
          <p className="text-gray-500">Inicializando funcionalidades avanzadas</p>
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
              <Link href="/demo/automated-reports" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5" />
                Volver a Reportes
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Smartphone className="h-6 w-6 text-blue-600" />
                  PWA Features Demo
                  <Badge className="bg-blue-100 text-blue-800 ml-2">v2.1.0</Badge>
                </h1>
                <p className="text-gray-600">Progressive Web App con funcionalidades nativas</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2">
                <Settings className="h-4 w-4" />
                Configurar
              </Button>
              <Button variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Actualizar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Banner del sistema */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                <Smartphone className="h-6 w-6" />
                📱 Progressive Web App Activa
              </h2>
              <p className="text-purple-100">
                Instalación nativa • Funciona offline • Push notifications • Actualizaciones automáticas
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {isInstalled ? '✅' : isInstallable ? '📲' : '🌐'}
              </div>
              <div className="text-sm text-purple-200">
                {isInstalled ? 'Instalada' : isInstallable ? 'Disponible' : 'Navegador'}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs de navegación */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Resumen General', icon: BarChart3 },
                { id: 'installation', label: 'Instalación', icon: Download },
                { id: 'notifications', label: 'Notificaciones', icon: Bell },
                { id: 'offline', label: 'Modo Offline', icon: WifiOff },
                { id: 'performance', label: 'Rendimiento', icon: Zap }
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveDemo(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      activeDemo === tab.id
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
            {activeDemo === 'overview' && (
              <div className="space-y-6">
                <PWAManager />
              </div>
            )}

            {/* Tab: Instalación */}
            {activeDemo === 'installation' && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Instalación de PWA</h3>
                  <p className="text-gray-600">
                    Convierte TeeReserve Golf en una aplicación nativa
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Smartphone className="h-5 w-5 text-blue-600" />
                        Estado de Instalación
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center py-6">
                        {isInstalled ? (
                          <>
                            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                            <h4 className="text-xl font-bold text-green-900 mb-2">¡App Instalada!</h4>
                            <p className="text-green-700">
                              TeeReserve Golf está funcionando como aplicación nativa
                            </p>
                            <Badge className="bg-green-100 text-green-800 mt-2">
                              PWA Activa
                            </Badge>
                          </>
                        ) : isInstallable ? (
                          <>
                            <Download className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                            <h4 className="text-xl font-bold text-blue-900 mb-2">Lista para Instalar</h4>
                            <p className="text-blue-700 mb-4">
                              La aplicación puede instalarse como PWA
                            </p>
                            <Button className="gap-2">
                              <Download className="h-4 w-4" />
                              Instalar Ahora
                            </Button>
                          </>
                        ) : (
                          <>
                            <Monitor className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h4 className="text-xl font-bold text-gray-600 mb-2">Modo Navegador</h4>
                            <p className="text-gray-500">
                              Ejecutándose en navegador web
                            </p>
                            <Badge className="bg-gray-100 text-gray-800 mt-2">
                              Web App
                            </Badge>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Beneficios de la Instalación</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Zap className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Acceso Rápido</p>
                            <p className="text-sm text-gray-600">Icono en pantalla de inicio</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Shield className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Experiencia Nativa</p>
                            <p className="text-sm text-gray-600">Sin barras del navegador</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <WifiOff className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Funciona Offline</p>
                            <p className="text-sm text-gray-600">Caché inteligente</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <Bell className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Push Notifications</p>
                            <p className="text-sm text-gray-600">Alertas en tiempo real</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Tab: Notificaciones */}
            {activeDemo === 'notifications' && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Sistema de Notificaciones</h3>
                  <p className="text-gray-600">
                    Push notifications nativas para mantener a los usuarios informados
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-orange-600" />
                        Demos de Notificaciones
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button 
                        onClick={() => sendDemoNotification('booking')}
                        className="w-full justify-start gap-3"
                        variant="outline"
                      >
                        <div className="p-1 bg-green-100 rounded">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        Confirmación de Reserva
                      </Button>

                      <Button 
                        onClick={() => sendDemoNotification('reminder')}
                        className="w-full justify-start gap-3"
                        variant="outline"
                      >
                        <div className="p-1 bg-blue-100 rounded">
                          <Clock className="h-4 w-4 text-blue-600" />
                        </div>
                        Recordatorio de Tee Time
                      </Button>

                      <Button 
                        onClick={() => sendDemoNotification('weather')}
                        className="w-full justify-start gap-3"
                        variant="outline"
                      >
                        <div className="p-1 bg-yellow-100 rounded">
                          <Globe className="h-4 w-4 text-yellow-600" />
                        </div>
                        Condiciones del Campo
                      </Button>

                      <Button 
                        onClick={() => sendDemoNotification('promotion')}
                        className="w-full justify-start gap-3"
                        variant="outline"
                      >
                        <div className="p-1 bg-purple-100 rounded">
                          <DollarSign className="h-4 w-4 text-purple-600" />
                        </div>
                        Oferta Especial
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Historial de Notificaciones</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {demoNotifications.length === 0 ? (
                        <div className="text-center py-8">
                          <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">
                            No hay notificaciones aún
                          </p>
                          <p className="text-sm text-gray-400">
                            Prueba los demos de la izquierda
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {demoNotifications.map((notification) => (
                            <div key={notification.id} className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-start gap-3">
                                <div className="p-1 bg-blue-100 rounded">
                                  <Bell className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 text-sm">
                                    {notification.title}
                                  </p>
                                  <p className="text-gray-600 text-xs mt-1">
                                    {notification.body}
                                  </p>
                                  <p className="text-gray-400 text-xs mt-2">
                                    {notification.timestamp}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Tab: Modo Offline */}
            {activeDemo === 'offline' && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Funcionalidad Offline</h3>
                  <p className="text-gray-600">
                    La aplicación funciona sin conexión a internet
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {isOffline ? (
                          <WifiOff className="h-5 w-5 text-red-600" />
                        ) : (
                          <Wifi className="h-5 w-5 text-green-600" />
                        )}
                        Estado de Conexión
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-6">
                        {isOffline ? (
                          <>
                            <WifiOff className="h-16 w-16 text-red-600 mx-auto mb-4" />
                            <h4 className="text-xl font-bold text-red-900 mb-2">Sin Conexión</h4>
                            <p className="text-red-700 mb-4">
                              Trabajando en modo offline con datos cacheados
                            </p>
                            <Badge className="bg-red-100 text-red-800">
                              Offline Mode
                            </Badge>
                          </>
                        ) : (
                          <>
                            <Wifi className="h-16 w-16 text-green-600 mx-auto mb-4" />
                            <h4 className="text-xl font-bold text-green-900 mb-2">Conectado</h4>
                            <p className="text-green-700 mb-4">
                              Conexión a internet activa
                            </p>
                            <Badge className="bg-green-100 text-green-800">
                              Online Mode
                            </Badge>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Características Offline</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium text-gray-900">Navegación Completa</p>
                            <p className="text-sm text-gray-600">Todas las páginas disponibles</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium text-gray-900">Datos Cacheados</p>
                            <p className="text-sm text-gray-600">Información de campos y reservas</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium text-gray-900">Sincronización Auto</p>
                            <p className="text-sm text-gray-600">Al recuperar conexión</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-5 w-5 text-yellow-600" />
                          <div>
                            <p className="font-medium text-gray-900">Funciones Limitadas</p>
                            <p className="text-sm text-gray-600">Nuevas reservas requieren conexión</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Tab: Rendimiento */}
            {activeDemo === 'performance' && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Métricas de Rendimiento</h3>
                  <p className="text-gray-600">
                    Optimizaciones PWA para una experiencia superior
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Zap className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900">1.2s</div>
                      <p className="text-sm text-gray-600">Tiempo de Carga</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <Database className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900">2.1MB</div>
                      <p className="text-sm text-gray-600">Caché Total</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <Activity className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900">99.8%</div>
                      <p className="text-sm text-gray-600">Uptime</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900">95</div>
                      <p className="text-sm text-gray-600">Lighthouse Score</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Optimizaciones Implementadas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="text-gray-900">Service Worker Avanzado</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="text-gray-900">Caché Estratégico</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="text-gray-900">Lazy Loading</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="text-gray-900">Compresión de Imágenes</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="text-gray-900">Minificación de Assets</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="text-gray-900">HTTP/2 Push</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="text-gray-900">Critical CSS Inline</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="text-gray-900">Preload de Recursos</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Footer del sistema */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg">
          <div className="text-center">
            <h3 className="text-lg font-bold mb-2">📱 Progressive Web App v2.1.0</h3>
            <p className="text-purple-100 mb-4">
              Experiencia nativa, funcionalidad offline y notificaciones push
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-semibold">📲 Instalación Nativa</div>
                <div className="text-purple-200">Icono en pantalla</div>
              </div>
              <div>
                <div className="font-semibold">🔄 Funciona Offline</div>
                <div className="text-purple-200">Caché inteligente</div>
              </div>
              <div>
                <div className="font-semibold">🔔 Push Notifications</div>
                <div className="text-purple-200">Alertas en tiempo real</div>
              </div>
              <div>
                <div className="font-semibold">⚡ Alto Rendimiento</div>
                <div className="text-purple-200">Optimizado para móviles</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

