<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Applicant extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_code', 'name', 'email', 'phone', 'status', 'hire_date',
        'job', 'job_title', 'employment_type', 'department', 'salary',
        'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_address'
    ];

    /**
     * Get the interviews for the applicant
     */
    public function interviews()
    {
        return $this->hasMany(Interview::class);
    }

    /**
     * Get the onboarding checklist for the applicant
     */
    public function onboardingChecklist()
    {
        return $this->hasOne(OnboardingChecklist::class);
    }

    /**
     * Get the user account for the applicant
     */
    public function user()
    {
        return $this->hasOne(User::class);
    }

    /**
     * Check if applicant has a user account
     */
    public function hasAccount(): bool
    {
        return $this->user()->exists();
    }
}
