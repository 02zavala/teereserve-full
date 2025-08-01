'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone,
  Download,
  Wifi,
  WifiOff,
  Bell,
  BellOff,
  RefreshCw,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Settings,
  Monitor,
  Globe,
  Zap,
  Shield,
  Database,
  Clock
} from 'lucide-react';
import usePWA from '@/hooks/usePWA';

export default function PWAManager() {
  const {
    isInstallable,
    isInstalled,
    isOffline,
    isUpdateAvailable,
    notificationPermission,
    installApp,
    updateApp,
    requestNotificationPermission,
    showNotification,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    clearCache,
    getCacheStatus
  } = usePWA();

  const [cacheStatus, setCacheStatus] = useState<any>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState({
    install: false,
    update: false,
    notification: false,
    subscribe: false,
    cache: false
  });

  useEffect(() => {
    loadCacheStatus();
  }, []);

  const loadCacheStatus = async () => {
    try {
      const status = await getCacheStatus();
      setCacheStatus(status);
    } catch (error) {
      console.error('Error loading cache status:', error);
    }
  };

  const handleInstall = async () => {
    setLoading(prev => ({ ...prev, install: true }));
    try {
      const success = await installApp();
      if (success) {
        await showNotification('¡App Instalada!', {
          body: 'TeeReserve Golf se ha instalado correctamente en tu dispositivo.',
          icon: '/icons/icon-192x192.png'
        });
      }
    } catch (error) {
      console.error('Installation error:', error);
    } finally {
      setLoading(prev => ({ ...prev, install: false }));
    }
  };

  const handleUpdate = async () => {
    setLoading(prev => ({ ...prev, update: true }));
    try {
      await updateApp();
    } catch (error) {
      console.error('Update error:', error);
    } finally {
      setLoading(prev => ({ ...prev, update: false }));
    }
  };

  const handleNotificationPermission = async () => {
    setLoading(prev => ({ ...prev, notification: true }));
    try {
      const permission = await requestNotificationPermission();
      if (permission === 'granted') {
        await showNotification('¡Notificaciones Habilitadas!', {
          body: 'Ahora recibirás notificaciones importantes sobre tus reservas.',
          icon: '/icons/icon-192x192.png'
        });
      }
    } catch (error) {
      console.error('Notification permission error:', error);
    } finally {
      setLoading(prev => ({ ...prev, notification: false }));
    }
  };

  const handleSubscribeNotifications = async () => {
    setLoading(prev => ({ ...prev, subscribe: true }));
    try {
      if (isSubscribed) {
        const success = await unsubscribeFromNotifications();
        if (success) {
          setIsSubscribed(false);
        }
      } else {
        const subscription = await subscribeToNotifications();
        if (subscription) {
          setIsSubscribed(true);
          await showNotification('¡Suscripción Activada!', {
            body: 'Ahora recibirás notificaciones push sobre ofertas y actualizaciones.',
            icon: '/icons/icon-192x192.png'
          });
        }
      }
    } catch (error) {
      console.error('Subscribe error:', error);
    } finally {
      setLoading(prev => ({ ...prev, subscribe: false }));
    }
  };

  const handleClearCache = async () => {
    setLoading(prev => ({ ...prev, cache: true }));
    try {
      await clearCache();
      await loadCacheStatus();
      await showNotification('Caché Limpiado', {
        body: 'El caché de la aplicación se ha limpiado correctamente.',
        icon: '/icons/icon-192x192.png'
      });
    } catch (error) {
      console.error('Clear cache error:', error);
    } finally {
      setLoading(prev => ({ ...prev, cache: false }));
    }
  };

  const getConnectionStatus = () => {
    return isOffline ? {
      icon: WifiOff,
      label: 'Sin Conexión',
      color: 'bg-red-100 text-red-800',
      description: 'Trabajando en modo offline'
    } : {
      icon: Wifi,
      label: 'Conectado',
      color: 'bg-green-100 text-green-800',
      description: 'Conexión a internet activa'
    };
  };

  const getNotificationStatus = () => {
    switch (notificationPermission) {
      case 'granted':
        return {
          icon: Bell,
          label: 'Habilitadas',
          color: 'bg-green-100 text-green-800',
          description: 'Notificaciones permitidas'
        };
      case 'denied':
        return {
          icon: BellOff,
          label: 'Bloqueadas',
          color: 'bg-red-100 text-red-800',
          description: 'Notificaciones bloqueadas'
        };
      default:
        return {
          icon: AlertCircle,
          label: 'Pendiente',
          color: 'bg-yellow-100 text-yellow-800',
          description: 'Permiso no solicitado'
        };
    }
  };

  const getInstallStatus = () => {
    if (isInstalled) {
      return {
        icon: CheckCircle,
        label: 'Instalada',
        color: 'bg-green-100 text-green-800',
        description: 'App instalada como PWA'
      };
    } else if (isInstallable) {
      return {
        icon: Download,
        label: 'Disponible',
        color: 'bg-blue-100 text-blue-800',
        description: 'Lista para instalar'
      };
    } else {
      return {
        icon: Monitor,
        label: 'Navegador',
        color: 'bg-gray-100 text-gray-800',
        description: 'Ejecutándose en navegador'
      };
    }
  };

  const connectionStatus = getConnectionStatus();
  const notificationStatus = getNotificationStatus();
  const installStatus = getInstallStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
          <Smartphone className="h-6 w-6 text-blue-600" />
          Gestión de PWA
        </h2>
        <p className="text-gray-600">
          Configuración y estado de la Progressive Web App
        </p>
      </div>

      {/* Estado general */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <installStatus.icon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Instalación</p>
                <Badge className={installStatus.color}>
                  {installStatus.label}
                </Badge>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">{installStatus.description}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <connectionStatus.icon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Conexión</p>
                <Badge className={connectionStatus.color}>
                  {connectionStatus.label}
                </Badge>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">{connectionStatus.description}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <notificationStatus.icon className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Notificaciones</p>
                <Badge className={notificationStatus.color}>
                  {notificationStatus.label}
                </Badge>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">{notificationStatus.description}</p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas importantes */}
      {isUpdateAvailable && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <div className="flex-1">
                <p className="font-medium text-orange-900">Actualización Disponible</p>
                <p className="text-sm text-orange-700">
                  Hay una nueva versión de la aplicación disponible.
                </p>
              </div>
              <Button 
                onClick={handleUpdate}
                disabled={loading.update}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {loading.update ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  'Actualizar'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Acciones principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-600" />
              Instalación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isInstallable && !isInstalled && (
              <div>
                <p className="text-sm text-gray-600 mb-3">
                  Instala TeeReserve Golf como aplicación nativa para una mejor experiencia.
                </p>
                <Button 
                  onClick={handleInstall}
                  disabled={loading.install}
                  className="w-full gap-2"
                >
                  {loading.install ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Instalar App
                </Button>
              </div>
            )}

            {isInstalled && (
              <div className="text-center py-4">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <p className="font-medium text-green-900">¡App Instalada!</p>
                <p className="text-sm text-green-700">
                  La aplicación está funcionando como PWA
                </p>
              </div>
            )}

            {!isInstallable && !isInstalled && (
              <div className="text-center py-4">
                <Info className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="font-medium text-gray-600">No Disponible</p>
                <p className="text-sm text-gray-500">
                  La instalación no está disponible en este navegador
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-orange-600" />
              Notificaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-3">
                Habilita las notificaciones para recibir actualizaciones importantes.
              </p>
              
              {notificationPermission === 'default' && (
                <Button 
                  onClick={handleNotificationPermission}
                  disabled={loading.notification}
                  className="w-full gap-2 mb-2"
                  variant="outline"
                >
                  {loading.notification ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Bell className="h-4 w-4" />
                  )}
                  Habilitar Notificaciones
                </Button>
              )}

              {notificationPermission === 'granted' && (
                <Button 
                  onClick={handleSubscribeNotifications}
                  disabled={loading.subscribe}
                  className="w-full gap-2"
                  variant={isSubscribed ? "outline" : "default"}
                >
                  {loading.subscribe ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : isSubscribed ? (
                    <BellOff className="h-4 w-4" />
                  ) : (
                    <Bell className="h-4 w-4" />
                  )}
                  {isSubscribed ? 'Desuscribirse' : 'Suscribirse a Push'}
                </Button>
              )}

              {notificationPermission === 'denied' && (
                <div className="text-center py-2">
                  <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-sm text-red-600">
                    Notificaciones bloqueadas. Habilítalas en la configuración del navegador.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estado del caché */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-purple-600" />
            Estado del Caché
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {cacheStatus?.cachedUrls || 0}
              </div>
              <p className="text-sm text-gray-600">URLs Cacheadas</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {cacheStatus?.version?.split('-').pop() || 'N/A'}
              </div>
              <p className="text-sm text-gray-600">Versión</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {cacheStatus?.lastUpdate ? 
                  new Date(cacheStatus.lastUpdate).toLocaleTimeString('es-MX') : 
                  'N/A'
                }
              </div>
              <p className="text-sm text-gray-600">Última Actualización</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={loadCacheStatus}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Actualizar Estado
            </Button>
            <Button 
              onClick={handleClearCache}
              disabled={loading.cache}
              variant="outline"
              className="gap-2"
            >
              {loading.cache ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Limpiar Caché
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Características de PWA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            Características PWA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Funciona Offline</p>
                <p className="text-sm text-green-700">Caché inteligente implementado</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Responsive Design</p>
                <p className="text-sm text-green-700">Optimizado para móviles</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Push Notifications</p>
                <p className="text-sm text-green-700">Notificaciones en tiempo real</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Actualizaciones Auto</p>
                <p className="text-sm text-green-700">Service Worker activo</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

