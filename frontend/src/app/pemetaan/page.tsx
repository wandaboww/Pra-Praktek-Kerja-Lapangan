'use client';

import { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Search, Map as MapIcon, Link as LinkIcon, Building2, Save, CheckCircle2, Users, ChevronDown, X, Download, Upload } from 'lucide-react';

// Searchable Filter Industri
function SearchableFilterIndustri({
  value,
  options,
  onChange,
  className = ""
}: {
  value: string,
  options: any[],
  onChange: (val: string) => void,
  className?: string
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(o =>
    o.nama.toLowerCase().includes(search.toLowerCase()) ||
    (o.bidang && o.bidang.toLowerCase().includes(search.toLowerCase()))
  );

  let displayLabel = 'Semua Industri';
  if (value === 'null') displayLabel = 'Belum Dipetakan';
  else if (value !== '') {
    const selected = options.find(o => String(o.id) === value);
    if (selected) displayLabel = selected.nama;
  }

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between text-slate-600 transition-all hover:border-blue-500"
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 border-b border-slate-100 bg-slate-50">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                autoFocus
                type="text"
                placeholder="Cari industri..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border-2 border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full"
                >
                  <X className="w-3 h-3 text-slate-400" />
                </button>
              )}
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {!search && (
              <>
                <div
                  onClick={() => { onChange(''); setIsOpen(false); setSearch(''); }}
                  className={`px-4 py-2 text-sm cursor-pointer ${value === '' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  Semua Industri
                </div>
                <div
                  onClick={() => { onChange('null'); setIsOpen(false); setSearch(''); }}
                  className={`px-4 py-2 text-sm cursor-pointer border-b border-slate-100 ${value === 'null' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  Belum Dipetakan
                </div>
              </>
            )}
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => {
                    onChange(String(opt.id));
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`px-4 py-2 text-sm cursor-pointer flex flex-col ${value === String(opt.id) ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  <span>{opt.nama}</span>
                  <span className="text-xs text-slate-400">{opt.bidang || '-'}</span>
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-slate-500 text-center italic">
                Industri tidak ditemukan
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Searchable Select Component
function SearchableSelect({
  value,
  options,
  onChange
}: {
  value: number | null,
  options: any[],
  onChange: (id: number | null) => void
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.id === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(o =>
    o.nama.toLowerCase().includes(search.toLowerCase()) ||
    (o.bidang && o.bidang.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="relative w-full" ref={containerRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full pl-9 pr-3 py-2.5 border rounded-lg cursor-pointer transition-all font-medium text-sm ${value
          ? 'bg-blue-50 border-blue-200 text-blue-800'
          : 'bg-slate-50 border-slate-300 text-slate-500'
          }`}
      >
        <Building2 className="w-4 h-4 absolute left-3 text-slate-400" />
        <span className={`truncate ${!selectedOption ? 'text-slate-500' : ''}`}>
          {selectedOption ? `${selectedOption.nama} (${selectedOption.bidang || '-'})` : '-- Pilih Industri Tujuan --'}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 border-b border-slate-100 bg-slate-50">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                autoFocus
                type="text"
                placeholder="Cari industri..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full"
                >
                  <X className="w-3 h-3 text-slate-400" />
                </button>
              )}
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            <div
              onClick={() => {
                onChange(null);
                setIsOpen(false);
                setSearch('');
              }}
              className="px-4 py-2.5 text-sm text-slate-500 hover:bg-slate-50 cursor-pointer italic"
            >
              -- Lepas Pemetaan --
            </div>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`px-4 py-2.5 text-sm hover:bg-blue-50 cursor-pointer flex flex-col ${value === opt.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'
                    }`}
                >
                  <span>{opt.nama}</span>
                  <span className="text-xs text-slate-400 font-normal">{opt.bidang || '-'}</span>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-slate-400 text-sm">
                Industri tidak ditemukan
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Pemetaan() {
  const [perusahaanList, setPerusahaanList] = useState<any[]>([]);
  const [mappings, setMappings] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterKelas, setFilterKelas] = useState('');
  const [filterIndustri, setFilterIndustri] = useState('');
  const [filterDaerah, setFilterDaerah] = useState('');

  const [unmappedIndex, setUnmappedIndex] = useState(0);
  const [unmappedStudentIndex, setUnmappedStudentIndex] = useState(0);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api-pemetaanpkl.pplgsmkn1ciomas.my.id/api';
  const API_SISWA = `${API_BASE}/siswa`;
  const API_PERUSAHAAN = `${API_BASE}/perusahaan`;

  const fetchData = async () => {
    try {
      const [resSiswa, resPerusahaan] = await Promise.all([
        fetch(API_SISWA),
        fetch(API_PERUSAHAAN)
      ]);

      if (!resSiswa.ok || !resPerusahaan.ok) throw new Error('Failed to fetch data');

      const dataSiswa = await resSiswa.json();
      const dataPerusahaan = await resPerusahaan.json();

      const mappedSiswa = dataSiswa.map((s: any) => ({
        ...s,
        mappedPerusahaanId: s.perusahaan_id || null,
        _original: {
          perusahaan_id: s.perusahaan_id || null,
          skillset: s.skillset
        }
      }));

      setMappings(mappedSiswa);
      setPerusahaanList(dataPerusahaan);
    } catch (error) {
      console.error(error);
      alert('Gagal mengambil data dari API MySQL');
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveAll = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      // Hanya update data yang berubah
      const changedMappings = mappings.filter(m => 
        m.mappedPerusahaanId !== m._original?.perusahaan_id || 
        m.skillset !== m._original?.skillset
      );

      // Lakukan request secara berurutan agar tidak membebani server hosting (mencegah 500 error / rate limit)
      for (const m of changedMappings) {
        await fetch(`${API_SISWA}/${m.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            ...m,
            perusahaan_id: m.mappedPerusahaanId
          })
        });
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

      // Update data perusahaan count
      fetchData();
    } catch (e) {
      alert("Gagal menyimpan pemetaan ke database");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportExcel = () => {
    const exportData = mappings.map(m => {
      const perusahaan = getPerusahaanDetails(m.mappedPerusahaanId);
      return {
        "Nama Murid": m.nama,
        "Kelas": m.kelas,
        "Skill Set": m.skillset || "Belum Ada",
        "Industri": perusahaan ? perusahaan.nama : "Belum Ada"
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pemetaan PKL");
    XLSX.writeFile(wb, "Data_Pemetaan_PKL.xlsx");
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        const missingCells: string[] = [];
        let updatedMappings = [...mappings];

        data.forEach((row: any) => {
          const namaMurid = row["Nama Murid"];
          const kelas = row["Kelas"];
          const skillset = row["Skill Set"];
          const industri = row["Industri"];

          if (!namaMurid || !kelas || !skillset || !industri) {
            missingCells.push(namaMurid || "Siswa Tidak Diketahui");
          }

          if (namaMurid) {
            const studentIndex = updatedMappings.findIndex(m => m.nama === namaMurid);
            if (studentIndex !== -1) {
              let newPerusahaanId = updatedMappings[studentIndex].mappedPerusahaanId;
              if (industri && industri !== "Belum Ada") {
                const matchedPerusahaan = perusahaanList.find(p => p.nama.toLowerCase() === industri.toLowerCase());
                if (matchedPerusahaan) {
                  newPerusahaanId = matchedPerusahaan.id;
                }
              } else if (industri === "Belum Ada") {
                newPerusahaanId = null;
              }

              updatedMappings[studentIndex] = {
                ...updatedMappings[studentIndex],
                skillset: skillset && skillset !== "Belum Ada" ? skillset : updatedMappings[studentIndex].skillset,
                mappedPerusahaanId: newPerusahaanId
              };
            }
          }
        });

        setMappings(updatedMappings);

        if (missingCells.length > 0) {
          alert(`Import berhasil! Namun terdapat sel kosong pada data murid berikut:\n${missingCells.join(', ')}`);
        } else {
          alert("Import data pemetaan berhasil!");
        }
      } catch (error) {
        console.error(error);
        alert("Gagal mengimpor file Excel. Pastikan format sesuai.");
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = ''; // reset input
  };

  const handleMappingChange = (siswaId: number, perusahaanId: number | null) => {
    setMappings(prev => prev.map(s =>
      s.id === siswaId ? { ...s, mappedPerusahaanId: perusahaanId } : s
    ));
  };

  const handleSkillsetChange = (siswaId: number, newSkillset: string) => {
    setMappings(prev => prev.map(s =>
      s.id === siswaId ? { ...s, skillset: newSkillset } : s
    ));
  };


  const mappedIndustriesIds = new Set(mappings.map(m => m.mappedPerusahaanId).filter(id => id !== null));
  const unmappedIndustries = perusahaanList.filter(p => p.status === 'Aktif' && !mappedIndustriesIds.has(p.id));
  const unmappedStudents = mappings.filter(m => m.mappedPerusahaanId === null);

  useEffect(() => {
    if (unmappedIndustries.length > 0) {
      const timer = setInterval(() => {
        setUnmappedIndex((prev) => (prev + 1) % unmappedIndustries.length);
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [unmappedIndustries.length]);

  useEffect(() => {
    if (unmappedStudents.length > 0) {
      const timer = setInterval(() => {
        setUnmappedStudentIndex((prev) => (prev + 1) % unmappedStudents.length);
      }, 3500);
      return () => clearInterval(timer);
    }
  }, [unmappedStudents.length]);

  const uniqueDaerah = Array.from(new Set(perusahaanList.map(p => p.daerah).filter(d => d))).sort();

  const getPerusahaanDetails = (id: number | null) => {
    if (!id) return null;
    return perusahaanList.find(p => p.id === id) || null;
  };

  const filteredMappings = mappings.filter(s => {
    const perusahaan = getPerusahaanDetails(s.mappedPerusahaanId);

    const matchName = s.nama?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchClass = filterKelas === '' || s.kelas?.includes(filterKelas);
    const matchIndustri = filterIndustri === '' ||
      (filterIndustri === 'null' ? s.mappedPerusahaanId === null : s.mappedPerusahaanId === parseInt(filterIndustri));
    const matchDaerah = filterDaerah === '' || (perusahaan && perusahaan.daerah === filterDaerah);

    return matchName && matchClass && matchIndustri && matchDaerah;
  });

  const mappedCount = mappings.filter(m => m.mappedPerusahaanId !== null).length;
  const progressPercent = mappings.length > 0 ? Math.round((mappedCount / mappings.length) * 100) : 0;

  if (!isLoaded) return <div className="p-8 text-center text-white font-bold">Memuat data Pemetaan dari MySQL...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Pemetaan PKL</h1>
          <p className="text-slate-500 mt-1">Petakan peserta didik dengan industri (Live Data)</p>
        </div>
        <div className="flex items-center gap-3">
          {saveSuccess && <span className="text-emerald-400 font-medium text-sm">✔ Tersimpan</span>}
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors text-sm shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <label className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors text-sm shadow-sm cursor-pointer">
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Import</span>
            <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleImportExcel} />
          </label>
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm ${isSaving ? 'bg-blue-400 cursor-not-allowed text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
          >
            <Save className="w-5 h-5" />
            {isSaving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 z-10">
            <Users className="w-6 h-6" />
          </div>
          <div className="flex-1 z-10">
            <p className="text-sm text-slate-500 font-medium">Menunggu Pemetaan</p>
            {unmappedStudents.length > 0 ? (
              <div className="h-8 relative overflow-hidden">
                <div
                  className="absolute inset-0 transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateY(-${unmappedStudentIndex * 100}%)` }}
                >
                  {unmappedStudents.map((s) => (
                    <div key={s.id} className="h-8 flex items-center">
                      <p className="text-xl font-bold text-slate-800 truncate">{s.nama}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xl font-bold text-slate-800">Tuntas</p>
            )}
          </div>
          <div className="absolute top-2 right-3 px-2 py-0.5 bg-blue-50 rounded text-[10px] font-bold text-blue-600 border border-blue-100">
            {unmappedStudents.length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-500 font-medium">Progres Pemetaan</p>
            <div className="flex items-center gap-3">
              <p className="text-2xl font-bold text-slate-800">{progressPercent}%</p>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                <div
                  className="h-full bg-emerald-500 transition-all duration-1000 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0 z-10">
            <MapIcon className="w-6 h-6" />
          </div>
          <div className="flex-1 z-10">
            <p className="text-sm text-slate-500 font-medium">Industri Aktif (Belum Terisi)</p>
            {unmappedIndustries.length > 0 ? (
              <div className="h-8 relative overflow-hidden">
                <div
                  className="absolute inset-0 transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateY(-${unmappedIndex * 100}%)` }}
                >
                  {unmappedIndustries.map((p) => (
                    <div key={p.id} className="h-8 flex items-center">
                      <p className="text-xl font-bold text-slate-800 truncate">{p.nama}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xl font-bold text-slate-800">Semua Terisi</p>
            )}
          </div>
          <div className="absolute top-2 right-3 px-2 py-0.5 bg-orange-50 rounded text-[10px] font-bold text-orange-600 border border-orange-100">
            {unmappedIndustries.length}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-280px)] min-h-[500px] table-container-scrollable">
        {/* Filters */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 bg-slate-50 shrink-0">
          <div className="relative max-w-md w-full">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama siswa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-800 placeholder:text-slate-500"
            />
          </div>
          <select
            value={filterKelas}
            onChange={(e) => setFilterKelas(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-600 sm:w-48"
          >
            <option value="">Semua Kelas</option>
            <option value="12 PPLG 1">12 PPLG 1</option>
            <option value="12 PPLG 2">12 PPLG 2</option>
            <option value="12 PPLG 3">12 PPLG 3</option>
          </select>
          <SearchableFilterIndustri
            value={filterIndustri}
            options={perusahaanList}
            onChange={(val) => setFilterIndustri(val)}
            className="sm:w-64"
          />
          <select
            value={filterDaerah}
            onChange={(e) => setFilterDaerah(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-600 sm:w-48"
          >
            <option value="">Semua Daerah</option>
            {uniqueDaerah.map(daerah => (
              <option key={daerah as string} value={daerah as string}>{daerah as string}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1 relative">
          <table className="w-full text-left border-collapse table-fixed min-w-[1000px]">
            <thead className="sticky top-0 z-10 shadow-sm">
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                <th className="p-4 font-semibold bg-slate-50" style={{ width: '320px' }}>Nama Murid & Kelas</th>
                <th className="py-4 px-2 font-semibold text-center bg-slate-50" style={{ width: '60px' }}>Laptop</th>
                <th className="py-4 px-2 font-semibold text-center bg-slate-50" style={{ width: '75px' }}>Luar Kota</th>
                <th className="py-4 px-2 font-semibold text-center bg-slate-50" style={{ width: '50px' }}>Kos</th>
                <th className="py-4 px-2 font-semibold text-center bg-slate-50" style={{ width: '50px' }}>DBS</th>
                <th className="p-4 font-semibold text-center bg-slate-50" style={{ width: '150px' }}>Skill Set</th>
                <th className="p-4 font-semibold text-left bg-slate-50">Pemetaan Industri Tujuan</th>
                <th className="p-4 font-semibold text-center bg-slate-50" style={{ width: '120px' }}>Daerah</th>
              </tr>
            </thead>
            <tbody>
              {filteredMappings.map((item) => {
                const perusahaan = getPerusahaanDetails(item.mappedPerusahaanId);
                return (
                  <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="p-4" style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                      <div className="w-[288px]">
                        <p className="font-bold text-slate-800 text-base">{item.nama}</p>
                        <p className="text-slate-700 mt-1 font-medium flex items-center gap-1">
                          {item.kelas}
                          {item.portofolio && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                              <a
                                href={item.portofolio}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline transition-colors text-xs font-normal"
                              >
                                <LinkIcon className="w-3 h-3" />
                                Portofolio
                              </a>
                            </>
                          )}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-2" style={{ width: '60px' }}>
                      <div className="flex justify-center pl-30">
                        <input type="checkbox" checked={Boolean(item.laptop)} disabled className="w-4 h-4 text-blue-600 rounded border-slate-300 cursor-not-allowed opacity-70 inline-block align-middle" />
                      </div>
                    </td>
                    <td className="py-4 px-2" style={{ width: '75px' }}>
                      <div className="flex justify-center pl-30">
                        <input type="checkbox" checked={Boolean(item.luar_kota)} disabled className="w-4 h-4 text-blue-600 rounded border-slate-300 cursor-not-allowed opacity-70 inline-block align-middle" />
                      </div>
                    </td>
                    <td className="py-4 px-2" style={{ width: '50px' }}>
                      <div className="flex justify-center pl-27">
                        <input type="checkbox" checked={Boolean(item.kos)} disabled className="w-4 h-4 text-blue-600 rounded border-slate-300 cursor-not-allowed opacity-70 inline-block align-middle" />
                      </div>
                    </td>
                    <td className="py-4 px-2" style={{ width: '50px' }}>
                      <div className="flex justify-center pl-28">
                        <input type="checkbox" checked={Boolean(item.dbs)} disabled className="w-4 h-4 text-blue-600 rounded border-slate-300 cursor-not-allowed opacity-70 inline-block align-middle" />
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center pl-25">
                        <select
                          value={item.skillset || "Belum Ada"}
                          onChange={(e) => handleSkillsetChange(item.id, e.target.value)}
                          className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium border-0 focus:ring-2 focus:ring-blue-500/20 cursor-pointer appearance-none text-center ${item.skillset === 'Web Programming' ? 'bg-sky-100 text-sky-700' :
                            item.skillset === 'Digital Marketing' ? 'bg-emerald-100 text-emerald-700' :
                              item.skillset === 'Administratif' ? 'bg-orange-100 text-orange-700' :
                                'bg-slate-100 text-slate-700'
                            }`}
                        >
                          <option value="Belum Ada">Pilih Skill Set</option>
                          <option value="Web Programming">Web Programming</option>
                          <option value="Digital Marketing">Digital Marketing</option>
                          <option value="Administratif">Administratif</option>
                        </select>
                      </div>
                    </td>
                    <td className="p-4 text-left w-[300px]">
                      <SearchableSelect
                        value={item.mappedPerusahaanId}
                        options={perusahaanList}
                        onChange={(val) => handleMappingChange(item.id, val)}
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center pl-30">
                        {perusahaan ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                            <MapIcon className="w-3.5 h-3.5" />
                            {perusahaan.daerah || '-'}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs italic">-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredMappings.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    Tidak ada data siswa yang sesuai dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="py-3.5 px-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500 bg-slate-50/30 shrink-0">
          <p>Total: <span className="font-bold text-slate-700">{filteredMappings.length}</span> Siswa Dipetakan</p>
        </div>
      </div>
    </div>
  );
}
