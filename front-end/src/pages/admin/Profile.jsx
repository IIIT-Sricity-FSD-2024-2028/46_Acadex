import React, { useEffect, useState } from 'react';
import { ShieldCheck, Clock3, Save } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  clearUsersActionError,
  fetchAdminSession,
  updateAdminProfile,
} from '../../store/actions/usersActions';
import {
  AdminDataState,
  AdminHeader,
  AdminSectionHeader,
} from '../../components/admin/AdminUI';
import { dateLabel } from '../../utils/adminDisplay';
export const Profile = () => {
  const dispatch = useAppDispatch();
  const adminSession = useAppSelector((s) => s.users.adminSession);
  const busy = useAppSelector((s) => s.users.saving);
  const error = useAppSelector((s) => s.users.actionError);
  const session = {
    profile: adminSession.data?.profile || null,
    permissions: adminSession.data?.permissions || [],
    loading: adminSession.loading,
    error: adminSession.error,
    refresh: () => dispatch(fetchAdminSession()),
  };
  const [form, setForm] = useState({ name: '', email: '' });
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    dispatch(clearUsersActionError());
    dispatch(fetchAdminSession());
  }, [dispatch]);
  useEffect(() => {
    if (session.profile)
      setForm({
        name: session.profile.name || '',
        email: session.profile.email || '',
      });
  }, [session.profile]);
  async function save(e) {
    e.preventDefault();
    if (busy) return;
    setSaved(false);
    try {
      await dispatch(updateAdminProfile(form)).unwrap();
      setSaved(true);
    } catch {
      // handled by usersSlice
    }
  }
  return (
    <div className="admin-page">
      <AdminHeader
        eyebrow="Account settings"
        title="My profile"
        description="Your account details and workspace identity."
      />
      {!session.profile ? (
        <AdminDataState {...session} />
      ) : (
        <div className="grid lg:grid-cols-[minmax(240px,1fr)_2fr] gap-5 items-start">
          <section className="admin-card text-center">
            <span className="admin-avatar !w-20 !h-20 !text-3xl mx-auto mt-3 mb-5">
              {session.profile.name?.charAt(0) || 'A'}
            </span>
            <h2 className="font-semibold text-lg">{session.profile.name}</h2>
            <p className="admin-muted break-all mt-2">
              {session.profile.email}
            </p>
            <div className="border-t border-[#edf1e9] mt-6 pt-5 space-y-4 text-left">
              <p className="admin-record-meta">
                <ShieldCheck size={16} />
                {session.profile.role}
              </p>
              <p className="admin-record-meta">
                <Clock3 size={16} />
                Last login: {dateLabel(session.profile.lastLogin)}
              </p>
            </div>
          </section>
          <form onSubmit={save} className="admin-card space-y-6">
            <AdminSectionHeader
              title="Personal information"
              description="Keep your name and contact email up to date."
            />
            {error && (
              <p role="alert" className="admin-alert">
                {error}
              </p>
            )}
            {saved && (
              <p role="status" className="admin-success">
                Your profile has been updated.
              </p>
            )}
            <label className="block text-xs">
              <span>
                Full name{' '}
                <span className="required-marker" aria-hidden="true">
                  *
                </span>
              </span>
              <input
                required
                maxLength={160}
                className="admin-input mt-2"
                value={form.name}
                onChange={(e) => {
                  setForm({ ...form, name: e.target.value });
                  setSaved(false);
                }}
              />
            </label>
            <label className="block text-xs">
              <span>
                Email address{' '}
                <span className="required-marker" aria-hidden="true">
                  *
                </span>
              </span>
              <input
                required
                type="email"
                className="admin-input mt-2"
                value={form.email}
                onChange={(e) => {
                  setForm({ ...form, email: e.target.value });
                  setSaved(false);
                }}
              />
            </label>
            <div className="border-t border-[#edf1e9] pt-5 flex justify-end">
              <button
                disabled={busy || !form.name.trim()}
                className="admin-button admin-button-primary"
              >
                <Save size={14} />
                {busy ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
