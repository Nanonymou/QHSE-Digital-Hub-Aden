import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { FadeIn } from '@/components/motion/FadeIn'
import { ErrorState } from '@/components/state/ErrorState'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/features/auth/useAuth'

type LocationState = { from?: string }

export function LoginPage() {
  const { status, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as LocationState | null)?.from ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (status === 'authenticated') {
    return <Navigate to={from} replace />
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    // Validasi client; server tetap memvalidasi ulang (governance/01 rule 15).
    if (!email.trim() || !password) {
      setError('Isi email dan kata sandi lebih dulu.')
      return
    }

    setSubmitting(true)
    try {
      await signIn(email.trim(), password)
      navigate(from, { replace: true })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Masuk gagal. Coba lagi sebentar lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <FadeIn className="mx-auto w-full max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Masuk ke hub</CardTitle>
          <CardDescription>
            Pakai akun yang sudah didaftarkan admin. Katalog publik tetap bisa dibuka tanpa masuk.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-5" onSubmit={(event) => void handleSubmit(event)} noValidate>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-invalid={Boolean(error) || undefined}
                placeholder="nama@perusahaan.co.id"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Kata sandi</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-invalid={Boolean(error) || undefined}
              />
            </div>

            {error ? <ErrorState title="Belum bisa masuk" description={error} /> : null}

            <Button type="submit" size="lg" loading={submitting} disabled={status === 'unavailable'}>
              Masuk
            </Button>

            {status === 'unavailable' ? (
              <p className="text-sm text-text-muted">
                Koneksi Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di .env, lalu
                jalankan ulang dev server.
              </p>
            ) : null}
          </form>
        </CardContent>
      </Card>
    </FadeIn>
  )
}
