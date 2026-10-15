import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Send, Search, Eye, Check, X, RotateCcw, UserPlus, Inbox } from 'lucide-react';
import OrgLayout from '../../components/organization/OrgLayout';
import HumanAvatar from '../../components/common/HumanAvatar';
import { useOrg } from '../../context/useOrg';
import { useToast } from '../../components/common/Toast';

const isPending = (s) => /pending|sent/i.test(s || '');
const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '');

function StatusPill({ status }) {
  const tone = isPending(status)
    ? 'bg-amber-100 text-amber-900'
    : /accept|approv/i.test(status)
    ? 'bg-emerald-100 text-emerald-800'
    : 'bg-slate-100 text-slate-700';
  return <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${tone}`}>{status}</span>;
}

function matches(req, q) {
  const s = q.trim().toLowerCase();
  return !s || [req.name, req.email, req.courseTitle, req.specialization].some((v) => v?.toLowerCase().includes(s));
}

export default function InstructorRequests() {
  const { addToast } = useToast();
  const { instructorRequests, joinRequests, decideJoinRequest, resendInvitation, withdrawInvitation } = useOrg();
  const [tab, setTab] = useState('join');
  const [filter, setFilter] = useState('Pending');
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [rejectNote, setRejectNote] = useState('');

  const list = tab === 'join' ? joinRequests : instructorRequests;
  const filtered = list.filter(
    (r) =>
      matches(r, search) &&
      (filter === 'All' ||
        (filter === 'Pending' && isPending(r.status)) ||
        (filter === 'Resolved' && !isPending(r.status)))
  );
  const pendingJoin = joinRequests.filter((r) => isPending(r.status)).length;
  const pendingInv = instructorRequests.filter((r) => isPending(r.status)).length;

  const run = async (id, fn, success) => {
    setBusyId(id);
    try {
      await fn();
      addToast(success, 'success');
    } catch (err) {
      addToast(err.message || 'Action failed', 'error');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <OrgLayout
      breadcrumbs={[{ label: 'Instructor Requests' }]}
      actions={
        <Link
          to="/org/assign-courses"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold shadow-sm"
        >
          <Send className="w-4 h-4" /> Invite instructor to a course
        </Link>
      }
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Instructor requests</h1>
          <p className="text-xs text-on-surface-variant mt-0.5 max-w-2xl">
            Instructors who ask to join your organization appear under Join requests — they only become members once you approve.
            Invitations you send to instructors are tracked separately.
          </p>
        </div>

        <div className="flex border-b border-outline-variant gap-6">
          {[
            ['join', 'Join requests', pendingJoin, UserPlus],
            ['invitations', 'Invitations sent', pendingInv, Mail],
          ].map(([id, label, count, Icon]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 -mb-px ${
                tab === id ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
              {count > 0 && <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-900 font-bold">{count} pending</span>}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {['Pending', 'Resolved', 'All'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-bold ${
                  filter === f ? 'bg-primary text-white' : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email or course"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-surface-container-lowest border border-dashed border-outline-variant rounded-3xl p-10 text-center">
            <Inbox className="w-8 h-8 text-outline mx-auto mb-2" />
            <p className="text-sm font-bold text-on-surface">
              {tab === 'join' ? 'No join requests' : 'No invitations'} {filter !== 'All' ? `(${filter.toLowerCase()})` : ''}
            </p>
            <p className="text-xs text-on-surface-variant mt-1">
              {tab === 'join'
                ? 'When an instructor asks to join your organization, it will show up here for approval.'
                : 'Invite an instructor to teach one of your courses from Assign Courses.'}
            </p>
          </div>
        ) : tab === 'join' ? (
          <div className="space-y-3">
            {filtered.map((r) => (
              <div key={r.id} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <HumanAvatar name={r.name} size="md" />
                    <div>
                      <p className="font-bold text-sm text-on-surface">{r.name}</p>
                      <p className="text-[11px] text-outline">
                        {r.email}
                        {r.specialization ? ` • ${r.specialization}` : ''}
                      </p>
                      <p className="text-[11px] text-outline">Requested {fmt(r.createdAt)}</p>
                    </div>
                  </div>
                  <StatusPill status={r.status} />
                </div>
                {r.description && <p className="text-xs text-on-surface bg-surface-container-low rounded-xl p-3">“{r.description}”</p>}
                {r.orgNotes && <p className="text-[11px] text-outline">Your note: {r.orgNotes}</p>}

                {isPending(r.status) &&
                  (rejecting === r.id ? (
                    <div className="space-y-2 p-3 rounded-xl bg-rose-50 border border-rose-200">
                      <textarea
                        value={rejectNote}
                        onChange={(e) => setRejectNote(e.target.value)}
                        maxLength={500}
                        placeholder="Optional reason shared with the instructor"
                        className="w-full text-xs rounded-lg border border-rose-200 px-3 py-2 bg-white resize-none"
                        rows={2}
                      />
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setRejecting(null)} className="px-3 py-1.5 rounded-lg bg-white border text-xs font-semibold">
                          Cancel
                        </button>
                        <button
                          disabled={busyId === r.id}
                          onClick={() =>
                            run(r.id, async () => {
                              await decideJoinRequest(r.id, 'reject', rejectNote.trim() || undefined);
                              setRejecting(null);
                              setRejectNote('');
                            }, `Rejected ${r.name}'s request`)
                          }
                          className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold disabled:opacity-50"
                        >
                          Reject request
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <button
                        disabled={busyId === r.id}
                        onClick={() => setRejecting(r.id)}
                        className="px-4 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold flex items-center gap-1.5"
                      >
                        <X className="w-4 h-4" /> Reject
                      </button>
                      <button
                        disabled={busyId === r.id}
                        onClick={() => run(r.id, () => decideJoinRequest(r.id, 'approve'), `${r.name} is now an instructor in your organization`)}
                        className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" /> Approve
                      </button>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-outline uppercase text-[10px] tracking-wider border-b border-outline-variant">
                  <th className="pb-3 font-bold">Instructor</th>
                  <th className="pb-3 font-bold">Course</th>
                  <th className="pb-3 font-bold">Sent</th>
                  <th className="pb-3 font-bold">Status</th>
                  <th className="pb-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <HumanAvatar name={r.name} size="sm" />
                        <div>
                          <p className="font-bold text-sm text-on-surface">{r.name}</p>
                          <p className="text-[11px] text-outline">{r.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 max-w-xs">
                      <p className="font-bold text-primary">{r.courseTitle}</p>
                      <p className="text-[10px] text-outline">{[r.semester, r.creditHours].filter(Boolean).join(' • ')}</p>
                      {r.trackingStatus && <p className="text-[10px] text-outline">{r.trackingStatus}</p>}
                    </td>
                    <td className="py-4 whitespace-nowrap">{fmt(r.createdAt)}</td>
                    <td className="py-4">
                      <StatusPill status={r.status} />
                    </td>
                    <td className="py-4">
                      <div className="flex items-center justify-end gap-2">
                        {isPending(r.status) && (
                          <>
                            <button
                              title="Send a reminder"
                              disabled={busyId === r.id}
                              onClick={() => run(r.id, () => resendInvitation(r.id), `Reminder sent to ${r.name}`)}
                              className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary border border-outline-variant"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              title="Withdraw invitation"
                              disabled={busyId === r.id}
                              onClick={() => {
                                if (window.confirm(`Withdraw the invitation to ${r.name}?`)) {
                                  run(r.id, () => withdrawInvitation(r.id), 'Invitation withdrawn');
                                }
                              }}
                              className="p-2 rounded-xl bg-surface-container hover:bg-rose-50 text-rose-600 border border-outline-variant"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        <Link
                          to={`/org/instructor-requests/${r.id}`}
                          className="px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-xs inline-flex items-center gap-1.5 border border-outline-variant/60"
                        >
                          <Eye className="w-3.5 h-3.5 text-primary" /> Details
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </OrgLayout>
  );
}
