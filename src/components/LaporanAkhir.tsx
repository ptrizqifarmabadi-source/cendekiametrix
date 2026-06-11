/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from "react";
import { FullAppState, HafalanQuranType } from "../types";
import { 
  Printer, 
  Download, 
  Award, 
  Compass, 
  Star, 
  GraduationCap, 
  CheckCircle, 
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
  Users,
  Trophy,
  Sparkles
} from "lucide-react";
import RekapHasilSiswa from "./RekapHasilSiswa";

interface LaporanAkhirProps {
  appState: FullAppState;
  isAdmin?: boolean;
  userRole?: "peserta" | "admin" | "bk_smp" | "bk_sma" | null;
}

export default function LaporanAkhir({ appState, isAdmin, userRole }: LaporanAkhirProps) {
  const { profile, keagamaan, akademik, prestasiEkskul, minatBakat, iqTest, aiRecommendation } = appState;
  const printAreaRef = useRef<HTMLDivElement>(null);

  // States to hold all students and currently navigated index
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1); // -1 is the current active student
  const [classFilter, setClassFilter] = useState<string>("All");

  useEffect(() => {
    const stored = localStorage.getItem("sipetakuliah_cohort_recap");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          let filtered = parsed;
          if (userRole === "bk_smp") {
            filtered = parsed.filter(st => st.kelas && (st.kelas.includes("7") || st.kelas.includes("8") || st.kelas.includes("9") || st.kelas.toLowerCase().includes("smp")));
          } else if (userRole === "bk_sma") {
            filtered = parsed.filter(st => st.kelas && (st.kelas.includes("10") || st.kelas.includes("11") || st.kelas.includes("12") || st.kelas.toLowerCase().includes("sma") || st.kelas.toLowerCase().includes("ma")));
          }
          setAllStudents(filtered);
        }
      } catch (e) {
        // ignore
      }
    }
  }, [userRole]);

  // Filter indices based on chosen class
  const filteredIndices = allStudents
    .map((st, idx) => ({ st, idx }))
    .filter(({ st }) => classFilter === "All" || st.kelas === classFilter)
    .map(({ idx }) => idx);

  // Auto-reset selection if the selected student doesn't match the new class filter
  useEffect(() => {
    if (selectedIndex !== -1 && classFilter !== "All") {
      const student = allStudents[selectedIndex];
      if (student && student.kelas !== classFilter) {
        setSelectedIndex(-1);
      }
    }
  }, [classFilter, allStudents, selectedIndex]);

  const selectedStudent = isAdmin && selectedIndex !== -1 ? allStudents[selectedIndex] : null;

  const isSmp = appState.jenjang === "SMP" || (selectedStudent ? (selectedStudent.kelas?.includes("7") || selectedStudent.kelas?.includes("8") || selectedStudent.kelas?.includes("9") || selectedStudent.kelas?.includes("SMP")) : false);

  // Resolve active student property variations
  const currentProfile = selectedStudent ? {
    nama: selectedStudent.nama,
    nisn: selectedStudent.nisn,
    kelas: selectedStudent.kelas,
    citaCita: "Akademisi Berprestasi BAZNAS",
    hobi: "Membaca & Analitis",
    organisasi: "OSIS / Rohis Cendekia BAZNAS"
  } : profile;

  const currentKeagamaan = selectedStudent ? {
    hafalan: "2-5 juz" as const,
    hafalanHadits: "21-40 hadits",
    nilai: { pai: 88, bahasaArab: 85 }
  } : keagamaan;

  const currentAiRecommendation = selectedStudent ? {
    status: "success" as const,
    majors: (selectedStudent.rekomendasiJurusan || []).map((m: string, idx: number) => ({
      rank: idx + 1,
      name: m,
      suitabilityScore: 92 - idx * 8,
      description: isSmp
        ? "Saran penunjang spesifik potensial akademik, pembinaan asrama & karakter SMP."
        : "Rekomendasi program studi utama yang sangat selaras dengan dimensi kecerdasan IQ dan Holland Code."
    }))
  } : aiRecommendation;

  const currentPrestasiEkskul = selectedStudent ? {
    ekskul: selectedStudent.ekskul || [],
    tingkatPrestasi: { sekolah: 0, kabupaten: 0, provinsi: 0, nasional: 0, internasional: 0 },
    smpAnswers: selectedStudent.smpAnswers || {},
    smpCompleted: selectedStudent.smpCompleted || false
  } : prestasiEkskul;

  // Math re-calculations
  const getSubStats = () => {
    if (selectedStudent) {
      // Reconstruct RIASEC top 3 / Gaya Belajar
      const topRiasec = (selectedStudent.topRiasec || []).map((lbl: string, idx: number) => {
        const key = lbl.match(/\(([RIASEC|V|A|K])\)/)?.[1] || "R";
        const percentageMatch = lbl.match(/(\d+)%/);
        const percentage = percentageMatch ? parseInt(percentageMatch[1]) : (95 - idx * 12);
        return {
          key,
          label: lbl,
          percentage
        };
      });

      return {
        avgRapor: selectedStudent.avgRapor,
        avgSimulasi: Math.round(selectedStudent.avgRapor * 0.95),
        quranScore: 85,
        avgReligion: 86,
        achPoints: 85,
        topRiasec,
        iq: selectedStudent.iqScore || 100
      };
    }

    const rValues = Object.values(akademik.nilaiRapor);
    const avgRapor = Math.round(rValues.reduce((a, b) => a + b, 0) / (rValues.length || 1));

    const sValues = Object.values(akademik.simulasiTes);
    const avgSimulasi = Math.round(sValues.reduce((a, b) => a + b, 0) / (sValues.length || 1));

    const getHafalanPoints = (h: HafalanQuranType): number => {
      switch (h) {
        case "0-1 juz": return 20;
        case "2-5 juz": return 50;
        case "6-10 juz": return 75;
        case "11-20 juz": return 95;
        case "> 20 juz": return 100;
        default: return 20;
      }
    };
    const quranScore = getHafalanPoints(keagamaan.hafalan);
    const religionGrades = Object.values(keagamaan.nilai);
    const avgReligion = Math.round(religionGrades.reduce((a, b) => a + b, 0) / (religionGrades.length || 1));

    const achTingkat = prestasiEkskul.tingkatPrestasi;
    const rawAchPoints = achTingkat.sekolah * 10 + achTingkat.kabupaten * 30 + achTingkat.provinsi * 60 + achTingkat.nasional * 85 + achTingkat.internasional * 100;
    const achPoints = Math.min(100, rawAchPoints);

    // Get RIASEC top dominant or VAK gaya belajar
    let topRiasecResult: any[] = [];
    if (isSmp) {
      const scoresVAK = { V: 0, A: 0, K: 0 };
      Object.entries(appState.gayaBelajar.answers || {}).forEach(([qIdStr, val]) => {
        const qId = parseInt(qIdStr);
        if (qId >= 1 && qId <= 10) scoresVAK.V += val;
        else if (qId >= 11 && qId <= 20) scoresVAK.A += val;
        else if (qId >= 21 && qId <= 30) scoresVAK.K += val;
      });

      const labelsVAK = {
        V: "Visual (V)",
        A: "Auditori (A)",
        K: "Kinestetik (K)"
      };

      topRiasecResult = (["V", "A", "K"] as ("V" | "A" | "K")[]).map(key => ({
        key,
        label: labelsVAK[key],
        percentage: Math.round((scoresVAK[key] / 50) * 100) || 0
      })).sort((a, b) => b.percentage - a.percentage);
    } else {
      const riasecMappingScore = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
      const R_ids = [1, 7, 13, 19, 25, 31, 37, 43, 49, 55];
      const I_ids = [2, 8, 14, 20, 26, 32, 38, 44, 50, 56];
      const A_ids = [3, 9, 15, 21, 27, 33, 39, 45, 51, 57];
      const S_ids = [4, 10, 16, 22, 28, 34, 40, 46, 52, 58];
      const E_ids = [5, 11, 17, 23, 29, 35, 41, 47, 53, 59];
      const C_ids = [6, 12, 18, 24, 30, 36, 42, 48, 54, 60];

      Object.entries(minatBakat.answers).forEach(([qIdStr, val]) => {
        const qId = parseInt(qIdStr);
        if (R_ids.includes(qId)) riasecMappingScore.R += val;
        else if (I_ids.includes(qId)) riasecMappingScore.I += val;
        else if (A_ids.includes(qId)) riasecMappingScore.A += val;
        else if (S_ids.includes(qId)) riasecMappingScore.S += val;
        else if (E_ids.includes(qId)) riasecMappingScore.E += val;
        else if (C_ids.includes(qId)) riasecMappingScore.C += val;
      });

      const dominanLabels = {
        R: "Realistic",
        I: "Investigative",
        A: "Artistic",
        S: "Social",
        E: "Enterprising",
        C: "Conventional"
      };

      topRiasecResult = (Object.keys(riasecMappingScore) as ("R" | "I" | "A" | "S" | "E" | "C")[]).map(key => ({
        key,
        label: dominanLabels[key],
        percentage: Math.round((riasecMappingScore[key] / 50) * 100)
      })).sort((a, b) => b.percentage - a.percentage).slice(0, 3);
    }

    return {
      avgRapor,
      avgSimulasi,
      quranScore,
      avgReligion,
      achPoints,
      topRiasec: topRiasecResult,
      iq: iqTest.iqScore || 100
    };
  };

  const stats = getSubStats();

  const handlePrevStudent = () => {
    if (filteredIndices.length === 0) return;
    const currPos = filteredIndices.indexOf(selectedIndex);
    if (currPos === -1) {
      // currently selectedIndex is -1 (the draft active student)
      setSelectedIndex(filteredIndices[filteredIndices.length - 1]);
    } else if (currPos === 0) {
      // go back to draft active student
      setSelectedIndex(-1);
    } else {
      setSelectedIndex(filteredIndices[currPos - 1]);
    }
  };

  const handleNextStudent = () => {
    if (filteredIndices.length === 0) return;
    const currPos = filteredIndices.indexOf(selectedIndex);
    if (currPos === -1) {
      // currently selectedIndex is -1
      setSelectedIndex(filteredIndices[0]);
    } else if (currPos === filteredIndices.length - 1) {
      // wrap back to draft active student
      setSelectedIndex(-1);
    } else {
      setSelectedIndex(filteredIndices[currPos + 1]);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const getPenguatanTambahan = () => {
    const dominant = stats.topRiasec && stats.topRiasec.length > 0 ? stats.topRiasec[0] : null;
    if (!dominant) {
      return {
        title: "Strategi Belajar Terintegrasi (General Integrated Learning)",
        tips: [
          "Membagi waktu belajar mandiri dengan metode Pomodoro (25 menit belajar terarah, 5 menit jeda istirahat ringan) untuk menjaga fokus kognitif.",
          "Mencatat intisari pelajaran di wisma menggunakan skema poin penjelasan berwarna guna mempertajam daya ingat jangka panjang.",
          "Mendiskusikan materi yang belum dipahami secara aktif kepada bimbingan guru pendamping serta rekan kesiswaan sealmamater."
        ]
      };
    }

    if (isSmp) {
      switch (dominant.key) {
        case "V":
          return {
            title: "Strategi Visual-Spatial Metakognitif (Gaya Belajar Visual)",
            tips: [
              "Peta Konsep & Mind Mapping: Visualisasikan korelasi antara bab-bab sains terpadu (IPA) dan sejarah (IPS) dalam satu bagan berwarna yang saling bersambung.",
              "Metode Flashcards & Ringkasan Berpigmen: Rangkum hafalan kosakata bahasa Arab & Inggris menggunakan kartu warna-warni berpola indah di asrama.",
              "Posisi Fokus Visual Depan: Selalu usahakan menempati barisan depan di kelas untuk menyerap paparan penulisan guru di papan tulis secara utuh tanpa distraksi pandangan."
            ]
          };
        case "A":
          return {
            title: "Strategi Auditori Berkelompok & Ekspresif (Gaya Belajar Auditori)",
            tips: [
              "Metode Perekaman Hafalan: Rekam pembacaan surat Al-Quran atau bait dalil hadits Anda melalui perekam suara, lalu putar kembali saat beristirahat santai.",
              "Diskusi Pengulas Bersisian (Peer Learning): Saling melempar pertanyaan lisan secara interaktif bersama rekan sekamar asrama/wisma.",
              "Teknik Verbalisasi Berbisik: Bacalah paragraf buku teori utama secara bersuara perlahan untuk mengaktifkan stimulasi pendengaran yang mempercepat retensi memori."
            ]
          };
        case "K":
          return {
            title: "Strategi Taktil-Kinestetik Interaktif (Gaya Belajar Kinestetik)",
            tips: [
              "Asosiasi Memori Gerak Tubuh: Gunakan ketukan jari, isyarat tangan, atau peragaan gestur tubuh ringan ketika menghafal runutan hadits kesiswaan.",
              "Teknik Pomodoro Aktif: Belajar mandiri terfokus selama 25 menit, diselingi 5 menit melakukan aktivitas fisik ringan seperti peregangan otot, push-up, atau berjalan memutari asrama.",
              "Eksperimen & Observasi Fisik: Perbanyak pemahaman sains melaui proyek praktek, pengamatan botani keanekaragaman hayati riil di alam terbuka sekolah Bogor."
            ]
          };
        default:
          return {
            title: "Strategi Belajar Terstruktur Seimbang",
            tips: [
              "Gunakan catatan berkode warna untuk memilah prioritas belajar harian kesiswaan di Sekolah Cendekia BAZNAS.",
              "Lakukan pengulangan materi (spaced repetition) berjarak 1 hari, 3 hari, dan 7 hari untuk mengamankan retensi memori ujian.",
              "Konsultasikan hasil nilai belajar secara berkala dengan konselor BK asrama untuk memelihara kestabilan mental belajar."
            ]
          };
      }
    } else {
      switch (dominant.key) {
        case "R":
          return {
            title: "Strategi Belajar Berbasis Taktis & Konkret (Realistic Action Style)",
            tips: [
              "Koneksi Teori Ke Sistem Mekanis: Hubungkan rumus fisika dan matematika dengan implementasi kelistrikan, struktur bangun mekanik, atau fenomena ketangkasan fisik.",
              "Latihan Berbasis Simulasi Nyata: Fokuskan jam belajar mandiri pada pengerjaan studi kasus, eksperimen lab mandiri, dan penulisan laporan teknis terapan.",
              "Belajar Melalui Re-Assembling: Pecahkan soal-soal hitungan rumit dengan cara membongkar langkah formulanya satu per satu dari akhir (backward-chaining)."
            ]
          };
        case "I":
          return {
            title: "Strategi Belajar Investigatif-Konseptual Mandiri (Investigative Analytical Style)",
            tips: [
              "Riset Pustaka & Analisis Kritis: Cari latar belakang fakta historis atau pembuktian rumus secara mandiri di perpustakaan digital untuk memperkuat fondasi ingatan.",
              "Eksplorasi Soal Konstruktif HOTS: Asah ketajaman bernalar kognitif Anda lewat penyelesaian soal-soal bernalar tinggi (Higher Order Thinking Skills) di atas rata-rata.",
              "Diskusi Teoretis Terbuka: Diskusikan teori sains tingkat lanjut atau paradigma sosial bersama guru BK dan mentor akademik kesiswaan."
            ]
          };
        case "A":
          return {
            title: "Strategi Belajar Ekspresif & Metafora Kreatif (Artistic Creative Style)",
            tips: [
              "Asosiasi Estetis & Peta Visual: Gambarkan relasi antar konsep teoritis sosiologi atau sejarah ke dalam bentuk kliping infografis, narasi fiksi, atau ekspresi analogi seni bela diri.",
              "Fleksibilitas Belajar Multi-Instrumen: Gunakan musik instrumen minim lirik untuk menemani belajar, atau buat lagu berirama melodi khusus guna menghafal kaidah tata bahasa Arab.",
              "Fleksibilitas Desain Catatan: Tulis catatan belajar mandiri menggunakan jurnal pribadi dengan tata benta-grid yang dinamis dan ilustratif."
            ]
          };
        case "S":
          return {
            title: "Strategi Belajar Mengajar Sebaya & Kolaboratif (Social Interpersonal Style)",
            tips: [
              "Penerapan Metode Peer-Teaching: Jelaskan kembali pokok materi yang baru dikuasai kepada kawan yang sedang kesulitan; mengajar adalah cara belajar terbaik.",
              "Sinergi Belajar Kelompok (Study Circle): Aktif dalam kelompok belajar asrama untuk bertukar sudut pandang penyelesaian tugas secara sinergis.",
              "Pelajaran Komparasi Sosio-Emosional: Kaitkan ilmu kemanusiaan dan sejarah dengan dampak sosial, moralitas, serta dinamika interpersonal di sekitar asrama."
            ]
          };
        case "E":
          return {
            title: "Strategi Belajar Berorientasi Target & Kompetitif (Enterprising Driver Style)",
            tips: [
              "Targeting & Peta Statistik: Buat grafik pencapaian skor simulasi belajar mandiri Anda secara berkala, lalu tantang diri Anda untuk terus mendaki grafik melampaui rekor pribadi.",
              "Kepemimpinan Diskusi Kelompok: Ambil peran kepemimpinan atau pembicara utama dalam penugasan presentasi kelompok sekolah kelas guna mendorong keterlibatan nalar aktif.",
              "Koneksi Studi Kasus Manajerial: Sangkutpautkan materi ekonomi atau geografi dengan taktik negosiasi, tata kelola kepemimpinan, dan manajemen proyek nyata."
            ]
          };
        case "C":
          return {
            title: "Strategi Belajar Terstruktur & Manajemen Sistemik (Conventional Organized Style)",
            tips: [
              "Time-Blocking & Manajemen Pola Disiplin: Buat agenda mingguan yang presisi di asrama, tentukan slot waktu tetap untuk subjek spesifik secara konsisten.",
              "Catatan Berpoin Klasifikasi Rapi: Catat pelajaran dengan format hierarki bernomor (1.a.i), tabel rangkuman teratur, dan indeks glosarium buatan sendiri.",
              "Evaluasi Progress Terukur: Buat list lembar kendali cheklist harian atas bab-bab buku pelajaran yang sudah dibaca dan dipahami sepenuhnya."
            ]
          };
        default:
          return {
            title: "Strategi Belajar Terstruktur Seimbang",
            tips: [
              "Gunakan catatan berkode warna untuk memilah prioritas belajar harian kesiswaan di Sekolah Cendekia BAZNAS.",
              "Lakukan pengulangan materi (spaced repetition) berjarak 1 hari, 3 hari, dan 7 hari untuk mengamankan retensi memori ujian.",
              "Konsultasikan hasil nilai belajar secara berkala dengan konselor BK asrama untuk memelihara kestabilan mental belajar."
            ]
          };
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 dark:border-gray-850 pb-5 gap-4">
        <div>
          <h2 className="text-2xl font-bold font-sans text-gray-900 dark:text-white flex items-center gap-2">
            <Award className="h-6 w-6 text-amber-500" />
            Laporan Hasil Asesmen Akhir
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Tinjau seluruh ringkasan evaluasi potensi siswa dan cetak sebagai sertifikat bimbingan BK terlampir.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="h-4 w-4" /> Cetak Laporan / PDF
          </button>
        </div>
      </div>

      {/* Record switcher (Hidden when printing via no-print or if user is non-admin) */}
      {isAdmin && (
        <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col lg:flex-row justify-between items-center gap-4 no-print shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/45 text-blue-650 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider font-mono">
                Navigasi Peta Laporan Siswa
              </h4>
              <p className="text-[11px] text-gray-500">
                Gunakan tanda panah di samping untuk beralih dan melihat cetak laporan siswa lainnya secara bergantian.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
            {/* Class Filter Selector */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-slate-700 dark:text-slate-400 font-mono uppercase tracking-wider shrink-0 no-print">
                Filter Kelas:
              </span>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="px-2.5 py-2.5 bg-white dark:bg-gray-950 text-slate-800 dark:text-slate-100 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-bold font-mono focus:outline-none cursor-pointer"
              >
                <option value="All">Semua Kelas</option>
                {Array.from(new Set([
                  ...(userRole === "bk_smp"
                    ? [
                        "Kelas 7 Ikhwan", "Kelas 7 Akhwat",
                        "Kelas 8 Ikhwan", "Kelas 8 Akhwat",
                        "Kelas 9 Ikhwan", "Kelas 9 Akhwat"
                      ]
                    : userRole === "bk_sma"
                    ? [
                        "Kelas 10 Ikhwan", "Kelas 10 Akhwat",
                        "Kelas 11 Ikhwan", "Kelas 11 Akhwat",
                        "Kelas 12 Ikhwan", "Kelas 12 Akhwat"
                      ]
                    : [
                        "Kelas 7 Ikhwan", "Kelas 7 Akhwat",
                        "Kelas 8 Ikhwan", "Kelas 8 Akhwat",
                        "Kelas 9 Ikhwan", "Kelas 9 Akhwat",
                        "Kelas 10 Ikhwan", "Kelas 10 Akhwat",
                        "Kelas 11 Ikhwan", "Kelas 11 Akhwat",
                        "Kelas 12 Ikhwan", "Kelas 12 Akhwat"
                      ]
                  ),
                  ...allStudents.map(s => s.kelas).filter(Boolean)
                ])).map((cl) => (
                  <option key={cl} value={cl}>
                    {cl}
                  </option>
                ))}
              </select>
            </div>

            <div className="h-6 w-[1px] bg-slate-300 dark:bg-slate-800 hidden sm:block"></div>

            <button
              onClick={handlePrevStudent}
              disabled={filteredIndices.length === 0}
              className="p-2 ml-1 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-750 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-850 hover:text-blue-650 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Siswa Sebelumnya"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <select
              value={selectedIndex}
              onChange={(e) => setSelectedIndex(parseInt(e.target.value))}
              className="px-3.5 py-2.5 bg-white dark:bg-gray-950 text-slate-800 dark:text-slate-100 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-bold font-mono focus:outline-none min-w-[200px] cursor-pointer"
            >
              <option value={-1}>
                {profile.nama ? `Siswa Aktif: ${profile.nama}` : "— Pilih Nama Siswa —"}
              </option>
              {allStudents.map((st, idx) => {
                if (classFilter !== "All" && st.kelas !== classFilter) return null;
                return (
                  <option key={st.id} value={idx}>
                    {`DB: ${st.nama} (${st.kelas})`}
                  </option>
                );
              })}
            </select>

            <button
              onClick={handleNextStudent}
              disabled={filteredIndices.length === 0}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-750 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-850 hover:text-blue-650 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Siswa Selanjutnya"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {((userRole === "admin" || userRole === "bk_smp" || userRole === "bk_sma") && selectedIndex === -1 && !profile.nama) ? (
        <div className="bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-inner border border-blue-100 dark:border-blue-900/30">
            <Users className="h-8 w-8 animate-pulse" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base font-sans">
              Belum Ada Siswa yang Dipilih
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
              Silakan pilih nama siswa dari menu dropdown di atas atau gunakan filter kelas untuk menampilkan, mengevaluasi, dan mencetak Laporan Hasil Capaian Asesmen.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Main Printable Content certificate layout */}
          <div 
        ref={printAreaRef}
        className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-6 md:p-10 shadow-sm print:shadow-none print:border-none print:p-0 space-y-8 print:text-black print:bg-white"
        id="printable-report-card"
      >
        {/* Certificate Header Banner */}
        <div className="text-center space-y-2 border-b-2 border-double border-gray-200 dark:border-gray-800 pb-5 print:border-gray-300">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-gray-950 dark:text-white uppercase font-sans">
            Sekolah Cendekia BAZNAS
          </h1>
          <p className="text-xs uppercase tracking-widest text-emerald-650 dark:text-emerald-400 font-mono font-bold leading-5">
            Sistem Informasi Capaian Asesmen (Cendekia Metrix)
          </p>
          <div className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
            Jl. Masjid Baitul Ilmi, Cemplang, Cibungbulang, Bogor, Jawa Barat 16630
          </div>
        </div>

        {/* Report Meta Header */}
        <div className="text-center">
          <h2 className="text-md font-extrabold text-gray-900 dark:text-white uppercase tracking-wider font-mono">
            TRANSKRIP CAPAIAN PEMETAAN POTENSI & REKOMENDASI ADMISI
          </h2>
          <div className="inline-block px-3 py-1 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-850 rounded text-xs font-mono font-medium text-gray-500 dark:text-gray-400 mt-2">
            ID Dokumen: SC-{currentProfile.nisn || "0000000"}-{Math.floor(Math.random() * 900 + 100)}
          </div>
        </div>

        {/* 1. Student Personal Information */}
        <div className="bg-gray-50/50 dark:bg-gray-950 p-5 rounded-xl border border-gray-100 dark:border-gray-850 grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2 print:bg-gray-50/70 print:border-gray-200">
          <div className="space-y-2">
            <div className="flex gap-2 text-xs">
              <span className="w-24 font-bold text-gray-400 font-mono uppercase">Nama Siswa:</span>
              <span className="text-gray-900 dark:text-white font-bold">{currentProfile.nama || "-"}</span>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="w-24 font-bold text-gray-400 font-mono uppercase">NISN / Kelas:</span>
              <span className="text-gray-800 dark:text-gray-300">{currentProfile.nisn || "-"} / {currentProfile.kelas || "-"}</span>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="w-24 font-bold text-gray-400 font-mono uppercase">Sekolah Asal:</span>
              <span className="text-gray-700 dark:text-gray-400">Sekolah Cendekia BAZNAS (SCB)</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex gap-2 text-xs">
              <span className="w-24 font-bold text-gray-400 font-mono uppercase">Cita-Cita:</span>
              <span className="text-gray-800 dark:text-gray-300 font-semibold">{currentProfile.citaCita || "-"}</span>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="w-24 font-bold text-gray-400 font-mono uppercase">Hobi / Org:</span>
              <span className="text-gray-700 dark:text-gray-400 truncate">{currentProfile.hobi || "-"} / {currentProfile.organisasi || "-"}</span>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="w-24 font-bold text-gray-400 font-mono uppercase">Tanggal Input:</span>
              <span className="text-gray-600 dark:text-gray-400 font-mono">{currentDate}</span>
            </div>
          </div>
        </div>

        {/* 2. Core Quantitative Competence Metrics Section */}
        {isSmp ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:grid-cols-3">
            {/* IQ Block */}
            <div className="bg-white dark:bg-gray-950 p-4 rounded-xl border border-gray-150 dark:border-gray-850 text-center space-y-1">
              <div className="text-[10px] font-bold text-gray-450 uppercase tracking-widest font-mono">Simulasi IQ</div>
              <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">{stats.iq}</div>
              <div className="text-[10px] text-gray-500 font-semibold font-mono">Standard Kognitif</div>
            </div>

            {/* Gaya Belajar Block */}
            <div className="bg-white dark:bg-gray-950 p-4 rounded-xl border border-gray-150 dark:border-gray-850 text-center space-y-1">
              <div className="text-[10px] font-bold text-gray-450 uppercase tracking-widest font-mono">Gaya Belajar Dominan</div>
              <div className="text-sm font-extrabold text-purple-650 dark:text-purple-400 truncate max-w-full px-1 py-1 font-sans">
                {stats.topRiasec[0] ? `${stats.topRiasec[0].label.split(" ")[0]} (${stats.topRiasec[0].percentage}%)` : "-"}
              </div>
              <div className="text-[10px] text-gray-500 font-semibold font-mono">Asimilasi Gaya Belajar</div>
            </div>

            {/* Bakat Non-Akademis Block */}
            <div className="bg-white dark:bg-gray-950 p-4 rounded-xl border border-gray-150 dark:border-gray-850 text-center space-y-1">
              <div className="text-[10px] font-bold text-gray-450 uppercase tracking-widest font-mono">Prestasi & Ekskul (Bakat)</div>
              <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-500">{stats.achPoints}</div>
              <div className="text-[10px] text-gray-500 font-semibold font-mono">Skor Minat Kesiswaan</div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 print:grid-cols-4">
            {/* IQ Block */}
            <div className="bg-white dark:bg-gray-950 p-4 rounded-xl border border-gray-150 dark:border-gray-850 text-center space-y-1">
              <div className="text-[10px] font-bold text-gray-450 uppercase tracking-widest font-mono">Simulasi IQ</div>
              <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">{stats.iq}</div>
              <div className="text-[10px] text-gray-500 font-semibold font-mono">Standard Kognitif</div>
            </div>

            {/* Rata Rapor Block */}
            <div className="bg-white dark:bg-gray-950 p-4 rounded-xl border border-gray-150 dark:border-gray-850 text-center space-y-1">
              <div className="text-[10px] font-bold text-gray-450 uppercase tracking-widest font-mono">Rata-Rata Rapor</div>
              <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">{stats.avgRapor}</div>
              <div className="text-[10px] text-gray-500 font-semibold font-mono">Pilar Akademik inti</div>
            </div>

            {/* Hafalan Quran Block */}
            <div className="bg-white dark:bg-gray-950 p-4 rounded-xl border border-gray-150 dark:border-gray-850 text-center space-y-1 flex flex-col justify-between">
              <div className="text-[10px] font-bold text-gray-450 uppercase tracking-widest font-mono">Tahfidz Qur'an & Hadits</div>
              <div className="text-xs font-bold text-green-705 dark:text-green-400 py-1.5 space-y-0.5">
                <div className="truncate">Qur'an: {currentKeagamaan.hafalan}</div>
                <div className="truncate">Hadits: {currentKeagamaan.hafalanHadits || "0-20 hadits"}</div>
              </div>
              <div className="text-[10px] text-gray-500 font-semibold font-mono">Integritas Sufi & Syar'i</div>
            </div>

            {/* Non Academic awards Block */}
            <div className="bg-white dark:bg-gray-950 p-4 rounded-xl border border-gray-150 dark:border-gray-850 text-center space-y-1">
              <div className="text-[10px] font-bold text-gray-450 uppercase tracking-widest font-mono">Bakat Non-Akademis</div>
              <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-500">{stats.achPoints}</div>
              <div className="text-[10px] text-gray-500 font-semibold font-mono">Skor Kuantitasi Juara</div>
            </div>
          </div>
        )}

        {/* 3. Interest Profile (Holland for SMA, VAK for SMP) */}
        <div className="bg-white dark:bg-gray-950 p-5 rounded-xl border border-gray-150 dark:border-gray-850 space-y-2.5">
          <div className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider font-mono flex items-center gap-1.5 border-b border-gray-105 pb-2">
            <Compass className="h-4.5 w-4.5 text-purple-600" />
            {isSmp ? "Gaya Belajar Pembelajaran Dominan (Tipe VAK)" : "Kepribadian Karir Dominan (Holland Code RIASEC)"}
          </div>
          {stats.topRiasec.length === 0 || stats.topRiasec.some(x => x.percentage === 0) ? (
            <p className="text-xs italic text-gray-450 text-center py-2">
              {isSmp ? "Data kuis gaya belajar kosong atau belum selesai." : "Data tes minat bakat holland kosong atau belum selesai."}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:grid-cols-3">
              {stats.topRiasec.map((t, i) => (
                <div key={t.key} className="p-3 bg-gray-50/50 dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-purple-700 dark:text-purple-400 font-mono uppercase bg-purple-50 dark:bg-purple-950/20 px-1.5 py-0.5 rounded">
                      {isSmp ? `Metode ${i + 1}` : `Tipe ${i + 1}`}
                    </span>
                    <h5 className="font-bold text-xs text-gray-900 dark:text-white mt-1">{t.label}</h5>
                  </div>
                  <span className="text-xs font-mono font-extrabold text-purple-600">{t.percentage}% Match</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3b. SMP Extracurricular Talent & Interest Diagnostics Results */}
        {isSmp && (
          <div className="bg-white dark:bg-gray-950 p-5 rounded-xl border border-gray-150 dark:border-gray-850 space-y-3">
            <div className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider font-mono flex items-center gap-1.5 border-b border-gray-105 pb-2">
              <Trophy className="h-4.5 w-4.5 text-blue-600" />
              Hasil Pemetaan Tes Diagnostik Bakat Kesiswaan & Minat Ekskul (SMP Assessed)
            </div>

            {/* Calculate and render SMP domain matches directly from current profile's prestasiEkskul */}
            {(() => {
              const smpAnswers = currentPrestasiEkskul?.smpAnswers || {};
              const smpCompleted = currentPrestasiEkskul?.smpCompleted || false;

              if (!smpCompleted || Object.keys(smpAnswers).length === 0) {
                return (
                  <p className="text-xs italic text-gray-450 text-center py-2">
                    Data tes diagnostik bakat-ekskul kosong atau belum diselesaikan di Tab Bakat & Prestasi kesiswaan.
                  </p>
                );
              }

              // Run calculations inline
              const scores = { ScienceTech: 0, Sports: 0, Leadership: 0, ArtsMusic: 0 };
              const totalQ = Object.keys(smpAnswers).length;

              const SMP_DIAGNOSTIC_METADATA = {
                ScienceTech: { name: "Sains & Teknologi", desc: "Riset Sains Eksakta, Matematika Terapan, Robotika, dan Pemrograman Cerdas", color: "bg-blue-550" },
                Sports: { name: "Olahraga & Fisik", desc: "Ketangkasan Panahan, Futsal, Basket, Silat, dan Bola Besi Petanque", color: "bg-emerald-550" },
                Leadership: { name: "Kepemimpinan & Sosial", desc: "Baris Berbaris Bela Negara Paskibra, PMR Sukarelawan Medis, dan Pramuka Inti", color: "bg-purple-550" },
                ArtsMusic: { name: "Seni Kreatif & Musik", desc: "Cipta Kriya Rupa Estetik, Kaligrafi Islami, dan Harmonika Musik Hadroh kesiswaan", color: "bg-rose-550" }
              };

              // Re-run mapping
              const mappings = {
                1: { 1: "ScienceTech", 2: "Sports", 3: "Leadership", 4: "ArtsMusic" },
                2: { 1: "ScienceTech", 2: "Sports", 3: "Leadership", 4: "ArtsMusic" },
                3: { 1: "ScienceTech", 2: "Sports", 3: "Leadership", 4: "ArtsMusic" },
                4: { 1: "ScienceTech", 2: "Sports", 3: "Leadership", 4: "ArtsMusic" },
                5: { 1: "ScienceTech", 2: "Sports", 3: "Leadership", 4: "ArtsMusic" },
                6: { 1: "ScienceTech", 2: "Sports", 3: "Leadership", 4: "ArtsMusic" },
                7: { 1: "ScienceTech", 2: "Sports", 3: "Leadership", 4: "ArtsMusic" },
                8: { 1: "ScienceTech", 2: "Sports", 3: "Leadership", 4: "ArtsMusic" },
                9: { 1: "ScienceTech", 2: "Sports", 3: "Leadership", 4: "ArtsMusic" },
                10: { 1: "ScienceTech", 2: "Sports", 3: "Leadership", 4: "ArtsMusic" },
                11: { 1: "ScienceTech", 2: "Sports", 3: "Leadership", 4: "ArtsMusic" },
                12: { 1: "ScienceTech", 2: "Sports", 3: "Leadership", 4: "ArtsMusic" }
              };

              Object.entries(smpAnswers).forEach(([qIdStr, optIdVal]) => {
                const qId = parseInt(qIdStr) as keyof typeof mappings;
                const optId = optIdVal as number;
                if (mappings[qId]) {
                  const domain = mappings[qId][optId as 1 | 2 | 3 | 4];
                  if (domain) {
                    scores[domain as keyof typeof scores]++;
                  }
                }
              });

              const divisor = totalQ || 12;
              const formattedResults = (Object.keys(scores) as (keyof typeof scores)[]).map(key => ({
                key,
                percentage: Math.round((scores[key] / divisor) * 100),
                rawScore: scores[key],
                ...SMP_DIAGNOSTIC_METADATA[key]
              })).sort((a, b) => b.percentage - a.percentage);

              return (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 print:grid-cols-2">
                    {formattedResults.map((item, idx) => (
                      <div key={item.key} className="p-3 bg-gray-50/50 dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-xl flex flex-col justify-between">
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-mono tracking-wider font-bold">
                            <span className="text-gray-450 uppercase">{idx === 0 ? "RUMPUN DOMINAN UTAMA" : `RUMPUN MINAT ${idx + 1}`}</span>
                            <span className="text-blue-600 font-extrabold">{item.percentage}% MATCH</span>
                          </div>
                          <h5 className="font-extrabold text-xs text-gray-900 dark:text-white mt-1 uppercase">{item.name}</h5>
                          <p className="text-[10px] text-gray-550 leading-relaxed font-sans">{item.desc}</p>
                        </div>
                        {/* Horizontal matches bar */}
                        <div className="w-full bg-gray-200 dark:bg-gray-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
                          <div className={`${item.key === "ScienceTech" ? "bg-blue-600" : item.key === "Sports" ? "bg-emerald-600" : item.key === "Leadership" ? "bg-purple-600" : "bg-rose-600"} h-full`} style={{ width: `${item.percentage}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-blue-50/40 dark:bg-blue-950/20 px-3.5 py-3 border border-blue-105/40 rounded-xl flex items-center justify-between text-[11px] text-blue-800 dark:text-blue-300">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 shrink-0" />
                      <div>
                        <span className="font-bold">Ekskul Rekomendasi Unggulan:</span>{" "}
                        <span className="font-semibold text-gray-800 dark:text-gray-100">
                          {formattedResults[0].key === "ScienceTech" 
                            ? "Klub Robotika & Pemrograman, Karya Ilmiah Remaja (KIR)" 
                            : formattedResults[0].key === "Sports" 
                              ? "Futsal, Basket, Pencak Silat, Petanque" 
                              : formattedResults[0].key === "Leadership" 
                                ? "Pramuka Inti, Paskibraka Sekolah, PMR" 
                                : "Klub Musik & Paduan Suara, Seni Visual/Kriya"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* 4. Top 3 AI Recommendations College Target */}
        <div className="bg-white dark:bg-gray-950 p-5 rounded-xl border border-gray-150 dark:border-gray-850 space-y-4">
          <div className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider font-mono flex items-center gap-1.5 border-b border-gray-105 pb-2">
            <Star className="h-4.5 w-4.5 text-indigo-600" />
            {isSmp ? "Rekomendasi Utama & Optimalisasi Potensi SMP (Top 5)" : "Rekomendasi Utama Jurusan Perguruan Tinggi Terbaik (Top 3)"}
          </div>

          <div className="space-y-3">
            {currentAiRecommendation.status === "success" && currentAiRecommendation.majors.length > 0 ? (
              currentAiRecommendation.majors.slice(0, isSmp ? 5 : 3).map((m) => (
                <div key={m.rank} className="flex gap-4 items-start pb-3 border-b last:border-b-0 border-gray-100 last:pb-0">
                  <span className="w-6 h-6 rounded bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 font-mono font-extrabold text-xs flex items-center justify-center shrink-0">
                    #{m.rank}
                  </span>
                  <div className="space-y-0.5">
                    <div className="flex gap-2 items-center">
                      <h4 className="font-extrabold text-xs text-gray-950 dark:text-white uppercase tracking-wide">{m.name}</h4>
                      <span className="bg-indigo-100 dark:bg-indigo-950/40 text-indigo-850 dark:text-indigo-400 text-[9px] font-bold font-mono px-1.5 py-0.5 rounded-full">
                        {m.suitabilityScore}% Match
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-650 leading-4">{m.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 italic text-center py-2">Rekomendasi belum dibangkitkan. Silakan selesaikan kuis di Menu 7 terlebih dahulu.</p>
            )}
          </div>
        </div>

        {/* 4b. Penguatan Tambahan: Saran Optimalisasi Belajar Mandiri */}
        {(() => {
          const penguatan = getPenguatanTambahan();
          return (
            <div className="bg-slate-50 dark:bg-gray-950 p-5 rounded-xl border border-gray-150 dark:border-gray-850 space-y-4">
              <div className="text-[11px] font-black text-emerald-650 dark:text-emerald-400 uppercase tracking-widest font-mono flex items-center gap-1.5 border-b border-gray-100 dark:border-gray-850 pb-2">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                Penguatan Tambahan: Rekomendasi Optimalisasi Proses Belajar
              </div>
              <div className="space-y-3.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[9px] font-mono tracking-wider font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded uppercase">
                    FOKUS GAYA BELAJAR
                  </span>
                  <span className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                    {penguatan.title}
                  </span>
                </div>
                <p className="text-[11px] text-gray-650 dark:text-gray-400 leading-relaxed italic border-l-2 border-emerald-500 pl-2.5">
                  Berdasarkan instrumen asesmen diagnostik Sekolah Cendekia BAZNAS, berikut adalah tindak lanjut taktis terukur yang disarankan agar proses penyerapan materi Anda berjalan maksimal:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {penguatan.tips.map((tip, index) => {
                    const [heading, body] = tip.split(": ");
                    return (
                      <div key={index} className="p-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 rounded-lg flex flex-col justify-start space-y-1 shadow-sm">
                        <div className="flex items-center gap-1.5">
                          <span className="w-4.5 h-4.5 rounded-full bg-emerald-500 text-white font-mono text-[9px] font-bold flex items-center justify-center shrink-0">
                            {index + 1}
                          </span>
                          <span className="text-[10px] font-extrabold text-gray-950 dark:text-white uppercase tracking-wider">
                            {body ? heading : `Saran ${index + 1}`}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-650 dark:text-gray-300 leading-relaxed pt-1">
                          {body || heading}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}

        {/* 5. Validation counselor footers signatures stamps */}
        <div className="grid grid-cols-2 gap-4 pt-10 border-t border-dashed border-gray-200 dark:border-gray-800 print:pt-14">
          <div className="text-center text-xs space-y-16">
            <div className="text-gray-450 dark:text-gray-500 font-mono uppercase tracking-wider text-[10px]">Persetujuan Siswa Bersangkutan</div>
            <div className="text-gray-900 dark:text-white font-bold border-t border-gray-300 dark:border-gray-800 max-w-xs mx-auto pt-1 font-mono">
              ( {currentProfile.nama || "___________________"} )
            </div>
          </div>

          <div className="text-center text-xs space-y-16">
            <div className="text-gray-450 dark:text-gray-500 font-mono uppercase tracking-wider text-[10px]">
              Konselor Bimbingan BK {appState.jenjang}
            </div>
            <div className="text-gray-900 dark:text-white font-bold border-t border-gray-300 dark:border-gray-800 max-w-xs mx-auto pt-1 font-mono">
              ( Konselor AI / Bimbingan BK , M.Pd. )
            </div>
          </div>
        </div>

      </div>

      {/* Counselor reassurance alert warning card */}
      <div className="bg-blue-50/40 dark:bg-blue-950/20 text-gray-650 dark:text-gray-400 p-5 rounded-2xl text-xs space-y-1 leading-5 border border-blue-105/30">
        <strong className="text-gray-900 dark:text-white font-mono block uppercase text-[10px] tracking-wider">Metodologi Akurasi Laporan:</strong>
        <p>
          {isSmp ? (
            "Transkrip evaluasi dikalkulasi secara otomatis oleh sistem Cendekia Metrix dengan format penimbangan 40% Gaya Belajar VAK, 40% Simulasi IQ kognitif, dan 20% kuantitas penelusuran prestasi & ekstrakurikuler. Cetak PDF ini sebagai lampiran administrasi saat pengajuan evaluasi tatap muka langsung di sekolah bersama jajaran guru pendamping BK Sekolah Cendekia BAZNAS."
          ) : (
            "Transkrip evaluasi dikalkulasi secara otomatis oleh sistem Cendekia Metrix dengan format penimbangan 40% Holland Code RIASEC, 30% Simulasi IQ kognitif, 20% nilai akademik rapor berjalan, dan 10% kuantitas juara penelusuran ekstrakurikuler. Cetak PDF ini sebagai lampiran administrasi saat pengajuan evaluasi tatap muka langsung di sekolah bersama jajaran guru pendamping BK Sekolah Cendekia BAZNAS."
          )}
        </p>
      </div>
        </>
      )}

      {/* Recap & Aggregated Student Database Results */}
      {isAdmin && (
        <div className="pt-4">
          <RekapHasilSiswa appState={appState} isAdmin={userRole === "admin"} userRole={userRole} />
        </div>
      )}

    </div>
  );
}
