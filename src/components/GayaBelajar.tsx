/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { GayaBelajarState } from "../types";
import { GAYA_BELAJAR_QUESTIONS } from "../questions";
import { Compass, Sparkles, RefreshCw, BarChart2, Eye, Sun, Ear, Activity } from "lucide-react";

interface GayaBelajarProps {
  state: GayaBelajarState;
  onChange: (state: GayaBelajarState) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function GayaBelajar({ state, onChange, onNext, onPrev }: GayaBelajarProps) {
  const [currentPage, setCurrentPage] = useState(0); // 3 pages of 10 questions each
  const questionsPerPage = 10;
  const totalPages = 3;

  // VAK profiles metadata
  const PROFILE_METADATA = {
    V: { 
      name: "Visual (Belajar Lewat Gambar/Tulisan)", 
      icon: Sun,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/20 border-blue-105",
      barColor: "bg-blue-500",
      desc: "Anda sangat peka terhadap informasi visual seperti diagram, infografis, slide warna, dan catatan rapi. Anda cenderung mengingat apa yang Anda lihat daripada apa yang Anda dengar." 
    },
    A: { 
      name: "Auditori (Belajar Lewat Pendengaran)", 
      icon: Ear,
      color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20 border-indigo-105",
      barColor: "bg-indigo-500",
      desc: "Anda belajar paling efektif dengan mendengarkan penjelasan lisan, diskusi kelompok, podcast, dan murottal Al-Quran secara audio. Anda cenderung mengingat intonasi suara dan bunyi." 
    },
    K: { 
      name: "Kinestetik (Belajar Lewat Gerak/Praktik)", 
      icon: Activity,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-950/20 border-amber-105",
      barColor: "bg-amber-500",
      desc: "Anda adalah tipe pembelajar praktis yang menyerap materi secara maksimal dengan memegang, menyentuh, merakit objek, mempraktikkan langsung, atau sambil berjalan mondar-mandir." 
    }
  };

  const handleRatingChange = (qId: number, rating: number) => {
    const nextAnswers = { ...state.answers, [qId]: rating };
    const completed = GAYA_BELAJAR_QUESTIONS.every(q => nextAnswers[q.id] !== undefined);
    onChange({ answers: nextAnswers, completed });
  };

  const autofillSimulatedAnswers = () => {
    const simulatedAnswers: Record<number, number> = {};
    GAYA_BELAJAR_QUESTIONS.forEach(q => {
      // Simulate strong Visual (e.g. 4 or 5) and random others
      if (q.category === "V") {
        simulatedAnswers[q.id] = Math.floor(Math.random() * 2) + 4; // 4 to 5
      } else {
        simulatedAnswers[q.id] = Math.floor(Math.random() * 4) + 2; // 2 to 5
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
  const currentQuestions = GAYA_BELAJAR_QUESTIONS.slice(startIndex, startIndex + questionsPerPage);

  // VAK Math scoring
  const getAnalysis = () => {
    const scores = { V: 0, A: 0, K: 0 };
    const maxPossiblePoints = GAYA_BELAJAR_QUESTIONS.filter(q => q.category === "V").length * 5; // 10 questions * 5 max = 50

    GAYA_BELAJAR_QUESTIONS.forEach(q => {
      const userRating = state.answers[q.id] || 0;
      scores[q.category as "V" | "A" | "K"] += userRating;
    });

    const percentages = {
      V: Math.round((scores.V / maxPossiblePoints) * 100) || 0,
      A: Math.round((scores.A / maxPossiblePoints) * 100) || 0,
      K: Math.round((scores.K / maxPossiblePoints) * 100) || 0
    };

    const sortedTypes = (Object.keys(percentages) as ("V" | "A" | "K")[])
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
  const dominanType = sortedTypes[0];

  // Progress Tracker
  const answeredCount = Object.keys(state.answers).length;
  const progressPercent = Math.round((answeredCount / GAYA_BELAJAR_QUESTIONS.length) * 100);

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
          Asesmen Gaya Belajar Siswa (Model VAK)
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Analisis gaya belajar dominan Anda (Visual, Auditori, atau Kinestetik) untuk adaptasi metode belajar paling asimilatif & efektif di asrama.
        </p>
      </div>

      {/* Progress & Quick Actions */}
      <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="w-full md:w-3/5 space-y-1">
          <div className="flex justify-between items-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider font-mono">
            <span>Kemajuan Kuisioner Gaya Belajar</span>
            <span className="text-purple-600 dark:text-purple-400">{answeredCount} dari {GAYA_BELAJAR_QUESTIONS.length} Terisi ({progressPercent}%)</span>
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
              className="px-3 py-2 text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all inline-flex items-center justify-center gap-1 cursor-pointer"
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
                <span className="text-sm font-bold text-purple-800 dark:text-purple-400 font-mono">Bagian {currentPage + 1} dari {totalPages}</span>
                <div className="flex gap-1.5">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={`w-7 h-7 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                        currentPage === i
                          ? "bg-purple-600 text-white"
                          : "bg-gray-150 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-250"
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
                Luar biasa, Anda telah merampungkan kuisioner 30 pertanyaan Gaya Belajar VAK. Hasil interpretasi grafik dan perbandingan tipe dominan dapat ditinjau langsung di panel kanan.
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
            <strong>Cara Membaca Visual-Auditori-Kinestetik:</strong> Dominasi diukur dalam satuan persentase. Tipe dengan persentase paling tinggi menggambarkan preferensi asimilasi kognitif utama Anda di ruang asrama dan kelas Sekolah Cendekia BAZNAS.
          </div>
        </div>

        {/* Output Panel: Bar Chart & Dominants */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/10 rounded-2xl p-6 border border-purple-100 dark:border-purple-900/20 flex flex-col justify-between">
            
            <div className="space-y-6">
              <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-xs font-mono border-b border-purple-200/50 dark:border-purple-900/30 pb-2 flex items-center gap-1.5">
                <BarChart2 className="h-4 w-4" /> GRAFIK PERSENTASE GAYA BELAJAR
              </h3>

              {/* Dynamic Progress Charts */}
              <div className="space-y-5 bg-white dark:bg-gray-950 rounded-xl p-5 border border-purple-100/50 dark:border-purple-900/20 shadow-sm">
                {(Object.keys(PROFILE_METADATA) as ("V" | "A" | "K")[]).map((key) => {
                  const meta = PROFILE_METADATA[key];
                  const IconComp = meta.icon;
                  const pct = percentages[key];
                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5 font-sans">
                          <IconComp className="h-4 w-4 text-purple-600" />
                          {key === "V" ? "Visual (V)" : key === "A" ? "Auditori (A)" : "Kinestetik (K)"}
                        </span>
                        <span className="font-mono font-bold text-purple-650">{pct}%</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-800 h-3 rounded-full overflow-hidden">
                        <div className={`${meta.barColor} h-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Top Dominant Category */}
              <div className="space-y-4">
                <div className="text-xs font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wider">
                  Gaya Belajar Dominan Anda:
                </div>

                {answeredCount < 5 ? (
                  <div className="text-xs text-gray-450 bg-white/50 dark:bg-gray-900/30 p-4 rounded-xl italic">
                    Lengkapi kuisioner minimal 5 pertanyaan untuk menampilkan asimilasi akurat dominasi gaya belajar.
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-white dark:bg-gray-950 rounded-xl p-4 border border-purple-100 dark:border-purple-900/30 space-y-2.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-gray-950 dark:text-white flex items-center gap-1.5 font-sans">
                          {React.createElement(dominanType.icon, { className: "h-5 w-5 text-purple-650" })}
                          {dominanType.name}
                        </span>
                        <span className="font-mono bg-purple-50 dark:bg-purple-950/20 px-2 py-0.5 rounded text-[10px] font-extrabold text-purple-700 dark:text-purple-400">
                          {dominanType.percentage}% Cocok
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed font-sans">{dominanType.desc}</p>
                    </div>
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
