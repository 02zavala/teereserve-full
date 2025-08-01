'use client'

import React, { useState } from 'react'
import { FormBuilder } from '@/components/form-builder/FormBuilder'
import { DynamicFormRenderer, FormValidationRenderer } from '@/components/form-builder/DynamicFormRenderer'
import { FormSchema } from '@/types/form-builder'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Save, Eye, Code, Settings, TestTube, Download, 
  Upload, Trash2, Copy, Share, CheckCircle
} from 'lucide-react'
import { PermissionGate } from '@/components/auth/PermissionGate'

// Sample golf course onboarding schema
const SAMPLE_GOLF_SCHEMA: FormSchema = {
  id: 'golf-course-onboarding',
  name: 'Golf Course Onboarding',
  description: 'Complete form for golf course registration',
  version: '1.0.0',
  fields: [
    {
      id: 'course-name',
      type: 'text',
      label: 'Course Name',
      placeholder: 'Enter golf course name...',
      required: true,
      category: 'basic',
      validation: [
        { type: 'required', message: 'Course name is required' },
        { type: 'minLength', value: 3, message: 'Course name must be at least 3 characters' }
      ]
    },
    {
      id: 'course-type',
      type: 'select',
      label: 'Course Type',
      required: true,
      category: 'golf-specific',
      options: [
        { label: 'Public', value: 'public' },
        { label: 'Private', value: 'private' },
        { label: 'Semi-Private', value: 'semi-private' },
        { label: 'Resort', value: 'resort' }
      ],
      validation: [
        { type: 'required', message: 'Please select course type' }
      ]
    },
    {
      id: 'holes',
      type: 'number',
      label: 'Number of Holes',
      required: true,
      category: 'golf-specific',
      min: 9,
      max: 36,
      validation: [
        { type: 'required', message: 'Number of holes is required' },
        { type: 'min', value: 9, message: 'Course must have at least 9 holes' },
        { type: 'max', value: 36, message: 'Course cannot have more than 36 holes' }
      ]
    },
    {
      id: 'contact-email',
      type: 'email',
      label: 'Contact Email',
      placeholder: 'manager@golfcourse.com',
      required: true,
      category: 'contact',
      validation: [
        { type: 'required', message: 'Contact email is required' },
        { type: 'email', message: 'Please enter a valid email address' }
      ]
    },
    {
      id: 'contact-phone',
      type: 'text',
      label: 'Contact Phone',
      placeholder: '+1 (555) 123-4567',
      required: true,
      category: 'contact',
      validation: [
        { type: 'required', message: 'Contact phone is required' },
        { type: 'phone', message: 'Please enter a valid phone number' }
      ]
    },
    {
      id: 'location',
      type: 'text',
      label: 'Location',
      placeholder: 'City, State, Country',
      required: true,
      category: 'basic',
      validation: [
        { type: 'required', message: 'Location is required' }
      ]
    },
    {
      id: 'description',
      type: 'textarea',
      label: 'Course Description',
      placeholder: 'Describe your golf course...',
      rows: 4,
      maxLength: 500,
      category: 'basic',
      validation: [
        { type: 'maxLength', value: 500, message: 'Description cannot exceed 500 characters' }
      ]
    },
    {
      id: 'amenities',
      type: 'checkbox',
      label: 'Available Amenities',
      category: 'golf-specific',
      options: [
        { label: 'Driving Range', value: 'driving-range' },
        { label: 'Pro Shop', value: 'pro-shop' },
        { label: 'Restaurant', value: 'restaurant' },
        { label: 'Cart Rental', value: 'cart-rental' },
        { label: 'Club Rental', value: 'club-rental' },
        { label: 'Lessons Available', value: 'lessons' }
      ]
    }
  ],
  settings: {
    title: 'Golf Course Registration',
    description: 'Join TeeReserve and start accepting online bookings today!',
    submitButtonText: 'Register Course',
    allowDrafts: true,
    requireAuth: false,
    theme: {
      primaryColor: '#059669',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      borderColor: '#d1d5db',
      borderRadius: '0.375rem',
      spacing: 'normal'
    }
  }
}

export default function FormBuilderPage() {
  const [currentSchema, setCurrentSchema] = useState<FormSchema>(SAMPLE_GOLF_SCHEMA)
  const [activeTab, setActiveTab] = useState('builder')
  const [savedSchemas, setSavedSchemas] = useState<FormSchema[]>([SAMPLE_GOLF_SCHEMA])

  const handleSchemaUpdate = (updatedSchema: FormSchema) => {
    setCurrentSchema(updatedSchema)
  }

  const handleSaveSchema = () => {
    // In real implementation, this would save to database
    const existingIndex = savedSchemas.findIndex(s => s.id === currentSchema.id)
    if (existingIndex >= 0) {
      const updated = [...savedSchemas]
      updated[existingIndex] = currentSchema
      setSavedSchemas(updated)
    } else {
      setSavedSchemas([...savedSchemas, currentSchema])
    }
    
    // Show success message
    alert('Form schema saved successfully!')
  }

  const handleFormSubmit = (data: Record<string, any>) => {
    console.log('Form submitted:', data)
    alert('Form submitted successfully! Check console for data.')
  }

  const handleExportSchema = () => {
    const dataStr = JSON.stringify(currentSchema, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${currentSchema.name.toLowerCase().replace(/\s+/g, '-')}-schema.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleImportSchema = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const schema = JSON.parse(e.target?.result as string)
        setCurrentSchema(schema)
        alert('Schema imported successfully!')
      } catch (error) {
        alert('Error importing schema. Please check the file format.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <PermissionGate permission="forms.create" showError>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Form Builder</h1>
            <p className="text-gray-600">Create dynamic forms for golf course onboarding</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleExportSchema}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            
            <label className="cursor-pointer">
              <Button variant="outline" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </span>
              </Button>
              <input
                type="file"
                accept=".json"
                onChange={handleImportSchema}
                className="hidden"
              />
            </label>
            
            <Button onClick={handleSaveSchema}>
              <Save className="h-4 w-4 mr-2" />
              Save Schema
            </Button>
          </div>
        </div>

        {/* Current Schema Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <span>{currentSchema.name}</span>
                  <Badge variant="secondary">v{currentSchema.version}</Badge>
                </CardTitle>
                <p className="text-gray-600 mt-1">{currentSchema.description}</p>
              </div>
              
              <div className="text-right text-sm text-gray-500">
                <p>{currentSchema.fields.length} fields</p>
                <p>Last updated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="builder" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Builder</span>
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span>Preview</span>
            </TabsTrigger>
            <TabsTrigger value="test" className="flex items-center space-x-2">
              <TestTube className="h-4 w-4" />
              <span>Test</span>
            </TabsTrigger>
            <TabsTrigger value="code" className="flex items-center space-x-2">
              <Code className="h-4 w-4" />
              <span>Code</span>
            </TabsTrigger>
            <TabsTrigger value="schemas" className="flex items-center space-x-2">
              <Copy className="h-4 w-4" />
              <span>Schemas</span>
            </TabsTrigger>
          </TabsList>

          {/* Form Builder Tab */}
          <TabsContent value="builder">
            <FormBuilder
              schema={currentSchema}
              onSchemaUpdate={handleSchemaUpdate}
            />
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <span>Form Preview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DynamicFormRenderer
                  schema={currentSchema}
                  onSubmit={() => {}}
                  readonly={true}
                  showProgress={true}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Test Tab */}
          <TabsContent value="test">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TestTube className="h-5 w-5" />
                  <span>Form Testing</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert className="mb-6">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Test your form with real validation. Submit the form to see the data in console.
                  </AlertDescription>
                </Alert>
                
                <FormValidationRenderer
                  schema={currentSchema}
                  onSubmit={handleFormSubmit}
                  showValidationDetails={true}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Code Tab */}
          <TabsContent value="code">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Code className="h-5 w-5" />
                  <span>Schema JSON</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96 text-sm">
                  {JSON.stringify(currentSchema, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Saved Schemas Tab */}
          <TabsContent value="schemas">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedSchemas.map((schema) => (
                <Card key={schema.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{schema.name}</CardTitle>
                      <Badge variant="outline">v{schema.version}</Badge>
                    </div>
                    <p className="text-gray-600 text-sm">{schema.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-gray-500">
                      <p>{schema.fields.length} fields</p>
                      <p>Created: {new Date().toLocaleDateString()}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentSchema(schema)}
                      >
                        Load
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const newSchema = { ...schema, id: `${schema.id}-copy`, name: `${schema.name} (Copy)` }
                          setCurrentSchema(newSchema)
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this schema?')) {
                            setSavedSchemas(savedSchemas.filter(s => s.id !== schema.id))
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PermissionGate>
  )
}

