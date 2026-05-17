import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { isSupabaseConfigured } from '@/lib/supabase'
import LoginPage from '@/pages/auth/LoginPage'
import ReceptionistDashboard from '@/pages/receptionist/ReceptionistDashboard'
import TherapistDashboard from '@/pages/therapist/TherapistDashboard'
import AdminDashboard from '@/pages/admin/AdminDashboard'

function SetupScreen() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm"
          style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}
        >
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">FisioHub</h1>
        <p className="text-slate-400 text-sm mb-8">Configura tu proyecto de Supabase para continuar</p>

        <div className="bg-slate-50 rounded-2xl p-5 text-left space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Pasos</p>
          {[
            '1. Crea un proyecto en supabase.com',
            '2. Copia la URL y la anon key del proyecto',
            '3. Pégalas en el archivo .env de este proyecto',
            '4. Recarga la página',
          ].map(step => (
            <p key={step} className="text-sm text-slate-600 font-medium">{step}</p>
          ))}
        </div>

        <div className="mt-5 bg-slate-900 rounded-xl p-4 text-left">
          <p className="text-xs text-slate-400 font-mono mb-1">.env</p>
          <p className="text-xs font-mono text-green-400">VITE_SUPABASE_URL=https://xxxx.supabase.co</p>
          <p className="text-xs font-mono text-green-400">VITE_SUPABASE_ANON_KEY=eyJhbGci...</p>
        </div>
      </div>
    </div>
  )
}

function RoleRouter() {
  const { profile, loading, session } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#1d4ed8', borderTopColor: 'transparent' }} />
          <p className="text-slate-400 text-sm font-medium">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!session) return <Navigate to="/login" replace />

  switch (profile?.role) {
    case 'receptionist': return <Navigate to="/recepcion" replace />
    case 'therapist': return <Navigate to="/terapeuta" replace />
    case 'admin': return <Navigate to="/admin" replace />
    default: return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400 text-sm">Rol no configurado. Contacta al administrador.</p>
      </div>
    )
  }
}

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { profile, loading, session } = useAuth()
  if (loading) return null
  if (!session) return <Navigate to="/login" replace />
  if (!profile || !allowedRoles.includes(profile.role)) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  if (!isSupabaseConfigured) return <SetupScreen />

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<RoleRouter />} />
          <Route path="/recepcion/*" element={
            <ProtectedRoute allowedRoles={['receptionist', 'admin']}>
              <ReceptionistDashboard />
            </ProtectedRoute>
          } />
          <Route path="/terapeuta/*" element={
            <ProtectedRoute allowedRoles={['therapist', 'admin']}>
              <TherapistDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
