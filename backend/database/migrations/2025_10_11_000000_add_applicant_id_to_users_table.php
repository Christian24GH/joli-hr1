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
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'applicant_id')) {
                $table->foreignId('applicant_id')->nullable()->after('id')->constrained('applicants')->onDelete('cascade');
            }
            if (!Schema::hasColumn('users', 'role')) {
                $table->string('role')->default('employee')->after('password');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['applicant_id']);
            $table->dropColumn(['applicant_id', 'role']);
        });
    }
};
