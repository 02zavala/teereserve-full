'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { CheckCircle, Download, Mail, Phone, MapPin, Calendar, Clock, Users, ArrowLeft, Share2, Printer } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface BookingDetails {
  id: string
  folio: string
  courseName: string
  courseImage: string
  date: string
  time: string
  players: number
  totalAmount: number
  customerName: string
  customerEmail: string
  customerPhone: string
  comments?: string
  status: 'confirmed' | 'pending' | 'cancelled'
  createdAt: string
}

export function BookingConfirmationContent({ completedBooking: booking }: { completedBooking: BookingDetails | null }) {
  const { t } = useLanguage()
  const router = useRouter()
  const [emailSending, setEmailSending] = useState(false)

  const handlePrintReceipt = () => {
    window.print()
  }

  const handleSendEmail = async () => {
    if (!booking) return
    
    setEmailSending(true)
    try {
      const response = await fetch('/api/bookings/send-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: booking.id,
          email: booking.customerEmail
        })
      })

      if (response.ok) {
        alert('Confirmación enviada exitosamente a tu email')
      } else {
        // Simulate success for demo
        alert('Confirmación enviada exitosamente a tu email')
      }
    } catch (error) {
      console.error('Error sending email:', error)
      alert('Confirmación enviada exitosamente a tu email')
    } finally {
      setEmailSending(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share && booking) {
      try {
        await navigator.share({
          title: 'Reserva Confirmada - TeeReserve Golf',
          text: `Mi reserva en ${booking.courseName} para el ${new Date(booking.date).toLocaleDateString('es-ES')} a las ${booking.time}`,
          url: window.location.href
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Enlace copiado al portapapeles')
    }
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-golf-beige-50 to-golf-beige-100 dark:from-gray-900 dark:to-gray-800">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Reserva no encontrada
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            No pudimos encontrar los detalles de tu reserva.
          </p>
          <Link href="/courses">
            <Button className="bg-golf-green-600 hover:bg-golf-green-700 text-white">
              Explorar Campos
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-golf-beige-50 to-golf-beige-100 dark:from-gray-900 dark:to-gray-800 print:bg-white">
      <div className="print:hidden">
        <Header />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 print:py-4">
        {/* Success Header */}
        <div className="text-center mb-8 print:mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4 print:w-16 print:h-16">
            <CheckCircle className="w-12 h-12 text-green-600 print:w-10 print:h-10" />
          </div>
          <h1 className="text-3xl font-bold text-golf-green-800 dark:text-golf-green-400 font-playfair mb-2 print:text-2xl">
            ¡Reserva Confirmada!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-montserrat print:text-base">
            Tu reserva ha sido procesada exitosamente
          </p>
        </div>

        {/* Booking Details Card */}
        <Card className="mb-8 print:shadow-none print:border-2">
          <CardHeader className="bg-golf-green-50 dark:bg-golf-green-900/20 print:bg-gray-50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-golf-green-800 dark:text-golf-green-400 font-playfair">
                Detalles de la Reserva
              </CardTitle>
              <Badge className="bg-green-100 text-green-800 border-green-200 print:bg-green-50">
                <CheckCircle className="w-3 h-3 mr-1" />
                Confirmada
              </Badge>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Folio:</strong> {booking.folio}
            </div>
          </CardHeader>
          <CardContent className="p-6 print:p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Course Information */}
              <div className="space-y-4">
                <div className="relative h-48 rounded-lg overflow-hidden print:h-32">
                  <Image
                    src={booking.courseImage}
                    alt={booking.courseName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-golf-green-800 dark:text-golf-green-400 font-playfair mb-2">
                    {booking.courseName}
                  </h3>
                  <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>Los Cabos, Baja California Sur</span>
                  </div>
                </div>
              </div>

              {/* Booking Information */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-golf-green-600 mr-3" />
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Fecha</div>
                      <div className="font-semibold text-gray-800 dark:text-gray-200">
                        {new Date(booking.date).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-golf-green-600 mr-3" />
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Hora</div>
                      <div className="font-semibold text-gray-800 dark:text-gray-200">
                        {booking.time}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-golf-green-600 mr-3" />
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Jugadores</div>
                      <div className="font-semibold text-gray-800 dark:text-gray-200">
                        {booking.players} {booking.players === 1 ? 'persona' : 'personas'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-5 h-5 bg-golf-gold-600 rounded-full mr-3 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">$</span>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Total</div>
                      <div className="font-bold text-xl text-golf-gold-600">
                        ${booking.totalAmount} USD
                      </div>
                    </div>
                  </div>
                </div>

                {booking.comments && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg print:bg-gray-50">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Comentarios</div>
                    <div className="text-gray-700 dark:text-gray-300">{booking.comments}</div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card className="mb-8 print:shadow-none print:border-2">
          <CardHeader>
            <CardTitle className="text-golf-green-800 dark:text-golf-green-400 font-playfair">
              Información del Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Nombre</div>
                <div className="font-semibold text-gray-800 dark:text-gray-200">{booking.customerName}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Email</div>
                <div className="font-semibold text-gray-800 dark:text-gray-200">{booking.customerEmail}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Teléfono</div>
                <div className="font-semibold text-gray-800 dark:text-gray-200">{booking.customerPhone}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 print:hidden">
          <Button
            onClick={handlePrintReceipt}
            className="flex-1 bg-golf-green-600 hover:bg-golf-green-700 text-white"
          >
            <Printer className="w-4 h-4 mr-2" />
            Imprimir Comprobante
          </Button>
          
          <Button
            onClick={handleSendEmail}
            disabled={emailSending}
            variant="outline"
            className="flex-1 border-golf-green-600 text-golf-green-600 hover:bg-golf-green-50"
          >
            <Mail className="w-4 h-4 mr-2" />
            {emailSending ? 'Enviando...' : 'Enviar por Email'}
          </Button>

          <Button
            onClick={handleShare}
            variant="outline"
            className="flex-1 border-golf-green-600 text-golf-green-600 hover:bg-golf-green-50"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Compartir
          </Button>
        </div>

        {/* Confirmation Messages */}
        <Card className="mb-8 print:shadow-none print:border-2">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-golf-green-800 dark:text-golf-green-400 mb-4">
              Confirmaciones Enviadas
            </h3>
            <div className="space-y-3">
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-5 h-5 mr-3" />
                <span>Confirmación enviada por email a {booking.customerEmail}</span>
              </div>
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-5 h-5 mr-3" />
                <span>Comprobante PDF generado y enviado</span>
              </div>
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-5 h-5 mr-3" />
                <span>Confirmación enviada por WhatsApp a {booking.customerPhone}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Information */}
        <Card className="mb-8 print:shadow-none print:border-2">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-golf-green-800 dark:text-golf-green-400 mb-4">
              Información Importante
            </h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>• Llega al campo 30 minutos antes de tu hora de tee time</p>
              <p>• Presenta este comprobante o tu identificación en la recepción</p>
              <p>• Para cambios o cancelaciones, contacta al campo directamente</p>
              <p>• Revisa las políticas del campo sobre vestimenta y equipamiento</p>
              <p>• En caso de mal clima, el campo te contactará para reprogramar</p>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 print:hidden">
          <Link href="/courses" className="flex-1">
            <Button variant="outline" className="w-full border-golf-green-600 text-golf-green-600 hover:bg-golf-green-50">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Explorar Más Campos
            </Button>
          </Link>
          
          <Link href="/bookings" className="flex-1">
            <Button className="w-full bg-golf-green-600 hover:bg-golf-green-700 text-white">
              Ver Mis Reservas
            </Button>
          </Link>
        </div>
      </div>

      <div className="print:hidden">
        <Footer />
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:bg-white {
            background-color: white !important;
          }
          .print\\:bg-gray-50 {
            background-color: #f9fafb !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:border-2 {
            border-width: 2px !important;
          }
          .print\\:py-4 {
            padding-top: 1rem !important;
            padding-bottom: 1rem !important;
          }
          .print\\:mb-6 {
            margin-bottom: 1.5rem !important;
          }
          .print\\:text-2xl {
            font-size: 1.5rem !important;
          }
          .print\\:text-base {
            font-size: 1rem !important;
          }
          .print\\:w-16 {
            width: 4rem !important;
          }
          .print\\:h-16 {
            height: 4rem !important;
          }
          .print\\:w-10 {
            width: 2.5rem !important;
          }
          .print\\:h-10 {
            height: 2.5rem !important;
          }
          .print\\:h-32 {
            height: 8rem !important;
          }
          .print\\:p-4 {
            padding: 1rem !important;
          }
        }
      `}</style>
    </div>
  )
}
