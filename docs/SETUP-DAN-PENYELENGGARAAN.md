# Panduan Pemasangan & Penyelenggaraan Teknikal (Setup & Maintenance)

Dokumen ini menyediakan panduan teknikal untuk memasang, menjalankan, dan membina (*build*) aplikasi **DartVision** pada persekitaran pembangunan tempatan (*local development*) atau pelayan pengeluaran (*production server*).

---

## 1. Keperluan Sistem

Sebelum memulakan, pastikan komputer atau pelayan anda mempunyai perisian berikut:

* **Node.js**: Versi 18.0.0 atau lebih baharu (disyorkan Node.js 20 LTS atau 22).
* **Pengurus Pakej (*Package Manager*)**: `npm`, `yarn`, atau `bun` (projek ini menyokong Bun dan npm).
* **Git**: Untuk menguruskan salinan kod sumber.

---

## 2. Struktur Seni Bina Projek

Aplikasi ini menggunakan seni bina **Full-Stack Ringkas**:
* **Frontend**: React 19 SPA (Single Page Application) dibangunkan menggunakan Vite dan Tailwind CSS v4.
* **Backend**: Pelayan Express (`server.ts`) yang:
  1. Beroperasi sebagai pelayan proksi selamat untuk memanggil Google Gemini Vision API tanpa mendedahkan kunci API kepada pelayar web.
  2. Memasang perisian perantara (*middleware*) Vite semasa mod pembangunan (*development*) supaya frontend dan backend berjalan serentak pada satu port (Port 3000).
  3. Menghidangkan fail statik yang telah dibina (`dist/`) semasa mod pengeluaran (*production*).

```
.
├── .env.example             # Contoh pembolehubah persekitaran (environment variables)
├── index.html               # Pintu masuk HTML aplikasi
├── metadata.json            # Konfigurasi metadata AI Studio
├── package.json             # Senarai dependencies dan skrip binaan
├── server.ts                # Titik masuk pelayan Express (Backend + Vite)
├── tsconfig.json            # Konfigurasi pengkompil TypeScript
├── vite.config.ts           # Konfigurasi Vite & Tailwind CSS
├── src/
│   ├── main.tsx             # Titik masuk React
│   ├── App.tsx              # Penyelaras paparan utama
│   ├── index.css            # Penggayaan global Tailwind v4
│   ├── types/
│   │   └── dart.ts          # Definisi jenis data TypeScript
│   ├── utils/
│   │   ├── dartMath.ts      # Logik matematik WDF, checkout, dan gandaan
│   │   └── storage.ts       # Logik Local Storage, eksport CSV/JSON
│   └── components/
│       ├── Navigation.tsx       # Bar navigasi atas dan bawah
│       ├── HomeScreen.tsx       # Halaman utama pelancaran mod
│       ├── DartboardSvg.tsx     # Papan dart SVG, penanda pin, dan kanta pembesar
│       ├── X01GameArena.tsx     # Enjin perlawanan X01, numpad, dan format leg
│       ├── TrainingMode.tsx     # 4 mod latihan ketepatan antarabangsa
│       ├── CameraScanModal.tsx  # Aliran semakan kamera bersebelahan (Vision AI)
│       └── StatsHistoryView.tsx # Jadual arkib dan peta haba radial
└── docs/                    # Dokumentasi lengkap projek
```

---

## 3. Langkah Pemasangan Tempatan (Local Setup)

### Langkah 1: Klonkan Repository
```bash
git clone https://github.com/USERNAME/dartvision-score-tracker.git
cd dartvision-score-tracker
```

### Langkah 2: Pasang Dependencies
Gunakan npm untuk memasang semua pustaka yang diperlukan:
```bash
npm install
```

### Langkah 3: Konfigurasi Pembolehubah Persekitaran (Environment Variables)
Salin fail contoh `.env.example` kepada `.env`:
```bash
cp .env.example .env
```

Buka fail `.env` dan masukkan kunci API Gemini anda:
```env
# GEMINI_API_KEY: Diperlukan untuk fungsi imbasan kamera Vision AI.
# Anda boleh mendapatkan kunci percuma daripada Google AI Studio (https://aistudio.google.com).
GEMINI_API_KEY="AIzaSy..."

# APP_URL: URL hos aplikasi (pilihan untuk persekitaran tempatan)
APP_URL="http://localhost:3000"
```

*Nota: Sekiranya anda tidak meletakkan `GEMINI_API_KEY`, semua fungsi pengiraan skor manual, papan interaktif, latihan, dan statistik tetap berfungsi seperti biasa. Hanya fungsi imbasan kamera AI yang akan memaparkan mesej ralat.*

### Langkah 4: Jalankan Pelayan Pembangunan (Development Server)
```bash
npm run dev
```

Buka pelayar web anda dan layari:
```
http://localhost:3000
```

---

## 4. Arahan Binaan & Pengeluaran (Build & Production)

### Membina Aset Statik:
Untuk membina pakej pengeluaran yang dioptimumkan:
```bash
npm run build
```
Fail hasil binaan akan disimpan di dalam folder `dist/`.

### Menjalankan dalam Mod Pengeluaran:
```bash
npm start
```
Skrip ini akan menjalankan `tsx server.ts` yang akan menghidangkan fail daripada folder `dist/` secara terus pada port 3000.

---

## 5. Pemeriksaan Kod & Kualiti (Lint & Verification)

Sebelum membuat sebarang penyerahan kod (*commit*), jalankan pemeriksaan jenis data TypeScript:
```bash
npx tsc --noEmit
```
Pastikan tiada sebarang ralat dilaporkan.

---

## 6. Penyelesaian Masalah Teknikal (Troubleshooting)

1. **Port 3000 Telah Digunakan**:
   * Sekiranya port 3000 digunakan oleh proses lain, matikan proses tersebut atau ubah nombor port dalam fail `server.ts` pada baris `const port = process.env.PORT || 3000;`.
2. **Ralat Permintaan Kamera pada Pelayar**:
   * Pelayar web moden (Chrome, Safari) hanya membenarkan akses kamera peranti melalui protokol **HTTPS** atau **localhost**. Jika diakses melalui alamat IP rangkaian tanpa HTTPS, pelayar akan menyekat akses kamera secara automatik atas sebab keselamatan.
