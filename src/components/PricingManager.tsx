"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  DollarSign,
  TrendingUp,
  Calendar,
  Clock,
  Users,
  Plus,
  Trash2,
  Save,
  Copy,
  BarChart3,
  Settings,
  AlertTriangle
} from 'lucide-react'

interface PricingRule {
  id: string
  name: string
  type: 'seasonal' | 'time_based' | 'demand_based' | 'special_event'
  isActive: boolean
  priority: number
  conditions: {
    startDate?: string
    endDate?: string
    startTime?: string
    endTime?: string
    daysOfWeek?: string[]
    minDemand?: number
    maxDemand?: number
  }
  pricing: {
    type: 'fixed' | 'percentage' | 'multiplier'
    value: number
    basePrice?: number
  }
  description?: string
}

interface PricingManagerProps {
  courseId: string
  basePriceWeekday: number
  basePriceWeekend: number
  onSave?: (rules: PricingRule[]) => void
}

export default function PricingManager({ 
  courseId, 
  basePriceWeekday, 
  basePriceWeekend, 
  onSave 
}: PricingManagerProps) {
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([])
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('rules')

  useEffect(() => {
    fetchPricingRules()
  }, [])

  const fetchPricingRules = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/golf-courses/${courseId}/pricing-rules`)
      const data = await response.json()
      
      if (data.success) {
        setPricingRules(data.data)
      }
    } catch (error) {
      console.error('Error fetching pricing rules:', error)
    } finally {
      setLoading(false)
    }
  }

  const createNewRule = (): PricingRule => ({
    id: `rule-${Date.now()}`,
    name: 'Nueva Regla de Precios',
    type: 'seasonal',
    isActive: true,
    priority: pricingRules.length + 1,
    conditions: {},
    pricing: {
      type: 'percentage',
      value: 0
    }
  })

  const handleCreateRule = () => {
    const newRule = createNewRule()
    setEditingRule(newRule)
    setIsCreating(true)
  }

  const handleEditRule = (rule: PricingRule) => {
    setEditingRule({ ...rule })
    setIsCreating(false)
  }

  const handleSaveRule = () => {
    if (!editingRule) return

    if (isCreating) {
      setPricingRules([...pricingRules, editingRule])
    } else {
      setPricingRules(pricingRules.map(rule => 
        rule.id === editingRule.id ? editingRule : rule
      ))
    }

    setEditingRule(null)
    setIsCreating(false)
  }

  const handleDeleteRule = (ruleId: string) => {
    setPricingRules(pricingRules.filter(rule => rule.id !== ruleId))
  }

  const handleRuleChange = (field: string, value: any) => {
    if (!editingRule) return

    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setEditingRule({
        ...editingRule,
        [parent]: {
          ...editingRule[parent as keyof PricingRule],
          [child]: value
        }
      })
    } else {
      setEditingRule({
        ...editingRule,
        [field]: value
      })
    }
  }

  const savePricingRules = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/golf-courses/${courseId}/pricing-rules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rules: pricingRules })
      })

      const data = await response.json()
      
      if (data.success) {
        onSave?.(pricingRules)
      }
    } catch (error) {
      console.error('Error saving pricing rules:', error)
    } finally {
      setSaving(false)
    }
  }

  const calculatePrice = (basePrice: number, rules: PricingRule[]): number => {
    let finalPrice = basePrice
    
    const activeRules = rules
      .filter(rule => rule.isActive)
      .sort((a, b) => a.priority - b.priority)

    activeRules.forEach(rule => {
      switch (rule.pricing.type) {
        case 'fixed':
          finalPrice = rule.pricing.value
          break
        case 'percentage':
          finalPrice = basePrice * (1 + rule.pricing.value / 100)
          break
        case 'multiplier':
          finalPrice = finalPrice * rule.pricing.value
          break
      }
    })

    return Math.round(finalPrice * 100) / 100
  }

  const getRuleTypeLabel = (type: string) => {
    const types = {
      seasonal: 'Temporada',
      time_based: 'Horario',
      demand_based: 'Demanda',
      special_event: 'Evento Especial'
    }
    return types[type as keyof typeof types] || type
  }

  const getRuleTypeBadge = (type: string) => {
    const variants = {
      seasonal: 'default' as const,
      time_based: 'secondary' as const,
      demand_based: 'destructive' as const,
      special_event: 'outline' as const
    }
    return <Badge variant={variants[type as keyof typeof variants]}>{getRuleTypeLabel(type)}</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Gestión de Precios Dinámicos</h3>
          <p className="text-sm text-gray-600">Configura reglas automáticas de precios para tu campo</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleCreateRule}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Regla
          </Button>
          <Button onClick={savePricingRules} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rules">Reglas de Precios</TabsTrigger>
          <TabsTrigger value="preview">Vista Previa</TabsTrigger>
          <TabsTrigger value="analytics">Análisis</TabsTrigger>
        </TabsList>

        {/* Reglas de Precios */}
        <TabsContent value="rules" className="space-y-4">
          {/* Base Prices */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Precios Base</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Entre Semana</Label>
                  <div className="text-2xl font-bold text-green-600">${basePriceWeekday}</div>
                </div>
                <div>
                  <Label>Fin de Semana</Label>
                  <div className="text-2xl font-bold text-blue-600">${basePriceWeekend}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Rules List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Reglas Activas</CardTitle>
            </CardHeader>
            <CardContent>
              {pricingRules.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <DollarSign className="mx-auto h-12 w-12 mb-4" />
                  <p>No hay reglas de precios configuradas</p>
                  <p className="text-sm">Crea tu primera regla para automatizar los precios</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pricingRules.map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium">{rule.name}</h4>
                          {getRuleTypeBadge(rule.type)}
                          {!rule.isActive && <Badge variant="secondary">Inactiva</Badge>}
                        </div>
                        <p className="text-sm text-gray-600">{rule.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>Prioridad: {rule.priority}</span>
                          <span>
                            Ajuste: {rule.pricing.type === 'fixed' ? `$${rule.pricing.value}` : 
                                   rule.pricing.type === 'percentage' ? `${rule.pricing.value > 0 ? '+' : ''}${rule.pricing.value}%` :
                                   `×${rule.pricing.value}`}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={rule.isActive}
                          onCheckedChange={(checked) => {
                            setPricingRules(pricingRules.map(r => 
                              r.id === rule.id ? { ...r, isActive: checked } : r
                            ))
                          }}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditRule(rule)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRule(rule.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rule Editor */}
          {editingRule && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {isCreating ? 'Crear Nueva Regla' : 'Editar Regla'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nombre de la Regla</Label>
                    <Input
                      id="name"
                      value={editingRule.name}
                      onChange={(e) => handleRuleChange('name', e.target.value)}
                      placeholder="Ej: Temporada Alta Verano"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="type">Tipo de Regla</Label>
                    <Select
                      value={editingRule.type}
                      onValueChange={(value) => handleRuleChange('type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="seasonal">Temporada</SelectItem>
                        <SelectItem value="time_based">Basado en Horario</SelectItem>
                        <SelectItem value="demand_based">Basado en Demanda</SelectItem>
                        <SelectItem value="special_event">Evento Especial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={editingRule.description || ''}
                    onChange={(e) => handleRuleChange('description', e.target.value)}
                    placeholder="Describe cuándo y cómo se aplica esta regla..."
                    rows={2}
                  />
                </div>

                {/* Conditions */}
                <div>
                  <Label className="text-base font-medium">Condiciones</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    {(editingRule.type === 'seasonal' || editingRule.type === 'special_event') && (
                      <>
                        <div>
                          <Label htmlFor="startDate">Fecha de Inicio</Label>
                          <Input
                            id="startDate"
                            type="date"
                            value={editingRule.conditions.startDate || ''}
                            onChange={(e) => handleRuleChange('conditions.startDate', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="endDate">Fecha de Fin</Label>
                          <Input
                            id="endDate"
                            type="date"
                            value={editingRule.conditions.endDate || ''}
                            onChange={(e) => handleRuleChange('conditions.endDate', e.target.value)}
                          />
                        </div>
                      </>
                    )}
                    
                    {editingRule.type === 'time_based' && (
                      <>
                        <div>
                          <Label htmlFor="startTime">Hora de Inicio</Label>
                          <Input
                            id="startTime"
                            type="time"
                            value={editingRule.conditions.startTime || ''}
                            onChange={(e) => handleRuleChange('conditions.startTime', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="endTime">Hora de Fin</Label>
                          <Input
                            id="endTime"
                            type="time"
                            value={editingRule.conditions.endTime || ''}
                            onChange={(e) => handleRuleChange('conditions.endTime', e.target.value)}
                          />
                        </div>
                      </>
                    )}
                    
                    {editingRule.type === 'demand_based' && (
                      <>
                        <div>
                          <Label htmlFor="minDemand">Demanda Mínima (%)</Label>
                          <Input
                            id="minDemand"
                            type="number"
                            min="0"
                            max="100"
                            value={editingRule.conditions.minDemand || ''}
                            onChange={(e) => handleRuleChange('conditions.minDemand', parseInt(e.target.value))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="maxDemand">Demanda Máxima (%)</Label>
                          <Input
                            id="maxDemand"
                            type="number"
                            min="0"
                            max="100"
                            value={editingRule.conditions.maxDemand || ''}
                            onChange={(e) => handleRuleChange('conditions.maxDemand', parseInt(e.target.value))}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Pricing */}
                <div>
                  <Label className="text-base font-medium">Configuración de Precio</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                    <div>
                      <Label htmlFor="pricingType">Tipo de Ajuste</Label>
                      <Select
                        value={editingRule.pricing.type}
                        onValueChange={(value) => handleRuleChange('pricing.type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fixed">Precio Fijo</SelectItem>
                          <SelectItem value="percentage">Porcentaje</SelectItem>
                          <SelectItem value="multiplier">Multiplicador</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="pricingValue">
                        {editingRule.pricing.type === 'fixed' ? 'Precio ($)' :
                         editingRule.pricing.type === 'percentage' ? 'Porcentaje (%)' :
                         'Multiplicador'}
                      </Label>
                      <Input
                        id="pricingValue"
                        type="number"
                        step={editingRule.pricing.type === 'fixed' ? '0.01' : 
                              editingRule.pricing.type === 'percentage' ? '1' : '0.1'}
                        value={editingRule.pricing.value}
                        onChange={(e) => handleRuleChange('pricing.value', parseFloat(e.target.value))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="priority">Prioridad</Label>
                      <Input
                        id="priority"
                        type="number"
                        min="1"
                        value={editingRule.priority}
                        onChange={(e) => handleRuleChange('priority', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingRule(null)
                      setIsCreating(false)
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveRule}>
                    {isCreating ? 'Crear Regla' : 'Guardar Cambios'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Vista Previa */}
        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Vista Previa de Precios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-4">Precios Entre Semana</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Precio Base:</span>
                      <span>${basePriceWeekday}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Precio Final:</span>
                      <span className="text-green-600">
                        ${calculatePrice(basePriceWeekday, pricingRules.filter(r => r.isActive))}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-4">Precios Fin de Semana</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Precio Base:</span>
                      <span>${basePriceWeekend}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Precio Final:</span>
                      <span className="text-blue-600">
                        ${calculatePrice(basePriceWeekend, pricingRules.filter(r => r.isActive))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Análisis */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Análisis de Precios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="mx-auto h-12 w-12 mb-4" />
                <p>Análisis de rendimiento de precios</p>
                <p className="text-sm">Próximamente: gráficos de ingresos y ocupación</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

