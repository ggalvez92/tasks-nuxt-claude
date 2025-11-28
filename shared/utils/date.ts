import { format, isToday, isTomorrow, isYesterday, startOfDay, endOfDay, addDays, subDays } from 'date-fns'
import { es } from 'date-fns/locale'

export function formatDate(date: Date, formatStr: string = 'dd/MM/yyyy'): string {
  return format(date, formatStr, { locale: es })
}

export function formatRelativeDate(date: Date): string {
  if (isToday(date)) return 'Hoy'
  if (isTomorrow(date)) return 'Mañana'
  if (isYesterday(date)) return 'Ayer'
  return formatDate(date, 'dd/MM/yyyy')
}

export function getTodayRange() {
  const today = new Date()
  return {
    start: startOfDay(today),
    end: endOfDay(today)
  }
}

export function getDateRange(date: Date) {
  return {
    start: startOfDay(date),
    end: endOfDay(date)
  }
}

export function getWeekRange() {
  const today = new Date()
  return {
    start: startOfDay(subDays(today, today.getDay())),
    end: endOfDay(addDays(today, 6 - today.getDay()))
  }
}

export function getMonthRange() {
  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  return {
    start: startOfDay(firstDay),
    end: endOfDay(lastDay)
  }
}