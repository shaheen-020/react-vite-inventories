<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $fillable = ['name', 'email', 'phone', 'address', 'doctor_name'];

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }
}
