# 🗄️ Configuración de Supabase para TeeReserve Golf

## Paso 1: Crear cuenta en Supabase
1. Ve a https://supabase.com
2. Haz clic en "Start your project"
3. Crea cuenta con GitHub o Email

## Paso 2: Crear nuevo proyecto
1. Clic en "New Project"
2. Nombre: `teereserve-golf-production`
3. Database Password: `TeeReserveGolf2025!`
4. Region: `West US (Oregon)` (más cercano a México)
5. Pricing Plan: `Free` (para empezar)

## Paso 3: Obtener credenciales
Una vez creado el proyecto, ve a Settings > Database:

### URL de conexión:
- **Direct URL**: `postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres`
- **Connection pooling**: `postgresql://postgres.[project-ref]:[password]@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1`

### API Keys (Settings > API):
- **URL**: `https://[project-ref].supabase.co`
- **anon key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Paso 4: Configurar variables de entorno
Reemplaza en `.env.local`:

```env
# Supabase Production
DATABASE_URL="postgresql://postgres.PROJECT_REF:TeeReserveGolf2025!@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:TeeReserveGolf2025!@db.PROJECT_REF.supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://PROJECT_REF.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_ANON_KEY"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"
```

## Paso 5: Ejecutar migraciones
```bash
cd teereserve-golf
bunx prisma db push
bunx prisma db seed
```

¡Una vez tengas las credenciales, actualiza el archivo .env.local y me avisas!
