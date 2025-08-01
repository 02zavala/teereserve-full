import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// PUT /api/notifications/[id] - Actualizar notificación específica
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params
    const body = await request.json()
    const { isRead } = body

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

    // Verificar que la notificación pertenece al usuario
    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId: user.id
      }
    })

    if (!notification) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Notificación no encontrada' 
        },
        { status: 404 }
      )
    }

    // Actualizar notificación
    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: {
        isRead: isRead ?? notification.isRead,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updatedNotification.id,
        type: updatedNotification.type,
        title: updatedNotification.title,
        message: updatedNotification.message,
        isRead: updatedNotification.isRead,
        priority: updatedNotification.priority,
        actionUrl: updatedNotification.actionUrl,
        metadata: updatedNotification.metadata ? JSON.parse(updatedNotification.metadata) : null,
        createdAt: updatedNotification.createdAt.toISOString(),
        updatedAt: updatedNotification.updatedAt.toISOString()
      },
      message: 'Notificación actualizada exitosamente'
    })

  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al actualizar la notificación' 
      },
      { status: 500 }
    )
  }
}

// DELETE /api/notifications/[id] - Eliminar notificación específica
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params

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

    // Verificar que la notificación pertenece al usuario
    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId: user.id
      }
    })

    if (!notification) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Notificación no encontrada' 
        },
        { status: 404 }
      )
    }

    // Eliminar notificación
    await prisma.notification.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Notificación eliminada exitosamente'
    })

  } catch (error) {
    console.error('Error deleting notification:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al eliminar la notificación' 
      },
      { status: 500 }
    )
  }
}

