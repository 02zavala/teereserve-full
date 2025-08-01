import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/golf-courses - Obtener todos los campos de golf
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('active')
    const location = searchParams.get('location')
    const difficulty = searchParams.get('difficulty')

    const where: any = {}
    
    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }
    
    if (location) {
      where.location = {
        contains: location,
        mode: 'insensitive'
      }
    }
    
    if (difficulty) {
      where.difficulty = difficulty
    }

    const golfCourses = await prisma.golfCourse.findMany({
      where,
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
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            reviews: true,
            bookings: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calcular rating promedio para cada campo
    const coursesWithRating = golfCourses.map(course => {
      const totalRating = course.reviews.reduce((sum, review) => sum + review.rating, 0)
      const averageRating = course.reviews.length > 0 ? totalRating / course.reviews.length : 0
      
      return {
        ...course,
        rating: averageRating,
        reviewCount: course._count.reviews,
        bookingCount: course._count.bookings
      }
    })

    return NextResponse.json({
      success: true,
      data: coursesWithRating
    })
  } catch (error) {
    console.error('Error fetching golf courses:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener los campos de golf' 
      },
      { status: 500 }
    )
  }
}

// POST /api/golf-courses - Crear nuevo campo de golf
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      name,
      location,
      description,
      holes,
      priceWeekday,
      priceWeekend,
      currency = 'USD',
      features,
      difficulty,
      contactEmail,
      contactPhone,
      imageUrl,
      galleryImages = []
    } = body

    // Validaciones básicas
    if (!name || !location) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Nombre y ubicación son requeridos' 
        },
        { status: 400 }
      )
    }

    // Generar slug único
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()

    let slug = baseSlug
    let counter = 1
    
    while (await prisma.golfCourse.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Crear el campo de golf
    const golfCourse = await prisma.golfCourse.create({
      data: {
        name,
        slug,
        location,
        description,
        holes: parseInt(holes) || 18,
        priceWeekday: parseFloat(priceWeekday) || 0,
        priceWeekend: parseFloat(priceWeekend) || 0,
        currency,
        features,
        difficulty,
        contactEmail,
        contactPhone,
        imageUrl,
        isActive: true
      }
    })

    // Agregar imágenes de galería si se proporcionan
    if (galleryImages.length > 0) {
      await prisma.golfCourseImage.createMany({
        data: galleryImages.map((image: any, index: number) => ({
          golfCourseId: golfCourse.id,
          imageUrl: image.url,
          caption: image.caption || '',
          displayOrder: index
        }))
      })
    }

    return NextResponse.json({
      success: true,
      data: golfCourse
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating golf course:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al crear el campo de golf' 
      },
      { status: 500 }
    )
  }
}

// PUT /api/golf-courses - Actualizar campo de golf
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ID del campo es requerido' 
        },
        { status: 400 }
      )
    }

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
        ...updateData,
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

// DELETE /api/golf-courses - Eliminar campo de golf
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ID del campo es requerido' 
        },
        { status: 400 }
      )
    }

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

    // En lugar de eliminar, desactivar el campo
    const deactivatedCourse = await prisma.golfCourse.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Campo de golf desactivado exitosamente',
      data: deactivatedCourse
    })

  } catch (error) {
    console.error('Error deactivating golf course:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al desactivar el campo de golf' 
      },
      { status: 500 }
    )
  }
}

