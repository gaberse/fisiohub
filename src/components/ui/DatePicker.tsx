import { useState, useRef, useEffect } from 'react'
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, isToday,
  addMonths, subMonths, isAfter, isBefore, parseISO,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'

interface DatePickerProps {
  value?: Date | string | null
  onChange: (date: Date) => void
  label?: string
  error?: string
  placeholder?: string
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
  className?: string
}

const WEEKDAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']

export function DatePicker({
  value,
  onChange,
  label,
  error,
  placeholder = 'Seleccionar fecha',
  disabled = false,
  minDate,
  maxDate,
  className = '',
}: DatePickerProps) {
  const selected = value
    ? typeof value === 'string' ? parseISO(value) : value
    : null

  const [open, setOpen] = useState(false)
  const [cursor, setCursor] = useState(selected ?? new Date())
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (selected) setCursor(selected)
  }, [value])

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 }),
  })

  function isDisabled(day: Date) {
    if (minDate && isBefore(day, minDate)) return true
    if (maxDate && isAfter(day, maxDate)) return true
    return false
  }

  function handleDay(day: Date) {
    if (!isSameMonth(day, cursor)) return
    if (isDisabled(day)) return
    onChange(day)
    setOpen(false)
  }

  function dayClass(day: Date) {
    const classes = ['fh-cal-day']
    if (!isSameMonth(day, cursor)) return 'fh-cal-day fh-cal-day--outside'
    if (isDisabled(day)) classes.push('fh-cal-day--disabled')
    else if (selected && isSameDay(day, selected)) classes.push('fh-cal-day--selected')
    else if (isToday(day)) classes.push('fh-cal-day--today')
    return classes.join(' ')
  }

  const displayValue = selected
    ? format(selected, "d 'de' MMMM yyyy", { locale: es })
    : ''

  const triggerClasses = [
    'fh-input w-full flex items-center gap-2.5 select-none',
    error ? 'fh-input-error' : '',
    open ? 'border-blue-mid' : '',
    disabled ? 'fh-input fh-select-disabled' : 'cursor-pointer',
    className,
  ].filter(Boolean).join(' ')

  return (
    <div className="fh-field">
      {label && <label className="fh-field-label">{label}</label>}

      <div ref={ref} className="relative">
        <div
          className={triggerClasses}
          style={open && !error ? { borderColor: '#3b82f6', boxShadow: '0 0 0 4px rgba(59,130,246,.14)' } : undefined}
          onClick={() => !disabled && setOpen(o => !o)}
          role="button"
          aria-expanded={open}
        >
          <CalendarDays size={16} className="text-ink-400 flex-shrink-0" />
          <span className={displayValue ? 'text-sm font-semibold text-ink-900' : 'text-sm font-medium text-ink-400'}>
            {displayValue || placeholder}
          </span>
        </div>

        {open && (
          <div className="fh-picker-dropdown">
            {/* Month navigation */}
            <div className="fh-cal-nav">
              <button className="fh-cal-nav-btn" onClick={() => setCursor(subMonths(cursor, 1))}>
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-extrabold text-ink-900" style={{ letterSpacing: '-0.01em' }}>
                {format(cursor, 'MMMM yyyy', { locale: es })}
              </span>
              <button className="fh-cal-nav-btn" onClick={() => setCursor(addMonths(cursor, 1))}>
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Weekday headers + day grid */}
            <div className="fh-cal-grid">
              {WEEKDAYS.map(d => (
                <div key={d} className="fh-cal-weekday">{d}</div>
              ))}
              {days.map(day => (
                <button
                  key={day.toISOString()}
                  className={dayClass(day)}
                  onClick={() => handleDay(day)}
                  tabIndex={isSameMonth(day, cursor) ? 0 : -1}
                >
                  {format(day, 'd')}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs font-medium" style={{ color: '#dc2626' }}>{error}</p>
      )}
    </div>
  )
}
