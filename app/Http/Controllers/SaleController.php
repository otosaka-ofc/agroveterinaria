<?php

namespace App\Http\Controllers;

use App\Models\InventoryMovement;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SaleController extends Controller
{
    public function index(Request $request)
    {
        $sales = Sale::query()
            ->with(['user', 'details.product'])
            ->when($request->search, function ($query, $search) {
                $query->where('sale_number', 'like', "%{$search}%");
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->payment_method, function ($query, $method) {
                $query->where('payment_method', $method);
            })
            ->when($request->date_from, function ($query, $date) {
                $query->whereDate('created_at', '>=', $date);
            })
            ->when($request->date_to, function ($query, $date) {
                $query->whereDate('created_at', '<=', $date);
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Sales/Index', [
            'sales' => $sales,
            'filters' => $request->only(['search', 'status', 'payment_method', 'date_from', 'date_to']),
        ]);
    }

    public function create()
    {
        $products = Product::where('is_active', true)
            ->where('stock', '>', 0)
            ->where('is_stored', false)
            ->with('category')
            ->get();

        return Inertia::render('Sales/Create', [
            'products' => $products,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'payment_method' => 'required|in:efectivo,yape',
            'payment_reference' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.is_fractional_sale' => 'nullable|boolean',
            'items.*.price_per_kg' => 'nullable|numeric|min:0',
        ]);

        DB::beginTransaction();

        try {
            // Verificar stock disponible y calcular unidades a descontar
            $itemsWithUnits = [];
            foreach ($validated['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);
                $isFractionalSale = $item['is_fractional_sale'] ?? false;

                // Para ventas fraccionadas, calcular cuántas unidades se descargan
                $unitsToDeduct = $isFractionalSale
                    ? $item['quantity'] / ($product->kg_per_unit ?? 1)
                    : $item['quantity'];

                if ($product->stock < $unitsToDeduct) {
                    return back()->with('error', "Stock insuficiente para el producto: {$product->name}");
                }

                $itemsWithUnits[] = array_merge($item, [
                    'units_to_deduct' => $unitsToDeduct,
                    'is_fractional_sale' => $isFractionalSale,
                ]);
            }

            // Calcular totales
            $subtotal = 0;
            foreach ($itemsWithUnits as $item) {
                $subtotal += $item['quantity'] * $item['unit_price'];
            }

            // Crear venta
            $sale = Sale::create([
                'sale_number' => Sale::generateSaleNumber(),
                'user_id' => auth()->id(),
                'subtotal' => $subtotal,
                'tax' => 0,
                'total' => $subtotal,
                'payment_method' => $validated['payment_method'],
                'payment_reference' => $validated['payment_reference'] ?? null,
                'status' => 'completed',
                'notes' => $validated['notes'] ?? null,
            ]);

            // Crear detalles y actualizar inventario
            foreach ($itemsWithUnits as $item) {
                $product = Product::findOrFail($item['product_id']);
                $itemSubtotal = $item['quantity'] * $item['unit_price'];
                $unitsToDeduct = $item['units_to_deduct'];

                // Crear detalle de venta
                SaleDetail::create([
                    'sale_id' => $sale->id,
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $itemSubtotal,
                ]);

                // Registrar movimiento de inventario
                $previousStock = $product->stock;
                $newStock = $previousStock - $unitsToDeduct;

                InventoryMovement::create([
                    'product_id' => $product->id,
                    'type' => 'exit',
                    'quantity' => $unitsToDeduct,
                    'previous_stock' => $previousStock,
                    'new_stock' => $newStock,
                    'reason' => 'Venta #' . $sale->sale_number,
                    'user_id' => auth()->id(),
                    'sale_id' => $sale->id,
                ]);

                // Actualizar stock del producto
                $product->update(['stock' => $newStock]);
            }

            DB::commit();

            return redirect()->route('sales.show', $sale)
                ->with('success', 'Venta registrada exitosamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Error al procesar la venta: ' . $e->getMessage());
        }
    }

    public function show(Sale $sale)
    {
        $sale->load(['user', 'details.product.category']);

        return Inertia::render('Sales/Show', [
            'sale' => $sale,
        ]);
    }

    public function destroy(Sale $sale)
    {
        DB::beginTransaction();

        try {
            // Solo restaurar stock si la venta estaba completada.
            // Si ya estaba cancelada, el stock fue restaurado al momento de cancelarla.
            if ($sale->status === 'completed') {
                $sale->load('details.product');

                foreach ($sale->details as $detail) {
                    $product = $detail->product;

                    // Usar la cantidad del movimiento original de salida para ser exactos
                    $originalMovement = InventoryMovement::where('sale_id', $sale->id)
                        ->where('product_id', $product->id)
                        ->where('type', 'exit')
                        ->first();

                    $unitsToRestore = $originalMovement
                        ? (float) $originalMovement->quantity
                        : (float) $detail->quantity;

                    $product->increment('stock', $unitsToRestore);
                }
            }

            // Eliminar la venta. Las FK con cascadeOnDelete se encargan de borrar
            // automáticamente sale_details e inventory_movements asociados.
            $sale->delete();

            DB::commit();

            return redirect()->route('sales.index')
                ->with('success', 'Venta eliminada exitosamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Error al eliminar la venta: ' . $e->getMessage());
        }
    }
}
