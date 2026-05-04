<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Siswa;
use Illuminate\Http\Request;

class SiswaController extends Controller
{
    public function index()
    {
        $siswas = Siswa::with('perusahaan')->get();
        return response()->json($siswas);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'kelas' => 'required|string|max:255',
            'program_keahlian' => 'required|string|max:255',
            'portofolio' => 'nullable|string|max:255',
            'status' => 'required|in:Belum PKL,Proses Pengajuan,Sudah PKL',
            'skillset' => 'nullable|string|max:255',
            'laptop' => 'boolean',
            'luar_kota' => 'boolean',
            'kos' => 'boolean',
            'dbs' => 'boolean',
            'perusahaan_id' => 'nullable|exists:perusahaans,id',
        ]);

        $siswa = Siswa::create($validated);
        return response()->json(['message' => 'Data siswa berhasil ditambahkan', 'data' => $siswa], 201);
    }

    public function show($id)
    {
        $siswa = Siswa::with('perusahaan')->findOrFail($id);
        return response()->json($siswa);
    }

    public function update(Request $request, $id)
    {
        $siswa = Siswa::findOrFail($id);
        
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'kelas' => 'required|string|max:255',
            'program_keahlian' => 'required|string|max:255',
            'portofolio' => 'nullable|string|max:255',
            'status' => 'required|in:Belum PKL,Proses Pengajuan,Sudah PKL',
            'skillset' => 'nullable|string|max:255',
            'laptop' => 'boolean',
            'luar_kota' => 'boolean',
            'kos' => 'boolean',
            'dbs' => 'boolean',
            'perusahaan_id' => 'nullable|exists:perusahaans,id',
        ]);

        $siswa->update($validated);
        return response()->json(['message' => 'Data siswa berhasil diperbarui', 'data' => $siswa]);
    }

    public function destroy($id)
    {
        $siswa = Siswa::findOrFail($id);
        $siswa->delete();
        return response()->json(['message' => 'Data siswa berhasil dihapus']);
    }

    public function bulkDestroy(Request $request)
    {
        $request->validate(['ids' => 'required|array', 'ids.*' => 'integer']);
        Siswa::whereIn('id', $request->ids)->delete();
        return response()->json(['message' => count($request->ids) . ' data siswa berhasil dihapus']);
    }
}
