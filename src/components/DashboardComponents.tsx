/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { FullAppState, HafalanQuranType } from "../types";
import { Award, GraduationCap, Compass, BookOpen, Brain, CheckSquare, ShieldCheck, Trophy, Sparkles } from "lucide-react";

interface ComponentProps {
  appState: FullAppState;
  onNavigate: (menuId: number) => void;
}

// 1. ProfileHeader: Student context cards
export function ProfileHeader({ appState, onNavigate }: ComponentProps) {
  const { profile } = appState;
  
  return (
    <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-805 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 rounded-3xl p-6 text-white border border-blue-600/30 shadow-lg relative overflow-hidden">
      {/* Decorative vectors */}
      <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-white/5 rounded-full blur-2xl" />
      <div className="absolute -left-10 -top-10 w-44 h-44 bg-indigo-500/10 rounded-full blur-2xl" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/10 dark:bg-gray-800 rounded-2xl flex items-center justify-center border border-white/20 font-bold font-sans text-xl tracking-wider text-blue-105 shadow">
            {profile.nama ? profile.nama[0].toUpperCase() : "S"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-extrabold tracking-tight">{profile.nama || "Siswa Baru Cendekia"}</h3>
              <span className="bg-emerald-500 text-white font-mono font-bold text-[9px] px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                <ShieldCheck className="h-2.5 w-2.5" /> Terverifikasi BK
              </span>
            </div>
            <p className="text-xs text-indigo-100 font-medium mt-1">
              {profile.kelas || "Kelas 10"} • NISN {profile.nisn || "307000xxxx"} • {profile.jenisKelamin || "Ikhwan"}
            </p>
          </div>
        </div>

        <div className="space-y-1.5 shrink-0 text-left sm:text-right bg-white/5 dark:bg-white/3 p-3.5 rounded-2xl border border-white/10 w-full sm:w-auto">
          <div className="text-[10px] uppercase font-bold text-indigo-200 tracking-wider font-mono">Sekolah Asal Siswa:</div>
          <p className="text-xs font-bold font-sans">Sekolah Cendekia BAZNAS (SCB)</p>
          {profile.citaCita && (
            <div className="text-[11px] text-emerald-305 italic mt-1 font-mono">
              Target: "{profile.citaCita}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 2. AssessmentProgress: Global Checklist Progress Tracker Meter
export function AssessmentProgress({ appState, onNavigate }: ComponentProps) {
  const { keagamaan, akademik, prestasiEkskul, minatBakat, iqTest } = appState;

  const getCompletionState = () => {
    let completedModules = 0;
    const totalModules = 6; // Data Siswa, Keagamaan, Akademik, Prestasi, Minat Bakat, IQ

    if (appState.profile.nama !== "") completedModules++;
    // Keagamaan is deemed complete if at least some nilai or hafalan is touched
    if (keagamaan.prestasi.length > 0 || Object.values(keagamaan.nilai).some(v => v > 0)) completedModules++;
    // Akademik
    if (Object.values(akademik.nilaiRapor).some(v => v > 0) || akademik.prestasi.length > 0) completedModules++;
    // Prestasi
    if (prestasiEkskul.ekskul.length > 0 || Object.values(prestasiEkskul.tingkatPrestasi).some(v => v > 0)) completedModules++;
    // Minat Bakat
    if (minatBakat.completed) completedModules++;
    // IQ Test
    if (iqTest.completed) completedModules++;

    const percent = Math.round((completedModules / totalModules) * 100);
    return { completedModules, totalModules, percent };
  };

  const { completedModules, totalModules, percent } = getCompletionState();

  return (
    <div className="bg-white dark:bg-slate-900 border-l-[4px] border-l-blue-600 border-y border-r border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-md hover:translate-y-[-1px] transition-all duration-200">
      <div className="flex justify-between items-center bg-transparent">
        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">Kelengkapan Berkas Asesmen</h4>
        <span className="text-blue-600 dark:text-blue-400 font-bold text-sm tracking-wide font-mono">
          {completedModules}/{totalModules} Modul ({percent}%)
        </span>
      </div>

      <div className="relative w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
        <div className="bg-blue-650 h-full transition-all duration-550" style={{ width: `${percent}%` }} />
      </div>

      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-5">
        *Lengkapi data di seluruh panel menu pengujian di sidebar luar agar mesin AI menyuguhkan rekomendasi prapendaftaran universitas dengan validasi penuh.
      </p>
    </div>
  );
}

// 3. MappingProgress: Details checklist checkboxes
export function MappingProgress({ appState, onNavigate }: ComponentProps) {
  const { keagamaan, akademik, prestasiEkskul, minatBakat, iqTest } = appState;

  const STATUS_LIST = [
    { label: "Data Diri Siswa", key: "profile", isDone: appState.profile.nama !== "", menuId: 1, desc: "Identitas dasar kesiswaan" },
    { label: "Potensi Jalur Keagamaan", key: "keagamaan", isDone: Object.values(keagamaan.nilai).some(v => v > 0), menuId: 2, desc: "Hafalan Al-Quran & mapel PAI" },
    { label: "Potensi Ujian Akademik", key: "akademik", isDone: Object.values(akademik.nilaiRapor).some(v => v > 0), menuId: 3, desc: "Nilai rapor luring & latihan UTBK" },
    { label: "Bakat & Prestasi Ekskul", key: "prestasi", isDone: prestasiEkskul.ekskul.length > 0 || Object.values(prestasiEkskul.tingkatPrestasi).some(v => v > 0), menuId: 4, desc: "Kuantitas juara & kepemimpinan" },
    { label: "Kecenderungan Minat Holland", key: "minatBakat", isDone: minatBakat.completed, menuId: 5, desc: "Kecocokan 60 asimilasi RIASEC" },
    { label: "Simulasi IQ Kognitif", key: "iqTest", isDone: iqTest.completed, menuId: 6, desc: "80 standard kognitif penalaran" }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
      <h3 className="font-bold text-slate-800 dark:text-slate-200 uppercase text-xs tracking-wider font-mono border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
        <span>Matriks Status Asesmen Mandiri</span>
        <span className="text-[11px] text-slate-450 font-normal lowercase">klik baris untuk mengisi</span>
      </h3>

      <div className="space-y-2.5">
        {STATUS_LIST.map((m, i) => (
          <div
            key={i}
            onClick={() => onNavigate(m.menuId)}
            className="flex justify-between items-center bg-slate-50/50 hover:bg-slate-100/40 dark:bg-slate-950 dark:hover:bg-slate-850 p-3 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer transition-all"
          >
            <div className="space-y-0.5">
              <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100">{m.label}</h4>
              <p className="text-[10px] text-slate-500 leading-4">{m.desc}</p>
            </div>
            {m.isDone ? (
              <span className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-mono text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/30">
                Selesai
              </span>
            ) : (
              <span className="bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 font-mono text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border border-amber-100 dark:border-amber-900/30">
                Belum
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper calculation values shared across widgets
const calculateFidelityStats = (appState: FullAppState) => {
  const { keagamaan, akademik, prestasiEkskul, iqTest } = appState;

  // Rapor avg
  const rV = Object.values(akademik.nilaiRapor);
  const avgRapor = rV.reduce((a, b) => a + b, 0) / (rV.length || 1);

  // Simulasi avg
  const sV = Object.values(akademik.simulasiTes);
  const avgSimulasi = sV.reduce((a, b) => a + b, 0) / (sV.length || 1);

  // Quran
  const getQuranWeight = (h: HafalanQuranType) => {
    switch(h) {
      case "0-1 juz": return 20;
      case "2-5 juz": return 50;
      case "6-10 juz": return 75;
      case "11-20 juz": return 95;
      case "> 20 juz": return 100;
      default: return 20;
    }
  };
  const quranPoints = getQuranWeight(keagamaan.hafalan);
  const avgReligion = Object.values(keagamaan.nilai).reduce((a, b) => a + b, 0) / (Object.values(keagamaan.nilai).length || 1);

  // Non-academic achievements
  const achCount = prestasiEkskul.tingkatPrestasi;
  const achPoints = Math.min(100, achCount.sekolah * 10 + achCount.kabupaten * 30 + achCount.provinsi * 60 + achCount.nasional * 85 + achCount.internasional * 100);

  const rawIq = iqTest.iqScore || 100;

  // Let's do Pathway Predictions
  const snbpChance = Math.min(99, Math.round((avgRapor * 0.75) + (achPoints * 0.25)));
  const snbtChance = Math.min(100, Math.round((avgSimulasi * 0.85) + (rawIq * 0.15 - 15)));
  const ptkinChance = Math.min(99, Math.round((avgReligion * 0.50) + (quranPoints * 0.40) + (achPoints * 0.10)));
  const beasiswaChance = Math.min(99, Math.round((avgRapor * 0.40) + (achPoints * 0.40) + (rawIq * 0.20 - 15)));

  return {
    avgRapor,
    avgSimulasi,
    achPoints,
    quranPoints,
    rawIq,
    snbpChance,
    snbtChance,
    ptkinChance,
    beasiswaChance
  };
};

// 4. PotentialPathways: Compares pathway progress bar cards
export function PotentialPathways({ appState, onNavigate }: ComponentProps) {
  const stats = calculateFidelityStats(appState);

  const ITEMS = [
    { label: "Jalur Rapor (SNBP)", val: stats.snbpChance, color: "bg-blue-600 text-blue-700", icon: BookOpen },
    { label: "Jalur Tulis UTBK (SNBT)", val: stats.snbtChance, color: "bg-purple-600 text-purple-700", icon: Brain },
    { label: "Jalur Keagamaan (SPAN PTKIN)", val: stats.ptkinChance, color: "bg-green-600 text-green-700", icon: GraduationCap },
    { label: "Beasiswa Daerah / BUD", val: stats.beasiswaChance, color: "bg-amber-500 text-amber-500", icon: Award }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border-l-[4px] border-l-purple-600 border-y border-r border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
      <h3 className="font-bold text-slate-800 dark:text-slate-200 uppercase text-xs tracking-wider font-mono border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
        <span>Prediksi Persentase Potensi Jalur</span>
        <button 
          onClick={() => onNavigate(8)}
          className="text-[10px] font-bold text-blue-650 dark:text-blue-450 hover:underline uppercase tracking-wider font-mono bg-transparent cursor-pointer"
        >
          Selengkapnya
        </button>
      </h3>

      <div className="space-y-4">
        {ITEMS.map((it, i) => {
          const Icon = it.icon;
          return (
            <div key={i} className="space-y-1.5 p-3 rounded-xl bg-slate-50/40 dark:bg-slate-950 border border-slate-150/50 dark:border-slate-850">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 leading-6">
                  <Icon className="h-4 w-4 text-slate-500" />
                  {it.label}
                </span>
                <span className="font-mono font-extrabold tracking-wider text-slate-900 dark:text-slate-100">{it.val}% Peluang</span>
              </div>
              <div className="w-full bg-slate-200/50 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div className={`h-full ${it.color.split(" ")[0]} transition-all duration-500`} style={{ width: `${it.val}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 5. MainPathwayRecommendation: Highlights primary recommended pathway
export function MainPathwayRecommendation({ appState, onNavigate }: ComponentProps) {
  const stats = calculateFidelityStats(appState);

  // Find highest pathway score
  const paths = [
    { name: "Jalur Rapor (SNBP)", score: stats.snbpChance, desc: "Rata-rapor akademis dan prestasi pendaftaran piagam Anda dinilai unggul di jajaran angkatan Sekolah Cendekia BAZNAS." },
    { name: "Jalur Tulis UTBK (SNBT)", score: stats.snbtChance, desc: "Daya kognitif penalaran logis serta rerata simulasi kuis Anda menaruh kesiapan optimal di seleksi daya saing nasional." },
    { name: "Jalur Karakter & Keagamaan", score: stats.ptkinChance, desc: "Level perilaku mulia, religiusitas, dan nilai PPKn/Agama dari portofolio sikap sosial Anda memposisikan prioritas beasiswa kepemimpinan." },
    { name: "Jalur Beasiswa Daerah & Swasta", score: stats.beasiswaChance, desc: "Dukungan kuantitas medali kesiswaan non-akademis serta kesiapan rekam prestasi kualitatif mampunyai usulan pendaftaran beasiswa daerah." }
  ];

  const sorted = [...paths].sort((a, b) => b.score - a.score);
  const highest = sorted[0];

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-100/25 dark:from-emerald-950/20 dark:to-teal-950/10 rounded-2xl p-5 border-l-[4px] border-l-emerald-500 border-y border-r border-slate-200 dark:border-emerald-950/35 flex flex-col justify-between space-y-4 shadow-sm">
      <div className="space-y-3">
        <h3 className="font-bold text-slate-900 dark:text-white uppercase text-xs tracking-wider font-mono border-b border-emerald-250/30 dark:border-emerald-900/30 pb-2.5 flex items-center gap-1.5">
          <Sparkles className="h-4.5 w-4.5 text-emerald-600 animate-pulse" />
          Rekomendasi Jalur Utama Anda
        </h3>

        <div className="space-y-1.5 text-left py-2">
          <div className="text-[10px] py-0.5 px-2.5 bg-emerald-500 text-white font-mono font-bold tracking-wider rounded-full w-fit uppercase mb-2 shadow-sm">
            Skor Tertinggi: {highest.score}% Peluang
          </div>
          <h4 className="font-extrabold text-lg text-emerald-800 dark:text-emerald-400 font-sans tracking-tight">
            {highest.name}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-6 font-sans">
            {highest.desc}
          </p>
        </div>
      </div>

      <button
        onClick={() => onNavigate(8)}
        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-800 dark:hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all uppercase tracking-wider font-mono"
      >
        Tinjau Analisis Jalur Masuk
      </button>
    </div>
  );
}

// 6. StudentRanking: Leaderboard feature showing active competitive ranking in class cohort
export function StudentRanking({ appState, onNavigate }: ComponentProps) {
  const [cohortRecords, setCohortRecords] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("sipetakuliah_cohort_recap");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) || [];
        // Only load user-added real students, filtering out current student name to avoid duplicates
        const filtered = parsed.filter((r: any) => r.isUserAdded === true && r.nama !== appState.profile.nama);
        setCohortRecords(filtered);
      } catch (e) {
        setCohortRecords([]);
      }
    }
  }, [appState.profile.nama]);

  const stats = calculateFidelityStats(appState);
  
  // User's active academic rating index formula
  const userScore = Math.max(10, Math.round(stats.avgRapor * 0.45 + stats.avgSimulasi * 0.40 + stats.achPoints * 0.15));

  const isSmp = appState.jenjang === "SMP" || (appState.profile.kelas && (appState.profile.kelas.includes("7") || appState.profile.kelas.includes("8") || appState.profile.kelas.includes("9") || appState.profile.kelas.includes("SMP")));

  const mappedPeers = cohortRecords.map((r: any) => {
    // Generate an illustrative score for ranking purposes
    const baseRapor = r.avgRapor || 78;
    const baseIq = r.iqScore || 105;
    const computedScore = Math.round(baseRapor * 0.45 + (baseIq - 50) * 0.40);
    return {
      nama: r.nama,
      score: Math.min(100, Math.max(40, computedScore)),
      path: r.rekomendasiJurusan?.[0] || (isSmp ? "Pengembangan Diri" : "Target PTN"),
      class: r.kelas || (isSmp ? "Kelas SMP" : "Kelas SMA")
    };
  });

  // Insert user dynamically based on score
  const userCandidateName = appState.profile.nama || "Anda (Siswa Umum)";
  const userItemObj = {
    nama: userCandidateName,
    score: userScore > 0 ? userScore : 72,
    path: isSmp ? "Pengembangan Diri" : (userScore >= 80 ? "SNBP Elit" : userScore >= 65 ? "SNBT Utama" : "Mandiri Utama"),
    class: appState.profile.kelas || (isSmp ? "Kelas SMP" : "Kelas SMA"),
    isUser: true
  };

  const combinedAndSorted = [...mappedPeers, userItemObj]
    .sort((a, b) => b.score - a.score)
    // Redefine ranks
    .map((item, index) => ({
      ...item,
      rank: index + 1
    }));

  return (
    <div className="bg-white dark:bg-slate-900 border-l-[4px] border-l-amber-500 border-y border-r border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
      <h3 className="font-bold text-slate-800 dark:text-slate-200 uppercase text-xs tracking-wider font-mono border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-1.5">
        <Trophy className="h-4 w-4 text-amber-550 animate-pulse" />
        Daftar Peringkat Kompetitif Siswa (Angkatan Sekolah)
      </h3>

      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {combinedAndSorted.map((item, idx) => {
          const isUser = "isUser" in item;
          return (
            <div
              key={idx}
              className={`flex justify-between items-center p-2.5 rounded-xl border text-xs transition-all ${
                isUser
                  ? "bg-slate-100 border-slate-300 dark:bg-slate-950/45 dark:border-slate-800 font-bold scale-[1.01] shadow-sm text-slate-900 dark:text-slate-200"
                  : "border-slate-100 bg-slate-50/30 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-5 h-5 flex items-center justify-center rounded text-[10px] font-mono font-bold ${
                  item.rank === 1 
                    ? "bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 font-extrabold" 
                    : item.rank === 2 
                      ? "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold" 
                      : item.rank === 3 
                        ? "bg-orange-150 text-orange-900 dark:bg-orange-950/40 dark:text-orange-400" 
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                }`}>
                  {item.rank}
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold truncate max-w-28 sm:max-w-40">{item.nama}</span>
                    {isUser && <span className="text-[8px] bg-blue-600 px-1 text-white rounded uppercase font-mono font-bold tracking-widest size-auto">me</span>}
                  </div>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono italic leading-3">{item.class} • target: {item.path}</span>
                </div>
              </div>

              <span className="font-mono bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 px-2 py-1 rounded text-[10px] font-extrabold text-slate-750 dark:text-slate-300">
                Skor {item.score}
              </span>
            </div>
          );
        })}
      </div>
      
      <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-4 text-center">
        *Skor kompetisi terpadu dihitung otomatis dari penimbangan nilai rapor kesiswaan, jumlah piagam kompetisi asmara, dan standard IQ kognitif.
      </p>
    </div>
  );
}
