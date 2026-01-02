import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BorderBeam from './magicui/BorderBeam';

interface ClientSearchProps {
  clients: string[];
  isMobile?: boolean;
}

export default function ClientSearch({ clients, isMobile = false }: ClientSearchProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalizar texto para búsqueda
  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
  };

  // Filtrar clientes
  const filteredClients = query
    ? clients.filter((client) =>
        normalizeText(client).includes(normalizeText(query))
      )
    : clients;

  const hasResults = filteredClients.length > 0;

  // Navegar al ERP
  const goToERP = (clientId: string) => {
    if (clientId.trim()) {
      window.location.href = `https://${normalizeText(clientId)}.erpsolwed.es`;
    }
  };

  // Manejar Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredClients.length > 0) {
        goToERP(filteredClients[0]);
      } else if (query.trim()) {
        goToERP(query);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      setIsFocused(false);
    }
  };

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Partículas flotantes
  const particles = Array.from({ length: isMobile ? 3 : 5 });

  return (
    <div ref={containerRef} className="relative">
      {/* Input Container */}
      <motion.div
        initial={false}
        animate={{
          scale: isFocused ? 1.02 : 1,
        }}
        transition={{ duration: 0.2 }}
        className="relative"
      >
        <div
          className={`
            relative flex items-center gap-2
            bg-gradient-to-r from-secondary/20 via-secondary/10 to-primary/20
            border-2 transition-all duration-300
            ${
              isFocused
                ? 'border-secondary shadow-[0_0_20px_rgba(242,229,0,0.3)]'
                : 'border-secondary/50 hover:border-secondary/70'
            }
            ${isMobile ? 'rounded-xl px-4 py-3' : 'rounded-pill px-4 py-2'}
            overflow-hidden
          `}
        >
          {/* BorderBeam animado */}
          {isFocused && (
            <BorderBeam
              size={isMobile ? 200 : 150}
              duration={8}
              borderWidth={2}
              colorFrom="#F2E500"
              colorTo="#ffffff"
            />
          )}

          {/* Efecto shimmer de fondo */}
          {isFocused && (
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            />
          )}

          {/* Partículas flotantes */}
          <AnimatePresence>
            {isFocused &&
              particles.map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{
                    y: -20,
                    opacity: [0, 1, 0],
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: 'easeOut',
                  }}
                  className="absolute w-1 h-1 bg-secondary rounded-full"
                  style={{
                    left: `${20 + i * 15}%`,
                    top: '50%',
                  }}
                />
              ))}
          </AnimatePresence>

          {/* Icono de búsqueda */}
          <motion.svg
            animate={{
              rotate: isFocused ? 360 : 0,
              scale: isFocused ? 1.1 : 1,
            }}
            transition={{ duration: 0.3 }}
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-secondary relative z-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </motion.svg>

          {/* Input */}
          <input
            type="text"
            placeholder={
              isMobile ? 'Buscar mi empresa...' : '¿Ya eres cliente? Accede aquí'
            }
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
              setShowDropdown(true);
            }}
            onKeyDown={handleKeyDown}
            className={`
              bg-transparent border-none outline-none
              font-body text-sm text-white
              placeholder:text-gray-custom/70
              focus:placeholder:text-gray-custom/40
              transition-all relative z-10
              ${isMobile ? 'w-full' : 'w-52'}
            `}
          />

          {/* Badge Enter */}
          <AnimatePresence>
            {isFocused && !isMobile && (
              <motion.kbd
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="kbd kbd-sm bg-base-300/50 text-xs text-gray-custom relative z-10"
              >
                Enter
              </motion.kbd>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`
              absolute top-full left-0 right-0 mt-2
              bg-base-200/95 backdrop-blur-md
              border border-secondary/30
              ${isMobile ? 'rounded-xl' : 'rounded-2xl'}
              shadow-2xl shadow-secondary/20
              overflow-hidden z-50
            `}
          >
            {/* Header */}
            {!isMobile && (
              <div className="p-2 text-xs text-gray-custom/70 font-body border-b border-base-300">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                  Clientes activos ({clients.length})
                </div>
              </div>
            )}

            {/* Lista de clientes */}
            {hasResults ? (
              <ul
                className={`max-h-${isMobile ? '48' : '64'} overflow-y-auto custom-scrollbar`}
              >
                {filteredClients.map((client, index) => (
                  <motion.li
                    key={client}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <button
                      type="button"
                      onClick={() => goToERP(client)}
                      className="
                        group w-full px-4 py-3 text-left font-body
                        hover:bg-gradient-to-r hover:from-secondary/20 hover:to-secondary/10
                        transition-all duration-200
                        flex items-center gap-3
                        border-b border-base-300/50 last:border-b-0
                        relative overflow-hidden
                      "
                    >
                      {/* Efecto glow al hover */}
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-secondary/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />

                      {/* Avatar */}
                      <motion.span
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="
                          w-8 h-8 rounded-full
                          bg-gradient-to-br from-secondary/30 to-secondary/10
                          flex items-center justify-center
                          text-secondary font-heading text-sm
                          border border-secondary/20
                          relative z-10
                        "
                      >
                        {client.charAt(0).toUpperCase()}
                      </motion.span>

                      {/* Info */}
                      <div className="relative z-10">
                        <div className="text-white group-hover:text-secondary transition-colors font-medium">
                          {client}
                        </div>
                        <div className="text-xs text-gray-custom/60 group-hover:text-gray-custom/80 transition-colors">
                          {client}.erpsolwed.es
                        </div>
                      </div>

                      {/* Icono flecha */}
                      <motion.svg
                        initial={{ x: -5, opacity: 0 }}
                        whileHover={{ x: 0, opacity: 1 }}
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-secondary ml-auto relative z-10"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5l7 7-7 7"
                        />
                      </motion.svg>
                    </button>
                  </motion.li>
                ))}
              </ul>
            ) : (
              /* Mensaje cuando no hay resultados */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 text-center border-t border-base-300"
              >
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-16 h-16 mx-auto mb-4 rounded-full bg-base-300/50 flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-gray-custom/50"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </motion.div>

                <p className="text-gray-custom/70 text-sm mb-4">
                  "<span className="text-secondary font-medium">{query}</span>" no
                  está en nuestra lista
                </p>

                <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-2`}>
                  <button
                    onClick={() => goToERP(query)}
                    className="btn btn-outline btn-sm rounded-pill flex-1 group relative overflow-hidden"
                  >
                    <span className="relative z-10">Probar igualmente</span>
                    <span className="absolute inset-0 bg-secondary/10 translate-y-full group-hover:translate-y-0 transition-transform" />
                  </button>
                  <a
                    href="#pricing"
                    className="btn btn-secondary btn-sm rounded-pill flex-1"
                  >
                    Contratar ERP
                  </a>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Estilos para scrollbar personalizado */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(242, 229, 0, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(242, 229, 0, 0.5);
        }
      `}</style>
    </div>
  );
}
