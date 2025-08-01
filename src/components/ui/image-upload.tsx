"use client"

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Upload, X, Image as ImageIcon, Eye } from 'lucide-react'
import Image from 'next/image'

interface ImageUploadProps {
  onImagesChange: (images: File[]) => void
  maxImages?: number
  existingImages?: string[]
  className?: string
  accept?: string
}

interface ImagePreview {
  file: File
  url: string
  id: string
}

export default function ImageUpload({
  onImagesChange,
  maxImages = 10,
  existingImages = [],
  className = "",
  accept = "image/*"
}: ImageUploadProps) {
  const [images, setImages] = useState<ImagePreview[]>([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (files: FileList | null) => {
    if (!files) return

    const newImages: ImagePreview[] = []
    const remainingSlots = maxImages - images.length - existingImages.length

    for (let i = 0; i < Math.min(files.length, remainingSlots); i++) {
      const file = files[i]
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file)
        newImages.push({
          file,
          url,
          id: Math.random().toString(36).substr(2, 9)
        })
      }
    }

    const updatedImages = [...images, ...newImages]
    setImages(updatedImages)
    onImagesChange(updatedImages.map(img => img.file))
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleFiles(e.dataTransfer.files)
  }

  const removeImage = (id: string) => {
    const updatedImages = images.filter(img => img.id !== id)
    setImages(updatedImages)
    onImagesChange(updatedImages.map(img => img.file))
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const totalImages = images.length + existingImages.length
  const canAddMore = totalImages < maxImages

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      {canAddMore && (
        <Card 
          className={`border-2 border-dashed transition-colors cursor-pointer ${
            dragActive 
              ? 'border-golf-green-500 bg-golf-green-50' 
              : 'border-gray-300 hover:border-golf-green-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Upload className="h-10 w-10 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Arrastra y suelta imágenes aquí
            </p>
            <p className="text-sm text-gray-500 mb-4">
              o haz clic para seleccionar archivos
            </p>
            <Button variant="outline" type="button">
              <ImageIcon className="h-4 w-4 mr-2" />
              Seleccionar Imágenes
            </Button>
            <p className="text-xs text-gray-400 mt-2">
              {totalImages}/{maxImages} imágenes
            </p>
          </CardContent>
        </Card>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={accept}
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Imágenes Existentes
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {existingImages.map((imageUrl, index) => (
              <Card key={index} className="relative group">
                <CardContent className="p-2">
                  <div className="relative aspect-square">
                    <Image
                      src={imageUrl}
                      alt={`Imagen existente ${index + 1}`}
                      fill
                      className="object-cover rounded-md"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-md flex items-center justify-center">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => window.open(imageUrl, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Badge variant="secondary" className="mt-2 text-xs">
                    Existente
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* New Images Preview */}
      {images.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Nuevas Imágenes ({images.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <Card key={image.id} className="relative group">
                <CardContent className="p-2">
                  <div className="relative aspect-square">
                    <Image
                      src={image.url}
                      alt="Preview"
                      fill
                      className="object-cover rounded-md"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeImage(image.id)
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <Badge variant="default" className="mt-2 text-xs bg-golf-green-600">
                    Nueva
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      {totalImages >= maxImages && (
        <div className="text-center p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-700">
            Has alcanzado el límite máximo de {maxImages} imágenes.
          </p>
        </div>
      )}
    </div>
  )
}

