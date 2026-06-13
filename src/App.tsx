/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { FullAppState } from "./types";

// Inner components imports
import DataSiswa from "./components/DataSiswa";
import Keagamaan from "./components/Keagamaan";
import Akademik from "./components/Akademik";
import PrestasiEkskul from "./components/PrestasiEkskul";
import MinatBakat from "./components/MinatBakat";
import GayaBelajar from "./components/GayaBelajar";
import IQTest from "./components/IQTest";
import AIRecommendations from "./components/AIRecommendations";
import Prediction from "./components/Prediction";
import LaporanAkhir from "./components/LaporanAkhir";
import AdminAnalytics from "./components/AdminAnalytics";
import PortofolioMandiri from "./components/PortofolioMandiri";
import TemanCurhatAI from "./components/TemanCurhatAI";
import { OFFICIAL_STUDENTS } from "./data/studentList";

export interface RegisteredStudent {
  nama: string;
  nisn: string; // ID / Username
  password?: string; // Kata Sandi
  gender: "Ikhwan" | "Akhwat";
  angkatan: string;
  jenjang: "SMP" | "SMA";
  approved?: boolean;
}

export const getRegisteredStudents = (): RegisteredStudent[] => {
  const raw = localStorage.getItem("sipetakuliah_registered_students");
  let list: RegisteredStudent[] = [];
  if (raw) {
    try {
      list = JSON.parse(raw);
    } catch (e) {
      list = [];
    }
  }

  // Merge official pre-loaded students that don't exist yet in local storage student list
  let hasNewMerge = false;
  const mergedList = [...list];
  for (const official of OFFICIAL_STUDENTS) {
    if (!mergedList.some((s) => s.nisn.trim() === official.nisn.trim())) {
      mergedList.push({
        nama: official.nama,
        nisn: official.nisn,
        password: official.password || official.nisn, // Default password is their NISN
        gender: official.gender,
        angkatan: official.angkatan || "Angkatan 5",
        jenjang: official.jenjang || "SMA",
        approved: true // Preloaded official students are auto-approved
      });
      hasNewMerge = true;
    }
  }

  if (hasNewMerge || !raw) {
    localStorage.setItem("sipetakuliah_registered_students", JSON.stringify(mergedList));
  }

  return mergedList;
};

export const recordStudentLoginCount = (student: { nisn: string; nama: string; jenjang: "SMP" | "SMA"; angkatan: string }) => {
  try {
    const raw = localStorage.getItem("sipetakuliah_student_login_counts");
    const counts = raw ? JSON.parse(raw) : {};
    const key = student.nisn.trim();
    if (!counts[key]) {
      counts[key] = {
        nisn: student.nisn,
        nama: student.nama,
        jenjang: student.jenjang,
        angkatan: student.angkatan,
        count: 0,
        lastLogin: ""
      };
    }
    counts[key].count = (counts[key].count || 0) + 1;
    counts[key].lastLogin = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }) + " WIB";
    localStorage.setItem("sipetakuliah_student_login_counts", JSON.stringify(counts));
  } catch (e) {
    console.error("Failed to record student login count", e);
  }
};

export const recordBKLoginCount = (username: string, label: string) => {
  try {
    const raw = localStorage.getItem("sipetakuliah_bk_login_counts");
    const counts = raw ? JSON.parse(raw) : {};
    if (!counts[username]) {
      counts[username] = {
        username: username,
        label: label,
        count: 0,
        lastLogin: ""
      };
    }
    counts[username].count = (counts[username].count || 0) + 1;
    counts[username].lastLogin = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }) + " WIB";
    localStorage.setItem("sipetakuliah_bk_login_counts", JSON.stringify(counts));
  } catch (e) {
    console.error("Failed to record BK login count", e);
  }
};

// Outer layout elements & dashboard widgets
import {
  ProfileHeader,
  AssessmentProgress,
  MappingProgress,
  PotentialPathways,
  MainPathwayRecommendation,
  StudentRanking,
  SmpDetailedEvaluation,
  SmpExtracurricularAndStrategy
} from "./components/DashboardComponents";

// Navigation icons
import {
  LayoutDashboard,
  User,
  BookOpen,
  GraduationCap,
  Trophy,
  Compass,
  BrainCircuit,
  Brain,
  TrendingUp,
  Award,
  Sun,
  Moon,
  Menu,
  X,
  School,
  Heart,
  Users,
  Lock,
  Shield,
  Bookmark
} from "lucide-react";

const LOCAL_STORAGE_KEY = "sipetakuliah_state_v1";

const DEFAULT_STATE: FullAppState = {
  jenjang: "SMA",
  profile: {
    nama: "",
    nisn: "",
    kelas: "Kelas 10 Ikhwan",
    jenisKelamin: "Ikhwan",
    tempatLahir: "",
    tanggalLahir: "",
    citaCita: "",
    hobi: "",
    organisasi: ""
  },
  keagamaan: {
    hafalan: "0-1 juz",
    hafalanHadits: "0-20 hadits",
    nilai: {
      pai: 75,
      bahasaArab: 75
    },
    prestasi: [],
    organisasi: []
  },
  akademik: {
    nilaiRapor: {
      matematika: 75,
      bahasaIndonesia: 75,
      bahasaInggris: 75,
      ipa: 75,
      ips: 75
    },
    simulasiTes: {
      literasi: 60,
      numerasi: 60,
      penalaran: 60
    },
    prestasi: []
  },
  prestasiEkskul: {
    ekskul: [],
    tingkatPrestasi: {
      sekolah: 0,
      kabupaten: 0,
      provinsi: 0,
      nasional: 0,
      internasional: 0
    }
  },
  minatBakat: {
    answers: {},
    completed: false
  },
  gayaBelajar: {
    answers: {},
    completed: false
  },
  iqTest: {
    answers: {},
    completed: false,
    timeLeft: 3600,
    scores: {
      verbal: 0,
      numerical: 0,
      logical: 0,
      spatial: 0
    },
    scoreTotal: 0,
    iqScore: 100
  },
  aiRecommendation: {
    status: "idle",
    majors: [],
    justification: "",
    threeYearPlan: {
      kelas10: "",
      kelas11: "",
      kelas12: ""
    }
  },
  theme: "light",
  portfolio: {
    hafalan: [],
    akademik: [],
    ekskul: [],
    seminar: [],
    karya: [],
    bahasa: []
  }
};

export default function App() {
  const [activeMenu, setActiveMenu] = useState<number>(0); // 0 = Dashboard, 1-9 = Sub menus
  const [appState, setAppState] = useState<FullAppState>(DEFAULT_STATE);
  const [welcomeJenjang, setWelcomeJenjang] = useState<"SMP" | "SMA">("SMA");
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // New admin and role state management
  const [userRole, setUserRole] = useState<"peserta" | "peserta_curhat" | "admin" | "bk_smp" | "bk_sma" | null>(() => {
    return (localStorage.getItem("sipetakuliah_current_role") as any) || null;
  });
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // New Student Login stage state management
  const [studentLoginStage, setStudentLoginStage] = useState<"select_jenjang" | "login_form" | "register_form">("select_jenjang");
  const [studentNama, setStudentNama] = useState("");
  const [studentNisn, setStudentNisn] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [studentLoginError, setStudentLoginError] = useState("");
  const [studentLoginSuccess, setStudentLoginSuccess] = useState("");
  const [studentShowSuggestions, setStudentShowSuggestions] = useState(false);

  // Counseling login variables
  const [counselingJenjang, setCounselingJenjang] = useState<"SMP" | "SMA">("SMA");
  const [counselingNama, setCounselingNama] = useState("");
  const [counselingNisn, setCounselingNisn] = useState("");
  const [counselingPassword, setCounselingPassword] = useState("");
  const [counselingLoginError, setCounselingLoginError] = useState("");
  const [counselingSuccess, setCounselingSuccess] = useState("");
  const [counselingShowSuggestions, setCounselingShowSuggestions] = useState(false);
  const [counselingStage, setCounselingStage] = useState<"select_jenjang" | "login_form" | "register_form">("select_jenjang");

  // Registration input variables
  const [regNama, setRegNama] = useState("");
  const [regNisn, setRegNisn] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regGender, setRegGender] = useState<"Ikhwan" | "Akhwat">("Ikhwan");
  const [regAngkatan, setRegAngkatan] = useState("Angkatan 5");

  const resetAppStateForStudent = (nama: string, nisn: string, gender: "Ikhwan" | "Akhwat", kelas: string, jenjang: "SMP" | "SMA") => {
    setAppState({
      ...DEFAULT_STATE,
      jenjang: jenjang,
      profile: {
        ...DEFAULT_STATE.profile,
        nama: nama,
        nisn: nisn,
        jenisKelamin: gender,
        kelas: kelas
      },
      keagamaan: jenjang === "SMP" ? {
        ...DEFAULT_STATE.keagamaan,
        nilai: { pai: 0, bahasaArab: 0 }
      } : DEFAULT_STATE.keagamaan,
      akademik: jenjang === "SMP" ? {
        ...DEFAULT_STATE.akademik,
        nilaiRapor: { matematika: 0, bahasaIndonesia: 0, bahasaInggris: 0, ipa: 0, ips: 0 },
        simulasiTes: { literasi: 0, numerasi: 0, penalaran: 0 }
      } : DEFAULT_STATE.akademik
    });
  };

  const handleStudentRegister = (
    nama: string,
    nisn: string,
    password_entered: string,
    gender: "Ikhwan" | "Akhwat",
    angkatan: string,
    jenjang: "SMP" | "SMA",
    isFromCounseling: boolean = false
  ) => {
    if (!nama.trim() || !nisn.trim() || !password_entered.trim()) {
      const errMsg = "Semua kolom pendaftaran wajib diisi!";
      if (isFromCounseling) setCounselingLoginError(errMsg);
      else setStudentLoginError(errMsg);
      return;
    }

    const list = getRegisteredStudents();
    if (list.some(s => s.nisn.trim() === nisn.trim())) {
      const errMsg = `Siswa dengan ID/NISN "${nisn}" sudah terdaftar! Harap gunakan NISN lain atau silakan Masuk/Login.`;
      if (isFromCounseling) setCounselingLoginError(errMsg);
      else setStudentLoginError(errMsg);
      return;
    }

    const newStudent: RegisteredStudent = {
      nama: nama.trim(),
      nisn: nisn.trim(),
      password: password_entered.trim(),
      gender,
      angkatan,
      jenjang,
      approved: false // Harus disetujui (di-acc) oleh admin dulu
    };

    list.push(newStudent);
    localStorage.setItem("sipetakuliah_registered_students", JSON.stringify(list));

    // Clear registration fields
    setRegNama("");
    setRegNisn("");
    setRegPassword("");

    if (isFromCounseling) {
      setCounselingLoginError("");
      setCounselingSuccess("Pendaftaran akun berhasil dikirim! Akun Anda sedang dalam antrean persetujuan (acc) oleh Guru BK sebelum dapat masuk.");
      setCounselingStage("login_form");
    } else {
      setStudentLoginError("");
      setStudentLoginSuccess("Pendaftaran akun berhasil dikirim! Akun Anda sedang dalam antrean persetujuan (acc) oleh Admin sebelum dapat masuk.");
      setStudentLoginStage("login_form");
    }
  };

  const handleCounselingStudentLogin = (nama: string, password_entered: string, jenjang: "SMP" | "SMA") => {
    if (!nama.trim() || !password_entered.trim()) {
      setCounselingLoginError("Nama Lengkap dan Kata Sandi wajib diisi!");
      return;
    }
    setCounselingLoginError("");
    setCounselingSuccess("");

    const cleanNama = nama.trim();
    const cleanPassword = password_entered.trim();

    const registeredList = getRegisteredStudents();
    const officialMatch = registeredList.find(
      s => s.nama.toLowerCase() === cleanNama.toLowerCase() && s.jenjang === jenjang
    );

    if (!officialMatch) {
      setCounselingLoginError("Nama tidak ditemukan untuk jenjang " + jenjang + ". Silakan daftarkan akun baru Anda terlebih dahulu.");
      return;
    }

    if (officialMatch.approved === false) {
      setCounselingLoginError("Akun Anda belum disetujui (di-acc) oleh Guru BK. Harap hubungi Guru BK Anda untuk persetujuan akun.");
      return;
    }

    const expectedPassword = officialMatch.password || officialMatch.nisn;
    if (cleanPassword !== expectedPassword) {
      setCounselingLoginError("Kata sandi salah! Silakan coba lagi.");
      return;
    }

    const resolvedNama = officialMatch.nama;
    const resolvedNisn = officialMatch.nisn;
    const resolvedGender = officialMatch.gender; 
    const resolvedAngkatan = officialMatch.angkatan;

    const initialKelas = `${resolvedAngkatan} ${jenjang} ${resolvedGender}`;

    const nameKey = resolvedNama.toLowerCase().trim().replace(/[^a-z0-9]/g, "_");
    const studentStateKey = `${LOCAL_STORAGE_KEY}_student_${nameKey}`;
    const savedStudentStateObj = localStorage.getItem(studentStateKey);

    if (savedStudentStateObj) {
      try {
        const parsed = JSON.parse(savedStudentStateObj);
        parsed.profile.nama = resolvedNama;
        parsed.profile.nisn = resolvedNisn;
        parsed.profile.jenisKelamin = resolvedGender;
        if (!parsed.profile.kelas) {
          parsed.profile.kelas = initialKelas;
        }
        parsed.jenjang = jenjang;
        setAppState(parsed);
      } catch (e) {
        resetAppStateForStudent(resolvedNama, resolvedNisn, resolvedGender, initialKelas, jenjang);
      }
    } else {
      resetAppStateForStudent(resolvedNama, resolvedNisn, resolvedGender, initialKelas, jenjang);
    }

    recordStudentLoginCount({
      nisn: resolvedNisn,
      nama: resolvedNama,
      jenjang: jenjang,
      angkatan: resolvedAngkatan || "Angkatan 5"
    });

    handleSetRole("peserta_curhat");
  };

  const handleSetRole = (role: "peserta" | "peserta_curhat" | "admin" | "bk_smp" | "bk_sma" | null) => {
    setUserRole(role);
    if (role) {
      localStorage.setItem("sipetakuliah_current_role", role);
      if (role === "admin" || role === "bk_smp" || role === "bk_sma") {
        setActiveMenu(10); // Default to Admin Analytics & Infographics
      } else if (role === "peserta_curhat") {
        setActiveMenu(30); // Special active menu ID for counseling main view
      } else {
        setActiveMenu(0); // Default to Student Dashboard
      }
    } else {
      localStorage.removeItem("sipetakuliah_current_role");
      setAdminUsername("");
      setAdminPassword("");
      setLoginError("");
      // Reset student login form states
      setStudentLoginStage("select_jenjang");
      setStudentNama("");
      setStudentNisn("");
      setStudentLoginError("");
      // Reset counseling login states
      setCounselingStage("select_jenjang");
      setCounselingNama("");
      setCounselingNisn("");
      setCounselingLoginError("");
    }
  };

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure nesting stability against default overrides
        setAppState({
          ...DEFAULT_STATE,
          ...parsed,
          profile: { ...DEFAULT_STATE.profile, ...parsed.profile },
          keagamaan: {
            ...DEFAULT_STATE.keagamaan,
            ...parsed.keagamaan,
            nilai: { ...DEFAULT_STATE.keagamaan.nilai, ...parsed.keagamaan?.nilai }
          },
          akademik: {
            ...DEFAULT_STATE.akademik,
            ...parsed.akademik,
            nilaiRapor: { ...DEFAULT_STATE.akademik.nilaiRapor, ...parsed.akademik?.nilaiRapor },
            simulasiTes: { ...DEFAULT_STATE.akademik.simulasiTes, ...parsed.akademik?.simulasiTes }
          },
          prestasiEkskul: {
            ...DEFAULT_STATE.prestasiEkskul,
            ...parsed.prestasiEkskul,
            tingkatPrestasi: { ...DEFAULT_STATE.prestasiEkskul.tingkatPrestasi, ...parsed.prestasiEkskul?.tingkatPrestasi }
          },
          gayaBelajar: {
            ...DEFAULT_STATE.gayaBelajar,
            ...(parsed.gayaBelajar || {})
          },
          portfolio: (() => {
            const rawPortfolio = parsed.portfolio || {};
            const sanitized: any = {
              hafalan: [],
              akademik: [],
              ekskul: [],
              seminar: [],
              karya: [],
              bahasa: []
            };
            const categories = ["hafalan", "akademik", "ekskul", "seminar", "karya", "bahasa"];
            categories.forEach((cat) => {
              if (Array.isArray(rawPortfolio[cat])) {
                sanitized[cat] = rawPortfolio[cat];
              } else if (rawPortfolio[cat] && typeof rawPortfolio[cat] === "object") {
                const valueCount = Object.values(rawPortfolio[cat]).filter(Boolean).length;
                if (valueCount > 0) {
                  sanitized[cat] = [{ id: "legacy-1", ...rawPortfolio[cat] }];
                }
              }
            });
            return sanitized;
          })()
        });
      } catch (e) {
        setAppState(DEFAULT_STATE);
      }
    }

    const savedTheme = localStorage.getItem("sipetakuliah_theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Save to LocalStorage reactively
  useEffect(() => {
    if (appState !== DEFAULT_STATE) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appState));
      if ((userRole === "peserta" || userRole === "peserta_curhat") && appState.profile.nama) {
        const nameKey = appState.profile.nama.toLowerCase().trim().replace(/[^a-z0-9]/g, "_");
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_student_${nameKey}`, JSON.stringify(appState));
      }
    }
  }, [appState, userRole]);

  const handleStudentLogin = (nama: string, password_entered: string, jenjang: "SMP" | "SMA") => {
    if (!nama.trim() || !password_entered.trim()) {
      setStudentLoginError("Nama Lengkap dan Kata Sandi wajib diisi!");
      return;
    }
    setStudentLoginError("");
    setStudentLoginSuccess("");

    const cleanNama = nama.trim();
    const cleanPassword = password_entered.trim();

    // Verify against dynamically registered student database in localStorage
    const registeredList = getRegisteredStudents();
    const officialMatch = registeredList.find(
      s => s.nama.toLowerCase() === cleanNama.toLowerCase() && s.jenjang === jenjang
    );

    if (!officialMatch) {
      setStudentLoginError(`Nama Lengkap tidak terdaftar untuk jenjang ${jenjang}. Silakan lakukan Pendaftaran Akun terlebih dahulu.`);
      return;
    }

    if (officialMatch.approved === false) {
      setStudentLoginError("Akun Anda belum disetujui (di-acc) oleh Admin/Guru BK. Harap hubungi Guru atau Admin BK Anda.");
      return;
    }

    const expectedPassword = officialMatch.password || officialMatch.nisn;
    if (cleanPassword !== expectedPassword) {
      setStudentLoginError("Kata sandi salah! Silakan coba lagi.");
      return;
    }

    const resolvedNama = officialMatch.nama;
    const resolvedNisn = officialMatch.nisn;
    const resolvedGender = officialMatch.gender; 
    const resolvedAngkatan = officialMatch.angkatan;

    const initialKelas = `${resolvedAngkatan} ${jenjang} ${resolvedGender}`;
    
    // Look for a saved state for this specific Name
    const nameKey = resolvedNama.toLowerCase().trim().replace(/[^a-z0-9]/g, "_");
    const studentStateKey = `${LOCAL_STORAGE_KEY}_student_${nameKey}`;
    const savedStudentStateObj = localStorage.getItem(studentStateKey);
    
    if (savedStudentStateObj) {
      try {
        const parsed = JSON.parse(savedStudentStateObj);
        // Sync profile updates if any
        parsed.profile.nama = resolvedNama;
        parsed.profile.nisn = resolvedNisn;
        parsed.profile.jenisKelamin = resolvedGender;
        if (!parsed.profile.kelas) {
          parsed.profile.kelas = initialKelas;
        }
        parsed.jenjang = jenjang;
        setAppState(parsed);
      } catch (e) {
        // Fallback with clean profile
        resetAppStateForStudent(resolvedNama, resolvedNisn, resolvedGender, initialKelas, jenjang);
      }
    } else {
      // Create a fresh state for the new student login
      resetAppStateForStudent(resolvedNama, resolvedNisn, resolvedGender, initialKelas, jenjang);
    }

    recordStudentLoginCount({
      nisn: resolvedNisn,
      nama: resolvedNama,
      jenjang: jenjang,
      angkatan: resolvedAngkatan || "Angkatan 5"
    });

    handleSetRole("peserta");
  };

  // Darkmode toggling
  const handleToggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("sipetakuliah_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("sipetakuliah_theme", "light");
    }
  };

  const menuItems = (userRole === "admin" || userRole === "bk_smp" || userRole === "bk_sma")
    ? [
        { id: 10, label: "Info Grafis & BK", icon: LayoutDashboard },
        { id: 9, label: "Cetak Lapor Siswa", icon: Award }
      ]
    : appState.jenjang === "SMP"
    ? [
        { id: 0, label: "Dashboard Utama", icon: LayoutDashboard },
        { id: 1, label: "Data Diri Siswa", icon: User },
        { id: 11, label: "Tes Gaya Belajar", icon: Compass },
        { id: 4, label: "Minat Bakat (Ekskul)", icon: Trophy },
        { id: 6, label: "Tes IQ Kognitif", icon: BrainCircuit },
        { id: 7, label: "Rekomendasi Studi AI", icon: Brain },
        { id: 12, label: "Portofolio Mandiri", icon: Bookmark },
        { id: 9, label: "Evaluasi Bakat & Potensi", icon: Award }
      ]
    : [
        { id: 0, label: "Dashboard Utama", icon: LayoutDashboard },
        { id: 1, label: "Data Diri Siswa", icon: User },
        { id: 2, label: "Karakter & Religiusitas", icon: BookOpen },
        { id: 3, label: "Jalur Akademis", icon: GraduationCap },
        { id: 4, label: "Minat Prestasi", icon: Trophy },
        { id: 5, label: "Minat Holland", icon: Compass },
        { id: 6, label: "Tes IQ Kognitif", icon: BrainCircuit },
        { id: 7, label: "Rekomendasi Karir AI", icon: Brain },
        { id: 8, label: "Prediksi Jalur Admisia", icon: TrendingUp },
        { id: 12, label: "Portofolio Mandiri", icon: Bookmark },
        { id: 9, label: "Laporan Kelulusan", icon: Award }
      ];

  const handleNavigate = (menuId: number) => {
    setActiveMenu(menuId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (userRole === null) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between p-4 sm:p-6 transition-colors duration-200 font-sans">
        {/* Top header decoration */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-blue-600 to-indigo-600"></div>

        {/* Theme mode toggle top right */}
        <div className="flex justify-end p-2 cursor-pointer">
          <button
            onClick={handleToggleTheme}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 text-slate-500 hover:text-blue-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors cursor-pointer"
          >
            {darkMode ? <Sun className="h-4.5 w-4.5 text-amber-500" /> : <Moon className="h-4.5 w-4.5" />}
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-4xl w-full mx-auto py-8">
          
          {/* Logo & Headline */}
          <div className="text-center space-y-4 mb-10">
            <img 
              src="https://lh3.googleusercontent.com/d/1ugonzA_1B-ukGoqRRUIQbLK8QPIzo26V" 
              alt="Sekolah Cendekia BAZNAS Logo" 
              className="h-28 sm:h-32 w-auto object-contain mx-auto mb-2 rounded-2xl transition-transform hover:scale-105 duration-300"
              referrerPolicy="no-referrer"
            />
            <div className="space-y-1">
              <h1 className="text-3.5xl sm:text-4.5xl font-black tracking-tight text-slate-900 dark:text-white font-display">
                Cendekia Metrix
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-350 max-w-xl mx-auto leading-relaxed">
                "Mapping Talent, Learning Style &amp; IQ to Your Perfect Major" • Platform Analisis Multi-Jenjang Siswa <strong className="text-emerald-600 dark:text-emerald-400">Sekolah Cendekia BAZNAS</strong>
              </p>
            </div>
          </div>

          {/* Core selection grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-6xl">
            
            {/* Card 1: Student / Candidate */}
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>
              
              {studentLoginStage === "select_jenjang" ? (
                <>
                  <div className="space-y-5">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-450 flex items-center justify-center shadow-inner">
                      <Users className="h-6 w-6" />
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">Peserta Tes (Siswa)</h3>
                      <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed min-h-[60px]">
                        {welcomeJenjang === "SMP"
                          ? "Evaluasi gaya belajar Visual-Auditori-Kinestetik (VAK) lengkap, ukur potensi kognitif IQ, serta petakan hasil evaluasi komprehensif didukung rekomendasi studi AI."
                          : "Eksplorasi minat karir, ukur kecocokan kode Holland, hitung rata-rata rapor per semester, laksanakan simulasi kognitif IQ, serta peroleh saran program studi terbaik berbasis AI."}
                      </p>
                    </div>

                    {/* Tab Selector SMP / SMA */}
                    <div className="bg-slate-100 dark:bg-slate-955 p-1.5 rounded-2xl flex border border-slate-200 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setWelcomeJenjang("SMP")}
                        className={`flex-1 py-1.5 text-center rounded-xl text-[11px] font-black tracking-wide transition-all cursor-pointer ${
                          welcomeJenjang === "SMP"
                            ? "bg-blue-650 text-white shadow-sm font-bold"
                            : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                        }`}
                      >
                        Jenjang SMP
                      </button>
                      <button
                        type="button"
                        onClick={() => setWelcomeJenjang("SMA")}
                        className={`flex-1 py-1.5 text-center rounded-xl text-[11px] font-black tracking-wide transition-all cursor-pointer ${
                          welcomeJenjang === "SMA"
                            ? "bg-blue-650 text-white shadow-sm font-bold"
                            : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                        }`}
                      >
                        Jenjang SMA
                      </button>
                    </div>

                    <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                      <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        <span>{welcomeJenjang === "SMP" ? "Kuis Gaya Belajar & IQ" : "Kuis Minat Holland, Rapor, & IQ"}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        <span>Progres disimpan instan pada browser</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setStudentLoginStage("login_form");
                      setStudentLoginError("");
                    }}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-750 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all cursor-pointer text-center uppercase tracking-wider block font-mono"
                  >
                    Lanjut ke Login {welcomeJenjang}
                  </button>
                </>
              ) : studentLoginStage === "login_form" ? (
                <>
                  <div className="space-y-5">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-450 flex items-center justify-center shadow-inner">
                      <Lock className="h-6 w-6" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Login Siswa {welcomeJenjang}</h3>
                        <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-[9px] font-bold font-mono uppercase tracking-wide">
                          {welcomeJenjang}
                        </span>
                      </div>
                      <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">
                        Masukkan Nama Lengkap Anda beserta Kata Sandi untuk memuat atau memulai asesmen.
                      </p>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleStudentLogin(studentNama, studentPassword, welcomeJenjang);
                      }}
                      className="space-y-3.5 pt-3 border-t border-slate-100 dark:border-slate-800"
                    >
                      <div className="space-y-1 relative">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Nama Lengkap Siswa</label>
                        <input
                          type="text"
                          placeholder="Ketik Nama Anda"
                          value={studentNama}
                          onChange={(e) => {
                            setStudentNama(e.target.value);
                            setStudentShowSuggestions(true);
                          }}
                          onFocus={() => setStudentShowSuggestions(true)}
                          className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-slate-900 dark:text-white font-medium"
                          required
                        />
                        
                        {/* Autocomplete Search Suggestions Dropdown */}
                        {studentShowSuggestions && studentNama.trim().length >= 2 && (
                          <div className="absolute left-0 right-0 top-[100%] z-50 mt-1 max-h-48 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl divide-y divide-slate-100 dark:divide-slate-800">
                            {getRegisteredStudents().filter(s => 
                              s.jenjang === welcomeJenjang && s.nama.toLowerCase().includes(studentNama.toLowerCase())
                            ).length === 0 ? (
                              <div className="px-3 py-2 text-xs text-slate-400 italic">
                                Siswa tidak ditemukan
                              </div>
                            ) : (
                              getRegisteredStudents().filter(s => 
                                s.jenjang === welcomeJenjang && s.nama.toLowerCase().includes(studentNama.toLowerCase())
                              ).map(s => (
                                <button
                                  key={s.nisn}
                                  type="button"
                                  onClick={() => {
                                    setStudentNama(s.nama);
                                    setStudentNisn(s.nisn);
                                    setStudentPassword(s.password || s.nisn);
                                    setStudentShowSuggestions(false);
                                  }}
                                  className="w-full px-3.5 py-2.5 text-left text-xs text-slate-700 dark:text-slate-350 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors flex items-center justify-between cursor-pointer"
                                >
                                  <div>
                                    <span className="font-bold block text-slate-900 dark:text-white">{s.nama}</span>
                                    <span className="text-[10px] text-slate-450 dark:text-slate-500 font-mono">NISN: {s.nisn}</span>
                                  </div>
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase font-mono bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400`}>
                                    {s.angkatan}
                                  </span>
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Kata Sandi / Password</label>
                        <input
                          type="password"
                          placeholder="Masukkan kata sandi akun"
                          value={studentPassword}
                          onChange={(e) => setStudentPassword(e.target.value)}
                          className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-slate-900 dark:text-white font-mono"
                          required
                        />
                      </div>
                      
                      {studentLoginError && (
                        <div className="text-[11px] text-red-650 dark:text-red-400 font-bold font-mono">
                          * {studentLoginError}
                        </div>
                      )}

                      {studentLoginSuccess && (
                        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold text-[11px] border border-emerald-250/20 font-sans leading-relaxed">
                          ✓ {studentLoginSuccess}
                        </div>
                      )}

                      <div className="flex gap-2.5 pt-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setStudentLoginStage("select_jenjang");
                            setStudentLoginError("");
                          }}
                          className="flex-1 py-3 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-450 font-bold text-xs rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 transition-all cursor-pointer text-center uppercase tracking-wide font-mono"
                        >
                          Kembali
                        </button>
                        <button
                          type="submit"
                          className="flex-1.5 py-3 bg-blue-600 hover:bg-blue-750 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer text-center uppercase tracking-wide block font-mono"
                        >
                          Masuk Asesmen
                        </button>
                      </div>

                      <div className="text-center pt-3 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-[11px] text-slate-450">Belum terdaftar? </span>
                        <button
                          type="button"
                          onClick={() => {
                            setRegNama(studentNama);
                            setStudentLoginStage("register_form");
                            setStudentLoginError("");
                          }}
                          className="text-[11.5px] text-blue-600 hover:text-blue-700 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                        >
                          Daftar Akun Baru
                        </button>
                      </div>
                    </form>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-450 flex items-center justify-center shadow-inner">
                      <User className="h-6 w-6" />
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Daftar Akun Baru {welcomeJenjang}</h3>
                      <p className="text-xs text-slate-550 dark:text-slate-400">
                        Isi form di bawah untuk mendaftarkan akun siswa secara mandiri.
                      </p>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleStudentRegister(regNama, regNisn, regPassword, regGender, regAngkatan, welcomeJenjang, false);
                      }}
                      className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800"
                    >
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide font-mono">Nama Lengkap</label>
                        <input
                          type="text"
                          placeholder="Nama lengkap Anda"
                          value={regNama}
                          onChange={(e) => setRegNama(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-slate-900 dark:text-white font-medium"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide font-mono">ID / NISN (Username)</label>
                        <input
                          type="text"
                          placeholder="Masukkan ID / NISN unik"
                          value={regNisn}
                          onChange={(e) => setRegNisn(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-slate-900 dark:text-white font-mono"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide font-mono">Kata Sandi / Password</label>
                        <input
                          type="password"
                          placeholder="Atur kata sandi baru"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-slate-900 dark:text-white font-mono"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide font-mono">Kelompok (Gender)</label>
                          <select
                            value={regGender}
                            onChange={(e) => setRegGender(e.target.value as any)}
                            className="w-full px-2.5 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-slate-900 dark:text-white"
                          >
                            <option value="Ikhwan">Ikhwan</option>
                            <option value="Akhwat">Akhwat</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide font-mono">Angkatan</label>
                          <select
                            value={regAngkatan}
                            onChange={(e) => setRegAngkatan(e.target.value)}
                            className="w-full px-2.5 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-slate-900 dark:text-white"
                          >
                            <option value="Angkatan 5">Angkatan 5</option>
                            <option value="Angkatan 6">Angkatan 6</option>
                            <option value="Angkatan 7">Angkatan 7</option>
                            <option value="Angkatan 8">Angkatan 8</option>
                            <option value="Angkatan 9">Angkatan 9</option>
                            <option value="Angkatan 10">Angkatan 10</option>
                          </select>
                        </div>
                      </div>

                      {studentLoginError && (
                        <div className="text-[11px] text-red-650 dark:text-red-400 font-bold font-mono">
                          * {studentLoginError}
                        </div>
                      )}

                      <div className="flex gap-2.5 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setStudentLoginStage("login_form");
                            setStudentLoginError("");
                          }}
                          className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-450 font-bold text-xs rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="flex-1.5 py-2.5 bg-blue-650 hover:bg-blue-750 text-white font-bold text-xs rounded-xl"
                        >
                          Daftar Akun
                        </button>
                      </div>
                    </form>
                  </div>
                </>
              )}
            </div>

            {/* Card 2: Konsultasi BK Mandiri (Teman CurhatKu) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors"></div>
              
              {counselingStage === "select_jenjang" ? (
                <>
                  <div className="space-y-5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-450 flex items-center justify-center shadow-inner">
                      <Heart className="h-6 w-6" />
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">Konsultasi BK Mandiri</h3>
                      <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed min-h-[60px]">
                        Butuh kawan dengar? Obrolin rasa rindu rumah (homesick), stres asrama, kejenuhan belajar, atau setoran hafalan yang macet bareng asisten AI <strong className="text-emerald-600 dark:text-emerald-400">Teman CurhatKu</strong> secara santai.
                      </p>
                    </div>

                    {/* Tab Selector SMP / SMA */}
                    <div className="bg-slate-100 dark:bg-slate-955 p-1.5 rounded-2xl flex border border-slate-200 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setCounselingJenjang("SMP")}
                        className={`flex-1 py-1.5 text-center rounded-xl text-[11px] font-black tracking-wide transition-all cursor-pointer ${
                          counselingJenjang === "SMP"
                            ? "bg-emerald-600 text-white shadow-sm font-bold"
                            : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                        }`}
                      >
                        Jenjang SMP
                      </button>
                      <button
                        type="button"
                        onClick={() => setCounselingJenjang("SMA")}
                        className={`flex-1 py-1.5 text-center rounded-xl text-[11px] font-black tracking-wide transition-all cursor-pointer ${
                          counselingJenjang === "SMA"
                            ? "bg-emerald-650 text-white shadow-sm font-bold"
                            : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                        }`}
                      >
                        Jenjang SMA
                      </button>
                    </div>

                    <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                      <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        <span>Curhat asyik gaya bahasa teman akrab</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                        <span>Terintegrasi biodata &amp; dipantau Guru BK</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setCounselingStage("login_form");
                      setCounselingLoginError("");
                    }}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all cursor-pointer text-center uppercase tracking-wider block font-mono"
                  >
                    Lanjut Ke Curhat {counselingJenjang}
                  </button>
                </>
              ) : counselingStage === "login_form" ? (
                <>
                  <div className="space-y-5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-455 flex items-center justify-center shadow-inner">
                      <Lock className="h-6 w-6" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Akses Teman CurhatKu</h3>
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[9px] font-bold font-mono uppercase tracking-wide">
                          {counselingJenjang}
                        </span>
                      </div>
                      <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed font-sans">
                        Ketik nama lengkap Anda beserta Kata Sandi untuk memulai sesi curhat bimbingan konseling.
                      </p>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleCounselingStudentLogin(counselingNama, counselingPassword, counselingJenjang);
                      }}
                      className="space-y-3.5 pt-3 border-t border-slate-100 dark:border-slate-800"
                    >
                      <div className="space-y-1 relative">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Nama Lengkap Siswa</label>
                        <input
                          type="text"
                          placeholder="Masukkan Nama Anda"
                          value={counselingNama}
                          onChange={(e) => {
                            setCounselingNama(e.target.value);
                            setCounselingShowSuggestions(true);
                          }}
                          onFocus={() => setCounselingShowSuggestions(true)}
                          className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-slate-900 dark:text-white font-medium"
                          required
                        />
                        
                        {/* Autocomplete Suggestions */}
                        {counselingShowSuggestions && counselingNama.trim().length >= 2 && (
                          <div className="absolute left-0 right-0 top-[100%] z-50 mt-1 max-h-48 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl divide-y divide-slate-100 dark:divide-slate-800">
                            {getRegisteredStudents().filter(s => 
                              s.jenjang === counselingJenjang && s.nama.toLowerCase().includes(counselingNama.toLowerCase())
                            ).length === 0 ? (
                              <div className="px-3 py-2 text-xs text-slate-400 italic">
                                Siswa tidak ditemukan
                              </div>
                            ) : (
                              getRegisteredStudents().filter(s => 
                                s.jenjang === counselingJenjang && s.nama.toLowerCase().includes(counselingNama.toLowerCase())
                              ).map(s => (
                                <button
                                  key={s.nisn}
                                  type="button"
                                  onClick={() => {
                                    setCounselingNama(s.nama);
                                    setCounselingNisn(s.nisn);
                                    setCounselingPassword(s.password || s.nisn);
                                    setCounselingShowSuggestions(false);
                                  }}
                                  className="w-full px-3.5 py-2.5 text-left text-xs text-slate-700 dark:text-slate-350 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors flex items-center justify-between cursor-pointer"
                                >
                                  <div>
                                    <span className="font-bold block text-slate-900 dark:text-white">{s.nama}</span>
                                    <span className="text-[10px] text-slate-450 dark:text-slate-550 font-mono">NISN: {s.nisn}</span>
                                  </div>
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase font-mono bg-emerald-50 dark:bg-emerald-955/40 text-emerald-600 dark:text-emerald-400`}>
                                    {s.angkatan}
                                  </span>
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Kata Sandi / Password</label>
                        <input
                          type="password"
                          placeholder="Masukkan kata sandi akun"
                          value={counselingPassword}
                          onChange={(e) => setCounselingPassword(e.target.value)}
                          className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-slate-900 dark:text-white font-mono"
                          required
                        />
                      </div>
                      
                      {counselingLoginError && (
                        <div className="text-[11px] text-red-650 dark:text-red-400 font-bold font-mono">
                          * {counselingLoginError}
                        </div>
                      )}

                      {counselingSuccess && (
                        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-450 font-bold text-[11px] border border-emerald-250/20 font-sans leading-relaxed">
                          ✓ {counselingSuccess}
                        </div>
                      )}

                      <div className="flex gap-2.5 pt-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setCounselingStage("select_jenjang");
                            setCounselingLoginError("");
                          }}
                          className="flex-1 py-3 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-450 font-bold text-xs rounded-xl hover:bg-slate-50 dark:hover:bg-slate-855 transition-all cursor-pointer text-center uppercase tracking-wide font-mono"
                        >
                          Kembali
                        </button>
                        <button
                          type="submit"
                          className="flex-1.5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer text-center uppercase tracking-wide block font-mono"
                        >
                          Mulai Chat
                        </button>
                      </div>

                      <div className="text-center pt-3 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-[11px] text-slate-450 font-medium">Belum terdaftar? </span>
                        <button
                          type="button"
                          onClick={() => {
                            setRegNama(counselingNama);
                            setCounselingStage("register_form");
                            setCounselingLoginError("");
                          }}
                          className="text-[11.5px] text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                        >
                          Daftar Akun Baru
                        </button>
                      </div>
                    </form>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-450 flex items-center justify-center shadow-inner">
                      <User className="h-6 w-6" />
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Daftar Akun BK Baru {counselingJenjang}</h3>
                      <p className="text-xs text-slate-550 dark:text-slate-400">
                        Isi form di bawah untuk mendaftarkan akun siswa secara mandiri.
                      </p>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleStudentRegister(regNama, regNisn, regPassword, regGender, regAngkatan, counselingJenjang, true);
                      }}
                      className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800"
                    >
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide font-mono">Nama Lengkap</label>
                        <input
                          type="text"
                          placeholder="Nama lengkap Anda"
                          value={regNama}
                          onChange={(e) => setRegNama(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-slate-900 dark:text-white font-medium"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide font-mono">ID / NISN (Username)</label>
                        <input
                          type="text"
                          placeholder="Masukkan ID / NISN unik"
                          value={regNisn}
                          onChange={(e) => setRegNisn(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-slate-900 dark:text-white font-mono"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide font-mono">Kata Sandi / Password</label>
                        <input
                          type="password"
                          placeholder="Atur kata sandi baru"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-slate-900 dark:text-white font-mono"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide font-mono">Kelompok (Gender)</label>
                          <select
                            value={regGender}
                            onChange={(e) => setRegGender(e.target.value as any)}
                            className="w-full px-2.5 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-slate-900 dark:text-white"
                          >
                            <option value="Ikhwan">Ikhwan</option>
                            <option value="Akhwat">Akhwat</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide font-mono">Angkatan</label>
                          <select
                            value={regAngkatan}
                            onChange={(e) => setRegAngkatan(e.target.value)}
                            className="w-full px-2.5 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-slate-900 dark:text-white"
                          >
                            <option value="Angkatan 5">Angkatan 5</option>
                            <option value="Angkatan 6">Angkatan 6</option>
                            <option value="Angkatan 7">Angkatan 7</option>
                            <option value="Angkatan 8">Angkatan 8</option>
                            <option value="Angkatan 9">Angkatan 9</option>
                            <option value="Angkatan 10">Angkatan 10</option>
                          </select>
                        </div>
                      </div>

                      {counselingLoginError && (
                        <div className="text-[11px] text-red-650 dark:text-red-400 font-bold font-mono">
                          * {counselingLoginError}
                        </div>
                      )}

                      <div className="flex gap-2.5 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setCounselingStage("login_form");
                            setCounselingLoginError("");
                          }}
                          className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-450 font-bold text-xs rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="flex-1.5 py-2.5 bg-emerald-650 hover:bg-emerald-750 text-white font-bold text-xs rounded-xl"
                        >
                          Daftar Akun
                        </button>
                      </div>
                    </form>
                  </div>
                </>
              )}
            </div>

            {/* Card 3: Admin */}
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl"></div>

              <div className="space-y-5 flex-1">
                <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center shadow-inner">
                  <Shield className="h-6 w-6" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Admin &amp; Guru BK</h3>
                  <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">
                    Akses dashboard bimbingan sekolah, kelola pangkalan hasil rekapitulasi siswa, lakukan pembersihan total records siswa ataupun menyaring basis data historis angkatan.
                  </p>
                </div>

                {/* Form Login Admin */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const user = adminUsername.trim();
                    const pwd = adminPassword;
                    if (user === "admin" && pwd === "@Scbjuara1") {
                      setLoginError("");
                      recordBKLoginCount("admin", "BK SCB (Super Admin)");
                      handleSetRole("admin");
                    } else if (user === "BKSMP" && pwd === "@SMPjuara1") {
                      setLoginError("");
                      recordBKLoginCount("BKSMP", "Guru BK SMP");
                      handleSetRole("bk_smp");
                    } else if (user === "BKSMA" && pwd === "@SMAjuara1") {
                      setLoginError("");
                      recordBKLoginCount("BKSMA", "Guru BK SMA");
                      handleSetRole("bk_sma");
                    } else {
                      setLoginError("ID atau Password Admin / Guru BK Salah!");
                    }
                  }}
                  className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800"
                >
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">ID Admin / Guru BK</label>
                    <input
                      type="text"
                      placeholder="Masukkan ID Admin atau BK"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-slate-900 dark:text-white font-mono"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Password</label>
                    <input
                      type="password"
                      placeholder="Masukkan Password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-slate-900 dark:text-white font-mono"
                      required
                    />
                  </div>
                  
                  {loginError && (
                    <div className="text-[11px] text-red-650 dark:text-red-400 font-bold font-mono">
                      * {loginError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer uppercase tracking-wider mt-2.5 block"
                  >
                    Masuk Admin Portal
                  </button>
                </form>
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="text-center text-[10px] text-slate-400 py-4 font-mono">
          © 2026 SEKOLAH CENDEKIA BAZNAS • SISTEM INFORMASI BIMBINGAN BK
        </div>
      </div>
    );
  }

  if (userRole === "peserta_curhat") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans flex flex-col transition-colors duration-200">
        <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 py-3.5 shadow-sm flex items-center justify-between no-print md:px-8">
          <div className="flex items-center gap-3">
            <img 
              src="https://lh3.googleusercontent.com/d/1ugonzA_1B-ukGoqRRUIQbLK8QPIzo26V" 
              alt="Sekolah Cendekia BAZNAS Logo" 
              className="h-10 w-auto object-contain shrink-0 rounded-xl"
              referrerPolicy="no-referrer"
            />
            <div>
              <span className="text-base font-black text-slate-900 dark:text-white leading-tight font-display tracking-tight">Cendekia Metrix</span>
              <p className="text-[10px] text-slate-500 font-medium">Bimbingan Konseling Mandiri • Teman CurhatKu</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleToggleTheme}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-emerald-600 dark:text-slate-400 border border-slate-150 dark:border-slate-700 transition-colors cursor-pointer"
            >
              {darkMode ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-5xl mx-auto w-full">
          <TemanCurhatAI
            profile={appState.profile}
            jenjang={appState.jenjang}
            onUpdateProfile={(next) => setAppState({ ...appState, profile: next })}
            onLogout={() => handleSetRole(null)}
          />
        </main>
        <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-4 text-center text-xs text-slate-400 no-print">
          <span>Dilindungi Bimbingan BK</span> • <span className="font-semibold text-emerald-600">Sekolah Cendekia BAZNAS (SCB)</span>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans flex flex-col transition-colors duration-200">
      
      {/* 1. Header Frame (Top panel) */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 py-3.5 shadow-sm flex items-center justify-between no-print md:px-8">
        <div className="flex items-center gap-4">
          {/* Mobile Draw trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 lg:hidden cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          
          <div className="flex items-center gap-3">
            <img 
              src="https://lh3.googleusercontent.com/d/1ugonzA_1B-ukGoqRRUIQbLK8QPIzo26V" 
              alt="Sekolah Cendekia BAZNAS Logo" 
              className="h-12 w-auto object-contain shrink-0 rounded-xl shadow-md transition-all hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight font-display tracking-tight">Cendekia Metrix</span>
                <span className="hidden sm:inline-block px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-wider">TA 2025/2026</span>
              </div>
              <p className="text-[10px] text-slate-550 dark:text-slate-400 font-medium">Asesmen Cerdas Siswa • Sekolah Cendekia BAZNAS</p>
            </div>
          </div>
        </div>

        {/* Sleek Theme and User Profile Status Chip */}
        <div className="flex items-center gap-4 sm:gap-6">
          <button
            onClick={handleToggleTheme}
            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-blue-600 dark:text-slate-400 border border-slate-150 dark:border-slate-700 transition-colors cursor-pointer"
            title={darkMode ? "Ubah ke Mode Terang" : "Ubah ke Mode Gelap"}
          >
            {darkMode ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4" />}
          </button>

          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>

          {userRole === "admin" ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wide font-mono">ADMIN MODE</div>
                <div className="text-[9px] text-slate-500 dark:text-slate-450 font-mono font-semibold uppercase tracking-wider">Sekolah Cendekia BAZNAS</div>
              </div>
              <button
                onClick={() => handleSetRole(null)}
                className="px-3.5 py-1.5 bg-red-650 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md font-mono"
              >
                Keluar Admin
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3.5">
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{appState.profile.nama || "Siswa Baru SCB"}</div>
                  <div className="text-[9px] text-slate-500 dark:text-slate-450 font-mono font-bold uppercase tracking-wider">{appState.profile.kelas || "Mencari Jalur..."}</div>
                </div>
                <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-805 border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-inner font-sans font-extrabold text-xs text-blue-605">
                  {appState.profile.nama ? appState.profile.nama[0].toUpperCase() : "S"}
                </div>
              </div>
              <button
                onClick={() => handleSetRole(null)}
                className="px-3 py-1.5 border border-slate-250 dark:border-slate-755 text-slate-600 dark:text-slate-400 hover:text-blue-650 rounded-xl text-[10px] uppercase font-bold tracking-wider font-mono cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-850"
              >
                Ganti Peran
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 2. Main Outer Layout Grid Frame */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto relative">
        
        {/* Sidebar Container Navigation for Tablet/Desktop */}
        <aside className="hidden lg:flex w-64 shrink-0 bg-slate-900 border-r border-slate-800 p-4 flex-col justify-between no-print sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="space-y-6">
            <div className="px-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest font-mono">Panel Navigasi</span>
            </div>
            
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-3 cursor-pointer ${
                      activeMenu === item.id
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/10 border-l-2 border-blue-450"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-slate-800">
            {/* Local Storage Indicator from Design specification */}
            <div className="bg-blue-950/40 p-3 rounded-xl border border-blue-900/60">
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-[9px] text-blue-200 font-bold font-mono tracking-wider uppercase">Local Storage Aktif</span>
              </div>
              <p className="text-[9px] text-blue-300 font-sans leading-relaxed">Sistem menyimpan bimbingan & progres Anda secara instan di browser ini.</p>
            </div>
            
            <div className="text-[9px] text-slate-500 leading-4 font-mono font-medium">
              <p className="flex items-center gap-1"><School className="h-2.5 w-2.5 shrink-0" /> SMA CENDEKIA SYSTEM</p>
            </div>
          </div>
        </aside>

        {/* Floating backdrop Draw mobile side menu menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm no-print" onClick={() => setMobileMenuOpen(false)}>
            <div className="w-64 h-full bg-slate-900 p-4 space-y-4 flex flex-col justify-between" onClick={(e) => e.stopPropagation()}>
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-transparent border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <img 
                      src="https://lh3.googleusercontent.com/d/1ugonzA_1B-ukGoqRRUIQbLK8QPIzo26V" 
                      alt="Sekolah Cendekia BAZNAS Logo" 
                      className="h-9 w-auto object-contain shrink-0 rounded-lg"
                      referrerPolicy="no-referrer"
                    />
                    <span className="font-bold text-sm text-white">Menu Navigasi</span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-white">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavigate(item.id)}
                        className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold transition-all flex items-center gap-3 ${
                          activeMenu === item.id
                            ? "bg-blue-600 text-white"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="text-[10px] text-slate-550 leading-4">
                © 2026 Sekolah Cendekia BAZNAS
              </div>
            </div>
          </div>
        )}

        {/* 3. Main interactive content frames canvas card */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 overflow-x-hidden">
          
          {/* Active Canvas Switcher routing */}
          {activeMenu === 0 && (
            
            /* High fidelity cohesive Dashboard Layout */
            <div className="space-y-6">
              
              {/* Profile Card and general alert */}
              <ProfileHeader appState={appState} onNavigate={handleNavigate} />
              
              {/* Modular widgets Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left columns (col-span 2) */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Global completion checker */}
                  <AssessmentProgress appState={appState} onNavigate={handleNavigate} />
                  
                  {/* Status matrices */}
                  <MappingProgress appState={appState} onNavigate={handleNavigate} />

                  {/* Competitiveness rankings */}
                  <StudentRanking appState={appState} onNavigate={handleNavigate} />
                </div>

                {/* Right sidebar details widgets */}
                <div className="space-y-6">
                  {appState.jenjang === "SMP" ? (
                    <>
                      {/* SMP Extracurricular and learning strategy tactics (paling penting) */}
                      <SmpExtracurricularAndStrategy appState={appState} onNavigate={handleNavigate} />

                      {/* SMP Descriptive detailed qualitative reports */}
                      <SmpDetailedEvaluation appState={appState} onNavigate={handleNavigate} />
                    </>
                  ) : (
                    <>
                      {/* Top highlight path */}
                      <MainPathwayRecommendation appState={appState} onNavigate={handleNavigate} />

                      {/* Compact potential paths */}
                      <PotentialPathways appState={appState} onNavigate={handleNavigate} />
                    </>
                  )}
                </div>

              </div>

            </div>
          )}

          {activeMenu === 1 && (
            <DataSiswa
              jenjang={appState.jenjang}
              profile={appState.profile}
              onChange={(next) => setAppState({ ...appState, profile: next })}
              onNext={() => handleNavigate(appState.jenjang === "SMP" ? 11 : 2)}
            />
          )}

          {activeMenu === 2 && (
            <Keagamaan
              state={appState.keagamaan}
              onChange={(next) => setAppState({ ...appState, keagamaan: next })}
              onNext={() => handleNavigate(3)}
              onPrev={() => handleNavigate(1)}
            />
          )}

          {activeMenu === 3 && (
            <Akademik
              state={appState.akademik}
              onChange={(next) => setAppState({ ...appState, akademik: next })}
              onNext={() => handleNavigate(4)}
              onPrev={() => handleNavigate(2)}
            />
          )}

          {activeMenu === 4 && (
            <PrestasiEkskul
              state={appState.prestasiEkskul}
              onChange={(next) => setAppState({ ...appState, prestasiEkskul: next })}
              onNext={() => handleNavigate(appState.jenjang === "SMP" ? 6 : 5)}
              onPrev={() => handleNavigate(appState.jenjang === "SMP" ? 11 : 3)}
              jenjang={appState.jenjang}
            />
          )}

          {activeMenu === 5 && (
            <MinatBakat
              state={appState.minatBakat}
              onChange={(next) => setAppState({ ...appState, minatBakat: next })}
              onNext={() => handleNavigate(6)}
              onPrev={() => handleNavigate(4)}
            />
          )}

          {activeMenu === 11 && (
            <GayaBelajar
              state={appState.gayaBelajar}
              onChange={(next) => setAppState({ ...appState, gayaBelajar: next })}
              onNext={() => handleNavigate(appState.jenjang === "SMP" ? 4 : 6)}
              onPrev={() => handleNavigate(1)}
            />
          )}

          {activeMenu === 6 && (
            <IQTest
              state={appState.iqTest}
              onChange={(next) => setAppState({ ...appState, iqTest: next })}
              onNext={() => handleNavigate(7)}
              onPrev={() => handleNavigate(appState.jenjang === "SMP" ? 4 : 5)}
            />
          )}

          {activeMenu === 7 && (
            <AIRecommendations
              appState={appState}
              onUpdateRecommendations={(next) => {
                setAppState({ ...appState, aiRecommendation: next });
              }}
              onNext={() => handleNavigate(appState.jenjang === "SMP" ? 12 : 8)}
              onPrev={() => handleNavigate(6)}
            />
          )}

          {activeMenu === 8 && (
            <Prediction
              appState={appState}
              onNext={() => handleNavigate(12)}
              onPrev={() => handleNavigate(7)}
            />
          )}

          {activeMenu === 12 && (
            <PortofolioMandiri
              state={appState.portfolio}
              onChange={(next) => setAppState({ ...appState, portfolio: next })}
              onNext={() => handleNavigate(9)}
              onPrev={() => handleNavigate(appState.jenjang === "SMP" ? 7 : 8)}
              jenjang={appState.jenjang}
              profile={appState.profile}
            />
          )}

          {activeMenu === 9 && (
            <LaporanAkhir appState={appState} isAdmin={userRole === "admin" || userRole === "bk_smp" || userRole === "bk_sma"} userRole={userRole} />
          )}

          {activeMenu === 10 && (
            <AdminAnalytics userRole={userRole} />
          )}

        </main>

      </div>

      {/* Modern footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-150 dark:border-gray-850 px-6 py-5 text-center text-xs text-gray-400 no-print flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-1">
          <span>Dilindungi Bimbingan BK</span> • <span className="font-semibold text-emerald-650">Sekolah Cendekia BAZNAS (SCB)</span>
        </div>
        <div className="flex items-center gap-1 text-[11px]">
          <span>Made with</span> <Heart className="h-3 w-3 text-rose-500 fill-rose-500" /> <span>for Education Excellence</span>
        </div>
      </footer>

    </div>
  );
}
