import { getTenantId } from './tenant';
import { googleMapsAPI } from './external-integrations/api-gateway';
import { cacheService } from './cache-service';
import { monitoringService } from './monitoring-service';

// Tipos para sincronización de calendarios
export interface CalendarProvider {
  id: string;
  name: string;
  type: 'google' | 'outlook' | 'apple' | 'exchange';
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  userId: string;
  tenant: string;
  isActive: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  attendees?: string[];
  reminders?: CalendarReminder[];
  recurrence?: CalendarRecurrence;
  status: 'confirmed' | 'tentative' | 'cancelled';
  source: 'teereserve' | 'external';
  externalId?: string;
  providerId?: string;
  bookingId?: string;
  tenant: string;
}

export interface CalendarReminder {
  method: 'email' | 'popup' | 'sms';
  minutes: number;
}

export interface CalendarRecurrence {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  endDate?: Date;
  count?: number;
  daysOfWeek?: number[];
}

export interface SyncResult {
  success: boolean;
  eventsCreated: number;
  eventsUpdated: number;
  eventsDeleted: number;
  errors: string[];
}

export interface ConflictEvent {
  teereserveEvent: CalendarEvent;
  externalEvent: CalendarEvent;
  conflictType: 'time_overlap' | 'duplicate' | 'modified';
  resolution?: 'keep_teereserve' | 'keep_external' | 'merge' | 'manual';
}

// Clase principal para sincronización de calendarios
export class CalendarSyncService {
  private static instance: CalendarSyncService;
  private providers: Map<string, CalendarProvider> = new Map();
  private syncIntervals: Map<string, NodeJS.Timeout> = new Map();
  private conflictResolvers: Map<string, Function> = new Map();

  private constructor() {
    this.initializeService();
  }

  public static getInstance(): CalendarSyncService {
    if (!CalendarSyncService.instance) {
      CalendarSyncService.instance = new CalendarSyncService();
    }
    return CalendarSyncService.instance;
  }

  private initializeService(): void {
    // Cargar proveedores guardados
    this.loadProviders();
    
    // Configurar sincronización automática cada 15 minutos
    setInterval(() => {
      this.syncAllProviders();
    }, 15 * 60 * 1000);
  }

  // Cargar proveedores desde la base de datos
  private async loadProviders(): Promise<void> {
    try {
      // Aquí se cargarían los proveedores desde la base de datos
      // Por ahora simulamos con datos de ejemplo
      console.log('Loading calendar providers...');
    } catch (error) {
      console.error('Error loading calendar providers:', error);
    }
  }

  // Registrar proveedor de calendario
  async registerProvider(provider: Omit<CalendarProvider, 'id'>): Promise<string> {
    const id = `${provider.type}_${provider.userId}_${Date.now()}`;
    const fullProvider: CalendarProvider = {
      ...provider,
      id,
    };

    const key = `${provider.tenant}:${provider.userId}:${provider.type}`;
    this.providers.set(key, fullProvider);

    // Guardar en base de datos
    await this.saveProvider(fullProvider);

    // Iniciar sincronización automática
    this.startAutoSync(fullProvider);

    console.log(`Calendar provider registered: ${provider.type} for user ${provider.userId}`);
    return id;
  }

  // Guardar proveedor en base de datos
  private async saveProvider(provider: CalendarProvider): Promise<void> {
    try {
      // Aquí se guardaría en la base de datos
      // await prisma.calendarProvider.upsert({...})
      console.log(`Saving provider: ${provider.id}`);
    } catch (error) {
      console.error('Error saving calendar provider:', error);
    }
  }

  // Iniciar sincronización automática
  private startAutoSync(provider: CalendarProvider): void {
    const key = `${provider.tenant}:${provider.userId}:${provider.type}`;
    
    // Limpiar intervalo existente si existe
    const existingInterval = this.syncIntervals.get(key);
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    // Configurar nuevo intervalo
    const interval = setInterval(() => {
      this.syncProvider(provider);
    }, 30 * 60 * 1000); // Cada 30 minutos

    this.syncIntervals.set(key, interval);
  }

  // Sincronizar proveedor específico
  async syncProvider(provider: CalendarProvider): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      eventsCreated: 0,
      eventsUpdated: 0,
      eventsDeleted: 0,
      errors: [],
    };

    try {
      console.log(`Syncing calendar provider: ${provider.type} for user ${provider.userId}`);

      // Verificar token de acceso
      if (await this.isTokenExpired(provider)) {
        const refreshed = await this.refreshAccessToken(provider);
        if (!refreshed) {
          result.errors.push('Failed to refresh access token');
          return result;
        }
      }

      // Obtener eventos de TeeReserve
      const teereserveEvents = await this.getTeeReserveEvents(provider.userId, provider.tenant);
      
      // Obtener eventos del proveedor externo
      const externalEvents = await this.getExternalEvents(provider);

      // Detectar conflictos
      const conflicts = this.detectConflicts(teereserveEvents, externalEvents);
      
      if (conflicts.length > 0) {
        await this.resolveConflicts(conflicts, provider);
      }

      // Sincronizar eventos de TeeReserve al calendario externo
      const syncToExternal = await this.syncToExternalCalendar(teereserveEvents, provider);
      result.eventsCreated += syncToExternal.created;
      result.eventsUpdated += syncToExternal.updated;
      result.eventsDeleted += syncToExternal.deleted;
      result.errors.push(...syncToExternal.errors);

      // Sincronizar eventos externos a TeeReserve (opcional)
      if (provider.type === 'google') {
        const syncToTeeReserve = await this.syncToTeeReserve(externalEvents, provider);
        result.errors.push(...syncToTeeReserve.errors);
      }

      result.success = result.errors.length === 0;

      // Registrar métricas
      monitoringService.recordMetric('calendar.sync_completed', 1, {
        provider: provider.type,
        user: provider.userId,
        success: result.success.toString(),
      }, provider.tenant);

      return result;
    } catch (error) {
      console.error(`Error syncing calendar provider ${provider.id}:`, error);
      result.errors.push((error as Error).message);
      
      monitoringService.recordMetric('calendar.sync_error', 1, {
        provider: provider.type,
        user: provider.userId,
        error: (error as Error).message,
      }, provider.tenant);

      return result;
    }
  }

  // Verificar si el token ha expirado
  private async isTokenExpired(provider: CalendarProvider): Promise<boolean> {
    if (!provider.expiresAt) return false;
    return Date.now() >= provider.expiresAt;
  }

  // Refrescar token de acceso
  private async refreshAccessToken(provider: CalendarProvider): Promise<boolean> {
    try {
      switch (provider.type) {
        case 'google':
          return await this.refreshGoogleToken(provider);
        case 'outlook':
          return await this.refreshOutlookToken(provider);
        default:
          return false;
      }
    } catch (error) {
      console.error('Error refreshing access token:', error);
      return false;
    }
  }

  // Refrescar token de Google
  private async refreshGoogleToken(provider: CalendarProvider): Promise<boolean> {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID || '',
          client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
          refresh_token: provider.refreshToken || '',
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Actualizar proveedor
      provider.accessToken = data.access_token;
      provider.expiresAt = Date.now() + (data.expires_in * 1000);
      
      await this.saveProvider(provider);
      return true;
    } catch (error) {
      console.error('Error refreshing Google token:', error);
      return false;
    }
  }

  // Refrescar token de Outlook
  private async refreshOutlookToken(provider: CalendarProvider): Promise<boolean> {
    try {
      const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.OUTLOOK_CLIENT_ID || '',
          client_secret: process.env.OUTLOOK_CLIENT_SECRET || '',
          refresh_token: provider.refreshToken || '',
          grant_type: 'refresh_token',
          scope: 'https://graph.microsoft.com/calendars.readwrite',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Actualizar proveedor
      provider.accessToken = data.access_token;
      provider.expiresAt = Date.now() + (data.expires_in * 1000);
      
      await this.saveProvider(provider);
      return true;
    } catch (error) {
      console.error('Error refreshing Outlook token:', error);
      return false;
    }
  }

  // Obtener eventos de TeeReserve
  private async getTeeReserveEvents(userId: string, tenant: string): Promise<CalendarEvent[]> {
    try {
      // Aquí se obtendrían las reservas del usuario desde la base de datos
      // y se convertirían a eventos de calendario
      
      // Simulación de datos
      return [];
    } catch (error) {
      console.error('Error getting TeeReserve events:', error);
      return [];
    }
  }

  // Obtener eventos del calendario externo
  private async getExternalEvents(provider: CalendarProvider): Promise<CalendarEvent[]> {
    try {
      switch (provider.type) {
        case 'google':
          return await this.getGoogleEvents(provider);
        case 'outlook':
          return await this.getOutlookEvents(provider);
        default:
          return [];
      }
    } catch (error) {
      console.error('Error getting external events:', error);
      return [];
    }
  }

  // Obtener eventos de Google Calendar
  private async getGoogleEvents(provider: CalendarProvider): Promise<CalendarEvent[]> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${new Date().toISOString()}`,
        {
          headers: {
            'Authorization': `Bearer ${provider.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.items.map((item: any) => this.parseGoogleEvent(item, provider));
    } catch (error) {
      console.error('Error getting Google events:', error);
      return [];
    }
  }

  // Obtener eventos de Outlook
  private async getOutlookEvents(provider: CalendarProvider): Promise<CalendarEvent[]> {
    try {
      const response = await fetch(
        'https://graph.microsoft.com/v1.0/me/events?$filter=start/dateTime ge \'' + new Date().toISOString() + '\'',
        {
          headers: {
            'Authorization': `Bearer ${provider.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.value.map((item: any) => this.parseOutlookEvent(item, provider));
    } catch (error) {
      console.error('Error getting Outlook events:', error);
      return [];
    }
  }

  // Parsear evento de Google
  private parseGoogleEvent(item: any, provider: CalendarProvider): CalendarEvent {
    return {
      id: `google_${item.id}`,
      title: item.summary || 'Sin título',
      description: item.description,
      startTime: new Date(item.start.dateTime || item.start.date),
      endTime: new Date(item.end.dateTime || item.end.date),
      location: item.location,
      attendees: item.attendees?.map((a: any) => a.email) || [],
      status: item.status === 'cancelled' ? 'cancelled' : 'confirmed',
      source: 'external',
      externalId: item.id,
      providerId: provider.id,
      tenant: provider.tenant,
    };
  }

  // Parsear evento de Outlook
  private parseOutlookEvent(item: any, provider: CalendarProvider): CalendarEvent {
    return {
      id: `outlook_${item.id}`,
      title: item.subject || 'Sin título',
      description: item.body?.content,
      startTime: new Date(item.start.dateTime),
      endTime: new Date(item.end.dateTime),
      location: item.location?.displayName,
      attendees: item.attendees?.map((a: any) => a.emailAddress.address) || [],
      status: item.isCancelled ? 'cancelled' : 'confirmed',
      source: 'external',
      externalId: item.id,
      providerId: provider.id,
      tenant: provider.tenant,
    };
  }

  // Detectar conflictos
  private detectConflicts(teereserveEvents: CalendarEvent[], externalEvents: CalendarEvent[]): ConflictEvent[] {
    const conflicts: ConflictEvent[] = [];

    for (const trEvent of teereserveEvents) {
      for (const extEvent of externalEvents) {
        // Verificar solapamiento de tiempo
        if (this.eventsOverlap(trEvent, extEvent)) {
          conflicts.push({
            teereserveEvent: trEvent,
            externalEvent: extEvent,
            conflictType: 'time_overlap',
          });
        }
      }
    }

    return conflicts;
  }

  // Verificar si dos eventos se solapan
  private eventsOverlap(event1: CalendarEvent, event2: CalendarEvent): boolean {
    return event1.startTime < event2.endTime && event2.startTime < event1.endTime;
  }

  // Resolver conflictos
  private async resolveConflicts(conflicts: ConflictEvent[], provider: CalendarProvider): Promise<void> {
    for (const conflict of conflicts) {
      try {
        const resolver = this.conflictResolvers.get(provider.type);
        if (resolver) {
          await resolver(conflict, provider);
        } else {
          // Resolución por defecto: mantener evento de TeeReserve
          conflict.resolution = 'keep_teereserve';
        }
      } catch (error) {
        console.error('Error resolving conflict:', error);
      }
    }
  }

  // Sincronizar a calendario externo
  private async syncToExternalCalendar(events: CalendarEvent[], provider: CalendarProvider): Promise<{
    created: number;
    updated: number;
    deleted: number;
    errors: string[];
  }> {
    const result = { created: 0, updated: 0, deleted: 0, errors: [] };

    for (const event of events) {
      try {
        switch (provider.type) {
          case 'google':
            await this.createGoogleEvent(event, provider);
            result.created++;
            break;
          case 'outlook':
            await this.createOutlookEvent(event, provider);
            result.created++;
            break;
        }
      } catch (error) {
        result.errors.push(`Error syncing event ${event.id}: ${(error as Error).message}`);
      }
    }

    return result;
  }

  // Crear evento en Google Calendar
  private async createGoogleEvent(event: CalendarEvent, provider: CalendarProvider): Promise<void> {
    const googleEvent = {
      summary: event.title,
      description: event.description,
      start: {
        dateTime: event.startTime.toISOString(),
        timeZone: 'America/Mexico_City',
      },
      end: {
        dateTime: event.endTime.toISOString(),
        timeZone: 'America/Mexico_City',
      },
      location: event.location,
      attendees: event.attendees?.map(email => ({ email })),
      reminders: {
        useDefault: false,
        overrides: event.reminders?.map(r => ({
          method: r.method,
          minutes: r.minutes,
        })) || [{ method: 'email', minutes: 30 }],
      },
    };

    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(googleEvent),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  // Crear evento en Outlook
  private async createOutlookEvent(event: CalendarEvent, provider: CalendarProvider): Promise<void> {
    const outlookEvent = {
      subject: event.title,
      body: {
        contentType: 'HTML',
        content: event.description || '',
      },
      start: {
        dateTime: event.startTime.toISOString(),
        timeZone: 'America/Mexico_City',
      },
      end: {
        dateTime: event.endTime.toISOString(),
        timeZone: 'America/Mexico_City',
      },
      location: {
        displayName: event.location || '',
      },
      attendees: event.attendees?.map(email => ({
        emailAddress: { address: email, name: email },
      })),
    };

    const response = await fetch('https://graph.microsoft.com/v1.0/me/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(outlookEvent),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  // Sincronizar a TeeReserve
  private async syncToTeeReserve(events: CalendarEvent[], provider: CalendarProvider): Promise<{
    errors: string[];
  }> {
    const result = { errors: [] };

    // Aquí se implementaría la lógica para crear reservas en TeeReserve
    // basadas en eventos del calendario externo

    return result;
  }

  // Sincronizar todos los proveedores
  private async syncAllProviders(): Promise<void> {
    console.log('Starting sync for all calendar providers...');
    
    for (const [key, provider] of this.providers.entries()) {
      if (provider.isActive) {
        try {
          await this.syncProvider(provider);
        } catch (error) {
          console.error(`Error syncing provider ${provider.id}:`, error);
        }
      }
    }
  }

  // Configurar resolver de conflictos
  setConflictResolver(providerType: string, resolver: Function): void {
    this.conflictResolvers.set(providerType, resolver);
  }

  // Obtener proveedores de un usuario
  getUserProviders(userId: string, tenant?: string): CalendarProvider[] {
    const tenantId = tenant || getTenantId();
    return Array.from(this.providers.values()).filter(
      provider => provider.userId === userId && provider.tenant === tenantId
    );
  }

  // Desactivar proveedor
  async deactivateProvider(providerId: string): Promise<boolean> {
    try {
      const provider = Array.from(this.providers.values()).find(p => p.id === providerId);
      if (!provider) return false;

      provider.isActive = false;
      await this.saveProvider(provider);

      // Detener sincronización automática
      const key = `${provider.tenant}:${provider.userId}:${provider.type}`;
      const interval = this.syncIntervals.get(key);
      if (interval) {
        clearInterval(interval);
        this.syncIntervals.delete(key);
      }

      return true;
    } catch (error) {
      console.error('Error deactivating provider:', error);
      return false;
    }
  }

  // Obtener estadísticas del servicio
  getServiceStats(tenant?: string): any {
    const tenantId = tenant || getTenantId();
    const providersForTenant = Array.from(this.providers.values())
      .filter(provider => provider.tenant === tenantId);

    return {
      totalProviders: providersForTenant.length,
      activeProviders: providersForTenant.filter(p => p.isActive).length,
      providersByType: providersForTenant.reduce((acc, provider) => {
        acc[provider.type] = (acc[provider.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      lastSync: Date.now(),
    };
  }
}

// Exportar instancia
export const calendarSyncService = CalendarSyncService.getInstance();

