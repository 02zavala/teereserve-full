"use client"

import { useState, useEffect } from 'react'
import { 
  Filter, 
  DollarSign, 
  Calendar, 
  Users, 
  Star, 
  MapPin, 
  Clock,
  Wifi,
  Car,
  Coffee,
  Utensils,
  Dumbbell,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

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

interface AdvancedFiltersProps {
  onFiltersChange: (filters: FilterData) => void
  className?: string
}

export default function AdvancedFilters({ onFiltersChange, className = '' }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<FilterData>({
    priceRange: [100, 500],
    holes: [],
    services: [],
    difficulty: [],
    rating: 0,
    features: [],
    availability: {}
  })

  const [activeFiltersCount, setActiveFiltersCount] = useState(0)

  // Opciones de filtros
  const holesOptions = [
    { id: '9', label: '9 hoyos', count: 3 },
    { id: '18', label: '18 hoyos', count: 12 },
    { id: '27', label: '27+ hoyos', count: 2 }
  ]

  const servicesOptions = [
    { id: 'caddie', label: 'Caddie disponible', icon: <Users className="w-4 h-4" />, count: 8 },
    { id: 'equipment', label: 'Renta de equipo', icon: <ShoppingBag className="w-4 h-4" />, count: 15 },
    { id: 'restaurant', label: 'Restaurante', icon: <Utensils className="w-4 h-4" />, count: 12 },
    { id: 'spa', label: 'Spa & Wellness', icon: <Dumbbell className="w-4 h-4" />, count: 6 },
    { id: 'parking', label: 'Estacionamiento', icon: <Car className="w-4 h-4" />, count: 15 },
    { id: 'wifi', label: 'WiFi gratuito', icon: <Wifi className="w-4 h-4" />, count: 10 },
    { id: 'proshop', label: 'Pro Shop', icon: <ShoppingBag className="w-4 h-4" />, count: 8 }
  ]

  const difficultyOptions = [
    { id: 'beginner', label: 'Principiante', color: 'bg-green-100 text-green-800', count: 4 },
    { id: 'intermediate', label: 'Intermedio', color: 'bg-yellow-100 text-yellow-800', count: 8 },
    { id: 'advanced', label: 'Avanzado', color: 'bg-red-100 text-red-800', count: 3 }
  ]

  const featuresOptions = [
    { id: 'ocean-view', label: 'Vista al océano', count: 8 },
    { id: 'desert', label: 'Campo desértico', count: 5 },
    { id: 'links', label: 'Estilo Links', count: 3 },
    { id: 'championship', label: 'Campo de campeonato', count: 6 },
    { id: 'signature', label: 'Diseño de firma', count: 4 },
    { id: 'practice', label: 'Campo de práctica', count: 12 }
  ]

  // Calcular filtros activos
  useEffect(() => {
    let count = 0
    if (filters.priceRange[0] > 100 || filters.priceRange[1] < 500) count++
    if (filters.holes.length > 0) count++
    if (filters.services.length > 0) count++
    if (filters.difficulty.length > 0) count++
    if (filters.rating > 0) count++
    if (filters.features.length > 0) count++
    
    setActiveFiltersCount(count)
    onFiltersChange(filters)
  }, [filters, onFiltersChange])

  const handleFilterChange = (category: keyof FilterData, value: any) => {
    setFilters(prev => ({
      ...prev,
      [category]: value
    }))
  }

  const handleArrayFilterToggle = (category: 'holes' | 'services' | 'difficulty' | 'features', value: string) => {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(item => item !== value)
        : [...prev[category], value]
    }))
  }

  const clearAllFilters = () => {
    setFilters({
      priceRange: [100, 500],
      holes: [],
      services: [],
      difficulty: [],
      rating: 0,
      features: [],
      availability: {}
    })
  }

  const clearSpecificFilter = (category: keyof FilterData) => {
    if (category === 'priceRange') {
      handleFilterChange('priceRange', [100, 500])
    } else if (category === 'rating') {
      handleFilterChange('rating', 0)
    } else {
      handleFilterChange(category, [])
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Botón de filtros */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="border-green-300 text-green-700 hover:bg-green-50 relative"
      >
        <Filter className="w-4 h-4 mr-2" />
        Filtros
        {activeFiltersCount > 0 && (
          <Badge className="ml-2 bg-green-600 text-white text-xs px-2 py-1">
            {activeFiltersCount}
          </Badge>
        )}
        {isOpen ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
      </Button>

      {/* Panel de filtros */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-2 shadow-2xl border-0 bg-white z-50 max-h-96 overflow-y-auto">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-green-700">
                Filtros de búsqueda
              </CardTitle>
              <div className="flex items-center gap-2">
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-green-600 hover:text-green-700"
                  >
                    Limpiar todo
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Rango de precios */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium text-gray-700">
                  Precio por ronda
                </Label>
                {(filters.priceRange[0] > 100 || filters.priceRange[1] < 500) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearSpecificFilter('priceRange')}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => handleFilterChange('priceRange', value)}
                max={500}
                min={100}
                step={25}
                className="mb-2"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>${filters.priceRange[0]}</span>
                <span>${filters.priceRange[1]}+</span>
              </div>
            </div>

            {/* Número de hoyos */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium text-gray-700">
                  Número de hoyos
                </Label>
                {filters.holes.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearSpecificFilter('holes')}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                {holesOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`holes-${option.id}`}
                      checked={filters.holes.includes(option.id)}
                      onCheckedChange={() => handleArrayFilterToggle('holes', option.id)}
                    />
                    <Label htmlFor={`holes-${option.id}`} className="text-sm flex-1 cursor-pointer">
                      {option.label}
                    </Label>
                    <span className="text-xs text-gray-500">({option.count})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Servicios */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium text-gray-700">
                  Servicios disponibles
                </Label>
                {filters.services.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearSpecificFilter('services')}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {servicesOptions.map((service) => (
                  <div key={service.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`service-${service.id}`}
                      checked={filters.services.includes(service.id)}
                      onCheckedChange={() => handleArrayFilterToggle('services', service.id)}
                    />
                    <Label htmlFor={`service-${service.id}`} className="text-xs flex items-center gap-1 cursor-pointer">
                      {service.icon}
                      {service.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Dificultad */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium text-gray-700">
                  Nivel de dificultad
                </Label>
                {filters.difficulty.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearSpecificFilter('difficulty')}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                {difficultyOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`difficulty-${option.id}`}
                      checked={filters.difficulty.includes(option.id)}
                      onCheckedChange={() => handleArrayFilterToggle('difficulty', option.id)}
                    />
                    <Label htmlFor={`difficulty-${option.id}`} className="text-sm flex-1 cursor-pointer">
                      <Badge className={`${option.color} text-xs mr-2`}>
                        {option.label}
                      </Badge>
                    </Label>
                    <span className="text-xs text-gray-500">({option.count})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Calificación mínima */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium text-gray-700">
                  Calificación mínima
                </Label>
                {filters.rating > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearSpecificFilter('rating')}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                  <div key={rating} className="flex items-center space-x-2">
                    <Checkbox
                      id={`rating-${rating}`}
                      checked={filters.rating === rating}
                      onCheckedChange={() => handleFilterChange('rating', filters.rating === rating ? 0 : rating)}
                    />
                    <Label htmlFor={`rating-${rating}`} className="text-sm flex items-center gap-1 cursor-pointer">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      {rating}+ estrellas
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Características especiales */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium text-gray-700">
                  Características especiales
                </Label>
                {filters.features.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearSpecificFilter('features')}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {featuresOptions.map((feature) => (
                  <div key={feature.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`feature-${feature.id}`}
                      checked={filters.features.includes(feature.id)}
                      onCheckedChange={() => handleArrayFilterToggle('features', feature.id)}
                    />
                    <Label htmlFor={`feature-${feature.id}`} className="text-xs cursor-pointer">
                      {feature.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chips de filtros activos */}
      {activeFiltersCount > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {(filters.priceRange[0] > 100 || filters.priceRange[1] < 500) && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              ${filters.priceRange[0]} - ${filters.priceRange[1]}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearSpecificFilter('priceRange')}
                className="ml-1 h-auto p-0 text-green-600 hover:text-green-800"
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
          
          {filters.holes.map((hole) => (
            <Badge key={hole} variant="secondary" className="bg-green-100 text-green-800">
              {hole} hoyos
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleArrayFilterToggle('holes', hole)}
                className="ml-1 h-auto p-0 text-green-600 hover:text-green-800"
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          ))}
          
          {filters.services.map((service) => {
            const serviceOption = servicesOptions.find(s => s.id === service)
            return (
              <Badge key={service} variant="secondary" className="bg-green-100 text-green-800">
                {serviceOption?.label}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleArrayFilterToggle('services', service)}
                  className="ml-1 h-auto p-0 text-green-600 hover:text-green-800"
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            )
          })}
          
          {filters.rating > 0 && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {filters.rating}+ ⭐
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearSpecificFilter('rating')}
                className="ml-1 h-auto p-0 text-green-600 hover:text-green-800"
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}

