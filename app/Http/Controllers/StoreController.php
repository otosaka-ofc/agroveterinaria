<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class StoreController extends Controller
{
    public function index(Request $request)
    {
        $products = Product::query()
            ->with('category')
            ->where('is_stored', true)
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%");
                });
            })
            ->when($request->category_id, function ($query, $categoryId) {
                $query->where('category_id', $categoryId);
            })
            ->when($request->low_stock, function ($query) {
                $query->whereRaw('stock <= min_stock');
            })
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn ($store) => [
                'id' => $store->id,
                'sku' => $store->sku,
                'name' => $store->name,
                'description' => $store->description,
                'category' => $store->category,
                'purchase_price' => $store->purchase_price,
                'sale_price' => $store->sale_price,
                'price_per_kg' => $store->price_per_kg,
                'stock' => $store->stock,
                'min_stock' => $store->min_stock,
                'unit' => $store->unit,
                'kg_per_unit' => $store->kg_per_unit,
                'allow_fractional_sale' => $store->allow_fractional_sale,
                'expiration_date' => $store->expiration_date?->format('Y-m-d'),
                'image' => $store->image,
                'is_active' => $store->is_active,
                'is_stored' => $store->is_stored,
            ]);

        $categories = Category::where('is_active', true)->get();

        return Inertia::render('Store/Index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category_id', 'low_stock']),
        ]);
    }

    public function store(Request $request)
    {


        $validated = $request->validate([
            'sku' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'required|exists:categories,id',
            'purchase_price' => 'required|numeric|min:0',
            'sale_price' => 'required|numeric|min:0',
            'price_per_kg' => 'nullable|numeric|min:0',
            'stock' => 'required|numeric|min:0',
            'min_stock' => 'required|numeric|min:0',
            'unit' => 'required|string|max:50',
            'kg_per_unit' => 'nullable|numeric|min:0',
            'allow_fractional_sale' => 'boolean',
            'expiration_date' => 'nullable|date',
            'image' => 'nullable|image|max:2048',
            'is_active' => 'boolean',
            'is_stored' => 'boolean'
        ]);

        // Verificar si el SKU ya existe
        if (Product::where('sku', $validated['sku'])->exists()) {
            return back()->withErrors([
                'sku' => 'El SKU ya existe. Por favor, usa un código diferente.'
            ])->withInput();
        }

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        $store = Product::create($validated);

        // Registrar movimiento de inventario si hay stock inicial
        if ($store->stock > 0) {
            \App\Models\InventoryMovement::create([
                'product_id' => $store->id,
                'type' => 'entry',
                'quantity' => $store->stock,
                'reason' => 'Stock inicial al crear producto',
                'previous_stock' => 0,
                'new_stock' => $store->stock,
                'user_id' => auth()->id(),
            ]);
        }

        if ($request->boolean('stay_on_category') && $request->filled('category_id')) {
            return redirect()->route('categories.show', $request->input('category_id'))
                ->with('success', 'Producto creado exitosamente.');
        }

        return redirect()->route('store.index')
            ->with('success', 'Producto creado exitosamente.');
    }

    public function update(Request $request, Product $store)
    {

        $validated = $request->validate([
            'sku' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'required|exists:categories,id',
            'purchase_price' => 'required|numeric|min:0',
            'sale_price' => 'required|numeric|min:0',
            'price_per_kg' => 'nullable|numeric|min:0',
            'stock' => 'required|numeric|min:0',
            'min_stock' => 'required|numeric|min:0',
            'unit' => 'required|string|max:50',
            'kg_per_unit' => 'nullable|numeric|min:0',
            'allow_fractional_sale' => 'boolean',
            'expiration_date' => 'nullable|date',
            'image' => 'nullable|image|max:2048',
            'is_active' => 'boolean',
        ]);

        // Verificar si el SKU ya existe en otro producto
        if (Product::where('sku', $validated['sku'])->where('id', '!=', $store->id)->exists()) {
            return back()->withErrors([
                'sku' => 'El SKU ya existe. Por favor, usa un código diferente.'
            ])->withInput();
        }

        if ($request->hasFile('image')) {
            if ($store->image) {
                Storage::disk('public')->delete($store->image);
            }
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        $store->update($validated);
        if ($request->boolean('stay_on_category') && $request->filled('category_id')) {
            return redirect()->route('categories.show', $request->input('category_id'))
                ->with('success', 'Producto actualizado exitosamente.');
        }

        return redirect()->route('store.index')
            ->with('success', 'Producto actualizado exitosamente.');
    }

    public function destroy(Product $store)
    {
        if ($store->saleDetails()->count() > 0) {
            return back()->with('error', 'No se puede eliminar el producto porque tiene ventas asociadas.');
        }

        if ($store->image) {
            Storage::disk('public')->delete($store->image);
        }

        $store->delete();

        return back()->with('success', 'Producto eliminado exitosamente.');
    }

    public function toggleStatus(Product $store)
    {
        $store->update([
            'is_active' => !$store->is_active
        ]);

        return back()->with('success', 'Estado del producto actualizado.');
    }

    public function toggleStored(Product $product)
    {
        $product->update([
            'is_stored' => !$product->is_stored
        ]);

        return redirect()->route("store.index");
    }
}
