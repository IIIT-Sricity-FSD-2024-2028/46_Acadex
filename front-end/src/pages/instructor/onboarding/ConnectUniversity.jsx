import React, { useState } from 'react';
import {
  Building2,
  GraduationCap,
  CheckCircle2,
  Clock,
  Check,
  X,
  AlertCircle,
  HelpCircle,
  Loader2,
  RefreshCw,
  Inbox,
  FileText,
} from 'lucide-react';
import { useInstructor } from '../../../context/InstructorContext';
import { useNavigate } from 'react-router-dom';

export function ConnectUniversity() {
  const navigate = useNavigate();
  const {
    instructor,
    isAffiliated,
    invitations = [],
    acceptInvitation,
    declineInvitation,
    actionLoading,
    refreshInstructor,
  } = useInstructor();

  const [activeRequestId, setActiveRequestId] = useState(null);
  const [actionType, setActionType] = useState(null); // 'accept' | 'decline'
  const [successNotice, setSuccessNotice] = useState(null);
  const [errorNotice, setErrorNotice] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [confirmDeclineId, setConfirmDeclineId] = useState(null);

  const pendingInvitations = invitations.filter((inv) =>
    (inv.status || '').toLowerCase().includes('pending')
  );

  const resolvedInvitations = invitations.filter(
    (inv) => !(inv.status || '').toLowerCase().includes('pending')
  );

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      setErrorNotice(null);
      await refreshInstructor();
    } catch {
      setErrorNotice('Failed to refresh incoming invitations.');
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const handleAccept = async (req) => {
    try {
      setActiveRequestId(req.id);
      setActionType('accept');
      setErrorNotice(null);
      await acceptInvitation(req.id, 'Accepted faculty teaching assignment');
      setSuccessNotice(
        `Successfully accepted! You are now affiliated with ${
          req.organizationName || 'the organization'
        }. The course "${req.courseTitle}" has been added to your teaching studio.`
      );
    } catch (err) {
      setErrorNotice(err.message || 'Failed to accept invitation. Please try again.');
    } finally {
      setActiveRequestId(null);
      setActionType(null);
    }
  };

  const handleDecline = async (req) => {
    try {
      setActiveRequestId(req.id);
      setActionType('decline');
      setErrorNotice(null);
      setConfirmDeclineId(null);
      await declineInvitation(req.id, 'Declined by instructor');
      setSuccessNotice(`Teaching request for "${req.courseTitle}" has been declined.`);
    } catch (err) {
      setErrorNotice(err.message || 'Failed to decline request.');
    } finally {
      setActiveRequestId(null);
      setActionType(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4 animate-in fade-in duration-300">
      
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. HERO BANNER: Affiliation Required Notice                   */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-slate-900 via-[#002554] to-[#0056D2] text-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-20 w-64 h-64 rounded-full bg-indigo-500/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/30 text-xs font-bold backdrop-blur-sm">
            <Clock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>Platform Policy • Organization Affiliation Pending</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
            Connect to an Organization to Continue
          </h1>

          <p className="text-blue-100 text-sm sm:text-base leading-relaxed font-normal">
            Welcome to the Faculty Studio, <span className="font-semibold text-white">{instructor?.name || 'Instructor'}</span>.
            Under our institutional model, instructors <span className="underline decoration-amber-400 font-semibold text-white">cannot request organizations directly</span>.
            Only accredited organizations can send teaching requests to instructors. You can review all incoming offers below to either <span className="font-semibold text-emerald-300">Accept</span> or <span className="font-semibold text-rose-300">Reject</span>.
          </p>

          {isAffiliated ? (
            <div className="pt-2">
              <button
                onClick={() => navigate('/instructor/dashboard')}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Affiliated with {instructor.organizationName} — Enter Studio →</span>
              </button>
            </div>
          ) : (
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-blue-100">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>Status: <strong>Awaiting Organization Request</strong></span>
              </div>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-xs font-semibold text-white transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh Inbox</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Notifications / Alerts */}
      {successNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3 shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <p className="font-bold text-sm text-emerald-950">Update Successful</p>
            <p className="mt-0.5 text-emerald-800">{successNotice}</p>
          </div>
          {isAffiliated && (
            <button
              onClick={() => navigate('/instructor/dashboard')}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 cursor-pointer"
            >
              Go to Dashboard →
            </button>
          )}
        </div>
      )}

      {errorNotice && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center gap-3 shadow-xs animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <p className="text-xs font-semibold flex-1">{errorNotice}</p>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. FACULTY PROFILE CARD (How Organizations See You)          */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={
              instructor?.avatar ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
            }
            alt={instructor?.name || 'Instructor'}
            className="w-14 h-14 rounded-2xl object-cover ring-2 ring-blue-100 shrink-0"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900">{instructor?.name || 'Faculty Member'}</h2>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                Instructor Profile
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Registered Email: <span className="text-slate-800 font-semibold">{instructor?.email}</span>
            </p>
            <p className="text-xs text-slate-400">
              Specialization: <span className="text-slate-700">{instructor?.specialization || 'Computer Science & Software Architecture'}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
          <div className="text-left md:text-right">
            <span className="text-[11px] text-slate-400 block font-medium">Faculty Affiliation Status:</span>
            <span className={`text-xs font-bold inline-flex items-center gap-1.5 mt-0.5 ${isAffiliated ? 'text-emerald-700' : 'text-amber-700'}`}>
              <span className={`w-2 h-2 rounded-full ${isAffiliated ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
              {isAffiliated ? `Affiliated (${instructor?.organizationName})` : 'Pending Organization Request'}
            </span>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
            title="Refresh for new incoming requests"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. INCOMING ORGANIZATION REQUESTS & COURSE ASSIGNMENTS       */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Incoming Organization Requests & Course Assignments
              </h2>
              {pendingInvitations.length > 0 ? (
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#0056D2] font-extrabold text-[11px]">
                  {pendingInvitations.length} Pending Decision
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold text-[11px]">
                  0 Pending
                </span>
              )}
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              Only organizations can send requests to instructors. Review the curriculum terms below to either <strong>Accept</strong> or <strong>Reject</strong>.
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold transition-colors self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Check for Requests</span>
          </button>
        </div>

        {pendingInvitations.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {pendingInvitations.map((inv) => (
              <div
                key={inv.id}
                className="bg-white border-2 border-blue-200 hover:border-blue-400 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-[#0056D2] flex items-center justify-center font-bold shrink-0">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0056D2] flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {inv.organizationName || 'Unknown Organization'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                          Accredited Organization
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight mt-0.5">
                        {inv.courseTitle || 'Specialized Engineering Track'}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Pending Your Decision</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                      {inv.semester || 'Fall 2026'}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/70">
                  <div>
                    <span className="text-slate-400 block font-medium">Academic Credits & Load:</span>
                    <span className="text-slate-800 font-bold">{inv.creditHours || '4 Academic Credits / 45 Lecture Hours'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Honorarium & Royalties:</span>
                    <span className="text-slate-800 font-bold">{inv.proposedTerms || 'Departmental Honorarium + Royalties'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Date Dispatched:</span>
                    <span className="text-slate-800 font-medium">{inv.submittedDate || 'Recently'}</span>
                  </div>
                </div>

                {/* Description / Message from Dean */}
                {inv.description && (
                  <div className="text-xs text-slate-700 bg-blue-50/40 p-3.5 rounded-xl border border-blue-100/80 space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block">
                      Message from Organization Administration:
                    </span>
                    <p className="italic text-slate-800 font-normal leading-relaxed">
                      "{inv.description}"
                    </p>
                  </div>
                )}

                {/* Confirmation Box for Decline */}
                {confirmDeclineId === inv.id ? (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-150">
                    <div>
                      <p className="text-xs font-bold text-rose-950">Are you sure you want to reject this request?</p>
                      <p className="text-[11px] text-rose-800">
                        Rejecting will notify {inv.organizationName || 'the organization'} that you declined to teach this course.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setConfirmDeclineId(null)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        disabled={actionLoading}
                        onClick={() => handleDecline(inv)}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        {activeRequestId === inv.id && actionType === 'decline' ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <X className="w-3.5 h-3.5" />
                        )}
                        <span>Confirm Reject</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Two Main Actions: Reject or Accept */
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                    <p className="text-[11px] text-slate-500">
                      Accepting automatically associates your faculty profile with {inv.organizationName || 'this organization'}.
                    </p>

                    <div className="flex items-center gap-2.5 self-end sm:self-auto">
                      {/* Reject Button */}
                      <button
                        disabled={actionLoading}
                        onClick={() => setConfirmDeclineId(inv.id)}
                        className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <X className="w-4 h-4 text-rose-600" />
                        <span>Reject Request</span>
                      </button>

                      {/* Accept Button */}
                      <button
                        disabled={actionLoading}
                        onClick={() => handleAccept(inv)}
                        className="px-5 py-2.5 rounded-xl bg-[#0056D2] hover:bg-[#00419E] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                      >
                        {activeRequestId === inv.id && actionType === 'accept' ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Connecting...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Accept & Connect to Organization</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Empty State: Clear waiting screen */
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-8 sm:p-12 text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-100 text-[#0056D2] flex items-center justify-center mx-auto shadow-inner">
              <Inbox className="w-8 h-8" />
            </div>

            <div className="max-w-lg mx-auto space-y-2">
              <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">
                Awaiting Organization Teaching Requests
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                You do not have any pending teaching requests at this moment. Under the platform affiliation model,
                <strong className="text-slate-700"> instructors cannot request organizations</strong>.
                Accredited organizations review instructor profiles and dispatch course teaching requests directly to your account.
              </p>
            </div>

            {/* Step-by-step indicator */}
            <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1.5">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-[#0056D2] font-black text-xs flex items-center justify-center">
                  1
                </div>
                <h4 className="text-xs font-bold text-slate-900">Organization Dispatches</h4>
                <p className="text-[11px] text-slate-500 leading-normal">
                  A partner organization admin selects your profile and sends a course teaching request.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1.5">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-[#0056D2] font-black text-xs flex items-center justify-center">
                  2
                </div>
                <h4 className="text-xs font-bold text-slate-900">Review Terms</h4>
                <p className="text-[11px] text-slate-500 leading-normal">
                  The offer appears here with course credits, semester dates, and honorarium terms.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1.5">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-[#0056D2] font-black text-xs flex items-center justify-center">
                  3
                </div>
                <h4 className="text-xs font-bold text-slate-900">Accept or Reject</h4>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Click <strong>Accept</strong> to affiliate and unlock your studio, or <strong>Reject</strong> to decline.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Check for Newly Dispatched Requests</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. PAST REQUESTS HISTORY (Accepted / Declined)                */}
      {/* ───────────────────────────────────────────────────────────── */}
      {resolvedInvitations.length > 0 && (
        <section className="space-y-3 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              <span>Resolved Teaching Invitations ({resolvedInvitations.length})</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {resolvedInvitations.map((inv) => {
              const isAccepted = (inv.status || '').toLowerCase().includes('accept');
              return (
                <div
                  key={inv.id}
                  className="bg-white p-4 rounded-xl border border-slate-200/80 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900">{inv.courseTitle}</p>
                    <p className="text-slate-500 text-[11px]">{inv.organizationName || 'Organization Partner'}</p>
                    <p className="text-slate-400 text-[10px]">{inv.semester || 'Fall 2026'}</p>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 flex items-center gap-1 ${
                      isAccepted
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {isAccepted ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-slate-500" />}
                    <span>{inv.status}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 5. EXPLANATORY PLATFORM GOVERNANCE FOOTER                     */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs text-slate-600 flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-[#0056D2] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-slate-900">Why can instructors only accept or reject organization requests?</p>
          <p className="leading-relaxed">
            To ensure academic rigor and institutional accreditation, universities and organizations hold the sole prerogative to curate their curriculum tracks and recruit faculty. Once an organization dispatches a formal teaching request, you have full authority to either accept the appointment (unlocking your Studio Dashboard, course management tools, and honorarium) or reject it.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ConnectUniversity;
