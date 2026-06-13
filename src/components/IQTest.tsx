/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { IQTestState } from "../types";
import { IQ_QUESTIONS } from "../questions";
import { AlarmClock, BrainCircuit, Play, Grid, ShieldAlert, Sparkles, RefreshCw, Layers } from "lucide-react";

interface IQTestProps {
  state: IQTestState;
  onChange: (state: IQTestState) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function IQTest({ state, onChange, onNext, onPrev }: IQTestProps) {
  const [activeQIndex, setActiveQIndex] = useState(0);
  const [filterCategory, setFilterCategory] = useState<"all" | "verbal" | "numerical" | "logical" | "spatial">("all");
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [localTimeLeft, setLocalTimeLeft] = useState(state.timeLeft);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const activeQuestion = IQ_QUESTIONS[activeQIndex];

  // Keep localTimeLeft in sync if parent resets or loads/restores from storage
  useEffect(() => {
    if (state.timeLeft === 3600 || Math.abs(state.timeLeft - localTimeLeft) > 10) {
      setLocalTimeLeft(state.timeLeft);
    }
  }, [state.timeLeft]);

  // Decoupled countdown timer logic running purely on local state
  useEffect(() => {
    if (isTimerRunning && !state.completed && localTimeLeft > 0) {
      timerRef.current = setInterval(() => {
        setLocalTimeLeft((prev) => {
          const nextTime = prev - 1;
          if (nextTime <= 0) {
            setIsTimerRunning(false);
            submitExam();
            return 0;
          }
          return nextTime;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, state.completed]);

  // Periodically save localTimeLeft to parent state (every 5 seconds) to prevent losing it on page refresh
  useEffect(() => {
    if (state.completed || !isTimerRunning) return;
    const interval = setInterval(() => {
      onChange({ ...state, timeLeft: localTimeLeft });
    }, 5000);
    return () => clearInterval(interval);
  }, [localTimeLeft, isTimerRunning, state.completed, onChange, state]);

  const handleStartExam = () => {
    setIsTimerRunning(true);
  };

  const handleOptionSelect = (qId: number, optionIndex: number) => {
    if (state.completed) return;
    
    // Auto start timer if selected an option
    if (!isTimerRunning) {
      setIsTimerRunning(true);
    }
    
    const nextAnswers = { ...state.answers, [qId]: optionIndex };
    // Immediately persist both answers and current timer state to prevent mismatch
    onChange({ ...state, answers: nextAnswers, timeLeft: localTimeLeft });

    // Auto advance to next question if not at the end
    if (activeQIndex < IQ_QUESTIONS.length - 1) {
      // Small timeout for visual confirmation feedback
      setTimeout(() => {
        setActiveQIndex(prev => prev + 1);
      }, 150);
    }
  };

  const submitExam = () => {
    setIsTimerRunning(false);
    
    // Calculate scores
    let verbalCount = 0;
    let numericalCount = 0;
    let logicalCount = 0;
    let spatialCount = 0;

    IQ_QUESTIONS.forEach(q => {
      const selected = state.answers[q.id];
      const isCorrect = selected === q.correctIndex;
      if (isCorrect) {
        if (q.category === "verbal") verbalCount++;
        else if (q.category === "numerical") numericalCount++;
        else if (q.category === "logical") logicalCount++;
        else if (q.category === "spatial") spatialCount++;
      }
    });

    const scoreTotal = verbalCount + numericalCount + logicalCount + spatialCount;
    
    // IQ Conversion Standard (80 questions. Range 80 - 145 IQ)
    // Formula: 80 + (Correct / 80) * 65.
    // Perfect 80/80 correct = 145. Excellent.
    const iqScore = Math.round(80 + (scoreTotal / 80) * 65);

    onChange({
      ...state,
      completed: true,
      timeLeft: localTimeLeft,
      scoreTotal,
      scores: {
        verbal: verbalCount,
        numerical: numericalCount,
        logical: logicalCount,
        spatial: spatialCount
      },
      iqScore
    });
  };

  const autofillSimulatedAnswers = () => {
    // Generate mock answers, mostly correct (resulting in a high IQ score)
    const simulatedAnswers: Record<number, number> = {};
    IQ_QUESTIONS.forEach(q => {
      // 80% chance of choosing correct answer, 20% random choice
      const isCorrectMock = Math.random() < 0.78;
      if (isCorrectMock) {
        simulatedAnswers[q.id] = q.correctIndex;
      } else {
        // choose another random index
        const wrongIndices = [0, 1, 2, 3].filter(i => i !== q.correctIndex);
        simulatedAnswers[q.id] = wrongIndices[Math.floor(Math.random() * wrongIndices.length)];
      }
    });

    // Directly populate and trigger computation
    let verbalCount = 0;
    let numericalCount = 0;
    let logicalCount = 0;
    let spatialCount = 0;

    IQ_QUESTIONS.forEach(q => {
      const selected = simulatedAnswers[q.id];
      const isCorrect = selected === q.correctIndex;
      if (isCorrect) {
        if (q.category === "verbal") verbalCount++;
        else if (q.category === "numerical") numericalCount++;
        else if (q.category === "logical") logicalCount++;
        else if (q.category === "spatial") spatialCount++;
      }
    });
    const scoreTotal = verbalCount + numericalCount + logicalCount + spatialCount;
    const iqScore = Math.round(80 + (scoreTotal / 80) * 65);

    onChange({
      answers: simulatedAnswers,
      completed: true,
      timeLeft: localTimeLeft,
      scoreTotal,
      scores: {
        verbal: verbalCount,
        numerical: numericalCount,
        logical: logicalCount,
        spatial: spatialCount
      },
      iqScore
    });
  };

  const clearAnswers = () => {
    setLocalTimeLeft(3600);
    onChange({
      answers: {},
      completed: false,
      timeLeft: 3600,
      scores: { verbal: 0, numerical: 0, logical: 0, spatial: 0 },
      scoreTotal: 0,
      iqScore: 100
    });
    setActiveQIndex(0);
    setIsTimerRunning(false);
  };

  // Convert seconds to MM:SS
  const formatTime = (secs: number) => {
    const min = Math.floor(secs / 60);
    const sec = secs % 60;
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  // Filtration logic for navigator grid
  const filteredQuestions = IQ_QUESTIONS.filter(q => {
    if (filterCategory === "all") return true;
    return q.category === filterCategory;
  });

  const getIQDescription = (iq: number) => {
    if (iq >= 130) return { title: "Sangat Superior", percentil: "~98th", desc: "Anda menunjukkan daya kognitif verbal-numerik yang luar biasa. Sangat lincah mencerna informasi kompleks, berpikir abstrak, dan memecahkan teka-teki logika tingkat lanjut." };
    if (iq >= 120) return { title: "Superior", percentil: "~91st", desc: "Anda memiliki kapabilitas penalaran kritis, logis, dan aritmetika yang berada jauh di atas rerata statistik populasi remaja seusia Anda." };
    if (iq >= 110) return { title: "Di Atas Rata-rata", percentil: "~75th", desc: "Kecerdasan intelektual penalar Anda unggul dan sehat. Sangat mumpuni untuk berekspansi di jurusan teknik eksak, sains mutakhir, mau pun kedokteran." };
    if (iq >= 100) return { title: "Rata-rata", percentil: "~50th", desc: "Kecerdasan intelektual Anda stabil, andal, dan sesuai dengan standar performa siswa SMA nasional se-Indonesia." };
    if (iq >= 85) return { title: "Rata-rata Bawah", percentil: "~25th", desc: "Performa kognitif penalar Anda berada di batas tengah bawah. Memerlukan pelatihan kognitif atau pengerjaan soal latihan SNBT intensif." };
    return { title: "Rendah", percentil: "~9th", desc: "Daya tangkap kognitif simulasi Anda memerlukan bimbingan tambahan dan pelatihan stimulasi logika terpadu secara konsisten." };
  };

  const iqResult = getIQDescription(state.iqScore);

  const answeredCount = Object.keys(state.answers).length;
  const progressPercent = Math.round((answeredCount / 80) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-100 dark:border-gray-850 pb-5">
        <h2 className="text-2xl font-bold font-sans text-gray-900 dark:text-white flex items-center gap-2">
          <BrainCircuit className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          Simulasi Tes IQ Standard Kognitif
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Latihan pengujian kapabilitas intelektual siswa SMA meliputi: Verbal, Numerik, Logikal, dan Penalaran Spasial (Mental Rotation).
        </p>
      </div>

      {/* Top action bar */}
      <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Timer countdown and Progress */}
        <div className="flex items-center gap-6 w-full md:w-auto">
          <div className="flex items-center gap-2.5 bg-rose-50 dark:bg-rose-950/20 px-4 py-2.5 rounded-xl border border-rose-100 dark:border-rose-900/30 text-rose-700 dark:text-rose-400">
            <AlarmClock className="h-5 w-5 animate-pulse" />
            <span className="font-mono text-xl font-bold tracking-wider">{formatTime(state.timeLeft)}</span>
          </div>

          <div className="space-y-1 flex-1 md:w-60">
            <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-widest font-mono">
              <span>Progres Jawaban</span>
              <span>{answeredCount}/80</span>
            </div>
            <div className="w-full bg-gray-200/50 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden">
              <div className="bg-purple-600 h-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>

        {/* Quick simulation action */}
        <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-end">
          {!state.completed && (
            <button
              onClick={autofillSimulatedAnswers}
              className="flex-1 md:flex-none px-4 py-2 text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950/20 dark:hover:bg-purple-900/30 dark:text-purple-400 font-bold rounded-xl border border-purple-100 dark:border-purple-900/40 transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Simulasi Selesaikan Cepat
            </button>
          )}

          {state.completed && (
            <button
              onClick={clearAnswers}
              className="px-3 py-2 text-xs text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all inline-flex items-center justify-center gap-1 cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" /> Ulangi Tes
            </button>
          )}
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main interactive panel */}
        <div className="lg:col-span-2 space-y-6">
          
          {!state.completed ? (
            
            // Exam taking view
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-150 dark:border-gray-850 overflow-hidden shadow-sm">
              
              {/* Category indicator card */}
              <div className="bg-purple-50/40 dark:bg-purple-950/20 px-6 py-4 border-b border-gray-150 dark:border-gray-850 flex justify-between items-center text-xs">
                <span className="font-bold text-ash-700 dark:text-gray-300 uppercase tracking-widest flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-purple-600" />
                  Rumpun Soal: {activeQuestion.category === "verbal" ? "Verbal Reasoning (Bahasa/Analogi)" : activeQuestion.category === "numerical" ? "Numerical Reasoning (Deret/Kuantitatif)" : activeQuestion.category === "logical" ? "Logical Reasoning (Premis/Silogisme)" : "Spatial Reasoning (Visual Spasial/Pola)"}
                </span>
                <span className="font-mono bg-purple-100 dark:bg-purple-900/55 dark:text-purple-300 text-purple-800 px-3 py-1 rounded-full font-bold">
                  Soal {activeQIndex + 1} dari 80
                </span>
              </div>

              {/* Timer Block overlay if pause */}
              {!isTimerRunning && answeredCount === 0 ? (
                <div className="p-8 text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-purple-50 text-purple-600 dark:bg-purple-950/30 rounded-full">
                    <Play className="h-8 w-8 text-purple-600 dark:text-purple-400 fill-purple-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-950 dark:text-white">Siap Untuk Memulai Simulasi?</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                    WAKTU ANDA 60 MENIT. Tes ini mensimulasikan penalaran verbal, kuantitatif, silogisme induktif/deduktif, dan mental-rotation spatial.
                  </p>
                  <button
                    onClick={handleStartExam}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl cursor-pointer text-sm shadow-md"
                  >
                    Mulai Ujian Sekarang
                  </button>
                </div>
              ) : (
                
                // Active Quiz Body
                <div className="p-6 md:p-8 space-y-6">
                  
                  {/* Question Prompt */}
                  <div className="space-y-4">
                    <p className="text-gray-900 dark:text-white font-semibold leading-7 md:text-base text-sm">
                      {activeQuestion.text}
                    </p>
                  </div>

                  {/* Multi options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {activeQuestion.options.map((option, i) => {
                      const isSelected = state.answers[activeQuestion.id] === i;
                      return (
                        <button
                          key={i}
                          onClick={() => handleOptionSelect(activeQuestion.id, i)}
                          className={`text-left p-4 rounded-xl border text-xs md:text-sm font-medium transition-all flex items-start gap-3 cursor-pointer ${
                            isSelected
                              ? "bg-purple-600 border-purple-600 text-white font-semibold shadow-md"
                              : "border-gray-200 bg-gray-50/50 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300 dark:hover:bg-gray-850"
                          }`}
                        >
                          <span className={`w-6 h-6 flex items-center justify-center rounded-lg border text-xs font-bold ${
                            isSelected
                              ? "bg-purple-700 text-white border-purple-500"
                              : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
                          }`}>
                            {["A", "B", "C", "D"][i]}
                          </span>
                          <span className="flex-1 mt-0.5 leading-5">{option}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Footer Back Forward Buttons */}
                  <div className="flex justify-between items-center border-t border-gray-150 dark:border-gray-850 pt-5 mt-8">
                    <button
                      onClick={() => setActiveQIndex(prev => Math.max(0, prev - 1))}
                      disabled={activeQIndex === 0}
                      className="px-4 py-2 border border-gray-150 dark:border-gray-800 text-gray-650 dark:text-gray-400 disabled:opacity-40 text-xs font-semibold rounded-xl hover:bg-gray-50"
                    >
                      Soal Sebelumnya
                    </button>
                    
                    {answeredCount >= 10 && (
                      <button
                        onClick={submitExam}
                        className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 font-bold text-white text-xs rounded-xl cursor-pointer"
                      >
                        Kirim Jawaban (Selesai)
                      </button>
                    )}

                    <button
                      onClick={() => setActiveQIndex(prev => Math.min(IQ_QUESTIONS.length - 1, prev + 1))}
                      disabled={activeQIndex === IQ_QUESTIONS.length - 1}
                      className="px-4 py-2 border border-purple-150 dark:border-purple-800 text-purple-700 dark:text-purple-400 disabled:opacity-40 text-xs font-semibold rounded-xl hover:bg-purple-50"
                    >
                      Soal Berikutnya
                    </button>
                  </div>

                </div>
              )}

            </div>
          ) : (
            
            <div className="bg-white dark:bg-gray-900 p-6 md:p-8 rounded-2xl border border-purple-100 dark:border-purple-900/30 text-left space-y-8 shadow-md">
              
              {/* Header result */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-gray-100 dark:border-gray-800 pb-6">
                <div className="space-y-2">
                  <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400 font-mono tracking-widest">
                    <BrainCircuit className="h-4 w-4" />
                    Laporan Hasil Psikometrik Kognitif (Psikogram)
                  </span>
                  <h3 className="text-xl font-extrabold text-gray-950 dark:text-white">Hasil Tes IQ Intelektual Terstandar</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Berdasarkan norma populasi siswa sekolah menengah atas di Indonesia dengan standardisasi model deviasi.
                  </p>
                </div>
                <div className="flex items-center gap-4 bg-purple-50/50 dark:bg-purple-950/20 px-5 py-3 rounded-2xl border border-purple-150/40">
                  <div className="text-center">
                    <span className="block text-[9px] uppercase font-bold text-purple-555 font-mono tracking-wider">Skor IQ (FSIQ)</span>
                    <span className="text-4xl font-extrabold text-purple-700 dark:text-purple-400 leading-none">{state.iqScore}</span>
                  </div>
                  <div className="border-l border-purple-200/50 h-10" />
                  <div>
                    <span className="block text-[9px] uppercase font-bold text-gray-400 font-mono tracking-wider">Klasifikasi</span>
                    <span className="text-xs font-bold text-gray-800 dark:text-purple-305 bg-purple-100/40 dark:bg-purple-900/40 px-2.5 py-0.5 rounded-full block mt-0.5">{iqResult.title}</span>
                  </div>
                </div>
              </div>

              {/* Psychogram - Horizontal Standard Score profiles with Mean 100 SD 15 */}
              <div className="space-y-6">
                <h4 className="font-bold text-xs uppercase text-gray-400 tracking-wider font-mono">
                  PROFIL COGNITIVE PSYCHOGRAM (Standard Score, Mean=100, SD=15)
                </h4>
                
                <div className="space-y-4">
                  {[
                    { 
                      label: "Verbal Comprehension Index (VCI)", 
                      raw: state.scores.verbal, 
                      stdScore: Math.round(70 + (state.scores.verbal / 20) * 70),
                      desc: "Kemampuan analogi, penguasaan jangkauan kosakata, dan formasi konsep verbal.",
                      color: "bg-blue-600",
                      barColor: "bg-blue-100 dark:bg-blue-950/45"
                    },
                    { 
                      label: "Quantitative Reasoning Index (QRI)", 
                      raw: state.scores.numerical, 
                      stdScore: Math.round(70 + (state.scores.numerical / 20) * 70),
                      desc: "Kecepatan manipulasi angka, kelenturan berhitung logis, dan kognitif deret matematika.",
                      color: "bg-indigo-600",
                      barColor: "bg-indigo-100 dark:bg-indigo-950/45"
                    },
                    { 
                      label: "Working Memory / Logic Index (WMI)", 
                      raw: state.scores.logical, 
                      stdScore: Math.round(70 + (state.scores.logical / 20) * 70),
                      desc: "Penalaran silogisme deduktif, asosiasi premis, dan pemeliharaan fokus sekuensial.",
                      color: "bg-purple-600",
                      barColor: "bg-purple-100 dark:bg-purple-950/45"
                    },
                    { 
                      label: "Visual-Spatial Reasoning Index (PRI)", 
                      raw: state.scores.spatial, 
                      stdScore: Math.round(70 + (state.scores.spatial / 20) * 70),
                      desc: "Organisasi visual-spatial, rotasi mental grafis, dan identifikasi pencocokan pola 3D.",
                      color: "bg-pink-600",
                      barColor: "bg-pink-100 dark:bg-pink-950/45"
                    }
                  ].map((indexItem, key) => {
                    const mappedPercent = Math.min(100, Math.max(10, Math.round(((indexItem.stdScore - 70) / 70) * 100)));
                    let levelLabel = "Rata-rata";
                    if (indexItem.stdScore >= 130) levelLabel = "Sangat Superior";
                    else if (indexItem.stdScore >= 120) levelLabel = "Superior";
                    else if (indexItem.stdScore >= 110) levelLabel = "Tinggi";
                    else if (indexItem.stdScore >= 90) levelLabel = "Rata-rata";
                    else levelLabel = "Rata-rata Bawah";

                    return (
                      <div key={key} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/20 dark:bg-gray-950/20 space-y-2.5">
                        <div className="flex justify-between items-start text-xs">
                          <div>
                            <strong className="text-gray-900 dark:text-white block font-semibold">{indexItem.label}</strong>
                            <span className="text-[11px] text-gray-450 leading-relaxed block mt-0.5">{indexItem.desc}</span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs font-mono font-bold text-purple-700 dark:text-purple-400">Score Standar: {indexItem.stdScore}</span>
                            <span className="block text-[10px] text-gray-400 font-mono mt-0.5">Raw: {indexItem.raw}/20 • {levelLabel}</span>
                          </div>
                        </div>
                        
                        {/* Custom Psychogram score scale slider */}
                        <div className="space-y-1">
                          <div className="w-full bg-gray-100 dark:bg-gray-850 h-3.5 rounded-lg overflow-hidden relative flex">
                            {/* Standard deviations markers in background */}
                            <div className="absolute left-[-2px] border-r border-gray-200/50 dark:border-gray-800/40 h-full w-[28.5%]" title="Rendah (70-90)" />
                            <div className="absolute left-[28.5%] border-r border-gray-200/50 dark:border-gray-850/40 h-full w-[28.5%]" title="Rata-rata (90-110)" />
                            <div className="absolute left-[57%] border-r border-gray-200/50 dark:border-gray-850/40 h-full w-[14.3%]" title="Rata-rata Tinggi (110-120)" />
                            <div className="absolute left-[71.3%] border-r border-gray-200/50 dark:border-gray-850/40 h-full w-[14.3%]" title="Superior (120-130)" />
                            
                            <div 
                              className={`h-full ${indexItem.color} transition-all duration-500 rounded-lg`} 
                              style={{ width: `${mappedPercent}%` }} 
                            />
                          </div>
                          <div className="flex justify-between text-[9px] font-mono font-bold text-gray-400 uppercase px-0.5">
                            <span>Sangat Rendah (70)</span>
                            <span>Rata-Rata (100)</span>
                            <span>Super (140)</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Counselor Feedback & Learning Strategies */}
              <div className="bg-purple-50/25 dark:bg-purple-950/10 p-5 rounded-2xl border border-purple-100/55 dark:border-purple-900/20 text-xs space-y-3.5">
                <h4 className="font-mono text-[10px] uppercase font-bold text-purple-700 dark:text-purple-400 tracking-wider flex items-center gap-1.5 border-b border-purple-100 dark:border-purple-950 pb-2">
                  <Sparkles className="h-3.5 w-3.5 animate-bounce" />
                  Rekomendasi Gaya Belajar Adaptif Sesuai Profil IQ
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1 bg-white/70 dark:bg-gray-950/45 p-3 rounded-xl border border-gray-100 dark:border-gray-850">
                    <strong className="text-gray-900 dark:text-white block font-medium">Kanal Potensi Unggul:</strong>
                    <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-[11px]">
                      {state.scores.verbal >= state.scores.numerical && state.scores.verbal >= state.scores.spatial ? 
                        "Kemampuan Verbal Anda menonjol. Paling efektif menyerap info dengan metode diskusi analitis, debat logis, pembacaan literature, dan penulisan artikel ilmiah tematik." :
                        state.scores.spatial >= state.scores.numerical ?
                        "Kekuatan Logika & Spasial Anda dominan. Optimal menyerap ilmu menggunakan media visualgrafis penuh, pemetaan konsep (mind mapping), sketsa diagram, dan struktur spasial 3D." :
                        "Fokus Numerasi-Logikal Anda adalah akselerator utama. Gaya belajar paling serasi berupa problem solving kuantitatif terstruktur, matematika terapan, coding, dan analisis statistik data presisi."
                      }
                    </p>
                  </div>
                  <div className="space-y-1 bg-white/70 dark:bg-gray-950/45 p-3 rounded-xl border border-gray-100 dark:border-gray-850">
                    <strong className="text-gray-900 dark:text-white block font-medium">Metode Akselerasi Rapor & SNBT:</strong>
                    <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-[11px]">
                      Hampirilah modul pembelajaran dengan asimilasi keterkaitan logis. Kurangi metode menghafal kering secara rote-learning, melainkan buat korelasi relasional antar bab teori materi kognitif agar memori jangka panjang terbentuk kokoh.
                    </p>
                  </div>
                </div>
              </div>

              {/* Diagnostic Interpretation box */}
              <div className="text-xs text-gray-650 dark:text-gray-350 leading-6 space-y-3 bg-white dark:bg-gray-950/15 p-4 rounded-xl border border-gray-100 dark:border-gray-850">
                <p>
                  <strong>Catatan Interpretasi Psikologi:</strong> Skor simulasi ini menempatkan Anda pada persentil kognitif <strong>{iqResult.percentil}</strong> se-angkatan siswa SMA nasional. {iqResult.desc}
                </p>
                <div className="flex justify-start items-center gap-1.5 text-[10px] text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wider font-mono">
                  <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                  <span>Ini hanyalah simulasi pemetaan intelektual kognitif, bukan pengganti tes IQ Psikolog Profesional berlisensi.</span>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Right side navigation grid navigator */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-150 dark:border-gray-850 p-5 space-y-4 shadow-sm">
            
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-850 pb-2.5">
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5 font-mono">
                <Grid className="h-4 w-4 text-purple-600" />
                Navigasi Soal Grid
              </h3>
              
              {/* Category filtration pill */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as any)}
                className="text-[10px] uppercase font-bold text-purple-700 bg-purple-50 dark:bg-gray-950 dark:text-purple-400 outline-none px-2 py-1 rounded"
              >
                <option value="all">Semua (80)</option>
                <option value="verbal">Verbal (20)</option>
                <option value="numerical">Numerik (20)</option>
                <option value="logical">Logis (20)</option>
                <option value="spatial">Spasial (20)</option>
              </select>
            </div>

            {/* Grid display */}
            <div className="grid grid-cols-5 gap-1.5 max-h-75 overflow-y-auto pr-1">
              {filteredQuestions.map((q) => {
                const questionIndexInMaster = IQ_QUESTIONS.findIndex(master => master.id === q.id);
                const hasAnswered = state.answers[q.id] !== undefined;
                const isActive = activeQIndex === questionIndexInMaster;

                let stateColor = "bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-600 dark:bg-gray-950 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-850";
                
                if (hasAnswered) {
                  stateColor = "bg-green-100 dark:bg-green-950 border-green-300 text-green-800 dark:text-green-300 font-semibold";
                }
                
                if (isActive) {
                  stateColor = "bg-purple-600 border-purple-600 text-white font-extrabold shadow-sm scale-105 duration-100";
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      if (!state.completed) {
                        setActiveQIndex(questionIndexInMaster);
                      }
                    }}
                    disabled={state.completed}
                    className={`h-9 text-xs rounded-lg border flex items-center justify-center transition-all cursor-pointer ${stateColor}`}
                    title={`Soal ${questionIndexInMaster + 1} (${q.category})`}
                  >
                    {questionIndexInMaster + 1}
                  </button>
                );
              })}
            </div>

            {/* Key Indicator labels */}
            <div className="flex gap-4 justify-center text-[10px] font-semibold font-mono border-t border-gray-50 dark:border-gray-850 pt-3">
              <div className="flex items-center gap-1 text-gray-450">
                <span className="w-3 h-3 rounded bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 block" />
                <span>Belum</span>
              </div>
              <div className="flex items-center gap-1 text-green-700">
                <span className="w-3 h-3 rounded bg-green-100 border border-green-300 block" />
                <span>Terisi</span>
              </div>
              <div className="flex items-center gap-1 text-purple-600">
                <span className="w-3 h-3 rounded bg-purple-600 border border-purple-600 block" />
                <span>Aktif</span>
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
