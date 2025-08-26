<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class RsbsaEnrollment extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'rsbsa_enrollments';

    protected $fillable = [
        'user_id',
        'system_generated_rsbsa_number',
        'manual_rsbsa_number',
        'rsbsa_verification_status',
        'rsbsa_verification_notes',
        'interview_status',
        'interviewed_at',
        'interviewed_by',
        'interview_notes',
        'enrollment_date',
        'data_source'
    ];

    protected $casts = [
        'interviewed_at' => 'datetime',
        'enrollment_date' => 'date'
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function interviewedBy()
    {
        return $this->belongsTo(User::class, 'interviewed_by');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('rsbsa_verification_status', 'pending');
    }

    public function scopeVerified($query)
    {
        return $query->where('rsbsa_verification_status', 'verified');
    }

    public function scopeRejected($query)
    {
        return $query->where('rsbsa_verification_status', 'rejected');
    }

    // Generate system RSBSA number
    public function generateSystemNumber()
    {
        $year = date('Y');
        $count = static::whereYear('created_at', $year)->count() + 1;
        return "RSBSA-{$year}-" . str_pad($count, 6, '0', STR_PAD_LEFT);
    }
}