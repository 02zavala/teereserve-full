# 🗺️ Configuración de Google Maps API para TeeReserve Golf

## Paso 1: Ir a Google Cloud Console
1. Ve a https://console.cloud.google.com
2. Crea un nuevo proyecto o selecciona uno existente
3. Nombre del proyecto: `TeeReserve Golf`

## Paso 2: Habilitar APIs necesarias
En el menú lateral, ve a "APIs y servicios" > "Biblioteca"

Habilita estas APIs:
- ✅ **Maps JavaScript API**
- ✅ **Places API**
- ✅ **Geocoding API**
- ✅ **Directions API**

## Paso 3: Crear API Key
1. Ve a "APIs y servicios" > "Credenciales"
2. Clic en "Crear credenciales" > "Clave de API"
3. Se generará una clave como: `AIzaSyC-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

## Paso 4: Configurar restricciones (IMPORTANTE)
1. Clic en tu API key recién creada
2. En "Restricciones de aplicaciones":
   - Selecciona "Referentes HTTP (sitios web)"
   - Agrega estos dominios:
     - `http://localhost:3000/*`
     - `https://teereserve.golf/*`
     - `https://*.netlify.app/*`

3. En "Restricciones de API":
   - Selecciona "Restringir clave"
   - Marca las 4 APIs que habilitaste arriba

## Paso 5: Actualizar variables de entorno
En tu `.env.local`:

```env
# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIzaSyC-TU_CLAVE_AQUI"
```

## Paso 6: Configurar facturación (requerido)
⚠️ **IMPORTANTE**: Google Maps requiere una cuenta de facturación, pero tiene $300 de crédito gratis mensual.

1. Ve a "Facturación" en Google Cloud Console
2. Agrega una tarjeta de crédito/débito
3. Con el uso normal de TeeReserve, no deberías exceder el límite gratuito

## Cuota gratuita incluye:
- 28,000 cargas de mapas por mes
- 40,000 solicitudes de geocodificación por mes
- Suficiente para miles de usuarios

¡Una vez tengas tu API key, actualiza el archivo .env.local!
