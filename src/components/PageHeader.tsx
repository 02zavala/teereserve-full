'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface PageHeaderProps {
  showBackButton?: boolean
  backHref?: string
  backText?: string
  showLogo?: boolean
  logoPosition?: 'left' | 'center'
  children?: React.ReactNode
  className?: string
}

export function PageHeader({
  showBackButton = false,
  backHref = "/",
  backText = "Regresar al inicio",
  showLogo = true,
  logoPosition = 'left',
  children,
  className = ""
}: PageHeaderProps) {
  if (logoPosition === 'center') {
    return (
      <div className={`container mx-auto px-4 pt-8 ${className}`}>
        {/* Logo centrado */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center space-y-2">
            <div className="w-16 h-16">
              <Image
                src="/logo-final.png"
                alt="TeeReserve Golf"
                width={64}
                height={64}
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-green-700">
                TeeReserve
              </h1>
              <p className="text-lg text-green-600 font-semibold">
                Golf
              </p>
            </div>
          </Link>
        </div>
        {children}
      </div>
    )
  }

  return (
    <div className={`container mx-auto px-4 pt-8 ${className}`}>
      <div className="flex items-center gap-6 mb-6">
        {/* Logo a la izquierda */}
        {showLogo && (
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-12 h-12">
              <Image
                src="/logo-final.png"
                alt="TeeReserve Golf"
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-green-700">
                TeeReserve
              </h1>
              <p className="text-sm text-green-600 font-semibold">
                Golf
              </p>
            </div>
          </Link>
        )}
        
        {/* Botón de regresar */}
        {showBackButton && (
          <Link 
            href={backHref}
            className="inline-flex items-center text-green-700 hover:text-green-800 transition-colors text-xl font-semibold"
          >
            <ArrowLeft className="w-6 h-6 mr-2" />
            {backText}
          </Link>
        )}
      </div>
      {children}
    </div>
  )
}
