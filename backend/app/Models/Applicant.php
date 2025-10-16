<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Applicant extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_code',
        'first_name',
        'last_name',
        'name',
        'email',
        'phone',
        'date_of_birth',
        'hire_date',
        'probation_end',
        'job_id',
        'department_id',
        'salary',
        'employment_type',
        'employee_type',
        'status',
        'address',
        'emergency_contact',
        'emergency_phone',
        'tax_id',
        'sss_number',
        'philhealth_number',
        'pagibig_number',
        'gender',
        'marital_status',
        'nationality',
        'years_of_experience',
        // Legacy fields
        'job',
        'job_title',
        'department',
        'emergency_contact_name',
        'emergency_contact_phone',
        'emergency_contact_address'
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
