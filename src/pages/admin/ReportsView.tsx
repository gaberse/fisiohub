import { useEffect, useState } from 'react'
import { BarChart2, Users, Calendar, Star, TrendingUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { es } from 'date-fns/locale'

interface Stats {
  total_appointments: number
  completed_appointments: number
  total_patients: number
  avg_rating: number | null
  active_packages: number
}

export default function ReportsView() {
  const { profile } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.clinic_id) fetchStats()
  }, [profile?.clinic_id])

  async function fetchStats() {
    setLoading(true)
    const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd') + 'T00:00:00'
    const monthEnd = format(endOfMonth(new Date()), 'yyyy-MM-dd') + 'T23:59:59'

    const clinicId = profile?.clinic_id ?? ''

    const [r1, r2, r3, r4, r5] = await Promise.all([
      supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('clinic_id', clinicId).gte('scheduled_at', monthStart).lte('scheduled_at', monthEnd),
      supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('clinic_id', clinicId).eq('status', 'completed').gte('scheduled_at', monthStart).lte('scheduled_at', monthEnd),
      supabase.from('patients').select('*', { count: 'exact', head: true }).eq('clinic_id', clinicId),
      supabase.from('satisfaction_surveys').select('rating').eq('clinic_id' as never, clinicId),
      supabase.from('patient_packages').select('*', { count: 'exact', head: true }).eq('clinic_id', clinicId).gt('sessions_used', 0).gte('expires_at', new Date().toISOString()),
    ])

    const ratings = r4.data as { rating: number }[] | null
    const avgRating = ratings && ratings.length > 0
      ? ratings.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / ratings.length
      : null
    const totalApts = r1.count
    const completedApts = r2.count
    const totalPatients = r3.count
    const activePkgs = r5.count

    setStats({
      total_appointments: totalApts ?? 0,
      completed_appointments: completedApts ?? 0,
      total_patients: totalPatients ?? 0,
      avg_rating: avgRating,
      active_packages: activePkgs ?? 0,
    })
    setLoading(false)
  }

  const month = format(new Date(), 'MMMM yyyy', { locale: es })

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Reportes</h1>
        <p className="text-sm text-slate-500 capitalize">{month}</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : stats && (
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={Calendar}
            label="Citas este mes"
            value={stats.total_appointments}
            color="bg-blue-50 text-blue-600"
          />
          <StatCard
            icon={TrendingUp}
            label="Sesiones completadas"
            value={stats.completed_appointments}
            color="bg-green-50 text-green-600"
          />
          <StatCard
            icon={Users}
            label="Total pacientes"
            value={stats.total_patients}
            color="bg-purple-50 text-purple-600"
          />
          <StatCard
            icon={Star}
            label="Calificación promedio"
            value={stats.avg_rating ? stats.avg_rating.toFixed(1) + ' / 10' : '—'}
            color="bg-amber-50 text-amber-600"
          />
          <div className="col-span-2">
            <StatCard
              icon={BarChart2}
              label="Paquetes activos"
              value={stats.active_packages}
              color="bg-primary-50 text-primary-600"
            />
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType
  label: string
  value: string | number
  color: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  )
}
