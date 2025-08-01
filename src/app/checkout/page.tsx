'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Calendar, Clock, Users, MapPin, CreditCard, Shield, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { PageHeader } from '@/components/PageHeader'
import { SecondaryFooter } from '@/components/SecondaryFooter'
import PaymentMethodSelector from '@/components/payment-method-selector'
import Link from 'next/link'

interface ReservationDetails {
  courseId: string
  courseName: string
  date: string
  time: string
  players: number
  pricePerPlayer: number
  totalPrice: number
}

interface CustomerInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  specialRequests?: string
}

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const [reservationDetails, setReservationDetails] = useState<ReservationDetails | null>(null)
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: ''
  })
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'card'>('paypal')

  useEffect(() => {
    const reservationParam = searchParams.get('reservation')
    if (reservationParam) {
      try {
        const details = JSON.parse(decodeURIComponent(reservationParam))
        setReservationDetails(details)
      } catch (error) {
        console.error('Error parsing reservation details:', error)
      }
    }
  }, [searchParams])

  const handleInputChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const isFormValid = () => {
    return customerInfo.firstName && 
           customerInfo.lastName && 
           customerInfo.email && 
           customerInfo.phone
  }

  const createPayPalOrder = (data: any, actions: any) => {
    if (!reservationDetails) return Promise.reject('No reservation details')

    return actions.order.create({
      purchase_units: [{
        amount: {
          value: reservationDetails.totalPrice.toString(),
          currency_code: 'USD'
        },
        description: `Reserva de golf en ${reservationDetails.courseName} para ${reservationDetails.players} jugadores`,
        custom_id: `${reservationDetails.courseId}-${Date.now()}`,
        invoice_id: `INV-${Date.now()}`,
        soft_descriptor: 'TeeReserve Golf'
      }],
      application_context: {
        brand_name: 'TeeReserve',
        locale: 'es-MX',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
        return_url: `${window.location.origin}/confirmation`,
        cancel_url: `${window.location.origin}/checkout`
      }
    })
  }

  const onPayPalApprove = async (data: any, actions: any) => {
    setLoading(true)
    try {
      const order = await actions.order.capture()
      
      // Crear la reserva en la base de datos
      const reservationData = {
        ...reservationDetails,
        ...customerInfo,
        paymentId: order.id,
        paymentStatus: 'completed',
        paymentMethod: 'paypal',
        createdAt: new Date().toISOString()
      }

      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reservationData)
      })

      if (response.ok) {
        const reservation = await response.json()
        // Redirigir a la página de confirmación
        window.location.href = `/confirmation?id=${reservation.id}`
      } else {
        throw new Error('Error creating reservation')
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('Hubo un error procesando tu pago. Por favor intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const onPayPalError = (error: any) => {
    console.error('PayPal error:', error)
    alert('Hubo un error con PayPal. Por favor intenta de nuevo.')
  }

  if (!reservationDetails) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader />
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-bold text-gray-700 mb-4">
                No se encontraron detalles de reserva
              </h2>
              <p className="text-gray-500 mb-6">
                Por favor regresa a la página del campo y selecciona tu tee time.
              </p>
              <Link href="/courses">
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  Ver Campos
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <SecondaryFooter />
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/courses" className="inline-flex items-center text-green-600 hover:text-green-700 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a campos
            </Link>
            <h1 className="text-3xl font-bold text-green-800">Finalizar Reserva</h1>
            <p className="text-gray-600 mt-2">
              Completa tu información y confirma tu reserva de golf
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulario de información del cliente */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-700">Información del Cliente</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-green-700">Nombre *</Label>
                      <Input
                        id="firstName"
                        value={customerInfo.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="border-green-300 focus:border-green-500 focus:ring-green-500"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-green-700">Apellido *</Label>
                      <Input
                        id="lastName"
                        value={customerInfo.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="border-green-300 focus:border-green-500 focus:ring-green-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email" className="text-green-700">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="border-green-300 focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone" className="text-green-700">Teléfono *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="border-green-300 focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="specialRequests" className="text-green-700">Solicitudes Especiales (Opcional)</Label>
                    <textarea
                      id="specialRequests"
                      value={customerInfo.specialRequests}
                      onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                      className="w-full px-3 py-2 border border-green-300 rounded-md focus:border-green-500 focus:ring-green-500 focus:ring-1"
                      rows={3}
                      placeholder="Ej: Preferencia de carrito de golf, restricciones dietéticas, etc."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Método de Pago */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-green-700 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Método de Pago
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Selector de método de pago */}
                    <div className="flex gap-4">
                      <Button
                        variant={paymentMethod === 'paypal' ? 'default' : 'outline'}
                        onClick={() => setPaymentMethod('paypal')}
                        className={paymentMethod === 'paypal' ? 'bg-green-600 hover:bg-green-700' : 'border-green-300 text-green-700 hover:bg-green-50'}
                      >
                        PayPal
                      </Button>
                      <Button
                        variant={paymentMethod === 'card' ? 'default' : 'outline'}
                        onClick={() => setPaymentMethod('card')}
                        className={paymentMethod === 'card' ? 'bg-green-600 hover:bg-green-700' : 'border-green-300 text-green-700 hover:bg-green-50'}
                        disabled
                      >
                        Tarjeta de Crédito (Próximamente)
                      </Button>
                    </div>

                    {/* PayPal Buttons */}
                    {paymentMethod === 'paypal' && isFormValid() && (
                      <div className="mt-6">
                        <PayPalScriptProvider options={{
                          "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
                          currency: "USD",
                          locale: "es_MX"
                        }}>
                          <PayPalButtons
                            style={{
                              layout: 'vertical',
                              color: 'gold',
                              shape: 'rect',
                              label: 'paypal'
                            }}
                            createOrder={createPayPalOrder}
                            onApprove={onPayPalApprove}
                            onError={onPayPalError}
                            disabled={loading}
                          />
                        </PayPalScriptProvider>
                      </div>
                    )}

                    {!isFormValid() && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-yellow-800 text-sm">
                          Por favor completa todos los campos requeridos para continuar con el pago.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Resumen de la reserva */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="text-green-700">Resumen de Reserva</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-green-800 text-lg mb-2">
                      {reservationDetails.courseName}
                    </h3>
                  </div>

                  <Separator />

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center text-green-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        Fecha:
                      </span>
                      <span className="font-medium text-green-700">
                        {formatDate(reservationDetails.date)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="flex items-center text-green-600">
                        <Clock className="w-4 h-4 mr-2" />
                        Hora:
                      </span>
                      <span className="font-medium text-green-700">
                        {reservationDetails.time}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="flex items-center text-green-600">
                        <Users className="w-4 h-4 mr-2" />
                        Jugadores:
                      </span>
                      <span className="font-medium text-green-700">
                        {reservationDetails.players}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-600">Precio por persona:</span>
                      <span className="font-medium text-green-700">
                        ${reservationDetails.pricePerPlayer}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600">Subtotal:</span>
                      <span className="font-medium text-green-700">
                        ${reservationDetails.totalPrice}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600">Impuestos:</span>
                      <span className="font-medium text-green-700">Incluidos</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg">
                    <span className="font-bold text-green-700">Total:</span>
                    <span className="font-bold text-green-700">
                      ${reservationDetails.totalPrice} USD
                    </span>
                  </div>

                  {/* Información de seguridad */}
                  <div className="bg-green-50 p-3 rounded-lg mt-4">
                    <div className="flex items-center text-green-700 text-sm">
                      <Shield className="w-4 h-4 mr-2" />
                      <span className="font-medium">Pago Seguro</span>
                    </div>
                    <p className="text-green-600 text-xs mt-1">
                      Tu información está protegida con encriptación SSL
                    </p>
                  </div>

                  {/* Políticas */}
                  <div className="text-xs text-green-600 space-y-1 mt-4">
                    <p>• Cancelación gratuita hasta 24 horas antes</p>
                    <p>• Confirmación inmediata por email</p>
                    <p>• Soporte al cliente 24/7</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <SecondaryFooter />
    </div>
  )
}

