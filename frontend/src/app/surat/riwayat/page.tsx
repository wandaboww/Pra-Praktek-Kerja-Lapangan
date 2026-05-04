'use client';

import { Search, FileText, CheckCircle2, Clock, Download, Eye, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function RiwayatSurat() {
  const formatTanggal = (dateStr: string): string => {
    if (!dateStr) return '-';
    const bulan = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
  };

  const [riwayat, setRiwayat] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api-pemetaanpkl.pplgsmkn1ciomas.my.id/api';

  const fetchSurat = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/surat`);
      const data = await res.json();
      setRiwayat(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSurat();
  }, []);

  const handleDownloadDocx = async (surat: any) => {
    try {
      // Fetch the template
      const resTemplate = await fetch(`${API_BASE}/template`);
      const template = await resTemplate.json();

      if (!template || !template.content) {
        alert('Template surat belum tersedia. Silakan buat template terlebih dahulu.');
        return;
      }

      // Substitute variables
      let content = template.content;
      content = content.replace(/\{\{NOMOR_SURAT\}\}/g, surat.nomor_surat || '-');
      content = content.replace(/\{\{PIMPINAN_PERUSAHAAN\}\}/g, surat.perusahaan?.tujuan_surat || 'Pimpinan');
      content = content.replace(/\{\{NAMA_PERUSAHAAN\}\}/g, surat.perusahaan?.nama || '-');
      content = content.replace(/\{\{TAHUN_AJARAN\}\}/g, surat.tahun_ajaran || '-');
      content = content.replace(/\{\{ALAMAT_PERUSAHAAN\}\}/g, surat.perusahaan?.alamat || '-');
      content = content.replace(/\{\{PIC_PERUSAHAAN\}\}/g, surat.perusahaan?.pic || '-');
      content = content.replace(/\{\{TANGGAL_SURAT\}\}/g, formatTanggal(surat.tanggal_surat));

      // Generate siswa table
      let siswaTable = '<p><em>Belum ada data siswa</em></p>';
      if (surat.siswas && surat.siswas.length > 0) {
        const rows = surat.siswas.map((s: any, idx: number) => `
          <tr>
            <td style="border: 1px solid black; padding: 6px; text-align: center; white-space: nowrap;">${idx + 1}</td>
            <td style="border: 1px solid black; padding: 6px; text-align: center;">${s.nama || '-'}</td>
            <td style="border: 1px solid black; padding: 6px; text-align: center; white-space: nowrap;">${s.kelas || '-'}</td>
            <td style="border: 1px solid black; padding: 6px; text-align: center;">${s.portofolio ? `<a href="${s.portofolio}" style="color: blue;">${s.portofolio}</a>` : '-'}</td>
          </tr>`).join('');

        siswaTable = `
          <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: center; table-layout: auto;">
            <thead>
              <tr>
                <th style="border: 1px solid black; padding: 6px; text-align: center; width: 1%; white-space: nowrap;">NO</th>
                <th style="border: 1px solid black; padding: 6px; text-align: center;">NAMA MURID</th>
                <th style="border: 1px solid black; padding: 6px; text-align: center; width: 1%; white-space: nowrap;">KELAS</th>
                <th style="border: 1px solid black; padding: 6px; text-align: center;">LINK PROFIL MURID</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>`;
      }

      content = content.replace(/<em>\{\{TABEL_DAFTAR_SISWA\}\}<\/em>/g, siswaTable);
      content = content.replace(/\{\{TABEL_DAFTAR_SISWA\}\}/g, siswaTable);

      // Wrap in Word-compatible HTML
      const htmlDocument = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset='utf-8'>
          <title>Surat PKL - ${surat.perusahaan?.nama || ''}</title>
          <style>
            body { font-family: 'Times New Roman', Times, serif; color: black; line-height: 1.5; font-size: 14px; }
            table { border-collapse: collapse; }
          </style>
        </head>
        <body>${content}</body>
        </html>
      `;

      // Create blob and download
      const blob = new Blob(['\ufeff', htmlDocument], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Surat_Pengajuan_${surat.perusahaan?.nama?.replace(/\s+/g, '_') || 'PKL'}.doc`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Update status to 'Tercetak' in backend
      await fetch(`${API_BASE}/surat/${surat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Tercetak' })
      });
      fetchSurat(); // Refresh data
    } catch (error) {
      console.error("Gagal download:", error);
      alert('Gagal men-download surat.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus surat ini?')) return;
    try {
      await fetch(`${API_BASE}/surat/${id}`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' }
      });
      fetchSurat();
    } catch (error) {
      console.error("Gagal menghapus:", error);
      alert('Gagal menghapus surat.');
    }
  };

  const filteredRiwayat = riwayat.filter(item => {
    const matchSearch = item.nomor_surat.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (item.perusahaan?.nama.toLowerCase() || "").includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === "" || item.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Riwayat Surat</h1>
          <p className="text-slate-500 mt-1">Log aktivitas dan daftar surat yang telah dibuat</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between gap-4 bg-slate-50/50">
          <div className="relative max-w-md w-full">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari nomor surat atau tujuan..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-600"
            >
              <option value="">Semua Status</option>
              <option value="Tercetak">Tercetak</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                <th className="p-4 font-medium">Nomor Surat</th>
                <th className="p-4 font-medium">Perusahaan Tujuan</th>
                <th className="p-4 font-medium">Tanggal</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-center w-32">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" /> Memuat data...
                    </div>
                  </td>
                </tr>
              ) : filteredRiwayat.length > 0 ? (
                filteredRiwayat.map((item) => (
                  <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-bold text-slate-800">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        {item.nomor_surat}
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 font-medium">
                      {item.perusahaan?.nama || '-'}
                      <span className="block text-xs text-slate-400 font-normal mt-0.5">{item.siswas?.length || 0} Siswa diajukan</span>
                    </td>
                    <td className="p-4 text-slate-500">{item.tanggal_surat}</td>
                    <td className="p-4">
                      {item.status === 'Tercetak' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Tercetak
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                          <Clock className="w-3.5 h-3.5" />
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/surat/preview/${item.id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Lihat/Edit">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleDownloadDocx(item)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer" title="Download DOCX">
                          <Download className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Tidak ada riwayat surat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
          <p>Menampilkan {filteredRiwayat.length} data surat</p>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50">Sebelumnya</button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded-md">1</button>
            <button className="px-3 py-1 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50">Selanjutnya</button>
          </div>
        </div>
      </div>
    </div>
  );
}
