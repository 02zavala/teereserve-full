import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST /api/notifications/mark-all-read - Marcar todas las notificaciones como leídas
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No autorizado' 
        },
        { status: 401 }
      )
    }

    // Obtener usuario
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Usuario no encontrado' 
        },
        { status: 404 }
      )
    }

    // Marcar todas las notificaciones no leídas como leídas
    const result = await prisma.notification.updateMany({
      where: {
        userId: user.id,
        isRead: false
      },
      data: {
        isRead: true,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        updatedCount: result.count
      },
      message: `${result.count} notificaciones marcadas como leídas`
    })

  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al marcar las notificaciones como leídas' 
      },
      { status: 500 }
    )
  }
}

