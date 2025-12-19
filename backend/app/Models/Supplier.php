<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    protected $fillable = ['name', 'email', 'phone', 'contact_person', 'address'];

    public function medicines()
    {
        return $this->hasMany(Medicine::class);
    }

    public function purchases()
    {
        return $this->hasMany(Purchase::class);
    }
}
