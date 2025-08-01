'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, MapPin, Clock, DollarSign, Star, TrendingUp, Brain, Target } from 'lucide-react';
import { AIRecommendationEngine, RecommendationResult, UserPreferences } from '@/lib/ai-recommendations';

interface AIRecommendationsProps {
  userId?: string;
  userPreferences?: UserPreferences;
  className?: string;
}

export default function AIRecommendations({ userId, userPreferences, className }: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<any>(null);

  // Datos mock de campos para demostración
  const mockCourses = [
    {
      id: 1,
      name: 'Cabo Real Golf Club',
      location: 'Los Cabos, BCS',
      price: 140,
      rating: 4.8,
      difficulty: 'Intermedio',
      features: ['Vista al mar', 'Driving range', 'Pro shop', 'Restaurante'],
      description: 'Campo espectacular frente al mar diseñado por Robert Trent Jones Jr.',
      image: '/images/cabo-real.jpg'
    },
    {
      id: 4,
      name: 'Cabo del Sol Golf Club',
      location: 'Los Cabos, BCS',
      price: 165,
      rating: 4.9,
      difficulty: 'Avanzado',
      features: ['Vista al mar', 'Diseño Jack Nicklaus', 'Spa', 'Caddie service'],
      description: 'Uno de los campos más prestigiosos de México con vistas espectaculares.',
      image: '/images/cabo-del-sol.jpg'
    },
    {
      id: 5,
      name: 'Solmar Golf Links',
      location: 'Cabo San Lucas, BCS',
      price: 155,
      rating: 4.7,
      difficulty: 'Intermedio-Avanzado',
      features: ['Links style', 'Vista al Pacífico', 'Putting green', 'Golf academy'],
      description: 'Campo estilo links con desafíos únicos y vistas al Océano Pacífico.',
      image: '/images/solmar.jpg'
    }
  ];

  const defaultPreferences: UserPreferences = {
    skill_level: 'intermediate',
    preferred_time: 'morning',
    budget_range: 'mid-range',
    location_preference: 'Los Cabos',
    course_features: ['Vista al mar', 'Driving range'],
    playing_frequency: 'monthly',
    group_size: 2,
  };

  useEffect(() => {
    generateRecommendations();
  }, [userPreferences]);

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      const aiEngine = AIRecommendationEngine.getInstance();
      const prefs = userPreferences || defaultPreferences;
      
      // Simular historial de usuario
      const mockHistory = userId ? [
        { course_name: 'Cabo Real Golf Club', date: '2024-06-15', rating: 5 },
        { course_name: 'Solmar Golf Links', date: '2024-05-20', rating: 4 }
      ] : undefined;

      const results = await aiEngine.generateRecommendations(prefs, mockCourses, mockHistory);
      setRecommendations(results);

      // Generar insights de negocio
      const businessInsights = await aiEngine.generateBusinessInsights([
        { course_name: 'Cabo Real', date: '2024-07-01', price: 140, rating: 5, user_type: 'premium' },
        { course_name: 'Cabo del Sol', date: '2024-07-02', price: 165, rating: 4, user_type: 'regular' }
      ]);
      setInsights(businessInsights);

    } catch (error) {
      console.error('Error generating recommendations:', error);
      // Fallback a recomendaciones estáticas
      setRecommendations([
        {
          course: mockCourses[0],
          score: 95,
          reasons: ['Excelente para tu nivel', 'Dentro de tu presupuesto', 'Ubicación conveniente'],
          best_time: '8:00 AM - 10:00 AM',
          estimated_price: 140
        },
        {
          course: mockCourses[1],
          score: 88,
          reasons: ['Campo premium', 'Vistas espectaculares', 'Desafío perfecto'],
          best_time: '7:00 AM - 9:00 AM',
          estimated_price: 165
        },
        {
          course: mockCourses[2],
          score: 82,
          reasons: ['Estilo único', 'Buena relación calidad-precio', 'Academia de golf'],
          best_time: '9:00 AM - 11:00 AM',
          estimated_price: 155
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excelente Match';
    if (score >= 80) return 'Muy Bueno';
    if (score >= 70) return 'Bueno';
    return 'Aceptable';
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Generando Recomendaciones IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-3 text-gray-600">Analizando tus preferencias...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header con insights */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Recomendaciones Personalizadas con IA
          </CardTitle>
          <p className="text-sm text-gray-600">
            Basadas en tus preferencias, historial y patrones de juego
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Precisión: 94%</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Mejora continua</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">IA Avanzada</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recomendaciones principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {recommendations.map((rec, index) => (
          <Card key={rec.course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <div className="h-48 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                <div className="text-white text-center">
                  <h3 className="text-lg font-bold">{rec.course.name}</h3>
                  <p className="text-sm opacity-90">{rec.course.location}</p>
                </div>
              </div>
              
              {/* Badge de ranking */}
              <div className="absolute top-3 left-3">
                <Badge variant="secondary" className="bg-white/90 text-gray-800">
                  #{index + 1} Recomendado
                </Badge>
              </div>

              {/* Score de compatibilidad */}
              <div className="absolute top-3 right-3">
                <Badge className={`${getScoreColor(rec.score)} border-0`}>
                  {rec.score}% {getScoreLabel(rec.score)}
                </Badge>
              </div>
            </div>

            <CardContent className="p-4">
              {/* Rating y precio */}
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{rec.course.rating}</span>
                </div>
                <div className="flex items-center gap-1 text-green-600 font-bold">
                  <DollarSign className="h-4 w-4" />
                  {rec.estimated_price}
                </div>
              </div>

              {/* Razones de recomendación */}
              <div className="space-y-2 mb-4">
                <h4 className="font-medium text-sm text-gray-700">¿Por qué te recomendamos este campo?</h4>
                <ul className="space-y-1">
                  {rec.reasons.map((reason, idx) => (
                    <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                      <span className="text-green-500 mt-0.5">•</span>
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mejor horario */}
              <div className="flex items-center gap-2 mb-4 p-2 bg-blue-50 rounded-lg">
                <Clock className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-xs font-medium text-blue-800">Mejor horario para ti</p>
                  <p className="text-xs text-blue-600">{rec.best_time}</p>
                </div>
              </div>

              {/* Características */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {rec.course.features.slice(0, 3).map((feature, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {rec.course.features.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{rec.course.features.length - 3} más
                    </Badge>
                  )}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-2">
                <Button size="sm" className="flex-1">
                  Reservar Ahora
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  Ver Detalles
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Insights adicionales */}
      {insights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Insights Personalizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Tendencias para ti</h4>
                <ul className="space-y-1">
                  {insights.trends?.map((trend: string, idx: number) => (
                    <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-blue-500">→</span>
                      {trend}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Recomendaciones</h4>
                <ul className="space-y-1">
                  {insights.recommendations?.map((rec: string, idx: number) => (
                    <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botón para regenerar */}
      <div className="text-center">
        <Button 
          onClick={generateRecommendations} 
          variant="outline" 
          className="gap-2"
          disabled={loading}
        >
          <Sparkles className="h-4 w-4" />
          Generar Nuevas Recomendaciones
        </Button>
      </div>
    </div>
  );
}

