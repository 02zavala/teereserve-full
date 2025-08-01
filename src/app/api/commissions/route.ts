import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/commissions - Obtener comisiones
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const affiliateId = searchParams.get('affiliateId')
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: any = {}
    
    if (affiliateId) {
      where.affiliateId = affiliateId
    }
    
    if (status) {
      where.status = status
    }
    
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }

    const [commissions, total] = await Promise.all([
      prisma.commission.findMany({
        where,
        include: {
          affiliate: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          },
          booking: {
            include: {
              golfCourse: {
                select: {
                  name: true,
                  location: true
                }
              },
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.commission.count({ where })
    ])

    // Calcular estadísticas
    const stats = await prisma.commission.groupBy({
      by: ['status'],
      where,
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    })

    const totalAmount = stats.reduce((sum, stat) => sum + (stat._sum.amount || 0), 0)
    const paidAmount = stats.find(s => s.status === 'paid')?._sum.amount || 0
    const pendingAmount = stats.find(s => s.status === 'pending')?._sum.amount || 0

    return NextResponse.json({
      success: true,
      data: {
        commissions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        stats: {
          totalAmount,
          paidAmount,
          pendingAmount,
          totalCommissions: total,
          paidCommissions: stats.find(s => s.status === 'paid')?._count.id || 0,
          pendingCommissions: stats.find(s => s.status === 'pending')?._count.id || 0
        }
      }
    })

  } catch (error) {
    console.error('Error fetching commissions:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener las comisiones' 
      },
      { status: 500 }
    )
  }
}

// POST /api/commissions - Crear comisión (automático al confirmar reserva)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookingId, affiliateId, referralCode } = body

    // Verificar que la reserva existe
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        golfCourse: true
      }
    })

    if (!booking) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Reserva no encontrada' 
        },
        { status: 404 }
      )
    }

    let affiliate = null

    // Buscar afiliado por ID o código de referencia
    if (affiliateId) {
      affiliate = await prisma.affiliate.findUnique({
        where: { id: affiliateId }
      })
    } else if (referralCode) {
      affiliate = await prisma.affiliate.findUnique({
        where: { referralCode }
      })
    }

    if (!affiliate) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Afiliado no encontrado' 
        },
        { status: 404 }
      )
    }

    // Verificar que no existe ya una comisión para esta reserva
    const existingCommission = await prisma.commission.findUnique({
      where: { bookingId }
    })

    if (existingCommission) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Ya existe una comisión para esta reserva' 
        },
        { status: 400 }
      )
    }

    // Calcular monto de comisión
    const commissionAmount = booking.totalPrice * (affiliate.commissionRate / 100)

    // Crear comisión
    const commission = await prisma.commission.create({
      data: {
        affiliateId: affiliate.id,
        bookingId: booking.id,
        amount: commissionAmount,
        status: 'pending'
      },
      include: {
        affiliate: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        booking: {
          include: {
            golfCourse: {
              select: {
                name: true,
                location: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: commission,
      message: 'Comisión creada exitosamente'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating commission:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al crear la comisión' 
      },
      { status: 500 }
    )
  }
}

// PUT /api/commissions - Actualizar estado de comisión
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { commissionIds, status, paymentReference } = body

    if (!commissionIds || !Array.isArray(commissionIds) || commissionIds.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Se requiere al menos un ID de comisión' 
        },
        { status: 400 }
      )
    }

    if (!['pending', 'paid', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Estado inválido' 
        },
        { status: 400 }
      )
    }

    // Actualizar comisiones
    const updateData: any = {
      status,
      updatedAt: new Date()
    }

    if (status === 'paid' && paymentReference) {
      // En una implementación real, guardaríamos la referencia de pago
      // updateData.paymentReference = paymentReference
    }

    const updatedCommissions = await prisma.commission.updateMany({
      where: {
        id: {
          in: commissionIds
        }
      },
      data: updateData
    })

    // Obtener comisiones actualizadas para respuesta
    const commissions = await prisma.commission.findMany({
      where: {
        id: {
          in: commissionIds
        }
      },
      include: {
        affiliate: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        booking: {
          include: {
            golfCourse: {
              select: {
                name: true,
                location: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: commissions,
      message: `${updatedCommissions.count} comisiones actualizadas exitosamente`
    })

  } catch (error) {
    console.error('Error updating commissions:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al actualizar las comisiones' 
      },
      { status: 500 }
    )
  }
}

