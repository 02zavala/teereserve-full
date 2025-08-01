// URLs de imágenes de campos de golf locales
export const GOLF_COURSE_IMAGES = {
  // Solmar Golf Links
  'solmar-golf-links': {
    main: '/images/golf-courses/solmar-1.jpg',
    gallery: [
      '/images/golf-courses/solmar-1.jpg',
      '/images/golf-courses/solmar-2.jpg',
      '/images/golf-courses/solmar-3.jpg',
      '/images/golf-courses/solmar-4.jpg'
    ]
  },
  
  // Palmilla Golf Club
  'palmilla-golf-club': {
    main: '/images/golf-courses/palmilla-1.jpg',
    gallery: [
      '/images/golf-courses/palmilla-1.jpg',
      '/images/golf-courses/palmilla-2.jpg',
      '/images/golf-courses/palmilla-3.jpg',
      '/images/golf-courses/palmilla-4.jpg'
    ]
  },
  
  // Cabo del Sol
  'cabo-del-sol-desert': {
    main: '/images/golf-courses/cabo-del-sol-1.jpg',
    gallery: [
      '/images/golf-courses/cabo-del-sol-1.jpg',
      '/images/golf-courses/cabo-del-sol-2.jpg',
      '/images/golf-courses/cabo-del-sol-3.jpg',
      '/images/golf-courses/cabo-del-sol-4.jpg'
    ]
  },
  
  'cabo-del-sol-ocean': {
    main: '/images/golf-courses/cabo-del-sol-1.jpg',
    gallery: [
      '/images/golf-courses/cabo-del-sol-1.jpg',
      '/images/golf-courses/cabo-del-sol-2.jpg',
      '/images/golf-courses/cabo-del-sol-3.jpg',
      '/images/golf-courses/cabo-del-sol-4.jpg'
    ]
  },
  
  // Puerto Los Cabos Golf Club
  'puerto-los-cabos': {
    main: '/images/golf-courses/puerto-los-cabos-1.jpg',
    gallery: [
      '/images/golf-courses/puerto-los-cabos-1.jpg',
      '/images/golf-courses/puerto-los-cabos-2.jpg',
    ]
  },
  
  // Vidanta Golf Los Cabos
  'vidanta-golf-los-cabos': {
    main: '/images/golf-courses/vidanta-1.jpg',
    gallery: [
      '/images/golf-courses/vidanta-1.jpg',
      '/images/golf-courses/vidanta-2.jpg',
      '/images/golf-courses/vidanta-3.jpg',
      '/images/golf-courses/vidanta-4.jpg'
    ]
  },
  
  // Cabo Real Golf Club
  'cabo-real-golf-club': {
    main: '/images/golf-courses/cabo-real-1.jpg',
    gallery: [
      '/images/golf-courses/cabo-real-1.jpg',
      '/images/golf-courses/cabo-real-2.jpg',
      '/images/golf-courses/cabo-real-3.jpg',
      '/images/golf-courses/cabo-real-4.jpg'
    ]
  },
  
  // Club Campestre San José
  'club-campestre-san-jose': {
    main: '/images/golf-courses/el-camaleon-1.jpg',
    gallery: [
      '/images/golf-courses/el-camaleon-1.jpg',
      '/images/golf-courses/el-camaleon-2.jpg',
      '/images/golf-courses/el-camaleon-3.jpg',
      '/images/golf-courses/el-camaleon-4.jpg'
    ]
  },
  
  // Cabo San Lucas Country Club
  'cabo-san-lucas-country-club': {
    main: '/images/golf-courses/estrella-del-mar-1.jpg',
    gallery: [
      '/images/golf-courses/estrella-del-mar-1.jpg',
      '/images/golf-courses/estrella-del-mar-2.jpg',
      '/images/golf-courses/estrella-del-mar-3.jpg',
      '/images/golf-courses/estrella-del-mar-4.jpg'
    ]
  },
  
  // Diamante Golf - Dunes
  'diamante-golf-dunes': {
    main: '/images/golf-courses/la-ceiba-1.jpg',
    gallery: [
        '/images/golf-courses/la-ceiba-1.jpg',
        '/images/golf-courses/la-ceiba-2.jpg',
        '/images/golf-courses/la-ceiba-3.jpg',
        '/images/golf-courses/la-ceiba-4.jpg'
    ]
  },
  
  // Diamante Golf - Cardonal
  'diamante-golf-cardonal': {
    main: '/images/golf-courses/moon-palace-1.jpg',
    gallery: [
        '/images/golf-courses/moon-palace-1.jpg',
        '/images/golf-courses/moon-palace-2.jpg',
        '/images/golf-courses/moon-palace-3.jpg',
        '/images/golf-courses/moon-palace-4.jpg'
    ]
  },
  
  // El Cortés Golf Club (La Paz)
  'el-cortes-golf-club': {
    main: '/images/golf-courses/punta-mita-1.jpg',
    gallery: [
        '/images/golf-courses/punta-mita-1.jpg',
        '/images/golf-courses/punta-mita-2.jpg',
        '/images/golf-courses/punta-mita-3.jpg',
        '/images/golf-courses/punta-mita-4.jpg'
    ]
  },
  
  // Paraíso del Mar Golf (La Paz)
  'paraiso-del-mar-golf': {
    main: '/images/golf-courses/quivira-1.jpg',
    gallery: [
        '/images/golf-courses/quivira-1.jpg',
        '/images/golf-courses/quivira-2.jpg',
        '/images/golf-courses/quivira-3.jpg',
        '/images/golf-courses/quivira-4.jpg'
    ]
  },
  
  // TPC Danzante Bay (Loreto)
  'tpc-danzante-bay': {
    main: '/images/golf-courses/golf-bosques-1.jpg',
    gallery: [
        '/images/golf-courses/golf-bosques-1.jpg',
        '/images/golf-courses/golf-bosques-2.jpg',
        '/images/golf-courses/golf-bosques-3.jpg',
        '/images/golf-courses/golf-bosques-4.jpg'
    ]
  },
  
  // Costa Palmas Golf Club (La Ribera, East Cape)
  'costa-palmas-golf-club': {
    main: '/images/golf-courses/cabo-del-sol-1.jpg',
    gallery: [
        '/images/golf-courses/cabo-del-sol-1.jpg',
        '/images/golf-courses/cabo-del-sol-2.jpg',
        '/images/golf-courses/cabo-del-sol-3.jpg',
        '/images/golf-courses/cabo-del-sol-4.jpg'
    ]
  }
}

// Función helper para obtener la imagen principal de un campo
export function getGolfCourseMainImage(courseSlug: string) {
  const courseImages = GOLF_COURSE_IMAGES[courseSlug as keyof typeof GOLF_COURSE_IMAGES]
  if (!courseImages) {
    // Imagen placeholder si no se encuentra el campo
    return '/images/golf-courses/placeholder-golf-course.jpg'
  }
  return courseImages.main
}

// Función helper para obtener la galería de imágenes de un campo
export function getGolfCourseGallery(courseSlug: string) {
  const courseImages = GOLF_COURSE_IMAGES[courseSlug as keyof typeof GOLF_COURSE_IMAGES]
  if (!courseImages) {
    return []
  }
  return courseImages.gallery
}

