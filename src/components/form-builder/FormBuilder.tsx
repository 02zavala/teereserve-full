'use client'

import React, { useState, useCallback } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, Eye, Save, Settings, Trash2, Copy, Move, 
  GripVertical, Edit3, Preview, Code, Smartphone, Monitor
} from 'lucide-react'
import { FormSchema, FormField, FieldType, FieldTemplate } from '@/types/form-builder'
import { FieldPalette } from './FieldPalette'
import { FieldEditor } from './FieldEditor'
import { FormPreview } from './FormPreview'
import { FormSettings } from './FormSettings'
import { useFormBuilder } from '@/hooks/useFormBuilder'

interface FormBuilderProps {
  initialSchema?: FormSchema
  onSave?: (schema: FormSchema) => void
  onPublish?: (schema: FormSchema) => void
  permissions?: {
    canEdit: boolean
    canSave: boolean
    canPublish: boolean
  }
}

export function FormBuilder({ 
  initialSchema, 
  onSave, 
  onPublish,
  permissions = { canEdit: true, canSave: true, canPublish: true }
}: FormBuilderProps) {
  const {
    schema,
    selectedField,
    isPreviewMode,
    isDirty,
    addField,
    updateField,
    removeField,
    reorderFields,
    selectField,
    togglePreview,
    saveSchema,
    resetSchema
  } = useFormBuilder(initialSchema)

  const [activeTab, setActiveTab] = useState<'build' | 'preview' | 'settings' | 'code'>('build')
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop')

  const handleDragEnd = useCallback((result: any) => {
    if (!result.destination) return

    const { source, destination } = result

    // Handle drag from palette to canvas
    if (source.droppableId === 'field-palette' && destination.droppableId === 'form-canvas') {
      const fieldType = result.draggableId as FieldType
      const newField: Partial<FormField> = {
        type: fieldType,
        label: `New ${fieldType} field`,
        required: false,
        order: destination.index
      }
      addField(newField)
      return
    }

    // Handle reordering within canvas
    if (source.droppableId === 'form-canvas' && destination.droppableId === 'form-canvas') {
      reorderFields(source.index, destination.index)
      return
    }
  }, [addField, reorderFields])

  const handleSave = async () => {
    try {
      await saveSchema()
      onSave?.(schema)
    } catch (error) {
      console.error('Error saving form:', error)
    }
  }

  const handlePublish = async () => {
    try {
      await saveSchema()
      onPublish?.(schema)
    } catch (error) {
      console.error('Error publishing form:', error)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Form Builder</h1>
            <Badge variant={isDirty ? "destructive" : "secondary"}>
              {isDirty ? 'Unsaved Changes' : 'Saved'}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'desktop' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('desktop')}
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'mobile' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('mobile')}
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>

            {/* Action Buttons */}
            {permissions.canSave && (
              <Button 
                variant="outline" 
                onClick={handleSave}
                disabled={!isDirty}
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            )}
            
            {permissions.canPublish && (
              <Button 
                onClick={handlePublish}
                className="bg-green-600 hover:bg-green-700"
              >
                <Eye className="h-4 w-4 mr-2" />
                Publish
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="build" className="flex items-center space-x-2">
              <Edit3 className="h-4 w-4" />
              <span>Build</span>
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center space-x-2">
              <Preview className="h-4 w-4" />
              <span>Preview</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
            <TabsTrigger value="code" className="flex items-center space-x-2">
              <Code className="h-4 w-4" />
              <span>Code</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Tabs value={activeTab} className="flex-1 flex flex-col">
            
            {/* Build Tab */}
            <TabsContent value="build" className="flex-1 flex overflow-hidden">
              <div className="flex flex-1">
                {/* Field Palette */}
                <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
                  <FieldPalette />
                </div>

                {/* Form Canvas */}
                <div className="flex-1 flex">
                  <div className={`flex-1 p-6 overflow-y-auto ${viewMode === 'mobile' ? 'max-w-sm mx-auto' : ''}`}>
                    <Card className="min-h-full">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>{schema.name || 'Untitled Form'}</span>
                          <Badge variant="outline">{schema.fields.length} fields</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Droppable droppableId="form-canvas">
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={`min-h-96 space-y-4 p-4 rounded-lg border-2 border-dashed transition-colors ${
                                snapshot.isDraggingOver 
                                  ? 'border-blue-400 bg-blue-50' 
                                  : 'border-gray-300'
                              }`}
                            >
                              {schema.fields.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                  <Plus className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                  <p className="text-lg font-medium">Start building your form</p>
                                  <p className="text-sm">Drag fields from the palette to get started</p>
                                </div>
                              ) : (
                                schema.fields.map((field, index) => (
                                  <Draggable key={field.id} draggableId={field.id} index={index}>
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className={`group relative p-4 bg-white border rounded-lg transition-all ${
                                          selectedField?.id === field.id
                                            ? 'border-blue-500 ring-2 ring-blue-200'
                                            : 'border-gray-200 hover:border-gray-300'
                                        } ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                                        onClick={() => selectField(field.id)}
                                      >
                                        {/* Drag Handle */}
                                        <div
                                          {...provided.dragHandleProps}
                                          className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab"
                                        >
                                          <GripVertical className="h-4 w-4 text-gray-400" />
                                        </div>

                                        {/* Field Actions */}
                                        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              // Handle duplicate
                                            }}
                                          >
                                            <Copy className="h-3 w-3" />
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              removeField(field.id)
                                            }}
                                          >
                                            <Trash2 className="h-3 w-3 text-red-500" />
                                          </Button>
                                        </div>

                                        {/* Field Preview */}
                                        <div className="ml-6 mr-16">
                                          <FieldPreview field={field} />
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                ))
                              )}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Field Editor Panel */}
                  {selectedField && (
                    <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
                      <FieldEditor
                        field={selectedField}
                        onUpdate={(updates) => updateField(selectedField.id, updates)}
                        onRemove={() => {
                          removeField(selectedField.id)
                          selectField(null)
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Preview Tab */}
            <TabsContent value="preview" className="flex-1 overflow-hidden">
              <div className={`h-full p-6 overflow-y-auto ${viewMode === 'mobile' ? 'max-w-sm mx-auto' : ''}`}>
                <FormPreview schema={schema} viewMode={viewMode} />
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="flex-1 overflow-hidden">
              <div className="h-full p-6 overflow-y-auto">
                <FormSettings
                  schema={schema}
                  onUpdate={(updates) => {
                    // Update schema settings
                  }}
                />
              </div>
            </TabsContent>

            {/* Code Tab */}
            <TabsContent value="code" className="flex-1 overflow-hidden">
              <div className="h-full p-6 overflow-y-auto">
                <Card>
                  <CardHeader>
                    <CardTitle>Form Schema (JSON)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
                      {JSON.stringify(schema, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </DragDropContext>
      </div>
    </div>
  )
}

// Field Preview Component
function FieldPreview({ field }: { field: FormField }) {
  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'url':
        return (
          <input
            type={field.type}
            placeholder={field.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            disabled
          />
        )
      
      case 'textarea':
        return (
          <textarea
            placeholder={field.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows={3}
            disabled
          />
        )
      
      case 'select':
        return (
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md" disabled>
            <option>Select an option...</option>
            {field.options?.map((option) => (
              <option key={option.id} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )
      
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <input type="checkbox" disabled />
            <span>{field.label}</span>
          </div>
        )
      
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <input type="radio" name={field.id} disabled />
                <span>{option.label}</span>
              </div>
            ))}
          </div>
        )
      
      case 'date':
        return (
          <input
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            disabled
          />
        )
      
      case 'file':
        return (
          <input
            type="file"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            disabled
          />
        )
      
      case 'heading':
        return (
          <h3 className="text-lg font-semibold text-gray-900">
            {field.label}
          </h3>
        )
      
      case 'paragraph':
        return (
          <p className="text-gray-600">
            {field.placeholder || 'Paragraph text...'}
          </p>
        )
      
      case 'divider':
        return <hr className="border-gray-300" />
      
      default:
        return (
          <div className="p-4 bg-gray-100 rounded-md text-center text-gray-500">
            {field.type} field
          </div>
        )
    }
  }

  return (
    <div className="space-y-2">
      {field.type !== 'checkbox' && field.type !== 'heading' && field.type !== 'paragraph' && field.type !== 'divider' && (
        <label className="block text-sm font-medium text-gray-700">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {renderField()}
      {field.metadata?.helpText && (
        <p className="text-xs text-gray-500">{field.metadata.helpText}</p>
      )}
    </div>
  )
}

