"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  MapPin, 
  Star, 
  Users, 
  DollarSign,
  Edit,
  Trash2,
  Plus,
  Save,
  X,
  Image as ImageIcon,
  Camera
} from 'lucide-react'
import ImageUpload from '@/components/ui/image-upload'

interface GolfCourse {
  id: string
  name: string
  location: string
  description: string
  holes: number
  rating: number
  pricePerRound: number
  imageUrl?: string
  galleryImages?: string[]
  contactEmail?: string
  contactPhone?: string
}

export default function CoursesManagement() {
  const [courses, setCourses] = useState<GolfCourse[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<GolfCourse | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    holes: 18,
    rating: 4.5,
    pricePerRound: 140,
    contactEmail: '',
    contactPhone: '',
    imageUrl: ''
  })
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    // Mock data - replace with actual API call
    const mockCourses: GolfCourse[] = [
      {
        id: '1',
        name: 'Cabo Real Golf Club',
        location: 'Los Cabos, Baja California Sur',
        description: 'Spectacular oceanfront golf course designed by Robert Trent Jones Jr. Stunning views of the Sea of Cortez with challenging desert landscape.',
        holes: 18,
        rating: 4.8,
        pricePerRound: 140,
        imageUrl: '/images/courses/cabo-real-1.jpg',
        galleryImages: [
          'https://images.unsplash.com/photo-1574983003419-00ac5c50e2a9?q=80&w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=800&h=600&fit=crop'
        ],
        contactEmail: 'reservas@caboreal.com',
        contactPhone: '+52 624 173 9400'
      },
      {
        id: '2',
        name: 'Palmilla Golf Club',
        location: 'San José del Cabo, Baja California Sur',
        description: 'Jack Nicklaus Signature Design featuring 27 holes of world-class golf with breathtaking ocean and mountain views.',
        holes: 27,
        rating: 4.9,
        pricePerRound: 90,
        imageUrl: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=500&h=300&fit=crop',
        galleryImages: [
          'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1574983003419-00ac5c50e2a9?q=80&w=800&h=600&fit=crop'
        ],
        contactEmail: 'golf@palmilla.com',
        contactPhone: '+52 624 146 7000'
      },
      {
        id: '3',
        name: 'Quivira Golf Club',
        location: 'Cabo San Lucas, Baja California Sur',
        description: 'Clifftop masterpiece by Jack Nicklaus with dramatic ocean views and world-renowned golf architecture.',
        holes: 18,
        rating: 4.7,
        pricePerRound: 175,
        imageUrl: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=500&h=300&fit=crop',
        galleryImages: [
          'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1574983003419-00ac5c50e2a9?q=80&w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=800&h=600&fit=crop'
        ],
        contactEmail: 'reservations@quiviragolf.com',
        contactPhone: '+52 624 104 3400'
      },
      {
        id: '4',
        name: 'Puerto Los Cabos Golf Club',
        location: 'San José del Cabo, Baja California Sur',
        description: 'Championship golf course with stunning marina and mountain views, designed by Greg Norman.',
        holes: 18,
        rating: 4.6,
        pricePerRound: 110,
        imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=500&h=300&fit=crop',
        galleryImages: [
          'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=800&h=600&fit=crop'
        ],
        contactEmail: 'golf@puertoloscabos.com',
        contactPhone: '+52 624 173 1400'
      }
    ]
    setCourses(mockCourses)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'holes' || name === 'pricePerRound' ? Number(value) : 
              name === 'rating' ? parseFloat(value) : value
    }))
  }

  const handleGalleryImagesChange = (files: File[]) => {
    setGalleryFiles(files)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Here you would upload the gallery images and get their URLs
    // For now, we'll simulate this process
    const uploadedGalleryUrls: string[] = []
    
    // Simulate image upload process
    for (const file of galleryFiles) {
      // In a real implementation, you would upload to your storage service
      // and get back the URL
      const mockUrl = URL.createObjectURL(file)
      uploadedGalleryUrls.push(mockUrl)
    }

    const courseData: GolfCourse = {
      id: editingCourse?.id || Date.now().toString(),
      ...formData,
      galleryImages: editingCourse?.galleryImages ? 
        [...editingCourse.galleryImages, ...uploadedGalleryUrls] : 
        uploadedGalleryUrls
    }

    if (editingCourse) {
      setCourses(prev => prev.map(course => 
        course.id === editingCourse.id ? courseData : course
      ))
    } else {
      setCourses(prev => [...prev, courseData])
    }

    resetForm()
    setIsCreateDialogOpen(false)
    setEditingCourse(null)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      description: '',
      holes: 18,
      rating: 4.5,
      pricePerRound: 140,
      contactEmail: '',
      contactPhone: '',
      imageUrl: ''
    })
    setGalleryFiles([])
  }

  const handleEdit = (course: GolfCourse) => {
    setEditingCourse(course)
    setFormData({
      name: course.name,
      location: course.location,
      description: course.description,
      holes: course.holes,
      rating: course.rating,
      pricePerRound: course.pricePerRound,
      contactEmail: course.contactEmail || '',
      contactPhone: course.contactPhone || '',
      imageUrl: course.imageUrl || ''
    })
    setGalleryFiles([])
  }

  const handleDelete = (courseId: string) => {
    setCourses(prev => prev.filter(course => course.id !== courseId))
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-playfair">
            Gestión de Campos de Golf
          </h1>
          <p className="text-gray-600 font-montserrat">
            Administra los campos de golf, sus imágenes y información
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-golf-green-600 hover:bg-golf-green-700 font-montserrat">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Campo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-playfair">
                {editingCourse ? 'Editar Campo de Golf' : 'Crear Nuevo Campo de Golf'}
              </DialogTitle>
              <DialogDescription className="font-montserrat">
                {editingCourse ? 'Modifica la información del campo de golf' : 'Completa la información para crear un nuevo campo de golf'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="font-montserrat">Nombre del Campo</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Cabo Real Golf Club"
                    required
                    className="font-montserrat"
                  />
                </div>
                <div>
                  <Label htmlFor="location" className="font-montserrat">Ubicación</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Los Cabos, Baja California Sur"
                    required
                    className="font-montserrat"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="font-montserrat">Descripción</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Descripción detallada del campo de golf..."
                  rows={3}
                  className="font-montserrat"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="holes" className="font-montserrat">Número de Hoyos</Label>
                  <Input
                    id="holes"
                    name="holes"
                    type="number"
                    value={formData.holes}
                    onChange={handleInputChange}
                    min="9"
                    max="27"
                    className="font-montserrat"
                  />
                </div>
                <div>
                  <Label htmlFor="rating" className="font-montserrat">Rating</Label>
                  <Input
                    id="rating"
                    name="rating"
                    type="number"
                    step="0.1"
                    value={formData.rating}
                    onChange={handleInputChange}
                    min="1"
                    max="5"
                    className="font-montserrat"
                  />
                </div>
                <div>
                  <Label htmlFor="pricePerRound" className="font-montserrat">Precio por Ronda (USD)</Label>
                  <Input
                    id="pricePerRound"
                    name="pricePerRound"
                    type="number"
                    value={formData.pricePerRound}
                    onChange={handleInputChange}
                    placeholder="140"
                    className="font-montserrat"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactEmail" className="font-montserrat">Email de Contacto</Label>
                  <Input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    placeholder="reservas@campo.com"
                    className="font-montserrat"
                  />
                </div>
                <div>
                  <Label htmlFor="contactPhone" className="font-montserrat">Teléfono de Contacto</Label>
                  <Input
                    id="contactPhone"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    placeholder="+52 624 173 9400"
                    className="font-montserrat"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="imageUrl" className="font-montserrat">URL de Imagen Principal</Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="https://ejemplo.com/imagen-principal.jpg"
                  className="font-montserrat"
                />
              </div>

              {/* Gallery Images Upload */}
              <div>
                <Label className="font-montserrat mb-3 block">
                  <Camera className="h-4 w-4 inline mr-2" />
                  Galería de Imágenes
                </Label>
                <ImageUpload
                  onImagesChange={handleGalleryImagesChange}
                  maxImages={10}
                  existingImages={editingCourse?.galleryImages || []}
                  className="border rounded-lg p-4"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateDialogOpen(false)
                    setEditingCourse(null)
                    resetForm()
                  }}
                  className="font-montserrat"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-golf-green-600 hover:bg-golf-green-700 font-montserrat"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingCourse ? 'Actualizar' : 'Crear'} Campo
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48">
              {course.imageUrl ? (
                <img
                  src={course.imageUrl}
                  alt={course.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-gray-400" />
                </div>
              )}
              <div className="absolute top-2 right-2 flex space-x-1">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleEdit(course)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(course.id)}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              {course.galleryImages && course.galleryImages.length > 0 && (
                <Badge className="absolute bottom-2 left-2 bg-golf-green-600">
                  <Camera className="h-3 w-3 mr-1" />
                  {course.galleryImages.length} fotos
                </Badge>
              )}
            </div>
            <CardHeader>
              <CardTitle className="font-playfair text-golf-green-600">{course.name}</CardTitle>
              <CardDescription className="font-montserrat">
                <MapPin className="h-4 w-4 inline mr-1" />
                {course.location}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2 font-montserrat">
                {course.description}
              </p>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span className="text-sm font-medium font-montserrat">{course.rating}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-600 font-montserrat">{course.holes} hoyos</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-2xl font-bold text-golf-green-600 font-dm-serif">
                    ${course.pricePerRound}
                  </div>
                  <div className="text-sm text-gray-500 font-montserrat">USD</div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEdit(course)}
                  className="font-montserrat"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {courses.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2 font-playfair">
              No hay campos de golf
            </h3>
            <p className="text-gray-600 mb-4 font-montserrat">
              Comienza creando tu primer campo de golf
            </p>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-golf-green-600 hover:bg-golf-green-700 font-montserrat"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear Primer Campo
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

