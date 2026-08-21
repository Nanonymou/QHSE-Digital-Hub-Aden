# Panduan Uji V1 — ADEN QHSE DIGITAL HUB

Checklist berurutan untuk memastikan V1 (Phase 1–6) benar-benar stabil sebelum
modul future dilanjutkan. Kerjakan dari atas; setiap langkah menganggap langkah
sebelumnya sudah lolos.

Tanda ✅ = yang harus kamu lihat. Kalau tidak cocok, berhenti dan laporkan
langkahnya — jangan lanjut, karena langkah berikutnya menumpang di atasnya.

---

## 0. Persiapan

- [ ] Node 20 (`.nvmrc`), lalu `npm install`
- [ ] Proyek Supabase sudah dibuat (region terdekat)
- [ ] Salin `.env.example` → `.env`, isi dari Supabase → Project Settings → API:
      `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`
- [ ] ✅ Tidak ada key lain di `.env`. **Service role key tidak pernah masuk ke client.**

---

## 1. Migration database

Jalankan berurutan di Supabase → SQL Editor → New query → Run. Semuanya idempoten,
jadi aman diulang kalau ragu.

- [ ] `supabase/migrations/0001_phase1_foundation.sql` — enum role, `profiles`,
      `app_config`, helper role, RLS, seed branding
- [ ] `supabase/migrations/0002_phase2_catalog.sql` — `categories`, `tools`,
      `open_logs`, RPC `increment_tool_opens`, seed 7 kategori
- [ ] `supabase/migrations/0003_phase5_team.sql` — `team_members`, trigger penjaga
      kolom, bucket Storage `team-photos`
- [ ] `supabase/migrations/0004_phase7_role_visibility.sql` — kolom `allowed_roles`
      dan policy SELECT tools yang menghormati scope role

Verifikasi cepat:

```sql
select table_name from information_schema.tables
 where table_schema = 'public' order by table_name;
-- ✅ app_config, categories, open_logs, profiles, team_members, tools

select key from public.app_config;
-- ✅ accent_tokens, branding

select count(*) from public.categories;
-- ✅ 7
```

---

## 2. Akun & role

- [ ] Supabase → Authentication → Users → **Add user** (email + password, centang
      auto-confirm agar tidak perlu klik email)
- [ ] Naikkan jadi super admin:

```sql
update public.profiles p
   set role = 'super_admin'
  from auth.users u
 where u.id = p.id and u.email = 'email-kamu@contoh.com';

select u.email, p.role, p.active
  from public.profiles p join auth.users u on u.id = p.id;
-- ✅ role = super_admin, active = true
```

- [ ] Buat **satu user kedua** dengan cara sama, biarkan role-nya `viewer`.
      Dipakai untuk menguji RBAC di langkah 5.

---

## 3. Jalankan & isi katalog

- [ ] `npm run dev` → buka http://localhost:5173
- [ ] ✅ Banner "Supabase belum terhubung" **tidak** muncul lagi
- [ ] ✅ Nama produk & tagline muncul dari `app_config` (bukan "Digital Hub")
- [ ] Masuk sebagai super admin → ✅ item nav **Catalog Console** muncul
- [ ] Console → Tambah tool: nama, kategori, alamat `https://…`, ikon, accent, status
- [ ] ✅ Tool muncul di katalog beranda sebagai kartu
- [ ] Coba isi alamat tanpa `https://` → ✅ ditolak dengan pesan yang jelas

---

## 4. Launch & analytics

- [ ] Klik **Buka tool** → ✅ tab baru terbuka ke URL target
- [ ] Kembali ke hub, muat ulang → ✅ KPI "Total dibuka" bertambah 1
- [ ] Set satu tool ke status **Segera hadir** → ✅ kartunya tidak bisa diluncurkan
- [ ] Set satu tool ke **Perbaikan** → ✅ masih bisa dibuka, tapi dialog Detail
      menampilkan peringatan
- [ ] Arsipkan satu tool → ✅ hilang dari katalog, masih terlihat di Console
- [ ] Sebagai admin: ✅ panel **Pemakaian** muncul (30 hari terakhir + peringkat)

---

## 5. RBAC — yang paling penting

Uji dengan user kedua (role `viewer`). Ini menguji **server**, bukan tampilan.

- [ ] Masuk sebagai viewer → ✅ tidak ada item nav Catalog Console
- [ ] Buka `http://localhost:5173/console` langsung di address bar →
      ✅ dialihkan ke halaman "Halaman ini di luar hak aksesmu"
- [ ] Uji lewat API (bukan UI). Di SQL Editor, tiru identitas viewer:

```sql
-- ganti <uuid-viewer> dengan id user viewer
set local role authenticated;
set local request.jwt.claims = '{"sub":"<uuid-viewer>","role":"authenticated"}';

insert into public.tools (name, target_url) values ('Percobaan', 'https://a.co');
-- ✅ HARUS gagal: new row violates row-level security policy

update public.tools set name = 'Diretas';
-- ✅ HARUS 0 baris terpengaruh / ditolak
```

- [ ] Naikkan viewer jadi `admin` lewat SQL, muat ulang hub →
      ✅ Console muncul tanpa perubahan kode apa pun

---

## 6. Visibility per role (Phase 7)

- [ ] Console → ubah satu tool → bagian **Akses** → "Role tertentu saja" →
      centang hanya **Admin** dan **Super admin** → simpan
- [ ] ✅ Kartu tool itu mendapat badge **Terbatas**
- [ ] Buka hub di jendela penyamaran (tanpa login) → ✅ tool itu **tidak muncul**
- [ ] Masuk sebagai viewer → ✅ tool itu tetap **tidak muncul**
- [ ] Uji lewat API sebagai anon — ini membuktikan penyaringannya di server:

```sql
set local role anon;
select name, visibility from public.tools;
-- ✅ tool role_scoped TIDAK ada di hasil
```

- [ ] Ubah aksesnya kembali ke "Semua orang" → ✅ tool muncul lagi untuk semua

---

## 7. Halaman Tim

- [ ] Buka `/team` sebagai admin → **Tambah anggota**: nama, jabatan, departemen,
      email/telepon, centang **Tampil untuk publik**
- [ ] Unggah foto → ✅ terunggah, muncul di kartu
- [ ] Coba unggah file > 2 MB atau PDF → ✅ ditolak dengan pesan spesifik
- [ ] ✅ Tombol email/telepon/WhatsApp membuka aplikasi yang benar
- [ ] Buka `/team` tanpa login → ✅ hanya anggota `active` + `visible_public` yang tampil
- [ ] Tautkan satu baris ke akun anggota, lalu masuk sebagai anggota itu:

```sql
update public.team_members m
   set user_id = u.id
  from auth.users u
 where u.email = 'anggota@contoh.com' and m.full_name = 'Nama Anggota';
```

- [ ] ✅ Muncul tombol **Edit profil saya** hanya di kartunya sendiri
- [ ] ✅ Field jabatan/departemen/urutan/aktif tidak bisa diubah anggota
- [ ] Uji server menolak, bukan sekadar UI:

```sql
set local role authenticated;
set local request.jwt.claims = '{"sub":"<uuid-anggota>","role":"authenticated"}';

update public.team_members set position = 'Direktur' where user_id = '<uuid-anggota>';
-- ✅ HARUS gagal: Hanya SPV/admin yang boleh mengubah ... jabatan ...
```

---

## 8. i18n, tema, a11y

- [ ] Ganti bahasa ke English lalu 中文 → ✅ seluruh teks UI ikut berubah, tanpa reload
- [ ] Muat ulang → ✅ pilihan bahasa bertahan
- [ ] Toggle tema terang/gelap → ✅ seluruh halaman ikut, kontras tetap enak dibaca
- [ ] Navigasi dengan **Tab** saja dari atas halaman → ✅ "Lompat ke konten" muncul
      lebih dulu, dan setiap elemen interaktif punya cincin fokus yang terlihat
- [ ] Aktifkan reduce motion di OS, muat ulang → ✅ konstelasi hero diam, kartu
      muncul tanpa animasi

---

## 9. Build & deploy Vercel

- [ ] `npm run lint` → ✅ 0
- [ ] `npm run build` → ✅ sukses, output ke `dist/`
- [ ] Import repo ke Vercel, set env `VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY`
- [ ] Deploy → buka URL produksi
- [ ] Refresh di rute dalam (mis. `/team`) → ✅ tidak 404 (rewrites `vercel.json`)
- [ ] DevTools → Application → Manifest → ✅ terbaca, ikon tampil
- [ ] DevTools → Application → Service Workers → ✅ activated
- [ ] Lighthouse (mode Mobile) → ✅ **Installable**
- [ ] Android Chrome: menu → **Install app** → ✅ terpasang, buka standalone
      (tanpa address bar), splash memakai warna brand
- [ ] iOS Safari: Share → **Add to Home Screen** → ✅ ikon benar
      (catatan: dukungan service worker iOS lebih terbatas dari Android)
- [ ] DevTools → Network → **Offline**, lalu muat ulang →
      ✅ shell + katalog terakhir tetap tampil, banner "Kamu sedang offline" muncul
- [ ] Deploy versi baru selagi tab lama terbuka →
      ✅ muncul prompt "Versi baru tersedia" (bukan reload paksa)

---

## 10. Sisa yang perlu kamu siapkan sendiri

- [ ] **Logo Aden Service** — ikon PWA saat ini masih placeholder monogram dari
      token brand. Timpa `public/icons/icon-192.png`, `icon-512.png`,
      `icon-512-maskable.png`, `public/apple-touch-icon.png`, `public/favicon.svg`,
      lalu isi **URL logo** di Console → Branding.
- [ ] Daftar tool QHSE asli beserta URL-nya.
- [ ] Data anggota tim beserta foto.

Setelah semua ✅, V1 layak disebut stabil dan modul Phase 7 berikutnya
(SSO, favorites, health-check, AI assistant) bisa dibahas satu per satu.
