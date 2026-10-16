import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Play, ArrowRight, BookOpen, Award, CheckCircle2, Clock3, Building2, Compass } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import { LinearProgressBar } from '../../components/common/ProgressBar';
import api from '../../services/api';
import { useStudent } from '../../context/StudentContext';

function StatTile({ icon: Icon, label, value, tone }) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tone}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xl font-extrabold text-slate-900 leading-tight">{value}</p>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { student, enrollments, certificates, isLoading, refreshData } = useStudent();
  const [catalog, setCatalog] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);

  useEffect(() => {
    document.title = 'Dashboard | NexusEdu';
    refreshData();
    api.student
      .getCatalog()
      .then((c) => setCatalog(Array.isArray(c) ? c : []))
      .catch(() => setCatalog([]))
      .finally(() => setCatalogLoading(false));
  }, [refreshData]);

  const inProgress = useMemo(() => enrollments.filter((e) => e.status !== 'Completed'), [enrollments]);
  const completed = useMemo(() => enrollments.filter((e) => e.status === 'Completed'), [enrollments]);
  const continueCourse = useMemo(
    () =>
      [...inProgress].sort((a, b) =>
        String(b.lastAccessedAt || b.enrolledAt || '').localeCompare(String(a.lastAccessedAt || a.enrolledAt || ''))
      )[0] || null,
    [inProgress]
  );
  const recommended = useMemo(() => {
    const enrolledIds = new Set(enrollments.map((e) => e.courseId));
    return catalog.filter((c) => !enrolledIds.has(c.id)).slice(0, 3);
  }, [catalog, enrollments]);

  const firstName = (student?.name || localStorage.getItem('user_name') || '').split(' ')[0];
  const membership = student?.orgMembershipStatus || 'Independent Learner';

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#0056D2] border-t-transparent" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 space-y-8">
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back{firstName ? `, ${firstName}` : ''}
            </h1>
            {enrollments.length === 0 && (
              <p className="text-sm text-slate-500 mt-1">
                Browse courses to get started.
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold">
            {membership === 'Pending Organization Approval' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                <Clock3 className="w-3.5 h-3.5" /> Pending approval: {student?.requestedOrgName}
              </span>
            ) : membership === 'Verified Student' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" /> Student • {student?.organizationName || student?.requestedOrgName}
              </span>
            ) : (
              <Link
                to="/student/profile"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-slate-700 border border-slate-200 hover:border-[#0056D2] hover:text-[#0056D2]"
              >
                <Building2 className="w-3.5 h-3.5" /> Independent learner — join an organization
              </Link>
            )}
          </div>
        </section>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatTile icon={BookOpen} label="Enrolled courses" value={enrollments.length} tone="bg-blue-50 text-[#0056D2]" />
          <StatTile icon={Play} label="In progress" value={inProgress.length} tone="bg-indigo-50 text-indigo-600" />
          <StatTile icon={CheckCircle2} label="Completed" value={completed.length} tone="bg-emerald-50 text-emerald-600" />
          <StatTile icon={Award} label="Certificates" value={certificates.length} tone="bg-amber-50 text-amber-600" />
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-slate-900">Continue learning</h2>
            {enrollments.length > 0 && (
              <Link to="/student/my-learning" className="text-xs font-bold text-[#0056D2] hover:underline">
                All my courses →
              </Link>
            )}
          </div>

          {!continueCourse ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 text-center">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">
                {completed.length > 0 ? 'All your courses are complete.' : 'No courses in progress'}
              </p>
              <p className="text-xs text-slate-500 mt-1 mb-4">Find your next course in the catalog.</p>
              <Link
                to="/student/explore"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#0056D2] text-white text-xs font-bold hover:bg-[#00419E]"
              >
                Browse courses <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col md:flex-row gap-5">
              <div className="w-full md:w-64 h-40 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                {continueCourse.thumbnail && (
                  <img src={continueCourse.thumbnail} alt={continueCourse.courseTitle} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 flex flex-col justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-[#0056D2]">
                    {[continueCourse.category, continueCourse.instructorName].filter(Boolean).join(' • ')}
                  </p>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{continueCourse.courseTitle}</h3>
                  {continueCourse.description && (
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1">{continueCourse.description}</p>
                  )}
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                      <span>
                        {continueCourse.completedLessons.length} of {continueCourse.totalLessons} lessons
                      </span>
                      <span className="text-[#0056D2]">{continueCourse.progress}%</span>
                    </div>
                    <LinearProgressBar progress={continueCourse.progress} color="bg-[#0056D2]" />
                  </div>
                  <div className="flex justify-end">
                    <Link
                      to={`/student/learn/${continueCourse.courseId}`}
                      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#0056D2] text-white text-xs font-bold hover:bg-[#00419E]"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      {continueCourse.progress === 0 ? 'Start course' : 'Resume'}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-slate-900">Available courses</h2>
            <Link to="/student/explore" className="text-xs font-bold text-[#0056D2] hover:underline">
              Browse all →
            </Link>
          </div>
          {catalogLoading ? (
            <p className="text-xs text-slate-500">Loading courses…</p>
          ) : recommended.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-xs text-slate-500">
              <Compass className="w-6 h-6 text-slate-300 mx-auto mb-2" />
              You are enrolled in every available course.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {recommended.map((c) => (
                <Link
                  key={c.id}
                  to={`/student/course/${c.id}`}
                  className="bg-white border border-slate-200/80 rounded-xl overflow-hidden hover:shadow-md transition-shadow group"
                >
                  <div className="h-36 bg-slate-100 overflow-hidden">
                    {c.thumbnail && (
                      <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    )}
                  </div>
                  <div className="p-4 space-y-1">
                    <p className="text-[11px] font-semibold text-[#0056D2]">{c.category}</p>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-2">{c.title}</h3>
                    <p className="text-xs text-slate-500">{c.leadInstructorName || c.instructorName}</p>
                    <p className="text-sm font-bold text-slate-900 pt-1">
                      {Number(c.price) > 0 ? `₹${Number(c.price).toLocaleString('en-IN')}` : 'Free'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </PageLayout>
  );
}
