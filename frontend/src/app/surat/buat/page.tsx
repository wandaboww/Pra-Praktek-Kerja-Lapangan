'use client';

import { ArrowRight, Building2, Check, ChevronDown, FileText, Search, Send, Users, Link as LinkIcon, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Perusahaan {
  id: number;
  nama: string;
  alamat: string;
  bidang: string;
  pic: string;
  status: string;
  tujuan_surat?: string;
  siswas?: Siswa[];
}

interface Siswa {
  id: number;
  nama: string;
  kelas: string;
  portofolio: string;
  perusahaan_id: number | null;
}

export default function BuatSurat() {
  const [step, setStep] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPerusahaan, setSelectedPerusahaan] = useState<number | null>(null);
  const [selectedSiswa, setSelectedSiswa] = useState<number[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [perusahaanList, setPerusahaanList] = useState<Perusahaan[]>([]);
  const [mappedSiswa, setMappedSiswa] = useState<Siswa[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSiswa, setLoadingSiswa] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [tujuanSurat, setTujuanSurat] = useState('Pimpinan');
  const [nomorSurat, setNomorSurat] = useState('');
  const [tanggalSurat, setTanggalSurat] = useState('');

  const router = useRouter();

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api-pemetaanpkl.pplgsmkn1ciomas.my.id/api';

  // Fetch perusahaan list on mount
  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/perusahaan`)
      .then(res => res.json())
      .then(data => { setPerusahaanList(data.filter((p: Perusahaan) => p.status === 'Aktif')); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Fetch siswa mapped to selected perusahaan
  useEffect(() => {
    if (!selectedPerusahaan) { setMappedSiswa([]); return; }
    setLoadingSiswa(true);
    fetch(`${API_BASE}/perusahaan/${selectedPerusahaan}`)
      .then(res => res.json())
      .then((data: Perusahaan) => {
        setMappedSiswa(data.siswas || []);
        setLoadingSiswa(false);
      })
      .catch(() => { setMappedSiswa([]); setLoadingSiswa(false); });
  }, [selectedPerusahaan]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedCompany = perusahaanList.find(p => p.id === selectedPerusahaan);

  const toggleSiswa = (id: number) => {
    setSelectedSiswa(prev =>
      prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    if (selectedCompany && selectedCompany.tujuan_surat) {
      setTujuanSurat(selectedCompany.tujuan_surat);
    }
  }, [selectedCompany]);

  const handleGenerateDraft = async () => {
    if (!selectedPerusahaan || selectedSiswa.length === 0 || !nomorSurat || !tanggalSurat) {
      alert("Harap lengkapi semua field atribut surat dan pilih minimal 1 siswa.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/surat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          perusahaan_id: selectedPerusahaan,
          nomor_surat: nomorSurat,
          tanggal_surat: tanggalSurat,
          tahun_ajaran: '-',
          siswa_ids: selectedSiswa,
          tujuan_surat: tujuanSurat
        })
      });

      if (!res.ok) throw new Error('Gagal menyimpan draf surat');

      router.push('/surat/riwayat');
    } catch (e) {
      console.error(e);
      alert('Terjadi kesalahan saat men-generate draft surat.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Buat Surat Pengajuan PKL</h1>
        <p className="text-slate-500 mt-1">Ikuti langkah-langkah berikut untuk membuat draf surat</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 -z-10 rounded-full"></div>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 -z-10 rounded-full transition-all duration-300" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>

        {[
          { num: 1, label: "Tujuan", icon: Building2 },
          { num: 2, label: "Peserta", icon: Users },
          { num: 3, label: "Atribut", icon: FileText }
        ].map((s) => (
          <div key={s.num} className="flex flex-col items-center gap-2 px-2">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-colors ${
              step >= s.num ? 'bg-blue-600 border-blue-100 text-white' : 'bg-white border-slate-100 text-slate-400'
            }`}>
              {step > s.num ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
            </div>
            <span className={`text-sm font-medium ${step >= s.num ? 'text-white' : 'text-slate-400'}`}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-4">Pilih Perusahaan Tujuan</h2>
            <div className="space-y-4">
              <div className="block" ref={dropdownRef}>
                <span className="text-slate-700 font-medium mb-2 block">Pilih dari Master Data</span>
                <div className="relative">
                  <div
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full flex items-center justify-between border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 text-slate-900 cursor-pointer focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                  >
                    <span>
                      {loading ? 'Memuat data...' : selectedCompany ? selectedCompany.nama : "-- Pilih Perusahaan --"}
                    </span>
                    {loading ? <Loader2 className="w-5 h-5 text-slate-400 animate-spin" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                  </div>

                  {isDropdownOpen && !loading && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                      <div className="p-3 border-b border-slate-100 flex items-center gap-2 text-slate-500">
                        <Search className="w-4 h-4 ml-1" />
                        <input
                          type="text"
                          placeholder="Cari perusahaan..."
                          className="w-full bg-transparent border-none focus:outline-none text-slate-900 placeholder:text-slate-400"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div className="max-h-60 overflow-y-auto p-2">
                        {perusahaanList.filter(p => p.nama.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
                          perusahaanList.filter(p => p.nama.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
                            <div
                              key={p.id}
                              onClick={() => {
                                setSelectedPerusahaan(p.id);
                                setIsDropdownOpen(false);
                                setSearchQuery('');
                                setSelectedSiswa([]);
                              }}
                              className={`px-3 py-2 cursor-pointer rounded-lg transition-colors text-slate-800 ${
                                selectedPerusahaan === p.id ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-slate-50'
                              }`}
                            >
                              <p className="font-medium">{p.nama}</p>
                              <p className="text-xs text-slate-400">{p.alamat || p.bidang || '-'}</p>
                            </div>
                          ))
                        ) : (
                          <div className="px-3 py-4 text-center text-sm text-slate-500">
                            Perusahaan tidak ditemukan
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedCompany && (
                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 text-emerald-800 text-sm space-y-1">
                  <p><strong>Perusahaan:</strong> {selectedCompany.nama}</p>
                  <p><strong>Alamat:</strong> {selectedCompany.alamat || '-'}</p>
                  <p><strong>PIC:</strong> {selectedCompany.pic || '-'}</p>
                </div>
              )}

              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 text-blue-800 text-sm">
                <strong>Catatan:</strong> Alamat dan detail pimpinan akan terisi otomatis berdasarkan data master. Jika perusahaan belum ada, silakan tambahkan di menu Master Perusahaan.
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Pilih Peserta Didik</h2>
                <p className="text-sm text-slate-500 mt-1">Daftar siswa yang telah dipetakan ke {selectedCompany?.nama || 'perusahaan terpilih'}</p>
              </div>
              <div className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                {selectedSiswa.length} Terpilih
              </div>
            </div>

            {loadingSiswa ? (
              <div className="flex items-center justify-center py-12 gap-3 text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin" /> Memuat data siswa...
              </div>
            ) : (
              <div className="overflow-hidden border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50">
                    <tr className="text-slate-500 text-sm border-b border-slate-200">
                      <th className="p-4 w-12">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                          checked={mappedSiswa.length > 0 && selectedSiswa.length === mappedSiswa.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSiswa(mappedSiswa.map(s => s.id));
                            } else {
                              setSelectedSiswa([]);
                            }
                          }}
                        />
                      </th>
                      <th className="p-4 font-semibold">Nama Lengkap</th>
                      <th className="p-4 font-semibold">Kelas</th>
                      <th className="p-4 font-semibold">Portofolio</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-100">
                    {mappedSiswa.length > 0 ? (
                      mappedSiswa.map(s => (
                        <tr key={s.id} className={`hover:bg-slate-50 transition-colors ${selectedSiswa.includes(s.id) ? 'bg-blue-50/30' : ''}`}>
                          <td className="p-4">
                            <input
                              type="checkbox"
                              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                              checked={selectedSiswa.includes(s.id)}
                              onChange={() => toggleSiswa(s.id)}
                            />
                          </td>
                          <td className="p-4">
                            <p className="font-bold text-slate-800">{s.nama}</p>
                          </td>
                          <td className="p-4 text-slate-600">{s.kelas}</td>
                          <td className="p-4">
                            {s.portofolio ? (
                              <a
                                href={s.portofolio}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium max-w-[200px] truncate"
                                title={s.portofolio}
                              >
                                <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                                {s.portofolio}
                              </a>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-500">
                          Belum ada siswa yang dipetakan ke industri ini. Silakan atur di menu <span className="font-bold">Pemetaan</span>.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-4">Atribut Surat</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="block">
                <span className="text-slate-700 font-medium mb-2 block">Tujuan Surat</span>
                <select 
                  value={tujuanSurat}
                  onChange={(e) => setTujuanSurat(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                >
                  <option value="Pimpinan">Pimpinan</option>
                  <option value="Direktur">Direktur</option>
                  <option value="Manager">Manager</option>
                  <option value="HRD">HRD</option>
                  <option value="Personalia">Personalia</option>
                  <option value="Kepala Dinas">Kepala Dinas</option>
                  <option value="Kepala Tata Usaha">Kepala Tata Usaha</option>
                  <option value="Kepala Lembaga">Kepala Lembaga</option>
                  <option value="Kepala Humas">Kepala Humas</option>
                </select>
              </label>
              <label className="block">
                <span className="text-slate-700 font-medium mb-2 block">Nomor Surat</span>
                <input 
                  type="text" 
                  value={nomorSurat}
                  onChange={(e) => setNomorSurat(e.target.value)}
                  placeholder="Contoh: 421.5/123/SMK/2026" 
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors" 
                />
              </label>
              <label className="block">
                <span className="text-slate-700 font-medium mb-2 block">Tanggal Surat</span>
                <input 
                  type="date" 
                  value={tanggalSurat}
                  onChange={(e) => setTanggalSurat(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors" 
                />
              </label>

            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between">
          <button
            onClick={() => setStep(s => Math.max(1, s - 1))}
            className={`px-6 py-2.5 rounded-lg font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors ${step === 1 ? 'invisible' : ''}`}
          >
            Kembali
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep(s => Math.min(3, s + 1))}
              disabled={step === 1 && !selectedPerusahaan}
              className={`px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                step === 1 && !selectedPerusahaan
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Lanjut <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleGenerateDraft}
              disabled={isSubmitting}
              className={`px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                isSubmitting ? 'bg-emerald-400 text-white cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} 
              {isSubmitting ? 'Generating...' : 'Generate Draft Surat'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
