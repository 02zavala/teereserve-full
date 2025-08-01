# 🔐 Configuración de Google OAuth para TeeReserve Golf

## Paso 1: Ir a Google Cloud Console
1. Ve a https://console.cloud.google.com
2. Selecciona el mismo proyecto de Google Maps: `TeeReserve Golf`

## Paso 2: Configurar pantalla de consentimiento OAuth
1. Ve a "APIs y servicios" > "Pantalla de consentimiento de OAuth"
2. Selecciona "Externo" (para que cualquiera pueda registrarse)
3. Rellena el formulario:
   - **Nombre de la aplicación**: `TeeReserve Golf`
   - **Correo electrónico de asistencia**: tu email
   - **Dominio de la aplicación**: `teereserve.golf`
   - **Correo de contacto del desarrollador**: tu email

## Paso 3: Crear credenciales OAuth
1. Ve a "APIs y servicios" > "Credenciales"
2. Clic en "Crear credenciales" > "ID de cliente de OAuth 2.0"
3. Tipo de aplicación: "Aplicación web"
4. Nombre: `TeeReserve Golf Web App`

### URIs de JavaScript autorizados:
```
http://localhost:3000
https://teereserve.golf
https://your-domain.netlify.app
```

### URIs de redirección autorizados:
```
http://localhost:3000/api/auth/callback/google
https://teereserve.golf/api/auth/callback/google
https://your-domain.netlify.app/api/auth/callback/google
```

## Paso 4: Obtener credenciales
Se generarán:
- **Client ID**: `123456789-xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx`

## Paso 5: Actualizar variables de entorno
En tu `.env.local`:

```env
# Google OAuth
GOOGLE_CLIENT_ID="123456789-xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx"
```

## Paso 6: Habilitar Google+ API (si es necesario)
En "APIs y servicios" > "Biblioteca", busca y habilita:
- ✅ **Google+ API** (si aún no está habilitada)

¡Con esto, los usuarios podrán hacer login con Google!
