import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { RequireAuth } from '@/features/auth/RequireAuth'
import { AppConfigProvider } from '@/features/config/AppConfigProvider'
import { I18nProvider } from '@/features/i18n/I18nProvider'
import { ThemeProvider } from '@/features/theme/ThemeProvider'
import { AccountPage } from '@/routes/AccountPage'
import { ConsolePage } from '@/routes/ConsolePage'
import { DashboardPage } from '@/routes/DashboardPage'
import { ForbiddenPage } from '@/routes/ForbiddenPage'
import { LoginPage } from '@/routes/LoginPage'
import { NotFoundPage } from '@/routes/NotFoundPage'
import { TeamPage } from '@/routes/TeamPage'

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
