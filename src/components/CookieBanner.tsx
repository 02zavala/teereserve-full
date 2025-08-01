'use client'

import { useState, useEffect } from 'react'
import { X, Cookie, Shield, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

interface CookiePreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  functional: boolean
}

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Siempre true, no se puede desactivar
    analytics: false,
    marketing: false,
    functional: false
  })

  useEffect(() => {
    // Verificar si el usuario ya ha dado su consentimiento
    const consent = localStorage.getItem('teereserve-cookie-consent')
    if (!consent) {
      setShowBanner(true)
    }
  }, [])

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
      timestamp: new Date().toISOString()
    }
    localStorage.setItem('teereserve-cookie-consent', JSON.stringify(allAccepted))
    setShowBanner(false)
    
    // Aquí puedes activar las cookies/scripts correspondientes
    enableCookies(allAccepted)
  }

  const handleAcceptSelected = () => {
    const selectedPreferences = {
      ...preferences,
      timestamp: new Date().toISOString()
    }
    localStorage.setItem('teereserve-cookie-consent', JSON.stringify(selectedPreferences))
    setShowBanner(false)
    setShowSettings(false)
    
    // Activar solo las cookies seleccionadas
    enableCookies(selectedPreferences)
  }

  const handleRejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
      timestamp: new Date().toISOString()
    }
    localStorage.setItem('teereserve-cookie-consent', JSON.stringify(onlyNecessary))
    setShowBanner(false)
    
    // Solo cookies necesarias
    enableCookies(onlyNecessary)
  }

  const enableCookies = (cookiePreferences: any) => {
    // Aquí implementarías la lógica para activar/desactivar cookies
    console.log('Cookies habilitadas:', cookiePreferences)
    
    // Ejemplo: Google Analytics
    if (cookiePreferences.analytics && typeof window !== 'undefined') {
      // window.gtag('consent', 'update', { analytics_storage: 'granted' })
    }
    
    // Ejemplo: Marketing cookies
    if (cookiePreferences.marketing && typeof window !== 'undefined') {
      // Activar pixels de Facebook, Google Ads, etc.
    }
  }

  if (!showBanner) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6">
        <Card className="mx-auto max-w-4xl border-golf-green-600 bg-white dark:bg-gray-900 shadow-2xl">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <Cookie className="h-8 w-8 text-golf-green-600" />
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-golf-green-600 mb-2">
                    🍪 Uso de Cookies en TeeReserve Golf
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    Utilizamos cookies y tecnologías similares para mejorar tu experiencia de navegación, 
                    personalizar contenido, analizar el tráfico del sitio y entender de dónde vienen nuestros visitantes. 
                    Al hacer clic en "Aceptar todas", consientes el uso de TODAS las cookies. 
                    También puedes gestionar tus preferencias individualmente.
                  </p>
                </div>

                {showSettings && (
                  <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 className="font-semibold text-golf-green-600 flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Configuración de Cookies
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Cookies Necesarias</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Esenciales para el funcionamiento del sitio
                          </p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={true} 
                          disabled 
                          className="rounded border-gray-300"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Cookies de Análisis</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Nos ayudan a entender cómo usas el sitio
                          </p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={preferences.analytics}
                          onChange={(e) => setPreferences({...preferences, analytics: e.target.checked})}
                          className="rounded border-gray-300"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Cookies de Marketing</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Para mostrarte anuncios relevantes
                          </p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={preferences.marketing}
                          onChange={(e) => setPreferences({...preferences, marketing: e.target.checked})}
                          className="rounded border-gray-300"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Cookies Funcionales</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Mejoran la funcionalidad del sitio
                          </p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={preferences.functional}
                          onChange={(e) => setPreferences({...preferences, functional: e.target.checked})}
                          className="rounded border-gray-300"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button 
                    onClick={handleAcceptAll}
                    className="bg-golf-green-600 hover:bg-golf-green-700 text-white font-semibold px-6"
                  >
                    Aceptar Todas
                  </Button>
                  
                  {showSettings ? (
                    <Button 
                      onClick={handleAcceptSelected}
                      variant="outline"
                      className="border-golf-green-600 text-golf-green-600 hover:bg-golf-green-50"
                    >
                      Guardar Selección
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => setShowSettings(true)}
                      variant="outline"
                      className="border-golf-green-600 text-golf-green-600 hover:bg-golf-green-50"
                    >
                      Configurar
                    </Button>
                  )}
                  
                  <Button 
                    onClick={handleRejectAll}
                    variant="ghost"
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Solo Necesarias
                  </Button>
                  
                  <Link 
                    href="/privacy" 
                    className="text-sm text-golf-green-600 hover:underline self-center"
                  >
                    Ver Aviso de Privacidad
                  </Link>
                </div>
              </div>
              
              <button
                onClick={() => setShowBanner(false)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

