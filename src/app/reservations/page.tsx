import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, MapPin, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Mis Reservaciones - TeeReserve Golf',
  description: 'Gestiona tus reservaciones de tee time en TeeReserve Golf',
}

export default function ReservationsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Reservaciones</h1>
            <p className="text-gray-600">Gestiona y revisa tus tee times reservados</p>
          </div>

          {/* Reservaciones activas */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  Próximas Reservaciones
                </CardTitle>
                <CardDescription>
                  Tus tee times programados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No tienes reservaciones activas
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Explora nuestros campos de golf y reserva tu tee time perfecto
                  </p>
                  <Link href="/courses">
                    <Button className="bg-green-600 hover:bg-green-700">
                      Explorar Campos
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Historial */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-600" />
                  Historial de Reservaciones
                </CardTitle>
                <CardDescription>
                  Tus tee times anteriores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Sin historial de reservaciones
                  </h3>
                  <p className="text-gray-500">
                    Tus reservaciones pasadas aparecerán aquí
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Acciones rápidas */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/courses">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <MapPin className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-medium text-gray-900">Explorar Campos</h3>
                  <p className="text-sm text-gray-500">Descubre nuevos campos</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/dashboard">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-medium text-gray-900">Mi Dashboard</h3>
                  <p className="text-sm text-gray-500">Ver estadísticas</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-medium text-gray-900">Nueva Reserva</h3>
                  <p className="text-sm text-gray-500">Reservar tee time</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

