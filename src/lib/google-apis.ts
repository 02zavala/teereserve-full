import { GoogleAuth } from 'google-auth-library'

// Configuración de Google APIs
const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!
const googlePlacesApiKey = process.env.GOOGLE_PLACES_API_KEY!
const googleClientId = process.env.GOOGLE_CLIENT_ID!
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET!

// Cliente de autenticación de Google
export const googleAuth = new GoogleAuth({
  credentials: {
    client_id: googleClientId,
    client_secret: googleClientSecret
  },
  scopes: [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/gmail.send'
  ]
})

// Configuración de Google Maps
export const googleMapsConfig = {
  apiKey: googleMapsApiKey,
  libraries: ['places', 'geometry', 'drawing'] as const,
  region: 'MX',
  language: 'es'
}

// Tipos para Google Places
export interface GolfCoursePlace {
  place_id: string
  name: string
  formatted_address: string
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  rating?: number
  user_ratings_total?: number
  photos?: Array<{
    photo_reference: string
    height: number
    width: number
  }>
  opening_hours?: {
    open_now: boolean
    weekday_text: string[]
  }
  formatted_phone_number?: string
  website?: string
  price_level?: number
}

// Buscar campos de golf cercanos
export const searchNearbyGolfCourses = async (
  lat: number,
  lng: number,
  radius: number = 50000
): Promise<GolfCoursePlace[]> => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
      `location=${lat},${lng}&` +
      `radius=${radius}&` +
      `type=golf_course&` +
      `key=${googlePlacesApiKey}`
    )

    const data = await response.json()
    
    if (data.status !== 'OK') {
      throw new Error(`Google Places API error: ${data.status}`)
    }

    return data.results
  } catch (error) {
    console.error('Error buscando campos de golf:', error)
    throw error
  }
}

// Obtener detalles de un campo de golf
export const getGolfCourseDetails = async (placeId: string): Promise<GolfCoursePlace> => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?` +
      `place_id=${placeId}&` +
      `fields=place_id,name,formatted_address,geometry,rating,user_ratings_total,photos,opening_hours,formatted_phone_number,website,price_level&` +
      `key=${googlePlacesApiKey}`
    )

    const data = await response.json()
    
    if (data.status !== 'OK') {
      throw new Error(`Google Places API error: ${data.status}`)
    }

    return data.result
  } catch (error) {
    console.error('Error obteniendo detalles del campo:', error)
    throw error
  }
}

// Obtener URL de foto de Google Places
export const getGooglePlacePhotoUrl = (
  photoReference: string,
  maxWidth: number = 800,
  maxHeight: number = 600
): string => {
  return `https://maps.googleapis.com/maps/api/place/photo?` +
    `maxwidth=${maxWidth}&` +
    `maxheight=${maxHeight}&` +
    `photo_reference=${photoReference}&` +
    `key=${googleMapsApiKey}`
}

// Calcular distancia entre dos puntos
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371 // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Geocodificar dirección
export const geocodeAddress = async (address: string) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?` +
      `address=${encodeURIComponent(address)}&` +
      `region=MX&` +
      `key=${googleMapsApiKey}`
    )

    const data = await response.json()
    
    if (data.status !== 'OK') {
      throw new Error(`Geocoding API error: ${data.status}`)
    }

    return data.results[0]
  } catch (error) {
    console.error('Error geocodificando dirección:', error)
    throw error
  }
}

// Obtener direcciones entre dos puntos
export const getDirections = async (
  origin: string,
  destination: string,
  mode: 'driving' | 'walking' | 'transit' = 'driving'
) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?` +
      `origin=${encodeURIComponent(origin)}&` +
      `destination=${encodeURIComponent(destination)}&` +
      `mode=${mode}&` +
      `region=MX&` +
      `language=es&` +
      `key=${googleMapsApiKey}`
    )

    const data = await response.json()
    
    if (data.status !== 'OK') {
      throw new Error(`Directions API error: ${data.status}`)
    }

    return data.routes[0]
  } catch (error) {
    console.error('Error obteniendo direcciones:', error)
    throw error
  }
}

// Configuración de Google Analytics
export const initGoogleAnalytics = () => {
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS

  if (typeof window !== 'undefined' && GA_MEASUREMENT_ID) {
    // Cargar Google Analytics
    const script = document.createElement('script')
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
    script.async = true
    document.head.appendChild(script)

    // Configurar gtag
    window.dataLayer = window.dataLayer || []
    function gtag(...args: any[]) {
      window.dataLayer.push(args)
    }
    gtag('js', new Date())
    gtag('config', GA_MEASUREMENT_ID, {
      page_title: document.title,
      page_location: window.location.href
    })

    // Hacer gtag disponible globalmente
    ;(window as any).gtag = gtag
  }
}

// Enviar evento a Google Analytics
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    ;(window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value
    })
  }
}

// Eventos específicos para golf
export const golfAnalyticsEvents = {
  courseView: (courseName: string) => {
    trackEvent('view_course', 'golf', courseName)
  },
  
  bookingStart: (courseName: string) => {
    trackEvent('booking_start', 'golf', courseName)
  },
  
  bookingComplete: (courseName: string, price: number) => {
    trackEvent('booking_complete', 'golf', courseName, price)
  },
  
  searchCourses: (searchTerm: string) => {
    trackEvent('search_courses', 'golf', searchTerm)
  },
  
  filterCourses: (filterType: string, filterValue: string) => {
    trackEvent('filter_courses', 'golf', `${filterType}:${filterValue}`)
  }
}

export default {
  googleMapsConfig,
  searchNearbyGolfCourses,
  getGolfCourseDetails,
  getGooglePlacePhotoUrl,
  calculateDistance,
  geocodeAddress,
  getDirections,
  initGoogleAnalytics,
  trackEvent,
  golfAnalyticsEvents
}

