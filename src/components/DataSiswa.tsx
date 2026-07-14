/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { StudentProfile } from "../types";
import { User, Shield, GraduationCap, Award, Heart, Users2, MapPin, Upload, Camera, Lock, KeyRound } from "lucide-react";

interface DataSiswaProps {
  jenjang: "SMP" | "SMA";
  profile: StudentProfile;
  onChange: (profile: StudentProfile) => void;
  onNext: () => void;
}

export default function DataSiswa({ jenjang, profile, onChange, onNext }: DataSiswaProps) {
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [passwordStatus, setPasswordStatus] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleChange = (field: keyof StudentProfile, value: string) => {
    onChange({ ...profile, [field]: value });
  };

  const handleClassChange = (kelasValue: string) => {
    onChange({ ...profile, kelas: kelasValue });
  };

  const handleGenderChange = (gender: "Ikhwan" | "Akhwat") => {
    onChange({ ...profile, jenisKelamin: gender });
  };

  const activeJenjang = jenjang;

  const isFormValid = () => {
    return profile.nama.trim() !== "" && profile.kelas.trim() !== "";
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-100 dark:border-gray-850 pb-5">
        <h2 className="text-2xl font-bold font-sans text-gray-900 dark:text-white flex items-center gap-2">
          <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          Data Profil Lengkap Peserta Tes
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Lengkapi identitas diri Anda untuk memulai asimilasi peta akademik dan karir Sekolah Cendekia BAZNAS.
        </p>
      </div>

      {/* Form Content */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-850 p-6 md:p-8 space-y-8">
        
        {/* Section 1: Identitas Utama */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold border-b border-gray-50 dark:border-gray-800 pb-2">
            <Shield className="h-4 w-4" />
            <span>Identitas Pokok Peserta Tes</span>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Foto Upload Column */}
            <div className="flex flex-col items-center justify-center p-4 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-gray-950/30 col-span-1">
              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest font-mono mb-2 flex items-center gap-1">
                <Camera className="h-3.5 w-3.5 text-blue-500" />
                FOTO SISWA
              </span>
              
              {profile.foto ? (
                <div className="relative group w-32 h-40 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
                  <img src={profile.foto} alt="Foto siswa" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleChange("foto", "")}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold cursor-pointer"
                  >
                    Hapus / Ganti
                  </button>
                </div>
              ) : (
                <label className="w-32 h-40 border-2 border-dashed border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-400 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors p-3 text-center bg-white dark:bg-gray-900 group">
                  <Upload className="h-6 w-6 text-gray-405 text-gray-400 group-hover:text-blue-500 transition-colors mb-2" />
                  <span className="text-[10px] text-gray-500 dark:text-gray-405 font-mono font-medium leading-tight">
                    Unggah Pasfoto Siswa (PNG/JPG)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          handleChange("foto", reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                </label>
              )}
              <span className="text-[9px] text-gray-400 dark:text-gray-500 text-center mt-2 leading-relaxed">
                Akan otomatis tercetak pada dokumen biodata & laporan kelulusan.
              </span>
            </div>

            {/* Input Columns */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 font-mono">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={profile.nama}
                  onChange={(e) => handleChange("nama", e.target.value)}
                  placeholder="Rahmat Hidayatullah"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 font-mono">
                  Jenjang <span className="text-red-500">*</span>
                </label>
                <select
                  value={activeJenjang}
                  disabled={true}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-150/80 dark:bg-gray-950 text-gray-500 dark:text-gray-400 cursor-not-allowed transition-colors"
                  title="Jenjang dikunci sesuai pilihan awal masuk Anda."
                >
                  <option value="SMP">SMP</option>
                  <option value="SMA">SMA</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 font-mono">
                  Angkatan Siswa <span className="text-red-500">*</span>
                </label>
                <select
                  value={profile.kelas}
                  onChange={(e) => handleClassChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                >
                  <option value="">-- Pilih Angkatan --</option>
                  <option value="Angkatan 5">Angkatan 5</option>
                  <option value="Angkatan 6">Angkatan 6</option>
                  <option value="Angkatan 7">Angkatan 7</option>
                  <option value="Angkatan 8">Angkatan 8</option>
                  <option value="Angkatan 9">Angkatan 9</option>
                  <option value="Angkatan 10">Angkatan 10</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Biodata Penunjang */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold border-b border-gray-50 dark:border-gray-800 pb-2">
            <MapPin className="h-4 w-4" />
            <span>Kelahiran & Jenis Kelamin</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 font-mono">
                Jenis Kelamin (Kategori)
              </label>
              <div className="flex gap-4">
                <label className="flex-1 flex items-center justify-center py-2.5 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 hover:bg-gray-100 dark:hover:bg-gray-850 cursor-pointer transition-colors text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="radio"
                    name="jenisKelamin"
                    checked={profile.jenisKelamin === "Ikhwan"}
                    onChange={() => handleGenderChange("Ikhwan")}
                    className="mr-2 text-blue-600 focus:ring-blue-500"
                  />
                  Ikhwan
                </label>
                <label className="flex-1 flex items-center justify-center py-2.5 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 hover:bg-gray-100 dark:hover:bg-gray-850 cursor-pointer transition-colors text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="radio"
                    name="jenisKelamin"
                    checked={profile.jenisKelamin === "Akhwat"}
                    onChange={() => handleGenderChange("Akhwat")}
                    className="mr-2 text-blue-600 focus:ring-blue-500"
                  />
                  Akhwat
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 font-mono">
                Tempat Lahir
              </label>
              <input
                type="text"
                value={profile.tempatLahir}
                onChange={(e) => handleChange("tempatLahir", e.target.value)}
                placeholder="Bogor"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 font-mono">
                Tanggal Lahir
              </label>
              <input
                type="date"
                value={profile.tanggalLahir}
                onChange={(e) => handleChange("tanggalLahir", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Aspirasi Masa Depan */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold border-b border-gray-50 dark:border-gray-800 pb-2">
            <GraduationCap className="h-4 w-4" />
            <span>Minat & Aspirasi Karir</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 font-mono flex items-center gap-1">
                <Award className="h-3.5 w-3.5" /> Cita-Cita Karir
              </label>
              <input
                type="text"
                value={profile.citaCita}
                onChange={(e) => handleChange("citaCita", e.target.value)}
                placeholder="Software Engineer / Dokter Ahli"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 font-mono flex items-center gap-1">
                <Heart className="h-3.5 w-3.5" /> Hobi Utama
              </label>
              <input
                type="text"
                value={profile.hobi}
                onChange={(e) => handleChange("hobi", e.target.value)}
                placeholder="Membaca Jurnal Sains, Koding, Silat"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 font-mono flex items-center gap-1">
                <Users2 className="h-3.5 w-3.5" /> Organisasi Yang Diikuti
              </label>
              <input
                type="text"
                value={profile.organisasi}
                onChange={(e) => handleChange("organisasi", e.target.value)}
                placeholder="OSIS Divisi Iptek, Rohis Baitul Ilmi"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Keamanan Akun (Sesuai Permintaan User) */}
        <div className="space-y-4 border-t border-gray-100 dark:border-gray-850 pt-6">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold border-b border-gray-50 dark:border-gray-800 pb-2">
            <KeyRound className="h-4 w-4" />
            <span>Ubah Kata Sandi Akun</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 font-mono">
                Kata Sandi Baru
              </label>
              <input
                type="password"
                placeholder="Masukkan sandi baru"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 font-mono">
                Konfirmasi Kata Sandi Baru
              </label>
              <input
                type="password"
                placeholder="Ulangi sandi baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors font-mono"
              />
            </div>

            <div>
              <button
                type="button"
                onClick={() => {
                  setPasswordStatus(null);
                  if (!newPassword.trim() || !confirmPassword.trim()) {
                    setPasswordStatus({ type: "error", message: "Harap isi kedua kolom kata sandi!" });
                    return;
                  }
                  if (newPassword !== confirmPassword) {
                    setPasswordStatus({ type: "error", message: "Kata sandi baru dan konfirmasi tidak cocok!" });
                    return;
                  }
                  
                  // Update password in the registered students list
                  const rawList = localStorage.getItem("sipetakuliah_registered_students");
                  if (rawList) {
                    try {
                      const list = JSON.parse(rawList);
                      
                      // Fallback check to find the exact registered student record using logged-in session details
                      const loggedInStudentRaw = localStorage.getItem("sipetakuliah_logged_in_student");
                      let searchNisn = profile.nisn ? profile.nisn.trim() : "";
                      let searchNama = profile.nama ? profile.nama.trim().toLowerCase() : "";
                      if (loggedInStudentRaw) {
                        try {
                          const loggedIn = JSON.parse(loggedInStudentRaw);
                          if (loggedIn.nisn) searchNisn = loggedIn.nisn.trim();
                          if (loggedIn.nama) searchNama = loggedIn.nama.trim().toLowerCase();
                        } catch (e) {}
                      }

                      const sIndex = list.findIndex((s: any) => 
                        (s.nisn && searchNisn && s.nisn.trim() === searchNisn) || 
                        (s.nama && searchNama && s.nama.toLowerCase().trim() === searchNama) ||
                        (s.nisn && profile.nisn && s.nisn.trim() === profile.nisn.trim()) ||
                        (s.nama && profile.nama && s.nama.toLowerCase().trim() === profile.nama.toLowerCase().trim())
                      );

                      if (sIndex !== -1) {
                        list[sIndex].password = newPassword.trim();
                        localStorage.setItem("sipetakuliah_registered_students", JSON.stringify(list));
                        setPasswordStatus({ type: "success", message: "Kata sandi berhasil diperbarui!" });
                        setNewPassword("");
                        setConfirmPassword("");
                      } else {
                        setPasswordStatus({ type: "error", message: "Data akun Anda tidak ditemukan di daftar terdaftar. Harap daftarkan dulu akun Anda di halaman masuk." });
                      }
                    } catch (err) {
                      setPasswordStatus({ type: "error", message: "Gagal merubah kata sandi!" });
                    }
                  } else {
                    setPasswordStatus({ type: "error", message: "Tidak ada akun siswa terdaftar di local storage." });
                  }
                }}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-xl transition-colors cursor-pointer shadow-sm text-sm"
              >
                Simpan Kata Sandi
              </button>
            </div>
          </div>

          {passwordStatus && (
            <div className={`p-3 rounded-xl text-xs font-semibold ${
              passwordStatus.type === "success" 
                ? "bg-green-50 dark:bg-green-950/20 border border-green-150 dark:border-green-900 text-green-800 dark:text-green-400" 
                : "bg-red-50 dark:bg-red-950/20 border border-red-150 dark:border-red-900 text-red-800 dark:text-red-400"
            }`}>
              {passwordStatus.message}
            </div>
          )}
        </div>

        {/* Warning Indicator */}
        {!isFormValid() && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-150 dark:border-amber-900/50 p-4 rounded-xl text-amber-800 dark:text-amber-400 text-sm">
            Harap isi kolom bertanda bintang merah <strong>(Nama Lengkap dan Angkatan)</strong> untuk dapat melanjutkan ke langkah asesmen berikutnya.
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onNext}
            disabled={!isFormValid()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-150 disabled:text-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-800 dark:disabled:text-gray-600 font-medium rounded-xl shadow-md cursor-pointer transition-colors inline-flex items-center gap-2"
          >
            Simpan & Lanjutkan
          </button>
        </div>

      </div>
    </div>
  );
}
