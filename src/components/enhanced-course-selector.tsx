"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star, MapPin, Phone, Calendar, DollarSign, Users, Navigation, ArrowRight, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import InteractiveMap from '@/components/interactive-map'

interface GolfCourse {
  id: string
  name: string
  slug: string
  description: string
  address: string
  city: string
  state: string
  phone: string
  website: string
  priceWeekday: number
  priceWeekend: number
  holes: number
  par: number
  length: number
  image: string
  images: string[]
  rating: number
  reviewCount: number
  isActive: boolean
  features: string[]
  difficulty: string
  latitude?: number
  longitude?: number
}

interface EnhancedCourseSelectorProps {
  onCourseSelect?: (course: GolfCourse) => void
  showMap?: boolean
  selectedCourseId?: string
}

export default function EnhancedCourseSelector({ 
  onCourseSelect, 
  showMap = true, 
  selectedCourseId 
}: EnhancedCourseSelectorProps) {
  const [courses, setCourses] = useState<GolfCourse[]>([])
  const [filteredCourses, setFilteredCourses] = useState<GolfCourse[]>([])
  const [selectedCourse, setSelectedCourse] = useState<GolfCourse | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [locationFilter, setLocationFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid')

  useEffect(() => {
    fetchCourses()
  }, [])

  useEffect(() => {
    filterCourses()
  }, [courses, searchTerm, locationFilter])

  useEffect(() => {
    if (selectedCourseId && courses.length > 0) {
      const course = courses.find(c => c.id === selectedCourseId)
      if (course) {
        setSelectedCourse(course)
      }
    }
  }, [selectedCourseId, courses])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/courses')
      if (response.ok) {
        const data = await response.json()
        setCourses(data.data || [])
        setFilteredCourses(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterCourses = () => {
    let filtered = [...courses]

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(course => 
        course.name.toLowerCase().includes(searchLower) ||
        course.description.toLowerCase().includes(searchLower) ||
        course.city.toLowerCase().includes(searchLower)
      )
    }

    if (locationFilter !== 'all') {
      filtered = filtered.filter(course => 
        course.city.toLowerCase().includes(locationFilter.toLowerCase())
      )
    }

    setFilteredCourses(filtered)
  }

  const handleCourseSelect = (course: GolfCourse) => {
    setSelectedCourse(course)
    onCourseSelect?.(course)
  }

  const getDifficultyColor = (difficulty: string) => {
    if (difficulty.includes('Principiante')) return 'bg-green-100 text-green-800 border-green-200'
    if (difficulty.includes('Intermedio')) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    if (difficulty.includes('Avanzado')) return 'bg-red-100 text-red-800 border-red-200'
    return 'bg-gray-100 text-gray-800 border-gray-200'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-green-700 font-medium">Cargando campos de golf...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtros y Controles */}
      <Card className="border-green-200 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-green-700 text-xl">Seleccionar Campo de Golf</CardTitle>
              <CardDescription>
                Elige el campo perfecto para tu experiencia de golf
              </CardDescription>
            </div>
            
            {/* Controles de Vista */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="text-sm"
              >
                Tarjetas
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="text-sm"
              >
                Lista
              </Button>
              {showMap && (
                <Button
                  variant={viewMode === 'map' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('map')}
                  className="text-sm"
                >
                  Mapa
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-green-700 mb-2">
                Buscar campos
              </label>
              <Input
                placeholder="Nombre del campo o ubicación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-green-300 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-700 mb-2">
                Ubicación
              </label>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="border-green-300 focus:border-green-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las ubicaciones</SelectItem>
                  <SelectItem value="cabo">Los Cabos</SelectItem>
                  <SelectItem value="paz">La Paz</SelectItem>
                  <SelectItem value="loreto">Loreto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campo Seleccionado - Resumen */}
      {selectedCourse && (
        <Card className="border-green-400 bg-green-50 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-800 mb-1">
                  Campo Seleccionado: {selectedCourse.name}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-green-700">
                  <div>
                    <span className="font-medium">Ubicación:</span> {selectedCourse.city}
                  </div>
                  <div>
                    <span className="font-medium">Hoyos:</span> {selectedCourse.holes}
                  </div>
                  <div>
                    <span className="font-medium">Rating:</span> {selectedCourse.rating} ⭐
                  </div>
                  <div>
                    <span className="font-medium">Desde:</span> ${selectedCourse.priceWeekday}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button asChild size="sm" className="bg-green-600 hover:bg-green-700">
                  <Link href={`/bookings?courseId=${selectedCourse.id}&courseName=${encodeURIComponent(selectedCourse.name)}`}>
                    <Calendar className="w-4 h-4 mr-1" />
                    Reservar
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/courses/${selectedCourse.slug}`}>
                    Ver Detalles
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vista de Mapa */}
      {viewMode === 'map' && showMap && (
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-700">Mapa Interactivo</CardTitle>
            <CardDescription>
              Explora los campos de golf en el mapa y selecciona uno para ver más detalles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96 rounded-lg overflow-hidden">
              <InteractiveMap
                courses={filteredCourses.filter(c => c.latitude && c.longitude)}
                selectedCourseId={selectedCourse?.id}
                onCourseSelect={(courseId) => {
                  const course = courses.find(c => c.id === courseId)
                  if (course) handleCourseSelect(course)
                }}
                height="100%"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vista de Tarjetas */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card 
              key={course.id} 
              className={`overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg ${
                selectedCourse?.id === course.id 
                  ? 'border-green-400 bg-green-50 shadow-md' 
                  : 'border-green-200 hover:border-green-300'
              }`}
              onClick={() => handleCourseSelect(course)}
            >
              <div className="relative h-48">
                <Image
                  src={course.image}
                  alt={course.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                {selectedCourse?.id === course.id && (
                  <div className="absolute top-3 left-3">
                    <CheckCircle className="w-8 h-8 text-green-600 bg-white rounded-full" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <Badge className={getDifficultyColor(course.difficulty)}>
                    {course.difficulty}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4">
                <h3 className="font-bold text-green-700 mb-2 text-lg">
                  {course.name}
                </h3>
                
                <div className="flex items-center text-green-600 mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">{course.city}, {course.state}</span>
                </div>
                
                <div className="flex items-center mb-3">
                  <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                  <span className="font-semibold text-green-700">{course.rating}</span>
                  <span className="text-green-600 ml-1 text-sm">({course.reviewCount})</span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-green-700">{course.holes} hoyos</span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-green-700">Desde ${course.priceWeekday}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    asChild
                  >
                    <Link href={`/bookings?courseId=${course.id}&courseName=${encodeURIComponent(course.name)}`}>
                      <Calendar className="w-4 h-4 mr-1" />
                      Reservar
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    asChild
                  >
                    <Link href={`/courses/${course.slug}`}>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Vista de Lista */}
      {viewMode === 'list' && (
        <Card className="border-green-200">
          <CardContent className="p-0">
            <div className="divide-y divide-green-100">
              {filteredCourses.map((course) => (
                <div 
                  key={course.id}
                  className={`p-4 cursor-pointer transition-all duration-200 hover:bg-green-50 ${
                    selectedCourse?.id === course.id ? 'bg-green-50 border-l-4 border-l-green-500' : ''
                  }`}
                  onClick={() => handleCourseSelect(course)}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <Image
                        src={course.image}
                        alt={course.name}
                        fill
                        className="object-cover rounded-lg"
                        sizes="80px"
                      />
                      {selectedCourse?.id === course.id && (
                        <div className="absolute -top-1 -right-1">
                          <CheckCircle className="w-6 h-6 text-green-600 bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-bold text-green-700 text-lg mb-1">
                        {course.name}
                      </h3>
                      <div className="flex items-center text-green-600 mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="text-sm">{course.city}, {course.state}</span>
                        <Star className="w-4 h-4 text-yellow-500 fill-current ml-4 mr-1" />
                        <span className="text-sm font-semibold">{course.rating}</span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-green-700">
                        <span>{course.holes} hoyos</span>
                        <span>Par {course.par}</span>
                        <span>Desde ${course.priceWeekday}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700"
                        asChild
                      >
                        <Link href={`/bookings?courseId=${course.id}&courseName=${encodeURIComponent(course.name)}`}>
                          <Calendar className="w-4 h-4 mr-1" />
                          Reservar
                        </Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        asChild
                      >
                        <Link href={`/courses/${course.slug}`}>
                          Ver Detalles
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado vacío */}
      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-12 h-12 text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-green-700 mb-2">No se encontraron campos</h3>
          <p className="text-green-600 mb-4">Intenta ajustar tus filtros de búsqueda.</p>
          <Button 
            onClick={() => {
              setSearchTerm('')
              setLocationFilter('all')
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            Limpiar Filtros
          </Button>
        </div>
      )}
    </div>
  )
}
