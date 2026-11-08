/**
 * SkillHub Security Utilities
 * Proteções contra XSS, injeção de protocolos perigosos e rate-limiting local.
 */

// Sanitização rigorosa de URLs para prevenir ataques baseados em javascript: ou data:
export const sanitizeUrl = (rawUrl: string): string => {
  if (!rawUrl || typeof rawUrl !== 'string') return '#';

  const trimmed = rawUrl.trim();

  // Rejeita explicitamente protocolos perigosos
  const dangerousProtocols = [
    'javascript:',
    'data:',
    'vbscript:',
    'file:',
    'about:'
  ];

  const lower = trimmed.toLowerCase();
  for (const protocol of dangerousProtocols) {
    if (lower.startsWith(protocol)) {
      console.warn(`[Segurança] URL com protocolo potencialmente perigoso bloqueada: ${trimmed}`);
      return '#';
    }
  }

  // Se não começa com http:// nem https://, prefixa de forma segura com https://
  if (!lower.startsWith('http://') && !lower.startsWith('https://') && !lower.startsWith('/')) {
    return `https://${trimmed}`;
  }

  return trimmed;
};

// Sanitização de texto e proteção contra payloads gigantescos
export const sanitizeText = (text: string, maxLength = 5000): string => {
  if (!text || typeof text !== 'string') return '';
  // Remove caracteres nulos e trunca caso exceda o limite
  return text.replace(/\0/g, '').slice(0, maxLength).trim();
};

// Rate Limiter para Formulário de Login (Anti-Brute-Force)
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
      const raw = sessionStorage.getItem(RATE_LIMIT_KEY);
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
      const raw = sessionStorage.getItem(RATE_LIMIT_KEY);
      const data: RateLimitData = raw ? JSON.parse(raw) : { attempts: 0, lockoutUntil: null };

      data.attempts += 1;

      if (data.attempts >= MAX_ATTEMPTS) {
        data.lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
        sessionStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
        return {
          isNowLocked: true,
          attempts: data.attempts,
          remainingSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000)
        };
      }

      sessionStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
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
      sessionStorage.removeItem(RATE_LIMIT_KEY);
    } catch {
      // ignore
    }
  }
};

