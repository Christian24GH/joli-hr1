// src/config/hr1.js
import { configureEcho } from "@laravel/echo-react"
import Echo from "laravel-echo"

// 🔌 Websocket config for HR1 (Reverb)
const echoConfig = {
  wsPort: 6062, // use a different port than logisticsII (example: 6062)
  wssPort: 6062,
  broadcaster: "reverb",
  key: "your-hr1-app-key-here", // check your HR1 Reverb .env
  wsHost: "localhost",
  forceTLS: window.location.protocol === "https:",
  enabledTransports: ["ws", "wss"],
}

// 🌐 Backend API config for HR1
const backendUri = import.meta.env.VITE_HR1_BACKEND

export const hr1 = {
  reverb: {
    ...echoConfig,
    config: () => configureEcho(echoConfig), // initialize Echo
  },

  backend: {
    uri: backendUri,
    api: {
      applicants: `${backendUri}/api/applicants`,
      registerApplicant: `${backendUri}/api/applicants/register`,
      updateApplicant: `${backendUri}/api/applicants/update`,
      deleteApplicant: `${backendUri}/api/applicants/delete`,
      employees: `${backendUri}/api/employees`,
      positions: `${backendUri}/api/positions`,
      departments: `${backendUri}/api/departments`,

      // ✅ Add interviews API endpoints
      interviews: `${backendUri}/api/interviews`,
      createInterview: `${backendUri}/api/interviews`,
      updateInterview: (id) => `${backendUri}/api/interviews/${id}`,
      deleteInterview: (id) => `${backendUri}/api/interviews/${id}`,
      resendInvitation: (id) => `${backendUri}/api/interviews/${id}/resend-invitation`,

      // ✅ Job Postings API endpoints
      jobPostings: `${backendUri}/api/job-postings`,
      createJobPosting: `${backendUri}/api/job-postings`,
      updateJobPosting: (id) => `${backendUri}/api/job-postings/${id}`,
      deleteJobPosting: (id) => `${backendUri}/api/job-postings/${id}`,

      // ✅ Onboarding API endpoints
      onboarding: `${backendUri}/api/onboarding/checklists`,
      createOnboarding: `${backendUri}/api/onboarding/checklists`,
      updateOnboardingItem: (id) => `${backendUri}/api/onboarding/checklists/${id}/item`,
      autoCheckOnboarding: `${backendUri}/api/onboarding/auto-check`,
      getApplicantOnboarding: (applicantId) => `${backendUri}/api/onboarding/applicant/${applicantId}`,

      // ✅ User Accounts API endpoints (Administrative)
      createAccount: `${backendUri}/api/accounts/create`,
      getAccountByApplicant: (applicantId) => `${backendUri}/api/accounts/applicant/${applicantId}`,
      checkAccount: (applicantId) => `${backendUri}/api/accounts/check/${applicantId}`,
      updateAccount: (userId) => `${backendUri}/api/accounts/${userId}`,
      deleteAccount: (userId) => `${backendUri}/api/accounts/${userId}`,
    },
  },
}
