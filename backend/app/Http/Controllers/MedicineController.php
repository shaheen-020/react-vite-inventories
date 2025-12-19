<?php

namespace App\Http\Controllers;

use App\Models\Medicine;
use Illuminate\Http\Request;

class MedicineController extends Controller
{
    public function index()
    {
        return Medicine::with(['supplier', 'category'])->withSum('stocks', 'quantity')->latest()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'nullable|exists:categories,id',
            'name' => 'required|string|max:255',
            'generic_name' => 'nullable|string|max:255',
            'brand_name' => 'nullable|string|max:255',
            'sku' => 'nullable|string|max:100|unique:medicines',
            'barcode' => 'nullable|string|max:100|unique:medicines',
            'manufacturer' => 'nullable|string|max:255',
            'strength' => 'nullable|string|max:100',
            'form' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'unit' => 'required|string',
            'reorder_level' => 'nullable|integer|min:0',
            'supplier_id' => 'nullable|exists:suppliers,id',
        ]);

        $medicine = Medicine::create($validated);

        return response()->json($medicine->load('category'), 201);
    }

    public function show(Medicine $medicine)
    {
        return $medicine->load(['supplier', 'category', 'stocks']);
    }

    public function update(Request $request, Medicine $medicine)
    {
        $validated = $request->validate([
            'category_id' => 'nullable|exists:categories,id',
            'name' => 'required|string|max:255',
            'generic_name' => 'nullable|string|max:255',
            'brand_name' => 'nullable|string|max:255',
            'sku' => 'nullable|string|max:100|unique:medicines,sku,' . $medicine->id,
            'barcode' => 'nullable|string|max:100|unique:medicines,barcode,' . $medicine->id,
            'manufacturer' => 'nullable|string|max:255',
            'strength' => 'nullable|string|max:100',
            'form' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'unit' => 'required|string',
            'reorder_level' => 'nullable|integer|min:0',
            'supplier_id' => 'nullable|exists:suppliers,id',
        ]);

        $medicine->update($validated);

        return response()->json($medicine->load('category'));
    }

    public function destroy(Medicine $medicine)
    {
        $medicine->delete();

        return response()->json(null, 204);
    }
}
