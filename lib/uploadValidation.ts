export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB

export function validateImageFile(file: File): { ok: true } | { ok: false; error: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return { ok: false, error: 'Tipo inválido. Use JPG, PNG ou WebP.' }
  }
  if (file.size > MAX_IMAGE_SIZE) {
    const mb = (file.size / 1024 / 1024).toFixed(1)
    return { ok: false, error: `Arquivo muito grande (${mb}MB). Máx: 5MB.` }
  }
  if (file.size === 0) {
    return { ok: false, error: 'Arquivo vazio.' }
  }
  return { ok: true }
}

export function validateImageFiles(files: File[]): { ok: true } | { ok: false; error: string } {
  for (const f of files) {
    const res = validateImageFile(f)
    if (!res.ok) return res
  }
  return { ok: true }
}
