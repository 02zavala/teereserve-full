import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST() {
  try {
    console.log('🌱 Starting database seed...')

    // Check if courses already exist
    const existingCourses = await prisma.golfCourse.count()
    if (existingCourses > 0) {
      return NextResponse.json({
        message: 'Database already seeded',
        coursesCount: existingCourses
      })
    }

    // Golf courses data
    const courses = [
      {
        name: "Cabo Real Golf Club",
        description: "Spectacular oceanfront golf course designed by Robert Trent Jones Jr. Stunning views of the Sea of Cortez with challenging desert landscape.",
        address: "Carretera Transpeninsular Km 19.5",
        city: "Los Cabos",
        state: "Baja California Sur",
        phone: "+52 624 173 9400",
        email: "info@caborealgolf.com",
        website: "https://caborealgolf.com",
        priceWeekday: 2800,
        priceWeekend: 3200,
        holes: 18,
        par: 71,
        length: 6945,
        latitude: 23.0545,
        longitude: -109.7164,
        image: "https://images.unsplash.com/photo-1535132011086-b8818f016104?q=80&w=1000",
        images: [
          "https://images.unsplash.com/photo-1535132011086-b8818f016104?q=80&w=1000",
          "https://images.unsplash.com/photo-1552919639-3b2b0c8e4e5a?q=80&w=1000"
        ],
        rating: 4.8,
        reviewCount: 245
      },
      {
        name: "Palmilla Golf Club",
        description: "Jack Nicklaus Signature Design featuring 27 holes of world-class golf with breathtaking ocean and mountain views.",
        address: "Carretera Transpeninsular Km 27.5",
        city: "San José del Cabo",
        state: "Baja California Sur",
        phone: "+52 624 146 7250",
        email: "golf@oneandonlypalmilla.com",
        website: "https://palmillagolf.com",
        priceWeekday: 3500,
        priceWeekend: 4000,
        holes: 27,
        par: 72,
        length: 7100,
        latitude: 23.0245,
        longitude: -109.6854,
        image: "https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?q=80&w=1000",
        images: [
          "https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?q=80&w=1000"
        ],
        rating: 4.9,
        reviewCount: 189
      },
      {
        name: "Quivira Golf Club",
        description: "Clifftop masterpiece by Jack Nicklaus with dramatic ocean views and world-renowned golf architecture.",
        address: "Copala s/n",
        city: "Cabo San Lucas",
        state: "Baja California Sur",
        phone: "+52 624 104 3400",
        email: "golf@quiviraloscabos.com",
        website: "https://quiviragolf.com",
        priceWeekday: 4200,
        priceWeekend: 4800,
        holes: 18,
        par: 72,
        length: 7085,
        latitude: 22.8885,
        longitude: -109.8943,
        image: "https://images.unsplash.com/photo-1535132011086-b8818f016104?q=80&w=1000",
        images: [
          "https://images.unsplash.com/photo-1535132011086-b8818f016104?q=80&w=1000"
        ],
        rating: 4.7,
        reviewCount: 312
      }
    ]

    let totalSlots = 0

    for (const courseData of courses) {
      console.log(`Creating course: ${courseData.name}`)

      const course = await prisma.golfCourse.create({
        data: courseData
      })

      // Create tee slots (6:30 AM to 5:30 PM every 15 minutes)
      const slots = []
      for (let hour = 6; hour < 18; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
          if (hour === 6 && minute < 30) continue
          if (hour === 17 && minute > 30) continue

          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
          slots.push({
            courseId: course.id,
            time: timeString,
            maxPlayers: 4,
            isActive: true
          })
        }
      }

      await prisma.teeSlot.createMany({
        data: slots
      })

      totalSlots += slots.length
      console.log(`✅ Created ${courseData.name} with ${slots.length} tee slots`)
    }

    // Create system settings
    const settings = [
      { key: "site_name", value: "TeeReserve Golf" },
      { key: "site_description", value: "La plataforma líder de reservas de golf en México" },
      { key: "booking_advance_days", value: 30 },
      { key: "cancellation_hours", value: 24 },
      { key: "whatsapp_enabled", value: true },
      { key: "stripe_enabled", value: true }
    ]

    for (const setting of settings) {
      await prisma.systemSettings.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: setting
      })
    }

    console.log('🎉 Seed completed successfully!')

    return NextResponse.json({
      message: 'Database seeded successfully',
      data: {
        coursesCreated: courses.length,
        slotsCreated: totalSlots,
        settingsCreated: settings.length
      }
    })

  } catch (error) {
    console.error('❌ Seed failed:', error)
    return NextResponse.json(
      {
        error: 'Seed failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
