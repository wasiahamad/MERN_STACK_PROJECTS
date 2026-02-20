import { ReactNode } from "react";
import AppSidebar from "./AppSidebar";
import TopNavbar from "./TopNavbar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      {/* Main content area - offset by sidebar width */}
      <div className="pl-[72px] lg:pl-[256px] transition-all duration-300">
        <TopNavbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
