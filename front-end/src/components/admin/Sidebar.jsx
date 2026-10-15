import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderOpen,
  CheckCircle2,
  Users,
  GraduationCap,
  UserCheck,
  Building2,
  CreditCard,
  Receipt,
  RotateCcw,
  Layers,
  ShieldAlert,
  Award,
  BarChart3,
  FileText,
  Bell,
  Settings,
  LogOut,
  ShieldCheck,
  X,
} from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { cn } from '../../utils/cn';

const adminNavGroups = [
  {
    title: 'Academic Operations',
    items: [
      { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Courses Catalog', href: '/admin/courses', icon: FolderOpen },
      { name: 'Course Approvals', href: '/admin/courses/approval', icon: CheckCircle2 },
      { name: 'Users Directory', href: '/admin/users', icon: Users },
      { name: 'Learners', href: '/admin/learners', icon: GraduationCap },
      { name: 'Instructors', href: '/admin/instructors', icon: UserCheck },
      { name: 'Organizations', href: '/admin/organizations', icon: Building2 },
    ],
  },
  {
    title: 'Financial Management',
    items: [
      { name: 'Tuition Payments', href: '/admin/payments', icon: CreditCard },
      { name: 'Transactions', href: '/admin/transactions', icon: Receipt },
      { name: 'Refunds', href: '/admin/refunds', icon: RotateCcw },
    ],
  },
  {
    title: 'Governance & Records',
    items: [
      { name: 'Enrollments', href: '/admin/enrollments', icon: Layers },
      { name: 'Disputes & Support', href: '/admin/disputes', icon: ShieldAlert },
      { name: 'Certificates', href: '/admin/certificates', icon: Award },
    ],
  },
  {
    title: 'System Intelligence',
    items: [
      { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
      { name: 'Audit Reports', href: '/admin/reports', icon: FileText },
      { name: 'Notifications', href: '/admin/notifications', icon: Bell },
      { name: 'Platform Settings', href: '/admin/settings', icon: Settings },
    ],
  },
];

export const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();

  const adminName = localStorage.getItem('user_name') || 'Operational Admin';
  const adminEmail = localStorage.getItem('user_email') || 'admin@platform.io';

  const handleLogout = () => {
    localStorage.removeItem('nexuspay_auth_token');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('nexuspay_active_role');
    localStorage.removeItem('user_role');
    window.location.href = '/signin?role=Admin';
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-white text-slate-900 border-r border-slate-200/90 select-none">
      <div>
        {/* Brand Header matching Student UI */}
        <div className="h-16 px-5 border-b border-slate-200/90 flex items-center justify-between">
          <Link
            to="/admin/dashboard"
            onClick={() => {
              if (isOpen && toggleSidebar) toggleSidebar();
            }}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-xl bg-[#0056D2] flex items-center justify-center text-white shadow-xs group-hover:bg-[#00419E] transition-colors">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                Nexus<span className="text-[#0056D2]">Edu</span>
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#0056D2] border border-blue-200/80">
                Admin
              </span>
            </div>
          </Link>

          {/* Close button on mobile */}
          {toggleSidebar && (
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Groups */}
        <nav className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-160px)] scrollbar-thin">
          {adminNavGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-1">
                {group.title}
              </p>
              {group.items.map((item) => {
                const isActive =
                  location.pathname === item.href ||
                  (item.href === '/admin/dashboard' && location.pathname === '/admin') ||
                  (item.href !== '/admin/dashboard' && location.pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={() => {
                      if (isOpen && toggleSidebar) toggleSidebar();
                    }}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all',
                      isActive
                        ? 'bg-blue-50 text-[#0056D2] font-bold shadow-2xs border border-blue-200/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    )}
                  >
                    <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-[#0056D2]' : 'text-slate-400')} />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* User Footer Dock matching Student UI */}
      <div className="p-3 border-t border-slate-200/90 bg-slate-50/50">
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <Avatar name={adminName} size="sm" />
          <div className="flex-1 min-w-0 leading-tight">
            <p className="text-xs font-bold text-slate-900 truncate">{adminName}</p>
            <p className="text-[10px] text-slate-500 truncate">{adminEmail}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 w-64 z-50 lg:hidden transition-transform duration-300 ease-in-out shadow-2xl',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
