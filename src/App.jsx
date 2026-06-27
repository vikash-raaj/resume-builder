import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SubscriptionProvider } from "./context/SubscriptionContext";
import { trackPageView } from "./firebase/analytics";

import RootPage from "./pages/RootPage";
import Dashboard from "./pages/Dashboard";
import BuilderPage from "./pages/BuilderPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import SharedResumePage from "./pages/SharedResumePage";
import JobTrackerPage from "./pages/JobTrackerPage";
import CoverLetterDashboard from "./pages/CoverLetterDashboard";
import CoverLetterBuilder from "./pages/CoverLetterBuilder";
import ResignationLetterPage from "./pages/ResignationLetterPage";
import RecommendationLetterPage from "./pages/RecommendationLetterPage";
import InterviewPrepPage from "./pages/InterviewPrepPage";
import LinkedInOptimizationPage from "./pages/LinkedInOptimizationPage";
import SalaryInsightsPage from "./pages/SalaryInsightsPage";
import ApplicationKitPage from "./pages/ApplicationKitPage";
import ResumeExamplesPage from "./pages/ResumeExamplesPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  useEffect(() => { trackPageView(); }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <SubscriptionProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<RootPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/payment-success" element={<PaymentSuccessPage />} />

            {/* CVs */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/builder" element={<BuilderPage />} />
            <Route path="/builder/:id" element={<BuilderPage />} />

            {/* Cover Letters */}
            <Route path="/cover-letters" element={<CoverLetterDashboard />} />
            <Route path="/cover-letter-builder" element={<CoverLetterBuilder />} />
            <Route path="/cover-letter-builder/:id" element={<CoverLetterBuilder />} />

            {/* Resignation Letters */}
            <Route path="/resignation-letters" element={<ResignationLetterPage />} />
            <Route path="/resignation-letters/:id" element={<ResignationLetterPage />} />

            {/* Recommendation Letters */}
            <Route path="/recommendation-letters" element={<RecommendationLetterPage />} />
            <Route path="/recommendation-letters/:id" element={<RecommendationLetterPage />} />

            {/* Public shared resume */}
            <Route path="/r/:id" element={<SharedResumePage />} />

            {/* Job Tracker */}
            <Route path="/job-tracker" element={<JobTrackerPage />} />

            {/* Career Tools */}
            <Route path="/interview-practice" element={<InterviewPrepPage />} />
            <Route path="/linkedin-optimization" element={<LinkedInOptimizationPage />} />
            <Route path="/salary-insights" element={<SalaryInsightsPage />} />
            <Route path="/application-kit" element={<ApplicationKitPage />} />
            <Route path="/resume-examples" element={<ResumeExamplesPage />} />

            {/* Legacy redirect */}
            <Route path="/photo-library" element={<Dashboard />} />

            {/* 404 catch-all */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </SubscriptionProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
