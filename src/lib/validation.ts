import { z } from 'zod';

/**
 * Schema de validación para el formulario de inscripción a formaciones
 */
export const formacionesSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es demasiado largo'),

  email: z
    .string()
    .email('Email inválido')
    .toLowerCase()
    .trim(),

  telefono: z
    .string()
    .regex(
      /^(\+34|0034|34)?[6789]\d{8}$/,
      'Teléfono inválido. Formato: 612345678 o +34612345678'
    )
    .transform((val) => {
      // Normalizar el teléfono al formato +34XXXXXXXXX
      const cleaned = val.replace(/^(\+34|0034|34)/, '');
      return `+34${cleaned}`;
    }),

  empresa: z
    .string()
    .min(2, 'El nombre de la empresa debe tener al menos 2 caracteres')
    .max(100, 'El nombre de la empresa es demasiado largo')
    .optional()
    .or(z.literal('')),

  mensaje: z
    .string()
    .max(500, 'El mensaje es demasiado largo (máximo 500 caracteres)')
    .optional()
    .or(z.literal('')),
});

/**
 * Tipo TypeScript inferido del schema de Zod
 */
export type FormacionesData = z.infer<typeof formacionesSchema>;

/**
 * Schema para la respuesta de éxito de la API
 */
export const formacionesResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    brevoContactId: z.number().optional(),
    zoomRegistrantId: z.string().optional(),
    zoomJoinUrl: z.string().url().optional(),
  }).optional(),
});

/**
 * Tipo para la respuesta de la API
 */
export type FormacionesResponse = z.infer<typeof formacionesResponseSchema>;
