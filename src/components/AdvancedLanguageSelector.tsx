'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { ChevronDown, Globe, Check } from 'lucide-react'

export default function AdvancedLanguageSelector() {
  const { language, setLanguage, getSupportedLanguages, currency } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const supportedLanguages = getSupportedLanguages()
  const currentLanguage = supportedLanguages.find(lang => lang.code === language)

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode as any)
    setIsOpen(false)
    
    // Animación suave al cambiar idioma
    document.body.style.opacity = '0.8'
    setTimeout(() => {
      document.body.style.opacity = '1'
    }, 150)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 min-w-[120px] group"
        aria-label="Seleccionar idioma"
      >
        <Globe className="h-4 w-4 text-gray-600 group-hover:text-blue-600 transition-colors" />
        <span className="text-sm font-medium text-gray-700">
          {currentLanguage?.flag} {currentLanguage?.name}
        </span>
        <ChevronDown 
          className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
          {/* Header del dropdown */}
          <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-600" />
              Seleccionar Idioma
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              Moneda actual: {currency}
            </p>
          </div>

          {/* Lista de idiomas */}
          <div className="py-2">
            {supportedLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 flex items-center justify-between group ${
                  language === lang.code ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{lang.flag}</span>
                  <div>
                    <div className={`text-sm font-medium ${
                      language === lang.code ? 'text-blue-700' : 'text-gray-700'
                    }`}>
                      {lang.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {lang.currency}
                    </div>
                  </div>
                </div>
                
                {language === lang.code && (
                  <Check className="h-4 w-4 text-blue-600" />
                )}
              </button>
            ))}
          </div>

          {/* Footer del dropdown */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              🌍 Soporte global para TeeReserve Golf
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// Componente compacto para móvil
export function CompactLanguageSelector() {
  const { language, setLanguage, getSupportedLanguages } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  
  const supportedLanguages = getSupportedLanguages()
  const currentLanguage = supportedLanguages.find(lang => lang.code === language)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors"
        aria-label="Cambiar idioma"
      >
        <span className="text-lg">{currentLanguage?.flag}</span>
        <ChevronDown className={`h-3 w-3 text-gray-500 transition-transform ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[140px]">
          {supportedLanguages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code)
                setIsOpen(false)
              }}
              className={`w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm ${
                language === lang.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
              }`}
            >
              <span>{lang.flag}</span>
              <span className="font-medium">{lang.name}</span>
              {language === lang.code && (
                <Check className="h-3 w-3 ml-auto" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

