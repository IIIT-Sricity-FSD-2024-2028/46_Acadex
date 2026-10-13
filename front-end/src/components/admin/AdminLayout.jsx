import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  ShieldCheck,
  Bell,
  Settings,
  ChevronDown,
  LogOut,
  ExternalLink,
  Search,
} from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Avatar } from '../common/Avatar';
import { cn } from '../../utils/cn';

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const profileRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const adminName = localStorage.getItem('user_name') || 'Operational Admin';
  const adminEmail = localStorage.getItem('user_email') || 'admin@nexuspay-platform.io';

  const handleLogout = () => {
    localStorage.removeItem('nexuspay_auth_token');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('nexuspay_active_role');
    localStorage.removeItem('user_role');
    navigate('/signin?role=Admin');
  };

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. LEFT SIDEBAR (Student & Coursera Design System)             */}
      {/* ───────────────────────────────────────────────────────────── */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. MAIN COLUMN (Top Header + Viewport + Academic Footer)      */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
          <div className="w-full px-4 md:px-8 lg:px-10 h-16 flex items-center justify-between gap-4">
            
            {/* Left: Mobile hamburger menu toggle & Status chip */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
                title="Toggle Sidebar"
                aria-label="Toggle Navigation"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0056D2] border border-blue-200/80 text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0056D2]" />
                  <span>NexusEdu Admin Operations</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Operational Governance Active</span>
                </span>
              </div>
            </div>

            {/* Right: Quick Notifications, Settings & Profile Dropdown */}
            <div className="flex items-center gap-3">
              
              {/* Notification Trigger */}
              <Link
                to="/admin/notifications"
                className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Admin Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#0056D2] ring-2 ring-white"></span>
              </Link>

              {/* Settings Shortcut */}
              <Link
                to="/admin/settings"
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors hidden sm:inline-flex"
                title="Platform Settings"
              >
                <Settings className="w-4 h-4" />
              </Link>

              {/* Profile Menu Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
                >
                  <Avatar name={adminName} size="sm" />
                  <div className="hidden md:flex flex-col text-left leading-tight">
                    <span className="text-xs font-bold text-slate-900 truncate max-w-[130px]">{adminName}</span>
                    <span className="text-[10px] text-slate-500 truncate max-w-[130px]">Platform Admin</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-lg py-2 z-50 text-slate-700 animate-in fade-in-50 duration-150">
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                      <p className="text-xs font-bold text-slate-900">{adminName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{adminEmail}</p>
                      <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-[#0056D2] text-[10px] font-bold">
                        <ShieldCheck className="w-3 h-3" />
                        Platform Level 2 Operations
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/admin/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                      >
                        <ShieldCheck className="w-4 h-4 text-slate-400" />
                        Admin Profile
                      </Link>
                      <Link
                        to="/admin/settings"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        Platform Settings
                      </Link>
                      <Link
                        to="/student/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50"
                      >
                        <ExternalLink className="w-4 h-4 text-blue-500" />
                        Switch to Student View
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* MAIN VIEWPORT                                                 */}
        {/* ───────────────────────────────────────────────────────────── */}
        <main className="flex-1 w-full max-w-[1560px] mx-auto px-4 md:px-8 lg:px-10 py-8">
          <Outlet />
        </main>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* ACADEMIC FOOTER (Identical to Student & Instructor)           */}
        {/* ───────────────────────────────────────────────────────────── */}
        <footer className="bg-white border-t border-slate-200/90 mt-auto w-full">
          <div className="w-full max-w-[1560px] mx-auto px-4 md:px-8 lg:px-10 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#0056D2] flex items-center justify-center text-white">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-xs text-slate-800">NexusEdu Platform Administration</span>
              </div>
              <span className="hidden sm:inline text-slate-300 text-xs">•</span>
              <p className="text-xs text-slate-500">
                © 2026 NexusEdu Enterprise. Level 2 Operational Governance & Course Oversight.
              </p>
            </div>

            <div className="flex items-center gap-6 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Platform Active & Synced
              </span>
              <Link to="/admin/reports" className="hover:text-slate-900 transition-colors">
                System Audit
              </Link>
              <Link to="/admin/settings" className="hover:text-slate-900 transition-colors">
                Settings
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
