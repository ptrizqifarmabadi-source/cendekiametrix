/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { StudentProfile } from "../types";
import { User, Shield, GraduationCap, Award, Heart, Users2, MapPin } from "lucide-react";

interface DataSiswaProps {
  jenjang: "SMP" | "SMA";
  profile: StudentProfile;
  onChange: (profile: StudentProfile) => void;
  onNext: () => void;
}

export default function DataSiswa({ jenjang, profile, onChange, onNext }: DataSiswaProps) {
  const handleChange = (field: keyof StudentProfile, value: string) => {
    onChange({ ...profile, [field]: value });
  };

  const handleClassChange = (kelasValue: string) => {
    let newGender = profile.jenisKelamin;
    if (kelasValue.includes("Ikhwan")) {
      newGender = "Ikhwan";
    } else if (kelasValue.includes("Akhwat")) {
      newGender = "Akhwat";
    }
    onChange({ ...profile, kelas: kelasValue, jenisKelamin: newGender });
  };

  const handleGenderChange = (gender: "Ikhwan" | "Akhwat") => {
    let newKelas = profile.kelas;
    const isSmp = jenjang === "SMP";
    if (isSmp) {
      if (profile.kelas.includes("Kelas 7")) {
        newKelas = `Kelas 7 ${gender}`;
      } else if (profile.kelas.includes("Kelas 8")) {
        newKelas = `Kelas 8 ${gender}`;
      } else if (profile.kelas.includes("Kelas 9")) {
        newKelas = `Kelas 9 ${gender}`;
      } else {
        newKelas = `Kelas 7 ${gender}`;
      }
    } else {
      if (profile.kelas.includes("Kelas 10")) {
        newKelas = `Kelas 10 ${gender}`;
      } else if (profile.kelas.includes("Kelas 11")) {
        newKelas = `Kelas 11 ${gender}`;
      } else if (profile.kelas.includes("Kelas 12")) {
        newKelas = `Kelas 12 ${gender}`;
      } else {
        newKelas = `Kelas 10 ${gender}`;
      }
    }
    onChange({ ...profile, jenisKelamin: gender, kelas: newKelas });
  };

  const activeJenjang = jenjang;

  const isFormValid = () => {
    return profile.nama.trim() !== "" && profile.nisn.trim() !== "" && profile.kelas.trim() !== "";
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
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                NISN <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={profile.nisn}
                onChange={(e) => handleChange("nisn", e.target.value.replace(/\D/g, ""))}
                placeholder="0071234567"
                maxLength={10}
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

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 font-mono">
                Kelas <span className="text-red-500">*</span>
              </label>
              {activeJenjang === "SMP" ? (
                <select
                  value={profile.kelas}
                  onChange={(e) => handleClassChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                >
                  <option value="Kelas 7 Ikhwan">Kelas 7 Ikhwan</option>
                  <option value="Kelas 7 Akhwat">Kelas 7 Akhwat</option>
                  <option value="Kelas 8 Ikhwan">Kelas 8 Ikhwan</option>
                  <option value="Kelas 8 Akhwat">Kelas 8 Akhwat</option>
                  <option value="Kelas 9 Ikhwan">Kelas 9 Ikhwan</option>
                  <option value="Kelas 9 Akhwat">Kelas 9 Akhwat</option>
                </select>
              ) : (
                <select
                  value={profile.kelas}
                  onChange={(e) => handleClassChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                >
                  <option value="Kelas 10 Ikhwan">Kelas 10 Ikhwan</option>
                  <option value="Kelas 10 Akhwat">Kelas 10 Akhwat</option>
                  <option value="Kelas 11 Ikhwan">Kelas 11 Ikhwan</option>
                  <option value="Kelas 11 Akhwat">Kelas 11 Akhwat</option>
                  <option value="Kelas 12 Ikhwan">Kelas 12 Ikhwan</option>
                  <option value="Kelas 12 Akhwat">Kelas 12 Akhwat</option>
                </select>
              )}
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

        {/* Warning Indicator */}
        {!isFormValid() && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-150 dark:border-amber-900/50 p-4 rounded-xl text-amber-800 dark:text-amber-400 text-sm">
            Harap isi kolom bertanda bintang merah <strong>(Nama Lengkap, NISN, dan Kelas)</strong> untuk dapat melanjutkan ke langkah asesmen berikutnya.
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
