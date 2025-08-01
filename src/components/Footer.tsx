'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Twitter, Instagram, Mail, Phone, Globe } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Image
                src="/logo.png"
                alt="TeeReserve Golf"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <span className="text-xl font-bold text-green-800 dark:text-green-400">
                TeeReserve Golf
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {t('footer.description')}
            </p>
          </div>

          {/* Plataforma */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('footer.platform')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/courses" 
                  className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  {t('footer.courses')}
                </Link>
              </li>
              <li>
                <Link 
                  href="/reservations" 
                  className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  {t('footer.reservations')}
                </Link>
              </li>
              <li>
                <Link 
                  href="/admin" 
                  className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  {t('footer.admin')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Soporte */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('footer.support')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/help" 
                  className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  {t('footer.helpCenter')}
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  {t('footer.contact')}
                </Link>
              </li>
              <li>
                <Link 
                  href="/api/status" 
                  className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  {t('footer.apiStatus')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto y Redes Sociales */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('footer.contactTitle')}
            </h3>
            
            {/* Información de contacto */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-green-600 dark:text-green-400" />
                <a 
                  href="mailto:info@teereserve.golf"
                  className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors text-sm"
                >
                  info@teereserve.golf
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                <a 
                  href="tel:+526241352986"
                  className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors text-sm"
                >
                  +52 624 135 2986
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-green-600 dark:text-green-400" />
                <a 
                  href="https://teereserve.golf"
                  className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors text-sm"
                >
                  teereserve.golf
                </a>
              </div>
            </div>

            {/* Redes Sociales */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                {t('footer.followUs')}
              </h4>
              <div className="flex space-x-4">
                <a
                  href="https://www.facebook.com/teereservegolf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="https://x.com/TeeReserveGolf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  aria-label="X (Twitter)"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href="https://www.instagram.com/teereservegolf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                © 2025 TeeReserve Golf. {t('footer.allRightsReserved')}
              </p>
              <div className="flex space-x-4 text-sm">
                <Link 
                  href="/privacy" 
                  className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  Aviso de Privacidad
                </Link>
                <span className="text-gray-400">•</span>
                <Link 
                  href="/terms" 
                  className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  Términos y Condiciones
                </Link>
                <span className="text-gray-400">•</span>
                <button 
                  onClick={() => {
                    localStorage.removeItem('teereserve-cookie-consent')
                    window.location.reload()
                  }}
                  className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  Configurar Cookies
                </button>
              </div>
            </div>
            <p className="text-green-600 dark:text-green-400 text-sm font-medium mt-2 md:mt-0">
              {t('footer.premiumExperience')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

