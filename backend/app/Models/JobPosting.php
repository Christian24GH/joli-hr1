<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class JobPosting extends Model
{
    protected $table = 'job_postings';

    protected $fillable = [
        'title',
        'description',
        'location',
        'status',
        'department',
        'employment_type',
        'salary_range',
        'requirements',
        'benefits',
        'application_deadline',
    ];

    /**
     * Sync this job posting to external financial system
     * Configure FINANCIAL_API_URL and FINANCIAL_API_KEY in .env
     */
    public function syncToFinancialSystem(): array
    {
        try {
            $apiUrl = env('FINANCIAL_API_URL');
            $apiKey = env('FINANCIAL_API_KEY');
            
            if (!$apiUrl || !$apiKey) {
                return ['success' => false, 'message' => 'Financial API not configured'];
            }

            $payload = [
                'reference_id' => 'JOB-' . $this->id,
                'type' => 'HR_RECRUITMENT_BUDGET',
                'department' => $this->department,
                'account_code' => env('FINANCIAL_ACCOUNT_CODE', '5100-HR'),
                'amount' => $this->extractMaxSalary(),
                'currency' => 'PHP',
                'description' => "Budget for {$this->title}",
                'metadata' => [
                    'job_title' => $this->title,
                    'employment_type' => $this->employment_type,
                    'salary_range' => $this->salary_range,
                ],
            ];

            $response = Http::timeout(30)
                ->withHeaders([
                    'Authorization' => 'Bearer ' . $apiKey,
                    'Content-Type' => 'application/json',
                ])
                ->post($apiUrl . '/api/budget/allocations', $payload);

            if ($response->successful()) {
                Log::info('Job synced to financial system', ['job_id' => $this->id]);
                return ['success' => true, 'data' => $response->json()];
            }

            throw new \Exception($response->body());
        } catch (\Exception $e) {
            Log::error('Financial sync failed', ['job_id' => $this->id, 'error' => $e->getMessage()]);
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Extract maximum salary from salary_range string
     */
    private function extractMaxSalary(): float
    {
        if (!$this->salary_range) return 0;
        
        preg_match_all('/[\d,]+/', $this->salary_range, $matches);
        if (!empty($matches[0])) {
            $numbers = array_map(fn($n) => (float) str_replace(',', '', $n), $matches[0]);
            return max($numbers);
        }
        return 0;
    }
}

