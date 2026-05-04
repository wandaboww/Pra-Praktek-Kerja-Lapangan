<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\SiswaController;
use App\Http\Controllers\Api\PerusahaanController;
use App\Http\Controllers\Api\PemetaanController;
use App\Http\Controllers\Api\SuratController;

use App\Http\Controllers\TemplateController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/siswa/bulk-delete', [SiswaController::class, 'bulkDestroy']);
Route::apiResource('siswa', SiswaController::class);
Route::post('/perusahaan/bulk-delete', [PerusahaanController::class, 'bulkDestroy']);
Route::post('/perusahaan/bulk-import', [PerusahaanController::class, 'bulkStore']);
Route::apiResource('perusahaan', PerusahaanController::class);
Route::apiResource('pemetaan', PemetaanController::class);

Route::get('/template', [TemplateController::class, 'index']);
Route::post('/template', [TemplateController::class, 'store']);
Route::apiResource('surat', SuratController::class);
