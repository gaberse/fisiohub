import { useEffect, useState } from 'react'
import { Plus, Package, Edit2, ToggleLeft, ToggleRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { Package as PkgType } from '@/types'

export default function PackagesView() {
  const { profile } = useAuth()
  const [packages, setPackages] = useState<PkgType[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<PkgType | null>(null)
  const [form, setForm] = useState({ name: '', description: '', session_count: 10, price: 0, validity_days: 90 })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (profile?.clinic_id) fetchPackages()
  }, [profile?.clinic_id])

  async function fetchPackages() {
    setLoading(true)
    const { data } = await supabase
      .from('packages')
      .select('*')
      .eq('clinic_id', profile?.clinic_id)
      .order('created_at')
    setPackages(data ?? [])
    setLoading(false)
  }

  function openNew() {
    setEditing(null)
    setForm({ name: '', description: '', session_count: 10, price: 0, validity_days: 90 })
    setShowForm(true)
  }

  function openEdit(pkg: PkgType) {
    setEditing(pkg)
    setForm({ name: pkg.name, description: pkg.description ?? '', session_count: pkg.session_count, price: pkg.price, validity_days: pkg.validity_days })
    setShowForm(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form, clinic_id: profile?.clinic_id, active: true }
    if (editing) {
      await supabase.from('packages').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('packages').insert(payload)
    }
    setShowForm(false)
    fetchPackages()
    setSaving(false)
  }

  async function toggleActive(pkg: PkgType) {
    await supabase.from('packages').update({ active: !pkg.active }).eq('id', pkg.id)
    fetchPackages()
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Paquetes</h1>
          <p className="text-sm text-slate-500">{packages.filter(p => p.active).length} activos</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nuevo paquete
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {packages.map(pkg => (
            <div key={pkg.id} className={`bg-white rounded-2xl border p-4 shadow-sm transition ${pkg.active ? 'border-slate-200' : 'border-slate-100 opacity-60'}`}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-800">{pkg.name}</p>
                    {!pkg.active && (
                      <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Inactivo</span>
                    )}
                  </div>
                  {pkg.description && <p className="text-xs text-slate-500 mt-0.5">{pkg.description}</p>}
                  <div className="flex gap-4 mt-2 text-sm">
                    <span className="text-slate-600"><span className="font-semibold">{pkg.session_count}</span> sesiones</span>
                    <span className="text-primary-600 font-semibold">S/ {pkg.price.toFixed(2)}</span>
                    <span className="text-slate-400">{pkg.validity_days} días vigencia</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => openEdit(pkg)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => toggleActive(pkg)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer">
                    {pkg.active ? <ToggleRight className="w-4 h-4 text-primary-500" /> : <ToggleLeft className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-white w-full md:max-w-md md:rounded-2xl rounded-t-2xl shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">{editing ? 'Editar paquete' : 'Nuevo paquete'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer text-slate-500">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                  placeholder="Paquete 10 sesiones masaje"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Descripción</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Incluye masaje descontracturante y electroterapia"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Sesiones</label>
                  <input
                    type="number"
                    value={form.session_count}
                    onChange={e => setForm(f => ({ ...f, session_count: +e.target.value }))}
                    min={1}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Precio (S/)</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: +e.target.value }))}
                    min={0}
                    step={0.01}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Vigencia (días)</label>
                  <input
                    type="number"
                    value={form.validity_days}
                    onChange={e => setForm(f => ({ ...f, validity_days: +e.target.value }))}
                    min={1}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-medium py-3 rounded-xl text-sm transition cursor-pointer"
              >
                {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear paquete'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
