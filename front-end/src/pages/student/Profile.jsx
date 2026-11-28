import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  UserRound,
  LockKeyhole,
  Bell,
  BookOpen,
  Award,
  Save,
  Mail,
  CalendarDays,
} from 'lucide-react';
import StudentPage from '../../components/student/StudentPage';
import {
  AdminHeader,
  AdminDataState,
  AdminMetric,
} from '../../components/admin/AdminUI';
import { InboxPanel } from '../../components/workspace/NotificationBell';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { changePassword } from '../../store/actions/authActions';
import {
  fetchStudentProfile,
  updateStudentProfile,
} from '../../store/actions/learnersActions';
import { dateLabel } from '../../utils/adminDisplay';
export default function Profile() {
  const dispatch = useAppDispatch();
  const {
    data: student,
    loading: isLoading,
    error,
  } = useAppSelector((s) => s.learners.studentProfile);
  const savingProfile = useAppSelector((s) => s.learners.saving);
  const changingPassword = useAppSelector((s) => s.auth.loading);
  const authUserId = useAppSelector((s) => s.auth.user_id);
  const busy = savingProfile || changingPassword;
  const refreshData = useCallback(
    () => dispatch(fetchStudentProfile()),
    [dispatch]
  );
  const [params, setParams] = useSearchParams();
  const tab = ['account', 'security', 'notifications'].includes(
    params.get('tab')
  )
    ? params.get('tab')
    : 'account';
  const [form, setForm] = useState(null);
  const [password, setPassword] = useState({
    current: '',
    next: '',
    confirm: '',
  });
  const [message, setMessage] = useState('');
  const [failure, setFailure] = useState('');
  useEffect(() => {
    document.title = 'My account | Acadex';
    refreshData();
  }, [refreshData]);
  useEffect(() => {
    if (student)
      setForm({
        name: student.name || '',
        title: student.title || '',
        phone: student.phone || '',
        bio: student.bio || '',
        location: student.location || '',
      });
  }, [student]);
  async function save(e) {
    e.preventDefault();
    setFailure('');
    setMessage('');
    if (tab === 'security' && password.next !== password.confirm) {
      setFailure('The new passwords do not match.');
      return;
    }
    try {
      if (tab === 'security') {
        await dispatch(
          changePassword({
            currentPassword: password.current,
            newPassword: password.next,
            userId: authUserId || student?.userId,
          })
        ).unwrap();
        setPassword({ current: '', next: '', confirm: '' });
        setMessage('Your password has been changed.');
      } else {
        await dispatch(updateStudentProfile(form)).unwrap();
        setMessage('Your profile has been saved.');
      }
    } catch (err) {
      setFailure(
        (typeof err === 'string' ? err : err?.message) ||
          'Unable to save changes.'
      );
    }
  }
  function choose(value) {
    setParams({ tab: value });
    setFailure('');
    setMessage('');
  }
  return (
    <StudentPage>
      <AdminHeader title="My account" />
      <AdminDataState
        loading={isLoading}
        error={error?.message || error || ''}
        refresh={refreshData}
      />
      {student && !error && (
        <>
          <section className="learner-profile-banner admin-card">
            <div className="learner-profile-identity">
              <span className="learner-profile-avatar">
                {student.name?.charAt(0)}
              </span>
              <div>
                <span className="learner-kicker">Learner workspace</span>
                <h2>{student.name}</h2>
                <p>
                  <Mail size={13} />
                  {student.email}
                </p>
                {student.createdAt && (
                  <p>
                    <CalendarDays size={13} />
                    Joined {dateLabel(student.createdAt)}
                  </p>
                )}
              </div>
            </div>
            <Link to="/student/my-learning" className="admin-button">
              My learning
              <BookOpen size={15} />
            </Link>
          </section>
          <div className="admin-stats-grid">
            <AdminMetric
              icon={BookOpen}
              label="Enrolled courses"
              value={student.enrolledCourses}
            />
            <AdminMetric
              icon={BookOpen}
              label="In progress"
              value={student.inProgressCourses}
            />
            <AdminMetric
              icon={Award}
              label="Completed courses"
              value={student.completedCourses}
            />
            <AdminMetric
              icon={Award}
              label="Certificates"
              value={student.certificatesEarned}
              to="/student/certificates"
            />
          </div>
          <nav className="workspace-tabs" aria-label="My account sections">
            {[
              ['account', 'Profile', UserRound],
              ['security', 'Security', LockKeyhole],
              ['notifications', 'Notifications', Bell],
            ].map(([value, label, Icon]) => (
              <button
                key={value}
                aria-pressed={tab === value}
                onClick={() => choose(value)}
              >
                <span className="flex items-center gap-2">
                  <Icon size={15} />
                  {label}
                </span>
              </button>
            ))}
          </nav>
          {tab === 'notifications' ? (
            <section className="admin-card !p-0">
              <InboxPanel />
            </section>
          ) : (
            <div className="learner-profile-columns">
              <form onSubmit={save} className="admin-card learner-form">
                <h2>
                  {tab === 'security' ? 'Change password' : 'Personal details'}
                </h2>
                {tab === 'account' && form ? (
                  <>
                    <div className="learner-field-grid">
                      <label>
                        <span>
                          Full name{' '}
                          <span className="required-marker" aria-hidden="true">
                            *
                          </span>
                        </span>
                        <input
                          required
                          minLength={2}
                          maxLength={80}
                          className="admin-input"
                          value={form.name}
                          onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                          }
                        />
                      </label>
                      <label>
                        Email address
                        <input
                          className="admin-input"
                          value={student.email}
                          readOnly
                        />
                        <small>Your sign-in email</small>
                      </label>
                      <label>
                        Headline
                        <input
                          maxLength={80}
                          className="admin-input"
                          placeholder="Your field of study or learning goal"
                          value={form.title}
                          onChange={(e) =>
                            setForm({ ...form, title: e.target.value })
                          }
                        />
                      </label>
                      <label>
                        Phone
                        <input
                          type="tel"
                          maxLength={20}
                          className="admin-input"
                          placeholder="Optional"
                          value={form.phone}
                          onChange={(e) =>
                            setForm({ ...form, phone: e.target.value })
                          }
                        />
                      </label>
                      <label>
                        Location
                        <input
                          maxLength={80}
                          className="admin-input"
                          placeholder="Optional"
                          value={form.location}
                          onChange={(e) =>
                            setForm({ ...form, location: e.target.value })
                          }
                        />
                      </label>
                    </div>
                    <label>
                      About you
                      <textarea
                        maxLength={500}
                        rows={4}
                        className="admin-input"
                        placeholder="What would you like to learn?"
                        value={form.bio}
                        onChange={(e) =>
                          setForm({ ...form, bio: e.target.value })
                        }
                      />
                      <small>{form.bio.length}/500 characters</small>
                    </label>
                  </>
                ) : tab === 'security' ? (
                  <>
                    {[
                      ['current', 'Current password'],
                      ['next', 'New password'],
                      ['confirm', 'Confirm new password'],
                    ].map(([key, label]) => (
                      <label key={key}>
                        <span>
                          {label}{' '}
                          <span className="required-marker" aria-hidden="true">
                            *
                          </span>
                        </span>
                        <input
                          required
                          minLength={6}
                          className="admin-input"
                          type="password"
                          autoComplete={
                            key === 'current'
                              ? 'current-password'
                              : 'new-password'
                          }
                          value={password[key]}
                          onChange={(e) =>
                            setPassword({ ...password, [key]: e.target.value })
                          }
                        />
                      </label>
                    ))}
                    <p className="admin-muted">
                      Use uppercase and lowercase letters, a number, a symbol,
                      and at least six characters.
                    </p>
                  </>
                ) : null}
                {failure && (
                  <p className="workspace-error" role="alert">
                    {failure}
                  </p>
                )}
                {message && (
                  <p className="admin-success" role="status">
                    {message}
                  </p>
                )}
                <div className="learner-form-footer">
                  <button
                    disabled={busy || !form}
                    className="admin-button admin-button-primary"
                  >
                    <Save size={14} />
                    {busy
                      ? 'Saving…'
                      : tab === 'security'
                        ? 'Change password'
                        : 'Save profile'}
                  </button>
                </div>
              </form>
              <aside className="grid gap-5">
                <section className="admin-card learner-account-note">
                  <span className="admin-icon-tile admin-icon-green">
                    <Bell size={20} />
                  </span>
                  <h2>Your learning updates</h2>
                  <p>
                    Course updates, certificates and support replies are
                    together in your account inbox.
                  </p>
                  <button
                    className="admin-button mt-4"
                    onClick={() => choose('notifications')}
                  >
                    Open notifications
                  </button>
                </section>
                <section className="admin-card learner-account-note">
                  <span className="admin-icon-tile admin-icon-green">
                    <Award size={20} />
                  </span>
                  <h2>Your achievements</h2>
                  <p>View and verify the certificates you have earned.</p>
                  <Link
                    className="admin-button mt-4"
                    to="/student/certificates"
                  >
                    View certificates
                  </Link>
                </section>
              </aside>
            </div>
          )}
        </>
      )}
    </StudentPage>
  );
}
