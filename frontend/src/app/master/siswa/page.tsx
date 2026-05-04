'use client';

import { CheckSquare, Download, Edit2, Link as LinkIcon, Plus, Search, Trash2, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";
import * as XLSX from 'xlsx';

interface Siswa {
  id: number;
  nama: string;
  kelas: string;
  programKeahlian: string;
  portofolio: string;
  status: string;
  skillset: string;
  laptop: boolean;
  luarKota: boolean;
  kos: boolean;
  dbs: boolean;
  mappedPerusahaanId: number | null;
}

export default function MasterSiswa() {
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Konfigurasi API
  const API_URL = typeof window !== 'undefined' ? `http://${window.location.hostname}:8000/api/siswa` : 'http://127.0.0.1:8000/api/siswa';

  const fetchSiswa = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      const mapped = data.map((item: any) => ({
        id: item.id,
        nama: item.nama,
        kelas: item.kelas,
        programKeahlian: item.program_keahlian,
        portofolio: item.portofolio || "",
        status: item.status,
        skillset: item.skillset || "Web Programming",
        laptop: Boolean(item.laptop),
        luarKota: Boolean(item.luar_kota),
        kos: Boolean(item.kos),
        dbs: Boolean(item.dbs),
        mappedPerusahaanId: item.perusahaan_id
      }));
      setSiswaList(mapped);
    } catch (e) {
      console.error("Gagal memuat data dari API", e);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    fetchSiswa();
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKelas, setSelectedKelas] = useState("");
  const [selectedSkillset, setSelectedSkillset] = useState("");
  
  // Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSiswa, setEditingSiswa] = useState<Siswa | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [newSiswa, setNewSiswa] = useState<Omit<Siswa, 'id'>>({
    nama: "",
    kelas: "12 PPLG 1",
    programKeahlian: "Pengembangan Perangkat Lunak dan Gim",
    portofolio: "",
    status: "Belum PKL",
    skillset: "Web Programming",
    laptop: false,
    luarKota: false,
    kos: false,
    dbs: false,
    mappedPerusahaanId: null
  });

  const generatePayload = (s: Siswa | Omit<Siswa, 'id'>) => ({
    nama: s.nama,
    kelas: s.kelas,
    program_keahlian: s.programKeahlian,
    portofolio: s.portofolio,
    status: s.status,
    skillset: s.skillset,
    laptop: s.laptop,
    luar_kota: s.luarKota,
    kos: s.kos,
    dbs: s.dbs,
    perusahaan_id: s.mappedPerusahaanId
  });

  const handleSkillsetChange = async (id: number, newSkillset: string) => {
    const currentSiswa = siswaList.find(s => s.id === id);
    if (!currentSiswa) return;
    
    // Optimistic Update
    setSiswaList(prev => prev.map(s => s.id === id ? { ...s, skillset: newSkillset } : s));
    
    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(generatePayload({ ...currentSiswa, skillset: newSkillset }))
      });
    } catch (e) {
      console.error(e);
      fetchSiswa(); // Revert on fail
    }
  };

  const handleChecklistChange = async (id: number, field: keyof Pick<Siswa, 'laptop' | 'luarKota' | 'kos' | 'dbs'>, value: boolean) => {
    const currentSiswa = siswaList.find(s => s.id === id);
    if (!currentSiswa) return;
    
    // Optimistic Update
    setSiswaList(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
    
    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(generatePayload({ ...currentSiswa, [field]: value }))
      });
    } catch (e) {
      console.error(e);
      fetchSiswa(); // Revert on fail
    }
  };

  const openEditModal = (siswa: Siswa) => {
    setEditingSiswa({ ...siswa });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingSiswa(null);
  };

  const openAddModal = () => {
    setNewSiswa({
      nama: "",
      kelas: "12 PPLG 1",
      programKeahlian: "Pengembangan Perangkat Lunak dan Gim",
      portofolio: "",
      status: "Belum PKL",
      skillset: "Web Programming",
      laptop: false,
      luarKota: false,
      kos: false,
      dbs: false,
      mappedPerusahaanId: null
    });
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleUpdateSiswa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSiswa) {
      try {
        await fetch(`${API_URL}/${editingSiswa.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(generatePayload(editingSiswa))
        });
        fetchSiswa();
        closeEditModal();
      } catch (e) {
        console.error(e);
        alert("Gagal memperbarui data siswa");
      }
    }
  };

  const handleAddSiswa = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(generatePayload(newSiswa))
      });
      fetchSiswa();
      closeAddModal();
    } catch (e) {
      console.error(e);
      alert("Gagal menambahkan siswa");
    }
  };

  const handleDeleteSiswa = async (id: number) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data siswa ini?")) {
      try {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        setSelectedIds(prev => prev.filter(sid => sid !== id));
        fetchSiswa();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Apakah Anda yakin ingin menghapus ${selectedIds.length} data siswa yang dipilih?`)) return;
    setIsBulkDeleting(true);
    try {
      await fetch(`${API_URL}/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
      });
      setSelectedIds([]);
      fetchSiswa();
    } catch (e) {
      console.error(e);
      alert('Gagal menghapus data');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const toggleSelectId = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredSiswa.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredSiswa.map(s => s.id));
    }
  };

  const handleExportExcel = () => {
    const dataToExport = siswaList.map((siswa) => ({
      "Nama Murid": siswa.nama,
      "Kelas": siswa.kelas,
      "Laptop": siswa.laptop,
      "PKL di luar Kota": siswa.luarKota,
      "Kos": siswa.kos,
      "DBS": siswa.dbs,
      "Skill Set": siswa.skillset,
      "Portofolio": siswa.portofolio,
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Siswa");
    XLSX.writeFile(workbook, "Data_Siswa_PKL.xlsx");
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws) as any[];
      
      alert("Memproses import, mohon tunggu...");
      
      // We perform sequential posts
      for (const item of data) {
        const nama = item["Nama Murid"] || "";
        const kelas = item["Kelas"] || "";
        if (!nama) continue;
        
        const payload = {
          nama: nama,
          kelas: kelas || "12 PPLG 1",
          programKeahlian: "Pengembangan Perangkat Lunak dan Gim",
          portofolio: item["Portofolio"] || "",
          status: "Belum PKL",
          skillset: item["Skill Set"] || "Web Programming",
          laptop: !!item["Laptop"],
          luarKota: !!item["PKL di luar Kota"],
          kos: !!item["Kos"],
          dbs: !!item["DBS"],
          mappedPerusahaanId: null
        };

        try {
          // This is basic import. In production, we'd check duplicates first or have an upsert endpoint.
          await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(generatePayload(payload))
          });
        } catch (err) {
          console.error("Gagal import siswa", nama);
        }
      }
      
      fetchSiswa();
      alert("Import selesai.");
    };
    reader.readAsBinaryString(file);
    e.target.value = "";
  };

  const filteredSiswa = siswaList.filter(siswa => {
    const matchesSearch = siswa.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         siswa.kelas.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesKelas = selectedKelas === "" || siswa.kelas === selectedKelas;
    const matchesSkillset = selectedSkillset === "" || siswa.skillset === selectedSkillset;
    
    return matchesSearch && matchesKelas && matchesSkillset;
  });

  if (!isLoaded) return <div className="p-8 text-center text-white font-bold">Memuat data dari API MySQL...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] space-y-4 relative">
      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300 border border-slate-700">
          <CheckSquare className="w-5 h-5 text-blue-400" />
          <span className="font-medium text-sm">{selectedIds.length} siswa dipilih</span>
          <div className="w-px h-5 bg-slate-600"></div>
          <button 
            onClick={handleBulkDelete}
            disabled={isBulkDeleting}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            {isBulkDeleting ? 'Menghapus...' : 'Hapus Terpilih'}
          </button>
          <button 
            onClick={() => setSelectedIds([])}
            className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
            title="Batal Pilih"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white">Master Data Siswa</h1>
          <p className="text-slate-500 mt-1">Kelola daftar peserta didik yang akan melaksanakan PKL (Live MySQL)</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm cursor-pointer">
            <Upload className="w-5 h-5" />
            Import Excel
            <input type="file" accept=".xlsx, .xls" onChange={handleImportExcel} className="hidden" />
          </label>
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Download className="w-5 h-5" />
            Export Excel
          </button>
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Tambah Siswa
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col grow overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between gap-4 bg-slate-50 shrink-0">
          <div className="relative max-w-md w-full">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari nama atau kelas..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-800 placeholder:text-slate-500"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select 
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-600"
            >
              <option value="">Semua Kelas</option>
              <option value="12 PPLG 1">12 PPLG 1</option>
              <option value="12 PPLG 2">12 PPLG 2</option>
              <option value="12 PPLG 3">12 PPLG 3</option>
            </select>
            <select 
              value={selectedSkillset}
              onChange={(e) => setSelectedSkillset(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-600"
            >
              <option value="">Semua Skill Set</option>
              <option value="Web Programming">Web Programming</option>
              <option value="Digital Marketing">Digital Marketing</option>
              <option value="Administratif">Administratif</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-auto grow relative">
          <table className="w-full text-left border-collapse table-fixed">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                <th className="p-4 font-medium w-[4%] bg-slate-50">
                  <input 
                    type="checkbox" 
                    checked={filteredSiswa.length > 0 && selectedIds.length === filteredSiswa.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="p-4 font-medium w-[22%] bg-slate-50">Nama Siswa</th>
                <th className="p-4 font-medium w-[13%] bg-slate-50">Kelas / Jurusan</th>
                <th className="p-4 font-medium text-center w-[8%] bg-slate-50">Laptop</th>
                <th className="p-4 font-medium text-center w-[12%] bg-slate-50">Luar Kota</th>
                <th className="p-4 font-medium text-center w-[8%] bg-slate-50">Kos</th>
                <th className="p-4 font-medium text-center w-[8%] bg-slate-50">DBS</th>
                <th className="p-4 font-medium text-center w-[14%] bg-slate-50">Skill Set</th>
                <th className="p-4 font-medium text-center w-[10%] bg-slate-50">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredSiswa.map((item) => (
                <tr key={item.id} className={`border-b border-slate-50 hover:bg-slate-50/80 transition-colors ${selectedIds.includes(item.id) ? 'bg-blue-50/40' : ''}`}>
                  <td className="p-4">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelectId(item.id)}
                      className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                  </td>
                  <td className="p-4 font-bold text-slate-800 text-base truncate">
                    {item.nama}
                    <div className="flex items-center gap-1.5 mt-1">
                      {item.portofolio ? (
                        <a href={item.portofolio} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1">
                          <LinkIcon className="w-3 h-3" /> Portofolio
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No Portofolio</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-slate-700 font-medium">{item.kelas}</p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{item.programKeahlian}</p>
                  </td>
                  <td className="p-4 text-center">
                    <input 
                      type="checkbox" 
                      checked={item.laptop}
                      onChange={(e) => handleChecklistChange(item.id, 'laptop', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="p-4 text-center">
                    <input 
                      type="checkbox" 
                      checked={item.luarKota}
                      onChange={(e) => handleChecklistChange(item.id, 'luarKota', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="p-4 text-center">
                    <input 
                      type="checkbox" 
                      checked={item.kos}
                      onChange={(e) => handleChecklistChange(item.id, 'kos', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="p-4 text-center">
                    <input 
                      type="checkbox" 
                      checked={item.dbs}
                      onChange={(e) => handleChecklistChange(item.id, 'dbs', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="p-4 text-center">
                    <select
                      value={item.skillset}
                      onChange={(e) => handleSkillsetChange(item.id, e.target.value)}
                      className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium border-0 focus:ring-2 focus:ring-blue-500/20 cursor-pointer appearance-none ${
                        item.skillset === 'Web Programming' ? 'bg-sky-100 text-sky-700' :
                        item.skillset === 'Digital Marketing' ? 'bg-emerald-100 text-emerald-700' :
                        item.skillset === 'Administratif' ? 'bg-orange-100 text-orange-700' :
                        'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <option value="Web Programming">Web Programming</option>
                      <option value="Digital Marketing">Digital Marketing</option>
                      <option value="Administratif">Administratif</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => openEditModal(item)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteSiswa(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSiswa.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    Tidak ada data yang sesuai dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500 bg-slate-50/50 shrink-0">
          <p>Menampilkan {filteredSiswa.length > 0 ? 1 : 0} hingga {filteredSiswa.length} dari {filteredSiswa.length} data</p>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && editingSiswa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">Edit Data Siswa</h2>
              <button 
                onClick={closeEditModal}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateSiswa} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Nama Lengkap</label>
                <input 
                  type="text"
                  required
                  value={editingSiswa.nama}
                  onChange={(e) => setEditingSiswa({...editingSiswa, nama: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Kelas</label>
                  <select 
                    value={editingSiswa.kelas}
                    onChange={(e) => setEditingSiswa({...editingSiswa, kelas: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-800"
                  >
                    <option value="12 PPLG 1">12 PPLG 1</option>
                    <option value="12 PPLG 2">12 PPLG 2</option>
                    <option value="12 PPLG 3">12 PPLG 3</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Skill Set</label>
                  <select 
                    value={editingSiswa.skillset}
                    onChange={(e) => setEditingSiswa({...editingSiswa, skillset: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-800"
                  >
                    <option value="Web Programming">Web Programming</option>
                    <option value="Digital Marketing">Digital Marketing</option>
                    <option value="Administratif">Administratif</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">URL Portofolio (Opsional)</label>
                <input 
                  type="url"
                  value={editingSiswa.portofolio}
                  onChange={(e) => setEditingSiswa({...editingSiswa, portofolio: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-50 rounded-lg transition-colors">
                  <input 
                    type="checkbox" 
                    checked={editingSiswa.laptop}
                    onChange={(e) => setEditingSiswa({...editingSiswa, laptop: e.target.checked})}
                    className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">Punya Laptop</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-50 rounded-lg transition-colors">
                  <input 
                    type="checkbox" 
                    checked={editingSiswa.luarKota}
                    onChange={(e) => setEditingSiswa({...editingSiswa, luarKota: e.target.checked})}
                    className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">PKL Luar Kota</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-50 rounded-lg transition-colors">
                  <input 
                    type="checkbox" 
                    checked={editingSiswa.kos}
                    onChange={(e) => setEditingSiswa({...editingSiswa, kos: e.target.checked})}
                    className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">Bisa Kos</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-50 rounded-lg transition-colors">
                  <input 
                    type="checkbox" 
                    checked={editingSiswa.dbs}
                    onChange={(e) => setEditingSiswa({...editingSiswa, dbs: e.target.checked})}
                    className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">DBS (Bursa Kerja)</span>
                </label>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">Tambah Siswa Baru</h2>
              <button 
                onClick={closeAddModal}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddSiswa} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Nama Lengkap</label>
                <input 
                  type="text"
                  required
                  placeholder="Masukkan nama lengkap"
                  value={newSiswa.nama}
                  onChange={(e) => setNewSiswa({...newSiswa, nama: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Kelas</label>
                  <select 
                    value={newSiswa.kelas}
                    onChange={(e) => setNewSiswa({...newSiswa, kelas: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-800"
                  >
                    <option value="12 PPLG 1">12 PPLG 1</option>
                    <option value="12 PPLG 2">12 PPLG 2</option>
                    <option value="12 PPLG 3">12 PPLG 3</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Skill Set</label>
                  <select 
                    value={newSiswa.skillset}
                    onChange={(e) => setNewSiswa({...newSiswa, skillset: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-800"
                  >
                    <option value="Web Programming">Web Programming</option>
                    <option value="Digital Marketing">Digital Marketing</option>
                    <option value="Administratif">Administratif</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">URL Portofolio (Opsional)</label>
                <input 
                  type="url"
                  placeholder="https://..."
                  value={newSiswa.portofolio}
                  onChange={(e) => setNewSiswa({...newSiswa, portofolio: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-50 rounded-lg transition-colors">
                  <input 
                    type="checkbox" 
                    checked={newSiswa.laptop}
                    onChange={(e) => setNewSiswa({...newSiswa, laptop: e.target.checked})}
                    className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">Punya Laptop</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-50 rounded-lg transition-colors">
                  <input 
                    type="checkbox" 
                    checked={newSiswa.luarKota}
                    onChange={(e) => setNewSiswa({...newSiswa, luarKota: e.target.checked})}
                    className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">PKL Luar Kota</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-50 rounded-lg transition-colors">
                  <input 
                    type="checkbox" 
                    checked={newSiswa.kos}
                    onChange={(e) => setNewSiswa({...newSiswa, kos: e.target.checked})}
                    className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">Bisa Kos</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-50 rounded-lg transition-colors">
                  <input 
                    type="checkbox" 
                    checked={newSiswa.dbs}
                    onChange={(e) => setNewSiswa({...newSiswa, dbs: e.target.checked})}
                    className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">DBS (Bursa Kerja)</span>
                </label>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={closeAddModal}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
                >
                  Tambah Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
