"use client"

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Calendar,
  Copy,
  CheckCircle,
  Clock,
  MapPin,
  Share2
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Commission {
  id: string
  amount: number
  status: string
  createdAt: string
  booking: {
    id: string
    bookingDate: string
    numberOfPlayers: number
    totalPrice: number
    user: {
      name: string
      email: string
    }
    golfCourse: {
      name: string
      location: string
    }
  }
}

interface AffiliateData {
  id: string
  referralCode: string
  commissionRate: number
  user: {
    name: string
    email: string
  }
  commissions: Commission[]
}

export default function AffiliateDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [affiliateData, setAffiliateData] = useState<AffiliateData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  // Redirect if not authenticated or not a promoter
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }
    
    if (session.user.role !== 'Promoter') {
      router.push('/denied')
      return
    }
  }, [session, status, router])

  // Fetch affiliate data
  useEffect(() => {
    if (session?.user.role === 'Promoter') {
      fetchAffiliateData()
    }
  }, [session])

  const fetchAffiliateData = async () => {
    try {
      const response = await fetch('/api/affiliates')
      if (response.ok) {
        const data = await response.json()
        setAffiliateData(data.affiliate)
      } else {
        console.error('Failed to fetch affiliate data')
      }
    } catch (error) {
      console.error('Error fetching affiliate data:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyReferralCode = async () => {
    if (affiliateData?.referralCode) {
      await navigator.clipboard.writeText(affiliateData.referralCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareReferralLink = async () => {
    const referralLink = `${window.location.origin}/bookings?ref=${affiliateData?.referralCode}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'TeeReserve Golf - Reserva con descuento',
          text: 'Reserva tu campo de golf favorito con mi código de referido',
          url: referralLink,
        })
      } catch (error) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(referralLink)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } else {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!session || !affiliateData) {
    return null
  }

  const totalEarnings = affiliateData.commissions.reduce((sum, commission) => 
    sum + commission.amount, 0
  )
  const pendingEarnings = affiliateData.commissions
    .filter(c => c.status === 'pending')
    .reduce((sum, commission) => sum + commission.amount, 0)
  const paidEarnings = affiliateData.commissions
    .filter(c => c.status === 'paid')
    .reduce((sum, commission) => sum + commission.amount, 0)
  const totalBookings = affiliateData.commissions.length

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Panel de Afiliado</h1>
        <p className="text-gray-600">
          Bienvenido, {affiliateData.user.name}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganancias Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalEarnings.toLocaleString()} MXN
            </div>
            <p className="text-xs text-muted-foreground">
              Comisión del {(affiliateData.commissionRate * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendiente de Pago</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ${pendingEarnings.toLocaleString()} MXN
            </div>
            <p className="text-xs text-muted-foreground">
              En revisión
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ya Pagado</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${paidEarnings.toLocaleString()} MXN
            </div>
            <p className="text-xs text-muted-foreground">
              Transferido
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservas Generadas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              Total de referidos
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Referral Code Section */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tu Código de Referido
            </CardTitle>
            <CardDescription>
              Comparte este código para ganar comisiones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-700 mb-2">
                {affiliateData.referralCode}
              </div>
              <div className="text-sm text-green-600">
                Comisión: {(affiliateData.commissionRate * 100).toFixed(1)}%
              </div>
            </div>

            <div className="space-y-2">
              <Button 
                onClick={copyReferralCode}
                className="w-full"
                variant="outline"
              >
                {copied ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    ¡Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar Código
                  </>
                )}
              </Button>

              <Button 
                onClick={shareReferralLink}
                className="w-full"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartir Enlace
              </Button>
            </div>

            <div className="text-xs text-gray-500 text-center">
              Los clientes pueden usar tu código al hacer una reserva
            </div>
          </CardContent>
        </Card>

        {/* Recent Commissions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Comisiones Recientes
            </CardTitle>
            <CardDescription>
              Tus últimas reservas generadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {affiliateData.commissions.length > 0 ? (
              <div className="space-y-4">
                {affiliateData.commissions.slice(0, 5).map((commission) => (
                  <div key={commission.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            commission.status === 'paid' ? 'default' :
                            commission.status === 'pending' ? 'secondary' : 'destructive'
                          }
                        >
                          {commission.status === 'paid' ? 'Pagado' :
                           commission.status === 'pending' ? 'Pendiente' : 'Cancelado'}
                        </Badge>
                        <span className="font-medium text-green-600">
                          +${commission.amount.toLocaleString()} MXN
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {format(new Date(commission.createdAt), 'dd MMM yyyy', { locale: es })}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="font-medium">{commission.booking.golfCourse.name}</span>
                      </div>
                      <div className="text-gray-600">
                        Cliente: {commission.booking.user.name}
                      </div>
                      <div className="text-gray-600">
                        Fecha de juego: {format(new Date(commission.booking.bookingDate), 'dd MMM yyyy', { locale: es })}
                      </div>
                      <div className="text-gray-600">
                        Jugadores: {commission.booking.numberOfPlayers} • 
                        Total reserva: ${commission.booking.totalPrice.toLocaleString()} MXN
                      </div>
                    </div>
                  </div>
                ))}

                {affiliateData.commissions.length > 5 && (
                  <div className="text-center">
                    <Button variant="outline" size="sm">
                      Ver todas las comisiones
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Aún no has generado comisiones</p>
                <p className="text-sm">Comparte tu código de referido para empezar a ganar</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

