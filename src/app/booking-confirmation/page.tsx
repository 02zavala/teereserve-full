'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { BookingConfirmationContent } from './BookingConfirmationContent'

function BookingConfirmationWrapper() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('bookingId')
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (bookingId) {
      fetch(`/api/bookings?id=${bookingId}`)
        .then((res) => res.json())
        .then((data) => {
          setBooking(data)
          setLoading(false)
        })
    }
  }, [bookingId])

  if (loading) {
    return <div className="p-10 text-center">Cargando reserva...</div>
  }

  return <BookingConfirmationContent completedBooking={booking} />
}

export default function BookingConfirmationPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Cargando reserva...</div>}>
      <BookingConfirmationWrapper />
    </Suspense>
  )
}
