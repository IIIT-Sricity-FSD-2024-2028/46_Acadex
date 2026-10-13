import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
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
  ExternalLink,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  X,
} from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { cn } from '../../../utils/cn';

const instructorNavGroups = [
  {
    title: 'Core Studio',
    items: [
      { name: 'Dashboard', href: '/instructor/dashboard', icon: LayoutDashboard },
      { name: 'My Courses', href: '/instructor/courses', icon: BookOpen },
      { name: 'Students', href: '/instructor/students', icon: Users },
    ],
  },
  {
    title: 'Teaching Insights',
    items: [
      { name: 'Reviews & Feedback', href: '/instructor/reviews', icon: MessageSquare },
      { name: 'Analytics', href: '/instructor/analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Account & Operations',
    items: [
      { name: 'Notifications', href: '/instructor/notifications', icon: Bell },
      { name: 'Studio Settings', href: '/instructor/settings', icon: Settings },
      { name: 'Faculty Profile', href: '/instructor/profile', icon: User },
    ],
  },
];

export function InstructorSidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();

  const handleSignOut = () => {
    localStorage.removeItem('nexuspay_auth_token');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('nexuspay_active_role');
    localStorage.removeItem('user_role');
    window.location.href = '/signin?role=Instructor';
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-white text-slate-900 border-r border-slate-200/90 select-none">
      <div>
        {/* Brand Header matching Student UI */}
        <div className="h-16 px-5 border-b border-slate-200/90 flex items-center justify-between">
          <Link
            to="/instructor/dashboard"
            onClick={() => {
              if (isOpen && toggleSidebar) toggleSidebar();
            }}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-xl bg-[#0056D2] flex items-center justify-center text-white shadow-xs group-hover:bg-[#00419E] transition-colors">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                Nexus<span className="text-[#0056D2]">Edu</span>
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#0056D2] border border-blue-200/80">
                Instructor
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
          {instructorNavGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-1">
                {group.title}
              </p>
              {group.items.map((item) => {
                const isActive =
                  location.pathname === item.href ||
                  (item.href === '/instructor/dashboard' && location.pathname === '/instructor') ||
                  (item.href !== '/instructor/dashboard' && location.pathname.startsWith(item.href));
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
          <Avatar fallback="Dr. Sarah Jenkins" size="sm" />
          <div className="flex-1 min-w-0 leading-tight">
            <p className="text-xs font-bold text-slate-900 truncate">Dr. Sarah Jenkins</p>
            <p className="text-[10px] text-slate-500 truncate">Stanford Dept of EECS</p>
          </div>
          <button
            onClick={handleSignOut}
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
}

export default InstructorSidebar;
