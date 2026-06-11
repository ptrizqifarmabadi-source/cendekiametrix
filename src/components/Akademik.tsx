/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { AkademikState } from "../types";
import { GraduationCap, Award, BrainCircuit, CheckSquare, Sparkles } from "lucide-react";

interface AkademikProps {
  state: AkademikState;
  onChange: (state: AkademikState) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function Akademik({ state, onChange, onNext, onPrev }: AkademikProps) {
  
  const handleRaporChange = (subject: keyof AkademikState["nilaiRapor"], value: number) => {
    const val = Math.min(100, Math.max(0, value));
    onChange({
      ...state,
      nilaiRapor: { ...state.nilaiRapor, [subject]: val }
    });
  };

  const handleSimulasiChange = (sub: keyof AkademikState["simulasiTes"], value: number) => {
    const val = Math.min(100, Math.max(0, value));
    onChange({
      ...state,
      simulasiTes: { ...state.simulasiTes, [sub]: val }
    });
  };

  const handlePrefCheck = (item: string) => {
    const list = [...state.prestasi];
    const index = list.indexOf(item);
    if (index > -1) {
      list.splice(index, 1);
    } else {
      list.push(item);
    }
    onChange({ ...state, prestasi: list });
  };

  const getCalculation = () => {
    const raporValues = Object.values(state.nilaiRapor);
    const avgRapor = raporValues.reduce((acc, curr) => acc + curr, 0) / (raporValues.length || 1);
    
    const simulasiValues = Object.values(state.simulasiTes);
    const avgSimulasi = simulasiValues.reduce((acc, curr) => acc + curr, 0) / (simulasiValues.length || 1);

    const prestCount = state.prestasi.length;
    const prestScore = Math.min(100, prestCount * 25); // each checkbox is 25%

    // Academic Score Calculation Formula: 45% Rapor, 40% Simulasi UTBK, 15% Prestasi Piagam
    const totalScore = Math.round(avgRapor * 0.45 + avgSimulasi * 0.40 + prestScore * 0.15);

    // Probability Math (Realistic Estimates)
    // SNBP relies on Rapor (70%) and extra academic piagams (30%). If Rapor is very low, chances suffer.
    let snbpChance = Math.round((avgRapor * 0.75) + (prestScore * 0.25));
    if (avgRapor < 75) snbpChance = Math.min(40, snbpChance); // ineligible/rejection filter

    // SNBT relies heavily on Simulasi (85%) and general Rapor backbones (15%)
    let snbtChance = Math.round((avgSimulasi * 0.85) + (avgRapor * 0.15));

    // Mandiri has a stable baseline but adapts
    let mandiriChance = Math.min(99, Math.round(50 + (avgSimulasi * 0.3) + (avgRapor * 0.2)));

    // Beasiswa Prestasi requires exceptionally high Rapor and at least 1 piagam
    let beasiswaChance = Math.round((avgRapor * 0.5) + (prestScore * 0.5));
    if (avgRapor < 85 || prestCount === 0) beasiswaChance = Math.min(30, beasiswaChance);

    return {
      avgRapor: Math.round(avgRapor * 10) / 10,
      avgSimulasi: Math.round(avgSimulasi * 10) / 10,
      totalScore,
      snbpChance,
      snbtChance,
      mandiriChance,
      beasiswaChance
    };
  };

  const {
    avgRapor,
    avgSimulasi,
    totalScore,
    snbpChance,
    snbtChance,
    mandiriChance,
    beasiswaChance
  } = getCalculation();

  const PRESTASI_OPTIONS = [
    { value: "olimpiade", label: "Olimpiade Mata Pelajaran Swasta/PT" },
    { value: "ksn", label: "KSN / OSN Tingkat Kabupaten/Provinsi (Puspresnas)" },
    { value: "sains", label: "Kompetisi Sains Madrasah (KSM/Sains Agama)" },
    { value: "debat", label: "Debat Bahasa Indonesia / Bahasa Inggris / LDBI" },
    { value: "karyaTulis", label: "Lomba Karya Tulis Ilmiah Remaja (KIR / LKTI)" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-100 dark:border-gray-850 pb-5">
        <h2 className="text-2xl font-bold font-sans text-gray-900 dark:text-white flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          Pemetaan Potensi Akademik Mandiri & UTBK
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Menilai nilai rapor sekolah berjalan, sertifikat akademis fisis, serta pengujian simulasi soal Matematika, Sains, Sosial, dan Literasi Bahasa.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Forms Panel */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Nilai Rapor */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-850 space-y-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b border-gray-50 dark:border-gray-800 pb-3">
              <Sparkles className="h-4 w-4 text-blue-600" />
              1. Nilai Rapor Semester Terakhir (Skala 0-100)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: "matematika", label: "Matematika Umum" },
                { key: "bahasaIndonesia", label: "Bahasa Indonesia" },
                { key: "bahasaInggris", label: "Bahasa Inggris" },
                { key: "ipa", label: "Sains Alam / IPA Terpadu" },
                { key: "ips", label: "Sains Sosial / IPS Terpadu" }
              ].map((sub) => (
                <div key={sub.key} className="flex justify-between items-center bg-gray-50/40 dark:bg-gray-950 px-4 py-2.5 rounded-xl border border-gray-150 dark:border-gray-800">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{sub.label}</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={state.nilaiRapor[sub.key as keyof AkademikState["nilaiRapor"]] || ""}
                    onChange={(e) => handleRaporChange(sub.key as keyof AkademikState["nilaiRapor"], parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="w-20 px-2 py-1 text-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white"
                  />
                </div>
              ))}
              
              <div className="flex items-center justify-between px-4 py-2.5 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-105/35">
                <span className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider font-mono">Aliansi Rata-Rapor:</span>
                <span className="text-lg font-extrabold text-blue-700 dark:text-blue-450">{avgRapor}</span>
              </div>
            </div>
          </div>

          {/* Simulasi Ujian SKD/UTBK */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-850 space-y-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b border-gray-50 dark:border-gray-800 pb-3">
              <BrainCircuit className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              2. Prediksi Skor Simulasi Tes SNBT
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { key: "literasi", label: "Tes Literasi", desc: "Membaca & Kebahasaan" },
                { key: "numerasi", label: "Tes Numerasi", desc: "Matematika Kuantitatif" },
                { key: "penalaran", label: "Penalaran Umum", desc: "Logika Kognitif" }
              ].map((sub) => (
                <div key={sub.key} className="bg-gray-50/50 dark:bg-gray-950 p-4 rounded-xl border border-gray-150 dark:border-gray-800 space-y-2">
                  <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest font-mono">{sub.label}</div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-450 dark:text-gray-500">{sub.desc}</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={state.simulasiTes[sub.key as keyof AkademikState["simulasiTes"]] || ""}
                      onChange={(e) => handleSimulasiChange(sub.key as keyof AkademikState["simulasiTes"], parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="w-16 px-1.5 py-1 text-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white font-bold"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prestasi Akademis Checklist */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-850 space-y-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b border-gray-50 dark:border-gray-800 pb-3">
              <Award className="h-4 w-4 text-amber-500" />
              3. Prestasi Akademis & Karya Tulis Ilmiah
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PRESTASI_OPTIONS.map((opt) => {
                const checked = state.prestasi.includes(opt.value);
                return (
                  <label
                    key={opt.value}
                    className={`flex items-start p-2.5 rounded-xl border transition-all cursor-pointer text-xs ${
                      checked
                        ? "bg-amber-50/50 border-amber-300 text-amber-800 dark:bg-amber-950/20 dark:border-amber-800 dark:text-amber-300 font-medium"
                        : "border-gray-150 bg-gray-50/30 text-gray-600 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handlePrefCheck(opt.value)}
                      className="mt-0.5 mr-3 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>{opt.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Output Panel */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/10 rounded-2xl p-6 border border-blue-100 dark:border-blue-900/20 flex flex-col justify-between h-full">
            
            <div className="space-y-6">
              <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-xs font-mono border-b border-blue-200/50 dark:border-blue-900/30 pb-2">
                HASIL PEMETAAN AKADEMIK
              </h3>

              {/* Total Score Gauge */}
              <div className="text-center py-4">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest font-mono">Skor Akademis Terpadu</div>
                <div className="text-6xl font-extrabold text-blue-700 dark:text-blue-400 mt-2 mb-1">{totalScore}</div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 italic">45% Rapor + 40% Simulasi + 15% Prestasi</p>
              </div>

              {/* Chances Bar List */}
              <div className="space-y-4">
                <div className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">Prediksi Peluang Jalur Kuliah:</div>
                
                <div className="space-y-3">
                  {[
                    { label: "Seleksi Jalur Rapor (SNBP)", chance: snbpChance, color: "bg-blue-600" },
                    { label: "Seleksi Jalur Tulis (SNBT)", chance: snbtChance, color: "bg-indigo-600" },
                    { label: "Ujian Mandiri Perguruan Tinggi", chance: mandiriChance, color: "bg-purple-600" },
                    { label: "Proposal Beasiswa Prestasi", chance: beasiswaChance, color: "bg-amber-500" }
                  ].map((p, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium text-gray-700 dark:text-gray-300">
                        <span>{p.label}</span>
                        <span className="font-bold">{p.chance}%</span>
                      </div>
                      <div className="w-full bg-gray-200/50 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                        <div className={`h-full ${p.color} transition-all duration-500`} style={{ width: `${p.chance}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Instruction Warning advice */}
            <div className="mt-8 bg-white/70 dark:bg-gray-900/50 rounded-xl p-4 border border-blue-200/30 dark:border-blue-900/20 text-xs text-gray-500 dark:text-gray-400">
              Sekolah Cendekia BAZNAS membimbing siswa-siswanya agar memiliki daya saing tinggi. Tingkatkan nilai dan konsistensi rata-rapor Anda di semester depan untuk memposisikan diri di kuota elit jatah eligible SNBP sekolah.
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
