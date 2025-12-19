<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MedicineStock extends Model
{
    protected $fillable = ['medicine_id', 'batch_no', 'expiry_date', 'quantity'];

    public function medicine()
    {
        return $this->belongsTo(Medicine::class);
    }
}
