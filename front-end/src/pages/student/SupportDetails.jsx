import { supportStatus } from '../../utils/supportStatus';
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import StudentPage from '../../components/student/StudentPage';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  addStudentDisputeComment,
  clearSelectedDispute,
  fetchStudentDisputeById,
} from '../../store/actions/disputesActions';
import { AdminHeader, AdminDataState } from '../../components/admin/AdminUI';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { dateLabel } from '../../utils/adminDisplay';
export default function SupportDetails() {
  const { disputeId } = useParams();
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.disputes.selected);
  const busy = useAppSelector((s) => s.disputes.saving);
  const error = useAppSelector((s) => s.disputes.actionError);
  const d = state.data;
  const [text, setText] = useState('');
  useEffect(() => {
    if (disputeId) dispatch(fetchStudentDisputeById(disputeId));
    return () => {
      dispatch(clearSelectedDispute());
    };
  }, [dispatch, disputeId]);
  async function submit(e) {
    e.preventDefault();
    try {
      await dispatch(
        addStudentDisputeComment({ disputeId, message: text })
      ).unwrap();
      setText('');
    } catch {
      // handled by disputesSlice
    }
  }
  return (
    <StudentPage>
      <Link className="admin-count-label" to="/student/disputes">
        <ArrowLeft size={14} />
        Support requests
      </Link>
      <AdminDataState
        loading={state.loading}
        error={state.error}
        refresh={() => dispatch(fetchStudentDisputeById(disputeId))}
      />
      {d && !state.error && (
        <>
          <AdminHeader title={d.subject}>
            <StatusBadge status={supportStatus(d.status)} />
          </AdminHeader>
          <p className="admin-record-code">{d.id}</p>
          <div className="learner-profile-columns">
            <div className="grid gap-5">
              <section className="admin-card">
                <h2 className="text-sm font-semibold">Your request</h2>
                <p className="learner-body-copy mt-4 whitespace-pre-wrap">
                  {d.description}
                </p>
                {(d.resolutionNote || d.rejectionReason) && (
                  <div className="learner-resolution">
                    <h3>Support decision</h3>
                    <p>{d.resolutionNote || d.rejectionReason}</p>
                  </div>
                )}
              </section>
              <section className="admin-card">
                <h2 className="text-sm font-semibold mb-5">Conversation</h2>
                <div className="learner-conversation">
                  {(d.comments || []).map((c) => (
                    <article
                      key={c.id}
                      className={c.isAdmin ? 'is-support' : ''}
                    >
                      <div>
                        <strong>{c.author}</strong>
                        <time>{dateLabel(c.timestamp || c.createdAt)}</time>
                      </div>
                      <p>{c.message}</p>
                    </article>
                  ))}
                  {!d.comments?.length && (
                    <p className="admin-muted">
                      No messages yet. Add more details below if you need to.
                    </p>
                  )}
                </div>
                <form className="learner-form mt-6" onSubmit={submit}>
                  <label>
                    Add a message
                    <textarea
                      required
                      maxLength={4000}
                      rows={3}
                      className="admin-input"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                    />
                  </label>
                  {error && (
                    <p role="alert" className="workspace-error">
                      {error}
                    </p>
                  )}
                  <button
                    className="admin-button admin-button-primary justify-self-end"
                    disabled={busy || !text.trim()}
                  >
                    <Send size={14} />
                    {busy ? 'Sending…' : 'Send message'}
                  </button>
                </form>
              </section>
            </div>
            <aside className="grid gap-5">
              <section className="admin-card">
                <h2 className="text-sm font-semibold">Case information</h2>
                <dl className="finance-breakdown">
                  {[
                    ['Issue category', d.category || d.disputeType || 'Other'],
                    ['Opened', dateLabel(d.createdAt)],
                    ['Course', d.courseTitle || d.course || 'General support'],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            </aside>
          </div>
        </>
      )}
    </StudentPage>
  );
}
