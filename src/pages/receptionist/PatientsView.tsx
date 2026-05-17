import { useEffect, useState } from 'react'
import { Plus, Search, User, Phone, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { Patient } from '@/types'
import NewPatientModal from '@/components/patients/NewPatientModal'
import PatientDetailModal from '@/components/patients/PatientDetailModal'

export default function PatientsView() {
  const { profile } = useAuth()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

  useEffect(() => {
    if (profile?.clinic_id) fetchPatients()
  }, [profile?.clinic_id])

  async function fetchPatients() {
    setLoading(true)
    const { data } = await supabase
      .from('patients')
      .select('*')
      .eq('clinic_id', profile?.clinic_id)
      .order('full_name')
    setPatients(data ?? [])
    setLoading(false)
  }

  const filtered = search
    ? patients.filter(p =>
        p.full_name.toLowerCase().includes(search.toLowerCase()) ||
        p.phone?.includes(search) ||
        p.email?.toLowerCase().includes(search.toLowerCase())
      )
    : patients

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-black text-ink-900 text-2xl tracking-tight">Pacientes</h1>
          <p className="text-sm text-ink-500 font-medium mt-0.5">{patients.length} registrados</p>
        </div>
        <button onClick={() => setShowNew(true)} className="fh-btn fh-btn-primary">
          <Plus className="w-4 h-4" />
          Nuevo
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre, teléfono o email..."
          className="fh-input w-full pl-10"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#3b82f6', borderTopColor: 'transparent' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-ink-400">
          <User className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-bold">{search ? 'Sin resultados' : 'Sin pacientes registrados'}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(patient => (
            <button
              key={patient.id}
              onClick={() => setSelectedPatient(patient)}
              className="fh-card w-full p-4 flex items-center gap-3 hover:shadow-md transition-shadow cursor-pointer text-left"
            >
              <div
                className="fh-avatar w-10 h-10 text-sm font-semibold"
                style={{ background: '#eff6ff', color: '#1e3a8a' }}
              >
                {patient.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-ink-900 truncate">{patient.full_name}</p>
                  {!patient.intake_completed && (
                    <span className="fh-badge fh-badge-amber flex-shrink-0">Sin perfil</span>
                  )}
                </div>
                {patient.phone && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-ink-400" />
                    <span className="text-xs text-ink-500">{patient.phone}</span>
                  </div>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-ink-300 flex-shrink-0" />
            </button>
          ))}
        </div>
      )}

      {showNew && (
        <NewPatientModal
          clinicId={profile?.clinic_id ?? ''}
          onClose={() => setShowNew(false)}
          onCreated={() => { setShowNew(false); fetchPatients() }}
        />
      )}

      {selectedPatient && (
        <PatientDetailModal
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
        />
      )}
    </div>
  )
}
