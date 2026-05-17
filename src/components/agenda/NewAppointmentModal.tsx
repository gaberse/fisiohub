import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { X, Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Patient, Therapist } from '@/types'

interface Props {
  clinicId: string
  branchId: string
  selectedDate: Date
  onClose: () => void
  onCreated: () => void
}

export default function NewAppointmentModal({ clinicId, branchId, selectedDate, onClose, onCreated }: Props) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [therapists, setTherapists] = useState<Therapist[]>([])
  const [patientSearch, setPatientSearch] = useState('')
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    patient_id: '',
    therapist_id: '',
    date: format(selectedDate, 'yyyy-MM-dd'),
    time: '09:00',
    duration_minutes: 60,
    notes: '',
  })

  useEffect(() => {
    async function loadData() {
      const [{ data: p }, { data: t }] = await Promise.all([
        supabase.from('patients').select('*').eq('clinic_id', clinicId).order('full_name'),
        supabase.from('therapists').select('*').eq('branch_id', branchId).order('full_name'),
      ])
      setPatients((p ?? []) as Patient[])
      setTherapists((t ?? []) as Therapist[])
    }
    loadData()
  }, [clinicId])

  useEffect(() => {
    const q = patientSearch.toLowerCase()
    setFilteredPatients(
      q ? patients.filter(p => p.full_name.toLowerCase().includes(q)) : patients.slice(0, 8)
    )
  }, [patientSearch, patients])

  function update(field: string, value: string | number) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.patient_id || !form.therapist_id) return
    setSaving(true)

    const scheduled_at = `${form.date}T${form.time}:00`
    const { error } = await supabase.from('appointments').insert({
      clinic_id: clinicId,
      branch_id: branchId,
      patient_id: form.patient_id,
      therapist_id: form.therapist_id,
      scheduled_at,
      duration_minutes: form.duration_minutes,
      notes: form.notes || null,
      status: 'scheduled',
    })

    if (!error) onCreated()
    setSaving(false)
  }

  const selectedPatient = patients.find(p => p.id === form.patient_id)

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4" style={{ background: 'rgba(15,23,42,0.5)' }}>
      <div className="bg-white w-full md:max-w-md md:rounded-[20px] rounded-t-[20px] shadow-lg max-h-[90vh] overflow-y-auto" style={{ boxShadow: '0 24px 64px rgba(15,23,42,.2), 0 4px 16px rgba(15,23,42,.08)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-white rounded-t-[20px]">
          <h2 className="font-black text-ink-900 text-lg tracking-tight">Nueva cita</h2>
          <button onClick={onClose} className="fh-btn fh-btn-ghost fh-btn-icon fh-btn-sm" aria-label="Cerrar">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {/* Patient search */}
          <div className="fh-field">
            <label className="fh-field-label">Paciente</label>
            {!form.patient_id ? (
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                <input
                  type="text"
                  value={patientSearch}
                  onChange={e => setPatientSearch(e.target.value)}
                  placeholder="Buscar paciente..."
                  className="fh-input w-full pl-10"
                />
                {filteredPatients.length > 0 && (
                  <div className="absolute top-full mt-1 left-0 right-0 bg-white rounded-xl border border-border shadow-lg z-10 max-h-48 overflow-y-auto" style={{ boxShadow: 'var(--shadow-md)' }}>
                    {filteredPatients.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => { update('patient_id', p.id); setPatientSearch('') }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-bg transition cursor-pointer"
                      >
                        <span className="font-semibold text-ink-900">{p.full_name}</span>
                        {p.phone && <span className="text-ink-400 ml-2 text-xs">{p.phone}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-xl px-3 py-2.5" style={{ background: '#eff6ff' }}>
                <span className="text-sm font-semibold text-blue-deep">{selectedPatient?.full_name}</span>
                <button
                  type="button"
                  onClick={() => update('patient_id', '')}
                  className="text-ink-400 hover:text-ink-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Therapist */}
          <div className="fh-field">
            <label className="fh-field-label">Terapeuta</label>
            <select
              value={form.therapist_id}
              onChange={e => update('therapist_id', e.target.value)}
              required
              className="fh-input w-full"
            >
              <option value="">Seleccionar terapeuta</option>
              {therapists.map(t => (
                <option key={t.id} value={t.id}>{t.full_name}</option>
              ))}
            </select>
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="fh-field">
              <label className="fh-field-label">Fecha</label>
              <input
                type="date"
                value={form.date}
                onChange={e => update('date', e.target.value)}
                required
                className="fh-input w-full"
              />
            </div>
            <div className="fh-field">
              <label className="fh-field-label">Hora</label>
              <input
                type="time"
                value={form.time}
                onChange={e => update('time', e.target.value)}
                required
                className="fh-input w-full"
              />
            </div>
          </div>

          {/* Duration */}
          <div className="fh-field">
            <label className="fh-field-label">Duración</label>
            <div className="flex gap-2">
              {[30, 45, 60, 90].map(min => (
                <button
                  key={min}
                  type="button"
                  onClick={() => update('duration_minutes', min)}
                  className="flex-1 py-2 rounded-xl text-sm font-bold transition cursor-pointer"
                  style={
                    form.duration_minutes === min
                      ? { background: 'var(--grad-blue)', color: 'white' }
                      : { background: 'white', color: '#64748b', border: '1px solid #e2e8f0' }
                  }
                >
                  {min}m
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="fh-field">
            <label className="fh-field-label">Notas <span className="text-ink-400 font-medium normal-case tracking-normal">(opcional)</span></label>
            <textarea
              value={form.notes}
              onChange={e => update('notes', e.target.value)}
              rows={2}
              placeholder="Indicaciones especiales..."
              className="fh-input w-full resize-none"
              style={{ height: 'auto', paddingTop: 12, paddingBottom: 12 }}
            />
          </div>

          <button
            type="submit"
            disabled={saving || !form.patient_id || !form.therapist_id}
            className="fh-btn fh-btn-primary w-full mt-1"
          >
            {saving ? 'Guardando...' : 'Agendar cita'}
          </button>
        </form>
      </div>
    </div>
  )
}
