<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Applicant;

class Applicants extends Controller
{
    public function index(): JsonResponse
    {
        try {
            $applicants = Applicant::all();
            return response()->json($applicants);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch applicants'], 500);
        }
    }

    public function register(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'employee_code' => 'required|string|unique:applicants',
                'first_name' => 'nullable|string|max:255',
                'last_name' => 'nullable|string|max:255',
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:applicants',
                'phone' => 'required|string|max:20',
                'date_of_birth' => 'nullable|date',
                'hire_date' => 'nullable|date',
                'probation_end' => 'nullable|date',
                'job_id' => 'nullable|integer',
                'department_id' => 'nullable|integer',
                'salary' => 'nullable|numeric',
                'employment_type' => 'nullable|string|max:100',
                'employee_type' => 'nullable|string|max:100',
                'status' => 'nullable|string|max:50',
                'address' => 'nullable|string',
                'emergency_contact' => 'nullable|string|max:255',
                'emergency_phone' => 'nullable|string|max:20',
                'tax_id' => 'nullable|string|max:50',
                'sss_number' => 'nullable|string|max:20',
                'philhealth_number' => 'nullable|string|max:20',
                'pagibig_number' => 'nullable|string|max:20',
                'gender' => 'nullable|string|max:10',
                'marital_status' => 'nullable|string|max:20',
                'nationality' => 'nullable|string|max:100',
                'years_of_experience' => 'nullable|integer',
                // Legacy fields
                'job' => 'nullable|string|max:255',
                'job_title' => 'nullable|string|max:255',
                'department' => 'nullable|string|max:255',
                'emergency_contact_name' => 'nullable|string|max:255',
                'emergency_contact_phone' => 'nullable|string|max:20',
                'emergency_contact_address' => 'nullable|string|max:500',
            ]);

            $applicant = Applicant::create($validated);
            return response()->json($applicant, 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            \Log::error('Failed to create applicant: ' . $e->getMessage(), [
                'exception' => $e,
                'request_data' => $request->all()
            ]);
            return response()->json([
                'error' => 'Failed to create applicant',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function show(string $id): JsonResponse
    {
        try {
            $applicant = Applicant::findOrFail($id);
            return response()->json($applicant);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Applicant not found'], 404);
        }
    }

    public function update(Request $request, string $id = null): JsonResponse
    {
        try {
            // Support both route parameter and request body
            $applicantId = $id ?? $request->input('id');
            $applicant = Applicant::findOrFail($applicantId);
            
            $validated = $request->validate([
                'employee_code' => 'sometimes|string|unique:applicants,employee_code,' . $applicantId,
                'first_name' => 'nullable|string|max:255',
                'last_name' => 'nullable|string|max:255',
                'name' => 'sometimes|string|max:255',
                'email' => 'sometimes|email|unique:applicants,email,' . $applicantId,
                'phone' => 'sometimes|string|max:20',
                'date_of_birth' => 'nullable|date',
                'hire_date' => 'nullable|date',
                'probation_end' => 'nullable|date',
                'job_id' => 'nullable|integer',
                'department_id' => 'nullable|integer',
                'salary' => 'nullable|numeric',
                'employment_type' => 'nullable|string|max:100',
                'employee_type' => 'nullable|string|max:100',
                'status' => 'nullable|string|max:50',
                'address' => 'nullable|string',
                'emergency_contact' => 'nullable|string|max:255',
                'emergency_phone' => 'nullable|string|max:20',
                'tax_id' => 'nullable|string|max:50',
                'sss_number' => 'nullable|string|max:20',
                'philhealth_number' => 'nullable|string|max:20',
                'pagibig_number' => 'nullable|string|max:20',
                'gender' => 'nullable|string|max:10',
                'marital_status' => 'nullable|string|max:20',
                'nationality' => 'nullable|string|max:100',
                'years_of_experience' => 'nullable|integer',
                // Legacy fields
                'job' => 'nullable|string|max:255',
                'job_title' => 'nullable|string|max:255',
                'department' => 'nullable|string|max:255',
                'emergency_contact_name' => 'nullable|string|max:255',
                'emergency_contact_phone' => 'nullable|string|max:20',
                'emergency_contact_address' => 'nullable|string|max:500',
            ]);
            
            $applicant->update($validated);
            return response()->json($applicant);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update applicant'], 500);
        }
    }

    public function delete(Request $request, string $id = null): JsonResponse
    {
        try {
            // Support both route parameter and request body
            $applicantId = $id ?? $request->input('id');
            $applicant = Applicant::findOrFail($applicantId);
            $applicant->delete();
            return response()->json(['message' => 'Applicant deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete applicant'], 500);
        }
    }
}
