import type { InputHTMLAttributes } from 'react'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: string
  indeterminate?: boolean
}

export function Checkbox({ label, error, indeterminate, className = '', id, ...props }: CheckboxProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className="flex items-center gap-2.5 cursor-pointer select-none"
        style={{ opacity: props.disabled ? 0.5 : 1 }}
      >
        <input
          id={inputId}
          type="checkbox"
          className={`fh-checkbox ${className}`}
          ref={node => {
            if (node) node.indeterminate = !!indeterminate
          }}
          {...props}
        />
        {label && (
          <span className="text-sm font-semibold text-ink-900">{label}</span>
        )}
      </label>
      {error && (
        <p className="text-xs font-medium" style={{ color: '#dc2626' }}>{error}</p>
      )}
    </div>
  )
}
