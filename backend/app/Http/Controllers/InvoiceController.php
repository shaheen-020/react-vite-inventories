<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\MedicineStock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InvoiceController extends Controller
{
    public function index()
    {
        return Invoice::with('customer')->latest()->get();
    }

    public function store(Request $request)
    {
        // Normalize empty strings
        $request->merge([
            'discount' => $request->discount ?: 0,
        ]);

        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'date' => 'required|date',
            'invoice_no' => 'required|unique:invoices,invoice_no',
            'payment_method' => 'required|string',
            'discount' => 'nullable|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.medicine_id' => 'required|exists:medicines,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        return DB::transaction(function () use ($validated) {
            $totalAmount = 0;
            foreach ($validated['items'] as $item) {
                $totalAmount += $item['quantity'] * $item['unit_price'];
            }

            $discount = $validated['discount'] ?? 0;
            $netTotal = $totalAmount - $discount;

            $invoice = Invoice::create([
                'customer_id' => $validated['customer_id'],
                'date' => $validated['date'],
                'invoice_no' => $validated['invoice_no'],
                'total_amount' => $totalAmount,
                'discount' => $discount,
                'net_total' => $netTotal,
                'payment_method' => $validated['payment_method'],
            ]);

            foreach ($validated['items'] as $item) {
                $qtyNeeded = $item['quantity'];
                
                // FEFO (First Expire First Out) Logic
                $stocks = MedicineStock::where('medicine_id', $item['medicine_id'])
                    ->where('quantity', '>', 0)
                    ->orderBy('expiry_date', 'asc')
                    ->get();
                
                $availableQty = $stocks->sum('quantity');

                if ($availableQty < $qtyNeeded) {
                    throw new \Exception("Insufficient stock for medicine ID: " . $item['medicine_id']);
                }

                foreach ($stocks as $stock) {
                    if ($qtyNeeded <= 0) break;

                    if ($stock->quantity >= $qtyNeeded) {
                        $stock->decrement('quantity', $qtyNeeded);
                        $qtyNeeded = 0;
                    } else {
                        $qtyNeeded -= $stock->quantity;
                        $stock->update(['quantity' => 0]);
                    }
                }

                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'medicine_id' => $item['medicine_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total_price' => $item['quantity'] * $item['unit_price'],
                ]);
            }

            return response()->json($invoice->load('items'), 201);
        });
    }

    public function show(Invoice $invoice)
    {
        return $invoice->load(['items.medicine', 'customer']);
    }

    public function destroy(Invoice $invoice)
    {
        // Simple delete - in real app might need to return stock
        $invoice->delete();
        return response()->json(null, 204);
    }
}
