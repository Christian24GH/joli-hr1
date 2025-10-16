<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Change the status column to allow recruitment statuses including onboarding
        DB::statement("ALTER TABLE applicants MODIFY COLUMN status ENUM('pending', 'approved', 'rejected', 'interviewed', 'onboarding', 'hired', 'Active', 'Inactive', 'Terminated', 'Finished') DEFAULT 'pending'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to original enum values
        DB::statement("ALTER TABLE applicants MODIFY COLUMN status ENUM('Active', 'Inactive', 'Terminated', 'Finished') DEFAULT 'Active'");
    }
};
