// Types for Dynamic Form Builder System

export interface FormField {
  id: string
  type: FieldType
  label: string
  placeholder?: string
  required: boolean
  options?: FieldOption[]
  validation?: ValidationRule[]
  conditionalLogic?: ConditionalRule[]
  metadata?: FieldMetadata
  order: number
}

export type FieldType = 
  | 'text'
  | 'email'
  | 'phone'
  | 'number'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'radio'
  | 'checkbox'
  | 'date'
  | 'time'
  | 'datetime'
  | 'file'
  | 'image'
  | 'url'
  | 'currency'
  | 'rating'
  | 'slider'
  | 'divider'
  | 'heading'
  | 'paragraph'

export interface FieldOption {
  id: string
  label: string
  value: string
  selected?: boolean
}

export interface ValidationRule {
  type: ValidationType
  value?: any
  message: string
}

export type ValidationType =
  | 'required'
  | 'minLength'
  | 'maxLength'
  | 'min'
  | 'max'
  | 'pattern'
  | 'email'
  | 'phone'
  | 'url'
  | 'custom'

export interface ConditionalRule {
  id: string
  condition: ConditionType
  fieldId: string
  value: any
  action: ActionType
}

export type ConditionType =
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'notContains'
  | 'greaterThan'
  | 'lessThan'
  | 'isEmpty'
  | 'isNotEmpty'

export type ActionType =
  | 'show'
  | 'hide'
  | 'require'
  | 'unrequire'
  | 'enable'
  | 'disable'

export interface FieldMetadata {
  description?: string
  helpText?: string
  icon?: string
  width?: 'full' | 'half' | 'third' | 'quarter'
  className?: string
  style?: React.CSSProperties
}

export interface FormSchema {
  id: string
  name: string
  description?: string
  version: string
  fields: FormField[]
  settings: FormSettings
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface FormSettings {
  title?: string
  description?: string
  submitButtonText?: string
  successMessage?: string
  errorMessage?: string
  allowDrafts?: boolean
  requireAuth?: boolean
  multiStep?: boolean
  theme?: FormTheme
}

export interface FormTheme {
  primaryColor?: string
  backgroundColor?: string
  textColor?: string
  borderColor?: string
  borderRadius?: string
  spacing?: 'compact' | 'normal' | 'spacious'
}

export interface FormSubmission {
  id: string
  formId: string
  data: Record<string, any>
  submittedAt: Date
  submittedBy?: string
  status: 'draft' | 'submitted' | 'processed'
  metadata?: Record<string, any>
}

// Drag and Drop Types
export interface DragItem {
  id: string
  type: 'field' | 'component'
  fieldType?: FieldType
  data?: Partial<FormField>
}

export interface DropResult {
  draggableId: string
  type: string
  source: {
    droppableId: string
    index: number
  }
  destination?: {
    droppableId: string
    index: number
  }
}

// Form Builder Context
export interface FormBuilderContextType {
  schema: FormSchema
  selectedField: FormField | null
  isPreviewMode: boolean
  isDirty: boolean
  
  // Actions
  addField: (field: Partial<FormField>) => void
  updateField: (fieldId: string, updates: Partial<FormField>) => void
  removeField: (fieldId: string) => void
  reorderFields: (startIndex: number, endIndex: number) => void
  selectField: (fieldId: string | null) => void
  togglePreview: () => void
  saveSchema: () => Promise<void>
  loadSchema: (schemaId: string) => Promise<void>
  resetSchema: () => void
}

// Field Component Props
export interface FieldComponentProps {
  field: FormField
  value?: any
  onChange?: (value: any) => void
  onBlur?: () => void
  error?: string
  disabled?: boolean
  preview?: boolean
}

// Field Editor Props
export interface FieldEditorProps {
  field: FormField
  onUpdate: (updates: Partial<FormField>) => void
  onRemove: () => void
}

// Predefined Field Templates
export interface FieldTemplate {
  id: string
  name: string
  description: string
  icon: string
  category: FieldCategory
  field: Partial<FormField>
}

export type FieldCategory =
  | 'basic'
  | 'advanced'
  | 'layout'
  | 'golf-specific'
  | 'business'
  | 'contact'

// Golf Course Specific Types
export interface GolfCourseFormData {
  // Basic Information
  courseName: string
  location: string
  description: string
  website?: string
  
  // Course Details
  holes: number
  par: number
  yardage: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  designer?: string
  yearBuilt?: number
  
  // Contact Information
  contactName: string
  contactEmail: string
  contactPhone: string
  
  // Operational Details
  operatingHours: {
    [day: string]: {
      open: string
      close: string
      closed: boolean
    }
  }
  
  // Pricing
  pricing: {
    weekday: number
    weekend: number
    holiday: number
    twilight?: number
  }
  
  // Amenities
  amenities: string[]
  services: string[]
  
  // Policies
  dressCode?: string
  cancellationPolicy?: string
  advanceBookingDays?: number
  
  // Media
  images: string[]
  videos?: string[]
  
  // Custom Fields (from Form Builder)
  customFields?: Record<string, any>
}

export interface FormBuilderPermissions {
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  canPublish: boolean
  canViewSubmissions: boolean
  canExportData: boolean
}

export interface UserRole {
  id: string
  name: string
  description: string
  permissions: FormBuilderPermissions
  level: number // 1 = SuperAdmin, 2 = CourseOwner, 3 = Manager, 4 = Staff
}

