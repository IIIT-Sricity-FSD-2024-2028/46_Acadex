import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BookOpen, Building2, Users, ArrowUpRight, RefreshCw } from 'lucide-react';
import { Pagination } from '../../components/admin/Pagination';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { AdminHeader, AdminEmpty, AdminSearch, AdminDataState } from '../../components/admin/AdminUI';
import { useRemoteData } from '../../hooks/useRemoteData';
import { money, currencyLabel } from '../../utils/adminDisplay';
export const Courses = () => {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [params, setParams] = useSearchParams();
    const status = params.get('status') || '';
    const state = useRemoteData(`/admin/courses?${new URLSearchParams({ search, status, page, limit: 12 })}`);
    return <div className="admin-page">
    <AdminHeader eyebrow="Learning management" title="Course library" description="Every course, its teaching team, and its progress in one place.">
    <Link to="/admin/courses/approval" className="admin-button admin-button-primary">Review submissions<ArrowUpRight size={14}/>
    </Link>
    </AdminHeader>
    <div className="admin-toolbar">
    <AdminSearch value={search} onChange={v => { setSearch(v); setPage(1); }} label="Search courses" placeholder="Search courses, organizations or instructors…"/>
    <select aria-label="Course status" value={status} onChange={e => { setParams(e.target.value ? { status: e.target.value } : {}); setPage(1); }}>
    <option value="">All statuses</option>{[...new Set([status, ...(state.data?.statuses || [])].filter(Boolean))].map(s => <option key={s}>{s}</option>)}</select>
    <button className="admin-icon-button" aria-label="Refresh courses" disabled={state.loading} onClick={state.refresh}>
    <RefreshCw size={16}/>
    </button>
    </div>
    <AdminDataState {...state}/>{!state.loading && !state.error && <>
        <p className="admin-count-label">
        <b>{state.data?.total || 0}</b> courses found</p>
        <div className="admin-grid">{state.data?.items?.map(c => <article key={c.id} className="admin-card admin-record admin-card-link">
            <div className="admin-record-top">
            <span className="admin-icon-tile admin-icon-green">
            <BookOpen size={20}/>
            </span>
            <StatusBadge status={c.status || 'Not recorded'}/>
            </div>
            <p className="admin-record-category">{c.category || 'Uncategorized'}</p>
            <h2 className="text-sm font-semibold leading-6 mt-2">{c.title}</h2>
            <p className="admin-record-meta">
            <Building2 size={13} className="shrink-0"/>{c.organizationName || 'Organization not recorded'}</p>
            <p className="admin-record-meta">
            <Users size={13} className="shrink-0"/>{c.instructors?.map(i => i.name).join(', ') || 'No instructors assigned'}</p>
            <dl className="admin-record-info">
            <div>
            <dt>Enrollments</dt>
            <dd>{c.enrolledCount}</dd>
            </div>
            <div>
            <dt>Curriculum</dt>
            <dd>{c.modulesCount} modules · {c.lessonsCount} lessons</dd>
            </div>
            </dl>
            <div className="admin-record-footer">
            <div>
            <strong className="font-medium">{money(c.price, c.currency)}</strong>
            <small className="block text-[9px] text-[#95a18e] mt-1">{currencyLabel(c.currency)}</small>
            </div>
            <Link to={`/admin/courses/${c.id}`}>View course<ArrowUpRight size={15}/>
            </Link>
            </div>
            </article>)}</div>{!state.data?.items?.length && <AdminEmpty icon={BookOpen} title="No courses found" description="Try a different search or select another course status."/>}<Pagination currentPage={page} totalPages={state.data?.totalPages || 1} onPageChange={setPage}/>
        </>}</div>;
};
