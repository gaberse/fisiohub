import { useEffect, useState } from 'react'
import { format, addDays, subDays, isToday } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, User, CalendarDays } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { Appointment } from '@/types'
import NewAppointmentModal from '@/components/agenda/NewAppointmentModal'
import SatisfactionModal from '@/components/agenda/SatisfactionModal'

const STATUS_CONFIG = {
  scheduled: { label: 'Programada', badgeClass: 'fh-badge fh-badge-blue',  dotColor: '#3b82f6' },
  completed: { label: 'Completada', badgeClass: 'fh-badge fh-badge-green', dotColor: '#059669' },
  cancelled: { label: 'Cancelada',  badgeClass: 'fh-badge fh-badge-slate', dotColor: '#94a3b8' },
  no_show:   { label: 'No asistió', badgeClass: 'fh-badge fh-badge-red',   dotColor: '#dc2626' },
}

export default function AgendaView() {
  const { profile, activeBranch } = useAuth()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewModal, setShowNewModal] = useState(false)
  const [surveyApt, setSurveyApt] = useState<Appointment | null>(null)

  useEffect(() => {
    if (activeBranch?.id) fetchAppointments()
  }, [selectedDate, activeBranch?.id])

  async function fetchAppointments() {
    setLoading(true)
    const dayStart = format(selectedDate, 'yyyy-MM-dd') + 'T00:00:00'
    const dayEnd = format(selectedDate, 'yyyy-MM-dd') + 'T23:59:59'

    const { data } = await supabase
      .from('appointments')
      .select('*, patient:patients(id, full_name, phone), therapist:therapists(id, full_name)')
      .eq('branch_id', activeBranch?.id)
      .gte('scheduled_at', dayStart)
      .lte('scheduled_at', dayEnd)
      .order('scheduled_at')

    setAppointments(data ?? [])
    setLoading(false)
  }

  async function updateStatus(apt: Appointment, status: Appointment['status']) {
    await supabase.from('appointments').update({ status }).eq('id', apt.id)
    if (status === 'completed') {
      setSurveyApt({ ...apt, status })
    } else {
      fetchAppointments()
    }
  }

  const isSelected = (date: Date) =>
    format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')

  return (
    <div className="p-5 md:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="fh-label mb-1" style={{ color: '#2563eb' }}>
            {isToday(selectedDate) ? 'Hoy' : 'Agenda'}
          </p>
          <h1 className="font-black text-ink-900 capitalize" style={{ fontSize: 36, letterSpacing: '-0.03em', lineHeight: 1 }}>
            {format(selectedDate, 'EEEE', { locale: es })}
            <span className="text-ink-300">,</span>
            <br />
            <span className="text-ink-400 font-bold" style={{ fontSize: 26 }}>
              {format(selectedDate, "d 'de' MMMM", { locale: es })}
            </span>
          </h1>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="fh-btn fh-btn-primary"
        >
          <Plus className="w-4 h-4" />
          Nueva cita
        </button>
      </div>

      {/* Date strip */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setSelectedDate(subDays(selectedDate, 1))}
          className="fh-btn fh-btn-ghost fh-btn-icon fh-btn-sm"
        >
          <ChevronLeft className="w-4 h-4 text-ink-500" />
        </button>

        <div className="flex gap-1.5 flex-1 overflow-x-auto">
          {[-2, -1, 0, 1, 2].map(offset => {
            const date = addDays(new Date(), offset)
            const sel = isSelected(date)
            return (
              <button
                key={offset}
                onClick={() => setSelectedDate(date)}
                className="flex flex-col items-center px-3 py-2.5 rounded-xl min-w-[56px] transition cursor-pointer font-medium text-xs"
                style={
                  sel
                    ? { background: 'var(--grad-blue)', color: 'white' }
                    : { background: 'white', color: '#64748b', border: '1px solid #e2e8f0' }
                }
              >
                <span className="capitalize">{format(date, 'EEE', { locale: es })}</span>
                <span className="text-lg font-black mt-0.5">{format(date, 'd')}</span>
                {isToday(date) && !sel && (
                  <div className="w-1 h-1 rounded-full mt-1" style={{ background: '#3b82f6' }} />
                )}
              </button>
            )
          })}
        </div>

        <button
          onClick={() => setSelectedDate(addDays(selectedDate, 1))}
          className="fh-btn fh-btn-ghost fh-btn-icon fh-btn-sm"
        >
          <ChevronRight className="w-4 h-4 text-ink-500" />
        </button>
      </div>

      {/* Count */}
      {!loading && appointments.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-semibold text-ink-500">
            {appointments.length} {appointments.length === 1 ? 'cita' : 'citas'}
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>
      )}

      {/* Appointments */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#3b82f6', borderTopColor: 'transparent' }} />
        </div>
      ) : appointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-bg flex items-center justify-center mb-4 border border-border">
            <CalendarDays className="w-7 h-7 text-ink-300" />
          </div>
          <p className="font-bold text-ink-400">Sin citas este día</p>
          <p className="text-sm text-ink-300 mt-1">Pulsa "Nueva cita" para agendar</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {appointments.map(apt => {
            const cfg = STATUS_CONFIG[apt.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.scheduled
            return (
              <div key={apt.id} className="fh-card p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    {/* Time column */}
                    <div className="text-center min-w-[44px]">
                      <p className="font-black text-ink-900 leading-none" style={{ fontSize: 20 }}>
                        {format(new Date(apt.scheduled_at), 'HH:mm')}
                      </p>
                      <p className="text-xs text-ink-400 mt-1">{apt.duration_minutes}m</p>
                    </div>

                    <div className="w-px bg-border self-stretch" />

                    {/* Info */}
                    <div>
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <p className="text-sm font-bold text-ink-900">
                          {(apt.patient as any)?.full_name ?? '—'}
                        </p>
                        <span className={cfg.badgeClass}>
                          <span className="fh-badge-dot" style={{ background: cfg.dotColor }} />
                          {cfg.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-ink-300" />
                        <p className="text-xs text-ink-400">
                          {(apt.therapist as any)?.full_name ?? '—'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {apt.status === 'scheduled' && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => updateStatus(apt, 'completed')}
                        className="fh-btn fh-btn-soft fh-btn-sm"
                      >
                        ✓ Completar
                      </button>
                      <button
                        onClick={() => updateStatus(apt, 'no_show')}
                        className="fh-btn fh-btn-ghost fh-btn-sm"
                      >
                        No asistió
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {surveyApt && (
        <SatisfactionModal
          appointment={surveyApt}
          onClose={() => { setSurveyApt(null); fetchAppointments() }}
          onSaved={() => { setSurveyApt(null); fetchAppointments() }}
        />
      )}

      {showNewModal && (
        <NewAppointmentModal
          clinicId={profile?.clinic_id ?? ''}
          branchId={activeBranch?.id ?? ''}
          selectedDate={selectedDate}
          onClose={() => setShowNewModal(false)}
          onCreated={() => { setShowNewModal(false); fetchAppointments() }}
        />
      )}
    </div>
  )
}
