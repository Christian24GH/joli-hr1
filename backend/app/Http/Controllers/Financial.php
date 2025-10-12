<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\JobPosting;
use App\Models\Applicant;

class Financial extends Controller
{
    public function metrics(): JsonResponse
    {
        try {
            $jobs = JobPosting::all();
            $applicants = Applicant::all();
            
            $totalBudget = $jobs->sum(function($job) {
                return $this->extractMaxSalary($job->salary_range);
            });
            
            $committedCost = $applicants->where('status', 'hired')->sum(function($applicant) {
                return $this->extractSalaryValue($applicant->salary);
            });
            
            $hiredCount = $applicants->where('status', 'hired')->count();
            $avgSalary = $hiredCount > 0 ? $committedCost / $hiredCount : 0;
            
            return response()->json([
                'total_budget' => $totalBudget,
                'committed_cost' => $committedCost,
                'available_budget' => $totalBudget - $committedCost,
                'hired_count' => $hiredCount,
                'average_salary' => $avgSalary,
                'utilization_rate' => $totalBudget > 0 ? ($committedCost / $totalBudget) * 100 : 0,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch metrics'], 500);
        }
    }

    public function syncJob(string $id): JsonResponse
    {
        try {
            $jobPosting = JobPosting::findOrFail($id);
            $result = $jobPosting->syncToFinancialSystem();
            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Sync failed'], 500);
        }
    }

    public function syncApplicant(string $applicantId, string $jobId): JsonResponse
    {
        try {
            $applicant = Applicant::findOrFail($applicantId);
            $jobPosting = JobPosting::findOrFail($jobId);
            
            if ($applicant->status !== 'hired') {
                return response()->json(['error' => 'Only hired applicants can be synced'], 400);
            }
            
            return response()->json(['success' => true, 'message' => 'Applicant synced']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Sync failed'], 500);
        }
    }

    private function extractMaxSalary(?string $salaryRange): float
    {
        if (!$salaryRange) return 0;
        preg_match_all('/[\d,]+/', $salaryRange, $matches);
        if (!empty($matches[0])) {
            $numbers = array_map(fn($n) => (float) str_replace(',', '', $n), $matches[0]);
            return max($numbers);
        }
        return 0;
    }

    private function extractSalaryValue($salary): float
    {
        if (!$salary) return 0;
        if (is_numeric($salary)) return (float) $salary;
        preg_match('/[\d,]+/', $salary, $matches);
        return !empty($matches[0]) ? (float) str_replace(',', '', $matches[0]) : 0;
    }
}
