'use client'

import { useState, useCallback, useEffect } from 'react'
import { FormSchema, FormField, FormBuilderContextType } from '@/types/form-builder'

const defaultSchema: FormSchema = {
  id: '',
  name: 'Untitled Form',
  description: '',
  version: '1.0.0',
  fields: [],
  settings: {
    title: 'New Form',
    submitButtonText: 'Submit',
    successMessage: 'Thank you for your submission!',
    errorMessage: 'Please correct the errors below.',
    allowDrafts: false,
    requireAuth: false,
    multiStep: false,
    theme: {
      primaryColor: '#3b82f6',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      borderColor: '#d1d5db',
      borderRadius: '0.375rem',
      spacing: 'normal'
    }
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: ''
}

export function useFormBuilder(initialSchema?: FormSchema): FormBuilderContextType {
  const [schema, setSchema] = useState<FormSchema>(initialSchema || defaultSchema)
  const [selectedField, setSelectedField] = useState<FormField | null>(null)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  // Generate unique ID for new fields
  const generateFieldId = useCallback(() => {
    return `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }, [])

  // Add a new field to the form
  const addField = useCallback((fieldData: Partial<FormField>) => {
    const newField: FormField = {
      id: generateFieldId(),
      type: fieldData.type || 'text',
      label: fieldData.label || 'New Field',
      placeholder: fieldData.placeholder,
      required: fieldData.required || false,
      options: fieldData.options || [],
      validation: fieldData.validation || [],
      conditionalLogic: fieldData.conditionalLogic || [],
      metadata: fieldData.metadata || {},
      order: fieldData.order !== undefined ? fieldData.order : schema.fields.length
    }

    setSchema(prev => {
      const newFields = [...prev.fields]
      
      // Insert at specific position if order is specified
      if (fieldData.order !== undefined) {
        newFields.splice(fieldData.order, 0, newField)
        // Update order for subsequent fields
        newFields.forEach((field, index) => {
          field.order = index
        })
      } else {
        newFields.push(newField)
      }

      return {
        ...prev,
        fields: newFields,
        updatedAt: new Date()
      }
    })

    setSelectedField(newField)
    setIsDirty(true)
  }, [schema.fields.length, generateFieldId])

  // Update an existing field
  const updateField = useCallback((fieldId: string, updates: Partial<FormField>) => {
    setSchema(prev => ({
      ...prev,
      fields: prev.fields.map(field =>
        field.id === fieldId ? { ...field, ...updates } : field
      ),
      updatedAt: new Date()
    }))

    // Update selected field if it's the one being updated
    setSelectedField(prev => 
      prev?.id === fieldId ? { ...prev, ...updates } : prev
    )

    setIsDirty(true)
  }, [])

  // Remove a field from the form
  const removeField = useCallback((fieldId: string) => {
    setSchema(prev => {
      const newFields = prev.fields
        .filter(field => field.id !== fieldId)
        .map((field, index) => ({ ...field, order: index }))

      return {
        ...prev,
        fields: newFields,
        updatedAt: new Date()
      }
    })

    // Clear selection if removed field was selected
    setSelectedField(prev => prev?.id === fieldId ? null : prev)
    setIsDirty(true)
  }, [])

  // Reorder fields (for drag and drop)
  const reorderFields = useCallback((startIndex: number, endIndex: number) => {
    setSchema(prev => {
      const newFields = [...prev.fields]
      const [removed] = newFields.splice(startIndex, 1)
      newFields.splice(endIndex, 0, removed)

      // Update order property for all fields
      newFields.forEach((field, index) => {
        field.order = index
      })

      return {
        ...prev,
        fields: newFields,
        updatedAt: new Date()
      }
    })

    setIsDirty(true)
  }, [])

  // Select a field for editing
  const selectField = useCallback((fieldId: string | null) => {
    if (fieldId) {
      const field = schema.fields.find(f => f.id === fieldId)
      setSelectedField(field || null)
    } else {
      setSelectedField(null)
    }
  }, [schema.fields])

  // Toggle preview mode
  const togglePreview = useCallback(() => {
    setIsPreviewMode(prev => !prev)
  }, [])

  // Save schema (mock implementation)
  const saveSchema = useCallback(async () => {
    try {
      // In a real implementation, this would save to a backend
      console.log('Saving schema:', schema)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setIsDirty(false)
      
      // Update schema with saved timestamp
      setSchema(prev => ({
        ...prev,
        updatedAt: new Date()
      }))
      
      return schema
    } catch (error) {
      console.error('Error saving schema:', error)
      throw error
    }
  }, [schema])

  // Load schema (mock implementation)
  const loadSchema = useCallback(async (schemaId: string) => {
    try {
      // In a real implementation, this would load from a backend
      console.log('Loading schema:', schemaId)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // For now, just reset to default
      setSchema(defaultSchema)
      setSelectedField(null)
      setIsDirty(false)
    } catch (error) {
      console.error('Error loading schema:', error)
      throw error
    }
  }, [])

  // Reset schema to default
  const resetSchema = useCallback(() => {
    setSchema(defaultSchema)
    setSelectedField(null)
    setIsDirty(false)
  }, [])

  // Update schema settings
  const updateSettings = useCallback((updates: Partial<FormSchema['settings']>) => {
    setSchema(prev => ({
      ...prev,
      settings: { ...prev.settings, ...updates },
      updatedAt: new Date()
    }))
    setIsDirty(true)
  }, [])

  // Duplicate a field
  const duplicateField = useCallback((fieldId: string) => {
    const fieldToDuplicate = schema.fields.find(f => f.id === fieldId)
    if (fieldToDuplicate) {
      const duplicatedField: FormField = {
        ...fieldToDuplicate,
        id: generateFieldId(),
        label: `${fieldToDuplicate.label} (Copy)`,
        order: fieldToDuplicate.order + 1
      }

      setSchema(prev => {
        const newFields = [...prev.fields]
        newFields.splice(duplicatedField.order, 0, duplicatedField)
        
        // Update order for subsequent fields
        newFields.forEach((field, index) => {
          field.order = index
        })

        return {
          ...prev,
          fields: newFields,
          updatedAt: new Date()
        }
      })

      setSelectedField(duplicatedField)
      setIsDirty(true)
    }
  }, [schema.fields, generateFieldId])

  // Validate form schema
  const validateSchema = useCallback(() => {
    const errors: string[] = []

    if (!schema.name.trim()) {
      errors.push('Form name is required')
    }

    if (schema.fields.length === 0) {
      errors.push('Form must have at least one field')
    }

    // Validate individual fields
    schema.fields.forEach((field, index) => {
      if (!field.label.trim()) {
        errors.push(`Field ${index + 1}: Label is required`)
      }

      if (field.type === 'select' || field.type === 'radio') {
        if (!field.options || field.options.length === 0) {
          errors.push(`Field "${field.label}": Options are required`)
        }
      }

      // Validate validation rules
      field.validation?.forEach((rule, ruleIndex) => {
        if (!rule.message.trim()) {
          errors.push(`Field "${field.label}", Rule ${ruleIndex + 1}: Error message is required`)
        }
      })
    })

    return errors
  }, [schema])

  // Export schema as JSON
  const exportSchema = useCallback(() => {
    const dataStr = JSON.stringify(schema, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `${schema.name.replace(/\s+/g, '_').toLowerCase()}_schema.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }, [schema])

  // Import schema from JSON
  const importSchema = useCallback((jsonString: string) => {
    try {
      const importedSchema = JSON.parse(jsonString) as FormSchema
      
      // Validate imported schema structure
      if (!importedSchema.fields || !Array.isArray(importedSchema.fields)) {
        throw new Error('Invalid schema format')
      }

      setSchema({
        ...importedSchema,
        id: generateFieldId(), // Generate new ID for imported schema
        updatedAt: new Date()
      })
      setSelectedField(null)
      setIsDirty(true)
      
      return true
    } catch (error) {
      console.error('Error importing schema:', error)
      return false
    }
  }, [generateFieldId])

  return {
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
    loadSchema,
    resetSchema,
    updateSettings,
    duplicateField,
    validateSchema,
    exportSchema,
    importSchema
  }
}

