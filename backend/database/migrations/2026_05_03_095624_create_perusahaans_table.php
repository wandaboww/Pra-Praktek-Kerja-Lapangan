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
        Schema::create('perusahaans', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->string('bidang')->nullable();
            $table->string('daerah')->nullable();
            $table->string('aktivitas')->nullable();
            $table->integer('kuota')->default(0);
            $table->string('kontak')->nullable();
            $table->text('alamat')->nullable();
            $table->string('tujuan_surat')->default('Pimpinan');
            $table->string('pic')->nullable();
            $table->string('status')->default('Aktif');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('perusahaans');
    }
};
