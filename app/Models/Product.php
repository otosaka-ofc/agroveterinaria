<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = [
        'sku',
        'name',
        'description',
        'category_id',
        'purchase_price',
        'sale_price',
        'price_per_kg',
        'stock',
        'min_stock',
        'unit',
        'kg_per_unit',
        'allow_fractional_sale',
        'expiration_date',
        'image',
        'is_active',
        'is_stored'
    ];

    protected function casts(): array
    {
        return [
            'purchase_price' => 'decimal:2',
            'sale_price' => 'decimal:2',
            'price_per_kg' => 'decimal:2',
            'stock' => 'decimal:2',
            'min_stock' => 'decimal:2',
            'kg_per_unit' => 'decimal:2',
            'allow_fractional_sale' => 'boolean',
            'expiration_date' => 'date',
            'is_active' => 'boolean',
            'is_stored' => 'boolean',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function inventoryMovements(): HasMany
    {
        return $this->hasMany(InventoryMovement::class);
    }

    public function saleDetails(): HasMany
    {
        return $this->hasMany(SaleDetail::class);
    }

    public function isLowStock(): bool
    {
        return $this->stock <= $this->min_stock;
    }

    public function getAvailableKgAttribute(): float
    {
        if ($this->kg_per_unit && $this->kg_per_unit > 0) {
            return $this->stock * $this->kg_per_unit;
        }
        return $this->stock;
    }

    public function getStockDisplayAttribute(): string
    {
        if ($this->allow_fractional_sale && $this->kg_per_unit) {
            return "{$this->stock} {$this->unit} ({$this->available_kg} kg disponibles)";
        }
        return "{$this->stock} {$this->unit}";
    }
}
