# Citraland Waterpark Denpasar

Frontend website dan demo pemesanan tiket untuk Citraland Waterpark Denpasar. Aplikasi dibuat dengan Vue 3, Vue Router, Vite, dan Tailwind CSS.

## Menjalankan aplikasi

Pastikan Node.js dan npm sudah terpasang, lalu jalankan:

```sh
npm install
npm run dev
```

Vite akan menampilkan alamat lokal untuk membuka aplikasi. Perintah lain yang tersedia:

```sh
npm run build
npm run preview
```

`npm run build` membuat versi produksi di folder `dist/`. `npm run preview` menjalankan pratinjau build tersebut.

## Halaman

- `/` — halaman pengunjung berisi informasi waterpark, fasilitas, galeri, ulasan, harga tiket, dan alur pemesanan.
- `/admin` — halaman masuk demo admin.
- `/admin/dashboard` — dashboard demo admin. Akses melalui halaman masuk admin.

Rute yang tidak dikenal akan diarahkan ke halaman utama. Kedua area menggunakan satu entri aplikasi melalui `index.html`.

## Tiket dan tanggal kunjungan

Tersedia dua jenis tiket:

- **Weekdays:** Rp35.000 per orang, untuk kunjungan Selasa–Jumat.
- **Weekend:** Rp50.000 per orang, untuk kunjungan Sabtu–Minggu.

Hari Senin libur dan tidak dapat dipilih. Anak dengan tinggi badan di bawah 85 cm dapat masuk gratis. Pemesanan merupakan simulasi frontend dan belum memproses pembayaran sungguhan.

## Struktur proyek

- `src/main.js` — inisialisasi Vue dan konfigurasi rute.
- `src/UserPage.vue` — komposisi halaman pengunjung.
- `src/AdminLogin.vue` dan `src/AdminPage.vue` — halaman masuk dan dashboard demo admin.
- `src/components/user/` — komponen antarmuka pengunjung, seperti fasilitas, galeri, harga tiket, pilihan tiket, dan footer.
- `src/components/admin/` — komponen kerangka antarmuka admin.
- `src/legacy/` — interaksi DOM lama untuk alur pemesanan dan dashboard yang belum dimigrasikan ke state Vue.
- `src/styles.css` — gaya global dan animasi.

## Batasan demo

Aplikasi ini hanya frontend dan belum terhubung ke backend. Data pemesanan, pembayaran, dan dashboard admin bukan data transaksi produksi.
