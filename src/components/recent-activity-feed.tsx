"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Activity,
  User,
  Calendar,
  CreditCard,
  MapPin,
  UserPlus,
  DollarSign,
  MessageSquare,
  Settings,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface ActivityItem {
  id: string
  type: 'booking' | 'user_registration' | 'payment' | 'support_message' | 'golf_course_update' | 'commission' | 'system'
  title: string
  description: string
  user?: {
    name: string
    email: string
  }
  metadata?: {
    amount?: number
    golfCourse?: string
    bookingId?: string
    userId?: string
  }
  timestamp: string
  priority: 'low' | 'medium' | 'high'
}

export default function RecentActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    fetchRecentActivity()
    
    if (autoRefresh) {
      const interval = setInterval(fetchRecentActivity, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const fetchRecentActivity = async () => {
    try {
      // Mock data - replace with actual API call
      const mockActivities: ActivityItem[] = [
        {
          id: '1',
          type: 'booking',
          title: 'Nueva reserva confirmada',
          description: 'Juan Pérez reservó 4 espacios en Cabo Real Golf Club',
          user: {
            name: 'Juan Pérez',
            email: 'juan@example.com'
          },
          metadata: {
            amount: 11200,
            golfCourse: 'Cabo Real Golf Club',
            bookingId: 'BK001'
          },
          timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
          priority: 'medium'
        },
        {
          id: '2',
          type: 'payment',
          title: 'Pago procesado exitosamente',
          description: 'Pago de $5,600 MXN procesado para reserva en El Camaleón',
          user: {
            name: 'María González',
            email: 'maria@example.com'
          },
          metadata: {
            amount: 5600,
            golfCourse: 'El Camaleón Golf Club',
            bookingId: 'BK002'
          },
          timestamp: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
          priority: 'low'
        },
        {
          id: '3',
          type: 'user_registration',
          title: 'Nuevo usuario registrado',
          description: 'Ana López se registró como cliente',
          user: {
            name: 'Ana López',
            email: 'ana@example.com'
          },
          timestamp: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
          priority: 'low'
        },
        {
          id: '4',
          type: 'support_message',
          title: 'Nuevo mensaje de soporte',
          description: 'Carlos Rodríguez reportó un problema técnico',
          user: {
            name: 'Carlos Rodríguez',
            email: 'carlos@example.com'
          },
          timestamp: new Date(Date.now() - 1200000).toISOString(), // 20 minutes ago
          priority: 'high'
        },
        {
          id: '5',
          type: 'commission',
          title: 'Comisión generada',
          description: 'Afiliado TEE123 generó $280 MXN en comisiones',
          metadata: {
            amount: 280
          },
          timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
          priority: 'medium'
        },
        {
          id: '6',
          type: 'golf_course_update',
          title: 'Campo de golf actualizado',
          description: 'Club de Golf La Ceiba actualizó su disponibilidad',
          metadata: {
            golfCourse: 'Club de Golf La Ceiba'
          },
          timestamp: new Date(Date.now() - 2400000).toISOString(), // 40 minutes ago
          priority: 'low'
        },
        {
          id: '7',
          type: 'system',
          title: 'Mantenimiento programado',
          description: 'Sistema de pagos actualizado exitosamente',
          timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          priority: 'medium'
        }
      ]
      
      setActivities(mockActivities)
    } catch (error) {
      console.error('Error fetching recent activity:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <Calendar className="h-4 w-4 text-blue-600" />
      case 'payment':
        return <CreditCard className="h-4 w-4 text-green-600" />
      case 'user_registration':
        return <UserPlus className="h-4 w-4 text-purple-600" />
      case 'support_message':
        return <MessageSquare className="h-4 w-4 text-orange-600" />
      case 'commission':
        return <DollarSign className="h-4 w-4 text-emerald-600" />
      case 'golf_course_update':
        return <MapPin className="h-4 w-4 text-indigo-600" />
      case 'system':
        return <Settings className="h-4 w-4 text-gray-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Alta</Badge>
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Media</Badge>
      case 'low':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Baja</Badge>
      default:
        return null
    }
  }

  const getTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Ahora mismo'
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)} h`
    return format(time, 'dd MMM HH:mm', { locale: es })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Actividad Reciente
            </CardTitle>
            <CardDescription>
              Eventos y acciones en tiempo real
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? 'text-green-600' : ''}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
              {autoRefresh ? 'Auto' : 'Manual'}
            </Button>
            <Button variant="outline" size="sm" onClick={fetchRecentActivity}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {activities.map((activity, index) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50">
              <div className="flex-shrink-0 mt-1">
                {getActivityIcon(activity.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-medium text-sm">{activity.title}</h4>
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(activity.priority)}
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {getTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  {activity.user && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {activity.user.name}
                    </div>
                  )}
                  
                  {activity.metadata?.amount && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      ${activity.metadata.amount.toLocaleString()} MXN
                    </div>
                  )}
                  
                  {activity.metadata?.golfCourse && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {activity.metadata.golfCourse}
                    </div>
                  )}
                  
                  {activity.metadata?.bookingId && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      #{activity.metadata.bookingId}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {activities.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No hay actividad reciente</p>
              <p className="text-sm">Los eventos aparecerán aquí en tiempo real</p>
            </div>
          )}
        </div>
        
        {activities.length > 0 && (
          <div className="mt-4 pt-4 border-t text-center">
            <Button variant="outline" size="sm">
              Ver toda la actividad
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

