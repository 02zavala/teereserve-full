'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Star, ThumbsUp, Filter, ChevronDown, ChevronUp, Camera, MapPin, Users, Calendar, Verified } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'

interface Review {
  id: string
  userName: string
  userAvatar?: string
  rating: number
  date: string
  comment: string
  helpful: number
  categories: {
    campo: number
    servicio: number
    instalaciones: number
    precio: number
  }
  isVerified: boolean
  photos?: string[]
  golfLevel: 'Principiante' | 'Intermedio' | 'Avanzado'
  playedWith: string
}

interface EnhancedReviewsSectionProps {
  courseId: string
  courseName: string
  averageRating: number
  totalReviews: number
}

export default function EnhancedReviewsSection({ courseId, courseName, averageRating, totalReviews }: EnhancedReviewsSectionProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>('todos')
  const [sortBy, setSortBy] = useState<string>('recientes')
  const [showAllReviews, setShowAllReviews] = useState(false)

  // Datos simulados de reviews con categorías
  const reviews: Review[] = [
    {
      id: '1',
      userName: 'Carlos Mendoza',
      userAvatar: '/api/placeholder/64/64',
      rating: 5,
      date: '2024-01-15',
      comment: 'Excelente campo de golf con vistas espectaculares. El diseño de Jack Nicklaus realmente se nota en cada hoyo. El personal fue muy atento y las instalaciones están en perfectas condiciones.',
      helpful: 12,
      categories: { campo: 5, servicio: 5, instalaciones: 4, precio: 4 },
      isVerified: true,
      photos: [
        '/api/placeholder/300/200',
        '/api/placeholder/300/200'
      ],
      golfLevel: 'Avanzado',
      playedWith: 'Amigos'
    },
    {
      id: '2',
      userName: 'Ana García',
      userAvatar: '/api/placeholder/64/64',
      rating: 4,
      date: '2024-01-10',
      comment: 'Campo muy bien mantenido y desafiante. El restaurante tiene buena comida aunque un poco caro. Definitivamente regresaría para jugar otro round.',
      helpful: 8,
      categories: { campo: 5, servicio: 4, instalaciones: 4, precio: 3 },
      isVerified: true,
      golfLevel: 'Intermedio',
      playedWith: 'Familia'
    },
    {
      id: '3',
      userName: 'Roberto Silva',
      rating: 5,
      date: '2024-01-05',
      comment: 'Una experiencia increíble. Los greens están en condiciones perfectas y el caddie fue muy profesional. Vale cada peso.',
      helpful: 15,
      categories: { campo: 5, servicio: 5, instalaciones: 5, precio: 4 },
      isVerified: true,
      golfLevel: 'Avanzado',
      playedWith: 'Solo'
    }
  ]

  // Cálculos de estadísticas
  const ratingDistribution = [
    { stars: 5, count: 120, percentage: 60 },
    { stars: 4, count: 58, percentage: 29 },
    { stars: 3, count: 16, percentage: 8 },
    { stars: 2, count: 3, percentage: 2 },
    { stars: 1, count: 1, percentage: 1 }
  ]

  const categoryAverages = {
    campo: 4.6,
    servicio: 4.3,
    instalaciones: 4.4,
    precio: 3.9
  }

  const filters = [
    { id: 'todos', label: 'Todas las reseñas', count: totalReviews },
    { id: 'recientes', label: 'Más recientes', count: 45 },
    { id: 'mejor_valoradas', label: 'Mejor valoradas', count: 120 },
    { id: 'con_fotos', label: 'Con fotos', count: 32 },
    { id: 'verificadas', label: 'Verificadas', count: 156 }
  ]

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5'
    }
    
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3)

  return (
    <div className="mt-8">
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-green-700 text-2xl">Reseñas de Huéspedes</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Resumen General */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Calificación Principal */}
            <div className="text-center">
              <div className="text-6xl font-bold text-green-700 mb-2">{averageRating}</div>
              <div className="flex justify-center mb-2">
                {renderStars(Math.round(averageRating), 'lg')}
              </div>
              <p className="text-green-600 text-lg">Basado en {totalReviews} reseñas</p>
              <Badge className="mt-2 bg-green-600 text-white">Excelente</Badge>
            </div>

            {/* Distribución de Calificaciones */}
            <div className="space-y-3">
              {ratingDistribution.map((item) => (
                <div key={item.stars} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm font-medium text-green-700">{item.stars}</span>
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                  </div>
                  <Progress 
                    value={item.percentage} 
                    className="flex-1 h-2"
                  />
                  <span className="text-sm text-green-600 w-12">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-6" />

          {/* Calificaciones por Categoría */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-green-700 mb-4">Calificaciones por Categoría</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(categoryAverages).map(([category, rating]) => (
                <div key={category} className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-700 mb-1">{rating}</div>
                  <div className="flex justify-center mb-2">
                    {renderStars(Math.round(rating), 'sm')}
                  </div>
                  <div className="text-sm text-green-600 capitalize">{category}</div>
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-6" />

          {/* Filtros */}
          <div className="flex flex-wrap gap-2 mb-6">
            {filters.map((filter) => (
              <Button
                key={filter.id}
                variant={selectedFilter === filter.id ? "default" : "outline"}
                size="sm"
                className={selectedFilter === filter.id ? "bg-green-600 hover:bg-green-700" : "border-green-300 text-green-700 hover:bg-green-50"}
                onClick={() => setSelectedFilter(filter.id)}
              >
                <Filter className="w-3 h-3 mr-1" />
                {filter.label} ({filter.count})
              </Button>
            ))}
          </div>

          {/* Lista de Reseñas */}
          <div className="space-y-6">
            {displayedReviews.map((review) => (
              <Card key={review.id} className="border-gray-200">
                <CardContent className="pt-6">
                  {/* Header de la Reseña */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-700 font-semibold">
                          {getInitials(review.userName)}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-green-700">{review.userName}</h4>
                          {review.isVerified && (
                            <Badge variant="outline" className="border-green-300 text-green-700 text-xs">
                              <Verified className="w-3 h-3 mr-1" />
                              Verificado
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <span>{review.golfLevel}</span>
                          <span>•</span>
                          <span>Jugó con {review.playedWith}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 mb-1">
                        {renderStars(review.rating)}
                        <span className="ml-1 font-semibold text-green-700">{review.rating}</span>
                      </div>
                      <div className="text-sm text-green-600">
                        {new Date(review.date).toLocaleDateString('es-MX', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Calificaciones por Categoría */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                    {Object.entries(review.categories).map(([category, rating]) => (
                      <div key={category} className="text-center">
                        <div className="text-sm font-medium text-gray-700 mb-1 capitalize">{category}</div>
                        <div className="flex justify-center">
                          {renderStars(rating, 'sm')}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Comentario */}
                  <p className="text-green-700 leading-relaxed mb-4">{review.comment}</p>

                  {/* Acciones */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      Útil ({review.helpful})
                    </Button>
                    <div className="text-sm text-green-600">
                      ¿Te resultó útil esta reseña?
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Botón Ver Más */}
          {!showAllReviews && reviews.length > 3 && (
            <div className="text-center mt-6">
              <Button
                variant="outline"
                className="border-green-300 text-green-700 hover:bg-green-50"
                onClick={() => setShowAllReviews(true)}
              >
                <ChevronDown className="w-4 h-4 mr-2" />
                Ver todas las reseñas ({totalReviews})
              </Button>
            </div>
          )}

          {/* Mensaje Final */}
          <div className="text-center mt-8 p-6 bg-green-50 rounded-lg">
            <div className="flex justify-center mb-3">
              {renderStars(5, 'lg')}
            </div>
            <p className="text-green-700 text-lg font-medium">
              Recomendaciones por golfistas como tú. Cada reseña es verificada.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

