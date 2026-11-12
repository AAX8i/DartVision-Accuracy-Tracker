# Pengendalian Data & Privasi (Data & Privacy)

Dokumen ini menerangkan dengan telus cara aplikasi **DartVision** mengendalikan, menyimpan, dan memproses data anda berdasarkan seni bina kod sebenar aplikasi.

---

## 1. Data yang Dikumpul oleh Aplikasi

Aplikasi ini hanya mengumpul maklumat asas yang diperlukan untuk fungsi permainan dan latihan dart:

1. **Nama Pemain (*Player Names*)**:
   * Nama panggilan yang anda masukkan semasa tetapan perlawanan (contoh: *Pemain 1*, *Afiq*).
   * Aplikasi tidak meminta atau mengumpul nama penuh, alamat e-mel, nombor kad pengenalan, atau nombor telefon.
2. **Rekod Permainan & Latihan (*Gameplay Records*)**:
   * Markah setiap lontaran, nama segmen (contoh: `T20`, `D16`), masa perlawanan, bilangan dart yang dilontar, dan purata skor 3-dart.
   * Rekod sasaran latihan (sama ada *Hit* atau *Miss*).
3. **Imej Papan Dart (*Camera Capture*)**:
   * Gambar papan dart yang anda ambil secara sukarela melalui fungsi *Vision AI*.
   * Gambar ini hanya mengandungi paparan papan dart dan tidak bertujuan untuk merakam wajah pengguna atau persekitaran peribadi.

---

## 2. Di Mana Data Disimpan?

* **Penyimpanan Tempatan Pada Peranti Anda (*100% Local Storage*)**:
  * Semua sejarah perlawanan, arkib ketepatan, dan status perlawanan yang sedang aktif disimpan secara terus di dalam storan pelayar web peranti anda (*Browser Local Storage*) di bawah kunci:
    `dartvision_v1_state`
  * **Tiada pangkalan data awan berpusat** (seperti Firebase, PostgreSQL, atau MySQL) yang digunakan untuk menyimpan rekod permainan anda.
  * Data ini kekal di dalam peranti anda dan tidak boleh diakses oleh pemain lain melainkan mereka menggunakan peranti fizikal yang sama.

---

## 3. Komunikasi dengan Perkhidmatan Luar & AI

* **Model Kecerdasan Buatan (Google Gemini 3.8 Flash)**:
  * Apabila anda menekan butang *Scan Board With Vision AI*, gambar papan dart akan dimampatkan pada peranti anda kepada saiz maksimum 1024 piksel dan dihantar melalui sambungan selamat (HTTPS) ke pelayan perantara (*server proxy Express*).
  * Pelayan perantara kemudian menghantar imej tersebut ke Google Gemini API untuk mengenal pasti kedudukan 3 dart pada papan.
  * **Tiada Penyimpanan Imej Kekal**: Pelayan tidak menyimpan gambar papan dart tersebut ke dalam cakera keras (*hard drive*) atau pangkalan data. Sebaik sahaja model AI selesai memproses dan mengembalikan senarai segmen (contoh: `["T20", "S20", "D10"]`), data imej tersebut dibuang daripada memori.
  * Kunci rahsia API (*Gemini API Key*) disimpan dengan selamat di bahagian pelayan (*server-side environment variable*) dan tidak pernah didedahkan kepada kod pelayar pengguna.

---

## 4. Siapa yang Boleh Mengakses Data Anda?

* **Hanya Anda**: Oleh kerana semua data disimpan di dalam pelayar peranti anda, hanya individu yang mempunyai akses fizikal kepada peranti dan pelayar anda yang boleh melihat rekod statistik anda.
* Pengendali sistem atau pembangun aplikasi tidak mempunyai akses jauh (*remote access*) untuk melihat atau membaca data perlawanan anda.

---

## 5. Cara Memadam Data Anda

Anda mempunyai kawalan penuh ke atas data anda pada bila-bila masa:

1. **Pemadaman Melalui Aplikasi**:
   * Pergi ke menu **Stats & History**.
   * Tekan butang merah **"Reset"**.
   * Kotak pengesahan 2 langkah (*2-Step Confirmation Modal*) akan dipaparkan untuk mengelakkan pemadaman tidak sengaja.
   * Selepas mengesahkan langkah kedua, semua rekod perlawanan dan statistik latihan dalam `localStorage` akan dipadamkan serta-merta.
2. **Pemadaman Melalui Tetapan Pelayar**:
   * Anda juga boleh memadam data pada bila-bila masa dengan membersihkan kuki dan data tapak (*Clear Site Data / Cookies*) bagi laman web aplikasi ini pada pelayar anda.

---

## 6. Sandaran & Pemindahan Data (*Data Portability*)

Aplikasi menyediakan dua format eksport fail terbuka:
* **CSV**: Sesuai untuk dibuka di Microsoft Excel atau Google Sheets bagi tujuan analisis sendiri.
* **JSON**: Mengandungi salinan sandaran penuh berstruktur yang boleh dimuat naik semula (*Import*) sekiranya anda ingin memindahkan rekod ke peranti baharu.
