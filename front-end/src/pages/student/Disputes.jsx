import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Search,
  X,
  MessageSquare,
  Send,
  Calendar,
  ArrowRight,
  FileText,
} from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import { useStudent } from '../../context/StudentContext';
import { useToast } from '../../components/common/Toast';
import api from '../../services/api';

const TYPE_COLORS = {
  'Course Content': 'bg-blue-50 text-blue-700 border-blue-200',
  Payment: 'bg-violet-50 text-violet-700 border-violet-200',
  Certificate: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Course Status': 'bg-amber-50 text-amber-700 border-amber-200',
  'Instructor Conduct': 'bg-orange-50 text-orange-700 border-orange-200',
  'Technical Lab': 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

const STATUS_CONFIGS = {
  Pending: { bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock, label: 'Pending Review' },
  'In Progress': { bg: 'bg-blue-50 text-[#0056D2] border-blue-200', icon: Clock, label: 'Under Investigation' },
  Resolved: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2, label: 'Resolved' },
  Rejected: { bg: 'bg-rose-50 text-rose-700 border-rose-200', icon: XCircle, label: 'Declined' },
};

export default function StudentDisputes() {
  const { student } = useStudent();
  const { addToast } = useToast();

  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  // Selected dispute detail drawer
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // New dispute modal
  const [showNewModal, setShowNewModal] = useState(false);
  const [form, setForm] = useState({
    subject: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const loadDisputes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.student.getMyDisputes();
      const list = Array.isArray(res) ? res : (res?.items || res?.data || []);
      setDisputes(list);
    } catch {
      setDisputes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = 'Disputes & Support | Acadex';
    loadDisputes();
  }, [loadDisputes]);

  // Statistics
  const totalCount = disputes.length;
  const pendingCount = disputes.filter((d) => d.status === 'Pending').length;
  const inProgressCount = disputes.filter((d) => d.status === 'In Progress' || d.status === 'Under Review').length;
  const resolvedCount = disputes.filter((d) => d.status === 'Resolved').length;

  // Filtered tickets
  const filtered = useMemo(() => {
    return disputes.filter((d) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        (d.id || '').toLowerCase().includes(q) ||
        (d.subject || '').toLowerCase().includes(q) ||
        (d.course || d.courseTitle || '').toLowerCase().includes(q) ||
        (d.description || '').toLowerCase().includes(q) ||
        (d.disputeType || d.type || '').toLowerCase().includes(q);

      const matchTab =
        activeTab === 'all'
          ? true
          : activeTab === 'pending'
          ? d.status === 'Pending'
          : activeTab === 'in-progress'
          ? d.status === 'In Progress' || d.status === 'Under Review'
          : activeTab === 'resolved'
          ? d.status === 'Resolved'
          : true;

      return matchSearch && matchTab;
    });
  }, [disputes, search, activeTab]);

  const handleOpenNewModal = () => {
    setForm({
      subject: '',
      description: '',
    });
    setShowNewModal(true);
  };

  const handleCreateDispute = async (e) => {
    e.preventDefault();
    if (!form.subject.trim()) return addToast('Please enter an issue subject', 'warning');
    if (!form.description.trim()) return addToast('Please provide a detailed description', 'warning');

    setSubmitting(true);
    try {
      await api.student.createDispute({
        raisedBy: student?.name || 'Arjun Sharma',
        raisedById: student?.id || 'lrn-1',
        learnerId: student?.id || 'lrn-1',
        studentId: student?.id || 'lrn-1',
        raisedByRole: 'Student',
        subject: form.subject.trim(),
        description: form.description.trim(),
      });
      addToast('Dispute ticket submitted successfully! Operations has been notified.', 'success');
      setShowNewModal(false);
      await loadDisputes();
    } catch (err) {
      addToast(err.message || 'Failed to submit dispute ticket', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedDispute) return;
    setSendingReply(true);
    try {
      await api.student.addDisputeComment(selectedDispute.id, replyText.trim());
      addToast('Message posted to ticket thread', 'success');
      setReplyText('');
      
      // Reload tickets and refresh open detail drawer
      const updatedList = await api.student.getMyDisputes();
      const updatedDisputes = Array.isArray(updatedList) ? updatedList : (updatedList?.items || updatedList?.data || []);
      setDisputes(updatedDisputes);
      const updatedSelected = updatedDisputes.find((d) => d.id === selectedDispute.id);
      if (updatedSelected) setSelectedDispute(updatedSelected);
    } catch (err) {
      addToast(err.message || 'Could not send message', 'error');
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <PageLayout>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-rose-50 text-rose-700 border border-rose-100">
                <ShieldAlert className="w-3 h-3 text-rose-600" /> Resolution & Advocacy
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-500">Student Support Governance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Disputes & Issue Resolution
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Log inquiries for course curriculum errors, lab compiler glitches, and billing reviews. All tickets are reviewed under SLA by Acadex Council.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenNewModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#0056D2] to-[#00419E] hover:from-[#004bb8] hover:to-[#003480] text-white text-xs font-extrabold rounded-xl transition-all shadow-md shadow-blue-500/15 hover:shadow-lg active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" /> Raise Dispute / Issue
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Cases</span>
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900 mt-3">{totalCount}</p>
            <p className="text-xs text-slate-400 mt-1">Logged tickets history</p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Pending Review</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-black text-amber-700 mt-3">{pendingCount}</p>
            <p className="text-xs text-amber-600/80 mt-1 font-semibold">Queued for operational review</p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0056D2]">In Progress</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0056D2] border border-blue-100 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-black text-[#0056D2] mt-3">{inProgressCount}</p>
            <p className="text-xs text-blue-600/80 mt-1 font-semibold">Under active investigation</p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Resolved</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-black text-emerald-700 mt-3">{resolvedCount}</p>
            <p className="text-xs text-emerald-600/80 mt-1 font-semibold">Settled by governance</p>
          </div>
        </div>

        {/* Tabs & Search Toolbar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'All Tickets', count: totalCount },
                { id: 'pending', label: 'Pending', count: pendingCount },
                { id: 'in-progress', label: 'In Progress', count: inProgressCount },
                { id: 'resolved', label: 'Resolved', count: resolvedCount },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === t.id
                      ? 'bg-[#0056D2] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t.label} ({t.count})
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by ticket ID, course, or subject..."
                className="w-full h-10 pl-10 pr-9 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0056D2]/20 focus:border-[#0056D2] transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tickets Feed */}
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 flex flex-col items-center justify-center space-y-4 shadow-2xs">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0056D2]/20 border-t-[#0056D2]" />
            <p className="text-sm font-bold text-slate-700">Loading your dispute tickets...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 shadow-2xs">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {search || activeTab !== 'all' ? 'No dispute tickets match your criteria' : 'No dispute tickets logged'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1.5 leading-relaxed">
                {search || activeTab !== 'all'
                  ? 'Try clearing your search terms or choosing a different status filter.'
                  : 'If you experience player stutter, compiler timeouts, or payment errors, log a formal ticket to platform operations.'}
              </p>
            </div>

            <div className="pt-2">
              {search || activeTab !== 'all' ? (
                <button
                  onClick={() => {
                    setSearch('');
                    setActiveTab('all');
                  }}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                >
                  Clear Filters
                </button>
              ) : (
                <button
                  onClick={handleOpenNewModal}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#0056D2] hover:bg-[#00419E] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/15"
                >
                  <Plus className="w-4 h-4" /> Log Course Issue
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((d) => {
              const statusCfg = STATUS_CONFIGS[d.status] || STATUS_CONFIGS.Pending;
              const StatusIcon = statusCfg.icon;

              return (
                <div
                  key={d.id}
                  onClick={() => setSelectedDispute(d)}
                  className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-4 hover:border-[#0056D2] transition-all cursor-pointer group shadow-2xs hover:shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-black text-[#0056D2] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                        {d.id}
                      </span>
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${TYPE_COLORS[d.type || d.disputeType] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                        {d.type || d.disputeType || 'General'}
                      </span>
                      <span className="text-xs text-slate-300">•</span>
                      <span className="text-xs font-bold text-slate-700 truncate max-w-sm">
                        {d.course || d.courseTitle || 'Platform Support'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${statusCfg.bg}`}>
                        <StatusIcon className="w-3.5 h-3.5" /> {statusCfg.label || d.status}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-slate-900 group-hover:text-[#0056D2] transition-colors">
                      {d.subject}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 line-clamp-2 leading-relaxed font-normal">
                      {d.description}
                    </p>
                  </div>

                  {/* Resolution banner if ticket resolved */}
                  {d.resolutionNote && (
                    <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-950 space-y-1">
                      <p className="font-extrabold flex items-center gap-1.5 text-emerald-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Formal Administrative Resolution:
                      </p>
                      <p className="text-slate-700 leading-relaxed font-normal">{d.resolutionNote}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Opened on {new Date(d.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="text-[#0056D2] font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      View Discussion & Notes <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Ticket Details & Discussion Drawer / Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono font-black text-[#0056D2] bg-blue-100/80 px-2.5 py-1 rounded-lg">
                  {selectedDispute.id}
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${STATUS_CONFIGS[selectedDispute.status]?.bg}`}>
                  {selectedDispute.status}
                </span>
              </div>
              <button
                onClick={() => setSelectedDispute(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div>
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  {selectedDispute.type || selectedDispute.disputeType} • {selectedDispute.course || selectedDispute.courseTitle}
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-1">{selectedDispute.subject}</h2>
              </div>

              {/* Case Summary Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Case Description</p>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line font-normal">
                  {selectedDispute.description}
                </p>
                {selectedDispute.desiredResolution && (
                  <div className="pt-3 border-t border-slate-200 mt-2">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Desired Outcome:</p>
                    <p className="text-xs text-slate-700 font-medium mt-0.5">{selectedDispute.desiredResolution}</p>
                  </div>
                )}
              </div>

              {/* Administrative Resolution if settled */}
              {selectedDispute.resolutionNote && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-1.5">
                  <p className="text-xs font-extrabold text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Administrative Decision & Resolution
                  </p>
                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">{selectedDispute.resolutionNote}</p>
                  {selectedDispute.resolvedBy && (
                    <p className="text-[11px] text-emerald-700 font-semibold pt-1">— Handled by {selectedDispute.resolvedBy}</p>
                  )}
                </div>
              )}

              {/* Timeline & Discussion Thread */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <p className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-[#0056D2]" /> Case Dialogue & Audit Trail ({(selectedDispute.comments || []).length})
                  </p>
                  <span className="text-[11px] text-slate-400">Authenticated council notes</span>
                </div>

                {(selectedDispute.comments || []).length === 0 ? (
                  <div className="bg-slate-50/70 border border-slate-100 p-5 rounded-2xl text-center space-y-1">
                    <p className="text-xs font-bold text-slate-700">Ticket queued for review</p>
                    <p className="text-[11px] text-slate-400">
                      An administrator will review case details and respond shortly. You can add additional notes below.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDispute.comments.map((c, i) => (
                      <div
                        key={c.id || i}
                        className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                          c.isAdmin !== false
                            ? 'bg-blue-50/60 border-blue-200/80'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span className={c.isAdmin !== false ? 'text-[#0056D2]' : 'text-slate-800'}>
                            {c.author} {c.isAdmin !== false ? '• Support Governance' : '• You'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {c.timestamp && new Date(c.timestamp).toLocaleString('en-US', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </span>
                        </div>
                        <p className="text-slate-700 leading-relaxed font-normal">{c.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Reply Input Form */}
            <form onSubmit={handleSendComment} className="p-4 border-t border-slate-100 flex gap-2 bg-slate-50/50">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type a follow-up response or question for platform support..."
                className="flex-1 h-11 px-4 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0056D2]/20 focus:border-[#0056D2] transition-all"
              />
              <button
                type="submit"
                disabled={sendingReply || !replyText.trim()}
                className="px-5 h-11 bg-[#0056D2] hover:bg-[#00419E] text-white rounded-xl text-xs font-bold disabled:opacity-50 inline-flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Send className="w-3.5 h-3.5" /> {sendingReply ? 'Sending...' : 'Reply'}
              </button>
            </form>

          </div>
        </div>
      )}

      {/* Raise Dispute Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full space-y-5 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Raise Dispute / Report Issue</h3>
                <p className="text-xs text-slate-500 mt-0.5">Directly routes to Acadex Operations and Academic Council.</p>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDispute} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Subject</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="e.g. Lesson 3.2 video player freezing, duplicate invoice"
                  maxLength={120}
                  className="w-full h-11 px-3.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0056D2]/20 focus:border-[#0056D2] transition-all"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={5}
                  maxLength={1000}
                  placeholder="Describe the issue, lesson number, browser environment, or steps to reproduce..."
                  className="w-full p-3 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0056D2]/20 focus:border-[#0056D2] resize-none transition-all"
                  required
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2.5 border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-[#0056D2] to-[#00419E] hover:from-[#004bb8] hover:to-[#003480] text-white text-xs font-extrabold rounded-xl disabled:opacity-50 transition-all shadow-md shadow-blue-500/15"
                >
                  <Send className="w-3.5 h-3.5" /> {submitting ? 'Submitting...' : 'Log Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </PageLayout>
  );
}
