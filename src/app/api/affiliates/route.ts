import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/affiliates - Obtener afiliados
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')

    const where: any = {}
    
    if (search) {
      where.OR = [
        {
          user: {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          user: {
            email: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          referralCode: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ]
    }

    const [affiliates, total] = await Promise.all([
      prisma.affiliate.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              createdAt: true
            }
          },
          commissions: {
            select: {
              id: true,
              amount: true,
              status: true,
              createdAt: true
            }
          },
          _count: {
            select: {
              commissions: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.affiliate.count({ where })
    ])

    // Calcular estadísticas para cada afiliado
    const affiliatesWithStats = affiliates.map(affiliate => {
      const totalCommissions = affiliate.commissions.reduce((sum, c) => sum + c.amount, 0)
      const paidCommissions = affiliate.commissions
        .filter(c => c.status === 'paid')
        .reduce((sum, c) => sum + c.amount, 0)
      const pendingCommissions = affiliate.commissions
        .filter(c => c.status === 'pending')
        .reduce((sum, c) => sum + c.amount, 0)

      return {
        ...affiliate,
        stats: {
          totalCommissions,
          paidCommissions,
          pendingCommissions,
          totalBookings: affiliate._count.commissions,
          conversionRate: 0 // Se calcularía con más datos de tráfico
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        affiliates: affiliatesWithStats,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('Error fetching affiliates:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener los afiliados' 
      },
      { status: 500 }
    )
  }
}

// POST /api/affiliates - Crear nuevo afiliado
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, commissionRate, customReferralCode } = body

    if (!userId || !commissionRate) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'userId y commissionRate son requeridos' 
        },
        { status: 400 }
      )
    }

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
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

    // Verificar que el usuario no es ya afiliado
    const existingAffiliate = await prisma.affiliate.findUnique({
      where: { userId }
    })

    if (existingAffiliate) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'El usuario ya es afiliado' 
        },
        { status: 400 }
      )
    }

    // Generar código de referencia único
    let referralCode = customReferralCode
    
    if (!referralCode) {
      // Generar código basado en el nombre del usuario
      const baseName = user.name?.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || 'USER'
      referralCode = `${baseName}${Math.random().toString(36).substr(2, 4).toUpperCase()}`
    }

    // Verificar que el código de referencia es único
    let counter = 1
    let finalReferralCode = referralCode
    
    while (await prisma.affiliate.findUnique({ where: { referralCode: finalReferralCode } })) {
      finalReferralCode = `${referralCode}${counter}`
      counter++
    }

    // Crear afiliado
    const affiliate = await prisma.affiliate.create({
      data: {
        userId,
        commissionRate: parseFloat(commissionRate),
        referralCode: finalReferralCode
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: affiliate,
      message: 'Afiliado creado exitosamente'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating affiliate:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al crear el afiliado' 
      },
      { status: 500 }
    )
  }
}

// PUT /api/affiliates - Actualizar afiliado
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { affiliateId, commissionRate, referralCode } = body

    if (!affiliateId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'affiliateId es requerido' 
        },
        { status: 400 }
      )
    }

    // Verificar que el afiliado existe
    const existingAffiliate = await prisma.affiliate.findUnique({
      where: { id: affiliateId }
    })

    if (!existingAffiliate) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Afiliado no encontrado' 
        },
        { status: 404 }
      )
    }

    const updateData: any = {}

    if (commissionRate !== undefined) {
      updateData.commissionRate = parseFloat(commissionRate)
    }

    if (referralCode && referralCode !== existingAffiliate.referralCode) {
      // Verificar que el nuevo código es único
      const codeExists = await prisma.affiliate.findUnique({
        where: { referralCode }
      })

      if (codeExists) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'El código de referencia ya está en uso' 
          },
          { status: 400 }
        )
      }

      updateData.referralCode = referralCode
    }

    // Actualizar afiliado
    const updatedAffiliate = await prisma.affiliate.update({
      where: { id: affiliateId },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedAffiliate,
      message: 'Afiliado actualizado exitosamente'
    })

  } catch (error) {
    console.error('Error updating affiliate:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al actualizar el afiliado' 
      },
      { status: 500 }
    )
  }
}

// DELETE /api/affiliates - Desactivar afiliado
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const affiliateId = searchParams.get('affiliateId')

    if (!affiliateId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'affiliateId es requerido' 
        },
        { status: 400 }
      )
    }

    // Verificar que el afiliado existe
    const existingAffiliate = await prisma.affiliate.findUnique({
      where: { id: affiliateId },
      include: {
        commissions: {
          where: {
            status: 'pending'
          }
        }
      }
    })

    if (!existingAffiliate) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Afiliado no encontrado' 
        },
        { status: 404 }
      )
    }

    // Verificar que no tiene comisiones pendientes
    if (existingAffiliate.commissions.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No se puede desactivar un afiliado con comisiones pendientes' 
        },
        { status: 400 }
      )
    }

    // En lugar de eliminar, desactivamos el código de referencia
    const deactivatedAffiliate = await prisma.affiliate.update({
      where: { id: affiliateId },
      data: {
        referralCode: `DEACTIVATED_${existingAffiliate.referralCode}_${Date.now()}`,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Afiliado desactivado exitosamente',
      data: deactivatedAffiliate
    })

  } catch (error) {
    console.error('Error deactivating affiliate:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al desactivar el afiliado' 
      },
      { status: 500 }
    )
  }
}

