'use client'

import React from 'react'
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
  Settings, Palette, Shield, Zap, Download, Upload,
  Eye, Code, Globe, Lock, Users, Bell
} from 'lucide-react'
import { FormSchema } from '@/types/form-builder'

interface FormSettingsProps {
  schema: FormSchema
  onUpdate: (updates: Partial<FormSchema>) => void
}

export function FormSettings({ schema, onUpdate }: FormSettingsProps) {
  const updateSettings = (updates: Partial<FormSchema['settings']>) => {
    onUpdate({
      settings: { ...schema.settings, ...updates }
    })
  }

  const updateTheme = (updates: Partial<FormSchema['settings']['theme']>) => {
    onUpdate({
      settings: {
        ...schema.settings,
        theme: { ...schema.settings.theme, ...updates }
      }
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Form Settings</h2>
          <p className="text-gray-600">Configure your form behavior and appearance</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>General</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center space-x-2">
            <Palette className="h-4 w-4" />
            <span>Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="behavior" className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>Behavior</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Basic Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="form-name">Form Name</Label>
                  <Input
                    id="form-name"
                    value={schema.name}
                    onChange={(e) => onUpdate({ name: e.target.value })}
                    placeholder="Enter form name..."
                  />
                </div>

                <div>
                  <Label htmlFor="form-description">Description</Label>
                  <Textarea
                    id="form-description"
                    value={schema.description || ''}
                    onChange={(e) => onUpdate({ description: e.target.value })}
                    placeholder="Describe what this form is for..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="form-version">Version</Label>
                  <Input
                    id="form-version"
                    value={schema.version}
                    onChange={(e) => onUpdate({ version: e.target.value })}
                    placeholder="1.0.0"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <span>Display Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="form-title">Form Title (Public)</Label>
                  <Input
                    id="form-title"
                    value={schema.settings.title || ''}
                    onChange={(e) => updateSettings({ title: e.target.value })}
                    placeholder="Title shown to users..."
                  />
                </div>

                <div>
                  <Label htmlFor="form-public-description">Public Description</Label>
                  <Textarea
                    id="form-public-description"
                    value={schema.settings.description || ''}
                    onChange={(e) => updateSettings({ description: e.target.value })}
                    placeholder="Description shown to users..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="submit-button-text">Submit Button Text</Label>
                  <Input
                    id="submit-button-text"
                    value={schema.settings.submitButtonText || ''}
                    onChange={(e) => updateSettings({ submitButtonText: e.target.value })}
                    placeholder="Submit"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="h-5 w-5" />
                  <span>Theme Colors</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex items-center space-x-3">
                    <Input
                      id="primary-color"
                      type="color"
                      value={schema.settings.theme?.primaryColor || '#3b82f6'}
                      onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={schema.settings.theme?.primaryColor || '#3b82f6'}
                      onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                      placeholder="#3b82f6"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="background-color">Background Color</Label>
                  <div className="flex items-center space-x-3">
                    <Input
                      id="background-color"
                      type="color"
                      value={schema.settings.theme?.backgroundColor || '#ffffff'}
                      onChange={(e) => updateTheme({ backgroundColor: e.target.value })}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={schema.settings.theme?.backgroundColor || '#ffffff'}
                      onChange={(e) => updateTheme({ backgroundColor: e.target.value })}
                      placeholder="#ffffff"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="text-color">Text Color</Label>
                  <div className="flex items-center space-x-3">
                    <Input
                      id="text-color"
                      type="color"
                      value={schema.settings.theme?.textColor || '#1f2937'}
                      onChange={(e) => updateTheme({ textColor: e.target.value })}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={schema.settings.theme?.textColor || '#1f2937'}
                      onChange={(e) => updateTheme({ textColor: e.target.value })}
                      placeholder="#1f2937"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="border-color">Border Color</Label>
                  <div className="flex items-center space-x-3">
                    <Input
                      id="border-color"
                      type="color"
                      value={schema.settings.theme?.borderColor || '#d1d5db'}
                      onChange={(e) => updateTheme({ borderColor: e.target.value })}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={schema.settings.theme?.borderColor || '#d1d5db'}
                      onChange={(e) => updateTheme({ borderColor: e.target.value })}
                      placeholder="#d1d5db"
                      className="flex-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Code className="h-5 w-5" />
                  <span>Layout & Spacing</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="border-radius">Border Radius</Label>
                  <Select
                    value={schema.settings.theme?.borderRadius || '0.375rem'}
                    onValueChange={(value) => updateTheme({ borderRadius: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">None (0px)</SelectItem>
                      <SelectItem value="0.125rem">Small (2px)</SelectItem>
                      <SelectItem value="0.25rem">Medium (4px)</SelectItem>
                      <SelectItem value="0.375rem">Default (6px)</SelectItem>
                      <SelectItem value="0.5rem">Large (8px)</SelectItem>
                      <SelectItem value="0.75rem">Extra Large (12px)</SelectItem>
                      <SelectItem value="9999px">Full Round</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="spacing">Field Spacing</Label>
                  <Select
                    value={schema.settings.theme?.spacing || 'normal'}
                    onValueChange={(value) => updateTheme({ spacing: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="spacious">Spacious</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Theme Preview */}
                <div className="mt-6 p-4 border rounded-lg" style={{
                  backgroundColor: schema.settings.theme?.backgroundColor,
                  borderColor: schema.settings.theme?.borderColor,
                  borderRadius: schema.settings.theme?.borderRadius,
                  color: schema.settings.theme?.textColor
                }}>
                  <h4 className="font-medium mb-2">Theme Preview</h4>
                  <div className="space-y-2">
                    <input 
                      type="text" 
                      placeholder="Sample input field"
                      className="w-full px-3 py-2 border rounded"
                      style={{
                        borderColor: schema.settings.theme?.borderColor,
                        borderRadius: schema.settings.theme?.borderRadius
                      }}
                      readOnly
                    />
                    <button 
                      className="px-4 py-2 text-white rounded"
                      style={{
                        backgroundColor: schema.settings.theme?.primaryColor,
                        borderRadius: schema.settings.theme?.borderRadius
                      }}
                    >
                      Sample Button
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Behavior Settings */}
        <TabsContent value="behavior">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Form Behavior</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Draft Saves</Label>
                    <p className="text-sm text-gray-600">Users can save incomplete forms</p>
                  </div>
                  <Switch
                    checked={schema.settings.allowDrafts || false}
                    onCheckedChange={(checked) => updateSettings({ allowDrafts: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Multi-Step Form</Label>
                    <p className="text-sm text-gray-600">Break form into multiple pages</p>
                  </div>
                  <Switch
                    checked={schema.settings.multiStep || false}
                    onCheckedChange={(checked) => updateSettings({ multiStep: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Authentication</Label>
                    <p className="text-sm text-gray-600">Users must be logged in</p>
                  </div>
                  <Switch
                    checked={schema.settings.requireAuth || false}
                    onCheckedChange={(checked) => updateSettings({ requireAuth: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Messages</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="success-message">Success Message</Label>
                  <Textarea
                    id="success-message"
                    value={schema.settings.successMessage || ''}
                    onChange={(e) => updateSettings({ successMessage: e.target.value })}
                    placeholder="Thank you for your submission!"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="error-message">Error Message</Label>
                  <Textarea
                    id="error-message"
                    value={schema.settings.errorMessage || ''}
                    onChange={(e) => updateSettings({ errorMessage: e.target.value })}
                    placeholder="Please correct the errors below."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Access Control</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Public Form</Label>
                    <p className="text-sm text-gray-600">Anyone can access this form</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>CAPTCHA Protection</Label>
                    <p className="text-sm text-gray-600">Prevent spam submissions</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Rate Limiting</Label>
                    <p className="text-sm text-gray-600">Limit submissions per user</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>User Permissions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Who can view submissions?</Label>
                  <Select defaultValue="course-managers">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="course-managers">Course Managers</SelectItem>
                      <SelectItem value="course-staff">Course Staff</SelectItem>
                      <SelectItem value="super-admin">Super Admin Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Who can edit this form?</Label>
                  <Select defaultValue="course-managers">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="course-managers">Course Managers</SelectItem>
                      <SelectItem value="super-admin">Super Admin Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Email Notifications</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Send confirmation email</Label>
                    <p className="text-sm text-gray-600">To form submitter</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notify course managers</Label>
                    <p className="text-sm text-gray-600">When form is submitted</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div>
                  <Label htmlFor="notification-emails">Additional Recipients</Label>
                  <Input
                    id="notification-emails"
                    placeholder="email1@example.com, email2@example.com"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Integration Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8 text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">Webhook & API integrations</p>
                  <p className="text-xs">Coming soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

