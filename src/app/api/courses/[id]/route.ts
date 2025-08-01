import { NextRequest, NextResponse } from 'next/server'

// Mock data for golf courses
const courses = [
  {
    id: "1",
    name: "Cabo Real Golf Club",
    description: "Spectacular oceanfront golf course designed by Robert Trent Jones Jr. Stunning views of the Sea of Cortez with challenging desert landscape.",
    address: "Carretera Transpeninsular Km 19.5",
    city: "Los Cabos",
    state: "Baja California Sur",
    phone: "+52 624 173 9400",
    email: "info@caborealgolf.com",
    website: "https://caborealgolf.com",
    priceWeekday: 140,
    priceWeekend: 175,
    holes: 18,
    par: 71,
    length: 6945,
    latitude: 23.0545,
    longitude: -109.7123,
    image: "/images/golf-courses/cabo-real-1.jpg",
    images: [
      "/images/golf-courses/cabo-real-1.jpg",
      "/images/golf-courses/cabo-real-2.jpg",
      "/images/golf-courses/cabo-real-3.jpg",
      "/images/golf-courses/cabo-real-4.jpg"
    ],
    rating: 4.8,
    reviewCount: 245,
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "2",
    name: "Palmilla Golf Club",
    description: "Jack Nicklaus Signature Design featuring 27 holes of world-class golf with breathtaking ocean and mountain views.",
    address: "Carretera Transpeninsular Km 27.5",
    city: "San José del Cabo",
    state: "Baja California Sur",
    phone: "+52 624 146 7250",
    email: "golf@palmillagolf.com",
    website: "https://palmillagolf.com",
    priceWeekday: 175,
    priceWeekend: 210,
    holes: 27,
    par: 72,
    length: 7100,
    latitude: 23.0234,
    longitude: -109.6789,
    image: "/images/golf-courses/palmilla-1.jpg",
    images: [
      "/images/golf-courses/palmilla-1.jpg",
      "/images/golf-courses/palmilla-2.jpg",
      "/images/golf-courses/palmilla-3.jpg",
      "/images/golf-courses/palmilla-4.jpg"
    ],
    rating: 4.9,
    reviewCount: 189,
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "3",
    name: "Quivira Golf Club",
    description: "Clifftop masterpiece by Jack Nicklaus with dramatic ocean views and world-renowned golf architecture.",
    address: "Camino del Club de Golf",
    city: "Cabo San Lucas",
    state: "Baja California Sur",
    phone: "+52 624 163 4653",
    email: "golf@quiviragolf.com",
    website: "https://quiviragolf.com",
    priceWeekday: 210,
    priceWeekend: 250,
    holes: 18,
    par: 72,
    length: 7085,
    latitude: 22.8905,
    longitude: -109.9167,
    image: "/images/golf-courses/quivira-1.jpg",
    images: [
      "/images/golf-courses/quivira-1.jpg",
      "/images/golf-courses/quivira-2.jpg",
      "/images/golf-courses/quivira-3.jpg",
      "/images/golf-courses/quivira-4.jpg"
    ],
    rating: 4.7,
    reviewCount: 312,
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  }
]

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const course = courses.find(c => c.id === id)
    
    if (!course) {
      return NextResponse.json(
        { error: 'Campo no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(course)
  } catch (error) {
    console.error('Error fetching course:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

