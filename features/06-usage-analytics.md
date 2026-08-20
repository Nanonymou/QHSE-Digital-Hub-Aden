# Feature 06 — Usage Analytics

## Purpose
Mengukur pemakaian tiap tool untuk melihat mana yang paling berguna.

## Tracking
- Setiap launch → 1 open (tool_id, opened_at).
- Increment counter via RPC server-side (anti-manipulasi client).
- Simpan log open untuk histori (opsional agregasi harian).

## KPI (dashboard)
- Total tools / Active tools
- Categories
- Total opens (periode)
- Top tools by opens (admin)

## Rules
- Pencatatan gagal tidak boleh memblokir akses tool (fail-open pada logging).
- Detail log hanya untuk admin.
- Tidak menyimpan data pribadi user tanpa kebutuhan jelas.
