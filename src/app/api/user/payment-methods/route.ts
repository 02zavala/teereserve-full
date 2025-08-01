import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/user/payment-methods - Obtener métodos de pago del usuario
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

    // Obtener métodos de pago activos
    const paymentMethods = await prisma.paymentMethod.findMany({
      where: {
        userId: user.id,
        isActive: true
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    // Formatear métodos de pago para el frontend
    const formattedMethods = paymentMethods.map(method => {
      let metadata = {}
      try {
        metadata = method.metadata ? JSON.parse(method.metadata) : {}
      } catch (error) {
        console.error('Error parsing payment method metadata:', error)
      }

      return {
        id: method.id,
        type: method.type,
        provider: method.provider,
        isDefault: method.isDefault,
        isActive: method.isActive,
        expiresAt: method.expiresAt?.toISOString(),
        createdAt: method.createdAt.toISOString(),
        updatedAt: method.updatedAt.toISOString(),
        ...metadata // Incluir metadatos como last4, brand, etc.
      }
    })

    return NextResponse.json({
      success: true,
      data: formattedMethods
    })

  } catch (error) {
    console.error('Error fetching payment methods:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener los métodos de pago' 
      },
      { status: 500 }
    )
  }
}

// POST /api/user/payment-methods - Agregar nuevo método de pago
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

    const body = await request.json()
    const { type, provider, providerPaymentMethodId, metadata, isDefault = false } = body

    if (!type || !provider || !providerPaymentMethodId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'type, provider y providerPaymentMethodId son requeridos' 
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

    // Verificar que el método no existe ya
    const existingMethod = await prisma.paymentMethod.findUnique({
      where: {
        userId_provider_providerPaymentMethodId: {
          userId: user.id,
          provider,
          providerPaymentMethodId
        }
      }
    })

    if (existingMethod) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Este método de pago ya está guardado' 
        },
        { status: 400 }
      )
    }

    // Si se marca como predeterminado, desmarcar otros métodos
    if (isDefault) {
      await prisma.paymentMethod.updateMany({
        where: {
          userId: user.id,
          isDefault: true
        },
        data: {
          isDefault: false
        }
      })
    }

    // Crear método de pago
    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        userId: user.id,
        type,
        provider,
        providerPaymentMethodId,
        isDefault,
        metadata: metadata ? JSON.stringify(metadata) : null,
        expiresAt: metadata?.expiresAt ? new Date(metadata.expiresAt) : null
      }
    })

    // Formatear respuesta
    let parsedMetadata = {}
    try {
      parsedMetadata = paymentMethod.metadata ? JSON.parse(paymentMethod.metadata) : {}
    } catch (error) {
      console.error('Error parsing metadata:', error)
    }

    return NextResponse.json({
      success: true,
      data: {
        id: paymentMethod.id,
        type: paymentMethod.type,
        provider: paymentMethod.provider,
        isDefault: paymentMethod.isDefault,
        isActive: paymentMethod.isActive,
        expiresAt: paymentMethod.expiresAt?.toISOString(),
        createdAt: paymentMethod.createdAt.toISOString(),
        updatedAt: paymentMethod.updatedAt.toISOString(),
        ...parsedMetadata
      },
      message: 'Método de pago agregado exitosamente'
    }, { status: 201 })

  } catch (error) {
    console.error('Error adding payment method:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al agregar el método de pago' 
      },
      { status: 500 }
    )
  }
}

// PUT /api/user/payment-methods - Actualizar método de pago
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
    const { paymentMethodId, isDefault, isActive } = body

    if (!paymentMethodId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'paymentMethodId es requerido' 
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

    // Verificar que el método pertenece al usuario
    const existingMethod = await prisma.paymentMethod.findFirst({
      where: {
        id: paymentMethodId,
        userId: user.id
      }
    })

    if (!existingMethod) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Método de pago no encontrado' 
        },
        { status: 404 }
      )
    }

    const updateData: any = {
      updatedAt: new Date()
    }

    // Si se marca como predeterminado, desmarcar otros métodos
    if (isDefault === true) {
      await prisma.paymentMethod.updateMany({
        where: {
          userId: user.id,
          isDefault: true,
          id: {
            not: paymentMethodId
          }
        },
        data: {
          isDefault: false
        }
      })
      updateData.isDefault = true
    } else if (isDefault === false) {
      updateData.isDefault = false
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive
    }

    // Actualizar método de pago
    const updatedMethod = await prisma.paymentMethod.update({
      where: { id: paymentMethodId },
      data: updateData
    })

    // Formatear respuesta
    let parsedMetadata = {}
    try {
      parsedMetadata = updatedMethod.metadata ? JSON.parse(updatedMethod.metadata) : {}
    } catch (error) {
      console.error('Error parsing metadata:', error)
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updatedMethod.id,
        type: updatedMethod.type,
        provider: updatedMethod.provider,
        isDefault: updatedMethod.isDefault,
        isActive: updatedMethod.isActive,
        expiresAt: updatedMethod.expiresAt?.toISOString(),
        createdAt: updatedMethod.createdAt.toISOString(),
        updatedAt: updatedMethod.updatedAt.toISOString(),
        ...parsedMetadata
      },
      message: 'Método de pago actualizado exitosamente'
    })

  } catch (error) {
    console.error('Error updating payment method:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al actualizar el método de pago' 
      },
      { status: 500 }
    )
  }
}

// DELETE /api/user/payment-methods - Eliminar método de pago
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const paymentMethodId = searchParams.get('paymentMethodId')

    if (!paymentMethodId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'paymentMethodId es requerido' 
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

    // Verificar que el método pertenece al usuario
    const existingMethod = await prisma.paymentMethod.findFirst({
      where: {
        id: paymentMethodId,
        userId: user.id
      }
    })

    if (!existingMethod) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Método de pago no encontrado' 
        },
        { status: 404 }
      )
    }

    // Eliminar método de pago
    await prisma.paymentMethod.delete({
      where: { id: paymentMethodId }
    })

    return NextResponse.json({
      success: true,
      message: 'Método de pago eliminado exitosamente'
    })

  } catch (error) {
    console.error('Error deleting payment method:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al eliminar el método de pago' 
      },
      { status: 500 }
    )
  }
}

