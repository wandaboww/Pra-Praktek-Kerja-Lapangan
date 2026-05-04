'use client';

import { AlertCircle, Building2, CheckCircle2, FileText, Users, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface Siswa {
  id: number;
  nama: string;
  kelas: string;
  perusahaan_id: number | null;
}

interface Perusahaan {
  id: number;
  nama: string;
  bidang: string;
  daerah: string;
  siswas_count: number;
  status: string;
}

export default function DashboardPage() {
  const [slideIndex, setSlideIndex] = useState(0);
  const [industrySlideIndex, setIndustrySlideIndex] = useState(0);
  const [emptyIndustryIndex, setEmptyIndustryIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [perusahaanList, setPerusahaanList] = useState<Perusahaan[]>([]);

  const HOSTNAME = typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1';
  const API_SISWA = `http://${HOSTNAME}:8000/api/siswa`;
  const API_PERUSAHAAN = `http://${HOSTNAME}:8000/api/perusahaan`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resSiswa, resPerusahaan] = await Promise.all([
          fetch(API_SISWA),
          fetch(API_PERUSAHAAN)
        ]);
        const dataSiswa = await resSiswa.json();
        const dataPerusahaan = await resPerusahaan.json();
        setSiswaList(dataSiswa);
        setPerusahaanList(dataPerusahaan);
      } catch (e) {
        console.error('Gagal memuat data dashboard:', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Computed stats from live data
  const totalSiswa = siswaList.length;
  const siswaPenempatan = siswaList.filter(s => s.perusahaan_id !== null).length;
  const belumPenempatan = totalSiswa - siswaPenempatan;
  const totalPerusahaan = perusahaanList.length;
  const totalPerusahaanAktif = perusahaanList.filter(p => p.status === 'Aktif').length;

  // Perusahaan yang sudah punya siswa (siswas_count > 0) vs yang kosong
  const mappedPerusahaanIds = new Set(siswaList.map(s => s.perusahaan_id).filter(id => id !== null));
  const industriKosong = perusahaanList.filter(p => p.status === 'Aktif' && !mappedPerusahaanIds.has(p.id));
  const industriTerisi = perusahaanList.filter(p => mappedPerusahaanIds.has(p.id));

  // Slider data - combine terisi + kosong for variety
  const sliderPerusahaan = [...industriTerisi.slice(0, 3), ...industriKosong.slice(0, 3)].slice(0, 5);

  // Slider auto-rotate
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev === 0 ? 1 : 0));
      if (sliderPerusahaan.length > 0) {
        setIndustrySlideIndex((prev) => (prev + 1) % sliderPerusahaan.length);
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [sliderPerusahaan.length]);

  // Slider auto-rotate industri kosong (card kecil)
  useEffect(() => {
    if (industriKosong.length > 0) {
      const timer = setInterval(() => {
        setEmptyIndustryIndex((prev) => (prev + 1) % industriKosong.length);
      }, 3500);
      return () => clearInterval(timer);
    }
  }, [industriKosong.length]);

  // Semua perusahaan aktif dengan jumlah pemetaan siswa
  const pemetaanIndustri = [...perusahaanList]
    .filter(p => p.status === 'Aktif')
    .sort((a, b) => (b.siswas_count || 0) - (a.siswas_count || 0));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 gap-3">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="font-medium">Memuat data dashboard...</span>
      </div>
    );
  }

  return (
    <div className="dashboard-container space-y-6">
      <div className="dashboard-header flex justify-between items-center">
        <div className="dashboard-title-wrapper">
          <h1 className="dashboard-title text-3xl font-bold text-slate-800">Dashboard</h1>
          <p className="dashboard-subtitle text-slate-500 mt-1">Ringkasan aktivitas Sistem Pembuat Surat PKL</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* 1. Card Total Siswa */}
        <div className="stat-card bg-white rounded-xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="stat-content-wrapper flex justify-between items-start">
            <div className="stat-text-group">
              <p className="stat-label text-slate-500 text-sm font-medium">Total Siswa</p>
              <h3 className="stat-value text-3xl font-bold text-slate-800 mt-2">{totalSiswa}</h3>
            </div>
            <div className="stat-icon-wrapper p-3 rounded-lg bg-blue-100">
              <Users className="stat-icon w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        {/* 2. Card Slider (Siswa Penempatan & Belum Penempatan) */}
        <div className="stat-card bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden h-29">
          <div 
            className="absolute inset-0 flex flex-col transition-transform duration-700 ease-in-out"
            style={{ transform: `translateY(-${slideIndex * 100}%)` }}
          >
            {/* Slide 1: Sudah Penempatan */}
            <div className="h-full w-full p-6 flex justify-between items-start shrink-0">
              <div className="stat-text-group">
                <p className="stat-label text-slate-500 text-sm font-medium">Siswa Penempatan</p>
                <h3 className="stat-value text-3xl font-bold text-slate-800 mt-2">{siswaPenempatan}</h3>
              </div>
              <div className="stat-icon-wrapper p-3 rounded-lg bg-emerald-100">
                <CheckCircle2 className="stat-icon w-6 h-6 text-emerald-500" />
              </div>
            </div>

            {/* Slide 2: Belum Penempatan */}
            <div className="h-full w-full p-6 flex justify-between items-start shrink-0 bg-orange-50/30">
              <div className="stat-text-group">
                <p className="stat-label text-slate-500 text-sm font-medium">Belum Penempatan</p>
                <h3 className="stat-value text-3xl font-bold text-slate-800 mt-2">{belumPenempatan}</h3>
              </div>
              <div className="stat-icon-wrapper p-3 rounded-lg bg-orange-100">
                <AlertCircle className="stat-icon w-6 h-6 text-orange-500" />
              </div>
            </div>
          </div>
          
          {/* Slider Indicators */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            <button onClick={() => setSlideIndex(0)} className={`w-1.5 h-1.5 rounded-full transition-colors ${slideIndex === 0 ? 'bg-slate-400' : 'bg-slate-200'}`} />
            <button onClick={() => setSlideIndex(1)} className={`w-1.5 h-1.5 rounded-full transition-colors ${slideIndex === 1 ? 'bg-orange-400' : 'bg-slate-200'}`} />
          </div>
        </div>

        {/* 3. Card Perusahaan Mitra */}
        <div className="stat-card bg-white rounded-xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="stat-content-wrapper flex justify-between items-start">
            <div className="stat-text-group">
              <p className="stat-label text-slate-500 text-sm font-medium">Perusahaan Mitra</p>
              <h3 className="stat-value text-3xl font-bold text-slate-800 mt-2">{totalPerusahaan}</h3>
            </div>
            <div className="stat-icon-wrapper p-3 rounded-lg bg-purple-100">
              <Building2 className="stat-icon w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>

        {/* 4. Card Surat Tercetak */}
        <div className="stat-card bg-white rounded-xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="stat-content-wrapper flex justify-between items-start">
            <div className="stat-text-group">
              <p className="stat-label text-slate-500 text-sm font-medium">Surat Tercetak</p>
              <h3 className="stat-value text-3xl font-bold text-slate-800 mt-2">0</h3>
              <p className="text-xs text-slate-400 mt-1">Fitur segera hadir</p>
            </div>
            <div className="stat-icon-wrapper p-3 rounded-lg bg-orange-100">
              <FileText className="stat-icon w-6 h-6 text-orange-500" />
            </div>
          </div>
        </div>

      </div>

      {/* Rangkuman Stat Industri */}
      <div className="industry-stats-section grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        {/* Card Kecil 1: Total Industri Aktif */}
        <div className="industry-card-small md:col-span-1 bg-blue-50 rounded-xl p-6 border border-blue-100 shadow-sm flex flex-col justify-center items-center text-center hover:shadow-md transition-shadow">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full mb-3">
            <Building2 className="w-6 h-6" />
          </div>
          <p className="text-blue-600 text-sm font-semibold">Total Industri Aktif</p>
          <h3 className="text-3xl font-bold text-blue-900 mt-1">{totalPerusahaanAktif}</h3>
        </div>

        {/* Card Besar (Tengah) - Slider Identitas Perusahaan */}
        <div className="industry-card-large md:col-span-2 bg-blue-50 rounded-xl border border-blue-100 shadow-sm relative overflow-hidden hover:shadow-md transition-shadow" style={{ minHeight: '140px' }}>
          {sliderPerusahaan.length > 0 ? (
            <>
              <div 
                className="flex transition-transform duration-700 ease-in-out h-full"
                style={{ transform: `translateX(-${industrySlideIndex * 100}%)` }}
              >
                {sliderPerusahaan.map((p) => {
                  const isTerisi = mappedPerusahaanIds.has(p.id);
                  return (
                    <div key={p.id} className="w-full h-full p-6 flex flex-col justify-center shrink-0">
                      <p className="text-blue-500 text-xs font-bold uppercase tracking-wider mb-1">
                        {isTerisi ? 'Industri Terisi' : 'Industri Kosong'}
                      </p>
                      <h3 className="text-xl font-bold text-blue-900">{p.nama}</h3>
                      <p className="text-blue-700 text-sm mt-1">
                        Sektor: {p.bidang || '-'} | Daerah: {p.daerah || '-'}
                      </p>
                      <p className={`text-sm mt-2 font-medium ${isTerisi ? 'text-emerald-600' : 'text-orange-500'}`}>
                        Status: {isTerisi ? 'Sudah Terisi / Memiliki Pemetaan' : 'Menunggu Pemetaan Siswa'}
                      </p>
                    </div>
                  );
                })}
              </div>
              {/* Indicators */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {sliderPerusahaan.map((_, i) => (
                  <button key={i} onClick={() => setIndustrySlideIndex(i)} className={`w-1.5 h-1.5 rounded-full transition-colors ${industrySlideIndex === i ? 'bg-blue-600' : 'bg-blue-200'}`} />
                ))}
              </div>
            </>
          ) : (
            <div className="p-6 flex items-center justify-center h-full text-blue-400 text-sm">
              Belum ada data perusahaan
            </div>
          )}
        </div>

        {/* Card Kecil 2: Industri Belum Diisi */}
        <div className="industry-card-small md:col-span-1 bg-blue-50 rounded-xl p-4 border border-blue-100 shadow-sm flex flex-col justify-center items-center text-center hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="p-2 bg-blue-100 text-orange-500 rounded-full mb-2 z-10">
            <AlertCircle className="w-5 h-5" />
          </div>
          <p className="text-blue-600 text-sm font-semibold z-10">Industri Kosong (Aktif)</p>
          <h3 className="text-3xl font-bold text-blue-900 mt-1 z-10">{industriKosong.length}</h3>
          
          {industriKosong.length > 0 ? (
            <div className="h-5 w-full relative overflow-hidden mt-1 z-10">
              <div 
                className="absolute inset-0 transition-transform duration-500 ease-in-out w-full"
                style={{ transform: `translateY(-${emptyIndustryIndex * 100}%)` }}
              >
                {industriKosong.map((p) => (
                  <div key={p.id} className="h-5 flex items-center justify-center w-full">
                    <p className="text-blue-500 text-xs font-medium truncate w-full px-2">{p.nama}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-blue-500 text-xs mt-1 z-10">Semua Telah Terisi</p>
          )}
        </div>
      </div>

      {/* Pemetaan Murid Semua Industri Aktif */}
      <div className="recent-activity-section bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden mt-8">
        <div className="recent-activity-header p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="recent-activity-title text-lg font-bold text-slate-800">Jumlah Pemetaan Murid per Industri Aktif</h2>
          <span className="text-sm text-slate-400 font-medium">{pemetaanIndustri.length} Industri</span>
        </div>
        <div className="overflow-x-auto">
          <table className="recent-activity-table w-full text-left border-collapse">
            <thead className="table-head sticky top-0 z-10">
              <tr className="table-header-row bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                <th className="table-header-cell p-4 font-medium w-12">No</th>
                <th className="table-header-cell p-4 font-medium">Perusahaan</th>
                <th className="table-header-cell p-4 font-medium">Bidang</th>
                <th className="table-header-cell p-4 font-medium">Daerah</th>
                <th className="table-header-cell p-4 font-medium text-center">Jumlah Siswa</th>
              </tr>
            </thead>
          </table>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <table className="recent-activity-table w-full text-left border-collapse">
              <tbody className="table-body text-sm">
                {pemetaanIndustri.length > 0 ? (
                  pemetaanIndustri.map((p, idx) => (
                    <tr key={p.id} className="table-row-item border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-slate-400 w-12">{idx + 1}</td>
                      <td className="table-cell-company p-4 font-medium text-slate-700">{p.nama}</td>
                      <td className="p-4 text-slate-500">{p.bidang || '-'}</td>
                      <td className="p-4 text-slate-500">{p.daerah || '-'}</td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          (p.siswas_count || 0) > 0 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-slate-100 text-slate-400'
                        }`}>
                          {p.siswas_count || 0} Siswa
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      Belum ada perusahaan aktif.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
