/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface StudentProfile {
  nama: string;
  nisn: string;
  kelas: string;
  jenisKelamin: "Ikhwan" | "Akhwat" | "";
  tempatLahir: string;
  tanggalLahir: string;
  citaCita: string;
  hobi: string;
  organisasi: string;
  foto?: string; // Base64 string or dataURL representing the student photo
}

export type HafalanQuranType = "0-1 juz" | "2-5 juz" | "6-10 juz" | "11-20 juz" | "> 20 juz";
export type HafalanHaditsType = "0-20 hadits" | "21-50 hadits" | "51-80 hadits" | "81-100 hadits" | "100 hadits Lengkap";

export interface KeagamaanState {
  hafalan: HafalanQuranType;
  hafalanHadits: HafalanHaditsType;
  nilai: {
    pai: number;
    bahasaArab: number;
  };
  prestasi: string[]; // Options: mtq, mhq, pidato, lcc, ktia, dakwah, kaligrafi
  organisasi: string[]; // Options: rohis, osisKeagamaan, dkm, lainnya
}

export interface AkademikState {
  nilaiRapor: {
    matematika: number;
    bahasaIndonesia: number;
    bahasaInggris: number;
    ipa: number;
    ips: number;
  };
  prestasi: string[]; // Options: olimpiade, ksn, sains, debat, karyaTulis
  simulasiTes: {
    literasi: number; // 0-100
    numerasi: number; // 0-100
    penalaran: number; // 0-100
  };
}

export interface PrestasiEkskulState {
  ekskul: string[]; // Options: pramuka, petanque, pmr, paskibra, basket, futsal, silat, robotik, kir, musik, seni
  tingkatPrestasi: {
    sekolah: number; // count
    kabupaten: number;
    provinsi: number;
    nasional: number;
    internasional: number;
  };
  smpAnswers?: Record<number, number>; // questionId (1-12) -> chosenOptionIndex (1-4)
  smpCompleted?: boolean;
}

export interface MinatBakatState {
  answers: Record<number, number>; // questionId (1-60) -> rating (1-5) (Sangat Tidak Sesuai to Sangat Sesuai)
  completed: boolean;
}

export interface GayaBelajarState {
  answers: Record<number, number>; // questionId (1-30) -> rating (1-5)
  completed: boolean;
}

export interface IQTestState {
  answers: Record<number, number>; // questionId -> chosenOptionIndex
  completed: boolean;
  timeLeft: number; // in seconds
  scores: {
    verbal: number; // out of 20
    numerical: number; // out of 20
    logical: number; // out of 20
    spatial: number; // out of 20
  };
  scoreTotal: number; // 0-80
  iqScore: number; // converted (e.g. 80-140)
}

export interface AIRecommendation {
  status: 'idle' | 'loading' | 'success' | 'error';
  majors: {
    rank: number;
    name: string;
    description: string;
    suitabilityScore: number; // percent
  }[];
  justification: string;
  threeYearPlan: {
    kelas10: string;
    kelas11: string;
    kelas12: string;
  };
}

export interface PortfolioHafalan {
  id: string;
  juz: string;
  surat: string;
  haditsDoa: string;
  level: "Pemula" | "Menengah" | "Mahir" | "";
  bulan: string;
  tahun: string;
  penyelenggara: string;
}

export interface PortfolioAkademik {
  id: string;
  juaraLomba: string;
  peringkat: string;
  rataRapor: string;
  mapelUnggulan: string;
  level: "Sekolah" | "Kecamatan" | "Kabupaten" | "Provinsi" | "Nasional" | "";
  bulan: string;
  tahun: string;
  penyelenggara: string;
}

export interface PortfolioEkskul {
  id: string;
  osis: string;
  pramuka: string;
  rohis: string;
  paskibraPmr: string;
  olahragaSeni: string;
  level: "Anggota" | "Pengurus inti" | "Ketua" | "Pelatih" | "";
  bulan: string;
  tahun: string;
  penyelenggara: string;
}

export interface PortfolioSeminar {
  id: string;
  publicSpeaking: string;
  workshopSains: string;
  seminarKarir: string;
  pelatihanIt: string;
  webinar: string;
  level: "Peserta" | "Peserta aktif" | "Lulus ujian" | "Lulus terbaik" | "";
  bulan: string;
  tahun: string;
  penyelenggara: string;
}

export interface PortfolioKarya {
  id: string;
  tulisan: string;
  desain: string;
  video: string;
  mindmap: string;
  karyaSeni: string;
  level: "Pribadi" | "Internal sekolah" | "Publikasi eksternal" | "Juara lomba" | "";
  bulan: string;
  tahun: string;
  penyelenggara: string;
}

export interface PortfolioBahasa {
  id: string;
  inggris: string;
  arab: string;
  lainnya: string;
  level: "A1" | "A2" | "B1" | "B2+" | "";
  bulan: string;
  tahun: string;
  penyelenggara: string;
}

export interface PortfolioState {
  hafalan: PortfolioHafalan[];
  akademik: PortfolioAkademik[];
  ekskul: PortfolioEkskul[];
  seminar: PortfolioSeminar[];
  karya: PortfolioKarya[];
  bahasa: PortfolioBahasa[];
}

export interface FullAppState {
  jenjang: "SMP" | "SMA";
  profile: StudentProfile;
  keagamaan: KeagamaanState;
  akademik: AkademikState;
  prestasiEkskul: PrestasiEkskulState;
  minatBakat: MinatBakatState;
  gayaBelajar: GayaBelajarState;
  iqTest: IQTestState;
  aiRecommendation: AIRecommendation;
  theme: "light" | "dark";
  portfolio?: PortfolioState;
}
