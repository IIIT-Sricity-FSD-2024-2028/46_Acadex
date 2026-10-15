// =========================================================================================
// FDFED M2026 - Student Module: Student Profile & Academic Portfolio
// Design: Stitch Coursera Academic Precision Desktop Layout (NexusPay Learning)
// Author: Student Portal Implementation | IIIT Sri City
// =========================================================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  MapPin,
  Calendar,
  Link as LinkIcon,
  Github,
  Globe,
  Flame, 
  CreditCard, 
  Download, 
  Award, 
  Check, 
  Plus,
  Building2,
  CheckCircle2,
  Clock3,
  UserCheck,
  BookOpen,
  PlayCircle,
  ExternalLink,
  Linkedin
} from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import Badge from '../../components/common/Badge';
import { useToast } from '../../components/common/Toast';
import api from '../../services/api';
import HumanAvatar from '../../components/common/HumanAvatar';
import { useStudent } from '../../context/StudentContext';
import { useForm } from '../../hooks/useForm';

export default function Profile() {
  const { addToast } = useToast();
  const { student, updateProfile: updateStudentContextProfile } = useStudent();

  const [activeTab, setActiveTab] = useState('Overview');
  const [profile, setProfile] = useState(null);
  const [payments, setPayments] = useState([]);
  const [orgsList, setOrgsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [submittingOrg, setSubmittingOrg] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Advanced Form Validation
  const validateProfile = (vals) => {
    const errs = {};
    if (!vals.name || vals.name.trim().length < 2) {
      errs.name = 'Full name must be at least 2 characters.';
    }
    if (!vals.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vals.email)) {
      errs.email = 'Please provide a valid email address.';
    }
    if (!vals.title || vals.title.trim().length < 2) {
      errs.title = 'Professional title is required.';
    }
    if (vals.bio && vals.bio.length > 500) {
      errs.bio = 'Bio cannot exceed 500 characters.';
    }
    return errs;
  };

  const userId = localStorage.getItem('nexuspay_user_id') || localStorage.getItem('user_id') || '';

  const {
    values: profileForm,
    errors: formErrors,
    touched: formTouched,
    handleChange: handleFormChange,
    handleBlur: handleFormBlur,
    handleSubmit: handleFormSubmit,
    setValues: setProfileFormValues,
    isSubmitting: isSavingProfile
  } = useForm(
    {
      name: student?.name || '',
      email: student?.email || '',
      title: student?.title || '',
      location: student?.location || '',
      bio: student?.bio || '',
      university: student?.institution || '',
    },
    validateProfile
  );

  const loadData = () => {
    Promise.all([
      api.student.getProfile(userId).catch(() => null),
      api.student.getPayments(userId).catch(() => []),
      api.student.getOrganizations().catch(() => []),
    ])
      .then(([p, pay, o]) => {
        if (p) {
          setProfile(p);
          setProfileFormValues({
            name: p.name || student?.name || '',
            email: p.email || student?.email || '',
            title: p.learnerType || student?.title || '',
            location: p.location || student?.location || '',
            bio: p.bio || student?.bio || '',
            university: p.requestedOrgName || p.university || student?.institution || '',
          });
        }
        setPayments(Array.isArray(pay) ? pay : []);
        setOrgsList(Array.isArray(o) ? o : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load profile:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSaveProfile = async (formVals) => {
    try {
      updateStudentContextProfile(formVals);
      await api.student.updateProfile(formVals, userId).catch(() => {});
      addToast('Profile changes saved successfully!', 'success');
      setIsEditing(false);
    } catch (err) {
      addToast('Failed to save profile: ' + err.message, 'error');
    }
  };

  const handleRequestJoinOrg = async () => {
    if (!selectedOrg) return;
    try {
      setSubmittingOrg(true);
      await api.student.joinOrganization(selectedOrg.id, selectedOrg.name, userId);
      addToast(`Join request submitted to ${selectedOrg.name}!`, 'success');
      setShowOrgModal(false);
      loadData();
    } catch (err) {
      addToast('Failed to submit request: ' + err.message, 'error');
    } finally {
      setSubmittingOrg(false);
    }
  };

  const handleDownloadInvoice = (inv) => {
    addToast(`Downloading invoice ${inv.id || '#NX-12345'}...`, 'success');
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-coursera border-t-transparent"></div>
        </div>
      </PageLayout>
    );
  }

  const membershipStatus = profile?.orgMembershipStatus || (profile?.university && profile?.university !== 'Independent Learner' ? 'Verified Student' : 'Independent Learner');
  const universityName = profile?.requestedOrgName || profile?.university || '';

  return (
    <PageLayout>
      <div className="bg-[#F8FAFC] min-h-screen py-8">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* 2-Column Stitch Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Profile Sidebar (4 cols on lg) */}
            <aside className="lg:col-span-4 space-y-6">
              
              {/* Profile Card */}
              <div className="bg-white rounded-xl border border-slate-200/80 p-6 flex flex-col items-center text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <div className="w-28 h-28 rounded-full overflow-hidden mb-4 border-4 border-blue-50 shadow-sm relative flex items-center justify-center">
                  <HumanAvatar name={profileForm.name} className="w-full h-full" />
                </div>

                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold text-slate-900">{profileForm.name}</h1>
                  {membershipStatus === 'Verified Student' && (
                    <span title="Official Student" className="text-secondary">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 font-semibold mb-3">{profileForm.title}</p>

                {/* Metadata pills */}
                <div className="space-y-1.5 w-full text-xs text-slate-600 mb-4 pb-4 border-b border-slate-100 text-left">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{profileForm.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Member since Oct 2021</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-800">{universityName}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed text-left mb-5 w-full">
                  {profileForm.bio}
                </p>

                <div className="w-full space-y-2">
                  <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className="w-full py-2.5 px-4 rounded-lg border border-coursera text-coursera hover:bg-blue-50 text-xs font-bold transition-colors"
                  >
                    {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                  </button>

                  {membershipStatus === 'Independent Learner' && (
                    <button
                      onClick={() => setShowOrgModal(true)}
                      className="w-full py-2.5 px-4 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-secondary border border-emerald-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Join University</span>
                    </button>
                  )}
                </div>
              </div>



            </aside>

            {/* Right Main Content Area (8 cols on lg) */}
            <main className="lg:col-span-8 space-y-6">
              
              {/* Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white border border-slate-200/80 rounded-xl p-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-2xl font-black text-coursera">{profile?.enrolledCourses ?? 0}</span>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Courses</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-2xl font-black text-coursera">{profile?.certificatesEarned ?? 0}</span>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Certificates</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-2xl font-black text-coursera">{profile?.completedCourses ?? 0}</span>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Completed</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-2xl font-black text-coursera">{profile?.streakDays ?? 0}</span>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Day Streak</span>
                </div>
              </div>

              {/* Tabs Navigation (Stitch Spec) */}
              <div className="border-b border-slate-200 flex gap-4 overflow-x-auto pb-1 scrollbar-none">
                {['Overview', 'Courses', 'Accomplishments', 'Skills', 'Billing & Invoices'].map((tab) => {
                  const isActive = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-2.5 border-b-2 font-semibold text-xs md:text-sm whitespace-nowrap transition-colors -mb-[1px] ${
                        isActive
                          ? 'border-coursera text-coursera font-bold'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>

              {/* Edit Profile Form (Advanced React Form with useForm hook) */}
              {isEditing && (
                <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold text-slate-900">Update Profile Information</h3>
                    <span className="text-[11px] text-slate-400 font-medium">{student?.email || profile?.email || ''}</span>
                  </div>

                  <form onSubmit={handleFormSubmit(onSaveProfile)} className="space-y-3.5">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={profileForm.name}
                        onChange={handleFormChange}
                        onBlur={handleFormBlur}
                        className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs font-medium focus:outline-none transition-colors ${
                          formTouched.name && formErrors.name
                            ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                            : 'border-slate-200 focus:border-coursera'
                        }`}
                      />
                      {formTouched.name && formErrors.name && (
                        <p className="text-rose-500 text-[11px] mt-1 font-medium">{formErrors.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={profileForm.email}
                        onChange={handleFormChange}
                        onBlur={handleFormBlur}
                        className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs font-medium focus:outline-none transition-colors ${
                          formTouched.email && formErrors.email
                            ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                            : 'border-slate-200 focus:border-coursera'
                        }`}
                      />
                      {formTouched.email && formErrors.email && (
                        <p className="text-rose-500 text-[11px] mt-1 font-medium">{formErrors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Professional Title</label>
                      <input
                        type="text"
                        name="title"
                        value={profileForm.title}
                        onChange={handleFormChange}
                        onBlur={handleFormBlur}
                        className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs font-medium focus:outline-none transition-colors ${
                          formTouched.title && formErrors.title
                            ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                            : 'border-slate-200 focus:border-coursera'
                        }`}
                      />
                      {formTouched.title && formErrors.title && (
                        <p className="text-rose-500 text-[11px] mt-1 font-medium">{formErrors.title}</p>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-600 block">Bio</label>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {profileForm.bio?.length || 0}/500 chars
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        name="bio"
                        value={profileForm.bio}
                        onChange={handleFormChange}
                        onBlur={handleFormBlur}
                        className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs font-medium focus:outline-none transition-colors ${
                          formTouched.bio && formErrors.bio
                            ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                            : 'border-slate-200 focus:border-coursera'
                        }`}
                      />
                      {formTouched.bio && formErrors.bio && (
                        <p className="text-rose-500 text-[11px] mt-1 font-medium">{formErrors.bio}</p>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        disabled={isSavingProfile}
                        className="px-4 py-2 bg-[#0056D2] text-white rounded-lg text-xs font-bold hover:bg-[#00419E] transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {isSavingProfile ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Tab: Overview (Default) */}
              {activeTab === 'Overview' && (
                <div className="space-y-6">
                  
                  {/* Learning Streak Widget (Stitch Spec: 14 Days Fire Icon + 7-Day Chart) */}
                  <section className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
                        <span>Learning Streak</span>
                      </h2>
                      <span className="text-xs font-bold text-slate-600">{profile?.streakDays ?? 0} Days Active</span>
                    </div>

                    <div className="grid grid-cols-7 gap-2 mt-3">
                      {['M','T','W','T','F','S','S'].map((day, i) => (
                        <div key={i} className="h-8 rounded-md bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 font-bold">
                          {day}
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Continue Learning Cards */}
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-bold text-slate-900">Continue Learning</h2>
                      <Link to="/student/my-learning" className="text-xs font-bold text-[#0056D2] hover:underline">
                        View All
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {payments.length === 0 && (
                        <div className="col-span-2 py-8 text-center bg-slate-50 rounded-xl border border-slate-100">
                          <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <p className="text-xs text-slate-400 font-semibold">No courses enrolled yet.</p>
                          <Link to="/student/explore" className="mt-3 inline-block text-xs font-bold text-[#0056D2] hover:underline">
                            Browse Course Catalog
                          </Link>
                        </div>
                      )}
                    </div>
                  </section>

                </div>
              )}

              {/* Tab: Courses */}
              {activeTab === 'Courses' && (
                <div className="bg-white rounded-xl border border-slate-200/80 p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-900">Enrolled Courses</h3>
                    <Link to="/student/my-learning" className="text-xs font-bold text-coursera hover:underline">View All</Link>
                  </div>
                  {(profile?.enrolledCourses ?? 0) === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No courses enrolled yet. <Link to="/student/explore" className="text-coursera font-bold hover:underline">Browse catalog</Link>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">Visit <Link to="/student/my-learning" className="text-coursera font-bold hover:underline">My Learning</Link> to see all enrolled courses and progress.</p>
                  )}
                </div>
              )}

              {/* Tab: Accomplishments */}
              {activeTab === 'Accomplishments' && (
                <div className="bg-white rounded-xl border border-slate-200/80 p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-900">Verified Accomplishments</h3>
                    <Link to="/student/certificates" className="text-xs font-bold text-coursera hover:underline">
                      View Certificates
                    </Link>
                  </div>
                  {(profile?.certificatesEarned ?? 0) === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      Complete a course to earn your first certificate.
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">You have earned <strong>{profile.certificatesEarned}</strong> certificate(s). <Link to="/student/certificates" className="text-coursera font-bold hover:underline">View them here.</Link></p>
                  )}
                </div>
              )}

              {/* Tab: Skills */}
              {activeTab === 'Skills' && (
                <div className="bg-white rounded-xl border border-slate-200/80 p-6 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">Skills</h3>
                  {(profile?.skills?.length ?? 0) === 0 ? (
                    <p className="text-xs text-slate-400 py-4">Enroll in courses to start building skills.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((s, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-lg bg-blue-50 text-coursera border border-blue-100 text-xs font-medium">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Billing & Invoices */}
              {activeTab === 'Billing & Invoices' && (
                <div className="bg-white rounded-xl border border-slate-200/80 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">Payment History & Tax Invoices</h3>
                    <span className="text-xs text-slate-400 font-medium">{payments.length} transactions</span>
                  </div>

                  {payments.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No payment records found. Enroll in a certified course to generate tuition receipts.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                      {payments.map((p, idx) => (
                        <div key={p.id || idx} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <CreditCard className="w-5 h-5 text-coursera" />
                            <div>
                              <p className="text-xs font-bold text-slate-900">{p.courseTitle || 'Tuition Enrollment'}</p>
                              <p className="text-[11px] text-slate-400">{p.date || 'October 2026'} • ID: {p.id || 'TX-9921'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-slate-900">${p.amount || 49}</span>
                            <button
                              onClick={() => handleDownloadInvoice(p)}
                              className="p-1 text-slate-400 hover:text-coursera transition-colors"
                              title="Download Invoice"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </main>

          </div>

        </div>

        {/* Join Organization Modal */}
        {showOrgModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <h3 className="text-base font-bold text-slate-900">Join Accredited University or Organization</h3>
              <p className="text-xs text-slate-500">
                Affiliate your student account with an accredited institution to unlock academic tuition subsidies.
              </p>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {orgsList.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">Loading university directory...</p>
                ) : (
                  orgsList.map((org) => (
                    <div
                      key={org.id}
                      onClick={() => setSelectedOrg(org)}
                      className={`p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all flex items-center justify-between ${
                        selectedOrg?.id === org.id
                          ? 'border-coursera bg-blue-50 text-coursera font-bold ring-1 ring-coursera'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>{org.name}</span>
                      {selectedOrg?.id === org.id && <Check className="w-4 h-4 text-coursera" />}
                    </div>
                  ))
                )}
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowOrgModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!selectedOrg || submittingOrg}
                  onClick={handleRequestJoinOrg}
                  className="px-5 py-2 rounded-lg bg-[#0056D2] text-white text-xs font-bold hover:bg-[#00419E] disabled:opacity-50 transition-all shadow-xs cursor-pointer"
                >
                  {submittingOrg ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </PageLayout>
  );
}
