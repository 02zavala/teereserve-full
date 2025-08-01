# Instrucciones de Despliegue para TeeReserve.golf con PayPal

Este documento detalla los pasos necesarios para desplegar la aplicación TeeReserve.golf en Vercel con soporte completo para pagos PayPal y Stripe. Siga estas instrucciones cuidadosamente para asegurar un despliegue exitoso.

## 🆕 Nuevas Funcionalidades en esta Versión
- ✅ **Integración PayPal Completa**: Soporte para pagos con PayPal además de Stripe
- ✅ **Selector de Métodos de Pago**: Interfaz unificada para elegir método de pago
- ✅ **Base de Datos Actualizada**: Soporte para múltiples métodos de pago
- ✅ **APIs Optimizadas**: Nuevas rutas para PayPal y Stripe mejoradas

## 1. Configuración de la Base de Datos en Supabase

La aplicación TeeReserve.golf utiliza PostgreSQL como base de datos, y Supabase es una excelente opción para alojarla debido a su facilidad de uso y su integración con PostgreSQL. Si aún no tienes una cuenta de Supabase, regístrate en [Supabase.com](https://supabase.com/).

### 1.1. Crear un Nuevo Proyecto en Supabase

1.  Inicia sesión en tu cuenta de Supabase.
2.  Haz clic en "New project" (Nuevo proyecto).
3.  Elige una organización existente o crea una nueva.
4.  **Configura tu proyecto:**
    -   **Name:** `teereserve-golf` (o el nombre que prefieras)
    -   **Database Password:** Crea una contraseña segura y guárdala en un lugar seguro. La necesitarás más adelante.
    -   **Region:** Selecciona la región más cercana a tus usuarios para reducir la latencia.
    -   **Pricing Plan:** Elige el plan "Free" para empezar.
5.  Haz clic en "Create new project" (Crear nuevo proyecto).

### 1.2. Obtener las Credenciales de la Base de Datos

Una vez que tu proyecto de Supabase esté listo, necesitarás obtener las credenciales de conexión a la base de datos:

1.  En el panel de control de tu proyecto de Supabase, navega a "Project Settings" (Configuración del proyecto) en la barra lateral izquierda.
2.  Selecciona "Database" (Base de datos).
3.  En la sección "Connection string" (Cadena de conexión), busca la cadena de conexión de tipo `URI`.
4.  Copia esta cadena de conexión. Tendrá un formato similar a:
    ```
    postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
    ```
    **Asegúrate de reemplazar `[YOUR-PASSWORD]` con la contraseña de la base de datos que configuraste en el paso 1.1.**

### 1.3. Configurar las Variables de Entorno Locales

En tu proyecto local de TeeReserve.golf, necesitas actualizar el archivo `.env.local` con las credenciales de tu base de datos de Supabase. Este archivo ya debería existir en la raíz de tu proyecto `teereserve-golf`.

1.  Abre el archivo `/teereserve-golf/.env.local`.
2.  Actualiza las siguientes líneas con tu cadena de conexión de Supabase:
    ```dotenv
    DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
    DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
    ```
    **Importante:** `DIRECT_URL` es utilizada por Prisma para las migraciones y `DATABASE_URL` para las conexiones en tiempo de ejecución. Ambas deben ser la misma cadena de conexión de tu base de datos de Supabase.

### 1.4. Aplicar el Esquema de la Base de Datos y Sembrar Datos

Ahora que tu aplicación local sabe cómo conectarse a tu base de datos de Supabase, puedes aplicar el esquema de Prisma y sembrar los datos iniciales (roles, campos de golf, usuarios de prueba, etc.).

1.  Abre tu terminal y navega a la raíz de tu proyecto `teereserve-golf`:
    ```bash
    /Finalizar-Proyecto/teereserve-golf
    ```
2.  Ejecuta los siguientes comandos para aplicar el esquema y sembrar los datos:
    ```bash
    /.bun/bin/bunx prisma db push
    /.bun/bin/bunx prisma db seed
    ```
    -   `bunx prisma db push`: Sincroniza tu esquema de Prisma (`prisma/schema.prisma`) con tu base de datos de Supabase. Esto creará todas las tablas y relaciones definidas.
    -   `bunx prisma db seed`: Ejecuta el script `prisma/seed.ts` para poblar tu base de datos con datos iniciales (roles, campos de golf, usuarios de prueba, etc.).

    **Verifica la salida de estos comandos para asegurarte de que no haya errores.** Si hay errores, revisa tu cadena de conexión en `.env.local` y la contraseña de tu base de datos.

## 2. Despliegue en Vercel

Vercel es la plataforma recomendada para desplegar aplicaciones Next.js. Si aún no tienes una cuenta de Vercel, regístrate en [Vercel.com](https://vercel.com/).

### 2.1. Preparar tu Repositorio de Git

Para desplegar en Vercel, tu proyecto debe estar en un repositorio de Git (GitHub, GitLab o Bitbucket).

1.  Si tu proyecto aún no está en Git, inicializa un repositorio y sube tu código:
    ```bash
    /Finalizar-Proyecto/teereserve-golf
    git init
    git add .
    git commit -m "Initial commit for TeeReserve.golf"
    git branch -M main
    git remote add origin [URL_DE_TU_REPOSITORIO_GIT]
    git push -u origin main
    ```
    **Reemplaza `[URL_DE_TU_REPOSITORIO_GIT]` con la URL de tu repositorio (ej. `https://github.com/tu-usuario/teereserve-golf.git`).**

### 2.2. Importar el Proyecto en Vercel

1.  Inicia sesión en tu panel de control de Vercel.
2.  Haz clic en "Add New..." (Agregar nuevo...) y luego en "Project" (Proyecto).
3.  Selecciona tu proveedor de Git (GitHub, GitLab o Bitbucket) y autoriza a Vercel si aún no lo has hecho.
4.  Importa el repositorio de `teereserve-golf`.
5.  Vercel detectará automáticamente que es un proyecto Next.js.

### 2.3. Configurar las Variables de Entorno en Vercel

Para que tu aplicación desplegada se conecte a Supabase, Stripe y PayPal, necesitas configurar las siguientes variables de entorno en Vercel.

1.  Durante el proceso de importación del proyecto en Vercel, o yendo a "Settings" (Configuración) -> "Environment Variables" (Variables de Entorno) de tu proyecto en Vercel.
2.  Añade las siguientes variables de entorno:

#### Variables de Base de Datos y Autenticación
-   `DATABASE_URL`: Pega la cadena de conexión completa de Supabase (la misma que usaste en `.env.local`).
-   `DIRECT_URL`: Pega la misma cadena de conexión de Supabase.
-   `NEXTAUTH_SECRET`: Genera una cadena aleatoria larga y segura (ej. usando `openssl rand -base64 32` en tu terminal o un generador online). Esta es crucial para la seguridad de NextAuth.
-   `NEXTAUTH_URL`: La URL de tu aplicación desplegada en Vercel (ej. `https://tu-app.vercel.app`).

#### Variables de Stripe
-   `STRIPE_SECRET_KEY`: Tu clave secreta de Stripe (para modo test por ahora).
-   `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Tu clave publicable de Stripe (para modo test por ahora).

#### Variables de PayPal (NUEVAS)
-   `PAYPAL_CLIENT_ID`: Tu Client ID de PayPal (obtener de PayPal Developer Dashboard).
-   `PAYPAL_CLIENT_SECRET`: Tu Client Secret de PayPal (obtener de PayPal Developer Dashboard).
-   `NEXT_PUBLIC_PAYPAL_CLIENT_ID`: Tu Client ID de PayPal (mismo que PAYPAL_CLIENT_ID).
-   `PAYPAL_ENVIRONMENT`: `sandbox` para testing, `live` para producción.

#### Variables de Servicios Externos
-   `NEXT_PUBLIC_SUPABASE_URL`: La URL de tu proyecto Supabase (ej. `https://[YOUR-PROJECT-REF].supabase.co`).
-   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Tu clave `anon` de Supabase (la encuentras en Project Settings -> API).

    **Asegúrate de que todas las variables estén marcadas como "Encrypted" (Cifradas) si Vercel lo permite, y que estén disponibles para los entornos de "Production" y "Preview".**

### 2.4. Desplegar el Proyecto

1.  Una vez que hayas configurado las variables de entorno, haz clic en "Deploy" (Desplegar).
2.  Vercel construirá y desplegará tu aplicación. Esto puede tardar unos minutos.
3.  Una vez que el despliegue sea exitoso, Vercel te proporcionará una URL de producción (ej. `https://teereserve-golf.vercel.app`).

## 3. Configuración de PayPal (NUEVO)

### 3.1. Crear Cuenta PayPal Developer

1.  Ve a [PayPal Developer Dashboard](https://developer.paypal.com/)
2.  Inicia sesión con tu cuenta PayPal existente o crea una nueva
3.  Haz clic en "Create App" (Crear Aplicación)

### 3.2. Configurar la Aplicación PayPal

1.  **App Name**: `TeeReserve Golf`
2.  **Merchant**: Selecciona tu cuenta de merchant o crea una nueva
3.  **Features**: Marca "Accept payments"
4.  **Environment**: 
    -   Para desarrollo: `Sandbox`
    -   Para producción: `Live`

### 3.3. Obtener Credenciales PayPal

1.  Una vez creada la aplicación, verás las credenciales:
    -   **Client ID**: Usar para `PAYPAL_CLIENT_ID` y `NEXT_PUBLIC_PAYPAL_CLIENT_ID`
    -   **Client Secret**: Usar para `PAYPAL_CLIENT_SECRET`
2.  Copia estas credenciales a las variables de entorno en Vercel

### 3.4. Configurar Webhooks PayPal (Opcional)

Para eventos avanzados de PayPal:
1.  En PayPal Developer Dashboard, ve a tu aplicación
2.  Ve a "Webhooks" y haz clic en "Create Webhook"
3.  **Webhook URL**: `https://tu-app.vercel.app/api/paypal/webhook`
4.  **Event types**: Selecciona los eventos que necesites escuchar

## 4. Configuración Adicional (Opcional pero Recomendado)

### 3.1. Configurar Dominios Personalizados

Si tienes un dominio personalizado (ej. `teereserve.golf`), puedes configurarlo en Vercel:

1.  En el panel de control de tu proyecto en Vercel, ve a "Settings" (Configuración) -> "Domains" (Dominios).
2.  Añade tu dominio personalizado y sigue las instrucciones para configurar los registros DNS en tu proveedor de dominio.

### 3.2. Configurar Webhooks de Stripe

Para manejar eventos de Stripe (como pagos exitosos, reembolsos, etc.) en tu backend, es crucial configurar webhooks:

1.  En tu panel de control de Stripe, ve a "Developers" (Desarrolladores) -> "Webhooks".
2.  Haz clic en "Add endpoint" (Agregar endpoint).
3.  **Endpoint URL:** `https://tu-app.vercel.app/api/stripe/webhook` (reemplaza `tu-app.vercel.app` con la URL de tu aplicación desplegada).
4.  **Events to send:** Selecciona los eventos que necesitas escuchar (ej. `checkout.session.completed`, `payment_intent.succeeded`, `charge.refunded`).
5.  Haz clic en "Add endpoint".
6.  Stripe te proporcionará una "Signing secret" (Clave secreta de firma). Añade esta clave como una nueva variable de entorno en Vercel (`STRIPE_WEBHOOK_SECRET`).

### 3.3. Configurar Políticas de Seguridad en Supabase (RLS)

Para una mayor seguridad, se recomienda implementar Row Level Security (RLS) en Supabase para tus tablas. Esto asegura que los usuarios solo puedan acceder a los datos que les corresponden.

1.  En el panel de control de Supabase, ve a "Authentication" (Autenticación) -> "Policies" (Políticas).
2.  Crea políticas para tus tablas (`users`, `golf_courses`, `bookings`, `affiliates`, `commissions`, `discount_codes`, `reviews`, `availability`) según tus requisitos de acceso.

## 5. Verificación Post-Despliegue

Una vez que la aplicación esté desplegada, realiza las siguientes verificaciones:

### Verificaciones Básicas
1.  **Accede a la URL de tu aplicación:** Asegúrate de que la página de inicio se cargue correctamente.
2.  **Prueba el registro e inicio de sesión:** Verifica que los usuarios puedan registrarse e iniciar sesión con los diferentes roles.
3.  **Prueba el panel de SuperAdmin:** Accede a `https://tu-app.vercel.app/admin` y verifica que todas las secciones funcionen correctamente.

### Verificaciones de Pago (NUEVAS)
4.  **Prueba el Selector de Métodos de Pago:** Verifica que aparezcan las opciones de Stripe y PayPal.
5.  **Realiza una reserva con Stripe:** Asegúrate de que el flujo de pago con tarjeta funcione correctamente (modo test).
6.  **Realiza una reserva con PayPal:** Verifica que el flujo de pago con PayPal funcione correctamente (sandbox).
7.  **Verifica códigos de descuento:** Aplica códigos de descuento en ambos métodos de pago.
8.  **Verifica comisiones de afiliados:** Realiza reservas con códigos de afiliado en ambos métodos.

### Verificaciones de Base de Datos
9.  **Revisa las reservas creadas:** Verifica en el panel admin que las reservas se creen con el método de pago correcto.
10. **Verifica los datos de pago:** Asegúrate de que se guarden correctamente los datos específicos de cada método.

### Lista de Verificación PayPal
- [ ] ✅ PayPal buttons se cargan correctamente
- [ ] ✅ Crear orden PayPal funciona
- [ ] ✅ Autorizar pago en sandbox funciona
- [ ] ✅ Capturar pago funciona
- [ ] ✅ Reserva se crea con paymentMethod: "paypal"
- [ ] ✅ paypalOrderId se guarda correctamente
- [ ] ✅ Email de confirmación se envía

### Lista de Verificación Stripe  
- [ ] ✅ Stripe Elements se cargan correctamente
- [ ] ✅ Payment Intent se crea
- [ ] ✅ Pago con tarjeta de prueba funciona
- [ ] ✅ Reserva se crea con paymentMethod: "stripe"
- [ ] ✅ Email de confirmación se envía

¡Felicidades! Tu aplicación TeeReserve.golf ahora está completamente operativa con soporte para múltiples métodos de pago (Stripe y PayPal). 🎉

## 🚀 Próximos Pasos

Una vez verificado el funcionamiento:

1. **Modo Producción PayPal**: Cambiar `PAYPAL_ENVIRONMENT` a `live` y usar credenciales de producción
2. **Modo Producción Stripe**: Cambiar a claves de producción de Stripe
3. **Monitoreo**: Configurar dashboards para monitorear transacciones
4. **Analytics**: Implementar tracking de conversión por método de pago

