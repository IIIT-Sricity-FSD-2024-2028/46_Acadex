import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderOpen,
  Users,
  GraduationCap,
  UserCheck,
  Building2,
  CreditCard,
  ChevronDown,
  Layers,
  ShieldAlert,
  Award,
  BarChart3,
  FileText,
  Settings,
  Bell,
  Menu,
  X,
  ShieldCheck,
  LogOut,
  ExternalLink,
  Receipt,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { cn } from '../../utils/cn';

const primaryNav = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Courses', href: '/admin/courses', icon: FolderOpen },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Learners', href: '/admin/learners', icon: GraduationCap },
  { name: 'Instructors', href: '/admin/instructors', icon: UserCheck },
  { name: 'Organizations', href: '/admin/organizations', icon: Building2 },
  { name: 'Payments', href: '/admin/payments', icon: CreditCard },
];

const secondaryNav = [
  { name: 'Course Approvals', href: '/admin/courses/approval', icon: BookOpen },
  { name: 'Enrollments', href: '/admin/enrollments', icon: Layers },
  { name: 'Disputes & Support', href: '/admin/disputes', icon: ShieldAlert },
  { name: 'Transactions', href: '/admin/transactions', icon: Receipt },
  { name: 'Refunds', href: '/admin/refunds', icon: RotateCcw },
  { name: 'Certificates', href: '/admin/certificates', icon: Award },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Reports', href: '/admin/reports', icon: FileText },
  { name: 'Platform Settings', href: '/admin/settings', icon: Settings },
];

export const AdminLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const profileRef = useRef(null);
  const moreRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setMoreDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const adminName = localStorage.getItem('user_name') || 'Operational Platform Admin';
  const adminEmail = localStorage.getItem('user_email') || 'admin@nexuspay-platform.io';

  const handleLogout = () => {
    localStorage.removeItem('nexuspay_auth_token');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('nexuspay_active_role');
    localStorage.removeItem('user_role');
    navigate('/signin?role=Admin');
  };

  const isMoreActive = secondaryNav.some(
    (item) => location.pathname === item.href || location.pathname.startsWith(`${item.href}/`)
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* TOP NAVBAR (Exact Student / Coursera-Style Aesthetic)         */}
      {/* ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-2xs">
        <div className="w-full max-w-[1560px] mx-auto px-4 md:px-8 lg:px-12 h-16 flex items-center justify-between gap-4">
          {/* Left: Brand Logo & Navigation */}
          <div className="flex items-center gap-6">
            <Link to="/admin/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-[#0056D2] flex items-center justify-center text-white shadow-xs group-hover:bg-[#00419E] transition-colors">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                  Nexus<span className="text-[#0056D2]">Edu</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#0056D2] border border-blue-200/80">
                  Admin Operations
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center gap-1">
              {primaryNav.map((item) => {
                const isActive =
                  location.pathname === item.href ||
                  (item.href === '/admin/dashboard' && location.pathname === '/admin') ||
                  (item.href !== '/admin/dashboard' && location.pathname.startsWith(item.href));

                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all',
                      isActive
                        ? 'bg-blue-50 text-[#0056D2] shadow-2xs border border-blue-200/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    )}
                  >
                    <Icon className={cn('w-3.5 h-3.5', isActive ? 'text-[#0056D2]' : 'text-slate-400')} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              {/* More Operations Dropdown */}
              <div className="relative" ref={moreRef}>
                <button
                  onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all',
                    isMoreActive
                      ? 'bg-blue-50 text-[#0056D2] shadow-2xs border border-blue-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  )}
                >
                  <Layers className={cn('w-3.5 h-3.5', isMoreActive ? 'text-[#0056D2]' : 'text-slate-400')} />
                  <span>Operations</span>
                  <ChevronDown
                    className={cn(
                      'w-3 h-3 text-slate-400 transition-transform duration-200',
                      moreDropdownOpen && 'rotate-180'
                    )}
                  />
                </button>

                {moreDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                      Secondary Operations
                    </div>
                    {secondaryNav.map((item) => {
                      const isActive = location.pathname.startsWith(item.href);
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setMoreDropdownOpen(false)}
                          className={cn(
                            'flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold transition-colors',
                            isActive
                              ? 'bg-blue-50 text-[#0056D2]'
                              : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                          )}
                        >
                          <Icon className={cn('w-4 h-4', isActive ? 'text-[#0056D2]' : 'text-slate-400')} />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Right: Status Pill & Profile */}
          <div className="flex items-center gap-3">
            {/* Operational Status Pill */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-xs font-medium text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-semibold text-slate-800">Operational Admin</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 text-[11px]">Enterprise LMS</span>
            </div>

            {/* Notification Bell */}
            <Link
              to="/admin/notifications"
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#0056D2] rounded-full ring-2 ring-white"></span>
            </Link>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200"
              >
                <Avatar name={adminName} size="sm" />
                <div className="hidden md:block text-left pr-1">
                  <p className="text-xs font-bold text-slate-800 leading-tight">Admin Console</p>
                  <p className="text-[10px] text-slate-400 leading-tight truncate max-w-[120px]">
                    Operations
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{adminName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{adminEmail}</p>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#0056D2] border border-blue-200">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Level 2 Operational Admin</span>
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/admin/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                    >
                      <UserCheck className="w-4 h-4 text-slate-400" />
                      <span>Admin Profile</span>
                    </Link>
                    <Link
                      to="/admin/settings"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>System Settings</span>
                    </Link>
                    <Link
                      to="/super-admin/dashboard"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50"
                    >
                      <ExternalLink className="w-4 h-4 text-amber-500" />
                      <span>Switch to Super Admin</span>
                    </Link>
                  </div>

                  <div className="border-t border-slate-100 pt-1 mt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 xl:hidden"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-4 max-h-[85vh] overflow-y-auto">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-1">
                Primary Modules
              </p>
              <div className="space-y-1">
                {primaryNav.map((item) => {
                  const isActive = location.pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all',
                        isActive
                          ? 'bg-blue-50 text-[#0056D2] border border-blue-200/60'
                          : 'text-slate-600 hover:bg-slate-50'
                      )}
                    >
                      <Icon className={cn('w-4 h-4', isActive ? 'text-[#0056D2]' : 'text-slate-400')} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-1">
                Extended Operations
              </p>
              <div className="space-y-1">
                {secondaryNav.map((item) => {
                  const isActive = location.pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all',
                        isActive
                          ? 'bg-blue-50 text-[#0056D2] border border-blue-200/60'
                          : 'text-slate-600 hover:bg-slate-50'
                      )}
                    >
                      <Icon className={cn('w-4 h-4', isActive ? 'text-[#0056D2]' : 'text-slate-400')} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MAIN VIEWPORT                                                 */}
      {/* ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 w-full max-w-[1560px] mx-auto px-4 md:px-8 lg:px-12 py-8">
        <Outlet />
      </main>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* ACADEMIC FOOTER (Consistent with Student & Instructor)        */}
      {/* ───────────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-slate-200/90 mt-auto w-full">
        <div className="w-full max-w-[1560px] mx-auto px-4 md:px-8 lg:px-12 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
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
  );
};

export default AdminLayout;
