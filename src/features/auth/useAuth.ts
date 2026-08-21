import { useContext } from 'react'
import { AuthContext, type AuthContextValue } from './auth-context'
import { roleHas, type Permission } from './permissions'

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth harus dipakai di dalam <AuthProvider>.')
  return ctx
}

/** Cek kemampuan untuk membentuk UI. Server tetap memvalidasi lewat RLS. */
export function usePermission(permission: Permission): boolean {
  const { profile } = useAuth()
  return roleHas(profile?.role, permission)
}
