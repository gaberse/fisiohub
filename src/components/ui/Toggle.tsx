import type { InputHTMLAttributes } from 'react'

interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  hint?: string
  labelPosition?: 'left' | 'right'
}

export function Toggle({ label, hint, labelPosition = 'right', className = '', id, ...props }: ToggleProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  const track = (
    <label className={`fh-toggle ${className}`} htmlFor={inputId}>
      <input id={inputId} type="checkbox" {...props} />
      <div className="fh-toggle-track">
        <div className="fh-toggle-thumb" />
      </div>
    </label>
  )

  if (!label) return track

  return (
    <div
      className="flex items-center gap-3"
      style={{ opacity: props.disabled ? 0.5 : 1, flexDirection: labelPosition === 'left' ? 'row-reverse' : 'row', justifyContent: labelPosition === 'left' ? 'space-between' : 'flex-start' }}
    >
      {track}
      <div>
        <p className="text-sm font-semibold text-ink-900 cursor-pointer select-none"
          onClick={() => {
            const el = document.getElementById(inputId ?? '')
            if (el) el.click()
          }}
        >
          {label}
        </p>
        {hint && <p className="text-xs font-medium text-ink-400 mt-0.5">{hint}</p>}
      </div>
    </div>
  )
}
