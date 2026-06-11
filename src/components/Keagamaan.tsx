/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { KeagamaanState, HafalanQuranType, HafalanHaditsType } from "../types";
import { BookOpen, Award, GraduationCap, CheckSquare, Sparkles } from "lucide-react";

interface KeagamaanProps {
  state: KeagamaanState;
  onChange: (state: KeagamaanState) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function Keagamaan({ state, onChange, onNext, onPrev }: KeagamaanProps) {
  const handleHafalanChange = (value: HafalanQuranType) => {
    onChange({ ...state, hafalan: value });
  };

  const handleHafalanHaditsChange = (value: HafalanHaditsType) => {
    onChange({ ...state, hafalanHadits: value });
  };

  const handleNilaiChange = (subject: keyof KeagamaanState["nilai"], value: number) => {
    const val = Math.min(100, Math.max(0, value));
    onChange({
      ...state,
      nilai: { ...state.nilai, [subject]: val }
    });
  };

  const handlePrefCheck = (listName: "prestasi" | "organisasi", item: string) => {
    const list = [...state[listName]];
    const index = list.indexOf(item);
    if (index > -1) {
      list.splice(index, 1);
    } else {
      list.push(item);
    }
    onChange({ ...state, [listName]: list });
  };

  // Mathematical formulation of scores
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

  const getHafalanHaditsPoints = (h: HafalanHaditsType): number => {
    switch (h || "0-20 hadits") {
      case "0-20 hadits": return 20;
      case "21-50 hadits": return 50;
      case "51-80 hadits": return 75;
      case "81-100 hadits": return 95;
      case "100 hadits Lengkap": return 100;
      default: return 20;
    }
  };

  const getCalculation = () => {
    const quranPt = getHafalanPoints(state.hafalan);
    const haditsPt = getHafalanHaditsPoints(state.hafalanHadits);
    const hafalanAvg = (quranPt + haditsPt) / 2;
    const hafalanPt = hafalanAvg * 0.35; // 35% weight
    
    const grades = Object.values(state.nilai);
    const avgGrades = grades.reduce((acc, curr) => acc + curr, 0) / (grades.length || 1);
    const gradesPt = avgGrades * 0.40; // 40% weight
    
    // 7 listed achievements, 15 points each, capped at 100
    const prestList = state.prestasi.length;
    const prestPt = Math.min(100, prestList * 20) * 0.15; // 15% weight

    // 4 listed organizations, 35 points each, capped at 100
    const orgList = state.organisasi.length;
    const orgPt = Math.min(100, orgList * 35) * 0.10; // 10% weight

    const totalScore = Math.round(hafalanPt + gradesPt + prestPt + orgPt);
    
    let kategori = "Perlu Pembinaan";
    let warnaKategori = "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/40";
    
    if (totalScore >= 80) {
      kategori = "Sangat Potensial";
      warnaKategori = "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40";
    } else if (totalScore >= 60) {
      kategori = "Potensial";
      warnaKategori = "bg-teal-50 text-teal-700 border-teal-100 dark:bg-teal-950/20 dark:text-teal-400 dark:border-teal-900/40";
    } else if (totalScore >= 40) {
      kategori = "Cukup Potensial";
      warnaKategori = "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/40";
    }

    // Recommendation logic basis
    const rekomendasiArr = [
      "Ilmu Al-Quran dan Tafsir (IAT)",
      "Hukum Keluarga Islam / Syariah",
      "Pendidikan Agama Islam (PAI)"
    ];

    if (state.hafalan === "11-20 juz" || state.hafalan === "> 20 juz" || (state.hafalanHadits === "100 hadits Lengkap" && totalScore >= 75)) {
      rekomendasiArr.unshift("Beasiswa Utama Hafiz Al-Quran & 100 Hadits SCB");
      rekomendasiArr.push("Ekonomi Syariah & Filantropi BAZNAS");
    }
    if (avgGrades >= 80 || totalScore >= 60) {
      rekomendasiArr.push("Rekomendasi SPAN-PTKIN Jalur Prestasi");
    }
    if (totalScore < 50) {
      rekomendasiArr.push("Bimbingan Intensif Peningkatan Kapasitas Syar'i");
    }
    rekomendasiArr.push("Komunikasi Penyiaran Islam / Dakwah");

    return { totalScore, kategori, warnaKategori, rekomendasiArr };
  };

  const { totalScore, kategori, warnaKategori, rekomendasiArr } = getCalculation();

  const PRESTASI_OPTIONS = [
    { value: "mtq", label: "Musabaqah Tilawatil Quran (MTQ) / Hifzil Quran (MHQ)" },
    { value: "mhq", label: "Duta Adab & Karakter Unggul Boarding School (SCB)" },
    { value: "pidato", label: "Kreativitas Da'i Muda / Pidato Syiar Dakwah Islam" },
    { value: "lcc", label: "Musabaqah Fahmil Quran / Cerdas Cermat Islami" },
    { value: "ktia", label: "Karya Tulis Ilmiah Al-Quran (KTI-Q)" },
    { value: "dakwah", label: "Sertifikasi Relawan Kemanusiaan / Amil BAZNAS" },
    { value: "kaligrafi", label: "Penghargaan Prestasi Kaligrafi / Seni Islami" }
  ];

  const ORGANISASI_OPTIONS = [
    { value: "rohis", label: "Majelis Asrama & Rohani Islam (Rohis)" },
    { value: "osisKeagamaan", label: "Dewan Kemakmuran Masjid (DKM) Baitul Ilmi" },
    { value: "dkm", label: "OSIS Departemen Keagamaan & Kedisiplinan Ibadah" },
    { value: "lainnya", label: "Gerakan Kepramukaan & Konselor Sebaya SCB" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-100 dark:border-gray-850 pb-5">
        <h2 className="text-2xl font-bold font-sans text-gray-900 dark:text-white flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
          Tahfidz Al-Quran & 100 Hadits (Sekolah Cendekia BAZNAS)
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Perekaman jumlah hafalan Al-Quran dan 100 Hadits, rekapitulasi nilai mata pelajaran keagamaan terintegrasi, serta portofolio kepemimpinan Islam asrama.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Forms (Col-span 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Hafalan dan Pelajaran */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-850 space-y-6">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b border-gray-50 dark:border-gray-800 pb-3">
              <Sparkles className="h-4 w-4 text-green-600" />
              1. Kompetensi Setoran Hafalan Qur'an & Hadits
            </h3>
            
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Al Quran */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-green-700 dark:text-green-400 mb-2 font-mono">
                  Hafalan Al-Quran
                </label>
                <div className="space-y-1.5">
                  {(["0-1 juz", "2-5 juz", "6-10 juz", "11-20 juz", "> 20 juz"] as HafalanQuranType[]).map((level) => (
                    <label
                      key={level}
                      className={`flex items-center px-3 py-2 rounded-xl border text-xs cursor-pointer transition-all ${
                        state.hafalan === level
                          ? "bg-green-50/70 border-green-300 text-green-800 dark:bg-green-950/20 dark:border-green-850 dark:text-green-300 font-semibold"
                          : "border-gray-150 bg-gray-50/30 text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-850"
                      }`}
                    >
                      <input
                        type="radio"
                        name="hafalan"
                        checked={state.hafalan === level}
                        onChange={() => handleHafalanChange(level)}
                        className="mr-2 text-green-600 focus:ring-green-500"
                      />
                      <span>{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Hadits */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-green-700 dark:text-green-400 mb-2 font-mono">
                  Hafalan 100 Hadits
                </label>
                <div className="space-y-1.5">
                  {(["0-20 hadits", "21-50 hadits", "51-80 hadits", "81-100 hadits", "100 hadits Lengkap"] as HafalanHaditsType[]).map((level) => {
                    const currentVal = state.hafalanHadits || "0-20 hadits";
                    return (
                      <label
                        key={level}
                        className={`flex items-center px-3 py-2 rounded-xl border text-xs cursor-pointer transition-all ${
                          currentVal === level
                            ? "bg-emerald-50/70 border-emerald-300 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-850 dark:text-emerald-300 font-semibold"
                            : "border-gray-150 bg-gray-50/30 text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-850"
                        }`}
                      >
                        <input
                          type="radio"
                          name="hafalanHadits"
                          checked={currentVal === level}
                          onChange={() => handleHafalanHaditsChange(level)}
                          className="mr-2 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>{level}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Rapor Mulok */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-green-700 dark:text-green-400 mb-1 font-mono">
                  Nilai Rapor PAI & Bahasa Arab (Skala 0-100)
                </label>
                <div className="space-y-1.5">
                  {[
                    { key: "pai", label: "Pendidikan Agama Islam (PAI)" },
                    { key: "bahasaArab", label: "Bahasa Arab" }
                  ].map((sub) => (
                    <div key={sub.key} className="flex justify-between items-center bg-gray-50/50 dark:bg-gray-950 px-2.5 py-1.5 rounded-lg border border-gray-150 dark:border-gray-800">
                      <span className="text-xs font-medium text-gray-750 dark:text-gray-300">{sub.label}</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={state.nilai[sub.key as keyof KeagamaanState["nilai"]] || ""}
                        onChange={(e) => handleNilaiChange(sub.key as keyof KeagamaanState["nilai"], parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="w-16 px-1.5 py-0.5 text-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md text-gray-900 dark:text-white text-xs font-bold"
                      />
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* Prestasi dan Organisasi Keagamaan */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-850 space-y-6">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b border-gray-50 dark:border-gray-800 pb-3">
              <Award className="h-4 w-4 text-green-600" />
              2. Rekam Jejak Prestasi & Organisasi Keagamaan
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Prestasi */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2.5 font-mono">
                  Sertifikat Prestasi Keagamaan (Cek yang Sesuai)
                </label>
                <div className="space-y-1.5">
                  {PRESTASI_OPTIONS.map((opt) => {
                    const checked = state.prestasi.includes(opt.value);
                    return (
                      <label
                        key={opt.value}
                        className={`flex items-start p-2 rounded-lg cursor-pointer text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-850 ${
                          checked ? "text-green-700 dark:text-green-400 font-medium" : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handlePrefCheck("prestasi", opt.value)}
                          className="mt-0.5 mr-3 rounded text-green-600 focus:ring-green-500"
                        />
                        <span>{opt.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Organisasi */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2.5 font-mono">
                  Pengalaman Organisasi Keagamaan
                </label>
                <div className="space-y-1.5">
                  {ORGANISASI_OPTIONS.map((opt) => {
                    const checked = state.organisasi.includes(opt.value);
                    return (
                      <label
                        key={opt.value}
                        className={`flex items-start p-2 rounded-lg cursor-pointer text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-850 ${
                          checked ? "text-green-700 dark:text-green-400 font-medium" : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handlePrefCheck("organisasi", opt.value)}
                          className="mt-0.5 mr-3 rounded text-green-600 focus:ring-green-500"
                        />
                        <span>{opt.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Right Output Panel (Col-span 1) */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-emerald-950/20 dark:to-teal-950/10 rounded-2xl p-6 border border-green-100 dark:border-green-900/20 h-full flex flex-col justify-between">
            <div className="space-y-6">
              <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-xs font-mono border-b border-green-200/50 dark:border-green-900/30 pb-2">
                ANALISIS KARAKTER & RELIGIUSITAS
              </h3>
              
              {/* Score Display */}
              <div className="text-center py-6">
                <div className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-widest leading-6">Skor Karakter & Sikap Religi</div>
                <div className="text-6xl font-extrabold font-sans text-green-700 dark:text-green-400 mt-2 mb-3">
                  {totalScore}%
                </div>
                <div className={`inline-block px-4 py-1.5 rounded-full border text-xs font-bold ${warnaKategori}`}>
                  {kategori}
                </div>
              </div>

              {/* Recommendations list */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-green-800 dark:text-green-300 uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4" /> Kategori Jurusan Terkait:
                </div>
                <ul className="space-y-2">
                  {rekomendasiArr.map((rec, i) => (
                    <li key={i} className="flex gap-2 items-start text-xs text-gray-700 dark:text-gray-300">
                      <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-1.5 shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Hint Box */}
            <div className="mt-8 bg-white/70 dark:bg-gray-900/50 rounded-xl p-4 border border-green-200/30 dark:border-green-900/20 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Sekolah Cendekia BAZNAS (SCB) mengedepankan pembentukan budi pekerti luhur, ketakwaan, kepemimpinan Islam asrama, serta hafalan Al-Quran dan 100 Hadits. Kompetensi hafalan dan rekam jejak amil sosial yang kukuh melicinkan jalan menuju beasiswa unggulan serta seleksi perguruan tinggi negeri terbaik.
            </div>

          </div>
        </div>

      </div>

      {/* Nav Buttons */}
      <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-850 pt-5">
        <button
          onClick={onPrev}
          className="px-5 py-2.5 border border-gray-200 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-850 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 transition-colors inline-flex items-center gap-2 text-sm font-medium cursor-pointer"
        >
          Kembali
        </button>
        <button
          onClick={onNext}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-colors inline-flex items-center gap-2 text-sm font-medium cursor-pointer"
        >
          Lanjutkan Asesmen
        </button>
      </div>

    </div>
  );
}
