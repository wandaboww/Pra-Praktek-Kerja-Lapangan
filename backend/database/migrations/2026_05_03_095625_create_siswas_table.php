<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('siswas', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->string('kelas');
            $table->string('program_keahlian');
            $table->string('portofolio')->nullable();
            $table->enum('status', ['Belum PKL', 'Proses Pengajuan', 'Sudah PKL'])->default('Belum PKL');
            $table->string('skillset')->nullable();
            $table->boolean('laptop')->default(false);
            $table->boolean('luar_kota')->default(false);
            $table->boolean('kos')->default(false);
            $table->boolean('dbs')->default(false);
            $table->foreignId('perusahaan_id')->nullable()->constrained('perusahaans')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('siswas');
    }
};
