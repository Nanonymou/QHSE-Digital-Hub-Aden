# PROJECT.md — ADEN QHSE DIGITAL HUB

> Konteks konkret proyek ini. `CLAUDE.md` (universal) mengatur *cara* UI/animasi;
> file ini mengisi *nilai* spesifik proyek: brand, palet, tipografi, stack, perintah, deploy.
> Claude Code: baca `PRD.md` + `governance/` + file ini sebelum menulis kode.

## Identitas
- **Produk:** ADEN QHSE DIGITAL HUB
- **Perusahaan:** PT Aden Service
- **Jenis:** Portal/launchpad tool QHSE (agregasi + launch + admin)
- **Bahasa UI:** Indonesian (default), English, 中文

## Stack (final)
- Vite + React 18 + TypeScript
- Tailwind CSS + shadcn/ui
- Framer Motion (animasi; ikuti CLAUDE.md §4)
- lucide-react (icon set tunggal)
- Supabase (Postgres + Auth + Storage + RLS + RPC)
- Deploy: **Vercel** (frontend) + Supabase (backend terkelola)

## Perintah standar
- Dev: `npm run dev` (Vite → http://localhost:5173)
- Build: `npm run build` (output `dist/`)
- Preview: `npm run preview`
- Lint: `npm run lint`
- Typecheck: `tsc -b` (bagian dari build)

## Palet — DIKONFIRMASI (arah brand)
> Dasar **oren gelap**; aksen hijau, navy, kuning, dan gradasi cerah (biru langit, pink).
> Semua sebagai token (light & dark). Boleh fine-tune nilai hex, tapi jangan ubah arah warnanya.
> Prinsip CLAUDE.md: "spend boldness in one place" — gradasi cerah dipakai HANYA di signature/hero,
> sisanya disiplin dengan oren + netral hangat.

### Dark (default)
```css
:root[data-theme="dark"] {
  /* base warm-dark */
  --bg: 20 13 10;            /* #140D0A near-black hangat */
  --surface: 31 23 18;       /* #1F1712 */
  --surface-2: 42 32 26;     /* #2A201A */
  --line: 255 255 255;       /* pakai via /8 opacity */
  --text: 245 239 234;       /* #F5EFEA off-white hangat */
  --text-muted: 184 169 158; /* #B8A99E */
  --text-subtle: 122 109 99; /* #7A6D63 */

  /* PRIMARY — oren gelap (identitas) */
  --primary: 234 88 12;      /* #EA580C */
  --primary-deep: 194 65 11; /* #C2410C — untuk tombol berteks (kontras AA lebih baik) */
  --primary-hover: 249 115 22;/* #F97316 */
  --primary-contrast: 255 255 255;

  /* status (via token, bukan hardcode) */
  --ok: 34 197 94;           /* #22C55E hijau */
  --warn: 250 204 21;        /* #FACC15 kuning */
  --danger: 239 68 68;       /* #EF4444 */
  --info: 56 189 248;        /* #38BDF8 biru langit */
}
```

### Accent tokens (data-driven, untuk kartu tool & kategori)
```
orange  #F97316   green  #22C55E   navy   #24408E
yellow  #FACC15   sky    #38BDF8   pink   #EC4899
```
> Tiap tool memilih SATU accent key (bukan hex bebas). Peta key→warna di app_config / token CSS.

### Gradasi cerah (khusus signature/hero)
```
grad-aurora:  #38BDF8 → #EC4899   (biru langit → pink)
grad-sunset:  #F97316 → #FACC15   (oren → kuning)
grad-mint:    #22C55E → #38BDF8   (hijau → biru langit)
```

### Light (turunan token yang sama)
- --bg cream hangat (mis. #FBF7F4), --surface putih, teks gelap hangat.
- --primary tetap oren (#EA580C / #C2410C untuk teks-di-atas-primary).
- Jangan bikin set warna terpisah; ubah nilai token yang sama.

### Aturan kontras (wajib)
- Teks di atas tombol primary: pakai **--primary-deep (#C2410C)** + teks putih → lolos AA.
- Gradasi cerah TIDAK untuk teks kecil; hanya latar dekоratif/signature.
- Semua pasangan teks/bg dicek AA (4.5:1 normal, 3:1 besar).

## Tipografi — usulan
- Display: Space Grotesk (teknis, karakterful, restraint)
- Body: Inter
- Mono: JetBrains Mono (label data/telemetri, URL, tags)
> Ganti bila ada guideline brand Aden Service. Jangan pakai default browser.

## Elemen signature
- Hero: **mesh/constellation "operations network"** yang merepresentasikan jaringan tool,
  merespons pointer secara halus. Garis/simpul memakai **gradasi cerah** (grad-aurora/mint)
  di atas base oren-gelap — inilah satu-satunya tempat warna "berani".
  Wajib versi statis untuk `prefers-reduced-motion`.

## Definition of done (ringkas)
lint ✓ · typecheck ✓ · build ✓ · verifikasi visual Playwright ✓ · RLS aktif ✓ · reduced-motion ✓
