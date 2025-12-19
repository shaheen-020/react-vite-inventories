<?php

namespace App\Http\Controllers;

use App\Models\MedicineStock;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PurchaseController extends Controller
{
    public function index()
    {
        return Purchase::with('supplier')->latest()->get();
    }

    public function store(Request $request)
    {
        // Normalize empty strings to null
        $request->merge([
            'voucher_no' => $request->voucher_no ?: null,
            'invoice_no' => $request->invoice_no ?: null,
            'items' => array_map(function ($item) {
                $item['batch_no'] = !empty($item['batch_no']) ? $item['batch_no'] : null;
                $item['expiry_date'] = !empty($item['expiry_date']) ? $item['expiry_date'] : null;
                return $item;
            }, $request->items ?? [])
        ]);

        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'date' => 'required|date',
            'voucher_no' => 'nullable|string',
            'invoice_no' => 'nullable|string',
            'payment_status' => 'required|string',
            'status' => 'required|string',
            'items' => 'required|array|min:1',
            'items.*.medicine_id' => 'required|exists:medicines,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.cost_price' => 'required|numeric|min:0',
            'items.*.expiry_date' => 'nullable|date',
            'items.*.batch_no' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated) {
            $totalAmount = 0;
            foreach ($validated['items'] as $item) {
                $totalAmount += $item['quantity'] * $item['cost_price'];
            }

            $purchase = Purchase::create([
                'supplier_id' => $validated['supplier_id'],
                'date' => $validated['date'],
                'voucher_no' => $validated['voucher_no'] ?? null,
                'invoice_no' => $validated['invoice_no'] ?? null,
                'payment_status' => $validated['payment_status'],
                'status' => $validated['status'],
                'total_amount' => $totalAmount,
            ]);

            foreach ($validated['items'] as $item) {
                $totalPrice = $item['quantity'] * $item['cost_price'];
                
                PurchaseItem::create([
                    'purchase_id' => $purchase->id,
                    'medicine_id' => $item['medicine_id'],
                    'quantity' => $item['quantity'],
                    'cost_price' => $item['cost_price'],
                    'total_price' => $totalPrice,
                    'expiry_date' => $item['expiry_date'] ?? null,
                    'batch_no' => $item['batch_no'] ?? null,
                ]);

                // Update Stock
                // Check if stock exists for this medicine and batch
                $existingStock = MedicineStock::where('medicine_id', $item['medicine_id'])
                    ->where('batch_no', $item['batch_no'] ?? null)
                    ->first();

                if ($existingStock) {
                    $existingStock->increment('quantity', $item['quantity']);
                } else {
                    MedicineStock::create([
                        'medicine_id' => $item['medicine_id'],
                        'batch_no' => $item['batch_no'] ?? null,
                        'expiry_date' => $item['expiry_date'] ?? null,
                        'quantity' => $item['quantity'],
                    ]);
                }
            }

            return response()->json($purchase->load('items'), 201);
        });
    }

    public function show(Purchase $purchase)
    {
        return $purchase->load(['items.medicine', 'supplier']);
    }

    public function destroy(Purchase $purchase)
    {
        // Simple delete - in real app might need to reverse stock
        $purchase->delete();
        return response()->json(null, 204);
    }
}
