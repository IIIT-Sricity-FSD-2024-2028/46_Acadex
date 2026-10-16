import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CreditCard,
  Bell,
  FileText,
  BarChart3,
  Settings,
  Building2,
  Sparkles,
  Layers,
  AlertCircle,
} from 'lucide-react';
import { useOrg } from '../../context/useOrg';
import { useToast } from '../common/Toast';

export default function OrgSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { stats, info } = useOrg();

  const navItems = [
    { name: 'Dashboard', path: '/org/dashboard', icon: LayoutDashboard },
    { name: 'Instructors', path: '/org/instructors', icon: GraduationCap },
    { name: 'Instructor Requests', path: '/org/instructor-requests', icon: BookOpen, badge: (stats.pendingRequests || 0) + (stats.pendingJoinRequests || 0) },
    { name: 'Learners', path: '/org/learners', icon: Users },
    { name: 'Courses', path: '/org/courses', icon: BookOpen },
    { name: 'Enrollments', path: '/org/enrollments', icon: Layers },
    { name: 'Payments', path: '/org/payments', icon: CreditCard },
    { name: 'Analytics', path: '/org/analytics', icon: BarChart3 },
    { name: 'Disputes', path: '/org/disputes', icon: AlertCircle, badge: stats.openDisputes },
    { name: 'Settings', path: '/org/settings', icon: Settings },
    { name: 'Profile', path: '/org/profile', icon: Building2 },
  ];

  const isActive = (path) => {
    if (path === '/org/dashboard' && (location.pathname === '/' || location.pathname === '/org' || location.pathname === '/org/dashboard' || location.pathname === '/dashboard')) return true;
    if (path === '/org/courses' && (location.pathname === '/courses' || location.pathname === '/org/courses')) return true;
    if (path === '/org/instructors' && (location.pathname === '/instructors' || location.pathname === '/org/instructors')) return true;
    if (path === '/org/instructor-requests' && (location.pathname === '/instructor-requests' || location.pathname === '/org/instructor-requests')) return true;
    if (path === '/org/learners' && (location.pathname === '/learners' || location.pathname === '/org/learners')) return true;
    if (path === '/org/enrollments' && (location.pathname === '/enrollments' || location.pathname === '/org/enrollments')) return true;
    if (path === '/org/payments' && (location.pathname === '/payments' || location.pathname === '/org/payments' || location.pathname === '/transactions' || location.pathname === '/org/transactions')) return true;
    if (path === '/org/analytics' && (location.pathname === '/analytics' || location.pathname === '/org/analytics')) return true;
    if (path === '/org/disputes' && (location.pathname === '/disputes' || location.pathname === '/org/disputes' || location.pathname === '/org/raise-dispute' || location.pathname === '/raise-dispute')) return true;
    if (path === '/org/settings' && (location.pathname === '/settings' || location.pathname === '/org/settings')) return true;
    if (path === '/org/profile' && (location.pathname === '/org/profile' || location.pathname === '/profile')) return true;
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-64 bg-[#0F172A] text-white flex flex-col justify-between h-screen sticky top-0 flex-shrink-0 z-30 shadow-2xl border-r border-slate-800/80 select-none">
      
      {/* Sidebar Header / Org Brand */}
      <div>
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <Link to="/org/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#4F46E5] to-[#818CF8] flex items-center justify-center text-white font-black text-sm shadow-md group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm tracking-tight text-white leading-none">
                {info.name ? info.name.split(' ')[0] : 'Loading...'} <span className="text-[#C7D2FE] font-semibold text-xs block mt-0.5">Enterprise Admin</span>
              </h2>
            </div>
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1 max-h-[calc(100vh-170px)] overflow-y-auto custom-scrollbar">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={idx}
                to={item.path}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-colors duration-150 group ${
                  active
                    ? 'bg-[#4F46E5] text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white font-medium'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                  <span className="truncate">{item.name}</span>
                </div>

                {/* Numeric Badge */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-full shadow-xs shrink-0 ${
                    item.name.includes('Dispute') ? 'bg-rose-500 text-white' : 'bg-amber-400 text-amber-950'
                  }`}>
                    {item.badge}
                  </span>
                )}

                {/* Unread Alert Dot */}
                {item.unread !== undefined && item.unread > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-400 ring-2 ring-[#0F172A] shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer / Admin Identity */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/50">
        <div className="p-2.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs">
              {info.name ? info.name.charAt(0).toUpperCase() : '?'}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate leading-none">{info.name || '—'}</p>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">{info.email || '—'}</p>
            </div>
          </div>
          <button
            onClick={() => addToast('Administrative session active & verified.', 'info')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            title="Account Status"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </aside>
  );
}
