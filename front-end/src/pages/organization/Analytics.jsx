import React from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, CheckCircle2, CreditCard } from 'lucide-react';
import OrgLayout from '../../components/organization/OrgLayout';
import { useRemoteData } from '../../hooks/useRemoteData';
import { AdminHeader, AdminMetric, AdminDataState, AdminSectionHeader, AdminEmpty } from '../../components/admin/AdminUI';
import { money, currencyLabel } from '../../utils/adminDisplay';
export default function Analytics({dashboardStyle=false}) {
 const state=useRemoteData('/analytics/organization');const data=state.data;
 const content=<div className="admin-page"><AdminHeader title={dashboardStyle?"Overview":"Analytics"}/><AdminDataState {...state}/>{data&&!state.error&&<><div className="admin-stats-grid"><AdminMetric icon={Users} label="Enrollments" value={data.kpis.totalEnrollments}/><AdminMetric icon={Users} label="Learners" value={data.kpis.activeLearners}/><AdminMetric icon={BookOpen} label="Courses" value={data.stats.courses}/><AdminMetric icon={CheckCircle2} label="Completion rate" value={`${data.kpis.completionRate}%`}/></div><section className="admin-card"><AdminSectionHeader title="Recorded learner payments"/><div className="admin-grid">{data.revenueTotals.map(g=><div key={g.currency||'unknown'} className="finance-summary-card"><CreditCard size={20}/><h3 className="mt-4">{currencyLabel(g.currency)}</h3><strong className="block text-2xl mt-3">{money(g.amount,g.currency)}</strong></div>)}</div>{!data.revenueTotals.length&&<AdminEmpty title="No completed payments"/>}</section><section className="admin-card"><AdminSectionHeader title="Course categories"><Link to="/org/courses" className="admin-button">View courses</Link></AdminSectionHeader><div className="admin-grid">{data.categoryBreakdown.map(c=><article key={c.category} className="finance-summary-card"><h3>{c.category}</h3><dl className="finance-breakdown"><div><dt>Courses</dt><dd>{c.coursesCount}</dd></div><div><dt>Enrollments</dt><dd>{c.seatsEnrolled}</dd></div></dl></article>)}</div>{!data.categoryBreakdown.length&&<AdminEmpty title="No course categories yet"/>}</section></>}</div>;
 return dashboardStyle?content:<OrgLayout breadcrumbs={[{label:'Analytics'}]}>{content}</OrgLayout>;
}
