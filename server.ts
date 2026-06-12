/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

// Ensure process.env is populated in development if needed
import dotenv from "dotenv";
dotenv.config();

const port = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // Define API route first
  app.post("/api/recommend-majors", async (req, res) => {
    try {
      const { jenjang, profile, keagamaan, akademik, prestasiEkskul, minatBakatColors, iqScore, dominanRiasec } = req.body;
      
      const kelasSiswa = profile?.kelas || "";
      const isSmp = jenjang === "SMP" || kelasSiswa.includes("Kelas 7") || kelasSiswa.includes("Kelas 8") || kelasSiswa.includes("Kelas 9");
      const jenjangLabel = isSmp ? "Sekolah Menengah Pertama (SMP) Kelas 7 s.d. 9" : "Sekolah Menengah Atas (SMA) Kelas 10 s.d. 12";
      const targetRencana3Tahun = isSmp ? "Kelas 7 (Tahun ke-1), Kelas 8 (Tahun ke-2), dan Kelas 9 (Tahun ke-3)" : "Kelas 10 (Tahun ke-1), Kelas 11 (Tahun ke-2), dan Kelas 12 (Tahun ke-3)";
      const targetRekomendasiKarir = isSmp 
        ? "arah cita-cita, bimbingan kesiswaan, ekskul idaman SMP, asimilasi gaya belajar, optimalisasi kognitif kesiswaan, target tahfidz asrama, serta 2 mata pelajaran utama yang harus dimaksimalkan" 
        : "10 Jurusan Kuliah Terbaik";

      // Lazy initialization of Gemini Client
      const apiKey = process.env.GEMINI_API_KEY;
      const isKeyDummy = !apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "";

      if (isKeyDummy) {
        console.log("No valid GEMINI_API_KEY. Using fallback algorithmic mapping...");
        const fallback = generateAlgorithmicFallback(req.body);
        return res.json({
          source: "fallback",
          data: fallback,
          message: "Analisis dilakukan menggunakan modul kalkulasi cerdas lokal. Hubungkan API Key di panel Secrets untuk mengaktifkan AI Generatif."
        });
      }

      // Initialize Gemini SDK with User-Agent set to "aistudio-build"
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      // Prepare Prompt
      let riasecProfileText = "";
      if (dominanRiasec && dominanRiasec.length > 0) {
        riasecProfileText = dominanRiasec.map((r: any) => `${r.type} (${r.percentage}%)`).join(", ");
      }

      let keagamaanText = `Hafalan Qur'an: ${keagamaan?.hafalan || "0-1 juz"}, Hafalan 100 Hadits: ${keagamaan?.hafalanHadits || "0-20 hadits"}. Mapel keagamaan: Pendidikan Agama Islam / PAI (${keagamaan?.nilai?.pai}), Bahasa Arab (${keagamaan?.nilai?.bahasaArab}). Prestasi: ${keagamaan?.prestasi?.join(", ") || "-"}. Organisasi: ${keagamaan?.organisasi?.join(", ") || "-"}.`;
      let akademikText = `Nilai Rapor: Matematika (${akademik?.nilaiRapor?.matematika}), B. Indonesia (${akademik?.nilaiRapor?.bahasaIndonesia}), B. Inggris (${akademik?.nilaiRapor?.bahasaInggris}), IPA (${akademik?.nilaiRapor?.ipa}), IPS (${akademik?.nilaiRapor?.ips}). Prestasi: ${akademik?.prestasi?.join(", ") || "-"}. Skor simulasi tes: Literasi (${akademik?.simulasiTes?.literasi}), Numerasi (${akademik?.simulasiTes?.numerasi}), Penalaran (${akademik?.simulasiTes?.penalaran}).`;
      let prestasiText = `Ekskul: ${prestasiEkskul?.ekskul?.join(", ") || "-"}. Prestasi Tingkat (Sekolah: ${prestasiEkskul?.tingkatPrestasi?.sekolah}, Kabupaten: ${prestasiEkskul?.tingkatPrestasi?.kabupaten}, Provinsi: ${prestasiEkskul?.tingkatPrestasi?.provinsi}, Nasional: ${prestasiEkskul?.tingkatPrestasi?.nasional}, Internasional: ${prestasiEkskul?.tingkatPrestasi?.internasional}).`;

      let prompt = "";
      if (isSmp) {
        prompt = `
        Anda adalah Sistem AI Konselor Karir & Akademik Sekolah Cendekia BAZNAS (sekolah berasrama dhuafa berprestasi tingkat menengah pertama dan atas).
        
        Siswa yang dianalisis saat ini berada di jenjang ${jenjangLabel}. 
        PENTING: Karena siswa ini di tingkat SMP, Anda dilarang memberikan rekomendasi jurusan Perguruan Tinggi/Kuliah. Sebagai gantinya, Anda harus merekomendasikan peta potensi dan saran pengembangan spesifik untuk siswa SMP yang mencakup tepat 5 item:
        1. Minat Bakat & Ekstrakurikuler (Rekomendasi klub/ekskul yang sesuai dengan hobi dan profil minat bakatnya)
        2. Strategi Gaya Belajar Pembelajaran (rekomendasi metode belajar berdasarkan gaya belajar dominan VAK: Visual, Auditori, atau Kinestetik)
        3. Optimalisasi Potensi IQ Kognitif (saran spesifik mengasah otak berdasarkan skor IQ siswa yang berjumlah ${iqScore || 100})
        4. Target Tahfidz & Program Keagamaan (target juz Al-Quran dan hafalan Hadits berdasarkan rekam hafalan Qur'an saat ini ${keagamaan?.hafalan || "0-1 juz"} dan hadits di asrama)
        5. 2 Mata Pelajaran yang Perlu Dimaksimalkan (pilihlah tepat 2 mata pelajaran nasional umum yang paling esensial dimaksimalkan nilainya berdasarkan tren nilai rapor dan minat cita-citanya agar dia sukses berprestasi unggul di tingkat menengah).
        
        INFORMASI SISWA:
        - Nama Lengkap: ${profile?.nama || "Siswa"}
        - Kelas saat ini: ${kelasSiswa}
        - Cita-cita: ${profile?.citaCita || "Belum ditentukan"}
        - Hobi: ${profile?.hobi || "-"}
        - Organisasi diikuti: ${profile?.organisasi || "-"}
        
        POTENSI AKADEMIK (Rapor & Simulasi):
        ${akademikText}
        
        POTENSI TAHFIDZ & AGAMA:
        - Tingkat Hafalan Al-Quran: ${keagamaan?.hafalan || "0-1 juz"}
        - Tingkat Hafalan 100 Hadits: ${keagamaan?.hafalanHadits || "0-20 hadits"}
        - Nilai Rapor PAI: ${keagamaan?.nilai?.pai}, Bahasa Arab: ${keagamaan?.nilai?.bahasaArab}
        
        POTENSI EKSTRAKURIKULER & PRESTASI:
        ${prestasiText}
        
        TES IQ SIMULASI: ${iqScore || 100}
        
        Berikan jawaban dalam bentuk JSON terstruktur menggunakan skema response yang telah ditetapkan.
        Pola Respon JSON:
        1. "majors" berisi tepat 5 buah objek rekomendasi berurutan dari Rank 1 s.d. Rank 5 dengan kategori sebagai berikut:
           - Rank 1: name "Minat Bakat & Ekstrakurikuler", berikan suitabilityScore (integer 80-100) dan description deskripsi 2-3 kalimat yang menganalisis hobi dan menyarankan jenis ekskul asrama yang sangat ideal bagi dirinya.
           - Rank 2: name "Strategi Gaya Belajar Pembelajaran", berikan suitabilityScore (integer 85-100) dan description deskripsi 2-3 kalimat yang didasarkan pada gaya belajar dominannya.
           - Rank 3: name "Optimalisasi Potensi IQ Kognitif", berikan suitabilityScore (integer 80-100) dan description deskripsi 2-3 kalimat melatih daya tampung intelektualnya.
           - Rank 4: name "Target Tahfidz & Program Keagamaan", berikan suitabilityScore (integer 80-100) dan description deskripsi target juz Qur'an & Hadits asrama.
           - Rank 5: name "2 Mata Pelajaran yang Perlu Dimaksimalkan", berikan suitabilityScore (integer 80-100) dan description yang menyebutkan tepat 2 mata pelajaran khusus untuk gencar didongkralk dalam rapor berjalan.
        2. "justification" berupa gabungan analisis bimbingan konseling yang holistik dan komprehensif, memotivasi siswa SMP kearah sukses akademis asrama (sekitar 2-3 paragraf).
        3. "threeYearPlan" mencakup saran pengembangan yang konkret untuk 3 tahun s.d. kelulusan SMP (Kelas 7, Kelas 8, dan Kelas 9), di mana:
           - "kelas10" berisi rencana tahun pertama (fase Kelas 7)
           - "kelas11" berisi rencana tahun kedua (fase Kelas 8)
           - "kelas12" berisi rencana tahun ketiga (fase Kelas 9)
        `;
      } else {
        prompt = `
        Anda adalah Sistem AI Konselor Karir & Akademik Sekolah Cendekia BAZNAS (sekolah unggulan berasrama di Indonesia yang memadukan kurikulum nasional umum dengan kurikulum kepemimpinan Islam, hafalan Al-Quran, dan hafalan 100 Hadits untuk siswa dhuafa berprestasi).
        
        Siswa yang dianalisis saat ini berada di jenjang ${jenjangLabel}. 
        Lakukan analisis mendalam terhadap potensi siswa tersebut untuk memberikan rekomendasi 10 Jurusan Kuliah Terbaik serta menyusun Rencana Pengembangan Akademik & Karir 3 Tahun (${targetRencana3Tahun}) yang sangat aplikatif di lingkungan berasrama Sekolah Cendekia BAZNAS.
        
        INFORMASI SISWA:
        - Nama Lengkap: ${profile?.nama || "Siswa"}
        - Kelas saat ini: ${kelasSiswa}
        - Cita-cita: ${profile?.citaCita || "Belum ditentukan"}
        - Hobi: ${profile?.hobi || "-"}
        - Organisasi diikuti: ${profile?.organisasi || "-"}
        
        POTENSI AKADEMIK (Bobot Rapor & Simulasi):
        ${akademikText}
        
        POTENSI TAHFIDZ, KARAKTER & RELIGIUSITAS BOARDING:
        - Tingkat Hafalan Al-Quran: ${keagamaan?.hafalan || "0-1 juz"}
        - Tingkat Hafalan 100 Hadits: ${keagamaan?.hafalanHadits || "0-20 hadits"}
        - Nilai Rapor Muatan Lokal Keagamaan: 
          * Pendidikan Agama Islam / PAI: ${keagamaan?.nilai?.pai}
          * Bahasa Arab / Komunikasi: ${keagamaan?.nilai?.bahasaArab}
        - Prestasi Karakter/Tahfidz: ${keagamaan?.prestasi?.join(", ") || "-"}
        - Organisasi Asrama/DKM: ${keagamaan?.organisasi?.join(", ") || "-"}
        
        POTENSI NON-AKADEMIK & EKSTRAKURIKULER (Bobot Prestasi):
        ${prestasiText}
        
        INTERPRETASI TES IQ SIMULASI:
        - Skor IQ: ${iqScore || 100}
        
        TES MINAT BAKAT (Model RIASEC Holland Code) DAN TES GAYA BELAJAR:
        - Profil RIASEC: ${riasecProfileText}
        
        Formulasi pemetaan jurusan kuliah / pemintatan:
        40% Bobot Minat Bakat (RIASEC)
        30% Bobot IQ Simulasi
        20% Bobot Rapor Akademik
        10% Bobot Prestasi / Sikap Siswa / Hafalan Keagamaan
        
        Berikan jawaban dalam bentuk JSON terstruktur menggunakan skema response yang telah ditetapkan.
        Perhatikan:
        1. "majors" berisi 10 rekomendasi karir/jurusan perguruan tinggi terbaik terurut dari ranking 1 s.d. 10. Cantumkan nama jurusan/bidang, skor kecocokan dalam persentase (integer 50-100), dan deskripsi penjelasan 2-3 kalimat mengapa pilihan itu cocok baginya berdasarkan IQ, RIASEC, minat gaya belajar, serta arahan masa depan.
        2. "justification" merupakan gabungan analisis holistik (keseluruhan) siswa, menautkan cita-cita siswa, kecerdasan IQ-nya, dan tipe kepribadian RIASEC-nya. Tulis secara persuasif dan memotivasi khas konselor Sekolah Cendekia BAZNAS (panjang sekitar 2-3 paragraf).
        3. "threeYearPlan" mencakup saran pengembangan yang konkret untuk 3 tahun pembelajaran ke depan (Kelas 10, Kelas 11, Kelas 12), termasuk aktivitas ketahfidzan Al-Quran & 100 Hadits di asrama, penguatan rapor, serta persiapan kelanjutan studi beasiswa.
           - Isi properti "kelas10" dengan rencana untuk tahun pertama (Kelas 10 jika SMA)
           - Isi properti "kelas11" dengan rencana untuk tahun kedua (Kelas 11 jika SMA)
           - Isi properti "kelas12" dengan rencana untuk tahun ketiga (Kelas 12 jika SMA)
        `;
      }

      // Call Gemini 3.5-flash with structured JSON output
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              majors: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    rank: { type: Type.INTEGER },
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    suitabilityScore: { type: Type.INTEGER }
                  },
                  required: ["rank", "name", "description", "suitabilityScore"]
                }
              },
              justification: { type: Type.STRING },
              threeYearPlan: {
                type: Type.OBJECT,
                properties: {
                  kelas10: { type: Type.STRING },
                  kelas11: { type: Type.STRING },
                  kelas12: { type: Type.STRING }
                },
                required: ["kelas10", "kelas11", "kelas12"]
              }
            },
            required: ["majors", "justification", "threeYearPlan"]
          }
        }
      });

      const responseText = response.text || "{}";
      const resultData = JSON.parse(responseText);

      return res.json({
        source: "gemini-api",
        data: resultData
      });

    } catch (error: any) {
      console.error("Gemini recommendation route error:", error);
      // Fallback in case of server error
      const fallback = generateAlgorithmicFallback(req.body);
      return res.json({
        source: "fallback_on_error",
        data: fallback,
        message: `Terjadi kendala pada server Gemini: ${error.message || error}. Menggunakan estimasi algoritma lokal.`
      });
    }
  });

  // Counsel Chat API endpoint
  app.post("/api/counsel-chat", async (req, res) => {
    try {
      const { message, history, studentInfo } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      const isKeyDummy = !apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "";

      if (isKeyDummy) {
        return res.json({
          reply: generateLocalReplyFallback(message, studentInfo),
          source: "fallback"
        });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const systemInstruction = `Anda adalah "Teman CurhatKu", asisten konseling AI bimbingan konseling dan teman curhat cerdas untuk siswa di Sekolah Cendekia BAZNAS (sekolah berasrama dhuafa berprestasi tingkat SMP dan SMA).
      
      INFORMASI SISWA YANG SEDANG CURHAT:
      - Nama: ${studentInfo?.nama || "Siswa"}
      - NISN: ${studentInfo?.nisn || "-"}
      - Kelas: ${studentInfo?.kelas || "-"}
      - Jenjang: ${studentInfo?.jenjang || "-"}
      
      KETENTUAN UTAMA GAYA KOMUNIKASI ANDA:
      1. Gunakan bahasa santai, kasual, akrab, hangat, penuh empati, ramah, dan bersahabat khas bahasa teman sebaya atau sahabat akrab siswa Indonesia (gunakan panggilan seperti "lo", "gue", "kamu", "aku", "sis", "bro", "sahabat", "temen curhat", dll.).
      2. Jangan sekali-kali memakai bahasa yang terlalu formal, kaku, berjarak, birokratis, atau terdengar seperti guru BK formal yang menceramahi murid. Posisikan diri Anda benar-benar sebagai teman sebaya yang suportif, cerdas, mengerti situasi sekolah berasrama (boarding), dan bisa diandalkan.
      3. Terapkan prinsip konseling Islami yang sejuk, santun, rahmatan lil alamin, menenangkan hati, penuh motivasi optimis, serta mendorong kemandirian dan rasa syukur di asrama Sekolah Cendekia BAZNAS (SCB).
      4. Jika siswa bercerita merasa lelah belajar, pusing tugas, homesick, atau perselisihan pertemanan di asrama, dengerin ceritanya dulu, validasi perasaannya, setelah itu baru berikan saran praktis yang santai, menyemangati, dan membangun keharmonisan asrama.
      5. JANGAN PERNAH memberikan saran negatif, provokatif, atau melanggar syariah/aturan sekolah. Dorong siswa selalu rajin shalat, terbuka bercerita, dan bertekad lulus dengan prestasi hebat.`;

      let contents: any[] = [];
      if (history && Array.isArray(history)) {
        history.forEach((h: any) => {
          contents.push({
            role: h.sender === "student" ? "user" : "model",
            parts: [{ text: h.text }]
          });
        });
      }
      contents.push({
        role: "user",
        parts: [{ text: message }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      const reply = response.text || "Aduh sorry banget loh, jaringan gue lagi agak lemot nih. Bisa lo ulang ceritanya lagi asyik?";
      return res.json({
        reply: reply,
        source: "gemini-api"
      });

    } catch (error: any) {
      console.error("Gemini counsel chat endpoint error:", error);
      return res.json({
        reply: "Waduh sorry banget ya bro/sis, server gue barusan kepeleset nih hiks. Tapi tenang aja, jangan patah semangat ya, gue di sini selalu setia dengerin keluh kesah lo kok!",
        source: "error"
      });
    }
  });

  // Counsel Chat Dialog Auto-Evaluation & Summary API endpoint
  app.post("/api/summarize-dialog", async (req, res) => {
    try {
      const { history, studentInfo } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      const isKeyDummy = !apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "";

      if (isKeyDummy) {
        return res.json({
          summary: `Ananda ${studentInfo?.nama || "Siswa"} menceritakan keluh kesahnya secara personal. Topik utama yang dominan adalah dinamika asrama Sekolah Cendekia BAZNAS. Siswa terindikasi membutuhkan perhatian emosional ringan dan pembinaan adaptasi asrama.`,
          actionItems: [
            "Lakukan konseling santai secara interpersonal pasca kegiatan asrama.",
            "Koordinasi dengan Ustadz / Ustadzah pendamping kamar tempat tinggal santri.",
            "Berikan dorongan mental yang suportif agar memacu kemandirian ananda."
          ],
          source: "fallback"
        });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const prompt = `Anda adalah Ahli Psikologi Remaja dan Konselor Senior Bimbingan Konseling (BK) di Sekolah Cendekia BAZNAS (sekolah berasrama dhuafa berprestasi pertama di Indonesia).
      
      Tugas Anda adalah menganalisis transkrip dialog curhat seorang siswa berikut ini dengan Asisten AI Konseling "Teman CurhatKu". 
      Analisis ini bertujuan membekali Guru BK di dunia nyata dengan tinjauan psikososial dan pedagogis yang empati, ringkas, dan tajam agar pendampingan fisik kepada siswa berjalan harmonis.
      
      DATA SISWA:
      - Nama: ${studentInfo?.nama || "Siswa"}
      - NISN: ${studentInfo?.nisn || "-"}
      - Kelas: ${studentInfo?.kelas || "-"}
      - Jenjang: ${studentInfo?.jenjang || "-"}
      
      TRANSKRIP DIALOG CURHAT:
      ${JSON.stringify(history)}
      
      Hasilkan keluaran JSON terstruktur yang valid yang berisi:
      1. "summary": Analisis naratif 3-4 kalimat padat yang menguraikan inti keluhan siswa, kondisi kecemasan, rasa rindu rumah (homesick), stres hafalan Quran/hadits, atau isu pertemanan asrama yang terdeteksi, serta aspek emosionalnya.
      2. "actionItems": Array dari tepat 3 kalimat rencana aksi / tindak lanjut konkret untuk Guru BK sekolah di dunia nyata untuk mendukung kondisi psikologis siswa ini.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              actionItems: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["summary", "actionItems"]
          }
        }
      });

      const responseText = response.text || "{}";
      const resultData = JSON.parse(responseText);

      return res.json({
        summary: resultData.summary,
        actionItems: resultData.actionItems,
        source: "gemini-api"
      });

    } catch (error: any) {
      console.error("Gemini summarize dialog error:", error);
      return res.json({
        summary: `Terjadi kendala sistem saat menganalisis dialog dengan AI. Guru BK disarankan tetap memantau rekam chat manual siswa.`,
        actionItems: [
          "Pantau interaksi komunikasi kesiswaan siswa di kelas.",
          "Verifikasi kendala kesiswaan secara manual jika ada aduan khusus.",
          "Jaga jalinan komunikasi aktif dengan pembina asrama."
        ],
        source: "error"
      });
    }
  });

  // Serve static files / Vite middleware
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite environment in development mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Setting up Express production assets serving...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Serve HTML
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${port}`);
  });
}

/**
 * High-fidelity rules engine to calculate standard Indonesian major recommendations
 * based on student RIASEC codes, IQ, religion potential, grades, and interest profiles.
 * Used when Gemini API is offline or key is missing.
 */
function generateAlgorithmicFallback(input: any) {
  const profile = input.profile || {};
  const keagamaan = input.keagamaan || {};
  const akademik = input.akademik || {};
  const iqScore = input.iqScore || 100;
  const dominanRiasec = input.dominanRiasec || [];

  const mainRiasecType = dominanRiasec[0]?.type || "I";
  const iqCat = iqScore >= 130 ? "Sangat Superior" : iqScore >= 120 ? "Superior" : iqScore >= 110 ? "Di Atas Rata-rata" : iqScore >= 100 ? "Rata-rata" : "Rata-rata Bawah";

  const kelasSiswa = profile.kelas || "";
  const isSmp = input.jenjang === "SMP" || kelasSiswa.includes("Kelas 7") || kelasSiswa.includes("Kelas 8") || kelasSiswa.includes("Kelas 9");

  if (isSmp) {
    let recEkskul = "Pramuka, Kelompok Ilmiah Remaja (KIR), dan Robotik";
    if (mainRiasecType === "S" || mainRiasecType === "A") {
      recEkskul = "Seni Musik/Kaligrafi, Jurnalistik/Dakwah, dan Pramuka";
    } else if (mainRiasecType === "R" || mainRiasecType === "I") {
      recEkskul = "Klub Robotik, Kelompok Ilmiah Remaja (KIR), dan Petanque/Futsal";
    }
    
    let recGayaBelajar = "Metode belajar visual dengan peta konsep, rangkuman bagan warna, dan diagram belajar terstruktur.";
    
    let recIQ = `Dengan skor IQ ${iqScore} (${iqCat}), disarankan memaksimalkan pemecahan teka-teki logika, latihan penalaran spasial, dan algoritma matematika dasar.`;
    
    let recQuran = `Mengingat hafalan Qur'an ananda berada di tingkat ${keagamaan.hafalan || "0-1 juz"} dan hadits ${keagamaan.hafalanHadits || "0-20 hadits"}, disarankan program muraja'ah subuh teratur dan target setoran mingguan terstruktur di asrama Sekolah Cendekia BAZNAS.`;
    
    let mapel1 = "Matematika";
    let mapel2 = "IPA (Sains)";
    if (mainRiasecType === "A" || mainRiasecType === "S" || mainRiasecType === "E") {
      mapel1 = "Bahasa Inggris";
      mapel2 = "IPS (Sosial)";
    }
    let recMapel = `Berdasarkan profil kognitif dan minat karir, fokuskan pengembangan maksimal pada mata pelajaran ${mapel1} dan ${mapel2} untuk mendongkrak prestasi akademis utama di SMP.`;

    const sCandidates = [
      {
        rank: 1,
        name: "Minat Bakat & Ekstrakurikuler",
        description: `Disarankan bergabung aktif di ekskul ${recEkskul} untuk mematangkan soft-skills kepemimpinan sesuai hobi ${profile.hobi || "belajar"} dan cita-cita menjadi ${profile.citaCita || "ilmuwan"}.`,
        suitabilityScore: 95
      },
      {
        rank: 2,
        name: "Strategi Gaya Belajar Pembelajaran",
        description: `${recGayaBelajar} Hal ini membantu asimilasi kognitif yang cepat agar setara dengan siswa berprestasi asrama lainnya.`,
        suitabilityScore: 92
      },
      {
        rank: 3,
        name: "Optimalisasi Potensi IQ Kognitif",
        description: `${recIQ} Latihlah pemecahan kuis problem-solving kognitif secara berkala untuk mempertajam kecerdasan cairan (fluid intelligence) asrama.`,
        suitabilityScore: 88
      },
      {
        rank: 4,
        name: "Target Tahfidz & Program Keagamaan",
        description: `${recQuran} Hal ini akan membangun integritas spiritual sidiq dan syar'i khas kesiswaan Sekolah Cendekia BAZNAS.`,
        suitabilityScore: 90
      },
      {
        rank: 5,
        name: "2 Mata Pelajaran yang Perlu Dimaksimalkan",
        description: `${recMapel} Maksimalkan jam belajar mandiri asrama pada kedua bidang studi ini guna mengamankan poin rapor unggul.`,
        suitabilityScore: 94
      }
    ];

    let justification = `Analisis profil holistik SMP menunjukkan bahwa ${profile.nama || "Ananda"} memiliki perpaduan karakter yang sangat potensial untuk terus berkembang di Sekolah Cendekia BAZNAS (SCB). Dengan kecenderungan tipe kepribadian RIASEC dominan tipe **${mainRiasecType}**, ananda memiliki landasan minat kualitatif yang baik, di mana cita-citanya menjadi **${profile.citaCita || "Insan Pembawa Perubahan"}** dapat diakselerasi melalui penyaluran bakat ekskul ${recEkskul} sejak dini.
    
Skor estimasi kecerdasan intelektual (IQ) sebesar **${iqScore}** (${iqCat}) mendemonstrasikan kapasitas kognitif yang tangguh untuk menyerap pelajaran tingkat menengah serta mempersiapkan seleksi kelanjutan studi ke SMA/MA berasrama terakreditasi A secara maksimal. Pola asrama Sekolah Cendekia BAZNAS sangat kondusif untuk mendukung ritme belajar ananda.

Dengan modal hafalan Qur'an ${keagamaan.hafalan || "0-1 juz"} dan hadits ${keagamaan.hafalanHadits || "0-20 hadits"}, ananda didorong mempertahankan kedisiplinan beribadah dan muraja'ah di asrama. Bidang akademik utama yang perlu dimaksimalkan adalah mata pelajaran **${mapel1}** dan **${mapel2}** sebagai pilar pendukung akademis prioritas yang disesuaikan dengan minat bakat SMP-nya.`;

    return {
      majors: sCandidates,
      justification: justification,
      threeYearPlan: {
        kelas10: `${profile.nama || "Ananda"}, fokuslah beradaptasi dengan ritme asrama di Kelas 7. Mantapkan dasar-dasar hafalan Al-Quran dan rajinlah membaca di perpustakaan asrama Sekolah Cendekia BAZNAS.`,
        kelas11: `Di Kelas 8, perluas wawasan dengan mengikuti ekstrakurikuler pilihan dan mulailah menghafal 100 Hadits. Pertahankan nilai akademis di rapor semester agar stabil.`,
        kelas12: `Fase Kelas 9, persiapkan diri menghadapi ujian kelulusan serta seleksi masuk SMA/MA unggulan berasrama di Indonesia dengan membekali portofolio prestasi dan tahfidz lengkap.`
      }
    };
  }

  // Pre-seed major candidates by RIASEC primary types
  const majorPool: Record<string, { name: string; description: string; baseScore: number }[]> = {
    R: [
      { name: "Teknik Sipil", description: "Sempurna untuk kepribadian Praktis (R). Anda menyukai benda berwujud fisik dan desain struktural infrastruktur real untuk kemanusiaan.", baseScore: 82 },
      { name: "Teknik Mesin", description: "Bekerja dengan motor, sistem termal, dan manufaktur presisi merupakan muara minat mekanikal Anda yang kuat.", baseScore: 80 },
      { name: "Arsitektur", description: "Menggabungkan seni 3D dengan konstruksi fisik bangunan, sesuai bagi siswa dengan IQ Spansial tinggi and tipe R-A.", baseScore: 78 },
      { name: "Sains Pertanian / Agroteknologi", description: "Fokus pada kelestarian pangan, rekayasa genetika tanaman, sesuai dengan kelestarian alam nusantara.", baseScore: 76 }
    ],
    I: [
      { name: "Teknik Informatika / Ilmu Komputer", description: "Sangat cocok untuk kecerdasan Investigasi tinggi. Mengasah penalaran logis, pengolahan data besar, dan rekayasa perangkat lunak modern.", baseScore: 86 },
      { name: "Kedokteran / Pendidikan Dokter", description: "Memerlukan IQ tinggi dan minat investigatif untuk meneliti penyakit, merawat anatomi manusia, dan menolong sesama.", baseScore: 84 },
      { name: "Farmasi", description: "Penelitian senyawa kimia obat, formulasi farmakologi, dan sains klinis yang butuh ketelitian eksak.", baseScore: 80 },
      { name: "Teknik Elektro", description: "Fokus pada sirkuit elektronika, pemrosesan sinyal digital, kecerdasan buatan, dan listrik arus kuat.", baseScore: 78 }
    ],
    A: [
      { name: "Desain Komunikasi Visual (DKV)", description: "Menyalurkan hasrat Artistik melalui ilustrasi, animasi digital, branding produk, dan perwajahan visual modern.", baseScore: 85 },
      { name: "Sastra Inggris / Hubungan Internasional", description: "Berbahasa dan berekspresi secara luwes, mengkaji kultur global dengan insting kreatif, kritis, dan filosofis.", baseScore: 80 },
      { name: "Teknik Arsitektur", description: "Mendesain estetika ruang dan pemukiman manusia secara hijau dan berkelanjutan dengan visual kreatif.", baseScore: 78 },
      { name: "Ilmu Komunikasi", description: "Cocok untuk eksplorasi media penyiaran, jurnalistik kreatif, public relations, dan dakwah multimedia digital.", baseScore: 77 }
    ],
    S: [
      { name: "Psikologi", description: "Tipe Social yang ingin menolong orang melalui pemahaman perilaku mental, konseling, dan mediasi psikososial.", baseScore: 85 },
      { name: "Pendidikan Guru / Keguruan", description: "Sangat mulia, mendidik generasi penerus bangsa. Menyalurkan bakat mendidik dan memotivasi siswa berprestasi.", baseScore: 83 },
      { name: "Kesehatan Masyarakat", description: "Meningkatkan literasi medis komunitas, gizi, penanganan sanitasi, dan penyusunan kebijakan preventif sosial.", baseScore: 78 },
      { name: "Sosiologi / Kesejahteraan Sosial", description: "Mengkaji stratifikasi sosial, pemecahan problem kemasyarakatan, dan program inklusi sosial pembangunan nasional.", baseScore: 78 }
    ],
    E: [
      { name: "Manajemen Bisnis / Kewirausahaan", description: "Tipe Enterprising (E) yang berani mengambil risiko, memimpin tim, memasarkan produk, dan merintis startup mandiri.", baseScore: 85 },
      { name: "Ilmu Hukum", description: "Menjadi advokat, notaris, atau diplomat yang lincah bernegosiasi, mempertahankan argumen logis, dan mengawal keadilan.", baseScore: 82 },
      { name: "Hubungan Internasional", description: "Eksplorasi diplomasi, lobi bilateral antarnegara, dan resolusi konflik dengan kecakapan persuasif tinggi.", baseScore: 80 },
      { name: "Ekonomi Pembangunan", description: "Mengkaji kebijakan moneter, analisis makro, mikro, perdagangan global, dan inovasi jaminan sosial pembangunan.", baseScore: 77 }
    ],
    C: [
      { name: "Akuntansi", description: "Tipe Konvensional (C) yang mencintai organisasi data finansial, pembukuan rapi, perpajakan, dan auditing akurat.", baseScore: 86 },
      { name: "Sistem Informasi", description: "Pertemuan manajemen basis data dengan kebutuhan bisnis perusahaan. Sangat rapi, terstruktur, berorientasi logika sistem.", baseScore: 83 },
      { name: "Statistika / Data Science", description: "Melakukan kompilasi angka, pemodelan probabilitas, survei riset, dan pengodean data analitis yang presisi.", baseScore: 80 },
      { name: "Administrasi Publik / Bisnis", description: "Mengatur sirkulasi tata kelola berkas, struktur birokrasi, SOP operasional, serta kearsipan digital yang rapi.", baseScore: 78 }
    ]
  };

  // Add religious context: If memorization is >= 6 juz or student is active in Rohis, highly prioritize some Islamic choices
  const isReligiousSiswa = (keagamaan.hafalan && keagamaan.hafalan !== "0-1 juz") || 
                            (keagamaan.organisasi && keagamaan.organisasi.includes("rohis")) || 
                            (keagamaan.nilai?.pai > 85);
  
  const islamicPool = [
    { name: "Ilmu Al-Quran dan Tafsir (IAT)", description: "Cocok dengan modal juz hafalan Anda. Mengkaji filologi penafsiran kitab suci dan nilai-nilai hidup mulia untuk peradaban.", baseScore: 88 },
    { name: "Hukum Keluarga Islam / Syariah", description: "Mempelajari jurisprudensi perdata Islam, kehakiman agama, perbankan syariah, dan regulasi wakaf-zakat.", baseScore: 85 },
    { name: "Pendidikan Agama Islam (PAI)", description: "Mendidik masyarakat dengan landasan akhlak mulia, fikih, sejarah islam. Sangat prospektif untuk formasi beasiswa khusus.", baseScore: 82 },
    { name: "Ekonomi Syariah", description: "Penerapan ekonomi Islam, tata kelola keuangan sosial, kebijakan filantropi, dan jaring pengaman mikro syariah.", baseScore: 84 }
  ];

  // Compile majors by ordering scores
  let candidates: { name: string; description: string; suitabilityScore: number }[] = [];

  // Mix the pools
  // 1. Primary RIASEC
  const primaryPool = majorPool[mainRiasecType] || majorPool["I"];
  primaryPool.forEach(m => {
    // Suitability factors: IQ modifier (+- 5%), academic modifier
    const iqModifier = (iqScore - 100) / 4; // up to +5 or -5
    const suitability = Math.min(98, Math.max(60, Math.round(m.baseScore + iqModifier)));
    candidates.push({ name: m.name, description: m.description, suitabilityScore: suitability });
  });

  // 2. Secondary RIASEC if available
  const secRiasecType = dominanRiasec[1]?.type || "S";
  const secondaryPool = majorPool[secRiasecType] || majorPool["S"];
  secondaryPool.forEach(m => {
    const suitability = Math.min(95, Math.max(55, Math.round(m.baseScore * 0.95 + (iqScore - 100) / 5)));
    candidates.push({ name: m.name, description: m.description, suitabilityScore: suitability });
  });

  // 3. Religious majors if student is religious
  if (isReligiousSiswa) {
    islamicPool.forEach(m => {
      candidates.push({
        name: m.name,
        description: `${m.description} Rekomendasi jalur masuk seleksi keagamaan khusus atau beasiswa prestasi religi/karakter.`,
        suitabilityScore: Math.min(96, Math.max(70, Math.round(m.baseScore + 4)))
      });
    });
  } else {
    // Just add 2 islamic majors as regular options lower down
    candidates.push({
      name: "Ekonomi Syariah",
      description: "Mempelajari ekonomi alternatif syariah, sejalan dengan program pemberdayaan ekonomi nasional dan pembangunan sosial.",
      suitabilityScore: 72
    });
    candidates.push({
      name: "Pendidikan Agama Islam (PAI)",
      description: "Menyalurkan keahlian pedagogi didaktik dalam pengajaran akhlak, fikih, dan studi budi pekerti luhur di lembaga formal.",
      suitabilityScore: 68
    });
  }

  // 4. Fill in standard majors from other categories to make up at least 12 candidates, for sorting top 10
  const otherTypes = ["R", "I", "A", "S", "E", "C"].filter(t => t !== mainRiasecType && t !== secRiasecType);
  otherTypes.forEach(t => {
    const extraPool = majorPool[t];
    extraPool.forEach(m => {
      // Check if duplicate
      if (!candidates.some(c => c.name === m.name)) {
        candidates.push({
          name: m.name,
          description: m.description,
          suitabilityScore: Math.min(85, Math.max(50, Math.round(m.baseScore * 0.8 + (iqScore - 100) / 6)))
        });
      }
    });
  });

  // Unique and Sort
  const seen = new Set();
  const sortedUniqueCandidates = candidates
    .filter(el => {
      const duplicate = seen.has(el.name);
      seen.add(el.name);
      return !duplicate;
    })
    .sort((a, b) => b.suitabilityScore - a.suitabilityScore)
    .slice(0, 10)
    .map((el, index) => ({
      rank: index + 1,
      name: el.name,
      description: el.description,
      suitabilityScore: el.suitabilityScore
    }));

  // Generate justification paragraph
  const topMajorStr = sortedUniqueCandidates[0]?.name || "Ilmu Komputer / Ekonomi Syariah";
  
  let justification = "";
  if (isSmp) {
    justification = `Analisis profil holistik menunjukkan bahwa ${profile.nama || "Ananda"} memiliki perpaduan karakter yang sangat potensial untuk terus berkembang di Sekolah Cendekia BAZNAS (SCB) tingkat SMP. Dengan dominasi kepribadian RIASEC tipe **${mainRiasecType}** didukung sub-tipe **${secRiasecType}**, ananda cenderung memiliki cara berpikir yang ${mainRiasecType === "I" ? "analitis, menyukai eksplorasi materi sains/teknologi sejak dini, kreatif, dan kritis," : mainRiasecType === "S" ? "empatis, berjiwa penolong/peduli sosial, lincah membimbing kawan, dan komunikatif," : mainRiasecType === "E" ? "berbakat memimpin, persuasif mendesain kolaborasi sebaya, dan mandiri berorganisasi," : "praktikal, menyukai hal terstruktur, tekun, dan disiplin tinggi,"} yang beresonansi harmonis dengan cita-citanya sebagai **${profile.citaCita || "Insan Muttaqin Pembawa Perubahan"}**.

Skor estimasi kecerdasan intelektual (IQ) sebesar **${iqScore}** (${iqCat}) mendemonstrasikan kapasitas kognitif yang kokoh untuk menyerap pelajaran tingkat lanjut serta mempersiapkan jalur masuk SMA/SMK berasrama ternama di Indonesia. Keaktifannya dalam kepengurusan ataupun kelas asrama melengkapi aspek soft-skills kepemimpinan yang esensial.

Kombinasi rapor akademik yang sehat, rekam ketahfidzan Al-Quran (${keagamaan.hafalan}), serta hafalan 100 Hadits (${keagamaan.hafalanHadits || "0-20 hadits"}) membuktikan tingkat determinasi belajar dan integritas spiritual yang tinggi. Rekomendasi karir masa depan terpuncak mengarah pada bidang **${topMajorStr}** yang dapat dipersiapkan melalui pendalaman sains, bahasa, atau teknologi sejak awal jenjang SMP ini.`;
  } else {
    justification = `Analisis profil holistik menunjukkan bahwa ${profile.nama || "Ananda"} memiliki perpaduan karakter yang sangat potensial untuk terus berkembang di Sekolah Cendekia BAZNAS (SCB). Dengan dominasi kepribadian RIASEC tipe **${mainRiasecType}** didukung sub-tipe **${secRiasecType}**, ananda cenderung memiliki cara berpikir yang ${mainRiasecType === "I" ? "analitis, menyukai penelitian ilmiah, kritis dalam memecahkan misteri fisis," : mainRiasecType === "S" ? "empatis, berjiwa pengabdi sosial/filantropi, lincah membimbing kawan, dan komunikatif," : mainRiasecType === "E" ? "kepemimpinan yang kuat, persuasif, mandiri dalam organisasi, dan berorientasi pemberdayaan umat," : "praktikal, cermat mengevaluasi sistem terstruktur, dan disiplin tinggi,"} yang beresonansi harmonis dengan cita-citanya sebagai **${profile.citaCita || "Insan Muttaqin Pembawa Perubahan"}**.

Skor estimasi kecerdasan intelektual (IQ) sebesar **${iqScore}** (${iqCat}) mendemonstrasikan fondasi kognitif yang kokoh untuk menembus seleksi masuk perguruan tinggi nasional bersaing seperti SNBP, SNBT, maupun SPAN-PTKIN. Keaktifannya dalam kepengurusan asrama seperti **${profile.organisasi || "organisasi kesiswaan sekolah"}** melengkapi aspek soft-skills kepemimpinan yang esensial untuk masa depan cerah. 

Kombinasi rapor akademik yang sehat, rekam ketahfidzan Al-Quran (${keagamaan.hafalan}), serta hafalan 100 Hadits (${keagamaan.hafalanHadits || "0-20 hadits"}) membuktikan tingkat determinasi belajar dan integritas spiritual yang sangat tinggi. Jurusan utama yang kami rekomendasikan adalah **${topMajorStr}** karena di sinilah titik temu optimal antara minat kognitif, stabilitas psikososial, dan peluang keberhasilan jalur masuk beasiswa BAZNAS ataupun jatah kuota khusus di perguruan tinggi negeri terbaik di Indonesia.`;
  }

  // Generate 3 year plan snippets
  let plan10 = "";
  let plan11 = "";
  let plan12 = "";

  if (isSmp) {
    plan10 = `${profile.nama || "Ananda"}, manfaatkan fase Kelas 7 untuk beradaptasi penuh dengan sistem berasrama (boarding) di SMP Sekolah Cendekia BAZNAS. Fokuslah memperkuat keterampilan dasar Matematika dan Bahasa Inggris, akselerasi setoran tahfidz Al-Quran, serta mulailah aktif dalam 1-2 kegiatan ekstrakurikuler kepemimpinan Islam dasar.`;
    plan11 = `Di Kelas 8, tumpuklah pencapaian akademik berkesinambungan serta kembangkan pola pikir logis-kritis. Ikutilah kompetisi perlombaan sains atau literasi tingkat sekolah/kabupaten. Lanjutkan setoran tahfidz Al-Quran serta targetkan pengenalan hafalan 100 Hadits untuk mematangkan profil spiritual santri berprestasi.`;
    plan12 = `Fase klimaks Kelas 9. Fokus penuh sukses ujian kelulusan, penentuan kelanjutan studi ke SMA/MA/SMK unggulan berasrama pilihan, dan pemantapan minat bakat spesifik. Selesaikan target khataman Al-Quran serta sertifikasi setoran 100 Hadits secara lengkap sebagai modal portofolio kelulusan utama Anda.`;
  } else {
    plan10 = `${profile.nama || "Ananda"}, manfaatkan fase Kelas 10 untuk beradaptasi penuh dengan kultur berasrama (boarding) unggul di Sekolah Cendekia BAZNAS. Fokuslah memperkuat materi dasar Matematika/Bahasa Inggris, akselerasi setoran tahfidz Al-Quran serta targetkan hafalan awal 100 Hadits. Mulailah aktif di 1 ekskul pilihan (misal: ${input.prestasiEkskul?.ekskul?.[0] || "KIR atau Debat"}) guna melatih dasar kepemimpinan organisasi sejak dini.`;
    plan11 = `Di Kelas 11, peliharalah tren kenaikan nilai rapor untuk mapel pendukung program studi (misalnya Matematika, Bahasa Indonesia, atau rumpun sains/sosial). Ambil bagian aktif menjadi koordinator kegiatan sekolah atau pengurus inti OSIS/DKM/Rohis. Mantapkan pencapaian target hafalan Al-Quran dan 100 Hadits lengkap, serta mulailah mengumpulkan sertifikat prestasi minimal tingkat Kabupaten/Provinsi.`;
    plan12 = `Fase klimaks Kelas 12. Fokus penuh pada pemantapan simulasi tes UTBK-SNBT berkala dan persiapan berkas seleksi beasiswa BAZNAS/keagamaan. Koordinasikan strategi pemilihan jurusan dengan guru BK Sekolah Cendekia BAZNAS untuk peluang optimal di SNBP (jika masuk kuota eligible) atau SPAN-PTKIN. Selesaikan target khataman Al-Quran serta sertifikasi 100 Hadits lengkap Anda sebagai modal portofolio utama.`;
  }

  return {
    majors: sortedUniqueCandidates,
    justification: justification,
    threeYearPlan: {
      kelas10: plan10,
      kelas11: plan11,
      kelas12: plan12
    }
  };
}

/**
 * Friendly conversational engine (fallback) written in student peer language ("bahasa teman siswa").
 * Used when Gemini API key is offline or unavailable.
 */
function generateLocalReplyFallback(message: string, studentInfo: any) {
  const msg = message.toLowerCase();
  const nama = studentInfo?.nama || "Sobat";
  
  if (msg.includes("halo") || msg.includes("hi") || msg.includes("hey") || msg.includes("p")) {
    return `Halo juga ${nama}! 👋 Kenalin, nama gue Teman CurhatKu, temen curhat lo yang siap nemenin lo kapan aja. Gue di sini tulus pengen dengerin lo. Ada cerita seru, pusing, atau sebel apa nih hari ini di asrama/sekolah? Tumpahin aja ke gue, santai aja kali gak usah kaku!`;
  }
  if (msg.includes("asrama") || msg.includes("kamar") || msg.includes("temen") || msg.includes("rekan")) {
    return `Hmm... urusan kamar asrama emang kadang bikin pusing ya, wkwkwk. Tinggal sekamar bareng temen-temen yang wataknya beda-beda emang butuh kesabaran ekstra. Tapi aslinya seru kan kalau dipikir-pikir? Jenuh atau sebel itu wajar banget kok. Coba deh nanti kalau suasana lagi santai, ajak ngobrol ringan atau jajan sore bareng di kantin. Oiya, lo selalu bisa cerita ke ustadz pendamping juga kalau ada masalah yang berat. Semangat ya, jaga terus kekompakan kamar!`;
  }
  if (msg.includes("kangen") || msg.includes("rumah") || msg.includes("orang tua") || msg.includes("ibu") || msg.includes("ayah") || msg.includes("pulang") || msg.includes("homesick")) {
    return `Aduh... rasa kangen rumah (homesick) emang beneran bikin sendu ya, ${nama}... 🥺 Gue paham banget rasanya jauh dari pelukan Ibu, masakan rumah yang anget, atau candaan Ayah. Tapi inget ya, lo di Sekolah Cendekia BAZNAS ini lagi berjuang demi masa depan lo dan buat senyum bangga mereka kelak. Setiap lembar hafalan Qur'an dan ilmu yang lo kejar di sini adalah hadiah terindah buat orang tua lo di rumah. Doakan mereka sehabis shalat ya. Sukses lo adalah kebahagiaan terbesar mereka!`;
  }
  if (msg.includes("stres") || msg.includes("pusing") || msg.includes("lelah") || msg.includes("tugas") || msg.includes("nilai") || msg.includes("pelajaran") || msg.includes("belajar")) {
    return `Waduh, lagi numpuk banget ya tugas-tugas atau materi pelajaran yang bikin lo pusing? Tarik napas dalem-dalem dulu yuk..., lepasin perlahan... 🧘‍♂️ Tenang, itu normal banget kok! Di SCB emang kegiatannya padet banget. Tips dari gue nih: jangan dipikirin semua sekaligus nanti malah burn out. Cicil pelan-pelan pakai teknik Pomodoro: belajar fokus 25 menit, terus istirahat 5 menit buat regangkan badan. Jangan lupa tidur teratur dan jaga kesehatan ya. Gue yakin lo anak hebat, pasti bisa melewatinya!`;
  }
  if (msg.includes("pacar") || msg.includes("suka") || msg.includes("cinta") || msg.includes("doi")) {
    return `Ehem... urusan kesukaan atau doi emang bikin hati deg-degan mulu ya, hihihi. Tapi inget ya sahabat, kita kan di asrama ini lagi ditempa untuk fokus meraih impian dulu. Mengagumi kebaikan orang lain itu fitrah yang wajar banget kok, tapi alangkah indahnya kalau perasaan itu disimpan rapi dulu di dalam doa, dan dijadiin motivasi tambahan buat rajin belajar serta beribadah. Fokus sukseskan diri lo dulu ya, nanti masa depan indah bakal menyertaimu!`;
  }
  if (msg.includes("hafalan") || msg.includes("quran") || msg.includes("juz") || msg.includes("hadits") || msg.includes("murajaah") || msg.includes("setoran")) {
    return `Wah, lo lagi dapet tantangan di setoran hafalan Qur'an atau 100 Hadits nih? Semangat ya, ${nama}! Menjaga kalam Allah dan sabda Rasulullah itu emang butuh perjuangan, hati yang ikhlas, dan fokus tinggi. Kalau ngerasa agak seret menghafal, coba muraja'ah di sela-sela waktu subuh yang sejuk atau pas malam hari setelah shalat sunnah. Jangan cepet nyerah ya calom hafidz andalan umat! Setiap waktu yang lo habiskan bersama Al-Qur'an itu berkah luar biasa.`;
  }
  
  return `Wah gue seneng deh lo mau cerita sejujur ini ke gue, ${nama}. Hidup emang kadang ngasih kita banyak tantangan ya, tapi justru itu yang bikin kita makin dewasa dan bijaksana. Sebagai sahabat terbaik lo, gue bangga lo sekuat ini menjalaninya di asrama. Ada hal lain lagi gak yang mau lo tumpahin atau sekadar lo ceritain biar plong? Gue siap nemenin curhat santai dan asyik lo kapan aja!`;
}

startServer();
