import type { PostgrestError } from '@supabase/supabase-js'
import { requireSupabase } from '@/lib/supabase'
import type { AccentKey, ToolStatus } from '@/types/database'

export type WriteResult = { ok: true } | { ok: false; message: string }

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
}

export type CategoryInput = {
  name: string
  slug: string
  display_order: number
  active: boolean
}

/**
 * Menerjemahkan error Postgres jadi kalimat yang bisa ditindaklanjuti.
 * Penolakan RLS sengaja tetap terlihat: tombol yang muncul bukan jaminan izin.
 */
function describe(error: PostgrestError): string {
  if (error.code === '42501' || /row-level security/i.test(error.message)) {
    return 'Server menolak perubahan ini: role kamu tidak punya izin tulis di katalog.'
  }
  switch (error.code) {
    case '23505':
      return 'Slug kategori itu sudah dipakai. Pilih slug lain.'
    case '23503':
      return 'Kategori ini masih dipakai tool. Pindahkan tool-nya ke kategori lain lebih dulu.'
    case '23514':
      return 'Data ditolak server: alamat tool harus diawali https:// dan accent harus salah satu key token.'
    default:
      return 'Perubahan gagal disimpan. Coba lagi, dan laporkan ke super admin bila terus terjadi.'
  }
}

async function run(action: () => Promise<{ error: PostgrestError | null }>): Promise<WriteResult> {
  try {
    const { error } = await action()
    if (error) return { ok: false, message: describe(error) }
    return { ok: true }
  } catch {
    return { ok: false, message: 'Tidak bisa menghubungi server. Periksa koneksi, lalu coba lagi.' }
  }
}

// created_by/updated_by sengaja tidak dikirim client — diisi trigger server.
export function createTool(input: ToolInput): Promise<WriteResult> {
  return run(async () => await requireSupabase().from('tools').insert(input))
}

export function updateTool(id: string, input: ToolInput): Promise<WriteResult> {
  return run(async () => await requireSupabase().from('tools').update(input).eq('id', id))
}

/** Arsip & pulihkan = perubahan status, bukan hapus baris (soft delete, ERD § Notes). */
export function setToolStatus(id: string, status: ToolStatus): Promise<WriteResult> {
  return run(async () => await requireSupabase().from('tools').update({ status }).eq('id', id))
}

/** Hapus permanen; RLS hanya mengizinkan super admin. */
export function deleteTool(id: string): Promise<WriteResult> {
  return run(async () => await requireSupabase().from('tools').delete().eq('id', id))
}

export function createCategory(input: CategoryInput): Promise<WriteResult> {
  return run(async () => await requireSupabase().from('categories').insert(input))
}

export function updateCategory(id: string, input: CategoryInput): Promise<WriteResult> {
  return run(async () => await requireSupabase().from('categories').update(input).eq('id', id))
}

export function deleteCategory(id: string): Promise<WriteResult> {
  return run(async () => await requireSupabase().from('categories').delete().eq('id', id))
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
