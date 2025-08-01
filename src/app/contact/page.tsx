'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const formSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Correo electrónico inválido'),
  message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres'),
});

type FormData = z.infer<typeof formSchema>;

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      // Replace with your API endpoint (e.g., fetch('/api/contact', { method: 'POST', body: JSON.stringify(data) }))
      console.log('Form data:', data);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmitStatus('success');
      reset();
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center text-green-700">Contáctanos</h1>
        <p className="text-center text-gray-600 mt-2">¿Tienes dudas o quieres colaborar con nosotros?</p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Formulario de contacto */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="name" className="text-sm text-gray-700">Nombre</label>
              <Input id="name" placeholder="Tu nombre" {...register('name')} />
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>
            <div>
              <label htmlFor="email" className="text-sm text-gray-700">Correo electrónico</label>
              <Input id="email" type="email" placeholder="ejemplo@correo.com" {...register('email')} />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>
            <div>
              <label htmlFor="message" className="text-sm text-gray-700">Mensaje</label>
              <Textarea id="message" rows={5} placeholder="Escribe tu mensaje aquí..." {...register('message')} />
              {errors.message && <p className="text-red-500 text-sm">{errors.message.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : 'Enviar mensaje'}
            </Button>
            {submitStatus === 'success' && (
              <p className="text-green-600 text-sm">¡Mensaje enviado con éxito!</p>
            )}
            {submitStatus === 'error' && (
              <p className="text-red-600 text-sm">Error al enviar el mensaje. Intenta de nuevo.</p>
            )}
          </form>

          {/* Información de contacto */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <Mail className="text-green-600" />
              <span>info@teereserve.golf</span>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="text-green-600" />
              <span>+52 624 135 2989</span>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="text-green-600" />
              <span>Los Cabos, Baja California Sur, México</span>
            </div>
            <iframe
              className="w-full h-64 rounded-xl border-0"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3732.3333!2d-109.70122!3d22.89188!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x86af4ab56adf1e6b%3A0x2f1b7e8c9d5a6b4c!2sLos%20Cabos%2C%20Baja%20California%20Sur%2C%20Mexico!5e0!3m2!1ses!2smx!4v1689481250912!5m2!1ses!2smx"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}
