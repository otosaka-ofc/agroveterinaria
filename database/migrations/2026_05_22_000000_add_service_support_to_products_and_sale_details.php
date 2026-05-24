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
        Schema::table('products', function (Blueprint $table) {
            $table->boolean('is_service')->default(false)->after('is_stored');
        });

        Schema::table('sale_details', function (Blueprint $table) {
            $table->string('breed')->nullable()->after('product_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('is_service');
        });

        Schema::table('sale_details', function (Blueprint $table) {
            $table->dropColumn('breed');
        });
    }
};
