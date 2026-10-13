import React, { useState, useRef, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { 
  BookOpen, 
  User, 
  Bell, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  ShieldCheck, 
  ChevronDown, 
  ExternalLink,
  GraduationCap
} from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { InstructorSidebar } from "./InstructorSidebar";
import { cn } from "../../../utils/cn";

export function InstructorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const handleSignOut = () => {
    localStorage.removeItem('nexuspay_auth_token');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('nexuspay_active_role');
    localStorage.removeItem('user_role');
    window.location.href = '/signin?role=Instructor';
  };

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. LEFT SIDEBAR (Consistent with Student & Coursera System)   */}
      {/* ───────────────────────────────────────────────────────────── */}
      <InstructorSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. MAIN COLUMN (Top Navbar + Content Viewport + Footer)       */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
          <div className="w-full px-4 md:px-8 lg:px-10 h-16 flex items-center justify-between gap-4">
            
            {/* Left: Hamburger Button (mobile) & Studio Status */}
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
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Instructor Studio</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified Faculty • Stanford University</span>
                </span>
              </div>
            </div>

            {/* Right: Notifications, Settings, and Profile Dropdown */}
            <div className="flex items-center gap-3">
              
              {/* Notifications Button */}
              <Link
                to="/instructor/notifications"
                className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#0056D2] ring-2 ring-white"></span>
              </Link>

              {/* Settings Shortcut */}
              <Link
                to="/instructor/settings"
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors hidden sm:inline-flex"
                title="Studio Settings"
              >
                <Settings className="w-4 h-4" />
              </Link>

              {/* Profile Dropdown Menu */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
                >
                  <Avatar fallback="Dr. Sarah Jenkins" size="sm" />
                  <div className="hidden md:flex flex-col text-left leading-tight">
                    <span className="text-xs font-bold text-slate-900 truncate max-w-[130px]">Dr. Sarah Jenkins</span>
                    <span className="text-[10px] text-slate-500 truncate max-w-[130px]">Senior Faculty</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-lg py-2 z-50 text-slate-700 animate-in fade-in-50 duration-150">
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                      <p className="text-xs font-bold text-slate-900">Dr. Sarah Jenkins</p>
                      <p className="text-[11px] text-slate-500 truncate">s.jenkins@stanford.edu</p>
                      <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-[#0056D2] text-[10px] font-bold">
                        <GraduationCap className="w-3 h-3" />
                        Stanford Dept of EECS
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/instructor/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        Faculty Profile
                      </Link>
                      <Link
                        to="/instructor/settings"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        Studio Settings
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
                        onClick={handleSignOut}
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
        <main className="flex-1 w-full max-w-[1560px] mx-auto px-4 md:px-8 lg:px-10 py-8 space-y-8">
          <Outlet />
        </main>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* ACADEMIC FOOTER (Identical to Student & Admin Design System)   */}
        {/* ───────────────────────────────────────────────────────────── */}
        <footer className="bg-white border-t border-slate-200 mt-auto w-full">
          <div className="w-full max-w-[1560px] mx-auto flex flex-col md:flex-row justify-between items-center py-6 px-4 md:px-8 lg:px-10 gap-4">
            <div className="flex flex-col md:flex-row items-center gap-3 text-center md:text-left">
              <Link to="/instructor/dashboard" className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-[#0056D2] flex items-center justify-center text-white shadow-xs">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-sm text-slate-900">
                  NexusEdu Studio
                </span>
              </Link>
              <span className="hidden md:inline text-slate-300 text-xs">•</span>
              <p className="text-xs text-slate-500 font-medium">
                © 2026 NexusEdu Platform. Academic Instructor Studio & Course Governance.
              </p>
            </div>

            <nav className="flex flex-wrap justify-center gap-4 md:gap-6 text-xs font-bold text-slate-600">
              <Link to="/instructor/dashboard" className="hover:text-[#0056D2] transition-colors">
                Studio
              </Link>
              <Link to="/instructor/courses" className="hover:text-[#0056D2] transition-colors">
                Courses
              </Link>
              <Link to="/instructor/students" className="hover:text-[#0056D2] transition-colors">
                Enrolled Learners
              </Link>
              <Link to="/instructor/analytics" className="hover:text-[#0056D2] transition-colors">
                Analytics
              </Link>
              <Link to="/instructor/profile" className="hover:text-[#0056D2] transition-colors">
                Faculty Profile
              </Link>
            </nav>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default InstructorLayout;
