# 📱 Configuración de Twilio WhatsApp Business para TeeReserve Golf

## Paso 1: Crear cuenta en Twilio
1. Ve a https://www.twilio.com/try-twilio
2. Regístrate con email y teléfono
3. Confirma tu número de teléfono

## Paso 2: Configurar WhatsApp Sandbox (DESARROLLO)
Para pruebas inmediatas:

1. Ve a Console > Develop > Messaging > Try it out > Send a WhatsApp message
2. Sigue las instrucciones para enviar "join [sandbox-code]" al número de Twilio
3. Ejemplo: envía "join orange-donkey" a +1 415 523 8886

## Paso 3: Obtener credenciales de Twilio
En el Dashboard de Twilio:

- **Account SID**: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (empieza con AC)
- **Auth Token**: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **WhatsApp Number (Sandbox)**: `whatsapp:+14155238886`

## Paso 4: Configurar WhatsApp Business (PRODUCCIÓN)
Para uso real necesitas:

1. Ve a Console > Develop > Messaging > Senders > WhatsApp senders
2. Clic en "Request Access" para WhatsApp Business API
3. Necesitarás:
   - Negocio verificado de Facebook
   - Número de teléfono dedicado para WhatsApp Business
   - Aprobación de Facebook (puede tomar días/semanas)

## Paso 5: Actualizar variables de entorno

### Para desarrollo (Sandbox):
```env
# Twilio WhatsApp Sandbox
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token_here"
TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886"
```

### Para producción (WhatsApp Business):
```env
# Twilio WhatsApp Business
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token_here"
TWILIO_WHATSAPP_NUMBER="whatsapp:+52624XXXXXXX" # Tu número de WhatsApp Business
```

## Paso 6: Probar la integración
Una vez configuradas las credenciales:

```bash
curl -X POST http://localhost:3000/api/whatsapp/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+52624135986",
    "message": "¡Bienvenido a TeeReserve Golf! Tu reserva está confirmada.",
    "type": "booking_confirmation"
  }'
```

## Costos de WhatsApp Business:
- **Conversaciones iniciadas por usuario**: Gratis
- **Conversaciones iniciadas por empresa**: ~$0.005 USD por conversación
- **Mensajes de template**: Requeridos para iniciar conversaciones

¡Una vez tengas las credenciales de Twilio, actualiza el archivo .env.local!
