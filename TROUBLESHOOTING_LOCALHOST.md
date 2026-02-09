# Panduan Troubleshooting Lengkap - Next.js di Localhost

## Index Masalah

1. [Instalasi dan Setup](#instalasi-dan-setup)
2. [Database & Connection](#database--connection)
3. [Server & Port](#server--port)
4. [Browser & Halaman](#browser--halaman)
5. [Environment Variables](#environment-variables)
6. [Kode & Build](#kode--build)
7. [Performance & Optimization](#performance--optimization)

---

## Instalasi dan Setup

### Masalah: "npm: command not found" atau "npm is not recognized"

**Penyebab:**
- Node.js/npm belum diinstal
- Path Node.js tidak ditambahkan ke system PATH

**Solusi:**

**Windows:**
```bash
# Cek apakah Node.js installed
where node
where npm

# Jika tidak ditemukan, install dari https://nodejs.org/

# Atau jika sudah install tapi belum di PATH:
# 1. Buka Environment Variables (Win + X → System Properties)
# 2. Advanced tab → Environment Variables
# 3. Cari PATH dalam "System variables"
# 4. Edit → tambah path ke Node.js (contoh: C:\Program Files\nodejs)
# 5. Restart Command Prompt
```

**macOS:**
```bash
# Verifikasi versi
node -v
npm -v

# Jika belum terinstal, gunakan Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install node
```

**Linux:**
```bash
# Cek versi
node --version
npm --version

# Jika belum terinstal (Ubuntu/Debian)
sudo apt update
sudo apt install nodejs npm

# Atau menggunakan nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install node
```

---

### Masalah: "npm install" gagal atau stuck

**Penyebab:**
- Koneksi internet lambat
- Cache npm corrupted
- Dependensi incompatible

**Solusi:**

```bash
# Opsi 1: Clear npm cache
npm cache clean --force

# Opsi 2: Install dengan verbose untuk lihat detail
npm install --verbose

# Opsi 3: Gunakan npm ci (lebih strict)
npm ci

# Opsi 4: Hapus semua dan install ulang
rm -rf node_modules package-lock.json
npm install

# Opsi 5: Gunakan yarn sebagai alternative
npm install -g yarn
yarn install
```

**Jika tetap gagal:**
```bash
# Cek versi npm
npm -v

# Update npm ke versi terbaru
npm install -g npm@latest

# Coba install lagi
npm install
```

---

## Database & Connection

### Masalah: "Error: connect ECONNREFUSED 127.0.0.1:5432"

**Penyebab:**
- PostgreSQL tidak berjalan
- Port 5432 tidak available
- Database tidak exist

**Solusi:**

**Pastikan PostgreSQL berjalan:**

**Windows:**
```bash
# Method 1: Gunakan Services
# 1. Win + R → services.msc
# 2. Cari "postgresql-x64-14" (atau versi lainnya)
# 3. Jika status "Stopped", klik kanan → Start
# 4. Status harus "Running"

# Method 2: Gunakan command (Run as Administrator)
net start postgresql-x64-14

# Method 3: Cek apakah PostgreSQL running
netstat -ano | findstr :5432
# Jika ada output, PostgreSQL running ✓
```

**macOS:**
```bash
# Dengan Homebrew
brew services list
# Lihat postgresql status

# Jika tidak running, jalankan
brew services start postgresql

# Atau manual
pg_ctl -D /usr/local/var/postgres start
```

**Linux:**
```bash
# Status
sudo systemctl status postgresql

# Mulai jika belum running
sudo systemctl start postgresql

# Pastikan auto-start
sudo systemctl enable postgresql
```

---

### Masalah: "FATAL: database shift_manager does not exist"

**Penyebab:**
- Database shift_manager belum dibuat

**Solusi:**

```bash
# Login ke PostgreSQL
psql -U postgres

# Dalam psql console:
CREATE DATABASE shift_manager;
\l  # List semua database (verifikasi)
\q  # Quit

# Atau one-liner:
createdb -U postgres shift_manager
```

**Verifikasi database dibuat:**
```bash
# Test koneksi
psql -U postgres -d shift_manager -c "SELECT 1;"

# Output: Jika berhasil akan tampil:
#  ?column?
# ----------
#         1
```

---

### Masalah: "FATAL: role postgres does not exist"

**Penyebab:**
- User postgres belum dibuat
- Kredensial salah di .env.local

**Solusi:**

```bash
# Cek user yang ada di PostgreSQL
psql -U postgres -c "\du"

# Jika postgres user tidak ada, buat:
sudo -u postgres createuser -s postgres

# Set password untuk user postgres:
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'password';"

# Update .env.local dengan user yang correct:
DATABASE_URL=postgresql://postgres:password@localhost:5432/shift_manager
```

---

### Masalah: "FATAL: Ident authentication failed for user postgres"

**Penyebab:**
- Masalah autentikasi PostgreSQL config
- User/password salah

**Solusi:**

```bash
# Option 1: Gunakan trust authentication (dev only!)
# Edit file: /etc/postgresql/[version]/main/pg_hba.conf
# Ubah baris:
# local   all             all                                     md5
# Menjadi:
# local   all             all                                     trust

# Restart PostgreSQL
sudo systemctl restart postgresql

# Option 2: Cek .env.local PASSWORD
# Pastikan format benar:
DATABASE_URL=postgresql://postgres:password@localhost:5432/shift_manager
# (ganti "password" dengan password sebenarnya)

# Option 3: Reset password postgres
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'newpassword';"
# Update .env.local dengan password baru
```

---

### Masalah: "could not connect to database server"

**Penyebab:**
- Database URL format salah
- PostgreSQL tidak accessible

**Solusi:**

```bash
# Verifikasi format DATABASE_URL:
# postgresql://username:password@host:port/database

# Contoh valid:
# postgresql://postgres:mypassword@localhost:5432/shift_manager
# postgresql://postgres@localhost:5432/shift_manager (tanpa password)
# postgresql://user:pass@192.168.1.100:5432/shift_manager

# Test koneksi manual:
psql -U postgres -h localhost -p 5432 -d shift_manager

# Jika berhasil, akan prompt untuk password
# (atau jika trust auth, langsung masuk)
```

---

## Server & Port

### Masalah: "Port 3000 is already in use"

**Penyebab:**
- Ada aplikasi lain menggunakan port 3000
- Server sebelumnya belum fully closed

**Solusi:**

**Windows:**
```bash
# Cari proses yang menggunakan port 3000
netstat -ano | findstr :3000

# Output akan seperti: TCP 127.0.0.1:3000 LISTENING 1234
# (1234 adalah PID)

# Kill process tersebut:
taskkill /PID 1234 /F

# Atau gunakan port berbeda:
npm run dev -- -p 3001
```

**macOS/Linux:**
```bash
# Cari proses
lsof -i :3000

# Output akan menampilkan PID
# Kill dengan:
kill -9 [PID]

# Atau gunakan port berbeda:
npm run dev -- -p 3001
```

**Akses dengan port baru:**
```
http://localhost:3001
```

---

### Masalah: "Address already in use" atau "EADDRINUSE"

**Solusi:**

```bash
# Force kill process di port 3000
# Windows
taskkill /F /IM node.exe

# macOS/Linux
killall node

# Atau gunakan script:
# Buat file kill-port.js
const port = 3000;
const { exec } = require('child_process');
if (process.platform === 'win32') {
  exec(`taskkill /F /PID $(netstat -ano | findstr :${port})`);
} else {
  exec(`kill -9 $(lsof -t -i :${port})`);
}
```

---

### Masalah: Server crash dengan error

**Penyebab:**
- Syntax error di kode
- Module tidak ditemukan
- Runtime error

**Solusi:**

```bash
# Baca error message di terminal dengan cermat
# Lihat baris berapa errornya:
# "Error at pages/admin.tsx:45"

# Buka file dan cek baris tersebut
# Common errors:
# - Missing import
# - Syntax error (missing comma, bracket)
# - Undefined variable

# Setelah fix, server auto-reload
# Jika tidak, restart manual:
# Ctrl + C untuk stop
# npm run dev untuk jalankan ulang
```

---

## Browser & Halaman

### Masalah: "Cannot GET /"

**Penyebab:**
- Server belum running
- Route tidak ada
- Build gagal

**Solusi:**

```bash
# Pastikan server running
# Terminal harus menampilkan: "ready on 0.0.0.0:3000"

# Verifikasi dengan:
npm run dev

# Tunggu sampai "ready" muncul
# Baru akses browser

# Jika page tetap 404, cek:
# 1. Apakah file pages/route ada?
# 2. Apakah build berhasil? Lihat build output
# 3. Coba hard refresh: Ctrl+Shift+Delete
```

---

### Masalah: "Halaman blank atau tidak ada styling"

**Penyebab:**
- CSS tidak loaded
- JavaScript error
- Setup belum selesai

**Solusi:**

```bash
# Step 1: Buka DevTools (F12)
# Step 2: Lihat tab Console untuk errors
# Step 3: Lihat tab Network untuk failed requests
# Step 4: Cek apakah CSS file loaded (status 200)

# Common fixes:
# - Hard refresh: Ctrl+Shift+Delete
# - Clear cache: DevTools → Application → Clear storage
# - Restart server: Ctrl+C, npm run dev
# - Cek .env.local dibaca (page tidak perlu logout untuk env berubah)
```

---

### Masalah: "SetupWizard halaman tidak muncul atau redirect error"

**Penyebab:**
- Setup status API error
- Database status check gagal

**Solusi:**

```bash
# Akses setup langsung:
http://localhost:3000/setup

# Jika masih error, lihat console untuk detail

# Check setup status API:
# Buka: http://localhost:3000/api/setup/status
# Harus menampilkan JSON response

# Jika error 500, cek:
# 1. Database connected?
# 2. DATABASE_URL correct?
# 3. Server logs untuk detail error
```

---

### Masalah: "Form tidak bisa disubmit atau loading infinite"

**Penyebab:**
- API endpoint error
- Network request failed
- Backend error

**Solusi:**

```bash
# Step 1: Buka DevTools → Network tab
# Step 2: Coba submit form
# Step 3: Lihat request ke API endpoint
# Step 4: Cek response status (200, 400, 500?)

# Jika error 500, backend bermasalah:
# - Lihat terminal server untuk error details
# - Cek database connection
# - Verify data yang dikirim valid

# Jika request pending, mungkin:
# - Network slow
# - Server tidak respond
# - Timeout
# Solusi: Restart server, cek network
```

---

## Environment Variables

### Masalah: "DATABASE_URL is undefined" atau ".env.local not found"

**Penyebab:**
- File .env.local tidak ada atau salah nama
- Path salah
- Belum restart server

**Solusi:**

```bash
# Pastikan .env.local ada di root folder
# (tempat package.json berada)

# Windows Explorer:
# 1. Buka folder proyek
# 2. Lihat apakah ada file ".env.local"
# 3. Jika tidak ada, klik kanan → New → Text Document
# 4. Rename menjadi ".env.local"
# 5. Edit dan isi variabel

# Terminal verification:
# Windows
dir | findstr ".env.local"

# macOS/Linux
ls -la | grep ".env.local"

# Harus ada output: ".env.local"

# Setelah fix, RESTART SERVER:
# Ctrl + C (stop server)
# npm run dev (jalankan ulang)
```

---

### Masalah: "Database connection error meski DATABASE_URL ada"

**Penyebab:**
- DATABASE_URL format salah
- Database url mengandung special characters
- Password belum di-escape

**Solusi:**

```bash
# Format DATABASE_URL yang benar:
DATABASE_URL=postgresql://username:password@host:port/database

# Jika password punya special characters, escape:
# @ → %40
# : → %3A
# # → %23
# Contoh: password "pass@word123" → "pass%40word123"
DATABASE_URL=postgresql://user:pass%40word123@localhost:5432/db

# Atau gunakan quotes:
DATABASE_URL="postgresql://user:pass@word@localhost:5432/db"

# Test koneksi setelah fix:
npm run dev
# Tunggu sampai "ready" muncul

# Atau test manual:
psql "$DATABASE_URL"
```

---

### Masalah: "JWT_SECRET too short" atau error authenticating

**Penyebab:**
- JWT_SECRET terlalu pendek
- JWT_SECRET tidak aman

**Solusi:**

```bash
# JWT_SECRET minimal 32 karakter untuk secure

# Update .env.local:
JWT_SECRET=my-super-secret-key-panjang-dan-kompleks-1234567890

# Generate secure secret:
# Option 1: Online generator (https://www.grc.com/passwords.htm)
# Option 2: Terminal command
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copy output ke .env.local
# Restart server
npm run dev
```

---

## Kode & Build

### Masalah: "Cannot find module 'X'" atau "Module not found"

**Penyebab:**
- Module belum diinstall
- Path import salah
- File sudah dihapus

**Solusi:**

```bash
# Check jika module di package.json:
grep "module-name" package.json

# Jika tidak ada, install:
npm install module-name

# Jika path import salah:
# ❌ import { Button } from './components/ui'
# ✓ import { Button } from '@/components/ui/button'

# Verifikasi struktur folder:
# File harus ada di path yang di-import
# Cek case sensitivity (Linux/Mac case-sensitive)

# Jika masih error, clean dan rebuild:
rm -rf .next
npm run dev
```

---

### Masalah: "SyntaxError: Unexpected token"

**Penyebab:**
- Syntax error di kode
- Missing semicolon, bracket, atau quote
- JSX syntax error

**Solusi:**

```bash
# Error message akan menunjuk ke file dan baris:
# "SyntaxError at pages/admin.tsx:45"

# Buka file tersebut dan lihat baris 45
# Common mistakes:
# - Missing closing brace: } atau )
# - Missing quote: " atau '
# - Missing comma: ,
# - Wrong JSX: {variable} harus dalam return statement

# Setelah fix, server auto-reload
# Jika tidak, restart manual dengan Ctrl+C
```

---

### Masalah: "Build gagal" atau "npm run build error"

**Penyebab:**
- Type error di TypeScript
- Import/module not found
- Syntax error

**Solusi:**

```bash
# Baca error message output dengan hati-hati
# Identifikasi file mana yang error

# Buka file dan fix error tersebut
# Common type errors:
# - Type 'X' tidak assignable ke type 'Y'
# - Property 'X' does not exist
# - Argument of type 'X' is not assignable

# Setelah fix:
npm run build

# Jika tetap error, coba:
rm -rf .next
npm run build

# Atau development mode dulu:
npm run dev
# Test di dev, jika jalan fine, build harusnya ok
```

---

## Performance & Optimization

### Masalah: "Website lambat atau lag"

**Penyebab:**
- Database query slow
- Banyak render ulang
- Cache tidak optimal

**Solusi:**

```bash
# Development mode optimization:
# 1. Lihat DevTools → Performance tab
# 2. Record performance
# 3. Cari bottleneck

# Database optimization:
# - Check query yang dijalankan
# - Tambah index jika perlu
# - Optimize query

# React optimization:
# - Gunakan React.memo untuk component
# - Avoid unnecessary re-renders
# - Use useMemo/useCallback

# Disable dev features:
# - Cek apakah console.log banyak
# - Disable React DevTools untuk test performa
# - Hard refresh untuk clear cache
```

---

### Masalah: "Terminal output terlalu banyak warning"

**Penyebab:**
- Console.log yang masih tersisa
- Unused variables
- Deprecated features

**Solusi:**

```bash
# Clean console.log:
# Search: console.log
# Remove atau comment out

# Check unused imports:
npm run lint

# Fix linting issues:
npm run lint -- --fix

# Ignore warnings tidak penting:
# Fokus ke errors saja (untuk production)
```

---

## Debugging Tips

### Cara 1: Gunakan Console.log

```javascript
// Di kode:
console.log("Debug: variableName =", variableName);

// Lihat di:
// - Terminal (server-side)
// - Browser DevTools Console (client-side)
```

### Cara 2: Gunakan Browser DevTools

```
F12 → Console → Lihat error/warning
F12 → Network → Lihat API calls
F12 → Application → Lihat localStorage/cookies
F12 → Sources → Set breakpoint untuk debug
```

### Cara 3: Gunakan VS Code Debugger

```javascript
// Di launch.json:
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js",
      "type": "node",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "console": "integratedTerminal"
    }
  ]
}

// Tekan F5 untuk debug
```

---

## Ultimate Checklist Troubleshooting

Jika website tidak berjalan, check ini urut:

```
☐ npm --version (Node.js installed?)
☐ psql -U postgres (PostgreSQL running?)
☐ ls .env.local (file exists?)
☐ cat .env.local (DATABASE_URL valid?)
☐ createdb -U postgres shift_manager (DB exists?)
☐ npm install (dependencies installed?)
☐ npm run dev (server running? check terminal)
☐ http://localhost:3000 (accessible?)
☐ F12 Console (error messages?)
☐ /api/setup/status (API respond?)
☐ /setup page (wizard loads?)
☐ Setup wizard complete?
☐ Admin account created?
☐ Login successful?
☐ Dashboard accessible?
```

Jika semua ✓, website seharusnya berjalan!

---

## Nuclear Option (Reset Semuanya)

Jika tidak tahu mau ngapain, jalankan ini:

```bash
# Step 1: Stop server
# Ctrl + C di terminal

# Step 2: Clean everything
rm -rf node_modules .next
rm package-lock.json

# Step 3: Reinstall
npm install

# Step 4: Reset database
# Stop PostgreSQL
# (Windows: Services → stop postgresql)
# (Mac: brew services stop postgresql)
# (Linux: sudo systemctl stop postgresql)

# Start PostgreSQL
# (Windows: Services → start postgresql)
# (Mac: brew services start postgresql)
# (Linux: sudo systemctl start postgresql)

# Drop and recreate database:
psql -U postgres -c "DROP DATABASE shift_manager;"
psql -U postgres -c "CREATE DATABASE shift_manager;"

# Step 5: Run again
npm run dev

# Step 6: Go to /setup and reinitialize
```

---

**Semoga troubleshooting guide ini membantu! 🚀**

Jika masih ada masalah, baca:
- Terminal error messages dengan seksama
- Browser console errors (F12)
- Cek folder structure
- Verify file permissions
