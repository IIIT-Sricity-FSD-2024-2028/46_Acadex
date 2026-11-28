import SearchableSelect from '../../../components/common/SearchableSelect';
import React, { useState, useEffect } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  clearReviewError,
  deleteReviewReply,
  fetchInstructorReviews,
  replyToReview,
} from '../../../store/actions/reviewsActions';
import {
  AdminHeader,
  AdminMetric,
  AdminSearch,
  AdminDataState,
  AdminEmpty,
} from '../../../components/admin/AdminUI';
import { dateLabel, ratingLabel } from '../../../utils/adminDisplay';
export function Reviews() {
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.reviews.instructorReviews);
  const busy = useAppSelector((s) => s.reviews.saving);
  const error = useAppSelector((s) => s.reviews.actionError);
  useEffect(() => {
    dispatch(clearReviewError());
    dispatch(fetchInstructorReviews());
  }, [dispatch]);
  const [search, setSearch] = useState('');
  const [course, setCourse] = useState('');
  const [rating, setRating] = useState('');
  const [editing, setEditing] = useState(null);
  const [reply, setReply] = useState('');
  const all = state.data || [];
  const courses = [
    ...new Map(all.map((r) => [r.courseId, r.courseTitle])).entries(),
  ];
  const rows = all.filter(
    (r) =>
      (!course || r.courseId === course) &&
      (!rating || Number(r.rating) === Number(rating)) &&
      `${r.learnerName || ''} ${r.courseTitle || ''} ${r.comment || r.content || ''}`
        .toLowerCase()
        .includes(search.toLowerCase())
  );
  async function save(id, remove = false) {
    try {
      if (remove) {
        await dispatch(deleteReviewReply(id)).unwrap();
      } else {
        await dispatch(replyToReview({ id, response: reply })).unwrap();
      }
      setEditing(null);
      setReply('');
    } catch {
      // handled by reviewsSlice
    }
  }
  return (
    <div className="admin-page">
      <AdminHeader title="Course reviews" />
      <AdminDataState
        loading={state.loading}
        error={state.error}
        refresh={() => dispatch(fetchInstructorReviews())}
      />
      {error && (
        <p className="workspace-error" role="alert">
          {error}
        </p>
      )}
      {state.data && !state.error && (
        <>
          <div className="admin-stats-grid">
            <AdminMetric
              icon={MessageSquare}
              label="Course reviews"
              value={all.length}
            />
            <AdminMetric
              icon={Star}
              label="Average rating"
              value={ratingLabel(
                all.length
                  ? all.reduce((s, r) => s + Number(r.rating), 0) / all.length
                  : null
              )}
            />
          </div>
          <div className="admin-toolbar">
            <AdminSearch
              value={search}
              onChange={setSearch}
              placeholder="Search learner, course or review…"
            />
            <SearchableSelect
              label="Course"
              value={course}
              onChange={setCourse}
              options={[
                { value: '', label: 'All reviewed courses' },
                ...courses.map(([id, title]) => ({ value: id, label: title })),
              ]}
            />
            <label className="activity-filter">
              Rating
              <select
                className="admin-input mt-2"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
              >
                <option value="">All ratings</option>
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} stars
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="admin-grid">
            {rows.map((r) => (
              <article className="admin-card" key={r.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold">
                      {r.learnerName || 'Learner name not recorded'}
                    </h2>
                    <p className="admin-muted mt-2">{r.courseTitle}</p>
                  </div>
                  <span className="flex items-center gap-1 text-amber-700">
                    <Star size={15} />
                    {ratingLabel(r.rating)}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap my-5">
                  {r.comment || r.content || 'No written review'}
                </p>
                <p className="admin-muted">{dateLabel(r.createdAt)}</p>
                {r.response && (
                  <div className="bg-emerald-50 rounded-xl p-4 mt-4">
                    <p className="text-xs font-semibold text-emerald-800">
                      Your reply
                    </p>
                    <p className="text-sm whitespace-pre-wrap mt-2">
                      {r.response}
                    </p>
                  </div>
                )}
                {editing === r.id ? (
                  <form
                    className="learner-form mt-4"
                    onSubmit={(e) => {
                      e.preventDefault();
                      save(r.id);
                    }}
                  >
                    <label>
                      <span>
                        Your reply{' '}
                        <span className="required-marker" aria-hidden="true">
                          *
                        </span>
                      </span>
                      <textarea
                        className="admin-input"
                        rows={4}
                        required
                        maxLength={5000}
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                      />
                    </label>
                    <div className="flex gap-2">
                      <button
                        disabled={busy || !reply.trim()}
                        className="admin-button admin-button-primary"
                      >
                        {busy ? 'Saving…' : 'Save reply'}
                      </button>
                      <button
                        type="button"
                        className="admin-button"
                        onClick={() => setEditing(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex gap-2 mt-4">
                    <button
                      className="admin-button"
                      onClick={() => {
                        setEditing(r.id);
                        setReply(r.response || '');
                      }}
                    >
                      {r.response ? 'Edit reply' : 'Reply'}
                    </button>
                    {r.response && (
                      <button
                        disabled={busy}
                        className="admin-button"
                        onClick={() => save(r.id, true)}
                      >
                        Delete reply
                      </button>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
          {!rows.length && (
            <AdminEmpty
              title="No matching reviews"
              description="Reviews from learners in your assigned courses will appear here."
            />
          )}
        </>
      )}
    </div>
  );
}
