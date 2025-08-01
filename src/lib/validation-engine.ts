// Dynamic Validation Engine for TeeReserve Form Builder

import { FormField, ValidationRule, ConditionalRule, FormSchema } from '@/types/form-builder'

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  fieldId: string
  message: string
  type: string
  value?: any
}

export interface ValidationWarning {
  fieldId: string
  message: string
  type: string
}

export interface ValidationContext {
  formData: Record<string, any>
  schema: FormSchema
  fieldId: string
  value: any
}

// ============================================================================
// VALIDATION ENGINE CLASS
// ============================================================================

export class ValidationEngine {
  private schema: FormSchema
  private formData: Record<string, any>

  constructor(schema: FormSchema, formData: Record<string, any> = {}) {
    this.schema = schema
    this.formData = formData
  }

  /**
   * Validate entire form
   */
  validateForm(): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    for (const field of this.schema.fields) {
      const fieldResult = this.validateField(field.id, this.formData[field.id])
      errors.push(...fieldResult.errors)
      warnings.push(...fieldResult.warnings)
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Validate single field
   */
  validateField(fieldId: string, value: any): ValidationResult {
    const field = this.schema.fields.find(f => f.id === fieldId)
    if (!field) {
      return { isValid: true, errors: [], warnings: [] }
    }

    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // Check if field should be visible based on conditional logic
    if (!this.isFieldVisible(field)) {
      return { isValid: true, errors: [], warnings: [] }
    }

    // Run validation rules
    if (field.validation) {
      for (const rule of field.validation) {
        const ruleResult = this.validateRule(field, value, rule)
        if (!ruleResult.isValid) {
          errors.push({
            fieldId,
            message: rule.message,
            type: rule.type,
            value
          })
        }
      }
    }

    // Run field-specific validations
    const fieldValidation = this.validateFieldType(field, value)
    errors.push(...fieldValidation.errors)
    warnings.push(...fieldValidation.warnings)

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Validate a single rule
   */
  private validateRule(field: FormField, value: any, rule: ValidationRule): ValidationResult {
    const context: ValidationContext = {
      formData: this.formData,
      schema: this.schema,
      fieldId: field.id,
      value
    }

    switch (rule.type) {
      case 'required':
        return this.validateRequired(value, rule, context)
      
      case 'minLength':
        return this.validateMinLength(value, rule, context)
      
      case 'maxLength':
        return this.validateMaxLength(value, rule, context)
      
      case 'min':
        return this.validateMin(value, rule, context)
      
      case 'max':
        return this.validateMax(value, rule, context)
      
      case 'pattern':
        return this.validatePattern(value, rule, context)
      
      case 'email':
        return this.validateEmail(value, rule, context)
      
      case 'phone':
        return this.validatePhone(value, rule, context)
      
      case 'url':
        return this.validateUrl(value, rule, context)
      
      case 'custom':
        return this.validateCustom(value, rule, context)
      
      default:
        return { isValid: true, errors: [], warnings: [] }
    }
  }

  /**
   * Check if field should be visible based on conditional logic
   */
  private isFieldVisible(field: FormField): boolean {
    if (!field.conditionalLogic || field.conditionalLogic.length === 0) {
      return true
    }

    for (const rule of field.conditionalLogic) {
      const conditionMet = this.evaluateCondition(rule)
      
      if (conditionMet) {
        switch (rule.action) {
          case 'show':
            return true
          case 'hide':
            return false
        }
      }
    }

    return true
  }

  /**
   * Evaluate conditional rule
   */
  private evaluateCondition(rule: ConditionalRule): boolean {
    const fieldValue = this.formData[rule.fieldId]
    const ruleValue = rule.value

    switch (rule.condition) {
      case 'equals':
        return fieldValue === ruleValue
      
      case 'notEquals':
        return fieldValue !== ruleValue
      
      case 'contains':
        return String(fieldValue).includes(String(ruleValue))
      
      case 'notContains':
        return !String(fieldValue).includes(String(ruleValue))
      
      case 'greaterThan':
        return Number(fieldValue) > Number(ruleValue)
      
      case 'lessThan':
        return Number(fieldValue) < Number(ruleValue)
      
      case 'isEmpty':
        return !fieldValue || fieldValue === '' || (Array.isArray(fieldValue) && fieldValue.length === 0)
      
      case 'isNotEmpty':
        return fieldValue && fieldValue !== '' && (!Array.isArray(fieldValue) || fieldValue.length > 0)
      
      default:
        return false
    }
  }

  // ============================================================================
  // VALIDATION RULE IMPLEMENTATIONS
  // ============================================================================

  private validateRequired(value: any, rule: ValidationRule, context: ValidationContext): ValidationResult {
    const isEmpty = value === null || value === undefined || value === '' || 
                   (Array.isArray(value) && value.length === 0)

    return {
      isValid: !isEmpty,
      errors: isEmpty ? [{
        fieldId: context.fieldId,
        message: rule.message,
        type: 'required',
        value
      }] : [],
      warnings: []
    }
  }

  private validateMinLength(value: any, rule: ValidationRule, context: ValidationContext): ValidationResult {
    const stringValue = String(value || '')
    const minLength = Number(rule.value)
    const isValid = stringValue.length >= minLength

    return {
      isValid,
      errors: !isValid ? [{
        fieldId: context.fieldId,
        message: rule.message,
        type: 'minLength',
        value
      }] : [],
      warnings: []
    }
  }

  private validateMaxLength(value: any, rule: ValidationRule, context: ValidationContext): ValidationResult {
    const stringValue = String(value || '')
    const maxLength = Number(rule.value)
    const isValid = stringValue.length <= maxLength

    return {
      isValid,
      errors: !isValid ? [{
        fieldId: context.fieldId,
        message: rule.message,
        type: 'maxLength',
        value
      }] : [],
      warnings: []
    }
  }

  private validateMin(value: any, rule: ValidationRule, context: ValidationContext): ValidationResult {
    const numValue = Number(value)
    const minValue = Number(rule.value)
    const isValid = !isNaN(numValue) && numValue >= minValue

    return {
      isValid,
      errors: !isValid ? [{
        fieldId: context.fieldId,
        message: rule.message,
        type: 'min',
        value
      }] : [],
      warnings: []
    }
  }

  private validateMax(value: any, rule: ValidationRule, context: ValidationContext): ValidationResult {
    const numValue = Number(value)
    const maxValue = Number(rule.value)
    const isValid = !isNaN(numValue) && numValue <= maxValue

    return {
      isValid,
      errors: !isValid ? [{
        fieldId: context.fieldId,
        message: rule.message,
        type: 'max',
        value
      }] : [],
      warnings: []
    }
  }

  private validatePattern(value: any, rule: ValidationRule, context: ValidationContext): ValidationResult {
    const stringValue = String(value || '')
    const pattern = new RegExp(rule.value)
    const isValid = pattern.test(stringValue)

    return {
      isValid,
      errors: !isValid ? [{
        fieldId: context.fieldId,
        message: rule.message,
        type: 'pattern',
        value
      }] : [],
      warnings: []
    }
  }

  private validateEmail(value: any, rule: ValidationRule, context: ValidationContext): ValidationResult {
    const emailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
    const stringValue = String(value || '')
    const isValid = emailPattern.test(stringValue)

    return {
      isValid,
      errors: !isValid ? [{
        fieldId: context.fieldId,
        message: rule.message,
        type: 'email',
        value
      }] : [],
      warnings: []
    }
  }

  private validatePhone(value: any, rule: ValidationRule, context: ValidationContext): ValidationResult {
    // Basic phone validation - can be enhanced based on requirements
    const phonePattern = /^[\+]?[1-9][\d]{0,15}$/
    const stringValue = String(value || '').replace(/[\s\-\(\)]/g, '')
    const isValid = phonePattern.test(stringValue)

    return {
      isValid,
      errors: !isValid ? [{
        fieldId: context.fieldId,
        message: rule.message,
        type: 'phone',
        value
      }] : [],
      warnings: []
    }
  }

  private validateUrl(value: any, rule: ValidationRule, context: ValidationContext): ValidationResult {
    try {
      new URL(String(value || ''))
      return { isValid: true, errors: [], warnings: [] }
    } catch {
      return {
        isValid: false,
        errors: [{
          fieldId: context.fieldId,
          message: rule.message,
          type: 'url',
          value
        }],
        warnings: []
      }
    }
  }

  private validateCustom(value: any, rule: ValidationRule, context: ValidationContext): ValidationResult {
    // Custom validation logic can be implemented here
    // For now, return valid
    return { isValid: true, errors: [], warnings: [] }
  }

  /**
   * Validate field based on its type
   */
  private validateFieldType(field: FormField, value: any): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    switch (field.type) {
      case 'email':
        if (value && !this.isValidEmail(value)) {
          errors.push({
            fieldId: field.id,
            message: 'Please enter a valid email address',
            type: 'email',
            value
          })
        }
        break

      case 'phone':
        if (value && !this.isValidPhone(value)) {
          errors.push({
            fieldId: field.id,
            message: 'Please enter a valid phone number',
            type: 'phone',
            value
          })
        }
        break

      case 'url':
        if (value && !this.isValidUrl(value)) {
          errors.push({
            fieldId: field.id,
            message: 'Please enter a valid URL',
            type: 'url',
            value
          })
        }
        break

      case 'number':
        if (value && isNaN(Number(value))) {
          errors.push({
            fieldId: field.id,
            message: 'Please enter a valid number',
            type: 'number',
            value
          })
        }
        break

      case 'date':
        if (value && !this.isValidDate(value)) {
          errors.push({
            fieldId: field.id,
            message: 'Please enter a valid date',
            type: 'date',
            value
          })
        }
        break

      case 'select':
      case 'radio':
        if (value && field.options && !field.options.some(opt => opt.value === value)) {
          errors.push({
            fieldId: field.id,
            message: 'Please select a valid option',
            type: 'option',
            value
          })
        }
        break
    }

    return { isValid: errors.length === 0, errors, warnings }
  }

  // ============================================================================
  // UTILITY VALIDATION METHODS
  // ============================================================================

  private isValidEmail(email: string): boolean {
    const emailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
    return emailPattern.test(email)
  }

  private isValidPhone(phone: string): boolean {
    const phonePattern = /^[\+]?[1-9][\d]{0,15}$/
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
    return phonePattern.test(cleanPhone)
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  private isValidDate(date: string): boolean {
    const dateObj = new Date(date)
    return !isNaN(dateObj.getTime())
  }

  /**
   * Update form data and re-validate
   */
  updateFormData(newData: Record<string, any>): ValidationResult {
    this.formData = { ...this.formData, ...newData }
    return this.validateForm()
  }

  /**
   * Get visible fields based on current form data
   */
  getVisibleFields(): FormField[] {
    return this.schema.fields.filter(field => this.isFieldVisible(field))
  }

  /**
   * Get required fields that are currently visible
   */
  getRequiredFields(): FormField[] {
    return this.getVisibleFields().filter(field => field.required)
  }

  /**
   * Check if form is complete (all required visible fields have values)
   */
  isFormComplete(): boolean {
    const requiredFields = this.getRequiredFields()
    
    return requiredFields.every(field => {
      const value = this.formData[field.id]
      return value !== null && value !== undefined && value !== '' && 
             (!Array.isArray(value) || value.length > 0)
    })
  }

  /**
   * Get form completion percentage
   */
  getCompletionPercentage(): number {
    const visibleFields = this.getVisibleFields()
    if (visibleFields.length === 0) return 100

    const completedFields = visibleFields.filter(field => {
      const value = this.formData[field.id]
      return value !== null && value !== undefined && value !== '' && 
             (!Array.isArray(value) || value.length > 0)
    })

    return Math.round((completedFields.length / visibleFields.length) * 100)
  }
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Create validation engine instance
 */
export function createValidationEngine(schema: FormSchema, formData: Record<string, any> = {}): ValidationEngine {
  return new ValidationEngine(schema, formData)
}

/**
 * Quick validation for react-hook-form integration
 */
export function createReactHookFormValidation(schema: FormSchema) {
  return (formData: Record<string, any>) => {
    const engine = createValidationEngine(schema, formData)
    const result = engine.validateForm()
    
    if (result.isValid) {
      return true
    }

    // Convert to react-hook-form error format
    const errors: Record<string, { message: string; type: string }> = {}
    result.errors.forEach(error => {
      errors[error.fieldId] = {
        message: error.message,
        type: error.type
      }
    })

    return errors
  }
}

/**
 * Validate single field for react-hook-form
 */
export function createFieldValidator(field: FormField, schema: FormSchema) {
  return (value: any, formData: Record<string, any>) => {
    const engine = createValidationEngine(schema, formData)
    const result = engine.validateField(field.id, value)
    
    if (result.isValid) {
      return true
    }

    return result.errors[0]?.message || 'Validation failed'
  }
}

/**
 * Golf course specific validation presets
 */
export const GOLF_VALIDATION_PRESETS = {
  courseName: {
    type: 'required' as const,
    message: 'Course name is required'
  },
  holes: {
    type: 'min' as const,
    value: 9,
    message: 'Course must have at least 9 holes'
  },
  par: {
    type: 'min' as const,
    value: 27,
    message: 'Par must be at least 27 for 9 holes'
  },
  yardage: {
    type: 'min' as const,
    value: 1000,
    message: 'Total yardage must be at least 1000 yards'
  },
  greenFee: {
    type: 'min' as const,
    value: 0,
    message: 'Green fee cannot be negative'
  },
  teeTimeInterval: {
    type: 'pattern' as const,
    value: '^(8|10|12|15)$',
    message: 'Tee time interval must be 8, 10, 12, or 15 minutes'
  }
}

