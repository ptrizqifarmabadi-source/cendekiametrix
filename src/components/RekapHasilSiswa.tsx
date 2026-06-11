/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { FullAppState, HafalanQuranType } from "../types";
import { Search, ArrowUpDown, Trash2, Plus, Check, FileText, Filter, Users, GraduationCap, Compass, BrainCircuit, BookOpen, Download, FileSpreadsheet, Printer } from "lucide-react";

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

// 5 default high-fidelity mock records representing peers who have completed the test (now cleared of dummy examples)
const DEFAULT_RECORDS: CompletedTestRecord[] = [];

interface RekapHasilSiswaProps {
  appState: FullAppState;
  isAdmin?: boolean;
}

export default function RekapHasilSiswa({ appState, isAdmin }: RekapHasilSiswaProps) {
  const [records, setRecords] = useState<CompletedTestRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("All");
  const [sortBy, setSortBy] = useState<"nama" | "avgRapor" | "iqScore" | "tanggalTes">("tanggalTes");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [savedSuccessAlert, setSavedSuccessAlert] = useState(false);

  // Load records from local storage or set defaults
  useEffect(() => {
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
  }, []);

  // Check if current user has already been saved
  const isCurrentUserSaved = records.some(r => r.nisn === appState.profile.nisn && r.nisn !== "");

  // Save current student's results
  const handleSaveCurrentUser = () => {
    const { profile, keagamaan, akademik, minatBakat, iqTest, aiRecommendation } = appState;
    if (!profile.nama) {
      alert("Masukkan nama lengkap Anda terlebih dahulu di menu 'Data Diri Siswa' sebelum menyimpan.");
      return;
    }

    // Calculations
    const isSmp = profile.kelas && (profile.kelas.includes("Kelas 7") || profile.kelas.includes("Kelas 8") || profile.kelas.includes("Kelas 9"));

    const rValues = Object.values(akademik.nilaiRapor);
    const avgRapor = rValues.length ? Math.round(rValues.reduce((a, b) => a + b, 0) / rValues.length) : 0;
    
    let sortedRiasec: string[] = [];
    if (isSmp) {
      // Calculate Gaya Belajar dominants
      const scoresVAK = { V: 0, A: 0, K: 0 };
      Object.entries(appState.gayaBelajar.answers).forEach(([qIdStr, val]) => {
        const qId = parseInt(qIdStr);
        if (qId >= 1 && qId <= 10) scoresVAK.V += val;
        else if (qId >= 11 && qId <= 20) scoresVAK.A += val;
        else if (qId >= 21 && qId <= 30) scoresVAK.K += val;
      });

      const maxPoints = 50;
      const sorted = [
        { label: "Visual (V)", val: Math.round((scoresVAK.V / maxPoints) * 100) },
        { label: "Auditori (A)", val: Math.round((scoresVAK.A / maxPoints) * 100) },
        { label: "Kinestetik (K)", val: Math.round((scoresVAK.K / maxPoints) * 100) }
      ].sort((a, b) => b.val - a.val);

      sortedRiasec = sorted.map(x => `${x.label} (${x.val}%)`);
    } else {
      // RIASEC top 3
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
        R: "Realistic (R)",
        I: "Investigative (I)",
        A: "Artistic (A)",
        S: "Social (S)",
        E: "Enterprising (E)",
        C: "Conventional (C)"
      };

      sortedRiasec = (Object.keys(riasecMappingScore) as ("R" | "I" | "A" | "S" | "E" | "C")[])
        .map(key => ({
          label: dominanLabels[key],
          val: riasecMappingScore[key]
        }))
        .sort((a, b) => b.val - a.val)
        .slice(0, 3)
        .map(x => x.label);
    }

    // Get major names
    const recMajors = aiRecommendation.majors.map(m => m.name).slice(0, 2);
    if (recMajors.length === 0) {
      recMajors.push("Selesaikan Rekomendasi Karir AI");
    }

    // IQ category
    let iqCat = "Rata-rata";
    const iqVal = iqTest.iqScore || 100;
    if (iqVal >= 130) iqCat = "Sangat Superior";
    else if (iqVal >= 120) iqCat = "Superior";
    else if (iqVal >= 110) iqCat = "Rata-rata Tinggi";
    else if (iqVal >= 90) iqCat = "Rata-rata";
    else iqCat = "Rata-rata Bawah";

    const newRecord: CompletedTestRecord = {
      id: "user-" + Date.now(),
      nama: profile.nama,
      nisn: profile.nisn || "0090000000",
      kelas: profile.kelas || "Kelas X-A",
      avgRapor: isSmp ? 0 : avgRapor,
      iqScore: iqVal,
      iqCategory: iqCat,
      topRiasec: sortedRiasec,
      rekomendasiJurusan: recMajors,
      tanggalTes: new Date().toISOString().split("T")[0],
      isUserAdded: true
    };

    // Filter out duplicates with same NISN/Name if they already exist
    const updated = [newRecord, ...records.filter(r => r.nisn !== newRecord.nisn && r.nama !== newRecord.nama)];
    setRecords(updated);
    localStorage.setItem("sipetakuliah_cohort_recap", JSON.stringify(updated));
    setSavedSuccessAlert(true);
    setTimeout(() => setSavedSuccessAlert(false), 4000);
  };

  // Reset/Clear records back to default mocks
  const handleResetRecords = () => {
    if (confirm("Apakah Anda yakin ingin menyetel ulang daftar rekapan ke data bawaan simulasi?")) {
      setRecords(DEFAULT_RECORDS);
      localStorage.setItem("sipetakuliah_cohort_recap", JSON.stringify(DEFAULT_RECORDS));
    }
  };

  // Clear all records entirely
  const handleClearAllRecords = () => {
    if (confirm("Apakah Anda yakin ingin MENGHAPUS SEMUA DATA rekapan peserta? Tindakan ini bersifat permanen dan akan melenyapkan semua data contoh/peserta.")) {
      setRecords([]);
      localStorage.setItem("sipetakuliah_cohort_recap", JSON.stringify([]));
    }
  };

  // Sorting handler
  const handleSort = (field: "nama" | "avgRapor" | "iqScore" | "tanggalTes") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  // Export database to formatted Excel (CSV with UTF-8 BOM)
  const handleExportExcel = () => {
    if (filteredRecords.length === 0) {
      alert("Tidak ada data siswa yang tersedia untuk diekspor dengan kriteria filter saat ini.");
      return;
    }
    
    const headers = [
      "No",
      "Nama Siswa",
      "NISN",
      "Rumpun/Kelas",
      "Rata-Rata Rapor",
      "Skor IQ",
      "Kategori IQ",
      "Asesmen Kognitif / Karir (RIASEC atau Gaya Belajar)",
      "Rekomendasi Utama BK (Pilihan Jurusan/Studi)",
      "Tanggal Input"
    ];

    const csvRows = [headers.join(",")];

    filteredRecords.forEach((rec, idx) => {
      const isSmp = rec.kelas.includes("Kelas 7") || rec.kelas.includes("Kelas 8") || rec.kelas.includes("Kelas 9");
      const testResult = rec.topRiasec.map(r => r.replace(/"/g, '""')).join(" | ");
      const majors = rec.rekomendasiJurusan.map(j => j.replace(/"/g, '""')).join(" / ");
      
      const row = [
        idx + 1,
        `"${rec.nama.replace(/"/g, '""')}"`,
        `"${rec.nisn}"`,
        `"${rec.kelas}"`,
        isSmp ? "-" : rec.avgRapor,
        rec.iqScore,
        `"${rec.iqCategory}"`,
        `"${testResult}"`,
        `"${majors}"`,
        `"${rec.tanggalTes}"`
      ];
      csvRows.push(row.join(","));
    });

    const csvContent = "\uFEFF" + csvRows.join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Rekap_Kolektif_CendekiaMetrix_${classFilter.replace(/[\s/]+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export/Print database to a formatted PDF transcript document
  const handleExportPdf = () => {
    if (filteredRecords.length === 0) {
      alert("Tidak ada data siswa yang tersedia untuk dicetak.");
      return;
    }
    window.print();
  };

  // Filter & Sort core logic
  const filteredRecords = records
    .filter(rec => {
      const matchSearch = 
        rec.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.nisn.includes(searchTerm) ||
        rec.rekomendasiJurusan.some(j => j.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchClass = classFilter === "All" || rec.kelas === classFilter;
      return matchSearch && matchClass;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === "nama") {
        comparison = a.nama.localeCompare(b.nama);
      } else if (sortBy === "avgRapor") {
        comparison = a.avgRapor - b.avgRapor;
      } else if (sortBy === "iqScore") {
        comparison = a.iqScore - b.iqScore;
      } else if (sortBy === "tanggalTes") {
        comparison = a.tanggalTes.localeCompare(b.tanggalTes);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

  // Extract classes for filter list
  const classes = [
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
    ...(Array.from(new Set(records.map(r => r.kelas))) as string[]).filter(c => c && !["Kelas 7 Ikhwan", "Kelas 7 Akhwat", "Kelas 8 Ikhwan", "Kelas 8 Akhwat", "Kelas 9 Ikhwan", "Kelas 9 Akhwat", "Kelas 10 Ikhwan", "Kelas 10 Akhwat", "Kelas 11 Ikhwan", "Kelas 11 Akhwat", "Kelas 12 Ikhwan", "Kelas 12 Akhwat"].includes(c))
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0 print:text-black">
      
      {/* Formal Header - Only Visible on PDF Printout */}
      <div className="hidden print:block border-b-2 border-slate-800 pb-4 mb-6">
        <div className="flex items-center justify-between gap-6">
          <img 
            src="https://lh3.googleusercontent.com/d/1ugonzA_1B-ukGoqRRUIQbLK8QPIzo26V" 
            alt="Sekolah Cendekia BAZNAS Logo" 
            className="h-20 w-auto object-contain"
            referrerPolicy="no-referrer"
          />
          <div className="text-right space-y-1">
            <h1 className="text-lg font-black tracking-tight text-black font-display uppercase">
              REKAPITULASI HASIL ASESMEN SISWA (CENDEKIA METRIX)
            </h1>
            <h2 className="text-xs font-bold text-slate-800 uppercase">
              Sekolah Cendekia BAZNAS • Jajaran Bimbingan Konseling (BK)
            </h2>
            <p className="text-[9px] text-slate-600 font-mono">
              Jl. Masjid Baitul Ilmi, Cemplang, Cibungbulang, Bogor, Jawa Barat 16630
            </p>
          </div>
        </div>
        
        {/* Report metadata summary bar */}
        <div className="mt-4 pt-3 border-t border-slate-200 grid grid-cols-3 text-[10px] font-medium text-slate-705">
          <div>
            <strong>Kategori Kelas:</strong> {classFilter === "All" ? "Semua Kelas" : classFilter}
          </div>
          <div className="text-center">
            <strong>Jumlah Peserta:</strong> {filteredRecords.length} Siswa Terarsip
          </div>
          <div className="text-right">
            <strong>Tanggal Unduh:</strong> {new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Upper banner info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 dark:border-gray-800 pb-5 gap-4 no-print">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-mono font-bold uppercase tracking-wider">
            <Users className="h-4 w-4 animate-bounce" />
            Database Rekapan Hasil Siswa
          </div>
          <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
            Rekap Kolektif Peserta & Rekomendasi Jurusan
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Daftar siswa angkatan Sekolah Cendekia BAZNAS yang telah berpartisipasi dan melengkapi instrumen asesmen karir kognitif.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 md:gap-2.5">
          {/* Add active user score record */}
          {!isCurrentUserSaved ? (
            <button
              onClick={handleSaveCurrentUser}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer no-print"
            >
              <Plus className="h-4 w-4" /> Simpan Hasil Anda
            </button>
          ) : (
            <div className="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-250 font-bold text-xs rounded-xl flex items-center gap-1.5 no-print">
              <Check className="h-4 w-4 stroke-[3px]" /> Terdaftar
            </div>
          )}

          {/* Export CSV/Excel Button */}
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950/30 text-emerald-700 dark:text-emerald-400 border border-slate-200 dark:border-slate-800 hover:border-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer no-print"
            title="Ekspor Seluruh Basis Data ke Excel (CSV)"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Format Excel</span>
          </button>

          {/* Export PDF Print Button */}
          <button
            onClick={handleExportPdf}
            className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950/30 text-blue-700 dark:text-blue-400 border border-slate-200 dark:border-slate-800 hover:border-blue-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer no-print"
            title="Cetak Laporan atau Simpan PDF Resmi"
          >
            <Printer className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Cetak PDF</span>
          </button>

          <button
            onClick={handleResetRecords}
            className="px-3.5 py-2 border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-red-500 rounded-xl text-xs font-bold transition-all cursor-pointer no-print"
            title="Kembalikan ke data awal"
          >
            Reset
          </button>

          {isAdmin && (
            <button
              onClick={handleClearAllRecords}
              className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer no-print"
              title="MENGHAPUS SEMUA DATA PESERTA"
            >
              <Trash2 className="h-4 w-4" /> Hapus Semua
            </button>
          )}
        </div>
      </div>

      {/* Success alert */}
      {savedSuccessAlert && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 p-4 border border-emerald-150 dark:border-emerald-900/40 rounded-xl text-xs font-medium animate-pulse flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0 bg-emerald-500 text-white rounded-full p-0.5" />
          <span>Hasil bimbingan & rekomendasi Anda berhasil disimpan ke dalam daftar rekapan database sekolah!</span>
        </div>
      )}

      {/* Filter and search utilities controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
        
        {/* Search input field */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari siswa, NISN, atau jurusan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:ring-1 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-white"
          />
        </div>

        {/* Class switcher select dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-gray-800 dark:text-gray-200"
          >
            {classes.map((cls) => (
              <option key={cls} value={cls}>
                {cls === "All" ? "Semua Rumpun / Kelas" : cls}
              </option>
            ))}
          </select>
        </div>

        {/* Informative counts display */}
        <div className="flex items-center justify-end text-xs text-slate-500 font-mono font-medium">
          Menampilkan: {filteredRecords.length} / {records.length} Siswa Terdaftar
        </div>

      </div>

      {/* Main Table database collection */}
      <div className="border border-slate-150 dark:border-slate-850 rounded-2xl overflow-hidden overflow-x-auto print:border-none print:overflow-visible">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-150 dark:border-slate-850 text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider print:bg-white print:text-black">
              <th className="p-4">Identitas Siswa</th>
              <th className="p-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors" onClick={() => handleSort("avgRapor")}>
                <div className="flex items-center gap-1">
                  Rata Rapor
                  <ArrowUpDown className="h-3 w-3 no-print" />
                </div>
              </th>
              <th className="p-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors" onClick={() => handleSort("iqScore")}>
                <div className="flex items-center gap-1">
                  IQ Kognitif
                  <ArrowUpDown className="h-3 w-3 no-print" />
                </div>
              </th>
              <th className="p-4">Kode Holland RIASEC</th>
              <th className="p-4">Rekomendasi Utama BK</th>
              <th className="p-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors" onClick={() => handleSort("tanggalTes")}>
                <div className="flex items-center gap-1">
                  Tanggal Input
                  <ArrowUpDown className="h-3 w-3 no-print" />
                </div>
              </th>
              <th className="p-4 text-center no-print">Aksi / Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-150 dark:divide-slate-850 text-xs">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-450 italic">
                  Tidak ditemukan record data siswa yang sesuai untuk kriteria pencarian " {searchTerm} ".
                </td>
              </tr>
            ) : (
              filteredRecords.map((rec) => (
                <tr 
                  key={rec.id} 
                  className={`hover:bg-slate-50/50 dark:hover:bg-slate-950/40 transition-colors ${
                    rec.isUserAdded ? "bg-emerald-50/10 dark:bg-emerald-950/5" : ""
                  }`}
                >
                  {/* Name, Class & Badge */}
                  <td className="p-4 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 dark:text-slate-100">{rec.nama}</span>
                      {rec.isUserAdded && (
                        <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-400 rounded text-[9px] font-bold tracking-wide uppercase">
                          Anda
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      NISN: {rec.nisn} • <span className="font-bold text-blue-600 dark:text-blue-400">{rec.kelas}</span>
                    </div>
                  </td>                   {/* GPA Average */}
                  <td className="p-4 font-mono font-bold text-slate-800 dark:text-slate-350">
                    {rec.kelas.includes("Kelas 7") || rec.kelas.includes("Kelas 8") || rec.kelas.includes("Kelas 9") ? (
                      <span className="text-gray-400 font-sans font-normal text-xs">-</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                        <span>{rec.avgRapor}</span>
                      </div>
                    )}
                  </td>

                  {/* Cognitive IQ */}
                  <td className="p-4 font-mono">
                    <div className="flex items-center gap-2">
                      <BrainCircuit className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                      <div>
                        <span className="font-bold text-purple-700 dark:text-purple-400">{rec.iqScore}</span>
                        <span className="block text-[9px] text-slate-500 truncate">{rec.iqCategory}</span>
                      </div>
                    </div>
                  </td>

                  {/* RIASEC Dominant Type / Gaya Belajar */}
                  <td className="p-4 space-y-1 max-w-[170px]">
                    {rec.kelas.includes("Kelas 7") || rec.kelas.includes("Kelas 8") || rec.kelas.includes("Kelas 9") ? (
                      <>
                        <div className="flex items-center gap-1 text-[10px]">
                          <Compass className="h-3.5 w-3.5 text-purple-655 shrink-0 animate-spin-slow" />
                          <span className="font-bold text-gray-700 dark:text-gray-300">Gaya Belajar:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {rec.topRiasec.map((r, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 text-[9px] rounded font-mono font-semibold truncate max-w-[130px]">
                              {r}
                            </span>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-1 text-[10px]">
                          <Compass className="h-3.5 w-3.5 text-purple-650 shrink-0" />
                          <span className="font-bold text-gray-700 dark:text-gray-300">Dominan 3-Tipe:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {rec.topRiasec.map((r, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-850 text-slate-700 dark:text-slate-300 text-[9px] rounded font-mono font-medium truncate max-w-[120px]">
                              {r.split(" ")[0]}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </td>

                  {/* Recommended major */}
                  <td className="p-4 max-w-[200px]">
                    <ul className="space-y-1">
                      {rec.rekomendasiJurusan.map((j, i) => (
                        <li key={i} className="flex items-center gap-1.5 text-xs text-slate-850 dark:text-slate-300 font-medium">
                          <span className={`w-1.5 h-1.5 rounded-full ${i === 0 ? "bg-indigo-500" : "bg-teal-500"}`} />
                          <span className="truncate">{j}</span>
                        </li>
                      ))}
                    </ul>
                  </td>

                  {/* Date Input */}
                  <td className="p-4 text-[11px] font-mono font-medium text-slate-450">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3 text-slate-400" />
                      {rec.tanggalTes}
                    </div>
                  </td>

                  {/* Actions (Delete only custom userAdded items for safety, or all if Admin) */}
                  <td className="p-4 text-center no-print">
                    {(rec.isUserAdded || isAdmin) ? (
                      <button
                        onClick={() => {
                          if (confirm(`Hapus data rekapan untuk ${rec.nama}?`)) {
                            const updated = records.filter(r => r.id !== rec.id);
                            setRecords(updated);
                            localStorage.setItem("sipetakuliah_cohort_recap", JSON.stringify(updated));
                          }
                        }}
                        className="p-1 px-2 border border-red-250 dark:border-red-900 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 text-red-650 rounded-lg text-[10px] font-bold cursor-pointer transition-all inline-flex items-center gap-1 font-mono"
                        title="Hapus Record"
                      >
                        <Trash2 className="h-3 w-3" /> Hapus
                      </button>
                    ) : (
                      <span className="px-2 py-1 bg-slate-50 dark:bg-slate-850 text-slate-400 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider select-none">
                        Sistem
                      </span>
                    )}
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Formal Footer Signature Block - Only Visible on PDF Printout */}
      <div className="hidden print:block mt-12 pt-6 border-t border-slate-200">
        <div className="grid grid-cols-2 text-center text-xs font-semibold text-black gap-12 leading-relaxed">
          <div className="space-y-16">
            <p>Mengetahui,<br /><span className="font-bold text-slate-800">Kepala Sekolah Cendekia BAZNAS</span></p>
            <div className="border-b border-black w-48 mx-auto" />
            <p className="text-[10px] text-slate-500 font-mono">NIP. _______________________</p>
          </div>
          <div className="space-y-16">
            <p>Bogor, {new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}<br /><span className="font-bold text-slate-800">Koordinator Bimbingan Konseling (BK)</span></p>
            <div className="border-b border-black w-48 mx-auto" />
            <p className="text-[10px] text-slate-500 font-mono">NIP. _______________________</p>
          </div>
        </div>
        
        {/* Footnote system branding info */}
        <div className="text-center text-[9px] text-slate-400 font-mono mt-16 pt-3 border-t border-slate-100">
          Dokumen hasil kompilasi kognitif digital disahkan secara otomatis oleh platform Cendekia Metrix. Seluruh data kognitif, rata-rata rapor, dan rekap tipe karir dilindungi serta dipelihara resmi oleh Jajaran BK Sekolah Cendekia BAZNAS.
        </div>
      </div>

    </div>
  );
}
