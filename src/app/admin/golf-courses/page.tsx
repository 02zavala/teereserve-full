"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  MapPin, 
  Search, 
  Plus,
  Edit,
  Eye,
  Star,
  Calendar,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import { useRouter } from 'next/navigation'

interface GolfCourse {
  id: string
  name: string
  location: string
  description: string
  pricePerRound: number
  rating: number
  totalHoles: number
  difficulty: string
  amenities: string[]
  isActive: boolean
  createdAt: string
  _count: {
    bookings: number
    availability: number
  }
}

export default function AdminGolfCoursesPage() {
  const [golfCourses, setGolfCourses] = useState<GolfCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [difficultyFilter, setDifficultyFilter] = useState('all')

  useEffect(() => {
    fetchGolfCourses()
  }, [])

  const fetchGolfCourses = async () => {
    try {
      // Mock data - replace with actual API call
      const mockCourses: GolfCourse[] = [
        {
          id: 'cabo-real-golf-club',
          name: 'Cabo Real Golf Club',
          location: 'Los Cabos, Baja California Sur',
          description: 'Campo de golf de clase mundial con vista al mar',
          pricePerRound: 140,
          rating: 4.8,
          totalHoles: 18,
          difficulty: 'Intermedio',
          amenities: ['Restaurante', 'Pro Shop', 'Driving Range', 'Putting Green'],
          isActive: true,
          createdAt: new Date(Date.now() - 86400000 * 90).toISOString(),
          _count: { bookings: 245, availability: 156 }
        },
        {
          id: 'club-de-golf-la-ceiba',
          name: 'Club de Golf La Ceiba',
          location: 'Mérida, Yucatán',
          description: 'Campo tradicional en el corazón de Yucatán',
          pricePerRound: 90,
          rating: 4.5,
          totalHoles: 18,
          difficulty: 'Principiante',
          amenities: ['Restaurante', 'Alberca', 'Spa'],
          isActive: true,
          createdAt: new Date(Date.now() - 86400000 * 120).toISOString(),
          _count: { bookings: 189, availability: 98 }
        },
        {
          id: 'el-camaleon-golf-club',
          name: 'El Camaleón Golf Club',
          location: 'Playa del Carmen, Quintana Roo',
          description: 'Campo diseñado por Greg Norman en la Riviera Maya',
          pricePerRound: 175,
          rating: 4.9,
          totalHoles: 18,
          difficulty: 'Avanzado',
          amenities: ['Restaurante', 'Pro Shop', 'Driving Range', 'Caddie Service'],
          isActive: true,
          createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
          _count: { bookings: 312, availability: 203 }
        },
        {
          id: 'golf-club-bosques',
          name: 'Golf Club Bosques',
          location: 'Ciudad de México',
          description: 'Campo urbano en el corazón de la capital',
          pricePerRound: 110,
          rating: 4.3,
          totalHoles: 18,
          difficulty: 'Intermedio',
          amenities: ['Restaurante', 'Gimnasio', 'Salón de eventos'],
          isActive: false,
          createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
          _count: { bookings: 67, availability: 45 }
        }
      ]
      
      setGolfCourses(mockCourses)
    } catch (error) {
      console.error('Error fetching golf courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCourses = golfCourses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && course.isActive) ||
                         (statusFilter === 'inactive' && !course.isActive)
    const matchesDifficulty = difficultyFilter === 'all' || course.difficulty === difficultyFilter
    
    return matchesSearch && matchesStatus && matchesDifficulty
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Principiante':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Intermedio':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Avanzado':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Campos de Golf</h1>
          <p className="text-gray-600">
            Gestiona los campos de golf partners de la plataforma
          </p>
        </div>
        <Button onClick={() => router.push("/admin/golf-courses/create")}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Campo
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campos</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{golfCourses.length}</div>
            <p className="text-xs text-muted-foreground">
              Partners registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campos Activos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {golfCourses.filter(c => c.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Disponibles para reserva
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservas Totales</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {golfCourses.reduce((sum, course) => sum + course._count.bookings, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              En todos los campos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating Promedio</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {(golfCourses.reduce((sum, course) => sum + course.rating, 0) / golfCourses.length).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Calificación general
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nombre o ubicación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                </SelectContent>
              </Select>

              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Dificultad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="Principiante">Principiante</SelectItem>
                  <SelectItem value="Intermedio">Intermedio</SelectItem>
                  <SelectItem value="Avanzado">Avanzado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Golf Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-lg">{course.name}</CardTitle>
                    {course.isActive ? (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Activo
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-orange-600 border-orange-200">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Inactivo
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{course.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-1 mb-3">
                    {renderStars(course.rating)}
                    <span className="text-sm text-gray-600 ml-2">
                      {course.rating} ({course._count.bookings} reservas)
                    </span>
                  </div>
                </div>
                
                <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      ${course.pricePerRound.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">USD por ronda</div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">{course.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{course.totalHoles} hoyos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <Badge className={getDifficultyColor(course.difficulty)}>
                    {course.difficulty}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{course._count.availability} slots</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{course._count.bookings} reservas</span>
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Amenidades:</h4>
                <div className="flex flex-wrap gap-1">
                  {course.amenities.map((amenity, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-xs text-gray-500">
                  Registrado {format(new Date(course.createdAt), 'dd MMM yyyy', { locale: es })}
                </span>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredCourses.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-500">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No se encontraron campos de golf</p>
            <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
          </div>
        )}
      </div>
    </div>
  )
}

