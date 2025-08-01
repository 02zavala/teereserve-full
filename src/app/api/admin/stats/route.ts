import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // For Vercel deployment, we'll use mock data initially
    // This avoids Prisma initialization issues during build
    const stats = {
      totalBookings: 156,
      totalUsers: 89,
      totalCourses: 10,
      totalRevenue: 425000,
      todayBookings: 12,
      pendingBookings: 8,
      averageRating: 4.8,
      activeUsers: 34,
      timestamp: new Date().toISOString(),
      mode: 'mock-data',
      status: 'healthy'
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Error fetching admin stats:', error)

    // Fallback stats
    return NextResponse.json({
      totalBookings: 0,
      totalUsers: 0,
      totalCourses: 0,
      totalRevenue: 0,
      todayBookings: 0,
      pendingBookings: 0,
      averageRating: 0,
      activeUsers: 0,
      error: 'Stats unavailable',
      timestamp: new Date().toISOString()
    }, { status: 200 }) // Return 200 instead of error to avoid build issues
  }
}
