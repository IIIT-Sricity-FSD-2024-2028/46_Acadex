import { Outlet, Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  MessageSquare, 
  BarChart3, 
  User, 
  Bell, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  ShieldCheck, 
  ChevronDown, 
  Search,
  ExternalLink,
  GraduationCap
} from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { useState, useRef, useEffect } from "react";
import { cn } from "../../../utils/cn";

const navigation = [
  { name: "Dashboard", href: "/instructor/dashboard", icon: LayoutDashboard },
  { name: "My Courses", href: "/instructor/courses", icon: BookOpen },
  { name: "Students", href: "/instructor/students", icon: Users },
  { name: "Reviews", href: "/instructor/reviews", icon: MessageSquare },
  { name: "Analytics", href: "/instructor/analytics", icon: BarChart3 },
];

export function InstructorLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* ───────────────────────────────────────────────────────────── */}
      {/* TOP NAVBAR (Exact Student-Consistent Layout & Aesthetic)       */}
      {/* ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-2xs">
        <div className="w-full max-w-[1560px] mx-auto px-4 md:px-8 lg:px-12 h-16 flex items-center justify-between gap-4">
          
          {/* Left: Brand & Instructor Studio Label */}
          <div className="flex items-center gap-6">
            <Link to="/instructor/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-[#0056D2] flex items-center justify-center text-white shadow-xs group-hover:bg-[#00419E] transition-colors">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                  Nexus<span className="text-[#0056D2]">Edu</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#0056D2] border border-blue-200/80">
                  Instructor Studio
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => {
                const isActive = 
                  location.pathname === item.href ||
                  (item.href === "/instructor/dashboard" && location.pathname === "/instructor") ||
                  (item.href !== "/instructor/dashboard" && location.pathname.startsWith(item.href));

                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all",
                      isActive
                        ? "bg-blue-50 text-[#0056D2] shadow-2xs border border-blue-200/60"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                    )}
                  >
                    <Icon className={cn("w-4 h-4", isActive ? "text-[#0056D2]" : "text-slate-400")} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Status Pill, Notifications, Settings, and Profile Dropdown */}
          <div className="flex items-center gap-3">
            
            {/* Status Pill matching Student "Verified Student" pill */}
            <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Faculty • Stanford University</span>
            </div>

            {/* Notifications Button */}
            <Link
              to="/instructor/notifications"
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#0056D2] ring-2 ring-white"></span>
            </Link>

            {/* Settings Button */}
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
                <div className="hidden xl:flex flex-col text-left leading-tight">
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
                    <Link
                      to="/"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
              title="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2">
            <div className="mb-3 px-2 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Verified Faculty • Stanford University
            </div>
            {navigation.map((item) => {
              const isActive = 
                location.pathname === item.href ||
                (item.href === "/instructor/dashboard" && location.pathname === "/instructor") ||
                (item.href !== "/instructor/dashboard" && location.pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors",
                    isActive
                      ? "bg-blue-50 text-[#0056D2]"
                      : "text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
            <div className="border-t border-slate-100 pt-2 space-y-1">
              <Link
                to="/instructor/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <User className="w-4 h-4 text-slate-400" />
                Faculty Profile
              </Link>
              <Link
                to="/instructor/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                Studio Settings
              </Link>
              <Link
                to="/student/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-blue-600 hover:bg-blue-50"
              >
                <ExternalLink className="w-4 h-4 text-blue-500" />
                Student Portal
              </Link>
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MAIN VIEWPORT (Matched max-w-[1560px] layout like Student)     */}
      {/* ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 w-full max-w-[1560px] mx-auto px-4 md:px-8 lg:px-12 py-8 space-y-8">
        <Outlet />
      </main>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* ACADEMIC FOOTER (Identical to Student Footer Style)            */}
      {/* ───────────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-slate-200 mt-auto w-full">
        <div className="w-full max-w-[1560px] mx-auto flex flex-col md:flex-row justify-between items-center py-6 px-4 md:px-8 lg:px-12 gap-4">
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
  );
}
