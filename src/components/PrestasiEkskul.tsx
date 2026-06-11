/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { PrestasiEkskulState } from "../types";
import { Award, Compass, Trophy, Plus, Minus, ThumbsUp } from "lucide-react";

interface PrestasiEkskulProps {
  state: PrestasiEkskulState;
  onChange: (state: PrestasiEkskulState) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function PrestasiEkskul({ state, onChange, onNext, onPrev }: PrestasiEkskulProps) {
  
  const handleEkskulCheck = (item: string) => {
    const list = [...state.ekskul];
    const index = list.indexOf(item);
    if (index > -1) {
      list.splice(index, 1);
    } else {
      list.push(item);
    }
    onChange({ ...state, ekskul: list });
  };

  const handleLevelChange = (level: keyof PrestasiEkskulState["tingkatPrestasi"], action: "inc" | "dec") => {
    const current = state.tingkatPrestasi[level];
    let next = action === "inc" ? current + 1 : current - 1;
    next = Math.max(0, next);
    onChange({
      ...state,
      tingkatPrestasi: { ...state.tingkatPrestasi, [level]: next }
    });
  };

  const getCalculation = () => {
    // Breadth score from active extracurricular actions
    const ekskulCount = state.ekskul.length;
    const baseEkskulScore = Math.min(100, ekskulCount * 25); // 4 ekskul = 100 on breadth

    // Achievements calculation
    const lvl = state.tingkatPrestasi;
    const schoolWeight = lvl.sekolah * 10;
    const kabWeight = lvl.kabupaten * 30;
    const provWeight = lvl.provinsi * 60;
    const nasWeight = lvl.nasional * 85;
    const interWeight = lvl.internasional * 100;

    const highestAchievementScore = Math.min(100, schoolWeight + kabWeight + provWeight + nasWeight + interWeight);

    // Final consolidated 40% Breadth, 60% Heavy Weights on Awards
    const totalScore = Math.round(baseEkskulScore * 0.35 + highestAchievementScore * 0.65);

    // Recommendations Builder
    const rekomendasiPaths: string[] = [];
    const isSportsEkskulActive = state.ekskul.some(e => ["futsal", "basket", "silat", "petanque"].includes(e));
    const isScienceTechActive = state.ekskul.some(e => ["robotik", "kir"].includes(e));
    const isArtsActive = state.ekskul.some(e => ["musik", "seni"].includes(e));

    if (totalScore >= 60 || lvl.kabupaten > 0 || lvl.provinsi > 0 || lvl.nasional > 0 || lvl.internasional > 0) {
      rekomendasiPaths.push("Jalur Penelusuran Minat & Bakat (JPMB) Prestasi");
    }
    if (isSportsEkskulActive && (lvl.kabupaten > 0 || lvl.provinsi > 0 || lvl.nasional > 0)) {
      rekomendasiPaths.push("Beasiswa Jalur Atlet Universitas (KONI / Jalur Khusus)");
    }
    if (isScienceTechActive) {
      rekomendasiPaths.push("Jalur Prestasi Riset / Karya Ilmiah Remaja (KIR)");
    }
    if (isArtsActive) {
      rekomendasiPaths.push("Beasiswa Bakat Seni & Desain Kreatif");
    }
    if (state.ekskul.includes("pramuka") || state.ekskul.includes("paskibra")) {
      rekomendasiPaths.push("Jalur Kepemimpinan Organisasi / Pramuka Ter Garuda");
    }

    rekomendasiPaths.push("Seleksi Mandiri Portofolio Prestasi Non-Akademik");

    return { totalScore, rekomendasiPaths };
  };

  const { totalScore, rekomendasiPaths } = getCalculation();

  const EKSKUL_OPTIONS = [
    { value: "pramuka", label: "Pramuka Inti / Ambalan" },
    { value: "petanque", label: "Petanque (Sukan Olahraga Cendekia)" },
    { value: "pmr", label: "Palang Merah Remaja (PMR)" },
    { value: "paskibra", label: "Paskibraka Sekolah" },
    { value: "basket", label: "Klub Olahraga Basket" },
    { value: "futsal", label: "Klub Olahraga Futsal" },
    { value: "silat", label: "Bela diri Merpati Putih / Silat" },
    { value: "robotik", label: "Klub Robotika & Pemrograman" },
    { value: "kir", label: "Karya Ilmiah Remaja (KIR)" },
    { value: "musik", label: "Klub Musik & Paduan Suara" },
    { value: "seni", label: "Kreatif Seni Rupa / Kriya Visual" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-100 dark:border-gray-850 pb-5">
        <h2 className="text-2xl font-bold font-sans text-gray-900 dark:text-white flex items-center gap-2">
          <Trophy className="h-6 w-6 text-amber-500" />
          Pemetaan Prestasi, Bakat & Ekstrakurikuler
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Menilai keaktifan organisasi kesiswaan di Sekolah Cendekia BAZNAS, partisipasi olahraga, seni, riset sains, serta piagam juara.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Forms panel */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Ekstrakurikuler checkboxes */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-850 space-y-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b border-gray-50 dark:border-gray-800 pb-3">
              <Compass className="h-4 w-4 text-amber-500" />
              1. Partisipasi Ekstrakurikuler & Minat Kesiswaan
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {EKSKUL_OPTIONS.map((opt) => {
                const checked = state.ekskul.includes(opt.value);
                return (
                  <label
                    key={opt.value}
                    className={`flex items-start p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      checked
                        ? "bg-amber-50/40 border-amber-300 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-300 font-semibold"
                        : "border-gray-150 bg-gray-50/20 text-gray-600 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400 hover:bg-gray-100/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleEkskulCheck(opt.value)}
                      className="mt-0.5 mr-2.5 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>{opt.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Tingkat Prestasi Juara */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-850 space-y-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b border-gray-50 dark:border-gray-800 pb-3">
              <Trophy className="h-4 w-4 text-yellow-500" />
              2. Kuantitas Juara / Piagam Penghargaan Non-Akademis
            </h3>

            <div className="space-y-3 max-w-xl">
              {[
                { key: "sekolah", label: "Tingkat Internal Sekolah" },
                { key: "kabupaten", label: "Tingkat Kabupaten / Kota Bogor" },
                { key: "provinsi", label: "Tingkat Provinsi Jawa Barat" },
                { key: "nasional", label: "Tingkat Nasional (Kemenpora/Federasi)" },
                { key: "internasional", label: "Tingkat Internasional (Global Awards)" }
              ].map((lvl) => (
                <div key={lvl.key} className="flex justify-between items-center bg-gray-50/50 dark:bg-gray-950 p-3 rounded-xl border border-gray-150 dark:border-gray-800">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{lvl.label}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLevelChange(lvl.key as keyof PrestasiEkskulState["tingkatPrestasi"], "dec")}
                      className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-850"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-gray-800 dark:text-white">
                      {state.tingkatPrestasi[lvl.key as keyof PrestasiEkskulState["tingkatPrestasi"]]}
                    </span>
                    <button
                      onClick={() => handleLevelChange(lvl.key as keyof PrestasiEkskulState["tingkatPrestasi"], "inc")}
                      className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-850"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Output panel */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/10 dark:to-orange-950/10 rounded-2xl p-6 border border-amber-100 dark:border-amber-900/20 flex flex-col justify-between h-full">
            
            <div className="space-y-6">
              <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-xs font-mono border-b border-amber-200/50 dark:border-amber-900/30 pb-2">
                ANALISIS REKAM NYATA BAKAT
              </h3>

              {/* Score display */}
              <div className="text-center py-4">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest font-mono">Skor Bakat & Prestasi</div>
                <div className="text-6xl font-extrabold text-amber-700 dark:text-amber-500 mt-2 mb-1">{totalScore}</div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 italic">35% Breadth Ekskul + 65% Bobot Juara</p>
              </div>

              {/* Recommendations list */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ThumbsUp className="h-4 w-4" /> Peluang Jalur Khusus:
                </div>
                <ul className="space-y-2">
                  {rekomendasiPaths.map((path, index) => (
                    <li key={index} className="flex gap-2 items-start text-xs text-gray-700 dark:text-gray-300">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 shrink-0" />
                      <span>{path}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Warn guidelines context */}
            <div className="mt-8 bg-white/70 dark:bg-gray-900/50 rounded-xl p-4 border border-amber-200/30 dark:border-amber-900/20 text-xs text-gray-500 dark:text-gray-400">
              Sekolah Cendekia BAZNAS membekali program pembinaan kesiswaan dan olahraga berprestasi. Mengamankan medali di kancah Kabupaten/Provinsi berhak memberikan poin tambahan yang amat besar di sertifikasi portofolio kelulusan.
            </div>

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
          Lanjutkan Asesmen
        </button>
      </div>

    </div>
  );
}
