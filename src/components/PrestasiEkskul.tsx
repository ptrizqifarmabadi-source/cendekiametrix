/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { PrestasiEkskulState } from "../types";
import { 
  Award, 
  Compass, 
  Trophy, 
  Plus, 
  Minus, 
  ThumbsUp, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Flame, 
  User, 
  HelpCircle,
  GraduationCap,
  BookOpen,
  Music,
  Activity,
  Heart,
  Briefcase
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PrestasiEkskulProps {
  state: PrestasiEkskulState;
  onChange: (state: PrestasiEkskulState) => void;
  onNext: () => void;
  onPrev: () => void;
  jenjang?: "SMP" | "SMA";
}

// 12 High-fidelity Scenario Questions for SMP Extracurricular Diagnostics
const SMP_DIAGNOSTIC_QUESTIONS = [
  {
    id: 1,
    text: "Ketika hari Sabtu tiba dan asrama memberikan waktu luang untuk pengembangan diri, apa aktivitas yang paling membuatmu bersemangat?",
    options: [
      { id: 1, domain: "ScienceTech", text: "Mencoba membongkar barang elektronik rusak, atau membaca buku ensiklopedia penemuan sains terbaru.", ekskul: ["robotik", "kir"] },
      { id: 2, domain: "Sports", text: "Langsung menuju lapangan untuk bermain futsal, basket, atau berlatih fisik bersama teman-teman asrama.", ekskul: ["futsal", "basket", "silat", "petanque"] },
      { id: 3, domain: "Leadership", text: "Mengikuti latihan baris-berbaris pramuka, paskibraka, atau ikut membantu mengorganisasi kebersihan asrama.", ekskul: ["pramuka", "paskibra", "pmr"] },
      { id: 4, domain: "ArtsMusic", text: "Menulis puisi/cerita pendek, menggambar sketsa kaligrafi, atau melatih harmonisasi vokal menyanyi.", ekskul: ["seni", "musik"] },
    ]
  },
  {
    id: 2,
    text: "Saat sekolah mengadakan pameran besar atau pentas seni, peran apa yang paling ingin kamu ambil?",
    options: [
      { id: 1, domain: "ScienceTech", text: "Menampilkan demo rakitan robot cerdas, eksperimen reaksi kimia, atau program buatan sendiri.", ekskul: ["robotik", "kir"] },
      { id: 2, domain: "Sports", text: "Mewakili kelas dalam uji tanding olahraga persahabatan antar-asrama atau demonstrasi seni bela diri jagoan.", ekskul: ["futsal", "basket", "silat", "petanque"] },
      { id: 3, domain: "Leadership", text: "Menjadi ketua panitia koordinasi acara, bersiaga menjaga pos medis Pertolongan Pertama PMR, atau pengatur ketertiban.", ekskul: ["pramuka", "paskibra", "pmr"] },
      { id: 4, domain: "ArtsMusic", text: "Mengisi stan galeri pameran lukisan kriya kraf, menyanyi di panggung utama, atau mengiringi musik akustik.", ekskul: ["seni", "musik"] },
    ]
  },
  {
    id: 3,
    text: "Bagaimana cara terbaikmu dalam menyelesaikan suatu masalah sulit yang sedang kamu hadapi?",
    options: [
      { id: 1, domain: "ScienceTech", text: "Menganalisis penyebabnya secara logis, mencari fakta ilmiah pendukung, serta merancang solusi sistematis.", ekskul: ["robotik", "kir"] },
      { id: 2, domain: "Sports", text: "Menghadapinya secara spontan dengan energi penuh, melatih ketahanan fisik di lapangan, dan mental baja pantang menyerah.", ekskul: ["futsal", "basket", "silat", "petanque"] },
      { id: 3, domain: "Leadership", text: "Mendiskusikannya bersama rekan satu tim, membagi beban tugas secara adil, serta memandu kelompok sampai tuntas.", ekskul: ["pramuka", "paskibra", "pmr"] },
      { id: 4, domain: "ArtsMusic", text: "Mencari inspirasi kreatif lewat ketenangan batin, mengekspresikannya dalam bentuk lukisan, tulisan, atau senandung nada.", ekskul: ["seni", "musik"] },
    ]
  },
  {
    id: 4,
    text: "Tokoh dunia atau pahlawan sejarah seperti apa yang paling kamu kagumi perjuangannya?",
    options: [
      { id: 1, domain: "ScienceTech", text: "BJ Habibie atau Al-Khawarizmi yang meluncurkan teori penerbangan kedirgantaraan & perhitungan algoritma matematika.", ekskul: ["robotik", "kir"] },
      { id: 2, domain: "Sports", text: "Atlet profesional berprestasi tinggi yang gigih disiplin berlatih keras siang malam demi mengibarkan bendera merah putih.", ekskul: ["futsal", "basket", "silat", "petanque"] },
      { id: 3, domain: "Leadership", text: "Jenderal pembuat taktik baris-berbaris yang karismatik, atau tokoh kemandirian yang berkorban mendirikan organisasi sosial.", ekskul: ["pramuka", "paskibra", "pmr"] },
      { id: 4, domain: "ArtsMusic", text: "Sastrawan puitis penyejuk jiwa, pelukis kaligrafi legendaris, atau maestro penggubah simfoni nada yang abadi sepanjang masa.", ekskul: ["seni", "musik"] },
    ]
  },
  {
    id: 5,
    text: "Saat melihat sebuah gawai (gadget) canggih tipe terbaru, hal pertama yang terlintas di benak pikiranmu adalah:",
    options: [
      { id: 1, domain: "ScienceTech", text: "Bagaimana cara kerja sirkuit mikrokontroler di dalamnya, serta apa bahasa pemrograman pengatur aplikasinya.", ekskul: ["robotik", "kir"] },
      { id: 2, domain: "Sports", text: "Apakah gawai ini memiliki fitur kebugaran mengukur detak jantung, jumlah langkah meter, atau pembakar kalori saat berolahraga.", ekskul: ["futsal", "basket", "silat", "petanque"] },
      { id: 3, domain: "Leadership", text: "Bagaimana cara memaksimalkan jaringan koneksi gawai ini untuk memimpin gerakan kepanduan asrama atau kesiswaan.", ekskul: ["pramuka", "paskibra", "pmr"] },
      { id: 4, domain: "ArtsMusic", text: "Keindahan lekuk desain casing, resolusi gradasi warna layar, serta kualitas audio akustik dalam memutar vokal.", ekskul: ["seni", "musik"] },
    ]
  },
  {
    id: 6,
    text: "Ketika diajak berkegiatan di alam bebas hutan Bogor dalam acara kemah asrama, kamu merasa paling tertarik pada:",
    options: [
      { id: 1, domain: "ScienceTech", text: "Mengamati keanekaragaman hayati flora/fauna lokal, klasifikasi jenis tanah Bogor, atau meneropong pola rasi bintang langit.", ekskul: ["robotik", "kir"] },
      { id: 2, domain: "Sports", text: "Menjelajah rute pendakian terjal (hiking), melompati batuan sungai, serta menguji ketangkasan fisik di pos-pos rintangan.", ekskul: ["futsal", "basket", "silat", "petanque"] },
      { id: 3, domain: "Leadership", text: "Membangun tenda regu memakai rapi tali simpul pramuka, memimpin koordinasi ronda asrama, atau sigap menolong luka kawan.", ekskul: ["pramuka", "paskibra", "pmr"] },
      { id: 4, domain: "ArtsMusic", text: "Memotret lanskap alam estetik, menyanyikan lagu riang gembira melingkari bara api unggun, atau memahat kriya kayu unik.", ekskul: ["seni", "musik"] },
    ]
  },
  {
    id: 7,
    text: "Andai kelasmu memenangkan dana hadiah kesiswaan, fasilitas penunjang baru apa yang paling ingin kamu usulkan?",
    options: [
      { id: 1, domain: "ScienceTech", text: "Kit Arduino robotika pemrograman, mikroskop digital modern, atau buku komik ensiklopedia eksperimen sains.", ekskul: ["robotik", "kir"] },
      { id: 2, domain: "Sports", text: "Gawang futsal kokoh, papan pantul basket berserat kaca, atau bola besi standard olahraga lempar Petanque kesiswaan.", ekskul: ["futsal", "basket", "silat", "petanque"] },
      { id: 3, domain: "Leadership", text: "Matras lipat tandu darurat PMR, sabuk ikat baris-berbaris paskibraka, atau kompor gas portable milik regu kemah.", ekskul: ["pramuka", "paskibra", "pmr"] },
      { id: 4, domain: "ArtsMusic", text: "Keyboard elektronik kriya musik, kanvas cat lukis minyak berukuran besar, atau pengeras suara vokal asrama.", ekskul: ["seni", "musik"] },
    ]
  },
  {
    id: 8,
    text: "Dalam pengerjaan tugas proyek kelompok sekolah, rekan-rekan kelas sering mengenal dirimu sebagai:",
    options: [
      { id: 1, domain: "ScienceTech", text: "Pemikir teoretis kritis yang menyusun karya tulis akurat berbasis riset data fakta tepercaya.", ekskul: ["robotik", "kir"] },
      { id: 2, domain: "Sports", text: "Anggota tim yang dinamis, bergerak gesit menyelesaikan masalah teknis lapangan tanpa banyak teori bertele-tele.", ekskul: ["futsal", "basket", "silat", "petanque"] },
      { id: 3, domain: "Leadership", text: "Pemimpin musyawarah kelompok yang handal membagi tugas secara merata serta memediasi perselisihan opsi kawan.", ekskul: ["pramuka", "paskibra", "pmr"] },
      { id: 4, domain: "ArtsMusic", text: "Perancang ide kreatif estetis yang mempercantik tampilan slide visual presentasi atau menambahkan sentuhan artistik karya.", ekskul: ["seni", "musik"] },
    ]
  },
  {
    id: 9,
    text: "Ajang kompetisi antarpelajar daerah/nasional mana yang paling ingin kamu ikuti jika didelegasikan sekolah?",
    options: [
      { id: 1, domain: "ScienceTech", text: "Olimpiade Sains (OSN) Fisika/Matematika, atau turnamen robot cerdas pemilah sampah otomatis tingkat nasional.", ekskul: ["robotik", "kir", "klub_olimpiade"] },
      { id: 2, domain: "Sports", text: "Pekan Olahraga Pelajar Daerah (Popda) futsal, persahabatan basket, tanding pencak silat, atau kejuaraan taktis suku Petanque.", ekskul: ["futsal", "basket", "silat", "petanque"] },
      { id: 3, domain: "Leadership", text: "Lomba Ketangkasan Baris Berbaris (LKBB) kepemimpinan bela negara, atau Jambore Bakti sosial kemanusiaan kepanduan.", ekskul: ["pramuka", "paskibra", "pmr"] },
      { id: 4, domain: "ArtsMusic", text: "Festival Seni FLS2N cipta lagu religi islami, paduan suara kesiswaan, atau melukis seni lukis kaligrafi hiasan dinding.", ekskul: ["seni", "musik"] },
    ]
  },
  {
    id: 10,
    text: "Untuk mempererat tali persaudaraan antar santri asrama, kegiatan olahraga/refleksi bersama mana yang paling kamu sukai?",
    options: [
      { id: 1, domain: "ScienceTech", text: "Bermain catur asah pikiran, kuis logika cepat tepat, atau membedah artikel astronomi teknologi masa depan.", ekskul: ["robotik", "kir"] },
      { id: 2, domain: "Sports", text: "Berlari maraton sore memutari ladang hijau desa Cemplang, tanding sepak bola lumpur di kala hujan, atau tanding basket.", ekskul: ["futsal", "basket", "silat", "petanque"] },
      { id: 3, domain: "Leadership", text: "Mengikuti forum latihan kepemimpinan santri utama, atau piket sukarela menguji tensi kesehatan di posko pengobatan asrama.", ekskul: ["pramuka", "paskibra", "pmr"] },
      { id: 4, domain: "ArtsMusic", text: "Mengadakan pentas panggung rebana hadroh bersuara merdu, mencabik gitar akustik santai, atau menggambar mural motivasi asrama.", ekskul: ["seni", "musik"] },
    ]
  },
  {
    id: 11,
    text: "Semboyan prinsip atau motto hidup mana di bawah ini yang paling mewakili visi pribadimu?",
    options: [
      { id: 1, domain: "ScienceTech", text: "'Ilmu pengetahuan logis dan kecanggihan teknologi adalah kunci peradaban masa depan cerdas yang unggul.'", ekskul: ["robotik", "kir"] },
      { id: 2, domain: "Sports", text: "'Di dalam tubuh yang bugar, terlatih, dan kuat, terdapat jiwa pejuang pantang menyerah yang tak terkalahkan.'", ekskul: ["futsal", "basket", "silat", "petanque"] },
      { id: 3, domain: "Leadership", text: "'Sebaik-baik manusia di asrama adalah pemimpin yang paling mengayomi kawan dan mendatangkan maslahat sosial.'", ekskul: ["pramuka", "paskibra", "pmr"] },
      { id: 4, domain: "ArtsMusic", text: "'Kehidupan di asrama tanpa goresan imajinasi kreatif dan lantunan suara harmoni bagaikan bumi tanpa pendar pelangi.'", ekskul: ["seni", "musik"] },
    ]
  },
  {
    id: 12,
    text: "Bila kamu diberikan selembar kanvas putih polos dan cat minyak, apa mahakarya yang paling ingin kamu hasilkan?",
    options: [
      { id: 1, domain: "ScienceTech", text: "Gambar skema sirkuit kelistrikan, formula fisika gravitasi, atau grafik alur kendali kecerdasan buatan komputer.", ekskul: ["robotik", "kir"] },
      { id: 2, domain: "Sports", text: "Rancangan tabel target capaian kebugaran fisik harian, taktik skema lini pertahanan tim futsal, atau kalender latihan atlet.", ekskul: ["futsal", "basket", "silat", "petanque"] },
      { id: 3, domain: "Leadership", text: "Struktur bagan pengurus kabinet kedisiplinan asrama baris-berbaris lengkap dengan kode etik kesiswaan yang adil.", ekskul: ["pramuka", "paskibra", "pmr"] },
      { id: 4, domain: "ArtsMusic", text: "Lukisan lanskap indah Sekolah Cendekia BAZNAS Bogor berlatar awan pegunungan syahdu atau rangkaian kaligrafi islami.", ekskul: ["seni", "musik"] },
    ]
  }
];

export default function PrestasiEkskul({ state, onChange, onNext, onPrev, jenjang }: PrestasiEkskulProps) {
  
  const [smpQuestionIndex, setSmpQuestionIndex] = useState(0);

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

  // Handles answering the SMP Diagnostic test
  const handleSmpAnswer = (qId: number, chosenOptionId: number) => {
    const smpAnswers = state.smpAnswers || {};
    const nextAnswers = { ...smpAnswers, [qId]: chosenOptionId };
    
    // Check completion status
    const isCompleted = SMP_DIAGNOSTIC_QUESTIONS.every(q => nextAnswers[q.id] !== undefined);
    
    onChange({
      ...state,
      smpAnswers: nextAnswers,
      smpCompleted: isCompleted
    });

    // Advance index smoothly if not last question
    if (smpQuestionIndex < SMP_DIAGNOSTIC_QUESTIONS.length - 1) {
      setSmpQuestionIndex(prev => prev + 1);
    }
  };

  // Skip wizard and auto-populate randomized realistic responses for fast developer/testing validation
  const handleAutofillSmpQuiz = () => {
    const simulatedAnswers: Record<number, number> = {};
    SMP_DIAGNOSTIC_QUESTIONS.forEach(q => {
      // Pick a semi-weighted mock answer to create realistic preferences
      const weightedRoll = Math.random();
      if (weightedRoll < 0.35) {
        simulatedAnswers[q.id] = 1; // ScienceTech
      } else if (weightedRoll < 0.60) {
        simulatedAnswers[q.id] = 3; // Leadership
      } else if (weightedRoll < 0.85) {
        simulatedAnswers[q.id] = 2; // Sports
      } else {
        simulatedAnswers[q.id] = 4; // ArtsMusic
      }
    });

    onChange({
      ...state,
      smpAnswers: simulatedAnswers,
      smpCompleted: true
    });
    setSmpQuestionIndex(SMP_DIAGNOSTIC_QUESTIONS.length - 1);
  };

  const handleResetSmpQuiz = () => {
    onChange({
      ...state,
      smpAnswers: {},
      smpCompleted: false
    });
    setSmpQuestionIndex(0);
  };

  // Calculate scores and percentages for the SMP Diagnostic test
  const getSmpDiagnosticAnalysis = () => {
    const smpAnswers = state.smpAnswers || {};
    const scores = {
      ScienceTech: 0,
      Sports: 0,
      Leadership: 0,
      ArtsMusic: 0
    };

    SMP_DIAGNOSTIC_QUESTIONS.forEach(q => {
      const chosenOptId = smpAnswers[q.id];
      if (chosenOptId !== undefined) {
        const option = q.options.find(opt => opt.id === chosenOptId);
        if (option) {
          scores[option.domain as keyof typeof scores]++;
        }
      }
    });

    const totalAnswered = Object.keys(smpAnswers).length;
    const divisor = totalAnswered || 12; // Out of total actual answered or maximum 12 questions

    const percentages = {
      ScienceTech: Math.round((scores.ScienceTech / divisor) * 100),
      Sports: Math.round((scores.Sports / divisor) * 100),
      Leadership: Math.round((scores.Leadership / divisor) * 100),
      ArtsMusic: Math.round((scores.ArtsMusic / divisor) * 100)
    };

    const domainMetadata = {
      ScienceTech: {
        name: "Sains & Teknologi",
        desc: "Memiliki ketertarikan mendalam pada logika kritis, pemrograman komputer, rekayasa mesin, pemecahan teka-teki taktis, serta riset sains eksakta.",
        ekskul: ["robotik", "kir", "klub_olimpiade"],
        ekskulLabels: ["Klub Robotika & Pemrograman", "Karya Ilmiah Remaja (KIR)", "Klub Bidang Studi / Fokus Olimpiade Sains (OSN)"],
        icon: BrainCircleIcon,
        color: "bg-blue-500",
        textColor: "text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-900/30",
        bgColor: "bg-blue-50/55 dark:bg-blue-950/20"
      },
      Sports: {
        name: "Olahraga & Ketangkasan Fisik",
        desc: "Memiliki kekuatan fisik, daya tahan stamina motorik, refleks gerak lincah, penguasaan bela diri asrama, serta sportivitas kerja sama tim kesiswaan.",
        ekskul: ["futsal", "basket", "silat", "petanque"],
        ekskulLabels: ["Klub Olahraga Futsal", "Klub Olahraga Basket", "Bela diri Merpati Putih / Silat", "Petanque (Sukan Olahraga Cendekia)"],
        icon: ActivityIcon,
        color: "bg-emerald-500",
        textColor: "text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/30",
        bgColor: "bg-emerald-50/55 dark:bg-emerald-950/20"
      },
      Leadership: {
        name: "Kepemimpinan & Organisasi Sosial",
        desc: "Berbakat tinggi memimpin baris-berbaris instruksi, ketangkasan medis kepanduan P3K asrama, manajemen organisasi, serta kepedulian bakti kemanusiaan.",
        ekskul: ["pramuka", "paskibra", "pmr"],
        ekskulLabels: ["Pramuka Inti / Ambalan", "Paskibraka Sekolah", "Palang Merah Remaja (PMR)"],
        icon: Compass,
        color: "bg-purple-500",
        textColor: "text-purple-600 dark:text-purple-400 border-purple-200/50 dark:border-purple-900/30",
        bgColor: "bg-purple-50/55 dark:bg-purple-950/20"
      },
      ArtsMusic: {
        name: "Seni Kreatif & Musik Ekpresif",
        desc: "Unggul mengekspresikan imajinasi visual lewat kriya tangan, kaligrafi huruf islami, mengolah harmonisasi keindahan vokal, serta harmonisasi musik rebana.",
        ekskul: ["seni", "musik"],
        ekskulLabels: ["Kreatif Seni Rupa / Kriya Visual", "Klub Musik & Paduan Suara"],
        icon: MusicIcon,
        color: "bg-rose-500",
        textColor: "text-rose-600 dark:text-rose-400 border-rose-200/50 dark:border-rose-900/30",
        bgColor: "bg-rose-50/55 dark:bg-rose-950/20"
      }
    };

    const sortedDomains = (Object.keys(percentages) as (keyof typeof percentages)[])
      .map(key => ({
        key,
        percentage: percentages[key],
        rawScore: scores[key],
        ...domainMetadata[key]
      }))
      .sort((a, b) => b.percentage - a.percentage);

    return { percentages, sortedDomains, scores };
  };

  const { percentages, sortedDomains, scores } = getSmpDiagnosticAnalysis();
  const topSmpDomain = sortedDomains[0];
  const answeredCount = Object.keys(state.smpAnswers || {}).length;
  const smpCompleted = state.smpCompleted || false;

  // Function to automatically add recommended extracurricular activities based on quiz results
  const handleAutoApplyRecommendedEkskul = (ekskulKeys: string[]) => {
    const list = [...state.ekskul];
    let newlyAdded = false;
    ekskulKeys.forEach(k => {
      if (!list.includes(k)) {
        list.push(k);
        newlyAdded = true;
      }
    });

    if (newlyAdded) {
      onChange({ ...state, ekskul: list });
      alert("Ekstrakurikuler rekomendasi kognitif Anda telah ditambahkan secara otomatis ke tabel pilihan kesukaan Anda di atas!");
    } else {
      alert("Seluruh ekstrakurikuler kognitif yang direkomendasikan hasil tes sudah tercentang di daftar Anda!");
    }
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

    // Final consolidated scoring: if SMP, combine 10% test compliance, 30% Breadth, 60% awards
    let totalScore = Math.round(baseEkskulScore * 0.35 + highestAchievementScore * 0.65);
    
    if (jenjang === "SMP" && smpCompleted) {
      // Diagnostic completion boosts/fine-tunes target final score
      totalScore = Math.min(100, Math.round(totalScore * 0.9 + 10)); 
    }

    // Recommendations Builder
    const rekomendasiPaths: string[] = [];
    const isSportsEkskulActive = state.ekskul.some(e => ["futsal", "basket", "silat", "petanque"].includes(e));
    const isScienceTechActive = state.ekskul.some(e => ["robotik", "kir", "klub_olimpiade"].includes(e));
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
    if (state.ekskul.includes("klub_olimpiade")) {
      rekomendasiPaths.push("Jalur Utama Kompetisi Sains Nasional (KSN / Olimpiade OSN)");
    }
    if (isArtsActive) {
      rekomendasiPaths.push("Beasiswa Bakat Seni & Desain Kreatif");
    }
    if (state.ekskul.includes("pramuka") || state.ekskul.includes("paskibra")) {
      rekomendasiPaths.push("Jalur Kepemimpinan Organisasi / Pramuka Ter Garuda");
    }

    if (jenjang === "SMP" && smpCompleted) {
      rekomendasiPaths.push(`Program Unggulan Ekskul: ${topSmpDomain.name}`);
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
    { value: "klub_olimpiade", label: "Klub Bidang Studi / Fokus Olimpiade Sains (OSN)" },
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
          {jenjang === "SMP" 
            ? "Mendiagnosis kognitif bakat minat ekstrakurikuler melalui simulasi interaktif & piagam kejuaraan siswa SMP Sekolah Cendekia BAZNAS."
            : "Menilai keaktifan organisasi kesiswaan di Sekolah Cendekia BAZNAS, partisipasi olahraga, seni, riset sains, serta piagam juara."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left pane: Survey & Interactive Diagnostics Quiz */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Part 1: Ekstrakurikuler Checkboxes (Survey) */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-850 space-y-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b border-gray-55 pb-3">
              <Compass className="h-4 w-4 text-amber-500" />
              1. Partisipasi Ekstrakurikuler Pilihan Anda
            </h3>
            
            <p className="text-xs text-gray-500 leading-relaxed">
              Centang ekstrakurikuler aktif yang Anda ikuti atau minati saat ini di Sekolah Cendekia BAZNAS (SCB).
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {EKSKUL_OPTIONS.map((opt) => {
                const checked = state.ekskul.includes(opt.value);
                const recommendedByQuiz = jenjang === "SMP" && smpCompleted && topSmpDomain.ekskul.includes(opt.value);

                return (
                  <label
                    key={opt.value}
                    className={`flex flex-col p-3 rounded-xl border text-xs cursor-pointer transition-all relative ${
                      checked
                        ? "bg-amber-50/40 border-amber-300 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-300 font-semibold"
                        : "border-gray-150 bg-gray-55/10 text-gray-650 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400 hover:bg-gray-100/50"
                    } ${recommendedByQuiz ? "ring-2 ring-blue-400 dark:ring-blue-500/50" : ""}`}
                  >
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleEkskulCheck(opt.value)}
                        className="mt-0.5 mr-2 rounded text-amber-605 focus:ring-amber-500 cursor-pointer"
                      />
                      <span className="flex-1 select-none pr-4">{opt.label}</span>
                    </div>

                    {recommendedByQuiz && (
                      <span className="absolute bottom-1 right-2 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold px-1.5 py-0.5 rounded text-[8px] tracking-wide animate-pulse">
                        Rekomendasi Tes
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Part 2: Interactive Diagnostic Quiz - ONLY for SMP students as requested */}
          {jenjang === "SMP" && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-850 space-y-4 shadow-sm relative">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-50 dark:border-gray-850 pb-3 gap-3">
                <div className="space-y-0.5">
                  <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <Flame className="h-4 w-4 text-blue-500 animate-pulse" />
                    2. Tes Diagnostik Minat & Bakat Ekskul (Interaktif)
                  </h3>
                  <p className="text-[11px] text-gray-450 dark:text-gray-450">
                    Skenario kognitif minat santri untuk melacak rumpun kemampuan kesiswaan terbaik Anda.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <button
                    onClick={handleAutofillSmpQuiz}
                    className="px-2.5 py-1.5 text-[10px] bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:hover:bg-blue-900/30 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                    title="Simulasi pengisian instan seluruh pertanyaan"
                  >
                    <Sparkles className="h-3 w-3" />
                    Simulasi Tes
                  </button>
                  {answeredCount > 0 && (
                    <button
                      onClick={handleResetSmpQuiz}
                      className="px-2 py-1.5 text-[10px] text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/25 rounded-md transition-all flex items-center gap-0.5 cursor-pointer"
                      title="Ulangi ujian dari awal"
                    >
                      <RefreshCw className="h-3 w-3" /> Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Quiz Body */}
              {!smpCompleted ? (
                <div className="space-y-5 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl p-4.5 border border-slate-100 dark:border-slate-850">
                  
                  {/* Progress panel */}
                  <div className="flex justify-between items-center text-[10px] font-mono tracking-wide">
                    <span className="font-bold text-slate-500 dark:text-slate-400">PERTANYAAN {smpQuestionIndex + 1} DARI {SMP_DIAGNOSTIC_QUESTIONS.length}</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">Progress: {answeredCount}/12 ({Math.round((answeredCount/12)*100)}%)</span>
                  </div>

                  {/* Question Slide Card */}
                  <div className="min-h-[160px] flex flex-col justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-2.5">
                        <span className="text-xs font-black font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 px-2.5 py-1 rounded-lg shrink-0 mt-0.5">
                          Q{SMP_DIAGNOSTIC_QUESTIONS[smpQuestionIndex].id}
                        </span>
                        <h4 className="text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-100 leading-relaxed font-sans">
                          {SMP_DIAGNOSTIC_QUESTIONS[smpQuestionIndex].text}
                        </h4>
                      </div>
                    </div>

                    {/* Radio Options Grid */}
                    <div className="space-y-2.5">
                      {SMP_DIAGNOSTIC_QUESTIONS[smpQuestionIndex].options.map((opt) => {
                        const isSelected = (state.smpAnswers || {})[SMP_DIAGNOSTIC_QUESTIONS[smpQuestionIndex].id] === opt.id;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => handleSmpAnswer(SMP_DIAGNOSTIC_QUESTIONS[smpQuestionIndex].id, opt.id)}
                            className={`w-full text-left p-3.5 rounded-xl border text-xs leading-relaxed font-medium transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? "bg-blue-600/10 border-blue-550 dark:border-blue-500/60 text-blue-700 dark:text-blue-300 font-bold ring-2 ring-blue-500/20"
                                : "bg-white hover:bg-slate-50 border-gray-150 text-gray-650 dark:bg-slate-900 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-slate-850"
                            }`}
                          >
                            <span className="pr-4 select-none">{opt.text}</span>
                            <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${isSelected ? "border-blue-600 dark:border-blue-400 bg-blue-600 dark:bg-blue-400" : "border-slate-300 dark:border-slate-700"}`}>
                              {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Manual pagination indicator */}
                  <div className="flex justify-between items-center pt-2.5 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => setSmpQuestionIndex(prev => Math.max(0, prev - 1))}
                      disabled={smpQuestionIndex === 0}
                      className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 text-slate-500 disabled:opacity-40 rounded-lg text-[10px] font-semibold hover:bg-slate-100 dark:hover:bg-slate-850 cursor-pointer"
                    >
                      Sebelumnya
                    </button>
                    <div className="flex gap-1.5">
                      {SMP_DIAGNOSTIC_QUESTIONS.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSmpQuestionIndex(idx)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            smpQuestionIndex === idx 
                              ? "bg-blue-500 w-3.5" 
                              : (state.smpAnswers || {})[idx + 1] !== undefined 
                                ? "bg-blue-300 dark:bg-blue-805" 
                                : "bg-slate-200 dark:bg-slate-800"
                          }`}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => setSmpQuestionIndex(prev => Math.min(SMP_DIAGNOSTIC_QUESTIONS.length - 1, prev + 1))}
                      disabled={smpQuestionIndex === SMP_DIAGNOSTIC_QUESTIONS.length - 1}
                      className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 text-slate-500 disabled:opacity-40 rounded-lg text-[10px] font-semibold hover:bg-slate-100 dark:hover:bg-slate-850 cursor-pointer"
                    >
                      Selanjutnya
                    </button>
                  </div>
                </div>
              ) : (
                /* Completed State Banner and recommendation linker */
                <div className={`${topSmpDomain.bgColor} border border-dashed ${topSmpDomain.textColor} rounded-2xl p-5.5 space-y-4`}>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                      <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider font-mono">
                        Hasil Tes Berhasil Dihitung!
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        Anda telah menyelesaikan seluruh 12 pertanyaan kognitif diagnostik.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-900 rounded-xl space-y-3">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-blue-105 font-mono text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        Tipe Dominan Kesiswaan Anda:
                      </span>
                      <h5 className="text-sm font-extrabold text-blue-650 dark:text-blue-400 mt-1.5 flex items-center gap-1.5">
                        {topSmpDomain.name} ({topSmpDomain.percentage}% Match)
                      </h5>
                    </div>

                    <p className="text-[11px] text-gray-650 dark:text-gray-400 leading-relaxed font-sans">
                      {topSmpDomain.desc}
                    </p>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide font-mono">
                          Ekskul Rekomendasi di SCB:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {topSmpDomain.ekskulLabels.map((lbl, i) => (
                            <span key={i} className="text-[10px] font-bold text-slate-880 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 px-2 py-0.5 rounded-md">
                              {lbl}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => handleAutoApplyRecommendedEkskul(topSmpDomain.ekskul)}
                        className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-1.5 shrink-0"
                      >
                        <Plus className="h-3.5 w-3.5" /> Ambil Ekskul Ini
                      </button>
                    </div>
                  </div>

                  {/* Reset button inside completion */}
                  <div className="text-right">
                    <button
                      onClick={handleResetSmpQuiz}
                      className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-red-500 rounded-lg text-[9px] font-bold uppercase cursor-pointer transition-all"
                    >
                      Ulangi Tes Interaktif
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Part 3: Kuantitas Juara / Piagam Penghargaan Non-Akademis */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-850 space-y-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b border-gray-50 dark:border-gray-800 pb-3">
              <Trophy className="h-4 w-4 text-yellow-500" />
              {jenjang === "SMP" ? "3. Piagam Penghargaan Juara Non-Akademis" : "2. Kuantitas Juara / Piagam Penghargaan Non-Akademis"}
            </h3>

            <p className="text-xs text-gray-500 leading-relaxed">
              Catat jumlah prestasi kejuaraan resmi yang pernah diraih di bidang non-akademis selama masa sekolah santri.
            </p>

            <div className="space-y-3 max-w-xl">
              {[
                { key: "sekolah", label: "Tingkat Internal Sekolah" },
                { key: "kabupaten", label: "Tingkat Kabupaten / Kota Bogor" },
                { key: "provinsi", label: "Tingkat Provinsi Jawa Barat" },
                { key: "nasional", label: "Tingkat Nasional (Kemenpora/Federasi)" },
                { key: "internasional", label: "Tingkat Internasional (Global Awards)" }
              ].map((lvl) => (
                <div key={lvl.key} className="flex justify-between items-center bg-gray-55/10 dark:bg-gray-950 p-3 rounded-xl border border-gray-150 dark:border-gray-800">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{lvl.label}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLevelChange(lvl.key as keyof PrestasiEkskulState["tingkatPrestasi"], "dec")}
                      className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-gray-55"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-gray-800 dark:text-white">
                      {state.tingkatPrestasi[lvl.key as keyof PrestasiEkskulState["tingkatPrestasi"]]}
                    </span>
                    <button
                      onClick={() => handleLevelChange(lvl.key as keyof PrestasiEkskulState["tingkatPrestasi"], "inc")}
                      className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-gray-55"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Output panel: Summary Assessment & Recommendations */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/10 dark:to-orange-950/10 rounded-2xl p-6 border border-amber-100 dark:border-amber-900/20 flex flex-col justify-between min-h-[350px]">
            
            <div className="space-y-6">
              <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-xs font-mono border-b border-amber-200/50 dark:border-amber-900/30 pb-2">
                ANALISIS REKAM NYATA BAKAT
              </h3>

              {/* Score display */}
              <div className="text-center py-4 bg-white/60 dark:bg-slate-900/40 border border-amber-100/40 dark:border-amber-900/30 rounded-2xl">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest font-mono">Skor Bakat & Prestasi</div>
                <div className="text-5xl font-extrabold text-amber-700 dark:text-amber-500 mt-2 mb-1">{totalScore}</div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 italic">Consolidated Assessment Score</p>
              </div>

              {/* SMP diagnostics outcome visualization */}
              {jenjang === "SMP" && (
                <div className="space-y-3.5">
                  <div className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" /> Radar Minat Ekskul SMP:
                  </div>

                  {answeredCount === 0 ? (
                    <div className="text-xs text-gray-400 bg-white/40 dark:bg-gray-900/30 p-4 border border-dashed rounded-xl italic">
                      Kerjakan tes diagnostik (minimal menjawab 1 soal) untuk menampilkan radar minat ekstrakurikuler.
                    </div>
                  ) : (
                    <div className="space-y-2 bg-white/40 dark:bg-gray-900/30 p-4.5 rounded-xl border border-blue-105/30">
                      {sortedDomains.map(dom => (
                        <div key={dom.key} className="space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-medium text-slate-705">
                            <span className="font-bold truncate">{dom.name}</span>
                            <span className="font-mono font-bold shrink-0">{dom.percentage}% ({dom.rawScore} Pts)</span>
                          </div>
                          <div className="w-full bg-slate-205/60 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div className={`${dom.color} h-full transition-all duration-300`} style={{ width: `${dom.percentage}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

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

// Inline minimalist Dummy Icon wrappers to avoid importing non-existent packages
function BrainCircleIcon(props: any) {
  return <Award {...props} />;
}
function MusicIcon(props: any) {
  return <Music {...props} />;
}
function ActivityIcon(props: any) {
  return <Activity {...props} />;
}
