<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\StoreController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\InventoryMovementController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Categorías
    Route::resource('categories', CategoryController::class)->except(['create', 'edit']);

    // Productos
    Route::patch('products/{product}/toggle-status', [ProductController::class, 'toggleStatus'])->name('products.toggle-status');
    Route::patch('products/{product}/toggle-stored', [ProductController::class, 'toggleStored'])->name('products.toggle-stored');
    Route::resource('products', ProductController::class)->except(['show', 'create', 'edit']);
    Route::patch('store/{product}/toggle-stored', [StoreController::class, 'toggleStored'])->name('store.toggle-stored');
    Route::resource('store', StoreController::class)->except(['show', 'create', 'edit']);

    // Ventas
    Route::resource('sales', SaleController::class);

    // Reportes
    Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('/', [ReportController::class, 'index'])->name('index');
        Route::get('/sales', [ReportController::class, 'sales'])->name('sales');
        Route::get('/products', [ReportController::class, 'products'])->name('products');
        Route::get('/inventory', [ReportController::class, 'inventory'])->name('inventory');
    });

    // Movimientos de inventario
    Route::get('inventory', [InventoryMovementController::class, 'index'])->name('inventory.index');
    Route::post('inventory/movements', [InventoryMovementController::class, 'store'])->name('inventory.store');
    Route::put('inventory/movements/{movement}', [InventoryMovementController::class, 'update'])->name('inventory.update');
    Route::delete('inventory/movements/{movement}', [InventoryMovementController::class, 'destroy'])->name('inventory.destroy');

    // Gestión de usuarios (solo admin)
    Route::middleware('role:Administrador')->group(function () {
        Route::resource('users', UserController::class)->except(['create', 'show', 'edit']);
    });
});

require __DIR__.'/settings.php';
