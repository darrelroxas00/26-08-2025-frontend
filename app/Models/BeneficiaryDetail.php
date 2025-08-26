<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BeneficiaryDetail extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'beneficiary_details';

    protected $fillable = [
        'user_id',
        'fname',
        'mname',
        'lname',
        'extension_name',
        'birth_date',
        'place_of_birth',
        'sex',
        'civil_status',
        'barangay',
        'municipality',
        'province',
        'region',
        'contact_number',
        'emergency_contact_number',
        'mothers_maiden_name',
        'is_household_head',
        'household_head_name',
        'highest_education',
        'religion',
        'is_pwd',
        'has_government_id',
        'gov_id_type',
        'gov_id_number',
        'is_association_member',
        'association_name',
        'name_of_spouse',
        'profile_completion_status',
        'data_source',
        'interview_status',
        'interviewed_at',
        'interviewed_by',
        'interview_notes'
    ];

    protected $casts = [
        'birth_date' => 'date',
        'is_household_head' => 'boolean',
        'is_pwd' => 'boolean',
        'interviewed_at' => 'datetime'
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
    public function scopeCompleted($query)
    {
        return $query->where('profile_completion_status', 'completed');
    }

    public function scopePending($query)
    {
        return $query->where('profile_completion_status', 'pending');
    }

    public function scopeVerified($query)
    {
        return $query->where('is_profile_verified', true);
    }

    // Accessors
    public function getFullNameAttribute()
    {
        $name = trim($this->fname . ' ' . ($this->mname ? $this->mname . ' ' : '') . $this->lname);
        if ($this->extension_name) {
            $name .= ', ' . $this->extension_name;
        }
        return $name;
    }

    public function getAgeAttribute()
    {
        if (!$this->birth_date) {
            return null;
        }
        
        return $this->birth_date->age;
    }
}