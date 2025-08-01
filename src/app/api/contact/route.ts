import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, message, subject } = await request.json()

    // Validar campos requeridos
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Nombre, email y mensaje son requeridos' },
        { status: 400 }
      )
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      )
    }

    // Aquí se podría integrar con un servicio de email como Resend
    // Por ahora solo logueamos el mensaje
    console.log('Contact form submission:', {
      name,
      email,
      phone,
      subject,
      message,
      timestamp: new Date().toISOString()
    })

    // Simular envío de email
    const contactData = {
      id: Date.now().toString(),
      name,
      email,
      phone: phone || null,
      subject: subject || 'Consulta general',
      message,
      status: 'received',
      createdAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      message: 'Mensaje enviado correctamente. Te contactaremos pronto.',
      data: contactData
    })

  } catch (error) {
    console.error('Error processing contact form:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Contact API is working',
    methods: ['POST'],
    fields: {
      required: ['name', 'email', 'message'],
      optional: ['phone', 'subject']
    }
  })
}

