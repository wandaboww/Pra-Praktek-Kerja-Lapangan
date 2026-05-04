<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Perusahaan;
use Illuminate\Http\Request;

class PerusahaanController extends Controller
{
    public function index()
    {
        $perusahaan = Perusahaan::withCount('siswas')->get();
        return response()->json($perusahaan);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'bidang' => 'nullable|string|max:255',
            'daerah' => 'nullable|string|max:255',
            'aktivitas' => 'nullable|string|max:255',
            'kuota' => 'required|integer',
            'kontak' => 'nullable|string|max:255',
            'alamat' => 'nullable|string',
            'tujuan_surat' => 'nullable|string|max:255',
            'pic' => 'nullable|string|max:255',
            'status' => 'nullable|string|max:255',
        ]);

        $perusahaan = Perusahaan::create($validated);
        return response()->json(['message' => 'Data perusahaan berhasil ditambahkan', 'data' => $perusahaan], 201);
    }

    public function show($id)
    {
        $perusahaan = Perusahaan::with('siswas')->findOrFail($id);
        return response()->json($perusahaan);
    }

    public function update(Request $request, $id)
    {
        $perusahaan = Perusahaan::findOrFail($id);
        
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'bidang' => 'nullable|string|max:255',
            'daerah' => 'nullable|string|max:255',
            'aktivitas' => 'nullable|string|max:255',
            'kuota' => 'required|integer',
            'kontak' => 'nullable|string|max:255',
            'alamat' => 'nullable|string',
            'tujuan_surat' => 'nullable|string|max:255',
            'pic' => 'nullable|string|max:255',
            'status' => 'nullable|string|max:255',
        ]);

        $perusahaan->update($validated);
        return response()->json(['message' => 'Data perusahaan berhasil diperbarui', 'data' => $perusahaan]);
    }

    public function destroy($id)
    {
        $perusahaan = Perusahaan::findOrFail($id);
        $perusahaan->delete();
        return response()->json(['message' => 'Data perusahaan berhasil dihapus']);
    }

    public function bulkDestroy(Request $request)
    {
        $request->validate(['ids' => 'required|array', 'ids.*' => 'integer']);
        Perusahaan::whereIn('id', $request->ids)->delete();
        return response()->json(['message' => count($request->ids) . ' data perusahaan berhasil dihapus']);
    }

    public function bulkStore(Request $request)
    {
        $perusahaans = $request->perusahaans;
        if (!is_array($perusahaans)) {
            return response()->json(['message' => 'Invalid data format'], 400);
        }

        $inserted = 0;
        $failed = 0;

        foreach ($perusahaans as $p) {
            try {
                // Ensure length fits in string columns (max 255)
                $nama = isset($p['nama']) ? substr($p['nama'], 0, 255) : '';
                if (empty($nama)) continue;

                Perusahaan::create([
                    'nama' => $nama,
                    'bidang' => isset($p['bidang']) ? substr($p['bidang'], 0, 255) : null,
                    'daerah' => isset($p['daerah']) ? substr($p['daerah'], 0, 255) : null,
                    'aktivitas' => isset($p['aktivitas']) ? substr($p['aktivitas'], 0, 255) : null,
                    'kuota' => isset($p['kuota']) ? (int)$p['kuota'] : 0,
                    'kontak' => isset($p['kontak']) ? substr((string)$p['kontak'], 0, 255) : null,
                    'alamat' => isset($p['alamat']) ? $p['alamat'] : null,
                    'tujuan_surat' => isset($p['tujuan_surat']) ? substr($p['tujuan_surat'], 0, 255) : 'Pimpinan',
                    'pic' => isset($p['pic']) ? substr($p['pic'], 0, 255) : null,
                    'status' => isset($p['status']) ? substr($p['status'], 0, 255) : 'Aktif',
                ]);
                $inserted++;
            } catch (\Exception $e) {
                // Log or just ignore failed row
                $failed++;
            }
        }

        return response()->json([
            'message' => 'Proses import selesai.',
            'inserted' => $inserted,
            'failed' => $failed
        ], 201);
    }
}
