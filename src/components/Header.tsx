'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ThemeToggle'
import AdvancedLanguageSelector, { CompactLanguageSelector } from '@/components/AdvancedLanguageSelector'
import { useLanguage } from '@/contexts/LanguageContext'

export function Header() {
  const { t } = useLanguage()

  return (
    <header className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-golf-beige-300 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-300">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
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
            <h1 className="text-xl font-bold text-golf-green-600 dark:text-golf-green-400 font-playfair transition-colors duration-300">
              TeeReserve
            </h1>
            <p className="text-sm text-golf-gold-600 dark:text-golf-gold-400 font-semibold font-dm-serif transition-colors duration-300">
              Golf
            </p>
          </div>
        </Link>

        <div className="flex items-center space-x-4">
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/courses" 
              className="text-golf-green-700 dark:text-golf-green-300 hover:text-golf-gold-600 dark:hover:text-golf-gold-400 transition-colors font-medium nav-text"
            >
              {t('header.courses')}
            </Link>
            <Link 
              href="/recommendations" 
              className="text-golf-green-700 dark:text-golf-green-300 hover:text-golf-gold-600 dark:hover:text-golf-gold-400 transition-colors font-medium nav-text flex items-center gap-1"
            >
              <span className="text-purple-600">✨</span>
              {t('header.recommendations')}
            </Link>
            <Link 
              href="/auth/signin" 
              className="text-golf-green-700 dark:text-golf-green-300 hover:text-golf-gold-600 dark:hover:text-golf-gold-400 transition-colors font-medium nav-text"
            >
              {t('header.signIn')}
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-golf-green-600 hover:bg-golf-green-700 dark:bg-golf-green-500 dark:hover:bg-golf-green-600 text-white font-semibold px-6 btn-premium transition-all duration-300">
                {t('header.signUp')}
              </Button>
            </Link>
          </nav>

          {/* Theme and Language Controls */}
          <div className="flex items-center space-x-2">
            {/* Selector avanzado para desktop */}
            <div className="hidden md:block">
              <AdvancedLanguageSelector />
            </div>
            {/* Selector compacto para móvil */}
            <div className="md:hidden">
              <CompactLanguageSelector />
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}

