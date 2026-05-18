import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { Input, Button, Checkbox } from '@/components/ui'

export default function LoginPage() {
  const { session } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  // const [googleLoading, setGoogleLoading] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  if (session) return <Navigate to="/" replace />

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setEmailError('')
    setPasswordError('')

    let valid = true
    if (!email.trim()) { setEmailError('Ingresa tu correo electrónico.'); valid = false }
    if (!password) { setPasswordError('Ingresa tu contraseña.'); valid = false }
    if (!valid) return

    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setPasswordError('Credenciales incorrectas. Verifica tu email y contraseña.')
    setLoading(false)
  }

  // async function handleGoogle() {
  //   setGoogleLoading(true)
  //   await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })
  //   setGoogleLoading(false)
  // }

  return (
    <div className="min-h-screen bg-white flex">

      <div
        className="hidden lg:flex flex-col justify-between items-center w-1/2 p-14 relative overflow-hidden"
        style={{ background: 'var(--grad-blue)' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(135deg, white 0 1px, transparent 1px 40px)',
            opacity: 0.06,
          }}
        />

        <div className='flex-1 flex flex-col items-start justify-around'>
          <span className="fh-logo text-2xl" style={{ color: 'white' }}>
            fisiohub
            <span style={{
              background: 'linear-gradient(135deg,#93c5fd,#60a5fa)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}>.</span>
          </span>

          <div className="flex flex-col gap-6">
            <p className="fh-label mb-6" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Gestión clínica · Perú
            </p>
            <h1
              className="text-white font-black mb-6"
              style={{ fontSize: 'clamp(44px, 5vw, 64px)', letterSpacing: '-0.035em', lineHeight: 0.96 }}
            >
              La clínica<br />se recuerda<br />sola.
            </h1>
            <p className="text-sm font-medium max-w-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Agenda, notas de sesión, paquetes y reportes en un solo lugar. Diseñado para fisioterapia y rehabilitación en Latam.
            </p>

            {/* Stats */}
            <div className="flex items-center gap-8 mt-12">
              <div>
                <p className="text-white font-black text-2xl" style={{ letterSpacing: '-0.03em', lineHeight: 1 }}>+1.200</p>
                <p className="text-xs font-medium mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>sesiones registradas</p>
              </div>
              <div className="w-px self-stretch" style={{ background: 'rgba(255,255,255,0.15)' }} />
              <div>
                <p className="text-white font-black text-2xl" style={{ letterSpacing: '-0.03em', lineHeight: 1 }}>4.8/5</p>
                <p className="text-xs font-medium mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>satisfacción promedio</p>
              </div>
            </div>
          </div>

          <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>
            © {new Date().getFullYear()} FisioHub · Hecho en Lima
          </span>
        </div>

      </div>

      <div className="flex-1 flex items-center justify-center px-6 lg:px-8" style={{ background: '#f8fafc' }}>
        <div className="w-full max-w-[360px] lg:max-w-sm flex flex-col gap-8">

          <div className="lg:hidden mb-10">
            <span className="fh-logo text-2xl">fisiohub<span className="dot">.</span></span>
          </div>

          <div className='flex flex-col gap-2'>
            <p className="fh-label mb-3 text-ink-400">Bienvenido de vuelta</p>
            <h2
              className="fh-display text-ink-900 mb-3"
              style={{ fontSize: 44 }}
            >
              Inicia sesión.
            </h2>
            <p className="text-sm font-medium text-ink-400 mb-8" style={{ lineHeight: 1.6 }}>
              Si es tu primera vez, tu administradora te envió un email con el enlace de acceso.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setEmailError('') }}
              placeholder="mariana@fisiomass.pe"
              autoComplete="email"
              error={emailError || undefined}
              icon={<Mail size={16} />}
            />

            <div className="fh-field">
              <div className="flex items-center justify-between">
                <label className="fh-field-label">Contraseña</label>
                <button
                  type="button"
                  className="text-xs font-semibold"
                  style={{ color: '#1e3a8a' }}
                >
                  ¿Olvidaste?
                </button>
              </div>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setPasswordError('') }}
                placeholder="••••••••"
                autoComplete="current-password"
                error={passwordError || undefined}
                icon={<Lock size={16} />}
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="cursor-pointer text-ink-400 hover:text-ink-700 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                }
              />
            </div>

            <Checkbox
              label="Mantener mi sesión iniciada"
              checked={remember}
              onChange={e => setRemember(e.target.checked)}
            />

            <Button
              type="submit"
              disabled={loading}
              size="lg"
              className="w-full mt-1"
            >
              {loading ? 'Ingresando...' : 'Entrar a Fisiomass →'}
            </Button>
          </form>

          {/* Google SSO — pendiente de activar OAuth en Supabase
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: '#e2e8f0' }} />
            <span className="fh-label" style={{ color: '#94a3b8' }}>O continúa con</span>
            <div className="flex-1 h-px" style={{ background: '#e2e8f0' }} />
          </div>
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading}
            className="fh-btn fh-btn-ghost w-full"
            style={{ fontWeight: 600 }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
              <path d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z" fill="#FFC107"/>
              <path d="M6.3 14.7l6.6 4.8C14.6 16 19 12 24 12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" fill="#FF3D00"/>
              <path d="M24 44c5.2 0 9.9-2 13.4-5.1l-6.2-5.2C29.2 35.3 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8H6.3C9.7 35.7 16.3 44 24 44z" fill="#4CAF50"/>
              <path d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.2 5.2C36.9 40.1 44 34.9 44 24c0-1.2-.1-2.4-.4-3.5z" fill="#1976D2"/>
            </svg>
            {googleLoading ? 'Redirigiendo...' : 'Google'}
          </button>
          */}

          <p className="text-center text-xs text-ink-400 mt-8">
            ¿Eres una clínica nueva?{' '}
            <button type="button" className="font-semibold" style={{ color: '#1e3a8a' }}>
              Solicita una demo
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
