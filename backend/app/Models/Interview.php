<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Interview extends Model
{
    use HasFactory;

    protected $fillable = [
        'applicant_id',
        'date',
        'time',
        'type',
        'address',
        'notes',
        'status',
        'result',
        'completed_date',
    ];

    public function applicant()
    {
        return $this->belongsTo(Applicant::class);
    }
}
