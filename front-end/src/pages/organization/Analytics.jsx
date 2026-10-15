import React from 'react';
import { Star, TrendingUp, BookOpen, Users, Award, BarChart2 } from 'lucide-react';
import OrgLayout from '../../components/organization/OrgLayout';
import { useOrg } from '../../context/useOrg';

export default function Analytics() {
  const { courses, instructors, enrollments, stats } = useOrg();

  const totalEnrollments = stats.totalEnrollments ?? 0;
  const completionRate = stats.completionRate != null ? `${stats.completionRate}%` : '—';
  const averageRating = stats.averageRating != null ? stats.averageRating : '—';
  const annualRevenue = stats.annualRevenue ?? 0;

  const ratedCourses = courses.filter((c) => c.rating);
  const avgRating = ratedCourses.length > 0
    ? (ratedCourses.reduce((s, c) => s + c.rating, 0) / ratedCourses.length).toFixed(1)
    : '—';

  const completedEnrollments = enrollments.filter(
    (e) => e.status === 'Completed' || e.progress === 100
  ).length;

  const noData = totalEnrollments === 0;

  return (
    <OrgLayout breadcrumbs={[{ label: 'Analytics' }]}>
      <div className="space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Organization Analytics</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Real-time metrics from your courses, instructors, and learner activity.
          </p>
        </div>

        {/* KPI Cards — all from real context data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-5 shadow-elevation-1">
            <span className="text-[10px] text-outline uppercase font-bold tracking-wider block">Total Enrollments</span>
            <span className="text-2xl font-black text-on-surface mt-2 block">{totalEnrollments}</span>
            <p className="text-[11px] text-outline mt-1">Across all courses</p>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-5 shadow-elevation-1">
            <span className="text-[10px] text-outline uppercase font-bold tracking-wider block">Completions</span>
            <span className="text-2xl font-black text-primary mt-2 block">{completedEnrollments}</span>
            <p className="text-[11px] text-outline mt-1">
              {totalEnrollments > 0 ? `Completion rate: ${completionRate}` : 'No enrollments yet'}
            </p>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-5 shadow-elevation-1">
            <span className="text-[10px] text-outline uppercase font-bold tracking-wider block">Average Rating</span>
            <span className="text-2xl font-black text-amber-600 mt-2 flex items-center gap-1">
              {avgRating !== '—' && <Star className="w-5 h-5 fill-current" />}
              {avgRating}
            </span>
            <p className="text-[11px] text-outline mt-1">{ratedCourses.length} rated courses</p>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-5 shadow-elevation-1">
            <span className="text-[10px] text-outline uppercase font-bold tracking-wider block">Total Revenue</span>
            <span className="text-2xl font-black text-emerald-700 mt-2 block">
              ${annualRevenue.toLocaleString()}
            </span>
            <p className="text-[11px] text-outline mt-1">Gross settlement to date</p>
          </div>
        </div>

        {/* Course Performance Table */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-elevation-1 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-outline-variant">
            <h2 className="text-base font-bold text-on-surface">Course Performance</h2>
            <span className="text-xs text-outline">{courses.length} courses</span>
          </div>

          {courses.length === 0 ? (
            <div className="py-8 text-center text-outline text-xs">No courses published yet.</div>
          ) : (
            <div className="divide-y divide-outline-variant/40">
              {courses.map((c, rank) => {
                const courseEnrollments = enrollments.filter((e) => e.courseId === c.id).length;
                return (
                  <div key={c.id} className="py-3 flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-surface-container text-outline font-bold text-xs flex items-center justify-center shrink-0">
                      #{rank + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-xs text-on-surface truncate">{c.title}</h3>
                      <p className="text-[10px] text-outline">{c.instructorName || 'Instructor'} • {c.category || 'Course'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-on-surface block">{courseEnrollments} enrolled</span>
                      <span className="text-[10px] text-outline">${(c.revenue || 0).toLocaleString()} revenue</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Faculty Table */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-elevation-1 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-outline-variant">
            <h2 className="text-base font-bold text-on-surface">Faculty Overview</h2>
            <span className="text-xs text-outline">{instructors.length} instructors</span>
          </div>

          {instructors.length === 0 ? (
            <div className="py-8 text-center text-outline text-xs">No faculty added yet.</div>
          ) : (
            <div className="divide-y divide-outline-variant/40">
              {instructors.map((inst) => (
                <div key={inst.id} className="py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-xs text-on-surface">{inst.name}</h3>
                    <p className="text-[10px] text-outline">{inst.specialization || inst.bio?.slice(0, 50) || 'Instructor'}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-on-surface block">{inst.coursesCount || 0} courses</span>
                    <span className="text-[10px] text-outline">{inst.enrolledStudents || 0} learners</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {noData && (
          <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-6 text-center text-xs text-on-surface-variant">
            Analytics data will populate as learners enroll and complete courses.
          </div>
        )}

      </div>
    </OrgLayout>
  );
}
