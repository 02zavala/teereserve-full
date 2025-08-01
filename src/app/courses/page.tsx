"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star, MapPin, Phone, Users, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PageHeader } from '@/components/PageHeader'
import { SecondaryFooter } from '@/components/SecondaryFooter'
import AdvancedSearchBar from '@/components/AdvancedSearchBar'
import AdvancedFilters from '@/components/AdvancedFilters'
import EnhancedCourseCard from '@/components/EnhancedCourseCard'
import ViewToggle from '@/components/ViewToggle'
import SortOptions from '@/components/SortOptions'

interface GolfCourse {
  id: string
  name: string
  slug: string
  description?: string
  address: string
  city: string
  state: string
  phone?: string
  website?: string
  priceWeekday?: number
  priceWeekend?: number
  holes: number
  par?: number
  length?: number
  image?: string
  images?: string[]
  rating?: number
  reviewCount?: number
  isActive: boolean
  features?: string
  difficulty?: string
  teeSheetUrl?: string
  currency?: string
}

interface SearchData {
  location: string
  checkIn?: Date
  checkOut?: Date
  players: number
  searchTerm: string
}

interface FilterData {
  priceRange: [number, number]
  holes: string[]
  services: string[]
  difficulty: string[]
  rating: number
  features: string[]
  availability: {
    checkIn?: Date
    checkOut?: Date
  }
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<GolfCourse[]>([])
  const [filteredCourses, setFilteredCourses] = useState<GolfCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [locationFilter, setLocationFilter] = useState('all')
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  const [currentView, setCurrentView] = useState<'grid' | 'list' | 'map'>('grid')
  const [currentSort, setCurrentSort] = useState('relevance')
  const [advancedFilters, setAdvancedFilters] = useState<FilterData>({
    priceRange: [100, 500],
    holes: [],
    services: [],
    difficulty: [],
    rating: 0,
    features: [],
    availability: {}
  })

  useEffect(() => {
    fetchCourses()
  }, [])

  useEffect(() => {
    filterCourses()
  }, [courses, searchTerm, locationFilter, difficultyFilter, advancedFilters, currentSort])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/courses")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: GolfCourse[] = await response.json()
      setCourses(data)
      setFilteredCourses(data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching courses:", error)
      setLoading(false)
    }
  }

  const filterCourses = () => {
    let filtered = [...courses]

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(course => 
        course.name.toLowerCase().includes(searchLower) ||
        course.description.toLowerCase().includes(searchLower) ||
        course.city.toLowerCase().includes(searchLower)
      )
    }

    // Filtrar por ubicación
    if (locationFilter !== 'all') {
      filtered = filtered.filter(course => 
        course.city.toLowerCase().includes(locationFilter.toLowerCase())
      )
    }

    // Filtrar por dificultad básica
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(course => 
        course.difficulty && course.difficulty.toLowerCase().includes(difficultyFilter.toLowerCase())
      )
    }

    // Aplicar filtros avanzados
    // Filtro de precio
    if (advancedFilters.priceRange[0] > 100 || advancedFilters.priceRange[1] < 500) {
      filtered = filtered.filter(course => 
        course.priceWeekday >= advancedFilters.priceRange[0] && 
        course.priceWeekday <= advancedFilters.priceRange[1]
      )
    }

    // Filtro de hoyos
    if (advancedFilters.holes.length > 0) {
      filtered = filtered.filter(course => {
        const holes = course.holes.toString()
        return advancedFilters.holes.some(filterHole => {
          if (filterHole === '9') return holes === '9'
          if (filterHole === '18') return holes === '18'
          if (filterHole === '27') return parseInt(holes) >= 27
          return false
        })
      })
    }

    // Filtro de calificación
    if (advancedFilters.rating > 0) {
      filtered = filtered.filter(course => course.rating >= advancedFilters.rating)
    }

    // Filtro de dificultad avanzada
    if (advancedFilters.difficulty.length > 0) {
      filtered = filtered.filter(course => {
        const courseDifficulty = course.difficulty.toLowerCase()
        return advancedFilters.difficulty.some(filterDiff => {
          if (filterDiff === 'beginner') return courseDifficulty.includes('principiante')
          if (filterDiff === 'intermediate') return courseDifficulty.includes('intermedio')
          if (filterDiff === 'advanced') return courseDifficulty.includes('avanzado')
          return false
        })
      })
    }

    // Filtro de servicios (simulado - en producción vendría de la base de datos)
    if (advancedFilters.services.length > 0) {
      filtered = filtered.filter(course => {
        // Simulamos que algunos campos tienen ciertos servicios
        const courseServices = course.features ? course.features.split(',').map(f => f.trim()) : []
        return advancedFilters.services.some(service => 
          courseServices.some(feature => 
            feature.toLowerCase().includes(service.toLowerCase())
          )
        )
      })
    }

    // Filtro de características especiales
    if (advancedFilters.features.length > 0) {
      filtered = filtered.filter(course => {
        const courseFeatures = course.features ? course.features.split(',').map(f => f.trim()) : []
        return advancedFilters.features.some(feature => 
          courseFeatures.some(courseFeature => 
            courseFeature.toLowerCase().includes(feature.replace('-', ' '))
          )
        )
      })
    }

    setFilteredCourses(sortCourses(filtered))
  }

  const sortCourses = (coursesToSort: GolfCourse[]) => {
    const sorted = [...coursesToSort]
    
    switch (currentSort) {
      case 'rating-desc':
        return sorted.sort((a, b) => b.rating - a.rating)
      case 'price-asc':
        return sorted.sort((a, b) => a.priceWeekday - b.priceWeekday)
      case 'price-desc':
        return sorted.sort((a, b) => b.priceWeekday - a.priceWeekday)
      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name))
      case 'distance':
        // En el futuro se puede implementar con geolocalización
        return sorted.sort((a, b) => a.name.localeCompare(b.name))
      case 'relevance':
      default:
        // Ordenar por relevancia: rating alto + precio competitivo
        return sorted.sort((a, b) => {
          const scoreA = a.rating * 0.7 + (500 - a.priceWeekday) / 500 * 0.3
          const scoreB = b.rating * 0.7 + (500 - b.priceWeekday) / 500 * 0.3
          return scoreB - scoreA
        })
    }
  }

  const handleAdvancedSearch = (searchData: SearchData) => {
    setSearchTerm(searchData.searchTerm)
    
    // Mapear ubicaciones comunes
    if (searchData.location.toLowerCase().includes('cabo')) {
      setLocationFilter('cabo')
    } else if (searchData.location.toLowerCase().includes('paz')) {
      setLocationFilter('paz')
    } else if (searchData.location.toLowerCase().includes('loreto')) {
      setLocationFilter('loreto')
    } else if (searchData.location.toLowerCase().includes('cerca de mí')) {
      // Implementar lógica de geolocalización en el futuro
      setLocationFilter('all')
    } else {
      setLocationFilter('all')
    }
  }

  const handleAdvancedFiltersChange = (filters: FilterData) => {
    setAdvancedFilters(filters)
  }

  const getDifficultyColor = (difficulty: string) => {
    if (difficulty.includes('Principiante')) return 'bg-green-100 text-green-800'
    if (difficulty.includes('Intermedio')) return 'bg-yellow-100 text-yellow-800'
    if (difficulty.includes('Avanzado')) return 'bg-red-100 text-red-800'
    return 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-white">
      <PageHeader />
      
      {/* Hero Section con búsqueda */}
      <div className="bg-gradient-to-br from-green-600 via-green-700 to-green-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Encuentra tu Tee Time Perfecto
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-green-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Descubre y reserva en los mejores campos de golf de México. Más de 15 campos premium te esperan.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm md:text-base">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2">
                15+ Campos Premium
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2">
                Los Cabos • La Paz • Loreto
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2">
                Reserva Instantánea
              </Badge>
            </div>
          </div>
          
          {/* Barra de búsqueda avanzada */}
          <div className="max-w-4xl mx-auto">
            <AdvancedSearchBar 
              onSearch={handleAdvancedSearch}
              className="mb-8"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Filtros y resultados mejorados */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-green-700">
              {filteredCourses.length} campos encontrados
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <SortOptions 
                currentSort={currentSort}
                onSortChange={setCurrentSort}
              />
              <ViewToggle 
                currentView={currentView}
                onViewChange={setCurrentView}
              />
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filtros laterales */}
            <div className="lg:w-80 space-y-4">
              <AdvancedFilters 
                onFiltersChange={handleAdvancedFiltersChange}
                className="w-full"
              />
              
              <div className="space-y-3">
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="all">Todas las ubicaciones</option>
                  <option value="cabo">Los Cabos</option>
                  <option value="paz">La Paz</option>
                  <option value="loreto">Loreto</option>
                </select>
                
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="all">Todas las dificultades</option>
                  <option value="principiante">Principiante</option>
                  <option value="intermedio">Intermedio</option>
                  <option value="avanzado">Avanzado</option>
                </select>
                
                {(searchTerm || locationFilter !== 'all' || difficultyFilter !== 'all') && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('')
                      setLocationFilter('all')
                      setDifficultyFilter('all')
                      setAdvancedFilters({
                        priceRange: [100, 500],
                        holes: [],
                        services: [],
                        difficulty: [],
                        rating: 0,
                        features: [],
                        availability: {}
                      })
                    }}
                    className="w-full border-green-300 text-green-700 hover:bg-green-50"
                  >
                    Limpiar filtros
                  </Button>
                )}
              </div>
            </div>

            {/* Resultados */}
            <div className="flex-1">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 h-64 rounded-lg mb-4"></div>
                      <div className="space-y-2">
                        <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                        <div className="bg-gray-200 h-4 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredCourses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🏌️</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No se encontraron campos
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Intenta ajustar tus filtros de búsqueda
                  </p>
                  <Button
                    onClick={() => {
                      setSearchTerm('')
                      setLocationFilter('all')
                      setDifficultyFilter('all')
                      setAdvancedFilters({
                        priceRange: [100, 500],
                        holes: [],
                        services: [],
                        difficulty: [],
                        rating: 0,
                        features: [],
                        availability: {}
                      })
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Limpiar filtros
                  </Button>
                </div>
              ) : (
                <div className={
                  currentView === 'grid' 
                    ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                    : "space-y-6"
                }>
                  {filteredCourses.map((course) => (
                    <EnhancedCourseCard
                      key={course.id}
                      course={course}
                      layout={currentView === 'list' ? 'list' : 'grid'}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <SecondaryFooter />
    </div>
  )
}

