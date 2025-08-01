
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Calendar, Clock, Users, MapPin, DollarSign, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { PageHeader } from '@/components/PageHeader'
import { SecondaryFooter } from '@/components/SecondaryFooter'

interface Reservation {
  id: string
  courseId: string
  courseName: string
  date: string
  time: string
  players: number
  pricePerPlayer: number
  totalPrice: number
  customerFirstName: string
  customerLastName: string
  customerEmail: string
  customerPhone: string
  specialRequests?: string
  paymentId?: string
  paymentStatus: string
  paymentMethod: string
  status: string
  createdAt: string
  updatedAt: string
}

export default function ConfirmationPage() {
  const searchParams = useSearchParams()
  const reservationId = searchParams.get('id')
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReservation = async () => {
      if (!reservationId) {
        setError('No se proporcionó ID de reserva.')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/reservations?id=${reservationId}`)
        if (!response.ok) {
          throw new Error(`Error al cargar la reserva: ${response.statusText}`)
        }
        const data: Reservation = await response.json()
        setReservation(data)
      } catch (err: any) {
        console.error('Error fetching reservation:', err)
        setError(err.message || 'Error al cargar los detalles de la reserva.')
      } finally {
        setLoading(false)
      }
    }

    fetchReservation()
  }, [reservationId])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-green-600" />
        <p className="ml-4 text-lg text-green-700">Cargando confirmación de reserva...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader />
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="p-8">
              <h2 className="text-xl font-bold text-red-600 mb-4">Error al cargar la reserva</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <Link href="/courses">
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  Volver a Campos
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <SecondaryFooter />
      </div>
    )
  }

  if (!reservation) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader />
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="p-8">
              <h2 className="text-xl font-bold text-gray-700 mb-4">Reserva no encontrada</h2>
              <p className="text-gray-600 mb-6">
                Parece que la reserva que buscas no existe o el enlace es incorrecto.
              </p>
              <Link href="/courses">
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  Volver a Campos
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <SecondaryFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader />

      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-3xl mx-auto shadow-lg rounded-lg overflow-hidden">
          <CardHeader className="bg-green-600 text-white p-6 text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4" />
            <CardTitle className="text-3xl font-bold">¡Reserva Confirmada!</CardTitle>
            <p className="text-green-100 mt-2">
              Tu tee time en {reservation.courseName} ha sido reservado exitosamente.
            </p>
          </CardHeader>
          <CardContent className="p-6 md:p-8 space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-green-800 mb-4">Detalles de tu Reserva</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="flex items-center text-gray-700">
                  <MapPin className="w-5 h-5 mr-3 text-green-600" />
                  <div>
                    <p className="font-medium">Campo de Golf:</p>
                    <p className="text-lg font-bold text-green-700">{reservation.courseName}</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-700">
                  <Calendar className="w-5 h-5 mr-3 text-green-600" />
                  <div>
                    <p className="font-medium">Fecha:</p>
                    <p className="text-lg font-bold text-green-700">{formatDate(reservation.date)}</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-700">
                  <Clock className="w-5 h-5 mr-3 text-green-600" />
                  <div>
                    <p className="font-medium">Hora:</p>
                    <p className="text-lg font-bold text-green-700">{reservation.time}</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-700">
                  <Users className="w-5 h-5 mr-3 text-green-600" />
                  <div>
                    <p className="font-medium">Jugadores:</p>
                    <p className="text-lg font-bold text-green-700">{reservation.players}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="text-center">
              <h3 className="text-2xl font-semibold text-green-800 mb-4">Información de Pago</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="flex items-center text-gray-700">
                  <DollarSign className="w-5 h-5 mr-3 text-green-600" />
                  <div>
                    <p className="font-medium">Total Pagado:</p>
                    <p className="text-lg font-bold text-green-700">${reservation.totalPrice} USD</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-700">
                  <CreditCard className="w-5 h-5 mr-3 text-green-600" />
                  <div>
                    <p className="font-medium">Método de Pago:</p>
                    <p className="text-lg font-bold text-green-700">{reservation.paymentMethod.toUpperCase()}</p>
                  </div>
                </div>
                {reservation.paymentId && (
                  <div className="flex items-center text-gray-700 md:col-span-2">
                    <p className="font-medium">ID de Transacción:</p>
                    <p className="ml-2 text-gray-600 text-sm break-all">{reservation.paymentId}</p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <div className="text-center">
              <h3 className="text-2xl font-semibold text-green-800 mb-4">Información del Cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="text-gray-700">
                  <p className="font-medium">Nombre:</p>
                  <p className="text-lg font-bold text-green-700">{reservation.customerFirstName} {reservation.customerLastName}</p>
                </div>
                <div className="text-gray-700">
                  <p className="font-medium">Email:</p>
                  <p className="text-lg font-bold text-green-700">{reservation.customerEmail}</p>
                </div>
                <div className="text-gray-700">
                  <p className="font-medium">Teléfono:</p>
                  <p className="text-lg font-bold text-green-700">{reservation.customerPhone}</p>
                </div>
                {reservation.specialRequests && (
                  <div className="text-gray-700 md:col-span-2">
                    <p className="font-medium">Solicitudes Especiales:</p>
                    <p className="text-gray-600 text-sm">{reservation.specialRequests}</p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <div className="text-center mt-8">
              <p className="text-gray-600 mb-4">
                Se ha enviado un email de confirmación a <span className="font-semibold">{reservation.customerEmail}</span> con todos los detalles de tu reserva.
              </p>
              <Link href="/courses">
                <Button className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-3 rounded-full shadow-lg">
                  Explorar Más Campos
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <SecondaryFooter />
    </div>
  )
}


