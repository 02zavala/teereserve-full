"use client"

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Navigation, Phone, Star, ExternalLink } from 'lucide-react'

interface GolfCourse {
  id: string
  name: string
  address: string
  city: string
  state: string
  latitude: number
  longitude: number
  rating: number
  priceWeekday: number
  phone: string
  website?: string
  image: string
}

interface InteractiveMapProps {
  courses: GolfCourse[]
  selectedCourseId?: string
  onCourseSelect?: (courseId: string) => void
  height?: string
  showControls?: boolean
}

declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

export default function InteractiveMap({
  courses,
  selectedCourseId,
  onCourseSelect,
  height = "400px",
  showControls = true
}: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [markers, setMarkers] = useState<any[]>([])
  const [selectedCourse, setSelectedCourse] = useState<GolfCourse | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  // Load Google Maps script
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google) {
        setIsLoaded(true)
        return
      }

      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`
      script.async = true
      script.defer = true

      window.initMap = () => {
        setIsLoaded(true)
      }

      document.head.appendChild(script)
    }

    loadGoogleMaps()
  }, [])

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.log('Error getting location:', error)
        }
      )
    }
  }, [])

  // Initialize map
  useEffect(() => {
    if (isLoaded && mapRef.current && courses.length > 0) {
      initializeMap()
    }
  }, [isLoaded, courses])

  // Update selected course
  useEffect(() => {
    if (selectedCourseId && courses.length > 0) {
      const course = courses.find(c => c.id === selectedCourseId)
      if (course) {
        setSelectedCourse(course)
        if (map) {
          map.panTo({ lat: course.latitude, lng: course.longitude })
          map.setZoom(14)
        }
      }
    }
  }, [selectedCourseId, courses, map])

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return

    // Calculate map bounds
    const bounds = new window.google.maps.LatLngBounds()
    courses.forEach(course => {
      bounds.extend({ lat: course.latitude, lng: course.longitude })
    })

    // Create map
    const newMap = new window.google.maps.Map(mapRef.current, {
      zoom: 10,
      center: { lat: 23.6345, lng: -102.5528 }, // Center of Mexico
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          featureType: 'poi.business',
          stylers: [{ visibility: 'off' }]
        },
        {
          featureType: 'poi.park',
          elementType: 'labels.text',
          stylers: [{ visibility: 'off' }]
        }
      ]
    })

    // Fit map to bounds
    newMap.fitBounds(bounds)

    setMap(newMap)

    // Create markers
    const newMarkers = courses.map((course, index) => {
      const marker = new window.google.maps.Marker({
        position: { lat: course.latitude, lng: course.longitude },
        map: newMap,
        title: course.name,
        icon: {
          url: '/icon.svg',
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 40)
        },
        animation: selectedCourseId === course.id ? window.google.maps.Animation.BOUNCE : null
      })

      // Create info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: createInfoWindowContent(course)
      })

      marker.addListener('click', () => {
        // Close all other info windows
        newMarkers.forEach(m => m.infoWindow?.close())

        // Open this info window
        infoWindow.open(newMap, marker)
        setSelectedCourse(course)
        onCourseSelect?.(course.id)
      })

      marker.infoWindow = infoWindow

      return marker
    })

    setMarkers(newMarkers)

    // Add user location marker if available
    if (userLocation) {
      new window.google.maps.Marker({
        position: userLocation,
        map: newMap,
        title: 'Tu ubicación',
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          scaledSize: new window.google.maps.Size(32, 32)
        }
      })
    }
  }

  const createInfoWindowContent = (course: GolfCourse) => {
    return `
      <div style="max-width: 250px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <img src="${course.image}" alt="${course.name}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />
        <h3 style="margin: 0 0 4px 0; color: #1E5631; font-size: 16px; font-weight: bold;">${course.name}</h3>
        <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">📍 ${course.city}, ${course.state}</p>
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <span style="color: #D4AF37; margin-right: 4px;">⭐</span>
          <span style="color: #1E5631; font-weight: bold;">${course.rating}</span>
          <span style="color: #666; margin-left: 8px;">Desde $${course.priceWeekday.toLocaleString()}</span>
        </div>
        <div style="display: flex; gap: 8px; margin-top: 8px;">
           <a href="/courses/${course.slug}" style="background: #1E5631; color: white; padding: 6px 12px; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: bold;">Ver Detalles</a>
          <a href="tel:${course.phone}" style="background: #D4AF37; color: white; padding: 6px 12px; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: bold;">Llamar</a>
        </div>
      </div>
    `
  }

  const getDirections = (course: GolfCourse) => {
    const destination = `${course.latitude},${course.longitude}`
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`
    window.open(directionsUrl, '_blank')
  }

  const goToUserLocation = () => {
    if (userLocation && map) {
      map.panTo(userLocation)
      map.setZoom(12)
    }
  }

  if (!isLoaded) {
    return (
      <Card className="border-golf-beige-300">
        <CardContent className="p-6 text-center">
          <div className="animate-pulse">
            <div className="bg-golf-beige-200 rounded-lg w-full h-64 mb-4"></div>
            <p className="text-golf-green-600">Cargando mapa...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Map Container */}
      <Card className="border-golf-beige-300 overflow-hidden">
        <div className="relative">
          <div
            ref={mapRef}
            style={{ height }}
            className="w-full"
          />

          {/* Map Controls */}
          {showControls && (
            <div className="absolute top-4 right-4 space-y-2">
              {userLocation && (
                <Button
                  onClick={goToUserLocation}
                  size="sm"
                  className="bg-white/90 text-golf-green-700 hover:bg-white shadow-lg"
                >
                  <Navigation className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}

          {/* Course Count Badge */}
          <div className="absolute bottom-4 left-4">
            <Badge className="bg-golf-green-600 text-white shadow-lg">
              <MapPin className="w-3 h-3 mr-1" />
              {courses.length} campos disponibles
            </Badge>
          </div>
        </div>
      </Card>

      {/* Selected Course Info */}
      {selectedCourse && (
        <Card className="border-golf-green-300">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-golf-green-600">{selectedCourse.name}</CardTitle>
                <CardDescription className="flex items-center mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  {selectedCourse.address}, {selectedCourse.city}
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="flex items-center text-golf-gold-600">
                  <Star className="w-4 h-4 mr-1" />
                  <span className="font-bold">{selectedCourse.rating}</span>
                </div>
                <div className="text-sm text-golf-green-600 mt-1">
                  Desde ${selectedCourse.priceWeekday.toLocaleString()}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => getDirections(selectedCourse)}
                className="bg-golf-green-600 hover:bg-golf-green-700 text-white"
              >
                <Navigation className="w-4 h-4 mr-2" />
                Cómo Llegar
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(`tel:${selectedCourse.phone}`, '_self')}
                className="border-golf-green-600 text-golf-green-700"
              >
                <Phone className="w-4 h-4 mr-2" />
                Llamar
              </Button>
              {selectedCourse.website && (
                <Button
                  variant="outline"
                  onClick={() => window.open(selectedCourse.website, '_blank')}
                  className="border-golf-gold-600 text-golf-gold-700"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Sitio Web
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
