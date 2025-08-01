import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Configuración de performance monitoring
  tracesSampleRate: 1.0,
  
  // Configuración del entorno
  environment: process.env.NODE_ENV,
  
  // Configuración de release
  release: process.env.VERCEL_GIT_COMMIT_SHA,
  
  // Configuración de tags
  initialScope: {
    tags: {
      component: "server",
      app: "teereserve-golf"
    }
  },
  
  // Configuración de contexto
  beforeSend(event, hint) {
    // Agregar contexto adicional
    if (event.request) {
      event.tags = {
        ...event.tags,
        url: event.request.url,
        method: event.request.method,
      };
    }
    
    // Filtrar errores sensibles
    if (event.exception) {
      const error = event.exception.values?.[0];
      if (error?.value?.includes('password') || 
          error?.value?.includes('token') ||
          error?.value?.includes('secret')) {
        return null;
      }
    }
    
    return event;
  },
  
  // Configuración de debug
  debug: process.env.NODE_ENV === 'development',
});

