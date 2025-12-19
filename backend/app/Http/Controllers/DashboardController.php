<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Medicine;
use App\Models\Supplier;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        return response()->json([
            'total_medicines' => Medicine::count(),
            'total_customers' => Customer::count(),
            'total_suppliers' => Supplier::count(),
            'todays_sales' => Invoice::whereDate('date', today())->sum('total_amount'),
            'low_stock' => Medicine::withSum('stocks', 'quantity')
                ->get()
                ->filter(function ($medicine) {
                    return $medicine->stocks_sum_quantity < 10;
                })
                ->values(),
        ]);
    }
}
