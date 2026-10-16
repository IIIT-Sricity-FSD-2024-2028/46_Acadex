import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  Award,
  BookOpen,
  PlayCircle,
  Video,
  FileText,
  Clock,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import { LinearProgressBar } from '../../components/common/ProgressBar';
import { useToast } from '../../components/common/Toast';
import api from '../../services/api';
import { useStudent } from '../../context/StudentContext';

const DEFAULT_VIDEO_URL = 'https://www.w3schools.com/html/mov_bbb.mp4';

function buildLessons(course) {
  if (!course || !course.modules || !Array.isArray(course.modules)) return [];

  return course.modules.flatMap((mod, mIdx) => {
    const modId = mod.id || `mod-${mIdx + 1}`;
    // 1. Array of lesson objects (full curriculum schema)
    if (Array.isArray(mod.lessons)) {
      return mod.lessons.map((l, lIdx) => ({
        id: l.id || `${modId}-l${lIdx + 1}`,
        moduleId: modId,
        moduleIndex: mIdx,
        moduleTitle: mod.title || `Module ${mIdx + 1}`,
        number: l.order || lIdx + 1,
        title: l.title || `Lesson ${mIdx + 1}.${lIdx + 1}`,
        duration: l.duration || '10:00',
        videoUrl: l.videoUrl || course.previewVideoUrl || DEFAULT_VIDEO_URL,
        type: l.type || 'video',
        description: l.description || '',
      }));
    }

    // 2. Array of item objects
    if (Array.isArray(mod.items)) {
      return mod.items.map((it, iIdx) => ({
        id: it.id || `${modId}-l${iIdx + 1}`,
        moduleId: modId,
        moduleIndex: mIdx,
        moduleTitle: mod.title || `Module ${mIdx + 1}`,
        number: it.order || iIdx + 1,
        title: it.title || `Lesson ${mIdx + 1}.${iIdx + 1}`,
        duration: it.duration || '10:00',
        videoUrl: it.videoUrl || course.previewVideoUrl || DEFAULT_VIDEO_URL,
        type: it.type || 'video',
        description: it.description || '',
      }));
    }

    // 3. Fallback count if lessons was stored as a numeric count
    const count = Number(mod.lessons) || (typeof mod.lessonsCount === 'number' ? mod.lessonsCount : 0);
    return Array.from({ length: Math.max(1, count) }, (_, i) => ({
      id: `${modId}-l${i + 1}`,
      moduleId: modId,
      moduleIndex: mIdx,
      moduleTitle: mod.title || `Module ${mIdx + 1}`,
      number: i + 1,
      title: `Lesson ${mIdx + 1}.${i + 1}`,
      duration: '10:00',
      videoUrl: course.previewVideoUrl || DEFAULT_VIDEO_URL,
      type: 'video',
      description: '',
    }));
  });
}

export default function LearningPlayer() {
  const { courseId } = useParams();
  const { addToast } = useToast();
  const { refreshData } = useStudent();
  const videoRef = useRef(null);

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notEnrolled, setNotEnrolled] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotEnrolled(false);
    Promise.allSettled([
      api.student.getEnrollmentForCourse(courseId).catch(() => null),
      api.courses.get(courseId).catch(() => null),
      api.student.getCatalogCourse(courseId).catch(() => null),
      api.student.getEnrollments().catch(() => []),
    ])
      .then(([enrRes, crsRes, catRes, allEnrRes]) => {
        let enr = enrRes.status === 'fulfilled' ? enrRes.value : null;
        let crs = crsRes.status === 'fulfilled' ? crsRes.value : null;
        const cat = catRes.status === 'fulfilled' ? catRes.value : null;
        const allEnrs = allEnrRes.status === 'fulfilled' && Array.isArray(allEnrRes.value) ? allEnrRes.value : [];

        if (!crs && cat) crs = cat;
        if (!enr && allEnrs.length > 0) {
          enr = allEnrs.find((e) => e.courseId === courseId || e.id === courseId) || null;
        }

        if (!crs && !enr) {
          setNotEnrolled(true);
        } else {
          setEnrollment(enr);
          setCourse(crs);
          if (crs?.title) document.title = `${crs.title} | Acadex`;
          if (!enr) setNotEnrolled(true);
        }
      })
      .catch((err) => {
        console.warn('Failed to load course or enrollment:', err);
        setNotEnrolled(true);
      })
      .finally(() => setLoading(false));
  }, [courseId]);

  const lessons = useMemo(() => buildLessons(course), [course]);
  const done = useMemo(() => new Set((enrollment?.completedLessons || []).map(String)), [enrollment]);

  useEffect(() => {
    if (lessons.length > 0) {
      if (!currentId || !lessons.some((l) => l.id === currentId)) {
        const next = lessons.find((l) => !done.has(l.id)) || lessons[0];
        setCurrentId(next.id);
      }
    }
  }, [lessons, done, currentId]);

  const currentIndex = lessons.findIndex((l) => l.id === currentId);
  const current = (currentIndex >= 0 ? lessons[currentIndex] : null) || lessons[0] || null;

  // Reset video error state whenever lesson changes
  useEffect(() => {
    setVideoError(false);
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [currentId]);

  const toggleComplete = async (lesson, completed) => {
    if (!lesson || !enrollment || saving) return;
    setSaving(true);
    try {
      const wasCompleted = enrollment.status === 'Completed';
      const updated = await api.student.updateProgress(enrollment.id, lesson.id, completed);
      setEnrollment(updated);
      if (updated.status === 'Completed' && !wasCompleted) {
        addToast('Course completed! Your certificate has been issued.', 'success');
      } else {
        addToast(completed ? 'Lesson marked as complete' : 'Lesson marked as incomplete', 'success');
      }
      if (completed && currentIndex < lessons.length - 1) {
        setCurrentId(lessons[currentIndex + 1].id);
      }
      await refreshData();
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
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-800">You are not enrolled in this course</h2>
          <p className="text-xs text-slate-500 mt-1 mb-4">Enroll now to access the full course curriculum and lessons.</p>
          <Link
            to={`/student/course/${courseId}`}
            className="inline-block px-5 py-2.5 bg-[#0056D2] text-white text-xs font-bold rounded-lg hover:bg-[#00419E] transition-colors"
          >
            View course details
          </Link>
        </div>
      </PageLayout>
    );
  }

  const isDone = current ? done.has(current.id) : false;
  const calculatedProgress = lessons.length > 0
    ? Math.min(100, Math.max(0, Math.round((done.size / lessons.length) * 100)))
    : (enrollment.progress || 0);
  const completedCourse = enrollment.status === 'Completed' || (lessons.length > 0 && done.size === lessons.length);

  return (
    <PageLayout>
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-6 space-y-5">
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link to="/student/my-learning" className="hover:text-[#0056D2]">My learning</Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <span className="text-slate-900 font-semibold truncate">{course.title}</span>
        </nav>

        {completedCourse && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <p className="text-sm font-bold text-emerald-900">You completed this course</p>
                <p className="text-xs text-emerald-700">
                  Certificate {enrollment.certificateId ? `#${enrollment.certificateId}` : ''} has been issued to your account.
                </p>
              </div>
            </div>
            <Link
              to="/student/certificates"
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold text-center hover:bg-emerald-700 transition-colors shrink-0"
            >
              View certificate
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <section className="lg:col-span-8 space-y-4">
            {lessons.length === 0 || !current ? (
              <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
                <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-800">No lessons published yet</p>
                <p className="text-xs text-slate-500 mt-1">The instructor has not added lessons to this course yet.</p>
              </div>
            ) : (
              <>
                {/* Real HTML5 Video Player */}
                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black relative shadow-lg">
                  {current.type === 'reading' || !current.videoUrl ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white bg-slate-900 p-8 text-center">
                      <FileText className="w-14 h-14 text-blue-400 mb-3" />
                      <p className="text-xs uppercase tracking-widest text-slate-400">Reading Lesson</p>
                      <h2 className="text-xl font-bold mt-1 max-w-lg">{current.title}</h2>
                      <p className="text-xs text-slate-300 mt-3 max-w-md">
                        {current.description || 'Study this lesson material and click "Mark as complete" when you are finished.'}
                      </p>
                    </div>
                  ) : videoError ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white bg-slate-900 p-6 text-center">
                      <PlayCircle className="w-12 h-12 text-slate-500 mb-2" />
                      <p className="text-sm font-semibold text-slate-300">Video source temporarily unavailable</p>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm">The media URL could not be loaded directly by your browser.</p>
                      <button
                        onClick={() => {
                          setVideoError(false);
                          if (videoRef.current) {
                            videoRef.current.src = DEFAULT_VIDEO_URL;
                            videoRef.current.load();
                          }
                        }}
                        className="mt-3 px-3 py-1.5 rounded bg-blue-600 text-xs font-semibold flex items-center gap-1.5 hover:bg-blue-700"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Play backup stream
                      </button>
                    </div>
                  ) : (
                    <video
                      ref={videoRef}
                      key={current.id}
                      controls
                      playsInline
                      className="w-full h-full object-contain"
                      poster={course.thumbnail}
                      onError={() => setVideoError(true)}
                      onEnded={() => {
                        if (!isDone) toggleComplete(current, true);
                      }}
                    >
                      <source src={current.videoUrl} type="video/mp4" />
                      Your browser does not support HTML5 video playback.
                    </video>
                  )}
                </div>

                {/* Lesson Controls & Description Header */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500">
                      Module {current.moduleIndex + 1}: {current.moduleTitle} • Lesson {currentIndex + 1} of {lessons.length}
                    </p>
                    <h1 className="text-lg font-bold text-slate-900 truncate mt-0.5">{current.title}</h1>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{current.duration || '10:00'}</span>
                      <span>•</span>
                      <span className="capitalize">{current.type || 'video'} lesson</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      disabled={currentIndex <= 0}
                      onClick={() => setCurrentId(lessons[currentIndex - 1].id)}
                      className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                      aria-label="Previous lesson"
                      title="Previous lesson"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      disabled={saving}
                      onClick={() => toggleComplete(current, !isDone)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 transition-colors ${
                        isDone
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-[#0056D2] text-white hover:bg-[#00419E]'
                      }`}
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      {saving ? 'Saving...' : (isDone ? 'Completed — undo' : 'Mark as complete')}
                    </button>
                    <button
                      disabled={currentIndex >= lessons.length - 1}
                      onClick={() => setCurrentId(lessons[currentIndex + 1].id)}
                      className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                      aria-label="Next lesson"
                      title="Next lesson"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Lesson Description & Details */}
                {current.description && (
                  <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">About this lesson</h2>
                    <p className="text-sm text-slate-700 leading-relaxed">{current.description}</p>
                  </div>
                )}
              </>
            )}
          </section>

          {/* Curriculum Sidebar */}
          <aside className="lg:col-span-4 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>
                  {done.size} of {lessons.length} lessons completed
                </span>
                <span className="text-[#0056D2] font-bold">{calculatedProgress}%</span>
              </div>
              <LinearProgressBar progress={calculatedProgress} color={completedCourse ? 'bg-emerald-600' : 'bg-[#0056D2]'} />
            </div>

            <div className="max-h-[65vh] overflow-y-auto divide-y divide-slate-100">
              {(course.modules || []).map((mod, mIdx) => {
                const modId = mod?.id || `mod-${mIdx + 1}`;
                const modLessons = lessons.filter((l) => l.moduleId === modId || l.moduleId === mod?.id);
                const modDone = modLessons.filter((l) => done.has(l.id)).length;
                return (
                  <div key={modId} className="border-b border-slate-100 last:border-0">
                    <div className="px-4 py-3 bg-slate-50 flex justify-between items-center sticky top-0 z-10 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {mIdx + 1}. {mod?.title || `Module ${mIdx + 1}`}
                      </p>
                      <span className="text-[11px] text-slate-500 shrink-0 ml-2 font-mono">
                        {modDone}/{modLessons.length}
                      </span>
                    </div>
                    <div className="py-1">
                      {modLessons.map((l) => {
                        const isSelected = l.id === currentId;
                        const lessonCompleted = done.has(l.id);
                        return (
                          <button
                            key={l.id}
                            onClick={() => setCurrentId(l.id)}
                            className={`w-full px-4 py-2.5 flex items-center justify-between gap-2.5 text-left text-xs transition-colors ${
                              isSelected
                                ? 'bg-blue-50/80 text-[#0056D2] font-semibold border-l-4 border-[#0056D2]'
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {lessonCompleted ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              ) : (
                                <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                              )}
                              <span className="truncate">{l.title}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 shrink-0 font-mono">
                              {l.type === 'reading' ? (
                                <FileText className="w-3 h-3 text-slate-400" />
                              ) : (
                                <Video className="w-3 h-3 text-slate-400" />
                              )}
                              <span>{l.duration}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
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
