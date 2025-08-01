"use client"

import React, { useState, useEffect } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, Clock, Trash2, Edit, Save, X } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface TimeSlot {
  id?: string
  startTime: string
  endTime: string
  availableSlots: number
}

interface AvailabilityManagerProps {
  golfCourseId: string
}

export default function AvailabilityManager({ golfCourseId }: AvailabilityManagerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [editingSlot, setEditingSlot] = useState<string | null>(null)
  const [newSlot, setNewSlot] = useState<TimeSlot>({
    startTime: '07:00',
    endTime: '08:00',
    availableSlots: 4
  })
  const [showAddForm, setShowAddForm] = useState(false)

  // Fetch availability for selected date
  useEffect(() => {
    if (selectedDate && golfCourseId) {
      fetchAvailability(selectedDate)
    }
  }, [selectedDate, golfCourseId])

  const fetchAvailability = async (date: Date) => {
    setLoading(true)
    try {
      const formattedDate = format(date, 'yyyy-MM-dd')
      const response = await fetch(
        `/api/availability?golfCourseId=${golfCourseId}&date=${formattedDate}`
      )
      
      if (response.ok) {
        const data = await response.json()
        const slots = data.availability.map((slot: any) => ({
          id: slot.id,
          startTime: new Date(slot.startTime).toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          }),
          endTime: new Date(slot.endTime).toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          }),
          availableSlots: slot.availableSlots
        }))
        
        setTimeSlots(slots)
      } else {
        console.error('Failed to fetch availability')
        setTimeSlots([])
      }
    } catch (error) {
      console.error('Error fetching availability:', error)
      setTimeSlots([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddTimeSlot = async () => {
    if (!selectedDate) return

    try {
      const response = await fetch('/api/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          golfCourseId,
          date: format(selectedDate, 'yyyy-MM-dd'),
          timeSlots: [newSlot]
        }),
      })

      if (response.ok) {
        setNewSlot({
          startTime: '07:00',
          endTime: '08:00',
          availableSlots: 4
        })
        setShowAddForm(false)
        fetchAvailability(selectedDate)
      } else {
        console.error('Failed to create availability')
      }
    } catch (error) {
      console.error('Error creating availability:', error)
    }
  }

  const handleUpdateTimeSlot = async (slotId: string, updatedSlot: TimeSlot) => {
    try {
      const response = await fetch('/api/availability', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: slotId,
          availableSlots: updatedSlot.availableSlots
        }),
      })

      if (response.ok) {
        setEditingSlot(null)
        if (selectedDate) {
          fetchAvailability(selectedDate)
        }
      } else {
        console.error('Failed to update availability')
      }
    } catch (error) {
      console.error('Error updating availability:', error)
    }
  }

  const handleDeleteTimeSlot = async (slotId: string) => {
    try {
      const response = await fetch(`/api/availability?id=${slotId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        if (selectedDate) {
          fetchAvailability(selectedDate)
        }
      } else {
        console.error('Failed to delete availability')
      }
    } catch (error) {
      console.error('Error deleting availability:', error)
    }
  }

  const generateTimeOptions = () => {
    const times = []
    for (let hour = 6; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        times.push(timeString)
      }
    }
    return times
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Calendar Section */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Disponibilidad</CardTitle>
          <CardDescription>
            Selecciona una fecha para gestionar los horarios disponibles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            locale={es}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      {/* Time Slots Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Horarios
            </span>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              size="sm"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar
            </Button>
          </CardTitle>
          <CardDescription>
            {selectedDate 
              ? `${format(selectedDate, 'EEEE, d MMMM yyyy', { locale: es })}`
              : 'Selecciona una fecha'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Add New Time Slot Form */}
          {showAddForm && (
            <Card className="mb-4 border-dashed">
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="startTime">Hora Inicio</Label>
                    <select
                      id="startTime"
                      value={newSlot.startTime}
                      onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                      className="w-full p-2 border rounded-md"
                    >
                      {generateTimeOptions().map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="endTime">Hora Fin</Label>
                    <select
                      id="endTime"
                      value={newSlot.endTime}
                      onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                      className="w-full p-2 border rounded-md"
                    >
                      {generateTimeOptions().map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <Label htmlFor="availableSlots">Espacios Disponibles</Label>
                  <Input
                    id="availableSlots"
                    type="number"
                    min="1"
                    max="10"
                    value={newSlot.availableSlots}
                    onChange={(e) => setNewSlot({ ...newSlot, availableSlots: parseInt(e.target.value) })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddTimeSlot} size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    Guardar
                  </Button>
                  <Button 
                    onClick={() => setShowAddForm(false)} 
                    size="sm" 
                    variant="outline"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Existing Time Slots */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : selectedDate ? (
            <div className="space-y-3">
              {timeSlots.length > 0 ? (
                timeSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="p-4 border rounded-lg"
                  >
                    {editingSlot === slot.id ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </div>
                        <div>
                          <Label htmlFor={`edit-slots-${slot.id}`}>Espacios Disponibles</Label>
                          <Input
                            id={`edit-slots-${slot.id}`}
                            type="number"
                            min="0"
                            max="10"
                            defaultValue={slot.availableSlots}
                            onChange={(e) => {
                              const updatedSlot = { ...slot, availableSlots: parseInt(e.target.value) }
                              setTimeSlots(prev => prev.map(s => s.id === slot.id ? updatedSlot : s))
                            }}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleUpdateTimeSlot(slot.id!, slot)}
                            size="sm"
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Guardar
                          </Button>
                          <Button 
                            onClick={() => setEditingSlot(null)}
                            size="sm" 
                            variant="outline"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {slot.availableSlots} espacios
                          </Badge>
                          <Button
                            onClick={() => setEditingSlot(slot.id!)}
                            size="sm"
                            variant="ghost"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteTimeSlot(slot.id!)}
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay horarios configurados para esta fecha</p>
                  <p className="text-sm">Haz clic en "Agregar" para crear nuevos horarios</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Selecciona una fecha para gestionar los horarios</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

