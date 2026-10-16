import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Calendar, Building2, CheckCircle2, Clock3, Award, BookOpen, X, Check } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import HumanAvatar from '../../components/common/HumanAvatar';
import { useToast } from '../../components/common/Toast';
import api from '../../services/api';
import { useStudent } from '../../context/StudentContext';

const FIELDS = [
  { name: 'name', label: 'Full name', max: 80 },
  { name: 'title', label: 'Headline', max: 80, placeholder: 'e.g. Final-year CS student' },
  { name: 'location', label: 'Location', max: 80 },
  { name: 'phone', label: 'Phone', max: 20 },
];

export default function Profile() {
  const { addToast } = useToast();
  const { student, enrollments, certificates, isLoading, refreshData, updateProfile } = useStudent();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [orgs, setOrgs] = useState([]);
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);

  useEffect(() => {
    document.title = 'Profile & Settings | NexusEdu';
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    if (student && !form) {
      setForm({
        name: student.name || '',
        title: student.title || '',
        location: student.location || '',
        phone: student.phone || '',
        bio: student.bio || '',
      });
    }
  }, [student, form]);

  const openOrgModal = () => {
    setShowOrgModal(true);
    api.student.getOrganizations().then((o) => setOrgs(Array.isArray(o) ? o : [])).catch(() => setOrgs([]));
  };

  const save = async (e) => {
    e.preventDefault();
    if (form.name.trim().length < 2) return addToast('Name must be at least 2 characters', 'warning');
    setSaving(true);
    try {
      await updateProfile(form);
      addToast('Profile saved', 'success');
    } catch (err) {
      addToast(err.message || 'Could not save profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const requestJoin = async () => {
    if (!selectedOrg) return;
    setSaving(true);
    try {
      await api.student.joinOrganization(selectedOrg.id, selectedOrg.name);
      await refreshData();
      setShowOrgModal(false);
      addToast(`Request sent to ${selectedOrg.name}`, 'success');
    } catch (err) {
      addToast(err.message || 'Could not send request', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !student || !form) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#0056D2] border-t-transparent" />
        </div>
      </PageLayout>
    );
  }

  const completed = enrollments.filter((e) => e.status === 'Completed');
  const membership = student.orgMembershipStatus || 'Independent Learner';
  const certByCourse = Object.fromEntries(certificates.map((c) => [c.courseId, c]));

  return (
    <PageLayout>
      <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-8 space-y-6">
        <header>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Profile</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <aside className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 text-center">
              <div className="w-24 h-24 mx-auto mb-3">
                <HumanAvatar name={student.name} className="w-full h-full" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">{student.name}</h2>
              {student.title && <p className="text-xs text-slate-500">{student.title}</p>}
              <div className="mt-4 space-y-2 text-xs text-slate-600 text-left">
                <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-slate-400" /> {student.email}</p>
                {student.location && (
                  <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {student.location}</p>
                )}
                {student.createdAt && (
                  <p className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> Member since{' '}
                    {new Date(student.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                ['Enrolled', student.enrolledCourses, '/student/my-learning'],
                ['In progress', student.inProgressCourses, '/student/my-learning'],
                ['Completed', student.completedCourses, '/student/my-learning'],
                ['Certificates', student.certificatesEarned, '/student/certificates'],
              ].map(([label, value, to]) => (
                <Link key={label} to={to} className="bg-white border border-slate-200 rounded-xl p-3 text-center hover:border-[#0056D2]">
                  <p className="text-xl font-extrabold text-slate-900">{value}</p>
                  <p className="text-[11px] text-slate-500 font-medium">{label}</p>
                </Link>
              ))}
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
              <p className="text-xs font-bold text-slate-900 flex items-center gap-2"><Building2 className="w-4 h-4 text-slate-400" /> Organization</p>
              {membership === 'Verified Student' ? (
                <p className="text-xs text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Student of {student.organizationName || student.requestedOrgName}
                </p>
              ) : membership === 'Pending Organization Approval' ? (
                <p className="text-xs text-amber-700 flex items-center gap-1.5">
                  <Clock3 className="w-3.5 h-3.5" /> Request pending with {student.requestedOrgName}
                </p>
              ) : (
                <>
                  <p className="text-xs text-slate-500">You are an independent learner.</p>
                  <button onClick={openOrgModal} className="w-full py-2 rounded-lg border border-[#0056D2] text-[#0056D2] text-xs font-bold hover:bg-blue-50">
                    Request to join an organization
                  </button>
                </>
              )}
            </div>
          </aside>

          <div className="lg:col-span-8 space-y-6">
            <form onSubmit={save} className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Personal details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {FIELDS.map((f) => (
                  <div key={f.name}>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">{f.label}</label>
                    <input
                      value={form[f.name]}
                      maxLength={f.max}
                      placeholder={f.placeholder}
                      onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                      className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0056D2]"
                    />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Email</label>
                  <input value={student.email} disabled className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500" />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-600">Bio</label>
                  <span className="text-[10px] text-slate-400">{form.bio.length}/500</span>
                </div>
                <textarea
                  rows={4}
                  maxLength={500}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0056D2] resize-none"
                />
              </div>
              <button type="submit" disabled={saving} className="px-5 py-2 bg-[#0056D2] text-white rounded-lg text-xs font-bold disabled:opacity-50">
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </form>

            <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-900">Completed courses</h3>
                <Link to="/student/certificates" className="text-xs font-bold text-[#0056D2] hover:underline">All certificates</Link>
              </div>
              {completed.length === 0 ? (
                <p className="text-xs text-slate-500 py-4">
                  No completed courses yet. Courses you finish appear here with their certificate.
                </p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {completed.map((e) => (
                    <li key={e.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{e.courseTitle}</p>
                          <p className="text-[11px] text-slate-500">{e.instructorName}</p>
                        </div>
                      </div>
                      {certByCourse[e.courseId] && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded shrink-0">
                          <Award className="w-3 h-3" /> {certByCourse[e.courseId].credentialId}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </div>

      {showOrgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-900">Join an organization</h3>
              <button onClick={() => setShowOrgModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-slate-500">The organization admin will review your request.</p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {orgs.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No organizations found.</p>
              ) : (
                orgs.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => setSelectedOrg(o)}
                    className={`w-full p-3 rounded-xl border text-left text-sm flex justify-between items-center ${
                      selectedOrg?.id === o.id ? 'border-[#0056D2] bg-blue-50' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-semibold text-slate-800">{o.name}</span>
                    {selectedOrg?.id === o.id && <Check className="w-4 h-4 text-[#0056D2]" />}
                  </button>
                ))
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setShowOrgModal(false)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button
                onClick={requestJoin}
                disabled={!selectedOrg || saving}
                className="px-5 py-2 rounded-lg bg-[#0056D2] text-white text-xs font-bold disabled:opacity-50"
              >
                Send request
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
