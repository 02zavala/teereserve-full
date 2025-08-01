"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Users, Calendar, MapPin, Tag, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import PaymentMethodSelector from './payment-method-selector'

interface BookingDetails {
  date: Date
  timeSlot: {
    id: string
    startTime: string
    endTime: string
    availableSlots: number
  }
  golfCourse: {
    id: string
    name: string
    location: string
    pricePerRound: number
  }
}

interface BookingPaymentProps {
  bookingDetails: BookingDetails
  onBookingComplete: (booking: any) => void
  onCancel: () => void
}

const PaymentForm = ({ bookingDetails, onBookingComplete, onCancel }: BookingPaymentProps) => {
  const [numberOfPlayers, setNumberOfPlayers] = useState(1)
  const [discountCode, setDiscountCode] = useState('')
  const [affiliateCode, setAffiliateCode] = useState('')
  const [discountApplied, setDiscountApplied] = useState<any>(null)
  const [affiliateApplied, setAffiliateApplied] = useState<any>(null)
  const [error, setError] = useState('')

  const basePrice = bookingDetails.golfCourse.pricePerRound * numberOfPlayers
  const finalPrice = discountApplied 
    ? discountApplied.discountType === 'percentage'
      ? basePrice * (1 - discountApplied.value)
      : Math.max(0, basePrice - discountApplied.value)
    : basePrice

  const applyAffiliateCode = async () => {
    if (!affiliateCode.trim()) return

    try {
      const response = await fetch(`/api/affiliates/${affiliateCode}`)
      
      if (response.ok) {
        const data = await response.json()
        setAffiliateApplied(data.affiliate)
        setError('')
      } else {
        setError('Código de afiliado inválido')
      }
    } catch (error) {
      console.error('Error applying affiliate code:', error)
      setError('Error al aplicar el código de afiliado')
    }
  }

  const applyDiscountCode = async () => {
    if (!discountCode.trim()) return

    try {
      const response = await fetch(`/api/discount-codes/${discountCode}`)
      
      if (response.ok) {
        const data = await response.json()
        const discount = data.discountCode
        
        // Validate discount
        if (discount.expiresAt && new Date(discount.expiresAt) < new Date()) {
          setError('El código de descuento ha expirado')
          return
        }
        
        if (discount.maxUses && discount.currentUses >= discount.maxUses) {
          setError('El código de descuento ha alcanzado su límite de uso')
          return
        }
        
        if (discount.minBookingValue && basePrice < discount.minBookingValue) {
          setError(`El monto mínimo para este descuento es $${discount.minBookingValue}`)
          return
        }
        
        setDiscountApplied(discount)
        setError('')
      } else {
        setError('Código de descuento inválido')
      }
    } catch (error) {
      console.error('Error applying discount:', error)
      setError('Error al aplicar el descuento')
    }
  }

  const handlePaymentSuccess = (result: any) => {
    onBookingComplete(result.booking || result)
  }

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Booking Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Resumen de Reserva
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-gray-500" />
            <div>
              <p className="font-medium">{bookingDetails.golfCourse.name}</p>
              <p className="text-sm text-gray-600">{bookingDetails.golfCourse.location}</p>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Fecha:</span>
              <span className="font-medium">
                {format(bookingDetails.date, 'EEEE, d MMMM yyyy', { locale: es })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Hora:</span>
              <span className="font-medium">
                {bookingDetails.timeSlot.startTime} - {bookingDetails.timeSlot.endTime}
              </span>
            </div>
          </div>

          <Separator />

          <div>
            <Label htmlFor="numberOfPlayers">Número de Jugadores</Label>
            <select
              id="numberOfPlayers"
              value={numberOfPlayers}
              onChange={(e) => setNumberOfPlayers(parseInt(e.target.value))}
              className="w-full p-2 border rounded-md mt-1"
            >
              {[1, 2, 3, 4].map(num => (
                <option key={num} value={num}>{num} jugador{num > 1 ? 'es' : ''}</option>
              ))}
            </select>
          </div>

          <Separator />

          {/* Affiliate Code */}
          <div>
            <Label htmlFor="affiliateCode">Código de Afiliado (Opcional)</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="affiliateCode"
                value={affiliateCode}
                onChange={(e) => setAffiliateCode(e.target.value)}
                placeholder="Ej: TEE123"
              />
              <Button 
                onClick={applyAffiliateCode}
                variant="outline"
                size="sm"
              >
                <Tag className="h-4 w-4 mr-2" />
                Aplicar
              </Button>
            </div>
            {affiliateApplied && (
              <div className="mt-2">
                <Badge variant="secondary" className="text-blue-700 bg-blue-100">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Afiliado: {affiliateApplied.user?.name}
                </Badge>
              </div>
            )}
          </div>

          <Separator />

          {/* Discount Code */}
          <div>
            <Label htmlFor="discountCode">Código de Descuento (Opcional)</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="discountCode"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                placeholder="Ingresa tu código"
              />
              <Button 
                onClick={applyDiscountCode}
                variant="outline"
                size="sm"
              >
                <Tag className="h-4 w-4 mr-2" />
                Aplicar
              </Button>
            </div>
            {discountApplied && (
              <div className="mt-2">
                <Badge variant="secondary" className="text-green-700 bg-green-100">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Descuento aplicado: {discountApplied.code}
                </Badge>
              </div>
            )}
          </div>

          <Separator />

          {/* Price Breakdown */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">
                Precio por jugador:
              </span>
              <span>${bookingDetails.golfCourse.pricePerRound.toLocaleString()} MXN</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">
                Subtotal ({numberOfPlayers} jugador{numberOfPlayers > 1 ? 'es' : ''}):
              </span>
              <span>${basePrice.toLocaleString()} MXN</span>
            </div>
            {discountApplied && (
              <div className="flex justify-between text-green-600">
                <span className="text-sm">
                  Descuento ({discountApplied.code}):
                </span>
                <span>
                  -{discountApplied.discountType === 'percentage' 
                    ? `${(discountApplied.value * 100).toFixed(0)}%`
                    : `$${discountApplied.value.toLocaleString()} MXN`
                  }
                </span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>${finalPrice.toLocaleString()} MXN</span>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Cancel Button */}
          <Button
            variant="outline"
            onClick={onCancel}
            className="w-full"
          >
            Cancelar Reserva
          </Button>
        </CardContent>
      </Card>

      {/* Payment Method Selector */}
      <div>
        <PaymentMethodSelector
          amount={finalPrice}
          bookingData={{
            courseId: bookingDetails.golfCourse.id,
            courseName: bookingDetails.golfCourse.name,
            date: format(bookingDetails.date, 'yyyy-MM-dd'),
            time: bookingDetails.timeSlot.startTime,
            players: numberOfPlayers,
            discountCode: discountApplied?.code
          }}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      </div>
    </div>
  )
}

export default function BookingPayment(props: BookingPaymentProps) {
  return <PaymentForm {...props} />
}

