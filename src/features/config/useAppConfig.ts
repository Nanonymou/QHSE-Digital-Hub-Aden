import { useContext } from 'react'
import { AppConfigContext, type AppConfigContextValue } from './app-config-context'

export function useAppConfig(): AppConfigContextValue {
  const ctx = useContext(AppConfigContext)
  if (!ctx) throw new Error('useAppConfig harus dipakai di dalam <AppConfigProvider>.')
  return ctx
}
