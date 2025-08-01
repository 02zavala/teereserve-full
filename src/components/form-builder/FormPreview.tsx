'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Star, Upload, Calendar, Clock, DollarSign,
  Smartphone, Monitor, Eye, EyeOff
} from 'lucide-react'
import { FormSchema, FormField } from '@/types/form-builder'

interface FormPreviewProps {
  schema: FormSchema
  viewMode?: 'desktop' | 'mobile'
  showValidation?: boolean
  onSubmit?: (data: any) => void
}

export function FormPreview({ 
  schema, 
  viewMode = 'desktop', 
  showValidation = true,
  onSubmit 
}: FormPreviewProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPreviewMode, setShowPreviewMode] = useState(true)
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm()

  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      console.log('Form submitted:', data)
      onSubmit?.(data)
      
      // Simulate submission delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      alert(schema.settings.successMessage || 'Form submitted successfully!')
    } catch (error) {
      console.error('Form submission error:', error)
      alert(schema.settings.errorMessage || 'Error submitting form')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderField = (field: FormField) => {
    const fieldError = errors[field.id]
    const fieldValue = watch(field.id)

    // Skip rendering for layout elements that don't need form controls
    if (['heading', 'paragraph', 'divider'].includes(field.type)) {
      return renderLayoutElement(field)
    }

    const fieldWidth = field.metadata?.width || 'full'
    const widthClass = {
      full: 'w-full',
      half: 'w-1/2',
      third: 'w-1/3',
      quarter: 'w-1/4'
    }[fieldWidth]

    return (
      <div key={field.id} className={`${widthClass} ${field.metadata?.className || ''}`}>
        <div className="space-y-2">
          {/* Field Label */}
          {field.type !== 'checkbox' && (
            <Label htmlFor={field.id} className="text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
          )}

          {/* Field Input */}
          {renderFieldInput(field, fieldError)}

          {/* Help Text */}
          {field.metadata?.helpText && (
            <p className="text-xs text-gray-500">{field.metadata.helpText}</p>
          )}

          {/* Error Message */}
          {fieldError && showValidation && (
            <p className="text-xs text-red-600">{fieldError.message}</p>
          )}
        </div>
      </div>
    )
  }

  const renderFieldInput = (field: FormField, fieldError: any) => {
    const baseInputClass = `w-full px-3 py-2 border rounded-md transition-colors ${
      fieldError 
        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
    } focus:outline-none focus:ring-2`

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'url':
        return (
          <Input
            id={field.id}
            type={field.type}
            placeholder={field.placeholder}
            className={baseInputClass}
            {...register(field.id, {
              required: field.required ? `${field.label} is required` : false,
              ...getValidationRules(field)
            })}
          />
        )

      case 'number':
        return (
          <Input
            id={field.id}
            type="number"
            placeholder={field.placeholder}
            className={baseInputClass}
            {...register(field.id, {
              required: field.required ? `${field.label} is required` : false,
              valueAsNumber: true,
              ...getValidationRules(field)
            })}
          />
        )

      case 'textarea':
        return (
          <Textarea
            id={field.id}
            placeholder={field.placeholder}
            className={baseInputClass}
            rows={3}
            {...register(field.id, {
              required: field.required ? `${field.label} is required` : false,
              ...getValidationRules(field)
            })}
          />
        )

      case 'select':
        return (
          <Select onValueChange={(value) => setValue(field.id, value)}>
            <SelectTrigger className={baseInputClass}>
              <SelectValue placeholder={field.placeholder || 'Select an option...'} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.id} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`${field.id}_${option.id}`}
                  value={option.value}
                  className="text-blue-600 focus:ring-blue-500"
                  {...register(field.id, {
                    required: field.required ? `${field.label} is required` : false
                  })}
                />
                <Label htmlFor={`${field.id}_${option.id}`} className="text-sm">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        )

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              {...register(field.id, {
                required: field.required ? `${field.label} is required` : false
              })}
            />
            <Label htmlFor={field.id} className="text-sm">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
          </div>
        )

      case 'date':
        return (
          <Input
            id={field.id}
            type="date"
            className={baseInputClass}
            {...register(field.id, {
              required: field.required ? `${field.label} is required` : false
            })}
          />
        )

      case 'time':
        return (
          <Input
            id={field.id}
            type="time"
            className={baseInputClass}
            {...register(field.id, {
              required: field.required ? `${field.label} is required` : false
            })}
          />
        )

      case 'file':
      case 'image':
        return (
          <div className="space-y-2">
            <Input
              id={field.id}
              type="file"
              accept={field.type === 'image' ? 'image/*' : undefined}
              className={baseInputClass}
              {...register(field.id, {
                required: field.required ? `${field.label} is required` : false
              })}
            />
            <div className="flex items-center text-xs text-gray-500">
              <Upload className="h-3 w-3 mr-1" />
              {field.type === 'image' ? 'Upload image file' : 'Upload file'}
            </div>
          </div>
        )

      case 'currency':
        return (
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id={field.id}
              type="number"
              step="0.01"
              placeholder={field.placeholder || '0.00'}
              className={`${baseInputClass} pl-10`}
              {...register(field.id, {
                required: field.required ? `${field.label} is required` : false,
                valueAsNumber: true,
                min: 0
              })}
            />
          </div>
        )

      case 'rating':
        return (
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => setValue(field.id, rating)}
                className="focus:outline-none"
              >
                <Star 
                  className={`h-6 w-6 ${
                    watch(field.id) >= rating 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-gray-300'
                  }`} 
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-600">
              {watch(field.id) ? `${watch(field.id)}/5` : 'No rating'}
            </span>
          </div>
        )

      default:
        return (
          <div className="p-4 bg-gray-100 rounded-md text-center text-gray-500">
            <p className="text-sm">Field type "{field.type}" not implemented in preview</p>
          </div>
        )
    }
  }

  const renderLayoutElement = (field: FormField) => {
    switch (field.type) {
      case 'heading':
        const HeadingTag = field.metadata?.style?.fontSize?.includes('2xl') ? 'h1' :
                          field.metadata?.style?.fontSize?.includes('xl') ? 'h2' : 'h3'
        return (
          <HeadingTag 
            key={field.id}
            className={`font-semibold text-gray-900 ${field.metadata?.style?.fontSize || 'text-lg'} ${field.metadata?.className || ''}`}
          >
            {field.label}
          </HeadingTag>
        )

      case 'paragraph':
        return (
          <p 
            key={field.id}
            className={`text-gray-600 ${field.metadata?.className || ''}`}
          >
            {field.placeholder || field.label}
          </p>
        )

      case 'divider':
        return (
          <Separator 
            key={field.id}
            className={`my-4 ${field.metadata?.className || ''}`}
          />
        )

      default:
        return null
    }
  }

  const getValidationRules = (field: FormField) => {
    const rules: any = {}

    field.validation?.forEach(rule => {
      switch (rule.type) {
        case 'minLength':
          rules.minLength = {
            value: parseInt(rule.value),
            message: rule.message
          }
          break
        case 'maxLength':
          rules.maxLength = {
            value: parseInt(rule.value),
            message: rule.message
          }
          break
        case 'min':
          rules.min = {
            value: parseFloat(rule.value),
            message: rule.message
          }
          break
        case 'max':
          rules.max = {
            value: parseFloat(rule.value),
            message: rule.message
          }
          break
        case 'pattern':
          rules.pattern = {
            value: new RegExp(rule.value),
            message: rule.message
          }
          break
        case 'email':
          rules.pattern = {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: rule.message
          }
          break
      }
    })

    return rules
  }

  if (schema.fields.length === 0) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent className="text-center py-12">
          <Eye className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No fields to preview</h3>
          <p className="text-gray-500">Add some fields to see the form preview</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`max-w-full ${viewMode === 'mobile' ? 'max-w-sm' : 'max-w-4xl'} mx-auto`}>
      {/* Preview Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Form Preview</h2>
          <p className="text-sm text-gray-600">
            {viewMode === 'mobile' ? 'Mobile' : 'Desktop'} view • {schema.fields.length} fields
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant={showValidation ? 'default' : 'secondary'}>
            Validation {showValidation ? 'On' : 'Off'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreviewMode(!showPreviewMode)}
          >
            {showPreviewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Form Preview */}
      <Card>
        <CardHeader>
          <CardTitle>{schema.settings.title || schema.name}</CardTitle>
          {schema.settings.description && (
            <p className="text-gray-600">{schema.settings.description}</p>
          )}
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Form Fields */}
            <div className="space-y-4">
              {schema.fields.map(renderField)}
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-gray-200">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full sm:w-auto"
                style={{ backgroundColor: schema.settings.theme?.primaryColor }}
              >
                {isSubmitting ? 'Submitting...' : (schema.settings.submitButtonText || 'Submit')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Form Data Debug (in development) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm">Form Data (Debug)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
              {JSON.stringify(watch(), null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

