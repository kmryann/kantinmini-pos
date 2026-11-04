# Kantin Mini — Next.js POS

Migrasi penuh prototipe Kantin Mini dari HTML statis ke **Next.js 16 (App Router), React 19, dan Tailwind CSS 4**.

## Menjalankan

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

Build produksi:

```bash
npm run build
npm start
```

## Routes

### Pelanggan

| Route | Halaman |
|---|---|
| `/` | Landing page: hero background image (`hero-kantin-sm/lg.webp`), about carousel, cara pesan, lokasi + Google Maps, kontak & sosial, navbar transparan di atas hero, primary setelah scroll, CTA mobile + menu mobile |
| `/order?table=3` | Menu full-bleed, search, kategori, detail, customize; cart berupa drawer bawah; bar bawah langsung ke checkout |
| `/cart` | Redirect ke menu dan membuka drawer keranjang |
| `/checkout` | Checkout: ringkasan item dengan quantity, nama, metode QRIS/cash, total & Buat pesanan |
| `/payment` | Redirect ke `/checkout` |
| `/status` | Status pesanan + QR/kode bayar + countdown |

### Staf

| Route | Role |
|---|---|
| `/login` | semua |
| `/pos` | Cashier / Admin |
| `/orders` | Cashier / Admin; papan 3 kolom: bayar → dapur → siap, kartu seragam |
| `/cashier-report` | Cashier / Admin |
| `/dashboard` | Manager / Admin |
| `/reports` | Manager / Admin |
| `/menus` | Manager / Admin |
| `/accounts` | Admin |
| `/settings` | Admin |

Login memakai tombol **Akses demo** untuk memilih Kasir, Manajer, atau Admin. Role disimpan di `localStorage`; halaman di luar role akan diarahkan ke halaman yang sesuai.

## Struktur

- `app/(customer)/` — layout pelanggan + halaman order/cart/checkout/status; `/payment` hanya redirect ke `/checkout`
- `app/(staff)/` — layout dashboard staf + semua halaman staf
- `app/login/` — login staf
- `components/CustomerProvider.tsx` — state cart dan konteks meja/takeaway
- `components/StaffShell.tsx` — sidebar, topbar, role guard
- `lib/data.ts` — seed menu, order, laporan, akun
- `lib/dictionaries.ts` — kamus ID/EN
- `lib/customer-storage.ts` — cart, active order, kode bayar
- `app/styles/` — design system, token visual, animasi, struk, dan komponen kompleks
- `public/assets/` — WebP menu, hero mobile/desktop (`assets/hero/`), QR meja, QRIS demo, font, favicon

Landing page mengambil kontak utama dari WhatsApp **0851-1769-3117** (`wa.me/6285117693117`). Alamat, jam buka, dan tautan sosial di halaman landing masih placeholder dan bisa diedit di `app/page.tsx`. Peta memakai Google Maps embed tanpa API key; ganti query alamat dengan lokasi sebenarnya.

Tailwind 4 dikonfigurasi lewat `app/globals.css` dengan theme token. Utility Tailwind dipakai untuk layout shell; visual detail (QR, struk, hero, animasi) tetap memakai design-system CSS agar hasilnya identik dengan prototipe.

## Data demo

- Cart dan order aktif memakai `localStorage`, sehingga alur pelanggan → kasir → status bisa dicoba dalam satu browser. Cart pelanggan tampil sebagai drawer bawah, bukan halaman penuh. Checkout dilakukan di `/checkout` (tombol Checkout di halaman menu langsung ke sini); setelah itu pelanggan langsung ke `/status`.
- Menu, kategori, dan akun yang diedit berlaku selama sesi halaman; reload mengembalikan seed.
- Lebar struk 58/80 mm, profil kantin, dan konfigurasi Midtrans disimpan di `localStorage`.
- Perubahan status dari halaman kasir akan memperbarui halaman status pelanggan lewat storage event.
- QRIS dan webhook Midtrans disimulasikan. QR contoh mengarah ke `kantinmini.id`; ganti dengan domain dan payload sebenarnya.
- Cetak struk memakai dialog print browser. Untuk cetak otomatis perlu mode kiosk/print agent.
- Foto menu demo berasal dari Unsplash dan sudah dikonversi ke WebP; kredit di `public/assets/menu/CREDITS.md`.
