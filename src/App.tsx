import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { RequireAuth } from '@/features/auth/RequireAuth'
import { AppConfigProvider } from '@/features/config/AppConfigProvider'
import { ThemeProvider } from '@/features/theme/ThemeProvider'
import { AccountPage } from '@/routes/AccountPage'
import { DashboardPage } from '@/routes/DashboardPage'
import { ForbiddenPage } from '@/routes/ForbiddenPage'
import { LoginPage } from '@/routes/LoginPage'
import { NotFoundPage } from '@/routes/NotFoundPage'

export default function App() {
  return (
    <AppConfigProvider>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<AppShell />}>
                <Route index element={<DashboardPage />} />
                <Route path="masuk" element={<LoginPage />} />
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
      </ThemeProvider>
    </AppConfigProvider>
  )
}
