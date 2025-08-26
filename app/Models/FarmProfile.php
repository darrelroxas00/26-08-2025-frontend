<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class FarmProfile extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'farm_profiles';

    protected $fillable = [
        'user_id',
        'total_farm_area',
        'land_tenure_status',
        'primary_livelihood',
        'farm_income_source',
        'annual_farm_income',
        'farm_workers_count',
        'farm_equipment',
        'farm_animals',
        'farm_structures',
        'irrigation_type',
        'farm_insurance',
        'farm_credit_access'
    ];

    protected $casts = [
        'total_farm_area' => 'decimal:2',
        'farm_workers_count' => 'integer',
        'farm_income_source' => 'array',
        'farm_equipment' => 'array',
        'farm_animals' => 'array',
        'farm_structures' => 'array'
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function farmParcels()
    {
        return $this->hasMany(FarmParcel::class);
    }

    public function livelihoodCategory()
    {
        return $this->belongsTo(LivelihoodCategory::class);
    }

    // Scopes
    public function scopeByLivelihood($query, $livelihood)
    {
        return $query->where('primary_livelihood', $livelihood);
    }

    public function scopeByArea($query, $minArea, $maxArea = null)
    {
        $query->where('total_farm_area', '>=', $minArea);
        if ($maxArea) {
            $query->where('total_farm_area', '<=', $maxArea);
        }
        return $query;
    }

    // Accessors
    public function getFarmAreaInHectaresAttribute()
    {
        return $this->total_farm_area;
    }

    public function getFarmAreaInAcresAttribute()
    {
        return $this->total_farm_area * 2.47105; // Convert hectares to acres
    }
}