"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Star, Upload, Camera, User, Clock, ThumbsUp, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Review {
  id: string
  userId: string
  userName: string
  userImage?: string
  rating: number
  title: string
  comment: string
  images?: string[]
  courseCondition?: number
  facilities?: number
  service?: number
  valueForMoney?: number
  isVerified: boolean
  playedDate?: string
  createdAt: string
  likes: number
  replies: number
}

interface ReviewsSystemProps {
  courseId: string
  courseName: string
}

const StarRating = ({
  rating,
  onRatingChange,
  readonly = false,
  size = "w-5 h-5"
}: {
  rating: number
  onRatingChange?: (rating: number) => void
  readonly?: boolean
  size?: string
}) => {
  const [hoverRating, setHoverRating] = useState(0)

  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            size,
            "cursor-pointer transition-colors",
            star <= (hoverRating || rating)
              ? "fill-golf-gold-500 text-golf-gold-500"
              : "text-golf-beige-400"
          )}
          onClick={() => !readonly && onRatingChange?.(star)}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
        />
      ))}
    </div>
  )
}

export default function ReviewsSystem({ courseId, courseName }: ReviewsSystemProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [showWriteReview, setShowWriteReview] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // New review form state
  const [newReview, setNewReview] = useState({
    rating: 0,
    title: '',
    comment: '',
    courseCondition: 0,
    facilities: 0,
    service: 0,
    valueForMoney: 0,
    playedDate: '',
    images: [] as File[]
  })

  useEffect(() => {
    fetchReviews()
  }, [courseId])

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}/reviews`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
      // Mock data for development
      setReviews([
        {
          id: '1',
          userId: '1',
          userName: 'Carlos Mendoza',
          userImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
          rating: 5,
          title: 'Experiencia increíble',
          comment: 'El campo está en perfectas condiciones y las vistas son espectaculares. El personal fue muy amable y profesional. Definitivamente volveré.',
          images: [
            'https://images.unsplash.com/photo-1535132011086-b8818f016104?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400&h=300&fit=crop'
          ],
          courseCondition: 5,
          facilities: 4,
          service: 5,
          valueForMoney: 4,
          isVerified: true,
          playedDate: '2025-01-02',
          createdAt: '2025-01-03T10:30:00Z',
          likes: 12,
          replies: 3
        },
        {
          id: '2',
          userId: '2',
          userName: 'Ana García',
          rating: 4,
          title: 'Muy buen campo',
          comment: 'Campo desafiante con hermosas vistas al mar. Los greens estaban en excelentes condiciones.',
          courseCondition: 4,
          facilities: 4,
          service: 4,
          valueForMoney: 3,
          isVerified: true,
          playedDate: '2024-12-28',
          createdAt: '2024-12-29T15:45:00Z',
          likes: 8,
          replies: 1
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setNewReview(prev => ({
      ...prev,
      images: [...prev.images, ...files].slice(0, 5) // Max 5 images
    }))
  }

  const removeImage = (index: number) => {
    setNewReview(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const submitReview = async () => {
    if (!newReview.rating || !newReview.comment) {
      alert('Por favor completa la calificación y comentario')
      return
    }

    setSubmitting(true)
    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('courseId', courseId)
      formData.append('rating', newReview.rating.toString())
      formData.append('title', newReview.title)
      formData.append('comment', newReview.comment)
      formData.append('courseCondition', newReview.courseCondition.toString())
      formData.append('facilities', newReview.facilities.toString())
      formData.append('service', newReview.service.toString())
      formData.append('valueForMoney', newReview.valueForMoney.toString())
      formData.append('playedDate', newReview.playedDate)

      newReview.images.forEach((file, index) => {
        formData.append(`image_${index}`, file)
      })

      const response = await fetch('/api/reviews', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        alert('¡Reseña enviada exitosamente!')
        setShowWriteReview(false)
        setNewReview({
          rating: 0,
          title: '',
          comment: '',
          courseCondition: 0,
          facilities: 0,
          service: 0,
          valueForMoney: 0,
          playedDate: '',
          images: []
        })
        fetchReviews() // Refresh reviews
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Error al enviar reseña')
    } finally {
      setSubmitting(false)
    }
  }

  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
    : 0

  if (loading) {
    return (
      <Card className="border-golf-beige-300">
        <CardContent className="p-6 text-center">
          <div className="animate-pulse">Cargando reseñas...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Reviews Summary */}
      <Card className="border-golf-beige-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-golf-green-600">Reseñas de {courseName}</CardTitle>
              <CardDescription>
                {reviews.length} reseñas • Rating promedio: {averageRating.toFixed(1)}
              </CardDescription>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-golf-gold-600">{averageRating.toFixed(1)}</div>
              <StarRating rating={averageRating} readonly />
              <div className="text-sm text-golf-green-600 mt-1">{reviews.length} reseñas</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => setShowWriteReview(!showWriteReview)}
            className="bg-golf-green-600 hover:bg-golf-green-700 text-white"
          >
            <Star className="w-4 h-4 mr-2" />
            Escribir Reseña
          </Button>
        </CardContent>
      </Card>

      {/* Write Review Form */}
      {showWriteReview && (
        <Card className="border-golf-green-300">
          <CardHeader>
            <CardTitle className="text-golf-green-600">Escribe tu Reseña</CardTitle>
            <CardDescription>Comparte tu experiencia en {courseName}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall Rating */}
            <div>
              <Label className="text-golf-green-700 font-medium mb-2 block">
                Calificación General *
              </Label>
              <StarRating
                rating={newReview.rating}
                onRatingChange={(rating) => setNewReview(prev => ({ ...prev, rating }))}
                size="w-8 h-8"
              />
            </div>

            {/* Detailed Ratings */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-golf-green-700 text-sm mb-2 block">Estado del Campo</Label>
                <StarRating
                  rating={newReview.courseCondition}
                  onRatingChange={(rating) => setNewReview(prev => ({ ...prev, courseCondition: rating }))}
                />
              </div>
              <div>
                <Label className="text-golf-green-700 text-sm mb-2 block">Instalaciones</Label>
                <StarRating
                  rating={newReview.facilities}
                  onRatingChange={(rating) => setNewReview(prev => ({ ...prev, facilities: rating }))}
                />
              </div>
              <div>
                <Label className="text-golf-green-700 text-sm mb-2 block">Servicio</Label>
                <StarRating
                  rating={newReview.service}
                  onRatingChange={(rating) => setNewReview(prev => ({ ...prev, service: rating }))}
                />
              </div>
              <div>
                <Label className="text-golf-green-700 text-sm mb-2 block">Relación Calidad-Precio</Label>
                <StarRating
                  rating={newReview.valueForMoney}
                  onRatingChange={(rating) => setNewReview(prev => ({ ...prev, valueForMoney: rating }))}
                />
              </div>
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="title" className="text-golf-green-700 font-medium">Título</Label>
              <Input
                id="title"
                placeholder="Resume tu experiencia en pocas palabras"
                value={newReview.title}
                onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                className="border-golf-green-300"
              />
            </div>

            {/* Comment */}
            <div>
              <Label htmlFor="comment" className="text-golf-green-700 font-medium">Comentario *</Label>
              <Textarea
                id="comment"
                placeholder="Cuéntanos sobre tu experiencia en este campo de golf..."
                value={newReview.comment}
                onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                className="border-golf-green-300 min-h-[120px]"
                required
              />
            </div>

            {/* Played Date */}
            <div>
              <Label htmlFor="playedDate" className="text-golf-green-700 font-medium">Fecha de Juego</Label>
              <Input
                id="playedDate"
                type="date"
                value={newReview.playedDate}
                onChange={(e) => setNewReview(prev => ({ ...prev, playedDate: e.target.value }))}
                className="border-golf-green-300"
              />
            </div>

            {/* Photo Upload */}
            <div>
              <Label className="text-golf-green-700 font-medium mb-2 block">Fotos (máximo 5)</Label>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    id="photos"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="photos"
                    className="flex items-center px-4 py-2 border-2 border-dashed border-golf-green-300 rounded-lg cursor-pointer hover:border-golf-green-500 transition-colors"
                  >
                    <Camera className="w-5 h-5 mr-2 text-golf-green-600" />
                    Agregar Fotos
                  </label>
                </div>

                {/* Image Preview */}
                {newReview.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {newReview.images.map((file, index) => (
                      <div key={index} className="relative">
                        <Image
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          width={100}
                          height={100}
                          className="object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-4">
              <Button
                onClick={submitReview}
                disabled={submitting}
                className="bg-golf-green-600 hover:bg-golf-green-700 text-white"
              >
                {submitting ? 'Enviando...' : 'Publicar Reseña'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowWriteReview(false)}
                className="border-golf-green-600 text-golf-green-700"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id} className="border-golf-beige-300">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-golf-green-600 rounded-full flex items-center justify-center">
                    {review.userImage ? (
                      <Image
                        src={review.userImage}
                        alt={review.userName}
                        width={48}
                        height={48}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-golf-green-700">{review.userName}</span>
                      {review.isVerified && (
                        <Badge className="bg-golf-green-100 text-golf-green-700 text-xs">
                          Verificado
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-golf-green-600">
                      <Clock className="w-4 h-4" />
                      {new Date(review.createdAt).toLocaleDateString('es-MX')}
                      {review.playedDate && (
                        <span>• Jugó el {new Date(review.playedDate).toLocaleDateString('es-MX')}</span>
                      )}
                    </div>
                  </div>
                </div>
                <StarRating rating={review.rating} readonly />
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {review.title && (
                <h4 className="font-semibold text-golf-green-700">{review.title}</h4>
              )}

              <p className="text-golf-green-700 leading-relaxed">{review.comment}</p>

              {/* Detailed Ratings */}
              {(review.courseCondition || review.facilities || review.service || review.valueForMoney) && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-golf-beige-50 rounded-lg">
                  {review.courseCondition && (
                    <div className="text-center">
                      <div className="text-sm text-golf-green-600 mb-1">Campo</div>
                      <StarRating rating={review.courseCondition} readonly size="w-3 h-3" />
                    </div>
                  )}
                  {review.facilities && (
                    <div className="text-center">
                      <div className="text-sm text-golf-green-600 mb-1">Instalaciones</div>
                      <StarRating rating={review.facilities} readonly size="w-3 h-3" />
                    </div>
                  )}
                  {review.service && (
                    <div className="text-center">
                      <div className="text-sm text-golf-green-600 mb-1">Servicio</div>
                      <StarRating rating={review.service} readonly size="w-3 h-3" />
                    </div>
                  )}
                  {review.valueForMoney && (
                    <div className="text-center">
                      <div className="text-sm text-golf-green-600 mb-1">Precio</div>
                      <StarRating rating={review.valueForMoney} readonly size="w-3 h-3" />
                    </div>
                  )}
                </div>
              )}

              {/* Review Images */}
              {review.images && review.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {review.images.map((image, index) => (
                    <div key={index} className="relative aspect-video">
                      <Image
                        src={image}
                        alt={`Foto ${index + 1} de ${review.userName}`}
                        fill
                        className="object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center space-x-4 pt-2 border-t border-golf-beige-200">
                <button className="flex items-center space-x-2 text-sm text-golf-green-600 hover:text-golf-green-700">
                  <ThumbsUp className="w-4 h-4" />
                  <span>{review.likes}</span>
                </button>
                <button className="flex items-center space-x-2 text-sm text-golf-green-600 hover:text-golf-green-700">
                  <MessageCircle className="w-4 h-4" />
                  <span>{review.replies} respuestas</span>
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
