import { z } from 'zod'

/**
 * Validated at module load so a misconfigured environment fails loudly at
 * startup instead of as a confusing network error later. VITE_API_URL is
 * consumed by the dev proxy (vite.config.ts); the browser itself always
 * talks same-origin via /api.
 */
const envSchema = z.object({
  VITE_API_URL: z.url({ error: 'VITE_API_URL must be a valid URL, e.g. http://localhost:4000' }),
})

const parsed = envSchema.safeParse(import.meta.env)

if (!parsed.success) {
  throw new Error(
    `Invalid environment:\n${parsed.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n')}`,
  )
}

export const env = parsed.data
