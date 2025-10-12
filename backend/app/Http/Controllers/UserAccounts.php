<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\User;
use App\Models\Applicant;
use App\Models\OnboardingChecklist;
use Illuminate\Support\Facades\Hash;

class UserAccounts extends Controller
{
    /**
     * Create user account for an applicant
     * This will also auto-check the administrative checklist item
     */
    public function createAccount(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'applicant_id' => 'required|exists:applicants,id',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|string|min:8',
                'role' => 'nullable|string|in:employee,manager,admin',
            ]);

            $applicant = Applicant::findOrFail($validated['applicant_id']);

            // Check if applicant already has an account
            if ($applicant->hasAccount()) {
                return response()->json(['error' => 'Applicant already has a user account'], 400);
            }

            // Create user account
            $user = User::create([
                'applicant_id' => $validated['applicant_id'],
                'name' => $applicant->name,
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => $validated['role'] ?? 'employee',
            ]);

            // Auto-check administrative item in onboarding checklist
            $checklist = OnboardingChecklist::where('applicant_id', $validated['applicant_id'])->first();
            
            if ($checklist) {
                $checklist->update([
                    'documents_admin' => true,
                    'documents_admin_completed_at' => now(),
                    'documents_admin_completed_by' => 'System - Account Created',
                ]);

                // Check if all items are completed
                $checklist->checkAndUpdateCompletion();
            }

            return response()->json([
                'message' => 'User account created successfully',
                'user' => $user->load('applicant'),
                'checklist_updated' => $checklist ? true : false,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to create account: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get user account for an applicant
     */
    public function getAccountByApplicant(string $applicantId): JsonResponse
    {
        try {
            $applicant = Applicant::findOrFail($applicantId);
            $user = $applicant->user;

            if (!$user) {
                return response()->json(['error' => 'No user account found for this applicant'], 404);
            }

            return response()->json([
                'user' => $user,
                'has_account' => true,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch account'], 500);
        }
    }

    /**
     * Check if applicant has an account
     */
    public function checkAccount(string $applicantId): JsonResponse
    {
        try {
            $applicant = Applicant::findOrFail($applicantId);
            
            return response()->json([
                'applicant_id' => $applicantId,
                'has_account' => $applicant->hasAccount(),
                'user' => $applicant->user,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to check account'], 500);
        }
    }

    /**
     * Update user account
     */
    public function updateAccount(Request $request, string $userId): JsonResponse
    {
        try {
            $user = User::findOrFail($userId);
            
            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'email' => 'sometimes|email|unique:users,email,' . $userId,
                'password' => 'sometimes|string|min:8',
                'role' => 'sometimes|string|in:employee,manager,admin',
            ]);

            if (isset($validated['password'])) {
                $validated['password'] = Hash::make($validated['password']);
            }

            $user->update($validated);

            return response()->json([
                'message' => 'User account updated successfully',
                'user' => $user->load('applicant'),
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update account'], 500);
        }
    }

    /**
     * Delete user account
     */
    public function deleteAccount(string $userId): JsonResponse
    {
        try {
            $user = User::findOrFail($userId);
            
            // Uncheck administrative item in onboarding checklist if exists
            if ($user->applicant_id) {
                $checklist = OnboardingChecklist::where('applicant_id', $user->applicant_id)->first();
                
                if ($checklist && $checklist->documents_admin) {
                    $checklist->update([
                        'documents_admin' => false,
                        'documents_admin_completed_at' => null,
                        'documents_admin_completed_by' => null,
                        'all_completed' => false,
                    ]);
                }
            }

            $user->delete();

            return response()->json(['message' => 'User account deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete account'], 500);
        }
    }
}
