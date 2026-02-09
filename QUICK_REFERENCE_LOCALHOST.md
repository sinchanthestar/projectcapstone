# Quick Reference - Panduan Singkat Next.js di Localhost

## 3 Menit Setup (Pertama Kali)

### Langkah 1: Install Dependencies
```bash
npm install
```
Tunggu hingga selesai (2-5 menit).

### Langkah 2: Buat File `.env.local`
Di root folder, buat file `.env.local` dengan isi:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/shift_manager
JWT_SECRET=kunci-rahasia-panjang-dan-kompleks-minimal-32-karakter
NODE_ENV=development
```

### Langkah 3: Setup Database PostgreSQL
```bash
# Login PostgreSQL
psql -U postgres

# Di dalam psql, jalankan:
CREATE DATABASE shift_manager;
\q
```

## Jalankan Aplikasi (Setiap Hari)

### 1 Perintah Saja:
```bash
npm run dev
```

Maka akses di browser:
```
http://localhost:3000
```

### Aplikasi berjalan sampai Anda tutup dengan Ctrl+C

---

## Halaman Penting

| Halaman | URL | Deskripsi |
|---------|-----|-----------|
| Home | `http://localhost:3000` | Halaman utama |
| Setup | `http://localhost:3000/setup` | Inisialisasi DB |
| Login | `http://localhost:3000/login` | Masuk akun |
| Register | `http://localhost:3000/register` | Buat akun baru |
| Admin Dashboard | `http://localhost:3000/admin` | Dashboard admin |
| Employee Dashboard | `http://localhost:3000/employee` | Dashboard karyawan |

---

## Error Paling Umum

### Port 3000 sudah dipakai
```bash
npm run dev -- -p 3001
```
Maka buka `http://localhost:3001`

### Database tidak terhubung
```bash
# Pastikan PostgreSQL running
# Windows: Services → postgresql running
# Mac: brew services start postgresql
# Linux: sudo systemctl start postgresql
```

### Env variables tidak terbaca
```bash
# Restart server
# Tutup terminal (Ctrl+C)
# Jalankan ulang: npm run dev
```

### Dependencies error
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

---

## Keyboard Shortcuts

| Shortcut | Fungsi |
|----------|--------|
| `Ctrl + C` | Hentikan server |
| `Ctrl + ~` | Terminal di VS Code |
| `F12` | Developer Tools |
| `F5` | Refresh browser |
| `Ctrl + Shift + Delete` | Hard refresh (clear cache) |
| `Ctrl + Shift + C` | Inspect element |

---

## Troubleshooting Cepat

**Website blank/tidak muncul?**
→ Buka DevTools (F12) → Console → lihat error

**Database error?**
→ Cek `.env.local` dan pastikan PostgreSQL running

**Perubahan kode tidak muncul?**
→ F5 atau Ctrl+Shift+Delete untuk hard refresh

**Port error?**
→ Gunakan port lain: `npm run dev -- -p 3001`

---

## File yang Penting

```
.env.local          ← ANDA BUAT (jangan share!)
package.json        ← Daftar dependencies
next.config.js      ← Konfigurasi Next.js
app/                ← Folder halaman
lib/                ← Utility functions
components/         ← React components
```

---

## Perintah Standar

```bash
# Development
npm run dev                 # Jalankan dev server

# Production
npm run build              # Build untuk production
npm start                  # Jalankan production build

# Code Quality
npm run lint               # Check linting
npm run format             # Format kode otomatis

# Database
psql -U postgres           # Login PostgreSQL
psql -U postgres -d shift_manager -c "SELECT 1;"  # Test connection
```

---

## Checklist Verifikasi (Copy-Paste)

```
✓ Node.js & npm installed
✓ PostgreSQL running
✓ npm install selesai
✓ .env.local dibuat dengan DATABASE_URL & JWT_SECRET
✓ Database shift_manager dibuat
✓ npm run dev berjalan (terminal: "ready on 3000")
✓ Browser: http://localhost:3000 terbuka
✓ Halaman home muncul dengan styling
✓ Setup wizard berjalan
✓ Database initialized
✓ Admin account dibuat
✓ Login berhasil
✓ Admin dashboard muncul
```

Jika semua ✓, Anda berhasil! 🎉

---

## Environment Variables Explained

| Variable | Contoh | Penjelasan |
|----------|--------|-----------|
| `DATABASE_URL` | `postgresql://user:pass@localhost:5432/db` | Koneksi database |
| `JWT_SECRET` | `abc123xyz...` | Secret key untuk token |
| `NODE_ENV` | `development` | Development/production mode |

---

## Need Help?

1. Baca file: `PANDUAN_LOCALHOST.md` (lengkap)
2. Baca file: `PANDUAN_VISUAL_LOCALHOST.md` (dengan diagram)
3. Lihat error di terminal atau browser console
4. Cek troubleshooting di atas

---

**Selamat mengembangkan! 🚀**
