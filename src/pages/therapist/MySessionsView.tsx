import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ClipboardList, Clock, ChevronRight, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { Appointment } from '@/types'
import SessionNoteModal from '@/components/sessions/SessionNoteModal'

export default function MySessionsView() {
  const { profile } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null)

  useEffect(() => {
    if (profile?.clinic_id) fetchMyAppointments()
  }, [profile])

  async function fetchMyAppointments() {
    setLoading(true)
    const today = format(new Date(), 'yyyy-MM-dd')

    const { data: therapist } = await supabase
      .from('therapists').select('id').eq('profile_id', profile?.id).single()

    if (!therapist) { setLoading(false); return }

    const { data } = await supabase
      .from('appointments')
      .select('*, patient:patients(id, full_name, phone, intake_completed), session_note:session_notes(id)')
      .eq('therapist_id', therapist.id)
      .gte('scheduled_at', `${today}T00:00:00`)
      .lte('scheduled_at', `${today}T23:59:59`)
      .order('scheduled_at')

    setAppointments(data ?? [])
    setLoading(false)
  }

  const pending = appointments.filter(a => a.status === 'scheduled' || (a.status === 'completed' && !a.session_note))
  const done = appointments.filter(a => a.status === 'completed' && a.session_note)
  const completionRate = appointments.length > 0
    ? Math.round((done.length / appointments.length) * 100)
    : 0

  return (
    <div className="p-5 md:p-8 max-w-xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="fh-label mb-1" style={{ color: '#2563eb' }}>Hoy</p>
        <h1 className="font-black text-ink-900 capitalize" style={{ fontSize: 36, letterSpacing: '-0.03em', lineHeight: 1 }}>
          {format(new Date(), 'EEEE', { locale: es })}
          <span className="text-ink-300">,</span>
          <br />
          <span className="text-ink-400 font-bold" style={{ fontSize: 26 }}>
            {format(new Date(), "d 'de' MMMM", { locale: es })}
          </span>
        </h1>
      </div>

      {/* Stats row */}
      {!loading && appointments.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Total',       value: appointments.length, color: '#1e3a8a' },
            { label: 'Pendientes',  value: pending.length,      color: '#d97706' },
            { label: 'Completadas', value: done.length,         color: '#059669' },
          ].map(({ label, value, color }) => (
            <div key={label} className="fh-card p-4 text-center">
              <p className="font-black text-2xl" style={{ color, letterSpacing: '-0.03em' }}>{value}</p>
              <p className="text-xs text-ink-400 font-medium mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Progress bar */}
      {!loading && appointments.length > 0 && (
        <div className="fh-card px-4 py-3 mb-6">
          <div className="flex justify-between text-xs font-semibold text-ink-500 mb-2">
            <span>Progreso del día</span>
            <span>{completionRate}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: '#f1f5f9' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%`, background: 'var(--grad-blue)' }}
            />
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#3b82f6', borderTopColor: 'transparent' }} />
        </div>
      ) : appointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="fh-card w-14 h-14 flex items-center justify-center mb-4">
            <ClipboardList className="w-7 h-7 text-ink-300" />
          </div>
          <p className="font-bold text-ink-400">Sin sesiones hoy</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {pending.length > 0 && (
            <div>
              <p className="fh-label mb-2">Pendientes</p>
              <div className="flex flex-col gap-2">
                {pending.map(apt => (
                  <SessionCard key={apt.id} apt={apt} onClick={() => setSelectedApt(apt)} />
                ))}
              </div>
            </div>
          )}
          {done.length > 0 && (
            <div>
              <p className="fh-label mb-2">Completadas</p>
              <div className="flex flex-col gap-2 opacity-60">
                {done.map(apt => (
                  <SessionCard key={apt.id} apt={apt} onClick={() => setSelectedApt(apt)} completed />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {selectedApt && (
        <SessionNoteModal
          appointment={selectedApt}
          onClose={() => setSelectedApt(null)}
          onSaved={() => { setSelectedApt(null); fetchMyAppointments() }}
        />
      )}
    </div>
  )
}

function SessionCard({ apt, onClick, completed = false }: {
  apt: Appointment
  onClick: () => void
  completed?: boolean
}) {
  const hasNote = !!apt.session_note
  const needsNote = apt.status === 'completed' && !hasNote

  return (
    <button
      onClick={onClick}
      className="fh-card w-full p-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer text-left"
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={needsNote
          ? { background: '#fffbeb' }
          : completed
            ? { background: '#ecfdf5' }
            : { background: 'linear-gradient(135deg, #eff6ff, #dbeafe)' }
        }
      >
        {completed && hasNote
          ? <CheckCircle className="w-5 h-5" style={{ color: '#059669' }} />
          : needsNote
            ? <Clock className="w-5 h-5" style={{ color: '#d97706' }} />
            : <ClipboardList className="w-5 h-5" style={{ color: '#1e3a8a' }} />
        }
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-ink-900 truncate">
          {(apt.patient as any)?.full_name ?? '—'}
        </p>
        <div className="flex items-center gap-3 mt-0.5">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-ink-300" />
            <span className="text-xs text-ink-400 font-medium">
              {format(new Date(apt.scheduled_at), 'HH:mm')} · {apt.duration_minutes}min
            </span>
          </div>
        </div>
        {needsNote && (
          <p className="text-xs font-semibold mt-1" style={{ color: '#d97706' }}>
            Pendiente de nota
          </p>
        )}
      </div>

      <ChevronRight className="w-4 h-4 text-ink-300 flex-shrink-0" />
    </button>
  )
}
