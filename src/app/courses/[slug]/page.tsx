import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Star, MapPin, Phone, Globe, DollarSign, Users, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/PageHeader';
import { SecondaryFooter } from '@/components/SecondaryFooter';
import EnhancedImageGallery from '@/components/EnhancedImageGallery';
import EnhancedReviewsSection from '@/components/EnhancedReviewsSection';
import AvailabilityCalendar from '@/components/AvailabilityCalendar';

interface GolfCourse {
  id: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  website: string;
  priceWeekday: number;
  priceWeekend: number;
  holes: number;
  par: number;
  length: number;
  image: string;
  images: string[];
  rating: number;
  reviewCount: number;
  isActive: boolean;
  features: string;
  difficulty: string;
  teeSheetUrl: string;
  currency: string;
}

async function getCourseBySlug(slug: string): Promise<GolfCourse | null> {
  // En un entorno real, esto haría una llamada a la API o a la base de datos
  // Por ahora, simularemos la obtención de datos
  const courses: GolfCourse[] = [
    {
      id: '1',
      name: 'Cabo del Sol Ocean Course',
      slug: 'cabo-del-sol-ocean-course',
      description: 'Diseñado por Jack Nicklaus, este campo ofrece vistas espectaculares al Mar de Cortés y un desafío para golfistas de todos los niveles.',
      address: 'Carretera Transpeninsular Km 10.3',
      city: 'Cabo San Lucas',
      state: 'Baja California Sur',
      phone: '+52-624-145-6300',
      website: 'https://www.cabodelsol.com/golf/ocean-course/',
      priceWeekday: 350,
      priceWeekend: 400,
      holes: 18,
      par: 72,
      length: 7075,
      image: '/images/cabo-del-sol-ocean.jpg',
      images: [
        '/images/cabo-del-sol-ocean-1.jpg',
        '/images/cabo-del-sol-ocean-2.jpg',
        '/images/cabo-del-sol-ocean-3.jpg',
      ],
      rating: 4.8,
      reviewCount: 120,
      isActive: true,
      features: 'Vista al mar, Diseño de Nicklaus, Campo de prácticas, Pro Shop, Restaurante',
      difficulty: 'Avanzado',
      teeSheetUrl: 'https://www.example.com/cabo-del-sol-tee-sheet',
      currency: 'USD',
    },
    {
      id: '2',
      name: 'Cabo Real Golf Club',
      slug: 'cabo-real-golf-club',
      description: 'Un campo de Robert Trent Jones Jr. con impresionantes vistas al océano y al desierto, conocido por sus desafiantes hoyos frente al mar.',
      address: 'Carretera Transpeninsular Km 19.5',
      city: 'San José del Cabo',
      state: 'Baja California Sur',
      phone: '+52-624-144-0040',
      website: 'https://www.caboreal.com/',
      priceWeekday: 280,
      priceWeekend: 320,
      holes: 18,
      par: 71,
      length: 6848,
      image: '/images/cabo-real.jpg',
      images: [
        '/images/cabo-real-1.jpg',
        '/images/cabo-real-2.jpg',
      ],
      rating: 4.5,
      reviewCount: 90,
      isActive: true,
      features: 'Vista al mar, Diseño de Robert Trent Jones Jr., Alquiler de equipo, Clases de golf',
      difficulty: 'Intermedio',
      teeSheetUrl: 'https://www.example.com/cabo-real-tee-sheet',
      currency: 'USD',
    },
    {
      id: '3',
      name: 'Puerto Los Cabos Golf Club',
      slug: 'puerto-los-cabos-golf-club',
      description: 'Un campo de golf único con 27 hoyos diseñados por Jack Nicklaus y Greg Norman, ofreciendo una experiencia diversa y desafiante.',
      address: 'Paseo de los Pescadores S/N',
      city: 'San José del Cabo',
      state: 'Baja California Sur',
      phone: '+52-624-144-6000',
      website: 'https://www.puertoloscabos.com/golf/',
      priceWeekday: 300,
      priceWeekend: 360,
      holes: 27,
      par: 73,
      length: 7461,
      image: '/images/puerto-los-cabos.jpg',
      images: [
        '/images/puerto-los-cabos-1.jpg',
        '/images/puerto-los-cabos-2.jpg',
      ],
      rating: 4.7,
      reviewCount: 110,
      isActive: true,
      features: 'Diseño de Nicklaus y Norman, 27 hoyos, Vistas panorámicas, Club House',
      difficulty: 'Avanzado',
      teeSheetUrl: 'https://www.example.com/puerto-los-cabos-tee-sheet',
      currency: 'USD',
    },
    {
      id: '4',
      name: 'Club Campestre San José',
      slug: 'club-campestre-san-jose',
      description: 'Un campo de 18 hoyos diseñado por Jack Nicklaus, que combina la belleza del desierto con vistas al Mar de Cortés.',
      address: 'Paseo del Malecón S/N',
      city: 'San José del Cabo',
      state: 'Baja California Sur',
      phone: '+52-624-172-6500',
      website: 'https://www.clubcampestresanjose.com/',
      priceWeekday: 250,
      priceWeekend: 290,
      holes: 18,
      par: 71,
      length: 6966,
      image: '/images/club-campestre.jpg',
      images: [
        '/images/club-campestre-1.jpg',
        '/images/club-campestre-2.jpg',
      ],
      rating: 4.4,
      reviewCount: 80,
      isActive: true,
      features: 'Diseño de Nicklaus, Campo bien mantenido, Ambiente exclusivo, Cerca de la ciudad',
      difficulty: 'Intermedio',
      teeSheetUrl: 'https://www.example.com/club-campestre-tee-sheet',
      currency: 'USD',
    },
  ];

  return courses.find(course => course.slug === slug) || null;
}

export default async function CourseDetailPage({ params }: { params: { slug: string } }) {
  const course = await getCourseBySlug(params.slug);

  if (!course) {
    notFound();
  }

  const getDifficultyColor = (difficulty: string) => {
    if (difficulty.includes('Principiante')) return 'bg-green-100 text-green-800';
    if (difficulty.includes('Intermedio')) return 'bg-yellow-100 text-yellow-800';
    if (difficulty.includes('Avanzado')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader />

      <div className="container mx-auto px-4 py-12">
        <Card className="shadow-lg rounded-lg overflow-hidden">
          <CardHeader className="p-0">
            {course.images && course.images.length > 0 ? (
              <EnhancedImageGallery images={course.images} courseName={course.name} mainImage={course.image} />
            ) : course.image ? (
              <div className="relative w-full h-96">
                <Image
                  src={course.image}
                  alt={course.name}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-t-lg"
                />
              </div>
            ) : (
              <div className="w-full h-96 bg-gray-200 flex items-center justify-center rounded-t-lg">
                <span className="text-gray-500">No Image Available</span>
              </div>
            )}
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <CardTitle className="text-4xl font-extrabold text-green-800 mb-2">
                  {course.name}
                </CardTitle>
                <p className="text-gray-600 flex items-center text-lg">
                  <MapPin className="mr-2 text-green-600" size={20} />
                  {course.address}, {course.city}, {course.state}
                </p>
                {course.rating && (
                  <div className="flex items-center mt-2">
                    <Star className="text-yellow-400 fill-yellow-400 mr-1" size={18} />
                    <span className="text-gray-700 font-semibold">{course.rating}</span>
                    <span className="text-gray-500 ml-1">({course.reviewCount} reseñas)</span>
                  </div>
                )}
              </div>
              <div className="mt-4 md:mt-0 flex flex-col items-end">
                {course.priceWeekday && (
                  <p className="text-5xl font-bold text-green-700">
                    {course.currency} {course.priceWeekday}
                    <span className="text-xl text-gray-500"> / día de semana</span>
                  </p>
                )}
                {course.priceWeekend && (
                  <p className="text-3xl font-semibold text-green-600 mt-1">
                    {course.currency} {course.priceWeekend}
                    <span className="text-lg text-gray-500"> / fin de semana</span>
                  </p>
                )}
                <Button className="mt-6 bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-3 rounded-full shadow-lg">
                  Reservar Ahora
                </Button>
              </div>
            </div>

            {/* Separator (simulado, debería ser de '@/components/ui/separator') */}
            <div className="h-px bg-gray-200 my-8" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-2xl font-bold text-green-700 mb-4">Acerca del Campo</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {course.description || 'No hay descripción disponible para este campo.'}
                </p>
                <div className="space-y-2 text-gray-700">
                  <p className="flex items-center">
                    <Flag className="mr-2 text-green-600" size={18} />
                    Hoyos: <span className="font-semibold ml-1">{course.holes}</span>
                  </p>
                  {course.par && (
                    <p className="flex items-center">
                      <Users className="mr-2 text-green-600" size={18} />
                      Par: <span className="font-semibold ml-1">{course.par}</span>
                    </p>
                  )}
                  {course.length && (
                    <p className="flex items-center">
                      <Flag className="mr-2 text-green-600" size={18} />
                      Longitud: <span className="font-semibold ml-1">{course.length} yardas</span>
                    </p>
                  )}
                  {course.difficulty && (
                    <p className="flex items-center">
                      <Badge className={`${getDifficultyColor(course.difficulty)} text-sm px-3 py-1`}>
                        Dificultad: {course.difficulty}
                      </Badge>
                    </p>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-green-700 mb-4">Contacto y Servicios</h3>
                <div className="space-y-2 text-gray-700">
                  {course.phone && (
                    <p className="flex items-center">
                      <Phone className="mr-2 text-green-600" size={18} />
                      Teléfono: <a href={`tel:${course.phone}`} className="text-blue-600 hover:underline">{course.phone}</a>
                    </p>
                  )}
                  {course.website && (
                    <p className="flex items-center">
                      <Globe className="mr-2 text-green-600" size={18} />
                      Web: <a href={course.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Visitar sitio web</a>
                    </p>
                  )}
                  {course.features && (
                    <div className="flex flex-wrap items-center mt-2">
                      <span className="font-semibold mr-2">Características:</span>
                      {course.features.split(',').map((feature, index) => (
                        <Badge key={index} variant="secondary" className="mr-2 mb-2 bg-green-100 text-green-800">
                          {feature.trim()}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Separator (simulado, debería ser de '@/components/ui/separator') */}
            <div className="h-px bg-gray-200 my-8" />

            <h3 className="text-2xl font-bold text-green-700 mb-4">Disponibilidad y Reservas</h3>
            <div className="bg-gray-100 p-6 rounded-lg shadow-inner mb-8">
              <AvailabilityCalendar 
                courseId={course.id}
                courseName={course.name}
                priceWeekday={course.priceWeekday || 0}
                priceWeekend={course.priceWeekend || 0}
              />
            </div>

            {/* Separator (simulado, debería ser de '@/components/ui/separator') */}
            <div className="h-px bg-gray-200 my-8" />

            {course.reviewCount > 0 && (
              <>
                <h3 className="text-2xl font-bold text-green-700 mb-4">Reseñas de Usuarios</h3>
                <EnhancedReviewsSection courseId={course.id} />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <SecondaryFooter />
    </div>
  );
}

// Componente Separator (simulado, debería ser de '@/components/ui/separator')
const Separator = ({ className }: { className?: string }) => (
  <div className={`h-px bg-gray-200 ${className}`} />
);


