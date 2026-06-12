import React, { useState } from "react";
import { PortfolioState, StudentProfile } from "../types";
import { 
  BookOpen, 
  GraduationCap, 
  Trophy, 
  School, 
  Award, 
  Languages, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle,
  ShieldCheck,
  Bookmark,
  Plus,
  Trash2,
  Calendar,
  Building,
  User
} from "lucide-react";

interface PortofolioMandiriProps {
  state?: PortfolioState;
  onChange: (next: PortfolioState) => void;
  onNext: () => void;
  onPrev: () => void;
  jenjang: "SMP" | "SMA";
  profile?: StudentProfile;
}

const DEFAULT_PORTFOLIO: PortfolioState = {
  hafalan: [],
  akademik: [],
  ekskul: [],
  seminar: [],
  karya: [],
  bahasa: []
};

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const YEARS = [
  "2028", "2027", "2026", "2025", "2024", "2023", "2022", "2021", "2020"
];

export default function PortofolioMandiri({ state, onChange, onNext, onPrev, jenjang, profile }: PortofolioMandiriProps) {
  // Gracefulness for legacy state loading
  const rawData = state || DEFAULT_PORTFOLIO;
  
  const getSanitizedList = <K extends keyof PortfolioState>(key: K): any[] => {
    if (Array.isArray(rawData[key])) {
      return rawData[key] as any[];
    }
    // If legacy object was loaded, wrap it in an array so it doesn't break
    if (rawData[key] && typeof rawData[key] === "object") {
      const vals = Object.values(rawData[key]).filter(Boolean);
      if (vals.length > 0) {
        return [{ id: "legacy-1", bulan: "Juni", tahun: "2026", penyelenggara: "Sekolah Cendekia BAZNAS", ...(rawData[key] as any) }];
      }
    }
    return [];
  };

  const data: PortfolioState = {
    hafalan: getSanitizedList("hafalan"),
    akademik: getSanitizedList("akademik"),
    ekskul: getSanitizedList("ekskul"),
    seminar: getSanitizedList("seminar"),
    karya: getSanitizedList("karya"),
    bahasa: getSanitizedList("bahasa"),
  };

  const [activeTab, setActiveTab] = useState<number>(1);
  const [showSavedNotification, setShowSavedNotification] = useState<boolean>(false);

  // Initialize draft fields for new entries
  const [draftHafalan, setDraftHafalan] = useState({ juz: "", surat: "", haditsDoa: "", level: "Pemula" as any, bulan: "Juni", tahun: "2026", penyelenggara: "" });
  const [draftAkademik, setDraftAkademik] = useState({ juaraLomba: "", peringkat: "", rataRapor: "", mapelUnggulan: "", level: "Sekolah" as any, bulan: "Juni", tahun: "2026", penyelenggara: "" });
  const [draftEkskul, setDraftEkskul] = useState({ osis: "", pramuka: "", rohis: "", paskibraPmr: "", olahragaSeni: "", level: "Anggota" as any, bulan: "Juni", tahun: "2026", penyelenggara: "" });
  const [draftSeminar, setDraftSeminar] = useState({ publicSpeaking: "", workshopSains: "", seminarKarir: "", pelatihanIt: "", webinar: "", level: "Peserta" as any, bulan: "Juni", tahun: "2026", penyelenggara: "" });
  const [draftKarya, setDraftKarya] = useState({ tulisan: "", desain: "", video: "", mindmap: "", karyaSeni: "", level: "Pribadi" as any, bulan: "Juni", tahun: "2026", penyelenggara: "" });
  const [draftBahasa, setDraftBahasa] = useState({ inggris: "", arab: "", lainnya: "", level: "A1" as any, bulan: "Juni", tahun: "2026", penyelenggara: "" });

  const handleAddItem = <K extends keyof PortfolioState>(
    section: K, 
    draft: any, 
    setDraft: React.Dispatch<React.SetStateAction<any>>,
    validateFields: string[]
  ) => {
    // Validate if at least one description field has text
    const isAnyFilled = validateFields.some(field => String(draft[field] || "").trim() !== "");
    if (!isAnyFilled) {
      alert("Harap lengkapi detail pencapaian / deskripsi sebelum menambahkan ke tabel.");
      return;
    }

    const newItem = {
      ...draft,
      id: `${section}-${Date.now()}`
    };

    const nextSectionList = [...data[section], newItem];
    onChange({
      ...data,
      [section]: nextSectionList
    });

    // Reset draft fields back to default parameters, keeping dates
    setDraft((prev: any) => {
      const resetObj: any = { ...prev, bulan: prev.bulan, tahun: prev.tahun, penyelenggara: "" };
      validateFields.forEach(f => {
        resetObj[f] = "";
      });
      return resetObj;
    });

    setShowSavedNotification(true);
    setTimeout(() => setShowSavedNotification(false), 2000);
  };

  const handleRemoveItem = <K extends keyof PortfolioState>(section: K, id: string) => {
    const nextList = data[section].filter((item: any) => item.id !== id);
    onChange({
      ...data,
      [section]: nextList
    });
  };

  const handleSaveDraft = () => {
    setShowSavedNotification(true);
    setTimeout(() => {
      setShowSavedNotification(false);
    }, 2500);
  };

  const tabs = [
    { id: 1, label: "Hafalan & Religius", icon: BookOpen },
    { id: 2, label: "Prestasi Akademik", icon: GraduationCap },
    { id: 3, label: "Ekskul & Organisasi", icon: Trophy },
    { id: 4, label: "Seminar & Workshop", icon: School },
    { id: 5, label: "Karya Kreatif", icon: Sparkles },
    { id: 6, label: "Bahasa Asing (CEFR)", icon: Languages }
  ];

  return (
    <div id="portofolio-mandiri-panel" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 font-sans tracking-tight">
            <Bookmark className="h-5.5 w-5.5 text-blue-600 dark:text-blue-400" />
            Portofolio Mandiri Siswa ({jenjang})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-1">
            Sistem rekam portofolio multi-riwayat. Tambahkan lebih dari 1 pencapaian/prestasi kualitatif, lengkap dengan bulan, tahun, dan lembaga penyelenggara.
          </p>
        </div>

        <button 
          onClick={handleSaveDraft}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold font-mono transition-all border border-slate-200 dark:border-slate-750 flex items-center justify-center gap-2 self-start md:self-center cursor-pointer"
        >
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          Simpan Seluruh Draf
        </button>
      </div>

      {showSavedNotification && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300 p-3 rounded-xl flex items-center gap-2.5 text-xs font-sans transition-all animate-fade-in shadow-sm">
          <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>Portofolio berhasil diperbarui dan disimpan dalam sistem lokal.</span>
        </div>
      )}

      {/* Modern Tabs Row Scrollable */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-print">
        {tabs.map((t) => {
          const IconObj = t.icon;
          const isActive = activeTab === t.id;
          const count = getSanitizedList(
            t.id === 1 ? "hafalan" : 
            t.id === 2 ? "akademik" : 
            t.id === 3 ? "ekskul" : 
            t.id === 4 ? "seminar" : 
            t.id === 5 ? "karya" : "bahasa"
          ).length;

          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border cursor-pointer ${
                isActive
                  ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/10"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850"
              }`}
            >
              <IconObj className="h-4 w-4 shrink-0" />
              <span>{t.label}</span>
              {count > 0 && (
                <span className={`px-1.5 py-0.5 text-[9px] font-mono rounded-full font-bold ${isActive ? "bg-white text-blue-700" : "bg-blue-105 text-blue-600 dark:bg-blue-950 dark:text-blue-400 border border-blue-200/50"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Tab Panels Form Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-8">
        
        {/* TAB 1: HAFALAN & RELIGIUS */}
        {activeTab === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono">1. Riwayat Hafalan Qur'an, Surat & Doa</h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">Mencatat pembinaan tahfidz, setoran juz, surat pilihan, doa harian, dan penyelenggara sertifikasi.</p>
              </div>
            </div>

            {/* List Table of Items */}
            <div className="overflow-hidden border border-slate-150 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 p-1">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider text-[10px] border-b border-slate-150 dark:border-slate-850">
                    <th className="p-3 w-12 text-center">No</th>
                    <th className="p-3 w-32">Waktu (Bulan/Tahun)</th>
                    <th className="p-3 w-48">Penyelenggara / Tempat</th>
                    <th className="p-3">Detail Setor/Hafalan</th>
                    <th className="p-3 w-28 text-center">Level</th>
                    <th className="p-3 w-16 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 dark:divide-slate-850">
                  {data.hafalan.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 dark:text-slate-550 italic font-mono">
                        Belum ada riwayat hafalan yang dimasukkan. Silakan isi form di bawah ini.
                      </td>
                    </tr>
                  ) : (
                    data.hafalan.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-white dark:hover:bg-slate-900/40 transition-colors">
                        <td className="p-3 text-center font-bold font-mono text-slate-400">{idx + 1}</td>
                        <td className="p-3 font-medium text-slate-605 dark:text-slate-350">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-blue-500 shrink-0" />
                            {item.bulan} {item.tahun}
                          </span>
                        </td>
                        <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">
                          <span className="flex items-center gap-1">
                            <Building className="h-3 w-3 text-slate-400" />
                            {item.penyelenggara || "-"}
                          </span>
                        </td>
                        <td className="p-3 text-slate-800 dark:text-slate-200">
                          <div className="space-y-0.5">
                            {item.juz && <div><span className="text-slate-400 font-mono text-[10px]">Juz:</span> {item.juz}</div>}
                            {item.surat && <div><span className="text-slate-400 font-mono text-[10px]">Surat:</span> {item.surat}</div>}
                            {item.haditsDoa && <div><span className="text-slate-400 font-mono text-[10px]">Hadits/Doa:</span> {item.haditsDoa}</div>}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          {item.level && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-blue-105 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold border border-blue-200/55">
                              {item.level}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem("hafalan", item.id)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-all cursor-pointer"
                            title="Hapus riwayat"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Input Form Fields for adding item */}
            <div className="p-5 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/20 space-y-4">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Plus className="h-4 w-4 text-blue-500" />
                Tambah Riwayat Setoran Baru
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Bulan</label>
                  <select 
                    value={draftHafalan.bulan} 
                    onChange={e => setDraftHafalan({ ...draftHafalan, bulan: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  >
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Tahun</label>
                  <select 
                    value={draftHafalan.tahun} 
                    onChange={e => setDraftHafalan({ ...draftHafalan, tahun: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  >
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Penyelenggara / Tempat Setor</label>
                  <input 
                    type="text" 
                    value={draftHafalan.penyelenggara} 
                    onChange={e => setDraftHafalan({ ...draftHafalan, penyelenggara: e.target.value })}
                    placeholder="Misal: Sekolah, Masjid Jami, Kemenag"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Juz Dihafal</label>
                  <input 
                    type="text" 
                    value={draftHafalan.juz} 
                    onChange={e => setDraftHafalan({ ...draftHafalan, juz: e.target.value })}
                    placeholder="Misal: Juz 30, Juz 1 & 2"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Surat Pilihan</label>
                  <input 
                    type="text" 
                    value={draftHafalan.surat} 
                    onChange={e => setDraftHafalan({ ...draftHafalan, surat: e.target.value })}
                    placeholder="Misal: Al-Mulk, Yasin"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Hadits / Doa</label>
                  <input 
                    type="text" 
                    value={draftHafalan.haditsDoa} 
                    onChange={e => setDraftHafalan({ ...draftHafalan, haditsDoa: e.target.value })}
                    placeholder="Misal: Hadits Adab Belajar"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1 md:col-span-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-1 block">Level Penguasaan</label>
                  <div className="flex gap-2">
                    {["Pemula", "Menengah", "Mahir"].map(lvl => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setDraftHafalan({ ...draftHafalan, level: lvl as any })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${draftHafalan.level === lvl ? "bg-blue-600 text-white border-blue-600" : "bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-450 border-slate-200 dark:border-slate-800"}`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => handleAddItem("hafalan", draftHafalan, setDraftHafalan, ["juz", "surat", "haditsDoa"])}
                  className="px-4 py-2.5 bg-blue-650 hover:bg-blue-700 text-white font-mono font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm shadow-blue-500/10"
                >
                  <Plus className="h-4 w-4" />
                  Tambahkan ke Riwayat
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRESTASI AKADEMIK */}
        {activeTab === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono">2. Rekam Jejak Prestasi Akademik</h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">Mencatat sertifikasi olimpiade, juara lomba sains kesiswaan, prestasi raport, paralel, dan kompetisi kognitif.</p>
              </div>
            </div>

            {/* List Table */}
            <div className="overflow-hidden border border-slate-150 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 p-1">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider text-[10px] border-b border-slate-150 dark:border-slate-850">
                    <th className="p-3 w-12 text-center">No</th>
                    <th className="p-3 w-32">Waktu (Bulan/Tahun)</th>
                    <th className="p-3 w-48">Lembaga Penyelenggara</th>
                    <th className="p-3">Detail Juara / Kejuaraan / Rapor</th>
                    <th className="p-3 w-28 text-center">Tingkatan</th>
                    <th className="p-3 w-16 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 dark:divide-slate-850">
                  {data.akademik.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 dark:text-slate-550 italic font-mono">
                        Belum ada riwayat prestasi akademik tambahan. Silakan tambahkan riwayat baru.
                      </td>
                    </tr>
                  ) : (
                    data.akademik.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-white dark:hover:bg-slate-900/40 transition-colors">
                        <td className="p-3 text-center font-bold font-mono text-slate-400">{idx + 1}</td>
                        <td className="p-3 font-medium text-slate-605 dark:text-slate-350">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-blue-500 shrink-0" />
                            {item.bulan} {item.tahun}
                          </span>
                        </td>
                        <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">
                          <span className="flex items-center gap-1">
                            <Building className="h-3 w-3 text-slate-400" />
                            {item.penyelenggara || "-"}
                          </span>
                        </td>
                        <td className="p-3 text-slate-800 dark:text-slate-200">
                          <div className="space-y-0.5">
                            {item.juaraLomba && <div><strong className="text-slate-700 dark:text-slate-300">Juara Lomba:</strong> {item.juaraLomba}</div>}
                            {item.peringkat && <div><strong>Peringkat:</strong> {item.peringkat}</div>}
                            {item.rataRapor && <div><strong>Rata-Rapor:</strong> {item.rataRapor}</div>}
                            {item.mapelUnggulan && <div><strong>Keunggulan Mapel:</strong> {item.mapelUnggulan}</div>}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          {item.level && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-350 font-bold border border-purple-200/50">
                              {item.level}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem("akademik", item.id)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-all cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Input Form */}
            <div className="p-5 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/20 space-y-4">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Plus className="h-4 w-4 text-purple-500" />
                Tambah Prestasi Akademik Baru
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Bulan</label>
                  <select 
                    value={draftAkademik.bulan} 
                    onChange={e => setDraftAkademik({ ...draftAkademik, bulan: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  >
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Tahun</label>
                  <select 
                    value={draftAkademik.tahun} 
                    onChange={e => setDraftAkademik({ ...draftAkademik, tahun: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  >
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Lembaga Penyelenggara</label>
                  <input 
                    type="text" 
                    value={draftAkademik.penyelenggara} 
                    onChange={e => setDraftAkademik({ ...draftAkademik, penyelenggara: e.target.value })}
                    placeholder="Misal: Puspresnas, Dinas Pendidikan, KSN"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Juara Lomba Akademik</label>
                  <input 
                    type="text" 
                    value={draftAkademik.juaraLomba} 
                    onChange={e => setDraftAkademik({ ...draftAkademik, juaraLomba: e.target.value })}
                    placeholder="Misal: Juara 2 Olimpiade Fisika"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Peringkat Kelas / Paralel</label>
                  <input 
                    type="text" 
                    value={draftAkademik.peringkat} 
                    onChange={e => setDraftAkademik({ ...draftAkademik, peringkat: e.target.value })}
                    placeholder="Misal: Ranking 1 Kelas"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Rata Rapor / Mapel Unggulan</label>
                  <input 
                    type="text" 
                    value={draftAkademik.mapelUnggulan} 
                    onChange={e => setDraftAkademik({ ...draftAkademik, mapelUnggulan: e.target.value })}
                    placeholder="Misal: Rata Rapor 90, Unggulan Matematika"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1 md:col-span-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-1 block">Tingkat Penyelenggaraan</label>
                  <div className="flex flex-wrap gap-1.5">
                    {["Sekolah", "Kecamatan", "Kabupaten", "Provinsi", "Nasional"].map(lvl => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setDraftAkademik({ ...draftAkademik, level: lvl as any })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${draftAkademik.level === lvl ? "bg-purple-600 text-white border-purple-600" : "bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-450 border-slate-200 dark:border-slate-800"}`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => handleAddItem("akademik", draftAkademik, setDraftAkademik, ["juaraLomba", "peringkat", "rataRapor", "mapelUnggulan"])}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-mono font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm shadow-purple-500/10"
                >
                  <Plus className="h-4 w-4" />
                  Tambahkan ke Riwayat
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: EKSTRAKURIKULER & ORGANISASI */}
        {activeTab === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-green-500" />
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono">3. Ekstrakurikuler & Keorganisasian</h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">Mencatat peranan kepemimpinan, kepengurusan OSIS, Pramuka, Rohis, Paskibra/PMR, dan turnamen olahraga.</p>
              </div>
            </div>

            {/* List Table */}
            <div className="overflow-hidden border border-slate-150 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 p-1">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-900 text-slate-550 dark:text-slate-400 font-mono uppercase tracking-wider text-[10px] border-b border-slate-150 dark:border-slate-850">
                    <th className="p-3 w-12 text-center">No</th>
                    <th className="p-3 w-32">Waktu (Bulan/Tahun)</th>
                    <th className="p-3 w-48">Nama Lembaga / Sekolah</th>
                    <th className="p-3">Peran Organisasi / Kegiatan Ekskul</th>
                    <th className="p-3 w-28 text-center">Jabatan</th>
                    <th className="p-3 w-16 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 dark:divide-slate-850">
                  {data.ekskul.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 dark:text-slate-550 italic font-mono">
                        Belum ada riwayat aktivitas ekskul/organisasi terdaftar. Silakan tambahkan di bawah.
                      </td>
                    </tr>
                  ) : (
                    data.ekskul.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-white dark:hover:bg-slate-900/40 transition-colors">
                        <td className="p-3 text-center font-bold font-mono text-slate-400">{idx + 1}</td>
                        <td className="p-3 font-medium text-slate-605 dark:text-slate-350">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-blue-500 shrink-0" />
                            {item.bulan} {item.tahun}
                          </span>
                        </td>
                        <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">
                          <span className="flex items-center gap-1">
                            <Building className="h-3 w-3 text-slate-400" />
                            {item.penyelenggara || jenjang === "SMP" ? "SMP BAZNAS" : "SMA BAZNAS"}
                          </span>
                        </td>
                        <td className="p-3 text-slate-800 dark:text-slate-200">
                          <div className="space-y-0.5">
                            {item.osis && <div><strong>OSIS/Kepengurusan:</strong> {item.osis}</div>}
                            {item.pramuka && <div><strong>Pramuka:</strong> {item.pramuka}</div>}
                            {item.rohis && <div><strong>Rohis:</strong> {item.rohis}</div>}
                            {item.paskibraPmr && <div><strong>Paskibra/PMR:</strong> {item.paskibraPmr}</div>}
                            {item.olahragaSeni && <div><strong>Olahraga & Seni:</strong> {item.olahragaSeni}</div>}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          {item.level && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-emerald-100 text-emerald-850 dark:bg-emerald-950 dark:text-emerald-300 font-bold border border-emerald-200/50">
                              {item.level}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem("ekskul", item.id)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-all cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Input Form */}
            <div className="p-5 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/20 space-y-4">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Plus className="h-4 w-4 text-emerald-500" />
                Tambah Aktivitas Kepemimpinan / Ekskul Baru
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Bulan</label>
                  <select 
                    value={draftEkskul.bulan} 
                    onChange={e => setDraftEkskul({ ...draftEkskul, bulan: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  >
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Tahun</label>
                  <select 
                    value={draftEkskul.tahun} 
                    onChange={e => setDraftEkskul({ ...draftEkskul, tahun: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  >
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Nama Lembaga (Sekolah/Organisasi)</label>
                  <input 
                    type="text" 
                    value={draftEkskul.penyelenggara} 
                    onChange={e => setDraftEkskul({ ...draftEkskul, penyelenggara: e.target.value })}
                    placeholder="Misal: Sekolah BAZNAS, Kwarcab Bogor"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Pengurus OSIS / MPK (Peran)</label>
                  <input 
                    type="text" 
                    value={draftEkskul.osis} 
                    onChange={e => setDraftEkskul({ ...draftEkskul, osis: e.target.value })}
                    placeholder="Misal: Ketua OSIS, Divisi Humas"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Pramuka / Rohis (Peran)</label>
                  <input 
                    type="text" 
                    value={draftEkskul.pramuka} 
                    onChange={e => setDraftEkskul({ ...draftEkskul, pramuka: e.target.value })}
                    placeholder="Misal: Pinru Pramuka, Anggota Rohis"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Ekskul Olahraga / Seni / Paskibra / PMR</label>
                  <input 
                    type="text" 
                    value={draftEkskul.olahragaSeni} 
                    onChange={e => setDraftEkskul({ ...draftEkskul, olahragaSeni: e.target.value })}
                    placeholder="Misal: Anggota PMR, Pemain Futsal"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1 md:col-span-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-1 block">Level Jabatan</label>
                  <div className="flex flex-wrap gap-1.5">
                    {["Anggota", "Pengurus inti", "Ketua", "Pelatih"].map(lvl => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setDraftEkskul({ ...draftEkskul, level: lvl as any })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${draftEkskul.level === lvl ? "bg-emerald-600 text-white border-emerald-600" : "bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-450 border-slate-200 dark:border-slate-800"}`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => handleAddItem("ekskul", draftEkskul, setDraftEkskul, ["osis", "pramuka", "rohis", "paskibraPmr", "olahragaSeni"])}
                  className="px-4 py-2.5 bg-emerald-650 hover:bg-emerald-700 text-white font-mono font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-500/10"
                >
                  <Plus className="h-4 w-4" />
                  Tambahkan ke Riwayat
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SEMINAR & WORKSHOP */}
        {activeTab === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <School className="h-5 w-5 text-amber-500" />
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono">4. Seminar, Pelatihan & Workshop Karir</h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">Mencatat sertifikasi webinar, workshop kepemimpinan, motivasi, kelas teknologi IT, public speaking, dan bahasa.</p>
              </div>
            </div>

            {/* List Table */}
            <div className="overflow-hidden border border-slate-150 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 p-1">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-105 dark:bg-slate-900 text-slate-550 dark:text-slate-400 font-mono uppercase tracking-wider text-[10px] border-b border-slate-150 dark:border-slate-850">
                    <th className="p-3 w-12 text-center">No</th>
                    <th className="p-3 w-32">Waktu (Bulan/Tahun)</th>
                    <th className="p-3 w-48">Lembaga Penyelenggara</th>
                    <th className="p-3">Detail Sertifikat / Kelas / Webinar</th>
                    <th className="p-3 w-28 text-center">Taraf</th>
                    <th className="p-3 w-16 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 dark:divide-slate-850">
                  {data.seminar.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 dark:text-slate-550 italic font-mono">
                        Belum ada data seminar, kelas, atau workshop tambahan. Silakan entri di bawah.
                      </td>
                    </tr>
                  ) : (
                    data.seminar.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-white dark:hover:bg-slate-900/40 transition-colors">
                        <td className="p-3 text-center font-bold font-mono text-slate-400">{idx + 1}</td>
                        <td className="p-3 font-medium text-slate-605 dark:text-slate-350">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-blue-500 shrink-0" />
                            {item.bulan} {item.tahun}
                          </span>
                        </td>
                        <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">
                          <span className="flex items-center gap-1">
                            <Building className="h-3 w-3 text-slate-400" />
                            {item.penyelenggara || "-"}
                          </span>
                        </td>
                        <td className="p-3 text-slate-800 dark:text-slate-200">
                          <div className="space-y-0.5">
                            {item.publicSpeaking && <div><strong>Public Speaking:</strong> {item.publicSpeaking}</div>}
                            {item.workshopSains && <div><strong>Workshop Sains/Internal:</strong> {item.workshopSains}</div>}
                            {item.seminarKarir && <div><strong>Motivasi & Karir:</strong> {item.seminarKarir}</div>}
                            {item.pelatihanIt && <div><strong>IT & Desain:</strong> {item.pelatihanIt}</div>}
                            {item.webinar && <div><strong>Webinar:</strong> {item.webinar}</div>}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          {item.level && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold border border-amber-200/50">
                              {item.level}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem("seminar", item.id)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-all cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Input Form */}
            <div className="p-5 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/20 space-y-4">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Plus className="h-4 w-4 text-amber-500" />
                Tambah Partisipasi Seminar / Pelatihan Baru
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Bulan</label>
                  <select 
                    value={draftSeminar.bulan} 
                    onChange={e => setDraftSeminar({ ...draftSeminar, bulan: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  >
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Tahun</label>
                  <select 
                    value={draftSeminar.tahun} 
                    onChange={e => setDraftSeminar({ ...draftSeminar, tahun: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  >
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Penyelenggara / Lembaga</label>
                  <input 
                    type="text" 
                    value={draftSeminar.penyelenggara} 
                    onChange={e => setDraftSeminar({ ...draftSeminar, penyelenggara: e.target.value })}
                    placeholder="Misal: Dompet Dhuafa, BAZNAS, Coursera"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Nama Seminar / Public Speaking</label>
                  <input 
                    type="text" 
                    value={draftSeminar.publicSpeaking} 
                    onChange={e => setDraftSeminar({ ...draftSeminar, publicSpeaking: e.target.value })}
                    placeholder="Misal: Public Speaking Camp"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Teman Motivasi / Karir / Sains</label>
                  <input 
                    type="text" 
                    value={draftSeminar.seminarKarir} 
                    onChange={e => setDraftSeminar({ ...draftSeminar, seminarKarir: e.target.value })}
                    placeholder="Misal: Seminar Menatap Dunia Kerja AI"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">IT Kelas / Jurnalistik / Webinar</label>
                  <input 
                    type="text" 
                    value={draftSeminar.pelatihanIt} 
                    onChange={e => setDraftSeminar({ ...draftSeminar, pelatihanIt: e.target.value })}
                    placeholder="Misal: Workshop Koding React Pemula"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1 md:col-span-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-1 block">Level Luaran / Penghargaan</label>
                  <div className="flex flex-wrap gap-1.5">
                    {["Peserta", "Peserta aktif", "Lulus ujian", "Lulus terbaik"].map(lvl => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setDraftSeminar({ ...draftSeminar, level: lvl as any })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${draftSeminar.level === lvl ? "bg-amber-600 text-white border-amber-600" : "bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-455 border-slate-200 dark:border-slate-800"}`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => handleAddItem("seminar", draftSeminar, setDraftSeminar, ["publicSpeaking", "workshopSains", "seminarKarir", "pelatihanIt", "webinar"])}
                  className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-mono font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm shadow-blue-500/10"
                >
                  <Plus className="h-4 w-4" />
                  Tambahkan ke Riwayat
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: KARYA KREATIF NYATA */}
        {activeTab === 5 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-teal-500" />
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono">5. Portofolio Karya Nyata / Produk Kreatif</h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">Mencatat karya tulis, desain infografis, poster, mind map orisinal, video edukatif, klip, kriya, atau lukisan.</p>
              </div>
            </div>

            {/* List Table */}
            <div className="overflow-hidden border border-slate-150 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 p-1">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-900 text-slate-550 dark:text-slate-400 font-mono uppercase tracking-wider text-[10px] border-b border-slate-150 dark:border-slate-850">
                    <th className="p-3 w-12 text-center">No</th>
                    <th className="p-3 w-32">Waktu (Bulan/Tahun)</th>
                    <th className="p-3 w-48">Diterbitkan / Dipamerkan</th>
                    <th className="p-3">Daftar Karya Nyata / Judul Karya</th>
                    <th className="p-3 w-28 text-center">Publikasi</th>
                    <th className="p-3 w-16 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 dark:divide-slate-850">
                  {data.karya.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 dark:text-slate-550 italic font-mono">
                        Belum ada karya orisinal terdaftar dalam lembar asimilasi portofolio.
                      </td>
                    </tr>
                  ) : (
                    data.karya.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-white dark:hover:bg-slate-900/40 transition-colors">
                        <td className="p-3 text-center font-bold font-mono text-slate-400">{idx + 1}</td>
                        <td className="p-3 font-medium text-slate-605 dark:text-slate-350">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-blue-500 shrink-0" />
                            {item.bulan} {item.tahun}
                          </span>
                        </td>
                        <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">
                          <span className="flex items-center gap-1">
                            <Building className="h-3 w-3 text-slate-400" />
                            {item.penyelenggara || "-"}
                          </span>
                        </td>
                        <td className="p-3 text-slate-800 dark:text-slate-200">
                          <div className="space-y-0.5">
                            {item.tulisan && <div><strong>Karya Sastra/Esai:</strong> {item.tulisan}</div>}
                            {item.desain && <div><strong>Karya Desain/Poster:</strong> {item.desain}</div>}
                            {item.video && <div><strong>Video/Klip:</strong> {item.video}</div>}
                            {item.mindmap && <div><strong>Mindmap R&D:</strong> {item.mindmap}</div>}
                            {item.karyaSeni && <div><strong>Lukisan/Seni/Prakarya:</strong> {item.karyaSeni}</div>}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          {item.level && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 font-bold border border-teal-200/50">
                              {item.level}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem("karya", item.id)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-all cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Input Form */}
            <div className="p-5 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/20 space-y-4">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Plus className="h-4 w-4 text-teal-500" />
                Tambah Karya Kreatif / Produk Nyata Baru
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Bulan</label>
                  <select 
                    value={draftKarya.bulan} 
                    onChange={e => setDraftKarya({ ...draftKarya, bulan: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  >
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Tahun</label>
                  <select 
                    value={draftKarya.tahun} 
                    onChange={e => setDraftKarya({ ...draftKarya, tahun: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  >
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Media Publikasi (Mading/Maju/Web/Instagram)</label>
                  <input 
                    type="text" 
                    value={draftKarya.penyelenggara} 
                    onChange={e => setDraftKarya({ ...draftKarya, penyelenggara: e.target.value })}
                    placeholder="Misal: Majalah Sekolah, Youtube OSIS, Mandiri"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Karya Tulisan (Esai/Puisi)</label>
                  <input 
                    type="text" 
                    value={draftKarya.tulisan} 
                    onChange={e => setDraftKarya({ ...draftKarya, tulisan: e.target.value })}
                    placeholder="Misal: Antologi Puisi Merdeka"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Karya Seni / Desain Poster</label>
                  <input 
                    type="text" 
                    value={draftKarya.desain} 
                    onChange={e => setDraftKarya({ ...draftKarya, desain: e.target.value })}
                    placeholder="Misal: Desain Poster Kemerdekaan"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Karya Video / Mindmap</label>
                  <input 
                    type="text" 
                    value={draftKarya.video} 
                    onChange={e => setDraftKarya({ ...draftKarya, video: e.target.value })}
                    placeholder="Misal: Catatan Biologi Mindmap Visual, Video Vlog"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1 md:col-span-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-1 block">Tingkat Publikasi</label>
                  <div className="flex flex-wrap gap-1.5">
                    {["Pribadi", "Internal sekolah", "Publikasi eksternal", "Juara lomba"].map(lvl => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setDraftKarya({ ...draftKarya, level: lvl as any })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${draftKarya.level === lvl ? "bg-teal-600 text-white border-teal-600" : "bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-455 border-slate-200 dark:border-slate-800"}`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => handleAddItem("karya", draftKarya, setDraftKarya, ["tulisan", "desain", "video", "mindmap", "karyaSeni"])}
                  className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-mono font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm shadow-blue-500/10"
                >
                  <Plus className="h-4 w-4" />
                  Tambahkan ke Riwayat
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: BAHASA ASING (CEFR) */}
        {activeTab === 6 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <Languages className="h-5 w-5 text-rose-500" />
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono">6. Kemampuan Bahasa Asing & CEFR</h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">Mencatat kelulusan sertifikasi verbal (TOEFL, IELTS, TOAFL), asimilasi lisan, skor, serta target kelas beasiswa.</p>
              </div>
            </div>

            {/* List Table */}
            <div className="overflow-hidden border border-slate-150 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 p-1">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-900 text-slate-550 dark:text-slate-400 font-mono uppercase tracking-wider text-[10px] border-b border-slate-150 dark:border-slate-850">
                    <th className="p-3 w-12 text-center">No</th>
                    <th className="p-3 w-32">Waktu (Bulan/Tahun)</th>
                    <th className="p-3 w-48">Lembaga Uji / Sertifikasi</th>
                    <th className="p-3">Kemampuan & Nilai Bahasa Asing</th>
                    <th className="p-3 w-28 text-center">Kualifikasi</th>
                    <th className="p-3 w-16 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 dark:divide-slate-850">
                  {data.bahasa.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 dark:text-slate-550 italic font-mono">
                        Belum ada riwayat sertifikasi bahasa terdaftar. Silakan daftarkan di bawah ini.
                      </td>
                    </tr>
                  ) : (
                    data.bahasa.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-white dark:hover:bg-slate-900/40 transition-colors">
                        <td className="p-3 text-center font-bold font-mono text-slate-400">{idx + 1}</td>
                        <td className="p-3 font-medium text-slate-605 dark:text-slate-350">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-blue-500 shrink-0" />
                            {item.bulan} {item.tahun}
                          </span>
                        </td>
                        <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">
                          <span className="flex items-center gap-1">
                            <Building className="h-3 w-3 text-slate-400" />
                            {item.penyelenggara || "-"}
                          </span>
                        </td>
                        <td className="p-3 text-slate-800 dark:text-slate-205">
                          <div className="space-y-0.5">
                            {item.inggris && <div><strong>Bahasa Inggris:</strong> {item.inggris}</div>}
                            {item.arab && <div><strong>Bahasa Arab:</strong> {item.arab}</div>}
                            {item.lainnya && <div><strong>Bahasa Lain/Skor:</strong> {item.lainnya}</div>}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          {item.level && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold border border-rose-200/50">
                              {item.level}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem("bahasa", item.id)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-all cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Input Form */}
            <div className="p-5 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/20 space-y-4">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Plus className="h-4 w-4 text-rose-500" />
                Tambah Kualifikasi Bahasa Asing Baru
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Bulan</label>
                  <select 
                    value={draftBahasa.bulan} 
                    onChange={e => setDraftBahasa({ ...draftBahasa, bulan: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  >
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Tahun</label>
                  <select 
                    value={draftBahasa.tahun} 
                    onChange={e => setDraftBahasa({ ...draftBahasa, tahun: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  >
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Lembaga Sertifikasi / Uji</label>
                  <input 
                    type="text" 
                    value={draftBahasa.penyelenggara} 
                    onChange={e => setDraftBahasa({ ...draftBahasa, penyelenggara: e.target.value })}
                    placeholder="Misal: LIA, EF, LIPIA, British Council"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Bahasa Inggris (Skor TOEFL/IELTS/Tingkatan)</label>
                  <input 
                    type="text" 
                    value={draftBahasa.inggris} 
                    onChange={e => setDraftBahasa({ ...draftBahasa, inggris: e.target.value })}
                    placeholder="Misal: TOEFL 510, IELTS 6.0"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Bahasa Arab (Skor/Tingkatan)</label>
                  <input 
                    type="text" 
                    value={draftBahasa.arab} 
                    onChange={e => setDraftBahasa({ ...draftBahasa, arab: e.target.value })}
                    placeholder="Misal: Mumtaz (Lancar), TOEFL Arab"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Bahasa Asing Lainnya (Jepang/Mandarin/Jerman)</label>
                  <input 
                    type="text" 
                    value={draftBahasa.lainnya} 
                    onChange={e => setDraftBahasa({ ...draftBahasa, lainnya: e.target.value })}
                    placeholder="Misal: Nihongo N4"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1 md:col-span-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-1 block">Tingkatan CEFR</label>
                  <div className="flex gap-1.5">
                    {["A1", "A2", "B1", "B2+"].map(lvl => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setDraftBahasa({ ...draftBahasa, level: lvl as any })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${draftBahasa.level === lvl ? "bg-rose-600 text-white border-rose-600" : "bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-455 border-slate-200 dark:border-slate-800"}`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => handleAddItem("bahasa", draftBahasa, setDraftBahasa, ["inggris", "arab", "lainnya"])}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-mono font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm shadow-blue-500/10"
                >
                  <Plus className="h-4 w-4" />
                  Tambahkan ke Riwayat
                </button>
              </div>
            </div>

            {/* Standar CEFR Glossary information panel */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-150 dark:border-slate-850 rounded-xl space-y-2">
              <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider font-mono">Pedoman Tingkat Kemampuan CEFR:</span>
              <ul className="text-xs text-slate-500 dark:text-slate-450 space-y-1 list-disc pl-4 font-sans leading-5">
                <li><strong className="text-slate-700 dark:text-slate-300">A1 = Pemula:</strong> Memahami & menggunakan ungkapan perkenalan dasar secara perlahan.</li>
                <li><strong className="text-slate-705 dark:text-slate-300">A2 = Dasar:</strong> Mampu berkomunikasi rutin mengenai kebutuhan sehari-hari berasrama.</li>
                <li><strong className="text-slate-705 dark:text-slate-300">B1 = Menengah:</strong> Sanggup berdiskusi secara spontan, memahami pokok pembicaraan umum/sekolah.</li>
                <li><strong className="text-slate-705 dark:text-slate-300">B2+ = Mahir:</strong> Lancar membaca teks rumit, lancar bercakap dengan penutur asli tanpa kesulitan.</li>
              </ul>
            </div>
          </div>
        )}

      </div>

      {/* Pratinjau Foto Profil Siswa di Akhir Portofolio */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-widest font-mono flex items-center gap-2">
          <User className="h-4.5 w-4.5 text-blue-500" />
          Pratinjau Pasfoto Identitas Siswa
        </h4>
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div className="w-24 h-32 md:w-28 md:h-36 shrink-0 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950 p-1 flex items-center justify-center">
            {profile?.foto ? (
              <img src={profile.foto} alt="Pasfoto" className="w-full h-full object-cover rounded-lg" />
            ) : (
              <div className="text-center text-slate-300 dark:text-slate-700 p-2">
                <span className="text-2xl block">📷</span>
                <span className="text-[9px] font-bold font-mono">BELUM DIUNGGAH</span>
              </div>
            )}
          </div>
          <div className="space-y-1.5 text-center sm:text-left flex-1 min-w-0">
            <h5 className="font-extrabold text-slate-900 dark:text-white text-base truncate">
              {profile?.nama || "— Nama Belum Diisi —"}
            </h5>
            <p className="text-xs text-slate-505 dark:text-slate-400 font-medium">
              NISN: <span className="font-bold underline">{profile?.nisn || "—"}</span> • Kelas: <span className="font-bold">{profile?.kelas || "—"}</span>
            </p>
            <p className="text-[11px] text-slate-450 dark:text-slate-500 leading-relaxed font-sans max-w-lg">
              {profile?.foto 
                ? "Pasfoto Anda telah tersemat dan akan otomatis dicetak pada berkas Laporan Akhir Capaian Asesmen (PDF / Print)." 
                : "Foto profil belum terdeteksi. Silakan kembali ke tab pertama (Biodata Awal) jika Anda ingin mengunggah pasfoto resmi Anda untuk kelengkapan transkip berkas."
              }
            </p>
          </div>
        </div>
      </div>

      {/* Action Stepper Panel Footer Navigation */}
      <div className="flex justify-between items-center bg-slate-100/50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 no-print">
        <button
          onClick={onPrev}
          className="px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
          KEMBALI KE ASESMEN
        </button>

        <button
          onClick={onNext}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/10 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <span>LIHAT EVALUASI LAPORAN AKHIR</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
