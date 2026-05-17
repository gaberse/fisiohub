import { useState, useRef, useEffect, useCallback } from 'react'
import { Clock } from 'lucide-react'

interface TimePickerProps {
  value?: string        // "HH:mm"
  onChange: (time: string) => void
  label?: string
  error?: string
  placeholder?: string
  disabled?: boolean
  minTime?: string      // "HH:mm"
  maxTime?: string      // "HH:mm"
  step?: number         // minutes, default 30
  className?: string
}

function toMinutes(time: string) {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function generateSlots(min: string, max: string, step: number): string[] {
  const slots: string[] = []
  let current = toMinutes(min)
  const end = toMinutes(max)
  while (current <= end) {
    const h = Math.floor(current / 60).toString().padStart(2, '0')
    const m = (current % 60).toString().padStart(2, '0')
    slots.push(`${h}:${m}`)
    current += step
  }
  return slots
}

export function TimePicker({
  value,
  onChange,
  label,
  error,
  placeholder = 'Seleccionar hora',
  disabled = false,
  minTime = '07:00',
  maxTime = '20:00',
  step = 30,
  className = '',
}: TimePickerProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selectedRef = useRef<HTMLButtonElement>(null)

  const slots = generateSlots(minTime, maxTime, step)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const scrollToSelected = useCallback(() => {
    selectedRef.current?.scrollIntoView({ block: 'nearest' })
  }, [])

  useEffect(() => {
    if (open) setTimeout(scrollToSelected, 0)
  }, [open, scrollToSelected])

  function handleSelect(slot: string) {
    onChange(slot)
    setOpen(false)
  }

  const triggerClasses = [
    'fh-input w-full flex items-center gap-2.5 select-none',
    error ? 'fh-input-error' : '',
    disabled ? 'fh-select-disabled' : 'cursor-pointer',
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
          <Clock size={16} className="text-ink-400 flex-shrink-0" />
          <span className={value ? 'text-sm font-semibold text-ink-900' : 'text-sm font-medium text-ink-400'}>
            {value || placeholder}
          </span>
        </div>

        {open && (
          <div className="fh-picker-dropdown" style={{ padding: 8, minWidth: 160 }}>
            <div className="fh-time-list">
              {slots.map(slot => {
                const isSelected = slot === value
                return (
                  <button
                    key={slot}
                    ref={isSelected ? selectedRef : undefined}
                    className={`fh-time-slot${isSelected ? ' fh-time-slot--selected' : ''}`}
                    onClick={() => handleSelect(slot)}
                  >
                    {slot}
                  </button>
                )
              })}
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
