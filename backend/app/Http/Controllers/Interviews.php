<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Interview;
use App\Mail\InterviewInvitation;
use Illuminate\Support\Facades\Mail;

class Interviews extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            $q = $request->input('q');
            $query = Interview::with('applicant');
            
            if ($q) {
                $query->whereHas('applicant', function($query) use ($q) {
                    $query->where('name', 'like', "%{$q}%")
                          ->orWhere('email', 'like', "%{$q}%");
                })->orWhere('status', 'like', "%{$q}%");
            }
            
            // Latest first (newest on top)
            $interviews = $query->orderBy('created_at', 'desc')->get();
            return response()->json($interviews);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch interviews'], 500);
        }
    }
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'applicant_id' => 'required|integer|exists:applicants,id',
                'date' => 'required|date',
                'time' => 'nullable|string',
                'type' => 'nullable|string|max:100',
                'address' => 'nullable|string',
                'notes' => 'nullable|string',
                'status' => 'required|string|max:50',
                'send_email' => 'nullable|boolean',
            ]);
            
            $interview = Interview::create($validated);
            $interview->load('applicant');

            // Send email invitation if requested
            if ($request->input('send_email', true) && $interview->applicant && $interview->applicant->email) {
                try {
                    Mail::to($interview->applicant->email)->send(new InterviewInvitation($interview));
                } catch (\Exception $mailException) {
                    // Log error but don't fail the request
                    \Log::warning('Failed to send interview email: ' . $mailException->getMessage());
                }
            }

            return response()->json([
                'message' => 'Interview scheduled successfully',
                'interview' => $interview,
                'email_sent' => $request->input('send_email', true),
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to create interview: ' . $e->getMessage()], 500);
        }
    }

    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $interview = Interview::findOrFail($id);
            
            $validated = $request->validate([
                'applicant_id' => 'sometimes|integer|exists:applicants,id',
                'date' => 'sometimes|date',
                'time' => 'sometimes|string',
                'type' => 'sometimes|string|max:100',
                'address' => 'sometimes|string',
                'notes' => 'sometimes|string',
                'status' => 'sometimes|string|max:50',
                'result' => 'sometimes|string|max:50',
                'completed_date' => 'sometimes|date',
                'send_email' => 'nullable|boolean',
            ]);
            
            // Check if date or time changed
            $dateChanged = isset($validated['date']) && $validated['date'] != $interview->date;
            $timeChanged = isset($validated['time']) && $validated['time'] != $interview->time;
            
            $interview->update($validated);
            $interview->load('applicant');

            // Send email if date/time changed and send_email is true
            if ($request->input('send_email', false) && ($dateChanged || $timeChanged) && $interview->applicant && $interview->applicant->email) {
                try {
                    Mail::to($interview->applicant->email)->send(new InterviewInvitation($interview));
                } catch (\Exception $mailException) {
                    \Log::warning('Failed to send interview update email: ' . $mailException->getMessage());
                }
            }

            return response()->json([
                'message' => 'Interview updated successfully',
                'interview' => $interview,
                'email_sent' => $request->input('send_email', false) && ($dateChanged || $timeChanged),
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update interview: ' . $e->getMessage()], 500);
        }
    }

    public function delete(string $id): JsonResponse
    {
        try {
            $interview = Interview::findOrFail($id);
            $interview->delete();
            return response()->json(['message' => 'Interview deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete interview'], 500);
        }
    }

    /**
     * Resend interview invitation email
     */
    public function resendInvitation(string $id): JsonResponse
    {
        try {
            $interview = Interview::with('applicant')->findOrFail($id);

            if (!$interview->applicant || !$interview->applicant->email) {
                return response()->json(['error' => 'Applicant email not found'], 400);
            }

            Mail::to($interview->applicant->email)->send(new InterviewInvitation($interview));

            return response()->json([
                'message' => 'Interview invitation sent successfully',
                'sent_to' => $interview->applicant->email,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to send invitation: ' . $e->getMessage()], 500);
        }
    }
}
