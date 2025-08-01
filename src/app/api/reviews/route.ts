import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const courseId = formData.get('courseId') as string
    const rating = parseInt(formData.get('rating') as string)
    const title = formData.get('title') as string
    const comment = formData.get('comment') as string
    const courseCondition = parseInt(formData.get('courseCondition') as string) || 0
    const facilities = parseInt(formData.get('facilities') as string) || 0
    const service = parseInt(formData.get('service') as string) || 0
    const valueForMoney = parseInt(formData.get('valueForMoney') as string) || 0
    const playedDate = formData.get('playedDate') as string

    // Validar datos requeridos
    if (!courseId || !rating || !comment) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      )
    }

    // Por ahora usar un usuario mock (en producción se obtendría del token de sesión)
    const mockUserId = 'user-mock-id'

    // Crear la reseña
    const review = await prisma.review.create({
      data: {
        userId: mockUserId,
        golfCourseId: courseId,
        rating: rating,
        comment: comment
      }
    })

    // Procesar imágenes si las hay
    const imageUrls: string[] = []
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'reviews')
    
    // Crear directorio si no existe
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      // El directorio ya existe
    }

    // Procesar cada imagen
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('image_') && value instanceof File) {
        const file = value as File
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Generar nombre único para el archivo
        const fileExtension = file.name.split('.').pop()
        const fileName = `${uuidv4()}.${fileExtension}`
        const filePath = join(uploadDir, fileName)

        // Guardar archivo
        await writeFile(filePath, buffer)
        
        // Guardar URL en la base de datos
        const imageUrl = `/uploads/reviews/${fileName}`
        imageUrls.push(imageUrl)

        await prisma.reviewImage.create({
          data: {
            reviewId: review.id,
            imageUrl: imageUrl,
            caption: `Foto de reseña de ${title || 'usuario'}`
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      review: {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        images: imageUrls
      }
    })

  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    if (!courseId) {
      return NextResponse.json(
        { error: 'courseId es requerido' },
        { status: 400 }
      )
    }

    const reviews = await prisma.review.findMany({
      where: {
        golfCourseId: courseId
      },
      include: {
        user: {
          select: {
            name: true
          }
        },
        reviewImages: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedReviews = reviews.map(review => ({
      id: review.id,
      userId: review.userId,
      userName: review.user.name || 'Usuario Anónimo',
      rating: review.rating,
      title: '', // No tenemos título en el modelo actual
      comment: review.comment,
      images: review.reviewImages.map(img => img.imageUrl),
      courseCondition: 0, // No tenemos estos campos en el modelo actual
      facilities: 0,
      service: 0,
      valueForMoney: 0,
      isVerified: true,
      playedDate: '',
      createdAt: review.createdAt.toISOString(),
      likes: Math.floor(Math.random() * 20), // Mock data
      replies: Math.floor(Math.random() * 5)
    }))

    return NextResponse.json(formattedReviews)

  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

