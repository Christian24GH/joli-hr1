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
        Schema::table('job_postings', function (Blueprint $table) {
            $table->string('department')->nullable()->after('title');
            $table->string('employment_type')->nullable()->after('department');
            $table->string('salary_range')->nullable()->after('employment_type');
            $table->text('requirements')->nullable()->after('description');
            $table->text('benefits')->nullable()->after('requirements');
            $table->date('application_deadline')->nullable()->after('benefits');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('job_postings', function (Blueprint $table) {
            $table->dropColumn(['department', 'employment_type', 'salary_range', 'requirements', 'benefits', 'application_deadline']);
        });
    }
};
