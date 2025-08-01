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
        { message: 'Discount code is required' },
        { status: 400 }
      )
    }

    const discountCode = await prisma.discountCode.findUnique({
      where: { code }
    })

    if (!discountCode) {
      return NextResponse.json(
        { message: 'Discount code not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ discountCode })

  } catch (error) {
    console.error('Error fetching discount code:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

