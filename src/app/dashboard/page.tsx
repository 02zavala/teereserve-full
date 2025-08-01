'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/PageHeader'
import { SecondaryFooter } from '@/components/SecondaryFooter'
import { 
  Calendar, MapPin, Clock, Star, User, Trophy, 
  TrendingUp, Activity, Heart, Settings, LogOut,
  Golf, Target, Award, BarChart3
} from 'lucide-react'
import Link from 'next/link'

interface Booking {
  id: string
  courseName: string
  date: string
  time: string
  players: number
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled'
  price: number
}

interface UserStats {
  totalBookings: number
  totalSpent: number
  favoritesCourses: number
  averageRating: number
  handicap: number
  gamesPlayed: number
}

export default function PlayerDashboard() {
  const { data: session, status } = useSession()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [stats, setStats] = useState<UserStats>({
    totalBookings: 0,
    totalSpent: 0,
    favoritesCourses: 0,
    averageRating: 0,
    handicap: 0,
    gamesPlayed: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular carga de datos del usuario
    const loadUserData = async () => {
      // Mock data - en producción esto vendría de la API
      const mockBookings: Booking[] = [
        {
          id: '1',
          courseName: 'Cabo Real Golf Club',
          date: '2024-02-15',
          time: '08:00',
          players: 4,
          status: 'confirmed',
          price: 185
        },
        {
          id: '2',
          courseName: 'Cabo del Sol Golf Club',
          date: '2024-02-10',
          time: '14:30',
          players: 2,
          status: 'completed',
          price: 165
        },
        {
          id: '3',
          courseName: 'Solmar Golf Links',
          date: '2024-02-05',
          time: '10:15',
          players: 3,
          status: 'completed',
          price: 155
        }
      ]

      const mockStats: UserStats = {
        totalBookings: 12,
        totalSpent: 2340,
        favoritesCourses: 3,
        averageRating: 4.6,
        handicap: 15,
        gamesPlayed: 8
      }

      setBookings(mockBookings)
      setStats(mockStats)
      setLoading(false)
    }

    if (session) {
      loadUserData()
    }
  }, [session])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-green-700 text-lg font-medium">Cargando tu dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <User className="w-24 h-24 text-green-400 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-green-700 mb-4">Acceso Requerido</h1>
          <p className="text-xl text-green-600 mb-8">Inicia sesión para acceder a tu dashboard</p>
          <Link href="/auth/signin">
            <Button className="bg-green-600 hover:bg-green-700 text-white text-lg">
              Iniciar Sesión
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      confirmed: { color: 'bg-blue-100 text-blue-800', text: 'Confirmada' },
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pendiente' },
      completed: { color: 'bg-green-100 text-green-800', text: 'Completada' },
      cancelled: { color: 'bg-red-100 text-red-800', text: 'Cancelada' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig]
    return (
      <Badge className={config.color}>
        {config.text}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <PageHeader 
        showBackButton={false}
        showLogo={true}
        logoPosition="left"
      />

      <div className="container mx-auto px-4 py-8">
        {/* Header del Dashboard */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-green-700 mb-2">
                ¡Hola, {session.user?.name}! 👋
              </h1>
              <p className="text-green-600 text-lg">
                Bienvenido a tu dashboard personal de golf
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="border-green-300 text-green-700">
                <Settings className="w-4 h-4 mr-2" />
                Configuración
              </Button>
              <Button 
                variant="outline" 
                className="border-red-300 text-red-700 hover:bg-red-50"
                onClick={() => {/* Implementar logout */}}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>

        {/* Estadísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Total Reservas</p>
                  <p className="text-3xl font-bold text-green-700">{stats.totalBookings}</p>
                </div>
                <Calendar className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Total Gastado</p>
                  <p className="text-3xl font-bold text-green-700">${stats.totalSpent}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Handicap</p>
                  <p className="text-3xl font-bold text-green-700">{stats.handicap}</p>
                </div>
                <Target className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Juegos Jugados</p>
                  <p className="text-3xl font-bold text-green-700">{stats.gamesPlayed}</p>
                </div>
                <Golf className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contenido Principal */}
        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="bookings">Mis Reservas</TabsTrigger>
            <TabsTrigger value="favorites">Favoritos</TabsTrigger>
            <TabsTrigger value="stats">Estadísticas</TabsTrigger>
            <TabsTrigger value="profile">Perfil</TabsTrigger>
          </TabsList>

          {/* Tab de Reservas */}
          <TabsContent value="bookings">
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-green-700 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Mis Reservas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-green-700">{booking.courseName}</h3>
                        {getStatusBadge(booking.status)}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center text-green-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(booking.date).toLocaleDateString('es-ES')}
                        </div>
                        <div className="flex items-center text-green-600">
                          <Clock className="w-4 h-4 mr-2" />
                          {booking.time}
                        </div>
                        <div className="flex items-center text-green-600">
                          <User className="w-4 h-4 mr-2" />
                          {booking.players} jugadores
                        </div>
                        <div className="flex items-center text-green-600">
                          <DollarSign className="w-4 h-4 mr-2" />
                          ${booking.price}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <Link href="/courses">
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                      <Calendar className="w-4 h-4 mr-2" />
                      Nueva Reserva
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Favoritos */}
          <TabsContent value="favorites">
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-green-700 flex items-center">
                  <Heart className="w-5 h-5 mr-2" />
                  Campos Favoritos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-600 text-center py-8">
                  Aún no tienes campos favoritos. ¡Explora y marca tus campos preferidos!
                </p>
                <div className="text-center">
                  <Link href="/courses">
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                      Explorar Campos
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Estadísticas */}
          <TabsContent value="stats">
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-green-700 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Mis Estadísticas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <Trophy className="w-12 h-12 text-green-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-green-700 mb-2">Mejor Score</h3>
                    <p className="text-2xl font-bold text-green-700">72</p>
                    <p className="text-green-600 text-sm">Cabo Real Golf Club</p>
                  </div>
                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <Star className="w-12 h-12 text-green-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-green-700 mb-2">Calificación Promedio</h3>
                    <p className="text-2xl font-bold text-green-700">{stats.averageRating}</p>
                    <p className="text-green-600 text-sm">De tus experiencias</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Perfil */}
          <TabsContent value="profile">
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-green-700 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Mi Perfil
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-green-700 font-medium mb-2">Nombre</label>
                    <p className="text-green-600">{session.user?.name}</p>
                  </div>
                  <div>
                    <label className="block text-green-700 font-medium mb-2">Email</label>
                    <p className="text-green-600">{session.user?.email}</p>
                  </div>
                  <div>
                    <label className="block text-green-700 font-medium mb-2">Handicap</label>
                    <p className="text-green-600">{stats.handicap}</p>
                  </div>
                  <div className="pt-4">
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                      <Settings className="w-4 h-4 mr-2" />
                      Editar Perfil
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <SecondaryFooter />
    </div>
  )
}

