import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Calendar, Award, BookOpen } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import HumanAvatar from '../../components/common/HumanAvatar';
import { useToast } from '../../components/common/Toast';
import api from '../../services/api';
import { useStudent } from '../../context/StudentContext';

const FIELDS = [
  { name: 'name', label: 'Full name', max: 80, placeholder: 'Your full name' },
  { name: 'title', label: 'Headline', max: 80, placeholder: 'e.g. Final-year CS student' },
  { name: 'location', label: 'Location', max: 80, placeholder: 'e.g. Bengaluru, India' },
  { name: 'phone', label: 'Phone', max: 20, placeholder: 'e.g. +91 98765 43210' },
];

export default function Profile() {
  const { addToast } = useToast();
  const { student, enrollments, certificates, isLoading, refreshData, updateProfile } = useStudent();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.title = 'Profile & Settings | Acadex';
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
                      className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0056D2]"
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
                  placeholder="A short introduction about your learning goals."
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0056D2] resize-none"
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
    </PageLayout>
  );
}
