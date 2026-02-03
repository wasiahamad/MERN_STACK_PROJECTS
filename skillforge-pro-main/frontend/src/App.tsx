import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import Recruiters from "./pages/Recruiters";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Careers from "./pages/Careers";
import Blog from "./pages/Blog";
import Docs from "./pages/Docs";
import Help from "./pages/Help";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import CandidateDashboard from "./pages/dashboard/CandidateDashboard";
import MatchedJobs from "./pages/dashboard/MatchedJobs";
import RecruiterDashboard from "./pages/dashboard/RecruiterDashboard";
import Applications from "./pages/Applications";
import Profile from "./pages/Profile";
import Certificates from "./pages/Certificates";
import DAO from "./pages/DAO";
import Settings from "./pages/Settings";
import NotificationsPage from "./pages/Notifications";
import SkillAssessment from "./pages/SkillAssessment";
import JobAssessment from "./pages/JobAssessment";
import RecruiterJobs from "./pages/recruiter/RecruiterJobs";
import CreateJob from "./pages/recruiter/CreateJob";
import RecruiterJobDetail from "./pages/recruiter/RecruiterJobDetail";
import Candidates from "./pages/recruiter/Candidates";
import CompanyProfile from "./pages/recruiter/CompanyProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/recruiters" element={<Recruiters />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/help" element={<Help />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            
            {/* Candidate Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute requiredRole="candidate">
                <CandidateDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/matched-jobs" element={
              <ProtectedRoute requiredRole="candidate">
                <MatchedJobs />
              </ProtectedRoute>
            } />
            <Route path="/applications" element={
              <ProtectedRoute requiredRole="candidate">
                <Applications />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute requiredRole="candidate">
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/certificates" element={
              <ProtectedRoute requiredRole="candidate">
                <Certificates />
              </ProtectedRoute>
            } />

            <Route path="/assessment/:skillName" element={
              <ProtectedRoute requiredRole="candidate">
                <SkillAssessment />
              </ProtectedRoute>
            } />

            <Route path="/jobs/:id/assessment" element={
              <ProtectedRoute requiredRole="candidate">
                <JobAssessment />
              </ProtectedRoute>
            } />
            
            {/* Shared Protected Routes */}
            <Route path="/dao" element={
              <ProtectedRoute>
                <DAO />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />

            <Route path="/notifications" element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            } />
            
            {/* Recruiter Protected Routes */}
            <Route path="/recruiter/dashboard" element={
              <ProtectedRoute requiredRole="recruiter">
                <RecruiterDashboard />
              </ProtectedRoute>
            } />
            <Route path="/recruiter/jobs" element={
              <ProtectedRoute requiredRole="recruiter">
                <RecruiterJobs />
              </ProtectedRoute>
            } />
            <Route path="/recruiter/jobs/new" element={
              <ProtectedRoute requiredRole="recruiter">
                <CreateJob />
              </ProtectedRoute>
            } />
            <Route path="/recruiter/jobs/:id" element={
              <ProtectedRoute requiredRole="recruiter">
                <RecruiterJobDetail />
              </ProtectedRoute>
            } />
            <Route path="/recruiter/candidates" element={
              <ProtectedRoute requiredRole="recruiter">
                <Candidates />
              </ProtectedRoute>
            } />
            <Route path="/recruiter/company" element={
              <ProtectedRoute requiredRole="recruiter">
                <CompanyProfile />
              </ProtectedRoute>
            } />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
