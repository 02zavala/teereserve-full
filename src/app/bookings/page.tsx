"use client"

import React, { Suspense } from 'react'
import BookingsPageClient from './BookingsPageClient'

function BookingsPageFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
    </div>
  )
}

export default function BookingsPage() {
  return (
    <Suspense fallback={<BookingsPageFallback />}>
      <BookingsPageClient />
    </Suspense>
  )
}
