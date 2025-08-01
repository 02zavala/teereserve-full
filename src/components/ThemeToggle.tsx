'use client'

import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/contexts/ThemeContext'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="w-9 h-9 rounded-full hover:bg-golf-green-100 dark:hover:bg-golf-green-800 transition-all duration-300"
      aria-label={theme === 'light' ? 'Activar modo nocturno' : 'Activar modo claro'}
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4 text-golf-green-600 dark:text-golf-green-400" />
      ) : (
        <Sun className="h-4 w-4 text-golf-gold-500" />
      )}
    </Button>
  )
}

