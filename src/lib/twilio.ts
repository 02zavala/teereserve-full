import twilio from 'twilio'

// Configuración de Twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID!
const authToken = process.env.TWILIO_AUTH_TOKEN!
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER!
const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER!

// Cliente de Twilio
export const twilioClient = twilio(accountSid, authToken)

// Tipos de mensajes
export interface SMSMessage {
  to: string
  body: string
  from?: string
}

export interface WhatsAppMessage {
  to: string
  body: string
  mediaUrl?: string[]
}

// Enviar SMS
export const sendSMS = async ({ to, body, from = twilioPhoneNumber }: SMSMessage) => {
  try {
    const message = await twilioClient.messages.create({
      body,
      from,
      to
    })
    
    console.log(`SMS enviado: ${message.sid}`)
    return {
      success: true,
      messageId: message.sid,
      status: message.status
    }
  } catch (error) {
    console.error('Error enviando SMS:', error)
    throw new Error(`Error enviando SMS: ${error}`)
  }
}

// Enviar WhatsApp
export const sendWhatsApp = async ({ to, body, mediaUrl }: WhatsAppMessage) => {
  try {
    // Formatear número para WhatsApp
    const whatsappTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`
    
    const message = await twilioClient.messages.create({
      body,
      from: twilioWhatsAppNumber,
      to: whatsappTo,
      mediaUrl
    })
    
    console.log(`WhatsApp enviado: ${message.sid}`)
    return {
      success: true,
      messageId: message.sid,
      status: message.status
    }
  } catch (error) {
    console.error('Error enviando WhatsApp:', error)
    throw new Error(`Error enviando WhatsApp: ${error}`)
  }
}

// Plantillas de mensajes para golf
export const golfMessageTemplates = {
  bookingConfirmation: (customerName: string, courseName: string, date: string, time: string) => ({
    body: `¡Hola ${customerName}! Tu reserva en ${courseName} ha sido confirmada para el ${date} a las ${time}. ¡Nos vemos en el campo! 🏌️‍♂️ - TeeReserve Golf`
  }),
  
  bookingReminder: (customerName: string, courseName: string, date: string, time: string) => ({
    body: `Recordatorio: ${customerName}, tu tee time en ${courseName} es mañana ${date} a las ${time}. ¡Prepara tus palos! ⛳ - TeeReserve Golf`
  }),
  
  bookingCancellation: (customerName: string, courseName: string, date: string) => ({
    body: `${customerName}, tu reserva en ${courseName} para el ${date} ha sido cancelada exitosamente. Te esperamos pronto. - TeeReserve Golf`
  }),
  
  weatherAlert: (customerName: string, courseName: string, date: string, weather: string) => ({
    body: `${customerName}, alerta meteorológica para tu reserva en ${courseName} el ${date}: ${weather}. Contacta al campo para más información. - TeeReserve Golf`
  }),
  
  promotionalOffer: (customerName: string, offer: string) => ({
    body: `¡${customerName}! Oferta especial: ${offer}. Reserva ahora en teereserve.golf 🏌️‍♂️ - TeeReserve Golf`
  })
}

// Enviar notificación de reserva
export const sendBookingNotification = async (
  type: keyof typeof golfMessageTemplates,
  phone: string,
  params: any,
  useWhatsApp: boolean = true
) => {
  try {
    const template = golfMessageTemplates[type]
    const message = template(...Object.values(params))
    
    if (useWhatsApp) {
      return await sendWhatsApp({
        to: phone,
        ...message
      })
    } else {
      return await sendSMS({
        to: phone,
        ...message
      })
    }
  } catch (error) {
    console.error('Error enviando notificación:', error)
    throw error
  }
}

// Validar número de teléfono
export const validatePhoneNumber = async (phoneNumber: string) => {
  try {
    const lookup = await twilioClient.lookups.v1.phoneNumbers(phoneNumber).fetch()
    return {
      valid: true,
      formatted: lookup.phoneNumber,
      countryCode: lookup.countryCode,
      carrier: lookup.carrier
    }
  } catch (error) {
    return {
      valid: false,
      error: error
    }
  }
}

// Obtener estado de mensaje
export const getMessageStatus = async (messageSid: string) => {
  try {
    const message = await twilioClient.messages(messageSid).fetch()
    return {
      status: message.status,
      errorCode: message.errorCode,
      errorMessage: message.errorMessage,
      dateCreated: message.dateCreated,
      dateSent: message.dateSent,
      dateUpdated: message.dateUpdated
    }
  } catch (error) {
    console.error('Error obteniendo estado del mensaje:', error)
    throw error
  }
}

export default twilioClient

