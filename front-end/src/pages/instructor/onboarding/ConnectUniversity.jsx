import React, { useState } from 'react';
import {
  Building2,
  GraduationCap,
  CheckCircle2,
  Clock,
  ArrowRight,
  BookOpen,
  Mail,
  ShieldCheck,
  Check,
  X,
  AlertCircle,
  HelpCircle,
  Loader2,
  RefreshCw,
  Inbox,
  UserCheck,
  FileText,
  BadgeAlert,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { useInstructor } from '../../../hooks/useInstructor';
import { useNavigate } from 'react-router-dom';

const isPending = (s) => /pending|sent/i.test(s || '');
const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '');

function StatusPill({ status }) {
  const tone = isPending(status)
    ? 'bg-amber-50 text-amber-800 border-amber-200'
    : /accept|approv/i.test(status)
    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
    : 'bg-slate-100 text-slate-600 border-slate-200';
  return <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold whitespace-nowrap ${tone}`}>{status}</span>;
}

export function ConnectUniversity({ embedded = false }) {
  const {
    instructor,
    isAffiliated,
    invitations,
    joinRequests,
    pendingJoinRequest,
    actionLoading,
    acceptInvitation,
    declineInvitation,
    requestToJoin,
    cancelJoinRequest,
  } = useInstructor();

  const [orgs, setOrgs] = useState([]);
  const [orgId, setOrgId] = useState('');
  const [message, setMessage] = useState('');
  const [notice, setNotice] = useState(null);
  const [confirmDecline, setConfirmDecline] = useState(null);

  useEffect(() => {
    api.student
      .getOrganizations()
      .then((o) => setOrgs((Array.isArray(o) ? o : o?.items || []).filter((x) => x.status !== 'Suspended')))
      .catch(() => setOrgs([]));
  }, []);

  const act = async (fn, success) => {
    setNotice(null);
    try {
      await fn();
      setNotice({ type: 'success', text: success });
    } catch (err) {
      setNotice({ type: 'error', text: err.message || 'Something went wrong' });
    }
  };

  const submitJoin = (e) => {
    e.preventDefault();
    if (!orgId) return setNotice({ type: 'error', text: 'Choose an organization first' });
    const org = orgs.find((o) => o.id === orgId);
    act(async () => {
      await requestToJoin(orgId, message.trim());
      setOrgId('');
      setMessage('');
    }, `Request sent to ${org?.name}. You will be able to teach once they approve it.`);
  };

  const pendingInvites = invitations.filter((i) => isPending(i.status));
  const history = [...joinRequests.filter((r) => !isPending(r.status)), ...invitations.filter((i) => !isPending(i.status))].sort(
    (a, b) => String(b.updatedAt || b.createdAt).localeCompare(String(a.updatedAt || a.createdAt))
  );

  if (isAffiliated) return null;

  return (
    <div className={`space-y-6 ${embedded ? '' : 'max-w-4xl mx-auto py-2'}`}>
      {!embedded && (
        <header>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Join an organization</h1>
          <p className="text-sm text-slate-500 mt-1">
            {instructor?.name ? `${instructor.name}, you` : 'You'} need to be part of an organization before you can teach. Send a join
            request — the organization's admin must approve it — or accept an invitation an organization sent you.
          </p>
        </header>
      )}

      {notice && (
        <div
          className={`p-3 rounded-xl border text-xs font-semibold flex items-start gap-2 ${
            notice.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {notice.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{notice.text}</span>
        </div>
      )}

      {pendingJoinRequest ? (
        <section className="bg-white border border-amber-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Waiting for {pendingJoinRequest.organizationName}</p>
                <p className="text-xs text-slate-500">Sent {fmt(pendingJoinRequest.createdAt)} • the organization admin has to approve it</p>
              </div>
            </div>
            <StatusPill status={pendingJoinRequest.status} />
          </div>
          {pendingJoinRequest.description && (
            <p className="text-xs text-slate-700 bg-slate-50 rounded-lg p-3 border border-slate-100">“{pendingJoinRequest.description}”</p>
          )}
          <button
            type="button"
            disabled={actionLoading}
            onClick={() => act(() => cancelJoinRequest(pendingJoinRequest.id), 'Join request cancelled.')}
            className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel request
          </button>
        </section>
      ) : (
        <form onSubmit={submitJoin} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#0056D2]" />
            <h2 className="text-sm font-bold text-slate-900">Request to join an organization</h2>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Organization</label>
            <select
              value={orgId}
              onChange={(e) => setOrgId(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:border-[#0056D2]"
            >
              <option value="">Select an organization…</option>
              {orgs.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Message to the admin (optional)</label>
            <textarea
              value={message}
              maxLength={1000}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Introduce yourself: subjects you teach, experience, and why you'd like to join."
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm min-h-[90px] focus:outline-none focus:border-[#0056D2] resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={actionLoading || !orgId}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0056D2] hover:bg-[#00419E] text-white text-xs font-bold disabled:opacity-50"
          >
            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Send join request
          </button>
        </form>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Inbox className="w-4 h-4 text-slate-400" /> Invitations from organizations
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px]">{pendingInvites.length}</span>
        </h2>
        {pendingInvites.length === 0 ? (
          <p className="text-xs text-slate-500 bg-white border border-dashed border-slate-200 rounded-xl p-4">
            No pending invitations. Organizations can also invite you to teach a specific course.
          </p>
        ) : (
          pendingInvites.map((inv) => (
            <div key={inv.id} className="bg-white border border-blue-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold text-[#0056D2] uppercase tracking-wide">{inv.organizationName}</p>
                  <p className="text-base font-bold text-slate-900">{inv.courseTitle}</p>
                  <p className="text-xs text-slate-500">
                    {[inv.semester, inv.creditHours, inv.proposedTerms].filter(Boolean).join(' • ') || `Received ${fmt(inv.createdAt)}`}
                  </p>
                </div>
                <StatusPill status="Pending" />
              </div>
              {inv.description && <p className="text-xs text-slate-700 bg-slate-50 rounded-lg p-3">“{inv.description}”</p>}
              {pendingJoinRequest && (
                <p className="text-[11px] text-amber-700">
                  Accepting will join {inv.organizationName}; your pending join request stays open until you cancel it.
                </p>
              )}
              {confirmDecline === inv.id ? (
                <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-rose-50 border border-rose-200">
                  <p className="text-xs font-semibold text-rose-900">Decline this invitation?</p>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setConfirmDecline(null)} className="px-3 py-1.5 rounded-lg bg-white border text-xs font-semibold">
                      Keep
                    </button>
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => {
                        setConfirmDecline(null);
                        act(() => declineInvitation(inv.id), 'Invitation declined.');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => setConfirmDecline(inv.id)}
                    className="px-4 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold flex items-center gap-1.5"
                  >
                    <X className="w-4 h-4" /> Decline
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => act(() => acceptInvitation(inv.id), `You joined ${inv.organizationName}.`)}
                    className="px-4 py-2 rounded-xl bg-[#0056D2] hover:bg-[#00419E] text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Accept
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </section>

      {history.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <History className="w-4 h-4 text-slate-400" /> History
          </h2>
          <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100">
            {history.map((r) => (
              <div key={r.id} className="px-4 py-3 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 truncate">
                    {r.type === 'join' ? `Join request to ${r.organizationName}` : `${r.organizationName} — ${r.courseTitle}`}
                  </p>
                  <p className="text-slate-400">{fmt(r.decidedAt || r.respondedAt || r.updatedAt || r.createdAt)}</p>
                </div>
                <StatusPill status={r.status} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default ConnectUniversity;
