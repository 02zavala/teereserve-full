"use client"

import { useState } from 'react'
import { MessageCircle, X, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface WhatsAppWidgetProps {
  phoneNumber?: string
  message?: string
}

export default function WhatsAppWidget({
  phoneNumber = "+52 624 135 2986",
  message = "¡Hola! Me interesa reservar un tee time en TeeReserve Golf. ¿Podrían ayudarme?"
}: WhatsAppWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleWhatsAppClick = async () => {
    try {
      // Send automated WhatsApp message via API
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: phoneNumber,
          message: message,
          type: 'reservation'
        })
      })

      if (response.ok) {
        // Show success message
        alert('✅ Mensaje enviado! Te contactaremos por WhatsApp en breve.')
      } else {
        // Fallback to direct WhatsApp link
        const encodedMessage = encodeURIComponent(message)
        const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodedMessage}`
        window.open(whatsappUrl, '_blank')
      }
    } catch (error) {
      // Fallback to direct WhatsApp link
      const encodedMessage = encodeURIComponent(message)
      const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodedMessage}`
      window.open(whatsappUrl, '_blank')
    }

    setIsOpen(false)
  }

  const handlePhoneClick = () => {
    window.location.href = `tel:${phoneNumber}`
    setIsOpen(false)
  }

  return (
    <>
      {/* Widget Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-2xl border-0 p-0 group transition-all duration-300 hover:scale-110"
          size="lg"
        >
          {isOpen ? (
            <X className="w-8 h-8" />
          ) : (
            <MessageCircle className="w-8 h-8 group-hover:animate-bounce" />
          )}
        </Button>

        {/* Floating Card */}
        {isOpen && (
          <Card className="absolute bottom-20 right-0 w-80 shadow-2xl border-2 border-green-200 bg-white/95 backdrop-blur-sm animate-in slide-in-from-bottom-2 duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-golf-green-600 flex items-center">
                <MessageCircle className="w-5 h-5 mr-2 text-green-500" />
                Reserva por WhatsApp
              </CardTitle>
              <CardDescription className="text-golf-green-700">
                Contacta directamente con nuestro equipo para reservar tu tee time
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* WhatsApp Button */}
              <Button
                onClick={handleWhatsAppClick}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-6 text-lg font-semibold group"
                size="lg"
              >
                <svg
                  className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                Reservar por WhatsApp
              </Button>

              {/* Phone Button */}
              <Button
                onClick={handlePhoneClick}
                variant="outline"
                className="w-full border-golf-green-600 text-golf-green-700 hover:bg-golf-green-50 py-6 text-lg font-semibold"
                size="lg"
              >
                <Phone className="w-5 h-5 mr-3" />
                Llamar Ahora
              </Button>

              {/* Contact Info */}
              <div className="pt-3 border-t border-golf-beige-200 text-center">
                <p className="text-sm text-golf-green-600 font-medium">
                  📱 {phoneNumber}
                </p>
                <p className="text-xs text-golf-green-500 mt-1">
                  Horario: 7:00 AM - 8:00 PM
                </p>
              </div>

              {/* Features */}
              <div className="bg-golf-beige-50 rounded-lg p-3 text-center">
                <p className="text-xs text-golf-green-600 font-medium mb-2">
                  ✅ Reserva Inmediata
                </p>
                <div className="flex justify-center space-x-4 text-xs text-golf-green-500">
                  <span>⚡ Confirmación Rápida</span>
                  <span>💳 Pago Seguro</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notification Bubble */}
        {!isOpen && (
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
            1
          </div>
        )}
      </div>
    </>
  )
}
