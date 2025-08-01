"use client"

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Star, 
  MapPin, 
  Phone, 
  Heart,
  Share2,
  Users, 
  DollarSign,
  Calendar,
  Clock,
  Wifi,
  Car,
  Coffee,
  Utensils,
  ChevronLeft,
  ChevronRight,
  Play,
  Award,
  TrendingUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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
  features: string
  difficulty: string
}

interface EnhancedCourseCardProps {
  course: GolfCourse
  className?: string
  layout?: 'grid' | 'list'
}

export default function EnhancedCourseCard({ 
  course, 
  className = '', 
  layout = 'grid' 
}: EnhancedCourseCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [showAllImages, setShowAllImages] = useState(false)

  const images = course.images && course.images.length > 0 ? course.images : [course.image]
  
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const getDifficultyColor = (difficulty: string) => {
    if (difficulty.includes('Principiante')) return 'bg-green-100 text-green-800 border-green-200'
    if (difficulty.includes('Intermedio')) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    if (difficulty.includes('Avanzado')) return 'bg-red-100 text-red-800 border-red-200'
    return 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getServiceIcon = (feature: string) => {
    const featureLower = feature.toLowerCase()
    if (featureLower.includes('wifi')) return <Wifi className="w-3 h-3" />
    if (featureLower.includes('parking') || featureLower.includes('estacionamiento')) return <Car className="w-3 h-3" />
    if (featureLower.includes('restaurant') || featureLower.includes('comida')) return <Utensils className="w-3 h-3" />
    if (featureLower.includes('coffee') || featureLower.includes('café')) return <Coffee className="w-3 h-3" />
    return <Award className="w-3 h-3" />
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    }).format(price)
  }

  if (layout === 'list') {
    return (
      <Card className={`overflow-hidden border-green-200 hover:border-green-300 transition-all duration-300 hover:shadow-xl group ${className}`}>
        <div className="flex flex-col md:flex-row">
          {/* Galería de imágenes */}
          <div className="relative md:w-80 h-64 md:h-auto">
            <Image
              src={images[currentImageIndex]}
              alt={course.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 320px"
            />
            
            {/* Controles de galería */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-700" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight className="w-4 h-4 text-gray-700" />
                </button>
                
                {/* Indicadores de imagen */}
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Badges superiores */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              <Badge className="bg-green-600 text-white text-sm px-3 py-1">
                {course.holes} hoyos
              </Badge>
              {course.rating >= 4.5 && (
                <Badge className="bg-yellow-500 text-white text-sm px-3 py-1 flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  Premium
                </Badge>
              )}
            </div>

            {/* Acciones superiores */}
            <div className="absolute top-3 right-3 flex flex-col gap-2">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-2 rounded-full transition-all duration-200 ${
                  isLiked 
                    ? 'bg-red-500 text-white' 
                    : 'bg-white/80 hover:bg-white text-gray-700'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              </button>
              <button className="p-2 bg-white/80 hover:bg-white rounded-full text-gray-700 transition-all duration-200">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Contenido */}
          <div className="flex-1 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-bold text-green-700 group-hover:text-green-800 transition-colors">
                    {course.name}
                  </h3>
                  <Badge className={`${getDifficultyColor(course.difficulty)} text-sm px-3 py-1 border`}>
                    {course.difficulty}
                  </Badge>
                </div>
                
                <div className="flex items-center text-green-600 mb-3">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span className="text-lg">{course.city}, {course.state}</span>
                </div>
                
                <div className="flex items-center mb-4">
                  <Star className="w-5 h-5 text-yellow-500 fill-current mr-2" />
                  <span className="text-xl font-semibold text-green-700">{course.rating}</span>
                  <span className="text-green-600 ml-2 text-lg">({course.reviewCount} reseñas)</span>
                  {course.rating >= 4.5 && (
                    <Badge variant="secondary" className="ml-3 bg-green-100 text-green-800">
                      Excelente
                    </Badge>
                  )}
                </div>
              </div>

              {/* Precio destacado */}
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">Desde</div>
                <div className="text-3xl font-bold text-green-700">
                  {formatPrice(course.priceWeekday)}
                </div>
                <div className="text-sm text-gray-600">por ronda</div>
                {course.priceWeekend > course.priceWeekday && (
                  <div className="text-xs text-gray-500 mt-1">
                    Fin de semana: {formatPrice(course.priceWeekend)}
                  </div>
                )}
              </div>
            </div>

            {/* Estadísticas del campo */}
            <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Users className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm font-medium text-gray-700">Par</span>
                </div>
                <div className="text-lg font-bold text-green-700">{course.par}</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm font-medium text-gray-700">Longitud</span>
                </div>
                <div className="text-lg font-bold text-green-700">{course.length}m</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Clock className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm font-medium text-gray-700">Duración</span>
                </div>
                <div className="text-lg font-bold text-green-700">4-5h</div>
              </div>
            </div>

            {/* Características */}
            <div className="flex flex-wrap gap-2 mb-6">
              {course.features.split(',').slice(0, 4).map((feature, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="border-green-300 text-green-700 text-sm px-3 py-1 flex items-center gap-1"
                >
                  {getServiceIcon(feature.trim())}
                  {feature.trim()}
                </Badge>
              ))}
              {course.features.split(',').length > 4 && (
                <Badge variant="outline" className="border-gray-300 text-gray-600 text-sm px-3 py-1">
                  +{course.features.split(',').length - 4} más
                </Badge>
              )}
            </div>

            {/* Acciones */}
            <div className="flex gap-3">
              <Button 
                asChild 
                className="flex-1 bg-green-600 hover:bg-green-700 text-white text-lg py-3 transition-all duration-200 hover:shadow-lg"
              >
                <Link href={`/courses/${course.slug}`}>
                  Ver Detalles y Reservar
                </Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                className="border-green-300 text-green-700 hover:bg-green-50 text-lg py-3 px-6 transition-all duration-200"
              >
                <a href={`tel:${course.phone}`}>
                  <Phone className="w-4 h-4 mr-2" />
                  Llamar
                </a>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  // Layout de grid (tarjeta vertical)
  return (
    <Card className={`overflow-hidden border-green-200 hover:border-green-300 transition-all duration-300 hover:shadow-xl group ${className}`}>
      {/* Galería de imágenes */}
      <div className="relative h-64">
        <Image
          src={images[currentImageIndex]}
          alt={course.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Controles de galería */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="w-4 h-4 text-gray-700" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="w-4 h-4 text-gray-700" />
            </button>
            
            {/* Indicadores de imagen */}
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Badges superiores */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <Badge className="bg-green-600 text-white text-sm px-3 py-1">
            {course.holes} hoyos
          </Badge>
          {course.rating >= 4.5 && (
            <Badge className="bg-yellow-500 text-white text-sm px-3 py-1 flex items-center gap-1">
              <Award className="w-3 h-3" />
              Premium
            </Badge>
          )}
        </div>

        {/* Dificultad */}
        <div className="absolute top-3 right-3">
          <Badge className={`${getDifficultyColor(course.difficulty)} text-sm px-3 py-1 border`}>
            {course.difficulty}
          </Badge>
        </div>

        {/* Acciones flotantes */}
        <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`p-2 rounded-full transition-all duration-200 ${
              isLiked 
                ? 'bg-red-500 text-white' 
                : 'bg-white/80 hover:bg-white text-gray-700'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </button>
          <button className="p-2 bg-white/80 hover:bg-white rounded-full text-gray-700 transition-all duration-200">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-green-700 mb-2 group-hover:text-green-800 transition-colors">
            {course.name}
          </h3>
          <div className="flex items-center text-green-600 mb-3">
            <MapPin className="w-4 h-4 mr-2" />
            <span className="text-base">{course.city}, {course.state}</span>
          </div>
          
          <div className="flex items-center mb-4">
            <Star className="w-4 h-4 text-yellow-500 fill-current mr-2" />
            <span className="text-lg font-semibold text-green-700">{course.rating}</span>
            <span className="text-green-600 ml-2 text-base">({course.reviewCount})</span>
            {course.rating >= 4.5 && (
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 text-xs">
                Excelente
              </Badge>
            )}
          </div>
        </div>

        {/* Estadísticas compactas */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-base">
          <div className="flex items-center">
            <Users className="w-4 h-4 text-green-600 mr-2" />
            <span className="text-green-700">Par {course.par}</span>
          </div>
          <div className="flex items-center">
            <DollarSign className="w-4 h-4 text-green-600 mr-2" />
            <span className="text-green-700">Desde {formatPrice(course.priceWeekday)}</span>
          </div>
        </div>

        {/* Características */}
        <div className="flex flex-wrap gap-2 mb-6">
          {course.features.split(',').slice(0, 3).map((feature, index) => (
            <Badge 
              key={index} 
              variant="outline" 
              className="border-green-300 text-green-700 text-xs px-2 py-1 flex items-center gap-1"
            >
              {getServiceIcon(feature.trim())}
              {feature.trim()}
            </Badge>
          ))}
          {course.features.split(',').length > 3 && (
            <Badge variant="outline" className="border-gray-300 text-gray-600 text-xs px-2 py-1">
              +{course.features.split(',').length - 3} más
            </Badge>
          )}
        </div>

        {/* Acciones */}
        <div className="flex gap-3">
          <Button 
            asChild 
            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-base py-3 transition-all duration-200 hover:shadow-lg"
          >
            <Link href={`/courses/${course.slug}`}>
              Ver Detalles
            </Link>
          </Button>
          <Button 
            asChild 
            variant="outline" 
            className="border-green-300 text-green-700 hover:bg-green-50 text-base py-3 px-4 transition-all duration-200"
          >
            <a href={`tel:${course.phone}`}>
              <Phone className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

