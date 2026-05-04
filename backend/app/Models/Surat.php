<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Surat extends Model
{
    protected $guarded = [];

    public function perusahaan()
    {
        return $this->belongsTo(Perusahaan::class);
    }

    public function siswas()
    {
        return $this->belongsToMany(Siswa::class, 'surat_siswa');
    }
}
