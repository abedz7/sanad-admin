/**
 * Validated at module load so a misconfigured environment fails loudly at
 * startup instead of as a confusing network error later. VITE_API_URL is
 * consumed by the dev proxy (vite.config.ts); the browser itself always
 * talks same-origin via /api. Validated with the URL constructor rather
 * than zod so the schema library stays out of the entry chunk.
 */
function requireUrl(name: string, value: unknown): string {
  if (typeof value === 'string') {
    try {
      new URL(value)
      return value
    } catch {
      // fall through to the shared error below
    }
  }
  throw new Error(`Invalid environment: ${name} must be a valid URL, e.g. http://localhost:4000`)
}

export const env = {
  VITE_API_URL: requireUrl('VITE_API_URL', import.meta.env.VITE_API_URL),
}
