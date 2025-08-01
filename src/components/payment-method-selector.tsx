'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { CreditCard } from 'lucide-react'
import StripePayment from './stripe-payment'
import PayPalPayment from './paypal-payment'

interface PaymentMethodSelectorProps {
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

type PaymentMethod = 'stripe' | 'paypal'

export default function PaymentMethodSelector({ 
  amount, 
  bookingData, 
  onSuccess, 
  onError 
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('stripe')

  const paymentMethods = [
    {
      id: 'stripe' as PaymentMethod,
      name: 'Tarjeta de Crédito/Débito',
      description: 'Visa, Mastercard, American Express',
      icon: <CreditCard className="w-6 h-6" />,
      color: 'blue'
    },
    {
      id: 'paypal' as PaymentMethod,
      name: 'PayPal',
      description: 'Paga con tu cuenta PayPal',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.26-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.9.9 0 0 0-.885.74l-1.034 6.562H9.47a.641.641 0 0 0 .633.74h3.648a.9.9 0 0 0 .885-.74l.883-5.597a.9.9 0 0 1 .885-.74h2.19c3.429 0 6.113-1.39 7.22-5.32.675-2.395.504-4.421-.592-5.565z"/>
        </svg>
      ),
      color: 'blue'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Selector de Método de Pago */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paymentMethods.map((method) => (
          <Card
            key={method.id}
            className={`cursor-pointer transition-all ${
              selectedMethod === method.id
                ? 'ring-2 ring-blue-500 bg-blue-50'
                : 'hover:shadow-md border-gray-200'
            }`}
            onClick={() => setSelectedMethod(method.id)}
          >
            <CardContent className="p-4 text-center">
              <div className={`text-${method.color}-600 mb-2 flex justify-center`}>
                {method.icon}
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">{method.name}</h3>
              <p className="text-xs text-gray-600">{method.description}</p>
              {selectedMethod === method.id && (
                <div className="mt-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto"></div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Información sobre métodos de pago */}
      <div className="text-center text-sm text-gray-600">
        <p>Selecciona tu método de pago preferido para completar la reserva</p>
      </div>

      {/* Componente de Pago Dinámico */}
      <div className="flex justify-center">
        {selectedMethod === 'stripe' && (
          <StripePayment 
            amount={amount} 
            bookingData={bookingData} 
            onSuccess={onSuccess} 
            onError={onError} 
          />
        )}
        {selectedMethod === 'paypal' && (
          <PayPalPayment 
            amount={amount} 
            bookingData={bookingData} 
            onSuccess={onSuccess} 
            onError={onError} 
          />
        )}
      </div>
    </div>
  )
}
