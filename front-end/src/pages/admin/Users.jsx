import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { GraduationCap, Building2, ArrowRight } from 'lucide-react';
import { api, getItems } from '../../utils/api';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { Pagination } from '../../components/admin/Pagination';
import '../../styles/admin-panels.css';

const PAGE_SIZE = 9;
export const Users = () => {
  const [params, setParams] = useSearchParams();
  const role = params.get('role') === 'Organization' ? 'Organization' : 'Learner';
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    api.get('/users').then(data => setUsers(getItems(data)))
      .catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);
  useEffect(() => setPage(1), [role, search, status]);
  const filtered = users.filter(u => u.role === role && (!status || u.status === status) && `${u.name || ''} ${u.email || ''}`.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return <div className="admin-page">
    <header><h1 className="admin-heading">Users</h1><p className="admin-muted mt-2">Learner enrollments and organization teaching teams.</p></header>
    <div className="grid sm:grid-cols-2 gap-4" role="group" aria-label="Filter users by account type">
      {[['Learner', 'Learners', GraduationCap], ['Organization', 'Organizations', Building2]].map(([value, label, Icon]) => <button key={value} onClick={() => setParams({ role: value })} aria-pressed={role === value} className={`admin-card flex items-center gap-4 text-left transition-colors ${role === value ? 'border-blue-500 bg-blue-50/60 ring-1 ring-blue-200' : 'hover:border-blue-300'}`}><span className="bg-blue-100 text-blue-700 p-3 rounded-xl"><Icon size={22} /></span><span><span className="block text-2xl font-bold text-slate-900">{loading ? '—' : users.filter(u => u.role === value).length}</span><span className="text-sm font-medium text-slate-600">{label}</span></span></button>)}
    </div>
    <div className="flex flex-wrap gap-3">
      <input aria-label="Search users by name or email" className="admin-input flex-1 min-w-48" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or email" />
      <select aria-label="Filter users by status" className="admin-input sm:!w-48" value={status} onChange={e => setStatus(e.target.value)}><option value="">All statuses</option><option>Active</option><option>Suspended</option><option>Pending</option></select>
    </div>
    {error && <p role="alert" className="admin-alert">{error}</p>}
    {loading ? <p className="admin-muted">Loading users…</p> : <>
      <p className="admin-muted">{filtered.length} matching {role === 'Learner' ? 'learners' : 'organizations'}</p>
      <div className="admin-grid">{visible.map(user => <article className="admin-card space-y-4" key={user.id}><div className="flex justify-between items-start gap-3"><h2 className="font-bold text-slate-900">{user.name}</h2><StatusBadge status={user.status || 'Active'} /></div><p className="admin-muted break-all">{user.email || 'Email not recorded'}</p><Link className="inline-flex gap-2 items-center text-sm font-semibold text-blue-700 hover:underline" to={`/admin/users/${user.id}`}>{role === 'Learner' ? 'View enrolled courses' : 'View courses and instructors'}<ArrowRight size={16} /></Link></article>)}</div>
      {!visible.length && <div className="admin-card admin-muted text-center py-10">No accounts match these filters.</div>}
      {totalPages > 1 && <Pagination currentPage={Math.min(page, totalPages)} totalPages={totalPages} onPageChange={setPage} />}
    </>}
  </div>;
};
