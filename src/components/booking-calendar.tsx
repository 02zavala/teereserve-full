"use client"

import React, { useState, useEffect } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Users, MapPin, CreditCard } from 'lucide-react'
import { format, addDays, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'

interface TimeSlot {
  id: string
  startTime: string
  endTime: string
  availableSlots: number
}

interface GolfCourse {
  id: string
  name: string
  location: string
  pricePerRound: number
}

interface BookingCalendarProps {
  golfCourse: GolfCourse
  onBookingSelect: (booking: {
    date: Date
    timeSlot: TimeSlot
    golfCourse: GolfCourse
  }) => void
}

export default function BookingCalendar({ golfCourse, onBookingSelect }: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null)

  // Fetch availability for selected date
  useEffect(() => {
    if (selectedDate && golfCourse.id) {
      fetchAvailability(selectedDate)
    }
  }, [selectedDate, golfCourse.id])

  const fetchAvailability = async (date: Date) => {
    setLoading(true)
    try {
      const formattedDate = format(date, 'yyyy-MM-dd')
      const response = await fetch(
        `/api/availability?golfCourseId=${golfCourse.id}&date=${formattedDate}`
      )
      
      if (response.ok) {
        const data = await response.json()
        // Convert time strings to proper format and filter available slots
        const slots = data.availability
          .filter((slot: any) => slot.availableSlots > 0)
          .map((slot: any) => ({
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
        
        setAvailableSlots(slots)
      } else {
        console.error('Failed to fetch availability')
        setAvailableSlots([])
      }
    } catch (error) {
      console.error('Error fetching availability:', error)
      setAvailableSlots([])
    } finally {
      setLoading(false)
    }
  }

  const handleTimeSlotSelect = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot)
  }

  const handleBookingConfirm = () => {
    if (selectedDate && selectedTimeSlot) {
      onBookingSelect({
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        golfCourse
      })
    }
  }

  // Disable past dates
  const disabledDays = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Calendar Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {golfCourse.name}
          </CardTitle>
          <CardDescription>
            {golfCourse.location} • ${golfCourse.pricePerRound.toLocaleString()} MXN por ronda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={disabledDays}
            locale={es}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      {/* Time Slots Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Horarios Disponibles
          </CardTitle>
          <CardDescription>
            {selectedDate 
              ? `${format(selectedDate, 'EEEE, d MMMM yyyy', { locale: es })}`
              : 'Selecciona una fecha'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : selectedDate ? (
            <div className="space-y-3">
              {availableSlots.length > 0 ? (
                availableSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedTimeSlot?.id === slot.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                    }`}
                    onClick={() => handleTimeSlotSelect(slot)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {slot.availableSlots} disponible{slot.availableSlots !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay horarios disponibles para esta fecha</p>
                  <p className="text-sm">Intenta seleccionar otra fecha</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Selecciona una fecha para ver los horarios disponibles</p>
            </div>
          )}

          {/* Booking Confirmation */}
          {selectedDate && selectedTimeSlot && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Resumen de Reserva</h4>
              <div className="space-y-1 text-sm text-green-700">
                <p><strong>Campo:</strong> {golfCourse.name}</p>
                <p><strong>Fecha:</strong> {format(selectedDate, 'EEEE, d MMMM yyyy', { locale: es })}</p>
                <p><strong>Hora:</strong> {selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}</p>
                <p><strong>Precio:</strong> ${golfCourse.pricePerRound.toLocaleString()} MXN por jugador</p>
              </div>
              <Button 
                onClick={handleBookingConfirm}
                className="w-full mt-4 bg-green-600 hover:bg-green-700"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Continuar con el Pago
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

