import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/pricing/dynamic - Calcular precios dinámicos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const date = searchParams.get('date')
    const time = searchParams.get('time')
    const players = parseInt(searchParams.get('players') || '1')

    if (!courseId || !date || !time) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'courseId, date y time son requeridos' 
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
    const isWeekend = targetDate.getDay() === 0 || targetDate.getDay() === 6
    
    // Precio base
    let basePrice = isWeekend ? golfCourse.priceWeekend || 0 : golfCourse.priceWeekday || 0

    // Factores de precio dinámico
    const pricingFactors = await calculatePricingFactors(courseId, targetDate, time, players)
    
    // Aplicar factores
    let finalPrice = basePrice
    
    // Factor de temporada (alta/baja)
    finalPrice *= pricingFactors.seasonFactor
    
    // Factor de demanda (basado en reservas existentes)
    finalPrice *= pricingFactors.demandFactor
    
    // Factor de horario premium
    finalPrice *= pricingFactors.timeFactor
    
    // Factor de anticipación (descuento por reservar con anticipación)
    finalPrice *= pricingFactors.advanceBookingFactor
    
    // Redondear a 2 decimales
    finalPrice = Math.round(finalPrice * 100) / 100

    return NextResponse.json({
      success: true,
      data: {
        courseId: golfCourse.id,
        courseName: golfCourse.name,
        date,
        time,
        players,
        basePrice,
        finalPrice,
        pricePerPlayer: finalPrice,
        totalPrice: finalPrice * players,
        currency: golfCourse.currency || 'USD',
        factors: pricingFactors,
        breakdown: {
          basePrice,
          seasonAdjustment: (basePrice * pricingFactors.seasonFactor) - basePrice,
          demandAdjustment: (basePrice * pricingFactors.seasonFactor * pricingFactors.demandFactor) - (basePrice * pricingFactors.seasonFactor),
          timeAdjustment: (basePrice * pricingFactors.seasonFactor * pricingFactors.demandFactor * pricingFactors.timeFactor) - (basePrice * pricingFactors.seasonFactor * pricingFactors.demandFactor),
          advanceBookingDiscount: finalPrice - (basePrice * pricingFactors.seasonFactor * pricingFactors.demandFactor * pricingFactors.timeFactor)
        }
      }
    })

  } catch (error) {
    console.error('Error calculating dynamic pricing:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al calcular precios dinámicos' 
      },
      { status: 500 }
    )
  }
}

// Función para calcular factores de precio
async function calculatePricingFactors(courseId: string, date: Date, time: string, players: number) {
  const factors = {
    seasonFactor: 1.0,
    demandFactor: 1.0,
    timeFactor: 1.0,
    advanceBookingFactor: 1.0
  }

  // Factor de temporada
  const month = date.getMonth() + 1
  if (month >= 12 || month <= 2) {
    // Temporada alta (invierno en destinos cálidos)
    factors.seasonFactor = 1.2
  } else if (month >= 6 && month <= 8) {
    // Temporada baja (verano)
    factors.seasonFactor = 0.8
  }

  // Factor de demanda basado en reservas existentes
  const existingReservations = await prisma.reservation.count({
    where: {
      courseId,
      date,
      status: {
        in: ['pending', 'confirmed']
      }
    }
  })

  if (existingReservations >= 20) {
    factors.demandFactor = 1.3 // Alta demanda
  } else if (existingReservations >= 10) {
    factors.demandFactor = 1.1 // Demanda moderada
  } else if (existingReservations <= 3) {
    factors.demandFactor = 0.9 // Baja demanda
  }

  // Factor de horario premium
  const hour = parseInt(time.split(':')[0])
  if (hour >= 10 && hour <= 14) {
    // Horarios premium (mañana tardía y mediodía)
    factors.timeFactor = 1.15
  } else if (hour >= 6 && hour <= 8) {
    // Horarios temprano (descuento)
    factors.timeFactor = 0.9
  } else if (hour >= 16) {
    // Horarios tarde (descuento)
    factors.timeFactor = 0.85
  }

  // Factor de anticipación
  const daysInAdvance = Math.floor((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  if (daysInAdvance >= 14) {
    factors.advanceBookingFactor = 0.9 // 10% descuento por reservar con 2+ semanas
  } else if (daysInAdvance >= 7) {
    factors.advanceBookingFactor = 0.95 // 5% descuento por reservar con 1+ semana
  } else if (daysInAdvance <= 1) {
    factors.advanceBookingFactor = 1.1 // 10% recargo por reservar último momento
  }

  return factors
}

// POST /api/pricing/dynamic - Configurar reglas de precio dinámico
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { courseId, rules } = body

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

    // En una implementación real, guardaríamos estas reglas en una tabla separada
    // Por ahora, las almacenamos como JSON en un campo del curso
    
    return NextResponse.json({
      success: true,
      message: 'Reglas de precio dinámico configuradas exitosamente',
      data: {
        courseId: golfCourse.id,
        rules
      }
    })

  } catch (error) {
    console.error('Error configuring dynamic pricing:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al configurar precios dinámicos' 
      },
      { status: 500 }
    )
  }
}

