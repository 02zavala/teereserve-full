"use client"

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import EnhancedCourseSelector from '@/components/enhanced-course-selector'

export default function CoursesPage() {
  const [selectedCourse, setSelectedCourse] = useState<any>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Botón de regreso al inicio */}
      <div className="container mx-auto px-4 pt-8">
        <Link 
          href="/" 
          className="inline-flex items-center text-green-700 hover:text-green-800 transition-colors mb-6 text-2xl font-semibold"
        >
          <ArrowLeft className="w-8 h-8 mr-3" />
          Regresar al inicio
        </Link>
      </div>

      {/* Header Mejorado */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Campos de Golf Premium
            </h1>
            <p className="text-xl md:text-2xl text-green-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Descubre los mejores campos de golf de México. Reserva tu tee time perfecto en destinos exclusivos.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-lg">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2">
                15 Campos Disponibles
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2">
                Los Cabos • La Paz • Loreto
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2">
                Diseños de Clase Mundial
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Selector de Campos Mejorado */}
      <div className="container mx-auto px-4 py-12">
        <EnhancedCourseSelector
          onCourseSelect={(course) => setSelectedCourse(course)}
          showMap={true}
        />
      </div>
    </div>
  )
}
