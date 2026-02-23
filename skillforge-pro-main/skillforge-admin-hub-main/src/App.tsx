import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SidebarProvider } from "@/contexts/SidebarContext";
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
        <SidebarProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/recruiters" element={<RecruitersPage />} />
            <Route path="/skills" element={<SkillsPage />} />
            <Route path="/assessments" element={<AssessmentsPage />} />
            <Route path="/nft" element={<NFTPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/monetization" element={<MonetizationPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </SidebarProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
