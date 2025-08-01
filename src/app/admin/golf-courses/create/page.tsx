"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  Phone, 
  Mail,
  Plus,
  X,
  Upload,
  Save,
  ArrowLeft,
  Building,
  Users,
  Clock,
  DollarSign,
  Star
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface GolfCourseForm {
  name: string
  location: string
  description: string
  holes: number
  rating: number
  pricePerRound: number
  contactEmail: string
  contactPhone: string
  imageUrl: string
  amenities: string[]
  difficulty: string
  operatingHours: {
    monday: { open: string; close: string; closed: boolean }
    tuesday: { open: string; close: string; closed: boolean }
    wednesday: { open: string; close: string; closed: boolean }
    thursday: { open: string; close: string; closed: boolean }
    friday: { open: string; close: string; closed: boolean }
    saturday: { open: string; close: string; closed: boolean }
    sunday: { open: string; close: string; closed: boolean }
  }
  policies: {
    cancellation: string
    advanceBookingDays: number
    minimumNoticeHours: number
  }
}

const initialForm: GolfCourseForm = {
  name: '',
  location: '',
  description: '',
  holes: 18,
  rating: 0,
  pricePerRound: 0,
  contactEmail: '',
  contactPhone: '',
  imageUrl: '',
  amenities: [],
  difficulty: '',
  operatingHours: {
    monday: { open: '06:00', close: '18:00', closed: false },
    tuesday: { open: '06:00', close: '18:00', closed: false },
    wednesday: { open: '06:00', close: '18:00', closed: false },
    thursday: { open: '06:00', close: '18:00', closed: false },
    friday: { open: '06:00', close: '18:00', closed: false },
    saturday: { open: '06:00', close: '18:00', closed: false },
    sunday: { open: '06:00', close: '18:00', closed: false }
  },
  policies: {
    cancellation: 'Cancelación gratuita hasta 24 horas antes',
    advanceBookingDays: 30,
    minimumNoticeHours: 2
  }
}

const availableAmenities = [
  'Restaurante',
  'Pro Shop',
  'Driving Range',
  'Putting Green',
  'Caddie Service',
  'Cart Rental',
  'Club Rental',
  'Spa',
  'Alberca',
  'Gimnasio',
  'Salón de eventos',
  'Estacionamiento',
  'WiFi',
  'Bar',
  'Terraza'
]

export default function CreateGolfCoursePage() {
  const router = useRouter()
  const [form, setForm] = useState<GolfCourseForm>(initialForm)
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  const handleInputChange = (field: string, value: any) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleOperatingHoursChange = (day: string, field: string, value: any) => {
    setForm(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day as keyof typeof prev.operatingHours],
          [field]: value
        }
      }
    }))
  }

  const handlePolicyChange = (field: string, value: any) => {
    setForm(prev => ({
      ...prev,
      policies: {
        ...prev.policies,
        [field]: value
      }
    }))
  }

  const addAmenity = (amenity: string) => {
    if (!form.amenities.includes(amenity)) {
      setForm(prev => ({
        ...prev,
        amenities: [...prev.amenities, amenity]
      }))
    }
  }

  const removeAmenity = (amenity: string) => {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.filter(a => a !== amenity)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Aquí iría la llamada a la API para crear el campo
      console.log('Creating golf course:', form)
      
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Redirigir a la lista de campos
      router.push('/admin/golf-courses')
    } catch (error) {
      console.error('Error creating golf course:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Información Básica</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="name">Nombre del Campo *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ej: Cabo del Sol Golf Club"
              required
            />
          </div>

          <div>
            <Label htmlFor="location">Ubicación *</Label>
            <Input
              id="location"
              value={form.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Ej: Los Cabos, Baja California Sur"
              required
            />
          </div>

          <div>
            <Label htmlFor="holes">Número de Hoyos *</Label>
            <Select value={form.holes.toString()} onValueChange={(value) => handleInputChange('holes', parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="9">9 hoyos</SelectItem>
                <SelectItem value="18">18 hoyos</SelectItem>
                <SelectItem value="27">27 hoyos</SelectItem>
                <SelectItem value="36">36 hoyos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="difficulty">Dificultad *</Label>
            <Select value={form.difficulty} onValueChange={(value) => handleInputChange('difficulty', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar dificultad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Principiante">Principiante</SelectItem>
                <SelectItem value="Intermedio">Intermedio</SelectItem>
                <SelectItem value="Avanzado">Avanzado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="pricePerRound">Precio por Ronda (USD) *</Label>
            <Input
              id="pricePerRound"
              type="number"
              value={form.pricePerRound}
              onChange={(e) => handleInputChange('pricePerRound', parseFloat(e.target.value))}
              placeholder="165"
              required
            />
          </div>

          <div>
            <Label htmlFor="rating">Rating Inicial</Label>
            <Input
              id="rating"
              type="number"
              step="0.1"
              min="0"
              max="5"
              value={form.rating}
              onChange={(e) => handleInputChange('rating', parseFloat(e.target.value))}
              placeholder="4.5"
            />
          </div>
        </div>

        <div className="mt-6">
          <Label htmlFor="description">Descripción del Campo *</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe las características principales del campo de golf..."
            rows={4}
            required
          />
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Información de Contacto</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="contactEmail">Email de Contacto *</Label>
            <Input
              id="contactEmail"
              type="email"
              value={form.contactEmail}
              onChange={(e) => handleInputChange('contactEmail', e.target.value)}
              placeholder="reservas@cabodelsol.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="contactPhone">Teléfono de Contacto *</Label>
            <Input
              id="contactPhone"
              value={form.contactPhone}
              onChange={(e) => handleInputChange('contactPhone', e.target.value)}
              placeholder="+52 624 145 8200"
              required
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Amenidades</h3>
        <div className="mb-4">
          <Label>Amenidades Disponibles</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {availableAmenities.map((amenity) => (
              <Button
                key={amenity}
                type="button"
                variant={form.amenities.includes(amenity) ? "default" : "outline"}
                size="sm"
                onClick={() => form.amenities.includes(amenity) ? removeAmenity(amenity) : addAmenity(amenity)}
              >
                {form.amenities.includes(amenity) ? (
                  <>
                    <X className="h-3 w-3 mr-1" />
                    {amenity}
                  </>
                ) : (
                  <>
                    <Plus className="h-3 w-3 mr-1" />
                    {amenity}
                  </>
                )}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Label>Amenidades Seleccionadas</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {form.amenities.map((amenity) => (
              <Badge key={amenity} variant="default" className="px-3 py-1">
                {amenity}
                <X 
                  className="h-3 w-3 ml-2 cursor-pointer" 
                  onClick={() => removeAmenity(amenity)}
                />
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Horarios de Operación</h3>
        <div className="space-y-4">
          {Object.entries(form.operatingHours).map(([day, hours]) => (
            <div key={day} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="w-24">
                <Label className="capitalize">{day}</Label>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!hours.closed}
                  onChange={(e) => handleOperatingHoursChange(day, 'closed', !e.target.checked)}
                />
                <Label className="text-sm">Abierto</Label>
              </div>

              {!hours.closed && (
                <>
                  <div>
                    <Label className="text-sm">Apertura</Label>
                    <Input
                      type="time"
                      value={hours.open}
                      onChange={(e) => handleOperatingHoursChange(day, 'open', e.target.value)}
                      className="w-32"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm">Cierre</Label>
                    <Input
                      type="time"
                      value={hours.close}
                      onChange={(e) => handleOperatingHoursChange(day, 'close', e.target.value)}
                      className="w-32"
                    />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Políticas del Campo</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="cancellation">Política de Cancelación</Label>
            <Textarea
              id="cancellation"
              value={form.policies.cancellation}
              onChange={(e) => handlePolicyChange('cancellation', e.target.value)}
              placeholder="Describe la política de cancelación..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="advanceBookingDays">Días de Anticipación Máxima</Label>
              <Input
                id="advanceBookingDays"
                type="number"
                value={form.policies.advanceBookingDays}
                onChange={(e) => handlePolicyChange('advanceBookingDays', parseInt(e.target.value))}
                placeholder="30"
              />
            </div>

            <div>
              <Label htmlFor="minimumNoticeHours">Horas Mínimas de Aviso</Label>
              <Input
                id="minimumNoticeHours"
                type="number"
                value={form.policies.minimumNoticeHours}
                onChange={(e) => handlePolicyChange('minimumNoticeHours', parseInt(e.target.value))}
                placeholder="2"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const steps = [
    { number: 1, title: 'Información Básica', icon: Building },
    { number: 2, title: 'Contacto y Amenidades', icon: Users },
    { number: 3, title: 'Horarios y Políticas', icon: Clock }
  ]

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Agregar Nuevo Campo de Golf</h1>
            <p className="text-gray-600">
              Completa la información para registrar un nuevo campo partner
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step.number 
                  ? 'bg-green-600 border-green-600 text-white' 
                  : 'border-gray-300 text-gray-400'
              }`}>
                <step.icon className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${
                  currentStep >= step.number ? 'text-green-600' : 'text-gray-400'
                }`}>
                  Paso {step.number}
                </p>
                <p className={`text-xs ${
                  currentStep >= step.number ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-4 ${
                  currentStep > step.number ? 'bg-green-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            {currentStep === 1 && 'Información Básica del Campo'}
            {currentStep === 2 && 'Contacto y Amenidades'}
            {currentStep === 3 && 'Horarios y Políticas'}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && 'Proporciona los datos fundamentales del campo de golf'}
            {currentStep === 2 && 'Configura la información de contacto y servicios disponibles'}
            {currentStep === 3 && 'Define los horarios de operación y políticas del campo'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 mt-6 border-t">
              <div>
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(currentStep - 1)}
                  >
                    Anterior
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(currentStep + 1)}
                  >
                    Siguiente
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Crear Campo
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

