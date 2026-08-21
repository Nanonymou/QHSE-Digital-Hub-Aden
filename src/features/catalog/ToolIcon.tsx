import { createElement } from 'react'
import { resolveToolIcon } from './tool-icons'

/**
 * Membungkus pencarian ikon dari registry agar pemanggil tidak perlu
 * memegang referensi komponen hasil lookup.
 */
export function ToolIcon({ name, className }: { name: string | null | undefined; className?: string }) {
  return createElement(resolveToolIcon(name), { className, 'aria-hidden': true })
}
