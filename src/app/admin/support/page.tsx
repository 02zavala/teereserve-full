"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  MessageSquare, 
  Search, 
  Filter,
  Reply,
  Archive,
  Star,
  Clock,
  CheckCircle,
  AlertTriangle,
  Mail,
  Phone,
  User,
  Calendar,
  Send
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface SupportMessage {
  id: string
  subject: string
  message: string
  status: 'new' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'booking' | 'payment' | 'technical' | 'general' | 'complaint'
  user: {
    id: string
    name: string
    email: string
    phone?: string
  }
  createdAt: string
  updatedAt: string
  responses: Array<{
    id: string
    message: string
    isAdmin: boolean
    createdAt: string
    author: string
  }>
}

export default function AdminSupportPage() {
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [selectedMessage, setSelectedMessage] = useState<SupportMessage | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [replyMessage, setReplyMessage] = useState('')

  useEffect(() => {
    fetchSupportMessages()
  }, [])

  const fetchSupportMessages = async () => {
    try {
      // Mock data - replace with actual API call
      const mockMessages: SupportMessage[] = [
        {
          id: '1',
          subject: 'Problema con el pago de mi reserva',
          message: 'Hola, intenté hacer una reserva en Cabo Real Golf Club pero mi tarjeta fue rechazada. Ya verifiqué con mi banco y no hay problemas. ¿Pueden ayudarme?',
          status: 'new',
          priority: 'high',
          category: 'payment',
          user: {
            id: 'user1',
            name: 'Juan Pérez',
            email: 'juan@example.com',
            phone: '+52 55 1234 5678'
          },
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          updatedAt: new Date(Date.now() - 3600000).toISOString(),
          responses: []
        },
        {
          id: '2',
          subject: 'Cancelación de reserva',
          message: 'Necesito cancelar mi reserva del 15 de diciembre en El Camaleón Golf Club debido a una emergencia familiar. ¿Es posible obtener un reembolso?',
          status: 'in_progress',
          priority: 'medium',
          category: 'booking',
          user: {
            id: 'user2',
            name: 'María González',
            email: 'maria@example.com'
          },
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          updatedAt: new Date(Date.now() - 1800000).toISOString(),
          responses: [
            {
              id: 'resp1',
              message: 'Hola María, lamento escuchar sobre tu emergencia familiar. Revisaré tu reserva y te contactaré en breve con las opciones disponibles.',
              isAdmin: true,
              createdAt: new Date(Date.now() - 1800000).toISOString(),
              author: 'Admin TeeReserve'
            }
          ]
        },
        {
          id: '3',
          subject: 'Error en la aplicación móvil',
          message: 'La app se cierra cuando intento ver los horarios disponibles en Club de Golf La Ceiba. Estoy usando iPhone 14 con iOS 17.',
          status: 'resolved',
          priority: 'medium',
          category: 'technical',
          user: {
            id: 'user3',
            name: 'Carlos Rodríguez',
            email: 'carlos@example.com'
          },
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 3600000).toISOString(),
          responses: [
            {
              id: 'resp2',
              message: 'Hola Carlos, gracias por reportar este problema. Nuestro equipo técnico está trabajando en una solución.',
              isAdmin: true,
              createdAt: new Date(Date.now() - 21600000).toISOString(),
              author: 'Soporte Técnico'
            },
            {
              id: 'resp3',
              message: 'Hemos lanzado una actualización que corrige este problema. Por favor actualiza la app desde la App Store.',
              isAdmin: true,
              createdAt: new Date(Date.now() - 3600000).toISOString(),
              author: 'Soporte Técnico'
            }
          ]
        },
        {
          id: '4',
          subject: 'Consulta sobre códigos de descuento',
          message: '¿Tienen algún código de descuento disponible para nuevos usuarios? Me recomendaron su plataforma.',
          status: 'closed',
          priority: 'low',
          category: 'general',
          user: {
            id: 'user4',
            name: 'Ana López',
            email: 'ana@example.com'
          },
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
          responses: [
            {
              id: 'resp4',
              message: '¡Hola Ana! Bienvenida a TeeReserve. Puedes usar el código WELCOME10 para obtener un 10% de descuento en tu primera reserva.',
              isAdmin: true,
              createdAt: new Date(Date.now() - 86400000).toISOString(),
              author: 'Atención al Cliente'
            }
          ]
        }
      ]
      
      setMessages(mockMessages)
    } catch (error) {
      console.error('Error fetching support messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendReply = async () => {
    if (!selectedMessage || !replyMessage.trim()) return

    const newResponse = {
      id: Date.now().toString(),
      message: replyMessage,
      isAdmin: true,
      createdAt: new Date().toISOString(),
      author: 'Admin TeeReserve'
    }

    const updatedMessage = {
      ...selectedMessage,
      responses: [...selectedMessage.responses, newResponse],
      status: 'in_progress' as const,
      updatedAt: new Date().toISOString()
    }

    setMessages(messages.map(msg => 
      msg.id === selectedMessage.id ? updatedMessage : msg
    ))
    setSelectedMessage(updatedMessage)
    setReplyMessage('')
  }

  const updateMessageStatus = async (messageId: string, newStatus: SupportMessage['status']) => {
    setMessages(messages.map(msg => 
      msg.id === messageId 
        ? { ...msg, status: newStatus, updatedAt: new Date().toISOString() }
        : msg
    ))
    
    if (selectedMessage?.id === messageId) {
      setSelectedMessage({ ...selectedMessage, status: newStatus })
    }
  }

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || message.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || message.priority === priorityFilter
    const matchesCategory = categoryFilter === 'all' || message.category === categoryFilter
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Nuevo</Badge>
      case 'in_progress':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">En Progreso</Badge>
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Resuelto</Badge>
      case 'closed':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Cerrado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Urgente</Badge>
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Alta</Badge>
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Media</Badge>
      case 'low':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Baja</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'booking':
        return <Calendar className="h-4 w-4" />
      case 'payment':
        return <CheckCircle className="h-4 w-4" />
      case 'technical':
        return <AlertTriangle className="h-4 w-4" />
      case 'complaint':
        return <Star className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Soporte y Mensajes</h1>
          <p className="text-gray-600">
            Gestiona consultas y mensajes de los usuarios
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensajes Nuevos</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {messages.filter(m => m.status === 'new').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Requieren atención
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {messages.filter(m => m.status === 'in_progress').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Siendo atendidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resueltos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {messages.filter(m => m.status === 'resolved').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Completados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prioridad Alta</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {messages.filter(m => m.priority === 'high' || m.priority === 'urgent').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Urgentes
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Lista de Mensajes</CardTitle>
            <CardDescription>
              {filteredMessages.length} de {messages.length} mensajes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="space-y-3 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar mensajes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="new">Nuevos</SelectItem>
                    <SelectItem value="in_progress">En Progreso</SelectItem>
                    <SelectItem value="resolved">Resueltos</SelectItem>
                    <SelectItem value="closed">Cerrados</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="low">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Messages */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedMessage?.id === message.id 
                      ? 'border-green-500 bg-green-50' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedMessage(message)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(message.category)}
                      <span className="font-medium text-sm truncate">
                        {message.subject}
                      </span>
                    </div>
                    {getPriorityBadge(message.priority)}
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">{message.user.name}</span>
                    {getStatusBadge(message.status)}
                  </div>
                  
                  <p className="text-xs text-gray-500 truncate mb-2">
                    {message.message}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{format(new Date(message.createdAt), 'dd MMM HH:mm', { locale: es })}</span>
                    {message.responses.length > 0 && (
                      <span>{message.responses.length} respuestas</span>
                    )}
                  </div>
                </div>
              ))}

              {filteredMessages.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No se encontraron mensajes</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Message Detail */}
        <Card className="lg:col-span-2">
          {selectedMessage ? (
            <>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-3">
                      {getCategoryIcon(selectedMessage.category)}
                      {selectedMessage.subject}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {selectedMessage.user.name}
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {selectedMessage.user.email}
                        </div>
                        {selectedMessage.user.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {selectedMessage.user.phone}
                          </div>
                        )}
                      </div>
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedMessage.status)}
                    {getPriorityBadge(selectedMessage.priority)}
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateMessageStatus(selectedMessage.id, 'in_progress')}
                    disabled={selectedMessage.status === 'in_progress'}
                  >
                    En Progreso
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateMessageStatus(selectedMessage.id, 'resolved')}
                    disabled={selectedMessage.status === 'resolved'}
                  >
                    Resolver
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateMessageStatus(selectedMessage.id, 'closed')}
                    disabled={selectedMessage.status === 'closed'}
                  >
                    Cerrar
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                {/* Original Message */}
                <div className="space-y-4 mb-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{selectedMessage.user.name}</span>
                      <span className="text-sm text-gray-500">
                        {format(new Date(selectedMessage.createdAt), 'dd MMM yyyy HH:mm', { locale: es })}
                      </span>
                    </div>
                    <p className="text-gray-700">{selectedMessage.message}</p>
                  </div>

                  {/* Responses */}
                  {selectedMessage.responses.map((response) => (
                    <div
                      key={response.id}
                      className={`p-4 rounded-lg ${
                        response.isAdmin 
                          ? 'bg-green-50 border-l-4 border-green-500' 
                          : 'bg-blue-50 border-l-4 border-blue-500'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">
                          {response.isAdmin ? response.author : selectedMessage.user.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {format(new Date(response.createdAt), 'dd MMM yyyy HH:mm', { locale: es })}
                        </span>
                      </div>
                      <p className="text-gray-700">{response.message}</p>
                    </div>
                  ))}
                </div>

                {/* Reply Form */}
                {selectedMessage.status !== 'closed' && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Responder</h4>
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Escribe tu respuesta..."
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        rows={4}
                      />
                      <div className="flex justify-end">
                        <Button onClick={sendReply} disabled={!replyMessage.trim()}>
                          <Send className="h-4 w-4 mr-2" />
                          Enviar Respuesta
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-96">
              <div className="text-center text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Selecciona un mensaje para ver los detalles</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}

