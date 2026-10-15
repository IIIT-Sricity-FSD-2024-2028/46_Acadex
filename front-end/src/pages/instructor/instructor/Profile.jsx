import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input, Avatar, Badge } from '../../../components/common';
import { Building2, CheckCircle2, LogOut, AlertTriangle, X, AlertCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { useInstructor } from '../../../hooks/useInstructor';
import { ConnectUniversity } from '../onboarding/ConnectUniversity';

const toForm = (d = {}) => ({
  name: d.name || '',
  educatorType: d.educatorType || '',
  specialization: d.specialization || '',
  department: d.department || '',
  phone: d.phone || '',
  location: d.location || '',
  website: d.website || '',
  bio: d.bio || '',
  expertise: Array.isArray(d.expertise) ? d.expertise.join(', ') : d.expertise || '',
  qualification: d.qualification || '',
  experience: d.experience || '',
});

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const textareaClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0056D2]/20 focus:border-[#0056D2]';

export function Profile() {
  const { instructor, isAffiliated, refreshInstructor, leaveOrganization, actionLoading } = useInstructor();
  const [form, setForm] = useState(toForm());
  const [initial, setInitial] = useState(toForm());
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);
  const [showLeave, setShowLeave] = useState(false);
  const [leaveError, setLeaveError] = useState('');

  useEffect(() => {
    if (instructor) {
      setForm(toForm(instructor));
      setInitial(toForm(instructor));
    }
  }, [instructor]);

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);

  const save = async (e) => {
    e.preventDefault();
    if (form.name.trim().length < 2) return setStatus({ type: 'error', text: 'Full name is required' });
    if (form.website && !/^https?:\/\/\S+\.\S+/.test(form.website)) {
      return setStatus({ type: 'error', text: 'Website must start with http:// or https://' });
    }
    setSaving(true);
    setStatus(null);
    try {
      await api.instructors.update(instructor.id, {
        ...form,
        name: form.name.trim(),
        expertise: form.expertise.split(',').map((s) => s.trim()).filter(Boolean),
      });
      localStorage.setItem('user_name', form.name.trim());
      await refreshInstructor();
      setStatus({ type: 'success', text: 'Profile saved' });
    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'Could not save profile' });
    } finally {
      setSaving(false);
    }
  };

  const leave = async () => {
    setLeaveError('');
    try {
      await leaveOrganization();
      setShowLeave(false);
      setStatus({ type: 'success', text: 'You left the organization' });
    } catch (err) {
      setLeaveError(err.message || 'Could not leave the organization');
    }
  };

  if (!instructor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] gap-3 text-slate-400">
        <Loader2 className="w-7 h-7 animate-spin text-[#0056D2]" />
        <p className="text-xs font-medium">Loading instructor profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Instructor profile</h1>
          <p className="text-slate-500 text-sm mt-1">Your public details and organization membership.</p>
        </div>
        {status && (
          <div
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border ${
              status.type === 'success' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-rose-700 bg-rose-50 border-rose-200'
            }`}
          >
            {status.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {status.text}
          </div>
        )}
      </div>

      <Card className="border-blue-100">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-[#0056D2] border border-blue-100">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900">Organization</CardTitle>
                <CardDescription>Membership is approved by the organization's admin.</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={isAffiliated ? 'success' : 'default'}>{isAffiliated ? 'Member' : 'Not a member'}</Badge>
              {isAffiliated && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLeave(true)}
                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                >
                  <LogOut className="w-4 h-4 mr-1.5" /> Leave
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {isAffiliated ? (
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-xs font-bold text-slate-500">Organization</dt>
                <dd className="font-semibold text-slate-900 mt-0.5">{instructor.organizationName}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-slate-500">Member since</dt>
                <dd className="font-semibold text-slate-900 mt-0.5">
                  {instructor.orgJoinedAt
                    ? new Date(instructor.orgJoinedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                    : instructor.joinedDate || '—'}
                </dd>
              </div>
            </dl>
          ) : (
            <ConnectUniversity embedded />
          )}
        </CardContent>
      </Card>

      <form onSubmit={save} className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <Avatar fallback={form.name || instructor.email} size="xl" className="h-20 w-20 text-2xl font-bold bg-blue-50 text-[#0056D2] border border-blue-200/60" />
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <Field label="Full name">
                  <Input value={form.name} onChange={set('name')} placeholder="e.g. Priya Nair" maxLength={80} />
                </Field>
                <Field label="Title">
                  <Input value={form.educatorType} onChange={set('educatorType')} placeholder="e.g. Senior Lecturer" maxLength={80} />
                </Field>
                <Field label="Specialization">
                  <Input value={form.specialization} onChange={set('specialization')} placeholder="e.g. Full Stack Development" maxLength={100} />
                </Field>
                <Field label="Department">
                  <Input value={form.department} onChange={set('department')} placeholder="e.g. Computer Science" maxLength={100} />
                </Field>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact details</CardTitle>
            <CardDescription>Visible to your organization's admins.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Email">
                <Input value={instructor.email} disabled className="bg-slate-50 text-slate-500" />
              </Field>
              <Field label="Phone">
                <Input type="tel" value={form.phone} onChange={set('phone')} placeholder="e.g. +91 98765 43210" maxLength={20} />
              </Field>
              <Field label="Location">
                <Input value={form.location} onChange={set('location')} placeholder="e.g. Bengaluru, India" maxLength={80} />
              </Field>
              <Field label="Website or portfolio">
                <Input type="url" value={form.website} onChange={set('website')} placeholder="https://your-site.com" maxLength={200} />
              </Field>
            </div>
            <Field label="Bio">
              <textarea
                className={`${textareaClass} min-h-[100px]`}
                value={form.bio}
                onChange={set('bio')}
                maxLength={1000}
                placeholder="A short introduction students will see on your courses."
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Credentials</CardTitle>
            <CardDescription>Expertise, education and experience.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Expertise (comma separated)">
              <Input value={form.expertise} onChange={set('expertise')} placeholder="e.g. React, Node.js, System Design" />
            </Field>
            <Field label="Education">
              <Input value={form.qualification} onChange={set('qualification')} placeholder="e.g. M.Tech, Computer Science — IIT Madras" />
            </Field>
            <Field label="Experience">
              <textarea
                className={`${textareaClass} min-h-[80px]`}
                value={form.experience}
                onChange={set('experience')}
                maxLength={1000}
                placeholder="Roles, years of teaching, notable projects."
              />
            </Field>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" disabled={!dirty || saving} onClick={() => setForm(initial)}>
            Discard changes
          </Button>
          <Button type="submit" disabled={!dirty || saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </form>

      {showLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900">Leave {instructor.organizationName}?</h3>
                <p className="text-sm text-slate-500 mt-1">
                  You'll be removed from its courses and lose access to your studio until another organization approves you.
                </p>
              </div>
              <button type="button" onClick={() => setShowLeave(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            {leaveError && <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-3">{leaveError}</p>}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setShowLeave(false)}>
                Cancel
              </Button>
              <Button type="button" disabled={actionLoading} onClick={leave} className="bg-rose-600 hover:bg-rose-700 text-white">
                Leave organization
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
