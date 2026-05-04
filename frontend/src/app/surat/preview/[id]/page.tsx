'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontSize } from '@tiptap/extension-text-style';
import Image from '@tiptap/extension-image';
import { Underline } from '@tiptap/extension-underline';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';

import { 
  ArrowLeft, Save, Loader2,
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Subscript as SubscriptIcon, Superscript as SuperscriptIcon,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Image as ImageIcon, Undo, Redo,
  Heading1, Heading2, Heading3,
  List, ListOrdered,
  Highlighter, Baseline
} from 'lucide-react';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';

function generateSiswaTable(siswas: any[]): string {
  if (!siswas || siswas.length === 0) {
    return '<p><em>Belum ada data siswa</em></p>';
  }

  let rows = '';
  siswas.forEach((s: any, idx: number) => {
    rows += `
      <tr>
        <td style="border: 1px solid black; padding: 6px; text-align: center; white-space: nowrap;">${idx + 1}</td>
        <td style="border: 1px solid black; padding: 6px; text-align: center;">${s.nama || '-'}</td>
        <td style="border: 1px solid black; padding: 6px; text-align: center; white-space: nowrap;">${s.kelas || '-'}</td>
        <td style="border: 1px solid black; padding: 6px; text-align: center;">${s.portofolio ? `<a href="${s.portofolio}" style="color: blue;">${s.portofolio}</a>` : '-'}</td>
      </tr>`;
  });

  return `
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

function formatTanggal(dateStr: string): string {
  if (!dateStr) return '-';
  const bulan = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
}

function substituteTemplate(templateContent: string, suratData: any): string {
  let result = templateContent;

  result = result.replace(/\{\{NOMOR_SURAT\}\}/g, suratData.nomor_surat || '-');
  result = result.replace(/\{\{PIMPINAN_PERUSAHAAN\}\}/g, suratData.perusahaan?.tujuan_surat || 'Pimpinan');
  result = result.replace(/\{\{NAMA_PERUSAHAAN\}\}/g, suratData.perusahaan?.nama || '-');
  result = result.replace(/\{\{TAHUN_AJARAN\}\}/g, suratData.tahun_ajaran || '-');
  result = result.replace(/\{\{ALAMAT_PERUSAHAAN\}\}/g, suratData.perusahaan?.alamat || '-');
  result = result.replace(/\{\{PIC_PERUSAHAAN\}\}/g, suratData.perusahaan?.pic || '-');
  result = result.replace(/\{\{TANGGAL_SURAT\}\}/g, formatTanggal(suratData.tanggal_surat));

  // Replace table placeholder - handle both with and without <em> wrapping
  const tabelSiswa = generateSiswaTable(suratData.siswas || []);
  result = result.replace(/<em>\{\{TABEL_DAFTAR_SISWA\}\}<\/em>/g, tabelSiswa);
  result = result.replace(/\{\{TABEL_DAFTAR_SISWA\}\}/g, tabelSiswa);

  return result;
}

export default function PreviewSurat({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [suratData, setSuratData] = useState<any>(null);
  const [finalContent, setFinalContent] = useState<string>('');

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api-pemetaanpkl.pplgsmkn1ciomas.my.id/api';

  useEffect(() => {
    const loadData = async () => {
      try {
        const [resSurat, resTemplate] = await Promise.all([
          fetch(`${API_BASE}/surat/${resolvedParams.id}`),
          fetch(`${API_BASE}/template`)
        ]);

        if (!resSurat.ok) throw new Error('Surat not found');

        const surat = await resSurat.json();
        const template = await resTemplate.json();

        setSuratData(surat);

        if (template && template.content) {
          const substituted = substituteTemplate(template.content, surat);
          setFinalContent(substituted);
        } else {
          setFinalContent('<p>Template surat belum tersedia. Silakan buat template terlebih dahulu di menu Pengaturan > Template Surat.</p>');
        }
      } catch (e) {
        console.error('Gagal memuat data:', e);
        setFinalContent('<p>Gagal memuat data surat.</p>');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [resolvedParams.id]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      FontSize,
      Underline,
      Color,
      Highlight.configure({ multicolor: true }),
      Subscript,
      Superscript,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Image.configure({
        allowBase64: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'mx-auto focus:outline-none bg-white p-12 min-h-[1056px] w-[793px] shadow-lg border border-slate-300',
        style: 'font-family: "Times New Roman", Times, serif; line-height: 1.5; color: black;'
      },
    },
  });

  // Update editor content when finalContent is ready
  useEffect(() => {
    if (editor && finalContent) {
      editor.commands.setContent(finalContent);
    }
  }, [editor, finalContent]);

  const handleSaveDraft = async () => {
    if (!editor || !suratData) return;
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // Save the current editor HTML back, in case user made changes
      const currentHtml = editor.getHTML();
      
      await fetch(`${API_BASE}/surat/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ file_path: currentHtml })
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error('Gagal menyimpan:', e);
      alert('Gagal menyimpan draft surat.');
    } finally {
      setIsSaving(false);
    }
  };

  const addImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      if (input.files && input.files[0]) {
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
          const url = e.target?.result as string;
          editor?.chain().focus().setImage({ src: url }).run();
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const fontSizes = ['8px', '9px', '10px', '11px', '12px', '14px', '16px', '18px', '20px', '24px', '30px', '36px'];

  if (isLoading || !editor) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 gap-3">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="font-medium">Memuat draft surat...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/surat/riwayat" className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Preview & Edit Surat</h1>
            <p className="text-slate-500 mt-1">
              Draf Surat #{resolvedParams.id}
              {suratData?.perusahaan?.nama && <span> — {suratData.perusahaan.nama}</span>}
            </p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {saveSuccess && <span className="text-emerald-500 font-medium text-sm">✔ Tersimpan</span>}
          <button 
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm ${
              isSaving ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
            onClick={handleSaveDraft}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Menyimpan...' : 'Simpan Draft'}
          </button>
        </div>
      </div>

      <div className="border border-slate-200 bg-[#f3f2f1] rounded-xl overflow-hidden shadow-sm flex flex-col h-[calc(100vh-180px)] min-h-[800px]">
        {/* Main Toolbar */}
        <div className="bg-white px-2 py-2 border-b border-slate-200 flex flex-wrap gap-x-3 gap-y-2 items-center shrink-0 shadow-sm sticky top-0 z-10">
          
          {/* History */}
          <div className="flex gap-0.5 items-center bg-slate-50 p-1 rounded-md border border-slate-100">
            <button onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className="p-1.5 rounded hover:bg-slate-200 text-slate-700 disabled:opacity-30 transition-colors" title="Undo"><Undo className="w-4 h-4" /></button>
            <button onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className="p-1.5 rounded hover:bg-slate-200 text-slate-700 disabled:opacity-30 transition-colors" title="Redo"><Redo className="w-4 h-4" /></button>
          </div>

          <div className="w-px h-6 bg-slate-200"></div>

          {/* Typography */}
          <div className="flex gap-2 items-center bg-slate-50 p-1 rounded-md border border-slate-100">
            <div className="flex items-center gap-1">
              <select onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()} className="bg-white border border-slate-200 text-slate-700 text-xs rounded px-2 py-1 focus:outline-none w-16" value={editor.getAttributes('textStyle').fontSize || '14px'}>
                {fontSizes.map(size => (<option key={size} value={size}>{size}</option>))}
              </select>
            </div>
            <div className="flex gap-0.5">
              <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-1.5 rounded transition-all ${editor.isActive('bold') ? 'bg-slate-300 text-black shadow-inner' : 'hover:bg-slate-200 text-slate-700'}`} title="Bold"><Bold className="w-4 h-4" /></button>
              <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-1.5 rounded transition-all ${editor.isActive('italic') ? 'bg-slate-300 text-black shadow-inner' : 'hover:bg-slate-200 text-slate-700'}`} title="Italic"><Italic className="w-4 h-4" /></button>
              <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`p-1.5 rounded transition-all ${editor.isActive('underline') ? 'bg-slate-300 text-black shadow-inner' : 'hover:bg-slate-200 text-slate-700'}`} title="Underline"><UnderlineIcon className="w-4 h-4" /></button>
              <button onClick={() => editor.chain().focus().toggleStrike().run()} className={`p-1.5 rounded transition-all ${editor.isActive('strike') ? 'bg-slate-300 text-black shadow-inner' : 'hover:bg-slate-200 text-slate-700'}`} title="Strikethrough"><Strikethrough className="w-4 h-4" /></button>
            </div>
            <div className="flex gap-0.5 border-l border-slate-200 pl-1">
              <button onClick={() => editor.chain().focus().toggleSubscript().run()} className={`p-1.5 rounded transition-all ${editor.isActive('subscript') ? 'bg-slate-300 text-black shadow-inner' : 'hover:bg-slate-200 text-slate-700'}`} title="Subscript"><SubscriptIcon className="w-4 h-4" /></button>
              <button onClick={() => editor.chain().focus().toggleSuperscript().run()} className={`p-1.5 rounded transition-all ${editor.isActive('superscript') ? 'bg-slate-300 text-black shadow-inner' : 'hover:bg-slate-200 text-slate-700'}`} title="Superscript"><SuperscriptIcon className="w-4 h-4" /></button>
            </div>
            <div className="flex gap-1 border-l border-slate-200 pl-2">
              <label className="cursor-pointer p-1.5 rounded hover:bg-slate-200 text-slate-700 transition-colors flex items-center relative" title="Text Color">
                <Baseline className="w-4 h-4" />
                <input type="color" className="absolute opacity-0 w-0 h-0" onInput={(e) => editor.chain().focus().setColor((e.target as HTMLInputElement).value).run()} value={editor.getAttributes('textStyle').color || '#000000'} />
              </label>
              <label className="cursor-pointer p-1.5 rounded hover:bg-slate-200 text-slate-700 transition-colors flex items-center relative" title="Highlight Color">
                <Highlighter className="w-4 h-4" />
                <input type="color" className="absolute opacity-0 w-0 h-0" onInput={(e) => editor.chain().focus().toggleHighlight({ color: (e.target as HTMLInputElement).value }).run()} />
              </label>
            </div>
          </div>

          <div className="w-px h-6 bg-slate-200"></div>

          {/* Paragraph Formatting */}
          <div className="flex gap-2 items-center bg-slate-50 p-1 rounded-md border border-slate-100">
            <div className="flex gap-0.5">
              <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`p-1.5 rounded transition-all ${editor.isActive({ textAlign: 'left' }) ? 'bg-slate-300 text-black shadow-inner' : 'hover:bg-slate-200 text-slate-700'}`} title="Align Left"><AlignLeft className="w-4 h-4" /></button>
              <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`p-1.5 rounded transition-all ${editor.isActive({ textAlign: 'center' }) ? 'bg-slate-300 text-black shadow-inner' : 'hover:bg-slate-200 text-slate-700'}`} title="Align Center"><AlignCenter className="w-4 h-4" /></button>
              <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`p-1.5 rounded transition-all ${editor.isActive({ textAlign: 'right' }) ? 'bg-slate-300 text-black shadow-inner' : 'hover:bg-slate-200 text-slate-700'}`} title="Align Right"><AlignRight className="w-4 h-4" /></button>
              <button onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={`p-1.5 rounded transition-all ${editor.isActive({ textAlign: 'justify' }) ? 'bg-slate-300 text-black shadow-inner' : 'hover:bg-slate-200 text-slate-700'}`} title="Justify"><AlignJustify className="w-4 h-4" /></button>
            </div>
            <div className="flex gap-0.5 border-l border-slate-200 pl-1">
              <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-1.5 rounded transition-all ${editor.isActive('bulletList') ? 'bg-slate-300 text-black shadow-inner' : 'hover:bg-slate-200 text-slate-700'}`} title="Bullet List"><List className="w-4 h-4" /></button>
              <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-1.5 rounded transition-all ${editor.isActive('orderedList') ? 'bg-slate-300 text-black shadow-inner' : 'hover:bg-slate-200 text-slate-700'}`} title="Numbered List"><ListOrdered className="w-4 h-4" /></button>
            </div>
            <div className="flex gap-0.5 border-l border-slate-200 pl-1">
              <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`p-1.5 rounded transition-all ${editor.isActive('heading', { level: 1 }) ? 'bg-slate-300 text-black shadow-inner' : 'hover:bg-slate-200 text-slate-700'}`} title="Heading 1"><Heading1 className="w-4 h-4" /></button>
              <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-1.5 rounded transition-all ${editor.isActive('heading', { level: 2 }) ? 'bg-slate-300 text-black shadow-inner' : 'hover:bg-slate-200 text-slate-700'}`} title="Heading 2"><Heading2 className="w-4 h-4" /></button>
              <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`p-1.5 rounded transition-all ${editor.isActive('heading', { level: 3 }) ? 'bg-slate-300 text-black shadow-inner' : 'hover:bg-slate-200 text-slate-700'}`} title="Heading 3"><Heading3 className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="w-px h-6 bg-slate-200"></div>

          {/* Insert Elements */}
          <div className="flex gap-0.5 items-center bg-slate-50 p-1 rounded-md border border-slate-100">
            <button onClick={addImage} className="p-1.5 rounded hover:bg-slate-200 text-slate-700 transition-colors" title="Insert Image"><ImageIcon className="w-4 h-4" /></button>
          </div>

        </div>
        
        {/* Canvas Wrapper */}
        <div className="flex-1 overflow-y-auto overflow-x-auto flex justify-center py-8">
          <style jsx global>{`
            .ProseMirror {
              outline: none !important;
            }
            .ProseMirror p {
              margin: 0;
              min-height: 1.5em;
            }
            .ProseMirror table {
              border-collapse: collapse;
              table-layout: fixed;
              width: 100%;
              margin: 0;
              overflow: hidden;
            }
            .ProseMirror table td,
            .ProseMirror table th {
              min-width: 1em;
              border: 1px solid #000;
              padding: 3px 5px;
              vertical-align: top;
              box-sizing: border-box;
              position: relative;
            }
            .ProseMirror table th {
              font-weight: bold;
              text-align: left;
              background-color: #f1f5f9;
            }
            .ProseMirror .column-resize-handle {
              position: absolute;
              right: -2px;
              top: 0;
              bottom: -2px;
              width: 4px;
              background-color: #adf;
              pointer-events: none;
            }
            .ProseMirror p.is-editor-empty:first-child::before {
              color: #adb5bd;
              content: attr(data-placeholder);
              float: left;
              height: 0;
              pointer-events: none;
            }
            /* Kop Surat: zero margin for headings above hr */
            .ProseMirror h1,
            .ProseMirror h2 {
              margin-top: 0;
              margin-bottom: 0;
              line-height: 1.2;
            }
            /* Double-line separator for kop surat */
            .ProseMirror hr {
              border: none;
              border-top: 3px solid #000;
              border-bottom: 1px solid #000;
              height: 4px;
              margin: 6px 0 10px 0;
            }
            /* Borderless table cells for metadata section */
            .ProseMirror table td[style*="border: none"],
            .ProseMirror table th[style*="border: none"] {
              border: none !important;
            }
            .ProseMirror img {
              max-width: 100%;
            }
          `}</style>
          <div className="bg-white shadow-xl relative">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    </div>
  );
}
