# Kantin Mini — Next.js POS

Aplikasi pemesanan kantin + POS untuk pelanggan, kasir, manajer, dan admin. Dibangun dengan **Next.js 16 (App Router), React 19, dan Tailwind CSS 4**, lengkap dengan backend API, database PostgreSQL, autentikasi staf, dan integrasi Midtrans opsional.

## Menjalankan

```bash
npm install
cp .env.example .env.local
npm run dev
```

Buka `http://localhost:3000`.

Build produksi:

```bash
npm run build
npm start
```

## Backend

- API memakai **Next.js Route Handlers** di `app/api/`.
- Database memakai **PGlite** — engine PostgreSQL yang berjalan embedded sehingga proyek bisa langsung dijalankan tanpa kredensial cloud. Data disimpan di `~/.local/share/kantinmini/pglite` (di luar folder proyek agar watcher Next dev tidak me-reload halaman) dan otomatis di-seed pada request pertama.
- Skema database ada di `lib/server/db.ts` dan memakai tipe PostgreSQL standar (`jsonb`, `timestamptz`, sequence, constraint).
- Autentikasi staf memakai session cookie `httpOnly`; password di-hash dengan `scrypt`. Role dibatasi di setiap endpoint API.
- Foto menu diunggah ke `public/uploads/menus` dan otomatis dikonversi ke **WebP** dengan Sharp.
- Pembayaran QRIS memakai **Midtrans Core API** jika `MIDTRANS_SERVER_KEY` diisi. Tanpa key, QRIS memakai QR demo dan tombol simulasi pembayaran.
- Admin dapat mengubah **alur pesanan** di Pengaturan → Alur pesanan:
  - **Kasir**: order dibuat di database dan masuk antrean POS seperti sebelumnya.
  - **WhatsApp**: checkout tidak membuat order POS. Pembayaran cash langsung membuka WhatsApp; QRIS menampilkan QR dinamis (nominal pesanan dimasukkan ke payload merchant dari `public/assets/qr/new-qris.jpeg`) tombol **Unduh QR**, dan tombol **Saya sudah bayar**, lalu detail pesanan dikirim ke WhatsApp kantin.
- Webhook Midtrans tersedia di `POST /api/midtrans/webhook` dengan verifikasi `signature_key`.
- Update order kasir dan status pelanggan memakai polling otomatis (5 detik untuk antrean kasir, 3 detik untuk status pelanggan).

### Environment

Lihat `.env.example`.

```env
PGLITE_DATA_DIR=.data/pglite
MIDTRANS_ENVIRONMENT=sandbox
MIDTRANS_CLIENT_KEY=
MIDTRANS_SERVER_KEY=
DEMO_MODE=true
```

Set `DEMO_MODE=false` untuk menonaktifkan login demo. Untuk produksi, gunakan Midtrans server key dari environment, bukan dari database.

### Akun demo

Semua akun seed memakai kata sandi **`kantin123`**:

| Role | Email |
|---|---|
| Kasir | `rina@kantinmini.id` |
| Manajer | `budi@kantinmini.id` |
| Admin | `sari@kantinmini.id` |

Login memakai email dan kata sandi di atas.

Untuk mengosongkan database dan membuat seed baru:

```bash
rm -rf ~/.local/share/kantinmini/pglite
```

## API utama

| Endpoint | Akses |
|---|---|
| `GET /api/menu` | Publik |
| `GET /api/settings` | Publik |
| `POST /api/orders` | Publik (pesanan QR pelanggan) |
| `GET /api/orders/[token]` | Publik dengan token pesanan |
| `POST /api/orders/[token]/pay` | Simulasi QRIS (mode demo) |
| `GET/POST /api/auth/session`, `/login`, `/demo`, `/logout` | Autentikasi staf |
| `GET/POST /api/staff/orders` | Kasir/Admin |
| `PATCH /api/staff/orders/[id]` | Kasir/Admin |
| `GET /api/staff/reports` | Kasir/Manager/Admin |
| `GET /api/staff/dashboard` | Manager/Admin |
| `GET/POST/PATCH /api/staff/menus`, `/categories` | Manager/Admin |
| `GET/POST/PATCH /api/staff/accounts` | Admin |
| `GET/PATCH /api/staff/settings` | Admin |
| `GET /api/staff/print-settings` | Semua staf |
| `POST /api/staff/uploads` | Manager/Admin |
| `POST /api/midtrans/webhook` | Midtrans |

## Routes

### Pelanggan

| Route | Halaman |
|---|---|
| `/` | Landing page: hero background image, about carousel, cara pesan, lokasi, kontak & sosial |
| `/order?table=3` | Menu, search, kategori, detail, customize; cart drawer bawah |
| `/cart` | Redirect ke menu dan membuka drawer keranjang |
| `/checkout` | Checkout: tipe dine-in/takeaway, jam ambil/tiba, catatan, nama, QRIS/cash |
| `/payment` | Redirect ke `/checkout` |
| `/status` | Status pesanan realtime, QR/kode bayar, countdown, cetak struk pelanggan |
| `/whatsapp-status` | Ringkasan pesanan WhatsApp terakhir; halaman kembali setelah redirect ke WhatsApp |

### Staf

| Route | Role |
|---|---|
| `/login` | semua |
| `/pos` | Kasir/Admin |
| `/orders` | Kasir/Admin — papan antrean bayar → dapur → siap |
| `/cashier-report` | Kasir/Admin |
| `/dashboard` | Manajer/Admin |
| `/reports` | Manajer/Admin |
| `/menus` | Manajer/Admin |
| `/accounts` | Admin |
| `/settings` | Admin |

## Struktur penting

- `app/api/` — seluruh endpoint backend
- `lib/server/` — database, auth, orders, menu, reports, settings, Midtrans
- `lib/api-client.ts` — client API wrapper
- `lib/api-types.ts` — tipe data bersama frontend/backend
- `lib/use-menu.ts` — loader menu dari API
- `components/StaffShell.tsx` — sidebar, topbar, guard session/role
- `components/CartDrawer.tsx` — drawer keranjang pelanggan
- `app/styles/` — design system dan komponen visual
- `public/assets/` — aset menu, hero, QR meja, QRIS demo, font

## Catatan

- Cart pelanggan tetap disimpan di browser (`localStorage`) sampai checkout; pesanan, menu, akun, laporan, dan pengaturan tersimpan di database.
- Pada mode WhatsApp, pesanan tidak disimpan sebagai order POS. Checkout menyimpan ringkasan ke `/whatsapp-status`, lalu mengarahkan ke chat WhatsApp kantin. Saat pengguna kembali, ringkasan pesanan tetap tersedia di halaman tersebut. Nomor WhatsApp dapat diubah dari Pengaturan → Alur pesanan.
- Tombol back pada modal detail/customize/cart dan modal QRIS akan menutup modal, bukan meninggalkan halaman.
- QR meja masih berupa aset statis. Nomor meja/takeaway dibaca dari URL.
- Cetak struk memakai dialog print browser dan mendukung lebar 58/80 mm dari pengaturan.
- Foto menu demo berasal dari Unsplash dan sudah dikonversi ke WebP; kredit di `public/assets/menu/CREDITS.md`.
