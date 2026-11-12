# Dokumen Keperluan Produk (Product Requirements Document - PRD)

Dokumen ini merumuskan objektif reka bentuk, peraturan perniagaan, skop fungsi (*features*), dan kriteria penerimaan bagi aplikasi **DartVision Score & Accuracy Tracker**. Dokumen ini merujuk kepada spesifikasi asal *DartVision Score & Accuracy Tracker PRD v1.0*.

---

## 1. Tujuan Produk & Pengguna Sasaran

* **Visi Produk**: Menyediakan alat digital lengkap bagi pemain dart fizikal untuk mengautomasikan pengiraan skor, mengurangkan kesilapan matematik, membimbing penamat pusingan (*checkout routes*), serta menganalisis taburan ketepatan lontaran secara saintifik tanpa memerlukan perkakasan papan pintar mahal.
* **Pengguna Sasaran**:
  * **Pemain Kasual (Pub & Rumah)**: Memerlukan papan skor intuitif tanpa pendaftaran akaun, menyokong format perlawanan 1–4 pemain tempatan (*Pass-and-Play*).
  * **Pemain Pertandingan & Kelab**: Memerlukan peraturan rasmi WDF/PDC (*Double-Out, Bust detection, format Legs & Sets*), serta pengiraan purata 3-dart secara tepat.
  * **Pemain Latihan Persendirian**: Memerlukan pembalak sasaran bebas dan rutin latihan berstruktur untuk memantau peningkatan konsistensi lontaran.

---

## 2. Skop MVP (Minimum Viable Product) yang Disahkan

Aplikasi ini dibina dengan keutamaan ciri MVP berikut:

1. **FR-001: Papan Dart Interaktif Geometri WDF**:
   * Papan jam (*clockface*) 20 sektor piawai dengan nombor 20 berada tegak pada arah 12 o'clock.
   * Zon pengesanan segmen lengkap: *Single Inner*, *Triple Ring*, *Single Outer*, *Double Ring*, *Outer Bull (25 mata)*, *Inner Bull (50 mata)*, dan *Miss (0 mata)*.
   * Nisbah jejari piawai:
     * Inner Bull (IB): 8mm (relatif SVG)
     * Outer Bull (OB): 19mm
     * Triple Ring: 97mm – 107mm
     * Double Ring: 162mm – 170mm
     * Cincin Nombor Luar: 216mm
   * Kawalan zum 1.4x untuk paparan skrin sentuh telefon.
   * Penanda impak lontaran fizikal (Pin ①, ②, ③) pada permukaan papan.
2. **FR-002: Enjin Perlawanan X01 (101, 501, 1001)**:
   * Menguruskan skor bermula 101, 501, atau 1001 bagi 1 hingga 4 pemain.
   * Peraturan penamat rasmi:
     * *Double-Out*: Balingan terakhir yang mencecah 0 wajib bernilai gandaan 2 (*Double*) atau *Inner Bull (50 mata)*.
     * *Single-Out*: Pilihan kasual di mana sebarang balingan yang mencecah 0 dikira selesai.
   * Logik Batal (*Bust Logic*): Baki mata $< 0$, baki tepat 1 mata dalam mod Double-Out, atau mencecah 0 tanpa Double akan membatalkan skor pusingan tersebut serta-merta dan mengembalikan skor ke asal.
   * Cadangan Laluan Penamat Dinamik (*Adaptive Checkout Suggester*): Merangkumi baki mata 2 hingga 170 kecuali nombor *Bogey* (159, 162, 163, 165, 166, 168, 169) yang secara matematik mustahil dihabiskan dengan 3 dart. Memaparkan Plan A dan Plan B.
   * Pengurusan Format Perlawanan (*Legs*): Menyokong *Single Leg*, *Best of 3*, *Best of 5*, dan *Best of 7 Legs* berserta penukaran giliran pemula pusingan secara berselang-seli.
3. **FR-003: Mod Latihan Ketepatan (Training Studio)**:
   * Pembalak lontaran sasaran bebas (*3 darts per turn*).
   * Pengiraan peratusan tepat:
     $$\text{Accuracy \%} = \left(\frac{\text{Jumlah Kena (Hits)}}{\text{Jumlah Percubaan (Attempts)}}\right) \times 100$$
   * Rutin latihan antarabangsa: *Around the Clock*, *Bob's 27*, dan *121 Checkout Challenge*.
4. **FR-004: Pengesanan Visual Kamera (Vision AI)**:
   * Pengecilan dan pemampatan gambar automatik pada pelayar ($\le 1024\text{px}$) sebelum dihantar ke pelayan.
   * Model analitis `gemini-3.8-flash` dengan skim struktur JSON (senarai 3 dart, tahap keyakinan, dan nota pengesanan).
   * Aliran semakan manusia (*Human-in-the-loop side-by-side review*) untuk membolehkan pemain menyemak atau membetulkan bacaan sebelum skor dimasukkan.
5. **FR-005: Statistik, Arkib & Sandaran Data**:
   * Penyimpanan 100% pada pelayar peranti (*Local Storage*) di bawah kunci `dartvision_v1_state`.
   * Had pemangkasan kuota keselamatan automatik (maksimum 500 rekod pusingan latihan terkini).
   * Peta haba radial (*Radial Heatmap*) berpandukan data balingan sebenar.
   * Eksport ke format fail CSV dan JSON, serta pemulihan fail JSON (*Import*).
   * Fungsi tetapan semula dua langkah (*2-step reset modal*).

---

## 3. Peraturan Perniagaan (Business Rules)

1. **Struktur Pusingan Dart**:
   * Setiap pemain melontar tepat 3 dart bagi setiap giliran kecuali jika pemain telah berjaya menamatkan baki mata (*checkout*) pada dart pertama atau kedua.
2. **Peraturan Nombor Bogey**:
   * Tiada sebarang cadangan checkout akan dipaparkan bagi nombor-nombor Bogey: `169, 168, 166, 165, 163, 162, 159` kerana tiada kombinasi 3 dart yang sah secara matematik di bawah peraturan Double-Out.
3. **Privasi & Operasi Luar Talian**:
   * Aplikasi beroperasi sepenuhnya tanpa sambungan pangkalan data awan. Tiada akaun pengguna dicipta. Gambar kamera hanya dihantar ke perkhidmatan Gemini Vision untuk pengesanan segera dan tidak disimpan pada pelayan selepas respons dihantar.

---

## 4. Kriteria Penerimaan (Acceptance Criteria)

* **AC-01 (Pengesanan Geometri)**: Menekan cincin luar nombor 20 merekodkan `D20` bernilai 40 mata; cincin tengah merekodkan `T20` bernilai 60 mata; sektor atas/bawah merekodkan `S20` bernilai 20 mata; bulatan tengah merekodkan `IB` bernilai 50 mata.
* **AC-02 (Logik Bust Double-Out)**:
  * Pemain berbaki 32 mata. Balingan: `S20` $\rightarrow$ baki 12 mata. Balingan: `S12` $\rightarrow$ baki 0 mata (Bukan Double). Sistem mencetuskan status `BUST` dan skor dipulihkan semula kepada 32 mata.
  * Pemain berbaki 20 mata. Balingan: `S19` $\rightarrow$ baki 1 mata. Sistem mencetuskan status `BUST` serta-merta kerana 1 mata mustahil diselesaikan dengan Double.
* **AC-03 (Penukaran Giliran & Pemenang Leg)**: Apabila baki mencecah tepat 0 mengikut peraturan penamat, leg tamat serta-merta. Jika belum mencapai sasaran leg penuh, leg seterusnya bermula dengan pemain seterusnya menjadi pemula balingan.
* **AC-04 (Penyimpanan Data)**: Memuat semula laman pelayar (*browser refresh*) tidak memadamkan statistik latihan atau perlawanan yang sedang berlangsung.

---

## 5. Rujukan Dokumen Asal

* Dokumen rujukan spesifikasi asal:  
  `DartVision_Score___Accuracy_Tracker_PRD_v1.0_2a943c34.pdf` (disimpan dalam arkib aset projek).
