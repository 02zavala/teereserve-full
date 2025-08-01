'use client'

import { ArrowLeft, Shield, Mail, Phone, MapPin, Calendar, Clock } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-golf-green-50 to-golf-beige-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-golf-green-600 text-white py-8">
        <div className="container mx-auto px-4">
          <Link href="/" className="inline-flex items-center gap-2 text-white hover:text-golf-beige-200 mb-4">
            <ArrowLeft className="h-5 w-5" />
            Volver al inicio
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8" />
            <h1 className="text-4xl md:text-5xl font-bold">
              Aviso de Privacidad
            </h1>
          </div>
          <p className="text-xl text-golf-beige-100 max-w-3xl">
            En TeeReserve Golf respetamos y protegemos tu privacidad. Este aviso describe cómo recopilamos, 
            usamos y protegemos tu información personal conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Información del Responsable */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-golf-green-600 flex items-center gap-2">
                <Shield className="h-6 w-6" />
                Responsable del Tratamiento de Datos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-golf-green-600 mb-2">TeeReserve Golf</h3>
                  <div className="space-y-2 text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-golf-green-600" />
                      <span>Los Cabos, Baja California Sur, México</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-golf-green-600" />
                      <span>privacidad@teereserve.golf</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-golf-green-600" />
                      <span>+52 624 135 29 86</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-golf-green-600 mb-2">Datos de Contacto</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Para ejercer tus derechos ARCO (Acceso, Rectificación, Cancelación y Oposición) 
                    o cualquier consulta sobre este aviso de privacidad, puedes contactarnos a través 
                    de los medios indicados.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Datos que Recopilamos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-golf-green-600">
                Datos Personales que Recopilamos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-golf-green-600 mb-3">Datos de Identificación</h3>
                  <ul className="space-y-1 text-gray-700 dark:text-gray-300 text-sm">
                    <li>• Nombre completo</li>
                    <li>• Correo electrónico</li>
                    <li>• Número de teléfono</li>
                    <li>• Fecha de nacimiento</li>
                    <li>• Fotografía de perfil (opcional)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-golf-green-600 mb-3">Datos de Reservas</h3>
                  <ul className="space-y-1 text-gray-700 dark:text-gray-300 text-sm">
                    <li>• Historial de reservas</li>
                    <li>• Preferencias de campos</li>
                    <li>• Horarios preferidos</li>
                    <li>• Información de pago</li>
                    <li>• Comentarios y reseñas</li>
                  </ul>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-golf-green-600 mb-3">Datos Técnicos</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Dirección IP, tipo de navegador, sistema operativo, páginas visitadas, 
                  tiempo de navegación, cookies y tecnologías similares para mejorar tu experiencia.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Finalidades */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-golf-green-600">
                Finalidades del Tratamiento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-golf-green-600 mb-3">Finalidades Primarias</h3>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                    <li>• Gestionar reservas de tee times</li>
                    <li>• Procesar pagos y facturación</li>
                    <li>• Brindar atención al cliente</li>
                    <li>• Cumplir obligaciones contractuales</li>
                    <li>• Enviar confirmaciones y recordatorios</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-golf-green-600 mb-3">Finalidades Secundarias</h3>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                    <li>• Marketing y promociones personalizadas</li>
                    <li>• Análisis de comportamiento y preferencias</li>
                    <li>• Mejora de servicios y experiencia</li>
                    <li>• Comunicación de ofertas especiales</li>
                    <li>• Estudios de mercado y estadísticas</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-golf-green-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Nota:</strong> Para las finalidades secundarias, siempre solicitaremos tu consentimiento expreso. 
                  Puedes negarte a estas finalidades sin que ello afecte los servicios principales.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Derechos ARCO */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-golf-green-600">
                Tus Derechos (ARCO)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-golf-green-600">Acceso</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Conocer qué datos personales tenemos de ti y para qué los usamos.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-golf-green-600">Rectificación</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Solicitar la corrección de datos inexactos o incompletos.
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-golf-green-600">Cancelación</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Solicitar la eliminación de tus datos cuando no sean necesarios.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-golf-green-600">Oposición</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Oponerte al tratamiento de tus datos para finalidades específicas.
                    </p>
                  </div>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="bg-golf-beige-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="font-semibold text-golf-green-600 mb-2">¿Cómo ejercer tus derechos?</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  Envía tu solicitud a <strong>privacidad@teereserve.golf</strong> incluyendo:
                </p>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>• Nombre completo y correo electrónico registrado</li>
                  <li>• Descripción clara del derecho que deseas ejercer</li>
                  <li>• Documentos que acrediten tu identidad</li>
                </ul>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-3">
                  <strong>Tiempo de respuesta:</strong> Máximo 20 días hábiles.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Transferencias */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-golf-green-600">
                Transferencias de Datos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Podemos compartir tus datos personales con terceros únicamente en los siguientes casos:
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-golf-green-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-golf-green-600">Campos de Golf Afiliados</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Para procesar tus reservas y brindar el servicio solicitado.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-golf-green-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-golf-green-600">Procesadores de Pago</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Stripe y otros proveedores seguros para procesar transacciones.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-golf-green-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-golf-green-600">Proveedores de Servicios</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Servicios de hosting, análisis y comunicación que nos ayudan a operar.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cookies */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-golf-green-600">
                Uso de Cookies y Tecnologías Similares
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Utilizamos cookies para mejorar tu experiencia de navegación. Puedes gestionar tus preferencias 
                de cookies en cualquier momento.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-3 bg-golf-green-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-semibold text-golf-green-600 text-sm">Necesarias</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Esenciales para el funcionamiento del sitio
                  </p>
                </div>
                <div className="p-3 bg-golf-green-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-semibold text-golf-green-600 text-sm">Analíticas</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Nos ayudan a entender el uso del sitio
                  </p>
                </div>
                <div className="p-3 bg-golf-green-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-semibold text-golf-green-600 text-sm">Marketing</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Para personalizar anuncios y ofertas
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seguridad */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-golf-green-600">
                Medidas de Seguridad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Implementamos medidas técnicas, físicas y administrativas para proteger tus datos personales:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>• Cifrado SSL/TLS en todas las comunicaciones</li>
                  <li>• Servidores seguros con acceso restringido</li>
                  <li>• Monitoreo continuo de seguridad</li>
                </ul>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>• Capacitación del personal en protección de datos</li>
                  <li>• Auditorías regulares de seguridad</li>
                  <li>• Respaldo y recuperación de datos</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Contacto y Actualizaciones */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-golf-green-600">
                Contacto y Actualizaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-golf-green-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-golf-green-600">Última actualización</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Este aviso fue actualizado por última vez el {new Date().toLocaleDateString('es-MX', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-golf-green-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-golf-green-600">¿Tienes preguntas?</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Si tienes dudas sobre este aviso de privacidad o el tratamiento de tus datos, 
                    contáctanos en <strong>privacidad@teereserve.golf</strong>
                  </p>
                </div>
              </div>
              
              <div className="p-4 bg-golf-green-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Nota importante:</strong> Nos reservamos el derecho de modificar este aviso de privacidad. 
                  Las modificaciones serán notificadas a través de nuestro sitio web y/o por correo electrónico.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Botón de regreso */}
          <div className="text-center pt-8">
            <Link href="/">
              <Button className="bg-golf-green-600 hover:bg-golf-green-700 text-white px-8 py-3">
                Volver al Inicio
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

