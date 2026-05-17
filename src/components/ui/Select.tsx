import { useState, useRef, useEffect, type ReactNode } from 'react'
import { ChevronDown, Check } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
  sub?: string
  icon?: ReactNode
}

export interface SelectGroup {
  label?: string
  options: SelectOption[]
}

interface SelectProps {
  options?: SelectOption[]
  groups?: SelectGroup[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  error?: string
  icon?: ReactNode
  disabled?: boolean
  className?: string
}

export function Select({
  options,
  groups,
  value,
  onChange,
  placeholder = 'Seleccionar…',
  label,
  error,
  icon,
  disabled = false,
  className = '',
}: SelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const allOptions: SelectOption[] = groups
    ? groups.flatMap(g => g.options)
    : (options ?? [])

  const selected = allOptions.find(o => o.value === value)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleSelect(val: string) {
    onChange(val)
    setOpen(false)
  }

  const triggerClasses = [
    'fh-input w-full flex items-center justify-between gap-2 select-none',
    'fh-select-trigger',
    open && !error ? 'fh-select-open' : '',
    error ? 'fh-select-error' : '',
    disabled ? 'fh-select-disabled' : 'cursor-pointer',
  ].filter(Boolean).join(' ')

  return (
    <div className={`fh-field ${className}`}>
      {label && <label className="fh-field-label">{label}</label>}

      <div ref={ref} className="relative">
        {/* Trigger */}
        <div
          className={triggerClasses}
          onClick={() => !disabled && setOpen(o => !o)}
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {icon && <span className="text-ink-500 flex-shrink-0">{icon}</span>}
            {selected ? (
              <div className="min-w-0">
                <div className="text-sm font-semibold text-ink-900 truncate">{selected.label}</div>
                {selected.sub && (
                  <div className="text-xs font-medium text-ink-500 truncate">{selected.sub}</div>
                )}
              </div>
            ) : (
              <span className="text-sm font-medium text-ink-400">{placeholder}</span>
            )}
          </div>
          <ChevronDown
            size={16}
            className="text-ink-500 flex-shrink-0 transition-transform duration-150"
            style={{ transform: open ? 'rotate(180deg)' : 'none' }}
          />
        </div>

        {/* Dropdown menu */}
        {open && (
          <div
            className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white rounded-xl overflow-hidden"
            style={{
              border: '1px solid #e2e8f0',
              boxShadow: '0 16px 40px rgba(15,23,42,.14), 0 2px 6px rgba(15,23,42,.06)',
              padding: 6,
            }}
            role="listbox"
          >
            {groups
              ? groups.map((group, gi) => (
                  <div key={gi}>
                    {gi > 0 && <div className="my-1.5 mx-1" style={{ height: 1, background: '#e2e8f0' }} />}
                    {group.label && (
                      <div className="fh-label px-3 pt-2 pb-1">{group.label}</div>
                    )}
                    {group.options.map(opt => (
                      <OptionRow
                        key={opt.value}
                        option={opt}
                        selected={opt.value === value}
                        onSelect={handleSelect}
                      />
                    ))}
                  </div>
                ))
              : (options ?? []).map(opt => (
                  <OptionRow
                    key={opt.value}
                    option={opt}
                    selected={opt.value === value}
                    onSelect={handleSelect}
                  />
                ))}
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs font-medium" style={{ color: '#dc2626' }}>{error}</p>
      )}
    </div>
  )
}

function OptionRow({
  option,
  selected,
  onSelect,
}: {
  option: SelectOption
  selected: boolean
  onSelect: (v: string) => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5 rounded-[9px] cursor-pointer"
      style={{
        background: hovered ? '#f8fafc' : selected ? '#eff6ff' : 'transparent',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect(option.value)}
      role="option"
      aria-selected={selected}
    >
      {option.icon && <div className="flex-shrink-0">{option.icon}</div>}
      <div className="flex-1 min-w-0">
        <div
          className="text-sm text-ink-900 truncate"
          style={{ fontWeight: selected ? 800 : 600, letterSpacing: '-0.01em' }}
        >
          {option.label}
        </div>
        {option.sub && (
          <div className="text-xs font-medium text-ink-500 truncate">{option.sub}</div>
        )}
      </div>
      {selected && <Check size={15} className="flex-shrink-0 text-blue-deep" strokeWidth={2.5} />}
    </div>
  )
}
