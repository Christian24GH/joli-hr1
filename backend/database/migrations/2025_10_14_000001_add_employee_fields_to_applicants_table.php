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
        Schema::table('applicants', function (Blueprint $table) {
            // Check if columns don't exist before adding them
            if (!Schema::hasColumn('applicants', 'employee_code')) {
                $table->string('employee_code', 50)->nullable()->after('id');
            }
            if (!Schema::hasColumn('applicants', 'first_name')) {
                $table->string('first_name', 255)->nullable()->after('employee_code');
            }
            if (!Schema::hasColumn('applicants', 'last_name')) {
                $table->string('last_name', 255)->nullable()->after('first_name');
            }
            if (!Schema::hasColumn('applicants', 'date_of_birth')) {
                $table->date('date_of_birth')->nullable()->after('phone');
            }
            if (!Schema::hasColumn('applicants', 'hire_date')) {
                $table->date('hire_date')->nullable()->after('date_of_birth');
            }
            if (!Schema::hasColumn('applicants', 'probation_end')) {
                $table->date('probation_end')->nullable()->after('hire_date');
            }
            if (!Schema::hasColumn('applicants', 'job_id')) {
                $table->bigInteger('job_id')->nullable()->after('probation_end');
            }
            if (!Schema::hasColumn('applicants', 'department_id')) {
                $table->unsignedBigInteger('department_id')->nullable()->after('job_id');
            }
            if (!Schema::hasColumn('applicants', 'salary')) {
                $table->decimal('salary', 12, 2)->nullable()->after('department_id');
            }
            if (!Schema::hasColumn('applicants', 'employment_type')) {
                $table->enum('employment_type', ['Trainee', 'Contract', 'Regular'])->default('Regular')->after('salary');
            }
            if (!Schema::hasColumn('applicants', 'employee_type')) {
                $table->enum('employee_type', ['Full-time', 'Part-time'])->default('Full-time')->after('employment_type');
            }
            if (!Schema::hasColumn('applicants', 'status')) {
                $table->enum('status', ['Active', 'Inactive', 'Terminated', 'Finished'])->default('Active')->after('employee_type');
            }
            if (!Schema::hasColumn('applicants', 'address')) {
                $table->text('address')->nullable()->after('status');
            }
            if (!Schema::hasColumn('applicants', 'emergency_contact')) {
                $table->string('emergency_contact', 255)->nullable()->after('address');
            }
            if (!Schema::hasColumn('applicants', 'emergency_phone')) {
                $table->string('emergency_phone', 20)->nullable()->after('emergency_contact');
            }
            if (!Schema::hasColumn('applicants', 'tax_id')) {
                $table->string('tax_id', 50)->nullable()->after('emergency_phone');
            }
            if (!Schema::hasColumn('applicants', 'sss_number')) {
                $table->string('sss_number', 20)->nullable()->after('tax_id');
            }
            if (!Schema::hasColumn('applicants', 'philhealth_number')) {
                $table->string('philhealth_number', 20)->nullable()->after('sss_number');
            }
            if (!Schema::hasColumn('applicants', 'pagibig_number')) {
                $table->string('pagibig_number', 20)->nullable()->after('philhealth_number');
            }
            if (!Schema::hasColumn('applicants', 'gender')) {
                $table->enum('gender', ['Male', 'Female'])->nullable()->after('pagibig_number');
            }
            if (!Schema::hasColumn('applicants', 'marital_status')) {
                $table->enum('marital_status', ['Single', 'Married', 'Divorced', 'Widowed'])->nullable()->after('gender');
            }
            if (!Schema::hasColumn('applicants', 'nationality')) {
                $table->string('nationality', 100)->default('Filipino')->after('marital_status');
            }
            if (!Schema::hasColumn('applicants', 'years_of_experience')) {
                $table->integer('years_of_experience')->default(0)->after('nationality');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('applicants', function (Blueprint $table) {
            $columns = [
                'employee_code',
                'first_name',
                'last_name',
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
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('applicants', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
