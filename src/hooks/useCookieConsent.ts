'use client'

import { useState, useEffect } from 'react'

export interface CookiePreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  functional: boolean
  timestamp?: string
}

const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  functional: false
}

export function useCookieConsent() {
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES)
  const [hasConsent, setHasConsent] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar si hay consentimiento guardado
    const savedConsent = localStorage.getItem('teereserve-cookie-consent')
    
    if (savedConsent) {
      try {
        const parsed = JSON.parse(savedConsent)
        setPreferences(parsed)
        setHasConsent(true)
      } catch (error) {
        console.error('Error parsing cookie consent:', error)
        setHasConsent(false)
      }
    } else {
      setHasConsent(false)
    }
    
    setIsLoading(false)
  }, [])

  const savePreferences = (newPreferences: CookiePreferences) => {
    const preferencesWithTimestamp = {
      ...newPreferences,
      timestamp: new Date().toISOString()
    }
    
    localStorage.setItem('teereserve-cookie-consent', JSON.stringify(preferencesWithTimestamp))
    setPreferences(preferencesWithTimestamp)
    setHasConsent(true)
    
    // Activar/desactivar cookies según las preferencias
    enableCookies(preferencesWithTimestamp)
  }

  const acceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true
    }
    savePreferences(allAccepted)
  }

  const rejectAll = () => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false
    }
    savePreferences(onlyNecessary)
  }

  const updatePreference = (key: keyof CookiePreferences, value: boolean) => {
    if (key === 'necessary') return // No se puede desactivar las necesarias
    
    const newPreferences = {
      ...preferences,
      [key]: value
    }
    setPreferences(newPreferences)
  }

  const resetConsent = () => {
    localStorage.removeItem('teereserve-cookie-consent')
    setPreferences(DEFAULT_PREFERENCES)
    setHasConsent(false)
  }

  const enableCookies = (cookiePreferences: CookiePreferences) => {
    // Google Analytics
    if (cookiePreferences.analytics && typeof window !== 'undefined') {
      // Activar Google Analytics
      if (window.gtag) {
        window.gtag('consent', 'update', {
          analytics_storage: 'granted'
        })
      }
      
      // También puedes activar otros servicios de análisis aquí
      console.log('Analytics cookies enabled')
    }

    // Marketing cookies
    if (cookiePreferences.marketing && typeof window !== 'undefined') {
      // Activar pixels de Facebook, Google Ads, etc.
      if (window.gtag) {
        window.gtag('consent', 'update', {
          ad_storage: 'granted',
          ad_user_data: 'granted',
          ad_personalization: 'granted'
        })
      }
      
      console.log('Marketing cookies enabled')
    }

    // Functional cookies
    if (cookiePreferences.functional && typeof window !== 'undefined') {
      // Activar cookies funcionales como preferencias de tema, idioma, etc.
      console.log('Functional cookies enabled')
    }

    // Si se rechazan, asegurarse de que estén desactivadas
    if (!cookiePreferences.analytics && typeof window !== 'undefined') {
      if (window.gtag) {
        window.gtag('consent', 'update', {
          analytics_storage: 'denied'
        })
      }
    }

    if (!cookiePreferences.marketing && typeof window !== 'undefined') {
      if (window.gtag) {
        window.gtag('consent', 'update', {
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied'
        })
      }
    }
  }

  return {
    preferences,
    hasConsent,
    isLoading,
    savePreferences,
    acceptAll,
    rejectAll,
    updatePreference,
    resetConsent
  }
}

// Tipos para window.gtag
declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}

