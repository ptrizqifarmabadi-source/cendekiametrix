/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from "react";
import { 
  Users, 
  BrainCircuit, 
  GraduationCap, 
  Compass, 
  TrendingUp, 
  Trash2, 
  Printer, 
  Search, 
  Sliders, 
  ChevronRight, 
  BookOpen, 
  Award,
  Filter,
  CheckCircle,
  HelpCircle,
  MessageCircle,
  ArrowUp,
  ThumbsUp,
  Sparkles,
  X
} from "lucide-react";
import RekapHasilSiswa from "./RekapHasilSiswa";
import { FullAppState } from "../types";

const EMPTY_APP_STATE: FullAppState = {
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
  jenjang: "SMA",
  gayaBelajar: {
    answers: {},
    completed: false
  }
};

interface CompletedTestRecord {
  id: string;
  nama: string;
  nisn: string;
  kelas: string;
  avgRapor: number;
  iqScore: number;
  iqCategory: string;
  topRiasec: string[];
  rekomendasiJurusan: string[];
  tanggalTes: string;
  isUserAdded?: boolean;
  portfolio?: any;
}

const DEFAULT_RECORDS: CompletedTestRecord[] = [];

interface AdminAnalyticsProps {
  userRole?: string | null;
}

export default function AdminAnalytics({ userRole }: AdminAnalyticsProps) {
  const [records, setRecords] = useState<CompletedTestRecord[]>([]);
  const [activeClassFilter, setActiveClassFilter] = useState<string>("All");
  const [syncKey, setSyncKey] = useState<number>(0);
  const [chatRecords, setChatRecords] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any | null>(null);

  // States for login tracking statistics
  const [studentLoginCounts, setStudentLoginCounts] = useState<{ [nisn: string]: any }>({});
  const [bkLoginCounts, setBkLoginCounts] = useState<{ [username: string]: any }>({});
  const [studentLoginSearch, setStudentLoginSearch] = useState("");
  const [studentLoginFilterJenjang, setStudentLoginFilterJenjang] = useState<"ALL" | "SMP" | "SMA">("ALL");
  const [studentLoginFilterActivity, setStudentLoginFilterActivity] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  const loadLoginCounts = () => {
    const rawStudents = localStorage.getItem("sipetakuliah_student_login_counts");
    if (rawStudents) {
      try {
        setStudentLoginCounts(JSON.parse(rawStudents));
      } catch (e) {
        setStudentLoginCounts({});
      }
    } else {
      setStudentLoginCounts({});
    }

    const rawBk = localStorage.getItem("sipetakuliah_bk_login_counts");
    if (rawBk) {
      try {
        setBkLoginCounts(JSON.parse(rawBk));
      } catch (e) {
        setBkLoginCounts({});
      }
    } else {
      setBkLoginCounts({});
    }
  };

  // States for verification and approval of self-registered students
  const [registeredStudents, setRegisteredStudents] = useState<any[]>([]);

  const loadRegisteredStudentsList = () => {
    const rawList = localStorage.getItem("sipetakuliah_registered_students");
    if (rawList) {
      try {
        const list = JSON.parse(rawList);
        setRegisteredStudents(list);
      } catch (e) {
        setRegisteredStudents([]);
      }
    } else {
      setRegisteredStudents([]);
    }
  };

  const handleApproveStudent = (nisn: string) => {
    const rawList = localStorage.getItem("sipetakuliah_registered_students");
    if (!rawList) return;
    try {
      const list = JSON.parse(rawList);
      const updated = list.map((s: any) => {
        if (s.nisn === nisn) {
          return { ...s, approved: true };
        }
        return s;
      });
      localStorage.setItem("sipetakuliah_registered_students", JSON.stringify(updated));
      loadRegisteredStudentsList();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectStudent = (nisn: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menolak & menghapus pengajuan pendaftaran siswa ini?")) return;
    const rawList = localStorage.getItem("sipetakuliah_registered_students");
    if (!rawList) return;
    try {
      const list = JSON.parse(rawList);
      const updated = list.filter((s: any) => s.nisn !== nisn);
      localStorage.setItem("sipetakuliah_registered_students", JSON.stringify(updated));
      loadRegisteredStudentsList();
    } catch (e) {
      console.error(e);
    }
  };

  // Direct physical BK Messaging and summarization states
  const [directMessages, setDirectMessages] = useState<any[]>([]);
  const [replyTexts, setReplyTexts] = useState<{ [msgId: string]: string }>({});
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summariesCache, setSummariesCache] = useState<{ [nisn: string]: { summary: string; actionItems: string[] } }>({});

  // Forum / Quora States for Teacher
  const [forumDiscussions, setForumDiscussions] = useState<any[]>([]);
  const [forumSearchQuery, setForumSearchQuery] = useState("");
  const [forumSelectedCategory, setForumSelectedCategory] = useState("Semua Tema");
  const [forumActiveDiscId, setForumActiveDiscId] = useState<string | null>(null);
  const [forumReplyText, setForumReplyText] = useState("");

  const loadForumDiscussions = () => {
    const raw = localStorage.getItem("sipetakuliah_quora_discussions");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setForumDiscussions(parsed);
      } catch (e) {
        setForumDiscussions([]);
      }
    } else {
      setForumDiscussions([]);
    }
  };

  const handleTeacherUpvoteQuestion = (discId: string) => {
    const updated = forumDiscussions.map((disc) => {
      if (disc.id === discId) {
        const hasUpvoted = disc.upvotedBy.includes("STAFF_BK");
        const upvotedBy = hasUpvoted
          ? disc.upvotedBy.filter((n: string) => n !== "STAFF_BK")
          : [...disc.upvotedBy, "STAFF_BK"];
        const upvotes = hasUpvoted ? disc.upvotes - 1 : disc.upvotes + 1;
        return { ...disc, upvotedBy, upvotes };
      }
      return disc;
    });
    setForumDiscussions(updated);
    localStorage.setItem("sipetakuliah_quora_discussions", JSON.stringify(updated));
  };

  const handleTeacherUpvoteAnswer = (discId: string, ansId: string) => {
    const updated = forumDiscussions.map((disc) => {
      if (disc.id === discId) {
        const updatedAnswers = disc.answers.map((ans: any) => {
          if (ans.id === ansId) {
            const hasUpvoted = ans.upvotedBy.includes("STAFF_BK");
            const upvotedBy = hasUpvoted
              ? ans.upvotedBy.filter((n: string) => n !== "STAFF_BK")
              : [...ans.upvotedBy, "STAFF_BK"];
            const upvotes = hasUpvoted ? ans.upvotes - 1 : ans.upvotes + 1;
            return { ...ans, upvotedBy, upvotes };
          }
          return ans;
        });
        return { ...disc, answers: updatedAnswers };
      }
      return disc;
    });
    setForumDiscussions(updated);
    localStorage.setItem("sipetakuliah_quora_discussions", JSON.stringify(updated));
  };

  const handleTeacherAddAnswer = (discId: string) => {
    if (!forumReplyText.trim()) return;

    const teacherName = userRole === "bk_smp" 
      ? "Guru BK SMP SCB" 
      : userRole === "bk_sma" 
      ? "Guru BK SMA SCB" 
      : userRole?.startsWith("walas_")
      ? `Wali Kelas Angkatan ${userRole.split("_")[1]} SCB`
      : "Admin BK SCB";
    const newAnswer = {
      id: "ans_teacher_" + Date.now(),
      content: forumReplyText.trim(),
      studentName: teacherName,
      studentNisn: "BK_STAFF",
      studentJenjang: "Staf BK",
      studentKelas: "Staf Layanan BK",
      timestamp: new Date().toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }),
      upvotes: 0,
      upvotedBy: []
    };

    const updated = forumDiscussions.map((disc) => {
      if (disc.id === discId) {
        return {
          ...disc,
          answers: [...disc.answers, newAnswer]
        };
      }
      return disc;
    });

    setForumDiscussions(updated);
    localStorage.setItem("sipetakuliah_quora_discussions", JSON.stringify(updated));
    setForumReplyText("");
  };

  const handleDeleteQuestion = (discId: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus topik diskusi ini secara permanen dari forum? Tindakan ini tidak bisa dibatalkan.")) {
      return;
    }
    const updated = forumDiscussions.filter((d) => d.id !== discId);
    setForumDiscussions(updated);
    localStorage.setItem("sipetakuliah_quora_discussions", JSON.stringify(updated));
    if (forumActiveDiscId === discId) {
      setForumActiveDiscId(null);
    }
  };

  // Load counseling chats from local storage
  const loadChats = () => {
    const raw = localStorage.getItem("sipetakuliah_counseling_chats");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        let filtered = parsed;
        if (userRole === "bk_smp") {
          filtered = parsed.filter((c: any) => c.jenjang === "SMP");
        } else if (userRole === "bk_sma") {
          filtered = parsed.filter((c: any) => c.jenjang === "SMA");
        } else if (userRole?.startsWith("walas_")) {
          const angkatanNum = userRole.split("_")[1];
          const angkatanName = `Angkatan ${angkatanNum}`;
          filtered = parsed.filter((c: any) => c.kelas === angkatanName || c.angkatan === angkatanName);
        }
        setChatRecords(filtered);
      } catch (e) {
        setChatRecords([]);
      }
    } else {
      setChatRecords([]);
    }
  };

  // Load direct BK messages
  const loadDirectMessages = () => {
    const raw = localStorage.getItem("sipetakuliah_direct_bk_messages");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        let filtered = parsed;
        if (userRole === "bk_smp") {
          filtered = parsed.filter((m: any) => m.jenjang === "SMP");
        } else if (userRole === "bk_sma") {
          filtered = parsed.filter((m: any) => m.jenjang === "SMA");
        } else if (userRole?.startsWith("walas_")) {
          const angkatanNum = userRole.split("_")[1];
          const angkatanName = `Angkatan ${angkatanNum}`;
          filtered = parsed.filter((m: any) => m.kelas === angkatanName || m.angkatan === angkatanName);
        }
        setDirectMessages(filtered);
      } catch (e) {
        setDirectMessages([]);
      }
    } else {
      setDirectMessages([]);
    }
  };

  // Load evaluation summaries cache
  const loadSummaries = () => {
    const raw = localStorage.getItem("sipetakuliah_counseling_summaries");
    if (raw) {
      try {
        setSummariesCache(JSON.parse(raw));
      } catch (e) {
        setSummariesCache({});
      }
    } else {
      setSummariesCache({});
    }
  };

  // Load records from local storage or set defaults
  const loadRecords = () => {
    const stored = localStorage.getItem("sipetakuliah_cohort_recap");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as CompletedTestRecord[];
        // Filter out any older mock/dummy records that are not explicitly user-added
        const cleaned = parsed.filter(r => r.isUserAdded === true);
        
        // Save cleaned back to local storage (keep absolute database intact)
        localStorage.setItem("sipetakuliah_cohort_recap", JSON.stringify(cleaned));

        // Filter local state based on roles
        let filtered = cleaned;
        if (userRole === "bk_smp") {
          filtered = cleaned.filter(st => st.kelas && (st.kelas.includes("7") || st.kelas.includes("8") || st.kelas.includes("9") || st.kelas.toLowerCase().includes("smp")));
        } else if (userRole === "bk_sma") {
          filtered = cleaned.filter(st => st.kelas && (st.kelas.includes("10") || st.kelas.includes("11") || st.kelas.includes("12") || st.kelas.toLowerCase().includes("sma") || st.kelas.toLowerCase().includes("ma")));
        } else if (userRole?.startsWith("walas_")) {
          const angkatanNum = userRole.split("_")[1];
          const angkatanName = `Angkatan ${angkatanNum}`;
          filtered = cleaned.filter(st => st.kelas === angkatanName || (st as any).angkatan === angkatanName);
        }
        setRecords(filtered);
      } catch (e) {
        setRecords(DEFAULT_RECORDS);
      }
    } else {
      setRecords(DEFAULT_RECORDS);
      localStorage.setItem("sipetakuliah_cohort_recap", JSON.stringify(DEFAULT_RECORDS));
    }
  };

  useEffect(() => {
    loadRecords();
    loadChats();
    loadDirectMessages();
    loadSummaries();
    loadRegisteredStudentsList();
    loadLoginCounts();
    loadForumDiscussions();
    
    // Listen to localstorage changes to synchronize live
    const handleStorageChange = () => {
      loadRecords();
      loadChats();
      loadDirectMessages();
      loadSummaries();
      loadRegisteredStudentsList();
      loadLoginCounts();
      loadForumDiscussions();
      setSyncKey((prev) => prev + 1);
    };
    
    window.addEventListener("storage", handleStorageChange);
    // Periodically sync
    const interval = setInterval(() => {
      loadRecords();
      loadChats();
      loadDirectMessages();
      loadRegisteredStudentsList();
      loadLoginCounts();
      loadForumDiscussions();
    }, 2000);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleSummarizeChat = async (studentNisn: string) => {
    if (!selectedChat || isSummarizing) return;
    setIsSummarizing(true);
    try {
      const response = await fetch("/api/summarize-dialog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: selectedChat.messages,
          studentInfo: {
            nama: selectedChat.nama,
            nisn: selectedChat.nisn,
            kelas: selectedChat.kelas,
            jenjang: selectedChat.jenjang
          }
        })
      });
      const data = await response.json();
      
      const updatedCache = {
        ...summariesCache,
        [studentNisn]: {
          summary: data.summary || "Transkrip dialog curhat ini sangat singkat. Siswa terlihat menceritakan kondisinya secara berkala.",
          actionItems: data.actionItems || [
            "Ajak murid berdiskusi santai di sela-sela waktu asrama.",
            "Lakukan validasi emosi dan berika solusi akomodatif.",
            "Konsolidasikan ke pembina asrama santri."
          ]
        }
      };
      
      localStorage.setItem("sipetakuliah_counseling_summaries", JSON.stringify(updatedCache));
      setSummariesCache(updatedCache);
    } catch (err) {
      console.error("Error summarizing chat:", err);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleReplyDirectMessage = (msgId: string) => {
    const replyText = replyTexts[msgId];
    if (!replyText || !replyText.trim()) return;

    const raw = localStorage.getItem("sipetakuliah_direct_bk_messages");
    if (!raw) return;

    try {
      const allMsgs = JSON.parse(raw);
      const updated = allMsgs.map((m: any) => {
        if (m.id === msgId) {
          return {
            ...m,
            status: "Sudah Ditanggapi",
            response: {
              responseText: replyText.trim(),
              repliedBy: userRole === "bk_smp" ? "Guru BK SMP" : userRole === "bk_sma" ? "Guru BK SMA" : "Admin BK SCB",
              timestamp: new Date().toLocaleString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })
            }
          };
        }
        return m;
      });

      localStorage.setItem("sipetakuliah_direct_bk_messages", JSON.stringify(updated));
      setReplyTexts(prev => ({ ...prev, [msgId]: "" }));
      loadDirectMessages();
    } catch (e) {
      console.error("Error replying to direct message:", e);
    }
  };

  const handleDeleteDirectMessage = (msgId: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus pesan kesiswaan ini dari basis data?")) return;
    const raw = localStorage.getItem("sipetakuliah_direct_bk_messages");
    if (!raw) return;
    try {
      const all = JSON.parse(raw);
      const filtered = all.filter((m: any) => m.id !== msgId);
      localStorage.setItem("sipetakuliah_direct_bk_messages", JSON.stringify(filtered));
      loadDirectMessages();
    } catch (e) {}
  };

  // Filter records based on selected class
  const filteredRecords = records.filter(
    (rec) => activeClassFilter === "All" || rec.kelas === activeClassFilter
  );

  const isSmp = userRole === "bk_smp" || (filteredRecords.length > 0 && filteredRecords.every(st => st.kelas && (st.kelas.includes("7") || st.kelas.includes("8") || st.kelas.includes("9") || st.kelas.toLowerCase().includes("smp"))));

  // 1. DYNAMIC LIST OF AVAILABLE CLASSES
  const baseClasses = [
    "Angkatan 5",
    "Angkatan 6",
    "Angkatan 7",
    "Angkatan 8",
    "Angkatan 9",
    "Angkatan 10"
  ];

  const availableClasses = [
    "All", 
    ...baseClasses,
    ...(Array.from(new Set(records.map((r) => r.kelas))) as string[]).filter(c => c && !baseClasses.includes(c))
  ];

  // 2. STATISTICS COMPUTATION
  const totalStudents = filteredRecords.length;
  
  const avgIq = totalStudents 
    ? Math.round(filteredRecords.reduce((acc, curr) => acc + curr.iqScore, 0) / totalStudents)
    : 0;

  const avgAkademik = totalStudents
    ? Number((filteredRecords.reduce((acc, curr) => acc + curr.avgRapor, 0) / totalStudents).toFixed(1))
    : 0;

  // Compute common RIASEC Type
  const riasecCounts: Record<string, number> = {};
  filteredRecords.forEach((rec) => {
    if (rec.topRiasec && rec.topRiasec.length > 0) {
      const topType = rec.topRiasec[0]; // Take dominant first letter
      riasecCounts[topType] = (riasecCounts[topType] || 0) + 1;
    }
  });
  
  let dominantRiasec = "Belum Ada";
  let maxCount = 0;
  Object.entries(riasecCounts).forEach(([type, count]) => {
    if (count > maxCount) {
      maxCount = count;
      dominantRiasec = type;
    }
  });

  // 3. IQ CATEGORY GROUPING WITH NAMES
  const iqRanges = [
    { label: "Sangat Superior (Skor ≥ 130)", min: 130, max: 200, color: "bg-indigo-600 dark:bg-indigo-500", text: "text-indigo-600 dark:text-indigo-400" },
    { label: "Superior (Skor 120-129)", min: 120, max: 129, color: "bg-purple-600 dark:bg-purple-500", text: "text-purple-600 dark:text-purple-450" },
    { label: "Rata-rata Tinggi (Skor 110-119)", min: 110, max: 119, color: "bg-blue-600 dark:bg-blue-500", text: "text-blue-605 dark:text-blue-400" },
    { label: "Rata-rata (Skor 90-109)", min: 90, max: 109, color: "bg-teal-605 dark:bg-teal-500", text: "text-teal-650 dark:text-teal-400" },
    { label: "Rata-rata Bawah (Skor < 90)", min: 0, max: 89, color: "bg-amber-500 dark:bg-amber-500", text: "text-amber-500 dark:text-amber-400" }
  ];

  const iqDistribution = iqRanges.map(range => {
    const students = filteredRecords.filter(r => r.iqScore >= range.min && r.iqScore <= range.max);
    const percentage = totalStudents ? Math.round((students.length / totalStudents) * 100) : 0;
    return {
      ...range,
      students,
      percentage,
      count: students.length
    };
  });

  // 4. RIASEC DETAILED BREAKDOWN WITH LIST OF NAMES
  const hollandCats = [
    { label: "Realistic (R)", prefix: "Realistic", color: "bg-red-500", hoverColor: "group-hover:bg-red-650" },
    { label: "Investigative (I)", prefix: "Investigative", color: "bg-emerald-500", hoverColor: "group-hover:bg-emerald-650" },
    { label: "Artistic (A)", prefix: "Artistic", color: "bg-amber-500", hoverColor: "group-hover:bg-amber-655" },
    { label: "Social (S)", prefix: "Social", color: "bg-sky-500", hoverColor: "group-hover:bg-sky-650" },
    { label: "Enterprising (E)", prefix: "Enterprising", color: "bg-indigo-500", hoverColor: "group-hover:bg-indigo-650" },
    { label: "Conventional (C)", prefix: "Conventional", color: "bg-pink-500", hoverColor: "group-hover:bg-pink-655" }
  ];

  const riasecDistribution = hollandCats.map(cat => {
    // Count students who have this category as part of their topRiasec
    // Or prioritize students where this category is ranked 1st
    const studentsWithCat = filteredRecords.filter(r => 
      r.topRiasec && r.topRiasec.some(tr => tr.startsWith(cat.prefix))
    );
    const isFirstRankStudents = filteredRecords.filter(r => 
      r.topRiasec && r.topRiasec[0] && r.topRiasec[0].startsWith(cat.prefix)
    );
    
    return {
      ...cat,
      students: studentsWithCat,
      firstRankCount: isFirstRankStudents.length,
      percentage: totalStudents ? Math.round((studentsWithCat.length / totalStudents) * 100) : 0,
      totalCount: studentsWithCat.length
    };
  });

  // 5. RAPOR VALUE SEGMENTATION
  const raporRanges = [
    { label: "Amat Sangat Unggul (≥ 91)", min: 91, max: 100, color: "bg-emerald-600" },
    { label: "Unggul Kompetitif (85-90)", min: 85, max: 90, color: "bg-blue-600" },
    { label: "Rata-rata Baik (75-84)", min: 75, max: 84, color: "bg-yellow-500" },
    { label: "Membutuhkan Bimbingan (< 75)", min: 0, max: 74, color: "bg-rose-500" }
  ];

  const raporDistribution = raporRanges.map(range => {
    const students = filteredRecords.filter(r => r.avgRapor >= range.min && r.avgRapor <= range.max);
    return {
      ...range,
      students,
      count: students.length,
      percentage: totalStudents ? Math.round((students.length / totalStudents) * 100) : 0
    };
  });

  // 6. POPULAR PROGRAM OF STUDIES MODEL COUNT
  const majorPopularity: Record<string, { count: number, students: string[] }> = {};
  filteredRecords.forEach(r => {
    r.rekomendasiJurusan.forEach(m => {
      if (!majorPopularity[m]) {
        majorPopularity[m] = { count: 0, students: [] };
      }
      majorPopularity[m].count += 1;
      if (!majorPopularity[m].students.includes(r.nama)) {
        majorPopularity[m].students.push(r.nama);
      }
    });
  });

  const sortedMajors = Object.entries(majorPopularity)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* 1. Header Admin Panel */}
      <div className="bg-gradient-to-r from-slate-905 to-slate-805 text-white rounded-3xl p-6 md:p-8 border border-slate-800 shadow-xl relative overflow-hidden no-print">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-650/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/5 rounded-full blur-2xl"></div>

        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600/20 text-red-400 border border-red-500/20 rounded-full text-[10px] font-extrabold uppercase font-mono tracking-widest">
              Portal Analitik &amp; BK Sekolah Cendekia BAZNAS
            </div>
            
            <h2 className="text-2xl md:text-3.5xl font-black tracking-tight font-display">
              Dashboard <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-300">Infografis &amp; Rekap</span> 
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {isSmp 
                ? "Pemantauan sebaran kecerdasan kognitif (IQ), karakter gaya belajar (VAK), prestasi akademis rapor, serta pemetaan minat bakat ekstrakurikuler kesiswaan bagi santri secara real-time."
                : "Pemantauan sebaran kecerdasan kognitif (IQ), karakter karir Holland (RIASEC), prestasi akademis rapor, serta pemetaan bimbingan karir pendaftaran kuliah bagi santri secara real-time."}
            </p>
          </div>

          <button
            onClick={handlePrintReport}
            className="px-5 py-3 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 hover:border-slate-350 rounded-2xl text-xs font-black shadow-lg hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 font-mono"
          >
            <Printer className="h-4.5 w-4.5 text-blue-650" />
            CETAK LAPORAN BK
          </button>
        </div>
      </div>

      {/* Printable Report Header (Hidden on screen, visible during printing) */}
      <div className="hidden print:block space-y-4 text-center border-b-2 border-slate-900 pb-4">
        <h2 className="text-lg font-black uppercase">SEKOLAH CENDEKIA BAZNAS (SCB)</h2>
        <h1 className="text-2xl font-bold tracking-wide">
          {isSmp ? "LAPORAN REKAPITULASI ASESMEN PENGEMBANGAN DIRI & MINAT SISWA SMP" : "LAPORAN REKAPITULASI ASESMEN BIMBINGAN KARIR & KULIAH"}
        </h1>
        <p className="text-xs font-mono">
          Tanggal Cetak: {new Date().toLocaleDateString("id-ID")} • Status Kelas: {activeClassFilter === "All" ? "Semua Kelas Terdaftar" : activeClassFilter}
        </p>
      </div>

      {/* 2. Class filter selector rail */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print sm:sticky sm:top-20 sm:z-10 bg-opacity-95 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono uppercase tracking-wider">
            Saring Analitik:
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {availableClasses.map((cls) => (
            <button
              key={cls}
              onClick={() => setActiveClassFilter(cls)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeClassFilter === cls
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow"
                  : "bg-slate-50 dark:bg-slate-950 text-slate-650 dark:text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-850"
              }`}
            >
              {cls === "All" ? "Semua Kelas" : cls}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Master statistics widgets cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        
        {/* Metric 1 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Total Santri Pasca-Tes</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/45 text-blue-650 dark:text-blue-400 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-black text-slate-905 dark:text-white font-display">
              {totalStudents} <span className="text-xs text-slate-500 font-semibold font-mono">Santri</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Mengisi instrumen di browser</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Rerata IQ Kognitif</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/45 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <BrainCircuit className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-black text-purple-700 dark:text-purple-400 font-display">
              {avgIq} 
            </div>
            <div className="inline-flex items-center gap-1 mt-1 text-[10px] text-purple-650 dark:text-purple-300 font-bold font-mono">
              ★ {avgIq >= 120 ? "Superior" : avgIq >= 110 ? "Rata-rata Tinggi" : "Rata-rata"}
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Rata-Rata Rapor</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/45 text-emerald-650 dark:text-emerald-400 flex items-center justify-center">
              <GraduationCap className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-black text-emerald-700 dark:text-emerald-400 font-display">
              {avgAkademik}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Skala 0 s/d 100 akademik</p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Holland Terkuat</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/45 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Compass className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-lg md:text-xl font-bold text-indigo-650 dark:text-indigo-400 truncate">
              {dominantRiasec}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Paling mendominasi santri</p>
          </div>
        </div>

      </div>

      {/* Persetujuan Daftar Akun Mandiri (Persetujuan Pendaftaran) */}
      {(() => {
        const pendingStudents = registeredStudents.filter((s: any) => {
          const isPending = s.approved === false;
          if (!isPending) return false;
          
          if (userRole === "bk_smp") {
            return s.jenjang === "SMP";
          }
          if (userRole === "bk_sma") {
            return s.jenjang === "SMA";
          }
          return true; // BK SCB / Admin gets all
        });

        return (
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 no-print">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-blue-600 dark:text-blue-450 font-mono uppercase tracking-wider">
                  Antrean Verifikasi Keanggotaan
                </div>
                <h3 className="text-lg font-black text-slate-905 dark:text-white font-display flex items-center gap-2">
                  <span className="p-1 px-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 text-xs font-semibold">Pendaftaran</span>
                  Persetujuan Pendaftaran Akun Siswa Baru (ACC)
                </h3>
                <p className="text-xs text-slate-550 dark:text-slate-400">
                  Berikut pengajuan pendaftaran akun secara mandiri oleh santri. Klik &ldquo;ACC/Setujui&rdquo; untuk mengizinkan login siswa ke aplikasi atau &ldquo;Tolak&rdquo; jika fiktif.
                </p>
              </div>
              {pendingStudents.length > 0 && (
                <span className="px-2.5 py-1 bg-red-100 dark:bg-red-950/70 text-red-750 dark:text-red-450 font-bold font-mono text-[10px] rounded-full uppercase animate-pulse shrink-0">
                  ● {pendingStudents.length} Pengajuan Tertunda
                </span>
              )}
            </div>

            {pendingStudents.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 dark:bg-slate-950/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <span className="text-3xl block mb-2">👤</span>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Tidak Ada Pengajuan Pending</h4>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
                  Semua pendaftaran santri mandiri telah disetujui / tidak ada pengajuan pendaftaran baru yang tertunda.
                </p>
              </div>
            ) : (
              <div className="border border-slate-150 dark:border-slate-800/80 rounded-2xl overflow-hidden bg-slate-50/20 dark:bg-slate-950/20 overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 text-slate-450 border-b border-slate-150 dark:border-slate-800 font-mono text-[9px] uppercase tracking-wider">
                      <th className="p-3">Nama Santri</th>
                      <th className="p-3">Username / NISN</th>
                      <th className="p-3">Jenjang</th>
                      <th className="p-3">Kelompok (Gender)</th>
                      <th className="p-3">Angkatan</th>
                      <th className="p-3 text-right">Aksi Penyetujuan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {pendingStudents.map((student: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-850/40 transition-colors">
                        <td className="p-3 font-bold text-slate-900 dark:text-white">
                          {student.nama}
                        </td>
                        <td className="p-3 font-mono text-slate-650 dark:text-slate-350 font-medium">
                          {student.nisn}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase font-mono ${
                            student.jenjang === "SMP"
                              ? "bg-purple-100 dark:bg-purple-950/40 text-purple-705 dark:text-purple-400"
                              : "bg-blue-100 dark:bg-blue-950/40 text-blue-705 dark:text-blue-400"
                          }`}>
                            {student.jenjang}
                          </span>
                        </td>
                        <td className="p-3 font-medium text-slate-700 dark:text-slate-300">
                          {student.gender}
                        </td>
                        <td className="p-3 font-mono text-slate-550 dark:text-slate-400">
                          {student.angkatan}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleRejectStudent(student.nisn)}
                              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 dark:text-rose-450 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold transition-all cursor-pointer font-mono uppercase"
                            >
                              Tolak
                            </button>
                            <button
                              onClick={() => handleApproveStudent(student.nisn)}
                              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow shadow-emerald-500/10 rounded-xl text-[10px] font-bold transition-all cursor-pointer font-mono uppercase"
                            >
                              ✓ Setujui (ACC)
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })()}

      {/* SECTION: AKTIVITAS LOGIN BK & SISWA */}
      {(() => {
        // Calculate student login counts mapped with official/registered list
        const studentLoginsComputed = registeredStudents.map((student: any) => {
          const nisnKey = student.nisn.trim();
          const tracked = studentLoginCounts[nisnKey] || {};
          return {
            nama: student.nama,
            nisn: student.nisn,
            jenjang: student.jenjang,
            angkatan: student.angkatan || "Angkatan 5",
            gender: student.gender,
            count: tracked.count || 0,
            lastLogin: tracked.lastLogin || "-"
          };
        });

        // Filter student logins based on user controls
        const filteredStudentLogins = studentLoginsComputed.filter((student) => {
          const matchesSearch = student.nama.toLowerCase().includes(studentLoginSearch.toLowerCase()) ||
                                student.nisn.toLowerCase().includes(studentLoginSearch.toLowerCase());
          
          const matchesJenjang = studentLoginFilterJenjang === "ALL" || student.jenjang === studentLoginFilterJenjang;
          
          const matchesActivity = studentLoginFilterActivity === "ALL" ||
            (studentLoginFilterActivity === "ACTIVE" && student.count > 0) ||
            (studentLoginFilterActivity === "INACTIVE" && student.count === 0);

          // Role-based scoping (BK SMP only sees SMP, BK SMA only SMA, Admin sees all)
          const matchesRole = userRole === "admin" ||
            (userRole === "bk_smp" && student.jenjang === "SMP") ||
            (userRole === "bk_sma" && student.jenjang === "SMA") ||
            (userRole?.startsWith("walas_") && (student.angkatan === `Angkatan ${userRole.split("_")[1]}` || student.kelas === `Angkatan ${userRole.split("_")[1]}`));

          return matchesSearch && matchesJenjang && matchesActivity && matchesRole;
        });

        // Compute helper stats
        const totalStudentLoginsCount = studentLoginsComputed.reduce((acc, curr) => acc + curr.count, 0);
        const loggedInAtLeastOnceCount = studentLoginsComputed.filter(s => s.count > 0).length;

        const getBKCount = (username: string) => {
          const tracked = bkLoginCounts[username] || {};
          return {
            count: tracked.count || 0,
            lastLogin: tracked.lastLogin || "-"
          };
        };

        const bkAccounts = [
          { username: "admin", label: "BK SCB (Super Admin)", color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-250 dark:border-emerald-900" },
          { username: "BKSMP", label: "Guru BK SMP", color: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-250 dark:border-purple-900" },
          { username: "BKSMA", label: "Guru BK SMA", color: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-250 dark:border-blue-900" }
        ];

        return (
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 no-print">
            
            {/* Header section with stats overview banner */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-emerald-650 dark:text-emerald-400 font-mono uppercase tracking-wider">
                  Sistem Pemantauan Akses &amp; Keaktifan
                </div>
                <h3 className="text-lg font-black text-slate-905 dark:text-white font-display flex items-center gap-2">
                  <span className="p-1 px-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-650 text-xs font-semibold">Monitoring</span>
                  Riwayat &amp; Intensitas Login (BK &amp; Siswa)
                </h3>
                <p className="text-xs text-slate-550 dark:text-slate-400">
                  Daftar rekapitulasi pelaporan total aktivitas masuk oleh pendidik (Guru BK) dan santri demi audit internal ekosistem bimbingan.
                </p>
              </div>

              {/* Total overview badges */}
              <div className="flex flex-wrap gap-2">
                <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl text-left">
                  <span className="text-[9px] text-slate-450 dark:text-slate-400 block font-mono uppercase">Total Login Siswa</span>
                  <span className="text-xs font-extrabold text-slate-850 dark:text-white font-mono">{totalStudentLoginsCount} Kali</span>
                </div>
                <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl text-left">
                  <span className="text-[9px] text-slate-450 dark:text-slate-400 block font-mono uppercase">Siswa Aktif Login</span>
                  <span className="text-xs font-extrabold text-emerald-650 font-mono">{loggedInAtLeastOnceCount} / {studentLoginsComputed.length} Siswa</span>
                </div>
              </div>
            </div>

            {/* Core dashboard grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* COL 1: Counselor / BK Logins (Left 1/3) */}
              <div className="space-y-4 lg:col-span-1 border-r-0 lg:border-r border-slate-100 dark:border-slate-800 pr-0 lg:pr-6">
                <div>
                  <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider font-mono mb-1">
                    Aktivitas Akun Guru BK
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Frekuensi keaktifan dan update login harian para asatidzah / pembimbing BK sekolah.
                  </p>
                </div>

                <div className="space-y-3">
                  {bkAccounts.map((account) => {
                    const stats = getBKCount(account.username);
                    return (
                      <div 
                        key={account.username} 
                        className={`p-4 rounded-2xl border ${account.color} transition-all space-y-2 relative overflow-hidden`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-xs font-black font-display tracking-tight block">
                            {account.label}
                          </span>
                          <span className="px-2 py-0.5 bg-white/70 dark:bg-black/20 text-[9px] font-mono rounded font-bold uppercase">
                            ID: {account.username}
                          </span>
                        </div>

                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                            {stats.count}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">Login</span>
                        </div>

                        <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800/30 flex items-center gap-1.5 text-[10px] text-slate-505 font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>Last login: <span className="text-slate-700 dark:text-slate-300 font-bold">{stats.lastLogin}</span></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* COL 2 & 3: Student Logins Table (Right 2/3) */}
              <div className="space-y-4 lg:col-span-2">
                
                {/* Filters Row */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari siswa berdasarkan nama / NISN..."
                      value={studentLoginSearch}
                      onChange={(e) => setStudentLoginSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none dark:text-white"
                    />
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {/* Jenjang filter */}
                    <div className="inline-flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl text-[10px] font-bold border border-slate-200/60 dark:border-slate-850">
                      {(["ALL", "SMP", "SMA"] as const).map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setStudentLoginFilterJenjang(opt)}
                          className={`px-2.5 py-1 rounded-lg transition-all capitalize cursor-pointer ${
                            studentLoginFilterJenjang === opt
                              ? "bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white"
                              : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          }`}
                        >
                          {opt === "ALL" ? "Semua" : opt}
                        </button>
                      ))}
                    </div>

                    {/* Active vs Inactive filter */}
                    <div className="inline-flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl text-[10px] font-bold border border-slate-200/60 dark:border-slate-850">
                      {(["ALL", "ACTIVE", "INACTIVE"] as const).map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setStudentLoginFilterActivity(opt)}
                          className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                            studentLoginFilterActivity === opt
                              ? "bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white"
                              : "text-slate-400 hover:text-slate-605 dark:hover:text-slate-200"
                          }`}
                        >
                          {opt === "ALL" ? "Semua Status" : opt === "ACTIVE" ? "Aktif" : "Belum Pernah"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Table wrapper */}
                <div className="border border-slate-150 dark:border-slate-800/80 rounded-2xl overflow-hidden bg-slate-50/20 dark:bg-slate-950/20 overflow-x-auto">
                  <div className="max-h-[350px] overflow-y-auto">
                    <table className="w-full text-xs text-left border-collapse table-auto">
                      <thead className="sticky top-0 bg-slate-50 dark:bg-slate-950 text-slate-450 border-b border-slate-150 dark:border-slate-800 font-mono text-[9px] uppercase tracking-wider z-10 shadow-sm">
                        <tr>
                          <th className="p-3">Nama Santri</th>
                          <th className="p-3">NISN</th>
                          <th className="p-3">Jenjang</th>
                          <th className="p-3">Kelas / Angkatan</th>
                          <th className="p-3 text-center">Jumlah Login</th>
                          <th className="p-3 text-right">Informasi Login Akhir</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {filteredStudentLogins.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center py-10 text-slate-400">
                              <span className="block text-2xl mb-1">🔍</span>
                              <p className="font-bold text-xs text-slate-650 dark:text-slate-400">Hasil pencarian tidak ditemukan</p>
                              <p className="text-[10px] text-slate-455 mt-0.5">Coba dengan kata kunci pencarian atau kombinasi filter lain.</p>
                            </td>
                          </tr>
                        ) : (
                          filteredStudentLogins.map((student: any, idx: number) => {
                            const isNewbie = student.count === 0;
                            return (
                              <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-850/40 transition-colors">
                                <td className="p-3 font-bold text-slate-900 dark:text-white">
                                  {student.nama}
                                </td>
                                <td className="p-3 font-mono text-slate-600 dark:text-slate-350">
                                  {student.nisn}
                                </td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase font-mono ${
                                    student.jenjang === "SMP"
                                      ? "bg-purple-100 dark:bg-purple-950/40 text-purple-705 dark:text-purple-400"
                                      : "bg-blue-100 dark:bg-blue-950/40 text-blue-705 dark:text-blue-400"
                                  }`}>
                                    {student.jenjang}
                                  </span>
                                </td>
                                <td className="p-3 font-medium text-slate-505 dark:text-slate-400">
                                  {student.angkatan} <span className="text-[10px] text-slate-400">({student.gender})</span>
                                </td>
                                <td className="p-3 text-center">
                                  <span className={`inline-block px-2.5 py-0.5 rounded-full font-mono font-bold text-xs ${
                                    isNewbie 
                                      ? "bg-slate-100 dark:bg-slate-800 text-slate-400" 
                                      : "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-705 dark:text-emerald-400"
                                  }`}>
                                    {student.count}×
                                  </span>
                                </td>
                                <td className="p-3 text-right font-mono text-[10px] text-slate-500 dark:text-slate-400 font-medium font-bold">
                                  {student.lastLogin}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            </div>

          </div>
        );
      })()}

      {/* 4. Infographics Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* COL 1 & 2: IQ Distributions & Holland Metrics Charts */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* A. SEBARAN KECERDASAN KOGNITIF (IQ) - INFO GRAFIS DAN DAFTAR NAMA */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-purple-650 dark:text-purple-400 font-mono uppercase tracking-wider">
                Infografis Kecerdasan Kognitif
              </div>
              <h3 className="text-lg font-black text-slate-905 dark:text-white flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                Sebaran Tingkat IQ &amp; Pengelompokan Santri BC
              </h3>
              <p className="text-xs text-slate-500">
                Peta konsentrasi intelegensi santri berdasarkan kategori resmi Wechsler/Stanford-Binet demi optimalisasi program bimbingan lanjutan atau kelas program.
              </p>
            </div>

            {/* Visual Bars, Counts and Student names listed side-by-side */}
            <div className="space-y-6">
              {iqDistribution.map((iq) => {
                const hasStudentsStatus = iq.students.length > 0;
                return (
                  <div key={iq.label} className="border-b border-slate-50 dark:border-slate-850/60 pb-5 last:border-b-0 last:pb-0 space-y-2.5">
                    
                    {/* Header bar and counts info */}
                    <div className="flex justify-between items-center text-xs">
                      <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${iq.color}`}></span>
                        <span>{iq.label}</span>
                      </div>
                      <div className="text-slate-650 dark:text-slate-350 font-mono font-bold">
                        {iq.count} Peserta <span className="text-[10px] text-slate-400">({iq.percentage}%)</span>
                      </div>
                    </div>

                    {/* Progress Bar Graphic */}
                    <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden relative">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${iq.color}`} 
                        style={{ width: `${iq.percentage || 2}%` }}
                      ></div>
                    </div>

                    {/* SANTRIS NAMES IN THIS GROUP (Matches literal: IQ ada jumlah peserta nama-nama) */}
                    <div className="p-3 bg-slate-50/50 dark:bg-slate-950 rounded-xl border border-slate-150/40 dark:border-slate-850/60">
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-1.5 flex items-center gap-1">
                        <span>Anggota Kelompok ({iq.count} Santri):</span>
                      </div>
                      
                      {hasStudentsStatus ? (
                        <div className="flex flex-wrap gap-1.5">
                          {iq.students.map((student) => (
                            <span 
                              key={student.id} 
                              className={`px-2 py-1 text-[10px] font-bold rounded-lg border flex items-center gap-1 ${rangeTextStyling(iq.text)}`}
                              title={`Skor IQ Asli: ${student.iqScore}`}
                            >
                              {student.nama}
                              <span className="text-[9px] opacity-75 font-mono bg-white/60 dark:bg-slate-900/60 px-1 rounded">
                                IQ {student.iqScore} ({student.kelas})
                              </span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-400 italic font-mono">
                          Belum ada santri terdaftar di tingkat IQ kognitif ini pada kelas terpilih.
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* B. SEBARAN KARAKTER MINAT RIASEC - INFOGRAFIS & SANTRIS */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-indigo-650 dark:text-indigo-400 font-mono uppercase tracking-wider">
                Holland RIASEC Orientation Profile
              </div>
              <h3 className="text-lg font-black text-slate-905 dark:text-white flex items-center gap-2">
                <Compass className="h-5 w-5 text-indigo-650 dark:text-indigo-400 animate-spin-slow" />
                Matriks Orientasi Minat Karir RIASEC Santri
              </h3>
              <p className="text-xs text-slate-500">
                Mengukur tingkat konsentrasi santri pada 6 dimensi orientasi karir Holland. Santri dengan minimal 1 kecocokan dimasukkan dalam pengelompokan.
              </p>
            </div>

            {/* Horizontal Grid Bars representation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {riasecDistribution.map((cat) => {
                const count = cat.totalCount;
                return (
                  <div 
                    key={cat.label} 
                    className="p-4 rounded-2xl border border-slate-150 dark:border-slate-850 bg-slate-50/20 dark:bg-slate-950/10 hover:border-slate-300 dark:hover:border-slate-750 transition-all space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-805 dark:text-slate-100 font-display">
                          {cat.label}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-850 text-slate-650 dark:text-slate-350 font-mono font-bold rounded-md">
                          {count} Kecocokan 
                        </span>
                      </div>

                      {/* Visual gauge */}
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${cat.color}`}
                          style={{ width: `${cat.percentage || 4}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Mini Santri List badge */}
                    <div className="space-y-1 pt-1.5 border-t border-slate-100 dark:border-slate-850/80">
                      <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest font-mono block">
                        Daftar Karakter Dominan:
                      </span>
                      {count > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {cat.students.map((st) => {
                            const isDominantFirst = st.topRiasec && st.topRiasec[0] && st.topRiasec[0].startsWith(cat.prefix);
                            return (
                              <span 
                                key={st.id} 
                                className={`text-[9.5px] px-1.5 py-0.5 rounded font-medium ${
                                  isDominantFirst 
                                    ? "bg-slate-900 text-white font-black dark:bg-white dark:text-slate-950" 
                                    : "bg-slate-100/80 dark:bg-slate-850 text-slate-600 dark:text-slate-400"
                                }`}
                                title={isDominantFirst ? "Orientasi Paling Utama (1st)" : "Orientasi Alternatif"}
                              >
                                {st.nama} {isDominantFirst ? "🥇" : ""}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-[9.5px] text-slate-400 italic">Belum ada santri teridentifikasi</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* COL 3 (Sidebar graphs): Rapor Distributions, Popular Majors */}
        <div className="space-y-6">
          
          {/* C. DISTRIBUSI SEBARAN RAPOR */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-450 font-mono uppercase tracking-wider">
                Academic Grade Matrix
              </div>
              <h3 className="text-base font-black text-slate-905 dark:text-white flex items-center gap-1.5">
                <GraduationCap className="h-5 w-5 text-emerald-600" />
                Delineasi Rapor Santri
              </h3>
              <p className="text-[11px] text-slate-500">
                {isSmp 
                  ? "Peta capaian indeks akademik guna memberikan rekomendasi pendalaman akademik kognitif lanjut, pengembangan diri, dan beasiswa kesiswaan."
                  : "Peta capaian indeks akademik guna memberikan rekomendasi perguruan tinggi negeri / PTKIN yang sesuai dengan rumpun nilai."}
              </p>
            </div>

            <div className="space-y-4">
              {raporDistribution.map((range) => {
                const hasStudents = range.students.length > 0;
                return (
                  <div key={range.label} className="space-y-1.5">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-bold text-slate-700 dark:text-slate-300">{range.label}</span>
                      <span className="font-mono font-bold text-slate-500">{range.count} Santri ({range.percentage}%)</span>
                    </div>

                    <div className="h-2 w-full bg-slate-105 dark:bg-slate-850 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${range.color}`}
                        style={{ width: `${range.percentage || 2}%` }}
                      ></div>
                    </div>

                    {/* Student Names listing under category */}
                    <div className="bg-slate-50/50 dark:bg-slate-950 rounded-lg p-1.5 text-[9.5px] font-mono text-slate-600 dark:text-slate-400">
                      {hasStudents ? (
                        <div className="flex flex-wrap gap-1">
                          {range.students.map((r, i) => (
                            <span key={i} className="after:content-[','] last:after:content-[''] pr-0.5 font-bold text-slate-800 dark:text-slate-350">
                              {r.nama} ({r.avgRapor})
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="italic text-slate-400">Belum ada di kriteria ini</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* D. TOP 5 JURUSAN PILIHAN UTAMA SANTRI */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-blue-600 dark:text-blue-450 font-mono uppercase tracking-wider">
                {isSmp ? "Development Focus Analytics" : "Career Target Analytics"}
              </div>
              <h3 className="text-base font-black text-slate-905 dark:text-white flex items-center gap-1.5">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                {isSmp ? "Fokus Pengembangan & Ekskul Terpopuler" : "Prodi Pilihan Terpopuler"}
              </h3>
              <p className="text-[11px] text-slate-500">
                {isSmp 
                  ? "Peringkat aspek pengembangan kognitif, keagamaan, dan ekstrakurikuler yang paling diunggulkan saringan kelas terpilih."
                  : "Peringkat jurusan dan program studi yang paling direkomendasikan sistem bagi rombongan saringan kelas terpilih."}
              </p>
            </div>

            <div className="space-y-3.5">
              {sortedMajors.length > 0 ? (
                sortedMajors.map((major, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-slate-50/20 dark:bg-slate-950/20 p-2.5 rounded-xl border border-slate-150/40 dark:border-slate-850/60 transition-all">
                    <div className="font-mono text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 w-6 h-6 rounded-lg flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold text-slate-805 dark:text-slate-200 truncate pr-2">
                          {major.name}
                        </h4>
                        <span className="text-[10px] font-mono font-bold text-slate-500 shrink-0">
                          {major.count} Rekomendasi
                        </span>
                      </div>
                      {/* Name tags of students in micro text */}
                      <p className="text-[9px] text-slate-450 font-mono truncate">
                        Siswa: {major.students.join(", ")}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-[11px] text-slate-450 italic text-center p-4">
                  Belum ada data rekomendasi karir cerdas untuk ditampilkan.
                </div>
              )}
            </div>
          </div>

          {/* E. QUICK GUIDE ON EXECUTING REPORTS */}
          <div className="bg-slate-900 border border-slate-800 text-slate-350 rounded-2xl p-4 text-[11px] leading-relaxed space-y-2 font-mono no-print">
            <div className="flex items-center gap-1.5 text-red-400 font-bold uppercase text-[10px] tracking-wide">
              <CheckCircle className="h-3.5 w-3.5" />
              Catatan Bimbingan BK:
            </div>
            <p>
              Gunakan tombol <span className="text-white font-bold">CETAK LAPORAN BK</span> di atas untuk mengekspor dashboard analitik beserta diagram sebaran ini menjadi kertas fisik penyerahan wali santri atau laporan sekolah.
            </p>
          </div>

        </div>

      </div>

      {/* 4.5. Laporan Konsultasi Teman CurhatKu (AI) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 no-print">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono uppercase tracking-wider">
              Bimbingan Konseling Mandiri
            </div>
            <h3 className="text-lg font-black text-slate-905 dark:text-white font-display flex items-center gap-2">
              <span className="p-1 px-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 text-xs">AI</span>
              Riwayat Konsultasi Teman CurhatKu
            </h3>
            <p className="text-xs text-slate-500">
              Hasil curhatan mandiri santri dengan asisten AI. Menggunakan gaya bahasa gaul/teman sebaya guna mendeteksi kecemasan, rindu rumah, motivasi menghafal, dan dinamika asrama.
            </p>
          </div>

          {chatRecords.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm("Apakah anda yakin ingin menghapus semua rekam log chat konsultasi AI?")) {
                  localStorage.removeItem("sipetakuliah_counseling_chats");
                  setChatRecords([]);
                  setSelectedChat(null);
                }
              }}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              KOSONGKAN SEMUA CHAT AI
            </button>
          )}
        </div>

        {chatRecords.length === 0 ? (
          <div className="text-center p-8 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/80">
            <span className="text-3xl">💬</span>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-350 mt-2">Belum Ada Riwayat Konsultasi AI</h4>
            <p className="text-[11px] text-slate-450 max-w-md mx-auto mt-1 leading-relaxed">
              Saat santri masuk melalui opsi &ldquo;Konsultasi BK Mandiri (Teman CurhatKu)&rdquo; dan mengirimkan pesan curhat pertama mereka, riwayat pesan &amp; transkrip dialog konseling akan langsung tersaji nyata di panel ini secara langsung.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* List Table of students who chatted */}
            <div className="lg:col-span-6 space-y-3">
              <span className="text-[11px] font-bold text-slate-400 font-mono uppercase tracking-wider block">
                Daftar Sesi Aktif ({chatRecords.length} Santri)
              </span>

              <div className="border border-slate-150 dark:border-slate-800/80 rounded-2xl overflow-hidden bg-slate-50/20 dark:bg-slate-950/20">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 text-slate-450 border-b border-slate-150 dark:border-slate-800 font-mono text-[9px] uppercase tracking-wider">
                      <th className="p-3">Siswa</th>
                      <th className="p-3">Jenjang / Kelas</th>
                      <th className="p-3">Pesan</th>
                      <th className="p-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {chatRecords.map((item, idx) => (
                      <tr 
                        key={idx} 
                        className={`hover:bg-slate-50/65 dark:hover:bg-slate-850/40 transition-colors ${
                          selectedChat?.nisn === item.nisn ? "bg-emerald-500/5 dark:bg-emerald-500/10" : ""
                        }`}
                      >
                        <td className="p-3">
                          <div className="font-bold text-slate-805 dark:text-slate-100 leading-tight">
                            {item.nama}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            NISN: {item.nisn}
                          </div>
                        </td>
                        <td className="p-3 font-medium text-slate-650 dark:text-slate-355 font-mono">
                          <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md font-bold text-[9px] mr-1.5 text-slate-705 dark:text-slate-300">
                            {item.jenjang}
                          </span>
                          {item.kelas}
                        </td>
                        <td className="p-3 font-mono text-[10px] text-slate-400">
                          {item.messages ? item.messages.length - 1 : 0} curhatan
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setSelectedChat(item)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold cursor-pointer transition-all ${
                              selectedChat?.nisn === item.nisn
                                ? "bg-emerald-600 text-white shadow shadow-emerald-500/15"
                                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-805 dark:text-slate-250"
                            }`}
                          >
                            LIHAT LOG DIALOG
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* View dialogue transcript */}
            <div className="lg:col-span-6 space-y-3">
              <span className="text-[11px] font-bold text-slate-400 font-mono uppercase tracking-wider block">
                Transkrip Obrolan Lengkap
              </span>

              {selectedChat ? (
                <div className="space-y-4">
                  <div className="border border-slate-150 dark:border-slate-800 rounded-2xl bg-slate-50/25 dark:bg-slate-900/40 p-4 space-y-4 flex flex-col h-[320.5px]">
                  {/* Chat Info Header */}
                  <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-transparent">
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white">
                        Curhat {selectedChat.nama}
                      </h4>
                      <div className="text-[9.5px] text-slate-400 font-mono mt-0.5 flex gap-2">
                        <span>Layanan: {selectedChat.jenjang}</span>
                        <span>•</span>
                        <span>Aktif: {selectedChat.timestamp}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        // Delete individual student chat logs
                        if (window.confirm(`Hapus seluruh riwayat chat miliki ${selectedChat.nama}?`)) {
                          const raw = localStorage.getItem("sipetakuliah_counseling_chats");
                          if (raw) {
                            try {
                              const parsed = JSON.parse(raw);
                              const cleaned = parsed.filter((c: any) => c.nisn !== selectedChat.nisn);
                              localStorage.setItem("sipetakuliah_counseling_chats", JSON.stringify(cleaned));
                              setChatRecords(cleaned);
                              setSelectedChat(null);
                            } catch (e) {}
                          }
                        }
                      }}
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 cursor-pointer"
                      title="Hapus Transkrip"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Bubble logs conveyor belt */}
                  <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 scrollbar-thin scrollbar-thumb-slate-200">
                    {selectedChat.messages?.map((msg: any, mIdx: number) => {
                      const isAi = msg.sender === "ai";
                      return (
                        <div key={mIdx} className={`max-w-[85%] space-y-0.5 ${isAi ? "mr-auto" : "ml-auto text-right"}`}>
                          <span className="text-[8.5px] font-mono text-slate-400">
                            {isAi ? "Teman CurhatKu (AI)" : selectedChat.nama} • {msg.timestamp}
                          </span>
                          <div className={`p-2.5 rounded-2xl shadow-sm text-[11px] leading-relaxed whitespace-pre-wrap text-left ${
                            isAi 
                              ? "bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-205 rounded-tl-none" 
                              : "bg-emerald-600 text-white rounded-tr-none font-medium"
                          }`}>
                            {msg.text?.replace(/\*\*(.*?)\*\*/g, "$1")}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* AI Evaluation Summary Card */}
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-3xl p-4.5 space-y-3.5 shadow-sm">
                  <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/60 dark:border-slate-805">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border border-emerald-400/25 rounded-lg text-[9px] font-black font-mono">AI EVALUATION</span>
                      <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">Kesimpulan Dialog &amp; Solusi BK</h4>
                    </div>
                    {summariesCache[selectedChat.nisn] && (
                      <button
                        onClick={() => handleSummarizeChat(selectedChat.nisn)}
                        disabled={isSummarizing}
                        className="text-[10px] font-mono font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-950 px-2 py-1 rounded-lg border border-emerald-200/30 cursor-pointer"
                      >
                        {isSummarizing ? "Merespon..." : "Analisis Ulang ↺"}
                      </button>
                    )}
                  </div>

                  {summariesCache[selectedChat.nisn] ? (
                    <div className="space-y-3.5">
                      <div className="space-y-1">
                        <span className="text-[9px] font-black text-slate-400 font-mono uppercase tracking-wider block">1. Fokus Rangkuman Emosional Siswa</span>
                        <p className="text-xs text-slate-650 dark:text-slate-300 leading-relaxed font-semibold">
                          {summariesCache[selectedChat.nisn].summary}
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[9px] font-black text-slate-400 font-mono uppercase tracking-wider block">2. Alur Tindak Lanjut / Solusi Guru BK</span>
                        <ul className="space-y-1.5">
                          {summariesCache[selectedChat.nisn].actionItems?.map((act: string, aIdx: number) => (
                            <li key={aIdx} className="text-[11px] text-slate-600 dark:text-slate-300 flex items-start gap-2 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800/80 font-semibold">
                              <span className="font-mono text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 w-5 h-5 rounded-md flex items-center justify-center shrink-0">{aIdx+1}</span>
                              <span className="flex-1 leading-normal pt-0.5">{act}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-3 shadow-inner">
                      <p className="text-[11px] text-slate-500 leading-relaxed max-w-sm mx-auto">
                        Belum ada ringkasan hasil dialektika dialog konseling untuk <strong>{selectedChat.nama}</strong>. Klik tombol di bawah untuk mengekstrak intisari via AI.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleSummarizeChat(selectedChat.nisn)}
                        disabled={isSummarizing}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-750 disabled:bg-slate-200 disabled:text-slate-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mx-auto font-mono uppercase tracking-wide"
                      >
                        {isSummarizing ? (
                          <>
                            <div className="w-3 border-2 border-slate-600 border-t-transparent rounded-full animate-spin"></div>
                            Mengekstrak Obrolan...
                          </>
                        ) : (
                          <>
                            <span>✨</span>
                            Analisis & Ringkas Dialog
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              ) : (
                <div className="h-[320.5px] bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center p-6 text-center text-slate-400">
                  <span className="text-2xl">🔍</span>
                  <p className="text-[11px] font-semibold mt-2">Pilih nama santri di tabel samping kiri</p>
                  <p className="text-[10px] text-slate-450 max-w-[240px] mt-0.5 leading-relaxed">
                    Setiap transkrip obrolan, pesan tulus, dan cap waktu curhat mereka dapat anda pantau secara teratur untuk bekal bimbingan klasikal.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4.6. Kotak Pesan Konseling Masuk Ke Guru BK */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 mt-6 no-print">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-red-600 dark:text-red-400 font-mono uppercase tracking-wider">
              Layanan Pesan Masuk Siswa Realitas
            </div>
            <h3 className="text-lg font-black text-slate-905 dark:text-white font-display flex items-center gap-2">
              <span className="p-1 px-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 text-xs text-semibold">Humas</span>
              Kotak Masuk Curhat Pribadi Guru BK {userRole === "bk_smp" ? "SMP" : userRole === "bk_sma" ? "SMA" : "SMP & SMA"}
            </h3>
            <p className="text-xs text-slate-550 dark:text-slate-400">
              Daftar pesan rahasia, pengaduan siswa, dan permohonan bimbingan tertulis yang diajukan langsung oleh santri kepada layanan Guru BK sesuai jenjang tingkatnya.
            </p>
          </div>

          {directMessages.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm("Apakah Anda yakin ingin menghapus seluruh riwayat pesan masuk Guru BK? Tindakan ini permanen.")) {
                  localStorage.removeItem("sipetakuliah_direct_bk_messages");
                  setDirectMessages([]);
                  alert("Kotak masuk berhasil dibersihkan.");
                }
              }}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-xl text-[10px] font-bold transition-all cursor-pointer"
            >
              KOSONGKAN SEMUA ADUAN BK
            </button>
          )}
        </div>

        {directMessages.length === 0 ? (
          <div className="text-center p-8 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <span className="text-3xl block mb-2">📬</span>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Belum Ada Pesan Masuk</h4>
            <p className="text-[11px] text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
              Ketika ada santri yang membutuhkan pertolongan bimbingan personal tingkat {userRole === "bk_smp" ? "SMP" : userRole === "bk_sma" ? "SMA" : "SMP/SMA"} dan mengirim pesan, keluhan mereka akan langsung masuk, tersaring, dan siap Anda tanggapi secara asinkron di sini.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...directMessages].reverse().map((msg, index) => {
              const isNotReplied = msg.status !== "Sudah Ditanggapi";
              return (
                <div 
                  key={index} 
                  className={`border rounded-2xl p-5 space-y-4 shadow-sm bg-gradient-to-br ${
                    isNotReplied 
                      ? "border-amber-200/60 dark:border-amber-900/40 from-amber-500/5 to-white dark:from-amber-950/10 dark:to-slate-900" 
                      : "border-slate-150 dark:border-slate-800 from-white to-slate-50/20 dark:from-slate-900 dark:to-slate-950"
                  }`}
                >
                  {/* Message Header info */}
                  <div className="flex justify-between items-start gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                        {msg.nama}
                        <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-705 dark:text-slate-350 rounded-md font-mono text-[9px] font-extrabold uppercase">
                          {msg.kelas}
                        </span>
                      </h4>
                      <p className="text-[9.5px] font-mono text-slate-400 mt-1">
                        NISN: {msg.nisn} • Dikirim: {msg.timestamp}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase font-mono tracking-wider ${
                        isNotReplied
                          ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-205/30"
                          : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-450 border border-emerald-205/30"
                      }`}>
                        {msg.status}
                      </span>

                      <button
                        onClick={() => handleDeleteDirectMessage(msg.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50/10 transition-colors cursor-pointer"
                        title="Hapus Aduan"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Student confession text */}
                  <div className="space-y-1 bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-150/50 dark:border-slate-850">
                    <div className="flex justify-between items-center text-[8.5px] font-mono text-slate-400 font-black">
                      <span>KELUHAN KATEGORI: {msg.category?.toUpperCase()}</span>
                      <span className="text-[9px] text-red-550 dark:text-red-400">RAHASIA BK</span>
                    </div>
                    <p className="text-xs text-slate-750 dark:text-slate-300 leading-relaxed font-semibold">
                      &ldquo; {msg.messageText} &rdquo;
                    </p>
                  </div>

                  {/* Reply / Status Actions */}
                  {isNotReplied ? (
                    <div className="space-y-2.5 pt-1">
                      <div className="text-[9.5px] font-mono font-extrabold text-slate-450 uppercase tracking-wider">
                        Tulis Tanggapan Guru BK:
                      </div>
                      <textarea
                        rows={3}
                        placeholder="Berikan saran, bimbingan, jadwal tatap muka asmara, atau tanggapan bijak Anda di sini..."
                        value={replyTexts[msg.id] || ""}
                        onChange={(e) => setReplyTexts(prev => ({ ...prev, [msg.id]: e.target.value }))}
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-950 text-slate-850 dark:text-white border border-slate-205 dark:border-slate-800 rounded-xl focus:outline-none focus:border-red-500 leading-relaxed"
                      ></textarea>
                      <button
                        type="button"
                        onClick={() => handleReplyDirectMessage(msg.id)}
                        disabled={!replyTexts[msg.id]?.trim()}
                        className="px-4 py-2 bg-red-650 hover:bg-red-750 disabled:bg-slate-100 dark:disabled:bg-slate-850 disabled:text-slate-400 text-white font-bold text-[10px] rounded-xl transition-all shadow shadow-red-500/10 font-mono tracking-wide uppercase cursor-pointer"
                      >
                        Kirim Jawaban Ke Siswa
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 bg-emerald-500/5 dark:bg-emerald-950/10 border border-emerald-150 dark:border-emerald-900/35 rounded-xl space-y-1.5">
                      <div className="flex justify-between items-center text-[9px] font-bold text-emerald-755 dark:text-emerald-400 font-mono">
                        <span>BALASAN GURU BK ({msg.response?.repliedBy || "KONSUL BK"})</span>
                        <span>{msg.response?.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-655 dark:text-slate-250 italic leading-relaxed">
                        &ldquo; {msg.response?.responseText} &rdquo;
                      </p>
                      
                      {/* Edit existing reply option */}
                      <button
                        onClick={() => {
                          const editTxt = msg.response?.responseText || "";
                          setReplyTexts(prev => ({ ...prev, [msg.id]: editTxt }));
                          // Temporarily mark as waiting so they can edit
                          const raw = localStorage.getItem("sipetakuliah_direct_bk_messages");
                          if (raw) {
                            try {
                              const all = JSON.parse(raw);
                              const reset = all.map((m: any) => {
                                if (m.id === msg.id) {
                                  return { ...m, status: "Menunggu Tanggapan" };
                                }
                                return m;
                              });
                              localStorage.setItem("sipetakuliah_direct_bk_messages", JSON.stringify(reset));
                              loadDirectMessages();
                            } catch (e) {}
                          }
                        }}
                        className="text-[9.5px] font-mono text-slate-400 hover:text-red-500 underline block"
                      >
                        Sunting Pembinaan / Tanggapan Ulang
                      </button>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4.7. Pemantauan & Tinjauan Forum Diskusi Quora Edu (BK Moderation Panel) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 mt-6 no-print">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono uppercase tracking-wider">
              Moderasi Interaksi Sosial Media Edukasi
            </div>
            <h3 className="text-lg font-black text-slate-905 dark:text-white font-display flex items-center gap-2">
              <span className="p-1 px-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 text-xs font-semibold">Quora BK</span>
              Pemantauan Forum Diskusi Pendidikan Kawan SCB
            </h3>
            <p className="text-xs text-slate-550 dark:text-slate-400">
              Pantau seluruh tanya jawab pendidikan siswa SMP &amp; SMA. Staf BK berhak memberikan arahan resmi (&ldquo;Verified Answer&rdquo;) atau menghapus diskusi non-edukasi demi menjaga kebersihan ekosistem asrama.
            </p>
          </div>
        </div>

        {forumActiveDiscId ? (
          (() => {
            const disc = forumDiscussions.find(d => d.id === forumActiveDiscId);
            if (!disc) {
              setForumActiveDiscId(null);
              return null;
            }
            return (
              <div className="border border-slate-150 dark:border-slate-800 p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
                  <button
                    onClick={() => setForumActiveDiscId(null)}
                    className="px-3 py-1 bg-white hover:bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-bold rounded-lg transition-all cursor-pointer"
                  >
                    &larr; Kembali ke Semua Forum
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(disc.id)}
                    className="px-3 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Hapus Topik Ini
                  </button>
                </div>

                <div className="space-y-2">
                  <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded text-[9.5px] font-black uppercase font-mono">
                    {disc.category}
                  </span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white font-display">
                    {disc.title}
                  </h3>
                  <div className="text-xs text-slate-500">
                    Ditanyakan oleh <strong className="text-slate-700 dark:text-slate-300">{disc.studentName}</strong> (NISSN: {disc.studentNisn}) • {disc.studentJenjang} {disc.studentKelas} • {disc.timestamp}
                  </div>
                  <p className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed shadow-sm">
                    {disc.content}
                  </p>
                </div>

                {/* Answers list */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-[10px] font-black tracking-widest text-slate-400 uppercase font-mono">
                    TANGGAPAN SISWA &amp; VERIFIKASI BK ({disc.answers.length})
                  </h4>

                  {disc.answers.length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-4 bg-white dark:bg-slate-900/40 rounded-xl">Belum ada tanggapan.</p>
                  ) : (
                    <div className="space-y-3">
                      {disc.answers.map((ans: any) => (
                        <div key={ans.id} className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-800 flex gap-3 items-center">
                          <button
                            onClick={() => handleTeacherUpvoteAnswer(disc.id, ans.id)}
                            className={`p-1.5 rounded text-xs shrink-0 flex flex-col items-center cursor-pointer ${
                              ans.upvotedBy.includes("STAFF_BK") ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-950" : "text-slate-400 hover:text-slate-600"
                            }`}
                          >
                            <ArrowUp className="h-4 w-4" />
                            <span className="text-[9.5px] font-bold font-mono">{ans.upvotes}</span>
                          </button>

                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-1.5 text-[11px] font-mono leading-none">
                              <span className="font-extrabold text-slate-900 dark:text-slate-200">{ans.studentName}</span>
                              <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-[9px] rounded text-slate-600 dark:text-slate-400 font-bold">
                                {ans.studentJenjang} {ans.studentKelas}
                              </span>
                              {ans.studentNisn === "BK_STAFF" && (
                                <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/40 text-[9px] rounded text-emerald-700 dark:text-emerald-400 font-black tracking-wider uppercase">
                                  ✓ Verified BK Answer
                                </span>
                              )}
                              <span className="text-[9px] text-slate-400 ml-auto">{ans.timestamp}</span>
                            </div>
                            <p className="text-xs text-slate-700 dark:text-slate-350">{ans.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Teacher Reply box */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1 font-display uppercase tracking-wide">
                    <MessageCircle className="h-4 w-4 text-emerald-600" />
                    Berikan Tanggapan / Arahan Resmi Guru BK
                  </h4>
                  <textarea
                    placeholder="Tulis balasan konseling, petunjuk belajar resmi, atau nasehat edukasi dari sudut pandang Guru BK..."
                    rows={2}
                    value={forumReplyText}
                    onChange={(e) => setForumReplyText(e.target.value)}
                    className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-emerald-500 leading-relaxed font-sans"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleTeacherAddAnswer(disc.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-750 text-white text-xs font-black rounded-lg transition-all shadow-sm cursor-pointer"
                    >
                      Kirim Jawaban Resmi BK
                    </button>
                  </div>
                </div>

              </div>
            );
          })()
        ) : (
          <div className="space-y-4">
            {/* Search, filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -content -translate-y-1/2 h-4 w-4 text-slate-450" />
                <input
                  type="text"
                  placeholder="Cari kata kunci forum siswa..."
                  value={forumSearchQuery}
                  onChange={(e) => setForumSearchQuery(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none"
                />
              </div>

              <div className="flex gap-2">
                {["Semua Tema", "Olimpiade Sains (OSN)", "Strategi Belajar", "Kehidupan Asrama", "Kesehatan Mental", "Jurusan & Kuliah"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setForumSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      forumSelectedCategory === cat
                        ? "bg-slate-700 dark:bg-white text-white dark:text-slate-900 font-black shadow"
                        : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {cat === "Semua Tema" ? "Semua" : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            {(() => {
              const filtered = forumDiscussions.filter((d) => {
                const matchesSearch = d.title.toLowerCase().includes(forumSearchQuery.toLowerCase()) || d.content.toLowerCase().includes(forumSearchQuery.toLowerCase());
                const matchesCat = forumSelectedCategory === "Semua Tema" || d.category === forumSelectedCategory;
                return matchesSearch && matchesCat;
              });

              if (filtered.length === 0) {
                return (
                  <p className="text-xs text-slate-400 italic text-center py-6 bg-slate-50 dark:bg-slate-900/40 rounded-xl">
                    Tidak ada topik diskusi santri yang cocok dengan kriteria filter.
                  </p>
                );
              }

              return (
                <div className="border border-slate-150 dark:border-slate-850 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/80">
                  {filtered.map((disc) => (
                    <div key={disc.id} className="p-4 bg-white dark:bg-slate-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-999 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded text-[9px] font-black uppercase font-mono">
                            {disc.category}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Oleh <strong>{disc.studentName}</strong> ({disc.studentJenjang} {disc.studentKelas}) • Upvote: {disc.upvotes}
                          </span>
                        </div>
                        <h4
                          onClick={() => setForumActiveDiscId(disc.id)}
                          className="text-xs font-black text-slate-900 dark:text-white leading-snug hover:text-emerald-650 cursor-pointer transition-colors"
                        >
                          {disc.title}
                        </h4>
                        <p className="text-[11px] text-slate-450 dark:text-slate-400 line-clamp-1">{disc.content}</p>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <button
                          onClick={() => setForumActiveDiscId(disc.id)}
                          className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-650 text-xs font-bold rounded-lg transition-all cursor-pointer"
                        >
                          Tinjau &amp; Balas ({disc.answers?.length || 0})
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(disc.id)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-lg hover:text-rose-700 transition-colors cursor-pointer"
                          title="Hapus topik diskusi"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      <div className="space-y-3 mt-8">
        <div className="px-1 space-y-1">
          <h3 className="text-lg font-black text-slate-905 dark:text-white font-display">
            Pangkalan Data Siswa &amp; Rekapitulasi Kolektif
          </h3>
          <p className="text-xs text-slate-550 dark:text-slate-400">
            Daftar lengkap record data santri peserta yang dimasukkan ditiap browser. Admin dibekali otoritas untuk menghapus record individu atau membersihkan database instan guna memulai periode kelompok belajar baru.
          </p>
        </div>
        
        {/* Pass isAdmin prop and trigger re-render on sync change key */}
        <div key={syncKey}>
          <RekapHasilSiswa appState={EMPTY_APP_STATE} isAdmin={userRole === "admin"} userRole={userRole} />
        </div>
      </div>

    </div>
  );
}

// Quick status label ranges colorizer helper
function rangeTextStyling(badgeTextClass: string): string {
  if (badgeTextClass.includes("indigo")) return "bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-150 dark:border-indigo-900/40 text-indigo-700 dark:text-indigo-400";
  if (badgeTextClass.includes("purple")) return "bg-purple-50/50 dark:bg-purple-950/30 border-purple-150 dark:border-purple-900/40 text-purple-700 dark:text-purple-400";
  if (badgeTextClass.includes("blue")) return "bg-blue-50/50 dark:bg-blue-950/30 border-blue-150 dark:border-blue-900/40 text-blue-700 dark:text-blue-400";
  if (badgeTextClass.includes("teal")) return "bg-teal-50/50 dark:bg-teal-950/30 border-teal-150 dark:border-teal-900/40 text-teal-700 dark:text-teal-400";
  return "bg-amber-50/50 dark:bg-amber-950/30 border-amber-150 dark:border-amber-900/40 text-amber-700 dark:text-amber-400";
}
