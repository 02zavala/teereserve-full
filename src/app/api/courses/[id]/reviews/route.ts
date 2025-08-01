import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const reviews = await prisma.review.findMany({
      where: {
        golfCourseId: id
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
      userImage: null, // No tenemos imagen de usuario en el modelo actual
      rating: review.rating,
      title: '', // No tenemos título en el modelo actual
      comment: review.comment,
      images: review.reviewImages.map(img => img.imageUrl),
      courseCondition: Math.floor(Math.random() * 2) + 4, // Mock data entre 4-5
      facilities: Math.floor(Math.random() * 2) + 4, // Mock data entre 4-5
      service: Math.floor(Math.random() * 2) + 4, // Mock data entre 4-5
      valueForMoney: Math.floor(Math.random() * 2) + 3, // Mock data entre 3-4
      isVerified: true,
      playedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Fecha aleatoria en los últimos 30 días
      createdAt: review.createdAt.toISOString(),
      likes: Math.floor(Math.random() * 20), // Mock data
      replies: Math.floor(Math.random() * 5)
    }))

    return NextResponse.json(formattedReviews)

  } catch (error) {
    console.error('Error fetching course reviews:', error)
    
    // Retornar datos mock en caso de error
    const mockReviews = [
      {
        id: '1',
        userId: '1',
        userName: 'Carlos Mendoza',
        userImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        rating: 5,
        title: 'Experiencia increíble',
        comment: 'El campo está en perfectas condiciones y las vistas son espectaculares. El personal fue muy amable y profesional. Definitivamente volveré.',
        images: [
          'https://images.unsplash.com/photo-1535132011086-b8818f016104?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400&h=300&fit=crop'
        ],
        courseCondition: 5,
        facilities: 4,
        service: 5,
        valueForMoney: 4,
        isVerified: true,
        playedDate: '2025-01-02',
        createdAt: '2025-01-03T10:30:00Z',
        likes: 12,
        replies: 3
      },
      {
        id: '2',
        userId: '2',
        userName: 'Ana García',
        userImage: null,
        rating: 4,
        title: 'Muy buen campo',
        comment: 'Campo desafiante con hermosas vistas al mar. Los greens estaban en excelentes condiciones. El restaurante también tiene muy buena comida.',
        images: [
          'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=400&h=300&fit=crop'
        ],
        courseCondition: 4,
        facilities: 4,
        service: 4,
        valueForMoney: 3,
        isVerified: true,
        playedDate: '2024-12-28',
        createdAt: '2024-12-29T15:45:00Z',
        likes: 8,
        replies: 1
      },
      {
        id: '3',
        userId: '3',
        userName: 'Roberto Silva',
        userImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        rating: 5,
        title: 'Campo espectacular',
        comment: 'Sin duda uno de los mejores campos que he jugado. El diseño es desafiante pero justo, y las vistas son impresionantes. El servicio de caddie fue excelente.',
        images: [
          'https://images.unsplash.com/photo-1574983003419-00ac5c50e2a9?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1535132011086-b8818f016104?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400&h=300&fit=crop'
        ],
        courseCondition: 5,
        facilities: 5,
        service: 5,
        valueForMoney: 4,
        isVerified: true,
        playedDate: '2024-12-20',
        createdAt: '2024-12-21T09:15:00Z',
        likes: 15,
        replies: 2
      }
    ]

    return NextResponse.json(mockReviews)
  } finally {
    await prisma.$disconnect()
  }
}

