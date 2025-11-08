// =====================================================
// utils.js — Funciones utilitarias comunes para el frontend
// =====================================================

/**
 * Genera un identificador único compatible con todos los navegadores.
 * Usa crypto.randomUUID() si está disponible, o un fallback seguro.
 * @returns {string} ID único
 */
export function uid() {
  try {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
  } catch (e) {
    // Ignorar si crypto no está disponible
  }
  // Fallback compatible con todos los navegadores
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/**
 * Muestra un error en consola con formato consistente.
 * Si se pasa un objeto Error, también se muestra su detalle.
 * @param {string} message - Mensaje de error descriptivo
 * @param {Error} [err] - Objeto opcional con más información
 */
export function logError(message, err = null) {
  const prefix = "🚨 [DockerCalidad]";
  console.error(`${prefix} ${message}`);
  if (err) console.error(err);
}
