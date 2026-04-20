import DOMPurify from 'isomorphic-dompurify'

/**
 * Remove qualquer HTML/script de uma string de texto plano.
 * Use antes de salvar qualquer input de usuário no Firestore
 * (nome, descrição, comentário, endereço, etc).
 */
export function sanitizeText(input: unknown): string {
  if (typeof input !== 'string') return ''
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim()
}

/**
 * Sanitiza HTML permitindo apenas tags de formatação básicas.
 * Use apenas quando realmente precisar renderizar HTML do usuário
 * (ex: descrição rica). Na maioria dos casos, prefira sanitizeText.
 */
export function sanitizeHtml(input: unknown): string {
  if (typeof input !== 'string') return ''
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'a'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOWED_URI_REGEXP: /^(https?:|mailto:)/i,
  })
}

/**
 * Sanitiza recursivamente todas as strings de um objeto.
 * Útil para inputs de formulário antes de persistir.
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') out[key] = sanitizeText(value)
    else if (Array.isArray(value)) {
      out[key] = value.map((v) => (typeof v === 'string' ? sanitizeText(v) : v))
    } else if (value && typeof value === 'object') {
      out[key] = sanitizeObject(value as Record<string, unknown>)
    } else {
      out[key] = value
    }
  }
  return out as T
}
