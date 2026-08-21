import type { Role } from '@/types/database'

/**
 * Peta kemampuan per role (features/10-user-rbac.md).
 * CATATAN: ini HANYA untuk membentuk UI. Otorisasi sebenarnya ditegakkan RLS di server
 * (governance/01 rule 6 & 7 — UI hiding bukan security).
 */
export const PERMISSIONS = {
  super_admin: [
    'catalog.read',
    'catalog.write',
    'catalog.delete',
    'team.write',
    'user.manage',
    'config.write',
  ],
  admin: ['catalog.read', 'catalog.write', 'team.write'],
  member: ['catalog.read', 'team.self_edit'],
  viewer: ['catalog.read'],
} as const satisfies Record<Role, readonly string[]>

export type Permission = (typeof PERMISSIONS)[Role][number]

export function roleHas(role: Role | null | undefined, permission: Permission): boolean {
  if (!role) return false
  return (PERMISSIONS[role] as readonly string[]).includes(permission)
}
