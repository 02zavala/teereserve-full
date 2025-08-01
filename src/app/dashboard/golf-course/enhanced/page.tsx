"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Calendar,
  Clock,
  DollarSign,
  Users,
  Settings,
  BarChart3,
  Plus,
  Edit,
  Save,
  X,
  MapPin,
  Phone,
  Mail,
  Star,
  TrendingUp,
  AlertCircle,
  Eye,
  CheckCircle,
  XCircle,
  Filter,
  Download,
  Bell,
  Activity
} from 'lucide-react'

interface GolfCourse {
  id: string
  name: string
  slug: string
  location: string
  description: string
  holes: number
  priceWeekday: number
  priceWeekend: number
  currency: string
  features: string
  difficulty: string
  contactEmail: string
  contactPhone: string
  imageUrl: string
  isActive: boolean
  rating: number
  reviewCount: number
  bookingCount: number
}

interface Reservation {
  id: string
  courseName: string
  date: string
  time: string
  players: number
  totalPrice: number
  customerFirstName: string
  customerLastName: string
  customerEmail: string
  customerPhone: string
  status: string
  paymentStatus: string
  createdAt: string
}

interface DashboardStats {
  todayReservations: number
  weekReservations: number
  monthRevenue: number
  averageRating: number
  occupancyRate: number
  pendingReservations: number
}

export default function EnhancedGolfCourseDashboard() {
  const { data: session } = useSession()
  const [golfCourse, setGolfCourse] = useState<GolfCourse | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [reservationFilter, setReservationFilter] = useState('all')

  // Simular datos del campo (en producción vendría de la sesión del usuario)
  const courseId = "1"

  useEffect(() => {
    fetchGolfCourse()
    fetchReservations()
    fetchStats()
  }, [])

  const fetchGolfCourse = async () => {
    try {
      const response = await fetch(`/api/golf-courses/${courseId}`)
      const data = await response.json()
      
      if (data.success) {
        setGolfCourse(data.data)
      }
    } catch (error) {
      console.error('Error fetching golf course:', error)
    }
  }

  const fetchReservations = async () => {
    try {
      const response = await fetch(`/api/golf-courses/${courseId}/reservations`)
      const data = await response.json()
      
      if (data.success) {
        setReservations(data.data)
      }
    } catch (error) {
      console.error('Error fetching reservations:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/golf-courses/${courseId}/stats`)
      const data = await response.json()
      
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveChanges = async () => {
    if (!golfCourse) return

    setSaving(true)
    try {
      const response = await fetch(`/api/golf-courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(golfCourse)
      })

      const data = await response.json()
      
      if (data.success) {
        setGolfCourse(data.data)
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Error updating golf course:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    if (!golfCourse) return
    
    setGolfCourse({
      ...golfCourse,
      [field]: value
    })
  }

  const handleReservationAction = async (reservationId: string, action: string) => {
    try {
      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      })

      const data = await response.json()
      
      if (data.success) {
        fetchReservations()
        fetchStats()
      }
    } catch (error) {
      console.error('Error updating reservation:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendiente', variant: 'secondary' as const, icon: Clock },
      confirmed: { label: 'Confirmada', variant: 'default' as const, icon: CheckCircle },
      cancelled: { label: 'Cancelada', variant: 'destructive' as const, icon: XCircle },
      completed: { label: 'Completada', variant: 'outline' as const, icon: CheckCircle }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const filteredReservations = reservations.filter(reservation => {
    if (reservationFilter === 'all') return true
    return reservation.status === reservationFilter
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!golfCourse) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Campo no encontrado</h2>
          <p className="text-gray-600">No se pudo cargar la información del campo de golf.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{golfCourse.name}</h1>
              <p className="text-gray-600 flex items-center mt-2">
                <MapPin className="w-4 h-4 mr-2" />
                {golfCourse.location}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant={golfCourse.isActive ? "default" : "secondary"}>
                {golfCourse.isActive ? "Activo" : "Inactivo"}
              </Badge>
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant={isEditing ? "outline" : "default"}
              >
                {isEditing ? (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </>
                )}
              </Button>
              {isEditing && (
                <Button onClick={handleSaveChanges} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Guardando..." : "Guardar"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Hoy</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.todayReservations || 0}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Esta Semana</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.weekReservations || 0}</p>
                </div>
                <Activity className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ingresos Mes</p>
                  <p className="text-2xl font-bold text-gray-900">${stats?.monthRevenue || 0}</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rating</p>
                  <p className="text-2xl font-bold text-gray-900">{golfCourse.rating.toFixed(1)}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ocupación</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.occupancyRate || 0}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pendientes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.pendingReservations || 0}</p>
                </div>
                <Bell className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="reservations">Reservas</TabsTrigger>
            <TabsTrigger value="availability">Disponibilidad</TabsTrigger>
            <TabsTrigger value="pricing">Precios</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
          </TabsList>

          {/* Resumen */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Reservas Recientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reservations.slice(0, 5).map((reservation) => (
                      <div key={reservation.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-semibold">{reservation.customerFirstName} {reservation.customerLastName}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(reservation.date).toLocaleDateString()} - {reservation.time}
                          </p>
                          <p className="text-sm text-gray-600">{reservation.players} jugadores</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${reservation.totalPrice}</p>
                          {getStatusBadge(reservation.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Información del Campo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Hoyos</Label>
                      <p className="text-lg font-semibold">{golfCourse.holes}</p>
                    </div>
                    <div>
                      <Label>Dificultad</Label>
                      <p className="text-lg font-semibold">{golfCourse.difficulty}</p>
                    </div>
                    <div>
                      <Label>Precio Entre Semana</Label>
                      <p className="text-lg font-semibold">${golfCourse.priceWeekday}</p>
                    </div>
                    <div>
                      <Label>Precio Fin de Semana</Label>
                      <p className="text-lg font-semibold">${golfCourse.priceWeekend}</p>
                    </div>
                  </div>
                  <div>
                    <Label>Características</Label>
                    <p className="text-sm text-gray-600">{golfCourse.features}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reservas */}
          <TabsContent value="reservations">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Gestión de Reservas</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Select value={reservationFilter} onValueChange={setReservationFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="pending">Pendientes</SelectItem>
                        <SelectItem value="confirmed">Confirmadas</SelectItem>
                        <SelectItem value="cancelled">Canceladas</SelectItem>
                        <SelectItem value="completed">Completadas</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Exportar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Hora</TableHead>
                      <TableHead>Jugadores</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReservations.map((reservation) => (
                      <TableRow key={reservation.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{reservation.customerFirstName} {reservation.customerLastName}</p>
                            <p className="text-sm text-gray-600">{reservation.customerEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>{new Date(reservation.date).toLocaleDateString()}</TableCell>
                        <TableCell>{reservation.time}</TableCell>
                        <TableCell>{reservation.players}</TableCell>
                        <TableCell>${reservation.totalPrice}</TableCell>
                        <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReservationAction(reservation.id, 'view')}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {reservation.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleReservationAction(reservation.id, 'confirm')}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleReservationAction(reservation.id, 'cancel')}
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Disponibilidad */}
          <TabsContent value="availability">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Disponibilidad</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="mx-auto h-12 w-12 mb-4" />
                  <p>Gestión de disponibilidad avanzada</p>
                  <p className="text-sm">Configurar horarios, bloqueos y disponibilidad especial</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Precios */}
          <TabsContent value="pricing">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Precios Dinámicos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <DollarSign className="mx-auto h-12 w-12 mb-4" />
                  <p>Sistema de precios dinámicos</p>
                  <p className="text-sm">Configurar precios por temporada, demanda y horarios premium</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configuración */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Configuración del Campo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nombre del Campo</Label>
                      <Input
                        id="name"
                        value={golfCourse.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="location">Ubicación</Label>
                      <Input
                        id="location"
                        value={golfCourse.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>

                    <div>
                      <Label htmlFor="contactEmail">Email de Contacto</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={golfCourse.contactEmail}
                        onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>

                    <div>
                      <Label htmlFor="contactPhone">Teléfono</Label>
                      <Input
                        id="contactPhone"
                        value={golfCourse.contactPhone}
                        onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="holes">Número de Hoyos</Label>
                      <Input
                        id="holes"
                        type="number"
                        value={golfCourse.holes}
                        onChange={(e) => handleInputChange('holes', parseInt(e.target.value))}
                        disabled={!isEditing}
                      />
                    </div>

                    <div>
                      <Label htmlFor="difficulty">Dificultad</Label>
                      <Select
                        value={golfCourse.difficulty}
                        onValueChange={(value) => handleInputChange('difficulty', value)}
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Principiante">Principiante</SelectItem>
                          <SelectItem value="Intermedio">Intermedio</SelectItem>
                          <SelectItem value="Avanzado">Avanzado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="priceWeekday">Precio Entre Semana</Label>
                      <Input
                        id="priceWeekday"
                        type="number"
                        step="0.01"
                        value={golfCourse.priceWeekday}
                        onChange={(e) => handleInputChange('priceWeekday', parseFloat(e.target.value))}
                        disabled={!isEditing}
                      />
                    </div>

                    <div>
                      <Label htmlFor="priceWeekend">Precio Fin de Semana</Label>
                      <Input
                        id="priceWeekend"
                        type="number"
                        step="0.01"
                        value={golfCourse.priceWeekend}
                        onChange={(e) => handleInputChange('priceWeekend', parseFloat(e.target.value))}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={golfCourse.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    disabled={!isEditing}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

