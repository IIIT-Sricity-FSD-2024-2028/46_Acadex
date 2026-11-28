import SearchableSelect from '../../components/common/SearchableSelect';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import StudentPage from '../../components/student/StudentPage';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  clearDisputeError,
  createStudentDispute,
  fetchStudentDisputeCategories,
} from '../../store/actions/disputesActions';
import { fetchStudentEnrollments } from '../../store/actions/enrollmentsActions';
import { fetchWorkspaceNotifications } from '../../store/actions/notificationsActions';
import { AdminHeader, AdminDataState } from '../../components/admin/AdminUI';
export default function SupportRequest() {
  const dispatch = useAppDispatch();
  const categories = useAppSelector((s) => s.disputes.categories);
  const busy = useAppSelector((s) => s.disputes.saving);
  const actionError = useAppSelector((s) => s.disputes.actionError);
  const courses = useAppSelector((s) => s.enrollments);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    subject: '',
    description: '',
    courseId: '',
    category: '',
  });
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    dispatch(clearDisputeError());
    dispatch(fetchStudentDisputeCategories());
    dispatch(fetchStudentEnrollments());
  }, [dispatch]);

  async function submit(e) {
    e.preventDefault();
    if (!form.category) {
      setValidationError('Choose an issue category.');
      return;
    }
    setValidationError('');
    try {
      const created = await dispatch(createStudentDispute(form)).unwrap();
      dispatch(fetchWorkspaceNotifications());
      navigate(`/student/disputes/${created.id}`, { replace: true });
    } catch {
      // handled by disputesSlice
    }
  }
  const error = validationError || actionError;
  return (
    <StudentPage>
      <Link className="admin-count-label" to="/student/disputes">
        <ArrowLeft size={14} />
        Support requests
      </Link>
      <AdminHeader title="New support request" />
      <div className="learner-support-form">
        <form className="admin-card learner-form" onSubmit={submit}>
          <h2>Tell us what happened</h2>
          <label>
            <span>
              Subject{' '}
              <span className="required-marker" aria-hidden="true">
                *
              </span>
            </span>
            <input
              required
              maxLength={160}
              className="admin-input"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="A short description of the issue"
            />
          </label>
          <SearchableSelect
            label="Issue category"
            required
            value={form.category}
            onChange={(category) => setForm({ ...form, category })}
            options={(categories.data || []).map((category) => ({
              value: category,
              label: category,
            }))}
            placeholder="Choose an issue category"
            searchPlaceholder="Search issue categories…"
          />
          <AdminDataState
            loading={categories.loading}
            error={categories.error}
            refresh={() => dispatch(fetchStudentDisputeCategories())}
          />
          <SearchableSelect
            label="Related course"
            value={form.courseId}
            onChange={(courseId) => setForm({ ...form, courseId })}
            options={[
              { value: '', label: 'General account or payment question' },
              ...(courses.data || []).map((c) => ({
                value: c.courseId,
                label: c.courseTitle,
              })),
            ]}
            placeholder="Choose an enrolled course"
            searchPlaceholder="Search your enrolled courses…"
          />
          <AdminDataState
            loading={courses.loading}
            error={courses.error}
            refresh={() => dispatch(fetchStudentEnrollments())}
          />
          <label>
            <span>
              Details{' '}
              <span className="required-marker" aria-hidden="true">
                *
              </span>
            </span>
            <textarea
              required
              maxLength={5000}
              rows={7}
              className="admin-input"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Include what you were doing, what went wrong and the help you need."
            />
          </label>
          {error && (
            <p role="alert" className="workspace-error">
              {error}
            </p>
          )}
          <div className="learner-form-footer">
            <button
              className="admin-button admin-button-primary"
              disabled={busy}
            >
              <Send size={14} />
              {busy ? 'Submitting…' : 'Submit request'}
            </button>
          </div>
        </form>
      </div>
    </StudentPage>
  );
}
