import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Play, Search, Award, BookOpen, ArrowRight } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import { LinearProgressBar } from '../../components/common/ProgressBar';
import { useStudent } from '../../context/StudentContext';

const TABS = [
  { id: 'in-progress', label: 'In progress' },
  { id: 'completed', label: 'Completed' },
];

export default function MyLearning() {
  const { enrollments, isLoading, refreshData } = useStudent();
  const [tab, setTab] = useState('in-progress');
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    document.title = 'My Learning | NexusEdu';
    refreshData();
  }, [refreshData]);

  const groups = useMemo(
    () => ({
      'in-progress': enrollments.filter((e) => e.status !== 'Completed'),
      completed: enrollments.filter((e) => e.status === 'Completed'),
    }),
    [enrollments]
  );

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return groups[tab]
      .filter((e) => !q || [e.courseTitle, e.category, e.instructorName].some((v) => v?.toLowerCase().includes(q)))
      .sort((a, b) => {
        if (sortBy === 'title') return a.courseTitle.localeCompare(b.courseTitle);
        if (sortBy === 'progress') return b.progress - a.progress;
        return String(b.lastAccessedAt || b.enrolledAt || '').localeCompare(String(a.lastAccessedAt || a.enrolledAt || ''));
      });
  }, [groups, tab, query, sortBy]);

  return (
    <PageLayout>
      <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-8 space-y-6">
        <header>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">My learning</h1>
        </header>

        <div className="flex border-b border-slate-200 gap-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 -mb-px ${
                tab === t.id ? 'border-[#0056D2] text-[#0056D2]' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.label}
              <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">{groups[t.id].length}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search my courses"
              className="w-full h-10 pl-9 pr-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0056D2]"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-10 bg-white border border-slate-200 rounded-lg px-3 text-sm text-slate-700 focus:outline-none focus:border-[#0056D2]"
          >
            <option value="recent">Recently active</option>
            <option value="title">Title (A–Z)</option>
            <option value="progress">Progress</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#0056D2] border-t-transparent" />
          </div>
        ) : list.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-xl border border-slate-200">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">
              {query
                ? 'No courses match your search'
                : tab === 'completed'
                ? 'No completed courses yet'
                : 'No courses in progress'}
            </p>
            {!query && (
              <Link
                to="/student/explore"
                className="mt-4 inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#0056D2] text-white text-xs font-bold"
              >
                Browse courses <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {list.map((e) => {
              const done = e.status === 'Completed';
              return (
                <div key={e.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col md:flex-row">
                  <div className="md:w-60 h-36 md:h-auto bg-slate-100 shrink-0">
                    {e.thumbnail && <img src={e.thumbnail} alt={e.courseTitle} className="w-full h-full object-cover" />}
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-[#0056D2]">
                        {[e.category, e.instructorName, e.institution].filter(Boolean).join(' • ')}
                      </p>
                      <Link to={`/student/course/${e.courseId}`} className="text-base font-bold text-slate-900 hover:text-[#0056D2]">
                        {e.courseTitle}
                      </Link>
                      <p className="text-xs text-slate-500 mt-1">
                        Enrolled {e.enrolledDate}
                        {done && e.completedAt ? ` • Completed ${new Date(e.completedAt).toLocaleDateString('en-IN')}` : ''}
                      </p>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-slate-600 mb-1.5">
                        <span>
                          {e.completedLessons.length} of {e.totalLessons} lessons
                        </span>
                        <span className="font-bold">{e.progress}%</span>
                      </div>
                      <LinearProgressBar progress={e.progress} color={done ? 'bg-emerald-600' : 'bg-[#0056D2]'} />
                    </div>
                  </div>
                  <div className="p-5 md:w-48 flex md:flex-col items-center justify-center gap-2 border-t md:border-t-0 md:border-l border-slate-100">
                    <Link
                      to={`/student/learn/${e.courseId}`}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#0056D2] text-white text-xs font-bold hover:bg-[#00419E]"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      {done ? 'Review' : e.progress === 0 ? 'Start' : 'Continue'}
                    </Link>
                    {done && (
                      <Link
                        to="/student/certificates"
                        className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
                      >
                        <Award className="w-3.5 h-3.5" /> Certificate
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
