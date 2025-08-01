import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/user/profile - Obtener perfil del usuario
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

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        role: {
          select: {
            name: true,
            description: true
          }
        }
      }
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

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role.name,
        roleDescription: user.role.description,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
      }
    })

  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener el perfil' 
      },
      { status: 500 }
    )
  }
}

// PUT /api/user/profile - Actualizar perfil del usuario
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
    const { name, phone } = body

    // Validaciones básicas
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'El nombre es requerido' 
        },
        { status: 400 }
      )
    }

    // Actualizar usuario
    const updatedUser = await prisma.user.update({
      where: {
        email: session.user.email
      },
      data: {
        name: name.trim(),
        phone: phone?.trim() || null,
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        role: {
          select: {
            name: true,
            description: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role.name,
        roleDescription: updatedUser.role.description,
        createdAt: updatedUser.createdAt.toISOString(),
        updatedAt: updatedUser.updatedAt.toISOString()
      },
      message: 'Perfil actualizado exitosamente'
    })

  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al actualizar el perfil' 
      },
      { status: 500 }
    )
  }
}

