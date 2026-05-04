<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Siswa;
use Illuminate\Http\Request;

class PemetaanController extends Controller
{
    /**
     * Update the mapping of a student to a company.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'siswa_id' => 'required|exists:siswas,id',
            'perusahaan_id' => 'required|exists:perusahaans,id',
        ]);

        $siswa = Siswa::findOrFail($validated['siswa_id']);
        $siswa->update([
            'perusahaan_id' => $validated['perusahaan_id'],
            'status' => 'Proses Pengajuan'
        ]);

        return response()->json([
            'message' => 'Pemetaan berhasil dilakukan', 
            'data' => $siswa->load('perusahaan')
        ]);
    }

    /**
     * Remove the mapping of a student.
     */
    public function destroy($siswa_id)
    {
        $siswa = Siswa::findOrFail($siswa_id);
        $siswa->update([
            'perusahaan_id' => null,
            'status' => 'Belum PKL'
        ]);

        return response()->json([
            'message' => 'Pemetaan berhasil dibatalkan',
            'data' => $siswa
        ]);
    }
}
