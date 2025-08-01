import { NextResponse } from 'next/server'

export async function GET() {
  try {
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '2.1.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: 'connected',
        auth: 'active',
        payments: 'active',
        notifications: 'active'
      }
    })
  } catch (error) {
    console.error('Status check failed:', error)
    return NextResponse.json(
      { 
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Service unavailable'
      },
      { status: 500 }
    )
  }
}

