<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Drop the existing table if it exists
        Schema::dropIfExists('interviews');
        
        // Create the new table with correct structure
        Schema::create('interviews', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('applicant_id');
            $table->date('date');
            $table->string('time')->nullable();
            $table->string('type')->nullable();
            $table->text('notes')->nullable();
            $table->string('status')->default('scheduled');
            $table->string('result')->nullable();
            $table->timestamp('completed_date')->nullable();
            $table->timestamps();
            
            // Remove foreign key constraint for now to allow interview creation
            // $table->foreign('applicant_id')->references('id')->on('applicants')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('interviews');
    }
};
