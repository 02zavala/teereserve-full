// Sistema de Email Marketing Automatizado para TeeReserve Golf
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 'demo-key');

export interface EmailUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  preferences: UserEmailPreferences;
  segments: string[];
  lastActivity: Date;
  registrationDate: Date;
  totalBookings: number;
  averageSpend: number;
  favoriteLocations: string[];
}

export interface UserEmailPreferences {
  welcomeEmails: boolean;
  bookingReminders: boolean;
  promotionalOffers: boolean;
  newsletter: boolean;
  courseUpdates: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  preferredTime: 'morning' | 'afternoon' | 'evening';
}

export interface EmailCampaign {
  id: string;
  name: string;
  type: 'welcome' | 'reminder' | 'promotional' | 'newsletter' | 'reactivation';
  status: 'draft' | 'active' | 'paused' | 'completed';
  subject: string;
  template: string;
  targetSegments: string[];
  scheduledDate?: Date;
  triggerConditions?: any;
  analytics: CampaignAnalytics;
}

export interface CampaignAnalytics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  conversions: number;
  revenue: number;
}

export interface EmailTemplate {
  id: string;
  name: string;
  type: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
  previewText: string;
}

export class EmailMarketingEngine {
  private static instance: EmailMarketingEngine;
  
  public static getInstance(): EmailMarketingEngine {
    if (!EmailMarketingEngine.instance) {
      EmailMarketingEngine.instance = new EmailMarketingEngine();
    }
    return EmailMarketingEngine.instance;
  }

  /**
   * Envía email de bienvenida a nuevos usuarios
   */
  async sendWelcomeEmail(user: EmailUser): Promise<boolean> {
    try {
      if (!user.preferences.welcomeEmails) {
        return false;
      }

      const emailData = {
        from: 'TeeReserve Golf <welcome@teereserve.golf>',
        to: [user.email],
        subject: `¡Bienvenido a TeeReserve Golf, ${user.firstName}! 🏌️‍♂️`,
        html: this.generateWelcomeEmailHTML(user),
        text: this.generateWelcomeEmailText(user),
      };

      // En modo demo, simular envío
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Email de bienvenida enviado (DEMO):', emailData);
        await this.logEmailActivity(user.id, 'welcome', 'sent');
        return true;
      }

      const result = await resend.emails.send(emailData);
      await this.logEmailActivity(user.id, 'welcome', 'sent', result.data?.id);
      
      return true;
    } catch (error) {
      console.error('Error enviando email de bienvenida:', error);
      await this.logEmailActivity(user.id, 'welcome', 'failed');
      return false;
    }
  }

  /**
   * Envía recordatorio de reserva
   */
  async sendBookingReminder(user: EmailUser, booking: any): Promise<boolean> {
    try {
      if (!user.preferences.bookingReminders) {
        return false;
      }

      const emailData = {
        from: 'TeeReserve Golf <reservas@teereserve.golf>',
        to: [user.email],
        subject: `Recordatorio: Tu tee time en ${booking.courseName} mañana`,
        html: this.generateBookingReminderHTML(user, booking),
        text: this.generateBookingReminderText(user, booking),
      };

      // En modo demo, simular envío
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Recordatorio de reserva enviado (DEMO):', emailData);
        await this.logEmailActivity(user.id, 'reminder', 'sent');
        return true;
      }

      const result = await resend.emails.send(emailData);
      await this.logEmailActivity(user.id, 'reminder', 'sent', result.data?.id);
      
      return true;
    } catch (error) {
      console.error('Error enviando recordatorio:', error);
      await this.logEmailActivity(user.id, 'reminder', 'failed');
      return false;
    }
  }

  /**
   * Envía ofertas promocionales personalizadas
   */
  async sendPromotionalOffer(user: EmailUser, offer: any): Promise<boolean> {
    try {
      if (!user.preferences.promotionalOffers) {
        return false;
      }

      const personalizedOffer = this.personalizeOffer(user, offer);
      
      const emailData = {
        from: 'TeeReserve Golf <ofertas@teereserve.golf>',
        to: [user.email],
        subject: `${user.firstName}, oferta especial: ${personalizedOffer.title}`,
        html: this.generatePromotionalEmailHTML(user, personalizedOffer),
        text: this.generatePromotionalEmailText(user, personalizedOffer),
      };

      // En modo demo, simular envío
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Oferta promocional enviada (DEMO):', emailData);
        await this.logEmailActivity(user.id, 'promotional', 'sent');
        return true;
      }

      const result = await resend.emails.send(emailData);
      await this.logEmailActivity(user.id, 'promotional', 'sent', result.data?.id);
      
      return true;
    } catch (error) {
      console.error('Error enviando oferta promocional:', error);
      await this.logEmailActivity(user.id, 'promotional', 'failed');
      return false;
    }
  }

  /**
   * Envía newsletter semanal
   */
  async sendNewsletter(users: EmailUser[], content: any): Promise<number> {
    let successCount = 0;
    
    for (const user of users) {
      try {
        if (!user.preferences.newsletter) {
          continue;
        }

        const personalizedContent = this.personalizeNewsletter(user, content);
        
        const emailData = {
          from: 'TeeReserve Golf <newsletter@teereserve.golf>',
          to: [user.email],
          subject: `TeeReserve Weekly: ${content.title}`,
          html: this.generateNewsletterHTML(user, personalizedContent),
          text: this.generateNewsletterText(user, personalizedContent),
        };

        // En modo demo, simular envío
        if (process.env.NODE_ENV === 'development') {
          console.log('📧 Newsletter enviado (DEMO):', { email: user.email, subject: emailData.subject });
          await this.logEmailActivity(user.id, 'newsletter', 'sent');
          successCount++;
          continue;
        }

        const result = await resend.emails.send(emailData);
        await this.logEmailActivity(user.id, 'newsletter', 'sent', result.data?.id);
        successCount++;
        
        // Delay para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`Error enviando newsletter a ${user.email}:`, error);
        await this.logEmailActivity(user.id, 'newsletter', 'failed');
      }
    }
    
    return successCount;
  }

  /**
   * Segmenta usuarios para campañas dirigidas
   */
  segmentUsers(users: EmailUser[]): Record<string, EmailUser[]> {
    const segments: Record<string, EmailUser[]> = {
      new_users: [],
      active_users: [],
      inactive_users: [],
      high_value: [],
      frequent_players: [],
      premium_locations: [],
      budget_conscious: [],
    };

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    users.forEach(user => {
      // Usuarios nuevos (registrados en los últimos 7 días)
      if (user.registrationDate > sevenDaysAgo) {
        segments.new_users.push(user);
      }

      // Usuarios activos (actividad en los últimos 30 días)
      if (user.lastActivity > thirtyDaysAgo) {
        segments.active_users.push(user);
      } else {
        segments.inactive_users.push(user);
      }

      // Alto valor (gasto promedio > $200)
      if (user.averageSpend > 200) {
        segments.high_value.push(user);
      }

      // Jugadores frecuentes (más de 5 reservas)
      if (user.totalBookings > 5) {
        segments.frequent_players.push(user);
      }

      // Ubicaciones premium (Los Cabos, Cancún)
      if (user.favoriteLocations.some(loc => 
        loc.includes('Los Cabos') || loc.includes('Cancún')
      )) {
        segments.premium_locations.push(user);
      }

      // Conscientes del presupuesto (gasto promedio < $150)
      if (user.averageSpend < 150) {
        segments.budget_conscious.push(user);
      }
    });

    return segments;
  }

  /**
   * Personaliza ofertas según el perfil del usuario
   */
  private personalizeOffer(user: EmailUser, baseOffer: any): any {
    const personalizedOffer = { ...baseOffer };

    // Personalizar según gasto promedio
    if (user.averageSpend > 200) {
      personalizedOffer.discount = Math.min(baseOffer.discount + 5, 25);
      personalizedOffer.title = `Oferta Premium: ${personalizedOffer.title}`;
    } else if (user.averageSpend < 100) {
      personalizedOffer.title = `Oferta Especial: ${personalizedOffer.title}`;
    }

    // Personalizar según ubicaciones favoritas
    if (user.favoriteLocations.length > 0) {
      personalizedOffer.recommendedCourses = personalizedOffer.courses.filter((course: any) =>
        user.favoriteLocations.some(loc => course.location.includes(loc))
      );
    }

    // Personalizar según frecuencia
    if (user.totalBookings > 10) {
      personalizedOffer.loyaltyBonus = true;
      personalizedOffer.title = `VIP: ${personalizedOffer.title}`;
    }

    return personalizedOffer;
  }

  /**
   * Personaliza newsletter según el usuario
   */
  private personalizeNewsletter(user: EmailUser, content: any): any {
    const personalized = { ...content };

    // Agregar recomendaciones personalizadas
    if (user.favoriteLocations.length > 0) {
      personalized.recommendedCourses = content.featuredCourses.filter((course: any) =>
        user.favoriteLocations.some(loc => course.location.includes(loc))
      );
    }

    // Agregar tips según nivel de actividad
    if (user.totalBookings > 5) {
      personalized.tips = content.advancedTips;
    } else {
      personalized.tips = content.beginnerTips;
    }

    return personalized;
  }

  /**
   * Genera HTML para email de bienvenida
   */
  private generateWelcomeEmailHTML(user: EmailUser): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bienvenido a TeeReserve Golf</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #1a5d42 0%, #2d7a5a 100%); color: white; padding: 40px 20px; text-align: center; }
        .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .content { padding: 40px 20px; }
        .welcome-message { font-size: 18px; color: #333; margin-bottom: 30px; }
        .features { margin: 30px 0; }
        .feature { display: flex; align-items: center; margin: 15px 0; }
        .feature-icon { width: 40px; height: 40px; background: #1a5d42; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; color: white; font-size: 18px; }
        .cta-button { background: #D4AF37; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; margin: 20px 0; }
        .footer { background: #f8f8f8; padding: 20px; text-align: center; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🏌️ TeeReserve Golf</div>
          <p>Donde cada tee time es una experiencia premium</p>
        </div>
        
        <div class="content">
          <h1>¡Bienvenido, ${user.firstName}!</h1>
          
          <div class="welcome-message">
            Nos emociona tenerte como parte de la comunidad TeeReserve Golf. Estás a punto de descubrir una nueva forma de vivir el golf en México.
          </div>
          
          <div class="features">
            <div class="feature">
              <div class="feature-icon">⚡</div>
              <div>
                <strong>Reservas Instantáneas</strong><br>
                Confirma tu tee time en tiempo real sin esperas
              </div>
            </div>
            
            <div class="feature">
              <div class="feature-icon">🤖</div>
              <div>
                <strong>Recomendaciones IA</strong><br>
                Descubre campos perfectos para ti con nuestro sistema inteligente
              </div>
            </div>
            
            <div class="feature">
              <div class="feature-icon">💳</div>
              <div>
                <strong>Pagos Seguros</strong><br>
                Paga de forma segura con Stripe y todas las tarjetas
              </div>
            </div>
          </div>
          
          <a href="https://teereserve.golf/courses" class="cta-button">
            Explorar Campos de Golf
          </a>
          
          <p>¿Necesitas ayuda? Nuestro equipo está aquí para ti. Responde a este email o contáctanos por WhatsApp.</p>
        </div>
        
        <div class="footer">
          <p>TeeReserve Golf - La revolución digital del golf mexicano</p>
          <p>Si no deseas recibir estos emails, <a href="#">haz clic aquí</a></p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Genera texto plano para email de bienvenida
   */
  private generateWelcomeEmailText(user: EmailUser): string {
    return `
¡Bienvenido a TeeReserve Golf, ${user.firstName}!

Nos emociona tenerte como parte de nuestra comunidad. Estás a punto de descubrir una nueva forma de vivir el golf en México.

Con TeeReserve Golf puedes:
• Hacer reservas instantáneas en tiempo real
• Recibir recomendaciones personalizadas con IA
• Pagar de forma segura con cualquier tarjeta
• Acceder a los mejores campos de México

Explora nuestros campos: https://teereserve.golf/courses

¿Necesitas ayuda? Responde a este email o contáctanos por WhatsApp.

TeeReserve Golf - Donde cada tee time es una experiencia premium
    `;
  }

  /**
   * Genera HTML para recordatorio de reserva
   */
  private generateBookingReminderHTML(user: EmailUser, booking: any): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recordatorio de Reserva</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #1a5d42 0%, #2d7a5a 100%); color: white; padding: 30px 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .booking-card { background: #f8f9fa; border-left: 4px solid #D4AF37; padding: 20px; margin: 20px 0; }
        .booking-detail { margin: 10px 0; }
        .label { font-weight: bold; color: #1a5d42; }
        .weather-info { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .cta-button { background: #D4AF37; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; }
        .footer { background: #f8f8f8; padding: 20px; text-align: center; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏌️ Recordatorio de Tee Time</h1>
          <p>Tu reserva es mañana</p>
        </div>
        
        <div class="content">
          <p>Hola ${user.firstName},</p>
          
          <p>Te recordamos que tienes una reserva confirmada para mañana. ¡Esperamos que disfrutes tu ronda!</p>
          
          <div class="booking-card">
            <h3>Detalles de tu Reserva</h3>
            <div class="booking-detail">
              <span class="label">Campo:</span> ${booking.courseName}
            </div>
            <div class="booking-detail">
              <span class="label">Fecha:</span> ${booking.date}
            </div>
            <div class="booking-detail">
              <span class="label">Hora:</span> ${booking.time}
            </div>
            <div class="booking-detail">
              <span class="label">Jugadores:</span> ${booking.players}
            </div>
            <div class="booking-detail">
              <span class="label">Código de Reserva:</span> ${booking.confirmationCode}
            </div>
          </div>
          
          <div class="weather-info">
            <h4>🌤️ Pronóstico del Clima</h4>
            <p>Mañana: Soleado, 28°C - Condiciones perfectas para golf</p>
          </div>
          
          <h4>Recomendaciones para tu Ronda:</h4>
          <ul>
            <li>Llega 30 minutos antes para el check-in</li>
            <li>Trae protector solar y suficiente agua</li>
            <li>Confirma el dress code del campo</li>
            <li>Revisa las reglas locales del campo</li>
          </ul>
          
          <a href="https://teereserve.golf/booking/${booking.id}" class="cta-button">
            Ver Detalles de Reserva
          </a>
          
          <p>¡Que tengas una excelente ronda!</p>
        </div>
        
        <div class="footer">
          <p>TeeReserve Golf - Tu compañero de golf de confianza</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Genera texto plano para recordatorio
   */
  private generateBookingReminderText(user: EmailUser, booking: any): string {
    return `
Recordatorio de Tee Time - TeeReserve Golf

Hola ${user.firstName},

Te recordamos que tienes una reserva confirmada para mañana:

Campo: ${booking.courseName}
Fecha: ${booking.date}
Hora: ${booking.time}
Jugadores: ${booking.players}
Código: ${booking.confirmationCode}

Pronóstico: Soleado, 28°C - Condiciones perfectas para golf

Recomendaciones:
• Llega 30 minutos antes
• Trae protector solar y agua
• Confirma el dress code
• Revisa las reglas locales

Ver detalles: https://teereserve.golf/booking/${booking.id}

¡Que tengas una excelente ronda!

TeeReserve Golf
    `;
  }

  /**
   * Genera HTML para ofertas promocionales
   */
  private generatePromotionalEmailHTML(user: EmailUser, offer: any): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Oferta Especial</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #D4AF37 0%, #B8941F 100%); color: white; padding: 40px 20px; text-align: center; }
        .offer-badge { background: rgba(255,255,255,0.2); padding: 10px 20px; border-radius: 25px; display: inline-block; margin-bottom: 20px; }
        .content { padding: 30px 20px; }
        .offer-highlight { background: #fff3cd; border: 2px solid #D4AF37; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0; }
        .discount { font-size: 36px; font-weight: bold; color: #D4AF37; }
        .course-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
        .course-card { border: 1px solid #ddd; border-radius: 8px; padding: 15px; }
        .cta-button { background: #D4AF37; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 18px; }
        .urgency { color: #dc3545; font-weight: bold; }
        .footer { background: #f8f8f8; padding: 20px; text-align: center; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="offer-badge">🎯 OFERTA LIMITADA</div>
          <h1>${offer.title}</h1>
          <p>Exclusivo para ti, ${user.firstName}</p>
        </div>
        
        <div class="content">
          <div class="offer-highlight">
            <div class="discount">${offer.discount}% OFF</div>
            <p>En tu próxima reserva</p>
            <p class="urgency">⏰ Válido hasta ${offer.expiryDate}</p>
          </div>
          
          <p>Hemos seleccionado esta oferta especialmente para ti basándonos en tus preferencias de golf.</p>
          
          ${offer.recommendedCourses ? `
          <h3>Campos Recomendados para Ti:</h3>
          <div class="course-grid">
            ${offer.recommendedCourses.map((course: any) => `
            <div class="course-card">
              <h4>${course.name}</h4>
              <p>📍 ${course.location}</p>
              <p>⭐ ${course.rating} • $${course.price}</p>
            </div>
            `).join('')}
          </div>
          ` : ''}
          
          ${offer.loyaltyBonus ? `
          <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4>🏆 Bonus VIP</h4>
            <p>Como cliente frecuente, recibes beneficios adicionales:</p>
            <ul>
              <li>Check-in prioritario</li>
              <li>Upgrade gratuito de cart</li>
              <li>Descuento en pro shop</li>
            </ul>
          </div>
          ` : ''}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://teereserve.golf/courses?promo=${offer.code}" class="cta-button">
              Reservar Ahora
            </a>
          </div>
          
          <p><strong>Código de descuento:</strong> ${offer.code}</p>
          <p><small>* Oferta válida para nuevas reservas. No acumulable con otras promociones.</small></p>
        </div>
        
        <div class="footer">
          <p>TeeReserve Golf - Ofertas exclusivas para golfistas exigentes</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Genera texto plano para ofertas
   */
  private generatePromotionalEmailText(user: EmailUser, offer: any): string {
    return `
🎯 OFERTA LIMITADA - TeeReserve Golf

${offer.title}
Exclusivo para ti, ${user.firstName}

${offer.discount}% OFF en tu próxima reserva
⏰ Válido hasta ${offer.expiryDate}

Hemos seleccionado esta oferta especialmente para ti basándonos en tus preferencias de golf.

${offer.recommendedCourses ? `
Campos Recomendados:
${offer.recommendedCourses.map((course: any) => `• ${course.name} - ${course.location} - ⭐ ${course.rating} - $${course.price}`).join('\n')}
` : ''}

Código de descuento: ${offer.code}

Reservar ahora: https://teereserve.golf/courses?promo=${offer.code}

* Oferta válida para nuevas reservas. No acumulable con otras promociones.

TeeReserve Golf
    `;
  }

  /**
   * Genera HTML para newsletter
   */
  private generateNewsletterHTML(user: EmailUser, content: any): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>TeeReserve Weekly</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #1a5d42 0%, #2d7a5a 100%); color: white; padding: 30px 20px; text-align: center; }
        .content { padding: 20px; }
        .section { margin: 30px 0; }
        .article { border-bottom: 1px solid #eee; padding-bottom: 20px; margin-bottom: 20px; }
        .article:last-child { border-bottom: none; }
        .article-title { color: #1a5d42; font-size: 18px; font-weight: bold; margin-bottom: 10px; }
        .course-highlight { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .tip-box { background: #e8f5e8; padding: 15px; border-left: 4px solid #1a5d42; margin: 15px 0; }
        .footer { background: #f8f8f8; padding: 20px; text-align: center; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📰 TeeReserve Weekly</h1>
          <p>${content.title}</p>
          <p>Hola ${user.firstName}, aquí tienes lo mejor del golf esta semana</p>
        </div>
        
        <div class="content">
          <div class="section">
            <h2>🏌️ Destacado de la Semana</h2>
            <div class="course-highlight">
              <h3>${content.featuredCourse.name}</h3>
              <p>📍 ${content.featuredCourse.location}</p>
              <p>${content.featuredCourse.description}</p>
              <p><strong>Oferta especial:</strong> ${content.featuredCourse.offer}</p>
            </div>
          </div>
          
          <div class="section">
            <h2>📰 Noticias del Golf</h2>
            ${content.news.map((article: any) => `
            <div class="article">
              <div class="article-title">${article.title}</div>
              <p>${article.summary}</p>
              <a href="${article.link}">Leer más →</a>
            </div>
            `).join('')}
          </div>
          
          <div class="section">
            <h2>💡 Tip de la Semana</h2>
            <div class="tip-box">
              <h4>${content.tips.title}</h4>
              <p>${content.tips.content}</p>
            </div>
          </div>
          
          ${content.recommendedCourses ? `
          <div class="section">
            <h2>🎯 Recomendado para Ti</h2>
            <p>Basado en tus preferencias:</p>
            ${content.recommendedCourses.map((course: any) => `
            <div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px;">
              <h4>${course.name}</h4>
              <p>📍 ${course.location} • ⭐ ${course.rating} • $${course.price}</p>
            </div>
            `).join('')}
          </div>
          ` : ''}
          
          <div class="section">
            <h2>📅 Eventos Próximos</h2>
            ${content.events.map((event: any) => `
            <div class="article">
              <div class="article-title">${event.name}</div>
              <p>📅 ${event.date} • 📍 ${event.location}</p>
              <p>${event.description}</p>
            </div>
            `).join('')}
          </div>
        </div>
        
        <div class="footer">
          <p>TeeReserve Golf - Tu fuente semanal de noticias de golf</p>
          <p>¿No quieres recibir el newsletter? <a href="#">Cancelar suscripción</a></p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Genera texto plano para newsletter
   */
  private generateNewsletterText(user: EmailUser, content: any): string {
    return `
TeeReserve Weekly - ${content.title}

Hola ${user.firstName}, aquí tienes lo mejor del golf esta semana

🏌️ DESTACADO DE LA SEMANA
${content.featuredCourse.name}
📍 ${content.featuredCourse.location}
${content.featuredCourse.description}
Oferta especial: ${content.featuredCourse.offer}

📰 NOTICIAS DEL GOLF
${content.news.map((article: any) => `• ${article.title}\n  ${article.summary}\n  ${article.link}`).join('\n\n')}

💡 TIP DE LA SEMANA
${content.tips.title}
${content.tips.content}

📅 EVENTOS PRÓXIMOS
${content.events.map((event: any) => `• ${event.name}\n  📅 ${event.date} • 📍 ${event.location}\n  ${event.description}`).join('\n\n')}

TeeReserve Golf - Tu fuente semanal de noticias de golf
    `;
  }

  /**
   * Registra actividad de email para analytics
   */
  private async logEmailActivity(
    userId: string, 
    type: string, 
    status: string, 
    emailId?: string
  ): Promise<void> {
    // En una implementación real, esto se guardaría en base de datos
    const activity = {
      userId,
      type,
      status,
      emailId,
      timestamp: new Date(),
    };
    
    console.log('📊 Email activity logged:', activity);
  }

  /**
   * Obtiene analytics de campañas
   */
  async getCampaignAnalytics(campaignId: string): Promise<CampaignAnalytics> {
    // En modo demo, retornar datos simulados
    return {
      sent: 1250,
      delivered: 1198,
      opened: 456,
      clicked: 89,
      bounced: 12,
      unsubscribed: 3,
      conversions: 23,
      revenue: 3450,
    };
  }

  /**
   * Programa envío automático de emails
   */
  async scheduleAutomatedEmails(): Promise<void> {
    console.log('🤖 Iniciando sistema de emails automatizados...');
    
    // Simular verificación de triggers
    const triggers = [
      'new_user_welcome',
      'booking_reminder_24h',
      'weekly_newsletter',
      'inactive_user_reactivation',
      'promotional_offers'
    ];
    
    for (const trigger of triggers) {
      console.log(`✅ Trigger configurado: ${trigger}`);
    }
  }
}

export default EmailMarketingEngine;

