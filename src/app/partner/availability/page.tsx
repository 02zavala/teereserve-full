"use client"

import React, { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AvailabilityManager from '@/components/availability-manager'

export default function PartnerAvailabilityPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Redirect if not authenticated or not a golf course
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }
    
    if (session.user.role !== 'GolfCourse') {
      router.push('/denied')
      return
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  // For now, we'll use a placeholder golf course ID
  // In a real implementation, this would come from the user's profile
  const golfCourseId = "cabo-real-golf-club" // This should be dynamic based on the logged-in golf course

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Gestión de Disponibilidad</h1>
        <p className="text-gray-600">
          Configura los horarios disponibles para reservas en tu campo de golf
        </p>
      </div>

      <AvailabilityManager golfCourseId={golfCourseId} />
    </div>
  )
}

