/** Join class names, skipping falsy values. Avoids a dependency for one line. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}
