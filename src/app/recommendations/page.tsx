'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AIRecommendations from '@/components/AIRecommendations';
import { Sparkles, Settings, User, Brain, Target, TrendingUp, ArrowLeft } from 'lucide-react';

export default function RecommendationsPage() {
  const [showPreferences, setShowPreferences] = useState(false);
  const [userPreferences, setUserPreferences] = useState({
    skill_level: 'intermediate',
    preferred_time: 'morning',
    budget_range: 'mid-range',
    location_preference: 'Los Cabos',
    course_features: ['Vista al mar', 'Driving range'],
    playing_frequency: 'monthly',
    group_size: 2,
  });

  const handlePreferenceChange = (key: string, value: any) => {
    setUserPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Botón de regreso al inicio */}
      <div className="container mx-auto px-4 pt-6">
        <Link 
          href="/" 
          className="inline-flex items-center text-purple-700 hover:text-purple-800 transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Regresar al inicio
        </Link>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-white/20 rounded-full">
                <Brain className="h-8 w-8" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">
              Recomendaciones Inteligentes
            </h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Descubre los campos perfectos para ti con nuestro sistema de IA avanzado
            </p>
            <div className="flex justify-center gap-4 mt-6">
              <Badge className="bg-white/20 text-white border-white/30">
                <Sparkles className="h-3 w-3 mr-1" />
                Powered by AI
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30">
                <Target className="h-3 w-3 mr-1" />
                94% Precisión
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30">
                <TrendingUp className="h-3 w-3 mr-1" />
                Mejora Continua
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Configuración de preferencias */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Personaliza tus Preferencias
              </CardTitle>
              <Button
                variant="outline"
                onClick={() => setShowPreferences(!showPreferences)}
              >
                {showPreferences ? 'Ocultar' : 'Configurar'}
              </Button>
            </div>
          </CardHeader>
          
          {showPreferences && (
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Nivel de habilidad */}
                <div>
                  <label className="block text-sm font-medium mb-2">Nivel de Habilidad</label>
                  <select
                    value={userPreferences.skill_level}
                    onChange={(e) => handlePreferenceChange('skill_level', e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="beginner">Principiante</option>
                    <option value="intermediate">Intermedio</option>
                    <option value="advanced">Avanzado</option>
                    <option value="professional">Profesional</option>
                  </select>
                </div>

                {/* Horario preferido */}
                <div>
                  <label className="block text-sm font-medium mb-2">Horario Preferido</label>
                  <select
                    value={userPreferences.preferred_time}
                    onChange={(e) => handlePreferenceChange('preferred_time', e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="morning">Mañana (7AM - 11AM)</option>
                    <option value="afternoon">Tarde (12PM - 4PM)</option>
                    <option value="evening">Noche (5PM - 8PM)</option>
                  </select>
                </div>

                {/* Presupuesto */}
                <div>
                  <label className="block text-sm font-medium mb-2">Rango de Presupuesto</label>
                  <select
                    value={userPreferences.budget_range}
                    onChange={(e) => handlePreferenceChange('budget_range', e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="budget">Económico ($50-$100)</option>
                    <option value="mid-range">Medio ($100-$200)</option>
                    <option value="premium">Premium ($200-$300)</option>
                    <option value="luxury">Lujo ($300+)</option>
                  </select>
                </div>

                {/* Ubicación */}
                <div>
                  <label className="block text-sm font-medium mb-2">Ubicación Preferida</label>
                  <input
                    type="text"
                    value={userPreferences.location_preference}
                    onChange={(e) => handlePreferenceChange('location_preference', e.target.value)}
                    className="w-full p-2 border rounded-lg"
                    placeholder="Ej: Los Cabos, Cancún..."
                  />
                </div>

                {/* Frecuencia */}
                <div>
                  <label className="block text-sm font-medium mb-2">Frecuencia de Juego</label>
                  <select
                    value={userPreferences.playing_frequency}
                    onChange={(e) => handlePreferenceChange('playing_frequency', e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensual</option>
                    <option value="occasionally">Ocasional</option>
                  </select>
                </div>

                {/* Tamaño del grupo */}
                <div>
                  <label className="block text-sm font-medium mb-2">Tamaño del Grupo</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={userPreferences.group_size}
                    onChange={(e) => handlePreferenceChange('group_size', parseInt(e.target.value))}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>

              {/* Características deseadas */}
              <div>
                <label className="block text-sm font-medium mb-2">Características Deseadas</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    'Vista al mar', 'Driving range', 'Pro shop', 'Restaurante',
                    'Spa', 'Caddie service', 'Golf academy', 'Putting green',
                    'Cart included', 'Links style', 'Desert course', 'Mountain views'
                  ].map((feature) => (
                    <label key={feature} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={userPreferences.course_features.includes(feature)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handlePreferenceChange('course_features', [...userPreferences.course_features, feature]);
                          } else {
                            handlePreferenceChange('course_features', userPreferences.course_features.filter(f => f !== feature));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{feature}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Componente de recomendaciones */}
        <AIRecommendations 
          userId="demo-user"
          userPreferences={userPreferences}
        />

        {/* Información adicional */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              Cómo Funciona Nuestra IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Análisis de Perfil</h3>
                <p className="text-sm text-gray-600">
                  Analizamos tus preferencias, historial de juego y patrones de comportamiento
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Brain className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Procesamiento IA</h3>
                <p className="text-sm text-gray-600">
                  Nuestros algoritmos procesan miles de datos para encontrar matches perfectos
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Recomendaciones Precisas</h3>
                <p className="text-sm text-gray-600">
                  Recibe sugerencias personalizadas con 94% de precisión y mejora continua
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

