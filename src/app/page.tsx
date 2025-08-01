import { Metadata, Viewport } from 'next'
import { HomePage } from '@/components/HomePage'

export const metadata: Metadata = {
  title: 'TeeReserve Golf - Reserva tu Tee Time Perfecto',
  description: 'Descubre y reserva en los mejores campos de golf de Los Cabos. Encuentra tu tee time perfecto con TeeReserve Golf.',
  openGraph: {
    title: 'TeeReserve Golf - Reserva tu Tee Time Perfecto',
    description: 'Descubre y reserva en los mejores campos de golf de Los Cabos.',
    images: ['/logo-final.png'],
  },
}

export const viewport: Viewport = {
  themeColor: '#16a34a',
  width: 'device-width',
  initialScale: 1,
}

export default function Page() {
  return <HomePage />
}

