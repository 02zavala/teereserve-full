import { Resend } from 'resend'

// Configuración de Resend
const resendApiKey = process.env.RESEND_API_KEY!
const fromEmail = process.env.RESEND_FROM_EMAIL || 'info@teereserve.golf'
const replyToEmail = process.env.RESEND_REPLY_TO || 'info@teereserve.golf'

// Cliente de Resend
export const resend = new Resend(resendApiKey)

// Tipos de email
export interface EmailOptions {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  from?: string
  replyTo?: string
  cc?: string[]
  bcc?: string[]
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
}

// Enviar email
export const sendEmail = async (options: EmailOptions) => {
  try {
    const { data, error } = await resend.emails.send({
      from: options.from || fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo || replyToEmail,
      cc: options.cc,
      bcc: options.bcc,
      attachments: options.attachments
    })

    if (error) {
      console.error('Error enviando email:', error)
      throw new Error(`Error enviando email: ${error.message}`)
    }

    console.log(`Email enviado: ${data?.id}`)
    return {
      success: true,
      messageId: data?.id,
      data
    }
  } catch (error) {
    console.error('Error enviando email:', error)
    throw error
  }
}

// Plantillas de email para golf
export const golfEmailTemplates = {
  // Confirmación de reserva
  bookingConfirmation: (data: {
    customerName: string
    courseName: string
    date: string
    time: string
    players: number
    price: number
    bookingId: string
  }) => ({
    subject: `Confirmación de Reserva - ${data.courseName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Confirmación de Reserva - TeeReserve Golf</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #F4C430 0%, #8B9A3E 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #ddd; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
            .booking-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .button { background: linear-gradient(135deg, #F4C430 0%, #8B9A3E 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>¡Reserva Confirmada! ⛳</h1>
              <p>Tu tee time está asegurado</p>
            </div>
            <div class="content">
              <h2>Hola ${data.customerName},</h2>
              <p>¡Excelente noticia! Tu reserva en <strong>${data.courseName}</strong> ha sido confirmada exitosamente.</p>
              
              <div class="booking-details">
                <h3>Detalles de tu Reserva</h3>
                <p><strong>Campo:</strong> ${data.courseName}</p>
                <p><strong>Fecha:</strong> ${data.date}</p>
                <p><strong>Hora:</strong> ${data.time}</p>
                <p><strong>Jugadores:</strong> ${data.players}</p>
                <p><strong>Total:</strong> $${data.price} MXN</p>
                <p><strong>ID de Reserva:</strong> ${data.bookingId}</p>
              </div>
              
              <p>Te recomendamos llegar 30 minutos antes de tu tee time para el check-in.</p>
              
              <a href="https://teereserve.golf/bookings/${data.bookingId}" class="button">Ver Detalles de Reserva</a>
              
              <p>¡Que disfrutes tu ronda de golf! 🏌️‍♂️</p>
            </div>
            <div class="footer">
              <p>TeeReserve Golf - La plataforma líder de reservas de golf en México</p>
              <p>info@teereserve.golf | +52 624 135 29 86</p>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  // Recordatorio de reserva
  bookingReminder: (data: {
    customerName: string
    courseName: string
    date: string
    time: string
    bookingId: string
  }) => ({
    subject: `Recordatorio: Tu tee time es mañana - ${data.courseName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Recordatorio de Reserva - TeeReserve Golf</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #F4C430 0%, #8B9A3E 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #ddd; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
            .reminder-box { background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>¡Tu tee time es mañana! ⏰</h1>
            </div>
            <div class="content">
              <h2>Hola ${data.customerName},</h2>
              <p>Este es un recordatorio amigable de que tu reserva en <strong>${data.courseName}</strong> es mañana.</p>
              
              <div class="reminder-box">
                <h3>📅 Detalles de tu Reserva</h3>
                <p><strong>Campo:</strong> ${data.courseName}</p>
                <p><strong>Fecha:</strong> ${data.date}</p>
                <p><strong>Hora:</strong> ${data.time}</p>
                <p><strong>ID:</strong> ${data.bookingId}</p>
              </div>
              
              <h3>Consejos para tu ronda:</h3>
              <ul>
                <li>Llega 30 minutos antes para el check-in</li>
                <li>Revisa el clima y vístete apropiadamente</li>
                <li>Trae identificación oficial</li>
                <li>Confirma tu método de pago</li>
              </ul>
              
              <p>¡Esperamos que tengas una excelente ronda! 🏌️‍♂️</p>
            </div>
            <div class="footer">
              <p>TeeReserve Golf</p>
              <p>info@teereserve.golf | +52 624 135 29 86</p>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  // Newsletter
  newsletter: (data: {
    customerName: string
    featuredCourse: string
    specialOffer: string
    golfTip: string
  }) => ({
    subject: `Newsletter TeeReserve Golf - Ofertas y Tips Exclusivos`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Newsletter TeeReserve Golf</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #F4C430 0%, #8B9A3E 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #ddd; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
            .section { margin: 30px 0; padding: 20px; border-radius: 8px; }
            .featured { background: #f8f9fa; }
            .offer { background: #fff3cd; }
            .tip { background: #d1ecf1; }
            .button { background: linear-gradient(135deg, #F4C430 0%, #8B9A3E 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏌️‍♂️ TeeReserve Golf Newsletter</h1>
              <p>Tu fuente de información sobre golf premium en México</p>
            </div>
            <div class="content">
              <h2>Hola ${data.customerName},</h2>
              
              <div class="section featured">
                <h3>⭐ Campo Destacado del Mes</h3>
                <p><strong>${data.featuredCourse}</strong></p>
                <p>Descubre por qué este campo es uno de los favoritos de nuestros golfistas.</p>
                <a href="https://teereserve.golf/courses" class="button">Explorar Campos</a>
              </div>
              
              <div class="section offer">
                <h3>🎯 Oferta Especial</h3>
                <p>${data.specialOffer}</p>
                <a href="https://teereserve.golf" class="button">Reservar Ahora</a>
              </div>
              
              <div class="section tip">
                <h3>💡 Tip de Golf</h3>
                <p>${data.golfTip}</p>
              </div>
              
              <p>¡Gracias por ser parte de la comunidad TeeReserve Golf!</p>
            </div>
            <div class="footer">
              <p>TeeReserve Golf - La plataforma líder de reservas de golf en México</p>
              <p>info@teereserve.golf | +52 624 135 29 86</p>
              <p><a href="https://teereserve.golf/unsubscribe">Cancelar suscripción</a></p>
            </div>
          </div>
        </body>
      </html>
    `
  })
}

// Enviar email de confirmación de reserva
export const sendBookingConfirmationEmail = async (data: Parameters<typeof golfEmailTemplates.bookingConfirmation>[0]) => {
  const template = golfEmailTemplates.bookingConfirmation(data)
  return await sendEmail({
    to: data.customerName, // Aquí debería ir el email del cliente
    ...template
  })
}

// Enviar recordatorio de reserva
export const sendBookingReminderEmail = async (data: Parameters<typeof golfEmailTemplates.bookingReminder>[0]) => {
  const template = golfEmailTemplates.bookingReminder(data)
  return await sendEmail({
    to: data.customerName, // Aquí debería ir el email del cliente
    ...template
  })
}

// Enviar newsletter
export const sendNewsletterEmail = async (emails: string[], data: Parameters<typeof golfEmailTemplates.newsletter>[0]) => {
  const template = golfEmailTemplates.newsletter(data)
  return await sendEmail({
    to: emails,
    ...template
  })
}

export default resend

