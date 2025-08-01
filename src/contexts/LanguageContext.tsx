'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Language = 'es' | 'en' | 'fr' | 'de' | 'pt' | 'it'

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
  currency: string
  formatPrice: (price: number) => string
  detectBrowserLanguage: () => Language
  getSupportedLanguages: () => Array<{code: Language, name: string, flag: string, currency: string}>
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Configuración de monedas por idioma/región
const currencyConfig = {
  es: { currency: 'USD', symbol: '$', locale: 'es-MX' },
  en: { currency: 'USD', symbol: '$', locale: 'en-US' },
  fr: { currency: 'EUR', symbol: '€', locale: 'fr-FR' },
  de: { currency: 'EUR', symbol: '€', locale: 'de-DE' },
  pt: { currency: 'USD', symbol: '$', locale: 'pt-BR' },
  it: { currency: 'EUR', symbol: '€', locale: 'it-IT' }
}

const supportedLanguages = [
  { code: 'es' as Language, name: 'Español', flag: '🇪🇸', currency: 'USD' },
  { code: 'en' as Language, name: 'English', flag: '🇺🇸', currency: 'USD' },
  { code: 'fr' as Language, name: 'Français', flag: '🇫🇷', currency: 'EUR' },
  { code: 'de' as Language, name: 'Deutsch', flag: '🇩🇪', currency: 'EUR' },
  { code: 'pt' as Language, name: 'Português', flag: '🇧🇷', currency: 'USD' },
  { code: 'it' as Language, name: 'Italiano', flag: '🇮🇹', currency: 'EUR' }
]

const translations = {
  es: {
    // Header
    'header.courses': 'Campos',
    'header.signIn': 'Iniciar Sesión',
    'header.signUp': 'Registrarse',
    'header.recommendations': 'Recomendaciones IA',
    
    // Home page
    'home.title': 'Encuentra Tu Tee Time Perfecto',
    'home.subtitle': 'Conéctate con los campos de golf más icónicos de México y disfruta el golf como debe ser:',
    'home.description': 'con elegancia, exclusividad y sin complicaciones',
    'home.exploreCourses': '🏌️ Explorar Campos',
    'home.signUp': '👤 Registrarse',
    'home.featuredCourses': 'Campos Destacados',
    'home.featuredDescription': 'Descubre los campos de golf más icónicos de México',
    'home.viewDetails': 'Ver Detalles',
    'home.from': 'Desde',
    'home.perPerson': 'por persona',
    'home.holes': 'hoyos',
    'home.cta.title': '¿No encuentras tu campo ideal?',
    'home.cta.description': 'Contáctanos y te ayudaremos a encontrar el campo perfecto para tu próxima ronda',
    'home.cta.contact': 'Contactar Soporte',
    'home.cta.register': 'Registrarse Gratis',
    
    // Footer
    'footer.description': 'La plataforma líder de reservas de golf en México',
    'footer.platform': 'Plataforma',
    'footer.courses': 'Campos',
    'footer.reservations': 'Reservas',
    'footer.admin': 'Admin',
    'footer.support': 'Soporte',
    'footer.helpCenter': 'Centro de Ayuda',
    'footer.contact': 'Contacto',
    'footer.apiStatus': 'Status API',
    'footer.contactTitle': 'Contacto',
    'footer.followUs': 'Síguenos',
    'footer.allRightsReserved': 'Todos los derechos reservados.',
    'footer.premiumExperience': 'Experiencia de golf premium en México',
    
    // Course detail
    'course.loading': 'Cargando información del campo...',
    'course.notFound': 'Campo no encontrado',
    'course.backToCourses': '← Volver a Campos',
    'course.rating': 'Calificación',
    'course.holes': 'hoyos',
    'course.gallery': 'Galería',
    'course.description': 'Descripción',
    'course.pricing': 'Precios',
    'course.weekday': 'Entre semana',
    'course.weekend': 'Fin de semana',
    'course.bookNow': 'Reservar Ahora',
    
    // Common
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.currency': 'USD',
    
    // Courses page
    'courses.title': 'Campos de Golf Premium',
    'courses.subtitle': 'Descubre los mejores campos de golf en México',
    'courses.searchPlaceholder': 'Buscar campos por nombre o ubicación...',
    'courses.viewDetails': 'Ver Detalles',
    'courses.from': 'Desde',
    'courses.perPerson': 'por persona',
    'courses.holes': 'hoyos',
    'courses.rating': 'Calificación',
    'courses.reviews': 'reseñas',
    'courses.signUpFree': 'Registrarse Gratis',
  },
  en: {
    // Header
    'header.courses': 'Courses',
    'header.signIn': 'Sign In',
    'header.signUp': 'Sign Up',
    'header.recommendations': 'AI Recommendations',
    
    // Home page
    'home.title': 'Find Your Perfect Tee Time',
    'home.subtitle': 'Connect with Mexico\'s most iconic golf courses and enjoy golf as it should be:',
    'home.description': 'with elegance, exclusivity and without complications',
    'home.exploreCourses': '🏌️ Explore Courses',
    'home.signUp': '👤 Sign Up',
    'home.featuredCourses': 'Featured Courses',
    'home.featuredDescription': 'Discover Mexico\'s most iconic golf courses',
    'home.viewDetails': 'View Details',
    'home.from': 'From',
    'home.perPerson': 'per person',
    'home.holes': 'holes',
    'home.cta.title': 'Can\'t find your ideal course?',
    'home.cta.description': 'Contact us and we\'ll help you find the perfect course for your next round',
    'home.cta.contact': 'Contact Support',
    'home.cta.register': 'Sign Up Free',
    
    // Footer
    'footer.description': 'The leading golf reservation platform in Mexico',
    'footer.platform': 'Platform',
    'footer.courses': 'Courses',
    'footer.reservations': 'Reservations',
    'footer.admin': 'Admin',
    'footer.support': 'Support',
    'footer.helpCenter': 'Help Center',
    'footer.contact': 'Contact',
    'footer.apiStatus': 'API Status',
    'footer.contactTitle': 'Contact',
    'footer.followUs': 'Follow Us',
    'footer.allRightsReserved': 'All rights reserved.',
    'footer.premiumExperience': 'Premium golf experience in Mexico',
    
    // Course detail
    'course.loading': 'Loading course information...',
    'course.notFound': 'Course not found',
    'course.backToCourses': '← Back to Courses',
    'course.rating': 'Rating',
    'course.holes': 'holes',
    'course.gallery': 'Gallery',
    'course.description': 'Description',
    'course.pricing': 'Pricing',
    'course.weekday': 'Weekday',
    'course.weekend': 'Weekend',
    'course.bookNow': 'Book Now',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.currency': 'USD',
    
    // Courses page
    'courses.title': 'Premium Golf Courses',
    'courses.subtitle': 'Discover the best golf courses in Mexico',
    'courses.searchPlaceholder': 'Search courses by name or location...',
    'courses.viewDetails': 'View Details',
    'courses.from': 'From',
    'courses.perPerson': 'per person',
    'courses.holes': 'holes',
    'courses.rating': 'Rating',
    'courses.reviews': 'reviews',
    'courses.signUpFree': 'Sign Up Free',
  },
  fr: {
    // Header
    'header.courses': 'Parcours',
    'header.signIn': 'Se Connecter',
    'header.signUp': 'S\'inscrire',
    'header.recommendations': 'Recommandations IA',
    
    // Home page
    'home.title': 'Trouvez Votre Tee Time Parfait',
    'home.subtitle': 'Connectez-vous aux parcours de golf les plus emblématiques du Mexique et profitez du golf comme il se doit :',
    'home.description': 'avec élégance, exclusivité et sans complications',
    'home.exploreCourses': '🏌️ Explorer les Parcours',
    'home.signUp': '👤 S\'inscrire',
    'home.featuredCourses': 'Parcours en Vedette',
    'home.featuredDescription': 'Découvrez les parcours de golf les plus emblématiques du Mexique',
    'home.viewDetails': 'Voir les Détails',
    'home.from': 'À partir de',
    'home.perPerson': 'par personne',
    'home.holes': 'trous',
    'home.cta.title': 'Vous ne trouvez pas votre parcours idéal ?',
    'home.cta.description': 'Contactez-nous et nous vous aiderons à trouver le parcours parfait pour votre prochaine partie',
    'home.cta.contact': 'Contacter le Support',
    'home.cta.register': 'S\'inscrire Gratuitement',
    
    // Footer
    'footer.description': 'La plateforme leader de réservations de golf au Mexique',
    'footer.platform': 'Plateforme',
    'footer.courses': 'Parcours',
    'footer.reservations': 'Réservations',
    'footer.admin': 'Admin',
    'footer.support': 'Support',
    'footer.helpCenter': 'Centre d\'Aide',
    'footer.contact': 'Contact',
    'footer.apiStatus': 'Statut API',
    'footer.contactTitle': 'Contact',
    'footer.followUs': 'Suivez-nous',
    'footer.allRightsReserved': 'Tous droits réservés.',
    'footer.premiumExperience': 'Expérience de golf premium au Mexique',
    
    // Course detail
    'course.loading': 'Chargement des informations du parcours...',
    'course.notFound': 'Parcours non trouvé',
    'course.backToCourses': '← Retour aux Parcours',
    'course.rating': 'Note',
    'course.holes': 'trous',
    'course.gallery': 'Galerie',
    'course.description': 'Description',
    'course.pricing': 'Tarifs',
    'course.weekday': 'Semaine',
    'course.weekend': 'Week-end',
    'course.bookNow': 'Réserver Maintenant',
    
    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.currency': 'EUR',
    
    // Courses page
    'courses.title': 'Parcours de Golf Premium',
    'courses.subtitle': 'Découvrez les meilleurs parcours de golf au Mexique',
    'courses.searchPlaceholder': 'Rechercher des parcours par nom ou lieu...',
    'courses.viewDetails': 'Voir les Détails',
    'courses.from': 'À partir de',
    'courses.perPerson': 'par personne',
    'courses.holes': 'trous',
    'courses.rating': 'Note',
    'courses.reviews': 'avis',
    'courses.signUpFree': 'S\'inscrire Gratuitement',
  },
  de: {
    // Header
    'header.courses': 'Plätze',
    'header.signIn': 'Anmelden',
    'header.signUp': 'Registrieren',
    'header.recommendations': 'KI-Empfehlungen',
    
    // Home page
    'home.title': 'Finden Sie Ihre Perfekte Tee Time',
    'home.subtitle': 'Verbinden Sie sich mit Mexikos ikonischsten Golfplätzen und genießen Sie Golf, wie es sein sollte:',
    'home.description': 'mit Eleganz, Exklusivität und ohne Komplikationen',
    'home.exploreCourses': '🏌️ Plätze Erkunden',
    'home.signUp': '👤 Registrieren',
    'home.featuredCourses': 'Empfohlene Plätze',
    'home.featuredDescription': 'Entdecken Sie Mexikos ikonischste Golfplätze',
    'home.viewDetails': 'Details Anzeigen',
    'home.from': 'Ab',
    'home.perPerson': 'pro Person',
    'home.holes': 'Löcher',
    'home.cta.title': 'Finden Sie Ihren idealen Platz nicht?',
    'home.cta.description': 'Kontaktieren Sie uns und wir helfen Ihnen, den perfekten Platz für Ihre nächste Runde zu finden',
    'home.cta.contact': 'Support Kontaktieren',
    'home.cta.register': 'Kostenlos Registrieren',
    
    // Footer
    'footer.description': 'Die führende Golf-Reservierungsplattform in Mexiko',
    'footer.platform': 'Plattform',
    'footer.courses': 'Plätze',
    'footer.reservations': 'Reservierungen',
    'footer.admin': 'Admin',
    'footer.support': 'Support',
    'footer.helpCenter': 'Hilfe-Center',
    'footer.contact': 'Kontakt',
    'footer.apiStatus': 'API-Status',
    'footer.contactTitle': 'Kontakt',
    'footer.followUs': 'Folgen Sie uns',
    'footer.allRightsReserved': 'Alle Rechte vorbehalten.',
    'footer.premiumExperience': 'Premium-Golf-Erlebnis in Mexiko',
    
    // Course detail
    'course.loading': 'Platzinformationen werden geladen...',
    'course.notFound': 'Platz nicht gefunden',
    'course.backToCourses': '← Zurück zu den Plätzen',
    'course.rating': 'Bewertung',
    'course.holes': 'Löcher',
    'course.gallery': 'Galerie',
    'course.description': 'Beschreibung',
    'course.pricing': 'Preise',
    'course.weekday': 'Wochentag',
    'course.weekend': 'Wochenende',
    'course.bookNow': 'Jetzt Buchen',
    
    // Common
    'common.loading': 'Laden...',
    'common.error': 'Fehler',
    'common.success': 'Erfolg',
    'common.currency': 'EUR',
    
    // Courses page
    'courses.title': 'Premium-Golfplätze',
    'courses.subtitle': 'Entdecken Sie die besten Golfplätze in Mexiko',
    'courses.searchPlaceholder': 'Plätze nach Name oder Ort suchen...',
    'courses.viewDetails': 'Details Anzeigen',
    'courses.from': 'Ab',
    'courses.perPerson': 'pro Person',
    'courses.holes': 'Löcher',
    'courses.rating': 'Bewertung',
    'courses.reviews': 'Bewertungen',
    'courses.signUpFree': 'Kostenlos Registrieren',
  },
  pt: {
    // Header
    'header.courses': 'Campos',
    'header.signIn': 'Entrar',
    'header.signUp': 'Cadastrar',
    'header.recommendations': 'Recomendações IA',
    
    // Home page
    'home.title': 'Encontre Seu Tee Time Perfeito',
    'home.subtitle': 'Conecte-se com os campos de golfe mais icônicos do México e desfrute do golfe como deve ser:',
    'home.description': 'com elegância, exclusividade e sem complicações',
    'home.exploreCourses': '🏌️ Explorar Campos',
    'home.signUp': '👤 Cadastrar',
    'home.featuredCourses': 'Campos em Destaque',
    'home.featuredDescription': 'Descubra os campos de golfe mais icônicos do México',
    'home.viewDetails': 'Ver Detalhes',
    'home.from': 'A partir de',
    'home.perPerson': 'por pessoa',
    'home.holes': 'buracos',
    'home.cta.title': 'Não encontra seu campo ideal?',
    'home.cta.description': 'Entre em contato conosco e ajudaremos você a encontrar o campo perfeito para sua próxima rodada',
    'home.cta.contact': 'Contatar Suporte',
    'home.cta.register': 'Cadastrar Grátis',
    
    // Footer
    'footer.description': 'A plataforma líder de reservas de golfe no México',
    'footer.platform': 'Plataforma',
    'footer.courses': 'Campos',
    'footer.reservations': 'Reservas',
    'footer.admin': 'Admin',
    'footer.support': 'Suporte',
    'footer.helpCenter': 'Central de Ajuda',
    'footer.contact': 'Contato',
    'footer.apiStatus': 'Status da API',
    'footer.contactTitle': 'Contato',
    'footer.followUs': 'Siga-nos',
    'footer.allRightsReserved': 'Todos os direitos reservados.',
    'footer.premiumExperience': 'Experiência premium de golfe no México',
    
    // Course detail
    'course.loading': 'Carregando informações do campo...',
    'course.notFound': 'Campo não encontrado',
    'course.backToCourses': '← Voltar aos Campos',
    'course.rating': 'Avaliação',
    'course.holes': 'buracos',
    'course.gallery': 'Galeria',
    'course.description': 'Descrição',
    'course.pricing': 'Preços',
    'course.weekday': 'Dia da semana',
    'course.weekend': 'Fim de semana',
    'course.bookNow': 'Reservar Agora',
    
    // Common
    'common.loading': 'Carregando...',
    'common.error': 'Erro',
    'common.success': 'Sucesso',
    'common.currency': 'USD',
    
    // Courses page
    'courses.title': 'Campos de Golfe Premium',
    'courses.subtitle': 'Descubra os melhores campos de golfe no México',
    'courses.searchPlaceholder': 'Buscar campos por nome ou localização...',
    'courses.viewDetails': 'Ver Detalhes',
    'courses.from': 'A partir de',
    'courses.perPerson': 'por pessoa',
    'courses.holes': 'buracos',
    'courses.rating': 'Avaliação',
    'courses.reviews': 'avaliações',
    'courses.signUpFree': 'Cadastrar Grátis',
  },
  it: {
    // Header
    'header.courses': 'Campi',
    'header.signIn': 'Accedi',
    'header.signUp': 'Registrati',
    'header.recommendations': 'Raccomandazioni IA',
    
    // Home page
    'home.title': 'Trova il Tuo Tee Time Perfetto',
    'home.subtitle': 'Connettiti con i campi da golf più iconici del Messico e goditi il golf come dovrebbe essere:',
    'home.description': 'con eleganza, esclusività e senza complicazioni',
    'home.exploreCourses': '🏌️ Esplora Campi',
    'home.signUp': '👤 Registrati',
    'home.featuredCourses': 'Campi in Evidenza',
    'home.featuredDescription': 'Scopri i campi da golf più iconici del Messico',
    'home.viewDetails': 'Vedi Dettagli',
    'home.from': 'Da',
    'home.perPerson': 'a persona',
    'home.holes': 'buche',
    'home.cta.title': 'Non trovi il tuo campo ideale?',
    'home.cta.description': 'Contattaci e ti aiuteremo a trovare il campo perfetto per il tuo prossimo giro',
    'home.cta.contact': 'Contatta il Supporto',
    'home.cta.register': 'Registrati Gratis',
    
    // Footer
    'footer.description': 'La piattaforma leader per prenotazioni golf in Messico',
    'footer.platform': 'Piattaforma',
    'footer.courses': 'Campi',
    'footer.reservations': 'Prenotazioni',
    'footer.admin': 'Admin',
    'footer.support': 'Supporto',
    'footer.helpCenter': 'Centro Assistenza',
    'footer.contact': 'Contatto',
    'footer.apiStatus': 'Stato API',
    'footer.contactTitle': 'Contatto',
    'footer.followUs': 'Seguici',
    'footer.allRightsReserved': 'Tutti i diritti riservati.',
    'footer.premiumExperience': 'Esperienza golf premium in Messico',
    
    // Course detail
    'course.loading': 'Caricamento informazioni campo...',
    'course.notFound': 'Campo non trovato',
    'course.backToCourses': '← Torna ai Campi',
    'course.rating': 'Valutazione',
    'course.holes': 'buche',
    'course.gallery': 'Galleria',
    'course.description': 'Descrizione',
    'course.pricing': 'Prezzi',
    'course.weekday': 'Giorni feriali',
    'course.weekend': 'Fine settimana',
    'course.bookNow': 'Prenota Ora',
    
    // Common
    'common.loading': 'Caricamento...',
    'common.error': 'Errore',
    'common.success': 'Successo',
    'common.currency': 'EUR',
    
    // Courses page
    'courses.title': 'Campi da Golf Premium',
    'courses.subtitle': 'Scopri i migliori campi da golf in Messico',
    'courses.searchPlaceholder': 'Cerca campi per nome o posizione...',
    'courses.viewDetails': 'Vedi Dettagli',
    'courses.from': 'Da',
    'courses.perPerson': 'a persona',
    'courses.holes': 'buche',
    'courses.rating': 'Valutazione',
    'courses.reviews': 'recensioni',
    'courses.signUpFree': 'Registrati Gratis',
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('es')
  const [mounted, setMounted] = useState(false)

  // Función para detectar idioma del navegador
  const detectBrowserLanguage = (): Language => {
    if (typeof window === 'undefined') return 'es'
    
    const browserLang = navigator.language.toLowerCase()
    
    // Mapeo de códigos de idioma del navegador a nuestros idiomas soportados
    if (browserLang.startsWith('en')) return 'en'
    if (browserLang.startsWith('fr')) return 'fr'
    if (browserLang.startsWith('de')) return 'de'
    if (browserLang.startsWith('pt')) return 'pt'
    if (browserLang.startsWith('it')) return 'it'
    if (browserLang.startsWith('es')) return 'es'
    
    // Por defecto español
    return 'es'
  }

  // Función para obtener idiomas soportados
  const getSupportedLanguages = () => supportedLanguages

  // Función para formatear precios según la moneda del idioma
  const formatPrice = (price: number): string => {
    const config = currencyConfig[language]
    try {
      return new Intl.NumberFormat(config.locale, {
        style: 'currency',
        currency: config.currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(price)
    } catch (error) {
      // Fallback si hay error con Intl
      return `${config.symbol}${price.toLocaleString()}`
    }
  }

  useEffect(() => {
    setMounted(true)
    
    // Verificar idioma guardado o detectar automáticamente
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage && supportedLanguages.some(lang => lang.code === savedLanguage)) {
      setLanguage(savedLanguage)
    } else {
      // Detectar idioma del navegador
      const detectedLanguage = detectBrowserLanguage()
      setLanguage(detectedLanguage)
      localStorage.setItem('language', detectedLanguage)
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('language', language)
      // Actualizar atributo lang del HTML
      document.documentElement.lang = language
      
      // Actualizar meta tags para SEO
      const metaLang = document.querySelector('meta[name="language"]')
      if (metaLang) {
        metaLang.setAttribute('content', language)
      } else {
        const meta = document.createElement('meta')
        meta.name = 'language'
        meta.content = language
        document.head.appendChild(meta)
      }
    }
  }, [language, mounted])

  const t = (key: string): string => {
    if (!mounted) {
      // Retornar traducción por defecto mientras se monta
      const defaultTranslations = translations['es']
      return defaultTranslations[key as keyof typeof defaultTranslations] || key
    }
    
    const currentTranslations = translations[language]
    const translation = currentTranslations[key as keyof typeof currentTranslations]
    
    if (!translation) {
      // Fallback al español si no existe la traducción
      const fallbackTranslations = translations['es']
      return fallbackTranslations[key as keyof typeof fallbackTranslations] || key
    }
    
    return translation
  }

  const currency = currencyConfig[language].currency

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      t, 
      currency,
      formatPrice,
      detectBrowserLanguage,
      getSupportedLanguages
    }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

