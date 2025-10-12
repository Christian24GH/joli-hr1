<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\OnboardingChecklist;
use App\Models\Applicant;

class Onboarding extends Controller
{
    public function index(): JsonResponse
    {
        try {
            // Latest first (newest on top)
            $checklists = OnboardingChecklist::with(['applicant', 'applicant.user'])
                ->orderBy('created_at', 'desc')
                ->get();
            
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
            return response()->json(['error' => 'Failed to fetch checklists: ' . $e->getMessage()], 500);
        }
    }

    public function create(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'applicant_id' => 'required|exists:applicants,id',
                'start_date' => 'nullable|date',
            ]);

            $existing = OnboardingChecklist::where('applicant_id', $validated['applicant_id'])->first();
            if ($existing) {
                return response()->json(['error' => 'Checklist already exists'], 400);
            }

            $applicant = Applicant::findOrFail($validated['applicant_id']);
            $applicant->update(['status' => 'onboarding']);

            $checklist = OnboardingChecklist::create([
                'applicant_id' => $validated['applicant_id'],
                'start_date' => $validated['start_date'] ?? now(),
            ]);

            return response()->json($checklist, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to create checklist'], 500);
        }
    }

    public function updateItem(Request $request, string $id): JsonResponse
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

    public function autoCheck(Request $request): JsonResponse
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

    public function getByApplicant(string $applicantId): JsonResponse
    {
        try {
            $checklist = OnboardingChecklist::where('applicant_id', $applicantId)
                ->with(['applicant', 'applicant.user'])
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
