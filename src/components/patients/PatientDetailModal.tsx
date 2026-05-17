import { useEffect, useState } from 'react'
import { X, Phone, Mail, Calendar, ClipboardList, Package } from 'lucide-react'
import { format, differenceInYears } from 'date-fns'
import { es } from 'date-fns/locale'
import { supabase } from '@/lib/supabase'
import type { Patient, Appointment, PatientPackage, PatientIntake } from '@/types'

interface Props {
  patient: Patient
  onClose: () => void
}

const APT_STATUS: Record<string, { label: string; badgeClass: string; dotColor: string }> = {
  completed: { label: 'Completada', badgeClass: 'fh-badge fh-badge-green', dotColor: '#059669' },
  cancelled:  { label: 'Cancelada',  badgeClass: 'fh-badge fh-badge-slate', dotColor: '#94a3b8' },
  no_show:    { label: 'No asistió', badgeClass: 'fh-badge fh-badge-red',   dotColor: '#dc2626' },
  scheduled:  { label: 'Programada', badgeClass: 'fh-badge fh-badge-blue',  dotColor: '#3b82f6' },
}

export default function PatientDetailModal({ patient, onClose }: Props) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [packages, setPackages] = useState<PatientPackage[]>([])
  const [intake, setIntake] = useState<PatientIntake | null>(null)
  const [tab, setTab] = useState<'info' | 'sesiones' | 'paquetes'>('info')

  useEffect(() => {
    Promise.all([
      supabase.from('appointments')
        .select('*, therapist:therapists(full_name)')
        .eq('patient_id', patient.id)
        .order('scheduled_at', { ascending: false })
        .limit(20),
      supabase.from('patient_packages')
        .select('*, package:packages(name, session_count, price)')
        .eq('patient_id', patient.id)
        .order('purchased_at', { ascending: false }),
      supabase.from('patient_intake')
        .select('*')
        .eq('patient_id', patient.id)
        .single(),
    ]).then(([{ data: apts }, { data: pkgs }, { data: intk }]) => {
      setAppointments(apts ?? [])
      setPackages(pkgs ?? [])
      setIntake(intk)
    })
  }, [patient.id])

  const age = patient.birth_date
    ? differenceInYears(new Date(), new Date(patient.birth_date))
    : null

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4" style={{ background: 'rgba(15,23,42,0.5)' }}>
      <div className="bg-white w-full md:max-w-lg md:rounded-[20px] rounded-t-[20px] max-h-[85vh] flex flex-col" style={{ boxShadow: '0 24px 64px rgba(15,23,42,.2), 0 4px 16px rgba(15,23,42,.08)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0 rounded-t-[20px]">
          <div className="flex items-center gap-3">
            <div
              className="fh-avatar w-10 h-10 text-sm font-semibold"
              style={{ background: '#eff6ff', color: '#1e3a8a' }}
            >
              {patient.full_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-black text-ink-900 text-base tracking-tight">{patient.full_name}</h2>
              {age && <p className="text-xs text-ink-400 font-medium">{age} años</p>}
            </div>
          </div>
          <button onClick={onClose} className="fh-btn fh-btn-ghost fh-btn-icon fh-btn-sm" aria-label="Cerrar">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="fh-tabline px-5 flex-shrink-0">
          {(['info', 'sesiones', 'paquetes'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="fh-tabline-item capitalize"
              aria-selected={tab === t ? 'true' : 'false'}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {tab === 'info' && (
            <div className="flex flex-col gap-4">
              {patient.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-ink-400" />
                  <span className="text-sm text-ink-700 font-medium">{patient.phone}</span>
                </div>
              )}
              {patient.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-ink-400" />
                  <span className="text-sm text-ink-700 font-medium">{patient.email}</span>
                </div>
              )}
              {patient.birth_date && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-ink-400" />
                  <span className="text-sm text-ink-700 font-medium">
                    {format(new Date(patient.birth_date), "d 'de' MMMM yyyy", { locale: es })}
                  </span>
                </div>
              )}

              {intake ? (
                <div className="mt-2 rounded-xl p-4 flex flex-col gap-3" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <h3 className="fh-label-ink flex items-center gap-2">
                    <ClipboardList className="w-3.5 h-3.5" />
                    Perfil clínico
                  </h3>
                  <div>
                    <p className="fh-label mb-1">Motivo de consulta</p>
                    <p className="text-sm text-ink-700 font-medium">{intake.reason}</p>
                  </div>
                  {intake.medical_history && (
                    <div>
                      <p className="fh-label mb-1">Antecedentes</p>
                      <p className="text-sm text-ink-700 font-medium">{intake.medical_history}</p>
                    </div>
                  )}
                  <div>
                    <p className="fh-label mb-2">Nivel de dolor inicial</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 rounded-full h-2" style={{ background: '#e2e8f0' }}>
                        <div
                          className="rounded-full h-2 transition-all"
                          style={{ width: `${intake.pain_level * 10}%`, background: 'var(--grad-blue)' }}
                        />
                      </div>
                      <span className="text-sm font-bold text-ink-700">{intake.pain_level}/10</span>
                    </div>
                  </div>
                  {intake.goals && (
                    <div>
                      <p className="fh-label mb-1">Objetivos</p>
                      <p className="text-sm text-ink-700 font-medium">{intake.goals}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-2 rounded-xl p-4 text-center" style={{ background: '#fffbeb' }}>
                  <p className="text-sm font-semibold" style={{ color: '#b45309' }}>Sin perfil clínico completado</p>
                  <p className="text-xs mt-1" style={{ color: '#d97706' }}>El paciente no ha llenado el formulario inicial</p>
                </div>
              )}
            </div>
          )}

          {tab === 'sesiones' && (
            <div className="flex flex-col gap-2">
              {appointments.length === 0 ? (
                <p className="text-center text-ink-400 text-sm py-8">Sin sesiones registradas</p>
              ) : (
                appointments.map(apt => {
                  const cfg = APT_STATUS[apt.status] ?? APT_STATUS.scheduled
                  return (
                    <div key={apt.id} className="rounded-xl p-3" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-ink-900">
                          {format(new Date(apt.scheduled_at), "d MMM yyyy · HH:mm", { locale: es })}
                        </span>
                        <span className={cfg.badgeClass}>
                          <span className="fh-badge-dot" style={{ background: cfg.dotColor }} />
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-ink-400 font-medium">
                        {(apt.therapist as any)?.full_name ?? '—'} · {apt.duration_minutes} min
                      </p>
                    </div>
                  )
                })
              )}
            </div>
          )}

          {tab === 'paquetes' && (
            <div className="flex flex-col gap-3">
              {packages.length === 0 ? (
                <p className="text-center text-ink-400 text-sm py-8">Sin paquetes asignados</p>
              ) : (
                packages.map(pp => (
                  <div key={pp.id} className="rounded-xl p-4" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#eff6ff' }}>
                        <Package className="w-4 h-4" style={{ color: '#1e3a8a' }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-ink-900">{pp.package?.name}</p>
                        <div className="mt-2">
                          <div className="flex justify-between text-xs font-medium text-ink-500 mb-1.5">
                            <span>{pp.sessions_used} / {pp.sessions_total} sesiones</span>
                            <span>{pp.sessions_total - pp.sessions_used} restantes</span>
                          </div>
                          <div className="rounded-full h-1.5" style={{ background: '#e2e8f0' }}>
                            <div
                              className="rounded-full h-1.5 transition-all"
                              style={{
                                width: `${(pp.sessions_used / pp.sessions_total) * 100}%`,
                                background: 'var(--grad-blue)',
                              }}
                            />
                          </div>
                        </div>
                        <p className="text-xs text-ink-400 font-medium mt-1.5">
                          Vence: {format(new Date(pp.expires_at), "d MMM yyyy", { locale: es })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
