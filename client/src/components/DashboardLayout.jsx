import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function DashboardLayout({ children, menuItems, roleName, pageTitle }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar ẩn hiện dựa trên state */}
      {isSidebarOpen && <Sidebar menuItems={menuItems} roleName={roleName} />}
      
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title={pageTitle} toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
        
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}