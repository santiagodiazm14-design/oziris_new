/** Claves y tiempos de la sesion (compartidos por AuthContext, el guardian de inactividad y el login). */
export const LAST_ACTIVITY_KEY = 'oziris_last_activity';
export const SESSION_EXPIRED_KEY = 'oziris_session_expired';

const minutes = Number(process.env.NEXT_PUBLIC_IDLE_TIMEOUT_MINUTES);
/** Minutos sin actividad antes de cerrar la sesion (15 por defecto). */
export const IDLE_TIMEOUT_MS = (Number.isFinite(minutes) && minutes > 0 ? minutes : 15) * 60 * 1000;
/** Aviso previo: el ultimo minuto (o la mitad del tiempo si el limite es muy corto). */
export const IDLE_WARNING_MS = Math.min(60_000, IDLE_TIMEOUT_MS / 2);
