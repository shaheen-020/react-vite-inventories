<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Medicine extends Model
{
    protected $fillable = [
        'category_id',
        'name',
        'generic_name',
        'brand_name',
        'sku',
        'barcode',
        'manufacturer',
        'strength',
        'form',
        'description',
        'price',
        'unit',
        'reorder_level',
        'supplier_id'
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function stocks()
    {
        return $this->hasMany(MedicineStock::class);
    }
}
