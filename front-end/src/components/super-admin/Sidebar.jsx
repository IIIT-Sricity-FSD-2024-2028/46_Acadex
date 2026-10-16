import React, { useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldCheck,
  CreditCard,
  Building2,
  GraduationCap,
  Settings,
  LogOut,
  Shield,
  X,
  Sparkles,
} from 'lucide-react';
import clsx from 'clsx';
import HumanAvatar from '../common/HumanAvatar';

const superAdminNavItems = [
  { name: 'Dashboard', path: '/super-admin/dashboard', icon: LayoutDashboard },
  { name: 'Organizations', path: '/super-admin/organizations', icon: Building2 },
  { name: 'Learners', path: '/super-admin/learners', icon: GraduationCap },
  { name: 'Payments', path: '/super-admin/payments', icon: CreditCard },
  { name: 'Admins', path: '/super-admin/admins', icon: ShieldCheck },
  { name: 'Settings', path: '/super-admin/settings', icon: Settings },
];

export const SuperAdminSidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('nexuspay_auth_token');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('nexuspay_active_role');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_email');
    localStorage.removeItem('nexuspay_student_token');
    setShowLogoutModal(false);
    navigate('/super-admin/login', { replace: true });
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-white text-slate-900 border-r border-slate-200/90 select-none">
      <div>
        {/* Brand Header matching Student UI */}
        <div className="h-16 px-5 border-b border-slate-200/90 flex items-center justify-between">
          <Link
            to="/super-admin/dashboard"
            onClick={() => {
              if (isOpen && toggleSidebar) toggleSidebar();
            }}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-xl bg-[#0056D2] flex items-center justify-center text-white shadow-xs group-hover:bg-[#00419E] transition-colors">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                Nexus<span className="text-[#0056D2]">Edu</span>
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#0056D2] border border-blue-200/80">
                Super Admin
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

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-170px)] scrollbar-thin">
          {superAdminNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (isOpen && toggleSidebar) toggleSidebar();
                }}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-colors duration-150',
                    isActive
                      ? 'bg-blue-50 text-[#0056D2] font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 font-medium'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={clsx('w-5 h-5 shrink-0', isActive ? 'text-[#0056D2]' : 'text-slate-400')} />
                    <span className="truncate">{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Super Admin User Dock matching Student UI */}
      <div className="p-3 border-t border-slate-200/90 bg-slate-50/50">
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="relative">
            <HumanAvatar name="Super Admin" size="sm" className="ring-2 ring-[#0056D2]/30" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></span>
          </div>
          <div className="flex-1 min-w-0 leading-tight">
            <p className="text-xs font-bold text-slate-900 truncate">Super Admin</p>
            <p className="text-[10px] text-slate-500 truncate">Platform Governance L1</p>
          </div>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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
        className={clsx(
          'fixed inset-y-0 left-0 w-64 z-50 lg:hidden transition-transform duration-300 ease-in-out shadow-2xl',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-slate-900 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">Sign Out of Super Admin?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your Super Admin session will be closed safely. You can log back in at any time.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="py-2.5 px-4 rounded-xl text-xs font-bold bg-[#0056D2] text-white hover:bg-[#00419E] shadow-sm transition-all cursor-pointer"
              >
                Confirm Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SuperAdminSidebar;
