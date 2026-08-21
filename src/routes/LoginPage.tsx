import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { FadeIn } from '@/components/motion/FadeIn'
import { ErrorState } from '@/components/state/ErrorState'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { LoginErrorCode } from '@/features/auth/auth-context'
import { useAuth } from '@/features/auth/useAuth'
import { useI18n } from '@/features/i18n/useI18n'

type LocationState = { from?: string }
type FormErrorCode = LoginErrorCode | 'empty'

export function LoginPage() {
  const { status, signIn } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as LocationState | null)?.from ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<FormErrorCode | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (status === 'authenticated') {
    return <Navigate to={from} replace />
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    // Validasi client; server tetap memvalidasi ulang (governance/01 rule 15).
    if (!email.trim() || !password) {
      setError('empty')
      return
    }

    setSubmitting(true)
    const result = await signIn(email.trim(), password)
    setSubmitting(false)

    if (!result.ok) {
      setError(result.code)
      return
    }
    navigate(from, { replace: true })
  }

  return (
    <FadeIn className="mx-auto w-full max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>{t('login.title')}</CardTitle>
          <CardDescription>{t('login.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-5" onSubmit={(event) => void handleSubmit(event)} noValidate>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">{t('login.email')}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-invalid={Boolean(error) || undefined}
                placeholder={t('login.emailPlaceholder')}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">{t('login.password')}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-invalid={Boolean(error) || undefined}
              />
            </div>

            {error ? (
              <ErrorState title={t('login.errorTitle')} description={t(`login.error.${error}`)} />
            ) : null}

            <Button type="submit" size="lg" loading={submitting} disabled={status === 'unavailable'}>
              {t('login.submit')}
            </Button>

            {status === 'unavailable' ? (
              <p className="text-sm text-text-muted">{t('login.envMissing')}</p>
            ) : null}
          </form>
        </CardContent>
      </Card>
    </FadeIn>
  )
}
