# Feature 02 — Tool Launch & Detail

## Purpose
Membuka tool target dan mencatat pemakaian, dengan opsi detail sebelum launch.

## Launch
- Klik kartu → buka Target URL (tab baru, `rel="noopener noreferrer"`).
- Catat 1 open via RPC server (tool_id, timestamp).
- Kegagalan pencatatan tidak boleh membatalkan launch.

## Detail (opsional)
Tampilkan:
- Name, description lengkap
- Category, tags, status
- Release date
- Opens (jika admin)
- Tombol Launch

## Rules
- Target URL harus divalidasi (skema https).
- Coming soon: tombol Launch nonaktif.
- Maintenance: launch boleh, tapi tampilkan peringatan status.
