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
        // Name fields removed - they come from users table
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
        'interview_notes',
        'rsbsa_verification_status',
        'rsbsa_verification_notes',
        'rsbsa_verified_at',
        'rsbsa_verified_by',
        'is_profile_verified',
        'verification_notes',
        'profile_verified_at',
        'profile_verified_by',
        'last_updated_by_beneficiary',
        'completion_tracking'
    ];

    protected $casts = [
        'birth_date' => 'date',
        'is_household_head' => 'boolean',
        'is_pwd' => 'boolean',
        'interviewed_at' => 'datetime',
        'rsbsa_verified_at' => 'datetime',
        'profile_verified_at' => 'datetime',
        'last_updated_by_beneficiary' => 'datetime'
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

    public function verifiedBy()
    {
        return $this->belongsTo(User::class, 'rsbsa_verified_by');
    }

    public function profileVerifiedBy()
    {
        return $this->belongsTo(User::class, 'profile_verified_by');
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

    public function scopeRsbsaVerified($query)
    {
        return $query->where('rsbsa_verification_status', 'verified');
    }

    public function scopeRsbsaPending($query)
    {
        return $query->where('rsbsa_verification_status', 'pending');
    }

    // Accessors
    public function getFullNameAttribute()
    {
        if ($this->user) {
            $name = trim($this->user->fname . ' ' . ($this->user->mname ? $this->user->mname . ' ' : '') . $this->user->lname);
            if ($this->user->extension_name) {
                $name .= ', ' . $this->user->extension_name;
            }
            return $name;
        }
        return null;
    }

    public function getFnameAttribute()
    {
        return $this->user ? $this->user->fname : null;
    }

    public function getMnameAttribute()
    {
        return $this->user ? $this->user->mname : null;
    }

    public function getLnameAttribute()
    {
        return $this->user ? $this->user->lname : null;
    }

    public function getExtensionNameAttribute()
    {
        return $this->user ? $this->user->extension_name : null;
    }

    public function getAgeAttribute()
    {
        if (!$this->birth_date) {
            return null;
        }
        
        return $this->birth_date->age;
    }

    public function getIsAdultAttribute()
    {
        return $this->age >= 18;
    }

    // Mutators
    public function setBirthDateAttribute($value)
    {
        if ($value) {
            $this->attributes['birth_date'] = \Carbon\Carbon::parse($value);
        }
    }

    public function setInterviewedAtAttribute($value)
    {
        if ($value) {
            $this->attributes['interviewed_at'] = \Carbon\Carbon::parse($value);
        }
    }

    public function setRsbsaVerifiedAtAttribute($value)
    {
        if ($value) {
            $this->attributes['rsbsa_verified_at'] = \Carbon\Carbon::parse($value);
        }
    }

    public function setProfileVerifiedAtAttribute($value)
    {
        if ($value) {
            $this->attributes['profile_verified_at'] = \Carbon\Carbon::parse($value);
        }
    }

    public function setLastUpdatedByBeneficiaryAttribute($value)
    {
        if ($value) {
            $this->attributes['last_updated_by_beneficiary'] = \Carbon\Carbon::parse($value);
        }
    }
}