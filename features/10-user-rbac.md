# Feature 10 — User & RBAC

## Roles
- **Super Admin** — semua akses, termasuk delete permanen & kelola user.
- **Admin** — kelola katalog (add/edit/archive) + kelola tim penuh. **SPV QHSE = role Admin**.
- **Member (staff QHSE)** — user login yang tertaut ke satu baris team_members; boleh edit profil SENDIRI (foto/kontak/bio) saja.
- **Viewer** — read-only katalog.
- **Public** — akses baca katalog publik (jika diaktifkan).

## Principles
- Least privilege.
- Server-side authorization (RLS), bukan UI hiding.
- Future: visibility tool per role/site.

## Rule
- Operasi tulis (tool/category) hanya untuk Admin/Super Admin, divalidasi RLS.
- Delete permanen hanya Super Admin.
