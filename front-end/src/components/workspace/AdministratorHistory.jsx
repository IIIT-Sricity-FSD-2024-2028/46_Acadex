import React, { useState } from 'react';
import { useRemoteData } from '../../hooks/useRemoteData';
import { AdminHeader, AdminSearch, AdminDataState, AdminEmpty } from '../admin/AdminUI';
import { StatusBadge } from '../admin/StatusBadge';
import { dateLabel } from '../../utils/adminDisplay';
export function HistoryRecords({data}) {
 return <div className="grid gap-6"><section className="admin-card"><h2 className="text-base font-semibold mb-5">Administrator actions</h2>{data.actions.length?<div className="operations-list">{data.actions.map(a=><article key={a.id}><span className="operations-dot"/><div><h3>{a.action}</h3><p>{a.adminName}{a.details?` · ${a.details}`:''}</p></div><time>{dateLabel(a.date)}</time></article>)}</div>:<p className="admin-muted">No actions recorded yet.</p>}</section><section><h2 className="text-base font-semibold mb-4">Disputes and assigned work</h2><div className="admin-grid">{data.cases.map(c=><article className="admin-card" key={c.id}><div className="flex justify-between gap-3"><span className="admin-record-code">{c.id}</span><StatusBadge status={c.status}/></div><h3 className="font-semibold mt-4 text-sm">{c.subject}</h3><p className="admin-muted mt-3">{c.assignedName?`Handled by ${c.assignedName}`:'Not assigned yet'}</p>{c.resolution&&<p className="admin-muted mt-3 whitespace-pre-wrap">{c.resolution}</p>}<p className="admin-muted mt-3">Updated {dateLabel(c.updatedAt)}</p></article>)}</div>{!data.cases.length&&<AdminEmpty title="No disputes recorded" description="Assigned cases and recorded decisions will appear here."/>}</section></div>;
}
export default function AdministratorHistory(){
 const [adminId,setAdminId]=useState('');const [search,setSearch]=useState('');
 const state=useRemoteData(`/admin/history?${new URLSearchParams({adminId})}`);const data=state.data;
 const filtered=data?{...data,actions:data.actions.filter(a=>`${a.action} ${a.details} ${a.adminName}`.toLowerCase().includes(search.toLowerCase())),cases:data.cases.filter(c=>`${c.id} ${c.subject} ${c.assignedName||''}`.toLowerCase().includes(search.toLowerCase()))}:null;
 return <div className="admin-page"><AdminHeader title="Administrator activity"/><div className="admin-toolbar"><AdminSearch value={search} onChange={setSearch} label="Search administrator activity" placeholder="Search action, case or administrator…"/><label className="activity-filter">Administrator<select className="admin-input mt-2" value={adminId} onChange={e=>setAdminId(e.target.value)}><option value="">Everyone</option>{data?.administrators.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></label></div><AdminDataState {...state}/>{filtered&&!state.error&&<HistoryRecords data={filtered}/>}</div>;
}
