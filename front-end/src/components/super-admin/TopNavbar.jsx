import React from 'react';
import { Menu, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRemoteData } from '../../hooks/useRemoteData';
import NotificationBell from '../workspace/NotificationBell';
export const SuperAdminTopNavbar=({toggleSidebar})=>{
 const session=useRemoteData('/workspace/session');
 return <header className="workspace-topbar"><div className="flex items-center gap-3"><button className="lg:hidden" aria-label="Open navigation" onClick={toggleSidebar}><Menu size={20}/></button><span>Super Admin</span></div><div className="flex items-center gap-4"><NotificationBell/><Link to="/super-admin/settings" aria-label="Settings"><Settings size={18}/></Link><span className="workspace-avatar">{session.data?.name?.charAt(0)||'·'}</span><div className="hidden sm:block"><strong className="block text-xs font-medium">{session.data?.name||'Loading…'}</strong><small className="block text-[10px] text-slate-500 mt-1">{session.data?.email||''}</small></div></div></header>;
};
export default SuperAdminTopNavbar;
