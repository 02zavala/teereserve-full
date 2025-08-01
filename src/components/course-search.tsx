"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Search,
  MapPin,
  Calendar as CalendarIcon,
  DollarSign,
  Star,
  Filter,
  X,
  Users
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface SearchFilters {
  location: string
  date: Date | undefined
  players: number
  priceRange: [number, number]
  rating: number
  holes: string
  search: string
}

interface CourseSearchProps {
  onFiltersChange: (filters: SearchFilters) => void
  initialFilters?: Partial<SearchFilters>
}

const locations = [
  "Todos los lugares",
  "Los Cabos, BCS",
  "San José del Cabo, BCS",
  "Cabo San Lucas, BCS",
  "Chapala, Jalisco",
  "Punta de Mita, Nayarit"
]

const holeOptions = [
  { value: "all", label: "Todos" },
  { value: "18", label: "18 hoyos" },
  { value: "27", label: "27 hoyos" },
  { value: "36", label: "36 hoyos" }
]

export default function CourseSearch({ onFiltersChange, initialFilters = {} }: CourseSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    location: initialFilters.location || "Todos los lugares",
    date: initialFilters.date,
    players: initialFilters.players || 4,
    priceRange: initialFilters.priceRange || [500, 5000],
    rating: initialFilters.rating || 0,
    holes: initialFilters.holes || "all",
    search: initialFilters.search || ""
  })

  const [showAdvanced, setShowAdvanced] = useState(false)

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFiltersChange(updatedFilters)
  }

  const clearFilters = () => {
    const clearedFilters: SearchFilters = {
      location: "Todos los lugares",
      date: undefined,
      players: 4,
      priceRange: [500, 5000],
      rating: 0,
      holes: "all",
      search: ""
    }
    setFilters(clearedFilters)
    onFiltersChange(clearedFilters)
    setShowAdvanced(false)
  }

  const hasActiveFilters =
    filters.location !== "Todos los lugares" ||
    filters.date ||
    filters.players !== 4 ||
    filters.priceRange[0] !== 500 ||
    filters.priceRange[1] !== 5000 ||
    filters.rating > 0 ||
    filters.holes !== "all" ||
    filters.search

  return (
    <Card className="border-golf-beige-300 shadow-lg">
      <CardHeader className="bg-golf-green-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center">
          <Search className="w-5 h-5 mr-2" />
          Buscar Campos de Golf
        </CardTitle>
        <CardDescription className="text-golf-beige-200">
          Encuentra tu campo perfecto con filtros avanzados
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Quick Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-golf-green-500" />
          <Input
            placeholder="Buscar por nombre de campo..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="pl-10 border-golf-green-300 focus:border-golf-green-500"
          />
        </div>

        {/* Main Filters Row */}
        <div className="grid md:grid-cols-4 gap-4">
          {/* Location */}
          <div>
            <Label className="text-golf-green-700 font-medium mb-2 block">
              <MapPin className="w-4 h-4 inline mr-1" />
              Ubicación
            </Label>
            <Select
              value={filters.location}
              onValueChange={(value) => updateFilters({ location: value })}
            >
              <SelectTrigger className="border-golf-green-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div>
            <Label className="text-golf-green-700 font-medium mb-2 block">
              <CalendarIcon className="w-4 h-4 inline mr-1" />
              Fecha
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal border-golf-green-300",
                    !filters.date && "text-muted-foreground"
                  )}
                >
                  {filters.date ? (
                    format(filters.date, "PPP", { locale: es })
                  ) : (
                    <span>Seleccionar fecha</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.date}
                  onSelect={(date) => updateFilters({ date })}
                  initialFocus
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Players */}
          <div>
            <Label className="text-golf-green-700 font-medium mb-2 block">
              <Users className="w-4 h-4 inline mr-1" />
              Jugadores
            </Label>
            <Select
              value={filters.players.toString()}
              onValueChange={(value) => updateFilters({ players: parseInt(value) })}
            >
              <SelectTrigger className="border-golf-green-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Jugador</SelectItem>
                <SelectItem value="2">2 Jugadores</SelectItem>
                <SelectItem value="3">3 Jugadores</SelectItem>
                <SelectItem value="4">4 Jugadores</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <Button
              className="w-full bg-golf-green-600 hover:bg-golf-green-700 text-white font-semibold py-6"
              size="lg"
            >
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </Button>
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="flex items-center justify-between pt-4 border-t border-golf-beige-200">
          <Button
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="border-golf-green-600 text-golf-green-700 hover:bg-golf-green-50"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros Avanzados
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="text-golf-green-600 hover:text-golf-green-700"
            >
              <X className="w-4 h-4 mr-2" />
              Limpiar Filtros
            </Button>
          )}
        </div>

        {/* Advanced Filters Panel */}
        {showAdvanced && (
          <div className="bg-golf-beige-50 rounded-lg p-6 space-y-6 border border-golf-beige-200">
            <h4 className="font-semibold text-golf-green-600 text-lg">Filtros Avanzados</h4>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Price Range */}
              <div>
                <Label className="text-golf-green-700 font-medium mb-3 block">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Rango de Precio (MXN)
                </Label>
                <div className="px-3">
                  <Slider
                    value={filters.priceRange}
                    onValueChange={(value) => updateFilters({ priceRange: value as [number, number] })}
                    max={6000}
                    min={500}
                    step={100}
                    className="mb-3"
                  />
                  <div className="flex justify-between text-sm text-golf-green-600">
                    <span>${filters.priceRange[0].toLocaleString()}</span>
                    <span>${filters.priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div>
                <Label className="text-golf-green-700 font-medium mb-3 block">
                  <Star className="w-4 h-4 inline mr-1" />
                  Rating Mínimo
                </Label>
                <div className="flex space-x-2">
                  {[0, 3, 4, 4.5, 4.8].map((rating) => (
                    <Button
                      key={rating}
                      variant={filters.rating === rating ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateFilters({ rating })}
                      className={filters.rating === rating ?
                        "bg-golf-green-600 text-white" :
                        "border-golf-green-300 text-golf-green-700"
                      }
                    >
                      {rating === 0 ? "Todos" : `${rating}+ ⭐`}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Holes */}
              <div>
                <Label className="text-golf-green-700 font-medium mb-3 block">
                  Número de Hoyos
                </Label>
                <div className="flex space-x-2">
                  {holeOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={filters.holes === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateFilters({ holes: option.value })}
                      className={filters.holes === option.value ?
                        "bg-golf-green-600 text-white" :
                        "border-golf-green-300 text-golf-green-700"
                      }
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-golf-beige-200">
            <span className="text-sm font-medium text-golf-green-700 mr-2">Filtros activos:</span>

            {filters.location !== "Todos los lugares" && (
              <Badge variant="secondary" className="bg-golf-green-100 text-golf-green-700">
                📍 {filters.location}
                <button
                  onClick={() => updateFilters({ location: "Todos los lugares" })}
                  className="ml-2 hover:text-golf-green-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}

            {filters.date && (
              <Badge variant="secondary" className="bg-golf-green-100 text-golf-green-700">
                📅 {format(filters.date, "dd/MM/yyyy")}
                <button
                  onClick={() => updateFilters({ date: undefined })}
                  className="ml-2 hover:text-golf-green-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}

            {filters.players !== 4 && (
              <Badge variant="secondary" className="bg-golf-green-100 text-golf-green-700">
                👥 {filters.players} jugadores
                <button
                  onClick={() => updateFilters({ players: 4 })}
                  className="ml-2 hover:text-golf-green-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}

            {(filters.priceRange[0] !== 500 || filters.priceRange[1] !== 5000) && (
              <Badge variant="secondary" className="bg-golf-green-100 text-golf-green-700">
                💰 ${filters.priceRange[0].toLocaleString()} - ${filters.priceRange[1].toLocaleString()}
                <button
                  onClick={() => updateFilters({ priceRange: [500, 5000] })}
                  className="ml-2 hover:text-golf-green-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}

            {filters.rating > 0 && (
              <Badge variant="secondary" className="bg-golf-green-100 text-golf-green-700">
                ⭐ {filters.rating}+ rating
                <button
                  onClick={() => updateFilters({ rating: 0 })}
                  className="ml-2 hover:text-golf-green-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
