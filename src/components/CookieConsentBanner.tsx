import { useState, useEffect } from 'react';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true, can't be disabled
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Show banner after a short delay for better UX
      setTimeout(() => setIsVisible(true), 1000);
    } else {
      // Load saved preferences
      try {
        const savedPrefs = JSON.parse(consent);
        setPreferences(savedPrefs);
        // Initialize analytics/marketing based on saved preferences
        initializeTracking(savedPrefs);
      } catch (e) {
        console.error('Error loading cookie preferences:', e);
      }
    }
  }, []);

  const initializeTracking = (prefs: CookiePreferences) => {
    // TODO: When you add Google Analytics or other tracking:
    // if (prefs.analytics) {
    //   // Initialize Google Analytics
    //   window.gtag?.('consent', 'update', {
    //     'analytics_storage': 'granted'
    //   });
    // }
    // if (prefs.marketing) {
    //   // Initialize marketing pixels (Facebook, etc.)
    // }

    console.log('Tracking initialized with preferences:', prefs);
  };

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem('cookie-consent', JSON.stringify(prefs));
    setPreferences(prefs);
    initializeTracking(prefs);
    setIsVisible(false);
    setShowSettings(false);
  };

  const acceptAll = () => {
    saveConsent({
      necessary: true,
      analytics: true,
      marketing: true,
    });
  };

  const acceptNecessary = () => {
    saveConsent({
      necessary: true,
      analytics: false,
      marketing: false,
    });
  };

  const saveCustom = () => {
    saveConsent(preferences);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-base-100/95 backdrop-blur-lg border-t border-base-300 shadow-2xl">
      <div className="max-w-7xl mx-auto">
        {!showSettings ? (
          // Simple banner view
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            <div className="flex-1">
              <h3 className="font-heading text-lg md:text-xl mb-2 text-base-content">
                🍪 Usamos cookies
              </h3>
              <p className="text-sm text-base-content/70">
                Utilizamos cookies técnicas para el funcionamiento del sitio.
                No usamos cookies de análisis ni marketing actualmente, pero puedes configurar tus preferencias para el futuro.{' '}
                <a
                  href="https://solwed.es/politica-de-cookies-ue/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary hover:underline"
                >
                  Más información
                </a>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button
                onClick={acceptNecessary}
                className="btn btn-ghost btn-sm normal-case"
              >
                Solo necesarias
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="btn btn-outline btn-sm normal-case"
              >
                Configurar
              </button>
              <button
                onClick={acceptAll}
                className="btn btn-secondary btn-sm normal-case"
              >
                Aceptar todas
              </button>
            </div>
          </div>
        ) : (
          // Settings view
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-xl text-base-content">
                Configuración de cookies
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="btn btn-ghost btn-sm btn-circle"
                aria-label="Cerrar configuración"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
              {/* Necessary cookies */}
              <div className="form-control bg-base-200/50 p-4 rounded-lg">
                <label className="label cursor-pointer justify-start gap-4">
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    className="checkbox checkbox-secondary"
                  />
                  <div className="flex-1">
                    <span className="label-text font-semibold text-base-content">
                      Cookies necesarias
                    </span>
                    <p className="text-xs text-base-content/70 mt-1">
                      Esenciales para el funcionamiento del sitio. No se pueden desactivar.
                    </p>
                  </div>
                </label>
              </div>

              {/* Analytics cookies */}
              <div className="form-control bg-base-200/50 p-4 rounded-lg">
                <label className="label cursor-pointer justify-start gap-4">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                    className="checkbox checkbox-secondary"
                  />
                  <div className="flex-1">
                    <span className="label-text font-semibold text-base-content">
                      Cookies analíticas
                    </span>
                    <p className="text-xs text-base-content/70 mt-1">
                      Nos ayudan a entender cómo usas el sitio para mejorarlo. (Actualmente no implementadas)
                    </p>
                  </div>
                </label>
              </div>

              {/* Marketing cookies */}
              <div className="form-control bg-base-200/50 p-4 rounded-lg">
                <label className="label cursor-pointer justify-start gap-4">
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                    className="checkbox checkbox-secondary"
                  />
                  <div className="flex-1">
                    <span className="label-text font-semibold text-base-content">
                      Cookies de marketing
                    </span>
                    <p className="text-xs text-base-content/70 mt-1">
                      Usadas para mostrarte publicidad relevante. (Actualmente no implementadas)
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-base-300">
              <button
                onClick={acceptNecessary}
                className="btn btn-ghost btn-sm normal-case flex-1"
              >
                Rechazar opcionales
              </button>
              <button
                onClick={saveCustom}
                className="btn btn-secondary btn-sm normal-case flex-1"
              >
                Guardar preferencias
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
