/**
 * Logger seguro para produção.
 * - Em dev: loga normalmente no console.
 * - Em prod: silencia log/info/debug; mantém warn/error (mas sem dados sensíveis).
 *
 * Nunca passe tokens, senhas, dados de outros usuários ou PII para este logger.
 */
const isDev = process.env.NODE_ENV !== 'production'

export const logger = {
  log: (...args: unknown[]) => {
    if (isDev) console.log(...args)
  },
  info: (...args: unknown[]) => {
    if (isDev) console.info(...args)
  },
  debug: (...args: unknown[]) => {
    if (isDev) console.debug(...args)
  },
  warn: (...args: unknown[]) => {
    console.warn(...args)
  },
  error: (...args: unknown[]) => {
    console.error(...args)
  },
}
