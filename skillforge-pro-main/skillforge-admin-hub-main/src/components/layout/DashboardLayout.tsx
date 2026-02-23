import { ReactNode } from "react";
import { useSidebar } from "@/contexts/SidebarContext";
import AppSidebar from "./AppSidebar";
import TopNavbar from "./TopNavbar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { collapsed } = useSidebar();
  
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      {/* Main content area - offset by sidebar width */}
      <div 
        className="transition-all duration-300"
        style={{ paddingLeft: collapsed ? '72px' : '256px' }}
      >
        <TopNavbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
