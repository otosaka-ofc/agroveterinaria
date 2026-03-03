<?php

namespace App\Http\Controllers;

use App\Models\InventoryMovement;
use App\Models\Product;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class InventoryMovementController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->only(['type', 'product_id', 'from', 'to', 'search', 'low_stock']);
        $filters['low_stock'] = $request->boolean('low_stock');

        $baseQuery = InventoryMovement::query()
            ->when($filters['type'] ?? null, fn ($q, $type) => $q->where('type', $type))
            ->when($filters['product_id'] ?? null, fn ($q, $productId) => $q->where('product_id', $productId))
            ->when($filters['from'] ?? null, fn ($q, $from) => $q->whereDate('created_at', '>=', $from))
            ->when($filters['to'] ?? null, fn ($q, $to) => $q->whereDate('created_at', '<=', $to))
            ->when($filters['search'] ?? null, function ($q, $search) {
                $q->whereHas('product', function ($productQuery) use ($search) {
                    $productQuery
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%");
                });
            })
            ->when($filters['low_stock'] ?? false, function ($q) {
                $q->whereHas('product', function ($productQuery) {
                    $productQuery->whereColumn('stock', '<=', 'min_stock');
                });
            });

        $summary = (clone $baseQuery)
            ->selectRaw("COALESCE(SUM(CASE WHEN type = 'entry' THEN quantity ELSE 0 END), 0) as entries")
            ->selectRaw("COALESCE(SUM(CASE WHEN type = 'exit' THEN quantity ELSE 0 END), 0) as exits")
            ->selectRaw("COALESCE(SUM(CASE WHEN type = 'adjustment' THEN quantity ELSE 0 END), 0) as adjustments")
            ->first();

        /** @var LengthAwarePaginator $movements */
        $movements = (clone $baseQuery)
            ->with(['product:id,name,sku,stock,min_stock', 'user:id,name'])
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $products = Product::query()
            ->select('id', 'name', 'sku', 'stock', 'min_stock')
            ->orderBy('name')
            ->get();

        return Inertia::render('Inventory/Index', [
            'movements' => $movements,
            'products' => $products,
            'filters' => $filters,
            'summary' => [
                'entries' => (int) ($summary->entries ?? 0),
                'exits' => (int) ($summary->exits ?? 0),
                'adjustments' => (int) ($summary->adjustments ?? 0),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'type'       => ['required', 'in:entry,exit,adjustment'],
            'quantity'   => ['required', 'numeric', 'not_in:0'],
            'reason'     => ['nullable', 'string', 'max:255'],
        ]);

        $product       = Product::findOrFail($data['product_id']);
        $previousStock = (float) $product->stock;
        $quantity      = (float) $data['quantity'];
        $type          = $data['type'];

        if ($type !== 'adjustment' && $quantity <= 0) {
            return back()->withErrors(['quantity' => 'La cantidad debe ser mayor a 0.']);
        }

        $delta = match ($type) {
            'entry'      => $quantity,
            'exit'       => -$quantity,
            'adjustment' => $quantity,
        };

        $newStock = $previousStock + $delta;

        if ($newStock < 0) {
            return back()->withErrors([
                'quantity' => 'No hay stock suficiente para realizar la salida.',
            ]);
        }

        DB::transaction(function () use ($product, $type, $quantity, $previousStock, $newStock, $data) {
            $product->update(['stock' => $newStock]);

            InventoryMovement::create([
                'product_id'     => $product->id,
                'type'           => $type,
                'quantity'       => $quantity,
                'previous_stock' => $previousStock,
                'new_stock'      => $newStock,
                'reason'         => $data['reason'] ?? null,
                'user_id'        => Auth::id(),
                'sale_id'        => $data['sale_id'] ?? null,
            ]);
        });

        return back()->with('success', 'Movimiento registrado y stock actualizado.');
    }

    public function update(Request $request, InventoryMovement $movement): RedirectResponse
    {
        // Los movimientos generados automáticamente por una venta no se pueden editar
        if ($movement->sale_id !== null) {
            return back()->with('error', 'No se pueden editar movimientos generados por ventas.');
        }

        $data = $request->validate([
            'type'     => ['required', 'in:entry,exit,adjustment'],
            'quantity' => ['required', 'numeric', 'not_in:0'],
            'reason'   => ['nullable', 'string', 'max:255'],
        ]);

        $product     = $movement->product;
        $newQuantity = (float) $data['quantity'];
        $newType     = $data['type'];

        // Efecto que el movimiento original tuvo sobre el stock
        $oldDelta = match ($movement->type) {
            'entry'      =>  (float) $movement->quantity,
            'exit'       => -(float) $movement->quantity,
            'adjustment' =>  (float) $movement->quantity,
        };

        // Efecto que el movimiento editado tendrá sobre el stock
        $newDelta = match ($newType) {
            'entry'      =>  $newQuantity,
            'exit'       => -$newQuantity,
            'adjustment' =>  $newQuantity,
        };

        // Stock actual del producto: revertir viejo efecto y aplicar nuevo efecto
        $updatedProductStock = (float) $product->stock - $oldDelta + $newDelta;

        if ($updatedProductStock < 0) {
            return back()->withErrors([
                'quantity' => 'La modificación resultaría en stock negativo.',
            ]);
        }

        DB::transaction(function () use ($movement, $product, $newType, $newQuantity, $newDelta, $updatedProductStock, $data) {
            $product->update(['stock' => $updatedProductStock]);

            $movement->update([
                'type'      => $newType,
                'quantity'  => $newQuantity,
                // previous_stock no cambia: sigue siendo lo que había antes de que este movimiento ocurriera
                'new_stock' => (float) $movement->previous_stock + $newDelta,
                'reason'    => $data['reason'] ?? null,
            ]);
        });

        return back()->with('success', 'Movimiento actualizado y stock recalculado.');
    }

    public function destroy(InventoryMovement $movement): RedirectResponse
    {
        $product = $movement->product;

        // Calcular cuánto hay que revertir del stock actual
        $delta = match ($movement->type) {
            'entry'      =>  (float) $movement->quantity,
            'exit'       => -(float) $movement->quantity,
            'adjustment' =>  (float) $movement->quantity,
        };

        $stockAfterRevert = (float) $product->stock - $delta;

        if ($stockAfterRevert < 0) {
            return back()->with('error', 'No se puede eliminar: revertir este movimiento dejaría el stock en negativo.');
        }

        DB::transaction(function () use ($movement, $product, $stockAfterRevert) {
            $product->update(['stock' => $stockAfterRevert]);
            $movement->delete();
        });

        return back()->with('success', 'Movimiento eliminado y stock revertido.');
    }
}
