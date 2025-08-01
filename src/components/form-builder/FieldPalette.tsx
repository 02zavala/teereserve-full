'use client'

import React from 'react'
import { Droppable, Draggable } from '@hello-pangea/dnd'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Type, Mail, Phone, Hash, AlignLeft, ChevronDown, 
  CheckSquare, Circle, Calendar, Clock, Upload, 
  Image, Link, DollarSign, Star, Minus, Heading1,
  FileText, Separator, MapPin, Users, CreditCard,
  Globe, Building, Flag, Award, Target, Zap
} from 'lucide-react'
import { FieldTemplate, FieldCategory } from '@/types/form-builder'

const fieldTemplates: FieldTemplate[] = [
  // Basic Fields
  {
    id: 'text',
    name: 'Text Input',
    description: 'Single line text input',
    icon: 'Type',
    category: 'basic',
    field: {
      type: 'text',
      label: 'Text Field',
      placeholder: 'Enter text...',
      required: false
    }
  },
  {
    id: 'email',
    name: 'Email',
    description: 'Email address input with validation',
    icon: 'Mail',
    category: 'basic',
    field: {
      type: 'email',
      label: 'Email Address',
      placeholder: 'Enter email...',
      required: true,
      validation: [
        { type: 'required', message: 'Email is required' },
        { type: 'email', message: 'Please enter a valid email' }
      ]
    }
  },
  {
    id: 'phone',
    name: 'Phone',
    description: 'Phone number input',
    icon: 'Phone',
    category: 'basic',
    field: {
      type: 'phone',
      label: 'Phone Number',
      placeholder: '+1 (555) 123-4567',
      required: false
    }
  },
  {
    id: 'number',
    name: 'Number',
    description: 'Numeric input field',
    icon: 'Hash',
    category: 'basic',
    field: {
      type: 'number',
      label: 'Number',
      placeholder: 'Enter number...',
      required: false
    }
  },
  {
    id: 'textarea',
    name: 'Textarea',
    description: 'Multi-line text input',
    icon: 'AlignLeft',
    category: 'basic',
    field: {
      type: 'textarea',
      label: 'Description',
      placeholder: 'Enter description...',
      required: false
    }
  },
  {
    id: 'select',
    name: 'Dropdown',
    description: 'Single selection dropdown',
    icon: 'ChevronDown',
    category: 'basic',
    field: {
      type: 'select',
      label: 'Select Option',
      required: false,
      options: [
        { id: '1', label: 'Option 1', value: 'option1' },
        { id: '2', label: 'Option 2', value: 'option2' },
        { id: '3', label: 'Option 3', value: 'option3' }
      ]
    }
  },
  {
    id: 'checkbox',
    name: 'Checkbox',
    description: 'Single checkbox for yes/no',
    icon: 'CheckSquare',
    category: 'basic',
    field: {
      type: 'checkbox',
      label: 'I agree to the terms',
      required: false
    }
  },
  {
    id: 'radio',
    name: 'Radio Group',
    description: 'Multiple choice selection',
    icon: 'Circle',
    category: 'basic',
    field: {
      type: 'radio',
      label: 'Choose One',
      required: false,
      options: [
        { id: '1', label: 'Option A', value: 'a' },
        { id: '2', label: 'Option B', value: 'b' },
        { id: '3', label: 'Option C', value: 'c' }
      ]
    }
  },
  {
    id: 'date',
    name: 'Date',
    description: 'Date picker input',
    icon: 'Calendar',
    category: 'basic',
    field: {
      type: 'date',
      label: 'Date',
      required: false
    }
  },
  {
    id: 'time',
    name: 'Time',
    description: 'Time picker input',
    icon: 'Clock',
    category: 'basic',
    field: {
      type: 'time',
      label: 'Time',
      required: false
    }
  },
  {
    id: 'file',
    name: 'File Upload',
    description: 'File upload input',
    icon: 'Upload',
    category: 'advanced',
    field: {
      type: 'file',
      label: 'Upload File',
      required: false
    }
  },
  {
    id: 'image',
    name: 'Image Upload',
    description: 'Image upload with preview',
    icon: 'Image',
    category: 'advanced',
    field: {
      type: 'image',
      label: 'Upload Image',
      required: false
    }
  },
  {
    id: 'url',
    name: 'URL',
    description: 'Website URL input',
    icon: 'Link',
    category: 'advanced',
    field: {
      type: 'url',
      label: 'Website URL',
      placeholder: 'https://example.com',
      required: false
    }
  },
  {
    id: 'currency',
    name: 'Currency',
    description: 'Money amount input',
    icon: 'DollarSign',
    category: 'advanced',
    field: {
      type: 'currency',
      label: 'Price',
      placeholder: '0.00',
      required: false
    }
  },
  {
    id: 'rating',
    name: 'Rating',
    description: 'Star rating input',
    icon: 'Star',
    category: 'advanced',
    field: {
      type: 'rating',
      label: 'Rating',
      required: false
    }
  },

  // Layout Elements
  {
    id: 'heading',
    name: 'Heading',
    description: 'Section heading',
    icon: 'Heading1',
    category: 'layout',
    field: {
      type: 'heading',
      label: 'Section Heading',
      required: false
    }
  },
  {
    id: 'paragraph',
    name: 'Paragraph',
    description: 'Descriptive text',
    icon: 'FileText',
    category: 'layout',
    field: {
      type: 'paragraph',
      label: 'Paragraph',
      placeholder: 'Add your description here...',
      required: false
    }
  },
  {
    id: 'divider',
    name: 'Divider',
    description: 'Visual separator line',
    icon: 'Separator',
    category: 'layout',
    field: {
      type: 'divider',
      label: 'Divider',
      required: false
    }
  },

  // Golf-Specific Fields
  {
    id: 'course-name',
    name: 'Course Name',
    description: 'Golf course name',
    icon: 'Flag',
    category: 'golf-specific',
    field: {
      type: 'text',
      label: 'Golf Course Name',
      placeholder: 'Enter course name...',
      required: true,
      validation: [
        { type: 'required', message: 'Course name is required' },
        { type: 'minLength', value: 3, message: 'Course name must be at least 3 characters' }
      ]
    }
  },
  {
    id: 'holes',
    name: 'Number of Holes',
    description: 'Course hole count',
    icon: 'Target',
    category: 'golf-specific',
    field: {
      type: 'select',
      label: 'Number of Holes',
      required: true,
      options: [
        { id: '9', label: '9 Holes', value: '9' },
        { id: '18', label: '18 Holes', value: '18' },
        { id: '27', label: '27 Holes', value: '27' },
        { id: '36', label: '36 Holes', value: '36' }
      ]
    }
  },
  {
    id: 'difficulty',
    name: 'Difficulty Level',
    description: 'Course difficulty rating',
    icon: 'Award',
    category: 'golf-specific',
    field: {
      type: 'radio',
      label: 'Difficulty Level',
      required: true,
      options: [
        { id: 'beginner', label: 'Beginner', value: 'beginner' },
        { id: 'intermediate', label: 'Intermediate', value: 'intermediate' },
        { id: 'advanced', label: 'Advanced', value: 'advanced' },
        { id: 'championship', label: 'Championship', value: 'championship' }
      ]
    }
  },
  {
    id: 'tee-times',
    name: 'Tee Time Interval',
    description: 'Booking interval in minutes',
    icon: 'Clock',
    category: 'golf-specific',
    field: {
      type: 'select',
      label: 'Tee Time Interval',
      required: true,
      options: [
        { id: '8', label: '8 minutes', value: '8' },
        { id: '10', label: '10 minutes', value: '10' },
        { id: '12', label: '12 minutes', value: '12' },
        { id: '15', label: '15 minutes', value: '15' }
      ]
    }
  },

  // Business Fields
  {
    id: 'business-name',
    name: 'Business Name',
    description: 'Company or business name',
    icon: 'Building',
    category: 'business',
    field: {
      type: 'text',
      label: 'Business Name',
      placeholder: 'Enter business name...',
      required: true
    }
  },
  {
    id: 'tax-id',
    name: 'Tax ID',
    description: 'Tax identification number',
    icon: 'CreditCard',
    category: 'business',
    field: {
      type: 'text',
      label: 'Tax ID / RFC',
      placeholder: 'Enter tax ID...',
      required: false
    }
  },
  {
    id: 'website',
    name: 'Website',
    description: 'Business website URL',
    icon: 'Globe',
    category: 'business',
    field: {
      type: 'url',
      label: 'Website',
      placeholder: 'https://www.example.com',
      required: false
    }
  },

  // Contact Fields
  {
    id: 'contact-person',
    name: 'Contact Person',
    description: 'Primary contact name',
    icon: 'Users',
    category: 'contact',
    field: {
      type: 'text',
      label: 'Contact Person',
      placeholder: 'Enter contact name...',
      required: true
    }
  },
  {
    id: 'address',
    name: 'Address',
    description: 'Physical address',
    icon: 'MapPin',
    category: 'contact',
    field: {
      type: 'textarea',
      label: 'Address',
      placeholder: 'Enter full address...',
      required: false
    }
  }
]

const iconMap: Record<string, React.ComponentType<any>> = {
  Type, Mail, Phone, Hash, AlignLeft, ChevronDown,
  CheckSquare, Circle, Calendar, Clock, Upload,
  Image, Link, DollarSign, Star, Minus, Heading1,
  FileText, Separator, MapPin, Users, CreditCard,
  Globe, Building, Flag, Award, Target, Zap
}

export function FieldPalette() {
  const categories: { id: FieldCategory; name: string; description: string }[] = [
    { id: 'basic', name: 'Basic Fields', description: 'Common form inputs' },
    { id: 'advanced', name: 'Advanced', description: 'Specialized inputs' },
    { id: 'layout', name: 'Layout', description: 'Structure elements' },
    { id: 'golf-specific', name: 'Golf Course', description: 'Golf industry specific' },
    { id: 'business', name: 'Business', description: 'Business information' },
    { id: 'contact', name: 'Contact', description: 'Contact details' }
  ]

  const getFieldsByCategory = (category: FieldCategory) => {
    return fieldTemplates.filter(field => field.category === category)
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Field Palette</h2>
        <p className="text-sm text-gray-600">Drag fields to add them to your form</p>
      </div>

      <Droppable droppableId="field-palette" isDropDisabled={true}>
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className="p-4 space-y-6">
            {categories.map((category) => {
              const fields = getFieldsByCategory(category.id)
              if (fields.length === 0) return null

              return (
                <div key={category.id}>
                  <div className="mb-3">
                    <h3 className="text-sm font-medium text-gray-900">{category.name}</h3>
                    <p className="text-xs text-gray-500">{category.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2">
                    {fields.map((template, index) => {
                      const IconComponent = iconMap[template.icon] || Type
                      
                      return (
                        <Draggable
                          key={template.id}
                          draggableId={template.field.type!}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-3 bg-white border border-gray-200 rounded-lg cursor-grab hover:border-gray-300 hover:shadow-sm transition-all ${
                                snapshot.isDragging ? 'shadow-lg border-blue-400' : ''
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <IconComponent className="h-4 w-4 text-blue-600" />
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-medium text-gray-900 truncate">
                                    {template.name}
                                  </h4>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {template.description}
                                  </p>
                                  {template.field.required && (
                                    <Badge variant="secondary" className="mt-1 text-xs">
                                      Required
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      )
                    })}
                  </div>
                </div>
              )
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}

