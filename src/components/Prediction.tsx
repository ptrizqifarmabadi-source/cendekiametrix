/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { FullAppState, HafalanQuranType } from "../types";
import { Compass, ShieldAlert, CheckCircle, HelpCircle, Sparkles, TrendingUp, HelpCircle as Help } from "lucide-react";

interface PredictionProps {
  appState: FullAppState;
  onNext: () => void;
  onPrev: () => void;
}

export default function Prediction({ appState, onNext, onPrev }: PredictionProps) {
  const { profile, keagamaan, akademik, prestasiEkskul, minatBakat, iqTest } = appState;

  // Re-calculate average scores to establish realistic probability mapping
  const getOverallStats = () => {
    // 1. Rapor
    const rValues = Object.values(akademik.nilaiRapor);
    const avgRapor = rValues.reduce((acc, curr) => acc + curr, 0) / (rValues.length || 1);

    // 2. Simulasi
    const sValues = Object.values(akademik.simulasiTes);
    const avgSimulasi = sValues.reduce((acc, curr) => acc + curr, 0) / (sValues.length || 1);

    // 3. Religious Quran
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
    const avgReligionGrades = religionGrades.reduce((a, b) => a + b, 0) / (religionGrades.length || 1);

    // 4. Non-academic achievement
    const achCount = prestasiEkskul.tingkatPrestasi;
    const rawAchPoints = achCount.sekolah * 10 + achCount.kabupaten * 30 + achCount.provinsi * 60 + achCount.nasional * 85 + achCount.internasional * 100;
    const achPoints = Math.min(100, rawAchPoints);

    return {
      avgRapor: Math.round(avgRapor),
      avgSimulasi: Math.round(avgSimulasi),
      quranScore,
      avgReligionGrades: Math.round(avgReligionGrades),
      achPoints,
      iq: iqTest.iqScore || 100
    };
  };

  const stats = getOverallStats();

  const getPathwaysPredictions = () => {
    // Compile 5 major Indonesian college entry pathways
    const paths = [];

    // Pathway 1: SNBP (Seleksi Nasional Berdasarkan Prestasi)
    let snbpScore = Math.round((stats.avgRapor * 0.75) + (stats.achPoints * 0.25));
    if (stats.avgRapor < 75) snbpScore = Math.min(30, snbpScore); // baseline floor
    
    let snbpWarna = "text-rose-600 dark:text-rose-450";
    let snbpBg = "from-rose-50 to-rose-100/30 dark:from-rose-950/10 dark:to-transparent border-rose-100 dark:border-rose-900/30";
    let snbpStatus = "Sulit Bersaing";
    
    if (snbpScore >= 80) {
      snbpWarna = "text-emerald-700 dark:text-emerald-400";
      snbpBg = "from-emerald-50 to-emerald-100/30 dark:from-emerald-950/10 dark:to-transparent border-emerald-100 dark:border-emerald-900/30";
      snbpStatus = "Sangat Berpeluang (Eligible Elit)";
    } else if (snbpScore >= 65) {
      snbpWarna = "text-teal-700 dark:text-teal-400";
      snbpBg = "from-teal-50 to-teal-100/30 dark:from-teal-950/10 dark:to-transparent border-teal-100 dark:border-teal-900/30";
      snbpStatus = "Berpeluang Cukup Sehat";
    } else if (snbpScore >= 50) {
      snbpWarna = "text-amber-700 dark:text-amber-500";
      snbpBg = "from-amber-50 to-amber-100/30 dark:from-amber-950/10 dark:to-transparent border-amber-100 dark:border-amber-900/30";
      snbpStatus = "Kompetitif / Perlu Kuota Mandiri";
    }

    paths.push({
      key: "snbp",
      title: "Jalur Undangan Rapor (SNBP)",
      score: snbpScore,
      warna: snbpWarna,
      bg: snbpBg,
      status: snbpStatus,
      strengths: [
        stats.avgRapor >= 85 ? `Rata-rata rapor unggul (${stats.avgRapor}/100)` : `Konsistensi nilai mapel inti stabil`,
        stats.achPoints > 30 ? `Piagam penghargaan tingkat daerah memperkuat portofolio` : `Relasi kepengurusan OSIS internal aktif`
      ],
      weaknesses: [
        stats.avgRapor < 80 ? `Rata-rata Rapor (${stats.avgRapor}) rentan tereliminasi filter indeks sekolah` : null,
        stats.achPoints === 0 ? `Kelemahan sertifikat juara eksternal menghambat seleksi portofolio` : null,
      ].filter(Boolean) as string[],
      actionItems: [
        "Jaga konsistensi rata-rapor di semester mendatang agar tidak anjlok sekecil apa pun",
        "Unggah sertifikat akademis fisis yang diterbitkan langsung oleh Kemdikbud / Puspresnas"
      ]
    });

    // Pathway 2: SNBT (Seleksi Nasional Berdasarkan Tes)
    let snbtScore = Math.round((stats.avgSimulasi * 0.80) + (stats.iq * 0.20 - 20)); // simulated
    snbtScore = Math.min(100, Math.max(10, snbtScore));

    let snbtWarna = "text-rose-600 dark:text-rose-450";
    let snbtBg = "from-rose-50 to-rose-100/30 dark:from-rose-950/10 dark:to-transparent border-rose-100 dark:border-rose-900/30";
    let snbtStatus = "Kurang Bersaing";

    if (snbtScore >= 80) {
      snbtWarna = "text-emerald-700 dark:text-emerald-400";
      snbtBg = "from-emerald-50 to-emerald-100/30 dark:from-emerald-950/10 dark:to-transparent border-emerald-100 dark:border-emerald-900/30";
      snbtStatus = "Daya Saing Tinggi (PTN Kluster 1)";
    } else if (snbtScore >= 60) {
      snbtWarna = "text-teal-700 dark:text-teal-400";
      snbtBg = "from-teal-50 to-teal-100/30 dark:from-teal-950/10 dark:to-transparent border-teal-100 dark:border-teal-900/30";
      snbtStatus = "Peluang Tinggi (PTN Kluster 2)";
    } else if (snbtScore >= 45) {
      snbtWarna = "text-amber-700 dark:text-amber-500";
      snbtBg = "from-amber-50 to-amber-100/30 dark:from-amber-950/10 dark:to-transparent border-amber-100 dark:border-amber-900/30";
      snbtStatus = "Kompetitif Terbuka";
    }

    paths.push({
      key: "snbt",
      title: "Jalur Tes Tulis UTBK (SNBT)",
      score: snbtScore,
      warna: snbtWarna,
      bg: snbtBg,
      status: snbtStatus,
      strengths: [
        stats.iq >= 115 ? `Kapasitas kognitif penalaran logis unggul (${stats.iq} IQ)` : `Fokus silogisme verbal cukup lincah`,
        stats.avgSimulasi >= 70 ? `Skor simulasi try-out rata-rata memadai (${stats.avgSimulasi}/100)` : `Skor penaksiran logika aritmetik stabil`
      ],
      weaknesses: [
        stats.avgSimulasi < 60 ? `Kemampuan penyelesaian soal Numerasi matematika kuantitatif masih melambat` : null,
      ].filter(Boolean) as string[],
      actionItems: [
        "Perbanyak drills pengerjaan soal Literasi Bahasa Inggris dan Penalaran Matematika kuantitatif",
        "Wajibkan latihan simulasi dibatasi timer guna pembiasaan ketahanan fokus mental kognitif"
      ]
    });

    // Pathway 3: SPAN PTKIN / Jalur Universitas Islam
    let ptkinScore = Math.round((stats.avgReligionGrades * 0.50) + (stats.quranScore * 0.40) + (stats.achPoints * 0.10));
    ptkinScore = Math.min(100, Math.max(10, ptkinScore));

    let ptkinWarna = "text-rose-600 dark:text-rose-450";
    let ptkinBg = "from-rose-50 to-rose-100/30 dark:from-rose-950/10 dark:to-transparent border-rose-100 dark:border-rose-900/30";
    let ptkinStatus = "Perlu Pembinaan";

    if (ptkinScore >= 80) {
      ptkinWarna = "text-emerald-700 dark:text-emerald-400";
      ptkinBg = "from-emerald-50 to-emerald-100/30 dark:from-emerald-950/10 dark:to-transparent border-emerald-100 dark:border-emerald-900/30";
      ptkinStatus = "Sangat Potensial (Peluang Emas UIN)";
    } else if (ptkinScore >= 60) {
      ptkinWarna = "text-teal-700 dark:text-teal-400";
      ptkinBg = "from-teal-50 to-teal-100/30 dark:from-teal-950/10 dark:to-transparent border-teal-100 dark:border-teal-900/30";
      ptkinStatus = "Sangat Potensial Bersaing";
    } else if (ptkinScore >= 40) {
      ptkinWarna = "text-amber-700 dark:text-amber-500";
      ptkinBg = "from-amber-50 to-amber-100/30 dark:from-amber-950/10 dark:to-transparent border-amber-100 dark:border-amber-900/30";
      ptkinStatus = "Potensial bersaing";
    }

    paths.push({
      key: "ptkin",
      title: "Jalur Keagamaan Negeri (SPAN PTKIN)",
      score: ptkinScore,
      warna: ptkinWarna,
      bg: ptkinBg,
      status: ptkinStatus,
      strengths: [
        keagamaan.hafalan !== "0-1 juz" ? `Hafalan Al-Quran solid berkategori (${keagamaan.hafalan})` : `Dasar spiritual keagamaan mumpuni`,
        stats.avgReligionGrades >= 80 ? `Rerata rapor mapel syariah unggul (${stats.avgReligionGrades}/100)` : `Skor Al-Quran hadits mumpuni`
      ],
      weaknesses: [
        keagamaan.hafalan === "0-1 juz" ? `Hafalan Qur'an rendah (< 2 juz) menutup daya kompetisi beasiswa tahfidz khusus` : null,
      ].filter(Boolean) as string[],
      actionItems: [
        "Akselerasi muraja'ah dan menambah setoran hafalan asrama hingga lolos minimal standar 5 juz",
        "Targetkan pendaftaran di UIN Walisongo, UIN Sunan Kalijaga, atau UIN Syarif Hidayatullah"
      ]
    });

    // Pathway 4: Beasiswa Kemitraan Daerah & Swasta Utama
    let beasiswaScore = Math.round((stats.avgRapor * 0.40) + (stats.achPoints * 0.40) + (stats.iq * 0.20 - 15));
    beasiswaScore = Math.min(100, Math.max(10, beasiswaScore));

    let beasiswaWarna = "text-rose-600 dark:text-rose-450";
    let beasiswaBg = "from-rose-50 to-rose-100/30 dark:from-rose-950/10 dark:to-transparent border-rose-100 dark:border-rose-900/30";
    let beasiswaStatus = "Kurang Bersaing";

    if (beasiswaScore >= 80) {
      beasiswaWarna = "text-emerald-700 dark:text-emerald-400";
      beasiswaBg = "from-emerald-50 to-emerald-100/30 dark:from-emerald-950/10 dark:to-transparent border-emerald-100 dark:border-emerald-900/30";
      beasiswaStatus = "Sertifikasi Portofolio Lolos";
    } else if (beasiswaScore >= 60) {
      beasiswaWarna = "text-teal-700 dark:text-teal-400";
      beasiswaBg = "from-teal-50 to-teal-100/30 dark:from-teal-950/10 dark:to-transparent border-teal-100 dark:border-teal-900/30";
      beasiswaStatus = "Lolos Berkas Awal (Kompetitif)";
    } else if (beasiswaScore >= 45) {
      beasiswaWarna = "text-amber-700 dark:text-amber-500";
      beasiswaBg = "from-amber-50 to-amber-100/30 dark:from-amber-950/10 dark:to-transparent border-amber-100 dark:border-amber-900/30";
      beasiswaStatus = "Kompetitif Bersyarat";
    }

    paths.push({
      key: "beasiswa",
      title: "Proposal Beasiswa Kemitraas / BUD",
      score: beasiswaScore,
      warna: beasiswaWarna,
      bg: beasiswaBg,
      status: beasiswaStatus,
      strengths: [
        stats.achPoints > 0 ? `Memiliki sertifikat medali kompetisi non-akademis` : `Memenuhi syarat kualitatif kesiswaan`,
        `Profil kepemimpinan luhur dan memiliki sikap sosial yang sangat matang`
      ],
      weaknesses: [
        stats.achPoints < 30 ? `Minimnya medali emas tingkat provinsi mengurangi bobot portofolio proposal` : null
      ].filter(Boolean) as string[],
      actionItems: [
        "Fokus raih kejuaraan minimal tingkat Kabupaten di bidang kesiswaan, debat, olahraga atau sains",
        "Optimalkan portofolio esai berisi rumusan kontribusi konkret bagi pengabdian kemasyarakatan dan pembangunan nasional"
      ]
    });

    return paths;
  };

  const pathways = getPathwaysPredictions();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-100 dark:border-gray-850 pb-5">
        <h2 className="text-2xl font-bold font-sans text-gray-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          Prediksi Jalur Masuk Perguruan Tinggi
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Analisis diagnostik daya ungkit kelulusan PTN siswa Sekolah Cendekia BAZNAS pada empat rumpun pendaftaran berskala nasional.
        </p>
      </div>

      <div className="space-y-6">
        
        {/* Pathway grid loop cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pathways.map((path) => (
            <div
              key={path.key}
              className={`rounded-2xl border bg-white dark:bg-gray-900 bg-gradient-to-tr ${path.bg} p-6 flex flex-col justify-between hover:shadow-md transition-all space-y-6`}
            >
              {/* Card primary state */}
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-transparent">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base font-sans">{path.title}</h3>
                  <div className={`px-3 py-1 rounded-full border border-current text-[10px] font-extrabold uppercase bg-white dark:bg-gray-950 ${path.warna}`}>
                    {path.status}
                  </div>
                </div>

                {/* Meter gauge */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-mono font-bold text-gray-500 dark:text-gray-400">
                    <span>Peluang Tembus Asesmen</span>
                    <span className={path.warna}>{path.score}% Chance</span>
                  </div>
                  <div className="w-full bg-gray-200/50 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full transition-all duration-300" style={{ width: `${path.score}%` }} />
                  </div>
                </div>
              </div>

              {/* Strengths Weaknesses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 dark:border-gray-850 pt-4">
                
                {/* Strengths (Kekuatan) */}
                <div className="space-y-2">
                  <div className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 tracking-wider font-mono flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5" /> Kekuatan (Strengths)
                  </div>
                  <ul className="space-y-1.5">
                    {path.strengths.map((str, i) => (
                      <li key={i} className="text-xs text-gray-650 dark:text-gray-400 leading-5">
                       • {str}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses (Kelemahan) */}
                <div className="space-y-2">
                  <div className="text-[10px] uppercase font-bold text-rose-700 dark:text-rose-400 tracking-wider font-mono flex items-center gap-1">
                    <ShieldAlert className="h-3.5 w-3.5" /> Kelemahan (Weaknesses)
                  </div>
                  {path.weaknesses.length === 0 ? (
                    <p className="text-[11px] text-gray-400 italic">Tidak terdeteksi kelemahan kritis di kriteria ini.</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {path.weaknesses.map((weak, i) => (
                        <li key={i} className="text-xs text-gray-650 dark:text-gray-400 leading-5">
                         • {weak}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

              </div>

              {/* Suggestions items */}
              <div className="bg-white/80 dark:bg-gray-950 p-4 rounded-xl border border-gray-150 dark:border-gray-850 text-xs text-gray-500 dark:text-gray-400 space-y-1.5 leading-5">
                <strong className="text-gray-700 dark:text-gray-300 font-mono">Langkah Rekomendasi Akselerasi:</strong>
                <ul className="space-y-1">
                  {path.actionItems.map((act, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-emerald-500 font-mono font-bold">▶</span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          ))}
        </div>

        {/* Holistic Boarding Guideline warning */}
        <div className="bg-emerald-50/20 text-emerald-800 dark:bg-emerald-950/10 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 p-5 rounded-2xl text-xs sm:text-sm flex gap-3.5 items-start leading-6">
          <Compass className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="text-gray-950 dark:text-white font-bold block">Prinsip Karakter Sekolah Cendekia BAZNAS:</strong>
            <span>
              Kelulusan perguruan tinggi bukan sekadar raihan nilai kognitif semata. Kedisiplinan harian di sekolah, kepemimpinan kesiswaan, etika moral yang luhur, serta bakat non-akademis andalan membentuk sinergi kelayakan utama dalam memenangkan seleksi administratif prapendaftaran perguruan tinggi nasional terbaik.
            </span>
          </div>
        </div>

      </div>

      {/* Nav Buttons */}
      <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-850 pt-5">
        <button
          onClick={onPrev}
          className="px-5 py-2.5 border border-gray-200 dark:border-gray-850 dark:bg-gray-900 dark:hover:bg-gray-850 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 transition-colors inline-flex items-center gap-2 text-sm font-medium cursor-pointer"
        >
          Kembali
        </button>
        <button
          onClick={onNext}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-colors inline-flex items-center gap-2 text-sm font-medium cursor-pointer"
        >
          Laporan Akhir (Cetak)
        </button>
      </div>

    </div>
  );
}
