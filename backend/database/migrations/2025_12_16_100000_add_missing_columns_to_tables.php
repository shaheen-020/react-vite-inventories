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
            $table->string('generic_name')->nullable()->after('name');
            $table->string('packing')->nullable()->after('name');
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->string('doctor_name')->nullable()->after('address');
        });

        Schema::table('purchases', function (Blueprint $table) {
            $table->string('voucher_no')->nullable()->after('id');
            $table->string('invoice_no')->nullable()->after('voucher_no');
            $table->string('payment_status')->default('paid')->after('total_amount');
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->string('invoice_no')->unique()->nullable()->after('id');
            $table->decimal('discount', 12, 2)->default(0)->after('total_amount');
            $table->decimal('net_total', 12, 2)->default(0)->after('discount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('medicines', function (Blueprint $table) {
            $table->dropColumn(['generic_name', 'packing']);
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn('doctor_name');
        });

        Schema::table('purchases', function (Blueprint $table) {
            $table->dropColumn(['voucher_no', 'invoice_no', 'payment_status']);
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->dropColumn(['invoice_no', 'discount', 'net_total']);
        });
    }
};
