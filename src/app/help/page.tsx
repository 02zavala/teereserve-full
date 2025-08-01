"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Phone, Mail, MessageCircle, Clock, MapPin } from "lucide-react";

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-green-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="TeeReserve Golf"
                width={32}
                height={32}
                className="rounded-full"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-green-600">TeeReserve</h1>
              <p className="text-sm text-green-700 font-semibold">Golf</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-green-700 hover:text-green-800 transition-colors font-medium">
              Inicio
            </Link>
            <Link href="/courses" className="text-green-700 hover:text-green-800 transition-colors font-medium">
              Campos
            </Link>
            <Link href="/help" className="text-green-800 font-semibold">
              Ayuda
            </Link>
            <button className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-md transition-all duration-300">
              Registrarse
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 relative overflow-hidden bg-gradient-to-r from-green-600 to-green-700">
        <div className="container mx-auto text-center relative z-10">
          <Link href="/" className="inline-flex items-center text-white/90 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver al inicio
          </Link>
          
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-white mb-8 leading-tight">
            Centro de
            <br />
            <span className="text-green-100 drop-shadow-lg">Ayuda</span>
          </h1>
          <p className="text-2xl md:text-3xl lg:text-4xl text-white/95 mb-10 max-w-4xl mx-auto leading-relaxed font-medium">
            Estamos aquí para ayudarte con cualquier pregunta sobre reservas de golf en los mejores campos de México
          </p>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* WhatsApp */}
            <div className="bg-white rounded-lg p-8 shadow-lg border border-green-200 hover:shadow-xl transition-all duration-300 hover:border-green-300">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <MessageCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-green-600 mb-6">WhatsApp</h3>
              <p className="text-xl md:text-2xl text-green-700 mb-8 leading-relaxed">
                Chatea con nosotros directamente por WhatsApp para soporte inmediato sobre tus reservas de golf
              </p>
              <a
                href="https://wa.me/5262413529866?text=Hola%20TeeReserve%20Golf,%20tengo%20una%20pregunta%20sobre%20mi%20reserva."
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-4 rounded-md transition-all duration-300 inline-block text-xl"
              >
                Abrir WhatsApp
              </a>
            </div>

            {/* Teléfono */}
            <div className="bg-white rounded-lg p-8 shadow-lg border border-green-200 hover:shadow-xl transition-all duration-300 hover:border-green-300">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <Phone className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-green-600 mb-6">Teléfono</h3>
              <p className="text-xl md:text-2xl text-green-700 mb-8 leading-relaxed">
                Llámanos para asistencia personalizada con tus reservas en campos de golf premium
              </p>
              <a
                href="tel:+5262413529866"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-4 rounded-md transition-all duration-300 inline-block shadow-lg hover:shadow-xl text-xl"
              >
                +52 624 135 29 86
              </a>
            </div>

            {/* Email */}
            <div className="bg-white rounded-lg p-8 shadow-lg border border-green-200 hover:shadow-xl transition-all duration-300 hover:border-green-300">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-green-600 mb-6">Email</h3>
              <p className="text-xl md:text-2xl text-green-700 mb-8 leading-relaxed">
                Envíanos un email y te responderemos en menos de 24 horas con toda la información que necesites
              </p>
              <a
                href="mailto:info@teereserve.golf"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-md transition-all duration-300 inline-block shadow-lg hover:shadow-xl text-xl"
              >
                info@teereserve.golf
              </a>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-lg p-8 shadow-lg border border-green-200">
            <h2 className="text-4xl md:text-5xl font-bold text-green-600 mb-12 text-center">Preguntas Frecuentes</h2>
            
            <div className="space-y-8">
              <div className="border-b border-green-200 pb-8">
                <h3 className="text-2xl md:text-3xl font-semibold text-green-600 mb-4">¿Cómo puedo hacer una reserva?</h3>
                <p className="text-xl md:text-2xl text-green-700 leading-relaxed">
                  Puedes hacer una reserva navegando a la sección de "Campos", seleccionando tu campo favorito de golf y haciendo clic en "Reservar". Te guiaremos paso a paso en el proceso de reserva de tu tee time perfecto.
                </p>
              </div>

              <div className="border-b border-green-200 pb-8">
                <h3 className="text-2xl md:text-3xl font-semibold text-green-600 mb-4">¿Puedo cancelar mi reserva?</h3>
                <p className="text-xl md:text-2xl text-green-700 leading-relaxed">
                  Sí, puedes cancelar tu reserva hasta 24 horas antes de tu tee time sin costo adicional. Para cancelaciones de último momento, contáctanos directamente y te ayudaremos con las opciones disponibles.
                </p>
              </div>

              <div className="border-b border-green-200 pb-8">
                <h3 className="text-2xl md:text-3xl font-semibold text-green-600 mb-4">¿Qué métodos de pago aceptan?</h3>
                <p className="text-xl md:text-2xl text-green-700 leading-relaxed">
                  Aceptamos todas las tarjetas de crédito y débito principales (Visa, MasterCard, American Express) a través de nuestra plataforma segura de pagos con tecnología Stripe.
                </p>
              </div>

              <div className="border-b border-green-200 pb-8">
                <h3 className="text-2xl md:text-3xl font-semibold text-green-600 mb-4">¿Los precios incluyen todo?</h3>
                <p className="text-golf-gold-700">
                  Los precios mostrados incluyen el green fee básico. Algunos campos pueden tener costos adicionales por carrito de golf, caddie o servicios premium que se especifican claramente en cada campo.
                </p>
              </div>

              <div className="border-b border-golf-gold-200 pb-6">
                <h3 className="text-xl font-semibold text-golf-gold-600 mb-3">¿Puedo cambiar mi horario de reserva?</h3>
                <p className="text-golf-gold-700">
                  Sí, puedes modificar tu reserva sujeto a disponibilidad. Te recomendamos contactarnos lo antes posible para hacer cambios en tu tee time y asegurar tu horario preferido.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-golf-gold-600 mb-3">¿Qué campos de golf están disponibles?</h3>
                <p className="text-golf-gold-700">
                  Trabajamos con los mejores campos de golf de México, incluyendo Cabo del Sol, Palmilla Golf Club, Diamante Golf, TPC Danzante Bay, y muchos más campos premium en destinos como Los Cabos, La Paz y Loreto.
                </p>
              </div>
            </div>
          </div>

          {/* Business Hours */}
          <div className="mt-16 golf-gradient text-white rounded-lg p-8 shadow-xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Horarios de Atención</h2>
              <p className="text-golf-gold-200 text-lg">Estamos disponibles para ayudarte con tus reservas de golf</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-golf-bronze-400 mr-4" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Lunes a Viernes</h3>
                  <p className="text-golf-gold-200">8:00 AM - 8:00 PM</p>
                </div>
              </div>

              <div className="flex items-center">
                <Clock className="w-8 h-8 text-golf-bronze-400 mr-4" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Sábados y Domingos</h3>
                  <p className="text-golf-gold-200">9:00 AM - 6:00 PM</p>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-golf-gold-200">
                <MapPin className="w-5 h-5 inline mr-2" />
                Zona horaria: Ciudad de México (GMT-6)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-golf-gold-100 border-t border-golf-gold-300 py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-golf-gold-600 rounded-full flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="TeeReserve Golf"
                width={32}
                height={32}
                className="rounded-full"
              />
            </div>
            <span className="font-bold text-golf-gold-600 text-lg">
              TeeReserve Golf
            </span>
          </div>
          <p className="text-golf-gold-700 mb-4">
            La plataforma líder de reservas de golf en México
          </p>
          <div className="flex justify-center space-x-6 text-sm text-golf-gold-600">
            <Link href="/" className="hover:text-golf-bronze-600 transition-colors">
              Inicio
            </Link>
            <Link href="/courses" className="hover:text-golf-bronze-600 transition-colors">
              Campos
            </Link>
            <Link href="/help" className="hover:text-golf-bronze-600 transition-colors">
              Ayuda
            </Link>
            <Link href="/recommendations" className="hover:text-golf-bronze-600 transition-colors">
              Recomendaciones IA
            </Link>
          </div>
          <div className="mt-6 pt-6 border-t border-golf-gold-400">
            <p className="text-golf-gold-700 font-medium">
              © 2025 TeeReserve Golf. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

