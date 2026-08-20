# Deployment — Vercel + Supabase

## Prasyarat
- Repo sudah di GitHub.
- Proyek Supabase aktif (URL + anon key).
- App build lokal sukses (`npm run build` → `dist/`).

## A. Siapkan Supabase
1. Buat proyek di supabase.com.
2. Jalankan migration (schema di `technical/02-database-erd.md`) di **SQL Editor**.
3. Aktifkan **RLS** untuk semua tabel; buat policy sesuai `technical/04-backend-specification.md`.
4. Buat RPC `increment_tool_opens` (security definer).
5. Buat 1 user admin (Auth) + baris `profiles` role `super_admin`.
6. Catat: Project URL & anon public key (Settings → API).

## B. Deploy ke Vercel
1. vercel.com → Add New → Project → import repo GitHub.
2. Framework preset: **Vite** (otomatis). Build: `npm run build`. Output: `dist`.
3. **Environment Variables** (Settings → Environment Variables), tambahkan untuk Production + Preview:
   - `VITE_SUPABASE_URL` = https://YOUR-PROJECT.supabase.co
   - `VITE_SUPABASE_ANON_KEY` = anon public key
   - `VITE_DEFAULT_LANG` = id (opsional)
4. Deploy. Dapat URL live + SSL otomatis.
5. Tiap push ke branch utama → auto-deploy.

## C. SPA routing (penting)
`vercel.json` sudah menyertakan rewrites:
```
{ "rewrites": [ { "source": "/(.*)", "destination": "/index.html" } ] }
```
Ini mencegah **404 saat refresh** di route dalam (client-side routing). File statis di `dist`
tetap dilayani lebih dulu; sisanya jatuh ke index.html.

## D. Supabase Auth redirect
Di Supabase → Authentication → URL Configuration:
- Tambahkan domain Vercel (production + preview) ke **Site URL / Redirect URLs**,
  agar login/redirect tidak ditolak.

## E. Verifikasi pasca-deploy
- [ ] Halaman utama load, katalog tampil.
- [ ] Launch tool mencatat open.
- [ ] Login admin berhasil; CRUD tool jalan (RLS aktif).
- [ ] Refresh di route dalam tidak 404.
- [ ] Tidak ada secret selain anon key di Network/JS bundle.
- [ ] Lighthouse: performa & a11y wajar; reduced-motion dihormati.

## Catatan
- Ganti branding/logo via `app_config` + Storage, bukan rebuild kode.
- Service role key Supabase TIDAK PERNAH dipakai di frontend/Vercel client env.
