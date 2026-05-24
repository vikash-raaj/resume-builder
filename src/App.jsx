import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import {
  User, Briefcase, MessageCircle, TrendingUp,
} from "lucide-react";

import RootPage from "./pages/RootPage";
import Dashboard from "./pages/Dashboard";
import BuilderPage from "./pages/BuilderPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import CoverLetterDashboard from "./pages/CoverLetterDashboard";
import CoverLetterBuilder from "./pages/CoverLetterBuilder";
import ResignationLetterPage from "./pages/ResignationLetterPage";
import RecommendationLetterPage from "./pages/RecommendationLetterPage";
import ComingSoonPage from "./pages/ComingSoonPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<RootPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

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

          {/* Coming Soon */}
          <Route path="/photo-library" element={
            <ComingSoonPage
              title="Photo Library"
              description="Add a professional headshot to your CV and LinkedIn profile. Choose from our curated library or upload your own photo."
              icon={User}
              accent="bg-pink-50"
              iconColor="text-pink-500"
            />
          } />
          <Route path="/application-kit" element={
            <ComingSoonPage
              title="Application Kit"
              description="Get a complete application kit — CV, cover letter, and references — all matched and ready to send to your dream employer."
              icon={Briefcase}
              accent="bg-yellow-50"
              iconColor="text-yellow-500"
            />
          } />
          <Route path="/interview-practice" element={
            <ComingSoonPage
              title="Interview Practice"
              description="Practice with real interview questions tailored to your role and industry. Get instant AI feedback to sharpen your answers."
              icon={MessageCircle}
              accent="bg-purple-50"
              iconColor="text-purple-500"
            />
          } />
          <Route path="/linkedin-optimization" element={
            <ComingSoonPage
              title="LinkedIn Optimization"
              description="Turn your experience into a strong LinkedIn profile. Optimize your headline, summary, and positioning so the right opportunities find you."
              icon={TrendingUp}
              accent="bg-sky-50"
              iconColor="text-sky-500"
            />
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
