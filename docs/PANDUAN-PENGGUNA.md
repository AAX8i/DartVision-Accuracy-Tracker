# Panduan Pengguna DartVision

Panduan ini menerangkan cara menggunakan aplikasi **DartVision** langkah demi langkah, daripada perlawanan pertama anda sehinggalah kepada analisis prestasi lontaran.

---

## 1. Permulaan Pantas: Menjalankan Perlawanan X01

Perlawanan **X01** (seperti 501 atau 301) ialah format standard sukan dart antarabangsa di mana pemain bermula dengan jumlah mata tertentu dan menolaknya sehingga mencecah tepat 0.

### Langkah-langkah:
1. Pada menu utama, tekan **"X01 Match"** atau kad **"X01 Match Play"**.
2. **Tetapkan Konfigurasi Perlawanan**:
   * **Starting Score**: Pilih antara `101`, `501`, atau `1001`. (501 ialah standard perlawanan rasmi).
   * **Match Length (Legs)**: Pilih bilangan pusingan kemenangan yang diperlukan:
     * *Single Leg*: Sesiapa capai 0 pertama menang perlawanan.
     * *Best of 3*: Pemain pertama yang memenangi 2 leg menang perlawanan.
     * *Best of 5*: Pemain pertama yang memenangi 3 leg menang perlawanan.
     * *Best of 7*: Pemain pertama yang memenangi 4 leg menang perlawanan.
   * **Finishing Rule (Out Mode)**:
     * *Double-Out (Standard)*: Balingan terakhir yang mencecah 0 **wajib** terkena pada cincin Double (D) atau Bullseye merah (50 mata).
     * *Single-Out (Casual)*: Sebarang balingan yang membawa skor kepada tepat 0 dikira menang.
   * **Senarai Pemain**: Masukkan nama pemain (1 hingga 4 pemain). Gunakan butang `+ Add Player` untuk menambah rakan anda.
3. Tekan **"Start Match"**.

---

## 2. Cara Merekod Skor Semasa Giliran Balingan

Terdapat dua cara untuk memasukkan markah balingan anda:

### Kaedah A: Menggunakan Papan Dart Interaktif (Dartboard)
1. Setiap pemain melontar 3 dart pada papan fizikal anda.
2. Sentuh segmen yang terkena pada papan visual di skrin telefon atau komputer anda:
   * **Sektor Nombor 1–20**: Tekan bahagian dalam atau luar.
   * **Cincin Gandaan (Multiplier)**: Gunakan butang di atas papan (*1x Single, 2x Double, 3x Treble*) atau tekan secara terus pada zon warna merah/hijau.
   * **Bullseye**:
     * Cincin hijau luar = *Outer Bull (25 mata)*.
     * Bulatan merah tengah = *Inner Bull (50 mata)*.
   * **Balingan Terlepas**: Tekan butang `MISS (0 PTS)` di bawah papan jika dart jatuh atau terkena kawasan hitam luar.
3. Penanda dart bernombor **①, ②, ③** akan muncul di atas papan visual berserta jumlah mata pusingan.
4. Tekan butang hijau **"Confirm Turn"** untuk menamatkan giliran dan menyerahkan giliran kepada pemain seterusnya.
5. Jika tersilap tekan, gunakan butang kuning **"UNDO"** untuk membatalkan balingan terakhir.

### Kaedah B: Menggunakan Papan Kekunci Pantas (Quick Numpad)
Jika anda bermain pantas dan sudah mengetahui jumlah 3 balingan anda (contohnya lontar T20, S20, S5 = 85 mata):
1. Tekan togol **"Quick Numpad"** di bahagian atas kanan skrin arena.
2. Taip terus jumlah skor pusingan anda (0 hingga 180) atau tekan butang pintasan skor popular seperti `26`, `41`, `60`, `85`, `100`, `140`, atau `180`.
3. Tekan **"Submit Turn"**.

---

## 3. Memahami Status & Label Penting

* **Bust! (Batal)**:
  * Berlaku apabila balingan anda menyebabkan baki mata menjadi **kurang daripada 0**, atau berbaki **tepat 1 mata** dalam mod *Double-Out* (kerana tiada Double yang bernilai 1 mata), atau mencapai 0 tetapi dart terakhir bukan Double.
  * *Tindakan Aplikasi*: Markah pusingan tersebut akan dibatalkan, baki mata pemain dikembalikan kepada baki asal sebelum pusingan bermula, dan giliran beralih kepada pemain lawan secara automatik.
* **Checkout Route (Laluan Penamat)**:
  * Apabila baki mata anda ialah **170 atau kurang**, sistem akan memaparkan kad cadangan balingan optimum (contohnya baki 40 mata: cadangan `D20`).
  * **Plan A vs Plan B**: Jika cadangan asal ialah `T20 -> D20` tetapi lontaran pertama anda hanya mengenai `S20`, kad **Plan B** akan memaparkan laluan alternatif baharu (contohnya `T19 -> D19`) tanpa anda perlu mengira sendiri.
* **Kanta Pembesar (Touch Loupe)**:
  * Semasa anda menekan papan dart pada skrin telefon pintar, satu gelembung pembesar bulat akan terapung di atas jari anda untuk menunjukkan dengan tepat segmen dan mata sebelum anda melepaskan sentuhan.

---

## 4. Menggunakan Imbasan Kamera Vision AI

1. Tekan butang hijau **"Scan Board With Vision AI"**.
2. Halakan kamera peranti anda ke arah papan dart fizikal:
   * Pastikan pencahayaan bilik mencukupi dan papan berada di tengah-tengah bingkai gambar.
   * Pastikan ketiga-tiga dart yang tertancap pada papan kelihatan jelas.
3. Tangkap gambar (*Capture Photo*).
4. Model AI akan menganalisis koordinat dan memaparkan ketiga-tiga dart secara bersebelahan (*Side-by-Side Review*).
5. Semak hasil bacaan:
   * Jika semua betul: Tekan **"Confirm All (3 Darts) & Next Turn"**.
   * Jika ada dart yang tersilap dikesan (contohnya dikesan sebagai S20 sedangkan ia T20): Tekan butang alternatif pantas di bawah kotak dart berkenaan untuk membetulkannya dengan satu ketukan.

---

## 5. Menjalankan Mod Latihan (Training Drills)

Tekan menu **"Accuracy Training"** di atas skrin untuk memilih antara 4 rutin latihan:

1. **Free-Throw Target Log**:
   * Pilih sasaran anda (contohnya: nombor 20).
   * Lontar 3 dart dan rekodkan sama ada balingan anda mengenai sasaran (*HIT*) atau terlepas (*MISS*). Tekan *Save Training Turn* untuk mengemaskini peratusan ketepatan anda.
2. **Around the Clock**:
   * Sasaran bermula dengan nombor **1**. Apabila anda berjaya mengenai nombor tersebut, sasaran beralih secara automatik ke nombor **2**, **3**, dan seterusnya sehingga **20** dan **Bullseye**.
   * Sistem akan mengira berapa jumlah lontaran yang anda perlukan untuk menamatkan satu pusingan jam penuh.
3. **Bob's 27 (Cabaran Latihan Double)**:
   * Anda bermula dengan **27 mata**.
   * Setiap pusingan menyasar cincin Double bermula daripada **D1** hingga **D20**.
   * Jika kena Double: Tambah mata (contohnya D1 bernilai 2 mata setiap satu).
   * Jika ketiga-tiga dart terlepas: Tolak nilai Double tersebut daripada skor anda.
   * *Amaran*: Jika skor anda jatuh di bawah 0 mata, permainan tamat (*Game Over*)!
4. **121 Checkout Challenge**:
   * Anda diberi baki mata **121** dan **9 dart** untuk menyelesaikannya dengan peraturan Double-Out.
   * Jika berjaya, sasaran seterusnya meningkat kepada **122**, **123** dan seterusnya untuk menguji rentetan kemenangan (*streak*) anda.

---

## 6. Melihat Statistik & Peta Haba (Stats & History)

1. Tekan menu **"Stats & History"**.
2. **Ringkasan Utama**: Memaparkan purata 3-dart keseluruhan, peratusan ketepatan latihan, dan bilangan perlawanan yang telah tamat.
3. **Peta Haba Radial (Radial Heatmap)**:
   * Tekan butang togol **"Radial Heatmap"**.
   * Papan dart akan memaparkan warna haba: segmen yang kerap anda lontar dan kena akan menyala dengan warna merah dan jingga, manakala segmen yang jarang disentuh berwarna biru gelap.
   * Sentuh mana-mana segmen untuk melihat statistik terperinci segmen tersebut (*Attempts, Hits, Accuracy %*).
4. **Eksport & Sandaran Data**:
   * Tekan butang **CSV** untuk memuat turun lembaran kerja prestasi anda.
   * Tekan butang **JSON** untuk membuat salinan sandaran penuh semua rekod.
   * Jika anda menukar peranti, gunakan butang **Import** untuk memuat naik semula fail sandaran JSON anda.

---

## 7. Penyelesaian Masalah Lazim (Troubleshooting)

| Masalah | Punca Biasa | Langkah Penyelesaian |
| :--- | :--- | :--- |
| **Kamera lambat atau gagal menganalisis gambar** | Saiz fail terlalu besar atau sambungan internet perlahan. | Aplikasi memampatkan gambar secara automatik, tetapi pastikan telefon mempunyai sambungan internet untuk pelayan AI memproses imej. Anda juga boleh membetulkan segmen secara manual dalam panel semakan. |
| **Salah menekan segmen pada papan visual** | Saiz skrin telefon kecil. | Gunakan butang **1.4x Zoom** di atas papan atau hidupkan ciri **Touch Loupe** dengan menahan jari sebelum melepaskan sentuhan. Anda juga boleh menukar kepada mod **Quick Numpad**. |
| **Data statistik hilang selepas membersihkan pelayar** | Cache/Local Storage pelayar dikosongkan. | Simpan salinan sandaran berkala dengan menekan butang **JSON** pada menu *Stats & History*. Fail sandaran ini boleh dipulihkan pada bila-bila masa. |
