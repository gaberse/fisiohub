import { useState } from 'react'
import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Calendar, Users, ClipboardList, Package, BarChart2, LogOut, Menu, X, ChevronDown, MapPin, UserCog } from 'lucide-react'
import type { UserRole } from '@/types'

interface NavItem {
  to: string
  icon: React.ElementType
  label: string
  roles: UserRole[]
}

const navItems: NavItem[] = [
  { to: '/recepcion', icon: Calendar, label: 'Agenda', roles: ['receptionist', 'admin'] },
  { to: '/recepcion/pacientes', icon: Users, label: 'Pacientes', roles: ['receptionist', 'admin'] },
  { to: '/terapeuta', icon: ClipboardList, label: 'Mis sesiones', roles: ['therapist'] },
  { to: '/admin/staff', icon: UserCog, label: 'Equipo', roles: ['admin'] },
  { to: '/admin/paquetes', icon: Package, label: 'Paquetes', roles: ['admin'] },
  { to: '/admin/reportes', icon: BarChart2, label: 'Reportes', roles: ['admin'] },
]

const roleLabel: Record<UserRole, string> = {
  receptionist: 'Recepcionista',
  therapist: 'Terapeuta',
  admin: 'Administrador',
  patient: 'Paciente',
}

export default function AppShell({ children }: { children: ReactNode }) {
  const { profile, signOut, activeBranch, branches, setActiveBranch } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [branchOpen, setBranchOpen] = useState(false)

  const visibleItems = navItems.filter(item =>
    profile?.role && item.roles.includes(profile.role)
  )

  const isAdmin = profile?.role === 'admin'
  const showBranchSelector = isAdmin && branches.length > 1

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  const initials = profile?.full_name
    ?.split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? '?'

  const BranchPill = () => (
    <div className="px-4 mb-4 relative">
      <div
        className={`rounded-xl px-3 py-2.5 ${showBranchSelector ? 'cursor-pointer transition-colors' : ''}`}
        style={{ background: '#eff6ff' }}
        onClick={() => showBranchSelector && setBranchOpen(!branchOpen)}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="fh-label" style={{ color: '#1e3a8a', marginBottom: 2 }}>Sede activa</p>
            <p className="text-sm font-bold truncate" style={{ color: '#1e3a8a' }}>
              {activeBranch?.name ?? 'Sin sede'}
            </p>
          </div>
          {showBranchSelector && (
            <ChevronDown className={`w-4 h-4 transition-transform ${branchOpen ? 'rotate-180' : ''}`} style={{ color: '#3b82f6' }} />
          )}
        </div>
      </div>

      {showBranchSelector && branchOpen && (
        <div className="absolute top-full left-4 right-4 bg-white rounded-xl border border-border shadow-lg z-50 overflow-hidden mt-1">
          {branches.map(branch => (
            <button
              key={branch.id}
              onClick={() => { setActiveBranch(branch); setBranchOpen(false) }}
              className={`w-full text-left px-4 py-3 text-sm flex items-center gap-2.5 transition cursor-pointer ${
                activeBranch?.id === branch.id
                  ? 'text-blue-deep font-semibold'
                  : 'text-ink-500 hover:bg-bg'
              }`}
              style={activeBranch?.id === branch.id ? { background: '#eff6ff' } : {}}
            >
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              {branch.name}
              {branch.address && (
                <span className="text-xs text-ink-400 truncate">{branch.address}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen flex bg-bg">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-border fixed inset-y-0 shadow-sm">
        <div className="px-6 py-6">
          <span className="fh-logo text-xl">fisiohub<span className="dot">.</span></span>
        </div>

        <BranchPill />

        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          <p className="fh-label px-3 py-2">Menú</p>
          {visibleItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/recepcion' || to === '/terapeuta'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive ? 'text-blue-deep font-semibold' : 'text-ink-500 hover:text-ink-900 hover:bg-bg'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                    style={isActive ? { background: 'var(--grad-blue)' } : {}}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-ink-400'}`} />
                  </div>
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-2 py-2 mb-1">
            <div
              className="fh-avatar w-8 h-8 text-xs"
              style={{ background: 'var(--grad-blue)' }}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-ink-900 truncate">{profile?.full_name}</p>
              <p className="text-xs text-ink-400">{profile?.role ? roleLabel[profile.role] : ''}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm text-ink-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer font-medium"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 bg-white border-b border-border px-4 h-14 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <span className="fh-logo text-base">fisiohub<span className="dot">.</span></span>
          {activeBranch && (
            <span className="text-xs text-ink-400 font-medium">{activeBranch.name}</span>
          )}
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-xl text-ink-500 hover:bg-bg cursor-pointer">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-20 bg-white pt-14 overflow-y-auto">
          <div className="p-4">
            <div className="rounded-xl px-3 py-2.5 mb-4" style={{ background: '#eff6ff' }}>
              <p className="fh-label" style={{ color: '#1e3a8a', marginBottom: 2 }}>Sede activa</p>
              <p className="text-sm font-bold" style={{ color: '#1e3a8a' }}>{activeBranch?.name ?? 'Sin sede'}</p>
            </div>
            {showBranchSelector && (
              <div className="mb-4 space-y-1">
                {branches.map(branch => (
                  <button
                    key={branch.id}
                    onClick={() => { setActiveBranch(branch); setMobileOpen(false) }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm flex items-center gap-2 cursor-pointer ${
                      activeBranch?.id === branch.id ? 'text-blue-deep font-semibold' : 'text-ink-500'
                    }`}
                    style={activeBranch?.id === branch.id ? { background: '#eff6ff' } : {}}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    {branch.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <nav className="px-4 space-y-1">
            {visibleItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition"
              >
                {({ isActive }) => (
                  <div
                    className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-medium -mx-4 -my-3.5"
                    style={isActive ? { background: 'var(--grad-blue)', color: 'white' } : { color: '#64748b' }}
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                  </div>
                )}
              </NavLink>
            ))}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm text-red-500 font-medium cursor-pointer mt-2"
            >
              <LogOut className="w-5 h-5" />
              Cerrar sesión
            </button>
          </nav>
        </div>
      )}

      <main className="flex-1 md:ml-64 pt-14 md:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  )
}
