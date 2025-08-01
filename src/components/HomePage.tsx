'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { useLanguage } from '@/contexts/LanguageContext'

export function HomePage() {
  const { t, formatPrice } = useLanguage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        {/* Degradado verde */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-green-700 to-green-800"></div>
        
        {/* Overlay para mejorar legibilidad */}
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="relative z-10 container mx-auto text-center">
          {/* Logo Central de TeeReserve */}
          <div className="mb-12">
            <div className="relative mx-auto w-48 h-48 md:w-56 md:h-56">
              {/* Logo oficial de TeeReserve */}
              <div className="relative z-10 h-full flex items-center justify-center">
                <Image
                  src="/logo-final.png"
                  alt="TeeReserve Golf Logo"
                  width={200}
                  height={200}
                  className="w-full h-full object-contain drop-shadow-2xl"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Título Principal - LETRAS GRANDES */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 drop-shadow-xl leading-tight">
            Encuentra Tu Tee Time Perfecto
          </h1>

          {/* Subtítulo - TEXTO GRANDE */}
          <p className="text-xl md:text-2xl lg:text-3xl text-white/95 mb-6 max-w-4xl mx-auto leading-relaxed font-medium drop-shadow-md">
            Conéctate con los campos de golf más icónicos de México y disfruta el golf como debe ser:
          </p>
          <p className="text-lg md:text-xl lg:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed font-medium drop-shadow-md">
            con elegancia, exclusividad y sin complicaciones
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/courses">
              <Button size="lg" className="bg-yellow-600 hover:bg-yellow-700 text-white px-12 py-4 text-xl font-bold shadow-2xl border-2 border-yellow-500/30 transition-all duration-300 hover:scale-105">
                🏌️ Explorar Campos
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="lg" className="bg-yellow-600 hover:bg-yellow-700 text-white px-12 py-4 text-xl font-bold shadow-2xl border-2 border-yellow-500/30 transition-all duration-300 hover:scale-105">
                👤 Registrarse
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Campos Destacados */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-green-600 mb-6">
              Campos de Golf Premium
            </h2>
            <p className="text-xl text-green-700 max-w-3xl mx-auto">
              Descubre los mejores campos de golf de México. Reserva tu tee time perfecto en destinos exclusivos.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Campos destacados con imágenes */}
            {[
              {
                id: "cabo-del-sol-desert",
                slug: "cabo-del-sol-desert-course",
                name: "Cabo del Sol Golf Club",
                image: "/images/golf-courses/cabo-del-sol-1.jpg",
                price: 165,
                rating: 4.9,
                holes: 18,
                location: "Los Cabos, BCS"
              },
              {
                id: "solmar-golf-links",
                slug: "solmar-golf-links",
                name: "Solmar Golf Links",
                image: "/images/golf-courses/solmar-1.jpg",
                price: 155,
                rating: 4.7,
                holes: 18,
                location: "Cabo San Lucas, BCS"
              },
              {
                id: "cabo-real-golf-club",
                slug: "cabo-real-golf-club",
                name: "Cabo Real Golf Club",
                image: "/images/golf-courses/cabo-real-1.jpg",
                price: 140,
                rating: 4.8,
                holes: 18,
                location: "Los Cabos, BCS"
              }
            ].map((course) => (
              <Card key={course.id} className="overflow-hidden hover:shadow-2xl transition-all duration-300 border border-golf-beige-300 dark:border-gray-700 bg-white dark:bg-gray-800 group">
                <div className="relative h-64">
                  <Image
                    src={course.image}
                    alt={course.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-4 right-4 bg-golf-gold-600 text-white px-3 py-1 rounded-full shadow-lg">
                    <span className="text-sm font-bold">⭐ {course.rating}</span>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-golf-green-600 dark:text-golf-green-400 mb-2 font-playfair">
                    {course.name}
                  </h3>
                  <p className="text-golf-green-700 dark:text-golf-green-300 mb-4">
                    📍 {course.location} • {course.holes} {t('courses.holes')}
                  </p>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-golf-green-600 dark:text-golf-green-400">{t('home.from')}</p>
                      <p className="text-2xl font-bold text-golf-gold-600 dark:text-golf-gold-400">
                        {formatPrice(course.price)}
                      </p>
                      <p className="text-xs text-golf-green-600 dark:text-golf-green-400">{t('home.perPerson')}</p>
                    </div>
                      <Link href={`/courses/${course.slug}`}>
                      <Button className="bg-golf-green-600 hover:bg-golf-green-700 dark:bg-golf-green-500 dark:hover:bg-golf-green-600 text-white font-semibold px-6 btn-premium">
                        {t('courses.viewDetails')}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ¿Por qué elegir TeeReserve? */}
      <section className="py-20 px-4 bg-golf-beige-50 dark:bg-gray-800 transition-colors duration-300">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-golf-green-600 dark:text-golf-green-400 mb-6 font-playfair">
              ¿Por qué elegir TeeReserve?
            </h2>
            <p className="text-xl text-golf-green-700 dark:text-golf-green-300 max-w-3xl mx-auto font-montserrat">
              La experiencia de golf premium que siempre has buscado
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Reservas Instantáneas */}
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-6 bg-golf-gold-100 dark:bg-golf-gold-900 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <div className="text-4xl">⚡</div>
              </div>
              <h3 className="text-xl font-bold text-golf-green-600 dark:text-golf-green-400 mb-4 font-playfair">
                Reservas Instantáneas
              </h3>
              <p className="text-golf-green-700 dark:text-golf-green-300 font-montserrat">
                Confirma tu tee time en tiempo real sin esperas
              </p>
            </div>

            {/* Pagos Seguros */}
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-6 bg-golf-gold-100 dark:bg-golf-gold-900 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <div className="text-4xl">💳</div>
              </div>
              <h3 className="text-xl font-bold text-golf-green-600 dark:text-golf-green-400 mb-4 font-playfair">
                Pagos Seguros
              </h3>
              <p className="text-golf-green-700 dark:text-golf-green-300 font-montserrat">
                Paga de forma segura con Stripe y todas las tarjetas
              </p>
            </div>

            {/* WhatsApp Notifications */}
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-6 bg-golf-gold-100 dark:bg-golf-gold-900 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <div className="text-4xl">📱</div>
              </div>
              <h3 className="text-xl font-bold text-golf-green-600 dark:text-golf-green-400 mb-4 font-playfair">
                WhatsApp Notifications
              </h3>
              <p className="text-golf-green-700 dark:text-golf-green-300 font-montserrat">
                Recibe confirmaciones y recordatorios por WhatsApp
              </p>
            </div>

            {/* Gestión Completa */}
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-6 bg-golf-gold-100 dark:bg-golf-gold-900 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <div className="text-4xl">📊</div>
              </div>
              <h3 className="text-xl font-bold text-golf-green-600 dark:text-golf-green-400 mb-4 font-playfair">
                Gestión Completa
              </h3>
              <p className="text-golf-green-700 dark:text-golf-green-300 font-montserrat">
                Dashboard completo para administrar todas tus reservas
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Estadísticas */}
      <section className="py-20 px-4 bg-golf-green-700 dark:bg-golf-green-800 text-white transition-colors duration-300">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {/* Campos de Golf */}
            <div className="group">
              <div className="text-5xl md:text-6xl font-bold text-golf-gold-400 mb-2 group-hover:scale-110 transition-transform duration-300">
                50+
              </div>
              <p className="text-xl font-semibold text-white/90 font-montserrat">
                Campos de Golf
              </p>
            </div>

            {/* Reservas Completadas */}
            <div className="group">
              <div className="text-5xl md:text-6xl font-bold text-golf-gold-400 mb-2 group-hover:scale-110 transition-transform duration-300">
                10,000+
              </div>
              <p className="text-xl font-semibold text-white/90 font-montserrat">
                Reservas Completadas
              </p>
            </div>

            {/* Golfistas Activos */}
            <div className="group">
              <div className="text-5xl md:text-6xl font-bold text-golf-gold-400 mb-2 group-hover:scale-110 transition-transform duration-300">
                5,000+
              </div>
              <p className="text-xl font-semibold text-white/90 font-montserrat">
                Golfistas Activos
              </p>
            </div>

            {/* Rating Promedio */}
            <div className="group">
              <div className="text-5xl md:text-6xl font-bold text-golf-gold-400 mb-2 group-hover:scale-110 transition-transform duration-300">
                4.9
              </div>
              <p className="text-xl font-semibold text-white/90 font-montserrat">
                Rating Promedio
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ¿Tu Campo Aquí? */}
      <section className="py-20 px-4 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="container mx-auto">
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-golf-gold-400 to-golf-gold-600 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center">
                  <div className="text-3xl">🏌️</div>
                </div>
                
                <div className="bg-golf-gold-500 text-golf-gold-100 px-4 py-2 rounded-full text-sm font-bold mb-4 inline-block">
                  ¿Tu Campo Aquí?
                </div>
                
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 font-playfair">
                  PRÓXIMAMENTE
                </h3>
                
                <div className="bg-white/10 rounded-lg p-4 mb-6">
                  <h4 className="text-lg font-bold text-white mb-2">¿Tu Campo Aquí?</h4>
                  <p className="text-white/90 text-sm mb-3">
                    📍 Próximamente en México • + oportunidades
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold">Contáctanos</span>
                    <Button className="bg-white text-golf-gold-600 hover:bg-golf-gold-50 px-6 py-2 font-bold">
                      Contáctanos
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-golf-green-700 dark:bg-golf-green-800 text-white relative overflow-hidden transition-colors duration-300">
        <div className="container mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-playfair">
            {t('home.cta.title')}
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto font-montserrat">
            {t('home.cta.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" className="bg-golf-gold-600 hover:bg-golf-gold-700 dark:bg-golf-gold-500 dark:hover:bg-golf-gold-600 text-white px-8 py-4">
                {t('home.cta.contact')}
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="lg" className="bg-golf-gold-600 hover:bg-golf-gold-700 dark:bg-golf-gold-500 dark:hover:bg-golf-gold-600 text-white border-2 border-golf-gold-500 px-8 py-4 font-bold shadow-lg">
                {t('home.cta.register')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
