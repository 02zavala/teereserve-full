# 🚀 Deployment de TeeReserve Golf a Producción

## Opción 1: Deployment con Vercel (Recomendado)

### Paso 1: Instalar Vercel CLI
```bash
npm i -g vercel
```

### Paso 2: Login en Vercel
```bash
vercel login
```

### Paso 3: Deploy desde el directorio del proyecto
```bash
cd teereserve-golf
vercel --prod
```

### Paso 4: Configurar variables de entorno en Vercel
En el dashboard de Vercel > Settings > Environment Variables:

```env
# Base de datos
DATABASE_URL=postgresql://postgres.PROJECT_REF:TeeReserveGolf2025!@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://postgres:TeeReserveGolf2025!@db.PROJECT_REF.supabase.co:5432/postgres

# NextAuth
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=tu_secret_seguro_aqui_2025

# Google OAuth
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_google_maps_api_key

# Twilio WhatsApp
TWILIO_ACCOUNT_SID=tu_twilio_account_sid
TWILIO_AUTH_TOKEN=tu_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+tu_numero

# Stripe (opcional)
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

---

## Opción 2: Deployment con Netlify

### Paso 1: Build para producción estática
Actualiza `next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
}

module.exports = nextConfig
```

### Paso 2: Instalar Netlify CLI
```bash
npm install -g netlify-cli
```

### Paso 3: Build y deploy
```bash
cd teereserve-golf
bun run build
netlify deploy --prod --dir=out
```

### Paso 4: Configurar variables de entorno en Netlify
En Netlify Dashboard > Site settings > Environment variables

---

## Paso 5: Configurar dominio personalizado

### Para Vercel:
1. Ve a Settings > Domains
2. Agrega `teereserve.golf`
3. Configura DNS según las instrucciones

### Para Netlify:
1. Ve a Site settings > Domain management
2. Agrega dominio personalizado
3. Configura DNS

---

## Paso 6: Configurar DNS (CloudFlare recomendado)

Registros DNS necesarios:
```
Type: A
Name: @
Value: [IP de tu hosting]

Type: CNAME
Name: www
Value: teereserve.golf

Type: CNAME
Name: _vercel (si usas Vercel)
Value: cname.vercel-dns.com
```

---

## Paso 7: Ejecutar migraciones en producción

Una vez deployed, ejecuta:
```bash
# Conectarse a la base de datos de producción
bunx prisma db push --schema=./prisma/schema.prisma

# Poblar con datos
bunx prisma db seed
```

---

## Paso 8: Configurar SSL y HTTPS

Tanto Vercel como Netlify proveen SSL automático.
Solo verifica que todas las URLs usen `https://`

---

## Paso 9: Monitoreo post-deployment

### Verificar que funcione:
- ✅ Homepage carga correctamente
- ✅ API endpoints responden
- ✅ Base de datos conectada
- ✅ Google OAuth funciona
- ✅ Google Maps se muestran
- ✅ WhatsApp widget funciona

### URLs a probar:
- `https://tu-dominio.com/`
- `https://tu-dominio.com/courses`
- `https://tu-dominio.com/admin`
- `https://tu-dominio.com/api/health`
- `https://tu-dominio.com/api/courses`

---

## ⚠️ Checklist pre-deployment:

- [ ] Todas las variables de entorno configuradas
- [ ] Base de datos Supabase funcionando
- [ ] Google OAuth configurado
- [ ] Google Maps API key válida
- [ ] Twilio WhatsApp configurado
- [ ] Build sin errores (`bun run build`)
- [ ] Todas las APIs responden correctamente

¡Una vez completado, TeeReserve Golf estará live en producción! 🎉
