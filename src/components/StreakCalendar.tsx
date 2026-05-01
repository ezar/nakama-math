import { useMemo } from 'react'

interface StreakCalendarProps {
  activityDates: string[]   // YYYY-MM-DD strings, most recent first
  lastDailyDate?: string
  label: string
}

export function StreakCalendar({ activityDates, lastDailyDate, label }: StreakCalendarProps) {
  const WEEKS = 10

  const days = useMemo(() => {
    const set = new Set(activityDates)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Find the Monday of the current week (dow: 0=Sun→back 6, 1=Mon→back 0, …)
    const dow = today.getDay()
    const daysToMonday = dow === 0 ? 6 : dow - 1
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - daysToMonday - (WEEKS - 1) * 7)

    return Array.from({ length: WEEKS * 7 }, (_, i) => {
      const d = new Date(startDate)
      d.setDate(startDate.getDate() + i)
      const str = d.toISOString().slice(0, 10)
      const isFuture = d > today
      return { str, active: !isFuture && set.has(str), isDaily: str === lastDailyDate, isFuture }
    })
  }, [activityDates, lastDailyDate])

  const dayLabels = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

  return (
    <div className="flex flex-col gap-1">
      <p className="font-nunito text-xs text-gray-500">{label}</p>
      <div className="flex gap-0.5">
        {/* Day labels column */}
        <div className="flex flex-col gap-0.5 mr-1">
          {dayLabels.map(l => (
            <div key={l} className="w-3 h-3 flex items-center justify-center">
              <span className="font-nunito text-[8px] text-gray-600">{l}</span>
            </div>
          ))}
        </div>
        {/* Week columns */}
        {Array.from({ length: WEEKS }, (_, week) => (
          <div key={week} className="flex flex-col gap-0.5">
            {Array.from({ length: 7 }, (_, dow) => {
              const day = days[week * 7 + dow]
              return (
                <div
                  key={dow}
                  title={day.str}
                  className={`w-3 h-3 rounded-[2px] transition-colors ${
                    day.isFuture   ? 'bg-navy-800'
                    : day.isDaily  ? 'bg-gold-400'
                    : day.active   ? 'bg-emerald-500'
                    : 'bg-navy-700'
                  }`}
                />
              )
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-0.5">
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-500" />
          <span className="font-nunito text-[9px] text-gray-500">Jugado</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-[2px] bg-gold-400" />
          <span className="font-nunito text-[9px] text-gray-500">Reto diario</span>
        </div>
      </div>
    </div>
  )
}
