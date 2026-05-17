import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react'

/* ── Text input ─────────────────────────────────────────── */

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string
  error?: string
  hint?: string
  prefix?: ReactNode
  suffix?: ReactNode
}

export function Input({ label, error, hint, prefix, suffix, className = '', id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="fh-field">
      {label && (
        <label htmlFor={inputId} className="fh-field-label">
          {label}
        </label>
      )}
      <div className="relative">
        {prefix && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none">
            {prefix}
          </div>
        )}
        <input
          id={inputId}
          className={[
            'fh-input w-full',
            error ? 'fh-input-error' : '',
            prefix ? 'pl-10' : '',
            suffix ? 'pr-10' : '',
            className,
          ].filter(Boolean).join(' ')}
          {...props}
        />
        {suffix && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-500">
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
