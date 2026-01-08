import { useState, type FormEvent, type ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BorderBeam from './magicui/BorderBeam';

interface FormData {
  nombre: string;
  email: string;
  telefono: string;
  empresa: string;
  mensaje: string;
}

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

interface ApiResponse {
  success: boolean;
  message: string;
  data?: {
    brevoContactId?: number;
    zoomRegistrantId?: string;
    zoomJoinUrl?: string;
  };
}

export default function FormacionesForm() {
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    email: '',
    telefono: '',
    empresa: '',
    mensaje: '',
  });

  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successData, setSuccessData] = useState<ApiResponse['data']>();

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/formaciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success) {
        setStatus('error');
        setErrorMessage(result.message || 'Error al procesar la solicitud');
        return;
      }

      setStatus('success');
      setSuccessData(result.data);

      // Limpiar formulario
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        empresa: '',
        mensaje: '',
      });
    } catch (error) {
      setStatus('error');
      setErrorMessage(
        'Error de conexión. Por favor, verifica tu conexión e inténtalo de nuevo.'
      );
      console.error('Error al enviar formulario:', error);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-secondary/20 via-secondary/10 to-transparent p-8 shadow-2xl border border-secondary/30"
          >
            <BorderBeam size={250} duration={12} delay={0} />

            <div className="text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary/20 mb-4"
              >
                <svg
                  className="w-12 h-12 text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </motion.div>

              <h3 className="text-3xl font-heading font-bold text-white">
                ¡Registro completado!
              </h3>

              <p className="text-lg text-gray-300">
                Te has inscrito correctamente en la formación. Recibirás un
                email de confirmación con todos los detalles.
              </p>

              {successData?.zoomJoinUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="pt-4"
                >
                  <a
                    href={successData.zoomJoinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-primary font-semibold rounded-lg hover:bg-secondary/90 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M5.5 3A2.5 2.5 0 003 5.5v13A2.5 2.5 0 005.5 21h13a2.5 2.5 0 002.5-2.5v-13A2.5 2.5 0 0018.5 3h-13zm0 2h13a.5.5 0 01.5.5v13a.5.5 0 01-.5.5h-13a.5.5 0 01-.5-.5v-13a.5.5 0 01.5-.5zM9 8v8l7-4-7-4z" />
                    </svg>
                    Guardar enlace de Zoom
                  </a>
                </motion.div>
              )}

              <button
                onClick={() => setStatus('idle')}
                className="mt-6 text-secondary hover:text-secondary/80 transition-colors underline"
              >
                Registrar otra persona
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="relative overflow-hidden rounded-2xl bg-black/30 backdrop-blur-sm p-8 shadow-2xl border border-primary/20"
          >
            {status === 'loading' && (
              <BorderBeam size={250} duration={12} delay={0} />
            )}

            <div className="space-y-6">
              {/* Nombre */}
              <div>
                <label
                  htmlFor="nombre"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Nombre completo <span className="text-secondary">*</span>
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  disabled={status === 'loading'}
                  className="input input-bordered w-full bg-black/40 border-primary/30 text-white focus:border-secondary focus:outline-none disabled:opacity-50"
                  placeholder="Juan Pérez García"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Email <span className="text-secondary">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={status === 'loading'}
                  className="input input-bordered w-full bg-black/40 border-primary/30 text-white focus:border-secondary focus:outline-none disabled:opacity-50"
                  placeholder="juan@empresa.com"
                />
              </div>

              {/* Teléfono */}
              <div>
                <label
                  htmlFor="telefono"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Teléfono <span className="text-secondary">*</span>
                </label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  required
                  disabled={status === 'loading'}
                  className="input input-bordered w-full bg-black/40 border-primary/30 text-white focus:border-secondary focus:outline-none disabled:opacity-50"
                  placeholder="612345678"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Formato: 612345678 o +34612345678
                </p>
              </div>

              {/* Empresa */}
              <div>
                <label
                  htmlFor="empresa"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Empresa (opcional)
                </label>
                <input
                  type="text"
                  id="empresa"
                  name="empresa"
                  value={formData.empresa}
                  onChange={handleChange}
                  disabled={status === 'loading'}
                  className="input input-bordered w-full bg-black/40 border-primary/30 text-white focus:border-secondary focus:outline-none disabled:opacity-50"
                  placeholder="Mi Empresa S.L."
                />
              </div>

              {/* Mensaje */}
              <div>
                <label
                  htmlFor="mensaje"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Mensaje o consulta (opcional)
                </label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  value={formData.mensaje}
                  onChange={handleChange}
                  disabled={status === 'loading'}
                  rows={3}
                  maxLength={500}
                  className="textarea textarea-bordered w-full bg-black/40 border-primary/30 text-white focus:border-secondary focus:outline-none disabled:opacity-50 resize-none"
                  placeholder="¿Tienes alguna pregunta sobre la formación?"
                />
                <p className="mt-1 text-xs text-gray-400">
                  {formData.mensaje.length}/500 caracteres
                </p>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {status === 'error' && errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="alert alert-error bg-error/20 border border-error/50"
                  >
                    <svg
                      className="stroke-current shrink-0 h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{errorMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="btn btn-block bg-secondary hover:bg-secondary/90 text-primary border-none font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? (
                  <span className="flex items-center gap-2">
                    <span className="loading loading-spinner loading-sm"></span>
                    Procesando...
                  </span>
                ) : (
                  'Inscribirme a la formación'
                )}
              </button>

              <p className="text-xs text-center text-gray-400">
                Al inscribirte, aceptas recibir información sobre nuestras
                formaciones y servicios.
              </p>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
