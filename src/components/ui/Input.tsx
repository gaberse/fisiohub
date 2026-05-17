import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react'

/* ── Text input ─────────────────────────────────────────── */

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string
  error?: string
  hint?: string
  icon?: ReactNode
  prefix?: ReactNode
  suffix?: ReactNode
}

export function Input({ label, error, hint, icon, prefix, suffix, className = '', id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  const hasLeft = icon || prefix

  return (
    <div className="fh-field">
      {label && (
        <label htmlFor={inputId} className="fh-field-label">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none flex items-center">
            {icon}
          </div>
        )}
        {prefix && !icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none text-sm font-medium">
            {prefix}
          </div>
        )}
        <input
          id={inputId}
          className={[
            'fh-input w-full',
            error ? 'fh-input-error' : '',
            className,
          ].filter(Boolean).join(' ')}
          style={{
            paddingLeft: hasLeft ? 44 : 16,
            paddingRight: suffix ? 44 : 16,
          }}
          {...props}
        />
        {suffix && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-400 flex items-center">
            {suffix}
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs font-medium" style={{ color: '#dc2626' }}>{error}</p>
      )}
      {hint && !error && (
        <p className="text-xs font-medium text-ink-400">{hint}</p>
      )}
    </div>
  )
}

/* ── Textarea ───────────────────────────────────────────── */

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export function Textarea({ label, error, hint, className = '', id, rows = 3, ...props }: TextareaProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="fh-field">
      {label && (
        <label htmlFor={inputId} className="fh-field-label">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        className={[
          'fh-input w-full resize-none',
          error ? 'fh-input-error' : '',
          className,
        ].filter(Boolean).join(' ')}
        style={{ height: 'auto', paddingTop: 12, paddingBottom: 12 }}
        {...props}
      />
      {error && (
        <p className="text-xs font-medium" style={{ color: '#dc2626' }}>{error}</p>
      )}
      {hint && !error && (
        <p className="text-xs font-medium text-ink-400">{hint}</p>
      )}
    </div>
  )
}
