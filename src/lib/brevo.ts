import type {
  BrevoContactResponse,
  BrevoErrorResponse,
} from '../types/formaciones';
import { APIError } from '../types/formaciones';
import type { FormacionesData } from './validation';

/**
 * Cliente para la API de Brevo (antiguo SendinBlue)
 * Documentación: https://developers.brevo.com/reference/createcontact
 */

const BREVO_API_URL = 'https://api.brevo.com/v3';

/**
 * Obtiene la API key de Brevo desde las variables de entorno
 */
function getBrevoApiKey(): string {
  const apiKey = import.meta.env.BREVO_API_KEY;

  if (!apiKey) {
    throw new APIError(
      'BREVO_API_KEY no está configurada en las variables de entorno',
      500,
      'Brevo'
    );
  }

  return apiKey;
}

/**
 * Obtiene el ID de la lista de Brevo desde las variables de entorno
 */
function getBrevoListId(): number {
  const listId = import.meta.env.BREVO_LIST_ID;

  if (!listId) {
    throw new APIError(
      'BREVO_LIST_ID no está configurada en las variables de entorno',
      500,
      'Brevo'
    );
  }

  return parseInt(listId, 10);
}

/**
 * Crea o actualiza un contacto en Brevo y lo añade a la lista de formaciones
 *
 * @param data - Datos del formulario de inscripción
 * @returns Información del contacto creado/actualizado
 */
export async function createBrevoContact(
  data: FormacionesData
): Promise<BrevoContactResponse> {
  const apiKey = getBrevoApiKey();
  const listId = getBrevoListId();

  try {
    const response = await fetch(`${BREVO_API_URL}/contacts`, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        email: data.email,
        attributes: {
          NOMBRE: data.nombre,
          SMS: data.telefono,
          EMPRESA: data.empresa || '',
        },
        listIds: [listId],
        updateEnabled: true, // Actualiza el contacto si ya existe
      }),
    });

    // Si el contacto ya existe (código 400), intentamos actualizarlo
    if (response.status === 400) {
      const errorData = (await response.json()) as BrevoErrorResponse;

      if (errorData.code === 'duplicate_parameter') {
        // El contacto ya existe, intentamos actualizarlo
        return await updateBrevoContact(data);
      }
    }

    if (!response.ok) {
      const errorData = (await response.json()) as BrevoErrorResponse;
      throw new APIError(
        `Error de Brevo: ${errorData.message}`,
        response.status,
        'Brevo'
      );
    }

    const result = (await response.json()) as { id: number };

    return {
      id: result.id,
      email: data.email,
      listIds: [listId],
    };
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }

    throw new APIError(
      `Error al conectar con Brevo: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      500,
      'Brevo'
    );
  }
}

/**
 * Actualiza un contacto existente en Brevo
 *
 * @param data - Datos del formulario de inscripción
 * @returns Información del contacto actualizado
 */
async function updateBrevoContact(
  data: FormacionesData
): Promise<BrevoContactResponse> {
  const apiKey = getBrevoApiKey();
  const listId = getBrevoListId();

  try {
    const response = await fetch(
      `${BREVO_API_URL}/contacts/${encodeURIComponent(data.email)}`,
      {
        method: 'PUT',
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          attributes: {
            NOMBRE: data.nombre,
            SMS: data.telefono,
            EMPRESA: data.empresa || '',
          },
          listIds: [listId],
        }),
      }
    );

    if (!response.ok) {
      const errorData = (await response.json()) as BrevoErrorResponse;
      throw new APIError(
        `Error al actualizar contacto en Brevo: ${errorData.message}`,
        response.status,
        'Brevo'
      );
    }

    // La actualización no devuelve el ID, lo obtenemos del contacto
    const contactResponse = await fetch(
      `${BREVO_API_URL}/contacts/${encodeURIComponent(data.email)}`,
      {
        method: 'GET',
        headers: {
          'api-key': apiKey,
          Accept: 'application/json',
        },
      }
    );

    if (!contactResponse.ok) {
      throw new APIError(
        'Error al obtener información del contacto actualizado',
        contactResponse.status,
        'Brevo'
      );
    }

    const contactData = (await contactResponse.json()) as BrevoContactResponse;

    return {
      id: contactData.id,
      email: data.email,
      listIds: [listId],
    };
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }

    throw new APIError(
      `Error al actualizar contacto en Brevo: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      500,
      'Brevo'
    );
  }
}

/**
 * Envía un email de confirmación de registro a la formación
 *
 * @param data - Datos del formulario de inscripción
 * @param zoomJoinUrl - URL para unirse al meeting de Zoom
 * @param meetingDate - Fecha del meeting (opcional)
 * @returns true si el email se envió correctamente
 */
export async function sendConfirmationEmail(
  data: FormacionesData,
  zoomJoinUrl: string,
  meetingDate?: string
): Promise<boolean> {
  const apiKey = getBrevoApiKey();

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2E3536 0%, #F2E500 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #F2E500; color: #2E3536; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .info-box { background: white; border-left: 4px solid #F2E500; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Bienvenido a la Formación ERP SOLWED!</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${data.nombre}</strong>,</p>

            <p>¡Gracias por inscribirte en nuestra formación mensual de ERP! Estamos encantados de tenerte con nosotros.</p>

            <div class="info-box">
              <h3>📅 Detalles de la formación:</h3>
              <ul>
                <li><strong>Tema:</strong> Formación de Zoom para Sistemas de Gestión</li>
                <li><strong>Frecuencia:</strong> Tercer miércoles de cada mes por la tarde</li>
                ${meetingDate ? `<li><strong>Próxima fecha:</strong> ${meetingDate}</li>` : ''}
                <li><strong>Duración:</strong> 1 hora</li>
                <li><strong>Formato:</strong> Online vía Zoom</li>
              </ul>
            </div>

            <p>Para unirte a la formación, simplemente haz clic en el botón de abajo:</p>

            <div style="text-align: center;">
              <a href="${zoomJoinUrl}" class="button">Unirme a la formación</a>
            </div>

            <p style="font-size: 14px; color: #666;">
              También puedes copiar y pegar este enlace en tu navegador:<br>
              <a href="${zoomJoinUrl}">${zoomJoinUrl}</a>
            </p>

            <div class="info-box">
              <h3>💡 Qué aprenderás:</h3>
              <ul>
                <li>Gestión de documentos (facturas, presupuestos, albaranes)</li>
                <li>Control de tesorería y flujo de caja</li>
                <li>Gestión de clientes con CRM integrado</li>
                <li>Control de almacén e inventario</li>
                <li>Informes y análisis para tomar decisiones</li>
                <li>Trucos y consejos para optimizar tu trabajo diario</li>
              </ul>
            </div>

            <p>Si tienes alguna pregunta antes de la formación, no dudes en responder a este email.</p>

            <p><strong>¡Nos vemos pronto!</strong><br>
            El equipo de ERP SOLWED</p>
          </div>
          <div class="footer">
            <p>ERP SOLWED - Software de gestión para pymes<br>
            <a href="https://erpsolwed.es">erpsolwed.es</a></p>
            <p style="font-size: 11px; color: #999;">
              Has recibido este email porque te registraste en nuestras formaciones.<br>
              Si no quieres recibir más emails, puedes darte de baja en cualquier momento.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const response = await fetch(`${BREVO_API_URL}/smtp/email`, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: 'ERP SOLWED Formaciones',
          email: 'solwed.es@gmail.com',
        },
        to: [
          {
            email: data.email,
            name: data.nombre,
          },
        ],
        subject: '✅ Confirmación de registro - Formación ERP SOLWED',
        htmlContent: emailHtml,
      }),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as BrevoErrorResponse;
      console.error('Error al enviar email de confirmación:', errorData);
      // No lanzamos error para no bloquear el registro
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error al enviar email de confirmación:', error);
    // No lanzamos error para no bloquear el registro
    return false;
  }
}
