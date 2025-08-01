import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Configuración de performance monitoring
  tracesSampleRate: 1.0,
  
  // Configuración de session replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Configuración del entorno
  environment: process.env.NODE_ENV,
  
  // Configuración de release
  release: process.env.VERCEL_GIT_COMMIT_SHA,
  
  // Configuración de tags
  initialScope: {
    tags: {
      component: "client",
      app: "teereserve-golf"
    }
  },
  
  // Filtros de errores
  beforeSend(event, hint) {
    // Filtrar errores de desarrollo
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    
    // Filtrar errores de extensiones del navegador
    if (event.exception) {
      const error = event.exception.values?.[0];
      if (error?.stacktrace?.frames) {
        const frames = error.stacktrace.frames;
        if (frames.some(frame => 
          frame.filename?.includes('extension://') ||
          frame.filename?.includes('chrome-extension://') ||
          frame.filename?.includes('moz-extension://')
        )) {
          return null;
        }
      }
    }
    
    return event;
  },
  
  // Configuración de integrations
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});

