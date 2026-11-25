import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Building2,
  ArrowUpRight,
  Check,
  X,
  Clock3,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  clearCourseErrors,
  fetchAdminCourses,
  reviewAdminCourse,
} from '../../store/actions/coursesActions';
import {
  AdminHeader,
  AdminSearch,
  AdminEmpty,
  AdminDataState,
} from '../../components/admin/AdminUI';
import { Pagination } from '../../components/admin/Pagination';
import { dateLabel } from '../../utils/adminDisplay';
export const CourseApproval = () => {
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selection, setSelection] = useState(null);
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const state = useAppSelector((s) => s.courses.adminCourses);
  const busy = useAppSelector((s) => s.courses.actionLoading);
  const error = useAppSelector((s) => s.courses.actionError);
  useEffect(() => {
    dispatch(
      fetchAdminCourses({ search, status: 'Pending Approval', page, limit: 12 })
    );
  }, [dispatch, search, page]);
  function open(course, decision) {
    setSelection({ course, decision });
    setReason('');
    dispatch(clearCourseErrors());
    setMessage('');
  }
  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    try {
      await dispatch(
        reviewAdminCourse({
          courseId: selection.course.id,
          decision: selection.decision,
          reason,
        })
      ).unwrap();
      setMessage(
        selection.decision === 'approve'
          ? 'Course approved and published.'
          : 'Course rejected.'
      );
      setSelection(null);
      setPage(1);
      dispatch(
        fetchAdminCourses({
          search,
          status: 'Pending Approval',
          page: 1,
          limit: 12,
        })
      );
    } catch {
      // handled by coursesSlice
    }
  }
  return (
    <div className="admin-page">
      <AdminHeader
        eyebrow="Learning management"
        title="Course approvals"
        description="Review the next learning experiences before they go live."
      />
      {message && (
        <p role="status" className="admin-success">
          {message}
        </p>
      )}
      <div className="admin-toolbar">
        <AdminSearch
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search course submissions…"
          label="Search pending courses"
        />
        <span className="admin-count-label">
          <Clock3 size={14} />
          Awaiting review
        </span>
      </div>
      <AdminDataState
        loading={state.loading}
        error={state.error}
        refresh={() =>
          dispatch(
            fetchAdminCourses({
              search,
              status: 'Pending Approval',
              page,
              limit: 12,
            })
          )
        }
      />
      {!state.loading && !state.error && (
        <>
          <div className="admin-grid">
            {state.data?.items?.map((c) => (
              <article className="admin-card admin-record" key={c.id}>
                <div className="admin-record-top">
                  <span className="admin-icon-tile admin-icon-amber">
                    <BookOpen size={20} />
                  </span>
                  <Link
                    to={`/admin/courses/${c.id}`}
                    className="admin-button !p-2"
                    aria-label={`View ${c.title}`}
                  >
                    <ArrowUpRight size={16} />
                  </Link>
                </div>
                <p className="admin-record-category">
                  Submitted {dateLabel(c.updatedAt || c.createdAt)}
                </p>
                <h2 className="text-sm font-semibold mt-2 leading-6">
                  {c.title}
                </h2>
                <p className="admin-record-meta">
                  <Building2 size={13} />
                  {c.organizationName || 'Organization not recorded'}
                </p>
                <p className="admin-record-meta">
                  {c.instructors?.map((i) => i.name).join(', ') ||
                    'Instructor not assigned'}
                </p>
                <div className="admin-record-footer mt-5">
                  <button
                    className="admin-button admin-button-primary flex-1"
                    onClick={() => open(c, 'approve')}
                  >
                    <Check size={14} />
                    Approve
                  </button>
                  <button
                    className="admin-button admin-button-danger flex-1"
                    onClick={() => open(c, 'reject')}
                  >
                    <X size={14} />
                    Reject
                  </button>
                </div>
              </article>
            ))}
          </div>
          {!state.data?.items?.length && (
            <AdminEmpty
              icon={Check}
              title="You’re all caught up"
              description="New course submissions will appear here when they’re ready for your review."
            />
          )}
          <Pagination
            currentPage={page}
            totalPages={state.data?.totalPages || 1}
            onPageChange={setPage}
          />
        </>
      )}
      {selection && (
        <div className="admin-modal-backdrop">
          <form
            onSubmit={submit}
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-title"
            className="admin-modal space-y-5"
          >
            <span className="admin-icon-tile admin-icon-green">
              <BookOpen size={22} />
            </span>
            <h2 id="review-title" className="text-xl font-semibold">
              {selection.decision === 'approve' ? 'Approve' : 'Reject'} this
              course?
            </h2>
            <p className="admin-muted">{selection.course.title}</p>
            <p className="admin-muted">
              {selection.decision === 'approve'
                ? 'This course will be published and made available to learners.'
                : 'Include a clear reason for the teaching team.'}
            </p>
            {selection.decision === 'reject' && (
              <label className="block text-sm">
                Reason
                <textarea
                  autoFocus
                  required
                  maxLength={2000}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="admin-input mt-2"
                  rows={4}
                />
              </label>
            )}
            {error && (
              <p role="alert" className="admin-alert">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="admin-button"
                disabled={busy}
                onClick={() => setSelection(null)}
              >
                Cancel
              </button>
              <button
                autoFocus={selection.decision === 'approve'}
                disabled={busy}
                className="admin-button admin-button-primary"
              >
                {busy ? 'Saving…' : 'Confirm decision'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
