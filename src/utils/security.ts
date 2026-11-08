/**
 * SkillHub Security Utilities
 * Proteções contra XSS, injeção de protocolos perigosos e rate-limiting local.
 */

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

/**
 * Sanitização de URLs por LISTA DE PERMISSÃO: só http(s) é aceito.
 * Qualquer outro esquema (javascript:, data:, vbscript:, file:, etc.) retorna '#'.
 * Sem esquema explícito, assume https://.
 */
export const sanitizeUrl = (rawUrl: string): string => {
  if (!rawUrl || typeof rawUrl !== 'string') return '#';

  // Remove tab/CR/LF (que o parser de URL do navegador ignora) e espaços nas pontas
  const trimmed = rawUrl.replace(/[\t\r\n]+/g, '').trim();
  if (!trimmed) return '#';

  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(trimmed);
  const candidate = hasScheme ? trimmed : `https://${trimmed.replace(/^\/+/, '')}`;

  try {
    const parsed = new URL(candidate);
    if (!ALLOWED_PROTOCOLS.has(parsed.protocol) || !parsed.hostname) return '#';
    return parsed.href;
  } catch {
    return '#';
  }
};

// Sanitização de texto e proteção contra payloads gigantescos
export const sanitizeText = (text: string, maxLength = 5000): string => {
  if (!text || typeof text !== 'string') return '';
  // Remove caracteres nulos e trunca caso exceda o limite
  return text.replace(/\0/g, '').slice(0, maxLength).trim();
};

// Limitador de tentativas no formulário de login.
// ATENÇÃO: roda no navegador e serve apenas como UX/atrito. A proteção real contra
// força bruta é a do Firebase Auth (auth/too-many-requests) e, idealmente, App Check.
const RATE_LIMIT_KEY = 'skillhub_login_attempts';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60 * 1000; // 60 segundos de bloqueio

interface RateLimitData {
  attempts: number;
  lockoutUntil: number | null;
}

export const loginRateLimiter = {
  getRemainingLockoutSeconds(): number {
    try {
      const raw = localStorage.getItem(RATE_LIMIT_KEY);
      if (!raw) return 0;
      const data: RateLimitData = JSON.parse(raw);
      if (!data.lockoutUntil) return 0;

      const remainingMs = data.lockoutUntil - Date.now();
      if (remainingMs <= 0) {
        // Bloqueio expirado
        this.reset();
        return 0;
      }
      return Math.ceil(remainingMs / 1000);
    } catch {
      return 0;
    }
  },

  isLocked(): boolean {
    return this.getRemainingLockoutSeconds() > 0;
  },

  recordFailedAttempt(): { isNowLocked: boolean; attempts: number; remainingSeconds: number } {
    try {
      const raw = localStorage.getItem(RATE_LIMIT_KEY);
      const data: RateLimitData = raw ? JSON.parse(raw) : { attempts: 0, lockoutUntil: null };

      data.attempts += 1;

      if (data.attempts >= MAX_ATTEMPTS) {
        data.lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
        localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
        return {
          isNowLocked: true,
          attempts: data.attempts,
          remainingSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000)
        };
      }

      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
      return {
        isNowLocked: false,
        attempts: data.attempts,
        remainingSeconds: 0
      };
    } catch {
      return { isNowLocked: false, attempts: 1, remainingSeconds: 0 };
    }
  },

  reset(): void {
    try {
      localStorage.removeItem(RATE_LIMIT_KEY);
    } catch {
      // ignore
    }
  }
};

