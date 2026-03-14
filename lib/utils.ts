import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export function formatTime(date: Date | string): string {
  return format(new Date(date), 'HH:mm')
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), 'EEEE, dd MMMM yyyy', { locale: id })
}

export function formatCountdown(targetDate: Date | string): string {
  const target = new Date(targetDate)
  const now = new Date()
  const diff = target.getTime() - now.getTime()

  if (diff <= 0) return 'Sedang berlangsung'

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  if (hours > 0)
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

export function getFloorLabel(floor: number): string {
  const labels: Record<number, string> = {
    1: 'Lantai 1',
    2: 'Lantai 2',
    3: 'Lantai 3',
    4: 'Lantai 4',
  }
  return labels[floor] ?? `Lantai ${floor}`
}
