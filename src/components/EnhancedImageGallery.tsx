
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, Maximize2, Heart, Share2, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface EnhancedImageGalleryProps {
  images: string[]
  courseName: string
  mainImage: string
}

export default function EnhancedImageGallery({ images, courseName, mainImage }: EnhancedImageGalleryProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)

  // Combinar imagen principal con galería
  const allImages = [mainImage, ...images.filter(img => img !== mainImage)]
  
  const openModal = (index: number) => {
    setCurrentImageIndex(index)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: courseName,
          text: `Mira este increíble campo de golf: ${courseName}`,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copiar URL al portapapeles
      navigator.clipboard.writeText(window.location.href)
      // Aquí podrías mostrar un toast de confirmación
    }
  }

  return (
    <>
      {/* Galería Principal */}
      <div className="relative mb-8">
        <div className="grid grid-cols-4 gap-2 h-[400px] md:h-[500px]">
          {/* Imagen Principal */}
          <div 
            className="col-span-2 row-span-2 relative cursor-pointer group overflow-hidden rounded-l-lg"
            onClick={() => openModal(0)}
          >
            <Image
              src={allImages[0]}
              alt={`${courseName} - Vista principal`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 33vw"
              priority
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            
            {/* Badge Premium */}
            <div className="absolute top-4 left-4">
              <Badge className="bg-green-600 text-white px-3 py-1 text-sm font-medium">
                <Camera className="w-4 h-4 mr-1" />
                Vista Principal
              </Badge>
            </div>
          </div>

          {/* Imágenes Secundarias */}
          {allImages.slice(1, 5).map((image, index) => (
            <div
              key={index + 1}
              className={`relative cursor-pointer group overflow-hidden ${
                index === 1 ? 'rounded-tr-lg' : ''
              } ${index === 3 ? 'rounded-br-lg' : ''}`}
              onClick={() => openModal(index + 1)}
            >
              <Image
                src={image}
                alt={`${courseName} - Vista ${index + 2}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 25vw, 16vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              
              {/* Overlay para mostrar más fotos */}
              {index === 3 && allImages.length > 5 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-white text-center">
                    <Maximize2 className="w-8 h-8 mx-auto mb-2" />
                    <span className="text-lg font-semibold">+{allImages.length - 5}</span>
                    <div className="text-sm">más fotos</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Botones de Acción Flotantes */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="bg-white/90 hover:bg-white shadow-lg"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4 mr-1" />
            Compartir
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className={`shadow-lg transition-colors ${
              isLiked 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-white/90 hover:bg-white'
            }`}
            onClick={() => setIsLiked(!isLiked)}
          >
            <Heart className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
            {isLiked ? 'Guardado' : 'Guardar'}
          </Button>
        </div>

        {/* Botón Ver Todas las Fotos */}
        <Button
          variant="outline"
          className="absolute bottom-4 right-4 bg-white/90 hover:bg-white shadow-lg border-gray-300"
          onClick={() => openModal(0)}
        >
          <Camera className="w-4 h-4 mr-2" />
          Ver todas las fotos ({allImages.length})
        </Button>
      </div>

      {/* Modal de Galería Completa */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
          {/* Botón Cerrar */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
            onClick={closeModal}
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Contador de Imágenes */}
          <div className="absolute top-4 left-4 text-white z-10">
            <span className="text-lg font-medium">
              {currentImageIndex + 1} / {allImages.length}
            </span>
          </div>

          {/* Imagen Principal */}
          <div className="relative w-full h-full max-w-6xl max-h-[90vh] mx-4">
            <Image
              src={allImages[currentImageIndex]}
              alt={`${courseName} - Vista ${currentImageIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>

          {/* Controles de Navegación */}
          {allImages.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="lg"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
                onClick={prevImage}
              >
                <ChevronLeft className="w-8 h-8" />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
                onClick={nextImage}
              >
                <ChevronRight className="w-8 h-8" />
              </Button>
            </>
          )}

          {/* Miniaturas */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto px-4">
            {allImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentImageIndex 
                    ? 'border-white scale-110' 
                    : 'border-white/50 hover:border-white/80'
                }`}
              >
                <Image
                  src={image}
                  alt={`Vista ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            ))}
          </div>

          {/* Información de la Imagen */}
          <div className="absolute bottom-20 left-4 text-white">
            <h3 className="text-xl font-semibold mb-1">{courseName}</h3>
            <p className="text-white/80">
              {currentImageIndex === 0 ? 'Vista principal del campo' : `Vista ${currentImageIndex + 1}`}
            </p>
          </div>
        </div>
      )}
    </>
  )
}


