# Citraland Waterpark Denpasar

Website Citraland Waterpark berbasis Vue 3, Vite, Tailwind CSS, Supabase, dan Midtrans Snap. Aplikasi mencakup halaman pengunjung, pemesanan tiket, pembayaran, serta dashboard admin.

## Menjalankan aplikasi

Pastikan Node.js dan npm sudah terpasang. Salin `.env.example` menjadi `.env.local`, isi konfigurasi frontend, lalu jalankan:

```sh
npm install
npm run dev
```

Supabase CLI sudah disertakan sebagai dev dependency proyek; jalankan dengan `npx supabase`.

Di PowerShell, salin file konfigurasi dengan:

```powershell
Copy-Item .env.example .env.local
```

Perintah lain yang tersedia:

```sh
npm run build
npm run preview
```

## Menyiapkan Supabase

1. Buat proyek Supabase dan simpan URL serta anon/publishable key proyek.
2. Salin `.env.example` menjadi `.env.local`, lalu isi nilai berikut:

   ```dotenv
   VITE_SUPABASE_URL=https://<project-ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=<publishable-or-anon-key>
   VITE_MIDTRANS_CLIENT_KEY=<midtrans-client-key>
   VITE_MIDTRANS_IS_SANDBOX=true
   ```

   Semua variabel `VITE_*` tersedia di browser. Jangan pernah memasukkan Supabase service-role key atau Midtrans server key ke dalam file tersebut.
3. Terapkan migrasi database dari root repository menggunakan Supabase CLI:

   ```sh
   npx supabase login
   npx supabase link --project-ref <project-ref>
   npx supabase db push --remote
   ```

   Migrasi membuat tabel, indeks, trigger, fungsi database, kebijakan Row Level Security (RLS), serta bucket Storage `gallery`. Alternatifnya, jalankan isi `supabase/migrations/20261105000100_initial_schema.sql` melalui SQL Editor Supabase.
4. Jalankan `supabase/seed.sql` melalui SQL Editor untuk membuat harga tiket, fasilitas, promo awal, dan daftar foto galeri. Foto galeri bawaan menggunakan path lokal `/images/...`; tambahkan file-file tersebut ke `public/images/` di bawah.
5. Di Supabase Authentication, aktifkan metode Email, atur URL aplikasi pada Site URL dan Redirect URLs, serta buat akun admin dengan alamat email yang akan didaftarkan pada tabel `admin_users`.
6. Setelah akun admin dibuat, daftarkan perannya melalui SQL Editor:

   ```sql
   INSERT INTO public.admin_users (email, full_name, role)
   VALUES ('admin@example.com', 'Waterpark Admin', 'super_admin')
   ON CONFLICT (email) DO NOTHING;
   ```

   Login admin hanya diberikan kepada pengguna Auth yang emailnya terdaftar di `admin_users`. Jangan menyimpan kata sandi admin pada seed atau repository.

## Menyiapkan pembayaran Midtrans

1. Buat akun Midtrans dan gunakan kredensial Sandbox selama pengembangan.
2. Masukkan client key Sandbox pada `VITE_MIDTRANS_CLIENT_KEY`; set `VITE_MIDTRANS_IS_SANDBOX=true`.
3. Simpan server key hanya sebagai Supabase Edge Function secret. Supabase CLI menyediakan variabel proyek `SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY` untuk Edge Functions; jangan salin service-role key ke frontend.

   ```sh
   npx supabase secrets set MIDTRANS_SERVER_KEY=<midtrans-server-key> MIDTRANS_IS_SANDBOX=true FRONTEND_URL=http://localhost:5173
   ```

   Untuk deployment, ubah `FRONTEND_URL` ke origin website. `MIDTRANS_ALLOWED_IPS` bersifat opsional dan menerima daftar alamat IP notifikasi resmi yang dipisahkan koma.
4. Deploy fungsi:

   ```sh
   npx supabase functions deploy midtrans-create-transaction
   npx supabase functions deploy midtrans-payment-callback
   npx supabase functions deploy booking-status
   ```

5. Pada pengaturan notifikasi pembayaran Midtrans, daftarkan URL berikut:

   ```text
   https://<project-ref>.supabase.co/functions/v1/midtrans-payment-callback
   ```

   Fungsi callback harus memiliki `verify_jwt = false` karena Midtrans tidak mengirim JWT Supabase. Konfigurasi ini hanya melewati pemeriksaan JWT gateway; fungsi tetap memverifikasi signature Midtrans sebelum mengubah status pembayaran. Deploy ulang `midtrans-payment-callback` setelah mengubah konfigurasi. Fungsi `booking-status` juga memeriksa status transaksi langsung melalui Status API Midtrans ketika status database masih `pending`, lalu menyimpan hasil terverifikasi di database. Jangan menerima perubahan status pembayaran langsung dari browser.

## Fungsi backend

- **Authentication:** registrasi dan login; pengguna harus masuk sebelum memesan tiket. Dashboard admin hanya tersedia untuk akun yang terdaftar pada `admin_users`.
- **Booking:** transaksi dibuat melalui Edge Function untuk sesi pengguna valid dan email akun harus cocok; harga selalu diambil dari database.
- **Pembayaran:** Midtrans Snap membuat token melalui server, callback memperbarui status booking, dan endpoint status hanya dapat diakses pemilik booking yang sudah masuk.
- **Konten publik dan admin:** harga tiket, fasilitas, promosi, dan galeri disimpan di Supabase. Dashboard admin mengelola konten dan booking; perubahan konten diperbarui melalui Supabase Realtime.
- **Storage:** gambar galeri disimpan di bucket `gallery`; unggahan membatasi jenis JPG, PNG, dan WebP serta ukuran maksimum 5 MB.
- **Gambar website:** aset hero dan galeri lokal berada di `public/images/`. File dalam `public/` disajikan Vite dari root URL, misalnya `public/images/waterpark-hero.webp` menjadi `/images/waterpark-hero.webp`. Isi `supabase/seed.sql` menunjuk ke nama-nama file ini.

Nama file gambar yang disiapkan:

```text
public/images/waterpark-hero.webp
public/images/gallery-pirate-pool.jpg
public/images/gallery-water-slide.jpg
public/images/gallery-entrance.jpg
public/images/gallery-pirate-statue.jpg
```

File foto default website menggunakan path lokal. Foto tambahan yang diunggah lewat dashboard admin tetap dilayani Supabase Storage. Jalankan kembali `supabase/seed.sql` di SQL Editor untuk memperbarui entri foto default yang sudah ada.

## Struktur proyek

- `src/main.js` — inisialisasi Vue dan rute aplikasi.
- `src/UserPage.vue`, `src/AdminLogin.vue`, dan `src/AdminPage.vue` — halaman utama dan admin.
- `src/components/` — komponen antarmuka pengguna dan admin.
- `src/legacy/` — interaksi DOM yang belum dimigrasikan ke state Vue, kini menggunakan service Supabase.
- `src/lib/` dan `src/services/` — konfigurasi Supabase serta antarmuka akses data.
- `supabase/migrations/` — skema database, RLS, dan fungsi database.
- `supabase/functions/` — Edge Functions pembayaran dan pemeriksaan status booking.
- `.kiro/specs/supabase-backend-integration/` — requirement, design, dan checklist implementasi.

## Validasi dan pemecahan masalah

- Jalankan `npm run build` untuk memvalidasi bundle produksi.
- Error konfigurasi environment mencantumkan variabel `VITE_*` yang belum diisi.
- Jika akses admin ditolak, pastikan akun Auth sudah dibuat, email sama dengan baris pada `public.admin_users`, serta migrasi dan kebijakan RLS sudah diterapkan.
- Jika data konten tidak muncul, periksa bahwa migrasi dan seed telah dijalankan serta status konten aktif/published.
- Jika pembayaran gagal, periksa deployment Edge Functions, secret Midtrans, client key frontend, dan kecocokan environment Sandbox/Production. Respons `401 Unauthorized` dari API transaksi Midtrans biasanya berarti server key tidak cocok atau berasal dari environment yang berbeda.
- Pengujian end-to-end pembayaran memerlukan proyek Supabase dan kredensial Midtrans yang aktif; tidak dapat diselesaikan hanya dengan build frontend.
