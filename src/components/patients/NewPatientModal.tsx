import { useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Props {
  clinicId: string
  onClose: () => void
  onCreated: () => void
}

export default function NewPatientModal({ clinicId, onClose, onCreated }: Props) {
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    birth_date: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function update(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const { error } = await supabase.from('patients').insert({
      clinic_id: clinicId,
      full_name: form.full_name,
      phone: form.phone || null,
      email: form.email || null,
      birth_date: form.birth_date || null,
      intake_completed: false,
    })

    if (error) setError('Error al guardar el paciente.')
    else onCreated()
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4" style={{ background: 'rgba(15,23,42,0.5)' }}>
      <div className="bg-white w-full md:max-w-md md:rounded-[20px] rounded-t-[20px]" style={{ boxShadow: '0 24px 64px rgba(15,23,42,.2), 0 4px 16px rgba(15,23,42,.08)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border rounded-t-[20px]">
          <h2 className="font-black text-ink-900 text-lg tracking-tight">Nuevo paciente</h2>
          <button onClick={onClose} className="fh-btn fh-btn-ghost fh-btn-icon fh-btn-sm" aria-label="Cerrar">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div className="fh-field">
            <label className="fh-field-label">
              Nombre completo <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="text"
              value={form.full_name}
              onChange={e => update('full_name', e.target.value)}
              required
              placeholder="María García López"
              className="fh-input w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="fh-field">
              <label className="fh-field-label">Teléfono</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => update('phone', e.target.value)}
                placeholder="987 654 321"
                className="fh-input w-full"
              />
            </div>
            <div className="fh-field">
              <label className="fh-field-label">Fecha de nacimiento</label>
              <input
                type="date"
                value={form.birth_date}
                onChange={e => update('birth_date', e.target.value)}
                className="fh-input w-full"
              />
            </div>
          </div>

          <div className="fh-field">
            <label className="fh-field-label">Correo electrónico</label>
            <input
              type="email"
              value={form.email}
              onChange={e => update('email', e.target.value)}
              placeholder="paciente@email.com"
              className="fh-input w-full"
            />
          </div>

          {error && (
            <div className="rounded-xl px-4 py-3" style={{ background: '#fef2f2', border: '1px solid #fee2e2' }}>
              <p className="text-sm font-medium" style={{ color: '#b91c1c' }}>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="fh-btn fh-btn-primary w-full mt-1"
          >
            {saving ? 'Guardando...' : 'Registrar paciente'}
          </button>
        </form>
      </div>
    </div>
  )
}
