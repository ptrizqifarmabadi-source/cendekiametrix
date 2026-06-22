/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Send, 
  Trash2, 
  Sparkles, 
  MessageSquare, 
  Heart, 
  User, 
  BookOpen, 
  Compass, 
  Smile, 
  LogOut,
  Info,
  Lock,
  KeyRound,
  ThumbsUp,
  Plus,
  Search,
  Filter,
  ArrowUp,
  GraduationCap,
  Award,
  MessageCircle,
  X
} from "lucide-react";
import { StudentProfile } from "../types";

interface Message {
  sender: "student" | "ai";
  text: string;
  timestamp: string;
}

export interface DiscussionAnswer {
  id: string;
  content: string;
  studentName: string;
  studentNisn: string;
  studentJenjang: "SMP" | "SMA" | "Staf BK" | "Staf Admin";
  studentKelas: string;
  timestamp: string;
  upvotes: number;
  upvotedBy: string[];
}

export interface Discussion {
  id: string;
  title: string;
  content: string;
  category: string;
  studentName: string;
  studentNisn: string;
  studentJenjang: "SMP" | "SMA";
  studentKelas: string;
  timestamp: string;
  upvotes: number;
  upvotedBy: string[];
  answers: DiscussionAnswer[];
}

export const DISCUSSION_CATEGORIES = [
  "Olimpiade Sains (OSN)",
  "Persiapan Kuliah & Karir",
  "Gaya Belajar & Tips Akademik",
  "Masalah Belajar & Motivasi",
  "Informasi Beasiswa & Kampus"
];

const SEED_DISCUSSIONS: Discussion[] = [
  {
    id: "disc_1",
    title: "Gimana trik bagi waktu yang pas buat setor hafalan Al-Qur'an sekaligus belajar materi Olimpiade Sains (OSN)?",
    content: "Halo mas mbak sekalian, saya kelas 10 SMA. Baru-baru ini gabung Klub Olimpiade Bidang Studi Fisika. Tapi jadwal asrama padat banget, ditambah target setoran hafalan juz baru. Sering keteteran mau prioritasi yang mana dulu. Ada yang punya tips bimbingan waktu belajar yang efisien di asrama?",
    category: "Olimpiade Sains (OSN)",
    studentName: "Ahmad Fauzi",
    studentNisn: "0087654321",
    studentJenjang: "SMA",
    studentKelas: "Kelas 10 Ikhwan",
    timestamp: "12 Jun 25, 14:30",
    upvotes: 12,
    upvotedBy: ["0081234567"],
    answers: [
      {
        id: "ans_1_1",
        content: "Halo Ahmad! Kebetulan saya kelas 12 SMA dan tahun lalu ikut OSN Kebumian. Kuncinya ada di 'Subuh & Isya'. Jadikan waktu setelah Subuh khusus buat murojaah hafalan karena otak masih fresh. Untuk materi OSN, manfaatkan jam mandiri malam (setelah Isya) selama 1-1.5 jam saja tapi konsisten setiap hari. Jangan belajar SKS (Sistem Kebut Semalam) di asrama ya, bikin stres!",
        studentName: "Muhammad Reyhan",
        studentNisn: "0065432198",
        studentJenjang: "SMA",
        studentKelas: "Kelas 12 Ikhwan",
        timestamp: "12 Jun 25, 16:15",
        upvotes: 8,
        upvotedBy: ["0087654321"]
      },
      {
        id: "ans_1_2",
        content: "Bener kata Kak Reyhan! Tambahan dari saya (staf BK pendamping), koordinasikan juga dengan pembimbing akademik asrama agar target hafalanmu bisa disesuaikan ketika mendekati periode babak penyisihan OSN. Semangat terus pejuang sains Qur'ani!",
        studentName: "Guru BK Cendekia",
        studentNisn: "BK_STAFF",
        studentJenjang: "Staf BK",
        studentKelas: "Staf Layanan BK",
        timestamp: "13 Jun 25, 09:10",
        upvotes: 5,
        upvotedBy: []
      }
    ]
  },
  {
    id: "disc_2",
    title: "Bagi adik-adik kelas 9 SMP di asrama, cara ngilangin stres jenuh belajar yang paling ampuh apa ya?",
    content: "Lapi ngerasa burnout banget belajar buat persiapan asesmen kelayakan dan tes gaya belajar. Di kamar asrama bawaannya pengen tidur mulu tapi banyak tugas. Yuk bagi ide relaksasi sederhana yang ramah asrama!",
    category: "Masalah Belajar & Motivasi",
    studentName: "Zahra Alya Utama",
    studentNisn: "0103456789",
    studentJenjang: "SMP",
    studentKelas: "Kelas 9 Akhwat",
    timestamp: "15 Jun 25, 20:05",
    upvotes: 18,
    upvotedBy: [],
    answers: [
      {
        id: "ans_2_1",
        content: "Saran aku yang simpel banget: olahraga sore, Zahra! Coba main petanque kesiswaan bareng temen-temen atau futsal sebentar. Menggerakkan fisik selama 30 menit terbukti banget nurunin hormon stres kortisols & ngembaliin mood belajar malam.",
        studentName: "Rizki Pratama",
        studentNisn: "0098765432",
        studentJenjang: "SMP",
        studentKelas: "Kelas 9 Ikhwan",
        timestamp: "15 Jun 25, 21:00",
        upvotes: 10,
        upvotedBy: []
      },
      {
        id: "ans_2_2",
        content: "Kalo aku biasanya curhat langsung ke asisten AI 'Teman CurhatKu' ini, atau minum air putih dingin sambil latihan pernapasan dalam. Coba bikin to-do list harian yang santai, kerjain 25 menit lalu istirahat 5 menit (metode Pomodoro). Semangat ya se-asrama!",
        studentName: "Siti Rahma",
        studentNisn: "0071239845",
        studentJenjang: "SMA",
        studentKelas: "Kelas 11 Akhwat",
        timestamp: "16 Jun 25, 08:30",
        upvotes: 14,
        upvotedBy: []
      }
    ]
  },
  {
    id: "disc_3",
    title: "Seberapa penting menyusun Portofolio Mandiri sejak awal masuk jenjang SMA kelas 10?",
    content: "Apakah lebih baik menunggu kelas 12 baru merapikan sertifikat piagam, atau dicicil sejak semester 1 kelas 10 ya? Mohon rekomendasinya buat persiapan beasiswa dan jalur prestasi.",
    category: "Persiapan Kuliah & Karir",
    studentName: "Farhan Mahendra",
    studentNisn: "0092345678",
    studentJenjang: "SMA",
    studentKelas: "Kelas 10 Ikhwan",
    timestamp: "18 Jun 25, 11:20",
    upvotes: 15,
    upvotedBy: [],
    answers: [
      {
        id: "ans_3_1",
        content: "Sangat direkomendasikan untul DICICIL sejak kelas 10 semester 1, Farhan! Banyak kasus kakak kelas 12 yang kebingungan karena kehilangan file sertifikat, lupa tanggal acara, atau tidak punya dokumentasi kegiatan. Mengisi menu Portofolio Mandiri di Cendekia Metrix tiap kali habis dapet piagam itu ngebantu banget pas nanti pendaftaran SNBP/Beasiswa tinggal klik export saja.",
        studentName: "Kamilah Salsabila",
        studentNisn: "0061122334",
        studentJenjang: "SMA",
        studentKelas: "Kelas 12 Akhwat",
        timestamp: "18 Jun 25, 13:40",
        upvotes: 11,
        upvotedBy: []
      }
    ]
  }
];

interface TemanCurhatAIProps {
  profile: StudentProfile;
  jenjang: "SMP" | "SMA";
  onUpdateProfile: (updated: StudentProfile) => void;
  onLogout: () => void;
}

const CHAT_STORAGE_KEY = "sipetakuliah_counseling_chats";

export default function TemanCurhatAI({ profile, jenjang, onUpdateProfile, onLogout }: TemanCurhatAIProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "direct_bk" | "discussion" | "biodata">("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quora Discussion Forum State Variables
  const [discussions, setDiscussions] = useState<Discussion[]>(() => {
    const raw = localStorage.getItem("sipetakuliah_quora_discussions");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    localStorage.setItem("sipetakuliah_quora_discussions", JSON.stringify(SEED_DISCUSSIONS));
    return SEED_DISCUSSIONS;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua Tema");
  const [selectedJenjangFilter, setSelectedJenjangFilter] = useState<"Semua" | "SMP" | "SMA">("Semua");
  
  // Creation state
  const [isAsking, setIsAsking] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("Olimpiade Sains (OSN)");
  const [askError, setAskError] = useState("");

  // Select / Active discussion details
  const [activeDiscussionId, setActiveDiscussionId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");

  // Functions for Discussion Forum
  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setAskError("Judul diskusi tidak boleh kosong.");
      return;
    }
    if (!newContent.trim()) {
      setAskError("Detail pertanyaan tidak boleh kosong.");
      return;
    }

    const newQuestion: Discussion = {
      id: "disc_" + Date.now(),
      title: newTitle.trim(),
      content: newContent.trim(),
      category: newCategory,
      studentName: profile.nama || "Siswa Cendekia",
      studentNisn: profile.nisn || "000000",
      studentJenjang: jenjang,
      studentKelas: profile.kelas || "Umum",
      timestamp: new Date().toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }),
      upvotes: 0,
      upvotedBy: [],
      answers: []
    };

    const updated = [newQuestion, ...discussions];
    setDiscussions(updated);
    localStorage.setItem("sipetakuliah_quora_discussions", JSON.stringify(updated));

    // Reset input fields
    setNewTitle("");
    setNewContent("");
    setIsAsking(false);
    setAskError("");
  };

  const handleAddAnswer = (discId: string) => {
    if (!answerText.trim()) return;

    const newAnswer: DiscussionAnswer = {
      id: "ans_" + Date.now(),
      content: answerText.trim(),
      studentName: profile.nama || "Siswa Cendekia",
      studentNisn: profile.nisn || "000000",
      studentJenjang: jenjang,
      studentKelas: profile.kelas || "Umum",
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

    const updated = discussions.map((disc) => {
      if (disc.id === discId) {
        return {
          ...disc,
          answers: [...disc.answers, newAnswer]
        };
      }
      return disc;
    });

    setDiscussions(updated);
    localStorage.setItem("sipetakuliah_quora_discussions", JSON.stringify(updated));
    setAnswerText("");
  };

  const handleUpvoteQuestion = (discId: string) => {
    const userNisn = profile.nisn || "anonymous";
    const updated = discussions.map((disc) => {
      if (disc.id === discId) {
        const hasUpvoted = disc.upvotedBy.includes(userNisn);
        const upvotedBy = hasUpvoted
          ? disc.upvotedBy.filter((n) => n !== userNisn)
          : [...disc.upvotedBy, userNisn];
        const upvotes = hasUpvoted ? disc.upvotes - 1 : disc.upvotes + 1;
        return { ...disc, upvotedBy, upvotes };
      }
      return disc;
    });

    setDiscussions(updated);
    localStorage.setItem("sipetakuliah_quora_discussions", JSON.stringify(updated));
  };

  const handleUpvoteAnswer = (discId: string, ansId: string) => {
    const userNisn = profile.nisn || "anonymous";
    const updated = discussions.map((disc) => {
      if (disc.id === discId) {
        const updatedAnswers = disc.answers.map((ans) => {
          if (ans.id === ansId) {
            const hasUpvoted = ans.upvotedBy.includes(userNisn);
            const upvotedBy = hasUpvoted
              ? ans.upvotedBy.filter((n) => n !== userNisn)
              : [...ans.upvotedBy, userNisn];
            const upvotes = hasUpvoted ? ans.upvotes - 1 : ans.upvotes + 1;
            return { ...ans, upvotedBy, upvotes };
          }
          return ans;
        });
        return { ...disc, answers: updatedAnswers };
      }
      return disc;
    });

    setDiscussions(updated);
    localStorage.setItem("sipetakuliah_quora_discussions", JSON.stringify(updated));
  };

  // Direct BK message states
  const [directMessages, setDirectMessages] = useState<any[]>([]);
  const [directCategory, setDirectCategory] = useState("Akademik");
  const [directText, setDirectText] = useState("");
  const [directSuccess, setDirectSuccess] = useState(false);

  // Profile local states for instant editing
  const [editCitaCita, setEditCitaCita] = useState(profile.citaCita || "");
  const [editHobi, setEditHobi] = useState(profile.hobi || "");
  const [editOrganisasi, setEditOrganisasi] = useState(profile.organisasi || "");
  const [editTempatLahir, setEditTempatLahir] = useState(profile.tempatLahir || "");
  const [editTanggalLahir, setEditTanggalLahir] = useState(profile.tanggalLahir || "");
  const [editKelas, setEditKelas] = useState(profile.kelas || "");
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Load physical BK direct messages helper
  const loadDirectMessages = () => {
    const raw = localStorage.getItem("sipetakuliah_direct_bk_messages");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        // Filter direct messages belonging to only this student's NISN
        const filtered = parsed.filter((m: any) => m.nisn === profile.nisn);
        setDirectMessages(filtered);
      } catch (e) {
        setDirectMessages([]);
      }
    } else {
      setDirectMessages([]);
    }
  };

  // Trigger loading direct messages on mount and activeTab change
  useEffect(() => {
    loadDirectMessages();
  }, [profile.nisn, activeTab]);

  const handleSendDirectMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directText.trim()) return;

    const newMsg = {
      id: "direct_" + Date.now(),
      nisn: profile.nisn,
      nama: profile.nama,
      kelas: profile.kelas || "Umum",
      jenjang: jenjang,
      category: directCategory,
      messageText: directText.trim(),
      timestamp: new Date().toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }),
      status: "Menunggu Tanggapan"
    };

    const raw = localStorage.getItem("sipetakuliah_direct_bk_messages");
    let allMsgs = [];
    if (raw) {
      try {
        allMsgs = JSON.parse(raw);
        if (!Array.isArray(allMsgs)) allMsgs = [];
      } catch (err) {
        allMsgs = [];
      }
    }

    allMsgs.push(newMsg);
    localStorage.setItem("sipetakuliah_direct_bk_messages", JSON.stringify(allMsgs));
    
    setDirectText("");
    setDirectSuccess(true);
    loadDirectMessages();

    setTimeout(() => {
      setDirectSuccess(false);
    }, 4000);
  };

  // Curhat suggestion prompts
  const suggestions = [
    { text: "Gue lagi homesick kangen rumah nih... 🥺", emoji: "🏠" },
    { text: "Pusing banget setoran hafalan Qur'an macet", emoji: "📖" },
    { text: "Tugas asrama padat, lelah belajarnya...", emoji: "⚡" },
    { text: "Beda pendapat ama temen sekamar asrama", emoji: "🤝" }
  ];

  // Scroll to bottom on updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Load existing chat session if any
  useEffect(() => {
    const rawSessions = localStorage.getItem(CHAT_STORAGE_KEY);
    if (rawSessions) {
      try {
        const parsed = JSON.parse(rawSessions);
        // Look for existing session for this student NISN
        const session = parsed.find((s: any) => s.nisn === profile.nisn);
        if (session && session.messages && session.messages.length > 0) {
          setMessages(session.messages);
        } else {
          // Initialize with friendly peer greeting
          initializeGreeting();
        }
      } catch (e) {
        initializeGreeting();
      }
    } else {
      initializeGreeting();
    }
  }, [profile.nisn]);

  const initializeGreeting = () => {
    setMessages([
      {
        sender: "ai",
        text: `Halo ${profile.nama || "Sobat"}! 👋 Kenalin, gue **Teman CurhatKu**, pendamping konseling AI lo di asrama Sekolah Cendekia BAZNAS. \n\nGue di sini siap nemenin curhat lo kapan aja dengan santai. Mulai dari rasa rindu rumah (homesick), capek dikejar hafalan Al-Qur'an & hadits, pusing tugas sekolah, atau perselisihan sama temen sekamar di asrama. \n\nTumpahin keluh kesah lo di sini, tanpa di-judge dan pastinya penuh empati! Yuk cerita, lo hari ini lagi ngerasa gimana? 😊`,
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
      }
    ]);
  };

  // Auto-save session helper
  const saveChatSession = (updatedMessages: Message[]) => {
    const rawSessions = localStorage.getItem(CHAT_STORAGE_KEY);
    let sessionsList: any[] = [];
    if (rawSessions) {
      try {
        sessionsList = JSON.parse(rawSessions);
      } catch (e) {
        sessionsList = [];
      }
    }

    // Upsert session
    const existingIdx = sessionsList.findIndex((s: any) => s.nisn === profile.nisn);
    const sessionObj = {
      id: profile.nisn + "_" + jenjang,
      nama: profile.nama,
      nisn: profile.nisn,
      kelas: profile.kelas || "Umum",
      jenjang: jenjang,
      gender: profile.jenisKelamin,
      timestamp: new Date().toLocaleString("id-ID"),
      messages: updatedMessages
    };

    if (existingIdx > -1) {
      sessionsList[existingIdx] = sessionObj;
    } else {
      sessionsList.push(sessionObj);
    }

    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(sessionsList));
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      sender: "student",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputMessage("");
    setIsLoading(true);
    saveChatSession(newMessages);

    try {
      const response = await fetch("/api/counsel-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: newMessages.slice(-10), // Send last 10 messages context
          studentInfo: {
            nama: profile.nama,
            nisn: profile.nisn,
            kelas: profile.kelas,
            jenjang: jenjang
          }
        })
      });

      const data = await response.json();
      const aiMsg: Message = {
        sender: "ai",
        text: data.reply || "Aduh, koneksi gue lagi keganggu dikit nih. Coba lo ketik lagi dong curhatan lo...",
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
      };

      const finalMessages = [...newMessages, aiMsg];
      setMessages(finalMessages);
      setIsLoading(false);
      saveChatSession(finalMessages);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg: Message = {
        sender: "ai",
        text: "Waduh sahabat, sepertinya jaringan gue lagi tersendat nih hiks. Tapi tenang aja, jangan dipendam ya, gue selalu setia dengerin keluh kesah lo kok!",
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
      };
      const finalErrMessages = [...newMessages, errorMsg];
      setMessages(finalErrMessages);
      setIsLoading(false);
      saveChatSession(finalErrMessages);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Beneran mau hapus semua riwayat curhat lo sama Teman CurhatKu?")) {
      initializeGreeting();
      // Remove from shared save list as well or clear messages
      const rawSessions = localStorage.getItem(CHAT_STORAGE_KEY);
      if (rawSessions) {
        try {
          const sessionsList = JSON.parse(rawSessions);
          const cleaned = sessionsList.filter((s: any) => s.nisn !== profile.nisn);
          localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(cleaned));
        } catch (e) {}
      }
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: StudentProfile = {
      ...profile,
      kelas: editKelas,
      citaCita: editCitaCita,
      hobi: editHobi,
      organisasi: editOrganisasi,
      tempatLahir: editTempatLahir,
      tanggalLahir: editTanggalLahir
    };
    onUpdateProfile(updated);
    setUpdateSuccess(true);
    setTimeout(() => setUpdateSuccess(false), 3000);
  };

  return (
    <div id="counseling-container" className="max-w-6xl mx-auto space-y-6">
      
      {/* 1. Header Profile Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-cyan-700 text-white rounded-3xl p-6 sm:p-8 border border-emerald-500/10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/20 rounded-full text-[10px] font-extrabold uppercase font-mono tracking-widest">
              Layanan Konseling Mandiri • {jenjang}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight flex items-center gap-2.5">
              <Smile className="h-8 w-8 text-semibold text-emerald-300" />
              Teman CurhatKu
            </h1>
            <p className="text-xs sm:text-sm text-emerald-50 max-w-2xl leading-relaxed">
              Halo <strong>{profile.nama}</strong>! Ini adalah ruang curhat eksklusif lo bersama AI. Tumpahin semua perasaan lo tanpa ragu. Riwayat obrolan ini terintegrasi dengan Guru BK SMP/SMA Sekolah Cendekia BAZNAS untuk membantu pendampingan empati.
            </p>
          </div>

          <button
            onClick={onLogout}
            className="px-4.5 py-2.5 bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <LogOut className="h-4 w-4" />
            Keluar Portal
          </button>
        </div>
      </div>

      {/* 2. Main Content Frame (Grid of tabs) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Side: Tabs Nav and Quick Profile Preview Card */}
        <div className="space-y-6 lg:col-span-1">
          {/* Quick Menu */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-3 shadow-sm space-y-1">
            <button
              onClick={() => setActiveTab("chat")}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
                activeTab === "chat"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/10"
                  : "text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850"
              }`}
            >
              <MessageSquare className="h-4.5 w-4.5" />
              Ruang Teman Curhat
            </button>
             <button
              onClick={() => setActiveTab("direct_bk")}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
                activeTab === "direct_bk"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/10"
                  : "text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850"
              }`}
            >
              <Heart className="h-4.5 w-4.5 text-rose-500 animate-pulse" />
              Pesan ke Guru BK {jenjang}
            </button>
            <button
              onClick={() => setActiveTab("discussion")}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
                activeTab === "discussion"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/10"
                  : "text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850"
              }`}
            >
              <MessageCircle className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
              Forum Diskusi Quora Edu
            </button>
            <button
              onClick={() => setActiveTab("biodata")}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
                activeTab === "biodata"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/10"
                  : "text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850"
              }`}
            >
              <User className="h-4.5 w-4.5" />
              Biodata Diri Saya
            </button>
          </div>

          {/* Student Profile Card (Visual Info Widget) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-3.5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-11 h-11 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-sm border border-emerald-100 dark:border-emerald-900">
                {profile.nama.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate max-w-[140px]">
                  {profile.nama}
                </h3>
                <span className="text-[10px] font-mono text-slate-400">NISN: {profile.nisn}</span>
              </div>
            </div>

            <div className="space-y-3 text-[11px] font-medium text-slate-600 dark:text-slate-405">
              <div className="flex justify-between">
                <span className="text-slate-400">Jenjang:</span>
                <span className="font-bold text-slate-850 dark:text-slate-200">{jenjang}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Kelas:</span>
                <span className="font-bold text-slate-850 dark:text-slate-200">{profile.kelas || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Gender:</span>
                <span className="font-bold text-slate-850 dark:text-slate-200">{profile.jenisKelamin || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cita-cita:</span>
                <span className="font-bold text-slate-850 dark:text-slate-200 truncate max-w-[120px]">{profile.citaCita || "Belum diisi"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Hobi:</span>
                <span className="font-bold text-slate-850 dark:text-slate-200 truncate max-w-[120px]">{profile.hobi || "Belum diisi"}</span>
              </div>
            </div>

            {/* Disclaimer notice */}
            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850 text-[10.5px] leading-relaxed text-slate-500 flex gap-2">
              <Info className="h-4 w-4 text-emerald-600 dark:text-emerald-450 shrink-0 mt-0.5" />
              <span>Gunakan menu <strong>Biodata</strong> jika ingin memperbarui hobimu atau cita-citamu agar AI makin jeli memberimu saran!</span>
            </div>
          </div>
        </div>

        {/* Right Side: Tab Panel Body */}
        <div className="lg:col-span-3">
          
          {/* Active Tab A: Ruang Teman Curhat */}
          {activeTab === "chat" && (
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col h-[520px]">
              
              {/* Chat Sub-header */}
              <div className="pb-3.5 border-b border-slate-100 dark:border-slate-850 flex justify-between items-center px-1">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono tracking-wide">
                    TEMAN CURHATKU (AKTIF)
                  </span>
                </div>
                
                <button
                  type="button"
                  onClick={handleClearHistory}
                  title="Kosongkan Obrolan"
                  className="p-1.5 rounded-lg text-slate-450 hover:text-red-500 dark:hover:text-red-400 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Chat messages viewport */}
              <div className="flex-1 overflow-y-auto py-4 px-1 space-y-4 font-sans text-xs scrollbar-thin">
                {messages.map((msg, index) => {
                  const isAi = msg.sender === "ai";
                  return (
                    <div
                      key={index}
                      className={`flex items-start gap-2.5 max-w-[85%] ${
                        isAi ? "mr-auto" : "ml-auto flex-row-reverse"
                      }`}
                    >
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        isAi 
                          ? "bg-slate-100 dark:bg-slate-820 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-450" 
                          : "bg-emerald-50 dark:bg-emerald-950/45 text-emerald-700 border border-emerald-100"
                      }`}>
                        {isAi ? <Sparkles className="h-4 w-4" /> : <User className="h-4 w-4" />}
                      </div>

                      {/* Bubble */}
                      <div className="space-y-1">
                        <div
                          className={`p-3.5 rounded-2xl shadow-sm leading-relaxed whitespace-pre-wrap ${
                            isAi
                              ? "bg-slate-50 dark:bg-slate-820 text-slate-850 dark:text-slate-205 rounded-tl-none border border-slate-100 dark:border-slate-800/60"
                              : "bg-emerald-600 text-white rounded-tr-none font-medium"
                          }`}
                        >
                          {/* Basic markdown emulation for bold notations */}
                          {msg.text.split("**").map((part, i) => 
                            i % 2 === 1 ? <strong key={i} className={isAi ? "text-slate-900 dark:text-white font-bold" : "font-black"}>{part}</strong> : part
                          )}
                        </div>
                        <span className={`text-[9px] font-mono text-slate-400 block ${!isAi && "text-right"}`}>
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="flex items-start gap-2.5 max-w-[80%] mr-auto">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-820 text-emerald-600 flex items-center justify-center shrink-0">
                      <Sparkles className="h-4 w-4 animate-spin" />
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-820 border border-slate-100 dark:border-slate-800/60 text-slate-400 p-3.5 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-sm font-medium">
                      <span>Teman CurhatKu lagi ngetik balesan</span>
                      <span className="flex gap-0.5 mt-1.5">
                        <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce"></span>
                        <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                      </span>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Prompt Suggestions (Show only when conversation is short) */}
              {messages.length <= 2 && !isLoading && (
                <div className="border-t border-slate-100 dark:border-slate-850 py-3 px-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block mb-2">
                    💡 Rekomendasi Topik Curhat:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {suggestions.map((sg, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(sg.text)}
                        className="p-2 bg-slate-50 dark:bg-slate-950 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-slate-700 dark:text-slate-350 hover:text-emerald-750 border border-slate-150/60 dark:border-slate-855 rounded-xl text-left text-[11px] font-semibold transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <span className="text-sm">{sg.emoji}</span>
                        <span className="truncate">{sg.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Send form inputs */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputMessage);
                }}
                className="pt-3 border-t border-slate-100 dark:border-slate-850 flex gap-2.5 items-center shrink-0"
              >
                <input
                  type="text"
                  placeholder="Ketik curhatan lo di sini..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-850 rounded-xl text-xs focus:outline-none focus:border-emerald-500 font-medium disabled:opacity-50"
                  required
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputMessage.trim()}
                  className="w-11 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-750 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/10 cursor-pointer shrink-0 transition-colors"
                >
                  <Send className="h-4.5 w-4.5" />
                </button>
              </form>

            </div>
          )}

          {/* Active Tab C: Curhat Langsung ke Guru BK (SMP atau SMA sesuai jenjang) */}
          {activeTab === "direct_bk" && (
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
              
              <div className="border-b border-slate-100 dark:border-slate-850 pb-4">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-450 rounded-full text-[10px] font-black uppercase font-mono tracking-widest mb-2">
                  Layanan Konseling Tatap Muka & Formal
                </div>
                <h3 className="text-base font-black text-slate-905 dark:text-white font-display flex items-center gap-2">
                  <span>💌</span>
                  Pesan Konseling Pribadi ke Guru BK {jenjang}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">
                  Selain mengobrol dengan asisten AI, kamu juga bisa mengirim pesan langsung yang bersifat rahasia dan pribadi kepada <strong>Guru BK {jenjang}</strong> Sekolah Cendekia BAZNAS. Guru BK akan meninjau pesanmu dan membalas melalui portal ini secara personal.
                </p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                
                {/* Send Message Form */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider font-mono">
                    KIRIM PESAN BARU
                  </h4>
                  
                  <form onSubmit={handleSendDirectMessage} className="space-y-4 text-xs">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-405 uppercase tracking-wider font-mono">
                        Kategori Curhatan
                      </label>
                      <select
                        value={directCategory}
                        onChange={(e) => setDirectCategory(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-850 text-slate-850 dark:text-white rounded-xl focus:outline-none font-semibold text-xs transition-colors focus:border-red-500"
                      >
                        <option value="Akademik (Kesulitan Belajar)">Akademik (Kesulitan Belajar)</option>
                        <option value="Sosial (Teman / Bullying / Perselisihan)">Sosial (Teman / Bullying / Perselisihan)</option>
                        <option value="Pribadi / Keluarga">Pribadi / Keluarga</option>
                        <option value="Masalah Asrama (Kamar / Pendamping)">Masalah Asrama (Kamar / Pendamping)</option>
                        <option value="Saran Beasiswa & Karir">Saran Beasiswa & Karir</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>

                    <div className="space-y-1.55">
                      <label className="text-[10px] font-extrabold text-slate-405 uppercase tracking-wider font-mono">
                        Isi Pesan / Keluh Kesah
                      </label>
                      <textarea
                        rows={5}
                        placeholder="Ketik rahasiamu, keluhanmu, atau apa pun yang ingin kamu diskusikan langsung dengan Guru BK di sini..."
                        value={directText}
                        onChange={(e) => setDirectText(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:border-red-500 font-medium text-xs leading-relaxed"
                        required
                      ></textarea>
                    </div>

                    {directSuccess && (
                      <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 p-3 rounded-xl text-xs text-rose-600 dark:text-rose-450 font-semibold leading-relaxed">
                        ✓ Pesan berhasil terkirim langsung ke kotak masuk <strong>Guru BK {jenjang}</strong>! Jawaban atau respon tertulis Guru BK akan segera tampil pada daftar di samping jika sudah ditinjau. Tetap semangat ya sahabat!
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3 bg-red-600 hover:bg-red-750 text-white font-bold rounded-xl transition-all shadow-md shadow-red-500/10 cursor-pointer block font-mono text-center uppercase tracking-wider"
                    >
                      Kirim ke Guru BK {jenjang} SCB
                    </button>
                  </form>
                </div>

                {/* Sent Messages List */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider font-mono">
                    RIWAYAT ADUAN & BALASAN ({directMessages.length})
                  </h4>

                  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
                    {directMessages.length === 0 ? (
                      <div className="text-center p-8 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/80">
                        <span className="text-2xl block mb-2">📥</span>
                        <h5 className="text-xs font-bold text-slate-750 dark:text-slate-350">Belum Ada Riwayat Aduan</h5>
                        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                          Pesan pribadi atau aduan tertulis yang kamu kirim kepada Guru BK lewat formulir di sebelah kiri akan terekam rapi di sini demi keamanan privasimu.
                        </p>
                      </div>
                    ) : (
                      [...directMessages].reverse().map((msg, index) => (
                        <div key={index} className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl p-4 space-y-3 shadow-sm">
                          <div className="flex justify-between items-start gap-2 border-b border-slate-200/50 dark:border-slate-850/50 pb-2">
                            <div>
                              <span className="px-1.5 py-0.5 bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 rounded-md font-extrabold text-[9px] uppercase tracking-wide">
                                {msg.category}
                              </span>
                              <span className="text-[9px] font-mono text-slate-400 block mt-1">
                                Dikirim: {msg.timestamp}
                              </span>
                            </div>

                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase font-mono tracking-wider ${
                              msg.status === "Sudah Ditanggapi"
                                ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200/30"
                                : "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-450 border border-amber-200/30"
                            }`}>
                              {msg.status}
                            </span>
                          </div>

                          <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                            <span className="text-[10px] text-slate-400 font-bold block mb-0.5 font-mono">PESAN SISWA:</span>
                            {msg.messageText}
                          </div>

                          {msg.response && (
                            <div className="mt-3 p-3 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl space-y-1 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5">
                              <div className="flex justify-between items-center text-[9px] font-serif font-black text-emerald-700 dark:text-emerald-400">
                                <span>BALASAN GURU BK {jenjang} SCB</span>
                                <span className="font-mono text-slate-400">{msg.response.timestamp}</span>
                              </div>
                              <p className="text-xs text-slate-650 dark:text-slate-300 leading-relaxed italic">
                                &ldquo; {msg.response.responseText} &rdquo;
                              </p>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* Active Tab: Discussion (Quora-like Educational Discussion Board) */}
          {activeTab === "discussion" && (
            <div className="space-y-6">
              
              {/* If Viewing Details */}
              {activeDiscussionId ? (
                (() => {
                  const disc = discussions.find(d => d.id === activeDiscussionId);
                  if (!disc) {
                    setActiveDiscussionId(null);
                    return null;
                  }
                  return (
                    <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
                      
                      {/* Sub-header with back button */}
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-4">
                        <button
                          onClick={() => setActiveDiscussionId(null)}
                          className="px-3.5 py-1.5 text-xs text-emerald-650 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-slate-850 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          &larr; Kembali ke Daftar Forum
                        </button>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-mono font-extrabold px-3 py-1 rounded-full uppercase">
                          {disc.category}
                        </span>
                      </div>

                      {/* Main Question Post */}
                      <div className="space-y-3">
                        <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight font-display">
                          {disc.title}
                        </h2>
                        
                        {/* Author Metadata */}
                        <div className="flex items-center gap-2.5 text-xs text-slate-500">
                          <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-white flex items-center justify-center font-bold text-xs uppercase">
                            {disc.studentName.substring(0, 2)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-700 dark:text-slate-350 flex items-center gap-1.5">
                              <span>{disc.studentName}</span>
                              <span className="px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-[9px] text-amber-700 dark:text-amber-400 font-black">
                                {disc.studentJenjang} • {disc.studentKelas}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">{disc.timestamp}</span>
                          </div>
                        </div>

                        {/* Question Content */}
                        <p className="text-xs sm:text-sm text-slate-705 dark:text-slate-300 leading-relaxed font-normal whitespace-pre-wrap pt-2 pl-3 border-l-2 border-emerald-500">
                          {disc.content}
                        </p>

                        {/* Question Action Panel (Upvote and Share Info) */}
                        <div className="flex items-center gap-3 pt-3">
                          <button
                            onClick={() => handleUpvoteQuestion(disc.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all outline-none cursor-pointer ${
                              disc.upvotedBy.includes(profile.nisn || "anonymous")
                                ? "bg-emerald-600 text-white shadow-sm"
                                : "bg-slate-50 hover:bg-slate-150 dark:bg-slate-950 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-350 border border-slate-150 dark:border-slate-800"
                            }`}
                          >
                            <ThumbsUp className="h-3.5 w-3.5" />
                            <span>Upvote ({disc.upvotes})</span>
                          </button>
                          
                          <span className="text-[10.5px] text-slate-400 font-medium font-mono">
                            {disc.answers.length} tanggapan dari kawan seasrama
                          </span>
                        </div>
                      </div>

                      {/* Answers Section */}
                      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-850">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">
                          JAWABAN KAWAN ({disc.answers.length})
                        </h3>

                        {disc.answers.length === 0 ? (
                          <div className="text-center py-6 text-slate-400 italic text-xs bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-205 dark:border-slate-800">
                            Belum ada tanggapan. Yuk, jadi yang pertama memberikan arahan positif untuk kawan asramamu!
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {disc.answers.map((ans) => (
                              <div
                                key={ans.id}
                                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 flex items-start gap-3 relative hover:shadow-xs transition-all duration-200"
                              >
                                {/* Left Upvote of Answer */}
                                <div className="flex flex-col items-center shrink-0">
                                  <button
                                    onClick={() => handleUpvoteAnswer(disc.id, ans.id)}
                                    className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                                      ans.upvotedBy.includes(profile.nisn || "anonymous")
                                        ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/25"
                                        : "text-slate-400 hover:text-slate-650"
                                    }`}
                                  >
                                    <ArrowUp className="h-4 w-4" />
                                    <span className="text-[10px] font-mono font-black">{ans.upvotes}</span>
                                  </button>
                                </div>

                                {/* Answer Content area */}
                                <div className="flex-1 space-y-1.5">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-xs font-black text-slate-750 dark:text-white">
                                      {ans.studentName}
                                    </span>
                                    <span className="text-[9px] bg-slate-200 dark:bg-slate-805 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-bold font-mono">
                                      {ans.studentJenjang} • {ans.studentKelas}
                                    </span>
                                    <span className="text-[9px] text-slate-400 font-mono ml-auto">
                                      {ans.timestamp}
                                    </span>
                                  </div>
                                  
                                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                    {ans.content}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Write Answer Form */}
                      <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-150 dark:border-slate-850 mt-4 space-y-3">
                        <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5 font-display uppercase tracking-wide">
                          <MessageCircle className="h-4 w-4 text-emerald-600 animate-bounce" />
                          Tulis Arahan / Jawaban Anda
                        </h4>
                        <textarea
                          placeholder="Ketik balasan, saran bimbingan, atau pengalaman pendidikanmu seputar pertanyaan di atas..."
                          rows={3}
                          value={answerText}
                          onChange={(e) => setAnswerText(e.target.value)}
                          className="w-full text-xs p-3 bg-white dark:bg-slate-900 text-slate-850 dark:text-white border border-slate-205 dark:border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 leading-relaxed font-sans"
                        />
                        <div className="flex justify-end gap-2.5">
                          <button
                            type="button"
                            onClick={() => {
                              handleAddAnswer(disc.id);
                            }}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition-all shadow-sm cursor-pointer uppercase tracking-tight font-mono"
                          >
                            Kirim Jawaban Anda
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })()
              ) : (
                <div className="space-y-6">
                  
                  {/* Banner Info */}
                  <div className="bg-gradient-to-r from-emerald-50/60 to-cyan-50/60 dark:from-emerald-950/15 dark:to-cyan-950/15 p-5 rounded-3xl border border-emerald-100/40 dark:border-emerald-950/30 space-y-2 relative overflow-hidden">
                    <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-40 h-40 bg-emerald-500/5 rounded-full blur-2xl"></div>
                    
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-amber-500" />
                      <h4 className="text-xs font-black text-emerald-800 dark:text-emerald-400 font-mono tracking-wider uppercase">
                        Sistem Quora Pendidikan Cendekia
                      </h4>
                    </div>
                    <p className="text-[11.5px] leading-relaxed text-slate-600 dark:text-slate-400 max-w-3xl">
                      Selamat datang di <strong>Forum Quora BK</strong>! Ini adalah wadah media sosial resmi santri Sekolah Cendekia BAZNAS (SMP & SMA) untuk berdiskusi, bertukar pengalaman, saling menjawab persoalan belajar, atau membagi strategi sukses Olimpiade Sains (OSN) secara terbuka dan sehat. Seluruh perdebatan diwajibkan bertema seputar pendidikan kesiswaan.
                    </p>
                  </div>

                  {/* Search, Filter, and Ask Question Header Block */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
                    
                    {/* Top Row: Search and Ask */}
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                      <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Cari kata kunci diskusi pendidikan..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors font-medium font-sans"
                        />
                      </div>
                      
                      <button
                        onClick={() => setIsAsking(!isAsking)}
                        className="px-4.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer justify-center shadow-md shadow-emerald-500/5 font-mono uppercase"
                      >
                        {isAsking ? (
                          <>
                            <X className="h-4 w-4" />
                            Batal Tanya
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4" />
                            Tulis Pertanyaan / Diskusi
                          </>
                        )}
                      </button>
                    </div>

                    {/* Ask Form (Expanded) */}
                    {isAsking && (
                      <form
                        onSubmit={handleAddQuestion}
                        className="bg-slate-50 dark:bg-slate-955 p-4.5 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-4 shadow-inner"
                      >
                        <div className="border-b border-slate-200 dark:border-slate-800 pb-2 flex justify-between items-center">
                          <h4 className="text-xs font-black text-slate-804 dark:text-white uppercase tracking-wider font-mono">
                            Buat Topik Diskusi Baru
                          </h4>
                          <span className="text-[10px] text-amber-500 font-bold">* Khusus Tema Seputar Pendidikan</span>
                        </div>

                        {askError && (
                          <div className="text-[10.5px] font-bold text-red-500 font-mono">
                            * {askError}
                          </div>
                        )}

                        <div className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-extrabold text-slate-40 block uppercase tracking-wider font-mono">
                              Judul Pertanyaan / Diskusi (Gaya Quora)
                            </label>
                            <input
                              type="text"
                              placeholder="Contoh: Bagaimana metode menghafal Al-Qur'an 1 hari 1 halaman tanpa melupakan juz sebelumnya?"
                              value={newTitle}
                              onChange={(e) => setNewTitle(e.target.value)}
                              className="w-full text-xs px-3.5 py-2.5 bg-white dark:bg-slate-900 text-slate-855 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                              required
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1 md:col-span-2">
                              <label className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider font-mono">
                                Detail Masalah / Penjelasan Lebih Lengkap
                              </label>
                              <textarea
                                placeholder="Jelaskan secara detail, kendala belajarmu, latar belakang masalahnya agar kawan asrama di SMP/SMA mengerti..."
                                rows={3}
                                value={newContent}
                                onChange={(e) => setNewContent(e.target.value)}
                                className="w-full text-xs p-3 bg-white dark:bg-slate-900 text-slate-850 dark:text-white border border-slate-205 dark:border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 font-sans"
                                required
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider font-mono">
                                Klasifikasi Tema Pendidikan
                              </label>
                              <select
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                className="w-full text-xs px-3 py-2.5 bg-white dark:bg-slate-900 text-slate-850 dark:text-white border border-slate-205 dark:border-slate-820 rounded-xl focus:outline-none font-medium h-[42px]"
                              >
                                {DISCUSSION_CATEGORIES.map((cat) => (
                                  <option key={cat} value={cat}>
                                    {cat}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setIsAsking(false);
                              setAskError("");
                            }}
                            className="px-3.5 py-2 bg-slate-200 hover:bg-slate-250 dark:bg-slate-900 text-slate-650 dark:text-slate-400 text-xs font-bold rounded-xl cursor-pointer"
                          >
                            Batal
                          </button>
                          <button
                            type="submit"
                            className="px-4.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition-all shadow-sm cursor-pointer"
                          >
                            Tayangkan Pertanyaan
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Filters Pill Wrapper Container */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-850 flex flex-col gap-3">
                      
                      {/* Topic Filters */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mr-1.5 uppercase tracking-wider">
                          <Filter className="h-3 w-3" /> Tema:
                        </span>
                        
                        {["Semua Tema", ...DISCUSSION_CATEGORIES].map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3 py-1.5 rounded-xl text-[10.5px] font-bold transition-all cursor-pointer ${
                              selectedCategory === cat
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-400 border border-slate-150 dark:border-slate-850 hover:bg-slate-100"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                      {/* Jenjang Filter (SMP / SMA / Semua) */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mr-1.5 uppercase tracking-wider">
                          <User className="h-3 w-3" /> Jenjang Penanya:
                        </span>
                        {(["Semua", "SMP", "SMA"] as const).map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setSelectedJenjangFilter(lvl)}
                            className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                              selectedJenjangFilter === lvl
                                ? "bg-amber-600 text-white"
                                : "bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-400 border border-slate-150 dark:border-slate-850 hover:bg-slate-100"
                            }`}
                          >
                            {lvl === "Semua" ? "Semua Siswa" : `Siswa ${lvl}`}
                          </button>
                        ))}
                      </div>

                    </div>

                  </div>

                  {/* Discussions Lists */}
                  <div className="space-y-4 font-sans text-xs">
                    {(() => {
                      // Filter logic
                      const filteredDiscussions = discussions.filter((disc) => {
                        const matchesSearch =
                          disc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          disc.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          disc.studentName.toLowerCase().includes(searchQuery.toLowerCase());
                        
                        const matchesCategory =
                          selectedCategory === "Semua Tema" || disc.category === selectedCategory;

                        const matchesJenjang =
                          selectedJenjangFilter === "Semua" || disc.studentJenjang === selectedJenjangFilter;

                        return matchesSearch && matchesCategory && matchesJenjang;
                      });

                      if (filteredDiscussions.length === 0) {
                        return (
                          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-10 text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-950/40 text-slate-400 mx-auto flex items-center justify-center">
                              <Search className="h-8 w-8" />
                            </div>
                            <div className="space-y-1">
                              <h4 className="text-sm font-bold text-slate-805 dark:text-white">Tidak ada diskusi ditemukan</h4>
                              <p className="text-xs text-slate-500 max-w-md mx-auto">
                                Belum ada pertanyaan pendidikan di kriteria ini. Jadilah yang pertama dengan memencet tombol &ldquo;Tulis Pertanyaan / Diskusi&rdquo; di atas!
                              </p>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div className="grid grid-cols-1 gap-4.5">
                          {filteredDiscussions.map((disc) => {
                            const isOriginalAuthor = disc.studentNisn === profile.nisn;
                            const hasUpvoted = disc.upvotedBy.includes(profile.nisn || "anonymous");
                            
                            return (
                              <div
                                key={disc.id}
                                className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex flex-col md:flex-row gap-4 items-start relative overflow-hidden group"
                              >
                                {/* Upvote Side Column */}
                                <div className="flex md:flex-col items-center justify-center gap-1 shadow-inner bg-slate-50 dark:bg-slate-950 p-2 rounded-xl shrink-0 border border-slate-100 dark:border-slate-800/80 w-14">
                                  <button
                                    onClick={() => handleUpvoteQuestion(disc.id)}
                                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                      hasUpvoted
                                        ? "text-emerald-500 bg-emerald-50 relative dark:bg-emerald-900/25 animate-ping-once"
                                        : "text-slate-400 hover:text-slate-650"
                                    }`}
                                    title="Upvote jika info ini bermanfaat"
                                  >
                                    <ArrowUp className="h-5 w-5" />
                                  </button>
                                  <span className="text-[11px] md:text-sm font-black text-slate-800 dark:text-white leading-none font-mono">
                                    {disc.upvotes}
                                  </span>
                                  <span className="text-[8px] text-slate-450 uppercase tracking-widest font-mono hidden md:inline font-bold">Votes</span>
                                </div>

                                {/* Main Card Details */}
                                <div className="flex-1 space-y-2.5">
                                  
                                  {/* Top line profile metadata / Category */}
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[9px] bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-305 px-2.5 py-0.5 rounded-full font-black uppercase font-mono">
                                      {disc.category}
                                    </span>
                                    <div className="text-[10px] text-slate-450 font-medium">
                                      Dibuat oleh <strong className="text-slate-650 dark:text-slate-300">{disc.studentName}</strong> 
                                      <span className="mx-1 px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono font-bold text-[9px] text-slate-500">
                                        {disc.studentJenjang} • {disc.studentKelas}
                                      </span>
                                    </div>
                                    <span className="text-[9px] text-slate-405 font-mono ml-auto">
                                      {disc.timestamp}
                                    </span>
                                  </div>

                                  {/* Title link */}
                                  <h3
                                    onClick={() => setActiveDiscussionId(disc.id)}
                                    className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug font-display hover:text-emerald-650 dark:hover:text-emerald-450 cursor-pointer transition-colors"
                                  >
                                    {disc.title}
                                  </h3>

                                  {/* Snip content */}
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-3xl line-clamp-2">
                                    {disc.content}
                                  </p>

                                  {/* Answers Count Badge & Action Footer */}
                                  <div className="flex items-center justify-between pt-1 border-t border-slate-100/50 dark:border-slate-850/50">
                                    <button
                                      onClick={() => setActiveDiscussionId(disc.id)}
                                      className="text-[11px] font-black text-emerald-650 hover:text-emerald-700 dark:text-emerald-450 dark:hover:text-emerald-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                                    >
                                      <MessageCircle className="h-4 w-4" />
                                      <span>{disc.answers.length} Tanggapan / Jawaban</span>
                                    </button>

                                    {isOriginalAuthor && (
                                      <span className="text-[9px] text-slate-400 uppercase font-mono font-bold">
                                        Pertanyaan Anda
                                      </span>
                                    )}
                                  </div>

                                </div>

                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>

                </div>
              )}

            </div>
          )}

          {/* Active Tab B: Biodata Diri Saya */}
          {activeTab === "biodata" && (
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-850 pb-3">
                <h3 className="text-base font-black text-slate-905 dark:text-white font-display">
                  Perbarui Biodata Diri
                </h3>
                <p className="text-xs text-slate-500">
                  Perbarui informasi pendukung biodata diri lo di bawah ini agar integrasi konseling dengan Teman CurhatKu and Guru BK semakin jitu.
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-405 uppercase tracking-wider font-mono">Nama Lengkap (Terkunci)</label>
                    <input
                      type="text"
                      value={profile.nama}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl focus:outline-none text-slate-500 font-medium"
                      disabled
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-405 uppercase tracking-wider font-mono">NISN (Terkunci)</label>
                    <input
                      type="text"
                      value={profile.nisn}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl focus:outline-none text-slate-500 font-mono"
                      disabled
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-405 uppercase tracking-wider font-mono">Kelas Sekarang</label>
                    <select
                      value={editKelas}
                      onChange={(e) => setEditKelas(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-850 text-slate-850 dark:text-white rounded-xl focus:outline-none font-medium"
                    >
                      {jenjang === "SMP" ? (
                        <>
                          <option value="Kelas 7 Ikhwan">Kelas 7 Ikhwan</option>
                          <option value="Kelas 7 Akhwat">Kelas 7 Akhwat</option>
                          <option value="Kelas 8 Ikhwan">Kelas 8 Ikhwan</option>
                          <option value="Kelas 8 Akhwat">Kelas 8 Akhwat</option>
                          <option value="Kelas 9 Ikhwan">Kelas 9 Ikhwan</option>
                          <option value="Kelas 9 Akhwat">Kelas 9 Akhwat</option>
                        </>
                      ) : (
                        <>
                          <option value="Kelas 10 Ikhwan">Kelas 10 Ikhwan</option>
                          <option value="Kelas 10 Akhwat">Kelas 10 Akhwat</option>
                          <option value="Kelas 11 Ikhwan">Kelas 11 Ikhwan</option>
                          <option value="Kelas 11 Akhwat">Kelas 11 Akhwat</option>
                          <option value="Kelas 12 Ikhwan">Kelas 12 Ikhwan</option>
                          <option value="Kelas 12 Akhwat">Kelas 12 Akhwat</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-405 uppercase tracking-wider font-mono">Tempat Lahir</label>
                    <input
                      type="text"
                      placeholder="Masukkan Tempat Lahir"
                      value={editTempatLahir}
                      onChange={(e) => setEditTempatLahir(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-405 uppercase tracking-wider font-mono">Tanggal Lahir</label>
                    <input
                      type="date"
                      value={editTanggalLahir}
                      onChange={(e) => setEditTanggalLahir(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider font-mono">Cita-Cita Masa Depan</label>
                    <input
                      type="text"
                      placeholder="Contoh: Dosen, Dokter, Hafidz, Ahli AI..."
                      value={editCitaCita}
                      onChange={(e) => setEditCitaCita(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider font-mono">Hobi Utama</label>
                    <input
                      type="text"
                      placeholder="Contoh: Bermain sepak bola, Membaca buku, Menghafal Al-Qur'an..."
                      value={editHobi}
                      onChange={(e) => setEditHobi(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider font-mono">Organisasi yang Diikuti</label>
                  <input
                    type="text"
                    placeholder="Contoh: Pengurus Kamar, OSIS SCB, Rohis Asrama, Klub Robotik..."
                    value={editOrganisasi}
                    onChange={(e) => setEditOrganisasi(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>

                {updateSuccess && (
                  <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    ✓ Biodata diri lo berhasil diperbarui di basis data bimbingan konseling!
                  </div>
                )}

                <button
                  type="submit"
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-750 text-white font-bold rounded-xl transition-all shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 cursor-pointer block font-mono"
                >
                  SIMPAN BIODATA SAYA
                </button>
              </form>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
