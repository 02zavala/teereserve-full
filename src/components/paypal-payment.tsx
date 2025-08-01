'use client'

import React, { useState } from 'react'
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface PayPalPaymentProps {
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

export default function PayPalPayment({ amount, bookingData, onSuccess, onError }: PayPalPaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStep, setPaymentStep] = useState<'form' | 'processing' | 'success' | 'error'>('form')

  if (paymentStep === 'processing') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Procesando Pago con PayPal</h3>
          <p className="text-gray-600">Por favor espera mientras confirmamos tu pago...</p>
        </CardContent>
      </Card>
    )
  }

  if (paymentStep === 'success') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">¡Pago PayPal Exitoso!</h3>
          <p className="text-gray-600 mb-4">Tu reserva ha sido confirmada</p>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Procesado por PayPal
          </Badge>
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
          <p className="text-gray-600 mb-4">Hubo un problema al procesar tu pago con PayPal</p>
          <button 
            onClick={() => setPaymentStep('form')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Intentar Nuevamente
          </button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center text-blue-600">
          <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.26-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.9.9 0 0 0-.885.74l-1.034 6.562H9.47a.641.641 0 0 0 .633.74h3.648a.9.9 0 0 0 .885-.74l.883-5.597a.9.9 0 0 1 .885-.74h2.19c3.429 0 6.113-1.39 7.22-5.32.675-2.395.504-4.421-.592-5.565z"/>
          </svg>
          Pago con PayPal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resumen de Reserva */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">Resumen de Reserva</h4>
          <div className="space-y-2 text-sm text-gray-600">
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
            <div className="flex justify-between font-semibold text-blue-600 border-t pt-2 mt-2">
              <span>Total:</span>
              <span>${amount} MXN</span>
            </div>
          </div>
        </div>

        {/* Verificar que tenemos las credenciales de PayPal */}
        {process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ? (
          <PayPalScriptProvider
            options={{
              "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
              currency: "MXN",
              locale: "es_MX"
            }}
          >
            <PayPalButtons
              style={{
                shape: "rect",
                layout: "vertical",
                color: "blue",
                label: "paypal"
              }}
              createOrder={async () => {
                setIsProcessing(true)
                try {
                  const response = await fetch('/api/paypal/create-order', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      amount,
                      currency: 'MXN',
                      golfCourseId: bookingData.courseId,
                      golfCourseName: bookingData.courseName,
                      bookingDate: bookingData.date,
                      teeTime: bookingData.time,
                      numberOfPlayers: bookingData.players
                    })
                  })

                  if (!response.ok) {
                    throw new Error('Failed to create PayPal order')
                  }

                  const data = await response.json()
                  return data.orderID
                } catch (error) {
                  console.error('Error creating PayPal order:', error)
                  onError('Error al crear la orden de PayPal')
                  setIsProcessing(false)
                  throw error
                }
              }}
              onApprove={async (data) => {
                setPaymentStep('processing')
                try {
                  const response = await fetch('/api/paypal/capture-order', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      orderID: data.orderID,
                      discountCode: bookingData.discountCode
                    })
                  })

                  if (!response.ok) {
                    throw new Error('Failed to capture PayPal payment')
                  }

                  const result = await response.json()
                  setPaymentStep('success')
                  
                  setTimeout(() => {
                    onSuccess({
                      bookingId: result.booking.id,
                      paymentMethod: 'paypal',
                      folio: `TRG-${new Date().getFullYear()}-${result.booking.id.slice(-6)}`,
                      ...result
                    })
                  }, 2000)
                } catch (error) {
                  console.error('Error capturing PayPal payment:', error)
                  setPaymentStep('error')
                  onError('Error al procesar el pago con PayPal')
                }
              }}
              onError={(err) => {
                console.error('PayPal error:', err)
                setPaymentStep('error')
                onError('Error en el pago con PayPal')
                setIsProcessing(false)
              }}
              onCancel={() => {
                setIsProcessing(false)
                onError('Pago cancelado por el usuario')
              }}
            />
          </PayPalScriptProvider>
        ) : (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              PayPal no está configurado. Por favor contacta al administrador.
            </p>
          </div>
        )}

        {/* Información de seguridad */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 mr-2 flex-shrink-0"></div>
            <div className="text-xs text-blue-700">
              <strong>Pago Seguro:</strong> Tu información de pago está protegida por 
              la encriptación de nivel bancario de PayPal.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
