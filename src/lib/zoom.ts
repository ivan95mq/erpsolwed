import type {
  ZoomOAuthTokenResponse,
  ZoomRegistrantData,
  ZoomRegistrantResponse,
} from '../types/formaciones';
import { APIError } from '../types/formaciones';
import type { FormacionesData } from './validation';

/**
 * Cliente para la API de Zoom
 * Documentación: https://developers.zoom.us/docs/api/
 */

const ZOOM_API_URL = 'https://api.zoom.us/v2';
const ZOOM_OAUTH_URL = 'https://zoom.us/oauth/token';

// Cache del token OAuth (válido por 1 hora)
let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Obtiene las credenciales de Zoom desde las variables de entorno
 */
function getZoomCredentials() {
  const accountId = import.meta.env.ZOOM_ACCOUNT_ID;
  const clientId = import.meta.env.ZOOM_CLIENT_ID;
  const clientSecret = import.meta.env.ZOOM_CLIENT_SECRET;
  const userId = import.meta.env.ZOOM_USER_ID || 'me';

  if (!accountId || !clientId || !clientSecret) {
    throw new APIError(
      'Credenciales de Zoom no configuradas. Verifica ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID y ZOOM_CLIENT_SECRET',
      500,
      'Zoom'
    );
  }

  return { accountId, clientId, clientSecret, userId };
}

/**
 * Obtiene un token OAuth de Zoom usando Server-to-Server OAuth
 * Los tokens son válidos por 1 hora y se cachean para reutilizar
 *
 * @returns Token de acceso de Zoom
 */
async function getZoomAccessToken(): Promise<string> {
  // Verificar si tenemos un token cacheado válido
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  const { accountId, clientId, clientSecret } = getZoomCredentials();

  try {
    const credentials = btoa(`${clientId}:${clientSecret}`);

    const response = await fetch(
      `${ZOOM_OAUTH_URL}?grant_type=account_credentials&account_id=${accountId}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new APIError(
        `Error al obtener token de Zoom: ${errorText}`,
        response.status,
        'Zoom'
      );
    }

    const data = (await response.json()) as ZoomOAuthTokenResponse;

    // Cachear el token (expira en 55 minutos para estar seguros)
    cachedToken = {
      token: data.access_token,
      expiresAt: Date.now() + 55 * 60 * 1000,
    };

    return data.access_token;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }

    throw new APIError(
      `Error al conectar con Zoom OAuth: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      500,
      'Zoom'
    );
  }
}

/**
 * Registra un usuario en un meeting recurrente de Zoom con registro habilitado
 *
 * @param data - Datos del formulario de inscripción
 * @returns Información del registro y URL para unirse
 */
export async function registerZoomMeeting(
  data: FormacionesData
): Promise<ZoomRegistrantResponse> {
  const meetingId = import.meta.env.ZOOM_MEETING_ID;

  if (!meetingId) {
    throw new APIError(
      'ZOOM_MEETING_ID no está configurado. Debes crear un meeting recurrente en Zoom con registro habilitado y proporcionar su ID.',
      500,
      'Zoom'
    );
  }

  const token = await getZoomAccessToken();

  // Separar nombre en first_name y last_name
  const nameParts = data.nombre.trim().split(' ');
  const firstName = nameParts[0] || data.nombre;
  const lastName = nameParts.slice(1).join(' ') || '';

  const registrantData: ZoomRegistrantData = {
    email: data.email,
    first_name: firstName,
    last_name: lastName,
    phone: data.telefono,
    org: data.empresa || undefined,
    comments: data.mensaje || undefined,
  };

  try {
    const response = await fetch(
      `${ZOOM_API_URL}/meetings/${meetingId}/registrants`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrantData),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new APIError(
        `Error al registrar en Zoom meeting: ${errorText}`,
        response.status,
        'Zoom'
      );
    }

    const result = (await response.json()) as ZoomRegistrantResponse;

    return result;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }

    throw new APIError(
      `Error al registrar usuario en Zoom: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      500,
      'Zoom'
    );
  }
}

/**
 * Obtiene información del meeting configurado
 * Útil para mostrar detalles de la próxima formación
 *
 * @returns Información del meeting
 */
export async function getZoomMeetingInfo() {
  const meetingId = import.meta.env.ZOOM_MEETING_ID;

  if (!meetingId) {
    return null;
  }

  const token = await getZoomAccessToken();

  try {
    const response = await fetch(`${ZOOM_API_URL}/meetings/${meetingId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error('Error al obtener info del meeting:', await response.text());
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error al obtener info del meeting:', error);
    return null;
  }
}
