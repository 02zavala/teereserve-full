import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, phone, role = 'Client' } = body

    // Validaciones básicas
    if (!name || !email || !password) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Nombre, email y contraseña son requeridos' 
        },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'La contraseña debe tener al menos 8 caracteres' 
        },
        { status: 400 }
      )
    }

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Ya existe una cuenta con este email' 
        },
        { status: 400 }
      )
    }

    // Obtener o crear el rol
    let userRole = await prisma.role.findUnique({
      where: { name: role }
    })

    if (!userRole) {
      // Crear roles por defecto si no existen
      const defaultRoles = [
        { name: 'Client', description: 'Cliente regular' },
        { name: 'GolfCourse', description: 'Propietario de campo de golf' },
        { name: 'Promoter', description: 'Promotor/Afiliado' },
        { name: 'SuperAdmin', description: 'Administrador del sistema' }
      ]

      // Crear todos los roles por defecto
      await prisma.role.createMany({
        data: defaultRoles,
        skipDuplicates: true
      })

      // Obtener el rol solicitado
      userRole = await prisma.role.findUnique({
        where: { name: role }
      })
    }

    if (!userRole) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Rol inválido' 
        },
        { status: 400 }
      )
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 12)

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        roleId: userRole.id
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: {
          select: {
            name: true,
            description: true
          }
        },
        createdAt: true
      }
    })

    // Si es un promotor, crear automáticamente el perfil de afiliado
    if (role === 'Promoter') {
      const referralCode = generateReferralCode(name)
      
      await prisma.affiliate.create({
        data: {
          userId: user.id,
          commissionRate: 10.0, // 10% por defecto
          referralCode
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: user,
      message: 'Usuario creado exitosamente'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    )
  }
}

// Función auxiliar para generar código de referencia
function generateReferralCode(name: string): string {
  const baseName = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 4)
  const randomSuffix = Math.random().toString(36).substr(2, 4).toUpperCase()
  return `${baseName}${randomSuffix}`
}

