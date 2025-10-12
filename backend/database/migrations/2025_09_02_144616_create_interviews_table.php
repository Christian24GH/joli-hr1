<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
{
    Schema::create('interviews', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('applicant_id');
        $table->foreign('applicant_id')->references('id')->on('applicants')->onDelete('cascade');
        $table->date('date');
        $table->string('time')->nullable();
        $table->string('type')->nullable();
        $table->text('notes')->nullable();
        $table->string('status')->default('scheduled');
        $table->string('result')->nullable();
        $table->timestamp('completed_date')->nullable();
        $table->timestamps();
    });
}


    public function down(): void
    {
        Schema::dropIfExists('interviews');
    }
};
