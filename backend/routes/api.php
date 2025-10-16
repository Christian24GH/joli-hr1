<?php

use App\Http\Controllers\Applicants;
use App\Http\Controllers\Interviews;
use App\Http\Controllers\JobPostings;
use App\Http\Controllers\Financial;
use App\Http\Controllers\Onboarding;
use App\Http\Controllers\UserAccounts;
use Illuminate\Support\Facades\Route;

// Applicants
Route::get('/applicants', [Applicants::class, 'index']);
Route::post('/applicants', [Applicants::class, 'register']);
Route::post('/applicants/register', [Applicants::class, 'register']);
Route::get('/applicants/{id}', [Applicants::class, 'show']);
Route::put('/applicants/update', [Applicants::class, 'update']);
Route::put('/applicants/{id}', [Applicants::class, 'update']);
Route::delete('/applicants/delete', [Applicants::class, 'delete']);
Route::delete('/applicants/{id}', [Applicants::class, 'delete']);

// Interviews
Route::get('/interviews', [Interviews::class, 'index']);
Route::post('/interviews', [Interviews::class, 'store']);
Route::put('/interviews/{id}', [Interviews::class, 'update']);
Route::delete('/interviews/{id}', [Interviews::class, 'delete']);
Route::post('/interviews/{id}/resend-invitation', [Interviews::class, 'resendInvitation']);

// Job Postings
Route::get('/job-postings', [JobPostings::class, 'index']);
Route::get('/job-postings/{id}', [JobPostings::class, 'show']);
Route::post('/job-postings', [JobPostings::class, 'store']);
Route::put('/job-postings/{id}', [JobPostings::class, 'update']);
Route::delete('/job-postings/{id}', [JobPostings::class, 'delete']);

// Financial Integration
Route::get('/financial/metrics', [Financial::class, 'metrics']);
Route::post('/financial/sync-job/{id}', [Financial::class, 'syncJob']);
Route::post('/financial/sync-applicant/{applicantId}/{jobId}', [Financial::class, 'syncApplicant']);

// Onboarding Checklists
Route::get('/onboarding/checklists', [Onboarding::class, 'index']);
Route::get('/onboarding/applicant/{applicantId}', [Onboarding::class, 'getByApplicant']);
Route::post('/onboarding/checklists', [Onboarding::class, 'create']);
Route::put('/onboarding/checklists/{id}/item', [Onboarding::class, 'updateItem']);
Route::delete('/onboarding/checklists/{id}', [Onboarding::class, 'delete']);
Route::post('/onboarding/auto-check', [Onboarding::class, 'autoCheck']);

// User Accounts (Administrative - Account Creation)
Route::post('/accounts/create', [UserAccounts::class, 'createAccount']);
Route::get('/accounts/applicant/{applicantId}', [UserAccounts::class, 'getAccountByApplicant']);
Route::get('/accounts/check/{applicantId}', [UserAccounts::class, 'checkAccount']);
Route::put('/accounts/{userId}', [UserAccounts::class, 'updateAccount']);
Route::delete('/accounts/{userId}', [UserAccounts::class, 'deleteAccount']);

// Test Route
Route::get('/test', function(){
    try {
        return response()->json(["status" => "ok", "service" => "HR1"], 200);
    } catch(\Exception $e) {
        return response()->json(["status" => "error", "message" => $e->getMessage()], 500);
    }
});
