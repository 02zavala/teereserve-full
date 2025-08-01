"use client"

import { useState, useEffect, useRef } from 'react'
import { Search, MapPin, Calendar, Users, Clock, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface SearchSuggestion {
  id: string
  type: 'location' | 'course' | 'popular'
  title: string
  subtitle?: string
  icon: React.ReactNode
}

interface AdvancedSearchBarProps {
  onSearch: (searchData: SearchData) => void
  className?: string
}

interface SearchData {
  location: string
  checkIn?: Date
  checkOut?: Date
  players: number
  searchTerm: string
}

export default function AdvancedSearchBar({ onSearch, className = '' }: AdvancedSearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [location, setLocation] = useState('')
  const [players, setPlayers] = useState(2)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [isLocationSearch, setIsLocationSearch] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Sugerencias populares
  const popularSuggestions: SearchSuggestion[] = [
    {
      id: 'cabo',
      type: 'location',
      title: 'Los Cabos',
      subtitle: '12 campos disponibles',
      icon: <MapPin className="w-4 h-4" />
    },
    {
      id: 'paz',
      type: 'location', 
      title: 'La Paz',
      subtitle: '3 campos disponibles',
      icon: <MapPin className="w-4 h-4" />
    },
    {
      id: 'loreto',
      type: 'location',
      title: 'Loreto',
      subtitle: '2 campos disponibles', 
      icon: <MapPin className="w-4 h-4" />
    },
    {
      id: 'cabo-real',
      type: 'course',
      title: 'Cabo Real Golf Club',
      subtitle: 'Los Cabos • 4.8 ⭐',
      icon: <Star className="w-4 h-4" />
    },
    {
      id: 'palmilla',
      type: 'course',
      title: 'One&Only Palmilla',
      subtitle: 'Los Cabos • 4.9 ⭐',
      icon: <Star className="w-4 h-4" />
    },
    {
      id: 'cerca-de-mi',
      type: 'popular',
      title: 'Cerca de mí',
      subtitle: 'Usar mi ubicación actual',
      icon: <MapPin className="w-4 h-4" />
    }
  ]

  // Filtrar sugerencias basadas en el término de búsqueda
  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = popularSuggestions.filter(suggestion =>
        suggestion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        suggestion.subtitle?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setSuggestions(filtered)
    } else {
      setSuggestions(popularSuggestions)
    }
  }, [searchTerm])

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = () => {
    const searchData: SearchData = {
      location,
      players,
      searchTerm
    }
    onSearch(searchData)
    setShowSuggestions(false)
  }

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'location') {
      setLocation(suggestion.title)
      setSearchTerm(suggestion.title)
    } else if (suggestion.type === 'course') {
      setSearchTerm(suggestion.title)
    } else if (suggestion.id === 'cerca-de-mi') {
      // Implementar geolocalización
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation('Cerca de mí')
            setSearchTerm('Cerca de mí')
          },
          (error) => {
            console.error('Error getting location:', error)
          }
        )
      }
    }
    setShowSuggestions(false)
    handleSearch()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      {/* Barra de búsqueda principal estilo Booking.com */}
      <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardContent className="p-2">
          <div className="flex flex-col lg:flex-row gap-2">
            {/* Campo de búsqueda principal */}
            <div className="flex-1 relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="¿A dónde quieres jugar golf? (ciudad, campo, resort...)"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setShowSuggestions(true)
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyPress={handleKeyPress}
                  className="pl-12 pr-4 py-4 text-lg border-0 focus:ring-2 focus:ring-green-500 rounded-lg"
                />
              </div>
            </div>

            {/* Selector de jugadores */}
            <div className="lg:w-48">
              <div className="relative">
                <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={players}
                  onChange={(e) => setPlayers(Number(e.target.value))}
                  className="w-full pl-12 pr-4 py-4 text-lg border-0 focus:ring-2 focus:ring-green-500 rounded-lg bg-white appearance-none cursor-pointer"
                >
                  <option value={1}>1 Jugador</option>
                  <option value={2}>2 Jugadores</option>
                  <option value={3}>3 Jugadores</option>
                  <option value={4}>4 Jugadores</option>
                  <option value={5}>5+ Jugadores</option>
                </select>
              </div>
            </div>

            {/* Botón de búsqueda */}
            <Button
              onClick={handleSearch}
              className="lg:w-32 bg-green-600 hover:bg-green-700 text-white py-4 px-8 text-lg font-semibold rounded-lg transition-all duration-200 hover:shadow-lg"
            >
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sugerencias desplegables */}
      {showSuggestions && (
        <Card className="absolute top-full left-0 right-0 mt-2 shadow-2xl border-0 bg-white z-50 max-h-96 overflow-y-auto">
          <CardContent className="p-0">
            {suggestions.length > 0 ? (
              <div className="py-2">
                {searchTerm.length === 0 && (
                  <div className="px-4 py-3 border-b border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                      Destinos Populares
                    </h4>
                  </div>
                )}
                
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 flex items-center gap-3"
                  >
                    <div className="text-gray-400">
                      {suggestion.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {suggestion.title}
                      </div>
                      {suggestion.subtitle && (
                        <div className="text-sm text-gray-500">
                          {suggestion.subtitle}
                        </div>
                      )}
                    </div>
                    {suggestion.type === 'popular' && (
                      <Badge variant="secondary" className="text-xs">
                        Popular
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No se encontraron sugerencias</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Búsquedas rápidas */}
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="text-sm text-gray-600 mr-2">Búsquedas populares:</span>
        {['Los Cabos', 'Cerca de mí', 'Campos premium', 'Ofertas especiales'].map((term) => (
          <button
            key={term}
            onClick={() => {
              setSearchTerm(term)
              handleSearch()
            }}
            className="text-sm bg-white/80 hover:bg-white border border-gray-200 hover:border-green-300 px-3 py-1 rounded-full transition-all duration-200 hover:shadow-sm"
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  )
}

