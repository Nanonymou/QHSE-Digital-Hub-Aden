import { requireSupabase, supabase } from '@/lib/supabase'
import { runWrite, type WriteErrorCode, type WriteResult } from '@/features/console/console-api'
import type { TeamMember } from '@/types/database'

export type TeamErrorCode = 'load_failed'

export type TeamResult = { members: TeamMember[]; error: TeamErrorCode | null }

const COLUMNS =
  'id, user_id, full_name, position, department, photo_url, bio, email, phone, display_order, active, visible_public'

/**
 * Baris yang sampai ke client sudah disaring RLS: pengunjung anonim hanya
 * menerima anggota aktif yang disetujui tampil publik (features/14 § Privasi).
 */
export async function fetchTeam(): Promise<TeamResult> {
  if (!supabase) return { members: [], error: null }

  const { data, error } = await supabase
    .from('team_members')
    .select(COLUMNS)
    .order('display_order')
    .order('full_name')

  if (error) return { members: [], error: 'load_failed' }
  return { members: (data ?? []) as TeamMember[], error: null }
}

/** Kolom yang boleh diubah admin/SPV. */
export type TeamMemberInput = {
  full_name: string
  position: string | null
  department: string | null
  photo_url: string | null
  bio: string | null
  email: string | null
  phone: string | null
  display_order: number
  active: boolean
  visible_public: boolean
}

/** Kolom yang boleh diubah anggota atas barisnya sendiri (technical/04). */
export type SelfProfileInput = Pick<TeamMemberInput, 'photo_url' | 'bio' | 'email' | 'phone'>

export function createTeamMember(input: TeamMemberInput): Promise<WriteResult> {
  return runWrite(async () => await requireSupabase().from('team_members').insert(input))
}

export function updateTeamMember(id: string, input: TeamMemberInput): Promise<WriteResult> {
  return runWrite(async () => await requireSupabase().from('team_members').update(input).eq('id', id))
}

/**
 * Jalur self-edit: hanya mengirim kolom yang diizinkan. Kalaupun payload dipaksa
 * lewat API, trigger server menolak perubahan kolom terkunci.
 */
export function updateOwnProfile(id: string, input: SelfProfileInput): Promise<WriteResult> {
  return runWrite(async () => await requireSupabase().from('team_members').update(input).eq('id', id))
}

export const PHOTO_BUCKET = 'team-photos'
export const PHOTO_MAX_BYTES = 2 * 1024 * 1024
export const PHOTO_MIME = ['image/jpeg', 'image/png', 'image/webp']

export type PhotoErrorCode = 'photoType' | 'photoSize' | 'photoUpload'
export type PhotoResult = { ok: true; url: string } | { ok: false; code: PhotoErrorCode | WriteErrorCode }

/**
 * Unggah foto ke Storage. Validasi MIME & ukuran dilakukan di client sebagai
 * pagar pertama; policy Storage membatasi path ke folder milik user (features/14).
 */
export async function uploadTeamPhoto(file: File, ownerId: string): Promise<PhotoResult> {
  if (!PHOTO_MIME.includes(file.type)) return { ok: false, code: 'photoType' }
  if (file.size > PHOTO_MAX_BYTES) return { ok: false, code: 'photoSize' }

  const client = supabase
  if (!client) return { ok: false, code: 'network' }

  const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
  const path = `${ownerId}/${crypto.randomUUID()}.${extension}`

  const { error } = await client.storage.from(PHOTO_BUCKET).upload(path, file, {
    cacheControl: '3600',
    contentType: file.type,
    upsert: false,
  })
  if (error) return { ok: false, code: 'photoUpload' }

  const { data } = client.storage.from(PHOTO_BUCKET).getPublicUrl(path)
  return { ok: true, url: data.publicUrl }
}
