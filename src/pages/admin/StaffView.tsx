import { useEffect, useState } from 'react'
import { Plus, UserCog, Stethoscope, ConciergeBell } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

interface StaffMember {
  id: string
  full_name: string
  role: string
  phone: string | null
  branch_name: string
  user_email?: string
}

export default function StaffView() {
  const { profile, branches } = useAuth()
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'therapist' as 'therapist' | 'receptionist',
    branch_id: branches[0]?.id ?? '',
    specialty: '',
    phone: '',
  })

  useEffect(() => {
    if (profile?.clinic_id) fetchStaff()
  }, [profile?.clinic_id])

  useEffect(() => {
    if (branches.length > 0 && !form.branch_id) {
      setForm(f => ({ ...f, branch_id: branches[0].id }))
    }
  }, [branches])

  async function fetchStaff() {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, role, phone, branch_id, branches(name)')
      .eq('clinic_id', profile?.clinic_id)
      .in('role', ['therapist', 'receptionist'])
      .order('full_name')

    const mapped = (data ?? []).map((p: any) => ({
      id: p.id,
      full_name: p.full_name,
      role: p.role,
      phone: p.phone,
      branch_name: p.branches?.name ?? '—',
    }))
    setStaff(mapped)
    setLoading(false)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    // 1. Crear usuario en auth via admin API (solo disponible en server)
    // En Supabase desde el cliente usamos signUp y luego actualizamos
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name } },
    })

    if (authError || !authData.user) {
      setError(authError?.message ?? 'Error al crear usuario')
      setSaving(false)
      return
    }

    const userId = authData.user.id

    // 2. Crear perfil
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        clinic_id: profile?.clinic_id,
        branch_id: form.branch_id,
        full_name: form.full_name,
        role: form.role,
        phone: form.phone || null,
      })
      .select()
      .single()

    if (profileError || !profileData) {
      setError('Error al crear el perfil del usuario')
      setSaving(false)
      return
    }

    // 3. Si es terapeuta, crear registro en therapists
    if (form.role === 'therapist') {
      await supabase.from('therapists').insert({
        clinic_id: profile?.clinic_id,
        branch_id: form.branch_id,
        profile_id: profileData.id,
        full_name: form.full_name,
        specialty: form.specialty || null,
      })
    }

    setShowForm(false)
    setForm({ full_name: '', email: '', password: '', role: 'therapist', branch_id: branches[0]?.id ?? '', specialty: '', phone: '' })
    fetchStaff()
    setSaving(false)
  }

  const ROLE_CONFIG = {
    therapist: { label: 'Terapeuta', icon: Stethoscope, bg: '#eff6ff', color: '#1d4ed8' },
    receptionist: { label: 'Recepcionista', icon: ConciergeBell, bg: '#f0fdf4', color: '#15803d' },
  }

  return (
    <div className="p-5 md:p-8 max-w-2xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand-600 mb-1">Admin</p>
          <h1 className="text-3xl font-black text-slate-900">Equipo</h1>
          <p className="text-slate-400 text-sm mt-1">{staff.length} miembros registrados</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-white text-sm font-bold px-5 py-3 rounded-xl shadow-sm transition cursor-pointer hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}
        >
          <Plus className="w-4 h-4" />
          Agregar
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#1d4ed8', borderTopColor: 'transparent' }} />
        </div>
      ) : staff.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <UserCog className="w-7 h-7 text-slate-300" />
          </div>
          <p className="font-bold text-slate-400">Sin miembros de equipo</p>
          <p className="text-sm text-slate-300 mt-1">Agrega terapeutas y recepcionistas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {staff.map(member => {
            const cfg = ROLE_CONFIG[member.role as keyof typeof ROLE_CONFIG]
            const Icon = cfg?.icon ?? UserCog
            return (
              <div key={member.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex items-center gap-4">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: cfg?.bg ?? '#f8fafc' }}
                >
                  <Icon className="w-5 h-5" style={{ color: cfg?.color ?? '#64748b' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900">{member.full_name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: cfg?.bg, color: cfg?.color }}
                    >
                      {cfg?.label}
                    </span>
                    <span className="text-xs text-slate-400">{member.branch_name}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal form */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-white w-full md:max-w-md md:rounded-2xl rounded-t-2xl shadow-xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 sticky top-0 bg-white">
              <h2 className="font-bold text-slate-800">Nuevo miembro del equipo</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer text-slate-400">✕</button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-4">
              {/* Role selector */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Rol</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['therapist', 'receptionist'] as const).map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, role: r }))}
                      className="py-3 rounded-xl text-sm font-bold border transition cursor-pointer"
                      style={form.role === r
                        ? { background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', color: 'white', borderColor: 'transparent' }
                        : { background: 'white', color: '#64748b', borderColor: '#e2e8f0' }
                      }
                    >
                      {r === 'therapist' ? 'Terapeuta' : 'Recepcionista'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nombre completo <span className="text-red-500">*</span></label>
                <input
                  type="text" value={form.full_name} required
                  onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                  placeholder="María García"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email <span className="text-red-500">*</span></label>
                  <input
                    type="email" value={form.email} required
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="maria@fisiomass.com"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Contraseña <span className="text-red-500">*</span></label>
                  <input
                    type="password" value={form.password} required minLength={6}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Teléfono</label>
                  <input
                    type="tel" value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="987 654 321"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Sede <span className="text-red-500">*</span></label>
                  <select
                    value={form.branch_id} required
                    onChange={e => setForm(f => ({ ...f, branch_id: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 bg-slate-50"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {form.role === 'therapist' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Especialidad</label>
                  <input
                    type="text" value={form.specialty}
                    onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))}
                    placeholder="Masajes terapéuticos, electroterapia..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 bg-slate-50 focus:bg-white"
                  />
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit" disabled={saving}
                className="w-full py-3 rounded-xl font-bold text-sm text-white transition cursor-pointer"
                style={{ background: saving ? '#93c5fd' : 'linear-gradient(135deg, #1d4ed8, #3b82f6)' }}
              >
                {saving ? 'Creando cuenta...' : 'Crear miembro del equipo'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
