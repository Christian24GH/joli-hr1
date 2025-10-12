<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('onboarding_checklists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('applicant_id')->constrained('applicants')->onDelete('cascade');
            $table->date('start_date')->nullable();
            
            // Checklist items with department connections
            $table->boolean('training_hr2')->default(false);
            $table->timestamp('training_hr2_completed_at')->nullable();
            $table->string('training_hr2_completed_by')->nullable();
            $table->boolean('training_hr2_auto')->default(false); // Auto-checked from HR2
            
            $table->boolean('offer_compensation_hr4')->default(false);
            $table->timestamp('offer_compensation_hr4_completed_at')->nullable();
            $table->string('offer_compensation_hr4_completed_by')->nullable();
            $table->boolean('offer_compensation_hr4_auto')->default(false); // Auto-checked from HR4
            
            $table->boolean('schedule_hr3')->default(false);
            $table->timestamp('schedule_hr3_completed_at')->nullable();
            $table->string('schedule_hr3_completed_by')->nullable();
            $table->boolean('schedule_hr3_auto')->default(false); // Auto-checked from HR3
            
            $table->boolean('documents_admin')->default(false);
            $table->timestamp('documents_admin_completed_at')->nullable();
            $table->string('documents_admin_completed_by')->nullable();
            
            $table->boolean('equipment_logistics')->default(false);
            $table->timestamp('equipment_logistics_completed_at')->nullable();
            $table->string('equipment_logistics_completed_by')->nullable();
            
            // Overall status
            $table->boolean('all_completed')->default(false);
            $table->timestamp('completed_at')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('onboarding_checklists');
    }
};
