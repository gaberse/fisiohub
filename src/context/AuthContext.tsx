import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { Profile, Branch } from '@/types'

interface AuthContextType {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  activeBranch: Branch | null
  branches: Branch[]
  setActiveBranch: (branch: Branch) => void
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [activeBranch, setActiveBranch] = useState<Branch | null>(null)
  const [branches, setBranches] = useState<Branch[]>([])

  useEffect(() => {
    if (!isSupabaseConfigured) return

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session)
        if (session) fetchProfile(session.user.id)
        else setLoading(false)
      })
      .catch(() => setLoading(false))

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: string, session: Session | null) => {
        setSession(session)
        if (session) fetchProfile(session.user.id)
        else { setProfile(null); setActiveBranch(null); setBranches([]); setLoading(false) }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId: string) {
    const { data: prof } = await supabase
      .from('profiles').select('*').eq('user_id', userId).single()

    setProfile(prof)

    if (prof) {
      const { data: branchList } = await supabase
        .from('branches')
        .select('*')
        .eq('clinic_id', prof.clinic_id)
        .eq('active', true)
        .order('name')

      const list = branchList ?? []
      setBranches(list)

      // Admin sin branch_id asignado → primera sede por defecto
      // Staff → su sede fija
      if (prof.branch_id) {
        const fixed = list.find(b => b.id === prof.branch_id) ?? list[0] ?? null
        setActiveBranch(fixed)
      } else {
        setActiveBranch(list[0] ?? null)
      }
    }

    setLoading(false)
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{
      session,
      user: session?.user ?? null,
      profile,
      loading,
      activeBranch,
      branches,
      setActiveBranch,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
