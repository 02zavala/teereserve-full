'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { MapPin, Navigation, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface InteractiveMapProps {
  address: string
  city: string
  state: string
  courseName: string
  latitude?: number
  longitude?: number
  className?: string
}

export function InteractiveMap({ 
  address, 
  city, 
  state, 
  courseName, 
  latitude, 
  longitude,
  className = ""
}: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fullAddress = `${address}, ${city}, ${state}`

  useEffect(() => {
    const initMap = async () => {
      try {
        // Configurar el loader de Google Maps con manejo de errores mejorado
        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
          version: 'weekly',
          libraries: ['places', 'geometry']
        })

        // Verificar si tenemos API key
        if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
          console.warn('Google Maps API key no configurada')
          setError('Configuración de mapa pendiente')
          setIsLoading(false)
          return
        }

        const google = await loader.load()
        
        if (!mapRef.current) return

        let mapCenter: google.maps.LatLngLiteral

        // Si tenemos coordenadas específicas, las usamos
        if (latitude && longitude) {
          mapCenter = { lat: latitude, lng: longitude }
        } else {
          // Geocodificar la dirección para obtener coordenadas
          const geocoder = new google.maps.Geocoder()
          const geocodeResult = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
            geocoder.geocode({ address: fullAddress }, (results, status) => {
              if (status === 'OK' && results && results.length > 0) {
                resolve(results)
              } else {
                reject(new Error('No se pudo geocodificar la dirección'))
              }
            })
          })

          const location = geocodeResult[0].geometry.location
          mapCenter = { lat: location.lat(), lng: location.lng() }
        }

        // Crear el mapa
        const mapInstance = new google.maps.Map(mapRef.current, {
          center: mapCenter,
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.HYBRID, // Vista satelital para campos de golf
          styles: [
            {
              featureType: 'poi.business',
              stylers: [{ visibility: 'off' }]
            },
            {
              featureType: 'poi.medical',
              stylers: [{ visibility: 'off' }]
            }
          ],
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
        })

        // Crear marcador personalizado
        const marker = new google.maps.Marker({
          position: mapCenter,
          map: mapInstance,
          title: courseName,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="18" fill="#16a34a" stroke="#ffffff" stroke-width="4"/>
                <path d="M20 10L20 30M15 15L25 15M15 25L25 25" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(40, 40),
            anchor: new google.maps.Point(20, 20)
          }
        })

        // Ventana de información
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 10px; max-width: 250px;">
              <h3 style="margin: 0 0 8px 0; color: #16a34a; font-weight: bold;">${courseName}</h3>
              <p style="margin: 0 0 8px 0; color: #374151; font-size: 14px;">${fullAddress}</p>
              <div style="display: flex; gap: 8px; margin-top: 10px;">
                <a href="https://maps.google.com/?q=${encodeURIComponent(fullAddress)}" 
                   target="_blank" 
                   style="background: #16a34a; color: white; padding: 6px 12px; border-radius: 6px; text-decoration: none; font-size: 12px;">
                  Ver en Google Maps
                </a>
              </div>
            </div>
          `
        })

        // Mostrar info window al hacer clic en el marcador
        marker.addListener('click', () => {
          infoWindow.open(mapInstance, marker)
        })

        setMap(mapInstance)
        setIsLoading(false)

      } catch (err) {
        console.error('Error loading map:', err)
        setError('Error al cargar el mapa')
        setIsLoading(false)
      }
    }

    initMap()
  }, [address, city, state, courseName, latitude, longitude, fullAddress])

  if (error) {
    return (
      <div className={`bg-gray-100 rounded-lg p-8 text-center ${className}`}>
        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-4">No se pudo cargar el mapa interactivo</p>
        <div className="flex gap-4 justify-center">
          <Button 
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(fullAddress)}`, '_blank')}
          >
            <Navigation className="w-4 h-4 mr-2" />
            Ver en Google Maps
          </Button>
          <Button 
            variant="outline" 
            className="border-green-300 text-green-700 hover:bg-green-50"
            onClick={() => window.open(`https://waze.com/ul?q=${encodeURIComponent(fullAddress)}`, '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Abrir en Waze
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center z-10">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-green-700 text-sm">Cargando mapa...</p>
          </div>
        </div>
      )}
      
      <div 
        ref={mapRef} 
        className="w-full h-64 rounded-lg"
        style={{ minHeight: '256px' }}
      />
      
      {!isLoading && (
        <div className="flex gap-4 mt-4">
          <Button 
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(fullAddress)}`, '_blank')}
          >
            <Navigation className="w-4 h-4 mr-2" />
            Ver en Google Maps
          </Button>
          <Button 
            variant="outline" 
            className="border-green-300 text-green-700 hover:bg-green-50"
            onClick={() => window.open(`https://waze.com/ul?q=${encodeURIComponent(fullAddress)}`, '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Abrir en Waze
          </Button>
        </div>
      )}
    </div>
  )
}

