'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { Extension } from '@tiptap/core';
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
  Save, 
  RefreshCw, 
  AlertCircle, 
  Bold, 
  Italic, 
  Underline as UnderlineIcon,
  Strikethrough,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify, 
  Image as ImageIcon, 
  Undo, 
  Redo, 
  Heading1, 
  Heading2,
  Heading3,
  Type,
  List,
  ListOrdered,
  Table as TableIcon,
  Highlighter,
  Baseline,
  Trash2,
  Columns,
  Rows,
  MoveVertical,
  FileText
} from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';

const LineHeight = Extension.create({
  name: 'lineHeight',
  addOptions() {
    return { types: ['paragraph', 'heading'], defaultLineHeight: '1.5' };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: this.options.defaultLineHeight,
            parseHTML: element => element.style.lineHeight || this.options.defaultLineHeight,
            renderHTML: attributes => {
              if (attributes.lineHeight === this.options.defaultLineHeight) return {};
              return { style: `line-height: ${attributes.lineHeight}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setLineHeight: (lineHeight: string) => ({ commands }: any) => {
        let applied = false;
        this.options.types.forEach((type: string) => {
          if (commands.updateAttributes(type, { lineHeight })) {
            applied = true;
          }
        });
        return applied;
      },
      unsetLineHeight: () => ({ commands }: any) => {
        let applied = false;
        this.options.types.forEach((type: string) => {
          if (commands.resetAttributes(type, 'lineHeight')) {
            applied = true;
          }
        });
        return applied;
      },
    };
  },
});

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    lineHeight: {
      setLineHeight: (lineHeight: string) => ReturnType;
      unsetLineHeight: () => ReturnType;
    }
  }
}

const PAPER_SIZES: Record<string, { label: string; width: number; height: number }> = {
  A4: { label: 'A4 (210×297mm)', width: 793, height: 1122 },
  F4: { label: 'F4 / Folio (215×330mm)', width: 812, height: 1247 },
};

export default function TemplateSurat() {
  const [initialContent, setInitialContent] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [paperSize, setPaperSize] = useState<string>('F4');
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
  const [imageMenuPos, setImageMenuPos] = useState<{x: number, y: number} | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const resizeRef = useRef<{startX: number; startY: number; startW: number; startH: number; handle: string} | null>(null);
  const dragRef = useRef<{startX: number; startY: number; origLeft: number; origTop: number} | null>(null);

  const currentPaper = PAPER_SIZES[paperSize];

  const HOSTNAME = typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1';
  const API_TEMPLATE = `http://${HOSTNAME}:8000/api/template`;

  const defaultContent = `
    <!-- ========== KOP SURAT ========== -->
    <table style="width: 100%; border: none; margin-bottom: 0;">
      <tbody>
        <tr>
          <td style="width: 15%; text-align: center; vertical-align: middle; border: none; padding: 0;">
            <p style="text-align: center; color: #94a3b8; font-size: 10px;"><em>[Logo Prov]</em></p>
          </td>
          <td style="width: 70%; text-align: center; vertical-align: middle; border: none; padding: 0;">
            <p style="text-align: center; margin: 0; font-size: 12px; text-transform: uppercase;">PEMERINTAH DAERAH PROVINSI JAWA BARAT</p>
            <p style="text-align: center; margin: 0; font-size: 12px; text-transform: uppercase;">DINAS PENDIDIKAN</p>
            <p style="text-align: center; margin: 0; font-size: 18px; text-transform: uppercase;"><strong>SMK NEGERI 1 CIOMAS</strong></p>
            <p style="text-align: center; margin: 0; font-size: 9px;">Jl Raya Laladon Desa Laladon, Kecamatan Ciomas, Kabupaten Bogor - Jawa Barat</p>
            <p style="text-align: center; margin: 0; font-size: 9px;">16610; Telpon (0251) 7520933</p>
            <p style="text-align: center; margin: 0; font-size: 9px;">e-mail : smkn1_ciomas@yahoo.co.id; web : www.smkn1ciomas.sch.id</p>
          </td>
          <td style="width: 15%; text-align: center; vertical-align: middle; border: none; padding: 0;">
            <p style="text-align: center; color: #94a3b8; font-size: 10px;"><em>[Logo SMK]</em></p>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- ========== GARIS PEMISAH (Double Line) ========== -->
    <hr />

    <!-- ========== ATRIBUT / METADATA SURAT ========== -->
    <table style="width: 60%; border: none; margin-top: 10px; margin-bottom: 10px;">
      <tbody>
        <tr>
          <td style="width: 80px; border: none; padding: 2px 0; vertical-align: top;">Nomor</td>
          <td style="width: 10px; border: none; padding: 2px 0; vertical-align: top;">:</td>
          <td style="border: none; padding: 2px 0; vertical-align: top;">{{NOMOR_SURAT}}</td>
        </tr>
        <tr>
          <td style="border: none; padding: 2px 0; vertical-align: top;">Lampiran</td>
          <td style="border: none; padding: 2px 0; vertical-align: top;">:</td>
          <td style="border: none; padding: 2px 0; vertical-align: top;">-</td>
        </tr>
        <tr>
          <td style="border: none; padding: 2px 0; vertical-align: top;">Perihal</td>
          <td style="border: none; padding: 2px 0; vertical-align: top;">:</td>
          <td style="border: none; padding: 2px 0; vertical-align: top;">Permohonan Tempat Praktik Kerja Lapangan (PKL)</td>
        </tr>
      </tbody>
    </table>

    <!-- ========== PENERIMA SURAT ========== -->
    <p><strong>Kepada Yth.</strong></p>
    <p><strong>{{PIMPINAN_PERUSAHAAN}}</strong></p>
    <p><strong>{{NAMA_PERUSAHAAN}}</strong></p>
    <p>&nbsp;</p>
    <p><strong>di</strong></p>
    <p style="margin-left: 40px;"><strong>Tempat</strong></p>

    <!-- ========== ISI SURAT ========== -->
    <p>&nbsp;</p>
    <p style="margin-left: 40px;">Dengan hormat,</p>
    <p>&nbsp;</p>
    <p style="text-align: justify;">Sehubungan dengan program kegiatan belajar mengajar murid-murid SMK Negeri 1 Ciomas Kabupaten Bogor tahun ajaran {{TAHUN_AJARAN}} tentang penyelenggaraan Praktek Kerja Lapangan (PKL), maka dengan ini kami mohon ijin untuk diperkenankan murid-murid kami dari program keahlian Pengembangan Perangkat Lunak dan Gim agar mengikuti PKL di perusahaan yang bapak /Ibu pimpin, dengan nama sebagai berikut :</p>

    <!-- ========== TABEL DAFTAR SISWA ========== -->
    <p style="text-align: center; color: #3b82f6; font-style: italic;">
      {{TABEL_DAFTAR_SISWA}}
    </p>

    <!-- ========== PENUTUP ========== -->
    <p style="text-align: justify;">Adapun periode waktu pengajuan pelaksanaan PKL apabila diperkenankan sekitar 6 bulan dimulai pada bulan Juli sampai dengan 31 Desember 2026. Untuk informasi lebih lanjut dapat menghubungi Kepala Program Keahlian Pengembangan Perangkat Lunak dan Gim, Bpk. Wanda Kurniawan, S.Kom dengan kontak No. Whatsapp: 0895612009900.</p>
    <p>&nbsp;</p>
    <p style="text-indent: 40px; text-align: justify;">Demikian permohonan ini kami sampaikan. Besar harapan kami agar Bapak/Ibu berkenan menerima siswa kami. Atas perhatian dan kerjasamanya, kami ucapkan terima kasih.</p>

    <!-- ========== TANDA TANGAN ========== -->
    <p>&nbsp;</p>
    <p>&nbsp;</p>
    <table style="width: 100%; border: none;">
      <tbody>
        <tr>
          <td style="width: 60%; border: none;"></td>
          <td style="width: 40%; text-align: center; border: none;">
            <p style="text-align: center;">Kepala Sekolah,</p>
            <p style="text-align: center;">&nbsp;</p>
            <p style="text-align: center;">&nbsp;</p>
            <p style="text-align: center;">&nbsp;</p>
            <p style="text-align: center;"><strong><u>Drs. H. Guru Teladan, M.Pd</u></strong></p>
            <p style="text-align: center;">NIP. 19700101 199512 1 001</p>
          </td>
        </tr>
      </tbody>
    </table>
  `;

  useEffect(() => {
    fetch(API_TEMPLATE)
      .then(res => res.json())
      .then(data => {
        if (data && data.content) {
          setInitialContent(data.content);
        } else {
          setInitialContent(defaultContent);
        }
      })
      .catch(err => {
        console.error(err);
        setInitialContent(defaultContent);
      });
  }, []);

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
      LineHeight,
    ],
    content: initialContent,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'mx-auto focus:outline-none bg-white p-12 shadow-lg border border-slate-300',
        style: 'font-family: "Times New Roman", Times, serif; line-height: 1.5; color: black;'
      },
    },
  });

  // Update content when initialContent is loaded
  useEffect(() => {
    if (editor && initialContent) {
      editor.commands.setContent(initialContent);
    }
  }, [initialContent, editor]);

  const handleSave = async () => {
    if (!editor) return;
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const htmlContent = editor.getHTML();
      await fetch(API_TEMPLATE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ content: htmlContent })
      });
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert("Gagal menyimpan template");
      console.error(err);
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

  // Image click handler for wrapping/positioning
  const handleEditorClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG' && !target.classList.contains('resize-handle-img')) {
      e.preventDefault();
      const img = target as HTMLImageElement;
      setSelectedImage(img);
      const rect = img.getBoundingClientRect();
      setImageMenuPos({ x: rect.left, y: rect.top - 50 });

      // Add visual selection
      document.querySelectorAll('.ProseMirror img').forEach(i => i.classList.remove('img-selected'));
      img.classList.add('img-selected');

      // Remove old handles
      document.querySelectorAll('.img-resize-handle').forEach(h => h.remove());

      // Create resize handles
      const parent = img.parentElement;
      if (parent) {
        parent.style.position = 'relative';
        parent.style.display = 'inline-block';
        const handles = ['nw', 'ne', 'sw', 'se'];
        handles.forEach(pos => {
          const handle = document.createElement('div');
          handle.className = `img-resize-handle img-resize-${pos}`;
          handle.dataset.handle = pos;
          parent.appendChild(handle);
        });
      }
    } else if (!target.classList.contains('img-resize-handle') && !target.closest('.image-toolbar-floating')) {
      setSelectedImage(null);
      setImageMenuPos(null);
      document.querySelectorAll('.ProseMirror img').forEach(i => i.classList.remove('img-selected'));
      document.querySelectorAll('.img-resize-handle').forEach(h => h.remove());
    }
  }, []);

  // Resize mouse handlers
  const handleResizeStart = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('img-resize-handle') && selectedImage) {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      resizeRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startW: selectedImage.offsetWidth,
        startH: selectedImage.offsetHeight,
        handle: target.dataset.handle || 'se'
      };
    }
  }, [selectedImage]);

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !resizeRef.current || !selectedImage) return;
    e.preventDefault();

    const { startX, startY, startW, startH, handle } = resizeRef.current;
    let dx = e.clientX - startX;
    let dy = e.clientY - startY;

    // Maintain aspect ratio
    const aspect = startW / startH;

    let newW = startW;
    let newH = startH;

    if (handle === 'se') {
      newW = Math.max(30, startW + dx);
      newH = newW / aspect;
    } else if (handle === 'sw') {
      newW = Math.max(30, startW - dx);
      newH = newW / aspect;
    } else if (handle === 'ne') {
      newW = Math.max(30, startW + dx);
      newH = newW / aspect;
    } else if (handle === 'nw') {
      newW = Math.max(30, startW - dx);
      newH = newW / aspect;
    }

    selectedImage.style.width = `${Math.round(newW)}px`;
    selectedImage.style.height = `${Math.round(newH)}px`;

    // Update toolbar position
    const rect = selectedImage.getBoundingClientRect();
    setImageMenuPos({ x: rect.left, y: rect.top - 50 });
  }, [isResizing, selectedImage]);

  const handleResizeEnd = useCallback(() => {
    if (isResizing) {
      setIsResizing(false);
      resizeRef.current = null;
    }
  }, [isResizing]);

  // Drag to reposition
  const handleDragStart = useCallback((e: MouseEvent) => {
    if (!selectedImage || isResizing) return;
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG' && target.classList.contains('img-selected')) {
      e.preventDefault();
      setIsDragging(true);

      // Make image absolutely positioned if not already floated
      const computedStyle = window.getComputedStyle(selectedImage);
      if (computedStyle.float === 'none' || !computedStyle.float) {
        if (computedStyle.position !== 'absolute') {
          const rect = selectedImage.getBoundingClientRect();
          const parentRect = selectedImage.parentElement?.getBoundingClientRect();
          selectedImage.style.position = 'relative';
          selectedImage.style.left = selectedImage.style.left || '0px';
          selectedImage.style.top = selectedImage.style.top || '0px';
        }
      }

      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        origLeft: parseInt(selectedImage.style.left || '0'),
        origTop: parseInt(selectedImage.style.top || '0')
      };
    }
  }, [selectedImage, isResizing]);

  const handleDragMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragRef.current || !selectedImage) return;
    e.preventDefault();

    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;

    selectedImage.style.left = `${dragRef.current.origLeft + dx}px`;
    selectedImage.style.top = `${dragRef.current.origTop + dy}px`;

    const rect = selectedImage.getBoundingClientRect();
    setImageMenuPos({ x: rect.left, y: rect.top - 50 });
  }, [isDragging, selectedImage]);

  const handleDragEnd = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      dragRef.current = null;
    }
  }, [isDragging]);

  // Attach event listeners
  useEffect(() => {
    const editorEl = document.querySelector('.ProseMirror');
    if (editorEl) {
      editorEl.addEventListener('click', handleEditorClick as EventListener);
      editorEl.addEventListener('mousedown', handleResizeStart as EventListener);
      editorEl.addEventListener('mousedown', handleDragStart as EventListener);
    }
    document.addEventListener('mousemove', handleResizeMove as EventListener);
    document.addEventListener('mouseup', handleResizeEnd as EventListener);
    document.addEventListener('mousemove', handleDragMove as EventListener);
    document.addEventListener('mouseup', handleDragEnd as EventListener);

    return () => {
      if (editorEl) {
        editorEl.removeEventListener('click', handleEditorClick as EventListener);
        editorEl.removeEventListener('mousedown', handleResizeStart as EventListener);
        editorEl.removeEventListener('mousedown', handleDragStart as EventListener);
      }
      document.removeEventListener('mousemove', handleResizeMove as EventListener);
      document.removeEventListener('mouseup', handleResizeEnd as EventListener);
      document.removeEventListener('mousemove', handleDragMove as EventListener);
      document.removeEventListener('mouseup', handleDragEnd as EventListener);
    };
  }, [editor, handleEditorClick, handleResizeStart, handleResizeMove, handleResizeEnd, handleDragStart, handleDragMove, handleDragEnd]);

  const setImageWrap = (mode: 'inline' | 'left' | 'right' | 'center') => {
    if (!selectedImage) return;
    // Reset positioning styles
    selectedImage.style.float = '';
    selectedImage.style.display = '';
    selectedImage.style.marginLeft = '';
    selectedImage.style.marginRight = '';
    selectedImage.style.margin = '';
    selectedImage.style.position = '';
    selectedImage.style.left = '';
    selectedImage.style.top = '';

    switch (mode) {
      case 'inline':
        selectedImage.style.display = 'inline';
        selectedImage.style.float = 'none';
        break;
      case 'left':
        selectedImage.style.float = 'left';
        selectedImage.style.marginRight = '12px';
        selectedImage.style.marginBottom = '8px';
        break;
      case 'right':
        selectedImage.style.float = 'right';
        selectedImage.style.marginLeft = '12px';
        selectedImage.style.marginBottom = '8px';
        break;
      case 'center':
        selectedImage.style.display = 'block';
        selectedImage.style.marginLeft = 'auto';
        selectedImage.style.marginRight = 'auto';
        break;
    }
  };

  const setImageSize = (width: string) => {
    if (!selectedImage) return;
    selectedImage.style.width = width;
    selectedImage.style.height = 'auto';
    // Update handle positions
    const rect = selectedImage.getBoundingClientRect();
    setImageMenuPos({ x: rect.left, y: rect.top - 50 });
  };

  const fontSizes = ['8px', '9px', '10px', '11px', '12px', '14px', '16px', '18px', '20px', '24px', '30px', '36px'];

  if (!editor || !initialContent) {
    return <div className="p-8 text-center text-slate-500 font-bold">Memuat editor dan template...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Pengaturan Template Surat</h1>
          <p className="text-slate-500 mt-1">Editor WYSIWYG untuk format surat dinamis</p>
        </div>
        <div className="flex gap-3 items-center">
          {/* Paper Size Dropdown */}
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-lg border border-slate-200">
            <FileText className="w-4 h-4 text-slate-500" />
            <select
              value={paperSize}
              onChange={(e) => setPaperSize(e.target.value)}
              className="bg-transparent text-slate-700 text-sm font-medium focus:outline-none cursor-pointer"
              title="Ukuran Kertas"
            >
              {Object.entries(PAPER_SIZES).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </div>
          {saveSuccess && <span className="text-emerald-500 font-medium text-sm">✔ Tersimpan</span>}
          <button 
            onClick={() => editor.commands.setContent(defaultContent)}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Reset Default
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm ${
              isSaving ? 'bg-blue-400 cursor-not-allowed text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Menyimpan...' : 'Simpan Template'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Kolom Variabel */}
        <div className="xl:col-span-1 space-y-4">
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
            <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Variabel Sistem
            </h3>
            <p className="text-sm text-blue-700 mb-4 leading-relaxed">
              Klik atau ketik variabel ini di dalam surat. Sistem akan menggantinya secara otomatis sesuai data.
            </p>
            <div className="flex flex-col gap-2 text-xs">
              {[
                { var: '{{NOMOR_SURAT}}', desc: 'No. urut surat' },
                { var: '{{TANGGAL_SURAT}}', desc: 'Tgl. saat ini' },
                { var: '{{TAHUN_AJARAN}}', desc: 'Tahun aktif' },
                { var: '{{NAMA_PERUSAHAAN}}', desc: 'Nama industri' },
                { var: '{{PIMPINAN_PERUSAHAAN}}', desc: 'Nama pimpinan' },
                { var: '{{ALAMAT_PERUSAHAAN}}', desc: 'Alamat lengkap' },
                { var: '{{TABEL_DAFTAR_SISWA}}', desc: 'Tabel daftar murid' },
              ].map(item => (
                <div key={item.var} className="bg-white border border-blue-200 p-2 rounded hover:shadow-md cursor-pointer transition-shadow" onClick={() => editor.chain().focus().insertContent(item.var).run()}>
                  <code className="text-blue-700 font-bold block mb-1">{item.var}</code>
                  <span className="text-slate-500">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Editor Area (Word-like) */}
        <div className="xl:col-span-4 border border-slate-200 bg-[#f3f2f1] rounded-xl overflow-hidden shadow-sm flex flex-col h-[calc(100vh-200px)] min-h-[800px]">
          
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
              <div className="flex items-center gap-1 border-l border-slate-200 pl-1">
                <MoveVertical className="w-4 h-4 text-slate-400" />
                <select 
                  onChange={(e) => editor.chain().focus().setLineHeight(e.target.value).run()} 
                  className="bg-white border border-slate-200 text-slate-700 text-xs rounded px-2 py-1 focus:outline-none w-14" 
                  value={editor.getAttributes('paragraph').lineHeight || '1.5'}
                  title="Line Spacing"
                >
                  <option value="1.0">1.0</option>
                  <option value="1.15">1.15</option>
                  <option value="1.5">1.5</option>
                  <option value="2.0">2.0</option>
                  <option value="2.5">2.5</option>
                </select>
              </div>
              <div className="flex gap-0.5 border-l border-slate-200 pl-1">
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
              <button onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} className="p-1.5 rounded hover:bg-slate-200 text-slate-700 transition-colors" title="Insert Table"><TableIcon className="w-4 h-4" /></button>
            </div>
            
            {/* Table Controls (Shown only if table active) */}
            {editor.isActive('table') && (
              <>
                <div className="w-px h-6 bg-slate-200"></div>
                <div className="flex gap-0.5 items-center bg-blue-50 p-1 rounded-md border border-blue-200">
                  <button onClick={() => editor.chain().focus().addRowAfter().run()} className="p-1.5 rounded hover:bg-blue-200 text-blue-700 transition-colors text-xs flex items-center" title="Add Row Below"><Rows className="w-4 h-4 mr-1"/>+Row</button>
                  <button onClick={() => editor.chain().focus().addColumnAfter().run()} className="p-1.5 rounded hover:bg-blue-200 text-blue-700 transition-colors text-xs flex items-center border-l border-blue-200 pl-2" title="Add Col Right"><Columns className="w-4 h-4 mr-1"/>+Col</button>
                  <button onClick={() => editor.chain().focus().deleteRow().run()} className="p-1.5 rounded hover:bg-red-100 text-red-600 transition-colors text-xs flex items-center border-l border-blue-200 pl-2" title="Delete Row"><Trash2 className="w-4 h-4 mr-1"/>Row</button>
                  <button onClick={() => editor.chain().focus().deleteColumn().run()} className="p-1.5 rounded hover:bg-red-100 text-red-600 transition-colors text-xs flex items-center" title="Delete Column"><Trash2 className="w-4 h-4 mr-1"/>Col</button>
                  <button onClick={() => editor.chain().focus().deleteTable().run()} className="p-1.5 rounded hover:bg-red-100 text-red-600 transition-colors text-xs flex items-center font-bold" title="Delete Table">Del Table</button>
                </div>
              </>
            )}

          </div>

          {/* Floating Image Toolbar */}
          {selectedImage && imageMenuPos && (
            <div 
              className="fixed z-50 bg-white border border-slate-200 shadow-xl rounded-lg p-2 flex gap-1 items-center image-toolbar-floating"
              style={{ left: Math.max(10, imageMenuPos.x), top: Math.max(10, imageMenuPos.y) }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <span className="text-xs text-slate-500 font-medium px-1">Wrap:</span>
              <button onClick={() => setImageWrap('inline')} className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded transition-colors" title="Inline">Inline</button>
              <button onClick={() => setImageWrap('left')} className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded transition-colors" title="Float Left">⬅ Left</button>
              <button onClick={() => setImageWrap('right')} className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded transition-colors" title="Float Right">Right ➡</button>
              <button onClick={() => setImageWrap('center')} className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded transition-colors" title="Center">Center</button>
              <div className="w-px h-5 bg-slate-200 mx-1"></div>
              <span className="text-xs text-slate-500 font-medium px-1">Size:</span>
              <button onClick={() => setImageSize('60px')} className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded transition-colors">60</button>
              <button onClick={() => setImageSize('80px')} className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded transition-colors">80</button>
              <button onClick={() => setImageSize('120px')} className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded transition-colors">120</button>
              <button onClick={() => setImageSize('200px')} className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded transition-colors">200</button>
              <button onClick={() => setImageSize('100%')} className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded transition-colors">Full</button>
              <div className="w-px h-5 bg-slate-200 mx-1"></div>
              {selectedImage && (
                <span className="text-[10px] text-slate-400 font-mono px-1">
                  {selectedImage.offsetWidth}×{selectedImage.offsetHeight}
                </span>
              )}
            </div>
          )}
          
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
              /* Floating toolbar should not interfere */
              .image-toolbar-floating {
                user-select: none;
              }
              /* Resize handles */
              .img-resize-handle {
                position: absolute;
                width: 10px;
                height: 10px;
                background: #3b82f6;
                border: 2px solid white;
                border-radius: 2px;
                z-index: 20;
                box-shadow: 0 1px 3px rgba(0,0,0,0.3);
              }
              .img-resize-nw {
                top: -5px;
                left: -5px;
                cursor: nw-resize;
              }
              .img-resize-ne {
                top: -5px;
                right: -5px;
                cursor: ne-resize;
              }
              .img-resize-sw {
                bottom: -5px;
                left: -5px;
                cursor: sw-resize;
              }
              .img-resize-se {
                bottom: -5px;
                right: -5px;
                cursor: se-resize;
              }
              /* Selected image styling */
              .ProseMirror img.img-selected {
                outline: 2px solid #3b82f6;
                outline-offset: 2px;
                cursor: move;
              }
              /* Image styling */
              .ProseMirror img {
                max-width: 100%;
                cursor: pointer;
                transition: outline 0.15s;
              }
              .ProseMirror img:hover {
                outline: 2px dashed #93c5fd;
                outline-offset: 2px;
              }
              .ProseMirror img.ProseMirror-selectednode {
                outline: 2px solid #3b82f6;
                outline-offset: 2px;
              }
            `}</style>
            <div 
              className="bg-white shadow-xl relative transition-all duration-300"
              style={{ width: `${currentPaper.width}px`, minHeight: `${currentPaper.height}px` }}
            >
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
