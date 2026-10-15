import React from 'react';
import { Menu, ShieldCheck, Settings, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SuperAdminTopNavbar = ({ toggleSidebar }) => {
  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/90 sticky top-0 z-30 px-4 md:px-8 lg:px-10 flex items-center justify-between shadow-2xs">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl lg:hidden focus:outline-none border border-slate-200"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0056D2] border border-blue-200/80 text-xs font-bold">
            <Shield className="w-3.5 h-3.5 text-[#0056D2]" />
            <span>Super Admin Platform</span>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Platform Active</span>
            <span className="text-[10px] font-bold text-emerald-800">• 85/15 Rule</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Settings Shortcut */}
        <Link
          to="/super-admin/settings"
          className="p-2 text-slate-500 hover:text-[#0056D2] hover:bg-blue-50 rounded-xl transition-colors border border-slate-200/80"
          title="Super Admin Settings"
        >
          <Settings className="w-4 h-4" />
        </Link>

        {/* Super Admin Profile Chip matching Student UI */}
        <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200">
          <img
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80"
            alt="Super Admin Avatar"
            className="w-8 h-8 rounded-full border-2 border-[#0056D2] shadow-2xs object-cover"
          />
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-900 leading-tight">Super Admin</p>
            <p className="text-[10px] text-[#0056D2] font-semibold leading-none mt-0.5">superadmin@platform.io</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default SuperAdminTopNavbar;
