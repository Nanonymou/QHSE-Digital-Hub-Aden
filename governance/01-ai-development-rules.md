# AI Development Rules

## Objective
Menjaga Claude Code / coding agent tetap fokus, deterministik, dan hemat token saat membangun ADEN QHSE DIGITAL HUB.

## Mandatory Rules
1. Baca PRD/feature/technical yang relevan sebelum mengubah kode.
2. Jangan implementasi fitur tak-terspesifikasi berdasarkan asumsi.
3. **Jangan hardcode** nama perusahaan, kategori, status, accent/warna, URL tool, atau identitas brand.
4. Reuse entity/komponen/service yang ada sebelum bikin duplikat.
5. Pertahankan business logic yang ada kecuali spesifikasi mengubahnya.
6. **Jangan pernah bypass otorisasi server-side (RLS).**
7. **UI hiding bukan security** — validasi permission di server.
8. Perubahan DB harus backward-aware; migration jalan di Supabase SQL Editor.
9. Hindari dependency yang tidak perlu.
10. Pilih implementasi paling kecil yang stabil.
11. Jangan refactor kode tak-terkait saat mengerjakan satu fitur.
12. Jangan menulis ulang seluruh proyek untuk memperbaiki bug lokal.
13. Jaga konsistensi kontrak API/RPC.
14. Tangani state loading, empty, error, success.
15. Validasi client + server.
16. Upload file wajib validasi + cek permission.
17. Transisi status ditegakkan di server.
18. Sebelum menandai selesai: lint, typecheck, production build, dan verifikasi visual (Playwright) untuk UI.
19. Laporkan validasi yang gagal; jangan mengklaim sukses.
20. Jangan hapus fungsi yang bekerja tanpa instruksi eksplisit.

## UI & Animation
- **Wajib mengikuti `CLAUDE.md`** di root repository (governance/02 merangkumnya).
- Verifikasi visual setiap perubahan UI (screenshot Playwright), bukan menebak.

## Token Efficiency
- Baca hanya file relevan lebih dulu.
- Inspeksi implementasi yang ada sebelum bikin file baru.
- Perubahan tertarget; jangan regenerate file besar tanpa perlu.
- Ringkas perubahan & sisa masalah setelah implementasi.

## Definition of Done
Sebuah fitur selesai hanya jika:
- Requirement terimplementasi.
- Workflow existing tetap berfungsi.
- Otorisasi (RLS) bekerja.
- Validasi bekerja.
- Standar UI/animasi CLAUDE.md terpenuhi (60fps, reduced-motion, focus, kontras AA).
- Build production lolos.
- Tidak ada error console/runtime terkait perubahan.
