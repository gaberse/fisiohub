import { useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Appointment } from '@/types'

interface Props {
  appointment: Appointment
  onClose: () => void
  onSaved: () => void
}

export default function SatisfactionModal({ appointment, onClose, onSaved }: Props) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comments, setComments] = useState('')
  const [saving, setSaving] = useState(false)

  const labels: Record<number, string> = {
    1: 'Muy malo', 2: 'Malo', 3: 'Regular', 4: 'Aceptable', 5: 'Bueno',
    6: 'Muy bueno', 7: 'Notable', 8: 'Excelente', 9: 'Sobresaliente', 10: 'Perfecto',
  }

  async function handleSave() {
    if (!rating) return
    setSaving(true)

    await supabase.from('satisfaction_surveys').insert({
      appointment_id: appointment.id,
      patient_id: appointment.patient_id,
      therapist_id: appointment.therapist_id,
      rating,
      comments: comments || null,
    })

    onSaved()
    setSaving(false)
  }

  const display = hovered || rating

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4" style={{ background: 'rgba(15,23,42,0.5)' }}>
      <div className="bg-white w-full md:max-w-sm md:rounded-[20px] rounded-t-[20px]" style={{ boxShadow: '0 24px 64px rgba(15,23,42,.2), 0 4px 16px rgba(15,23,42,.08)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border rounded-t-[20px]">
          <div>
            <h2 className="font-black text-ink-900 text-base tracking-tight">Califica la sesión</h2>
            <p className="text-xs text-ink-400 font-medium mt-0.5">{(appointment.patient as any)?.full_name}</p>
          </div>
          <button onClick={onClose} className="fh-btn fh-btn-ghost fh-btn-icon fh-btn-sm" aria-label="Cerrar">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          {/* Rating display */}
          <div className="text-center mb-6">
            <p className="font-black text-ink-900 mb-1" style={{ fontSize: 64, letterSpacing: '-0.04em', lineHeight: 1 }}>
              {display || '—'}
            </p>
            <p className="text-sm font-semibold text-ink-400 h-5">
              {display ? labels[display] : 'Selecciona una calificación'}
            </p>
          </div>

          {/* Number selector */}
          <div className="grid grid-cols-5 gap-2 mb-5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
              <button
                key={n}
                onMouseEnter={() => setHovered(n)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(n)}
                className="py-3 rounded-xl text-sm font-black transition cursor-pointer"
                style={
                  n <= (hovered || rating)
                    ? { background: 'var(--grad-blue)', color: 'white', border: 'none' }
                    : { background: 'white', color: '#94a3b8', border: '1px solid #e2e8f0' }
                }
              >
                {n}
              </button>
            ))}
          </div>

          {/* Comments */}
          <textarea
            value={comments}
            onChange={e => setComments(e.target.value)}
            rows={2}
            placeholder="Comentarios opcionales..."
            className="fh-input w-full resize-none mb-4"
            style={{ height: 'auto', paddingTop: 12, paddingBottom: 12 }}
          />

          <button
            onClick={handleSave}
            disabled={!rating || saving}
            className="fh-btn fh-btn-primary w-full"
          >
            {saving ? 'Guardando...' : 'Guardar calificación'}
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 text-sm text-ink-400 mt-2 cursor-pointer hover:text-ink-700 transition font-medium"
          >
            Omitir
          </button>
        </div>
      </div>
    </div>
  )
}
