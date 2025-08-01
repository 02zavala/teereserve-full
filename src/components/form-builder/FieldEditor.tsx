'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, Trash2, Settings, Eye, Code, Move, 
  AlertCircle, Info, HelpCircle, Palette
} from 'lucide-react'
import { FormField, FieldOption, ValidationRule, ConditionalRule, FieldEditorProps } from '@/types/form-builder'

export function FieldEditor({ field, onUpdate, onRemove }: FieldEditorProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'validation' | 'conditional' | 'style'>('basic')

  const updateField = (updates: Partial<FormField>) => {
    onUpdate(updates)
  }

  const addOption = () => {
    const newOption: FieldOption = {
      id: `option_${Date.now()}`,
      label: 'New Option',
      value: `option_${Date.now()}`
    }
    
    const currentOptions = field.options || []
    updateField({ options: [...currentOptions, newOption] })
  }

  const updateOption = (optionId: string, updates: Partial<FieldOption>) => {
    const updatedOptions = field.options?.map(option =>
      option.id === optionId ? { ...option, ...updates } : option
    ) || []
    
    updateField({ options: updatedOptions })
  }

  const removeOption = (optionId: string) => {
    const filteredOptions = field.options?.filter(option => option.id !== optionId) || []
    updateField({ options: filteredOptions })
  }

  const addValidationRule = () => {
    const newRule: ValidationRule = {
      type: 'required',
      message: 'This field is required'
    }
    
    const currentRules = field.validation || []
    updateField({ validation: [...currentRules, newRule] })
  }

  const updateValidationRule = (index: number, updates: Partial<ValidationRule>) => {
    const updatedRules = field.validation?.map((rule, i) =>
      i === index ? { ...rule, ...updates } : rule
    ) || []
    
    updateField({ validation: updatedRules })
  }

  const removeValidationRule = (index: number) => {
    const filteredRules = field.validation?.filter((_, i) => i !== index) || []
    updateField({ validation: filteredRules })
  }

  const hasOptions = ['select', 'multiselect', 'radio', 'checkbox'].includes(field.type)
  const canHaveValidation = !['heading', 'paragraph', 'divider'].includes(field.type)

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Field Settings</h3>
            <p className="text-sm text-gray-600 capitalize">{field.type} field</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4">
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic" className="text-xs">
              <Settings className="h-3 w-3 mr-1" />
              Basic
            </TabsTrigger>
            <TabsTrigger value="validation" className="text-xs" disabled={!canHaveValidation}>
              <AlertCircle className="h-3 w-3 mr-1" />
              Rules
            </TabsTrigger>
            <TabsTrigger value="conditional" className="text-xs">
              <Code className="h-3 w-3 mr-1" />
              Logic
            </TabsTrigger>
            <TabsTrigger value="style" className="text-xs">
              <Palette className="h-3 w-3 mr-1" />
              Style
            </TabsTrigger>
          </TabsList>

          {/* Basic Settings */}
          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="field-label">Field Label</Label>
                <Input
                  id="field-label"
                  value={field.label}
                  onChange={(e) => updateField({ label: e.target.value })}
                  placeholder="Enter field label..."
                />
              </div>

              {field.type !== 'heading' && field.type !== 'paragraph' && field.type !== 'divider' && (
                <div>
                  <Label htmlFor="field-placeholder">Placeholder</Label>
                  <Input
                    id="field-placeholder"
                    value={field.placeholder || ''}
                    onChange={(e) => updateField({ placeholder: e.target.value })}
                    placeholder="Enter placeholder text..."
                  />
                </div>
              )}

              {(field.type === 'paragraph' || field.type === 'heading') && (
                <div>
                  <Label htmlFor="field-content">Content</Label>
                  <Textarea
                    id="field-content"
                    value={field.placeholder || ''}
                    onChange={(e) => updateField({ placeholder: e.target.value })}
                    placeholder="Enter content..."
                    rows={3}
                  />
                </div>
              )}

              {canHaveValidation && (
                <div className="flex items-center justify-between">
                  <Label htmlFor="field-required">Required Field</Label>
                  <Switch
                    id="field-required"
                    checked={field.required}
                    onCheckedChange={(checked) => updateField({ required: checked })}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="field-help">Help Text</Label>
                <Input
                  id="field-help"
                  value={field.metadata?.helpText || ''}
                  onChange={(e) => updateField({ 
                    metadata: { ...field.metadata, helpText: e.target.value }
                  })}
                  placeholder="Optional help text..."
                />
              </div>

              <div>
                <Label htmlFor="field-width">Field Width</Label>
                <Select
                  value={field.metadata?.width || 'full'}
                  onValueChange={(value) => updateField({
                    metadata: { ...field.metadata, width: value as any }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full Width</SelectItem>
                    <SelectItem value="half">Half Width</SelectItem>
                    <SelectItem value="third">One Third</SelectItem>
                    <SelectItem value="quarter">One Quarter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Options for select/radio/checkbox fields */}
            {hasOptions && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Options</Label>
                  <Button size="sm" onClick={addOption}>
                    <Plus className="h-3 w-3 mr-1" />
                    Add Option
                  </Button>
                </div>

                <div className="space-y-2">
                  {field.options?.map((option, index) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Input
                        value={option.label}
                        onChange={(e) => updateOption(option.id, { label: e.target.value })}
                        placeholder="Option label"
                        className="flex-1"
                      />
                      <Input
                        value={option.value}
                        onChange={(e) => updateOption(option.id, { value: e.target.value })}
                        placeholder="Value"
                        className="w-24"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeOption(option.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Validation Rules */}
          <TabsContent value="validation" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <Label>Validation Rules</Label>
              <Button size="sm" onClick={addValidationRule}>
                <Plus className="h-3 w-3 mr-1" />
                Add Rule
              </Button>
            </div>

            <div className="space-y-3">
              {field.validation?.map((rule, index) => (
                <Card key={index} className="p-3">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Select
                        value={rule.type}
                        onValueChange={(value) => updateValidationRule(index, { type: value as any })}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="required">Required</SelectItem>
                          <SelectItem value="minLength">Min Length</SelectItem>
                          <SelectItem value="maxLength">Max Length</SelectItem>
                          <SelectItem value="min">Min Value</SelectItem>
                          <SelectItem value="max">Max Value</SelectItem>
                          <SelectItem value="pattern">Pattern</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="phone">Phone</SelectItem>
                          <SelectItem value="url">URL</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeValidationRule(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    {['minLength', 'maxLength', 'min', 'max', 'pattern'].includes(rule.type) && (
                      <Input
                        value={rule.value || ''}
                        onChange={(e) => updateValidationRule(index, { value: e.target.value })}
                        placeholder={
                          rule.type === 'pattern' ? 'Regular expression' : 'Value'
                        }
                      />
                    )}

                    <Input
                      value={rule.message}
                      onChange={(e) => updateValidationRule(index, { message: e.target.value })}
                      placeholder="Error message"
                    />
                  </div>
                </Card>
              ))}

              {(!field.validation || field.validation.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No validation rules</p>
                  <p className="text-xs">Add rules to validate user input</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Conditional Logic */}
          <TabsContent value="conditional" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <Label>Conditional Logic</Label>
              <Button size="sm" disabled>
                <Plus className="h-3 w-3 mr-1" />
                Add Rule
              </Button>
            </div>

            <div className="text-center py-8 text-gray-500">
              <Code className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">Conditional Logic</p>
              <p className="text-xs">Coming soon - Show/hide fields based on conditions</p>
            </div>
          </TabsContent>

          {/* Style Settings */}
          <TabsContent value="style" className="space-y-4 mt-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="field-class">CSS Classes</Label>
                <Input
                  id="field-class"
                  value={field.metadata?.className || ''}
                  onChange={(e) => updateField({
                    metadata: { ...field.metadata, className: e.target.value }
                  })}
                  placeholder="custom-class another-class"
                />
              </div>

              {field.type === 'heading' && (
                <div>
                  <Label htmlFor="heading-size">Heading Size</Label>
                  <Select
                    value={field.metadata?.style?.fontSize || 'text-lg'}
                    onValueChange={(value) => updateField({
                      metadata: { 
                        ...field.metadata, 
                        style: { ...field.metadata?.style, fontSize: value }
                      }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text-sm">Small</SelectItem>
                      <SelectItem value="text-base">Normal</SelectItem>
                      <SelectItem value="text-lg">Large</SelectItem>
                      <SelectItem value="text-xl">Extra Large</SelectItem>
                      <SelectItem value="text-2xl">2X Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="text-center py-4 text-gray-500">
                <Palette className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                <p className="text-xs">More styling options coming soon</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

