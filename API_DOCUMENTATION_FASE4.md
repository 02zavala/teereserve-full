# API DOCUMENTATION - TEERESERVE FASE 4

## OVERVIEW

TeeReserve Fase 4 expone una API RESTful completa con funcionalidades avanzadas de performance, monitoreo, PWA, integraciones externas y automatización con IA. Todas las APIs están protegidas con autenticación JWT y soportan multi-tenancy.

## BASE URL

```
Production: https://api.teereserve.golf/v1
Staging: https://staging-api.teereserve.golf/v1
Development: http://localhost:3000/api/v1
```

## AUTHENTICATION

### JWT Token
Todas las APIs requieren un token JWT válido en el header:

```http
Authorization: Bearer <jwt_token>
```

### Tenant Identification
Cada request debe incluir el tenant ID:

```http
X-Tenant-ID: <tenant_id>
```

## RATE LIMITING

- **Default:** 1000 requests/hour por IP
- **Authenticated:** 5000 requests/hour por usuario
- **Premium:** 10000 requests/hour por tenant

Headers de respuesta:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## NUEVAS APIS - FASE 4

### 🚀 PERFORMANCE & MONITORING

#### Cache Management

**GET /api/v1/cache/stats**
Obtiene estadísticas del sistema de caché.

```http
GET /api/v1/cache/stats
X-Tenant-ID: tenant_123
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "data": {
    "hitRate": 85.5,
    "totalRequests": 10000,
    "hits": 8550,
    "misses": 1450,
    "avgResponseTime": 12.5,
    "cacheSize": "256MB",
    "evictions": 45
  }
}
```

**DELETE /api/v1/cache/invalidate**
Invalida caché por tags o claves específicas.

```http
DELETE /api/v1/cache/invalidate
Content-Type: application/json
X-Tenant-ID: tenant_123
Authorization: Bearer <token>

{
  "tags": ["field:123", "availability"],
  "keys": ["weather:current:field_123"]
}
```

#### System Monitoring

**GET /api/v1/monitoring/health**
Health check completo del sistema.

```http
GET /api/v1/monitoring/health
X-Tenant-ID: tenant_123
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "uptime": 86400,
    "responseTime": 45,
    "errorRate": 0.1,
    "activeUsers": 150,
    "memoryUsage": 65.5,
    "cpuUsage": 25.3,
    "databaseConnections": 45,
    "cacheHitRate": 85.5,
    "timestamp": 1640995200000
  }
}
```

**GET /api/v1/monitoring/metrics**
Obtiene métricas detalladas del sistema.

```http
GET /api/v1/monitoring/metrics?timeRange=1h&metric=api.response_time
X-Tenant-ID: tenant_123
Authorization: Bearer <token>
```

**POST /api/v1/monitoring/alerts**
Crea una nueva alerta de monitoreo.

```http
POST /api/v1/monitoring/alerts
Content-Type: application/json
X-Tenant-ID: tenant_123
Authorization: Bearer <token>

{
  "name": "High API Response Time",
  "description": "Alert when API response time exceeds 2 seconds",
  "severity": "high",
  "threshold": 2000,
  "metric": "api.response_time",
  "condition": "greater_than"
}
```

### 📱 PWA & OFFLINE

#### PWA Management

**GET /api/v1/pwa/status**
Obtiene el estado de PWA del usuario.

```http
GET /api/v1/pwa/status
X-Tenant-ID: tenant_123
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "data": {
    "isInstalled": true,
    "hasNotificationPermission": true,
    "supportsBackgroundSync": true,
    "serviceWorkerRegistered": true,
    "lastSync": 1640995200000,
    "pendingSync": 0
  }
}
```

**POST /api/v1/pwa/notifications/subscribe**
Suscribe a notificaciones push.

```http
POST /api/v1/pwa/notifications/subscribe
Content-Type: application/json
X-Tenant-ID: tenant_123
Authorization: Bearer <token>

{
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/fcm/send/...",
    "keys": {
      "p256dh": "BNcRd...",
      "auth": "tBHI..."
    }
  }
}
```

#### Offline Sync

**POST /api/v1/sync/queue**
Agrega datos a la cola de sincronización offline.

```http
POST /api/v1/sync/queue
Content-Type: application/json
X-Tenant-ID: tenant_123
Authorization: Bearer <token>

{
  "type": "booking",
  "action": "create",
  "data": {
    "fieldId": "field_123",
    "date": "2024-01-15",
    "timeSlot": "10:00",
    "players": 4
  },
  "priority": "high"
}
```

**GET /api/v1/sync/status**
Obtiene el estado de sincronización.

```http
GET /api/v1/sync/status
X-Tenant-ID: tenant_123
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "data": {
    "isOnline": true,
    "isSyncing": false,
    "pendingCount": 0,
    "lastSyncTime": 1640995200000,
    "failedCount": 0
  }
}
```

### 🔗 EXTERNAL INTEGRATIONS

#### Weather Service

**GET /api/v1/weather/current/{fieldId}**
Obtiene el clima actual para un campo.

```http
GET /api/v1/weather/current/field_123
X-Tenant-ID: tenant_123
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "data": {
    "temperature": 22.5,
    "humidity": 65,
    "windSpeed": 15.2,
    "windDirection": 180,
    "pressure": 1013.25,
    "visibility": 10000,
    "uvIndex": 6,
    "cloudCover": 25,
    "precipitation": 0,
    "condition": "Partly Cloudy",
    "description": "Partly cloudy with light winds",
    "icon": "partly-cloudy-day",
    "timestamp": 1640995200000
  }
}
```

**GET /api/v1/weather/forecast/{fieldId}**
Obtiene el pronóstico del clima.

```http
GET /api/v1/weather/forecast/field_123?days=5
X-Tenant-ID: tenant_123
Authorization: Bearer <token>
```

**GET /api/v1/weather/conditions/{fieldId}**
Evalúa las condiciones de juego.

```http
GET /api/v1/weather/conditions/field_123
X-Tenant-ID: tenant_123
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "data": {
    "playable": true,
    "score": 85,
    "factors": {
      "temperature": 90,
      "precipitation": 100,
      "wind": 80,
      "visibility": 100,
      "overall": 85
    },
    "recommendations": [
      "Excelentes condiciones para jugar",
      "Usar protección solar (UV índice 6)"
    ],
    "alerts": []
  }
}
```

#### Calendar Integration

**GET /api/v1/calendar/providers**
Lista los proveedores de calendario del usuario.

```http
GET /api/v1/calendar/providers
X-Tenant-ID: tenant_123
Authorization: Bearer <token>
```

**POST /api/v1/calendar/providers**
Registra un nuevo proveedor de calendario.

```http
POST /api/v1/calendar/providers
Content-Type: application/json
X-Tenant-ID: tenant_123
Authorization: Bearer <token>

{
  "type": "google",
  "accessToken": "ya29.a0AfH6...",
  "refreshToken": "1//04...",
  "expiresAt": 1640998800000
}
```

**POST /api/v1/calendar/sync/{providerId}**
Sincroniza un proveedor específico.

```http
POST /api/v1/calendar/sync/provider_123
X-Tenant-ID: tenant_123
Authorization: Bearer <token>
```

### 🤖 AI & AUTOMATION

#### AI Pricing

**GET /api/v1/pricing/recommendation**
Obtiene recomendación de precio con IA.

```http
GET /api/v1/pricing/recommendation?fieldId=field_123&date=2024-01-15&timeSlot=10:00
X-Tenant-ID: tenant_123
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "data": {
    "fieldId": "field_123",
    "date": "2024-01-15",
    "timeSlot": "10:00",
    "currentPrice": 120,
    "recommendedPrice": 135,
    "confidence": 85,
    "reasoning": [
      "Alta demanda (85%) - incremento del 20%",
      "Excelente clima (90%) - incremento del 10%",
      "Temporada alta - incremento del 15%"
    ],
    "expectedDemand": 78.5,
    "expectedRevenue": 1058.25,
    "factors": {
      "demand": 85,
      "weather": 90,
      "seasonality": 88,
      "competition": 75,
      "events": 0,
      "historical": 80,
      "dayOfWeek": 85,
      "timeOfDay": 90
    }
  }
}
```

**GET /api/v1/pricing/strategies**
Lista las estrategias de pricing disponibles.

```http
GET /api/v1/pricing/strategies
X-Tenant-ID: tenant_123
Authorization: Bearer <token>
```

**POST /api/v1/pricing/strategies**
Crea una nueva estrategia de pricing.

```http
POST /api/v1/pricing/strategies
Content-Type: application/json
X-Tenant-ID: tenant_123
Authorization: Bearer <token>

{
  "name": "Weekend Premium",
  "description": "Higher prices for weekend peak hours",
  "type": "dynamic",
  "parameters": {
    "minPrice": 80,
    "maxPrice": 250,
    "demandMultiplier": 1.8,
    "weatherWeight": 0.3,
    "updateFrequency": 30
  }
}
```

**PUT /api/v1/pricing/strategies/{strategyId}/activate**
Activa una estrategia de pricing.

```http
PUT /api/v1/pricing/strategies/strategy_123/activate
X-Tenant-ID: tenant_123
Authorization: Bearer <token>
```

#### Demand Prediction

**GET /api/v1/analytics/demand/prediction**
Predice la demanda futura.

```http
GET /api/v1/analytics/demand/prediction?fieldId=field_123&date=2024-01-15&timeSlot=10:00
X-Tenant-ID: tenant_123
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "data": {
    "fieldId": "field_123",
    "date": "2024-01-15",
    "timeSlot": "10:00",
    "predictedDemand": 78.5,
    "confidence": 82,
    "factors": {
      "historical": 75,
      "weather": 85,
      "events": 0,
      "seasonality": 80
    }
  }
}
```

### 🔧 SYSTEM ADMINISTRATION

#### Performance Optimization

**GET /api/v1/admin/performance/report**
Genera reporte de performance.

```http
GET /api/v1/admin/performance/report?timeRange=24h
X-Tenant-ID: tenant_123
Authorization: Bearer <admin_token>
```

**POST /api/v1/admin/performance/optimize**
Ejecuta optimizaciones automáticas.

```http
POST /api/v1/admin/performance/optimize
Content-Type: application/json
X-Tenant-ID: tenant_123
Authorization: Bearer <admin_token>

{
  "targets": ["cache", "database", "images"],
  "aggressive": false
}
```

#### Cache Administration

**GET /api/v1/admin/cache/overview**
Vista general del sistema de caché.

```http
GET /api/v1/admin/cache/overview
Authorization: Bearer <admin_token>
```

**POST /api/v1/admin/cache/flush**
Limpia el caché completamente.

```http
POST /api/v1/admin/cache/flush
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "tenant": "tenant_123",
  "confirm": true
}
```

## ERROR HANDLING

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "fieldId",
      "reason": "Field ID is required"
    },
    "timestamp": 1640995200000,
    "requestId": "req_123456789"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request parameters |
| `UNAUTHORIZED` | 401 | Invalid or missing authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMITED` | 429 | Rate limit exceeded |
| `INTERNAL_ERROR` | 500 | Internal server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

## WEBHOOKS

### Configuration

```http
POST /api/v1/webhooks
Content-Type: application/json
X-Tenant-ID: tenant_123
Authorization: Bearer <token>

{
  "url": "https://your-app.com/webhooks/teereserve",
  "events": ["booking.created", "payment.completed", "weather.alert"],
  "secret": "your_webhook_secret"
}
```

### Event Types

- `booking.created` - Nueva reserva creada
- `booking.updated` - Reserva actualizada
- `booking.cancelled` - Reserva cancelada
- `payment.completed` - Pago completado
- `payment.failed` - Pago fallido
- `weather.alert` - Alerta meteorológica
- `system.alert` - Alerta del sistema
- `pricing.updated` - Precio actualizado

### Webhook Payload

```json
{
  "id": "evt_123456789",
  "type": "booking.created",
  "tenant": "tenant_123",
  "timestamp": 1640995200000,
  "data": {
    "bookingId": "booking_123",
    "fieldId": "field_123",
    "userId": "user_123",
    "date": "2024-01-15",
    "timeSlot": "10:00",
    "players": 4,
    "amount": 135.00
  }
}
```

## SDK & LIBRARIES

### JavaScript/TypeScript SDK

```bash
npm install @teereserve/sdk
```

```typescript
import { TeeReserveClient } from '@teereserve/sdk';

const client = new TeeReserveClient({
  apiKey: 'your_api_key',
  tenantId: 'tenant_123',
  environment: 'production'
});

// Obtener recomendación de precio
const pricing = await client.pricing.getRecommendation({
  fieldId: 'field_123',
  date: '2024-01-15',
  timeSlot: '10:00'
});

// Obtener clima actual
const weather = await client.weather.getCurrent('field_123');

// Crear reserva
const booking = await client.bookings.create({
  fieldId: 'field_123',
  date: '2024-01-15',
  timeSlot: '10:00',
  players: 4
});
```

### Python SDK

```bash
pip install teereserve-sdk
```

```python
from teereserve import TeeReserveClient

client = TeeReserveClient(
    api_key='your_api_key',
    tenant_id='tenant_123',
    environment='production'
)

# Obtener recomendación de precio
pricing = client.pricing.get_recommendation(
    field_id='field_123',
    date='2024-01-15',
    time_slot='10:00'
)

# Obtener clima actual
weather = client.weather.get_current('field_123')
```

## TESTING

### Test Environment

```
Base URL: https://api-test.teereserve.golf/v1
API Key: test_key_123456789
```

### Sample Requests

```bash
# Health check
curl -X GET "https://api-test.teereserve.golf/v1/monitoring/health" \
  -H "Authorization: Bearer test_token" \
  -H "X-Tenant-ID: test_tenant"

# Get weather
curl -X GET "https://api-test.teereserve.golf/v1/weather/current/test_field" \
  -H "Authorization: Bearer test_token" \
  -H "X-Tenant-ID: test_tenant"

# Get pricing recommendation
curl -X GET "https://api-test.teereserve.golf/v1/pricing/recommendation?fieldId=test_field&date=2024-01-15&timeSlot=10:00" \
  -H "Authorization: Bearer test_token" \
  -H "X-Tenant-ID: test_tenant"
```

## CHANGELOG

### v4.0.0 (Fase 4)
- ✅ Added performance monitoring APIs
- ✅ Added PWA management APIs
- ✅ Added offline sync APIs
- ✅ Added weather integration APIs
- ✅ Added calendar sync APIs
- ✅ Added AI pricing APIs
- ✅ Added demand prediction APIs
- ✅ Enhanced error handling
- ✅ Added webhook support
- ✅ Added rate limiting
- ✅ Improved documentation

### v3.0.0 (Fase 3)
- Added advanced notifications
- Added analytics and reporting
- Added billing and payments
- Added communication system
- Added marketing automation

Esta documentación cubre todas las nuevas APIs implementadas en la Fase 4. Para APIs de fases anteriores, consulta la documentación específica de cada versión.

