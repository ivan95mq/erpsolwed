import type { APIRoute } from 'astro';
import { formacionesSchema } from '../../lib/validation';
import { createBrevoContact, sendConfirmationEmail } from '../../lib/brevo';
import { registerZoomMeeting } from '../../lib/zoom';
import { APIError } from '../../types/formaciones';

/**
 * API endpoint para el registro de formaciones
 * POST /api/formaciones
 *
 * Este endpoint:
 * 1. Valida los datos del formulario
 * 2. Crea/actualiza el contacto en Brevo
 * 3. Registra al usuario en el webinar de Zoom
 * 4. Retorna la información de registro
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    // 1. Parsear el body de la petición
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Datos inválidos. El cuerpo de la petición debe ser JSON válido.',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 2. Validar datos con Zod
    let validatedData;
    try {
      validatedData = formacionesSchema.parse(body);
    } catch (error: any) {
      const zodErrors = error.errors
        ?.map((err: any) => `${err.path.join('.')}: ${err.message}`)
        .join(', ');

      return new Response(
        JSON.stringify({
          success: false,
          message: `Datos del formulario inválidos: ${zodErrors || 'Error de validación'}`,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 3. Registrar en Brevo (en paralelo con Zoom)
    let brevoContactId: number | undefined;
    let zoomRegistrantId: string | undefined;
    let zoomJoinUrl: string | undefined;

    const results = await Promise.allSettled([
      createBrevoContact(validatedData),
      registerZoomMeeting(validatedData),
    ]);

    // Procesar resultado de Brevo
    const brevoResult = results[0];
    if (brevoResult.status === 'fulfilled') {
      brevoContactId = brevoResult.value.id;
    } else {
      console.error('Error al crear contacto en Brevo:', brevoResult.reason);
      // No bloqueamos el registro si Brevo falla
    }

    // Procesar resultado de Zoom
    const zoomResult = results[1];
    if (zoomResult.status === 'fulfilled') {
      zoomRegistrantId = zoomResult.value.registrant_id;
      zoomJoinUrl = zoomResult.value.join_url;
    } else {
      console.error('Error al registrar en Zoom:', zoomResult.reason);

      // Si Zoom falla, devolvemos error (es crítico)
      if (zoomResult.reason instanceof APIError) {
        return new Response(
          JSON.stringify({
            success: false,
            message: `Error al registrarte en la formación: ${zoomResult.reason.message}`,
          }),
          {
            status: zoomResult.reason.statusCode || 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: false,
          message: 'Error al registrarte en la formación. Por favor, inténtalo de nuevo.',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 4. Enviar email de confirmación (no bloqueante)
    if (zoomJoinUrl) {
      sendConfirmationEmail(validatedData, zoomJoinUrl).catch((error) => {
        console.error('Error al enviar email de confirmación:', error);
        // No bloqueamos la respuesta si el email falla
      });
    }

    // 5. Respuesta exitosa
    return new Response(
      JSON.stringify({
        success: true,
        message: '¡Registro completado con éxito! Revisa tu email para más información.',
        data: {
          brevoContactId,
          zoomRegistrantId,
          zoomJoinUrl,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error inesperado en /api/formaciones:', error);

    // Error genérico del servidor
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Error interno del servidor. Por favor, inténtalo de nuevo más tarde.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

/**
 * Manejo de otros métodos HTTP
 */
export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({
      success: false,
      message: 'Método no permitido. Usa POST para registrarte en una formación.',
    }),
    {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        Allow: 'POST',
      },
    }
  );
};

export const PUT = GET;
export const DELETE = GET;
export const PATCH = GET;
