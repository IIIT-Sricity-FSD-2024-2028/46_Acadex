import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Calendar,
  Clock,
  Shield,
  Trash2,
  Ban,
  Building2,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Award,
  Layers,
  Users as UsersIcon,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';
import { Tabs } from '../../components/admin/Tabs';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { UserAvatar } from '../../components/admin/UserAvatar';
import { ConfirmModal } from '../../components/admin/Modals';
import { api } from '../../utils/api';

export const UserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchUserDetails = () => {
    setLoading(true);
    api.get(`/users/${userId}`)
      .then((data) => {
        setUser(data);
        // Default tab based on role
        if (data.role === 'Learner' || data.role === 'Student') {
          setActiveTab('enrollments');
        } else if (data.role === 'Organization') {
          setActiveTab('courses');
        } else {
          setActiveTab('overview');
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching user details:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const isLearner = user?.role === 'Learner' || user?.role === 'Student';
  const isOrg = user?.role === 'Organization';
  const isInstructor = user?.role === 'Instructor';
  const isAdmin = user?.role === 'Admin' || user?.role === 'SuperAdmin';

  const tabs = useMemo(() => {
    if (!user) return [];
    if (isLearner) {
      return [
        { id: 'enrollments', label: 'Enrolled Courses & Progress' },
        { id: 'overview', label: 'Profile Overview' },
      ];
    }
    if (isOrg) {
      return [
        { id: 'courses', label: 'Courses Teaching' },
        { id: 'instructors', label: 'Affiliated Instructors' },
        { id: 'overview', label: 'Organization Overview' },
      ];
    }
    if (isInstructor) {
      return [
        { id: 'courses', label: 'Courses Taught' },
        { id: 'overview', label: 'Faculty Profile' },
      ];
    }
    return [{ id: 'overview', label: 'Overview' }];
  }, [user, isLearner, isOrg, isInstructor]);

  const handleToggleSuspend = async () => {
    if (!user) return;
    setActionLoading(true);
    const newStatus = user.status === 'Suspended' ? 'Active' : 'Suspended';
    try {
      await api.patch(`/users/${user.id}`, { status: newStatus }, 'admin');
      setUser((prev) => ({ ...prev, status: newStatus }));
      setActionSuccess(`Status updated to ${newStatus}.`);
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setActionLoading(false);
      setIsSuspendModalOpen(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      await api.delete(`/users/${user.id}`, 'admin');
      navigate('/admin/users');
    } catch (err) {
      console.error('Error deleting user:', err);
      setActionLoading(false);
      setIsDeleteModalOpen(false);
    }
  };

  if (loading) {
    return <div className="p-16 text-center text-slate-500 font-medium">Loading user details from backend...</div>;
  }

  if (!user) {
    return (
      <div className="p-16 text-center space-y-4">
        <p className="text-slate-500 font-medium">User record not found in backend database.</p>
        <button
          onClick={() => navigate('/admin/users')}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
        >
          Return to Users Directory
        </button>
      </div>
    );
  }

  const userEnrollments = user.enrollments || [];
  const userCourses = user.courses || [];
  const userInstructors = user.orgInstructors || [];

  return (
    <div className="space-y-6">
      {/* Back button and navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/users')}
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
            title="Back to Users"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {user.role} Directory Detail
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {user.name}
            </h1>
          </div>
        </div>

        {actionSuccess && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
        )}
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-6">
            <UserAvatar name={user.name} size="xl" />
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-slate-900">{user.name}</h2>
                <StatusBadge status={user.status || 'Active'} />
              </div>

              <div className="mt-2 flex flex-wrap gap-4 text-xs font-medium text-slate-500">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Mail className="w-4 h-4 text-slate-400" />
                  {user.email}
                </span>
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Shield className="w-4 h-4 text-slate-400" />
                  Role: <strong className="text-slate-900">{user.role}</strong>
                </span>
                {user.domain && (
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    Domain: {user.domain}
                  </span>
                )}
                {user.university && (
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <GraduationCap className="w-4 h-4 text-slate-400" />
                    {user.university}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Suspend / Activate (Only for Learner & Organization) */}
            {!isAdmin && !isInstructor && (
              <button
                onClick={() => setIsSuspendModalOpen(true)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-bold transition-colors ${
                  user.status === 'Suspended'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                <Ban className="w-4 h-4" />
                <span>{user.status === 'Suspended' ? 'Activate Account' : 'Suspend Account'}</span>
              </button>
            )}

            {/* Permanent Delete (Only for Learner & Organization) */}
            {!isAdmin && !isInstructor && (
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Account</span>
              </button>
            )}

            {/* Instructor notice (Admin cannot remove instructors) */}
            {isInstructor && (
              <div className="flex items-center gap-2 p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-amber-800 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Faculty accounts are managed directly by their affiliated Organization.</span>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 bg-slate-50/50 border-b border-slate-200">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        {/* Tab Content Section */}
        <div className="p-6 md:p-8 bg-slate-50/40 min-h-[350px]">
          {/* ──────────────────────────────────────────────────────────── */}
          {/* 1. LEARNER ENROLLMENTS: "who enrolled in what"               */}
          {/* ──────────────────────────────────────────────────────────── */}
          {activeTab === 'enrollments' && isLearner && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Enrolled Curriculum & Academic Progress</h3>
                  <p className="text-xs text-slate-500">Courses and training modules this learner is enrolled in</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
                  {userEnrollments.length} Enrolled Course{userEnrollments.length !== 1 ? 's' : ''}
                </span>
              </div>

              {userEnrollments.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
                  This learner is not currently enrolled in any courses.
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase font-bold text-slate-500">
                      <tr>
                        <th className="px-5 py-3.5">Course Title</th>
                        <th className="px-5 py-3.5">Teaching Organization</th>
                        <th className="px-5 py-3.5">Instructor</th>
                        <th className="px-5 py-3.5">Enrolled Date</th>
                        <th className="px-5 py-3.5">Progress</th>
                        <th className="px-5 py-3.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {userEnrollments.map((e, idx) => (
                        <tr key={e.id || idx} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-5 py-4">
                            <div className="font-bold text-slate-900">{e.course || e.courseTitle}</div>
                            <div className="text-xs text-slate-400 font-mono">ID: {e.courseId}</div>
                          </td>
                          <td className="px-5 py-4 font-medium text-slate-700">
                            {e.organization || 'Acadex Partner'}
                          </td>
                          <td className="px-5 py-4 text-slate-600">
                            {e.instructor || 'Lead Faculty'}
                          </td>
                          <td className="px-5 py-4 text-xs text-slate-500">
                            {e.enrolledAt ? new Date(e.enrolledAt).toLocaleDateString() : 'Active Session'}
                          </td>
                          <td className="px-5 py-4">
                            <div className="w-32">
                              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                                <span>{e.progress || 0}%</span>
                              </div>
                              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className="h-full bg-blue-600 rounded-full transition-all"
                                  style={{ width: `${e.progress || 0}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <StatusBadge status={e.status || (e.progress >= 100 ? 'Completed' : 'In Progress')} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────── */}
          {/* 2. ORGANIZATION COURSES: "what courses they are teaching"    */}
          {/* ──────────────────────────────────────────────────────────── */}
          {activeTab === 'courses' && (isOrg || isInstructor) && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {isOrg ? 'Courses Taught by Organization' : 'Curriculum Courses Taught'}
                  </h3>
                  <p className="text-xs text-slate-500">Active curriculum offerings registered under this account</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold">
                  {userCourses.length} Registered Course{userCourses.length !== 1 ? 's' : ''}
                </span>
              </div>

              {userCourses.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
                  No courses are currently published under this account.
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase font-bold text-slate-500">
                      <tr>
                        <th className="px-5 py-3.5">Course Title</th>
                        <th className="px-5 py-3.5">Category</th>
                        <th className="px-5 py-3.5">Assigned Instructor</th>
                        <th className="px-5 py-3.5">Active Learners</th>
                        <th className="px-5 py-3.5">Pricing</th>
                        <th className="px-5 py-3.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {userCourses.map((c, idx) => (
                        <tr key={c.id || idx} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-5 py-4">
                            <div className="font-bold text-slate-900">{c.title}</div>
                            <div className="text-xs text-slate-400 font-mono">ID: {c.id}</div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                              {c.category || 'General'}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-slate-700 font-medium">
                            {c.instructorName || c.instructor || 'Institutional Faculty'}
                          </td>
                          <td className="px-5 py-4 font-bold text-slate-800">
                            {c.students ?? c.enrolledCount ?? 0}
                          </td>
                          <td className="px-5 py-4 font-bold text-slate-900">
                            {Number(c.price) ? `₹${Number(c.price).toLocaleString()}` : 'Free'}
                          </td>
                          <td className="px-5 py-4">
                            <StatusBadge status={c.status || 'Published'} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────── */}
          {/* 3. ORGANIZATION INSTRUCTORS: "who are the instructors"       */}
          {/* ──────────────────────────────────────────────────────────── */}
          {activeTab === 'instructors' && isOrg && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Affiliated Faculty & Instructors</h3>
                  <p className="text-xs text-slate-500">Educators conducting courses for this organization</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                  {userInstructors.length} Instructor{userInstructors.length !== 1 ? 's' : ''}
                </span>
              </div>

              {userInstructors.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
                  No instructors have been affiliated with this organization yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userInstructors.map((inst, idx) => (
                    <div
                      key={inst.id || idx}
                      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <UserAvatar name={inst.name} size="md" />
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{inst.name}</div>
                          <div className="text-xs text-slate-500">{inst.email}</div>
                          <div className="text-xs text-emerald-700 font-semibold mt-1">
                            {inst.expertise || inst.specialization || 'Faculty Member'}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-700 block">
                          {inst.courses || 0} Course{inst.courses !== 1 ? 's' : ''}
                        </span>
                        <StatusBadge status={inst.status || 'Active'} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────── */}
          {/* 4. OVERVIEW TAB: Account Details                             */}
          {/* ──────────────────────────────────────────────────────────── */}
          {activeTab === 'overview' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs max-w-2xl space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Account Metadata & Identity
              </h3>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block uppercase font-bold text-[10px]">Database User ID</span>
                  <span className="font-mono font-semibold text-slate-800">{user.id}</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase font-bold text-[10px]">Account Role</span>
                  <span className="font-semibold text-slate-800">{user.role}</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase font-bold text-[10px]">Verification Status</span>
                  <StatusBadge status={user.verificationStatus || 'Verified'} />
                </div>
                <div>
                  <span className="text-slate-400 block uppercase font-bold text-[10px]">Account Status</span>
                  <StatusBadge status={user.status || 'Active'} />
                </div>
                <div>
                  <span className="text-slate-400 block uppercase font-bold text-[10px]">Created Date</span>
                  <span className="font-medium text-slate-700">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Institutional Seed'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase font-bold text-[10px]">Last Login</span>
                  <span className="font-medium text-slate-700">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Recently Active'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Suspend / Activate */}
      {isSuspendModalOpen && (
        <ConfirmModal
          isOpen={isSuspendModalOpen}
          onClose={() => setIsSuspendModalOpen(false)}
          onConfirm={handleToggleSuspend}
          title={`${user.status === 'Suspended' ? 'Re-activate' : 'Suspend'} Account: ${user.name}`}
          message={`Are you sure you want to ${
            user.status === 'Suspended' ? 're-activate' : 'suspend'
          } this ${user.role}? This will immediately update access in backend database records.`}
          confirmText={user.status === 'Suspended' ? 'Activate Account' : 'Suspend Account'}
          cancelText="Cancel"
          variant={user.status === 'Suspended' ? 'primary' : 'warning'}
          loading={actionLoading}
        />
      )}

      {/* Confirmation Modal for Permanent Delete */}
      {isDeleteModalOpen && (
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteUser}
          title={`Permanently Delete ${user.role}: ${user.name}`}
          message={`Are you sure you want to permanently delete this ${user.role}? This will remove all database records for this account from backend JSON data files.`}
          confirmText="Yes, Permanently Delete"
          cancelText="Cancel"
          variant="danger"
          loading={actionLoading}
        />
      )}
    </div>
  );
};

export default UserDetails;
