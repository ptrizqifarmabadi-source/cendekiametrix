/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { MinatBakatState } from "../types";
import { RIASEC_QUESTIONS } from "../questions";
import { Compass, Sparkles, RefreshCw, BarChart2, Eye } from "lucide-react";

interface MinatBakatProps {
  state: MinatBakatState;
  onChange: (state: MinatBakatState) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function MinatBakat({ state, onChange, onNext, onPrev }: MinatBakatProps) {
  const [currentPage, setCurrentPage] = useState(0); // 6 pages of 10 questions each
  const questionsPerPage = 10;
  const totalPages = 6;

  // RIASEC Profiles metadata
  const PROFILE_METADATA = {
    R: { name: "Realistic (Praktis)", color: "text-rose-600 border-rose-100 bg-rose-50 dark:text-rose-400 dark:border-rose-900/40 dark:bg-rose-950/20", desc: "Anda menyukai aktivitas praktis, mekanikal, fisik, bekerja dengan mesin, perkakas, perangkat keras, atau alam bebas." },
    I: { name: "Investigative (Analitis)", color: "text-blue-600 border-blue-100 bg-blue-50 dark:text-blue-400 dark:border-blue-900/40 dark:bg-blue-950/20", desc: "Anda menyukai pemecahan masalah, penelitian ilmiah, matematika, analisis data mendalam, teori kognitif, dan logika." },
    A: { name: "Artistic (Kreatif)", color: "text-purple-600 border-purple-100 bg-purple-50 dark:text-purple-400 dark:border-purple-900/40 dark:bg-purple-950/20", desc: "Anda menyukai pengekspresian diri secara bebas, seni visual digital, musik, teater, kepenulisan kreatif, dan orisinalitas tinggi." },
    S: { name: "Social (Sosial/Empatis)", color: "text-green-600 border-green-100 bg-green-50 dark:text-green-400 dark:border-green-900/40 dark:bg-green-950/20", desc: "Anda berjiwa pengabdi masyarakat, gemar menyembuhkan, mengajar, melatih bimbingan teman asrama, serta konseling psikososial." },
    E: { name: "Enterprising (Penuh Inisiatif)", color: "text-amber-600 border-amber-100 bg-amber-50 dark:text-amber-400 dark:border-amber-900/40 dark:bg-amber-950/20", desc: "Anda bertipe pemimpin lincah, berani berspekulasi bisnis, mahir bernegosiasi hukum, persuasif di podium, dan bermoral tinggi." },
    C: { name: "Conventional (Terstruktur)", color: "text-teal-600 border-teal-100 bg-teal-50 dark:text-teal-400 dark:border-teal-900/40 dark:bg-teal-950/20", desc: "Anda menyukai administrasi perkantoran rapi, sistem arsip, tabel akuntansi presisi, penjadwalan ketertiban, dan SOP terstruktur." }
  };

  const handleRatingChange = (qId: number, rating: number) => {
    const nextAnswers = { ...state.answers, [qId]: rating };
    // Check if fully completed
    const completed = RIASEC_QUESTIONS.every(q => nextAnswers[q.id] !== undefined);
    onChange({ answers: nextAnswers, completed });
  };

  const autofillSimulatedAnswers = () => {
    // Generates a high-fidelity mock profile (Strong in investigative, social, conventional)
    const simulatedAnswers: Record<number, number> = {};
    RIASEC_QUESTIONS.forEach(q => {
      if (q.category === "I") {
        simulatedAnswers[q.id] = Math.floor(Math.random() * 2) + 4; // 4 or 5
      } else if (q.category === "S" || q.category === "C") {
        simulatedAnswers[q.id] = Math.floor(Math.random() * 3) + 3; // 3, 4, or 5
      } else {
        simulatedAnswers[q.id] = Math.floor(Math.random() * 4) + 1; // 1 to 4
      }
    });
    onChange({ answers: simulatedAnswers, completed: true });
  };

  const clearAnswers = () => {
    onChange({ answers: {}, completed: false });
    setCurrentPage(0);
  };

  // Get current chunk of questions
  const startIndex = currentPage * questionsPerPage;
  const currentQuestions = RIASEC_QUESTIONS.slice(startIndex, startIndex + questionsPerPage);

  // RIASEC Math scoring
  const getAnalysis = () => {
    const scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    const maxPossiblePoints = 50; // 10 questions * 5 max rating

    RIASEC_QUESTIONS.forEach(q => {
      const userRating = state.answers[q.id] || 0;
      scores[q.category] += userRating;
    });

    const percentages = {
      R: Math.round((scores.R / maxPossiblePoints) * 100),
      I: Math.round((scores.I / maxPossiblePoints) * 100),
      A: Math.round((scores.A / maxPossiblePoints) * 100),
      S: Math.round((scores.S / maxPossiblePoints) * 100),
      E: Math.round((scores.E / maxPossiblePoints) * 100),
      C: Math.round((scores.C / maxPossiblePoints) * 100)
    };

    // Sorted types
    const sortedTypes = (Object.keys(percentages) as ("R" | "I" | "A" | "S" | "E" | "C")[])
      .map(key => ({
        type: key,
        percentage: percentages[key],
        rawScore: scores[key],
        ...PROFILE_METADATA[key]
      }))
      .sort((a, b) => b.percentage - a.percentage);

    return { percentages, sortedTypes };
  };

  const { percentages, sortedTypes } = getAnalysis();
  const dominanTypes = sortedTypes.slice(0, 3);

  // Generate Radar Chart SVG Points
  const generateRadarPoints = () => {
    const center = 150;
    const maxRadius = 100;
    const axes = [
      { key: "R", angle: 0 },
      { key: "I", angle: 60 },
      { key: "A", angle: 120 },
      { key: "S", angle: 185 },
      { key: "E", angle: 240 },
      { key: "C", angle: 300 }
    ];

    const radarPoints = axes.map((ax, i) => {
      const val = percentages[ax.key as keyof typeof percentages] || 0;
      const radius = (val / 100) * maxRadius;
      const angleRad = (ax.angle * Math.PI) / 180;
      const x = center + radius * Math.cos(angleRad);
      const y = center + radius * Math.sin(angleRad);
      return `${x},${y}`;
    }).join(" ");

    return { center, maxRadius, axes, radarPoints };
  };

  const { center, maxRadius, axes, radarPoints } = generateRadarPoints();

  // Progress Tracker
  const answeredCount = Object.keys(state.answers).length;
  const progressPercent = Math.round((answeredCount / 60) * 100);

  const OPTIONS = [
    { value: 1, label: "STS", desc: "Sangat Tidak Sesuai" },
    { value: 2, label: "TS", desc: "Tidak Sesuai" },
    { value: 3, label: "N", desc: "Netral" },
    { value: 4, label: "S", desc: "Sesuai" },
    { value: 5, label: "SS", desc: "Sangat Sesuai" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-100 dark:border-gray-850 pb-5">
        <h2 className="text-2xl font-bold font-sans text-gray-900 dark:text-white flex items-center gap-2">
          <Compass className="h-6 w-6 text-purple-650" />
          Asesmen Minat Karir RIASEC (Holland Code)
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Temukan 3 Tipe Dominan kepribadian Anda berdasarkan standard riset psikologi karir Dr. John Holland.
        </p>
      </div>

      {/* Progress & Quick Actions */}
      <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="w-full md:w-3/5 space-y-1">
          <div className="flex justify-between items-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider font-mono">
            <span>Kemajuan Kuisioner RIASEC</span>
            <span className="text-purple-600 dark:text-purple-400">{answeredCount} dari 60 Terisi ({progressPercent}%)</span>
          </div>
          <div className="w-full bg-gray-200/50 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden">
            <div className="bg-purple-600 h-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-end">
          <button
            onClick={autofillSimulatedAnswers}
            className="flex-1 md:flex-none px-4 py-2 text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950/20 dark:hover:bg-purple-900/30 dark:text-purple-400 font-bold rounded-xl transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer border border-purple-100 dark:border-purple-900/30"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Simulasi Pengisian Cepat
          </button>
          
          {answeredCount > 0 && (
            <button
              onClick={clearAnswers}
              className="px-3 py-2 text-xs text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all inline-flex items-center justify-center gap-1 cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" /> Reset
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Questionnaire Block */}
        <div className="lg:col-span-2 space-y-6">
          {!state.completed ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-850 overflow-hidden">
              <div className="bg-purple-50/50 dark:bg-purple-950/20 border-b border-gray-100 dark:border-gray-850 px-6 py-4 flex justify-between items-center">
                <span className="text-sm font-bold text-purple-800 dark:text-purple-400">Bagian {currentPage + 1} dari 6</span>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={`w-7 h-7 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                        currentPage === i
                          ? "bg-purple-600 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Questions List */}
              <div className="p-6 divide-y divide-gray-100 dark:divide-gray-850">
                {currentQuestions.map((q, index) => {
                  const savedVal = state.answers[q.id];
                  return (
                    <div key={q.id} className={`py-5 ${index === 0 ? "pt-1" : ""} ${index === currentQuestions.length - 1 ? "pb-1" : ""}`}>
                      <div className="flex gap-4">
                        <span className="text-xs font-bold font-mono text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/20 px-2 py-1 h-fit rounded">
                          Q{q.id}
                        </span>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-6">{q.text}</p>
                      </div>

                      <div className="grid grid-cols-5 gap-2 max-w-xl ml-0 md:ml-12 mt-4">
                        {OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => handleRatingChange(q.id, opt.value)}
                            className={`py-2 px-1 text-center rounded-xl border text-[10px] md:text-xs font-medium cursor-pointer transition-all ${
                              savedVal === opt.value
                                ? "bg-purple-600 border-purple-600 text-white shadow-sm font-bold"
                                : "border-gray-150 bg-gray-50/20 text-gray-650 hover:bg-gray-50 hover:border-gray-300 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400 dark:hover:bg-gray-850"
                            }`}
                          >
                            <div>{opt.label}</div>
                            <span className="hidden md:inline text-[9px] text-opacity-80 block truncate font-normal mt-0.5">{opt.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination control */}
              <div className="border-t border-gray-100 dark:border-gray-850 p-4 bg-gray-50/30 dark:bg-gray-950/10 flex justify-between">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 disabled:opacity-50 text-xs font-semibold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer"
                >
                  Sebelumnya
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="px-4 py-2 border border-purple-200 dark:border-purple-900 text-purple-700 dark:text-purple-400 disabled:opacity-50 text-xs font-semibold rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer"
                >
                  Selanjutnya
                </button>
              </div>

            </div>
          ) : (
            // Thank you State if Completed
            <div className="bg-emerald-50/50 dark:bg-emerald-950/10 rounded-2xl border border-emerald-150 p-8 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full mb-2">
                <Eye className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-950 dark:text-white">Pertanyaan Selesai Terjawab Semua!</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xl mx-auto leading-6">
                Luar biasa, Anda telah merampungkan kuisioner 60 pertanyaan RIASEC. Hasil interpretasi grafik radar dan 3 tipe dominan dapat ditinjau langsung di panel kanan.
              </p>
              <button
                onClick={clearAnswers}
                className="px-4 py-2 text-xs bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 text-gray-600 dark:text-gray-400 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1"
              >
                Ulangi Menjawab
              </button>
            </div>
          )}

          {/* Tips box at bottom */}
          <div className="bg-gray-50/50 dark:bg-gray-950 p-5 border border-gray-150 dark:border-gray-850 rounded-2xl text-xs text-gray-500 dark:text-gray-400 leading-6">
            <strong>Cara Membaca Radar:</strong> Semakin menjorok ke luar area grafik, semakin kuat kecenderungan minat Anda pada rumpun tipe tersebut. Kombinasi 3 tipe dengan skor tertinggi (Top 3 Dominan) akan melahirkan rumpun pola karir Holland Code Anda.
          </div>
        </div>

        {/* Output Panel: Radar Chart & Dominants */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/10 rounded-2xl p-6 border border-purple-100 dark:border-purple-900/20 flex flex-col justify-between">
            
            <div className="space-y-6">
              <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-xs font-mono border-b border-purple-200/50 dark:border-purple-900/30 pb-2 flex items-center gap-1.5">
                <BarChart2 className="h-4 w-4" /> GRAFIK RADAR PENYAKITAN MINAT
              </h3>

              {/* Dynamic Radar HTML SVG */}
              <div className="flex justify-center py-2 bg-white dark:bg-gray-950 rounded-xl p-4 border border-purple-100/50 dark:border-purple-900/20 shadow-sm relative">
                <svg width="240" height="240" viewBox="0 0 300 300" className="overflow-visible">
                  {/* Circular Grid Lines (at 25%, 50%, 75%, 100%) */}
                  {[25, 50, 75, 100].map((level, i) => {
                    const r = (level / 100) * maxRadius;
                    return (
                      <circle
                        key={i}
                        cx={center}
                        cy={center}
                        r={r}
                        fill="none"
                        stroke="#e2e8f0"
                        strokeDasharray={level === 100 ? "none" : "3,3"}
                        className="dark:stroke-gray-800"
                        strokeWidth="1"
                      />
                    );
                  })}

                  {/* Axis lines from center to outer vertice */}
                  {axes.map((ax, i) => {
                    const angleRad = (ax.angle * Math.PI) / 180;
                    const x = center + maxRadius * Math.cos(angleRad);
                    const y = center + maxRadius * Math.sin(angleRad);
                    return (
                      <line
                        key={i}
                        x1={center}
                        y1={center}
                        x2={x}
                        y2={y}
                        stroke="#cbd5e1"
                        className="dark:stroke-gray-700"
                        strokeWidth="1"
                      />
                    );
                  })}

                  {/* User value polygon filled area */}
                  {progressPercent > 0 && (
                    <polygon
                      points={radarPoints}
                      fill="rgba(147, 51, 234, 0.2)"
                      stroke="#9333ea"
                      strokeWidth="2.5"
                    />
                  )}

                  {/* Labels around the radar */}
                  {axes.map((ax, i) => {
                    const angleRad = (ax.angle * Math.PI) / 180;
                    // Offset labels slightly outside of max radius
                    const labelRadius = maxRadius + 22;
                    const x = center + labelRadius * Math.cos(angleRad);
                    const y = center + labelRadius * Math.sin(angleRad);
                    const score = percentages[ax.key as keyof typeof percentages] || 0;
                    return (
                      <text
                        key={i}
                        x={x}
                        y={y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="10"
                        className="fill-gray-700 dark:fill-gray-300 font-bold font-sans"
                      >
                        {ax.key}: {score}%
                      </text>
                    );
                  })}
                </svg>
              </div>

              {/* Top 3 Dominant Categories */}
              <div className="space-y-4">
                <div className="text-xs font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wider">
                  3 Kepribadian Dominan (Rumpun Holland):
                </div>

                {answeredCount < 10 ? (
                  <div className="text-xs text-gray-400 bg-white/50 dark:bg-gray-900/30 p-4 rounded-xl italic">
                    Lengkapi kuisioner minimal 10 pertanyaan untuk menampilkan asimilasi akurat Holland Code.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dominanTypes.map((t, index) => (
                      <div key={t.type} className="bg-white dark:bg-gray-950 rounded-xl p-3 border border-purple-100 dark:border-purple-900/30 space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                            <span className="w-5 h-5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 flex items-center justify-center rounded-lg font-mono font-extrabold text-[10px]">
                              {index + 1}
                            </span>
                            {t.name}
                          </span>
                          <span className="font-mono bg-purple-50 dark:bg-purple-950/20 px-2 py-0.5 rounded text-[10px] font-extrabold text-purple-700 dark:text-purple-400">
                            {t.percentage}%
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-650 dark:text-gray-400 leading-4">{t.desc}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

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
