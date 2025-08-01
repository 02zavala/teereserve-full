import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/golf-courses/[id]/availability - Obtener disponibilidad del campo
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date')
    const daysAhead = parseInt(searchParams.get('days') || '30')

    // Verificar que el campo existe
    const golfCourse = await prisma.golfCourse.findUnique({
      where: { 
        OR: [
          { id },
          { slug: id }
        ]
      }
    })

    if (!golfCourse) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Campo de golf no encontrado' 
        },
        { status: 404 }
      )
    }

    const startDate = dateParam ? new Date(dateParam) : new Date()
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + daysAhead)

    // Obtener disponibilidad existente
    const availability = await prisma.availability.findMany({
      where: {
        golfCourseId: golfCourse.id,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ]
    })

    // Si no hay disponibilidad configurada, generar horarios por defecto
    if (availability.length === 0) {
      const defaultAvailability = generateDefaultAvailability(golfCourse.id, startDate, endDate)
      return NextResponse.json({
        success: true,
        data: defaultAvailability,
        isDefault: true
      })
    }

    return NextResponse.json({
      success: true,
      data: availability,
      isDefault: false
    })

  } catch (error) {
    console.error('Error fetching availability:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener la disponibilidad' 
      },
      { status: 500 }
    )
  }
}

// POST /api/golf-courses/[id]/availability - Crear/actualizar disponibilidad
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { date, timeSlots } = body

    // Verificar que el campo existe
    const golfCourse = await prisma.golfCourse.findUnique({
      where: { 
        OR: [
          { id },
          { slug: id }
        ]
      }
    })

    if (!golfCourse) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Campo de golf no encontrado' 
        },
        { status: 404 }
      )
    }

    const targetDate = new Date(date)

    // Eliminar disponibilidad existente para esa fecha
    await prisma.availability.deleteMany({
      where: {
        golfCourseId: golfCourse.id,
        date: targetDate
      }
    })

    // Crear nueva disponibilidad
    const availabilityData = timeSlots.map((slot: any) => ({
      golfCourseId: golfCourse.id,
      date: targetDate,
      startTime: new Date(`${date}T${slot.time}:00`),
      endTime: new Date(`${date}T${slot.time}:00`), // Asumiendo slots de 1 hora
      availableSlots: slot.availableSlots || 4
    }))

    const createdAvailability = await prisma.availability.createMany({
      data: availabilityData
    })

    return NextResponse.json({
      success: true,
      message: 'Disponibilidad actualizada exitosamente',
      data: createdAvailability
    })

  } catch (error) {
    console.error('Error updating availability:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al actualizar la disponibilidad' 
      },
      { status: 500 }
    )
  }
}

// Función auxiliar para generar disponibilidad por defecto
function generateDefaultAvailability(courseId: string, startDate: Date, endDate: Date) {
  const availability = []
  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    // Generar horarios de 6:00 AM a 6:00 PM cada 30 minutos
    for (let hour = 6; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        const startTime = new Date(currentDate)
        startTime.setHours(hour, minute, 0, 0)

        availability.push({
          id: `${courseId}-${currentDate.toISOString().split('T')[0]}-${timeString}`,
          golfCourseId: courseId,
          date: new Date(currentDate),
          startTime,
          endTime: new Date(startTime.getTime() + 30 * 60000), // 30 minutos después
          availableSlots: 4,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      }
    }
    
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return availability
}

