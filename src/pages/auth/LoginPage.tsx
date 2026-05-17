import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

export default function LoginPage() {
  const { session } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (session) return <Navigate to="/" replace />

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Credenciales incorrectas. Verifica tu email y contraseña.')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left panel — brand */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 p-14 relative overflow-hidden"
        style={{ background: 'var(--grad-blue)' }}
      >
        {/* Subtle diagonal stripe overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(135deg, white 0 1px, transparent 1px 32px)',
            opacity: 0.08,
          }}
        />

        <div className="relative z-10">
          <span className="fh-logo text-2xl" style={{ color: 'white' }}>
            fisiohub<span style={{ background: 'linear-gradient(135deg,#93c5fd,#60a5fa)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>.</span>
          </span>
        </div>

        <div className="relative z-10">
          <p className="fh-label mb-5" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Gestión clínica · Perú
          </p>
          <h1
            className="text-white font-black leading-none mb-5"
            style={{ fontSize: 'clamp(48px, 5.5vw, 72px)', letterSpacing: '-0.035em', lineHeight: 0.95 }}
          >
            Fisioterapia<br />que transforma.
          </h1>
          <p className="text-base font-medium max-w-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Agenda, notas clínicas y seguimiento de pacientes — todo en un lugar.
          </p>

          <div className="flex gap-8 mt-10">
            <div>
              <p className="text-white font-black text-3xl" style={{ letterSpacing: '-0.03em', lineHeight: 1 }}>+1.200</p>
              <p className="text-xs font-medium mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>sesiones registradas</p>
            </div>
            <div className="w-px" style={{ background: 'rgba(255,255,255,0.2)' }} />
            <div>
              <p className="text-white font-black text-3xl" style={{ letterSpacing: '-0.03em', lineHeight: 1 }}>4.8/5</p>
              <p className="text-xs font-medium mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>satisfacción promedio</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
          © {new Date().getFullYear()} FisioHub · Hecho en Lima
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden mb-10 text-center">
            <span className="fh-logo text-2xl">fisiohub<span className="dot">.</span></span>
          </div>

          <p className="fh-label mb-3">Bienvenida de vuelta</p>
          <h2 className="fh-display text-5xl text-ink-900 mb-3">Inicia sesión.</h2>
          <p className="text-sm font-medium text-ink-500 mb-9" style={{ lineHeight: 1.55 }}>
            Ingresa con tus credenciales para continuar.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="fh-field">
              <label className="fh-field-label">Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="tu@correo.com"
                className="fh-input w-full"
              />
            </div>

            <div className="fh-field">
              <label className="fh-field-label">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="fh-input w-full"
              />
            </div>

            {error && (
              <div className="rounded-xl px-4 py-3" style={{ background: '#fef2f2', border: '1px solid #fee2e2' }}>
                <p className="text-sm font-medium" style={{ color: '#b91c1c' }}>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="fh-btn fh-btn-primary fh-btn-lg w-full mt-1"
            >
              {loading ? 'Ingresando...' : 'Ingresar →'}
            </button>
          </form>

          <p className="text-center text-xs text-ink-400 mt-10">
            FisioHub © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  )
}
