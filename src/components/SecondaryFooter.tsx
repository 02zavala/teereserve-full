'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Clock, Star } from 'lucide-react'
import { ProtectedDashboardLink } from './ProtectedDashboardLink'

export function SecondaryFooter() {
  return (
    <footer className="bg-gradient-to-br from-green-800 to-green-900 text-white mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12">
                <Image
                  src="/logo-final.png"
                  alt="TeeReserve Golf"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  TeeReserve
                </h3>
                <p className="text-green-200 font-semibold">
                  Golf
                </p>
              </div>
            </div>
            <p className="text-green-100 text-sm leading-relaxed mb-6">
              La plataforma premium de reservas de golf en México. Descubre los mejores campos y vive experiencias únicas.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-10 h-10 bg-green-700 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-green-700 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-green-700 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Enlaces Rápidos</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/courses" 
                  className="text-green-100 hover:text-white transition-colors flex items-center group"
                >
                  <span className="w-1 h-1 bg-green-400 rounded-full mr-3 group-hover:bg-white transition-colors"></span>
                  Campos de Golf
                </Link>
              </li>
              <li>
                <Link 
                  href="/bookings" 
                  className="text-green-100 hover:text-white transition-colors flex items-center group"
                >
                  <span className="w-1 h-1 bg-green-400 rounded-full mr-3 group-hover:bg-white transition-colors"></span>
                  Reservar
                </Link>
              </li>
              <li>
                <Link 
                  href="/recommendations" 
                  className="text-green-100 hover:text-white transition-colors flex items-center group"
                >
                  <span className="w-1 h-1 bg-green-400 rounded-full mr-3 group-hover:bg-white transition-colors"></span>
                  Recomendaciones IA
                </Link>
              </li>
              <li>
                <ProtectedDashboardLink />
              </li>
            </ul>
          </div>

          {/* Información de contacto */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Contacto</h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-green-100 text-sm">Reservas</p>
                  <p className="text-white font-semibold">+52 (624) 123-4567</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-green-100 text-sm">Email</p>
                  <p className="text-white font-semibold">info@teereserve.golf</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-green-100 text-sm">Oficinas</p>
                  <p className="text-white font-semibold">Los Cabos, BCS</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Horarios y estadísticas */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Nuestro Servicio</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-green-100 text-sm">Atención</p>
                  <p className="text-white font-semibold">24/7 en línea</p>
                  <p className="text-green-200 text-xs">Lun-Dom 6:00-22:00</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Star className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-green-100 text-sm">Calificación</p>
                  <p className="text-white font-semibold">4.8/5 ⭐</p>
                  <p className="text-green-200 text-xs">+2,500 reseñas</p>
                </div>
              </div>
              <div className="bg-green-700/50 rounded-lg p-4 mt-6">
                <h5 className="text-white font-semibold mb-2">¿Necesitas ayuda?</h5>
                <Link 
                  href="/help"
                  className="text-green-200 hover:text-white text-sm transition-colors"
                >
                  Centro de Ayuda →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-green-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="text-green-200 text-sm">
              © 2024 TeeReserve Golf. Todos los derechos reservados.
            </div>
            <div className="flex flex-wrap gap-6">
              <Link 
                href="/privacy" 
                className="text-green-200 hover:text-white text-sm transition-colors"
              >
                Privacidad
              </Link>
              <Link 
                href="#" 
                className="text-green-200 hover:text-white text-sm transition-colors"
              >
                Términos
              </Link>
              <Link 
                href="#" 
                className="text-green-200 hover:text-white text-sm transition-colors"
              >
                Cookies
              </Link>
              <span className="text-green-200 text-sm">
                Hecho con ❤️ en México
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
