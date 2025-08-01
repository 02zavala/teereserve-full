'use client'

import { Languages, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLanguage } from '@/contexts/LanguageContext'

export function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage()

  const languages = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ]

  const currentLanguage = languages.find(lang => lang.code === language)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-golf-green-600 dark:text-golf-green-400 hover:bg-golf-green-50 dark:hover:bg-golf-green-900/20 transition-all duration-300"
        >
          <Languages className="h-4 w-4 mr-1" />
          <span className="text-sm font-medium">{currentLanguage?.flag}</span>
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code as 'es' | 'en')}
            className={`cursor-pointer ${
              language === lang.code 
                ? 'bg-golf-green-50 dark:bg-golf-green-900/20 text-golf-green-700 dark:text-golf-green-300' 
                : ''
            }`}
          >
            <span className="mr-2">{lang.flag}</span>
            <span className="font-medium">{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

