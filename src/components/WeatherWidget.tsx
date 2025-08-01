'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Sun, Cloud, CloudRain, CloudSnow, CloudDrizzle, 
  Wind, Droplets, Thermometer, Eye, Gauge
} from 'lucide-react'

interface WeatherData {
  temperature: number
  condition: string
  humidity: number
  windSpeed: number
  visibility: number
  pressure: number
  feelsLike: number
  uvIndex: number
  icon: string
  forecast: {
    time: string
    temp: number
    condition: string
    icon: string
  }[]
}

interface WeatherWidgetProps {
  latitude?: number
  longitude?: number
  location?: string
}

export default function WeatherWidget({ latitude, longitude, location = "Los Cabos, México" }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchWeather()
  }, [latitude, longitude])

  const fetchWeather = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Mock weather data for demo purposes
      // In production, you would call a real weather API like OpenWeatherMap
      const mockWeatherData: WeatherData = {
        temperature: 28,
        condition: 'Soleado',
        humidity: 65,
        windSpeed: 12,
        visibility: 10,
        pressure: 1013,
        feelsLike: 31,
        uvIndex: 8,
        icon: 'sunny',
        forecast: [
          { time: '12:00', temp: 28, condition: 'Soleado', icon: 'sunny' },
          { time: '15:00', temp: 30, condition: 'Soleado', icon: 'sunny' },
          { time: '18:00', temp: 27, condition: 'Parcialmente nublado', icon: 'partly-cloudy' },
          { time: '21:00', temp: 24, condition: 'Despejado', icon: 'clear-night' }
        ]
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setWeather(mockWeatherData)
    } catch (err) {
      setError('Error al cargar datos del clima')
      console.error('Weather fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getWeatherIcon = (condition: string, size: 'sm' | 'md' | 'lg' = 'md') => {
    const iconSize = {
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8'
    }[size]

    const iconClass = `${iconSize} text-yellow-500`

    switch (condition.toLowerCase()) {
      case 'sunny':
      case 'soleado':
      case 'despejado':
        return <Sun className={iconClass} />
      case 'partly-cloudy':
      case 'parcialmente nublado':
        return <Cloud className={iconClass} />
      case 'cloudy':
      case 'nublado':
        return <Cloud className={`${iconSize} text-gray-500`} />
      case 'rainy':
      case 'lluvia':
        return <CloudRain className={`${iconSize} text-blue-500`} />
      case 'drizzle':
      case 'llovizna':
        return <CloudDrizzle className={`${iconSize} text-blue-400`} />
      case 'snow':
      case 'nieve':
        return <CloudSnow className={`${iconSize} text-blue-200`} />
      default:
        return <Sun className={iconClass} />
    }
  }

  const getConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'soleado':
      case 'despejado':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'parcialmente nublado':
        return 'text-blue-600 dark:text-blue-400'
      case 'nublado':
        return 'text-gray-600 dark:text-gray-400'
      case 'lluvia':
      case 'llovizna':
        return 'text-blue-700 dark:text-blue-300'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 bg-gray-300 rounded w-24"></div>
              <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
            </div>
            <div className="h-8 bg-gray-300 rounded w-16 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-32"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !weather) {
    return (
      <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-800">
        <CardContent className="p-6">
          <div className="text-center">
            <Cloud className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {error || 'No se pudo cargar el clima'}
            </p>
            <button 
              onClick={fetchWeather}
              className="text-blue-600 hover:text-blue-800 text-sm mt-2 underline"
            >
              Reintentar
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800 shadow-lg">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
              Clima Actual
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {location}
            </p>
          </div>
          {getWeatherIcon(weather.icon, 'lg')}
        </div>

        {/* Main Temperature */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-900 dark:text-white">
              {weather.temperature}°
            </span>
            <span className="text-lg text-gray-600 dark:text-gray-400">C</span>
          </div>
          <p className={`text-sm font-medium ${getConditionColor(weather.condition)}`}>
            {weather.condition}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Sensación térmica {weather.feelsLike}°C
          </p>
        </div>

        {/* Weather Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-blue-500" />
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Humedad</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {weather.humidity}%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Viento</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {weather.windSpeed} km/h
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-green-500" />
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Visibilidad</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {weather.visibility} km
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-purple-500" />
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Presión</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {weather.pressure} hPa
              </p>
            </div>
          </div>
        </div>

        {/* UV Index */}
        <div className="mb-4 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Índice UV
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {weather.uvIndex}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                weather.uvIndex <= 2 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                weather.uvIndex <= 5 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                weather.uvIndex <= 7 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
              }`}>
                {weather.uvIndex <= 2 ? 'Bajo' :
                 weather.uvIndex <= 5 ? 'Moderado' :
                 weather.uvIndex <= 7 ? 'Alto' : 'Muy Alto'}
              </span>
            </div>
          </div>
        </div>

        {/* Hourly Forecast */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Pronóstico por horas
          </h4>
          <div className="grid grid-cols-4 gap-2">
            {weather.forecast.map((hour, index) => (
              <div key={index} className="text-center p-2 bg-white/30 dark:bg-gray-800/30 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  {hour.time}
                </p>
                <div className="flex justify-center mb-1">
                  {getWeatherIcon(hour.icon, 'sm')}
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {hour.temp}°
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Golf Conditions */}
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-green-800 dark:text-green-300">
              Condiciones para Golf
            </span>
          </div>
          <p className="text-xs text-green-700 dark:text-green-400">
            {weather.temperature >= 20 && weather.temperature <= 30 && weather.windSpeed < 20 && !weather.condition.toLowerCase().includes('lluvia') 
              ? 'Excelentes condiciones para jugar golf' 
              : weather.condition.toLowerCase().includes('lluvia')
              ? 'Condiciones no recomendadas debido a la lluvia'
              : weather.windSpeed >= 20
              ? 'Viento fuerte, condiciones desafiantes'
              : 'Condiciones aceptables para jugar golf'
            }
          </p>
        </div>

        {/* Last Updated */}
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Actualizado hace 5 minutos
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

