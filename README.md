# DartVision — Pengira Skor & Penjejak Ketepatan Dart (Score & Accuracy Tracker)

**DartVision** ialah aplikasi web moden yang membantu pemain dart mengira skor perlawanan secara automatik dan menjejak ketepatan balingan dengan mudah. Dilengkapi dengan papan dart interaktif, pembantu laluan penamat (*checkout suggester*), dan teknologi kecerdasan buatan (*Vision AI*) untuk mengimbas papan dart menggunakan kamera telefon.

---

## Masalah yang Diselesaikan

Dalam permainan dart fizikal biasa:
1. **Pengiraan Skor yang Rumit**: Pemain kerap perlu berhenti untuk mengira baki mata (*contohnya: baki 501 tolak 85*), memeriksa peraturan *Double-Out*, atau mencari kombinasi balingan untuk menang (*checkout*). Ini melambatkan rentak balingan.
2. **Tiada Rekod Ketepatan Latihan**: Pemain sukar mengetahui nombor atau sektor mana yang kerap mereka tersasar (*contohnya: kerap melencong ke nombor 1 atau 5 apabila menyasar 20*).
3. **Perekodan Manual yang Menyusahkan**: Menaip skor satu persatu semasa tangan memegang dart agak renyah.

**DartVision menyelesaikan masalah ini** dengan menyediakan papan dart visual yang memaparkan skor secara langsung, cadangan langkah penamat pintar, imbasan kamera berbantukan AI, dan peta haba (*heatmap*) ketepatan yang disimpan terus pada peranti anda.

---

## Untuk Siapa Aplikasi Ini?

* **Pemain Kasual & Komuniti Dart**: Untuk bermain perlawanan santai bersama rakan (*Pass-and-Play*) dari 1 hingga 4 pemain tanpa memerlukan papan kapur manual.
* **Pemain Latihan & Kelab**: Untuk pemain yang ingin meningkatkan purata 3-dart (*3-dart average*) dan ketepatan balingan melalui latihan berstruktur.
* **Peminat Sukan Dart**: Sesiapa sahaja yang mahukan papan skor bertaraf kejohanan antarabangsa (*PDC-standard*) pada telefon pintar, tablet, atau komputer riba.

---

## Apa yang Boleh Dibuat?

* **Papan Skor X01 (101, 501, 1001)**:
  * Mengira markah perlawanan secara automatik untuk 1 hingga 4 pemain.
  * Sokongan peraturan rasmi *Double-Out* (wajib tamat dengan Double atau Bullseye) atau mod santai *Single-Out*.
  * Pengesanan batal balingan (*Bust Detection*) jika markah melebihi baki atau berbaki 1 mata.
  * Sokongan format perlawanan panjang (*Best of 1, 3, 5, atau 7 Legs*) dengan penukaran pemain pemula secara automatik.
* **Papan Dart Interaktif Berketepatan Tinggi**:
  * Papan geometri standard WDF dengan 20 sektor nombor, cincin *Single*, *Double*, *Triple*, *Outer Bull (25 mata)*, dan *Inner Bull (50 mata)*.
  * **Penanda Dart Fizikal (①, ②, ③)**: Memaparkan titik impak setiap lontaran dengan warna dan bayang visual di atas papan.
  * **Kanta Pembesar Sentuh (*Touch Loupe*)**: Memaparkan gelembung pembesar apabila jari menyentuh skrin telefon pintar untuk mengelakkan salah tekan.
  * **Papan Kekunci Pantas (*Quick Numpad*)**: Pilihan alternatif untuk menaip terus jumlah skor pusingan (0–180) dengan pintasan nombor popular (*26, 41, 60, 85, 100, 140, 180*).
* **Laluan Penamat Pintar (*Adaptive Checkout Suggester*)**:
  * Menyarankan kombinasi balingan untuk baki $\le 170$ mata (**Plan A**).
  * Memaparkan laluan luar jangka (**Plan B**) secara automatik jika balingan pertama hanya terkena *Single* dan bukannya *Triple*.
* **Imbasan Papan Menggunakan Kamera (Vision AI)**:
  * Tangkap gambar papan dart selepas 3 balingan; model Gemini Vision akan mengesan kedudukan 3 dart secara automatik.
  * Panel semakan bersebelahan (*Side-by-Side Review*) 3 lajur membolehkan pemain mengesahkan atau menukar segmen dengan 1 ketukan.
* **4 Rutin Latihan Berstruktur Standard Antarabangsa**:
  1. *Free-Throw Target Log*: Latihan bebas dengan pengiraan peratusan tepat (*Hit/Miss*).
  2. *Around the Clock*: Cabaran balingan nombor 1 hingga 20 berturutan hingga ke Bullseye.
  3. *Bob's 27*: Latihan Double klasik antarabangsa berasaskan sistem tambah dan tolak mata.
  4. *121 Checkout Challenge*: Cabaran menghabiskan 121 mata dalam 9 dart dengan rekod rentetan kejayaan.
* **Statistik Terperinci & Peta Haba (*Radial Heatmap*)**:
  * Peta haba visual yang mewarnakan segmen papan daripada biru sejuk hingga merah menyala mengikut kekerapan balingan anda.
  * Jadual arkib ketepatan lengkap mengikut kategori (*Numbers, Doubles, Triples, Bullseye*).
  * Eksport rekod ke format fail **CSV** (spreadsheet) dan **JSON** (sandaran), serta pemulihan data (*Import*).
* **100% Privasi & Luar Talian (*Offline-First*)**:
  * Semua rekod perlawanan dan statistik disimpan di dalam pelayar peranti anda (*Local Storage*). Tiada pendaftaran akaun atau kata laluan diperlukan.

---

## Contoh Cara Penggunaan

1. **Memulakan Perlawanan**:
   * Tekan butang **"Start Match"** di halaman utama.
   * Pilih skor permulaan (contoh: **501**), peraturan penamat (**Double-Out**), dan kepanjangan perlawanan (contoh: **Best of 3 Legs**).
   * Masukkan nama pemain (contoh: *Afiq* dan *Faiz*), kemudian tekan **Start Match**.
2. **Merekod Balingan**:
   * Pemain melontar 3 dart pada papan dart fizikal di dinding.
   * Pada skrin aplikasi, sentuh 3 segmen yang terkena pada papan visual (contoh: *T20, T20, S20* — jumlah 140 mata).
   * Penanda dart ①, ②, ③ akan muncul di atas papan visual. Tekan **Confirm Turn**.
3. **Melihat Cadangan Penamat**:
   * Apabila baki mata mencecah 170 atau kurang (contohnya baki 40), aplikasi terus memaparkan kad cadangan: `D20 (Double 20)`.
4. **Kemenangan & Rekod**:
   * Pemain yang berjaya menamatkan baki mata kepada tepat 0 dengan Double akan memenangi leg tersebut.
   * Selepas memenangi bilangan leg yang ditetapkan, skrin kejohanan memaparkan purata 3-dart dan menyimpan rekod ke arkib statistik.

---

## Cara Mencuba Aplikasi

* **Pautan Aplikasi (Live Demo)**:  
  [https://ais-pre-iiwyhtii57ya56nhyuqbox-859136042013.asia-northeast1.run.app](https://ais-pre-iiwyhtii57ya56nhyuqbox-859136042013.asia-northeast1.run.app)
* Tiada pemasangan perisian tambahan atau pendaftaran akaun diperlukan; buka sahaja pautan di atas menggunakan mana-mana pelayar web moden (Google Chrome, Safari, Microsoft Edge, atau Firefox).

---

## Status Projek Semasa

| Komponen / Ciri | Status | Catatan |
| :--- | :--- | :--- |
| **Papan Skor X01 & Peraturan Double-Out** | **Sudah Dibina & Diuji** | Berfungsi sepenuhnya dengan logik Bust rasmi. |
| **Papan Dart Sisal SVG & Penanda Pin** | **Sudah Dibina & Diuji** | Koordinat tepat WDF beserta kanta pembesar sentuhan. |
| **Mod Dwi-Input (Numpad & Papan)** | **Sudah Dibina & Diuji** | Menyokong kemasukan manual 0–180 berserta pintasan. |
| **Format Perlawanan (Legs & Sets)** | **Sudah Dibina & Diuji** | Penggiliran pemula pusingan dan agregat kemenangan leg. |
| **4 Mod Latihan Antarabangsa** | **Sudah Dibina & Diuji** | Free-throw, Around the Clock, Bob's 27, dan 121 Challenge. |
| **Peta Haba Radial (Accuracy Heatmap)** | **Sudah Dibina & Diuji** | Visualisasi kecerunan suhu dan pemeriksa segmen. |
| **Eksport & Import Data (CSV & JSON)** | **Sudah Dibina & Diuji** | Muat turun sandaran fail dan muat naik semula. |
| **Imbasan Kamera (Gemini Vision AI)** | **Sudah Dibina & Diuji Secara Kod** | Backend Express proxy aktif; ketepatan imbasan sebenar bergantung kepada pencahayaan dan kualiti kamera peranti. |

*Untuk butiran lanjut tentang status dan batasan, sila rujuk [STATUS-DAN-ROADMAP.md](docs/STATUS-DAN-ROADMAP.md).*

---

## Panduan Lanjut

Untuk maklumat terperinci, sila rujuk dokumen dalam folder `docs/`:

* [Panduan Pengguna Langkah demi Langkah](docs/PANDUAN-PENGGUNA.md)
* [Spesifikasi & Keperluan Produk (PRD Summary)](docs/KEPERLUAN-PRODUK.md)
* [Status Pembangunan & Pelan Masa Depan](docs/STATUS-DAN-ROADMAP.md)
* [Pengendalian Data & Polisi Privasi](docs/DATA-DAN-PRIVASI.md)
* [Panduan Pemasangan & Penyelenggaraan Teknikal](docs/SETUP-DAN-PENYELENGGARAAN.md)
* [Log Sejarah Perubahan (Changelog)](CHANGELOG.md)

---

## Ringkasan Teknologi

* **React 19**: Digunakan untuk membina antara muka pengguna (UI) yang pantas dan responsif.
* **TypeScript**: Digunakan untuk memastikan kod bebas ralat dengan pemeriksaan jenis data yang ketat.
* **Vite**: Alat pembangun (*build tool*) moden untuk pemuatan aplikasi yang sangat pantas.
* **Tailwind CSS v4**: Digunakan untuk reka bentuk visual bertaraf kejohanan sukan tanpa fail CSS yang berselerak.
* **Express (Node.js)**: Pelayan perantara (*proxy server*) yang mengendalikan panggilan selamat ke API AI.
* **Google Gemini 3.8 Flash (`@google/genai`)**: Model kecerdasan buatan visual untuk menganalisis kedudukan dart pada gambar papan.
* **Local Storage (Pelayar Web)**: Digunakan untuk menyimpan sejarah perlawanan dan statistik terus pada peranti pengguna tanpa memerlukan pangkalan data luar.

---

## Maklum Balas & Bantuan

Sekiranya anda menemui sebarang masalah (*bug*) atau mempunyai cadangan penambahbaikan, sila laporkan melalui **GitHub Issues** pada repository ini.
