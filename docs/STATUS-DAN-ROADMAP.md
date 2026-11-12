# Status Pembangunan & Pelan Masa Depan (Status & Roadmap)

Dokumen ini merekodkan status sebenar fungsi yang telah dibina, fungsi yang telah diuji, perkara yang belum disahkan melalui ujian lapangan, isu yang diketahui, serta perancangan penambahbaikan akan datang.

---

## 1. Ciri-ciri yang Sudah Dibina (Built Features)

* **Enjin Papan Skor X01**:
  * Pilihan markah permulaan 101, 501, dan 1001.
  * Sokongan 1 hingga 4 pemain tempatan (*Pass-and-Play*).
  * Peraturan rasmi *Double-Out* dan mod santai *Single-Out*.
  * Pengesanan batal balingan (*Bust detection*) dengan pemulihan skor automatik.
  * Pengurusan format pusingan panjang (*Best of 1, 3, 5, 7 Legs*) dengan penggiliran pemula balingan.
* **Papan Dart Interaktif Geometri WDF**:
  * Visualisasi vektor SVG resolusi tinggi dengan nisbah fizikal piawai antarabangsa.
  * Penanda pin fizikal balingan (①, ②, ③) pada permukaan papan dart.
  * Kanta pembesar sentuhan (*Touch Loupe*) untuk membantu pengguna skrin sentuh telefon.
  * Mod dwi-input: togol antara papan interaktif dan papan kekunci angka pantas (*Quick Numpad*).
* **Laluan Penamat Adaptif (Checkout Suggester)**:
  * Pengiraan laluan penamat untuk baki mata 2 hingga 170.
  * Pengecualian automatik bagi nombor-nombor Bogey.
  * Paparan laluan alternatif (*Plan B*) sekiranya dart pertama terlepas ke Single.
* **Studio Latihan Ketepatan (Training Drills)**:
  * Pembalak lontaran sasaran bebas (*Free-throw Target Log*).
  * Rutin *Around the Clock* (1 hingga 20 dan Bullseye).
  * Rutin *Bob's 27* (latihan cincin Double).
  * Rutin *121 Checkout Challenge* (menyelesaikan 121 mata dalam 9 dart).
* **Pengesanan Visual AI (Vision AI Scanner)**:
  * Tangkapan foto kamera dan pemampatan automatik pada pelayar ($\le 1024\text{px}$).
  * Analisis imej pelayan menggunakan model Google Gemini 3.8 Flash.
  * Panel semakan bersebelahan (*Side-by-Side Review*) 3 lajur untuk pembetulan mudah.
* **Statistik, Arkib & Peta Haba (Heatmap)**:
  * Peta haba radial (*Radial Heatmap*) berpandukan data balingan sebenar.
  * Jadual arkib ketepatan mengikut segmen (*Numbers, Doubles, Triples, Bullseye*).
  * Eksport rekod ke format CSV dan JSON, serta fungsi import fail JSON.
  * Pilihan tetapan semula data (*2-step permanent reset*).
  * Storan luar talian 100% pada pelayar peranti (*Local Storage*).

---

## 2. Status Ujian yang Telah Dijalankan (Tested Features)

* **Ujian Kompilasi & Kod (Build & Lint Checks)**:
  * `npm run build` dan `compile_applet`: Lulus 100% tanpa sebarang ralat sintaks atau ralat binaan Vite.
  * `tsc --noEmit` (`lint_applet`): Lulus dengan 0 ralat TypeScript.
* **Ujian Logik Matematik & Peraturan**:
  * Logik kiraan baki mata dan penolakan skor bagi setiap dart diuji.
  * Logik pengesanan Bust bagi nilai $< 0$, baki tepat 1 mata, dan baki 0 tanpa Double diuji dan disahkan.
  * Formula pengiraan peratusan ketepatan sasaran diuji.
* **Ujian Backend API & Pelayan Express**:
  * Endpoint kesihatan pelayan (`/api/health`) diuji dan mengembalikan status aktif `{"status":"ok"}`.
  * Endpoint pengesanan gambar (`/api/scan-dartboard`) diuji untuk mengendalikan permintaan kosong (menghasilkan ralat 400 yang terkawal) dan menerima pemprosesan format Base64.
* **Ujian Persistensi Storan**:
  * Operasi memuat semula laman pelayar (*browser refresh*) disahkan tidak memadamkan data perlawanan atau statistik yang tersimpan dalam `localStorage`.

---

## 3. Perkara yang Belum Disahkan Melalui Ujian Lapangan (Unverified in Field)

* **Keadaan Pencahayaan Bilik Sebenar bagi Vision AI**:
  * Pengesanan visual kamera belum diuji di bawah pencahayaan malap yang biasa didapati di pub, bar sukan, atau bilik bawah tanah.
* **Kedudukan Dart yang Bertindih (*Robin Hood / Tightly Clustered Darts*)**:
  * Ketepatan model visual belum disahkan sepenuhnya apabila dua atau tiga dart bertindih rapat pada segmen yang sama (contohnya 3 dart dalam Treble 20) di mana bayang-bayang atau bilah dart (*flights*) mungkin menutup mata jarum.
* **Ketahanan Skrin Sentuh pada Pelbagai Jenis Pelindung Skrin**:
  * Keberkesanan fungsi *Touch Loupe* belum disahkan pada peranti dengan pelindung skrin kaca tebal (*heavy-duty tempered glass*) yang mungkin menjejaskan sensitiviti titik sentuhan mikro.

---

## 4. Isu yang Diketahui (Known Issues & Limitations)

1. **Kebergantungan Internet untuk Vision AI**:
   * Walaupun aplikasi ini berfungsi 100% di luar talian untuk pengiraan skor dan statistik manual, fungsi imbasan kamera memerlukan sambungan internet untuk berkomunikasi dengan model Gemini di pelayan awan.
2. **Had Storan Pelayar Peranti**:
   * Data disimpan di dalam *Local Storage* pelayar. Sekiranya pengguna membersihkan data sejarah pelayar (*Clear Browser History / Site Data*), data permainan tempatan akan terpadam melainkan pengguna telah membuat salinan sandaran melalui fail eksport JSON.
3. **Resolusi Kamera pada Peranti Berprestasi Rendah**:
   * Peranti mudah alih lama mungkin mengalami sedikit kelambatan (*latency*) semasa fasa pemampatan gambar kanvas sebelum dihantar kepada pelayan.

---

## 5. Perancangan Penambahbaikan Seterusnya (Roadmap)

*Ciri-ciri berikut dirancang untuk fasa pembangunan akan datang tertakluk kepada keutamaan dan maklum balas komuniti:*

1. **Pengumuman Suara Pengadil PDC (*Audio PDC Caller*)**:
   * Menambah kesan bunyi suara pengadil rasmi dart (*"One Hundred and Eighty!", "Ton Forty", "Bust!", "Game Shot and the Match"*) menggunakan Web Audio API.
2. **Papan Skor Kejohanan Jarak Jauh (*Oche Broadcast Mode*)**:
   * Mod paparan khas berangka gergasi berkontras tinggi untuk memudahkan pembacaan dari garisan balingan sejauh 2.37 meter.
3. **Sokongan Papan Dart Pintar Bluetooth (*Smartboard Bluetooth Web API*)**:
   * Integrasi terus dengan perkakasan papan dart pintar yang mempunyai penderia auto-kira tanpa memerlukan sentuhan manual.
4. **Perlawanan Jarak Jauh Atas Talian (*Online Multiplayer*)**:
   * Membolehkan dua pemain di lokasi berbeza bermain perlawanan X01 secara langsung melalui perkongsian kod bilik (*Room Code*).
