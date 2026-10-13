import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { SuperAdminSidebar } from './Sidebar';
import { SuperAdminTopNavbar } from './TopNavbar';

export const SuperAdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. LEFT SIDEBAR (Student & Coursera Design System)             */}
      {/* ───────────────────────────────────────────────────────────── */}
      <SuperAdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. MAIN COLUMN (Top Header + Viewport + Academic Footer)      */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        <SuperAdminTopNavbar toggleSidebar={toggleSidebar} />

        <main className="flex-1 w-full max-w-[1560px] mx-auto px-4 md:px-8 lg:px-10 py-8">
          <Outlet />
        </main>

        {/* Academic Footer matching Student, Instructor & Admin */}
        <footer className="bg-white border-t border-slate-200/90 mt-auto w-full">
          <div className="w-full max-w-[1560px] mx-auto px-4 md:px-8 lg:px-10 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#0056D2] flex items-center justify-center text-white">
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-xs text-slate-800">NexusEdu Platform Super Administration</span>
              </div>
              <span className="hidden sm:inline text-slate-300 text-xs">•</span>
              <p className="text-xs text-slate-500">
                © 2026 NexusEdu Enterprise. Level 1 Platform Governance, 85/15 Commission & Tenant Management.
              </p>
            </div>

            <div className="flex items-center gap-6 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Root Governance Active
              </span>
              <Link to="/super-admin/payments" className="hover:text-slate-900 transition-colors">
                Treasury
              </Link>
              <Link to="/super-admin/settings" className="hover:text-slate-900 transition-colors">
                Settings
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
