<?php

namespace App\Http\Controllers;

use App\Models\Solution;
use Illuminate\Http\Request;

class SolutionController extends Controller
{
    public function index()
    {
        return Solution::latest()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $solution = Solution::create($validated);

        return response()->json($solution, 201);
    }

    public function show(Solution $solution)
    {
        return $solution;
    }

    public function update(Request $request, Solution $solution)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $solution->update($validated);

        return response()->json($solution);
    }

    public function destroy(Solution $solution)
    {
        $solution->delete();

        return response()->json(null, 204);
    }
}
