/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from "react";
import { 
  Users, 
  BrainCircuit, 
  GraduationCap, 
  Compass, 
  TrendingUp, 
  Trash2, 
  Printer, 
  Search, 
  Sliders, 
  ChevronRight, 
  BookOpen, 
  Award,
  Filter,
  CheckCircle,
  HelpCircle
} from "lucide-react";
import RekapHasilSiswa from "./RekapHasilSiswa";
import { FullAppState } from "../types";

const EMPTY_APP_STATE: FullAppState = {
  profile: {
    nama: "",
    nisn: "",
    kelas: "Kelas 10 Ikhwan",
    jenisKelamin: "Ikhwan",
    tempatLahir: "",
    tanggalLahir: "",
    citaCita: "",
    hobi: "",
    organisasi: ""
  },
  keagamaan: {
    hafalan: "0-1 juz",
    hafalanHadits: "0-20 hadits",
    nilai: {
      pai: 75,
      bahasaArab: 75
    },
    prestasi: [],
    organisasi: []
  },
  akademik: {
    nilaiRapor: {
      matematika: 75,
      bahasaIndonesia: 75,
      bahasaInggris: 75,
      ipa: 75,
      ips: 75
    },
    simulasiTes: {
      literasi: 60,
      numerasi: 60,
      penalaran: 60
    },
    prestasi: []
  },
  prestasiEkskul: {
    ekskul: [],
    tingkatPrestasi: {
      sekolah: 0,
      kabupaten: 0,
      provinsi: 0,
      nasional: 0,
      internasional: 0
    }
  },
  minatBakat: {
    answers: {},
    completed: false
  },
  iqTest: {
    answers: {},
    completed: false,
    timeLeft: 3600,
    scores: {
      verbal: 0,
      numerical: 0,
      logical: 0,
      spatial: 0
    },
    scoreTotal: 0,
    iqScore: 100
  },
  aiRecommendation: {
    status: "idle",
    majors: [],
    justification: "",
    threeYearPlan: {
      kelas10: "",
      kelas11: "",
      kelas12: ""
    }
  },
  theme: "light",
  jenjang: "SMA",
  gayaBelajar: {
    answers: {},
    completed: false
  }
};

interface CompletedTestRecord {
  id: string;
  nama: string;
  nisn: string;
  kelas: string;
  avgRapor: number;
  iqScore: number;
  iqCategory: string;
  topRiasec: string[];
  rekomendasiJurusan: string[];
  tanggalTes: string;
  isUserAdded?: boolean;
}

const DEFAULT_RECORDS: CompletedTestRecord[] = [];

export default function AdminAnalytics() {
  const [records, setRecords] = useState<CompletedTestRecord[]>([]);
  const [activeClassFilter, setActiveClassFilter] = useState<string>("All");
  const [syncKey, setSyncKey] = useState<number>(0);

  // Load records from local storage or set defaults
  const loadRecords = () => {
    const stored = localStorage.getItem("sipetakuliah_cohort_recap");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as CompletedTestRecord[];
        // Filter out any older mock/dummy records that are not explicitly user-added
        const cleaned = parsed.filter(r => r.isUserAdded === true);
        setRecords(cleaned);
        localStorage.setItem("sipetakuliah_cohort_recap", JSON.stringify(cleaned));
      } catch (e) {
        setRecords(DEFAULT_RECORDS);
      }
    } else {
      setRecords(DEFAULT_RECORDS);
      localStorage.setItem("sipetakuliah_cohort_recap", JSON.stringify(DEFAULT_RECORDS));
    }
  };

  useEffect(() => {
    loadRecords();
    
    // Listen to localstorage changes to synchronize live
    const handleStorageChange = () => {
      loadRecords();
      setSyncKey((prev) => prev + 1);
    };
    
    window.addEventListener("storage", handleStorageChange);
    // Periodically sync
    const interval = setInterval(loadRecords, 2000);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Filter records based on selected class
  const filteredRecords = records.filter(
    (rec) => activeClassFilter === "All" || rec.kelas === activeClassFilter
  );

  // 1. DYNAMIC LIST OF AVAILABLE CLASSES
  const availableClasses = [
    "All", 
    "Kelas 7 Ikhwan",
    "Kelas 7 Akhwat",
    "Kelas 8 Ikhwan",
    "Kelas 8 Akhwat",
    "Kelas 9 Ikhwan",
    "Kelas 9 Akhwat",
    "Kelas 10 Ikhwan", 
    "Kelas 10 Akhwat", 
    "Kelas 11 Ikhwan", 
    "Kelas 11 Akhwat", 
    "Kelas 12 Ikhwan", 
    "Kelas 12 Akhwat",
    ...(Array.from(new Set(records.map((r) => r.kelas))) as string[]).filter(c => c && !["Kelas 7 Ikhwan", "Kelas 7 Akhwat", "Kelas 8 Ikhwan", "Kelas 8 Akhwat", "Kelas 9 Ikhwan", "Kelas 9 Akhwat", "Kelas 10 Ikhwan", "Kelas 10 Akhwat", "Kelas 11 Ikhwan", "Kelas 11 Akhwat", "Kelas 12 Ikhwan", "Kelas 12 Akhwat"].includes(c))
  ];

  // 2. STATISTICS COMPUTATION
  const totalStudents = filteredRecords.length;
  
  const avgIq = totalStudents 
    ? Math.round(filteredRecords.reduce((acc, curr) => acc + curr.iqScore, 0) / totalStudents)
    : 0;

  const avgAkademik = totalStudents
    ? Number((filteredRecords.reduce((acc, curr) => acc + curr.avgRapor, 0) / totalStudents).toFixed(1))
    : 0;

  // Compute common RIASEC Type
  const riasecCounts: Record<string, number> = {};
  filteredRecords.forEach((rec) => {
    if (rec.topRiasec && rec.topRiasec.length > 0) {
      const topType = rec.topRiasec[0]; // Take dominant first letter
      riasecCounts[topType] = (riasecCounts[topType] || 0) + 1;
    }
  });
  
  let dominantRiasec = "Belum Ada";
  let maxCount = 0;
  Object.entries(riasecCounts).forEach(([type, count]) => {
    if (count > maxCount) {
      maxCount = count;
      dominantRiasec = type;
    }
  });

  // 3. IQ CATEGORY GROUPING WITH NAMES
  const iqRanges = [
    { label: "Sangat Superior (Skor ≥ 130)", min: 130, max: 200, color: "bg-indigo-600 dark:bg-indigo-500", text: "text-indigo-600 dark:text-indigo-400" },
    { label: "Superior (Skor 120-129)", min: 120, max: 129, color: "bg-purple-600 dark:bg-purple-500", text: "text-purple-600 dark:text-purple-450" },
    { label: "Rata-rata Tinggi (Skor 110-119)", min: 110, max: 119, color: "bg-blue-600 dark:bg-blue-500", text: "text-blue-605 dark:text-blue-400" },
    { label: "Rata-rata (Skor 90-109)", min: 90, max: 109, color: "bg-teal-605 dark:bg-teal-500", text: "text-teal-650 dark:text-teal-400" },
    { label: "Rata-rata Bawah (Skor < 90)", min: 0, max: 89, color: "bg-amber-500 dark:bg-amber-500", text: "text-amber-500 dark:text-amber-400" }
  ];

  const iqDistribution = iqRanges.map(range => {
    const students = filteredRecords.filter(r => r.iqScore >= range.min && r.iqScore <= range.max);
    const percentage = totalStudents ? Math.round((students.length / totalStudents) * 100) : 0;
    return {
      ...range,
      students,
      percentage,
      count: students.length
    };
  });

  // 4. RIASEC DETAILED BREAKDOWN WITH LIST OF NAMES
  const hollandCats = [
    { label: "Realistic (R)", prefix: "Realistic", color: "bg-red-500", hoverColor: "group-hover:bg-red-650" },
    { label: "Investigative (I)", prefix: "Investigative", color: "bg-emerald-500", hoverColor: "group-hover:bg-emerald-650" },
    { label: "Artistic (A)", prefix: "Artistic", color: "bg-amber-500", hoverColor: "group-hover:bg-amber-655" },
    { label: "Social (S)", prefix: "Social", color: "bg-sky-500", hoverColor: "group-hover:bg-sky-650" },
    { label: "Enterprising (E)", prefix: "Enterprising", color: "bg-indigo-500", hoverColor: "group-hover:bg-indigo-650" },
    { label: "Conventional (C)", prefix: "Conventional", color: "bg-pink-500", hoverColor: "group-hover:bg-pink-655" }
  ];

  const riasecDistribution = hollandCats.map(cat => {
    // Count students who have this category as part of their topRiasec
    // Or prioritize students where this category is ranked 1st
    const studentsWithCat = filteredRecords.filter(r => 
      r.topRiasec && r.topRiasec.some(tr => tr.startsWith(cat.prefix))
    );
    const isFirstRankStudents = filteredRecords.filter(r => 
      r.topRiasec && r.topRiasec[0] && r.topRiasec[0].startsWith(cat.prefix)
    );
    
    return {
      ...cat,
      students: studentsWithCat,
      firstRankCount: isFirstRankStudents.length,
      percentage: totalStudents ? Math.round((studentsWithCat.length / totalStudents) * 100) : 0,
      totalCount: studentsWithCat.length
    };
  });

  // 5. RAPOR VALUE SEGMENTATION
  const raporRanges = [
    { label: "Amat Sangat Unggul (≥ 91)", min: 91, max: 100, color: "bg-emerald-600" },
    { label: "Unggul Kompetitif (85-90)", min: 85, max: 90, color: "bg-blue-600" },
    { label: "Rata-rata Baik (75-84)", min: 75, max: 84, color: "bg-yellow-500" },
    { label: "Membutuhkan Bimbingan (< 75)", min: 0, max: 74, color: "bg-rose-500" }
  ];

  const raporDistribution = raporRanges.map(range => {
    const students = filteredRecords.filter(r => r.avgRapor >= range.min && r.avgRapor <= range.max);
    return {
      ...range,
      students,
      count: students.length,
      percentage: totalStudents ? Math.round((students.length / totalStudents) * 100) : 0
    };
  });

  // 6. POPULAR PROGRAM OF STUDIES MODEL COUNT
  const majorPopularity: Record<string, { count: number, students: string[] }> = {};
  filteredRecords.forEach(r => {
    r.rekomendasiJurusan.forEach(m => {
      if (!majorPopularity[m]) {
        majorPopularity[m] = { count: 0, students: [] };
      }
      majorPopularity[m].count += 1;
      if (!majorPopularity[m].students.includes(r.nama)) {
        majorPopularity[m].students.push(r.nama);
      }
    });
  });

  const sortedMajors = Object.entries(majorPopularity)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* 1. Header Admin Panel */}
      <div className="bg-gradient-to-r from-slate-905 to-slate-805 text-white rounded-3xl p-6 md:p-8 border border-slate-800 shadow-xl relative overflow-hidden no-print">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-650/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/5 rounded-full blur-2xl"></div>

        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600/20 text-red-400 border border-red-500/20 rounded-full text-[10px] font-extrabold uppercase font-mono tracking-widest">
              Portal Analitik &amp; BK Sekolah Cendekia BAZNAS
            </div>
            
            <h2 className="text-2xl md:text-3.5xl font-black tracking-tight font-display">
              Dashboard <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-300">Infografis &amp; Rekap</span> 
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Pemantauan sebaran kecerdasan kognitif (IQ), karakter karir Holland (RIASEC), prestasi akademis rapor, serta pemetaan bimbingan karir pendaftaran kuliah bagi santri secara real-time.
            </p>
          </div>

          <button
            onClick={handlePrintReport}
            className="px-5 py-3 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 hover:border-slate-350 rounded-2xl text-xs font-black shadow-lg hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 font-mono"
          >
            <Printer className="h-4.5 w-4.5 text-blue-650" />
            CETAK LAPORAN BK
          </button>
        </div>
      </div>

      {/* Printable Report Header (Hidden on screen, visible during printing) */}
      <div className="hidden print:block space-y-4 text-center border-b-2 border-slate-900 pb-4">
        <h2 className="text-lg font-black uppercase">SEKOLAH CENDEKIA BAZNAS (SCB)</h2>
        <h1 className="text-2xl font-bold tracking-wide">LAPORAN REKAPITULASI ASESMEN BIMBINGAN KARIR</h1>
        <p className="text-xs font-mono">
          Tanggal Cetak: {new Date().toLocaleDateString("id-ID")} • Status Kelas: {activeClassFilter === "All" ? "Semua Kelas Terdaftar" : activeClassFilter}
        </p>
      </div>

      {/* 2. Class filter selector rail */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print sm:sticky sm:top-20 sm:z-10 bg-opacity-95 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono uppercase tracking-wider">
            Saring Analitik:
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {availableClasses.map((cls) => (
            <button
              key={cls}
              onClick={() => setActiveClassFilter(cls)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeClassFilter === cls
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow"
                  : "bg-slate-50 dark:bg-slate-950 text-slate-650 dark:text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-850"
              }`}
            >
              {cls === "All" ? "Semua Kelas" : cls}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Master statistics widgets cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        
        {/* Metric 1 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Total Santri Pasca-Tes</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/45 text-blue-650 dark:text-blue-400 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-black text-slate-905 dark:text-white font-display">
              {totalStudents} <span className="text-xs text-slate-500 font-semibold font-mono">Santri</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Mengisi instrumen di browser</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Rerata IQ Kognitif</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/45 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <BrainCircuit className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-black text-purple-700 dark:text-purple-400 font-display">
              {avgIq} 
            </div>
            <div className="inline-flex items-center gap-1 mt-1 text-[10px] text-purple-650 dark:text-purple-300 font-bold font-mono">
              ★ {avgIq >= 120 ? "Superior" : avgIq >= 110 ? "Rata-rata Tinggi" : "Rata-rata"}
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Rata-Rata Rapor</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/45 text-emerald-650 dark:text-emerald-400 flex items-center justify-center">
              <GraduationCap className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-black text-emerald-700 dark:text-emerald-400 font-display">
              {avgAkademik}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Skala 0 s/d 100 akademik</p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Holland Terkuat</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/45 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Compass className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-lg md:text-xl font-bold text-indigo-650 dark:text-indigo-400 truncate">
              {dominantRiasec}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Paling mendominasi santri</p>
          </div>
        </div>

      </div>

      {/* 4. Infographics Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* COL 1 & 2: IQ Distributions & Holland Metrics Charts */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* A. SEBARAN KECERDASAN KOGNITIF (IQ) - INFO GRAFIS DAN DAFTAR NAMA */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-purple-650 dark:text-purple-400 font-mono uppercase tracking-wider">
                Infografis Kecerdasan Kognitif
              </div>
              <h3 className="text-lg font-black text-slate-905 dark:text-white flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                Sebaran Tingkat IQ &amp; Pengelompokan Santri BC
              </h3>
              <p className="text-xs text-slate-500">
                Peta konsentrasi intelegensi santri berdasarkan kategori resmi Wechsler/Stanford-Binet demi optimalisasi program bimbingan lanjutan atau kelas program.
              </p>
            </div>

            {/* Visual Bars, Counts and Student names listed side-by-side */}
            <div className="space-y-6">
              {iqDistribution.map((iq) => {
                const hasStudentsStatus = iq.students.length > 0;
                return (
                  <div key={iq.label} className="border-b border-slate-50 dark:border-slate-850/60 pb-5 last:border-b-0 last:pb-0 space-y-2.5">
                    
                    {/* Header bar and counts info */}
                    <div className="flex justify-between items-center text-xs">
                      <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${iq.color}`}></span>
                        <span>{iq.label}</span>
                      </div>
                      <div className="text-slate-650 dark:text-slate-350 font-mono font-bold">
                        {iq.count} Peserta <span className="text-[10px] text-slate-400">({iq.percentage}%)</span>
                      </div>
                    </div>

                    {/* Progress Bar Graphic */}
                    <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden relative">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${iq.color}`} 
                        style={{ width: `${iq.percentage || 2}%` }}
                      ></div>
                    </div>

                    {/* SANTRIS NAMES IN THIS GROUP (Matches literal: IQ ada jumlah peserta nama-nama) */}
                    <div className="p-3 bg-slate-50/50 dark:bg-slate-950 rounded-xl border border-slate-150/40 dark:border-slate-850/60">
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-1.5 flex items-center gap-1">
                        <span>Anggota Kelompok ({iq.count} Santri):</span>
                      </div>
                      
                      {hasStudentsStatus ? (
                        <div className="flex flex-wrap gap-1.5">
                          {iq.students.map((student) => (
                            <span 
                              key={student.id} 
                              className={`px-2 py-1 text-[10px] font-bold rounded-lg border flex items-center gap-1 ${rangeTextStyling(iq.text)}`}
                              title={`Skor IQ Asli: ${student.iqScore}`}
                            >
                              {student.nama}
                              <span className="text-[9px] opacity-75 font-mono bg-white/60 dark:bg-slate-900/60 px-1 rounded">
                                IQ {student.iqScore} ({student.kelas})
                              </span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-400 italic font-mono">
                          Belum ada santri terdaftar di tingkat IQ kognitif ini pada kelas terpilih.
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* B. SEBARAN KARAKTER MINAT RIASEC - INFOGRAFIS & SANTRIS */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-indigo-650 dark:text-indigo-400 font-mono uppercase tracking-wider">
                Holland RIASEC Orientation Profile
              </div>
              <h3 className="text-lg font-black text-slate-905 dark:text-white flex items-center gap-2">
                <Compass className="h-5 w-5 text-indigo-650 dark:text-indigo-400 animate-spin-slow" />
                Matriks Orientasi Minat Karir RIASEC Santri
              </h3>
              <p className="text-xs text-slate-500">
                Mengukur tingkat konsentrasi santri pada 6 dimensi orientasi karir Holland. Santri dengan minimal 1 kecocokan dimasukkan dalam pengelompokan.
              </p>
            </div>

            {/* Horizontal Grid Bars representation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {riasecDistribution.map((cat) => {
                const count = cat.totalCount;
                return (
                  <div 
                    key={cat.label} 
                    className="p-4 rounded-2xl border border-slate-150 dark:border-slate-850 bg-slate-50/20 dark:bg-slate-950/10 hover:border-slate-300 dark:hover:border-slate-750 transition-all space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-805 dark:text-slate-100 font-display">
                          {cat.label}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-850 text-slate-650 dark:text-slate-350 font-mono font-bold rounded-md">
                          {count} Kecocokan 
                        </span>
                      </div>

                      {/* Visual gauge */}
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${cat.color}`}
                          style={{ width: `${cat.percentage || 4}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Mini Santri List badge */}
                    <div className="space-y-1 pt-1.5 border-t border-slate-100 dark:border-slate-850/80">
                      <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest font-mono block">
                        Daftar Karakter Dominan:
                      </span>
                      {count > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {cat.students.map((st) => {
                            const isDominantFirst = st.topRiasec && st.topRiasec[0] && st.topRiasec[0].startsWith(cat.prefix);
                            return (
                              <span 
                                key={st.id} 
                                className={`text-[9.5px] px-1.5 py-0.5 rounded font-medium ${
                                  isDominantFirst 
                                    ? "bg-slate-900 text-white font-black dark:bg-white dark:text-slate-950" 
                                    : "bg-slate-100/80 dark:bg-slate-850 text-slate-600 dark:text-slate-400"
                                }`}
                                title={isDominantFirst ? "Orientasi Paling Utama (1st)" : "Orientasi Alternatif"}
                              >
                                {st.nama} {isDominantFirst ? "🥇" : ""}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-[9.5px] text-slate-400 italic">Belum ada santri teridentifikasi</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* COL 3 (Sidebar graphs): Rapor Distributions, Popular Majors */}
        <div className="space-y-6">
          
          {/* C. DISTRIBUSI SEBARAN RAPOR */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-450 font-mono uppercase tracking-wider">
                Academic Grade Matrix
              </div>
              <h3 className="text-base font-black text-slate-905 dark:text-white flex items-center gap-1.5">
                <GraduationCap className="h-5 w-5 text-emerald-600" />
                Delineasi Rapor Santri
              </h3>
              <p className="text-[11px] text-slate-500">
                Peta capaian indeks akademik guna memberikan rekomendasi perguruan tinggi negeri / PTKIN yang sesuai dengan rumpun nilai.
              </p>
            </div>

            <div className="space-y-4">
              {raporDistribution.map((range) => {
                const hasStudents = range.students.length > 0;
                return (
                  <div key={range.label} className="space-y-1.5">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-bold text-slate-700 dark:text-slate-300">{range.label}</span>
                      <span className="font-mono font-bold text-slate-500">{range.count} Santri ({range.percentage}%)</span>
                    </div>

                    <div className="h-2 w-full bg-slate-105 dark:bg-slate-850 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${range.color}`}
                        style={{ width: `${range.percentage || 2}%` }}
                      ></div>
                    </div>

                    {/* Student Names listing under category */}
                    <div className="bg-slate-50/50 dark:bg-slate-950 rounded-lg p-1.5 text-[9.5px] font-mono text-slate-600 dark:text-slate-400">
                      {hasStudents ? (
                        <div className="flex flex-wrap gap-1">
                          {range.students.map((r, i) => (
                            <span key={i} className="after:content-[','] last:after:content-[''] pr-0.5 font-bold text-slate-800 dark:text-slate-350">
                              {r.nama} ({r.avgRapor})
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="italic text-slate-400">Belum ada di kriteria ini</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* D. TOP 5 JURUSAN PILIHAN UTAMA SANTRI */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-blue-600 dark:text-blue-450 font-mono uppercase tracking-wider">
                Career Target Analytics
              </div>
              <h3 className="text-base font-black text-slate-905 dark:text-white flex items-center gap-1.5">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Prodi Pilihan Terpopuler
              </h3>
              <p className="text-[11px] text-slate-500">
                Peringkat jurusan dan program studi yang paling direkomendasikan sistem bagi rombongan saringan kelas terpilih.
              </p>
            </div>

            <div className="space-y-3.5">
              {sortedMajors.length > 0 ? (
                sortedMajors.map((major, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-slate-50/20 dark:bg-slate-950/20 p-2.5 rounded-xl border border-slate-150/40 dark:border-slate-850/60 transition-all">
                    <div className="font-mono text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 w-6 h-6 rounded-lg flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold text-slate-805 dark:text-slate-200 truncate pr-2">
                          {major.name}
                        </h4>
                        <span className="text-[10px] font-mono font-bold text-slate-500 shrink-0">
                          {major.count} Rekomendasi
                        </span>
                      </div>
                      {/* Name tags of students in micro text */}
                      <p className="text-[9px] text-slate-450 font-mono truncate">
                        Siswa: {major.students.join(", ")}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-[11px] text-slate-450 italic text-center p-4">
                  Belum ada data rekomendasi karir cerdas untuk ditampilkan.
                </div>
              )}
            </div>
          </div>

          {/* E. QUICK GUIDE ON EXECUTING REPORTS */}
          <div className="bg-slate-900 border border-slate-800 text-slate-350 rounded-2xl p-4 text-[11px] leading-relaxed space-y-2 font-mono no-print">
            <div className="flex items-center gap-1.5 text-red-400 font-bold uppercase text-[10px] tracking-wide">
              <CheckCircle className="h-3.5 w-3.5" />
              Catatan Bimbingan BK:
            </div>
            <p>
              Gunakan tombol <span className="text-white font-bold">CETAK LAPORAN BK</span> di atas untuk mengekspor dashboard analitik beserta diagram sebaran ini menjadi kertas fisik penyerahan wali santri atau laporan sekolah.
            </p>
          </div>

        </div>

      </div>

      {/* 5. Rekap Master Database Table directly below infographics */}
      <div className="space-y-3 mt-8">
        <div className="px-1 space-y-1">
          <h3 className="text-lg font-black text-slate-905 dark:text-white font-display">
            Pangkalan Data Siswa &amp; Rekapitulasi Kolektif
          </h3>
          <p className="text-xs text-slate-550 dark:text-slate-400">
            Daftar lengkap record data santri peserta yang dimasukkan ditiap browser. Admin dibekali otoritas untuk menghapus record individu atau membersihkan database instan guna memulai periode kelompok belajar baru.
          </p>
        </div>
        
        {/* Pass isAdmin prop and trigger re-render on sync change key */}
        <div key={syncKey}>
          <RekapHasilSiswa appState={EMPTY_APP_STATE} isAdmin={true} />
        </div>
      </div>

    </div>
  );
}

// Quick status label ranges colorizer helper
function rangeTextStyling(badgeTextClass: string): string {
  if (badgeTextClass.includes("indigo")) return "bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-150 dark:border-indigo-900/40 text-indigo-700 dark:text-indigo-400";
  if (badgeTextClass.includes("purple")) return "bg-purple-50/50 dark:bg-purple-950/30 border-purple-150 dark:border-purple-900/40 text-purple-700 dark:text-purple-400";
  if (badgeTextClass.includes("blue")) return "bg-blue-50/50 dark:bg-blue-950/30 border-blue-150 dark:border-blue-900/40 text-blue-700 dark:text-blue-400";
  if (badgeTextClass.includes("teal")) return "bg-teal-50/50 dark:bg-teal-950/30 border-teal-150 dark:border-teal-900/40 text-teal-700 dark:text-teal-400";
  return "bg-amber-50/50 dark:bg-amber-950/30 border-amber-150 dark:border-amber-900/40 text-amber-700 dark:text-amber-400";
}
