/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { FullAppState, AIRecommendation } from "../types";
import { Brain, Star, Award, Compass, RefreshCw, CheckCircle, ShieldAlert } from "lucide-react";

interface AIRecommendationsProps {
  appState: FullAppState;
  onUpdateRecommendations: (rec: AIRecommendation) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function AIRecommendations({
  appState,
  onUpdateRecommendations,
  onNext,
  onPrev
}: AIRecommendationsProps) {
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [sourceUsed, setSourceUsed] = useState<string | null>(null);

  const { profile, keagamaan, akademik, prestasiEkskul, minatBakat, iqTest, aiRecommendation } = appState;

  const LOADING_MESSAGES = [
    "Menyatukan data evaluasi kognitif ...",
    "Mengkalkulasi kecenderungan minat kualitatif Holland RIASEC ...",
    "Mengevaluasi tren rata-rata rapor & simulasi ujian tulis ...",
    "Menyelaraskan rekam pembinaan sikap kesiswaan Sekolah Cendekia BAZNAS ...",
    "Mengasimilasi rekomendasi 10 jurusan dengan kecerdasan buatan ...",
    "Menyusun cetak biru peta karir 3 tahun kelas x s.d. xii ...",
  ];

  const handleGenerateAI = async () => {
    onUpdateRecommendations({
      ...aiRecommendation,
      status: "loading"
    });

    // Start interval to cycle loading messages
    let msgIndex = 0;
    const interval = setInterval(() => {
      msgIndex = (msgIndex + 1) % LOADING_MESSAGES.length;
      setLoadingMsgIdx(msgIndex);
    }, 2500);

    // Calculate Holland Top Dominants to pass to the API
    const maxPossiblePoints = 50;
    const riasecScores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    Object.entries(minatBakat.answers).forEach(([qId, val]) => {
      // Find category of question
      // Import questions in server but easier to pass pre-calculated
    });

    // Let's do simple calculation to send
    const riasecCategories: ("R" | "I" | "A" | "S" | "E" | "C")[] = ["R", "I", "A", "S", "E", "C"];
    const counts = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    // We know RIASEC questions are sorted. Let's do a quick mock map
    // Let's count them: R are 1,7,13,19,25,31,37,43,49,55, etc.
    const riasecMappingScore = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    const R_ids = [1, 7, 13, 19, 25, 31, 37, 43, 49, 55];
    const I_ids = [2, 8, 14, 20, 26, 32, 38, 44, 50, 56];
    const A_ids = [3, 9, 15, 21, 27, 33, 39, 45, 51, 57];
    const S_ids = [4, 10, 16, 22, 28, 34, 40, 46, 52, 58];
    const E_ids = [5, 11, 17, 23, 29, 35, 41, 47, 53, 59];
    const C_ids = [6, 12, 18, 24, 30, 36, 42, 48, 54, 60];

    Object.entries(minatBakat.answers).forEach(([qIdStr, rating]) => {
      const qId = parseInt(qIdStr);
      if (R_ids.includes(qId)) riasecMappingScore.R += rating;
      else if (I_ids.includes(qId)) riasecMappingScore.I += rating;
      else if (A_ids.includes(qId)) riasecMappingScore.A += rating;
      else if (S_ids.includes(qId)) riasecMappingScore.S += rating;
      else if (E_ids.includes(qId)) riasecMappingScore.E += rating;
      else if (C_ids.includes(qId)) riasecMappingScore.C += rating;
    });

    const dominanRiasec = (Object.keys(riasecMappingScore) as ("R" | "I" | "A" | "S" | "E" | "C")[]).map(key => ({
      type: key,
      percentage: Math.round((riasecMappingScore[key] / 50) * 100),
      label: key === "R" ? "Realistic" : key === "I" ? "Investigative" : key === "A" ? "Artistic" : key === "S" ? "Social" : key === "E" ? "Enterprising" : "Conventional"
    })).sort((a, b) => b.percentage - a.percentage);

    const payload = {
      jenjang: appState.jenjang,
      profile,
      keagamaan,
      akademik,
      prestasiEkskul,
      dominanRiasec,
      iqScore: iqTest.iqScore || 100,
      minatBakatColors: riasecMappingScore
    };

    try {
      const response = await fetch("/api/recommend-majors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const resData = await response.json();
      
      clearInterval(interval);
      setSourceUsed(resData.source);

      onUpdateRecommendations({
        status: "success",
        majors: resData.data.majors,
        justification: resData.data.justification,
        threeYearPlan: resData.data.threeYearPlan
      });

    } catch (err) {
      console.error(err);
      clearInterval(interval);
      setSourceUsed("error");
      
      onUpdateRecommendations({
        status: "error",
        majors: [],
        justification: "",
        threeYearPlan: { kelas10: "", kelas11: "", kelas12: "" }
      });
    }
  };

  const hasAssessmentsUnfinished = () => {
    // Check if critical items filled to prevent low-fidelity outputs
    if (appState.jenjang === "SMP") {
      return profile.nama === "" || Object.keys(appState.gayaBelajar.answers || {}).length < 10 || Object.keys(iqTest.answers || {}).length < 10;
    }
    return profile.nama === "" || Object.keys(minatBakat.answers).length < 10 || Object.keys(iqTest.answers).length < 10;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-100 dark:border-gray-850 pb-5">
        <h2 className="text-2xl font-bold font-sans text-gray-900 dark:text-white flex items-center gap-2">
          <Brain className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          {appState.jenjang === "SMP"
            ? "Rekomendasi Asesmen Potensi & Karakter SMP Berbasis AI"
            : "Rekomendasi Jurusan & Karir Berbasis AI"}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          {appState.jenjang === "SMP"
            ? "Kalkulasi holistik meliputi 40% Gaya Belajar VAK, 40% IQ Kognitif, dan 20% Prestasi & Ekstrakurikuler."
            : "Integrasi cerdas 40% Minat Bakat, 30% IQ, 20% Potensi Akademis, dan 10% Prestasi Mandiri."}
        </p>
      </div>

      {/* Main Container */}
      <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-6 md:p-8 shadow-sm">
        
        {aiRecommendation.status === "idle" || aiRecommendation.status === "error" ? (
          
          /* Generative Call-to-action view */
          <div className="text-center py-10 max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-450 rounded-full animate-bounce">
              <Brain className="h-8 w-8" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-950 dark:text-white">
                {appState.jenjang === "SMP" ? "Asimilasi Rekomendasi Karakter & Studi SMP Anda" : "Asimilasi Rekomendasi Karir Anda"}
              </h3>
              <p className="text-sm text-gray-650 dark:text-gray-450 leading-6">
                {appState.jenjang === "SMP"
                  ? "Kami siap menganalisis data psikologis, potensi kognitif IQ, spiritual keagamaan, serta menyarankan optimalisasi belajar & ekskul pilihan Sekolah Cendekia BAZNAS."
                  : "Kami siap menggabungkan data holistik Anda dan menautkannya dengan direktori 120+ rumpun program studi perguruan tinggi di Indonesia."}
              </p>
            </div>

            {hasAssessmentsUnfinished() && (
              <div className="bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 border border-amber-200/50 p-4 rounded-xl text-xs flex gap-2.5 items-start text-left leading-5">
                <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <span>
                  <strong>Awas:</strong> Hasil kognitif / gaya belajar Anda belum terisi cukup lengkap. Kami sangat merekomendasikan Anda untuk mengisi data profil diri (Menu 1), minimal 10 pertanyaan kuis Gaya Belajar (Menu 11) untuk SMP, dan minimal 10 soal simulasi IQ (Menu 6) agar prediksi kecocokan bersifat logis dan akurat.
                </span>
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={handleGenerateAI}
                className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-indigo-500/20 cursor-pointer text-sm transition-all inline-flex items-center justify-center gap-2"
              >
                <Brain className="h-4 w-4" />
                Analisis Potensi & Karir Terpadu
              </button>
            </div>

            {aiRecommendation.status === "error" && (
              <p className="text-rose-500 text-xs font-mono">
                Terjadi kendala saat menghubungi server kognitif. Silakan klik tombol di atas untuk mencoba kembali.
              </p>
            )}
          </div>

        ) : aiRecommendation.status === "loading" ? (
          
          /* Counselor loader */
          <div className="text-center py-20 max-w-md mx-auto space-y-6">
            <div className="relative inline-flex mb-2">
              <div className="w-14 h-14 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin dark:border-indigo-900 border-t-indigo-400" />
              <Brain className="h-6 w-6 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            
            <div className="space-y-1.5 animate-pulse">
              <h4 className="text-sm font-bold text-gray-800 dark:text-white uppercase font-mono tracking-wider">AI sedang melakukan kalkulasi ...</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-6 italic">
                "{LOADING_MESSAGES[loadingMsgIdx]}"
              </p>
            </div>
          </div>

        ) : (
          
          /* Success analysis display view */
          <div className="space-y-10">
            
            {/* Header banner stating source */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-150 dark:border-r-gray-850 gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {sourceUsed === "gemini-api" 
                    ? "Generatif AI Aktif: Peta kognitif dianalisis menggunakan Gemini 3.5-flash." 
                    : "Asimilasi Cerdas Lokal: Menggunakan modul kalkulasi rules-engine hemat kuota."}
                </span>
              </div>
              <button
                onClick={handleGenerateAI}
                className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-600 hover:text-indigo-700 font-mono flex items-center gap-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 py-1 px-2 rounded-lg cursor-pointer"
              >
                <RefreshCw className="h-2.5 w-2.5" /> Hitung Ulang
              </button>
            </div>

            {/* Part 1: Top 10 recommended majors list */}
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-850 pb-2 text-base uppercase tracking-wider font-sans">
                <Star className="h-5 w-5 text-amber-500" />
                {appState.jenjang === "SMP"
                  ? "Hasil Pemetaan Rekomendasi Hasil Belajar, Gaya Belajar & Karakter SMP"
                  : "Hasil Pemetaan Top 10 Jurusan Terbaik"}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiRecommendation.majors.map((m) => (
                  <div
                    key={m.rank}
                    className="p-5 rounded-2xl bg-gray-50/50 hover:bg-gray-100/30 dark:bg-gray-950 border border-gray-150 dark:border-gray-850 flex items-start gap-4 transition-all"
                  >
                    {/* Rank Indicator Badge */}
                    <span className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-sans font-extrabold flex items-center justify-center shrink-0">
                      #{m.rank}
                    </span>

                    {/* Meta */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex justify-between items-center bg-transparent gap-2">
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                          {m.name}
                        </h4>
                        <span className="shrink-0 bg-indigo-100/40 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 font-mono text-[10px] font-extrabold px-2 py-0.5 rounded">
                          {m.suitabilityScore}% Match
                        </span>
                      </div>
                      <p className="text-xs text-gray-650 dark:text-gray-400 leading-5">
                        {m.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Part 2: Holistic Counselor Justification */}
            <div className="space-y-3 bg-gradient-to-br from-indigo-50/20 to-blue-50/10 dark:from-indigo-950/10 dark:to-teal-950/5 p-6 md:p-8 rounded-2xl border border-indigo-100 dark:border-indigo-900/10">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider font-mono border-b border-indigo-100 dark:border-indigo-900/30 pb-2">
                JUSTIFIKASI HOLISTIK KONSELOR AI
              </h3>
              <p className="text-xs md:text-sm text-gray-700 dark:text-gray-300 leading-7 whitespace-pre-line font-sans">
                {aiRecommendation.justification}
              </p>
            </div>

            {/* Part 3: 3-Year study roadmap */}
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-850 pb-2 text-base uppercase tracking-wider font-sans">
                <Award className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Rencana Pengembangan Pembelajaran 3 Tahun (Blue-Print SCB)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                
                {/* Year 1: Kelas 7 / 10 */}
                <div className="p-5 rounded-2xl bg-white dark:bg-gray-950 border border-gray-150 dark:border-gray-850 space-y-3 shadow-sm relative">
                  <div className="flex items-center gap-2 border-b border-gray-50 dark:border-gray-900 pb-2.5">
                    <span className="w-5 h-5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-mono font-extrabold flex items-center justify-center rounded-lg">1</span>
                    <h4 className="font-extrabold text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 font-mono">
                      {profile.kelas?.includes("Kelas 7") || profile.kelas?.includes("Kelas 8") || profile.kelas?.includes("Kelas 9")
                        ? "KELAS VII - Adaptasi & Fondasi"
                        : "KELAS X - Adaptasi & Fondasi"
                      }
                    </h4>
                  </div>
                  <p className="text-xs text-gray-650 dark:text-gray-450 leading-6 italic">
                    "{aiRecommendation.threeYearPlan.kelas10}"
                  </p>
                </div>

                {/* Year 2: Kelas 8 / 11 */}
                <div className="p-5 rounded-2xl bg-white dark:bg-gray-950 border border-gray-150 dark:border-gray-850 space-y-3 shadow-sm">
                  <div className="flex items-center gap-2 border-b border-gray-50 dark:border-gray-900 pb-2.5">
                    <span className="w-5 h-5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-[10px] font-mono font-extrabold flex items-center justify-center rounded-lg">2</span>
                    <h4 className="font-extrabold text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 font-mono">
                      {profile.kelas?.includes("Kelas 7") || profile.kelas?.includes("Kelas 8") || profile.kelas?.includes("Kelas 9")
                        ? "KELAS VIII - Akselerasi & Karakter"
                        : "KELAS XI - Akselerasi & Portofolio"
                      }
                    </h4>
                  </div>
                  <p className="text-xs text-gray-650 dark:text-gray-450 leading-6 italic">
                    "{aiRecommendation.threeYearPlan.kelas11}"
                  </p>
                </div>

                {/* Year 3: Kelas 9 / 12 */}
                <div className="p-5 rounded-2xl bg-white dark:bg-gray-950 border border-gray-150 dark:border-gray-850 space-y-3 shadow-sm">
                  <div className="flex items-center gap-2 border-b border-gray-50 dark:border-gray-900 pb-2.5">
                    <span className="w-5 h-5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-[10px] font-mono font-extrabold flex items-center justify-center rounded-lg">3</span>
                    <h4 className="font-extrabold text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 font-mono">
                      {profile.kelas?.includes("Kelas 7") || profile.kelas?.includes("Kelas 8") || profile.kelas?.includes("Kelas 9")
                        ? "KELAS IX - Sukses & Studi Lanjut"
                        : "KELAS XII - Klimaks & Sukses Jalur"
                      }
                    </h4>
                  </div>
                  <p className="text-xs text-gray-650 dark:text-gray-450 leading-6 italic">
                    "{aiRecommendation.threeYearPlan.kelas12}"
                  </p>
                </div>

              </div>
            </div>

          </div>
        )}

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
          disabled={aiRecommendation.status !== "success"}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-150 disabled:text-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-850 dark:disabled:text-gray-600 rounded-xl shadow-md transition-colors inline-flex items-center gap-2 text-sm font-medium cursor-pointer"
        >
          {appState.jenjang === "SMP" ? "Lanjut ke Evaluasi" : "Prediksi Jalur Masuk"}
        </button>
      </div>

    </div>
  );
}
