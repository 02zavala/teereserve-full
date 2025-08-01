"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { 
  Calendar,
  Clock,
  Plus,
  Trash2,
  Save,
  AlertCircle,
  CheckCircle,
  X,
  Copy,
  Settings
} from 'lucide-react'

interface TimeSlot {
  id: string
  time: string
  availableSlots: number
  price?: number
  isBlocked: boolean
  blockReason?: string
}

interface AvailabilityDay {
  date: string
  isOpen: boolean
  openTime: string
  closeTime: string
  timeSlots: TimeSlot[]
  specialPricing: boolean
  notes?: string
}

interface AvailabilityManagerProps {
  courseId: string
  onSave?: (data: AvailabilityDay[]) => void
}

export default function AvailabilityManager({ courseId, onSave }: AvailabilityManagerProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [availabilityData, setAvailabilityData] = useState<AvailabilityDay[]>([])
  const [currentDay, setCurrentDay] = useState<AvailabilityDay | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showBulkActions, setShowBulkActions] = useState(false)

  useEffect(() => {
    fetchAvailability()
  }, [selectedDate])

  const fetchAvailability = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/golf-courses/${courseId}/availability?date=${selectedDate}&days=7`)
      const data = await response.json()
      
      if (data.success) {
        const formattedData = formatAvailabilityData(data.data)
        setAvailabilityData(formattedData)
        
        // Establecer el día actual
        const today = formattedData.find(day => day.date === selectedDate)
        if (today) {
          setCurrentDay(today)
        } else {
          setCurrentDay(createEmptyDay(selectedDate))
        }
      }
    } catch (error) {
      console.error('Error fetching availability:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatAvailabilityData = (rawData: any[]): AvailabilityDay[] => {
    const groupedByDate = rawData.reduce((acc, slot) => {
      const date = slot.date.split('T')[0]
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push({
        id: slot.id,
        time: slot.startTime.split('T')[1].slice(0, 5),
        availableSlots: slot.availableSlots,
        isBlocked: slot.availableSlots === 0,
        blockReason: slot.availableSlots === 0 ? 'Bloqueado' : undefined
      })
      return acc
    }, {})

    return Object.entries(groupedByDate).map(([date, slots]) => ({
      date,
      isOpen: true,
      openTime: '06:00',
      closeTime: '18:00',
      timeSlots: slots as TimeSlot[],
      specialPricing: false
    }))
  }

  const createEmptyDay = (date: string): AvailabilityDay => {
    const timeSlots: TimeSlot[] = []
    
    // Generar horarios cada 30 minutos de 6 AM a 6 PM
    for (let hour = 6; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 18 && minute > 0) break // No pasar de 6 PM
        
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        timeSlots.push({
          id: `${date}-${time}`,
          time,
          availableSlots: 4,
          isBlocked: false
        })
      }
    }

    return {
      date,
      isOpen: true,
      openTime: '06:00',
      closeTime: '18:00',
      timeSlots,
      specialPricing: false
    }
  }

  const handleDayChange = (field: keyof AvailabilityDay, value: any) => {
    if (!currentDay) return
    
    const updatedDay = { ...currentDay, [field]: value }
    setCurrentDay(updatedDay)
    
    // Actualizar en el array principal
    const updatedData = availabilityData.map(day => 
      day.date === currentDay.date ? updatedDay : day
    )
    
    if (!updatedData.find(day => day.date === currentDay.date)) {
      updatedData.push(updatedDay)
    }
    
    setAvailabilityData(updatedData)
  }

  const handleTimeSlotChange = (slotId: string, field: keyof TimeSlot, value: any) => {
    if (!currentDay) return
    
    const updatedSlots = currentDay.timeSlots.map(slot =>
      slot.id === slotId ? { ...slot, [field]: value } : slot
    )
    
    handleDayChange('timeSlots', updatedSlots)
  }

  const addTimeSlot = () => {
    if (!currentDay) return
    
    const newSlot: TimeSlot = {
      id: `${currentDay.date}-${Date.now()}`,
      time: '12:00',
      availableSlots: 4,
      isBlocked: false
    }
    
    const updatedSlots = [...currentDay.timeSlots, newSlot].sort((a, b) => 
      a.time.localeCompare(b.time)
    )
    
    handleDayChange('timeSlots', updatedSlots)
  }

  const removeTimeSlot = (slotId: string) => {
    if (!currentDay) return
    
    const updatedSlots = currentDay.timeSlots.filter(slot => slot.id !== slotId)
    handleDayChange('timeSlots', updatedSlots)
  }

  const copyToOtherDays = async () => {
    if (!currentDay) return
    
    const dates = []
    for (let i = 1; i <= 6; i++) {
      const date = new Date(selectedDate)
      date.setDate(date.getDate() + i)
      dates.push(date.toISOString().split('T')[0])
    }
    
    const updatedData = [...availabilityData]
    
    dates.forEach(date => {
      const existingIndex = updatedData.findIndex(day => day.date === date)
      const dayData = {
        ...currentDay,
        date,
        timeSlots: currentDay.timeSlots.map(slot => ({
          ...slot,
          id: `${date}-${slot.time}`
        }))
      }
      
      if (existingIndex >= 0) {
        updatedData[existingIndex] = dayData
      } else {
        updatedData.push(dayData)
      }
    })
    
    setAvailabilityData(updatedData)
  }

  const generateDefaultSchedule = () => {
    if (!currentDay) return
    
    const defaultSlots = createEmptyDay(currentDay.date).timeSlots
    handleDayChange('timeSlots', defaultSlots)
  }

  const blockAllSlots = () => {
    if (!currentDay) return
    
    const blockedSlots = currentDay.timeSlots.map(slot => ({
      ...slot,
      isBlocked: true,
      availableSlots: 0,
      blockReason: 'Bloqueado por administrador'
    }))
    
    handleDayChange('timeSlots', blockedSlots)
  }

  const saveAvailability = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/golf-courses/${courseId}/availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: selectedDate,
          timeSlots: currentDay?.timeSlots.map(slot => ({
            time: slot.time,
            availableSlots: slot.isBlocked ? 0 : slot.availableSlots,
            price: slot.price
          }))
        })
      })

      const data = await response.json()
      
      if (data.success) {
        onSave?.(availabilityData)
      }
    } catch (error) {
      console.error('Error saving availability:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Gestión de Disponibilidad</h3>
          <p className="text-sm text-gray-600">Configura horarios y disponibilidad para tu campo</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBulkActions(!showBulkActions)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Acciones Masivas
          </Button>
          <Button onClick={saveAvailability} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>

      {/* Date Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div>
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={currentDay?.isOpen || false}
                onCheckedChange={(checked) => handleDayChange('isOpen', checked)}
              />
              <Label>Campo abierto</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {showBulkActions && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Acciones Masivas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={generateDefaultSchedule}>
                <Clock className="w-4 h-4 mr-2" />
                Horario Por Defecto
              </Button>
              <Button variant="outline" size="sm" onClick={blockAllSlots}>
                <X className="w-4 h-4 mr-2" />
                Bloquear Todo
              </Button>
              <Button variant="outline" size="sm" onClick={copyToOtherDays}>
                <Copy className="w-4 h-4 mr-2" />
                Copiar a Próximos 6 Días
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Day Configuration */}
      {currentDay && currentDay.isOpen && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Configuración del {new Date(selectedDate).toLocaleDateString()}
              </CardTitle>
              <Button variant="outline" size="sm" onClick={addTimeSlot}>
                <Plus className="w-4 h-4 mr-2" />
                Agregar Horario
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* General Settings */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="openTime">Hora de Apertura</Label>
                  <Input
                    id="openTime"
                    type="time"
                    value={currentDay.openTime}
                    onChange={(e) => handleDayChange('openTime', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="closeTime">Hora de Cierre</Label>
                  <Input
                    id="closeTime"
                    type="time"
                    value={currentDay.closeTime}
                    onChange={(e) => handleDayChange('closeTime', e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    checked={currentDay.specialPricing}
                    onCheckedChange={(checked) => handleDayChange('specialPricing', checked)}
                  />
                  <Label>Precios Especiales</Label>
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Notas del Día</Label>
                <Textarea
                  id="notes"
                  value={currentDay.notes || ''}
                  onChange={(e) => handleDayChange('notes', e.target.value)}
                  placeholder="Notas especiales para este día..."
                  rows={2}
                />
              </div>

              {/* Time Slots */}
              <div>
                <Label className="text-base font-medium">Horarios Disponibles</Label>
                <div className="grid gap-4 mt-2">
                  {currentDay.timeSlots.map((slot) => (
                    <div key={slot.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div>
                          <Label>Hora</Label>
                          <Input
                            type="time"
                            value={slot.time}
                            onChange={(e) => handleTimeSlotChange(slot.id, 'time', e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <Label>Slots Disponibles</Label>
                          <Input
                            type="number"
                            min="0"
                            max="10"
                            value={slot.availableSlots}
                            onChange={(e) => handleTimeSlotChange(slot.id, 'availableSlots', parseInt(e.target.value))}
                            disabled={slot.isBlocked}
                          />
                        </div>
                        
                        {currentDay.specialPricing && (
                          <div>
                            <Label>Precio Especial</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={slot.price || ''}
                              onChange={(e) => handleTimeSlotChange(slot.id, 'price', parseFloat(e.target.value))}
                              placeholder="Precio por jugador"
                            />
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-2 pt-6">
                          <Switch
                            checked={slot.isBlocked}
                            onCheckedChange={(checked) => handleTimeSlotChange(slot.id, 'isBlocked', checked)}
                          />
                          <Label>Bloqueado</Label>
                        </div>
                        
                        {slot.isBlocked && (
                          <div>
                            <Label>Razón del Bloqueo</Label>
                            <Input
                              value={slot.blockReason || ''}
                              onChange={(e) => handleTimeSlotChange(slot.id, 'blockReason', e.target.value)}
                              placeholder="Motivo del bloqueo"
                            />
                          </div>
                        )}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeTimeSlot(slot.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Closed Day */}
      {currentDay && !currentDay.isOpen && (
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Campo Cerrado</h3>
            <p className="text-gray-600">El campo estará cerrado en esta fecha</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

