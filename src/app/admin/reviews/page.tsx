'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { 
  Star, Search, Filter, Eye, Check, X, Flag, MessageSquare,
  Calendar, MapPin, User, Image as ImageIcon, Download,
  AlertTriangle, ThumbsUp, ThumbsDown, MoreVertical,
  ChevronLeft, ChevronRight, Grid, List
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import Image from 'next/image'

interface Review {
  id: string
  userId: string
  userName: string
  userEmail: string
  courseId: string
  courseName: string
  rating: number
  title: string
  comment: string
  images: string[]
  date: string
  status: 'pending' | 'approved' | 'rejected' | 'flagged'
  isHighlighted: boolean
  adminResponse?: string
  adminResponseDate?: string
  helpfulVotes: number
  reportCount: number
}

const mockReviews: Review[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Carlos Mendoza',
    userEmail: 'carlos@email.com',
    courseId: '1',
    courseName: 'Cabo Real Golf Club',
    rating: 5,
    title: 'Experiencia excepcional en Cabo Real',
    comment: 'El campo está en condiciones perfectas, el servicio es de primera clase y las vistas son espectaculares. Definitivamente regresaré.',
    images: ['/images/review1-1.jpg', '/images/review1-2.jpg'],
    date: '2025-07-14T10:30:00Z',
    status: 'approved',
    isHighlighted: true,
    adminResponse: 'Gracias por tu reseña, Carlos. Nos alegra saber que disfrutaste tu experiencia.',
    adminResponseDate: '2025-07-14T15:00:00Z',
    helpfulVotes: 12,
    reportCount: 0
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Ana García',
    userEmail: 'ana@email.com',
    courseId: '4',
    courseName: 'Cabo del Sol Golf Club',
    rating: 4,
    title: 'Muy buen campo, algunas mejoras necesarias',
    comment: 'El campo es hermoso y desafiante. El personal es amable, aunque el servicio en el restaurante podría mejorar.',
    images: ['/images/review2-1.jpg'],
    date: '2025-07-13T14:20:00Z',
    status: 'pending',
    isHighlighted: false,
    helpfulVotes: 8,
    reportCount: 0
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'Roberto Silva',
    userEmail: 'roberto@email.com',
    courseId: '5',
    courseName: 'Solmar Golf Links',
    rating: 2,
    title: 'Decepcionante experiencia',
    comment: 'El campo no estaba en buenas condiciones, varios greens dañados y el servicio fue muy lento.',
    images: [],
    date: '2025-07-12T16:45:00Z',
    status: 'flagged',
    isHighlighted: false,
    helpfulVotes: 3,
    reportCount: 2
  },
  {
    id: '4',
    userId: 'user4',
    userName: 'María López',
    userEmail: 'maria@email.com',
    courseId: '1',
    courseName: 'Cabo Real Golf Club',
    rating: 5,
    title: 'Campo espectacular con vistas increíbles',
    comment: 'Una experiencia inolvidable. El diseño del campo es excepcional y las instalaciones de primera. Altamente recomendado.',
    images: ['/images/review4-1.jpg', '/images/review4-2.jpg', '/images/review4-3.jpg'],
    date: '2025-07-11T09:15:00Z',
    status: 'approved',
    isHighlighted: false,
    helpfulVotes: 15,
    reportCount: 0
  },
  {
    id: '5',
    userId: 'user5',
    userName: 'Diego Ramírez',
    userEmail: 'diego@email.com',
    courseId: '2',
    courseName: 'Palmilla Golf Club',
    rating: 4,
    title: 'Excelente campo, precio un poco alto',
    comment: 'El campo está muy bien mantenido y el personal es profesional. El único inconveniente es el precio, pero vale la pena.',
    images: ['/images/review5-1.jpg'],
    date: '2025-07-10T11:30:00Z',
    status: 'pending',
    isHighlighted: false,
    helpfulVotes: 6,
    reportCount: 0
  },
  {
    id: '6',
    userId: 'user6',
    userName: 'Laura Fernández',
    userEmail: 'laura@email.com',
    courseId: '3',
    courseName: 'Querencia Golf Club',
    rating: 5,
    title: 'Perfecto para torneos corporativos',
    comment: 'Organizamos nuestro torneo anual aquí y todo fue perfecto. Excelente organización y atención al detalle.',
    images: ['/images/review6-1.jpg', '/images/review6-2.jpg'],
    date: '2025-07-09T13:45:00Z',
    status: 'approved',
    isHighlighted: true,
    adminResponse: 'Gracias Laura, nos complace haber sido parte de su evento corporativo.',
    adminResponseDate: '2025-07-09T16:20:00Z',
    helpfulVotes: 9,
    reportCount: 0
  }
]

export default function ReviewsManagementPage() {
  const { t } = useLanguage()
  const [reviews, setReviews] = useState<Review[]>(mockReviews)
  const [filteredReviews, setFilteredReviews] = useState<Review[]>(mockReviews)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [ratingFilter, setRatingFilter] = useState<string>('all')
  const [courseFilter, setCourseFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [adminResponse, setAdminResponse] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Filter reviews based on search and filters
  useEffect(() => {
    let filtered = reviews.filter(review => {
      const matchesSearch = review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           review.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           review.courseName.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || review.status === statusFilter
      const matchesRating = ratingFilter === 'all' || review.rating.toString() === ratingFilter
      const matchesCourse = courseFilter === 'all' || review.courseId === courseFilter

      return matchesSearch && matchesStatus && matchesRating && matchesCourse
    })

    setFilteredReviews(filtered)
    setCurrentPage(1)
  }, [reviews, searchTerm, statusFilter, ratingFilter, courseFilter])

  const handleStatusChange = (reviewId: string, newStatus: 'approved' | 'rejected' | 'flagged') => {
    setReviews(prev => prev.map(review => 
      review.id === reviewId ? { ...review, status: newStatus } : review
    ))
  }

  const handleHighlight = (reviewId: string) => {
    setReviews(prev => prev.map(review => 
      review.id === reviewId ? { ...review, isHighlighted: !review.isHighlighted } : review
    ))
  }

  const handleAdminResponse = (reviewId: string) => {
    if (!adminResponse.trim()) return

    setReviews(prev => prev.map(review => 
      review.id === reviewId ? { 
        ...review, 
        adminResponse: adminResponse,
        adminResponseDate: new Date().toISOString()
      } : review
    ))
    setAdminResponse('')
    setSelectedReview(null)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-500', text: 'Pendiente' },
      approved: { color: 'bg-green-500', text: 'Aprobada' },
      rejected: { color: 'bg-red-500', text: 'Rechazada' },
      flagged: { color: 'bg-orange-500', text: 'Marcada' }
    }
    const config = statusConfig[status as keyof typeof statusConfig]
    return <Badge className={`${config.color} text-white`}>{config.text}</Badge>
  }

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
      />
    ))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Pagination
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentReviews = filteredReviews.slice(startIndex, endIndex)

  const uniqueCourses = Array.from(new Set(reviews.map(r => ({ id: r.courseId, name: r.courseName }))))

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Gestión de Reseñas
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Modere y gestione todas las reseñas de los campos de golf
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Reseñas</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{reviews.length}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {reviews.filter(r => r.status === 'pending').length}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Aprobadas</p>
                  <p className="text-2xl font-bold text-green-600">
                    {reviews.filter(r => r.status === 'approved').length}
                  </p>
                </div>
                <Check className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Calificación Promedio</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)}
                  </p>
                </div>
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar reseñas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="pending">Pendientes</SelectItem>
                    <SelectItem value="approved">Aprobadas</SelectItem>
                    <SelectItem value="rejected">Rechazadas</SelectItem>
                    <SelectItem value="flagged">Marcadas</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={ratingFilter} onValueChange={setRatingFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Calificación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="5">5 estrellas</SelectItem>
                    <SelectItem value="4">4 estrellas</SelectItem>
                    <SelectItem value="3">3 estrellas</SelectItem>
                    <SelectItem value="2">2 estrellas</SelectItem>
                    <SelectItem value="1">1 estrella</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={courseFilter} onValueChange={setCourseFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Campo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los campos</SelectItem>
                    {uniqueCourses.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reviews List */}
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-6'}>
          {currentReviews.map((review) => (
            <Card key={review.id} className={`${review.isHighlighted ? 'ring-2 ring-yellow-400' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">{getRatingStars(review.rating)}</div>
                      {getStatusBadge(review.status)}
                      {review.isHighlighted && (
                        <Badge className="bg-yellow-500 text-white">Destacada</Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                      {review.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {review.userName}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {review.courseName}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(review.date)}
                      </div>
                    </div>
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Detalle de Reseña</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="flex">{getRatingStars(review.rating)}</div>
                          {getStatusBadge(review.status)}
                        </div>
                        <h3 className="text-xl font-semibold">{review.title}</h3>
                        <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                        
                        {review.images.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Imágenes adjuntas:</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {review.images.map((image, index) => (
                                <div key={index} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                  <ImageIcon className="w-8 h-8 text-gray-400" />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Usuario:</span> {review.userName}
                          </div>
                          <div>
                            <span className="font-medium">Email:</span> {review.userEmail}
                          </div>
                          <div>
                            <span className="font-medium">Campo:</span> {review.courseName}
                          </div>
                          <div>
                            <span className="font-medium">Fecha:</span> {formatDate(review.date)}
                          </div>
                          <div>
                            <span className="font-medium">Votos útiles:</span> {review.helpfulVotes}
                          </div>
                          <div>
                            <span className="font-medium">Reportes:</span> {review.reportCount}
                          </div>
                        </div>

                        {review.adminResponse && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                            <h4 className="font-medium mb-2">Respuesta del administrador:</h4>
                            <p className="text-sm">{review.adminResponse}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              {formatDate(review.adminResponseDate!)}
                            </p>
                          </div>
                        )}

                        <div className="flex gap-2 pt-4 border-t">
                          <Button
                            onClick={() => handleStatusChange(review.id, 'approved')}
                            className="bg-green-500 hover:bg-green-600"
                            size="sm"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Aprobar
                          </Button>
                          <Button
                            onClick={() => handleStatusChange(review.id, 'rejected')}
                            variant="destructive"
                            size="sm"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Rechazar
                          </Button>
                          <Button
                            onClick={() => handleStatusChange(review.id, 'flagged')}
                            className="bg-orange-500 hover:bg-orange-600"
                            size="sm"
                          >
                            <Flag className="w-4 h-4 mr-2" />
                            Marcar
                          </Button>
                          <Button
                            onClick={() => handleHighlight(review.id)}
                            variant="outline"
                            size="sm"
                          >
                            <Star className="w-4 h-4 mr-2" />
                            {review.isHighlighted ? 'Quitar destaque' : 'Destacar'}
                          </Button>
                        </div>

                        {!review.adminResponse && (
                          <div className="pt-4 border-t">
                            <h4 className="font-medium mb-2">Responder como administrador:</h4>
                            <Textarea
                              placeholder="Escriba su respuesta..."
                              value={adminResponse}
                              onChange={(e) => setAdminResponse(e.target.value)}
                              className="mb-2"
                            />
                            <Button
                              onClick={() => handleAdminResponse(review.id)}
                              disabled={!adminResponse.trim()}
                            >
                              Enviar respuesta
                            </Button>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
                  {review.comment}
                </p>

                {review.images.length > 0 && (
                  <div className="flex gap-2 mb-4">
                    <ImageIcon className="w-4 h-4 text-gray-400 mt-1" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {review.images.length} imagen{review.images.length > 1 ? 'es' : ''} adjunta{review.images.length > 1 ? 's' : ''}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <ThumbsUp className="w-4 h-4" />
                    {review.helpfulVotes} útiles
                    {review.reportCount > 0 && (
                      <>
                        <Flag className="w-4 h-4 text-orange-500 ml-2" />
                        {review.reportCount} reportes
                      </>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleStatusChange(review.id, 'approved')}
                      className="bg-green-500 hover:bg-green-600"
                      size="sm"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleStatusChange(review.id, 'rejected')}
                      variant="destructive"
                      size="sm"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleHighlight(review.id)}
                      variant="outline"
                      size="sm"
                    >
                      <Star className={`w-4 h-4 ${review.isHighlighted ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                    </Button>
                  </div>
                </div>

                {review.adminResponse && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        Respuesta del administrador
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{review.adminResponse}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {filteredReviews.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No se encontraron reseñas
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Ajusta los filtros para ver más resultados
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  )
}

