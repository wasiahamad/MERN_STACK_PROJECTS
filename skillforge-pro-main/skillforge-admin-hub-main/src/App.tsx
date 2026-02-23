import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import Index from "./pages/Index";
import UsersPage from "./pages/UsersPage";
import RecruitersPage from "./pages/RecruitersPage";
import SkillsPage from "./pages/SkillsPage";
import AssessmentsPage from "./pages/AssessmentsPage";
import NFTPage from "./pages/NFTPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import MonetizationPage from "./pages/MonetizationPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <SidebarProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/users"
                  element={
                    <ProtectedRoute>
                      <UsersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recruiters"
                  element={
                    <ProtectedRoute>
                      <RecruitersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/skills"
                  element={
                    <ProtectedRoute>
                      <SkillsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/assessments"
                  element={
                    <ProtectedRoute>
                      <AssessmentsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/nft"
                  element={
                    <ProtectedRoute>
                      <NFTPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute>
                      <AnalyticsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/monetization"
                  element={
                    <ProtectedRoute>
                      <MonetizationPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </SidebarProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
