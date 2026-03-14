export const TIMEZONE_OPTIONS = [
  {
    value: 'Asia/Jakarta',
    label: 'WIB — Waktu Indonesia Barat (UTC+7)',
    short: 'WIB',
  },
  {
    value: 'Asia/Makassar',
    label: 'WITA — Waktu Indonesia Tengah (UTC+8)',
    short: 'WITA',
  },
  {
    value: 'Asia/Jayapura',
    label: 'WIT — Waktu Indonesia Timur (UTC+9)',
    short: 'WIT',
  },
]

export function tzLabel(timezone: string): string {
  return TIMEZONE_OPTIONS.find((o) => o.value === timezone)?.short ?? 'WITA'
}

export function formatTimeInTz(date: string | Date, timezone: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone,
    hour12: false,
  }).format(new Date(date))
}

export function formatDateInTz(date: string | Date, timezone: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: timezone,
  }).format(new Date(date))
}
