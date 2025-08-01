'use client';

import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Settings, Mail, MessageSquare, Smartphone, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface Notification {
  id: string;
  type: 'email' | 'sms' | 'push' | 'in_app';
  event: string;
  subject?: string;
  content: string;
  status: string;
  createdAt: string;
  readAt?: string;
  template?: {
    name: string;
  };
}

interface NotificationPreference {
  event: string;
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
}

export default function AdvancedNotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('notifications');

  useEffect(() => {
    fetchNotifications();
    fetchPreferences();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/notifications/preferences');
      if (response.ok) {
        const data = await response.json();
        setPreferences(data.preferences);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST'
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, status: 'read', readAt: new Date().toISOString() }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const updatePreferences = async (updatedPreferences: NotificationPreference[]) => {
    setLoading(true);
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ preferences: updatedPreferences })
      });
      
      if (response.ok) {
        setPreferences(updatedPreferences);
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = (event: string, type: keyof Omit<NotificationPreference, 'event'>, value: boolean) => {
    const updatedPreferences = preferences.map(pref => 
      pref.event === event 
        ? { ...pref, [type]: value }
        : pref
    );
    
    // If preference doesn't exist, create it
    if (!preferences.find(pref => pref.event === event)) {
      updatedPreferences.push({
        event,
        email: type === 'email' ? value : true,
        sms: type === 'sms' ? value : false,
        push: type === 'push' ? value : true,
        inApp: type === 'inApp' ? value : true
      });
    }
    
    updatePreferences(updatedPreferences);
  };

  const getEventDisplayName = (event: string) => {
    const eventNames: Record<string, string> = {
      'booking_confirmed': 'Reserva Confirmada',
      'booking_cancelled': 'Reserva Cancelada',
      'booking_reminder': 'Recordatorio de Reserva',
      'payment_received': 'Pago Recibido',
      'payment_failed': 'Pago Fallido',
      'welcome': 'Bienvenida',
      'password_reset': 'Restablecimiento de Contraseña',
      'affiliate_commission': 'Comisión de Afiliado',
      'course_review_request': 'Solicitud de Reseña',
      'promotional_offer': 'Oferta Promocional'
    };
    return eventNames[event] || event;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'sms':
        return <Smartphone className="h-4 w-4" />;
      case 'push':
      case 'in_app':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Hace unos minutos';
    } else if (diffInHours < 24) {
      return `Hace ${Math.floor(diffInHours)} horas`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const defaultEvents = [
    'booking_confirmed',
    'booking_cancelled', 
    'booking_reminder',
    'payment_received',
    'payment_failed',
    'promotional_offer'
  ];

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">Notificaciones</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="notifications">
                Notificaciones
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="preferences">
                <Settings className="h-4 w-4 mr-1" />
                Preferencias
              </TabsTrigger>
            </TabsList>

            <TabsContent value="notifications" className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No tienes notificaciones
                </div>
              ) : (
                <div className="space-y-2 p-2">
                  {notifications.map((notification) => (
                    <Card 
                      key={notification.id}
                      className={`cursor-pointer transition-colors ${
                        notification.status === 'read' ? 'bg-gray-50' : 'bg-blue-50'
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-2 flex-1">
                            {getNotificationIcon(notification.type)}
                            <div className="flex-1 min-w-0">
                              {notification.subject && (
                                <p className="font-medium text-sm truncate">
                                  {notification.subject}
                                </p>
                              )}
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {notification.content}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {formatDate(notification.createdAt)}
                              </p>
                            </div>
                          </div>
                          {notification.status !== 'read' && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="preferences" className="max-h-96 overflow-y-auto">
              <div className="p-4 space-y-4">
                <div className="text-sm text-gray-600 mb-4">
                  Configura cómo quieres recibir notificaciones para cada tipo de evento.
                </div>
                
                {defaultEvents.map((event) => {
                  const pref = preferences.find(p => p.event === event) || {
                    event,
                    email: true,
                    sms: false,
                    push: true,
                    inApp: true
                  };

                  return (
                    <Card key={event}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">
                          {getEventDisplayName(event)}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`${event}-email`} className="flex items-center space-x-2">
                            <Mail className="h-4 w-4" />
                            <span>Email</span>
                          </Label>
                          <Switch
                            id={`${event}-email`}
                            checked={pref.email}
                            onCheckedChange={(checked) => updatePreference(event, 'email', checked)}
                            disabled={loading}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`${event}-sms`} className="flex items-center space-x-2">
                            <Smartphone className="h-4 w-4" />
                            <span>SMS</span>
                          </Label>
                          <Switch
                            id={`${event}-sms`}
                            checked={pref.sms}
                            onCheckedChange={(checked) => updatePreference(event, 'sms', checked)}
                            disabled={loading}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`${event}-push`} className="flex items-center space-x-2">
                            <MessageSquare className="h-4 w-4" />
                            <span>Push</span>
                          </Label>
                          <Switch
                            id={`${event}-push`}
                            checked={pref.push}
                            onCheckedChange={(checked) => updatePreference(event, 'push', checked)}
                            disabled={loading}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`${event}-inapp`} className="flex items-center space-x-2">
                            <Bell className="h-4 w-4" />
                            <span>En la app</span>
                          </Label>
                          <Switch
                            id={`${event}-inapp`}
                            checked={pref.inApp}
                            onCheckedChange={(checked) => updatePreference(event, 'inApp', checked)}
                            disabled={loading}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}

