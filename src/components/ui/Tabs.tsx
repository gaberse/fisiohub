import type { ReactNode } from 'react'

interface Tab {
  label: string
  value: string
}

/* ── Tabs · segmented (pill) ────────────────────────────── */

interface TabsProps {
  tabs: Tab[]
  value: string
  onChange: (value: string) => void
  className?: string
}

export function Tabs({ tabs, value, onChange, className = '' }: TabsProps) {
  return (
    <div className={`fh-tabs ${className}`}>
      {tabs.map(tab => (
        <button
          key={tab.value}
          className="fh-tab"
          aria-selected={tab.value === value ? 'true' : 'false'}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

/* ── TabLine · underlined (page sections) ────────────────── */

interface TabLineProps {
  tabs: Tab[]
  value: string
  onChange: (value: string) => void
  className?: string
}

export function TabLine({ tabs, value, onChange, className = '' }: TabLineProps) {
  return (
    <div className={`fh-tabline ${className}`}>
      {tabs.map(tab => (
        <button
          key={tab.value}
          className="fh-tabline-item"
          aria-selected={tab.value === value ? 'true' : 'false'}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

/* ── TabPanel · controlled content area ─────────────────── */

interface TabPanelProps {
  value: string
  activeValue: string
  children: ReactNode
}

export function TabPanel({ value, activeValue, children }: TabPanelProps) {
  if (value !== activeValue) return null
  return <>{children}</>
}
