# Feature 14 — Team QHSE (Halaman Terpisah)

## Phase
Phase 5 (bareng i18n & Branding). Bukan bagian hero/katalog.

## Purpose
Halaman tersendiri yang memperkenalkan tim QHSE PT Aden Service — memberi wajah,
akuntabilitas (siapa PIC), dan kontak yang bisa dihubungi. TIDAK mengganggu fungsi
utama hub (temukan & luncurkan tool).

## Penempatan
- Route terpisah: `/team` (atau `/tim`).
- Ada entri di navigasi utama (mis. "Tim QHSE").
- Hero hub TIDAK diubah; katalog tetap halaman utama.

## Data per anggota
- Foto (Supabase Storage; ada fallback avatar bila kosong)
- Nama
- Jabatan (i18n: ID/EN/中文, atau single dengan fallback)
- Departemen / divisi
- Kontak: email dan/atau nomor telepon/WhatsApp (opsional per anggota)
- Urutan tampil (order)
- Aktif (bool) — nonaktif tidak tampil
- (opsional) lokasi/site, LinkedIn

## Rules
- **Configuration-driven**: data tim dari tabel `team_members`, TIDAK hardcoded.
- **Privasi**: hanya tampilkan anggota yang aktif & disetujui tampil. Jika hub dapat diakses
  publik, pertimbangkan halaman tim hanya untuk user login (role viewer+).
- Kontak: link `mailto:` untuk email, `tel:`/`https://wa.me/<no>` untuk telepon/WA.
  Jangan taruh data pribadi di URL query; gunakan skema link standar.
- Kelola data tim lewat Catalog Console (admin), bukan edit kode.
- Kelompokkan/filter per departemen (opsional).

## UI/Animation (CLAUDE.md)
- Grid kartu anggota: **stagger reveal** saat scroll masuk viewport.
- Hover halus: angkat kartu + tampilkan kontak; opsi foto grayscale→warna saat hover.
- Accent kartu boleh pakai token aksen (hijau/navy/kuning/…) untuk membedakan departemen.
- Tetap disiplin: hero mesh di halaman utama tetap satu-satunya elemen "berani".
- Empty state ("Belum ada anggota tim") & loading state wajib ada.
- Responsif: 1 kolom (mobile) → 2 (tablet) → 3-4 (desktop).

## Acceptance
- [ ] Halaman `/team` tampil terpisah, ada di navigasi.
- [ ] Kartu menampilkan foto, nama, jabatan, departemen, kontak.
- [ ] Link kontak berfungsi (mailto/tel/wa.me).
- [ ] Data dari `team_members` (bisa CRUD admin), tidak hardcoded.
- [ ] i18n jabatan/label bekerja.
- [ ] Privasi dihormati (hanya aktif & disetujui; opsi login-only).
- [ ] Animasi & a11y sesuai CLAUDE.md.

---

## Edit dari halaman (self-service + SPV)

### Model izin
- **Anggota (staff QHSE)** — edit **profil sendiri saja**, field terbatas:
  foto, kontak (email/phone/WA), bio. TIDAK boleh ubah jabatan, departemen, urutan,
  status aktif, atau data anggota lain.
- **SPV QHSE (= role Admin)** — kelola **semua anggota**: tambah, edit penuh (termasuk
  jabatan/departemen/urutan/aktif), nonaktifkan. SPV juga tampil sebagai salah satu kartu.
- **Super Admin** — di atas semuanya.
- **Viewer / publik** — read-only, tanpa tombol edit.

### Kepemilikan baris
- `team_members.user_id` → menautkan baris ke `auth.users`. Baris "milik" user bila
  `user_id = auth.uid()`.
- SPV/Admin yang juga anggota: barisnya punya `user_id` mereka + role admin → bisa edit
  semua (barisnya sendiri lewat kepemilikan, lainnya lewat role).

### UI di /team
- Kartu milik user login → tombol **"Edit profil saya"** (form field terbatas: foto/kontak/bio).
- SPV/Admin → tombol edit di **semua** kartu + tombol **"Tambah anggota"**.
- Viewer/publik → tidak ada tombol edit.
- Edit inline/modal; state: idle/submitting/success/error (tidak silent).

### Field yang boleh diubah anggota sendiri
DIIZINKAN: photo_url, email, phone, bio.
DIKUNCI (hanya SPV/Admin): full_name?, position, department, order, active, visible_public, user_id.
> Catatan: full_name boleh diatur editable-sendiri bila diinginkan; default dikunci agar konsisten.

### Aturan keamanan (WAJIB server-side)
- Enforce di **RLS**, bukan hanya sembunyikan tombol.
- Anggota hanya bisa UPDATE baris `user_id = auth.uid()` DAN hanya kolom yang diizinkan.
  Pembatasan kolom ditegakkan via trigger/RPC (Postgres RLS tidak membatasi per-kolom
  secara langsung — lihat technical/04).
- Upload foto: validasi MIME/size; simpan ke Supabase Storage; path per user.
- Jangan pernah izinkan anggota mengubah `user_id`, `active`, atau role.

### Acceptance (tambahan)
- [ ] Anggota bisa edit foto/kontak/bio profilnya sendiri dari /team.
- [ ] Anggota TIDAK bisa edit profil orang lain (dicoba via API pun ditolak RLS).
- [ ] Anggota TIDAK bisa ubah jabatan/departemen/aktif (ditolak server).
- [ ] SPV/Admin bisa edit semua anggota + tambah/nonaktifkan.
- [ ] SPV tampil sebagai kartu anggota sekaligus punya kontrol penuh.
- [ ] Semua pembatasan diverifikasi di server (RLS/trigger), bukan UI saja.
