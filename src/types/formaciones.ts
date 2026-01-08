/**
 * Tipos para el sistema de inscripción a formaciones
 */

/**
 * Estado del formulario de inscripción
 */
export type FormStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * Respuesta de la API de Brevo al crear/actualizar un contacto
 */
export interface BrevoContactResponse {
  id: number;
  email: string;
  listIds?: number[];
}

/**
 * Respuesta de error de la API de Brevo
 */
export interface BrevoErrorResponse {
  code: string;
  message: string;
}

/**
 * Respuesta del token OAuth de Zoom
 */
export interface ZoomOAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

/**
 * Datos de configuración de una reunión/webinar de Zoom
 */
export interface ZoomMeetingSettings {
  host_video?: boolean;
  participant_video?: boolean;
  join_before_host?: boolean;
  mute_upon_entry?: boolean;
  auto_recording?: 'local' | 'cloud' | 'none';
  approval_type?: 0 | 1 | 2; // 0: Automatically approve, 1: Manually approve, 2: No registration required
  registration_type?: 1 | 2 | 3; // 1: Attendees register once, 2: Attendees register for each occurrence, 3: Attendees register once and pick occurrence
}

/**
 * Respuesta al crear una reunión de Zoom
 */
export interface ZoomMeetingResponse {
  id: number;
  uuid: string;
  host_id: string;
  topic: string;
  type: number;
  start_time: string;
  duration: number;
  timezone: string;
  join_url: string;
  registration_url?: string;
}

/**
 * Datos para registrar un asistente en un webinar de Zoom
 */
export interface ZoomRegistrantData {
  email: string;
  first_name: string;
  last_name?: string;
  phone?: string;
  org?: string;
  comments?: string;
}

/**
 * Respuesta al registrar un asistente en Zoom
 */
export interface ZoomRegistrantResponse {
  id: string;
  registrant_id: string;
  topic: string;
  start_time: string;
  join_url: string;
}

/**
 * Error personalizado para las operaciones de las APIs
 */
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public apiName?: 'Brevo' | 'Zoom'
  ) {
    super(message);
    this.name = 'APIError';
  }
}
