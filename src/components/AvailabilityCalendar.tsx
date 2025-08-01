
'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Users, DollarSign, ChevronLeft, ChevronRight, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useRouter } from 'next/navigation'

interface TimeSlot {
  time: string
  available: boolean
  price: number
  players: number
  isPopular?: boolean
  isPremium?: boolean
}

interface AvailabilityCalendarProps {
  courseId: string
  courseName: string
  priceWeekday: number
  priceWeekend: number
}

export default function AvailabilityCalendar({ courseId, courseName, priceWeekday, priceWeekend }: AvailabilityCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [players, setPlayers] = useState(2)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Generar fechas para los próximos 14 días
  const generateDates = () => {
    const dates = []
    for (let i = 0; i < 14; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  const dates = generateDates()

  // Generar horarios disponibles simulados
  const generateTimeSlots = (date: Date) => {
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    const basePrice = isWeekend ? priceWeekend : priceWeekday
    
    const slots: TimeSlot[] = []
    const startHour = 6
    const endHour = 18
    
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        const isAvailable = Math.random() > 0.3 // 70% disponibilidad
        const isPeak = hour >= 8 && hour <= 16
        const isPopular = hour >= 10 && hour <= 14
        const isPremium = hour >= 12 && hour <= 15
        
        let price = basePrice
        if (isPeak) price += 20
        if (isPremium) price += 40
        
        slots.push({
          time,
          available: isAvailable,
          price,
          players: 4,
          isPopular: isPopular && isAvailable,
          isPremium: isPremium && isAvailable
        })
      }
    }
    
    return slots
  }

  useEffect(() => {
    setLoading(true)
    // Simular carga de datos
    setTimeout(() => {
      setTimeSlots(generateTimeSlots(selectedDate))
      setLoading(false)
    }, 500)
  }, [selectedDate, priceWeekday, priceWeekend])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-MX', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isTomorrow = (date: Date) => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return date.toDateString() === tomorrow.toDateString()
  }

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Hoy'
    if (isTomorrow(date)) return 'Mañana'
    return formatDate(date)
  }

  const availableSlots = timeSlots.filter(slot => slot.available)
  const selectedSlot = timeSlots.find(slot => slot.time === selectedTime)

  const handleConfirmReservation = () => {
    if (selectedDate && selectedTime && selectedSlot) {
      const reservationDetails = {
        courseId,
        courseName,
        date: selectedDate.toISOString().split('T')[0],
        time: selectedTime,
        players,
        pricePerPlayer: selectedSlot.price,
        totalPrice: selectedSlot.price * players,
      }
      // Redirigir a la página de checkout con los detalles de la reserva
      router.push(`/checkout?reservation=${encodeURIComponent(JSON.stringify(reservationDetails))}`)
    }
  }

  return (
    <Card className="border-green-200">
      <CardHeader>
        <CardTitle className="text-green-700 text-xl flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Disponibilidad y Reserva
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Selector de Jugadores */}
        <div>
          <label className="text-sm font-medium text-green-700 mb-2 block">
            Número de Jugadores
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((num) => (
              <Button
                key={num}
                variant={players === num ? "default" : "outline"}
                size="sm"
                className={players === num ? "bg-green-600 hover:bg-green-700" : "border-green-300 text-green-700 hover:bg-green-50"}
                onClick={() => setPlayers(num)}
              >
                <Users className="w-4 h-4 mr-1" />
                {num}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Selector de Fecha */}
        <div>
          <label className="text-sm font-medium text-green-700 mb-3 block">
            Selecciona una Fecha
          </label>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {dates.map((date, index) => {
              const isSelected = selectedDate.toDateString() === date.toDateString()
              const isPast = date < new Date() && !isToday(date)
              
              return (
                <Button
                  key={index}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  className={`flex-shrink-0 min-w-[80px] h-16 flex flex-col ${
                    isSelected 
                      ? "bg-green-600 hover:bg-green-700" 
                      : isPast
                      ? "opacity-50 cursor-not-allowed border-gray-200 text-gray-400"
                      : "border-green-300 text-green-700 hover:bg-green-50"
                  }`}
                  onClick={() => !isPast && setSelectedDate(date)}
                  disabled={isPast}
                >
                  <span className="text-xs font-medium">
                    {getDateLabel(date)}
                  </span>
                  <span className="text-lg font-bold">
                    {date.getDate()}
                  </span>
                </Button>
              )
            })}
          </div>
        </div>

        <Separator />

        {/* Horarios Disponibles */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-green-700">
              Horarios Disponibles
            </label>
            <Badge variant="outline" className="border-green-300 text-green-700">
              {availableSlots.length} disponibles
            </Badge>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-green-600">Cargando horarios...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {timeSlots.map((slot) => (
                <Button
                  key={slot.time}
                  variant={selectedTime === slot.time ? "default" : "outline"}
                  size="sm"
                  className={`relative h-auto p-3 ${
                    !slot.available
                      ? "opacity-50 cursor-not-allowed border-gray-200 text-gray-400"
                      : selectedTime === slot.time
                      ? "bg-green-600 hover:bg-green-700"
                      : "border-green-300 text-green-700 hover:bg-green-50"
                  }`}
                  onClick={() => slot.available && setSelectedTime(slot.time)}
                  disabled={!slot.available}
                >
                  <div className="flex flex-col items-center w-full">
                    <div className="flex items-center mb-1">
                      <Clock className="w-3 h-3 mr-1" />
                      <span className="font-medium">{slot.time}</span>
                    </div>
                    <div className="text-xs">
                      ${slot.price}
                    </div>
                    
                    {/* Badges especiales */}
                    {slot.isPopular && (
                      <Badge className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs px-1 py-0">
                        Popular
                      </Badge>
                    )}
                    {slot.isPremium && (
                      <Badge className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs px-1 py-0">
                        Premium
                      </Badge>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          )}

          {availableSlots.length === 0 && !loading && (
            <div className="text-center py-8 text-green-600">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 text-green-400" />
              <p className="font-medium">No hay horarios disponibles</p>
              <p className="text-sm">Intenta con otra fecha</p>
            </div>
          )}
        </div>

        {/* Resumen de Selección */}
        {selectedTime && selectedSlot && (
          <>
            <Separator />
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-700 mb-2 flex items-center">
                <Check className="w-4 h-4 mr-2" />
                Resumen de tu Reserva
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-600">Fecha:</span>
                  <span className="font-medium text-green-700">
                    {selectedDate.toLocaleDateString('es-MX', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">Hora:</span>
                  <span className="font-medium text-green-700">{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">Jugadores:</span>
                  <span className="font-medium text-green-700">{players}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">Precio por persona:</span>
                  <span className="font-medium text-green-700">${selectedSlot.price}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-base">
                  <span className="font-semibold text-green-700">Total:</span>
                  <span className="font-bold text-green-700 text-lg">
                    ${selectedSlot.price * players}
                  </span>
                </div>
              </div>
            </div>

            {/* Botón de Reserva */}
            <Button 
              className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-3"
              size="lg"
              onClick={handleConfirmReservation}
            >
              <Calendar className="w-5 h-5 mr-2" />
              Confirmar Reserva - ${selectedSlot.price * players}
            </Button>
          </>
        )}

        {/* Información Adicional */}
        <div className="text-xs text-green-600 space-y-1">
          <p>• Reserva con hasta 30 días de anticipación</p>
          <p>• Cancelación gratuita hasta 24 horas antes</p>
          <p>• Los precios pueden variar según la temporada</p>
        </div>
      </CardContent>
    </Card>
  )
}



