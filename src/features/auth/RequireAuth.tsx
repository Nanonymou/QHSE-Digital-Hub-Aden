import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { LoadingState } from '@/components/state/LoadingState'
import { roleHas, type Permission } from './permissions'
import { useAuth } from './useAuth'

type RequireAuthProps = {
  children: ReactNode
  /** Bila diisi, route juga menuntut kemampuan ini. Server tetap menegakkan lewat RLS. */
  permission?: Permission
}

export function RequireAuth({ children, permission }: RequireAuthProps) {
  const { status, profile } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return <LoadingState label="Memeriksa sesi kamu" />
  }

  if (status !== 'authenticated') {
    return <Navigate to="/masuk" replace state={{ from: location.pathname }} />
  }

  if (permission && !roleHas(profile?.role, permission)) {
    return <Navigate to="/akses-ditolak" replace />
  }

  return <>{children}</>
}
