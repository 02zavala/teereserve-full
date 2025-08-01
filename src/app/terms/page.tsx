import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, FileText, Shield, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Términos y Condiciones - TeeReserve Golf',
  description: 'Términos y condiciones de uso de TeeReserve Golf',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center text-green-600 hover:text-green-700 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Términos y Condiciones</h1>
            <p className="text-gray-600">Última actualización: 24 de julio, 2025</p>
          </div>

          {/* Contenido */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  1. Aceptación de Términos
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  Al acceder y utilizar TeeReserve Golf, usted acepta estar sujeto a estos términos y condiciones de uso. 
                  Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestro servicio.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  2. Uso del Servicio
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <h4>2.1 Reservaciones</h4>
                <p>
                  TeeReserve Golf es una plataforma que facilita la reserva de tee times en campos de golf. 
                  Las reservaciones están sujetas a disponibilidad y a las políticas específicas de cada campo.
                </p>
                
                <h4>2.2 Responsabilidades del Usuario</h4>
                <ul>
                  <li>Proporcionar información precisa y actualizada</li>
                  <li>Respetar las políticas de cancelación</li>
                  <li>Llegar puntualmente a las reservaciones</li>
                  <li>Seguir las reglas y etiqueta del golf</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  3. Políticas de Reservación
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <h4>3.1 Confirmación</h4>
                <p>
                  Todas las reservaciones deben ser confirmadas por el campo de golf correspondiente. 
                  TeeReserve Golf actúa como intermediario en el proceso de reservación.
                </p>
                
                <h4>3.2 Cancelaciones</h4>
                <p>
                  Las políticas de cancelación varían según el campo de golf. 
                  Consulte las políticas específicas antes de realizar su reservación.
                </p>
                
                <h4>3.3 Modificaciones</h4>
                <p>
                  Las modificaciones a las reservaciones están sujetas a disponibilidad y 
                  pueden requerir contacto directo con el campo de golf.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. Limitación de Responsabilidad</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  TeeReserve Golf no se hace responsable por:
                </p>
                <ul>
                  <li>Condiciones climáticas que afecten el juego</li>
                  <li>Políticas específicas de los campos de golf</li>
                  <li>Calidad del servicio en los campos de golf</li>
                  <li>Lesiones o accidentes durante el juego</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5. Privacidad y Datos</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  Su privacidad es importante para nosotros. Consulte nuestra 
                  <Link href="/privacy" className="text-green-600 hover:text-green-700"> Política de Privacidad </Link>
                  para obtener información sobre cómo recopilamos, utilizamos y protegemos su información personal.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>6. Modificaciones</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  TeeReserve Golf se reserva el derecho de modificar estos términos en cualquier momento. 
                  Los cambios entrarán en vigor inmediatamente después de su publicación en el sitio web.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>7. Contacto</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  Si tiene preguntas sobre estos términos y condiciones, puede contactarnos:
                </p>
                <ul>
                  <li>Email: info@teereserve.golf</li>
                  <li>Teléfono: +52 (624) 123-4567</li>
                  <li>Dirección: Los Cabos, Baja California Sur</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Footer de la página */}
          <div className="mt-12 text-center">
            <Link href="/">
              <Button className="bg-green-600 hover:bg-green-700">
                Volver al Inicio
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

