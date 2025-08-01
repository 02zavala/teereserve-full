import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/availability/real-time - Obtener disponibilidad en tiempo real
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const date = searchParams.get('date')
    const players = parseInt(searchParams.get('players') || '1')

    if (!courseId || !date) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'courseId y date son requeridos' 
        },
        { status: 400 }
      )
    }

    // Obtener información del campo
    const golfCourse = await prisma.golfCourse.findUnique({
      where: { 
        OR: [
          { id: courseId },
          { slug: courseId }
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
    
    // Obtener disponibilidad configurada
    let availability = await prisma.availability.findMany({
      where: {
        golfCourseId: golfCourse.id,
        date: targetDate
      },
      orderBy: {
        startTime: 'asc'
      }
    })

    // Si no hay disponibilidad configurada, generar horarios por defecto
    if (availability.length === 0) {
      availability = generateDefaultTimeSlots(golfCourse.id, targetDate)
    }

    // Obtener reservas existentes para esa fecha
    const existingReservations = await prisma.reservation.findMany({
      where: {
        courseId: golfCourse.id,
        date: targetDate,
        status: {
          in: ['pending', 'confirmed']
        }
      }
    })

    // Calcular disponibilidad real considerando reservas existentes
    const realTimeAvailability = await Promise.all(
      availability.map(async (slot) => {
        const timeString = slot.startTime.toTimeString().slice(0, 5)
        
        // Contar reservas para este horario específico
        const reservationsForSlot = existingReservations.filter(
          reservation => reservation.time === timeString
        )
        
        const totalPlayersReserved = reservationsForSlot.reduce(
          (sum, reservation) => sum + reservation.players, 0
        )
        
        const availableSlots = Math.max(0, slot.availableSlots - Math.ceil(totalPlayersReserved / 4))
        const canAccommodatePlayers = availableSlots > 0 && (availableSlots * 4) >= players

        // Calcular precio dinámico
        const pricingResponse = await fetch(
          `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/pricing/dynamic?courseId=${courseId}&date=${date}&time=${timeString}&players=${players}`,
          { method: 'GET' }
        )
        
        let pricing = null
        if (pricingResponse.ok) {
          const pricingData = await pricingResponse.json()
          pricing = pricingData.success ? pricingData.data : null
        }

        return {
          id: slot.id,
          time: timeString,
          startTime: slot.startTime,
          endTime: slot.endTime,
          totalSlots: slot.availableSlots,
          availableSlots,
          reservedSlots: Math.ceil(totalPlayersReserved / 4),
          totalPlayersReserved,
          canAccommodatePlayers,
          isAvailable: canAccommodatePlayers,
          pricing: pricing ? {
            pricePerPlayer: pricing.pricePerPlayer,
            totalPrice: pricing.totalPrice,
            currency: pricing.currency,
            factors: pricing.factors
          } : null,
          status: getSlotStatus(availableSlots, slot.availableSlots),
          reservations: reservationsForSlot.map(r => ({
            id: r.id,
            players: r.players,
            customerName: `${r.customerFirstName} ${r.customerLastName}`,
            status: r.status
          }))
        }
      })
    )

    // Integración con sistema externo de tee sheet (si está configurado)
    if (golfCourse.teeSheetUrl) {
      try {
        const externalAvailability = await fetchExternalTeeSheet(golfCourse.teeSheetUrl, date)
        // Combinar con disponibilidad local
        // Esta lógica dependería del formato del sistema externo
      } catch (error) {
        console.warn('Error fetching external tee sheet:', error)
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        courseId: golfCourse.id,
        courseName: golfCourse.name,
        date,
        players,
        currency: golfCourse.currency || 'USD',
        availability: realTimeAvailability,
        summary: {
          totalSlots: realTimeAvailability.length,
          availableSlots: realTimeAvailability.filter(slot => slot.isAvailable).length,
          reservedSlots: realTimeAvailability.filter(slot => slot.reservedSlots > 0).length,
          fullyBookedSlots: realTimeAvailability.filter(slot => slot.availableSlots === 0).length
        },
        lastUpdated: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error fetching real-time availability:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener disponibilidad en tiempo real' 
      },
      { status: 500 }
    )
  }
}

// POST /api/availability/real-time - Actualizar disponibilidad en tiempo real
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { courseId, date, timeSlots, source = 'manual' } = body

    // Verificar que el campo existe
    const golfCourse = await prisma.golfCourse.findUnique({
      where: { 
        OR: [
          { id: courseId },
          { slug: courseId }
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
      endTime: new Date(`${date}T${slot.time}:00`),
      availableSlots: slot.availableSlots || 4
    }))

    await prisma.availability.createMany({
      data: availabilityData
    })

    return NextResponse.json({
      success: true,
      message: 'Disponibilidad actualizada exitosamente',
      data: {
        courseId: golfCourse.id,
        date,
        slotsUpdated: timeSlots.length,
        source
      }
    })

  } catch (error) {
    console.error('Error updating real-time availability:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al actualizar disponibilidad' 
      },
      { status: 500 }
    )
  }
}

// Función auxiliar para generar horarios por defecto
function generateDefaultTimeSlots(courseId: string, date: Date) {
  const slots = []
  
  // Generar horarios de 6:00 AM a 6:00 PM cada 30 minutos
  for (let hour = 6; hour <= 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const startTime = new Date(date)
      startTime.setHours(hour, minute, 0, 0)
      
      const endTime = new Date(startTime)
      endTime.setMinutes(endTime.getMinutes() + 30)

      slots.push({
        id: `${courseId}-${date.toISOString().split('T')[0]}-${hour.toString().padStart(2, '0')}${minute.toString().padStart(2, '0')}`,
        golfCourseId: courseId,
        date,
        startTime,
        endTime,
        availableSlots: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }
  }
  
  return slots
}

// Función auxiliar para determinar el estado del slot
function getSlotStatus(availableSlots: number, totalSlots: number) {
  if (availableSlots === 0) return 'full'
  if (availableSlots <= totalSlots * 0.25) return 'limited'
  if (availableSlots <= totalSlots * 0.5) return 'moderate'
  return 'available'
}

// Función auxiliar para integración con sistemas externos
async function fetchExternalTeeSheet(teeSheetUrl: string, date: string) {
  // Esta función se implementaría según el API del sistema externo
  // Ejemplos: Golf Now, Tee Times, sistemas propietarios, etc.
  
  try {
    const response = await fetch(`${teeSheetUrl}/availability?date=${date}`, {
      headers: {
        'Authorization': `Bearer ${process.env.EXTERNAL_TEE_SHEET_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.error('External tee sheet integration error:', error)
  }
  
  return null
}

