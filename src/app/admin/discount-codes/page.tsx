"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Tag, 
  Search, 
  Plus,
  Edit,
  Trash2,
  Copy,
  Calendar,
  Percent,
  DollarSign,
  Users,
  CheckCircle,
  AlertTriangle,
  X
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface DiscountCode {
  id: string
  code: string
  discountType: 'percentage' | 'fixed_amount'
  value: number
  maxUses: number
  currentUses: number
  minBookingValue?: number
  expiresAt: string
  isActive: boolean
  createdAt: string
}

export default function AdminDiscountCodesPage() {
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingCode, setEditingCode] = useState<string | null>(null)
  const [newCode, setNewCode] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed_amount',
    value: 0,
    maxUses: 100,
    minBookingValue: 0,
    expiresAt: ''
  })

  useEffect(() => {
    fetchDiscountCodes()
  }, [])

  const fetchDiscountCodes = async () => {
    try {
      // Mock data - replace with actual API call
      const mockCodes: DiscountCode[] = [
        {
          id: '1',
          code: 'WELCOME10',
          discountType: 'percentage',
          value: 0.10,
          maxUses: 100,
          currentUses: 23,
          expiresAt: new Date('2025-12-31').toISOString(),
          isActive: true,
          createdAt: new Date(Date.now() - 86400000 * 30).toISOString()
        },
        {
          id: '2',
          code: 'SAVE50',
          discountType: 'fixed_amount',
          value: 50,
          maxUses: 50,
          currentUses: 12,
          minBookingValue: 500,
          expiresAt: new Date('2025-12-31').toISOString(),
          isActive: true,
          createdAt: new Date(Date.now() - 86400000 * 15).toISOString()
        },
        {
          id: '3',
          code: 'SUMMER2024',
          discountType: 'percentage',
          value: 0.15,
          maxUses: 200,
          currentUses: 156,
          expiresAt: new Date('2024-08-31').toISOString(),
          isActive: false,
          createdAt: new Date(Date.now() - 86400000 * 120).toISOString()
        },
        {
          id: '4',
          code: 'FIRSTTIME',
          discountType: 'fixed_amount',
          value: 100,
          maxUses: 1000,
          currentUses: 445,
          minBookingValue: 1000,
          expiresAt: new Date('2025-12-31').toISOString(),
          isActive: true,
          createdAt: new Date(Date.now() - 86400000 * 60).toISOString()
        }
      ]
      
      setDiscountCodes(mockCodes)
    } catch (error) {
      console.error('Error fetching discount codes:', error)
    } finally {
      setLoading(false)
    }
  }

  const createDiscountCode = async () => {
    try {
      // Mock creation - replace with actual API call
      const newDiscountCode: DiscountCode = {
        id: Date.now().toString(),
        ...newCode,
        currentUses: 0,
        isActive: true,
        createdAt: new Date().toISOString()
      }
      
      setDiscountCodes([newDiscountCode, ...discountCodes])
      setNewCode({
        code: '',
        discountType: 'percentage',
        value: 0,
        maxUses: 100,
        minBookingValue: 0,
        expiresAt: ''
      })
      setShowCreateForm(false)
    } catch (error) {
      console.error('Error creating discount code:', error)
    }
  }

  const toggleCodeStatus = async (id: string) => {
    setDiscountCodes(codes => 
      codes.map(code => 
        code.id === id ? { ...code, isActive: !code.isActive } : code
      )
    )
  }

  const deleteCode = async (id: string) => {
    setDiscountCodes(codes => codes.filter(code => code.id !== id))
  }

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code)
    // You could add a toast notification here
  }

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setNewCode({ ...newCode, code: result })
  }

  const filteredCodes = discountCodes.filter(code => {
    const matchesSearch = code.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && code.isActive) ||
                         (statusFilter === 'inactive' && !code.isActive) ||
                         (statusFilter === 'expired' && new Date(code.expiresAt) < new Date())
    const matchesType = typeFilter === 'all' || code.discountType === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date()
  const isNearExpiry = (expiresAt: string) => {
    const expiry = new Date(expiresAt)
    const now = new Date()
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0
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
          <h1 className="text-3xl font-bold">Códigos de Descuento</h1>
          <p className="text-gray-600">
            Crea y gestiona códigos promocionales para la plataforma
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Código
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Códigos</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{discountCodes.length}</div>
            <p className="text-xs text-muted-foreground">
              Códigos creados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Códigos Activos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {discountCodes.filter(c => c.isActive && !isExpired(c.expiresAt)).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Disponibles para uso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {discountCodes.reduce((sum, code) => sum + code.currentUses, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Veces utilizados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Por Expirar</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {discountCodes.filter(c => isNearExpiry(c.expiresAt)).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Expiran en 7 días
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Crear Nuevo Código de Descuento</CardTitle>
            <CardDescription>
              Configura un nuevo código promocional
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code">Código</Label>
                <div className="flex gap-2">
                  <Input
                    id="code"
                    value={newCode.code}
                    onChange={(e) => setNewCode({ ...newCode, code: e.target.value.toUpperCase() })}
                    placeholder="CODIGO123"
                  />
                  <Button type="button" variant="outline" onClick={generateRandomCode}>
                    Generar
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="discountType">Tipo de Descuento</Label>
                <Select 
                  value={newCode.discountType} 
                  onValueChange={(value: 'percentage' | 'fixed_amount') => 
                    setNewCode({ ...newCode, discountType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Porcentaje</SelectItem>
                    <SelectItem value="fixed_amount">Monto Fijo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="value">
                  {newCode.discountType === 'percentage' ? 'Porcentaje (0-1)' : 'Monto (MXN)'}
                </Label>
                <Input
                  id="value"
                  type="number"
                  step={newCode.discountType === 'percentage' ? '0.01' : '1'}
                  value={newCode.value}
                  onChange={(e) => setNewCode({ ...newCode, value: parseFloat(e.target.value) })}
                />
              </div>
              
              <div>
                <Label htmlFor="maxUses">Máximo de Usos</Label>
                <Input
                  id="maxUses"
                  type="number"
                  value={newCode.maxUses}
                  onChange={(e) => setNewCode({ ...newCode, maxUses: parseInt(e.target.value) })}
                />
              </div>
              
              <div>
                <Label htmlFor="minBookingValue">Valor Mínimo de Reserva (MXN)</Label>
                <Input
                  id="minBookingValue"
                  type="number"
                  value={newCode.minBookingValue}
                  onChange={(e) => setNewCode({ ...newCode, minBookingValue: parseInt(e.target.value) })}
                />
              </div>
              
              <div>
                <Label htmlFor="expiresAt">Fecha de Expiración</Label>
                <Input
                  id="expiresAt"
                  type="date"
                  value={newCode.expiresAt}
                  onChange={(e) => setNewCode({ ...newCode, expiresAt: e.target.value })}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={createDiscountCode}>
                Crear Código
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar códigos..."
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
                  <SelectItem value="expired">Expirados</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="percentage">Porcentaje</SelectItem>
                  <SelectItem value="fixed_amount">Monto Fijo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Codes List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Códigos</CardTitle>
          <CardDescription>
            {filteredCodes.length} de {discountCodes.length} códigos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCodes.map((code) => (
              <div key={code.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="font-mono text-lg font-bold bg-gray-100 px-3 py-1 rounded">
                      {code.code}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {code.discountType === 'percentage' ? (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                          <Percent className="h-3 w-3 mr-1" />
                          {(code.value * 100).toFixed(0)}% OFF
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <DollarSign className="h-3 w-3 mr-1" />
                          ${code.value} MXN OFF
                        </Badge>
                      )}
                      
                      {isExpired(code.expiresAt) ? (
                        <Badge variant="destructive">
                          Expirado
                        </Badge>
                      ) : isNearExpiry(code.expiresAt) ? (
                        <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Por expirar
                        </Badge>
                      ) : code.isActive ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Activo
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          Inactivo
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyCode(code.code)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingCode(code.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleCodeStatus(code.id)}
                      className={code.isActive ? 'text-orange-600' : 'text-green-600'}
                    >
                      {code.isActive ? 'Desactivar' : 'Activar'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteCode(code.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Usos:</span>
                    <p className="font-medium">
                      {code.currentUses} / {code.maxUses}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(code.currentUses / code.maxUses) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-gray-600">Expira:</span>
                    <p className="font-medium">
                      {format(new Date(code.expiresAt), 'dd MMM yyyy', { locale: es })}
                    </p>
                  </div>
                  
                  {code.minBookingValue && (
                    <div>
                      <span className="text-gray-600">Mínimo:</span>
                      <p className="font-medium">${code.minBookingValue} MXN</p>
                    </div>
                  )}
                  
                  <div>
                    <span className="text-gray-600">Creado:</span>
                    <p className="font-medium">
                      {format(new Date(code.createdAt), 'dd MMM yyyy', { locale: es })}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {filteredCodes.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Tag className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No se encontraron códigos de descuento</p>
                <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

