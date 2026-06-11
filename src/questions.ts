/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface RiasecQuestion {
  id: number;
  text: string;
  category: string;
}

export interface IqQuestion {
  id: number;
  category: "verbal" | "numerical" | "logical" | "spatial";
  text: string;
  options: string[];
  correctIndex: number;
}

// 60 standard Holland RIASEC questions distributed evenly
export const RIASEC_QUESTIONS: RiasecQuestion[] = [
  // Realistic (R) - Prefers concrete, practical, hands-on activities
  { id: 1, text: "Saya suka merakit komponen komputer atau memperbaiki alat-alat elektronik.", category: "R" },
  { id: 7, text: "Saya menyukai tantangan berkebun atau melatih hewan peliharaan.", category: "R" },
  { id: 13, text: "Saya suka membangun model jembatan, rumah, atau benda menggunakan kayu/plastik.", category: "R" },
  { id: 19, text: "Saya lebih suka belajar dengan praktik langsung (hands-on) daripada sekadar membaca teori.", category: "R" },
  { id: 25, text: "Saya tertarik mempelajari cara kerja mesin, seperti mobil atau motor.", category: "R" },
  { id: 31, text: "Saya senang menggunakan perkakas teknis, alat gambar teknik, atau alat pertukangan.", category: "R" },
  { id: 37, text: "Saya suka melakukan aktivitas fisik di luar ruangan seperti berkemah atau survei lapangan.", category: "R" },
  { id: 43, text: "Saya menikmati instalasi perangkat lunak atau perakitan fisik jaringan internet.", category: "R" },
  { id: 49, text: "Saya bangga menghasilkan barang yang memiliki fungsi fisik, seperti kerajinan atau furnitur.", category: "R" },
  { id: 55, text: "Saya tertarik bekerja di bidang manufaktur, teknik sipil, atau logistik luar ruangan.", category: "R" },

  // Investigative (I) - Analytical, intellectual, scientific explore
  { id: 2, text: "Saya suka melakukan eksperimen sains atau memecahkan soal matematika yang rumit.", category: "I" },
  { id: 8, text: "Saya gemar membaca artikel ilmiah terbaru, biologi, astronomi, atau fisika dasar.", category: "I" },
  { id: 14, text: "Saya suka menganalisis data atau mencari tahu penyebab dari suatu kejadian.", category: "I" },
  { id: 20, text: "Saya senang memikirkan teori-teori filosofis atau abstraksi ilmiah di waktu luang.", category: "I" },
  { id: 26, text: "Saya tertarik mempelajari kalkulator grafik atau rumus statistik tingkat lanjut.", category: "I" },
  { id: 32, text: "Saya penasaran bagaimana obat-obatan bekerja dalam sel darah manusia.", category: "I" },
  { id: 38, text: "Saya betah menghabiskan waktu berjam-jam meneliti sejarah arkeologi atau peta dunia.", category: "I" },
  { id: 44, text: "Saya gemar berdiskusi tentang bagaimana teknologi kecerdasan buatan (AI) diprogram.", category: "I" },
  { id: 50, text: "Saya menyukai investigasi hipotesis dan pembuktian logika dalam sains dan sosiologi.", category: "I" },
  { id: 56, text: "Saya ingin meneliti penyakit langka atau mengembangkan energi baru ramah lingkungan.", category: "I" },

  // Artistic (A) - Expressive, creative, intuitive, non-conforming
  { id: 3, text: "Saya suka melukis, menggambar sketsa, atau mengedit foto dengan software grafis.", category: "A" },
  { id: 9, text: "Saya senang menulis puisi, cerpen, skenario drama, atau tulisan esai opini.", category: "A" },
  { id: 15, text: "Saya menikmati bermain alat musik, menyanyi, atau mengomposisi lagu sendiri.", category: "A" },
  { id: 21, text: "Saya suka mendekorasi ruangan, menggabungkan warna, atau mendesain busana.", category: "A" },
  { id: 27, text: "Saya menyukai teater, pertunjukan akting, atau pembuatan koreografi tari.", category: "A" },
  { id: 33, text: "Saya lebih suka mengerjakan tugas sekolah dengan kreativitas tinggi dibanding metode baku.", category: "A" },
  { id: 39, text: "Saya tertarik mempelajari desain lanskap perkotaan yang estetik dan kreatif.", category: "A" },
  { id: 45, text: "Saya senang menonton film-film independen atau menghadiri pameran seni kontemporer.", category: "A" },
  { id: 51, text: "Seni digital dan pembuatan konten video sinematik adalah hal yang menarik bagi saya.", category: "A" },
  { id: 57, text: "Saya ingin berprofesi di bidang kreatif seperti desainer, animator, atau arsitek.", category: "A" },

  // Social (S) - Friendly, helping, cooperative, educational
  { id: 4, text: "Saya sangat senang membantu teman menjelaskan materi pelajaran yang tidak mereka pahami.", category: "S" },
  { id: 10, text: "Saya senang mendengarkan curhatan teman dan membantu mereka menemukan jalan keluar masalahnya.", category: "S" },
  { id: 16, text: "Saya menikmati kegiatan sukarela, bakti sosial, atau penggalangan dana bagi yang membutuhkan.", category: "S" },
  { id: 22, text: "Saya tertarik mempelajari psikologi manusia dan hubungan sosial antarmasyarakat.", category: "S" },
  { id: 28, text: "Saya senang bekerja dalam tim untuk mendampingi atau merawat lanskap komunitas.", category: "S" },
  { id: 34, text: "Saya suka melatih anak kecil, seperti mengajari membaca atau membina kepramukaan.", category: "S" },
  { id: 40, text: "Saya senang menjalin hubungan akrab dan mengobrol secara mendalam dengan orang baru.", category: "S" },
  { id: 46, text: "Saya peduli dengan isu-isu kemanusiaan global dan pemberdayaan anak-anak asuh.", category: "S" },
  { id: 52, text: "Saya menikmati pekerjaan di konseling kelompok, layanan medis darurat, atau keguruan.", category: "S" },
  { id: 58, text: "Saya ingin mengabdikan diri di bidang pendidikan, psikologi, sosiologi, atau kesehatan.", category: "S" },

  // Enterprising (E) - Outgoing, persuasive, leading, driving
  { id: 5, text: "Saya suka memimpin diskusi kelompok atau mengorganisasi acara kelas di sekolah.", category: "E" },
  { id: 11, text: "Saya gemar berjualan produk secara online, merancang bisnis, atau menawarkan ide.", category: "E" },
  { id: 17, text: "Saya berani berbicara di atas podium di hadapan ratusan audiens dengan percaya diri.", category: "E" },
  { id: 23, text: "Saya tertantang untuk menegosiasikan kesepakatan atau harga demi keuntungan bersama.", category: "E" },
  { id: 29, text: "Saya suka memotivasi orang lain untuk mencapai target atau memenangkan kompetisi.", category: "E" },
  { id: 35, text: "Saya senang berdebat tentang topik politik, hukum, atau strategi ekonomi terkini.", category: "E" },
  { id: 41, text: "Saya suka memikirkan cara mempromosikan produk agar dibeli oleh banyak orang.", category: "E" },
  { id: 47, text: "Saya bermimpi mendirikan usaha rintisan (startup) dan memiliki tim sendiri.", category: "E" },
  { id: 53, text: "Saya suka mengambil risiko kompetitif demi mencapai posisi teratas dalam organisasi.", category: "E" },
  { id: 59, text: "Saya tertarik dengan dunia penyiaran, manajemen pemasaran, hukum, atau bisnis korporasi.", category: "E" },

  // Conventional (C) - Organized, systemic, detailing, accounting
  { id: 6, text: "Saya sangat senang merapikan data, daftar inventaris barang, atau file digital.", category: "C" },
  { id: 12, text: "Saya jeli dalam mengelola pencatatan pemasukan dan pengeluaran uang kas kelas.", category: "C" },
  { id: 18, text: "Saya merasa nyaman bekerja mengikuti aturan terstruktur, SOP, dan jadwal yang ketat.", category: "C" },
  { id: 24, text: " Saya menikmati mengetik dokumen laporan dengan format tabel, grafik, dan tata bahasa rapi.", category: "C" },
  { id: 30, text: "Saya paling benci jika ada kesalahan kecil atau ketidaktelitian dalam tumpukan dokumen.", category: "C" },
  { id: 36, text: "Saya senang membuat jadwal harian yang sangat terperinci dan memastikan semua terlaksana.", category: "C" },
  { id: 42, text: "Saya suka menyusun database, spreadsheet Excel dengan berbagai rumus dasar.", category: "C" },
  { id: 48, text: "Saya tertarik dengan administrasi perkantoran, sistem sirkulasi surat, atau perpustakaan.", category: "C" },
  { id: 54, text: "Saya suka melakukan kroscek catatan transaksi keuangan untuk memastikan keakuratan saldo.", category: "C" },
  { id: 60, text: "Saya bercita-cita berprofesi di bidang administrasi, akuntansi perpajakan, atau arsiparis.", category: "C" }
].sort((a, b) => a.id - b.id); // Sorted by ID so they are evenly distributed Realistic-Investigative-Artistic...


// 80 Standardized IQ Simulation questions (20 Verbal, 20 Numerical, 20 Logical, 20 Spatial)
export const IQ_QUESTIONS: IqQuestion[] = [
  // --- VERBAL REASONING (Q1 - Q20) ---
  {
    id: 1,
    category: "verbal",
    text: "Padanan kata (Analogi): PANTAI : RESOR = GUNUNG : ...",
    options: ["Bukit", "Cottage / Vila", "Pendaki", "Hutan"],
    correctIndex: 1
  },
  {
    id: 2,
    category: "verbal",
    text: "Sinonim (Persamaan Kata): DEHIDRASI",
    options: ["Kekurangan mineral", "Kelebihan cairan", "Kekurangan cairan", "Pelepasan uap"],
    correctIndex: 2
  },
  {
    id: 3,
    category: "verbal",
    text: "Antonim (Lawan Kata): MOBILITAS",
    options: ["Imobilitas / Kepekatan", "Keaktifan", "Statis / Keajekan", "Kekakuan"],
    correctIndex: 2
  },
  {
    id: 4,
    category: "verbal",
    text: "Analogi: KOMPOR : API = KIPAS ANGIN : ...",
    options: ["Listrik", "Dingin", "Baling-baling", "Angin"],
    correctIndex: 3
  },
  {
    id: 5,
    category: "verbal",
    text: "Pilih kata yang TIDAK termasuk dalam kelompoknya (Ganjil):",
    options: ["Geologi", "Astronomi", "Astrologi", "Paleontologi"],
    correctIndex: 2 // Astrologi is pseudo-science, the others are scientific fields
  },
  {
    id: 6,
    category: "verbal",
    text: "Sinonim: ITERASI",
    options: ["Interaksi", "Pengulangan", "Identifikasi", "Integrasi"],
    correctIndex: 1
  },
  {
    id: 7,
    category: "verbal",
    text: "Antonim: PROPOSISI",
    options: ["Oposisi", "Saran", "Konklusi", "Teori"],
    correctIndex: 0
  },
  {
    id: 8,
    category: "verbal",
    text: "Analogi: PENYAIR : PUISI = APOTEKER : ...",
    options: ["Pasien", "Rumah Sakit", "Resep / Obat", "Dokter"],
    correctIndex: 2
  },
  {
    id: 9,
    category: "verbal",
    text: "Pilih kata ganjil (Out of group):",
    options: ["Kepala", "Leher", "Otak", "Tangan"],
    correctIndex: 2 // Otak is internal organ, others are external body parts
  },
  {
    id: 10,
    category: "verbal",
    text: "Sinonim: ASUMSI",
    options: ["Fakta", "Hipotesis / Anggapan", "Kesimpulan", "Perdebatan"],
    correctIndex: 1
  },
  {
    id: 11,
    category: "verbal",
    text: "Antonim: JUMHUD (Inersia/Statis)",
    options: ["Dinamis", "Konsisten", "Pasif", "Tradisional"],
    correctIndex: 0
  },
  {
    id: 12,
    category: "verbal",
    text: "Analogi: AIR : HAUS = MAKANAN : ...",
    options: ["Piring", "Lapar", "Kekenyangan", "Memasak"],
    correctIndex: 1
  },
  {
    id: 13,
    category: "verbal",
    text: "Pilih kata ganjil:",
    options: ["Semarang", "Yogyakarta", "Surabaya", "Bandung"],
    correctIndex: 1 // DI Yogyakarta is a Special Region capital, others are provincial capitals in Java, or DI vs Propinsi
  },
  {
    id: 14,
    category: "verbal",
    text: "Sinonim: KONSENSUS",
    options: ["Perdebatan", "Kesepakatan", "Pertentangan", "Konsekuensi"],
    correctIndex: 1
  },
  {
    id: 15,
    category: "verbal",
    text: "Antonim: EFEMER (Sementara/Sesaat)",
    options: ["Abadi / Kekal", "Singkat", "Bahagia", "Duniawi"],
    correctIndex: 0
  },
  {
    id: 16,
    category: "verbal",
    text: "Analogi: DRIVER : MOBIL = PILOT : ...",
    options: ["Masinis", "Rel", "Pesawat", "Navigasi"],
    correctIndex: 2
  },
  {
    id: 17,
    category: "verbal",
    text: "Pilih kata ganjil:",
    options: ["Rupiah", "Yen", "Emas", "Dollar"],
    correctIndex: 2 // Currency names vs precious metal commodity
  },
  {
    id: 18,
    category: "verbal",
    text: "Sinonim: PRAGMATIS",
    options: ["Teoretis", "Praktis", "Idealis", "Khayalan"],
    correctIndex: 1
  },
  {
    id: 19,
    category: "verbal",
    text: "Antonim: KHIDMAT",
    options: ["Resmi", "Khusyuk", "Gaduh / Tidak Hormat", "Serius"],
    correctIndex: 2
  },
  {
    id: 20,
    category: "verbal",
    text: "Analogi: SISWA : RAPOR = KARYAWAN : ...",
    options: ["Gaji", "Evaluasi Kinerja / KPI", "Seragam", "Atasan"],
    correctIndex: 1
  },

  // --- NUMERICAL REASONING (Q21 - Q40) ---
  {
    id: 21,
    category: "numerical",
    text: "Lanjutkan deret angka ini: 3, 6, 12, 24, 48, ...",
    options: ["60", "72", "96", "100"],
    correctIndex: 2 // Rule: *2
  },
  {
    id: 22,
    category: "numerical",
    text: "Lanjutkan deret angka ini: 100, 95, 85, 70, 50, ...",
    options: ["40", "30", "25", "20"],
    correctIndex: 2 // Rule: -5, -10, -15, -20, -25 -> 50 - 25 = 25
  },
  {
    id: 23,
    category: "numerical",
    text: "Berapakah hasil dari 15% dari 400 dijumlahkan dengan 25% dari 240?",
    options: ["100", "110", "120", "130"],
    correctIndex: 2 // 15%*400 = 60; 25%*240 = 60. 60+60 = 120
  },
  {
    id: 24,
    category: "numerical",
    text: "Jika x + 4 = 3x - 8, berapakah nilai x?",
    options: ["4", "5", "6", "8"],
    correctIndex: 2 // 2x = 12 -> x = 6
  },
  {
    id: 25,
    category: "numerical",
    text: "Lanjutkan deret: 2, 3, 5, 8, 12, 17, ...",
    options: ["21", "22", "23", "24"],
    correctIndex: 2 // Rule: +1, +2, +3, +4, +5, +6 -> 17 + 6 = 23
  },
  {
    id: 26,
    category: "numerical",
    text: "Sebuah mobil berjalan 180 km dalam waktu 3 jam. Berapa menit waktu yang dibutuhkan untuk berjalan sejauh 90 km dengan laju yang sama?",
    options: ["60 menit", "90 menit", "100 menit", "120 menit"],
    correctIndex: 1 // Laju = 60 km/jam. 90 km butuh 1.5 jam = 90 menit.
  },
  {
    id: 27,
    category: "numerical",
    text: "Jika 5 pekerja dapat membangun pagar dalam 12 hari, berapa hari yang dibutuhkan jika dikerjakan oleh 10 pekerja?",
    options: ["4 hari", "5 hari", "6 hari", "8 hari"],
    correctIndex: 2 // (5 * 12) / 10 = 6 hari
  },
  {
    id: 28,
    category: "numerical",
    text: "Lanjutkan deret: 1, 4, 9, 16, 25, 36, ...",
    options: ["40", "45", "49", "64"],
    correctIndex: 2 // Squares: 1^2, 2^2, 3^2, 4^2, 5^2, 6^2, 7^2 = 49
  },
  {
    id: 29,
    category: "numerical",
    text: "Berapakah nilai dari (8 * 9) / 2 + 14 - 3?",
    options: ["37", "47", "42", "45"],
    correctIndex: 1 // 72 / 2 = 36 + 14 = 50 - 3 = 47
  },
  {
    id: 30,
    category: "numerical",
    text: "Jika rata-rata dari empat bilangan adalah 8, dan tiga di antaranya adalah 5, 9, dan 11, berapakah bilangan keempat?",
    options: ["6", "7", "8", "9"],
    correctIndex: 1 // Total sum = 4 * 8 = 32. Sum of 3 = 5 + 9 + 11 = 25. 4th = 32 - 25 = 7.
  },
  {
    id: 31,
    category: "numerical",
    text: "Lanjutkan deret: 1, 3, 4, 7, 11, 18, ...",
    options: ["22", "29", "25", "36"],
    correctIndex: 1 // Fibonacci-like sequence: 1+3=4, 3+4=7, 4+7=11, 7+11=18, 11+18=29
  },
  {
    id: 32,
    category: "numerical",
    text: "Sebuah toko pakaian memberikan diskon ganda 20% + 10%. Berapakah total diskon yang sebenarnya dinikmati konsumen?",
    options: ["30%", "28%", "25%", "22%"],
    correctIndex: 1 // Price becomes 0.8 * 0.9 = 0.72 (diskon = 28%)
  },
  {
    id: 33,
    category: "numerical",
    text: "Jika 3y = 27 dan x + y = 14, berapakah nilai x?",
    options: ["3", "5", "7", "9"],
    correctIndex: 1 // y = 9 -> x + 9 = 14 -> x = 5
  },
  {
    id: 34,
    category: "numerical",
    text: "Lanjutkan deret: 8, 4, 12, 6, 18, 9, ...",
    options: ["20", "25", "27", "30"],
    correctIndex: 2 // Rule: /2 , *3. 9 * 3 = 27
  },
  {
    id: 35,
    category: "numerical",
    text: "Harga sebuah buku diturunkan sebesar 20%, menjadi Rp 40.000,-. Berapakah harga buku tersebut sebelum diskon?",
    options: ["Rp 45.000", "Rp 48.000", "Rp 50.000", "Rp 60.000"],
    correctIndex: 2 // 0.8 * Original = 40,000 -> Original = 50,000
  },
  {
    id: 36,
    category: "numerical",
    text: "Berapakah sisa hasil bagi jika 127 dibagi 5?",
    options: ["1", "2", "3", "4"],
    correctIndex: 1 // 127 = 25 * 5 + 2
  },
  {
    id: 37,
    category: "numerical",
    text: "Lanjutkan deret: 12, 13, 15, 18, 22, ...",
    options: ["26", "27", "28", "25"],
    correctIndex: 1 // Rule: +1, +2, +3, +4, +5 -> 22+5 = 27
  },
  {
    id: 38,
    category: "numerical",
    text: "Jika nilai ujian Matematika Ali, Budi, dan Cici masing-masing adalah 70, 85, dan 90. Berapakah rata-rata nilai mereka?",
    options: ["78.5", "80", "81.67", "85"],
    correctIndex: 2 // Sum = 245. 245 / 3 = 81.67
  },
  {
    id: 39,
    category: "numerical",
    text: "Selesaikan persamaan: 2^(2x-1) = 8. Berapa nilai x?",
    options: ["1", "1.5", "2", "2.5"],
    correctIndex: 2 // 2^(2x-1) = 2^3 -> 2x-1 = 3 -> 2x = 4 -> x = 2
  },
  {
    id: 40,
    category: "numerical",
    text: "Lanjutkan deret: 1, 2, 6, 24, 120, ...",
    options: ["240", "480", "600", "720"],
    correctIndex: 3 // Factorials or multiplying by next index: *2, *3, *4, *5, *6 -> 120 * 6 = 720
  },

  // --- LOGICAL REASONING (Q41 - Q60) ---
  {
    id: 41,
    category: "logical",
    text: "Semua mamalia bernapas dengan paru-paru. Lumba-lumba adalah mamalia. Jadi, ...",
    options: [
      "Lumba-lumba tidak bernapas dengan paru-paru",
      "Lumba-lumba bernapas dengan paru-paru",
      "Ada lumba-lumba yang tidak bernapas dengan paru-paru",
      "Lumba-lumba bernapas di laut saja"
    ],
    correctIndex: 1
  },
  {
    id: 42,
    category: "logical",
    text: "Beberapa siswa Sekolah Cendekia BAZNAS menyukai olahraga beladiri Silat. Semua yang menyukai Silat berstamina tinggi. Kesimpulan:",
    options: [
      "Semua siswa Sekolah Cendekia BAZNAS berstamina tinggi",
      "Beberapa siswa Sekolah Cendekia BAZNAS berstamina tinggi",
      "Siswa yang berstamina tinggi pasti menyukai Silat saja",
      "Tidak ada siswa berstamina tinggi di Sekolah Cendekia BAZNAS"
    ],
    correctIndex: 1
  },
  {
    id: 43,
    category: "logical",
    text: "Jika hari hujan, maka jalanan menjadi licin. Hari ini jalanan licin. Kesimpulan:",
    options: [
      "Hari ini pasti hujan",
      "Hari ini tidak hujan",
      "Tidak dapat ditarik kesimpulan mutlak bahwa hari ini hujan",
      "Jalanan licin karena oli saja"
    ],
    correctIndex: 2 // Affirming the consequent is a logical fallacy, so no absolute conclusion
  },
  {
    id: 44,
    category: "logical",
    text: "Semua pengurus OSIS adalah siswa yang disiplin. Sebagian siswa kelas 10 adalah pengurus OSIS. Kesimpulan:",
    options: [
      "Semua siswa kelas 10 adalah siswa yang disiplin",
      "Sebagian siswa kelas 10 adalah siswa yang disiplin",
      "Sebagian pengurus OSIS tidak disiplin",
      "Siswa yang disiplin pastilah anak kelas 10"
    ],
    correctIndex: 1
  },
  {
    id: 45,
    category: "logical",
    text: "Pilihlah kesimpulan yang logis: Jika belajar giat, maka lulus SNBP. Jika lulus SNBP, maka orang tua bangga. Kesimpulannya:",
    options: [
      "Jika belajar giat, maka orang tua bangga",
      "Jika tidak belajar giat, maka orang tua bangga",
      "Orang tua bangga hanya jika tidak lulus SNBP",
      "Belajar giat tidak mempengaruhi kebanggaan orang tua"
    ],
    correctIndex: 0
  },
  {
    id: 46,
    category: "logical",
    text: "Semua buah manis kaya akan vitamin C. Sebagian buah manis tidak disukai anak-anak. Kesimpulan:",
    options: [
      "Semua buah kaya vitamin C disukai anak-anak",
      "Sebagian buah kaya vitamin C tidak disukai anak-anak",
      "Tidak ada buah manis yang disukai anak-anak",
      "Buah masam tidak kaya vitamin C"
    ],
    correctIndex: 1
  },
  {
    id: 47,
    category: "logical",
    text: "Andi lebih tinggi daripada Budi. Budi lebih tinggi daripada Cici. Siapakah yang berbadan paling pendek?",
    options: ["Andi", "Budi", "Cici", "Andi dan Cici sama tinggi"],
    correctIndex: 2
  },
  {
    id: 48,
    category: "logical",
    text: "Semua guru Sekolah Cendekia BAZNAS adalah pendidik yang sabar. Pak Ahmad adalah guru di sekolah itu. Kesimpulan:",
    options: [
      "Pak Ahmad pendidik yang tidak sabar",
      "Pak Ahmad bukan pendidik",
      "Pak Ahmad adalah pendidik yang sabar",
      "Tidak ada guru yang sabar selain Pak Ahmad"
    ],
    correctIndex: 2
  },
  {
    id: 49,
    category: "logical",
    text: "Jika seseorang memenangkan beasiswa tahfidz, maka ia hafal minimal 10 juz Al-Quran. Zaid hafal 15 juz Al-Quran. Kesimpulan:",
    options: [
      "Zaid pasti memenangkan beasiswa tahfidz",
      "Zaid berhak memenangkan / mendaftar beasiswa tahfidz karena memenuhi syarat utama",
      "Zaid tidak berhak mendapatkan beasiswa tahfidz",
      "Beasiswa tahfidz hanya untuk Zaid"
    ],
    correctIndex: 1
  },
  {
    id: 50,
    category: "logical",
    text: "Beberapa komputer di laboratorium adalah jenis Chromebook. Semua Chromebook harus tersambung ke koneksi cloud sekolah. Kesimpulan:",
    options: [
      "Semua komputer laboratorium harus tersambung ke cloud",
      "Beberapa komputer laboratorium harus tersambung ke cloud sekolah",
      "Tidak ada komputer laboratorium yang memerlukan koneksi cloud",
      "Semua Chromebook rusak"
    ],
    correctIndex: 1
  },
  {
    id: 51,
    category: "logical",
    text: "Jika nilai rapor Matematika dan Bahasa Inggris di atas 85, maka peluang SNBP tinggi. Rapor Matematika Rian 88 dan Bahasa Inggrisnya 90. Maka peluang SNBP Rian:",
    options: ["Potensial/Tinggi", "Sangat Rendah", "Nol", "Pasti gagal karena mapel lain"],
    correctIndex: 0
  },
  {
    id: 52,
    category: "logical",
    text: "Semua mahasiswa teknik harus menguasai aljabar linier. Farhan menguasai aljabar linier. Kesimpulan:",
    options: [
      "Farhan adalah mahasiswa teknik",
      "Farhan bukan mahasiswa teknik",
      "Tidak dapat dipastikan mutlak bahwa Farhan adalah mahasiswa teknik",
      "Hanya mahasiswa teknik yang menguasai aljabar"
    ],
    correctIndex: 2
  },
  {
    id: 53,
    category: "logical",
    text: "Ahmad, Bagus, dan Choirul tinggal di kota yang berbeda: Jakarta, Bogor, dan Bekasi. Ahmad tidak tinggal di Jakarta. Bagus tinggal di Bekasi. Di mana kota tempat tinggal Choirul?",
    options: ["Bogor", "Jakarta", "Bekasi", "Bekasi atau Bogor"],
    correctIndex: 1 // Bagus Bekasi, Ahmad Bogor (since not Jakarta), Choirul Jakarta
  },
  {
    id: 54,
    category: "logical",
    text: "Jika hari ini Sabtu, maka santri diperbolehkan pulang bermalam (pulkam). Hari ini santri tidak diperbolehkan pulkam. Kesimpulan:",
    options: ["Hari ini sabtu", "Hari ini bukan Sabtu", "Hari ini minggu", "Hari ini hari libur umum"],
    correctIndex: 1
  },
  {
    id: 55,
    category: "logical",
    text: "Sebagian santri adalah penghafal Al-Quran (Hafiz). Semua Hafiz memiliki konsentrasi tinggi. Kesimpulan:",
    options: [
      "Konsentrasi tinggi hanya dimiliki santri",
      "Semua santri memiliki konsentrasi tinggi",
      "Sebagian santri memiliki konsentrasi tinggi",
      "Sebagian Hafiz tidak berkosentrasi"
    ],
    correctIndex: 2
  },
  {
    id: 56,
    category: "logical",
    text: "Semua mobil listrik berdaya baterai. Beberapa kendaraan yang parkir di lobi berdaya baterai. Kesimpulan:",
    options: [
      "Semua yang parkir di lobi adalah mobil listrik",
      "Beberapa kendaraan yang parkir di lobi adalah mobil listrik",
      "Beberapa kendaraan yang parkir di lobi bukanlah mobil listrik",
      "Tidak ada mobil listrik di tempat parkir"
    ],
    correctIndex: 1
  },
  {
    id: 57,
    category: "logical",
    text: "Buku fiksi adalah buku imajinatif. Cerpen adalah salah satu bentuk buku fiksi. Jadi, cerpen adalah ...",
    options: ["Karya ilmiah", "Karangan imajinatif", "Bukan fiksi", "Buku teks sejarah akademik"],
    correctIndex: 1
  },
  {
    id: 58,
    category: "logical",
    text: "Jika lampu menyala merah, semua pengemudi harus berhenti. Lampu di simpang tiga menyala merah. Berarti:",
    options: [
      "Semua pengemudi boleh terus jalan",
      "Semua pengemudi di simpang tiga harus berhenti",
      "Hanya motor yang boleh jalan",
      "Lampu sedang bermasalah"
    ],
    correctIndex: 1
  },
  {
    id: 59,
    category: "logical",
    text: "Semua atlet profesional merawat pola makannya secara ketat. Sebagian perenang adalah atlet profesional. Maka, ...",
    options: [
      "Semua perenang merawat pola makan secara ketat",
      "Sebagian perenang merawat pola makan secara ketat",
      "Tidak ada perenang yang merawat pola makan",
      "Atlet profesional tidak suka berenang"
    ],
    correctIndex: 1
  },
  {
    id: 60,
    category: "logical",
    text: "Sebuah kotak berisi kelereng Merah, Biru, dan Hijau. Jika kelereng Merah diambil, sisa kelereng hanya Biru dan Hijau. Jika kelereng Biru tidak ada, maka kelereng yang tersisa adalah kelereng ...",
    options: ["Merah dan Hijau", "Merah dan Biru", "Hijau saja", "Satu kelereng acak"],
    correctIndex: 0
  },

  // --- SPATIAL REASONING (Q61 - Q80) ---
  {
    id: 61,
    category: "spatial",
    text: "Visualisasi Mental: Bayangkan sebuah kubus bersisi 6 warna berbeda. Jika sisi depan berwarna Biru, sisi belakang Hijau, dan sisi atas Merah, apa warna sisi bawah jika berlawanan tepat dengan sisi atas?",
    options: ["Merah", "Hijau", "Sisi berlawanan dari Merah", "Kuning (Jika ditandai berlawanan dari atas)"],
    correctIndex: 2
  },
  {
    id: 62,
    category: "spatial",
    text: "Pemberat Kertas: Sebuah kertas berbentuk lingkaran dilipat menjadi dua (setengah lingkaran), lalu dilipat sekali lagi (seperempat lingkaran), kemudian dilubangi di satu sudut pusat lipatan. Saat dibuka kembali, ada berapa lubang yang terbentuk?",
    options: ["1 lubang di tengah", "2 lubang", "4 lubang", "Tidak ada lubang sama sekali"],
    correctIndex: 0 // Deep center fold punched = 1 single clean hole centered
  },
  {
    id: 63,
    category: "spatial",
    text: "Rotasi 2D: Manakah huruf berikut yang jika diputar 180 derajat tetap terbaca sama persis?",
    options: ["P", "E", "N", "K"],
    correctIndex: 2 // Rotated N is still N
  },
  {
    id: 64,
    category: "spatial",
    text: "Tinjauan Jaring-jaring: Jaring-jaring limas segi empat terdiri atas sejumlah bidang datar. Bidang tersebut adalah...",
    options: ["5 segitiga", "1 persegi dan 4 segitiga", "1 persegi panjang dan 2 segitiga", "4 persegi"],
    correctIndex: 1
  },
  {
    id: 65,
    category: "spatial",
    text: "Pencerminan: Jika kata 'KULIAH' dicerminkan secara vertikal (cermin di sebelah kanan kata), kata hasil cerminan tersebut diawali oleh bayangan huruf apa?",
    options: ["Huruf K terbalik", "Huruf H terbalik/simetris", "Huruf A", "Huruf L terbalik"],
    correctIndex: 1 // For horizontal flip, K-U-L-I-A-H mirrored has H on the very left side (start of mirror image)
  },
  {
    id: 66,
    category: "spatial",
    text: "Sirkulasi Sudut: Sebuah panah menunjuk ke arah UTARA. Jika panah diputar 225 derajat searah jarum jam, panah sekarang menunjuk ke arah mana?",
    options: ["Tenggara", "Barat Daya", "Barat Laut", "Selatan"],
    correctIndex: 1 // 180 deg is South, +45 is South-West (Barat Daya)
  },
  {
    id: 67,
    category: "spatial",
    text: "Menyamakan Pola: Dari pasangan berikut, mana bentuk siluet 3D yang simetris sempurna di sumbu X, Y, maupun Z?",
    options: ["Silinder", "Piramida", "Bola (Sphere)", "Kerucut (Cone)"],
    correctIndex: 2
  },
  {
    id: 68,
    category: "spatial",
    text: "Penggabungan Bentuk: Gabungkan dua segitiga siku-siku sama kaki dengan mempertemukan sisi miringnya. Bangun baru apakah yang terbentuk?",
    options: ["Persegi Panjang", "Persegi / Bujur Sangkar", "Jajargenjang", "Segitiga Sama Sisi"],
    correctIndex: 1
  },
  {
    id: 69,
    category: "spatial",
    text: "Jumlah Sisi: Berapakah total jumlah wajah/sisi luar (faces) dari sebuah prisma segitiga?",
    options: ["4 sisi", "5 sisi", "6 sisi", "8 sisi"],
    correctIndex: 1 // 2 triangular bases + 3 rectangular side faces = 5 sides
  },
  {
    id: 70,
    category: "spatial",
    text: "Sudut Pandang Atlas: Jika sebuah silinder dilihat tegak lurus tepat dari arah atas, ia akan terlihat berupa bangun datar apa?",
    options: ["Persegi", "Persegi panjang", "Lingkaran", "Trapesium"],
    correctIndex: 2
  },
  {
    id: 71,
    category: "spatial",
    text: "Pencerminan vertikal huruf: Manakah dari huruf KAPITAL berikut yang memiliki simetri lipat vertikal sempurna (mempunyai bentuk persis sama jika dicerminkan kiri-kanan)?",
    options: ["B", "E", "M", "S"],
    correctIndex: 2 // M is vertically symmetric
  },
  {
    id: 72,
    category: "spatial",
    text: "Pencerminan horizontal huruf: Manakah huruf KAPITAL berikut yang memiliki simetri lipat horizontal sempurna (mempunyai bentuk persis sama jika dicerminkan atas-bawah)?",
    options: ["A", "D", "Y", "N"],
    correctIndex: 1 // D is horizontally symmetric (top half folds down matching bottom half)
  },
  {
    id: 73,
    category: "spatial",
    text: "Pembelahan Blok: Sebuah kubus kayu dengan rusuk 3 cm dicat merah pada seluruh permukaan luarnya. Lalu kubus dipotong-potong menjadi kubus kecil berukuran 1x1x1 cm. Berapa banyak kubus kecil yang tidak terkena cat sama sekali?",
    options: ["1 kubus", "4 kubus", "8 kubus", "9 kubus"],
    correctIndex: 0 // Core inner cube (3-2)^3 = 1^3 = 1 cube
  },
  {
    id: 74,
    category: "spatial",
    text: "Potongan lipat: Kertas persegi dilipat serong membentuk segitiga, kemudian dilipat lagi menjadi segitiga lebih kecil. Jika salah satu sisi terpanjang digunting melengkung kecil, akan terbentuk pola apa setelah kertas dibuka penuh?",
    options: ["Bunga melingkar", "Sebuah lingkaran berlubang di tengah", "Pola potongan berlian di empat sudut luar", "Pola kelopak di bagian tengah tepi tepi lipatan"],
    correctIndex: 3
  },
  {
    id: 75,
    category: "spatial",
    text: "Rotasi Kompleks: Jika pola jarum jam berputar 90 derajat berlawanan arah jarum jam, maka jarum yang tadinya menunjuk angka 3 akan menunjuk angka...",
    options: ["6", "9", "12", "1"],
    correctIndex: 2 // 3 is on the right, rotating CCW 90 deg makes it top = 12
  },
  {
    id: 76,
    category: "spatial",
    text: "Jaring-jaring Kubus: Berapa banyak kotak persegi kecil yang menyusun kerangka jaring-jaring kubus?",
    options: ["4 kotak", "5 kotak", "6 kotak", "8 kotak"],
    correctIndex: 2
  },
  {
    id: 77,
    category: "spatial",
    text: "Wajah Siluet: Jika sebuah kerucut (cone) dipotong melintang secara sejajar dengan alasnya, maka penampang potongannya berbentuk...",
    options: ["Elips", "Lingkaran", "Segitiga", "Persegi Panjang"],
    correctIndex: 1
  },
  {
    id: 78,
    category: "spatial",
    text: "Menghitung Sudut: Suatu segitiga memiliki dua sudut senilai 45 derajat dan 45 derajat. Bentuk segitiga ini adalah...",
    options: ["Segitiga Sama Kaki", "Segitiga Siku-Siku Sama Kaki", "Segitiga Sama Sisi", "Segitiga Sembarang"],
    correctIndex: 1 // 45+45=90, so the third angle is 90 -> Siku-siku sama kaki
  },
  {
    id: 79,
    category: "spatial",
    text: "Jumlah Rusuk: Berapakah jumlah rusuk (edges) dari sebuah prisma segi enam beraturan (hexagonal prism)?",
    options: ["12 rusuk", "16 rusuk", "18 rusuk", "24 rusuk"],
    correctIndex: 2 // 6 top base + 6 bottom base + 6 vertical = 18 edges
  },
  {
    id: 80,
    category: "spatial",
    text: "Pengenalan Hubungan Bentuk: Sumbu roda mobil dapat digambarkan secara spasial berbentuk silinder. Bagian roda tersambung pada ujung sumbu dan berbentuk lingkaran datar tebal (silinder pipih). Sudut orientasi roda terhadap sumbu silinder adalah...",
    options: ["0 derajat (sejajar)", "45 derajat", "90 derajat (tegak lurus)", "180 derajat"],
    correctIndex: 2
  }
];

export interface GayaBelajarQuestion {
  id: number;
  text: string;
  category: "V" | "A" | "K";
}

export const GAYA_BELAJAR_QUESTIONS: GayaBelajarQuestion[] = [
  // Visual (V)
  { id: 1, text: "Saya lebih mudah memahami materi jika pelajaran ditayangkan dalam bentuk video, animasi, atau slide presentasi berwarna.", category: "V" },
  { id: 2, text: "Ketika membaca buku, saya sering memperhatikan gambar, grafik, atau diagram terlebih dahulu sebelum teksnya.", category: "V" },
  { id: 3, text: "Saya lebih suka mencatat dengan peta pikiran (mind mapping) atau menggunakan banyak spidol warna-warni (stabilo).", category: "V" },
  { id: 4, text: "Saya mudah mengingat wajah seseorang, tetapi seringkali lupa dengan nama mereka jika baru pertama kali berkenalan.", category: "V" },
  { id: 5, text: "Saya lebih menyukai instruksi tertulis yang jelas daripada instruksi lisan atau suara yang panjang lebar.", category: "V" },
  { id: 6, text: "Di dalam kelas asrama, saya lebih fokus jika bisa duduk di barisan depan agar bisa melihat langsung papan tulis secara jelas.", category: "V" },
  { id: 7, text: "Saya cenderung memperhatikan kerapian penampilan, pakaian, serta tata ruang sekitar kelas atau kamar asrama.", category: "V" },
  { id: 8, text: "Saya lebih suka membaca penjelasan sendiri di buku daripada dibacakan atau dijelaskan secara lisan oleh guru/teman.", category: "V" },
  { id: 9, text: "Ketika memikirkan masa lalu, saya seringkali membayangkan kenangan dalam bentuk gambar, objek, atau adegan film yang jelas di otak.", category: "V" },
  { id: 10, text: "Saya sering merasa terganggu dalam belajar jika kondisi ruangan berantakan, tidak beraturan, atau kotor secara fisik.", category: "V" },

  // Auditori (A)
  { id: 11, text: "Saya lebih mudah mengingat informasi dari apa yang dijelaskan guru secara lisan daripada membaca materi itu sendiri di buku.", category: "A" },
  { id: 12, text: "Saya senang belajar kelompok agar bisa mengobrol, mendiskusikan materi, dan mendengarkan ide-ide dari teman.", category: "A" },
  { id: 13, text: "Saat menghafal Al-Quran atau 100 Hadits, saya lebih cepat hafal jika melafalkannya keras-keras atau mendengarkan rekaman murottal secara berulang.", category: "A" },
  { id: 14, text: "Saya mudah terganggu konsentrasinya jika ada suara bising, bisikan, atau suara musik yang menginterupsi saat saya sedang membaca.", category: "A" },
  { id: 15, text: "Saya lebih menyukai instruksi lisan berupa penjelasan langsung dibanding membaca lembaran petunjuk manual yang panjang.", category: "A" },
  { id: 16, text: "Saya senang mengajukan pertanyaan lisan atau memberikan tanggapan berupa argumen suara saat seminar atau diskusi kelas asrama.", category: "A" },
  { id: 17, text: "Saya seringkali tanpa sadar menggumamkan kata-kata atau menggerakkan bibir saya saat membaca sebuah buku secara mandiri.", category: "A" },
  { id: 18, text: "Saya menyukai metode belajar dengan podcast pendidikan, rekaman audio materi, atau ceramah ilmiah langsung.", category: "A" },
  { id: 19, text: "Saya sangat sensitif terhadap perubahan nada suara, intonasi, dan ritme bicara yang digunakan oleh guru atau lawan bicara saya.", category: "A" },
  { id: 20, text: "Saya menikmati mendengarkan musik atau instrumen tenang saat hendak menyelesaikan tugas sekolah atau kegiatan santai mandiri.", category: "A" },

  // Kinestetik (K)
  { id: 21, text: "Saya lebih mudah belajar dengan cara mencobanya langsung, bereksperimen di laboratorium, atau mempraktikkan materi teoritis secara fisik.", category: "K" },
  { id: 22, text: "Ketika belajar, saya merasa sulit untuk duduk diam dalam waktu yang sangat lama dan selalu berkeinginan untuk bergerak, berdiri, atau berjalan-jalan.", category: "K" },
  { id: 23, text: "Saya merasa lebih mengerti pelajaran jika menggunakan media manipulatif, memegang replika benda, atau merakit model fisik secara langsung.", category: "K" },
  { id: 24, text: "Saya sering menggunakan gerakan tangan (gestur tubuh) yang ekspresif atau bahasa tubuh lainnya saat menjelaskan suatu ide kepada orang lain.", category: "K" },
  { id: 25, text: "Saya senang melakukan aktivitas fisik yang aktif seperti olahraga asrama, menari, aksi teater, bela diri silat, ataupun berkegiatan luar ruangan.", category: "K" },
  { id: 26, text: "Saya lebih suka mengetik langsung, membuat coretan corat-coret tak sadar saat berpikir, atau terlibat dalam merakit barang fisik.", category: "K" },
  { id: 27, text: "Saat menghafal Al-Quran, saya merasa lebih fokus jika sambil mengetuk perlahan, meraba butiran tasbih, atau sesekali berjalan mondar-mandir di koridor asrama.", category: "K" },
  { id: 28, text: "Saya lebih cepat tanggap terhadap arahan yang melibatkan contoh peragaan gerak fisik daripada sekadar instruksi kalimat tulisan atau lisan.", category: "K" },
  { id: 29, text: "Saya menyukai kelas yang aktif dan dinamis seperti praktek lapangan, simulasi peran (roleplaying), atau proyek kelompok yang menggerakkan fisik.", category: "K" },
  { id: 30, text: "Ketika beristirahat atau berkonsentrasi, saya sering memainkan pena, meremas bola karet, atau melakukan kebiasaan gerak kecil berulang dengan tangan atau kaki saya.", category: "K" }
];

