"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Bell,
  Mail,
  MessageSquare,
  Settings,
  Check,
  X,
  Clock,
  AlertCircle,
  CheckCircle,
  Info,
  Trash2,
  MarkAsUnread,
  Filter
} from 'lucide-react'

interface Notification {
  id: string
  type: 'reservation' | 'payment' | 'system' | 'promotion'
  title: string
  message: string
  isRead: boolean
  createdAt: string
  priority: 'low' | 'medium' | 'high'
  actionUrl?: string
  metadata?: any
}

interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  smsNotifications: boolean
  reservationUpdates: boolean
  paymentAlerts: boolean
  promotionalEmails: boolean
  systemUpdates: boolean
}

interface NotificationCenterProps {
  userId: string
  userType: 'client' | 'golf_course' | 'admin'
}

export default function NotificationCenter({ userId, userType }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    reservationUpdates: true,
    paymentAlerts: true,
    promotionalEmails: false,
    systemUpdates: true
  })
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [activeTab, setActiveTab] = useState('notifications')

  useEffect(() => {
    fetchNotifications()
    fetchSettings()
    
    // Configurar polling para notificaciones en tiempo real
    const interval = setInterval(fetchNotifications, 30000) // Cada 30 segundos
    
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/notifications?userId=${userId}&filter=${filter}`)
      const data = await response.json()
      
      if (data.success) {
        setNotifications(data.data)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const fetchSettings = async () => {
    try {
      const response = await fetch(`/api/notifications/settings?userId=${userId}`)
      const data = await response.json()
      
      if (data.success) {
        setSettings(data.data)
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isRead: true })
      })

      if (response.ok) {
        setNotifications(notifications.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        ))
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch(`/api/notifications/mark-all-read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      })

      if (response.ok) {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })))
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setNotifications(notifications.filter(n => n.id !== notificationId))
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings }
      
      const response = await fetch(`/api/notifications/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          settings: updatedSettings
        })
      })

      if (response.ok) {
        setSettings(updatedSettings)
      }
    } catch (error) {
      console.error('Error updating notification settings:', error)
    }
  }

  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = priority === 'high' ? 'text-red-500' : 
                     priority === 'medium' ? 'text-yellow-500' : 'text-blue-500'
    
    switch (type) {
      case 'reservation':
        return <Calendar className={`w-5 h-5 ${iconClass}`} />
      case 'payment':
        return <CheckCircle className={`w-5 h-5 ${iconClass}`} />
      case 'system':
        return <Settings className={`w-5 h-5 ${iconClass}`} />
      case 'promotion':
        return <Info className={`w-5 h-5 ${iconClass}`} />
      default:
        return <Bell className={`w-5 h-5 ${iconClass}`} />
    }
  }

  const getPriorityBadge = (priority: string) => {
    const variants = {
      high: 'destructive' as const,
      medium: 'default' as const,
      low: 'secondary' as const
    }
    
    const labels = {
      high: 'Alta',
      medium: 'Media',
      low: 'Baja'
    }
    
    return (
      <Badge variant={variants[priority as keyof typeof variants]}>
        {labels[priority as keyof typeof labels]}
      </Badge>
    )
  }

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead
    if (filter === 'read') return notification.isRead
    return true
  })

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Bell className="w-6 h-6 text-gray-700" />
          <div>
            <h3 className="text-lg font-semibold">Centro de Notificaciones</h3>
            <p className="text-sm text-gray-600">
              {unreadCount > 0 ? `${unreadCount} notificaciones sin leer` : 'Todas las notificaciones leídas'}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <Check className="w-4 h-4 mr-2" />
            Marcar todas como leídas
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notifications">
            Notificaciones
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>

        {/* Notificaciones */}
        <TabsContent value="notifications" className="space-y-4">
          {/* Filtros */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Todas ({notifications.length})
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unread')}
            >
              Sin leer ({unreadCount})
            </Button>
            <Button
              variant={filter === 'read' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('read')}
            >
              Leídas ({notifications.length - unreadCount})
            </Button>
          </div>

          {/* Lista de Notificaciones */}
          <Card>
            <CardContent className="p-0">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="mx-auto h-12 w-12 mb-4" />
                  <p>No hay notificaciones</p>
                  <p className="text-sm">Te notificaremos cuando haya actualizaciones importantes</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          {getNotificationIcon(notification.type, notification.priority)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className={`text-sm font-medium ${
                                !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                                {notification.title}
                              </h4>
                              {getPriorityBadge(notification.priority)}
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {new Date(notification.createdAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {notification.actionUrl && (
                        <div className="mt-3">
                          <Button variant="outline" size="sm">
                            Ver detalles
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuración */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Preferencias de Notificación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Canales de Notificación */}
              <div>
                <h4 className="font-medium mb-4">Canales de Notificación</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-500" />
                      <div>
                        <Label htmlFor="email">Notificaciones por Email</Label>
                        <p className="text-sm text-gray-600">Recibir notificaciones en tu correo electrónico</p>
                      </div>
                    </div>
                    <Switch
                      id="email"
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => updateSettings({ emailNotifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Bell className="w-5 h-5 text-gray-500" />
                      <div>
                        <Label htmlFor="push">Notificaciones Push</Label>
                        <p className="text-sm text-gray-600">Notificaciones en tiempo real en el navegador</p>
                      </div>
                    </div>
                    <Switch
                      id="push"
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => updateSettings({ pushNotifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <MessageSquare className="w-5 h-5 text-gray-500" />
                      <div>
                        <Label htmlFor="sms">Notificaciones SMS</Label>
                        <p className="text-sm text-gray-600">Mensajes de texto para notificaciones importantes</p>
                      </div>
                    </div>
                    <Switch
                      id="sms"
                      checked={settings.smsNotifications}
                      onCheckedChange={(checked) => updateSettings({ smsNotifications: checked })}
                    />
                  </div>
                </div>
              </div>

              {/* Tipos de Notificación */}
              <div>
                <h4 className="font-medium mb-4">Tipos de Notificación</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="reservations">Actualizaciones de Reservas</Label>
                      <p className="text-sm text-gray-600">Confirmaciones, cancelaciones y cambios</p>
                    </div>
                    <Switch
                      id="reservations"
                      checked={settings.reservationUpdates}
                      onCheckedChange={(checked) => updateSettings({ reservationUpdates: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="payments">Alertas de Pago</Label>
                      <p className="text-sm text-gray-600">Confirmaciones de pago y recordatorios</p>
                    </div>
                    <Switch
                      id="payments"
                      checked={settings.paymentAlerts}
                      onCheckedChange={(checked) => updateSettings({ paymentAlerts: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="promotions">Emails Promocionales</Label>
                      <p className="text-sm text-gray-600">Ofertas especiales y promociones</p>
                    </div>
                    <Switch
                      id="promotions"
                      checked={settings.promotionalEmails}
                      onCheckedChange={(checked) => updateSettings({ promotionalEmails: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="system">Actualizaciones del Sistema</Label>
                      <p className="text-sm text-gray-600">Mantenimiento y nuevas funcionalidades</p>
                    </div>
                    <Switch
                      id="system"
                      checked={settings.systemUpdates}
                      onCheckedChange={(checked) => updateSettings({ systemUpdates: checked })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuración Avanzada para Campos de Golf */}
          {userType === 'golf_course' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Configuración para Campos de Golf</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notificaciones de Nuevas Reservas</Label>
                      <p className="text-sm text-gray-600">Inmediatamente cuando se haga una reserva</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Resumen Diario</Label>
                      <p className="text-sm text-gray-600">Reporte diario de reservas e ingresos</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Alertas de Baja Ocupación</Label>
                      <p className="text-sm text-gray-600">Cuando la ocupación esté por debajo del 50%</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

