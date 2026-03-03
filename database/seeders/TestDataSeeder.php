<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class TestDataSeeder extends Seeder
{
    public function run(): void
    {
        // Crear categorías
        $categories = [
            'alimentos' => ['name' => 'Alimentos para Animales', 'description' => 'Alimentos balanceados y suplementos', 'is_active' => true],
            'medicamentos' => ['name' => 'Medicamentos Veterinarios', 'description' => 'Medicinas y tratamientos para animales', 'is_active' => true],
            'herramientas' => ['name' => 'Herramientas Agrícolas', 'description' => 'Herramientas para el campo', 'is_active' => true],
            'fertilizantes' => ['name' => 'Fertilizantes', 'description' => 'Fertilizantes y abonos', 'is_active' => true],
            'accesorios' => ['name' => 'Accesorios', 'description' => 'Accesorios diversos', 'is_active' => true],
        ];

        $createdCategories = [];
        foreach ($categories as $key => $categoryData) {
            $createdCategories[$key] = Category::firstOrCreate(
                ['name' => $categoryData['name']],
                $categoryData
            );
        }

        // Crear productos usando las categorías creadas
        $products = [
            ['sku' => 'ALI001', 'name' => 'Alimento para Ganado 50kg', 'category_id' => $createdCategories['alimentos']->id, 'purchase_price' => 45.00, 'sale_price' => 65.00, 'stock' => 50, 'min_stock' => 10, 'unit' => 'bolsa'],
            ['sku' => 'ALI002', 'name' => 'Alimento para Aves 25kg', 'category_id' => $createdCategories['alimentos']->id, 'purchase_price' => 35.00, 'sale_price' => 50.00, 'stock' => 30, 'min_stock' => 8, 'unit' => 'bolsa'],
            ['sku' => 'MED001', 'name' => 'Antibiótico Veterinario', 'category_id' => $createdCategories['medicamentos']->id, 'purchase_price' => 25.00, 'sale_price' => 40.00, 'stock' => 20, 'min_stock' => 5, 'unit' => 'frasco', 'expiration_date' => now()->addMonths(6)],
            ['sku' => 'MED002', 'name' => 'Vitaminas para Ganado', 'category_id' => $createdCategories['medicamentos']->id, 'purchase_price' => 30.00, 'sale_price' => 45.00, 'stock' => 15, 'min_stock' => 5, 'unit' => 'frasco', 'expiration_date' => now()->addMonths(8)],
            ['sku' => 'HER001', 'name' => 'Pala Agrícola', 'category_id' => $createdCategories['herramientas']->id, 'purchase_price' => 18.00, 'sale_price' => 30.00, 'stock' => 25, 'min_stock' => 5, 'unit' => 'unidad'],
            ['sku' => 'HER002', 'name' => 'Machete', 'category_id' => $createdCategories['herramientas']->id, 'purchase_price' => 15.00, 'sale_price' => 25.00, 'stock' => 40, 'min_stock' => 10, 'unit' => 'unidad'],
            ['sku' => 'FER001', 'name' => 'Fertilizante NPK 50kg', 'category_id' => $createdCategories['fertilizantes']->id, 'purchase_price' => 55.00, 'sale_price' => 75.00, 'stock' => 35, 'min_stock' => 10, 'unit' => 'bolsa'],
            ['sku' => 'ACC001', 'name' => 'Guantes de Trabajo', 'category_id' => $createdCategories['accesorios']->id, 'purchase_price' => 5.00, 'sale_price' => 10.00, 'stock' => 100, 'min_stock' => 20, 'unit' => 'par'],
            ['sku' => 'ACC002', 'name' => 'Botas de Jebe', 'category_id' => $createdCategories['accesorios']->id, 'purchase_price' => 20.00, 'sale_price' => 35.00, 'stock' => 30, 'min_stock' => 10, 'unit' => 'par'],
        ];

        foreach ($products as $productData) {
            Product::firstOrCreate(
                ['sku' => $productData['sku']],
                $productData
            );
        }
    }
}
