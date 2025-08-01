'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CreditCard, Lock, CheckCircle, AlertCircle } from 'lucide-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface StripePaymentProps {
  amount: number
  bookingData: {
    courseId: string
    courseName: string
    date: string
    time: string
    players: number
    discountCode?: string
  }
  onSuccess: (result: any) => void
  onError: (error: string) => void
}

const StripePaymentForm = ({ amount, bookingData, onSuccess, onError }: StripePaymentProps) => {
  const stripe = useStripe()
  const elements = useElements()

  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStep, setPaymentStep] = useState<'form' | 'processing' | 'success' | 'error'>('form')
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
  })
  const [clientSecret, setClientSecret] = useState('')

  // Create payment intent when component mounts
  useState(() => {
    createPaymentIntent()
  })

  const createPaymentIntent = async () => {
    try {
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          metadata: {
            golfCourseId: bookingData.courseId,
            numberOfPlayers: bookingData.players.toString(),
            bookingDate: bookingData.date,
            teeTime: bookingData.time
          }
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        setClientSecret(data.clientSecret)
      } else {
        onError('Error al crear la intención de pago')
      }
    } catch (error) {
      console.error('Error creating payment intent:', error)
      onError('Error al procesar el pago')
    }
  }

  const handlePayment = async () => {
    if (!stripe || !elements || !clientSecret) {
      onError('Stripe no está listo')
      return
    }

    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      onError('Por favor completa todos los campos requeridos')
      return
    }

    setIsProcessing(true)
    setPaymentStep('processing')

    try {
      const cardElement = elements.getElement(CardElement)
      
      if (!cardElement) {
        onError('Error al procesar la tarjeta')
        setIsProcessing(false)
        return
      }

      // Confirm payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: customerInfo.name,
            email: customerInfo.email,
            phone: customerInfo.phone,
          }
        }
      })

      if (stripeError) {
        setPaymentStep('error')
        onError(stripeError.message || 'Error al procesar el pago')
        setIsProcessing(false)
        return
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Confirm booking
        const response = await fetch('/api/stripe/confirm-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            golfCourseId: bookingData.courseId,
            bookingDate: bookingData.date,
            teeTime: bookingData.time,
            numberOfPlayers: bookingData.players,
            customerFirstName: customerInfo.name.split(' ')[0] || customerInfo.name,
            customerLastName: customerInfo.name.split(' ').slice(1).join(' ') || '',
            customerEmail: customerInfo.email,
            customerPhone: customerInfo.phone,
            discountCode: bookingData.discountCode
          }),
        })

        const data = await response.json()
        
        if (data.success) {
          setPaymentStep('success')
          
          setTimeout(() => {
            onSuccess({
              bookingId: data.booking.id,
              folio: `TRG-${new Date().getFullYear()}-${data.booking.id.slice(-6)}`,
              paymentMethod: 'stripe',
              ...data
            })
          }, 2000)
        } else {
          setPaymentStep('error')
          onError(data.message || 'Error al confirmar la reserva')
        }
      }
    } catch (error) {
      console.error('Payment error:', error)
      setPaymentStep('error')
      onError('Error de conexión. Por favor intenta nuevamente.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (paymentStep === 'processing') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-golf-green-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Procesando Pago</h3>
          <p className="text-gray-600">Por favor espera mientras procesamos tu reserva...</p>
          <div className="mt-4 space-y-2 text-sm text-gray-500">
            <div className="flex items-center justify-center">
              <div className="w-2 h-2 bg-golf-green-500 rounded-full mr-2"></div>
              Validando información de pago
            </div>
            <div className="flex items-center justify-center">
              <div className="w-2 h-2 bg-golf-green-500 rounded-full mr-2"></div>
              Confirmando disponibilidad
            </div>
            <div className="flex items-center justify-center">
              <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
              Enviando confirmaciones
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (paymentStep === 'success') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">¡Pago Exitoso!</h3>
          <p className="text-gray-600 mb-4">Tu reserva ha sido confirmada</p>
          <div className="space-y-2 text-sm text-green-600">
            <div className="flex items-center justify-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Email de confirmación enviado
            </div>
            <div className="flex items-center justify-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              PDF generado
            </div>
            <div className="flex items-center justify-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              WhatsApp enviado
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (paymentStep === 'error') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Error en el Pago</h3>
          <p className="text-gray-600 mb-4">Hubo un problema al procesar tu reserva</p>
          <Button 
            onClick={() => setPaymentStep('form')}
            className="bg-golf-green-600 hover:bg-golf-green-700 text-white"
          >
            Intentar Nuevamente
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-golf-green-800 text-lg">
          <CreditCard className="w-5 h-5 mr-2" />
          Información de Pago
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-4 pb-4">
        {/* Booking Summary */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2 text-sm">Resumen de Reserva</h4>
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Campo:</span>
              <span>{bookingData.courseName}</span>
            </div>
            <div className="flex justify-between">
              <span>Fecha:</span>
              <span>{new Date(bookingData.date).toLocaleDateString('es-ES')}</span>
            </div>
            <div className="flex justify-between">
              <span>Hora:</span>
              <span>{bookingData.time}</span>
            </div>
            <div className="flex justify-between">
              <span>Jugadores:</span>
              <span>{bookingData.players}</span>
            </div>
            <div className="flex justify-between font-semibold text-golf-green-600 border-t pt-2 mt-2">
              <span>Total:</span>
              <span>${amount} USD</span>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="space-y-2">
          <div>
            <Label htmlFor="name" className="text-sm">Nombre Completo *</Label>
            <Input
              id="name"
              value={customerInfo.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Tu nombre completo"
              className="h-10"
            />
          </div>
          
          <div>
            <Label htmlFor="email" className="text-sm">Email *</Label>
            <Input
              id="email"
              type="email"
              value={customerInfo.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="tu@email.com"
              className="h-10"
            />
          </div>
          
          <div>
            <Label htmlFor="phone" className="text-sm">Teléfono *</Label>
            <Input
              id="phone"
              value={customerInfo.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+52 555 123 4567"
              className="h-10"
            />
          </div>
        </div>

        {/* Card Element */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Información de Tarjeta</Label>
            <div className="flex items-center text-xs text-gray-500">
              <Lock className="w-3 h-3 mr-1" />
              Seguro
            </div>
          </div>
          
          <div className="p-3 border rounded-md bg-white">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Security Notice */}
        <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 mr-2 flex-shrink-0"></div>
            <div className="text-xs text-blue-700">
              <strong>Pago Seguro:</strong> Tu información de pago está protegida por 
              la encriptación de nivel bancario de Stripe.
            </div>
          </div>
        </div>

        {/* Payment Button */}
        <div className="sticky bottom-0 bg-white pt-2 pb-2 -mx-4 px-4 border-t">
          <Button
            onClick={handlePayment}
            disabled={isProcessing || !stripe || !customerInfo.name || !customerInfo.email || !customerInfo.phone}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 font-semibold h-12 text-base"
          >
            {isProcessing ? 'Procesando...' : `Pagar $${amount} USD`}
          </Button>

          <div className="text-xs text-gray-500 text-center mt-2">
            Al confirmar el pago, recibirás confirmación por email, PDF y WhatsApp
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function StripePayment(props: StripePaymentProps) {
  return (
    <Elements stripe={stripePromise}>
      <StripePaymentForm {...props} />
    </Elements>
  )
}

