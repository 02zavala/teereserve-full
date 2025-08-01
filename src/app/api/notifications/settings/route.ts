import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/notifications/settings - Obtener configuración de notificaciones
export async function GET(request: NextRequest) {
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

    // Obtener configuración de notificaciones
    let settings = await prisma.notificationSettings.findUnique({
      where: { userId: user.id }
    })

    // Si no existe, crear configuración por defecto
    if (!settings) {
      settings = await prisma.notificationSettings.create({
        data: {
          userId: user.id,
          emailNotifications: true,
          pushNotifications: true,
          smsNotifications: false,
          reservationUpdates: true,
          paymentAlerts: true,
          promotionalEmails: false,
          systemUpdates: true
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        emailNotifications: settings.emailNotifications,
        pushNotifications: settings.pushNotifications,
        smsNotifications: settings.smsNotifications,
        reservationUpdates: settings.reservationUpdates,
        paymentAlerts: settings.paymentAlerts,
        promotionalEmails: settings.promotionalEmails,
        systemUpdates: settings.systemUpdates
      }
    })

  } catch (error) {
    console.error('Error fetching notification settings:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener la configuración' 
      },
      { status: 500 }
    )
  }
}

// PUT /api/notifications/settings - Actualizar configuración de notificaciones
export async function PUT(request: NextRequest) {
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

    const body = await request.json()
    const { settings } = body

    if (!settings) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'settings es requerido' 
        },
        { status: 400 }
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

    // Actualizar configuración
    const updatedSettings = await prisma.notificationSettings.upsert({
      where: { userId: user.id },
      update: {
        emailNotifications: settings.emailNotifications,
        pushNotifications: settings.pushNotifications,
        smsNotifications: settings.smsNotifications,
        reservationUpdates: settings.reservationUpdates,
        paymentAlerts: settings.paymentAlerts,
        promotionalEmails: settings.promotionalEmails,
        systemUpdates: settings.systemUpdates,
        updatedAt: new Date()
      },
      create: {
        userId: user.id,
        emailNotifications: settings.emailNotifications ?? true,
        pushNotifications: settings.pushNotifications ?? true,
        smsNotifications: settings.smsNotifications ?? false,
        reservationUpdates: settings.reservationUpdates ?? true,
        paymentAlerts: settings.paymentAlerts ?? true,
        promotionalEmails: settings.promotionalEmails ?? false,
        systemUpdates: settings.systemUpdates ?? true
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        emailNotifications: updatedSettings.emailNotifications,
        pushNotifications: updatedSettings.pushNotifications,
        smsNotifications: updatedSettings.smsNotifications,
        reservationUpdates: updatedSettings.reservationUpdates,
        paymentAlerts: updatedSettings.paymentAlerts,
        promotionalEmails: updatedSettings.promotionalEmails,
        systemUpdates: updatedSettings.systemUpdates
      },
      message: 'Configuración actualizada exitosamente'
    })

  } catch (error) {
    console.error('Error updating notification settings:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al actualizar la configuración' 
      },
      { status: 500 }
    )
  }
}

