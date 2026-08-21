import type { PostgrestError } from '@supabase/supabase-js'
import { requireSupabase } from '@/lib/supabase'
import type { AccentKey, Role, ToolStatus, Visibility } from '@/types/database'

/** Kode, bukan kalimat — komponen menerjemahkannya lewat kamus i18n. */
export type WriteErrorCode = 'denied' | 'slugTaken' | 'categoryInUse' | 'constraint' | 'network' | 'unknown'

export type WriteResult = { ok: true } | { ok: false; code: WriteErrorCode }

export type ToolInput = {
  name: string
  category_id: string | null
  description: string | null
  target_url: string
  icon: string | null
  accent: AccentKey
  status: ToolStatus
  tags: string[]
  release_date: string | null
  visibility: Visibility
  /** Diabaikan server saat visibility = 'public' (dinormalkan trigger). */
  allowed_roles: Role[]
}

export type CategoryInput = {
  name: string
  slug: string
  display_order: number
  active: boolean
}

/** Penolakan RLS sengaja tetap terlihat: tombol yang muncul bukan jaminan izin. */
function classify(error: PostgrestError): WriteErrorCode {
  if (error.code === '42501' || /row-level security/i.test(error.message)) return 'denied'
  switch (error.code) {
    case '23505':
      return 'slugTaken'
    case '23503':
      return 'categoryInUse'
    case '23514':
      return 'constraint'
    default:
      return 'unknown'
  }
}

export async function runWrite(
  action: () => Promise<{ error: PostgrestError | null }>,
): Promise<WriteResult> {
  try {
    const { error } = await action()
    if (error) return { ok: false, code: classify(error) }
    return { ok: true }
  } catch {
    return { ok: false, code: 'network' }
  }
}

// created_by/updated_by sengaja tidak dikirim client — diisi trigger server.
export function createTool(input: ToolInput): Promise<WriteResult> {
  return runWrite(async () => await requireSupabase().from('tools').insert(input))
}

export function updateTool(id: string, input: ToolInput): Promise<WriteResult> {
  return runWrite(async () => await requireSupabase().from('tools').update(input).eq('id', id))
}

/** Arsip & pulihkan = perubahan status, bukan hapus baris (soft delete, ERD § Notes). */
export function setToolStatus(id: string, status: ToolStatus): Promise<WriteResult> {
  return runWrite(async () => await requireSupabase().from('tools').update({ status }).eq('id', id))
}

/** Hapus permanen; RLS hanya mengizinkan super admin. */
export function deleteTool(id: string): Promise<WriteResult> {
  return runWrite(async () => await requireSupabase().from('tools').delete().eq('id', id))
}

export function createCategory(input: CategoryInput): Promise<WriteResult> {
  return runWrite(async () => await requireSupabase().from('categories').insert(input))
}

export function updateCategory(id: string, input: CategoryInput): Promise<WriteResult> {
  return runWrite(async () => await requireSupabase().from('categories').update(input).eq('id', id))
}

export function deleteCategory(id: string): Promise<WriteResult> {
  return runWrite(async () => await requireSupabase().from('categories').delete().eq('id', id))
}

/** Slug dibuat dari nama agar admin tidak perlu mengarangnya sendiri. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 48)
}
