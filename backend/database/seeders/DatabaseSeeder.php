<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Data Perusahaan
        $p1 = \App\Models\Perusahaan::create([
            'nama' => 'PT Teknologi Nusantara',
            'bidang' => 'IT & Software',
            'daerah' => 'Jakarta Selatan',
            'aktivitas' => 'Software Engineering',
            'kuota' => 5,
            'kontak' => '08123456789',
            'pic' => 'Bapak Budi Santoso',
            'tujuan_surat' => 'HRD',
            'status' => 'Aktif',
            'alamat' => 'Jl. Sudirman No. 12, Jakarta Selatan, DKI Jakarta'
        ]);
        $p2 = \App\Models\Perusahaan::create([
            'nama' => 'CV Kreatif Maju',
            'bidang' => 'Desain Grafis',
            'daerah' => 'Bandung',
            'aktivitas' => 'Creative Design',
            'kuota' => 3,
            'kontak' => '08987654321',
            'pic' => 'Ibu Siti Aminah',
            'tujuan_surat' => 'Direktur',
            'status' => 'Aktif',
            'alamat' => 'Jl. Pahlawan No. 45, Bandung, Jawa Barat'
        ]);

        // Data Siswa
        \App\Models\Siswa::create([
            'nama' => 'Ahmad Fauzi',
            'kelas' => '12 PPLG 1',
            'program_keahlian' => 'Pengembangan Perangkat Lunak dan Gim',
            'status' => 'Proses Pengajuan',
            'perusahaan_id' => $p1->id
        ]);
        \App\Models\Siswa::create([
            'nama' => 'Bunga Citra',
            'kelas' => '12 PPLG 2',
            'program_keahlian' => 'Pengembangan Perangkat Lunak dan Gim',
            'status' => 'Belum PKL',
        ]);
        \App\Models\Siswa::create([
            'nama' => 'Candra Wijaya',
            'kelas' => '12 PPLG 3',
            'program_keahlian' => 'Pengembangan Perangkat Lunak dan Gim',
            'status' => 'Sudah PKL',
            'perusahaan_id' => $p2->id
        ]);
    }
}
