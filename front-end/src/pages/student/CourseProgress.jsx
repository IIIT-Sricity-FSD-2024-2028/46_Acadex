import React, { useState, useEffect } from 'react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  CheckCircle2, 
  PlayCircle, 
  FileQuestion, 
  Award, 
  Clock, 
  ChevronDown,
  ChevronUp,
  BookOpen,
  ArrowRight,
  TrendingUp,
  BarChart2,
  Lock,
  Layers,
  Sparkles,
  FileText
} from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import api from '../../services/api';
import { jsonDataClient } from '../../services/jsonDataClient';

export default function CourseProgress() {
  const location = useLocation();
  const navigate = useNavigate();
  const { courseId } = useParams();

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [openModules, setOpenModules] = useState([1, 2, '1', '2', 'mod-1', 'mod-2']);
  const [loading, setLoading] = useState(true);

  // Determine course ID to inspect
  const targetCourseId = courseId || location.state?.courseId || 'crs-1';

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const userId = localStorage.getItem('user_id') || 'lrn-1';

    // Fetch Course & Enrollments in parallel with resilient fallbacks
    Promise.all([
      api.courses.get(targetCourseId).catch(() => {
        const fallbackCourses = jsonDataClient.getCourses();
        return (
          fallbackCourses.find((c) => c.id === targetCourseId || String(c.id) === String(targetCourseId)) ||
          fallbackCourses[0]
        );
      }),
      api.student.getEnrollments(userId).catch(() => []),
    ])
      .then(([courseRes, enrRes]) => {
        if (!isMounted) return;

        const currentCourse = courseRes || null;
        setCourse(currentCourse);

        const list = Array.isArray(enrRes) ? enrRes : enrRes?.items || [];
        const matchedEnr =
          list.find((item) => item.id === location.state?.enrollmentId) ||
          list.find((item) => item.courseId === targetCourseId) ||
          list.find((item) => item.courseId === currentCourse?.id);

        if (matchedEnr) {
          setEnrollment(matchedEnr);
        } else if (currentCourse) {
          // Synthesize an active enrollment record so the student page always functions
          setEnrollment({
            id: `enr-${currentCourse.id}`,
            courseId: currentCourse.id,
            courseTitle: currentCourse.title,
            progress: 45,
            enrolledDate: 'Recently Enrolled',
            status: 'Active',
            grade: '92.5%',
          });
        }

        // Initialize open modules to first 2 modules
        if (currentCourse?.modules && currentCourse.modules.length > 0) {
          const firstTwo = currentCourse.modules.slice(0, 2).map((m, idx) => m.id || idx + 1);
          setOpenModules(firstTwo);
        }

        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Failed to load course progress:', err);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [targetCourseId, location.state?.enrollmentId]);

  const toggleModule = (id) => {
    setOpenModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
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

  const courseTitle = course?.title || enrollment?.courseTitle || 'NexusPay Core Architecture';
  const progressPercent = enrollment?.progress ?? 50;

  // Dynamically map course modules from backend / courses.json
  const rawModules = course?.modules && Array.isArray(course.modules) && course.modules.length > 0
    ? course.modules
    : [
        {
          id: 'mod-1',
          title: 'Foundations of Payment Orchestration & Ledger Architecture',
          lessons: 3,
          duration: '2h 15m'
        },
        {
          id: 'mod-2',
          title: 'Advanced Routing & High Availability Failover',
          lessons: 4,
          duration: '3h 30m'
        },
        {
          id: 'mod-3',
          title: 'PCI-DSS Compliance & Card Vault Security',
          lessons: 3,
          duration: '2h 45m'
        }
      ];

  const modules = rawModules.map((m, idx) => {
    const modId = m.id || idx + 1;
    const modNum = idx + 1;
    const cleanTitle = (m.title || `Module ${modNum}`).replace(/^Module \d+:\s*/i, '');

    // Determine status & progress
    let status = 'locked';
    let progress = 0;
    if (idx === 0) {
      status = 'completed';
      progress = 100;
    } else if (idx === 1) {
      status = 'in-progress';
      progress = 45;
    } else {
      status = 'locked';
      progress = 0;
    }

    // Build items / lessons dynamically
    let items = [];
    if (Array.isArray(m.items) && m.items.length > 0) {
      items = m.items.map((it, itIdx) => ({
        id: it.id || `${modNum}.${itIdx + 1}`,
        title: it.title || `${modNum}.${itIdx + 1} ${it.name || 'Lecture'}`,
        type: it.type || (itIdx % 2 === 0 ? 'video' : 'reading'),
        duration: it.duration || '15 min',
        completed: idx === 0,
        current: idx === 1 && itIdx === 0,
        locked: idx > 1,
        grade: it.grade || (it.type === 'quiz' && idx === 0 ? '95%' : undefined),
      }));
    } else {
      const lessonCount = typeof m.lessons === 'number' ? m.lessons : 3;
      items = [
        {
          id: `${modNum}.1`,
          title: `${modNum}.1 ${cleanTitle} — Core Architecture & Theory`,
          type: 'video',
          duration: '16 min',
          completed: idx === 0,
          current: idx === 1,
          locked: idx > 1,
        },
        {
          id: `${modNum}.2`,
          title: `${modNum}.2 Implementation Specifications & Best Practices`,
          type: 'reading',
          duration: '10 min',
          completed: idx === 0,
          current: false,
          locked: idx > 1,
        },
        {
          id: `${modNum}.3`,
          title: `${modNum}.3 Graded Assessment: ${cleanTitle}`,
          type: 'quiz',
          duration: '20 min',
          completed: idx === 0,
          grade: idx === 0 ? '95%' : undefined,
          locked: idx > 1,
        },
      ];

      if (lessonCount > 3) {
        for (let extra = 4; extra <= lessonCount; extra++) {
          items.push({
            id: `${modNum}.${extra}`,
            title: `${modNum}.${extra} Advanced Production Case Study`,
            type: 'video',
            duration: '14 min',
            completed: idx === 0,
            locked: idx > 1,
          });
        }
      }
    }

    return {
      id: modId,
      name: `MODULE ${modNum}`,
      title: cleanTitle,
      status,
      progress,
      items,
    };
  });

  const totalItems = modules.reduce((sum, mod) => sum + mod.items.length, 0);

  return (
    <PageLayout>
      <div className="bg-[#F8FAFC] min-h-screen">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-medium">
            <Link to="/student/my-learning" className="hover:text-coursera transition-colors">My Learning</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to={`/student/course/${course?.id || targetCourseId}`} className="hover:text-coursera transition-colors line-clamp-1 max-w-xs">
              {courseTitle}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-900 font-semibold">Course Progress</span>
          </nav>

          {/* 2-Column Stitch Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Syllabus Tree Navigation Sidebar (4 cols) */}
            <aside className="lg:col-span-4 bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-6 space-y-6 lg:sticky lg:top-24">
              <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-coursera flex items-center justify-center shrink-0 border border-blue-100">
                  <Layers className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-slate-900 leading-snug line-clamp-1">{courseTitle}</h2>
                  <p className="text-xs font-semibold text-secondary flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-secondary inline-block"></span>
                    {progressPercent}% Completed
                  </p>
                </div>
              </div>

              {/* Dynamic Module Nav Links */}
              <div className="space-y-1.5">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                  Curriculum Overview ({modules.length} Modules)
                </div>
                
                {modules.map((m, idx) => {
                  const isDone = m.status === 'completed';
                  const isCurrent = m.status === 'in-progress';

                  return (
                    <a 
                      key={m.id}
                      href={`#module-${m.id}`}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm transition-colors group ${
                        isCurrent
                          ? 'bg-blue-50/70 border border-blue-100/60 text-coursera font-bold'
                          : isDone
                          ? 'text-slate-700 hover:bg-slate-50'
                          : 'text-slate-400 hover:bg-slate-50 opacity-75'
                      }`}
                    >
                      <span className="flex items-center gap-2.5 min-w-0">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                        ) : isCurrent ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-coursera animate-pulse shrink-0"></span>
                        ) : (
                          <Lock className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        )}
                        <span className="truncate text-xs font-semibold">
                          {m.name}: {m.title}
                        </span>
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                        isDone
                          ? 'text-secondary bg-emerald-50'
                          : isCurrent
                          ? 'text-coursera bg-white shadow-xs'
                          : 'text-slate-400'
                      }`}>
                        {isDone ? '100%' : isCurrent ? `${m.progress}%` : 'Locked'}
                      </span>
                    </a>
                  );
                })}
              </div>

              {/* Continue Learning CTA */}
              <div className="pt-2">
                <Link
                  to="/student/player"
                  state={{ courseId: course?.id || targetCourseId }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#0056D2] hover:bg-[#00419E] text-white rounded-xl text-sm font-bold shadow-md transition-all active:scale-[0.99] cursor-pointer"
                >
                  <span>Continue Learning</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <div className="mt-3 text-center">
                  <Link
                    to="/student/quiz"
                    state={{ courseId: course?.id || targetCourseId }}
                    className="text-xs font-semibold text-coursera hover:underline"
                  >
                    Take Module Graded Assessment
                  </Link>
                </div>
              </div>
            </aside>

            {/* Right Main Content Area (8 cols) */}
            <main className="lg:col-span-8 space-y-6">
              
              {/* Header */}
              <div>
                <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Course Progress & Grades
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Track your curriculum milestones, assessment scores, and completion status.
                </p>
              </div>

              {/* Top Stats Bento Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* Overall Completion (2 cols on md) */}
                <div className="md:col-span-2 bg-white rounded-xl p-6 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.06)] relative overflow-hidden flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-coursera" />
                        Overall Completion
                      </h3>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-4xl font-extrabold text-coursera">{progressPercent}%</span>
                        <span className="text-sm font-semibold text-slate-500">Completed</span>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-blue-50 text-coursera text-xs font-bold rounded-full">
                      Active
                    </span>
                  </div>

                  <div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden mb-3">
                      <div 
                        className="bg-coursera h-full rounded-full transition-all duration-500" 
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs font-medium text-slate-500">
                      <span>{course?.category || 'Specialization'} Track</span>
                      <span>{course?.totalHours || '18h 30m'} total curriculum</span>
                    </div>
                  </div>
                </div>

                {/* Current Grade Card */}
                <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 mb-3">
                      <Award className="w-4 h-4 text-secondary" />
                      Academic Grade
                    </h3>
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-14 h-14 rounded-full bg-emerald-50 border-2 border-secondary text-secondary flex items-center justify-center font-black text-2xl">
                        A
                      </div>
                      <div>
                        <p className="text-xl font-extrabold text-slate-900">92.5%</p>
                        <p className="text-xs text-slate-500">Pass Mark: 80%</p>
                      </div>
                    </div>
                  </div>
                  <Link
                    to="/student/quiz"
                    state={{ courseId: course?.id || targetCourseId }}
                    className="w-full text-center py-2 bg-slate-50 hover:bg-blue-50 text-coursera border border-slate-200 hover:border-blue-200 rounded-lg text-xs font-bold transition-colors"
                  >
                    View Quiz Scores
                  </Link>
                </div>

              </div>

              {/* Module Breakdown Section */}
              <div className="space-y-5 pt-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900">Module Breakdown</h2>
                  <span className="text-xs text-slate-500 font-medium">
                    {modules.length} Modules • {totalItems} Curriculum Items
                  </span>
                </div>

                {/* Dynamic Module List Cards */}
                {modules.map((mod) => {
                  const isOpen = openModules.includes(mod.id);
                  const isCompleted = mod.status === 'completed';
                  const isInProgress = mod.status === 'in-progress';

                  return (
                    <div 
                      key={mod.id} 
                      id={`module-${mod.id}`}
                      className={`bg-white rounded-xl border ${
                        isInProgress ? 'border-blue-300 shadow-md ring-1 ring-blue-100' : 'border-slate-200/80 shadow-xs'
                      } overflow-hidden transition-all`}
                    >
                      {/* Module Header Bar */}
                      <div className={`p-5 flex flex-wrap md:flex-nowrap justify-between items-center gap-4 ${
                        isInProgress ? 'bg-blue-50/40' : 'bg-slate-50/50'
                      }`}>
                        <div className="flex-1 min-w-[200px]">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-white text-coursera border border-blue-100">
                              {mod.name}
                            </span>
                            {isCompleted && (
                              <span className="flex items-center gap-1 text-secondary text-xs font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                              </span>
                            )}
                            {isInProgress && (
                              <span className="flex items-center gap-1 text-coursera text-xs font-bold">
                                <span className="w-2 h-2 rounded-full bg-coursera animate-ping"></span> In Progress
                              </span>
                            )}
                            {mod.status === 'locked' && (
                              <span className="flex items-center gap-1 text-slate-400 text-xs font-medium">
                                <Lock className="w-3 h-3" /> Locked
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-bold text-slate-900">{mod.title}</h3>
                        </div>

                        {/* Progress meter */}
                        <div className="w-full md:w-56 flex items-center gap-3">
                          <div className="flex-1">
                            <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
                              <span>Progress</span>
                              <span>{mod.progress}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${isCompleted ? 'bg-secondary' : 'bg-coursera'}`} 
                                style={{ width: `${mod.progress}%` }}
                              ></div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleModule(mod.id)}
                            className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                          >
                            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      {/* Items list */}
                      {isOpen && (
                        <div className="divide-y divide-slate-100 p-2">
                          {mod.items.map((item) => (
                            <div 
                              key={item.id}
                              className={`flex items-center justify-between p-3.5 rounded-lg transition-colors ${
                                item.current 
                                  ? 'bg-blue-50/60 border border-blue-200/60' 
                                  : 'hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {item.completed ? (
                                  <CheckCircle2 className="w-5 h-5 text-secondary shrink-0" />
                                ) : item.locked ? (
                                  <Lock className="w-4 h-4 text-slate-300 shrink-0" />
                                ) : (
                                  <PlayCircle className="w-5 h-5 text-coursera shrink-0" />
                                )}
                                <span className={`text-xs md:text-sm truncate ${
                                  item.completed 
                                    ? 'text-slate-600' 
                                    : item.current 
                                    ? 'font-bold text-slate-900' 
                                    : 'font-medium text-slate-800'
                                }`}>
                                  {item.title}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 shrink-0 ml-4">
                                <span className="text-xs text-slate-400 font-medium">{item.duration}</span>

                                {item.grade && (
                                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-secondary text-xs font-bold border border-emerald-100">
                                    Grade: {item.grade}
                                  </span>
                                )}

                                {item.current && (
                                  <Link
                                    to="/student/player"
                                    state={{ courseId: course?.id || targetCourseId }}
                                    className="px-3 py-1 bg-[#0056D2] hover:bg-[#00419E] text-white rounded-md text-xs font-bold shadow-xs transition-colors cursor-pointer"
                                  >
                                    Resume
                                  </Link>
                                )}

                                {item.type === 'quiz' && !item.completed && !item.locked && (
                                  <Link
                                    to="/student/quiz"
                                    state={{ courseId: course?.id || targetCourseId }}
                                    className="px-3 py-1 bg-blue-50 text-[#0056D2] hover:bg-blue-100 rounded-md text-xs font-bold transition-colors cursor-pointer"
                                  >
                                    Start Quiz
                                  </Link>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </main>

          </div>

        </div>
      </div>
    </PageLayout>
  );
}
