"use client"

import { ArrowUpDown, Star, DollarSign, MapPin, TrendingUp } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface SortOptionsProps {
  currentSort: string
  onSortChange: (sort: string) => void
  className?: string
}

export default function SortOptions({ currentSort, onSortChange, className = '' }: SortOptionsProps) {
  const sortOptions = [
    { value: 'relevance', label: 'Más relevantes', icon: <TrendingUp className="w-4 h-4" /> },
    { value: 'rating-desc', label: 'Mejor calificados', icon: <Star className="w-4 h-4" /> },
    { value: 'price-asc', label: 'Precio: menor a mayor', icon: <DollarSign className="w-4 h-4" /> },
    { value: 'price-desc', label: 'Precio: mayor a menor', icon: <DollarSign className="w-4 h-4" /> },
    { value: 'name-asc', label: 'Nombre A-Z', icon: <ArrowUpDown className="w-4 h-4" /> },
    { value: 'distance', label: 'Más cercanos', icon: <MapPin className="w-4 h-4" /> }
  ]

  const currentOption = sortOptions.find(option => option.value === currentSort)

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm text-gray-600 whitespace-nowrap">Ordenar por:</span>
      <Select value={currentSort} onValueChange={onSortChange}>
        <SelectTrigger className="w-48 border-green-300 focus:border-green-500">
          <div className="flex items-center gap-2">
            {currentOption?.icon}
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                {option.icon}
                {option.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

