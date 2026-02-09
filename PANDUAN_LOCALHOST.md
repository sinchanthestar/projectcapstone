# Panduan Lengkap Menjalankan Website Next.js di Localhost

## Daftar Isi
1. [Prasyarat Sistem](#prasyarat-sistem)
2. [Instalasi Awal](#instalasi-awal)
3. [Konfigurasi Environment](#konfigurasi-environment)
4. [Menjalankan Server Pengembangan](#menjalankan-server-pengembangan)
5. [Verifikasi Website Berjalan](#verifikasi-website-berjalan)
6. [Troubleshooting](#troubleshooting)
7. [Perintah Tambahan](#perintah-tambahan)

---

## Prasyarat Sistem

Sebelum memulai, pastikan Anda telah menginstal persyaratan berikut:

### 1. Node.js dan NPM
Website ini memerlukan **Node.js versi 18 atau lebih tinggi**.

**Untuk mengecek apakah Anda sudah menginstal Node.js:**

**Di Windows (Command Prompt):**
```cmd
node --version
npm --version
```

**Di macOS/Linux (Terminal):**
```bash
node --version
npm --version
```

Jika perintah di atas menampilkan versi, berarti Node.js sudah terinstal. Jika tidak, ikuti langkah-langkah berikut:

### Instalasi Node.js

**Windows:**
1. Buka browser dan kunjungi https://nodejs.org/
2. Download versi LTS (Long Term Support) terbaru
3. Jalankan installer dan ikuti panduan instalasi
4. Pada saat instalasi, pastikan opsi "Add to PATH" dipilih
5. Restart komputer Anda

**macOS:**
```bash
# Menggunakan Homebrew (jika sudah terinstal)
brew install node

# Atau download langsung dari https://nodejs.org/
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install nodejs npm
```

### 2. Database PostgreSQL

Website ini menggunakan PostgreSQL untuk menyimpan data. Anda perlu menginstal PostgreSQL.

**Windows:**
1. Download dari https://www.postgresql.org/download/windows/
2. Jalankan installer
3. Ingat password untuk user `postgres`
4. Pada saat instalasi, gunakan port default: `5432`

**macOS:**
```bash
brew install postgresql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt install postgresql postgresql-contrib
```

### 3. Git (Opsional, tapi disarankan)

Untuk mengkloning proyek atau mengelola versi kode:

**Windows/macOS/Linux:**
- Download dari https://git-scm.com/
- Ikuti panduan instalasi

---

## Instalasi Awal

Setelah semua prasyarat terinstal, ikuti langkah-langkah berikut:

### Langkah 1: Buka Terminal/Command Prompt

**Windows:**
- Tekan `Win + R`
- Ketik `cmd` dan tekan Enter
- Atau klik kanan di folder dan pilih "Open Command Prompt here"

**macOS:**
- Buka Spotlight (Cmd + Space)
- Ketik "Terminal" dan tekan Enter

**Linux:**
- Buka Terminal dari menu aplikasi
- Atau tekan `Ctrl + Alt + T`

### Langkah 2: Navigasi ke Folder Proyek

Misalkan proyek Anda disimpan di folder `shift-scheduler`:

```bash
# Windows
cd C:\Users\NamaUser\Documents\shift-scheduler

# macOS/Linux
cd ~/Documents/shift-scheduler
```

### Langkah 3: Instal Dependencies (Paket-Paket yang Diperlukan)

Di dalam folder proyek, jalankan perintah:

```bash
npm install
```

Proses ini akan:
- Membaca file `package.json`
- Mengunduh semua paket yang diperlukan
- Menyimpannya di folder `node_modules`

**Waktu yang dibutuhkan:** 2-5 menit tergantung kecepatan internet.

**Keluaran yang diharapkan:**
```
added 200+ packages, and audited 300+ packages in 2m
```

---

## Konfigurasi Environment

Website ini memerlukan beberapa variabel lingkungan untuk berfungsi dengan baik.

### Langkah 1: Buat File `.env.local`

Di dalam folder proyek (tempat `package.json` berada), buat file baru bernama `.env.local`:

**Windows (Command Prompt):**
```cmd
type nul > .env.local
```

**macOS/Linux (Terminal):**
```bash
touch .env.local
```

Atau cukup buat file text baru dengan nama `.env.local` menggunakan editor favorit Anda.

### Langkah 2: Konfigurasi Database

Buka file `.env.local` dengan editor teks (Notepad, VS Code, Sublime Text, dll) dan tambahkan konfigurasi berikut:

```env
# Konfigurasi Database PostgreSQL
DATABASE_URL=postgresql://postgres:password_anda@localhost:5432/shift_manager

# Kunci Rahasia untuk Enkripsi (JWT)
JWT_SECRET=kunci-rahasia-yang-sangat-panjang-dan-kompleks-12345678

# Lingkungan Pengembangan
NODE_ENV=development
```

**Penjelasan setiap variabel:**

| Variabel | Penjelasan |
|----------|-----------|
| `DATABASE_URL` | Alamat koneksi ke database PostgreSQL. Format: `postgresql://username:password@host:port/database_name` |
| `JWT_SECRET` | Kunci rahasia untuk enkripsi token login. Gunakan string yang panjang dan kompleks |
| `NODE_ENV` | Menetapkan environment sebagai `development` saat pengembangan |

### Langkah 3: Buat Database PostgreSQL

Buka PostgreSQL command line (psql):

**Windows:**
- Buka pgAdmin atau psql command prompt
- Atau ketik di Command Prompt: `psql -U postgres`

**macOS/Linux:**
```bash
psql -U postgres
```

Kemudian jalankan perintah SQL berikut:

```sql
-- Buat database baru
CREATE DATABASE shift_manager;

-- Keluar dari psql
\q
```

### Langkah 4: Sesuaikan Koneksi Database

Edit file `.env.local` sesuai dengan konfigurasi PostgreSQL Anda:

```env
# Jika menggunakan password default 'postgres':
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/shift_manager

# Jika menggunakan user custom dan password:
DATABASE_URL=postgresql://username:password@localhost:5432/shift_manager

# Jika tidak menggunakan password (untuk development lokal):
DATABASE_URL=postgresql://postgres@localhost:5432/shift_manager
```

---

## Menjalankan Server Pengembangan

Setelah semua konfigurasi selesai, saatnya menjalankan server pengembangan.

### Langkah 1: Jalankan Development Server

Di dalam folder proyek, jalankan:

```bash
npm run dev
```

**Apa yang akan terjadi:**
1. Server Next.js akan mulai kompilasi
2. Anda akan melihat output seperti:

```
  ▲ Next.js 16.0.0
  - Local:        http://localhost:3000
  - Environments: .env.local

ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

**Server akan berjalan di: `http://localhost:3000`**

### Langkah 2: Biarkan Server Tetap Berjalan

Jangan tutup terminal ini. Server akan terus berjalan selama terminal terbuka. Untuk menghentikan server, tekan `Ctrl + C`.

---

## Verifikasi Website Berjalan

Setelah server berjalan, ikuti langkah-langkah berikut untuk memverifikasi:

### Langkah 1: Buka Browser

1. Buka browser favorit Anda (Chrome, Firefox, Safari, Edge, dll)
2. Ketik di address bar: `http://localhost:3000`
3. Tekan Enter

### Langkah 2: Halaman Seharusnya Muncul

Anda akan melihat:
- **Halaman Home** dengan penjelasan fitur sistem
- Tombol **"Login"** di sudut kanan atas
- Tombol **"Register"** untuk membuat akun baru

### Langkah 3: Setup Wizard (Pertama Kali)

Jika ini pertama kali menjalankan aplikasi:

1. Website akan otomatis mengarahkan Anda ke halaman `/setup`
2. Klik tombol **"Initialize Database"** (Inisialisasi Database)
3. Tunggu hingga proses selesai (2-10 detik)
4. Anda akan melihat status seperti: ✓ Database Initialized

### Langkah 4: Buat Akun Admin

1. Klik link **"Create Admin Account"**
2. Anda akan diarahkan ke halaman registrasi
3. Isi form dengan data Anda:
   - **Full Name:** Nama lengkap Anda
   - **Email:** Email yang valid
   - **Password:** Password yang kuat (minimal 8 karakter)
4. Pilih Role: **Admin**
5. Klik **"Register"**

### Langkah 5: Login dan Akses Dashboard

1. Setelah registrasi berhasil, Anda akan diarahkan ke halaman login
2. Masukkan email dan password Anda
3. Klik **"Login"**
4. Anda akan masuk ke **Admin Dashboard** dengan fitur-fitur seperti:
   - Manajemen Shifts (Jadwal)
   - Manajemen Employees (Karyawan)
   - Manajemen Schedule (Penjadwalan)

### Langkah 6: Cek Fitur Lainnya

Jelajahi fitur-fitur berikut untuk memastikan semuanya berjalan:

| Fitur | Cara Akses |
|-------|-----------|
| Dashboard Admin | `http://localhost:3000/admin` |
| Dashboard Karyawan | `http://localhost:3000/employee` |
| Manajemen Shifts | Sidebar → Shifts |
| Manajemen Karyawan | Sidebar → Employees |
| Manajemen Schedule | Sidebar → Schedule |
| Halaman Home | `http://localhost:3000` |

---

## Troubleshooting

### Masalah 1: Port 3000 Sudah Digunakan

**Error Message:**
```
Port 3000 is already in use
```

**Solusi:**

**Windows:**
```cmd
# Cari process yang menggunakan port 3000
netstat -ano | findstr :3000

# Hentikan process (ganti 1234 dengan PID dari output di atas)
taskkill /PID 1234 /F

# Atau gunakan port lain
npm run dev -- -p 3001
```

**macOS/Linux:**
```bash
# Cari process
lsof -i :3000

# Hentikan process (ganti 12345 dengan PID)
kill -9 12345

# Atau gunakan port lain
npm run dev -- -p 3001
```

### Masalah 2: Database Connection Error

**Error Message:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solusi:**

1. Pastikan PostgreSQL sudah berjalan:
   - **Windows:** Buka Services dan pastikan "postgresql-x64" sedang running
   - **macOS:** `brew services list` dan `brew services start postgresql`
   - **Linux:** `sudo systemctl status postgresql` dan `sudo systemctl start postgresql`

2. Verifikasi konfigurasi `.env.local`:
   ```env
   DATABASE_URL=postgresql://postgres:password@localhost:5432/shift_manager
   ```

3. Pastikan database `shift_manager` sudah dibuat:
   ```bash
   psql -U postgres -c "SELECT datname FROM pg_database WHERE datname='shift_manager';"
   ```

### Masalah 3: Node Modules Corrupted

**Error Message:**
```
Cannot find module 'next'
```

**Solusi:**

```bash
# Hapus folder node_modules
rm -rf node_modules
# atau di Windows: rmdir /s node_modules

# Hapus file lock
rm package-lock.json
# atau di Windows: del package-lock.json

# Install ulang
npm install
```

### Masalah 4: File .env.local Tidak Terbaca

**Error Message:**
```
DATABASE_URL is undefined
```

**Solusi:**

1. Pastikan file bernama `.env.local` (bukan `.env.local.txt`)
2. Pastikan file berada di root folder proyek (tempat package.json)
3. Restart development server (`Ctrl + C`, lalu `npm run dev`)

### Masalah 5: Halaman Blank atau Error 500

**Error Message:**
```
Internal Server Error
```

**Solusi:**

1. Periksa console terminal untuk error details
2. Buka browser developer tools (F12) dan lihat tab Console
3. Pastikan setup wizard sudah dijalankan
4. Coba akses `http://localhost:3000/setup`

---

## Perintah Tambahan

### Perintah Umum

```bash
# Jalankan development server (yang sudah dijelaskan)
npm run dev

# Build production (mengkompilasi untuk production)
npm run build

# Jalankan production build
npm start

# Cek linting dan formatting
npm run lint

# Format kode otomatis
npm run format
```

### Menutup Development Server

Untuk menghentikan server pengembangan yang sedang berjalan:

**Di Terminal/Command Prompt:**
- Tekan `Ctrl + C` (Windows/macOS/Linux)
- Tunggu hingga server berhenti
- Prompt kembali muncul

### Menjalankan di Port Berbeda

Jika port 3000 sudah digunakan, gunakan port lain:

```bash
npm run dev -- -p 3001
```

Maka website akan berjalan di `http://localhost:3001`

### Mengecek Status Database

Untuk memverifikasi koneksi database:

```bash
# Menggunakan psql
psql -U postgres -d shift_manager -c "SELECT 1;"

# Output: Jika berhasil akan menampilkan "?column?" dan "1"
```

---

## Checklist Verifikasi

Sebelum mengatakan website sudah berjalan dengan baik, pastikan semua berikut terceklis:

- [ ] Node.js dan NPM sudah terinstal (`node --version`, `npm --version`)
- [ ] PostgreSQL sudah terinstal dan berjalan
- [ ] File `.env.local` sudah dibuat di root folder proyek
- [ ] `DATABASE_URL` sudah dikonfigurasi dengan benar
- [ ] Database `shift_manager` sudah dibuat di PostgreSQL
- [ ] `npm install` sudah dijalankan
- [ ] `npm run dev` berjalan tanpa error
- [ ] Website dapat diakses di `http://localhost:3000`
- [ ] Halaman home muncul dengan benar
- [ ] Setup wizard selesai dijalankan
- [ ] Akun admin berhasil dibuat
- [ ] Login berhasil dilakukan
- [ ] Dashboard admin dapat diakses

---

## Struktur Folder Proyek

Agar lebih memahami proyek, berikut struktur foldernya:

```
shift-scheduler/
├── app/                    # Halaman-halaman aplikasi
│   ├── admin/             # Dashboard admin
│   ├── employee/          # Dashboard karyawan
│   ├── login/             # Halaman login
│   ├── register/          # Halaman registrasi
│   ├── setup/             # Halaman setup wizard
│   └── api/               # API endpoints
├── components/            # Komponen React yang reusable
│   ├── admin/             # Komponen admin
│   ├── employee/          # Komponen karyawan
│   ├── ui/                # UI components (button, card, dll)
│   └── shared/            # Komponen yang dipakai di banyak tempat
├── lib/                   # Utility functions
│   ├── auth.ts            # Fungsi autentikasi
│   ├── db.ts              # Koneksi database
│   └── setup.ts           # Setup utilities
├── scripts/               # Script database
│   └── 01-init-database.sql  # SQL untuk inisialisasi database
├── .env.example           # Contoh file environment
├── .env.local             # File environment lokal (Anda buat)
├── package.json           # Daftar dependencies
├── next.config.js         # Konfigurasi Next.js
└── tsconfig.json          # Konfigurasi TypeScript
```

---

## Tips & Trik

### Tips 1: Menggunakan VS Code

Jika Anda menggunakan Visual Studio Code, Anda dapat:

1. Buka terminal terintegrasi: `Ctrl + ~`
2. Jalankan `npm run dev` di terminal
3. Terminal akan tetap terbuka sambil Anda mengerjakan kode
4. Perubahan kode akan otomatis di-reload di browser

### Tips 2: Hot Reload

Next.js memiliki fitur hot reload, artinya:

1. Ketika Anda mengubah file kode
2. Browser akan otomatis menyegarkan halaman
3. Tidak perlu menjalankan ulang server
4. Ini membuat development lebih cepat

### Tips 3: Debugging dengan Console

Tambahkan `console.log()` di kode Anda untuk debug:

```javascript
console.log("Debug message", variableName);
```

Pesan akan muncul di:
- Terminal (untuk server-side code)
- Browser Developer Console (untuk client-side code)

### Tips 4: Clear Browser Cache

Jika perubahan tidak muncul:

1. Buka Developer Tools (F12)
2. Klik kanan tombol Refresh
3. Pilih "Empty cache and hard refresh"

### Tips 5: Mengakses dari Device Lain

Untuk mengakses website dari laptop/mobile lain di jaringan yang sama:

1. Dapatkan IP lokal komputer Anda:
   - **Windows:** `ipconfig` → cari "IPv4 Address"
   - **macOS/Linux:** `ifconfig` → cari "inet"

2. Akses dari device lain:
   ```
   http://[IP-ANDA]:3000
   ```

   Contoh: `http://192.168.1.5:3000`

---

## Kontrol Masalah Umum

| Masalah | Penyebab | Solusi |
|---------|---------|--------|
| Website tidak memuat | Server tidak berjalan | Jalankan `npm run dev` |
| Error "Port sudah digunakan" | Port 3000 sudah digunakan | Gunakan port lain: `npm run dev -- -p 3001` |
| Error "DATABASE_URL undefined" | Env var tidak terbaca | Restart server atau periksa `.env.local` |
| Error "ECONNREFUSED" | PostgreSQL tidak berjalan | Mulai PostgreSQL service |
| Halaman blank | Setup belum selesai | Akses `http://localhost:3000/setup` |
| Tombol tidak bekerja | Ada error di console | Buka DevTools (F12) lihat console |

---

## Langkah Berikutnya

Setelah website berjalan dengan baik di localhost:

1. **Eksplorasi Fitur:** Buat shifts, karyawan, dan penjadwalan
2. **Buat Multiple Users:** Buat akun untuk testing
3. **Test Functionality:** Coba semua fitur (login, create, edit, delete)
4. **Cek Error:** Lihat console untuk melihat error handling
5. **Ready to Deploy:** Website siap untuk dideploy ke production

---

## Sumber Daya Tambahan

- [Dokumentasi Next.js](https://nextjs.org/docs)
- [Dokumentasi PostgreSQL](https://www.postgresql.org/docs/)
- [Dokumentasi Node.js](https://nodejs.org/en/docs/)
- [Panduan npm](https://docs.npmjs.com/)

---

## Dukungan & Bantuan

Jika mengalami masalah:

1. Baca bagian [Troubleshooting](#troubleshooting)
2. Periksa error messages di terminal dan console browser
3. Pastikan semua prasyarat sudah terinstal dengan benar
4. Coba jalankan ulang dari awal dengan checklist di atas

---

**Selamat! Website Next.js Anda sekarang berjalan di localhost. Nikmati pengembangan! 🚀**
