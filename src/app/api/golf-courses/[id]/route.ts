import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/golf-courses/[id] - Obtener campo específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const golfCourse = await prisma.golfCourse.findUnique({
      where: { 
        OR: [
          { id },
          { slug: id }
        ]
      },
      include: {
        galleryImages: {
          orderBy: {
            displayOrder: 'asc'
          }
        },
        reviews: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            },
            reviewImages: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        availability: {
          where: {
            date: {
              gte: new Date()
            }
          },
          orderBy: {
            date: 'asc'
          }
        },
        _count: {
          select: {
            reviews: true,
            bookings: true
          }
        }
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

    // Calcular rating promedio
    const totalRating = golfCourse.reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = golfCourse.reviews.length > 0 ? totalRating / golfCourse.reviews.length : 0

    const courseWithRating = {
      ...golfCourse,
      rating: averageRating,
      reviewCount: golfCourse._count.reviews,
      bookingCount: golfCourse._count.bookings
    }

    return NextResponse.json({
      success: true,
      data: courseWithRating
    })

  } catch (error) {
    console.error('Error fetching golf course:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener el campo de golf' 
      },
      { status: 500 }
    )
  }
}

// PUT /api/golf-courses/[id] - Actualizar campo específico
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    // Verificar que el campo existe
    const existingCourse = await prisma.golfCourse.findUnique({
      where: { id }
    })

    if (!existingCourse) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Campo de golf no encontrado' 
        },
        { status: 404 }
      )
    }

    // Actualizar el campo
    const updatedCourse = await prisma.golfCourse.update({
      where: { id },
      data: {
        ...body,
        updatedAt: new Date()
      },
      include: {
        galleryImages: true,
        reviews: true
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedCourse
    })

  } catch (error) {
    console.error('Error updating golf course:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al actualizar el campo de golf' 
      },
      { status: 500 }
    )
  }
}

