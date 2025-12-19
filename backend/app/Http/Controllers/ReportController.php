<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Purchase;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function sales(Request $request)
    {
        $startDate = $request->input('start_date', now()->startOfMonth());
        $endDate = $request->input('end_date', now()->endOfMonth());
        $customerId = $request->input('customer_id');

        $query = Invoice::with('customer')
            ->whereBetween('date', [$startDate, $endDate]);

        if ($customerId) {
            $query->where('customer_id', $customerId);
        }

        return $query->get();
    }

    public function purchases(Request $request)
    {
        $startDate = $request->input('start_date', now()->startOfMonth());
        $endDate = $request->input('end_date', now()->endOfMonth());

        return Purchase::with('supplier')
            ->whereBetween('date', [$startDate, $endDate])
            ->get();
    }

    public function stockCard(Request $request)
    {
        $medicineId = $request->input('medicine_id');
        $startDate = $request->input('start_date', now()->startOfMonth());
        $endDate = $request->input('end_date', now()->endOfMonth());

        if (!$medicineId) {
            return response()->json(['error' => 'Medicine ID is required'], 400);
        }

        // 1. Calculate Opening Balance (Everything before $startDate)
        $purchasesBefore = \App\Models\PurchaseItem::where('medicine_id', $medicineId)
            ->whereHas('purchase', function ($q) use ($startDate) {
                $q->where('date', '<', $startDate);
            })->sum('quantity');

        $salesBefore = \App\Models\InvoiceItem::where('medicine_id', $medicineId)
            ->whereHas('invoice', function ($q) use ($startDate) {
                $q->where('date', '<', $startDate);
            })->sum('quantity');

        $openingBalance = $purchasesBefore - $salesBefore;

        // 2. Get Movements within range
        $purchases = \App\Models\PurchaseItem::with('purchase.supplier')
            ->where('medicine_id', $medicineId)
            ->whereHas('purchase', function ($q) use ($startDate, $endDate) {
                $q->whereBetween('date', [$startDate, $endDate]);
            })->get()
            ->map(function ($item) {
                return [
                    'date' => $item->purchase->date,
                    'ref' => $item->purchase->invoice_no ?: 'PUR-'.$item->purchase_id,
                    'type' => 'Stock In',
                    'in' => $item->quantity,
                    'out' => 0,
                    'description' => 'Purchase from ' . ($item->purchase->supplier->name ?? 'N/A')
                ];
            });

        $sales = \App\Models\InvoiceItem::with('invoice.customer')
            ->where('medicine_id', $medicineId)
            ->whereHas('invoice', function ($q) use ($startDate, $endDate) {
                $q->whereBetween('date', [$startDate, $endDate]);
            })->get()
            ->map(function ($item) {
                return [
                    'date' => $item->invoice->date,
                    'ref' => $item->invoice->invoice_no,
                    'type' => 'Stock Out',
                    'in' => 0,
                    'out' => $item->quantity,
                    'description' => 'Sale to ' . ($item->invoice->customer->name ?? 'Walk-in')
                ];
            });

        $movements = $purchases->concat($sales)->sortBy('date')->values();

        return response()->json([
            'opening_balance' => (int)$openingBalance,
            'movements' => $movements
        ]);
    }

    public function inventory(Request $request)
    {
        return \App\Models\Medicine::withSum('stocks', 'quantity')
            ->get()
            ->map(function ($medicine) {
                return [
                    'name' => $medicine->name,
                    'sku' => $medicine->sku,
                    'unit' => $medicine->unit,
                    'stock' => (int)($medicine->stocks_sum_quantity ?: 0),
                    'price' => (float)($medicine->price ?: 0),
                    'value' => (float)(($medicine->stocks_sum_quantity ?: 0) * ($medicine->price ?: 0)),
                ];
            });
    }

    public function expiry(Request $request)
    {
        $months = $request->input('months', 6);
        $thresholdDate = now()->addMonths($months);

        return \App\Models\MedicineStock::with('medicine')
            ->where('expiry_date', '>', now())
            ->where('expiry_date', '<=', $thresholdDate)
            ->where('quantity', '>', 0)
            ->orderBy('expiry_date', 'asc')
            ->get();
    }

    public function profit(Request $request)
    {
        $startDate = $request->input('start_date', now()->startOfMonth());
        $endDate = $request->input('end_date', now()->endOfMonth());

        $sales = \App\Models\Invoice::whereBetween('date', [$startDate, $endDate])
            ->sum('net_total');

        // Simple profit calculation (Revenue - Cost)
        // Note: Real ROI would need exact cost tracking per item sold.
        // We can estimate based on current medicine price * 0.7 or specific purchase history if available.
        // For now, let's just return revenue and simplified margin.
        
        return response()->json([
            'revenue' => $sales,
            'estimated_profit' => $sales * 0.3, // Placeholder 30% margin
            'count' => \App\Models\Invoice::whereBetween('date', [$startDate, $endDate])->count()
        ]);
    }
}
