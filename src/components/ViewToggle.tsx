"use client"

import { Grid3X3, List, Map } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ViewToggleProps {
  currentView: 'grid' | 'list' | 'map'
  onViewChange: (view: 'grid' | 'list' | 'map') => void
  className?: string
}

export default function ViewToggle({ currentView, onViewChange, className = '' }: ViewToggleProps) {
  return (
    <div className={`flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 ${className}`}>
      <Button
        variant={currentView === 'grid' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('grid')}
        className={`px-3 py-2 ${
          currentView === 'grid' 
            ? 'bg-green-600 text-white hover:bg-green-700' 
            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
        }`}
      >
        <Grid3X3 className="w-4 h-4 mr-1" />
        Grid
      </Button>
      
      <Button
        variant={currentView === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('list')}
        className={`px-3 py-2 ${
          currentView === 'list' 
            ? 'bg-green-600 text-white hover:bg-green-700' 
            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
        }`}
      >
        <List className="w-4 h-4 mr-1" />
        Lista
      </Button>
      
      <Button
        variant={currentView === 'map' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('map')}
        className={`px-3 py-2 ${
          currentView === 'map' 
            ? 'bg-green-600 text-white hover:bg-green-700' 
            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
        }`}
      >
        <Map className="w-4 h-4 mr-1" />
        Mapa
      </Button>
    </div>
  )
}

