'use client'

import { useState } from 'react'
import { Star, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Review {
  id: string
  userName: string
  rating: number
  comment: string
  date: string
  verified: boolean
}

interface ReviewsSectionProps {
  courseId: string
  courseName: string
  averageRating: number
  totalReviews: number
}

export function ReviewsSection({ 
  courseId, 
  courseName, 
  averageRating, 
  totalReviews 
}: ReviewsSectionProps) {
  const [reviews] = useState<Review[]>([
    {
      id: '1',
      userName: 'Carlos M.',
      rating: 5,
      comment: 'Excelente campo de golf con vistas espectaculares al mar. El diseño de Robert Trent Jones Jr. es desafiante pero justo. Definitivamente regresaré.',
      date: '2024-01-15',
      verified: true
    },
    {
      id: '2',
      userName: 'María G.',
      rating: 4,
      comment: 'Muy buen campo, bien mantenido y con un staff muy profesional. Los greens están en perfectas condiciones.',
      date: '2024-01-10',
      verified: true
    },
    {
      id: '3',
      userName: 'Roberto L.',
      rating: 5,
      comment: 'Una experiencia inolvidable. El hoyo 17 con vista al mar es simplemente espectacular. Altamente recomendado.',
      date: '2024-01-05',
      verified: true
    }
  ])

  const renderStars = (rating: number, size: 'sm' | 'lg' = 'sm') => {
    const starSize = size === 'lg' ? 'w-6 h-6' : 'w-4 h-4'
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="mt-8">
      {/* Resumen de Calificaciones */}
      <Card className="border-green-200 mb-6">
        <CardHeader>
          <CardTitle className="text-green-700 text-2xl">Reseñas y Calificaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-700 mb-2">{averageRating}</div>
              {renderStars(Math.round(averageRating), 'lg')}
              <div className="text-green-600 text-sm mt-1">
                Basado en {totalReviews} reseñas
              </div>
            </div>
            
            <div className="flex-1 ml-8">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = reviews.filter(r => r.rating === stars).length
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
                
                return (
                  <div key={stars} className="flex items-center mb-2">
                    <span className="text-sm text-green-700 w-8">{stars}</span>
                    <Star className="w-4 h-4 text-yellow-400 fill-current mr-2" />
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-green-600 w-8">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Reseñas */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id} className="border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <User className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-green-700 flex items-center">
                      {review.userName}
                      {review.verified && (
                        <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          Verificado
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-green-600">
                      {new Date(review.date).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
                {renderStars(review.rating)}
              </div>
              
              <p className="text-green-700 leading-relaxed">{review.comment}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Botón para ver más reseñas */}
      <div className="text-center mt-6">
        <Button 
          variant="outline" 
          className="border-green-300 text-green-700 hover:bg-green-50"
        >
          Ver todas las reseñas ({totalReviews})
        </Button>
      </div>

      {/* Mensaje de recomendación */}
      <div className="text-center mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="flex justify-center mb-2">
          {renderStars(5, 'lg')}
        </div>
        <p className="text-green-700 font-medium">
          Recomendaciones por golfistas como tú. Cada reseña es verificada.
        </p>
      </div>
    </div>
  )
}

