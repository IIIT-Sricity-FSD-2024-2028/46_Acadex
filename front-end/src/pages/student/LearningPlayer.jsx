import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Circle, ChevronLeft, ChevronRight, Award, BookOpen, PlayCircle } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import { LinearProgressBar } from '../../components/common/ProgressBar';
import { useToast } from '../../components/common/Toast';
import api from '../../services/api';
import { useStudent } from '../../context/StudentContext';

function buildLessons(course) {
  return (course?.modules || []).flatMap((mod, mIdx) => {
    const count = Number(mod.lessons) || 0;
    return Array.from({ length: count }, (_, i) => ({
      id: `${mod.id}-l${i + 1}`,
      moduleId: mod.id,
      moduleIndex: mIdx,
      moduleTitle: mod.title,
      number: i + 1,
      title: `Lesson ${mIdx + 1}.${i + 1}`,
    }));
  });
}

export default function LearningPlayer() {
  const { courseId } = useParams();
  const { addToast } = useToast();
  const { refreshData } = useStudent();

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notEnrolled, setNotEnrolled] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.student.getEnrollmentForCourse(courseId), api.courses.get(courseId)])
      .then(([enr, crs]) => {
        setEnrollment(enr);
        setCourse(crs);
        document.title = `${crs.title} | NexusEdu`;
      })
      .catch(() => setNotEnrolled(true))
      .finally(() => setLoading(false));
  }, [courseId]);

  const lessons = useMemo(() => buildLessons(course), [course]);
  const done = useMemo(() => new Set(enrollment?.completedLessons || []), [enrollment]);

  useEffect(() => {
    if (!currentId && lessons.length) {
      const next = lessons.find((l) => !done.has(l.id)) || lessons[0];
      setCurrentId(next.id);
    }
  }, [lessons, done, currentId]);

  const currentIndex = lessons.findIndex((l) => l.id === currentId);
  const current = lessons[currentIndex];

  const toggleComplete = async (lesson, completed) => {
    setSaving(true);
    try {
      const wasCompleted = enrollment.status === 'Completed';
      const updated = await api.student.updateProgress(enrollment.id, lesson.id, completed);
      setEnrollment(updated);
      if (updated.status === 'Completed' && !wasCompleted) {
        addToast('Course completed — your certificate has been issued!', 'success');
      }
      if (completed && currentIndex < lessons.length - 1) setCurrentId(lessons[currentIndex + 1].id);
      refreshData();
    } catch (err) {
      addToast(err.message || 'Could not save progress', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#0056D2] border-t-transparent" />
        </div>
      </PageLayout>
    );
  }

  if (notEnrolled || !course || !enrollment) {
    return (
      <PageLayout>
        <div className="max-w-md mx-auto py-20 text-center">
          <h2 className="text-lg font-bold text-slate-800">You are not enrolled in this course</h2>
          <Link
            to={`/student/course/${courseId}`}
            className="mt-4 inline-block px-4 py-2 bg-[#0056D2] text-white text-xs font-bold rounded-lg"
          >
            View course
          </Link>
        </div>
      </PageLayout>
    );
  }

  const isDone = current && done.has(current.id);
  const completedCourse = enrollment.status === 'Completed';

  return (
    <PageLayout>
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-6 space-y-5">
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link to="/student/my-learning" className="hover:text-[#0056D2]">My learning</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 font-semibold truncate">{course.title}</span>
        </nav>

        {completedCourse && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-emerald-600" />
              <div>
                <p className="text-sm font-bold text-emerald-900">You completed this course</p>
                <p className="text-xs text-emerald-700">
                  Certificate {enrollment.certificateId ? `#${enrollment.certificateId}` : ''} has been issued to your account.
                </p>
              </div>
            </div>
            <Link to="/student/certificates" className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold text-center">
              View certificate
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <section className="lg:col-span-8 space-y-4">
            {lessons.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
                <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-800">No lessons published yet</p>
                <p className="text-xs text-slate-500 mt-1">The instructor has not added lessons to this course.</p>
              </div>
            ) : (
              <>
                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 relative">
                  {course.thumbnail && <img src={course.thumbnail} alt="" className="w-full h-full object-cover opacity-40" />}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6">
                    <PlayCircle className="w-12 h-12 mb-3 opacity-90" />
                    <p className="text-xs uppercase tracking-widest text-white/70">
                      Module {current.moduleIndex + 1} • {current.moduleTitle}
                    </p>
                    <p className="text-xl font-bold mt-1">{current.title}</p>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-slate-500">
                      Lesson {currentIndex + 1} of {lessons.length}
                    </p>
                    <h1 className="text-lg font-bold text-slate-900">{current.title}</h1>
                    <p className="text-xs text-slate-500">{current.moduleTitle}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={currentIndex <= 0}
                      onClick={() => setCurrentId(lessons[currentIndex - 1].id)}
                      className="p-2 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40"
                      aria-label="Previous lesson"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      disabled={saving}
                      onClick={() => toggleComplete(current, !isDone)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 ${
                        isDone ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-[#0056D2] text-white hover:bg-[#00419E]'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {isDone ? 'Completed — undo' : 'Mark as complete'}
                    </button>
                    <button
                      disabled={currentIndex >= lessons.length - 1}
                      onClick={() => setCurrentId(lessons[currentIndex + 1].id)}
                      className="p-2 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40"
                      aria-label="Next lesson"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>

          <aside className="lg:col-span-4 bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>
                  {done.size} of {lessons.length} lessons
                </span>
                <span className="text-[#0056D2]">{enrollment.progress}%</span>
              </div>
              <LinearProgressBar progress={enrollment.progress} color={completedCourse ? 'bg-emerald-600' : 'bg-[#0056D2]'} />
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {(course.modules || []).map((mod, mIdx) => {
                const modLessons = lessons.filter((l) => l.moduleId === mod.id);
                const modDone = modLessons.filter((l) => done.has(l.id)).length;
                return (
                  <div key={mod.id} className="border-b border-slate-100 last:border-0">
                    <div className="px-4 py-3 bg-slate-50 flex justify-between items-center">
                      <p className="text-xs font-bold text-slate-800">
                        {mIdx + 1}. {mod.title}
                      </p>
                      <span className="text-[11px] text-slate-500 shrink-0 ml-2">
                        {modDone}/{modLessons.length}
                      </span>
                    </div>
                    {modLessons.map((l) => (
                      <button
                        key={l.id}
                        onClick={() => setCurrentId(l.id)}
                        className={`w-full px-4 py-2.5 flex items-center gap-2.5 text-left text-xs ${
                          l.id === currentId ? 'bg-blue-50 text-[#0056D2] font-semibold' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {done.has(l.id) ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                        )}
                        {l.title}
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      </div>
    </PageLayout>
  );
}
