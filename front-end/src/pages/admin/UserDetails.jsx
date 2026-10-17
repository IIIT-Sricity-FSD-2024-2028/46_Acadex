import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../utils/api';
import { StatusBadge } from '../../components/admin/StatusBadge';
import '../../styles/admin-panels.css';

export const UserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [action, setAction] = useState(null);
  useEffect(() => {
    let live = true;
    setLoading(true); setUser(null); setAction(null); setError('');
    api.get(`/users/${userId}`).then(data => { if (live) setUser(data); })
      .catch(e => { if (live) setError(e.message); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [userId]);
  async function confirm() {
    setBusy(true); setError(''); setMessage('');
    try {
      if (action === 'delete') {
        await api.delete(`/users/${user.id}`);
        navigate(`/admin/users?role=${user.role}`, { replace: true });
      } else {
        setUser(await api.patch(`/users/${user.id}`, { status: user.status === 'Suspended' ? 'Active' : 'Suspended' }));
        setMessage('Account access updated.');
      }
      setAction(null);
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  const managed = ['Learner', 'Organization'].includes(user?.role);
  return <div className="admin-page">
    <Link className="text-sm font-semibold text-blue-700" to={`/admin/users?role=${user?.role === 'Organization' ? 'Organization' : 'Learner'}`}>← Users</Link>
    {error && <p role="alert" className="admin-alert">{error}</p>}
    {message && <p role="status" className="admin-success">{message}</p>}
    {loading ? <p className="admin-muted">Loading account details…</p> : user && <>
      <header className="admin-card flex flex-wrap justify-between gap-5 items-start">
        <div><p className="admin-muted mb-1">{user.role}</p><h1 className="admin-heading">{user.name}</h1><p className="admin-muted mt-2 break-all">{user.email || 'Email not recorded'}</p><div className="mt-3"><StatusBadge status={user.status || 'Active'} /></div></div>
        {managed && <div className="flex gap-2 flex-wrap"><button onClick={() => setAction('suspend')} disabled={busy} className="admin-button">{user.status === 'Suspended' ? 'Restore access' : 'Suspend account'}</button><button onClick={() => setAction('delete')} disabled={busy} className="admin-button admin-button-danger">Permanently delete</button></div>}
      </header>
      {user.role === 'Learner' && <section className="space-y-4"><h2 className="text-lg font-bold">Enrolled courses · {user.enrollments?.length || 0}</h2><div className="admin-grid">{(user.enrollments || []).map(enrollment => <article className="admin-card space-y-3" key={enrollment.id}><div className="flex justify-between gap-3"><h3 className="font-semibold">{enrollment.course || enrollment.courseTitle}</h3><StatusBadge status={enrollment.status} /></div><p className="admin-muted">{enrollment.organization || 'Independent course'}{enrollment.instructor ? ` · ${enrollment.instructor}` : ''}</p><div className="flex justify-between admin-muted"><span>Progress</span><span>{enrollment.progress ?? 0}%</span></div><progress className="w-full h-2 accent-blue-600" aria-label={`${enrollment.course || enrollment.courseTitle} progress`} value={enrollment.progress || 0} max="100" /><p className="text-xs text-slate-500">Enrolled: {enrollment.enrolledDate || enrollment.enrolledAt?.slice(0, 10) || 'Not recorded'}</p></article>)}</div>{!user.enrollments?.length && <p className="admin-card admin-muted">No enrollments recorded for this learner.</p>}</section>}
      {user.role === 'Organization' && <div className="grid lg:grid-cols-2 gap-6 items-start">
        <section className="admin-card"><h2 className="text-lg font-bold mb-4">Courses · {user.courses?.length || 0}</h2><div className="divide-y divide-slate-100">{(user.courses || []).map(course => <article key={course.id} className="py-4 space-y-2"><Link className="font-semibold text-blue-700 hover:underline" to={`/admin/courses/${course.id}`}>{course.title}</Link><p className="admin-muted">{course.category || 'Uncategorized'}</p><StatusBadge status={course.status} /></article>)}</div>{!user.courses?.length && <p className="admin-muted">No courses recorded.</p>}</section>
        <section className="admin-card"><h2 className="text-lg font-bold mb-4">Instructors · {user.orgInstructors?.length || 0}</h2><div className="divide-y divide-slate-100">{(user.orgInstructors || []).map(instructor => <article key={instructor.id} className="py-4 space-y-2"><h3 className="font-semibold">{instructor.name}</h3><p className="admin-muted break-all">{instructor.email || 'Email not recorded'}</p><p className="admin-muted">{instructor.expertise || instructor.specialization || instructor.department || 'Specialization not recorded'} · {instructor.courses ?? 0} courses</p><StatusBadge status={instructor.status} /></article>)}</div>{!user.orgInstructors?.length && <p className="admin-muted">No instructors recorded.</p>}</section>
      </div>}
      {!managed && <p className="admin-card admin-muted">This account is managed by its organization and cannot be suspended or removed here.</p>}
    </>}
    {action && user && <div className="admin-modal-backdrop"><section role="alertdialog" aria-modal="true" aria-labelledby="account-action-title" className="admin-modal space-y-4"><h2 id="account-action-title" className="text-xl font-bold">{action === 'delete' ? `Permanently delete ${user.name}?` : `${user.status === 'Suspended' ? 'Restore' : 'Suspend'} ${user.name}?`}</h2><p className="admin-muted">{action === 'delete' ? 'This permanently removes the account and its profile. Historical enrollment, certificate and payment records are retained. Instructors are not deleted.' : user.status === 'Suspended' ? 'The account will be able to access its portal again.' : 'The account will lose access until you restore it.'}</p>{error && <p className="admin-alert">{error}</p>}<div className="flex gap-3"><button autoFocus disabled={busy} onClick={confirm} className={`admin-button ${action === 'delete' ? 'admin-button-danger' : 'admin-button-primary'}`}>{busy ? 'Saving…' : action === 'delete' ? 'Confirm permanent deletion' : 'Confirm'}</button><button disabled={busy} onClick={() => setAction(null)} className="admin-button">Cancel</button></div></section></div>}
  </div>;
};
