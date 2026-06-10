# PRIME PROPERTY - ACCEPTANCE CRITERIA
Web Platform & Internal Agent Portal

## 1. Branding & Design System
- [x] AC-1.1 Color Palette: Menggunakan palet warna konsisten sesuai logo Prime Property:
  - [x] #1A1A1A (Primary Black) untuk Header dan teks utama.
  - [x] #C9A961 (Accent Gold) untuk CTA, highlight, dan badge.
  - [x] #B33A3A (Accent Red) untuk Status urgent dan efek hover.
  - [x] #FFFFFF (Neutral White) untuk background utama.
  - [x] #F5F5F5 (Soft Gray) untuk card dan background sekunder.
  - [x] Logo Placement: Logo Prime Property WAJIB tampil di header semua halaman publik dan dashboard internal.
  - [x] Typography: Menggunakan sans-serif modern (Inter atau Geist) dengan ketentuan Bold untuk heading dan Regular untuk body text.
- [x] AC-1.2 Layout Principles: Desain harus compact, clear, dan mobile-responsive.
  - [x] Menyesuaikan breakpoint: mobile ≤640px, tablet ≤1024px, desktop ≥1024px.
  - [x] Jarak (spacing) konsisten mengikuti grid 4/8/16/24/32 px.
  - [x] Penting: TIDAK ada fitur upload gambar untuk listing properti (fokus pada data tabular ringkas & informatif).

## 2. Landing Page (Halaman Publik)
- [x] AC-2.1 Hero Section:
  - [x] Menampilkan tagline Prime Property + 1 CTA primer (misal: "Lihat Properti" atau "Hubungi Kami").
  - [x] Background menggunakan warna hitam (#1A1A1A) dengan aksen emas serta logo yang menonjol.
  - [x] Tombol CTA menggunakan warna emas (#C9A961) dengan teks berwarna hitam.
- [ ] AC-2.2 Section Konten:
  - [x] Properti Unggulan: Menampilkan maksimal 6 properti highlight bersifat read-only tanpa filter.
  - [ ] Mengapa Prime Property: Menampilkan 3-4 value proposition lengkap dengan ikon dan deskripsi singkat.
  - [ ] Footer: Menampilkan logo, kontak singkat (telp/WA/email), serta link menuju halaman About Us & Contact Us.
- [x] AC-2.3 Navigasi Header:
  - [x] Header bersifat sticky di seluruh halaman publik.
  - [x] Urutan menu dari kiri ke kanan: Logo | Beranda | Tentang Kami | Kontak | tombol Login Agent.
  - [x] Tombol "Login Agent" diposisikan di sebelah kanan menggunakan style outline emas.

## 3. Halaman About Us
- [ ] AC-3.1 Konten & Layout:
  - [ ] Menampilkan profil Prime Property, visi & misi, serta nilai perusahaan dalam Bahasa Indonesia.
  - [ ] Layout menggunakan sistem 2 kolom pada desktop (teks + visual/quote) dan otomatis menjadi single column pada mobile.
  - [ ] TIDAK terdapat elemen interaktif kompleks di luar sistem navigasi standar.

## 4. Halaman Contact Us
- [ ] AC-4.1 Informasi Kontak:
  - [ ] Menampilkan alamat kantor, nomor telepon, email, dan link WhatsApp direct (wa.me/...).
  - [ ] Embed Google Maps lokasi kantor (opsional, jika koordinat tersedia).
- [ ] AC-4.2 Form Kontak:
  - [ ] Menyediakan field: Nama, Email, Nomor HP, dan Pesan.
  - [ ] Proses submit berhasil mengirimkan email notifikasi ke admin Prime Property.
  - [ ] Validasi Form: Semua field wajib diisi, email berformat valid, dan nomor HP minimal 10 digit.
  - [ ] Menampilkan pesan toast sukses: "Pesan terkirim, tim kami akan menghubungi Anda." setelah berhasil dikirim.
  - [ ] Keamanan anti-spam: Menerapkan rate limit maksimal 3 submit per IP per jam.

## 5. Autentikasi Agent Internal
- [x] AC-5.1 Halaman Login:
  - [x] Menggunakan route terpisah di /agent/login tanpa link dari navigasi publik.
  - [x] Menyediakan field: Email + Password (atau Email + OTP 6 digit sesuai keputusan implementasi).
  - [ ] Tidak menyediakan fitur pendaftaran mandiri (self-registration); akun dibuat manual oleh superadmin.
  - [x] Sesi login disimpan di httpOnly cookie, SameSite=Lax, dengan masa berlaku 30 hari.
  - [x] Sistem lockout sementara selama 15 menit apabila terjadi 5x kegagalan login dalam kurun waktu 30 menit.
- [x] AC-5.2 Role & Authorization:
  - [x] Role Admin: Hanya bisa View listing, menggunakan Filter & search, serta melihat detail properti. TIDAK BISA melakukan Create, Update, dan Delete properti.
  - [ ] Role Superadmin: Memiliki akses Full CRUD properti, membuat akun admin baru, mengaktifkan/menonaktifkan akun admin, reset password admin, mengakses seluruh fitur admin, serta melihat audit log perubahan.
  - [x] Keamanan Backend: Otorisasi WAJIB divalidasi langsung di backend untuk setiap endpoint, bukan hanya menyembunyikan elemen UI di frontend.
  - [ ] Endpoint mutasi harus merespons dengan 403 Forbidden jika diakses oleh akun dengan role Admin.
- [x] AC-5.3 Logout:
  - [x] Tombol logout tersedia pada dropdown profil di header dashboard internal.
  - [x] Proses logout akan menghapus session cookie dan melakukan redirect kembali ke /agent/login.

## 6. Property Listing Schema Data
Setiap listing properti wajib memiliki struktur data sebagai berikut:
- [x] nama_property (Tipe: string): Wajib diisi (Contoh: "Aston Villas").
- [x] group (Tipe: string, nullable): Opsional (Contoh: "Mentari").
- [x] lebar (Tipe: decimal): Wajib diisi, dalam satuan meter.
- [x] panjang (Tipe: decimal): Wajib diisi, dalam satuan meter.
- [x] hadap (Tipe: enum multi): Wajib diisi, pilihan: Utara / Selatan / Timur / Barat (boleh kombinasi).
- [x] tipe (Tipe: enum): Wajib diisi, pilihan: Ruko / Villa.
- [x] tingkat (Tipe: decimal): Wajib diisi (Contoh: 1, 2, 2.5).
- [x] price (Tipe: bigint): Wajib diisi, disimpan sebagai integer rupiah penuh (tidak boleh float) untuk menghindari error pembulatan. Display menggunakan pemisah titik (contoh: Rp 1.350.000.000).
- [x] carport (Tipe: boolean): Wajib diisi, berupa checkbox (true/false).
- [x] status (Tipe: enum): Wajib diisi, pilihan: in stock / sold_out.
- [x] siap (Tipe: enum): Wajib diisi, pilihan: siap_huni / siap_kosong / siap_huni_renovasi.
- [x] maps_link (Tipe: string URL): TIDAK wajib diisi (opsional), berupa link Google Maps lokasi properti.
- [x] kawasan (Tipe: string multi-tag): Wajib diisi (Contoh: "Krakatau", "Pancing").
- [x] unit (Tipe: string, nullable): TIDAK wajib diisi (opsional) (Contoh: "Ready Siap huni").
- [x] created_at (Tipe: timestamp): Auto-generate ketika data dibuat.
- [x] updated_at (Tipe: timestamp): Auto-update saat terjadi perubahan data.
- [x] created_by (Tipe: FK User): Menyimpan data Superadmin yang membuat entry tersebut.

## 7. Dashboard Internal
- [ ] AC-7.1 Tampilan Tabel Listing:
  - [ ] Menampilkan tabel kompak berisi kolom: Nama, Group, Lebar x Panjang, Hadap, Tipe, Tingkat, Harga, Carport, Status, Siap, Kawasan.
  - [ ] Pagination: Menyediakan opsi 25/50/100 baris per halaman, dengan nilai default 50.
  - [ ] Fitur Sort: Dapat diurutkan berdasarkan nama, harga (asc/desc), tanggal dibuat, dan status.
  - [ ] Badge Status Warna:
    - [ ] In Stock menggunakan badge warna hijau muda.
    - [ ] Sold Out menggunakan badge warna merah (#B33A3A).
    - [ ] Siap Huni menggunakan badge warna kuning/emas.
    - [ ] Siap Kosong menggunakan badge warna ungu muda.
  - [ ] Mengklik baris data akan membuka panel detail di samping (drawer) atau mengarah ke halaman detail terpisah.
- [ ] AC-7.2 Filter & Pencarian:
  - [ ] Sistem Filter:
    - [ ] Kawasan: menggunakan dropdown multi-select.
    - [ ] Lebar min (m): menggunakan input numerik.
    - [ ] Hadap: menggunakan multi-select (Utara, Selatan, Timur, Barat).
    - [ ] Harga Max: menggunakan input numerik berformat rupiah (slider bersifat opsional).
    - [ ] Tipe: menggunakan komponen radio button (Semua / Ruko / Villa).
    - [ ] Status: menggunakan komponen radio button (Semua / In Stock / Sold Out).
    - [ ] Siap: menggunakan multi-select (Siap Huni, Siap Kosong, Siap Huni Renovasi).
    - [ ] Carport: menggunakan komponen toggle (Ya / Tidak / Semua).
  - [ ] Search Bar: Berupa input free-text di atas tabel untuk mencari data berdasarkan nama_property + group + kawasan.
  - [ ] Filter diaplikasikan secara real-time menggunakan teknik debounce 300ms.
  - [ ] Filter yang aktif ditampilkan sebagai komponen chip di atas tabel dan dapat dihapus satu per satu.
  - [ ] Menyediakan tombol "Reset Filter" untuk mengembalikan tabel ke state default.
  - [ ] Mengintegrasikan URL query params untuk menyimpan state filter agar link bersifat shareable.
- [ ] AC-7.3 Halaman Detail Properti:
  - [ ] Menampilkan seluruh data field properti secara ringkas dalam layout 2 kolom.
  - [ ] Jika link Google Maps tersedia, tampilkan tombol "Buka di Google Maps" yang akan terbuka di tab baru.
  - [ ] Tombol "Edit" dan "Hapus" diletakkan di pojok kanan atas hanya jika diakses oleh Superadmin.
  - [ ] Tombol Edit/Hapus WAJIB tidak muncul jika diakses oleh Admin.

## 8. Property Management - CRUD (Hanya Superadmin)
- [ ] AC-8.1 Create Properti:
  - [ ] Tombol "+ Tambah Properti" hanya tampil di halaman listing untuk akun ber-role Superadmin.
  - [ ] Form input mencakup seluruh field data properti (AC-6.1) dengan struktur layout grid 2 kolom.
  - [ ] Menerapkan validasi client-side (untuk feedback instan) DAN validasi server-side (untuk keamanan).
  - [ ] Setelah berhasil tersimpan: Muncul toast notification dan me-redirect pengguna ke halaman listing dengan posisi entry baru yang ditandai/highlight.
  - [ ] Menyediakan opsi tombol "Simpan & Tambah Lagi" untuk mempermudah input berturut-turut (opsional).
- [ ] AC-8.2 Update Properti:
  - [ ] Menggunakan form edit dengan layout yang sama seperti form create, dengan seluruh field sudah terisi data sebelumnya (pre-filled).
  - [ ] Field yang mengalami perubahan ditandai dengan dirty state indicator.
  - [ ] Menyediakan tombol "Batal" untuk kembali ke halaman detail tanpa menyimpan perubahan data.
  - [ ] Setiap perubahan data wajib dicatat ke dalam sistem audit log (mencakup data who, when, what changed).
- [ ] AC-8.3 Delete Properti:
  - [ ] Menampilkan modal konfirmasi saat tombol "Hapus" diklik dengan pesan teks: "Yakin hapus properti [nama]? Tindakan ini tidak dapat dibatalkan.".
  - [ ] Mekanisme penghapusan menggunakan soft delete (mengisi timestamp pada field deleted_at), bukan menghapus permanen (hard delete) dari database.
  - [ ] Properti yang telah dihapus otomatis tidak akan muncul pada listing publik maupun default view internal.
  - [ ] Superadmin dapat melihat & mengembalikan (restore) data yang terhapus melalui menu "Arsip" (opsional untuk Phase 2).
- [ ] AC-8.4 Validasi Form:
  - [ ] nama_property: Minimum berisi 3 karakter dan maksimum 100 karakter.
  - [ ] lebar & panjang: Nilai harus >0 dengan maksimal 2 angka di belakang desimal.
  - [ ] price: Nilai harus >0 dalam format integer rupiah penuh.
  - [ ] tingkat: Rentang nilai antara 1-10 dengan maksimal 1 angka di belakang desimal.
  - [ ] maps_link: Harus berupa format URL valid yang mengandung domain http://googleusercontent.com/ atau maps.google.com/.
  - [ ] Pesan kesalahan (error) harus ditampilkan secara inline tepat di bawah field terkait menggunakan warna merah (#B33A3A).

## 9. Non-Functional Requirements
- [ ] AC-9.1 Performance:
  - [ ] Nilai Time to First Contentful Paint (FCP) < 1.5 detik pada jaringan seluler 4G.
  - [ ] Waktu respons fitur filter & pencarian < 500 milidetik untuk jumlah dataset hingga 1000 properti.
  - [ ] Skor performa Google Lighthouse ≥ 85 untuk halaman utama/landing page.
- [x] AC-9.2 Security:
  - [x] Melindungi seluruh endpoint internal dengan komponen authentication middleware.
  - [x] Menerapkan sistem CSRF protection untuk seluruh operasi mutasi data (POST, PUT, PATCH, DELETE).
  - [ ] Batasan akses (Rate Limiting): Maksimal 100 req/menit/IP secara global, dan maksimal 10 req/menit/IP khusus untuk endpoint otentikasi.
  - [x] Melakukan proses hashing password menggunakan algoritma bcrypt dengan parameter cost factor ≥ 10.
  - [ ] Wajib menggunakan protokol HTTPS penuh di lingkungan production dengan mengaktifkan flag secure cookie.
  - [ ] Menerapkan teknik input sanitization secara ketat untuk mencegah celah keamanan XSS & SQL Injection.
- [ ] AC-9.3 Bahasa & Lokalisasi:
  - [ ] Seluruh antarmuka pengguna (UI) wajib menggunakan Bahasa Indonesia.
  - [ ] Format mata uang ditulis menggunakan gaya Indonesia, contoh: Rp 1.350.000.000 (titik sebagai separator ribuan).
  - [ ] Format penulisan tanggal menggunakan struktur: 24 Mei 2026 atau format numerik 24/05/2026.
  - [ ] Seluruh tampilan timestamp wajib menggunakan zona waktu Asia/Jakarta (WIB).
- [ ] AC-9.4 Browser Support:
  - [ ] Kompatibel dengan browser Chrome / Edge / Firefox / Safari versi rilis 2 tahun terakhir.
  - [ ] Mendukung penuh Mobile Safari iOS 14+ serta Chrome untuk platform Android.

## 10. Deliverables & Acceptance (Definition of Done)
Fitur dinyatakan selesai sepenuhnya (DONE) apabila telah memenuhi kriteria akhir berikut:
- [ ] 1. Seluruh poin kriteria penerimaan (acceptance criteria) di atas telah terpenuhi dan diuji dengan baik.
- [ ] 2. Tidak ada temuan bug yang berstatus prioritas High maupun Critical yang masih terbuka.
- [ ] 3. Tampilan UI sepenuhnya selaras dengan panduan brand (palet warna, tipografi, dan penempatan logo).
- [ ] 4. Desain terbukti responsif saat diakses dari perangkat mobile, tablet, maupun desktop.
- [x] 5. Sistem otorisasi pada backend telah terverifikasi aman (dipastikan role Admin tidak bisa melakukan CRUD).
- [ ] 6. Fitur filter dan pencarian dapat berjalan lancar menggunakan dataset minimal 50 data properti buatan (dummy).
- [ ] 7. Menyediakan dokumen panduan singkat tertulis untuk Superadmin mengenai cara mengelola data properti.