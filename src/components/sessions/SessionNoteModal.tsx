import { useEffect, useState } from 'react'
import { X, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { Appointment, SessionNote, PatientIntake } from '@/types'

const TREATMENT_OPTIONS = [
  'Masaje descontracturante',
  'Masaje relajante',
  'Masaje deportivo',
  'Masaje de tejido profundo',
  'Electroterapia (TENS)',
  'Ultrasonido terapéutico',
  'Magnetoterapia',
  'Termoterapia (calor)',
  'Crioterapia (frío)',
  'Kinesiotaping',
  'Ejercicios terapéuticos',
  'Movilización articular',
  'Tracción cervical',
  'Tracción lumbar',
  'Drenaje linfático',
]

const BODY_AREAS = [
  'Cuello / cervical',
  'Hombros',
  'Espalda alta / dorsal',
  'Espalda baja / lumbar',
  'Brazos',
  'Codos',
  'Manos / muñecas',
  'Caderas',
  'Glúteos',
  'Muslos',
  'Rodillas',
  'Pantorrillas',
  'Tobillos / pies',
  'Columna completa',
]

interface Props {
  appointment: Appointment
  onClose: () => void
  onSaved: () => void
}

export default function SessionNoteModal({ appointment, onClose, onSaved }: Props) {
  const { profile } = useAuth()
  const [intake, setIntake] = useState<PatientIntake | null>(null)
  const [existingNote, setExistingNote] = useState<SessionNote | null>(null)
  const [treatments, setTreatments] = useState<string[]>([])
  const [areas, setAreas] = useState<string[]>([])
  const [observations, setObservations] = useState('')
  const [recommendation, setRecommendation] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const patientId = (appointment.patient as any)?.id

  useEffect(() => {
    async function load() {
      const [{ data: intk }, { data: note }] = await Promise.all([
        supabase.from('patient_intake').select('*').eq('patient_id', patientId).single(),
        supabase.from('session_notes').select('*').eq('appointment_id', appointment.id).single(),
      ])
      setIntake(intk)
      if (note) {
        setExistingNote(note)
        setTreatments(note.treatments ?? [])
        setAreas(note.areas_treated ?? [])
        setObservations(note.observations ?? '')
        setRecommendation(note.next_session_recommendation ?? '')
      }
    }
    load()
  }, [appointment.id, patientId])

  function toggle<T>(list: T[], item: T, setter: (v: T[]) => void) {
    setter(list.includes(item) ? list.filter(x => x !== item) : [...list, item])
  }

  async function handleSave() {
    if (treatments.length === 0 || areas.length === 0) return
    setSaving(true)

    const { data: therapist } = await supabase
      .from('therapists')
      .select('id')
      .eq('profile_id', profile?.id)
      .single()

    const noteData = {
      appointment_id: appointment.id,
      therapist_id: therapist?.id,
      treatments,
      areas_treated: areas,
      observations: observations || null,
      next_session_recommendation: recommendation || null,
    }

    if (existingNote) {
      await supabase.from('session_notes').update(noteData).eq('id', existingNote.id)
    } else {
      await supabase.from('session_notes').insert(noteData)
      await supabase.from('appointments').update({ status: 'completed' }).eq('id', appointment.id)
    }

    setSaved(true)
    setSaving(false)
    setTimeout(onSaved, 1200)
  }

  if (saved) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.5)' }}>
        <div className="fh-card p-8 flex flex-col items-center gap-3" style={{ boxShadow: '0 24px 64px rgba(15,23,42,.2)' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: '#ecfdf5' }}>
            <CheckCircle className="w-7 h-7" style={{ color: '#059669' }} />
          </div>
          <p className="font-black text-ink-900 text-lg tracking-tight">¡Nota guardada!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4" style={{ background: 'rgba(15,23,42,0.5)' }}>
      <div className="bg-white w-full md:max-w-lg md:rounded-[20px] rounded-t-[20px] max-h-[92vh] flex flex-col" style={{ boxShadow: '0 24px 64px rgba(15,23,42,.2), 0 4px 16px rgba(15,23,42,.08)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0 rounded-t-[20px]">
          <div>
            <h2 className="font-black text-ink-900 text-base tracking-tight">Nota de sesión</h2>
            <p className="text-xs text-ink-400 font-medium mt-0.5">{(appointment.patient as any)?.full_name}</p>
          </div>
          <button onClick={onClose} className="fh-btn fh-btn-ghost fh-btn-icon fh-btn-sm" aria-label="Cerrar">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          {/* Patient context from intake */}
          {intake && (
            <div className="rounded-xl p-3" style={{ background: '#fffbeb' }}>
              <p className="fh-label mb-1" style={{ color: '#b45309' }}>Motivo del paciente</p>
              <p className="text-sm font-medium" style={{ color: '#92400e' }}>{intake.reason}</p>
              {intake.pain_areas?.length > 0 && (
                <p className="text-xs mt-1" style={{ color: '#b45309' }}>Zonas: {intake.pain_areas.join(', ')}</p>
              )}
            </div>
          )}

          {/* Treatments */}
          <div>
            <p className="fh-field-label mb-2">
              Tratamientos aplicados <span style={{ color: '#dc2626' }}>*</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {TREATMENT_OPTIONS.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggle(treatments, t, setTreatments)}
                  className="text-xs px-3 py-1.5 rounded-full font-semibold transition cursor-pointer"
                  style={
                    treatments.includes(t)
                      ? { background: 'var(--grad-blue)', color: 'white', border: 'none' }
                      : { background: 'white', color: '#64748b', border: '1px solid #e2e8f0' }
                  }
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Body areas */}
          <div>
            <p className="fh-field-label mb-2">
              Zonas trabajadas <span style={{ color: '#dc2626' }}>*</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {BODY_AREAS.map(area => (
                <button
                  key={area}
                  type="button"
                  onClick={() => toggle(areas, area, setAreas)}
                  className="text-xs px-3 py-1.5 rounded-full font-semibold transition cursor-pointer"
                  style={
                    areas.includes(area)
                      ? { background: '#0f172a', color: 'white', border: 'none' }
                      : { background: 'white', color: '#64748b', border: '1px solid #e2e8f0' }
                  }
                >
                  {area}
                </button>
              ))}
            </div>
          </div>

          {/* Observations */}
          <div className="fh-field">
            <label className="fh-field-label">Observaciones</label>
            <textarea
              value={observations}
              onChange={e => setObservations(e.target.value)}
              rows={3}
              placeholder="Respuesta del paciente, tensión muscular, mejoras observadas..."
              className="fh-input w-full resize-none"
              style={{ height: 'auto', paddingTop: 12, paddingBottom: 12 }}
            />
          </div>

          {/* Recommendation */}
          <div className="fh-field">
            <label className="fh-field-label">Recomendación para próxima sesión</label>
            <textarea
              value={recommendation}
              onChange={e => setRecommendation(e.target.value)}
              rows={2}
              placeholder="Continuar con..., enfocarse en..., reducir intensidad..."
              className="fh-input w-full resize-none"
              style={{ height: 'auto', paddingTop: 12, paddingBottom: 12 }}
            />
          </div>
        </div>

        <div className="px-5 py-4 border-t border-border flex-shrink-0">
          <button
            onClick={handleSave}
            disabled={saving || treatments.length === 0 || areas.length === 0}
            className="fh-btn fh-btn-primary w-full"
          >
            {saving ? 'Guardando...' : existingNote ? 'Actualizar nota' : 'Guardar nota de sesión'}
          </button>
        </div>
      </div>
    </div>
  )
}
