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
        Schema::table('medicines', function (Blueprint $table) {
            if (!Schema::hasColumn('medicines', 'category_id')) {
                $table->foreignId('category_id')->nullable()->after('id')->constrained()->onDelete('set null');
            }
            if (!Schema::hasColumn('medicines', 'brand_name')) {
                $table->string('brand_name')->nullable()->after('name');
            }
            if (!Schema::hasColumn('medicines', 'manufacturer')) {
                $table->string('manufacturer')->nullable()->after('brand_name');
            }
            if (!Schema::hasColumn('medicines', 'strength')) {
                $table->string('strength')->nullable()->after('manufacturer');
            }
            if (!Schema::hasColumn('medicines', 'form')) {
                $table->string('form')->nullable()->after('strength');
            }
            if (!Schema::hasColumn('medicines', 'barcode')) {
                $table->string('barcode')->nullable()->unique()->after('sku');
            }
            if (!Schema::hasColumn('medicines', 'reorder_level')) {
                $table->integer('reorder_level')->default(0)->after('unit');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('medicines', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropColumn([
                'category_id',
                'brand_name',
                'manufacturer',
                'strength',
                'form',
                'barcode',
                'reorder_level'
            ]);
        });
    }
};
