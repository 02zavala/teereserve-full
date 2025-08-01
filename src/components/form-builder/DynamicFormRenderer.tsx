'use client'

import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { FormSchema, FormField } from '@/types/form-builder'
import { ValidationEngine, createValidationEngine } from '@/lib/validation-engine'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, Clock, MapPin, Phone, Mail, Globe, 
  AlertCircle, CheckCircle, Eye, EyeOff, Star
} from 'lucide-react'

interface DynamicFormRendererProps {
  schema: FormSchema
  onSubmit: (data: Record<string, any>) => void
  initialData?: Record<string, any>
  readonly?: boolean
  showProgress?: boolean
  className?: string
}

export function DynamicFormRenderer({
  schema,
  onSubmit,
  initialData = {},
  readonly = false,
  showProgress = true,
  className = ''
}: DynamicFormRendererProps) {
  const [validationEngine, setValidationEngine] = useState<ValidationEngine>()
  const [visibleFields, setVisibleFields] = useState<FormField[]>([])
  const [completionPercentage, setCompletionPercentage] = useState(0)

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setValue,
    getValues
  } = useForm({
    defaultValues: initialData
  })

  const watchedValues = watch()

  // Initialize validation engine and update visible fields
  useEffect(() => {
    const engine = createValidationEngine(schema, watchedValues)
    setValidationEngine(engine)
    setVisibleFields(engine.getVisibleFields())
    setCompletionPercentage(engine.getCompletionPercentage())
  }, [schema, watchedValues])

  // Handle form submission
  const handleFormSubmit = async (data: Record<string, any>) => {
    if (!validationEngine) return

    const validationResult = validationEngine.validateForm()
    
    if (!validationResult.isValid) {
      console.error('Form validation failed:', validationResult.errors)
      return
    }

    await onSubmit(data)
  }

  // Render field based on type
  const renderField = (field: FormField) => {
    const fieldError = errors[field.id]
    const isRequired = field.required

    const fieldProps = {
      disabled: readonly,
      className: fieldError ? 'border-red-500' : ''
    }

    switch (field.type) {
      case 'text':
      case 'email':
      case 'url':
        return (
          <Controller
            name={field.id}
            control={control}
            rules={{
              required: isRequired ? field.label + ' is required' : false,
              ...(field.type === 'email' && {
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Please enter a valid email address'
                }
              }),
              ...(field.type === 'url' && {
                pattern: {
                  value: /^https?:\/\/.+/,
                  message: 'Please enter a valid URL'
                }
              })
            }}
            render={({ field: formField }) => (
              <Input
                {...formField}
                {...fieldProps}
                type={field.type}
                placeholder={field.placeholder}
              />
            )}
          />
        )

      case 'password':
        return (
          <Controller
            name={field.id}
            control={control}
            rules={{
              required: isRequired ? field.label + ' is required' : false,
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters'
              }
            }}
            render={({ field: formField }) => (
              <Input
                {...formField}
                {...fieldProps}
                type="password"
                placeholder={field.placeholder}
              />
            )}
          />
        )

      case 'number':
        return (
          <Controller
            name={field.id}
            control={control}
            rules={{
              required: isRequired ? field.label + ' is required' : false,
              min: field.min ? {
                value: field.min,
                message: `Minimum value is ${field.min}`
              } : undefined,
              max: field.max ? {
                value: field.max,
                message: `Maximum value is ${field.max}`
              } : undefined
            }}
            render={({ field: formField }) => (
              <Input
                {...formField}
                {...fieldProps}
                type="number"
                min={field.min}
                max={field.max}
                step={field.step}
                placeholder={field.placeholder}
                onChange={(e) => formField.onChange(Number(e.target.value))}
              />
            )}
          />
        )

      case 'textarea':
        return (
          <Controller
            name={field.id}
            control={control}
            rules={{
              required: isRequired ? field.label + ' is required' : false,
              maxLength: field.maxLength ? {
                value: field.maxLength,
                message: `Maximum length is ${field.maxLength} characters`
              } : undefined
            }}
            render={({ field: formField }) => (
              <Textarea
                {...formField}
                {...fieldProps}
                placeholder={field.placeholder}
                rows={field.rows || 3}
                maxLength={field.maxLength}
              />
            )}
          />
        )

      case 'select':
        return (
          <Controller
            name={field.id}
            control={control}
            rules={{
              required: isRequired ? field.label + ' is required' : false
            }}
            render={({ field: formField }) => (
              <Select
                value={formField.value}
                onValueChange={formField.onChange}
                disabled={readonly}
              >
                <SelectTrigger className={fieldError ? 'border-red-500' : ''}>
                  <SelectValue placeholder={field.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        )

      case 'radio':
        return (
          <Controller
            name={field.id}
            control={control}
            rules={{
              required: isRequired ? field.label + ' is required' : false
            }}
            render={({ field: formField }) => (
              <RadioGroup
                value={formField.value}
                onValueChange={formField.onChange}
                disabled={readonly}
                className="space-y-2"
              >
                {field.options?.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`${field.id}-${option.value}`} />
                    <Label htmlFor={`${field.id}-${option.value}`}>{option.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          />
        )

      case 'checkbox':
        return (
          <Controller
            name={field.id}
            control={control}
            rules={{
              required: isRequired ? field.label + ' is required' : false
            }}
            render={({ field: formField }) => (
              <div className="space-y-2">
                {field.options?.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${field.id}-${option.value}`}
                      checked={formField.value?.includes(option.value)}
                      onCheckedChange={(checked) => {
                        const currentValue = formField.value || []
                        if (checked) {
                          formField.onChange([...currentValue, option.value])
                        } else {
                          formField.onChange(currentValue.filter((v: any) => v !== option.value))
                        }
                      }}
                      disabled={readonly}
                    />
                    <Label htmlFor={`${field.id}-${option.value}`}>{option.label}</Label>
                  </div>
                ))}
              </div>
            )}
          />
        )

      case 'date':
        return (
          <Controller
            name={field.id}
            control={control}
            rules={{
              required: isRequired ? field.label + ' is required' : false
            }}
            render={({ field: formField }) => (
              <Input
                {...formField}
                {...fieldProps}
                type="date"
                min={field.min}
                max={field.max}
              />
            )}
          />
        )

      case 'time':
        return (
          <Controller
            name={field.id}
            control={control}
            rules={{
              required: isRequired ? field.label + ' is required' : false
            }}
            render={({ field: formField }) => (
              <Input
                {...formField}
                {...fieldProps}
                type="time"
                min={field.min}
                max={field.max}
                step={field.step}
              />
            )}
          />
        )

      case 'file':
        return (
          <Controller
            name={field.id}
            control={control}
            rules={{
              required: isRequired ? field.label + ' is required' : false
            }}
            render={({ field: formField }) => (
              <Input
                type="file"
                accept={field.accept}
                multiple={field.multiple}
                disabled={readonly}
                onChange={(e) => {
                  const files = Array.from(e.target.files || [])
                  formField.onChange(field.multiple ? files : files[0])
                }}
                className={fieldError ? 'border-red-500' : ''}
              />
            )}
          />
        )

      default:
        return (
          <div className="text-gray-500 italic">
            Unsupported field type: {field.type}
          </div>
        )
    }
  }

  // Get field icon
  const getFieldIcon = (field: FormField) => {
    switch (field.type) {
      case 'email':
        return <Mail className="h-4 w-4" />
      case 'phone':
        return <Phone className="h-4 w-4" />
      case 'url':
        return <Globe className="h-4 w-4" />
      case 'date':
        return <Calendar className="h-4 w-4" />
      case 'time':
        return <Clock className="h-4 w-4" />
      default:
        return null
    }
  }

  // Apply theme styles
  const themeStyles = schema.settings.theme ? {
    '--primary-color': schema.settings.theme.primaryColor,
    '--background-color': schema.settings.theme.backgroundColor,
    '--text-color': schema.settings.theme.textColor,
    '--border-color': schema.settings.theme.borderColor,
    '--border-radius': schema.settings.theme.borderRadius,
  } as React.CSSProperties : {}

  return (
    <div className={`dynamic-form-renderer ${className}`} style={themeStyles}>
      {/* Form Header */}
      {(schema.settings.title || schema.settings.description) && (
        <div className="mb-6">
          {schema.settings.title && (
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {schema.settings.title}
            </h2>
          )}
          {schema.settings.description && (
            <p className="text-gray-600">
              {schema.settings.description}
            </p>
          )}
        </div>
      )}

      {/* Progress Bar */}
      {showProgress && !readonly && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Form Progress
            </span>
            <span className="text-sm text-gray-500">
              {completionPercentage}% complete
            </span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {visibleFields.map((field) => {
          const fieldError = errors[field.id]
          const icon = getFieldIcon(field)

          return (
            <div key={field.id} className="space-y-2">
              {/* Field Label */}
              <div className="flex items-center space-x-2">
                {icon}
                <Label htmlFor={field.id} className="text-sm font-medium text-gray-700">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {field.category && (
                  <Badge variant="secondary" className="text-xs">
                    {field.category}
                  </Badge>
                )}
              </div>

              {/* Field Description */}
              {field.description && (
                <p className="text-sm text-gray-500">
                  {field.description}
                </p>
              )}

              {/* Field Input */}
              <div className="relative">
                {renderField(field)}
                
                {/* Field Error */}
                {fieldError && (
                  <div className="flex items-center space-x-1 mt-1 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{fieldError.message}</span>
                  </div>
                )}
              </div>

              {/* Field Help Text */}
              {field.helpText && (
                <p className="text-xs text-gray-500">
                  {field.helpText}
                </p>
              )}
            </div>
          )
        })}

        {/* Form Actions */}
        {!readonly && (
          <div className="flex items-center justify-between pt-6 border-t">
            <div className="text-sm text-gray-500">
              {validationEngine?.isFormComplete() ? (
                <div className="flex items-center space-x-1 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Form is complete</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1">
                  <AlertCircle className="h-4 w-4" />
                  <span>Please complete all required fields</span>
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !validationEngine?.isFormComplete()}
              className="min-w-[120px]"
            >
              {isSubmitting ? 'Submitting...' : (schema.settings.submitButtonText || 'Submit')}
            </Button>
          </div>
        )}
      </form>

      {/* Success/Error Messages */}
      {schema.settings.successMessage && (
        <Alert className="mt-4 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {schema.settings.successMessage}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

/**
 * Simplified form renderer for previews
 */
export function FormPreviewRenderer({ schema }: { schema: FormSchema }) {
  return (
    <DynamicFormRenderer
      schema={schema}
      onSubmit={() => {}}
      readonly={true}
      showProgress={false}
      className="pointer-events-none opacity-75"
    />
  )
}

/**
 * Form renderer with validation display
 */
export function FormValidationRenderer({ 
  schema, 
  onSubmit, 
  showValidationDetails = false 
}: { 
  schema: FormSchema
  onSubmit: (data: Record<string, any>) => void
  showValidationDetails?: boolean 
}) {
  const [validationResult, setValidationResult] = useState<any>(null)

  const handleSubmit = (data: Record<string, any>) => {
    const engine = createValidationEngine(schema, data)
    const result = engine.validateForm()
    setValidationResult(result)
    
    if (result.isValid) {
      onSubmit(data)
    }
  }

  return (
    <div className="space-y-6">
      <DynamicFormRenderer
        schema={schema}
        onSubmit={handleSubmit}
        showProgress={true}
      />

      {/* Validation Details */}
      {showValidationDetails && validationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Validation Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                {validationResult.isValid ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <span className={validationResult.isValid ? 'text-green-600' : 'text-red-600'}>
                  {validationResult.isValid ? 'Form is valid' : 'Form has errors'}
                </span>
              </div>

              {validationResult.errors?.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-600 mb-2">Errors:</h4>
                  <ul className="space-y-1">
                    {validationResult.errors.map((error: any, index: number) => (
                      <li key={index} className="text-sm text-red-600">
                        • {error.fieldId}: {error.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {validationResult.warnings?.length > 0 && (
                <div>
                  <h4 className="font-medium text-yellow-600 mb-2">Warnings:</h4>
                  <ul className="space-y-1">
                    {validationResult.warnings.map((warning: any, index: number) => (
                      <li key={index} className="text-sm text-yellow-600">
                        • {warning.fieldId}: {warning.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

