# Auto-Scheduling dengan Algoritma Backtracking

## Deskripsi Fitur

Fitur Auto-Schedule memungkinkan Anda untuk membuat jadwal shift secara otomatis untuk periode waktu tertentu menggunakan algoritma backtracking yang intelligent.

## Bagaimana Cara Kerjanya

### 1. **Algoritma Backtracking**
Algoritma ini bekerja dengan strategi:
- **Recursive Search**: Mencoba setiap kombinasi assignment yang mungkin
- **Constraint Checking**: Memastikan setiap karyawan hanya punya maksimal 1 shift per hari
- **Fair Distribution**: Memprioritaskan karyawan yang sudah dapat assignment lebih sedikit
- **Backtrack**: Jika kombinasi tidak valid, algoritma akan mundur dan mencoba alternatif lain

### 2. **Algoritma Greedy (Fallback)**
Alternatif yang lebih cepat:
- Loop through setiap hari dan shift
- Assign karyawan dengan shift count terendah
- Tidak melakukan backtrack (lebih cepat tapi hasil kurang optimal)

## Cara Menggunakan

### Step 1: Buka Schedule Manager
- Go ke Admin Dashboard → Schedule Management

### Step 2: Klik "Auto Schedule"
- Button terletak di sebelah Export Schedule

### Step 3: Atur Parameter

**Tanggal Mulai**
- Pilih tanggal awal periode scheduling (termasuk)

**Tanggal Akhir**
- Pilih tanggal akhir periode scheduling (termasuk)
- Default: 7 hari ke depan

**Algoritma**
- **Backtracking** (Rekomendasi): Optimal tapi sedikit lebih lambat
  - Cocok untuk planning jangka pendek (1-4 minggu)
  - Hasil schedule lebih seimbang
  
- **Greedy**: Cepat tapi kurang optimal
  - Cocok untuk emergency scheduling
  - Hasil masih acceptable tapi mungkin tidak se-fair backtracking

### Step 4: Klik "Buat Jadwal"
- Sistem akan memproses dan membuat jadwal otomatis
- Karyawan akan mendapat notifikasi otomatis via email/notification

## Constraint yang Diperhatikan

✅ **Setiap karyawan hanya 1 shift per hari**
- Algoritma akan mencegah konflik shift pada hari yang sama

✅ **Hanya karyawan aktif (is_available = true)**
- Karyawan yang tidak available tidak akan dijadwalkan

✅ **Hanya shift active (is_active = true)**
- Shift yang tidak active tidak akan digunakan

✅ **Tidak menimpa jadwal yang sudah ada**
- Assignment yang sudah ada akan dipertahankan
- Algoritma hanya membuat assignment untuk slot kosong

✅ **Weekday only (Senin-Jumat)**
- Default hanya menjadwalkan hari kerja
- Dapat dikonfigurasi di kode jika perlu weekend

## Interpretasi Hasil

Setelah auto-schedule berhasil, Anda akan melihat summary:

- **Request**: Jumlah assignment yang diminta oleh algoritma
- **Berhasil Dibuat**: Jumlah assignment yang berhasil diinsert ke database
- **Konflik**: Jumlah assignment yang gagal (biasanya karena jadwal sudah ada)
- **Hari Dijadwalkan**: Jumlah hari yang diproses (weekday saja)
- **Algoritma**: Algoritma mana yang digunakan

**Contoh Hasil:**
```
Request:      42
Berhasil:     40
Konflik:      2
Hari:         10
Algoritma:    backtrack
```

Berarti 40 dari 42 assignment berhasil dibuat, 2 gagal karena sudah ada assignment lain.

## Optimization Tips

### Untuk Hasil Optimal:
1. **Bersihkan jadwal lama** sebelum auto-schedule periode baru
   - Atau gunakan tanggal range yang tidak overlap

2. **Pastikan semua karyawan aktif**
   - Check `is_available = true` di employees table
   - Inactive employees tidak akan dijadwalkan

3. **Pastikan ada cukup karyawan vs shift**
   - Jika karyawan < jumlah shift daily, beberapa shift akan kosong
   - Ideal: karyawan ≈ 2-3x jumlah shift daily

4. **Gunakan Backtracking untuk planning**
   - Lebih optimal untuk long-term planning
   - Fair distribution lebih terjamin

### Untuk Hasil Cepat:
- Gunakan Greedy untuk emergency scheduling
- Lebih cepat tapi distribusi mungkin kurang seimbang

## Performance Notes

- **Backtracking**: ~50-200ms untuk 2-4 minggu dengan 6-10 karyawan
- **Greedy**: ~10-50ms untuk periode sama
- Waktu tergantung dari:
  - Jumlah hari dalam range
  - Jumlah karyawan active
  - Jumlah shift active
  - Jumlah existing assignments

## Troubleshooting

### "No available employees"
- Pastikan ada karyawan dengan `is_available = true`
- Check Employees page

### "No active shifts"
- Pastikan ada shift dengan `is_active = true`
- Check Shifts Management

### Terlalu banyak "Konflik"
- Berarti banyak karyawan yang sudah punya jadwal
- Coba delete schedule lama atau gunakan date range yang berbeda

### Schedule tidak seimbang
- Coba gunakan Backtracking instead of Greedy
- Atau cek apakah ada karyawan yang tidak available

## Technical Details

### Database Queries
Algoritma menggunakan:
- `SELECT * FROM employees WHERE is_available = true`
- `SELECT * FROM shifts WHERE is_active = true`
- `SELECT * FROM schedule_assignments WHERE scheduled_date BETWEEN ? AND ?`
- `INSERT INTO schedule_assignments` untuk setiap valid assignment

### API Endpoint
```
POST /api/assignments/auto-schedule
{
  "startDate": "2026-02-10",
  "endDate": "2026-02-20",
  "algorithm": "backtrack" // atau "greedy"
}
```

### Notification
Setiap karyawan akan mendapat notifikasi otomatis via email/notification system tentang jadwal baru mereka.

## Limitations & Future Improvements

**Current Limitations:**
- Hanya weekday (Monday-Friday)
- Tidak ada shift preferences/skills matching
- Tidak ada maksimum shift per minggu

**Possible Future Improvements:**
1. Weekend scheduling option
2. Skill-based assignment (assign based on job requirements)
3. Max shifts per week constraint
4. Shift pattern optimization (same shift each week)
5. Historical performance-based assignment (assign to reliable employees)
6. Department-based balancing
7. UI untuk preview hasil sebelum commit to database

## Contact & Support

Untuk pertanyaan tentang auto-scheduling, hubungi administrator system.
