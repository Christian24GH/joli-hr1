<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\JobPosting;

class JobPostings extends Controller
{
    public function index(): JsonResponse
    {
        try {
            // Latest first (newest on top)
            $jobPostings = JobPosting::orderBy('created_at', 'desc')->get();
            return response()->json($jobPostings);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch job postings'], 500);
        }
    }

    public function store(Request $request): JsonResponse
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

    public function show(string $id): JsonResponse
    {
        try {
            $jobPosting = JobPosting::findOrFail($id);
            return response()->json($jobPosting);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Job posting not found'], 404);
        }
    }

    public function update(Request $request, string $id): JsonResponse
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
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update job posting'], 500);
        }
    }

    public function delete(string $id): JsonResponse
    {
        try {
            $jobPosting = JobPosting::findOrFail($id);
            $jobPosting->delete();
            return response()->json(['message' => 'Job posting deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete job posting'], 500);
        }
    }
}
