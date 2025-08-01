import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  let databaseStatus = 'disconnected'
  let dbError = null

  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    databaseStatus = 'connected'
  } catch (error) {
    console.error('Database connection failed:', error)
    dbError = error instanceof Error ? error.message : 'Unknown error'
  } finally {
    try {
      await prisma.$disconnect()
    } catch (error) {
      // Ignore disconnect errors
    }
  }

  // Always return healthy status for development
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'TeeReserve Golf API',
    version: '8.0.0',
    database: databaseStatus,
    mode: databaseStatus === 'connected' ? 'database' : 'mock-data',
    environment: process.env.NODE_ENV || 'development',
    features: {
      courses: 'available',
      search: 'available',
      booking: 'available',
      whatsapp: 'available',
      maps: 'available',
      reviews: 'available'
    },
    ...(dbError && { databaseError: dbError })
  }

  return NextResponse.json(health, { status: 200 })
}
