import { Mail, MessageCircle, Phone } from 'lucide-react'
import { useI18n } from '@/features/i18n/useI18n'
import type { TeamMember } from '@/types/database'

const linkClass =
  'inline-flex size-9 items-center justify-center rounded-md border border-hairline text-text-muted transition-colors duration-micro ease-out-soft hover:bg-surface-elevated hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

/** Nomor untuk wa.me harus tanpa tanda plus dan tanpa pemisah. */
function waNumber(phone: string): string {
  return phone.replace(/[^0-9]/g, '')
}

/** Kontak memakai skema link standar; tidak ada data pribadi di query string (features/14). */
export function ContactLinks({ member }: { member: TeamMember }) {
  const { t } = useI18n()

  if (!member.email && !member.phone) return null

  return (
    <div className="flex items-center gap-2">
      {member.email ? (
        <a
          className={linkClass}
          href={`mailto:${member.email}`}
          aria-label={t('team.contactEmail', { name: member.full_name })}
          title={member.email}
        >
          <Mail aria-hidden className="size-4" />
        </a>
      ) : null}
      {member.phone ? (
        <>
          <a
            className={linkClass}
            href={`tel:${member.phone}`}
            aria-label={t('team.contactPhone', { name: member.full_name })}
            title={member.phone}
          >
            <Phone aria-hidden className="size-4" />
          </a>
          <a
            className={linkClass}
            href={`https://wa.me/${waNumber(member.phone)}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('team.contactWhatsapp', { name: member.full_name })}
          >
            <MessageCircle aria-hidden className="size-4" />
          </a>
        </>
      ) : null}
    </div>
  )
}
