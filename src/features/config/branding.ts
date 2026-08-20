import type { Branding } from '@/types/database'

/**
 * Fallback netral saat `app_config.branding` belum terisi / Supabase belum terhubung.
 * Identitas asli (nama produk, perusahaan, logo) DISEED lewat migration ke `app_config`,
 * bukan ditanam di komponen (features/11 + governance/01 rule 3).
 */
export const FALLBACK_BRANDING: Branding = {
  product_name: 'Digital Hub',
  company_name: '',
  tagline: null,
  logo_url: null,
  default_lang: 'id',
  default_theme: 'dark',
}

/** Parse defensif: baris config berasal dari DB dan bisa saja tidak lengkap. */
export function parseBranding(value: unknown): Branding {
  if (typeof value !== 'object' || value === null) return FALLBACK_BRANDING
  const raw = value as Record<string, unknown>
  const str = (key: string): string | null => (typeof raw[key] === 'string' && raw[key] ? (raw[key] as string) : null)

  return {
    product_name: str('product_name') ?? FALLBACK_BRANDING.product_name,
    company_name: str('company_name') ?? FALLBACK_BRANDING.company_name,
    tagline: str('tagline'),
    logo_url: str('logo_url'),
    default_lang: str('default_lang') ?? FALLBACK_BRANDING.default_lang,
    default_theme: raw.default_theme === 'light' ? 'light' : FALLBACK_BRANDING.default_theme,
  }
}
