import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params

    if (!code) {
      return NextResponse.json(
        { message: 'Affiliate code is required' },
        { status: 400 }
      )
    }

    const affiliate = await prisma.affiliate.findUnique({
      where: { referralCode: code },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!affiliate) {
      return NextResponse.json(
        { message: 'Affiliate code not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      affiliate: {
        id: affiliate.id,
        referralCode: affiliate.referralCode,
        commissionRate: affiliate.commissionRate,
        user: affiliate.user
      }
    })

  } catch (error) {
    console.error('Error fetching affiliate:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

