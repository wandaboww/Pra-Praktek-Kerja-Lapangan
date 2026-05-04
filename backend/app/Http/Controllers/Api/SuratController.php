<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Surat;

class SuratController extends Controller
{
    public function index()
    {
        return response()->json(Surat::with(['perusahaan', 'siswas'])->orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'perusahaan_id' => 'required|exists:perusahaans,id',
            'nomor_surat' => 'required|string',
            'tanggal_surat' => 'required|date',
            'tahun_ajaran' => 'required|string',
            'siswa_ids' => 'required|array',
            'siswa_ids.*' => 'exists:siswas,id'
        ]);

        $surat = Surat::create([
            'perusahaan_id' => $validated['perusahaan_id'],
            'nomor_surat' => $validated['nomor_surat'],
            'tanggal_surat' => $validated['tanggal_surat'],
            'tahun_ajaran' => $validated['tahun_ajaran'],
            'status' => 'Draft'
        ]);

        $surat->siswas()->attach($validated['siswa_ids']);

        // Jika ada tujuan_surat, update perusahaan
        if ($request->has('tujuan_surat')) {
            $surat->perusahaan->update(['tujuan_surat' => $request->tujuan_surat]);
        }

        return response()->json($surat->load(['perusahaan', 'siswas']), 201);
    }

    public function show(string $id)
    {
        $surat = Surat::with(['perusahaan', 'siswas'])->find($id);
        if (!$surat) {
            return response()->json(['message' => 'Not found'], 404);
        }
        return response()->json($surat);
    }

    public function update(Request $request, string $id)
    {
        $surat = Surat::find($id);
        if (!$surat) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $validated = $request->validate([
            'nomor_surat' => 'sometimes|string',
            'tanggal_surat' => 'sometimes|date',
            'tahun_ajaran' => 'sometimes|string',
            'siswa_ids' => 'sometimes|array',
            'siswa_ids.*' => 'exists:siswas,id',
            'status' => 'sometimes|string'
        ]);

        $surat->update($request->only(['nomor_surat', 'tanggal_surat', 'tahun_ajaran', 'status']));

        if ($request->has('siswa_ids')) {
            $surat->siswas()->sync($validated['siswa_ids']);
        }

        if ($request->has('tujuan_surat')) {
            $surat->perusahaan->update(['tujuan_surat' => $request->tujuan_surat]);
        }

        return response()->json($surat->load(['perusahaan', 'siswas']));
    }

    public function destroy(string $id)
    {
        $surat = Surat::find($id);
        if ($surat) {
            $surat->delete();
        }
        return response()->json(['message' => 'Deleted successfully']);
    }
}
