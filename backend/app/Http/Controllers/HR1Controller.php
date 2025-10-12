<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Applicant;
use App\Models\Interview;
use App\Models\JobPosting;
use App\Models\OnboardingChecklist;

class HR1Controller extends Controller
{
    // -------------------- Applicants --------------------
    /**
     * Display a listing of applicants.
     */
    public function applicants(): JsonResponse
    {
        try {
            $applicants = Applicant::all();
            return response()->json($applicants);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch applicants'], 500);
        }
    }

    /**
     * Store a newly created applicant.
     */
    public function storeApplicant(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'employee_code' => 'required|string|unique:applicants',
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:applicants',
                'phone' => 'required|string|max:20',
                'status' => 'nullable|string|max:50',
                'hire_date' => 'nullable|date',
                'job' => 'nullable|string|max:255',
                'job_title' => 'nullable|string|max:255',
                'employment_type' => 'nullable|string|max:100',
                'department' => 'nullable|string|max:255',
                'salary' => 'nullable|string|max:255',
                'emergency_contact_name' => 'nullable|string|max:255',
                'emergency_contact_phone' => 'nullable|string|max:20',
                'emergency_contact_address' => 'nullable|string|max:500',
            ]);

            $applicant = Applicant::create($validated);
            return response()->json($applicant, 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to create applicant'], 500);
        }
    }

    /**
     * Display the specified applicant.
     */
    public function showApplicant(string $id): JsonResponse
    {
        try {
            $applicant = Applicant::findOrFail($id);
            return response()->json($applicant);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'Applicant not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch applicant'], 500);
        }
    }

    /**
     * Update the specified applicant.
     */
    public function updateApplicant(Request $request, string $id): JsonResponse
    {
        try {
            $applicant = Applicant::findOrFail($id);
            
            $validated = $request->validate([
                'employee_code' => 'sometimes|string|unique:applicants,employee_code,' . $id,
                'name' => 'sometimes|string|max:255',
                'email' => 'sometimes|email|unique:applicants,email,' . $id,
                'phone' => 'sometimes|string|max:20',
                'status' => 'nullable|string|max:50',
                'hire_date' => 'nullable|date',
                'job' => 'nullable|string|max:255',
                'job_title' => 'nullable|string|max:255',
                'employment_type' => 'nullable|string|max:100',
                'department' => 'nullable|string|max:255',
                'salary' => 'nullable|string|max:255',
                'emergency_contact_name' => 'nullable|string|max:255',
                'emergency_contact_phone' => 'nullable|string|max:20',
                'emergency_contact_address' => 'nullable|string|max:500',
            ]);

            $applicant->update($validated);
            return response()->json($applicant);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'Applicant not found'], 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update applicant'], 500);
        }
    }

    /**
     * Remove the specified applicant.
     */
    public function deleteApplicant(string $id): JsonResponse
    {
        try {
            $applicant = Applicant::findOrFail($id);
            $applicant->delete();
            return response()->json(['message' => 'Applicant deleted successfully']);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'Applicant not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete applicant'], 500);
        }
    }

    // -------------------- Interviews --------------------
    public function interviews(Request $request): JsonResponse
    {
        try {
            $q = $request->input('q');
            $query = Interview::with('applicant');
            
            if ($q) {
                $query->where('status', 'like', "%$q%")
                      ->orWhereHas('applicant', function($query) use ($q) {
                          $query->where('name', 'like', "%$q%");
                      });
            }
            
            $interviews = $query->orderBy('date', 'asc')->get();
            return response()->json($interviews);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch interviews'], 500);
        }
    }

    public function storeInterview(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'applicant_id' => 'required|integer|exists:applicants,id',
                'date' => 'required|date',
                'time' => 'nullable|string',
                'type' => 'nullable|string|max:100',
                'notes' => 'nullable|string',
                'status' => 'required|string|max:50',
            ]);
            
            $interview = Interview::create($validated);
            return response()->json($interview, 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to create interview: ' . $e->getMessage()], 500);
        }
    }

    public function updateInterview(Request $request, string $id): JsonResponse
    {
        try {
            $interview = Interview::findOrFail($id);
            
            $validated = $request->validate([
                'applicant_id' => 'sometimes|integer|exists:applicants,id',
                'date' => 'sometimes|date',
                'time' => 'sometimes|string',
                'type' => 'sometimes|string|max:100',
                'notes' => 'sometimes|string',
                'status' => 'sometimes|string|max:50',
                'result' => 'sometimes|string|max:50',
                'completed_date' => 'sometimes|date',
            ]);
            
            $interview->update($validated);
            return response()->json($interview);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'Interview not found'], 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update interview: ' . $e->getMessage()], 500);
        }
    }

    public function deleteInterview(string $id): JsonResponse
    {
        try {
            $interview = Interview::findOrFail($id);
            $interview->delete();
            return response()->json(['message' => 'Interview deleted successfully']);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'Interview not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete interview'], 500);
        }
    }

    // -------------------- Job Postings (Offer Management) --------------------
    public function jobs(): JsonResponse
    {
        try {
            $jobPostings = JobPosting::all();
            return response()->json($jobPostings);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch job postings'], 500);
        }
    }

    public function storeJob(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'department' => 'required|string|max:255',
                'location' => 'required|string|max:255',
                'employment_type' => 'required|string|max:100',
                'salary_range' => 'nullable|string|max:100',
                'description' => 'required|string',
                'requirements' => 'required|string',
                'benefits' => 'nullable|string',
                'application_deadline' => 'nullable|date',
                'status' => 'nullable|string|max:50',
            ]);

            $jobPosting = JobPosting::create($validated);
            return response()->json($jobPosting, 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to create job posting'], 500);
        }
    }

    public function showJob(string $id): JsonResponse
    {
        try {
            $jobPosting = JobPosting::findOrFail($id);
            return response()->json($jobPosting);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'Job posting not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch job posting'], 500);
        }
    }

    public function updateJob(Request $request, string $id): JsonResponse
    {
        try {
            $jobPosting = JobPosting::findOrFail($id);
            
            $validated = $request->validate([
                'title' => 'sometimes|string|max:255',
                'department' => 'sometimes|string|max:255',
                'location' => 'sometimes|string|max:255',
                'employment_type' => 'sometimes|string|max:100',
                'salary_range' => 'nullable|string|max:100',
                'description' => 'sometimes|string',
                'requirements' => 'sometimes|string',
                'benefits' => 'nullable|string',
                'application_deadline' => 'nullable|date',
                'status' => 'nullable|string|max:50',
            ]);

            $jobPosting->update($validated);
            return response()->json($jobPosting);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'Job posting not found'], 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update job posting'], 500);
        }
    }

    public function deleteJob(string $id): JsonResponse
    {
        try {
            $jobPosting = JobPosting::findOrFail($id);
            $jobPosting->delete();
            return response()->json(['message' => 'Job posting deleted successfully']);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'Job posting not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete job posting'], 500);
        }
    }

    // -------------------- Financial Integration --------------------
    
    /**
     * Get financial metrics for offer management
     * Returns budget, costs, and department breakdown
     */
    public function getFinancialMetrics(): JsonResponse
    {
        try {
            $jobs = JobPosting::all();
            $applicants = Applicant::all();
            
            // Calculate total budget from job postings
            $totalBudget = $jobs->sum(function($job) {
                return $this->extractMaxSalary($job->salary_range);
            });
            
            // Calculate committed costs from hired applicants
            $committedCost = $applicants->where('status', 'hired')->sum(function($applicant) {
                return $this->extractSalaryValue($applicant->salary);
            });
            
            $hiredCount = $applicants->where('status', 'hired')->count();
            $avgSalary = $hiredCount > 0 ? $committedCost / $hiredCount : 0;
            
            // Department breakdown
            $departmentMetrics = $this->calculateDepartmentMetrics($jobs, $applicants);
            
            return response()->json([
                'total_budget' => $totalBudget,
                'committed_cost' => $committedCost,
                'available_budget' => $totalBudget - $committedCost,
                'hired_count' => $hiredCount,
                'average_salary' => $avgSalary,
                'utilization_rate' => $totalBudget > 0 ? ($committedCost / $totalBudget) * 100 : 0,
                'department_metrics' => $departmentMetrics,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch metrics: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Sync job posting to external financial system
     * Requires FINANCIAL_API_URL and FINANCIAL_API_KEY in .env
     */
    public function syncJobToFinancial(string $id): JsonResponse
    {
        try {
            $jobPosting = JobPosting::findOrFail($id);
            $result = $jobPosting->syncToFinancialSystem();
            
            return response()->json($result, $result['success'] ? 200 : 500);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'Job posting not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Sync failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Sync hired applicant to financial system
     */
    public function syncApplicantToFinancial(string $applicantId, string $jobId): JsonResponse
    {
        try {
            $applicant = Applicant::findOrFail($applicantId);
            $jobPosting = JobPosting::findOrFail($jobId);
            
            if ($applicant->status !== 'hired') {
                return response()->json(['error' => 'Only hired applicants can be synced'], 400);
            }
            
            $apiUrl = env('FINANCIAL_API_URL');
            $apiKey = env('FINANCIAL_API_KEY');
            
            if (!$apiUrl || !$apiKey) {
                return response()->json(['error' => 'Financial API not configured'], 500);
            }

            $payload = [
                'reference_id' => 'EMP-' . $applicant->id,
                'type' => 'EMPLOYEE_SALARY_COST',
                'employee_code' => $applicant->employee_code,
                'employee_name' => $applicant->name,
                'department' => $applicant->department ?? $jobPosting->department,
                'account_code' => env('FINANCIAL_ACCOUNT_CODE', '5100-HR'),
                'amount' => $this->extractSalaryValue($applicant->salary),
                'currency' => 'PHP',
                'frequency' => 'MONTHLY',
                'start_date' => $applicant->hire_date,
                'description' => "Salary for {$applicant->name} - {$applicant->job_title}",
            ];

            $response = \Illuminate\Support\Facades\Http::timeout(30)
                ->withHeaders([
                    'Authorization' => 'Bearer ' . $apiKey,
                    'Content-Type' => 'application/json',
                ])
                ->post($apiUrl . '/api/expenses/employee-costs', $payload);

            if ($response->successful()) {
                return response()->json(['success' => true, 'data' => $response->json()]);
            }

            return response()->json(['success' => false, 'message' => $response->body()], 500);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Sync failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Helper: Extract maximum salary from range string
     */
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

    /**
     * Helper: Extract salary value from applicant
     */
    private function extractSalaryValue($salary): float
    {
        if (!$salary) return 0;
        if (is_numeric($salary)) return (float) $salary;
        
        preg_match('/[\d,]+/', $salary, $matches);
        return !empty($matches[0]) ? (float) str_replace(',', '', $matches[0]) : 0;
    }

    /**
     * Helper: Calculate department metrics
     */
    private function calculateDepartmentMetrics($jobs, $applicants): array
    {
        $deptMap = [];
        
        foreach ($jobs as $job) {
            $dept = $job->department ?? 'Unassigned';
            
            if (!isset($deptMap[$dept])) {
                $deptMap[$dept] = [
                    'department' => $dept,
                    'budgeted' => 0,
                    'committed' => 0,
                    'positions' => 0,
                    'hired' => 0,
                ];
            }
            
            $deptMap[$dept]['budgeted'] += $this->extractMaxSalary($job->salary_range);
            $deptMap[$dept]['positions'] += 1;
        }
        
        foreach ($applicants->where('status', 'hired') as $applicant) {
            $dept = $applicant->department ?? 'Unassigned';
            if (isset($deptMap[$dept])) {
                $deptMap[$dept]['committed'] += $this->extractSalaryValue($applicant->salary);
                $deptMap[$dept]['hired'] += 1;
            }
        }
        
        return array_values($deptMap);
    }

    // -------------------- Onboarding Checklist --------------------
    
    /**
     * Get all onboarding checklists with applicant details
     */
    public function getOnboardingChecklists(): JsonResponse
    {
        try {
            $checklists = OnboardingChecklist::with('applicant')->get();
            
            $formatted = $checklists->map(function($checklist) {
                return [
                    'id' => $checklist->id,
                    'applicant_id' => $checklist->applicant_id,
                    'applicant_name' => $checklist->applicant->name,
                    'applicant_email' => $checklist->applicant->email,
                    'applicant_phone' => $checklist->applicant->phone,
                    'job_title' => $checklist->applicant->job_title,
                    'start_date' => $checklist->start_date,
                    'checklist_items' => $checklist->checklist_items,
                    'completion_percentage' => $checklist->completion_percentage,
                    'all_completed' => $checklist->all_completed,
                    'completed_at' => $checklist->completed_at,
                    'created_at' => $checklist->created_at,
                ];
            });
            
            return response()->json($formatted);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch onboarding checklists: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Create onboarding checklist for an applicant
     */
    public function createOnboardingChecklist(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'applicant_id' => 'required|exists:applicants,id',
                'start_date' => 'nullable|date',
            ]);

            // Check if checklist already exists
            $existing = OnboardingChecklist::where('applicant_id', $validated['applicant_id'])->first();
            if ($existing) {
                return response()->json(['error' => 'Onboarding checklist already exists for this applicant'], 400);
            }

            // Update applicant status to onboarding
            $applicant = Applicant::findOrFail($validated['applicant_id']);
            $applicant->update(['status' => 'onboarding']);

            // Create checklist
            $checklist = OnboardingChecklist::create([
                'applicant_id' => $validated['applicant_id'],
                'start_date' => $validated['start_date'] ?? now(),
            ]);

            return response()->json([
                'message' => 'Onboarding checklist created successfully',
                'data' => $checklist->load('applicant'),
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to create checklist: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Update a checklist item (manual check/uncheck)
     */
    public function updateChecklistItem(Request $request, string $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'item_key' => 'required|string|in:training_hr2,offer_compensation_hr4,schedule_hr3,documents_admin,equipment_logistics',
                'completed' => 'required|boolean',
                'completed_by' => 'nullable|string',
            ]);

            $checklist = OnboardingChecklist::findOrFail($id);
            
            $itemKey = $validated['item_key'];
            $completedAtKey = $itemKey . '_completed_at';
            $completedByKey = $itemKey . '_completed_by';

            $checklist->update([
                $itemKey => $validated['completed'],
                $completedAtKey => $validated['completed'] ? now() : null,
                $completedByKey => $validated['completed'] ? ($validated['completed_by'] ?? 'Manual') : null,
            ]);

            // Check if all items are completed
            $checklist->checkAndUpdateCompletion();

            return response()->json([
                'message' => 'Checklist item updated successfully',
                'data' => $checklist->fresh()->load('applicant'),
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update item: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Auto-check item from external department (HR2, HR3, HR4)
     * This endpoint will be called by other HR systems
     */
    public function autoCheckFromDepartment(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'applicant_id' => 'required|exists:applicants,id',
                'department' => 'required|string|in:hr2,hr3,hr4',
                'completed_by' => 'nullable|string',
            ]);

            $checklist = OnboardingChecklist::where('applicant_id', $validated['applicant_id'])->first();
            
            if (!$checklist) {
                return response()->json(['error' => 'Onboarding checklist not found for this applicant'], 404);
            }

            // Map department to checklist field
            $fieldMap = [
                'hr2' => 'training_hr2',
                'hr3' => 'schedule_hr3',
                'hr4' => 'offer_compensation_hr4',
            ];

            $itemKey = $fieldMap[$validated['department']];
            $completedAtKey = $itemKey . '_completed_at';
            $completedByKey = $itemKey . '_completed_by';
            $autoKey = $itemKey . '_auto';

            $checklist->update([
                $itemKey => true,
                $completedAtKey => now(),
                $completedByKey => $validated['completed_by'] ?? strtoupper($validated['department']) . ' System',
                $autoKey => true,
            ]);

            // Check if all items are completed
            $checklist->checkAndUpdateCompletion();

            return response()->json([
                'message' => 'Item auto-checked successfully',
                'data' => $checklist->fresh()->load('applicant'),
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to auto-check: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get onboarding checklist for specific applicant
     */
    public function getApplicantChecklist(string $applicantId): JsonResponse
    {
        try {
            $checklist = OnboardingChecklist::where('applicant_id', $applicantId)
                ->with('applicant')
                ->first();

            if (!$checklist) {
                return response()->json(['error' => 'Onboarding checklist not found'], 404);
            }

            return response()->json([
                'id' => $checklist->id,
                'applicant_id' => $checklist->applicant_id,
                'applicant_name' => $checklist->applicant->name,
                'applicant_email' => $checklist->applicant->email,
                'job_title' => $checklist->applicant->job_title,
                'start_date' => $checklist->start_date,
                'checklist_items' => $checklist->checklist_items,
                'completion_percentage' => $checklist->completion_percentage,
                'all_completed' => $checklist->all_completed,
                'completed_at' => $checklist->completed_at,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch checklist: ' . $e->getMessage()], 500);
        }
    }
}
