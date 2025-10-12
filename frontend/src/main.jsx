import './index.css'
import React from 'react';
import { createRoot } from 'react-dom/client'

import Hr1Dashboard from './hr1/dashboard';
import Hr1ApplicantPage from "./hr1/applicant";
import Hr1InterviewPage from "./hr1/interview"; 
import Hr1Recruitment from "./hr1/recruitment";
import Hr1Onboarding from "./hr1/onboarding";
import Hr1Performance from './hr1/performance.jsx'
import Hr1Feedback from './hr1/feedback.jsx';
import Hr1Recognition from "./hr1/recognition";
import Hr1JobPosting from "./hr1/jobposting";
import Hr1OfferManagement from "./hr1/offermanagement";
import Hr1HiredEmployees from "./hr1/hired-employees";

// Using the alias to maintain backward compatibility
import { BrowserRouter, Routes, Route } from "react-router";
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from './context/AuthProvider.jsx';
import { ThemeProvider } from "./context/theme-provider"
import { GuestRoute } from './layout/GuestRoute';
import { Layout } from './layout/ProtectedLayout';

import NotFound from './main/not-found';

//console.log('app: src/main.jsx loaded'); 
const baseUrl = import.meta.env.VITE_BASE_URL

createRoot(document.getElementById('root')).render(
  // basename = baseUrl jsut like base value inside vite.config.js
  // Tells BrowserRouter that this is the base URL
  <BrowserRouter basename={baseUrl ? baseUrl : '/'}>
    <AuthProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Toaster richColors />
        <Routes>


          {/** HR1 Protected Routes */}
          <Route
            path="/"
            element={<Layout allowedRoles={['HR1 Admin', 'Super Admin']} />}
          >
            <Route index element={<Hr1Dashboard />} />
            <Route path="applicant" element={<Hr1ApplicantPage />} />
            <Route path="interview" element={<Hr1InterviewPage />} />
            <Route path="recruitment" element={<Hr1Recruitment />} />
            <Route path="jobposting" element={<Hr1JobPosting />} />
            <Route path="onboarding" element={<Hr1Onboarding />} />
            <Route path="performance" element={<Hr1Performance />} />
            <Route path="feedback" element={<Hr1Feedback />} />
            <Route path="recognition" element={<Hr1Recognition />} />
            <Route path="offermanagement" element={<Hr1OfferManagement />} />
            <Route path="hired-employees" element={<Hr1HiredEmployees />} />
          </Route>
          {/**NOT FOUND PAGE AS LAST CHILD OF ROUTES */}
          <Route path='*' element={<NotFound/>}/>
        </Routes>
      </ThemeProvider>
    </AuthProvider>
  </BrowserRouter>
)
