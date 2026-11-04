# PRD — Kantin Mini (Website POS Kantin)

| | |
|---|---|
| **Produk** | Kantin Mini — website pemesanan & Point of Sale (POS) kantin |
| **Platform** | Web (responsive: HP, tablet, desktop) |
| **Bahasa antarmuka** | Indonesia dan Inggris |
| **Cabang** | Satu cabang |
| **Status dokumen** | Draft v1.0 |

---

## 1. Ringkasan

Kantin Mini adalah website untuk mengelola pemesanan dan penjualan di kantin. Pelanggan dapat memesan sendiri tanpa login dengan memindai QR (takeaway atau nomor meja dine-in), membayar lewat QRIS (Midtrans) atau cash, lalu memantau status pesanan. Staf (kasir, manajer, admin) memakai dashboard berbasis sidebar untuk melayani POS, mengelola pesanan, menu, laporan, dan akun.

## 2. Tujuan

- Mempercepat pemesanan dan mengurangi antrean di kasir.
- Mempermudah kasir menerima pesanan dari meja maupun pelanggan langsung (walk-in).
- Memberi manajer visibilitas atas penjualan dan menu terlaris.
- Mencetak struk dapur dan struk pelanggan secara andal.

**Di luar cakupan saat ini:** riwayat pesanan pelanggan, pajak, diskon/voucher, add-on berbayar, stok berhitung jumlah, multi-cabang.

## 3. Peran Pengguna (Role)

| Role | Login | Akses utama |
|---|---|---|
| **User (pelanggan)** | Tidak | Landing page, halaman order, pembayaran, status order |
| **Cashier** | Ya | POS, daftar order & payment masuk, laporan hari ini |
| **Manager** | Ya | Dashboard & laporan keseluruhan, kelola menu dan kategori |
| **Admin** | Ya | Seluruh akses manager dan cashier, serta kelola akun & pengaturan |

Navigasi **sidebar** dipakai pada role Cashier, Manager, dan Admin.

## 4. Tech Stack

- **Frontend/Framework:** Next.js
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL (via Supabase)
- **Backend services:** Supabase (Auth untuk staf, Storage untuk foto menu, Realtime untuk update order/status)
- **Payment:** Midtrans (QRIS)
- **Format gambar menu:** WebP

## 5. Desain & UI

- **Warna primary:** `#119977`
- **Responsive wajib** di HP, tablet, dan desktop untuk semua halaman. Prioritas desain per role:

| Role / Halaman | Pendekatan | Catatan |
|---|---|---|
| **User (pelanggan)** | **Mobile-first** | Sangat penting rapi dan nyaman di HP. Tetap responsive di tablet dan desktop. |
| **Cashier** | **Desktop-first** | Dioptimalkan untuk layar POS (tablet/desktop). Tetap responsive ke tablet dan HP. |
| **Admin** | **Desktop-first** | Tetap responsive ke tablet dan HP. |
| **Manager** | **Desktop-first dan mobile-first** | Dashboard dan laporan harus nyaman dipantau dari HP, dan tetap optimal di desktop. |

- **Icon, bukan emoticon:** seluruh antarmuka memakai set icon yang konsisten (mis. Lucide). Emoji tidak dipakai.
- **Minim teks, mudah dipahami:** setiap halaman punya satu tujuan jelas dan satu aksi utama yang menonjol. Label singkat, instruksi hanya bila perlu, dan pelanggan langsung tahu langkah berikutnya tanpa membaca panjang.
- **Dwibahasa:** Indonesia dan Inggris, dengan pengganti bahasa (language switcher) di halaman pelanggan dan staf.
- Foto menu disimpan dan ditampilkan dalam format **WebP**.

---

## 6. Fitur Role User (Pelanggan)

### 6.1 Alur Utama

`Scan QR → Halaman Order → Cart → Payment → Status Order`

### 6.2 Landing Page
- Memperkenalkan Kantin Mini (identitas, jam buka, lokasi, CTA).
- **Tidak menampilkan menu lengkap** (hanya highlight/ajakan untuk memesan).

### 6.3 Akses Halaman Order via QR
- Ada **2 jenis QR umum**: **Takeaway** dan **Dine-in**.
- Dine-in memiliki **7 meja**, masing-masing dengan **QR berbeda** (nomor meja terbawa otomatis ke pesanan).
- Pelanggan **tidak perlu login**; nama diinput saat payment.

### 6.4 Halaman Order
1. **Search** menu.
2. **Sticky horizontal tab kategori** dengan indikator underline.
3. **Daftar menu bergaya GoFood/GrabFood**: satu menu per baris (1 kolom).
   - **Kiri:** nama menu, deskripsi singkat, harga.
   - **Kanan:** foto menu, dengan tombol **Add** yang sedikit menimpa bagian bawah gambar.
4. Menu berstatus **habis** ditampilkan nonaktif (tidak bisa ditambahkan).
5. **Modal detail menu (fullscreen):** saat menu diklik, muncul modal fullscreen berisi:
   - Gambar menu ukuran lebih besar di bagian atas.
   - Nama, deskripsi, dan harga.
   - Pengatur jumlah dan **catatan opsional** (mis. "tidak pedas").
   - Tombol utama **Tambah ke cart** yang menempel di bawah layar.
   - Tombol tutup (icon) yang jelas di pojok atas.
6. **Modal customize menu (fullscreen):** untuk menu customizable (pilihan saus dan rasa), saat tombol Add atau Tambah ke cart ditekan muncul modal fullscreen berisi pilihan saus/rasa yang **wajib dipilih**. Tombol konfirmasi aktif hanya setelah semua pilihan wajib terisi. Belum ada biaya tambahan.
   - Menu tanpa pilihan (non-customizable) langsung masuk cart tanpa modal ini.
7. **Floating cart bar** menempel di bawah layar (jumlah item dan total) yang membuka halaman Cart.

### 6.5 Cart
- Ubah jumlah, hapus item, lihat pilihan saus/rasa dan catatan, lihat total.

### 6.6 Payment
- Pelanggan **mengisi nama** (wajib).
- Pilih metode: **QRIS** atau **Cash**.
  - **QRIS (Midtrans):** menampilkan QR bayar; status pembayaran diperbarui otomatis lewat notifikasi/webhook Midtrans.
  - **Cash:** sistem membuat **kode bayar**; pelanggan membayar di kasir, lalu kasir melakukan ACC.
- **Batas waktu pembayaran: 30 menit** sejak pesanan dibuat, berlaku untuk QRIS dan cash. Hitung mundur ditampilkan jelas di halaman payment dan status order. Jika lewat, pesanan otomatis **kedaluwarsa** dan pelanggan diarahkan untuk memesan ulang.

### 6.7 Status Order
- Indikator **3 dot** bertahap: **Pesan → Masak → Siap**.
- Menampilkan **QR bayar** (QRIS) atau **kode bayar** (cash) selama belum lunas.
- Menampilkan **rincian pesanan** (item, pilihan, catatan, total, nama, nomor meja/takeaway).
- Status diperbarui otomatis (realtime) tanpa refresh manual.
- Tidak ada riwayat pesanan; halaman status diakses lewat tautan/sesi pesanan yang aktif.

---

## 7. Fitur Role Cashier

1. **POS (layar utama)** — untuk dine-in maupun takeaway, terutama pelanggan yang **tidak memesan lewat meja**.
   - Layout **2 kolom rasio 3:1**: kiri daftar menu (dengan search/kategori), kanan order terpilih (item, catatan, total, metode pembayaran, tombol bayar/proses).
   - Mendukung pilihan saus/rasa wajib, catatan, dan nama pelanggan.
   - Pembayaran **QRIS** atau **Cash**.
2. **Order & Payment Masuk**
   - Daftar pesanan dari pelanggan (QR) dan POS, dengan status pembayaran dan status order.
   - **ACC pembayaran cash** berdasarkan **kode bayar atau nama pelanggan**.
   - **Kasir mengubah status order**: Pesan → Masak → Siap.
   - Cetak ulang struk.
3. **Laporan Hari Ini** — ringkasan penjualan dan transaksi hari berjalan saja (tidak bisa melihat laporan keseluruhan).

## 8. Fitur Role Manager

1. **Dashboard**
   - Laporan keuangan dan transaksi **hari ini**, atau dengan **filter** rentang tanggal.
   - **Grafik** penjualan/transaksi.
   - **Menu terlaris minggu ini**.
2. **Laporan Transaksi Keseluruhan** — daftar seluruh transaksi dengan filter (tanggal, metode bayar, status, tipe dine-in/takeaway).
3. **Manajemen Menu**
   - Tambah dan edit menu (nama, deskripsi, harga, foto WebP, kategori, opsi saus/rasa).
   - **Toggle tersedia/habis**.
   - **Atur urutan menu** dan **kategori** (tambah/edit/urutkan).

## 9. Fitur Role Admin

- Memiliki **seluruh akses** Manager dan Cashier.
- **Manajemen akun** staf (buat, ubah, nonaktifkan, atur role).
- Pengaturan dasar sistem (mis. profil kantin, QR meja, konfigurasi printer/struk, kunci integrasi Midtrans).

---

## 10. Cetak Struk

- Dua jenis struk: **Struk Dapur** (item, pilihan saus/rasa, catatan, tipe dine-in/takeaway & nomor meja) dan **Struk Pelanggan** (rincian item, total, metode bayar, nama, waktu).
- Dicetak dengan **thermal printer**; **ukuran kertas belum ditentukan**, sehingga desain struk dibuat **dapat dikonfigurasi (58 mm / 80 mm)** oleh admin.
- Metode cetak (asumsi): cetak lewat browser dengan stylesheet khusus struk (`@media print`). Integrasi langsung (ESC/POS) dapat ditinjau bila diperlukan.
- Struk dapur dan struk pelanggan dapat dicetak otomatis setelah pembayaran lunas, dan dapat dicetak ulang oleh kasir.

## 11. Status & Aturan Bisnis

| Konsep | Nilai |
|---|---|
| **Status pembayaran** | Menunggu pembayaran → Lunas (atau Kedaluwarsa setelah 30 menit / Gagal) |
| **Status order** | Pesan → Masak → Siap |
| **Tipe order** | Dine-in (nomor meja 1–7) / Takeaway |
| **Metode bayar** | QRIS (Midtrans), Cash |

- Pesanan cash berstatus *menunggu pembayaran* sampai **kasir ACC**.
- Pembayaran dibatasi **30 menit**. Pesanan yang belum lunas setelah 30 menit otomatis berstatus **Kedaluwarsa**, tidak masuk dapur, dan tidak dapat di-ACC kasir. Berlaku sama untuk QRIS dan cash.
- Hanya **kasir** (dan role di atasnya) yang dapat mengubah status order.
- Menu **habis** tidak dapat dipesan.
- Tidak ada pajak; total = jumlah harga item.

## 12. Kebutuhan Non-Fungsional

- **Responsif** dan nyaman disentuh di HP, tablet, dan desktop, sesuai prioritas per role di bagian 5 (pelanggan dan manager mobile-first; kasir dan admin desktop-first).
- **Kejelasan antarmuka:** satu aksi utama per halaman, teks singkat, icon konsisten tanpa emoji.
- **Realtime** untuk daftar order kasir dan status order pelanggan.
- **Keamanan:** autentikasi staf via Supabase Auth, otorisasi berbasis role (RLS), verifikasi signature webhook Midtrans, pelanggan tanpa login hanya dapat mengakses pesanan miliknya.
- **Performa:** foto WebP yang dioptimalkan, halaman order ringan untuk jaringan seluler.
- **Aksesibilitas & i18n:** teks dwibahasa (ID/EN), kontras warna memadai terhadap warna primary `#119977`.

## 13. Asumsi & Pertanyaan Terbuka

1. Ukuran kertas thermal (58/80 mm) dan model printer belum pasti, sehingga dibuat dapat dikonfigurasi.
2. Metode cetak (browser vs integrasi langsung) diasumsikan lewat browser.
3. Skala pesanan per hari belum ditentukan.
4. Modal detail dan modal customize adalah dua layar fullscreen terpisah: detail muncul saat menu diklik, customize muncul saat menu customizable akan ditambahkan ke cart. Modal yang sama dapat dipakai di POS kasir.
5. Pesanan QRIS diasumsikan masuk antrean dapur setelah pembayaran terkonfirmasi; pesanan cash setelah ACC kasir.
