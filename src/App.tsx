import { lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { RequireAuth } from '@/features/auth/RequireAuth'
import { AppConfigProvider } from '@/features/config/AppConfigProvider'
import { I18nProvider } from '@/features/i18n/I18nProvider'
import { ThemeProvider } from '@/features/theme/ThemeProvider'
import { DashboardPage } from '@/routes/DashboardPage'

// Beranda ikut bundel utama (halaman pertama yang dilihat semua orang);
// sisanya dimuat saat dibuka agar shell tetap ringan.
const AccountPage = lazy(async () => ({ default: (await import('@/routes/AccountPage')).AccountPage }))
const ConsolePage = lazy(async () => ({ default: (await import('@/routes/ConsolePage')).ConsolePage }))
const ForbiddenPage = lazy(async () => ({ default: (await import('@/routes/ForbiddenPage')).ForbiddenPage }))
const LoginPage = lazy(async () => ({ default: (await import('@/routes/LoginPage')).LoginPage }))
const NotFoundPage = lazy(async () => ({ default: (await import('@/routes/NotFoundPage')).NotFoundPage }))
const TeamPage = lazy(async () => ({ default: (await import('@/routes/TeamPage')).TeamPage }))

export default function App() {
  return (
    <AppConfigProvider>
      <ThemeProvider>
        <I18nProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                <Route element={<AppShell />}>
                  <Route index element={<DashboardPage />} />
                  <Route path="masuk" element={<LoginPage />} />
                  <Route path="team" element={<TeamPage />} />
                  <Route
                    path="console"
                    element={
                      <RequireAuth permission="catalog.write">
                        <ConsolePage />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="akun"
                    element={
                      <RequireAuth>
                        <AccountPage />
                      </RequireAuth>
                    }
                  />
                  <Route path="akses-ditolak" element={<ForbiddenPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </I18nProvider>
      </ThemeProvider>
    </AppConfigProvider>
  )
}
