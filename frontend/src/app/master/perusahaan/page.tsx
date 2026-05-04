'use client';

import { Search, Plus, Edit2, Trash2, MapPin, Phone, Users, Briefcase, Activity, Info, X, User, RotateCcw, Download, Upload, CheckSquare, Save } from "lucide-react";
import { useState, useEffect } from "react";
import * as XLSX from 'xlsx';

export default function MasterPerusahaan() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDaerah, setFilterDaerah] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedPerusahaan, setSelectedPerusahaan] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPerusahaan, setEditingPerusahaan] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [modifiedIds, setModifiedIds] = useState<Set<number>>(new Set());

  const [perusahaan, setPerusahaan] = useState<any[]>([]);

  const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'https://api-pemetaanpkl.pplgsmkn1ciomas.my.id/api'}/perusahaan`;

  const fetchPerusahaan = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Failed to fetch API');
      const data = await res.json();
      
      const mapped = data.map((item: any) => ({
        id: item.id,
        nama: item.nama,
        bidang: item.bidang || "Web Programming",
        daerah: item.daerah || "",
        aktivitas: item.aktivitas || "",
        jumlahSiswa: item.siswas_count || 0,
        tujuanSurat: item.tujuan_surat || "Pimpinan",
        alamat: item.alamat || "",
        kontak: item.kontak || "",
        pic: item.pic || "",
        status: item.status || "Aktif",
        kuota: item.kuota || 0
      }));
      setPerusahaan(mapped);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    fetchPerusahaan();
  }, []);

  const [newPerusahaan, setNewPerusahaan] = useState({
    nama: "",
    bidang: "Web Programming",
    daerah: "",
    aktivitas: "",
    tujuanSurat: "Pimpinan",
    alamat: "",
    kontak: "",
    pic: "",
    status: "Aktif",
    kuota: 0
  });

  const generatePayload = (p: any) => ({
    nama: p.nama,
    bidang: p.bidang,
    daerah: p.daerah,
    aktivitas: p.aktivitas,
    tujuan_surat: p.tujuanSurat,
    alamat: p.alamat,
    kontak: p.kontak,
    pic: p.pic,
    status: p.status,
    kuota: p.kuota || 0
  });

  const handleTujuanChange = (id: number, value: string) => {
    setPerusahaan(prev => prev.map(p => p.id === id ? { ...p, tujuanSurat: value } : p));
    setModifiedIds(prev => new Set(prev).add(id));
  };

  const handleStatusChange = (id: number, value: string) => {
    setPerusahaan(prev => prev.map(p => p.id === id ? { ...p, status: value } : p));
    setModifiedIds(prev => new Set(prev).add(id));
  };

  const handleSaveAll = async () => {
    if (modifiedIds.size === 0) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const updates = Array.from(modifiedIds).map(id => {
        const p = perusahaan.find(item => item.id === id);
        return fetch(`${API_URL}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(generatePayload(p))
        });
      });
      await Promise.all(updates);
      setSaveSuccess(true);
      setModifiedIds(new Set());
      setTimeout(() => setSaveSuccess(false), 3000);
      fetchPerusahaan();
    } catch (e) {
      alert("Gagal menyimpan data perusahaan ke database");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterDaerah("");
    setFilterStatus("");
  };

  const handleAddPerusahaan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(generatePayload(newPerusahaan))
      });
      fetchPerusahaan();
      setIsAddModalOpen(false);
      setNewPerusahaan({
        nama: "",
        bidang: "Web Programming",
        daerah: "",
        aktivitas: "",
        tujuanSurat: "Pimpinan",
        alamat: "",
        kontak: "",
        pic: "",
        status: "Aktif",
        kuota: 0
      });
    } catch (error) {
      alert("Gagal menambahkan perusahaan");
    }
  };

  const handleUpdatePerusahaan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`${API_URL}/${editingPerusahaan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(generatePayload(editingPerusahaan))
      });
      fetchPerusahaan();
      setIsEditModalOpen(false);
      setEditingPerusahaan(null);
    } catch (error) {
      alert("Gagal memperbarui data");
    }
  };

  const handleDeletePerusahaan = async (id: number) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data perusahaan ini?")) {
      try {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        setSelectedIds(prev => prev.filter(sid => sid !== id));
        fetchPerusahaan();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Apakah Anda yakin ingin menghapus ${selectedIds.length} data perusahaan yang dipilih?`)) return;
    setIsBulkDeleting(true);
    try {
      await fetch(`${API_URL}/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
      });
      setSelectedIds([]);
      fetchPerusahaan();
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
    if (selectedIds.length === filteredPerusahaan.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPerusahaan.map(p => p.id));
    }
  };

  const handleExportExcel = () => {
    const dataToExport = perusahaan.map((p) => ({
      "Nama Perusahaan": p.nama,
      "Bidang Industri": p.bidang,
      "Daerah/Kota": p.daerah,
      "Aktivitas PKL": p.aktivitas,
      "Tujuan Surat": p.tujuanSurat,
      "Alamat Lengkap": p.alamat,
      "Nomor Kontak": p.kontak,
      "Nama PIC Industri": p.pic,
      "Status": p.status,
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Perusahaan");
    XLSX.writeFile(workbook, "Data_Perusahaan.xlsx");
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
      
      let duplicates = 0;
      const validPayloads = [];

      for (const item of data) {
        const nama = item["Nama Perusahaan"] || item["nama"] || "";
        if (!nama) continue; // Skip jika nama kosong
        
        // Pengecekan data duplikat berdasarkan nama perusahaan
        const isDuplicate = perusahaan.some(p => p.nama.toLowerCase() === nama.toLowerCase());
        
        if (isDuplicate) {
          duplicates++;
          continue; // Lewati proses simpan untuk data duplikat
        }

        validPayloads.push({
          nama: nama,
          bidang: item["Bidang Industri"] || item["bidang"] || "Web Programming",
          daerah: item["Daerah/Kota"] || item["daerah"] || "",
          aktivitas: item["Aktivitas PKL"] || item["aktivitas"] || "",
          tujuan_surat: item["Tujuan Surat"] || item["tujuan_surat"] || "Pimpinan",
          alamat: item["Alamat Lengkap"] || item["alamat"] || "",
          kontak: item["Nomor Kontak"] || item["kontak"] || "",
          pic: item["Nama PIC Industri"] || item["pic"] || "",
          status: item["Status"] || item["status"] || "Aktif",
          kuota: 0
        });
      }
      
      if (validPayloads.length > 0) {
        try {
          const response = await fetch(`${API_URL}/bulk-import`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ perusahaans: validPayloads })
          });
          
          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }
          
          const result = await response.json();
          fetchPerusahaan();
          
          const inserted = result.inserted || 0;
          const failed = result.failed || 0;
          
          let alertMsg = `Import selesai.\nBerhasil import: ${inserted} data.`;
          if (duplicates > 0) {
            alertMsg += `\nDiabaikan (duplikat): ${duplicates} data.`;
          }
          if (failed > 0) {
            alertMsg += `\nGagal simpan (error database/validasi): ${failed} data.`;
          }
          
          alert(alertMsg);
        } catch (e) {
          console.error("Gagal melakukan bulk import:", e);
          alert('Terjadi kesalahan saat mengimpor data ke server. Pastikan koneksi atau format data sudah benar.');
        }
      } else {
        if (duplicates > 0) {
          alert(`Tidak ada data baru yang ditambahkan. ${duplicates} data diabaikan karena sudah ada di database.`);
        } else {
          alert('Tidak ada data valid yang ditemukan pada file.');
        }
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = "";
  };

  const uniqueDaerah = Array.from(new Set(perusahaan.map(p => p.daerah).filter(d => d))).sort();

  const filteredPerusahaan = perusahaan.filter(p => {
    const matchSearch = p.nama?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       p.bidang?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDaerah = filterDaerah === "" || p.daerah === filterDaerah;
    const matchStatus = filterStatus === "" || p.status === filterStatus;
    return matchSearch && matchDaerah && matchStatus;
  });

  if (!isLoaded) return <div className="p-8 text-center text-white font-bold">Memuat data dari API MySQL...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] space-y-4 relative">
      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300 border border-slate-700">
          <CheckSquare className="w-5 h-5 text-blue-400" />
          <span className="font-medium text-sm">{selectedIds.length} perusahaan dipilih</span>
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Master Data Perusahaan</h1>
          <p className="text-slate-500 mt-1">Kelola daftar industri/perusahaan tujuan magang (Live MySQL)</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {saveSuccess && <span className="text-emerald-400 font-medium text-sm mr-2">✔ Tersimpan</span>}
          <button 
            onClick={handleSaveAll}
            disabled={isSaving || modifiedIds.size === 0}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm ${
              isSaving || modifiedIds.size === 0 ? 'bg-blue-400 cursor-not-allowed text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Save className="w-5 h-5" />
            {isSaving ? 'Menyimpan...' : 'Simpan'}
          </button>
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
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Tambah Perusahaan
          </button>
        </div>
      </div>

      {/* Modal Tambah Perusahaan */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header Modal - Warna Biru */}
            <div className="flex items-center justify-between p-6 bg-blue-600 text-white">
              <h2 className="text-xl font-bold">Tambah Perusahaan Baru</h2>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddPerusahaan}>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Nama Perusahaan</label>
                  <input 
                    type="text"
                    required
                    placeholder="Masukkan nama perusahaan"
                    value={newPerusahaan.nama}
                    onChange={(e) => setNewPerusahaan({...newPerusahaan, nama: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Bidang Industri</label>
                  <select 
                    value={newPerusahaan.bidang}
                    onChange={(e) => setNewPerusahaan({...newPerusahaan, bidang: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-800"
                  >
                    <option value="Web Programming">Web Programming</option>
                    <option value="Digital marketing">Digital marketing</option>
                    <option value="Administrasi">Administrasi</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Daerah/Kota</label>
                  <input 
                    type="text"
                    placeholder="Contoh: Jakarta Selatan"
                    value={newPerusahaan.daerah}
                    onChange={(e) => setNewPerusahaan({...newPerusahaan, daerah: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Aktivitas PKL</label>
                  <input 
                    type="text"
                    placeholder="Contoh: Software Engineering"
                    value={newPerusahaan.aktivitas}
                    onChange={(e) => setNewPerusahaan({...newPerusahaan, aktivitas: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Tujuan Surat</label>
                  <select 
                    value={newPerusahaan.tujuanSurat}
                    onChange={(e) => setNewPerusahaan({...newPerusahaan, tujuanSurat: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-800"
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
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Nama PIC Industri</label>
                  <input 
                    type="text"
                    placeholder="Contoh: Bapak Budi Santoso"
                    value={newPerusahaan.pic}
                    onChange={(e) => setNewPerusahaan({...newPerusahaan, pic: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Nomor Kontak</label>
                  <input 
                    type="text"
                    placeholder="Contoh: 08123456789"
                    value={newPerusahaan.kontak}
                    onChange={(e) => setNewPerusahaan({...newPerusahaan, kontak: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Status</label>
                  <select 
                    value={newPerusahaan.status}
                    onChange={(e) => setNewPerusahaan({...newPerusahaan, status: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-800"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Tidak aktif">Tidak aktif</option>
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Alamat Lengkap</label>
                  <textarea 
                    placeholder="Masukkan alamat lengkap perusahaan..."
                    value={newPerusahaan.alamat}
                    onChange={(e) => setNewPerusahaan({...newPerusahaan, alamat: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-800 resize-none"
                  />
                </div>
              </div>

              {/* Footer Modal - Warna Biru */}
              <div className="p-4 bg-blue-600 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition-colors border border-white/20"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
                >
                  Simpan Perusahaan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col flex-1 min-h-0">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 bg-slate-50/50 shrink-0">
          <div className="relative max-w-md w-full">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari nama perusahaan atau bidang..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-800 placeholder:text-slate-500"
            />
          </div>
          <select
            value={filterDaerah}
            onChange={(e) => setFilterDaerah(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-600 sm:w-48"
          >
            <option value="">Semua Daerah</option>
            {uniqueDaerah.map(daerah => (
              <option key={daerah} value={daerah}>{daerah}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-600 sm:w-48"
          >
            <option value="">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Tidak aktif">Tidak aktif</option>
          </select>

          <button
            onClick={handleResetFilters}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm active:scale-95 shrink-0"
            title="Reset semua filter"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Filter</span>
          </button>
        </div>
        
        <div className="flex-1 overflow-auto relative">
          <table className="w-full text-left border-collapse table-fixed min-w-[1000px]">
            <thead className="sticky top-0 z-10 shadow-sm">
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                <th className="p-4 font-semibold w-[4%] bg-slate-50">
                  <input 
                    type="checkbox" 
                    checked={filteredPerusahaan.length > 0 && selectedIds.length === filteredPerusahaan.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="p-4 font-semibold w-[30%] bg-slate-50">Nama Perusahaan & Bidang</th>
                <th className="p-4 font-semibold w-[25%] bg-slate-50">Daerah & Aktivitas</th>
                <th className="p-4 font-semibold w-[18%] bg-slate-50">Tujuan Surat</th>
                <th className="p-4 font-semibold w-[13%] bg-slate-50">Status</th>
                <th className="p-4 font-semibold text-center w-[10%] bg-slate-50">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {filteredPerusahaan.map((item) => (
                <tr key={item.id} className={`hover:bg-blue-50/30 transition-colors group ${selectedIds.includes(item.id) ? 'bg-blue-50/40' : ''}`}>
                  <td className="p-4">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelectId(item.id)}
                      className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-slate-800 text-base">{item.nama}</p>
                    <p className="text-slate-700 mt-1 flex items-center gap-1.5 font-medium">
                      <Briefcase className="w-4 h-4 text-slate-400" />
                      {item.bidang}
                    </p>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-slate-700">{item.daerah}</p>
                    <p className="text-slate-500 mt-1 flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-slate-400" />
                      {item.aktivitas}
                    </p>
                  </td>
                  <td className="p-4">
                    <select
                      value={item.tujuanSurat}
                      onChange={(e) => handleTujuanChange(item.id, e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 font-medium cursor-pointer hover:border-slate-300 transition-all"
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
                  </td>
                  <td className="p-4">
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold cursor-pointer ${
                        item.status === 'Aktif' 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:border-emerald-300' 
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Tidak aktif">Tidak aktif</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => setSelectedPerusahaan(item)}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" 
                        title="Detail Kontak & Alamat"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          setEditingPerusahaan({ ...item });
                          setIsEditModalOpen(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeletePerusahaan(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPerusahaan.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Tidak ada data perusahaan yang sesuai dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="py-3.5 px-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500 bg-slate-50/30 shrink-0">
          <p>Total: <span className="font-bold text-slate-700">{filteredPerusahaan.length}</span> Perusahaan Mitra</p>
        </div>
        </div>

        {/* Modal Edit Perusahaan */}
        {isEditModalOpen && editingPerusahaan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header Modal - Warna Biru */}
            <div className="flex items-center justify-between p-6 bg-blue-600 text-white">
              <h2 className="text-xl font-bold">Edit Data Perusahaan</h2>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePerusahaan}>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Nama Perusahaan</label>
                  <input 
                    type="text"
                    required
                    placeholder="Masukkan nama perusahaan"
                    value={editingPerusahaan.nama}
                    onChange={(e) => setEditingPerusahaan({...editingPerusahaan, nama: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Bidang Industri</label>
                  <select 
                    value={editingPerusahaan.bidang}
                    onChange={(e) => setEditingPerusahaan({...editingPerusahaan, bidang: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-800"
                  >
                    <option value="Web Programming">Web Programming</option>
                    <option value="Digital marketing">Digital marketing</option>
                    <option value="Administrasi">Administrasi</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Daerah/Kota</label>
                  <input 
                    type="text"
                    placeholder="Contoh: Jakarta Selatan"
                    value={editingPerusahaan.daerah}
                    onChange={(e) => setEditingPerusahaan({...editingPerusahaan, daerah: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Aktivitas PKL</label>
                  <input 
                    type="text"
                    placeholder="Contoh: Software Engineering"
                    value={editingPerusahaan.aktivitas}
                    onChange={(e) => setEditingPerusahaan({...editingPerusahaan, aktivitas: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Tujuan Surat</label>
                  <select 
                    value={editingPerusahaan.tujuanSurat}
                    onChange={(e) => setEditingPerusahaan({...editingPerusahaan, tujuanSurat: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-800"
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
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Nama PIC Industri</label>
                  <input 
                    type="text"
                    placeholder="Contoh: Bapak Budi Santoso"
                    value={editingPerusahaan.pic}
                    onChange={(e) => setEditingPerusahaan({...editingPerusahaan, pic: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Nomor Kontak</label>
                  <input 
                    type="text"
                    placeholder="Contoh: 08123456789"
                    value={editingPerusahaan.kontak}
                    onChange={(e) => setEditingPerusahaan({...editingPerusahaan, kontak: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Status</label>
                  <select 
                    value={editingPerusahaan.status}
                    onChange={(e) => setEditingPerusahaan({...editingPerusahaan, status: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-800"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Tidak aktif">Tidak aktif</option>
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Alamat Lengkap</label>
                  <textarea 
                    placeholder="Masukkan alamat lengkap perusahaan..."
                    value={editingPerusahaan.alamat}
                    onChange={(e) => setEditingPerusahaan({...editingPerusahaan, alamat: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-800 resize-none"
                  />
                </div>
              </div>

              {/* Footer Modal - Warna Biru */}
              <div className="p-4 bg-blue-600 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition-colors border border-white/20"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
        )}

      {selectedPerusahaan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 bg-blue-600 text-white">
              <h2 className="text-xl font-bold">Detail Kontak</h2>
              <button 
                onClick={() => setSelectedPerusahaan(null)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Nama Perusahaan</p>
                <p className="text-lg font-bold text-slate-800">{selectedPerusahaan.nama}</p>
                <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                  <Briefcase className="w-4 h-4" />
                  {selectedPerusahaan.bidang}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="p-2 rounded-lg bg-orange-100 text-orange-600 shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Nama PIC Industri</p>
                    <p className="text-slate-800 font-medium mt-0.5">{selectedPerusahaan.pic}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600 shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Nomor Kontak</p>
                    <p className="text-slate-800 font-medium mt-0.5">{selectedPerusahaan.kontak}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Alamat Lengkap</p>
                    <p className="text-slate-800 font-medium mt-0.5 leading-relaxed">{selectedPerusahaan.alamat}</p>
                    <p className="text-xs text-blue-600 mt-2 font-medium flex items-center gap-1 cursor-pointer hover:underline">
                      <MapPin className="w-3 h-3" />
                      Lihat di Google Maps
                    </p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setSelectedPerusahaan(null)}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
