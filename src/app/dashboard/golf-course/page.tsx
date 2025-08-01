"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Globe,
  Star,
  TrendingUp,
  AlertCircle
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

interface Availability {
  id: string
  date: Date
  startTime: Date
  endTime: Date
  availableSlots: number
}

export default function GolfCourseDashboard() {
  const [golfCourse, setGolfCourse] = useState<GolfCourse | null>(null)
  const [availability, setAvailability] = useState<Availability[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  // Simular datos del campo (en producción vendría de la sesión del usuario)
  const courseId = "1" // ID del campo del usuario logueado

  useEffect(() => {
    fetchGolfCourse()
    fetchAvailability()
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
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailability = async () => {
    try {
      const response = await fetch(`/api/golf-courses/${courseId}/availability?date=${selectedDate}&days=7`)
      const data = await response.json()
      
      if (data.success) {
        setAvailability(data.data)
      }
    } catch (error) {
      console.error('Error fetching availability:', error)
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rating Promedio</p>
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
                  <p className="text-sm font-medium text-gray-600">Total Reseñas</p>
                  <p className="text-2xl font-bold text-gray-900">{golfCourse.reviewCount}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Reservas Totales</p>
                  <p className="text-2xl font-bold text-gray-900">{golfCourse.bookingCount}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Precio Promedio</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${Math.round((golfCourse.priceWeekday + golfCourse.priceWeekend) / 2)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="info" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="info">Información</TabsTrigger>
            <TabsTrigger value="availability">Disponibilidad</TabsTrigger>
            <TabsTrigger value="pricing">Precios</TabsTrigger>
            <TabsTrigger value="reports">Reportes</TabsTrigger>
          </TabsList>

          {/* Información del Campo */}
          <TabsContent value="info">
            <Card>
              <CardHeader>
                <CardTitle>Información del Campo</CardTitle>
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
                  </div>

                  <div className="space-y-4">
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
                      <Label htmlFor="contactPhone">Teléfono de Contacto</Label>
                      <Input
                        id="contactPhone"
                        value={golfCourse.contactPhone}
                        onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>

                    <div>
                      <Label htmlFor="features">Características</Label>
                      <Input
                        id="features"
                        value={golfCourse.features}
                        onChange={(e) => handleInputChange('features', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Ej: Driving Range, Pro Shop, Restaurante"
                      />
                    </div>

                    <div>
                      <Label htmlFor="imageUrl">URL de Imagen Principal</Label>
                      <Input
                        id="imageUrl"
                        value={golfCourse.imageUrl}
                        onChange={(e) => handleInputChange('imageUrl', e.target.value)}
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

          {/* Disponibilidad */}
          <TabsContent value="availability">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Disponibilidad</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="date">Seleccionar Fecha</Label>
                    <Input
                      id="date"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                  </div>
                  
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="mx-auto h-12 w-12 mb-4" />
                    <p>Gestión de disponibilidad en desarrollo</p>
                    <p className="text-sm">Próximamente podrás configurar horarios disponibles</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Precios */}
          <TabsContent value="pricing">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Precios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="priceWeekday">Precio Entre Semana ({golfCourse.currency})</Label>
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
                    <Label htmlFor="priceWeekend">Precio Fin de Semana ({golfCourse.currency})</Label>
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reportes */}
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Reportes y Estadísticas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="mx-auto h-12 w-12 mb-4" />
                  <p>Reportes en desarrollo</p>
                  <p className="text-sm">Próximamente verás estadísticas detalladas de tu campo</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

