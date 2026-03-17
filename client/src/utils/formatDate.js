import { format, formatDistance, isToday, isTomorrow } from 'date-fns'

export const formatDate = (date, fmt = 'dd MMM yyyy') =>
  format(new Date(date), fmt)

export const formatDateTime = (date) =>
  format(new Date(date), 'dd MMM yyyy, hh:mm a')

export const formatRelative = (date) =>
  formatDistance(new Date(date), new Date(), { addSuffix: true })

export const formatEventDate = (date) => {
  const d = new Date(date)
  if (isToday(d)) return 'Today'
  if (isTomorrow(d)) return 'Tomorrow'
  return format(d, 'MMMM d, yyyy')
}

export const countdown = (eventDate) => {
  const now = new Date()
  const event = new Date(eventDate)
  const diff = event - now
  if (diff <= 0) return 'Event passed'
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days > 30) return `${Math.floor(days / 30)} months away`
  return `${days} days away`
}
