import type { InputHTMLAttributes } from 'react'

interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
}

export function Radio({ label, className = '', id, ...props }: RadioProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <label
      htmlFor={inputId}
      className="flex items-center gap-2.5 cursor-pointer select-none"
      style={{ opacity: props.disabled ? 0.5 : 1 }}
    >
      <input
        id={inputId}
        type="radio"
        className={`fh-radio ${className}`}
        {...props}
      />
      {label && (
        <span className="text-sm font-semibold text-ink-900">{label}</span>
      )}
    </label>
  )
}

/* ── RadioGroup ─────────────────────────────────────────── */

interface RadioOption {
  value: string
  label: string
  disabled?: boolean
}

interface RadioGroupProps {
  name: string
  options: RadioOption[]
  value?: string
  onChange: (value: string) => void
  label?: string
  error?: string
  direction?: 'vertical' | 'horizontal'
}

export function RadioGroup({
  name,
  options,
  value,
  onChange,
  label,
  error,
  direction = 'vertical',
}: RadioGroupProps) {
  return (
    <div className="fh-field">
      {label && <p className="fh-field-label">{label}</p>}
      <div className={direction === 'horizontal' ? 'flex flex-wrap gap-4' : 'flex flex-col gap-3'}>
        {options.map(opt => (
          <Radio
            key={opt.value}
            name={name}
            label={opt.label}
            value={opt.value}
            checked={value === opt.value}
            disabled={opt.disabled}
            onChange={() => onChange(opt.value)}
          />
        ))}
      </div>
      {error && (
        <p className="text-xs font-medium" style={{ color: '#dc2626' }}>{error}</p>
      )}
    </div>
  )
}
