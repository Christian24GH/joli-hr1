<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OnboardingChecklist extends Model
{
    protected $fillable = [
        'applicant_id',
        'start_date',
        'training_hr2',
        'training_hr2_completed_at',
        'training_hr2_completed_by',
        'training_hr2_auto',
        'offer_compensation_hr4',
        'offer_compensation_hr4_completed_at',
        'offer_compensation_hr4_completed_by',
        'offer_compensation_hr4_auto',
        'schedule_hr3',
        'schedule_hr3_completed_at',
        'schedule_hr3_completed_by',
        'schedule_hr3_auto',
        'documents_admin',
        'documents_admin_completed_at',
        'documents_admin_completed_by',
        'equipment_logistics',
        'equipment_logistics_completed_at',
        'equipment_logistics_completed_by',
        'all_completed',
        'completed_at',
    ];

    protected $casts = [
        'start_date' => 'date',
        'training_hr2' => 'boolean',
        'training_hr2_completed_at' => 'datetime',
        'training_hr2_auto' => 'boolean',
        'offer_compensation_hr4' => 'boolean',
        'offer_compensation_hr4_completed_at' => 'datetime',
        'offer_compensation_hr4_auto' => 'boolean',
        'schedule_hr3' => 'boolean',
        'schedule_hr3_completed_at' => 'datetime',
        'schedule_hr3_auto' => 'boolean',
        'documents_admin' => 'boolean',
        'documents_admin_completed_at' => 'datetime',
        'equipment_logistics' => 'boolean',
        'equipment_logistics_completed_at' => 'datetime',
        'all_completed' => 'boolean',
        'completed_at' => 'datetime',
    ];

    protected $appends = [
        'checklist_items',
        'completion_percentage',
    ];

    /**
     * Get the applicant associated with this checklist
     */
    public function applicant()
    {
        return $this->belongsTo(Applicant::class);
    }

    /**
     * Check if all items are completed and update status
     */
    public function checkAndUpdateCompletion(): void
    {
        $allCompleted = $this->training_hr2 &&
                       $this->offer_compensation_hr4 &&
                       $this->schedule_hr3 &&
                       $this->documents_admin &&
                       $this->equipment_logistics;

        if ($allCompleted && !$this->all_completed) {
            $this->update([
                'all_completed' => true,
                'completed_at' => now(),
            ]);

            // Update applicant status to "hired"
            $this->applicant->update(['status' => 'hired']);
        }
    }

    /**
     * Get completion percentage
     */
    public function getCompletionPercentageAttribute(): int
    {
        $total = 5;
        $completed = 0;

        if ($this->training_hr2) $completed++;
        if ($this->offer_compensation_hr4) $completed++;
        if ($this->schedule_hr3) $completed++;
        if ($this->documents_admin) $completed++;
        if ($this->equipment_logistics) $completed++;

        return round(($completed / $total) * 100);
    }

    /**
     * Get checklist items as array
     */
    public function getChecklistItemsAttribute(): array
    {
        return [
            [
                'key' => 'training_hr2',
                'task' => 'Training',
                'department' => 'HR2 - Training',
                'completed' => $this->training_hr2,
                'completed_at' => $this->training_hr2_completed_at,
                'completed_by' => $this->training_hr2_completed_by,
                'auto_checked' => $this->training_hr2_auto,
                'required' => true,
            ],
            [
                'key' => 'offer_compensation_hr4',
                'task' => 'Offer acceptance & Compensation Data entry',
                'department' => 'HR4 - Payroll',
                'completed' => $this->offer_compensation_hr4,
                'completed_at' => $this->offer_compensation_hr4_completed_at,
                'completed_by' => $this->offer_compensation_hr4_completed_by,
                'auto_checked' => $this->offer_compensation_hr4_auto,
                'required' => true,
            ],
            [
                'key' => 'schedule_hr3',
                'task' => 'Get the Schedule of work',
                'department' => 'HR3 - Attendance',
                'completed' => $this->schedule_hr3,
                'completed_at' => $this->schedule_hr3_completed_at,
                'completed_by' => $this->schedule_hr3_completed_by,
                'auto_checked' => $this->schedule_hr3_auto,
                'required' => true,
            ],
            [
                'key' => 'documents_admin',
                'task' => 'Create user account and archive documents',
                'department' => 'Administrative',
                'completed' => $this->documents_admin,
                'completed_at' => $this->documents_admin_completed_at,
                'completed_by' => $this->documents_admin_completed_by,
                'auto_checked' => $this->applicant && $this->applicant->hasAccount(),
                'has_account' => $this->applicant ? $this->applicant->hasAccount() : false,
                'required' => true,
            ],
            [
                'key' => 'equipment_logistics',
                'task' => 'ID, Uniform, tools',
                'department' => 'Logistics',
                'completed' => $this->equipment_logistics,
                'completed_at' => $this->equipment_logistics_completed_at,
                'completed_by' => $this->equipment_logistics_completed_by,
                'auto_checked' => false,
                'required' => true,
            ],
        ];
    }
}
