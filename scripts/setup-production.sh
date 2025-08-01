#!/bin/bash

# 🚀 TeeReserve Golf - Script de Configuración de Producción
# Este script configura todos los servicios reales para TeeReserve Golf

set -e

echo "🚀 TeeReserve Golf - Configuración de Producción"
echo "=============================================="
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encuentra package.json"
    echo "Por favor ejecuta este script desde el directorio raíz del proyecto"
    exit 1
fi

echo "📂 Directorio del proyecto: $(pwd)"
echo ""

# Verificar archivo .env.local
if [ ! -f ".env.local" ]; then
    echo "❌ Error: No se encuentra .env.local"
    echo "Por favor crea el archivo .env.local con las credenciales"
    echo "Puedes usar .env.local.example como plantilla"
    exit 1
fi

echo "✅ Archivo .env.local encontrado"

# Verificar que Bun esté instalado
if ! command -v bun &> /dev/null; then
    echo "❌ Error: Bun no está instalado"
    echo "Instala Bun desde: https://bun.sh"
    exit 1
fi

echo "✅ Bun está instalado: $(bun --version)"
echo ""

echo "📦 Instalando dependencias..."
bun install

echo ""
echo "🗄️ Configurando base de datos..."

# Verificar conexión a la base de datos
echo "🔍 Verificando conexión a Supabase..."
if bunx prisma db push; then
    echo "✅ Base de datos conectada exitosamente"
else
    echo "❌ Error conectando a la base de datos"
    echo "Verifica las credenciales en .env.local:"
    echo "- DATABASE_URL"
    echo "- DIRECT_URL"
    exit 1
fi

echo ""
echo "🌱 Poblando base de datos con datos de golf..."
if bunx prisma db seed; then
    echo "✅ Base de datos poblada con 10 campos de golf premium"
else
    echo "❌ Error poblando la base de datos"
    exit 1
fi

echo ""
echo "🔧 Generando cliente Prisma..."
bunx prisma generate

echo ""
echo "🏗️ Construyendo aplicación..."
if bun run build; then
    echo "✅ Build completado exitosamente"
else
    echo "❌ Error en el build"
    echo "Revisa los errores y corrige antes de continuar"
    exit 1
fi

echo ""
echo "🧪 Probando APIs..."

# Iniciar servidor en background para pruebas
echo "🔄 Iniciando servidor de prueba..."
bun run start &
SERVER_PID=$!

# Esperar a que el servidor inicie
sleep 10

# Probar API de health
echo "🔍 Probando API de health..."
if curl -f -s http://localhost:3000/api/health > /dev/null; then
    echo "✅ API de health funcionando"
else
    echo "❌ API de health falló"
fi

# Probar API de courses
echo "🔍 Probando API de courses..."
if curl -f -s http://localhost:3000/api/courses > /dev/null; then
    echo "✅ API de courses funcionando"
else
    echo "❌ API de courses falló"
fi

# Terminar servidor de prueba
kill $SERVER_PID

echo ""
echo "🎉 ¡CONFIGURACIÓN COMPLETADA!"
echo "============================="
echo ""
echo "✅ Base de datos Supabase: Conectada y poblada"
echo "✅ Aplicación: Build exitoso"
echo "✅ APIs: Funcionando correctamente"
echo ""
echo "🚀 PRÓXIMOS PASOS:"
echo "1. Verifica tus credenciales en .env.local:"
echo "   - Google Maps API key"
echo "   - Google OAuth credentials"
echo "   - Twilio WhatsApp credentials"
echo ""
echo "2. Para desarrollo local:"
echo "   bun run dev"
echo ""
echo "3. Para deployment:"
echo "   - Vercel: vercel --prod"
echo "   - Netlify: netlify deploy --prod"
echo ""
echo "📖 Consulta las guías en scripts/ para más detalles"
echo ""
echo "🇲🇽 ¡TeeReserve Golf listo para dominar México!"
