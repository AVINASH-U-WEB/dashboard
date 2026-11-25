/**
 * Formats an ISO date or datetime string using locale formatting.
 * Returns a fallback dash when missing or unparseable.
 */
export function formatDisplayDate(value: string | null | undefined): string {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '—'
  return parsed.toLocaleDateString()
}

/**
 * Truncates a UUID/hash identifier for compact table display.
 */
export function truncateIdentifier(
  value: string | null | undefined,
  length: number = 12
): string {
  if (!value) return '—'
  return value.length > length ? `${value.slice(0, length)}...` : value
}

/**
 * Formats a customer city and state pair safely.
 */
export function formatCustomerLocation(
  city: string | null | undefined,
  state: string | null | undefined
): { city: string; state: string } {
  return {
    city: city?.trim() || 'Unknown city',
    state: state?.trim() || '—',
  }
}
