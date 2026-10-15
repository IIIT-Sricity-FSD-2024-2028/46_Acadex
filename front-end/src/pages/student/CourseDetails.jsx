import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  CheckCircle2,
  Clock,
  Award,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  Share2,
  Bookmark,
  Star,
  Users,
  Sparkles,
  ArrowRight,
  Pencil,
  Trash2,
  Send
} from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import RatingStars from '../../components/common/RatingStars';
import Badge from '../../components/common/Badge';
import { useToast } from '../../components/common/Toast';
import api from '../../services/api';
import HumanAvatar from '../../components/common/HumanAvatar';

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState(['1', 'mod-1']);
  const [isSaved, setIsSaved] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [submitRating, setSubmitRating] = useState(0);
  const [submitComment, setSubmitComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingReview, setEditingReview] = useState(false);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');

  const userId = localStorage.getItem('user_id') || localStorage.getItem('nexuspay_user_id') || '';
  const userName = localStorage.getItem('user_name') || 'Student';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const targetId = id || 'crs-1';

    // Fetch course
    api.courses.get(targetId)
      .then((res) => {
        setCourse(res);
        setLoading(false);
      })
      .catch(() => {
        api.courses.list()
          .then((res) => {
            const list = Array.isArray(res) ? res : (res?.items || []);
            setCourse(list[0] || null);
            setLoading(false);
          })
          .catch(() => setLoading(false));
      });

    // Fetch bookmark status
    if (userId) {
      api.bookmarks.status(targetId)
        .then((res) => setIsSaved(!!res?.bookmarked))
        .catch(() => {});
    }

    // Fetch reviews
    setReviewsLoading(true);
    api.courses.getReviews(targetId)
      .then((res) => {
        const list = Array.isArray(res) ? res : [];
        setReviews(list);
        if (userId) {
          const mine = list.find((r) => r.learnerId === userId);
          setMyReview(mine || null);
        }
        setReviewsLoading(false);
      })
      .catch(() => setReviewsLoading(false));
  }, [id, userId]);

  const toggleModule = (modId) => {
    setExpandedModules((prev) =>
      prev.includes(modId) ? prev.filter((m) => m !== modId) : [...prev, modId]
    );
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    addToast('Course link copied to clipboard!', 'success');
  };

  const handleBookmarkToggle = async () => {
    if (!userId) {
      addToast('Sign in to save courses to your wishlist.', 'warning');
      return;
    }
    setBookmarkLoading(true);
    try {
      const res = await api.bookmarks.toggle(id);
      const nowSaved = !!res?.bookmarked;
      setIsSaved(nowSaved);
      addToast(nowSaved ? 'Saved to your wishlist!' : 'Removed from saved courses', nowSaved ? 'success' : 'info');
    } catch {
      addToast('Failed to update wishlist. Please try again.', 'error');
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (submitRating === 0) {
      addToast('Please select a star rating before submitting.', 'warning');
      return;
    }
    if (!submitComment.trim()) {
      addToast('Please write a comment before submitting.', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.courses.addReview(id, submitRating, submitComment.trim(), userName);
      const updated = await api.courses.getReviews(id).catch(() => null);
      if (updated) {
        const list = Array.isArray(updated) ? updated : [];
        setReviews(list);
        const mine = list.find((r) => r.learnerId === userId);
        setMyReview(mine || res);
        // Refresh course rating
        api.courses.get(id).then(setCourse).catch(() => {});
      } else {
        setMyReview(res);
        setReviews((prev) => [res, ...prev]);
      }
      setSubmitRating(0);
      setSubmitComment('');
      addToast('Review submitted successfully!', 'success');
    } catch (err) {
      const msg = err?.message || err?.error || '';
      if (msg.toLowerCase().includes('already')) {
        addToast('You have already reviewed this course. Edit your existing review.', 'warning');
      } else {
        addToast('Failed to submit review. Please try again.', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSave = async () => {
    if (!myReview) return;
    if (editRating === 0) {
      addToast('Please select a star rating.', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      const updated = await api.courses.updateReview(myReview.id, editRating, editComment.trim());
      setMyReview(updated);
      setReviews((prev) => prev.map((r) => r.id === updated.id ? updated : r));
      setEditingReview(false);
      api.courses.get(id).then(setCourse).catch(() => {});
      addToast('Review updated successfully!', 'success');
    } catch {
      addToast('Failed to update review.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!myReview) return;
    setSubmitting(true);
    try {
      await api.courses.deleteReview(myReview.id);
      setReviews((prev) => prev.filter((r) => r.id !== myReview.id));
      setMyReview(null);
      setEditingReview(false);
      api.courses.get(id).then(setCourse).catch(() => {});
      addToast('Review deleted.', 'info');
    } catch {
      addToast('Failed to delete review.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = () => {
    setEditRating(myReview?.rating || 0);
    setEditComment(myReview?.comment || '');
    setEditingReview(true);
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      </PageLayout>
    );
  }

  if (!course) {
    return (
      <PageLayout>
        <div className="max-w-4xl mx-auto py-20 text-center">
          <h2 className="text-xl font-bold text-slate-800">Course Not Found</h2>
          <p className="text-xs text-slate-500 mt-2 mb-4">The requested course could not be loaded from the backend catalog.</p>
          <Link to="/explore" className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl">
            Explore Courses Catalog
          </Link>
        </div>
      </PageLayout>
    );
  }

  const modules = course.modules && Array.isArray(course.modules) && course.modules.length > 0
    ? course.modules
    : [];

  const otherReviews = reviews.filter((r) => r.learnerId !== userId);

  return (
    <PageLayout>
      <main className="max-w-[1240px] mx-auto px-4 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Column: Course Details (~65% / 8 cols) */}
        <div className="lg:col-span-8 space-y-6">

          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
            <Link to="/student" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/student/explore" className="hover:text-primary transition-colors">{course.category || 'Courses'}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-on-surface font-bold truncate max-w-xs">{course.title}</span>
          </nav>

          {/* Header Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-block px-2.5 py-0.5 bg-[#E8EDF5] text-[#0056D2] font-label-md text-xs font-bold rounded">
                {course.level?.toUpperCase() || 'COURSE'}
              </span>
              {course.institution && (
                <span className="text-xs font-semibold text-outline">
                  {course.institution}
                </span>
              )}
            </div>

            <h1 className="font-headline-lg text-2xl md:text-3xl lg:text-4xl font-bold text-on-surface tracking-tight leading-tight">
              {course.title}
            </h1>

            <p className="font-body-lg text-sm text-on-surface-variant leading-relaxed">
              {course.description || ''}
            </p>

            <div className="flex items-center gap-4 flex-wrap pt-1 text-xs">
              <div className="flex items-center gap-1.5 text-[#F5C518]">
                <Star className="w-4 h-4 fill-current" />
                {course.rating != null
                  ? <span className="font-bold text-on-surface text-sm">{course.rating}</span>
                  : <span className="text-outline text-sm">No rating yet</span>
                }
                {course.reviewsCount > 0 && (
                  <span className="text-outline">({course.reviewsCount} reviews)</span>
                )}
              </div>

              {course.enrolledCount > 0 && (
                <>
                  <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                  <div className="flex items-center gap-1.5 text-on-surface-variant">
                    <Users className="w-4 h-4 text-primary" />
                    <span>{course.enrolledCount} enrolled</span>
                  </div>
                </>
              )}

              {course.totalHours && (
                <>
                  <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                  <div className="flex items-center gap-1.5 text-on-surface-variant">
                    <Clock className="w-4 h-4 text-outline" />
                    <span>{course.totalHours} total length</span>
                  </div>
                </>
              )}
            </div>

            {/* Instructor Faculty Row */}
            {(course.instructorName || course.leadInstructorName) && (
              <div className="flex items-center gap-3 pt-3 border-t border-outline-variant/60">
                <HumanAvatar
                  name={course.instructorName || course.leadInstructorName}
                  size="md"
                />
                <div>
                  <div className="font-title-md text-xs font-bold text-on-surface">
                    {course.instructorName || course.leadInstructorName}
                  </div>
                  {course.institution && (
                    <div className="text-[11px] text-primary font-medium">
                      Principal Faculty, {course.institution}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-outline-variant/80 pt-2">
            <nav className="flex gap-6 -mb-px text-xs font-bold">
              {['about', 'syllabus', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    const el = document.getElementById(tab);
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`pb-3 capitalize transition-colors cursor-pointer border-b-2 ${
                    tab === 'about'
                      ? 'border-[#0056D2] text-[#0056D2]'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content: What you'll learn */}
          <section id="about" className="space-y-4">
            <h2 className="font-headline-md text-base font-bold text-on-surface">What you'll learn</h2>
            <div className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/70">
              {course.learningOutcomes && Array.isArray(course.learningOutcomes) && course.learningOutcomes.length > 0 ? (
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs text-on-surface">
                  {course.learningOutcomes.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-on-surface-variant italic">Learning outcomes not specified for this course.</p>
              )}
            </div>
          </section>

          {/* Skills you will gain */}
          {course.skills && Array.isArray(course.skills) && course.skills.length > 0 && (
            <section className="space-y-3">
              <h2 className="font-title-lg text-sm font-bold text-on-surface">Skills you will gain</h2>
              <div className="flex flex-wrap gap-2">
                {course.skills.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1 bg-[#E8EDF5] text-[#0056D2] font-label-md text-xs font-bold rounded">
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Syllabus Modules Accordion */}
          <section id="syllabus" className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-md text-base font-bold text-on-surface">
                Course Syllabus {modules.length > 0 ? `(${modules.length} Modules)` : ''}
              </h2>
              {modules.length > 0 && (
                <span className="text-xs text-outline font-medium">All modules self-paced</span>
              )}
            </div>

            {modules.length === 0 ? (
              <div className="text-xs text-on-surface-variant italic bg-surface-container-low rounded-xl p-5 border border-outline-variant/70">
                Syllabus details not yet published for this course.
              </div>
            ) : (
              <div className="space-y-3">
                {modules.map((mod) => {
                  const isExpanded = expandedModules.includes(mod.id);
                  const lessons = mod.lessons && Array.isArray(mod.lessons) ? mod.lessons : [];
                  return (
                    <div key={mod.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant/80 overflow-hidden shadow-xs">
                      <button
                        onClick={() => toggleModule(mod.id)}
                        className="w-full p-4 flex items-center justify-between hover:bg-surface-container-low text-left font-bold text-xs text-on-surface transition-colors"
                      >
                        <span className="flex items-center gap-2.5">
                          <PlayCircle className="w-4 h-4 text-primary" />
                          <span>{mod.title}</span>
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-outline font-normal">
                            {typeof mod.lessons === 'number' ? mod.lessons : lessons.length} lessons
                            {mod.duration ? ` • ${mod.duration}` : ''}
                          </span>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-outline" /> : <ChevronDown className="w-4 h-4 text-outline" />}
                        </div>
                      </button>
                      {isExpanded && lessons.length > 0 && (
                        <div className="px-4 pb-4 pt-1 border-t border-outline-variant/40 space-y-2 text-xs text-on-surface-variant bg-surface-container-low/30">
                          {lessons.map((lesson, li) => (
                            <div key={li} className={`flex items-center justify-between py-1.5 ${li < lessons.length - 1 ? 'border-b border-outline-variant/30' : ''}`}>
                              <span className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                <span>{lesson.title || lesson}</span>
                              </span>
                              {lesson.duration && <span className="text-outline">{lesson.duration}</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Reviews Section */}
          <section id="reviews" className="space-y-5 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-md text-base font-bold text-on-surface">
                Student Reviews
                {reviews.length > 0 && (
                  <span className="ml-2 text-xs font-normal text-outline">({reviews.length})</span>
                )}
              </h2>
              {course.rating != null && (
                <div className="flex items-center gap-1.5 text-[#F5C518]">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-bold text-on-surface text-sm">{course.rating}</span>
                  <span className="text-xs text-outline font-normal">avg rating</span>
                </div>
              )}
            </div>

            {/* My existing review */}
            {myReview && !editingReview && (
              <div className="bg-[#E8EDF5] border border-[#0056D2]/20 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HumanAvatar name={myReview.learnerName || userName} size="sm" />
                    <div>
                      <div className="text-xs font-bold text-on-surface">{myReview.learnerName || userName} <span className="text-[#0056D2] font-normal">(Your review)</span></div>
                      <div className="flex items-center gap-0.5 mt-0.5">
                        {[1,2,3,4,5].map((s) => (
                          <Star key={s} className={`w-3 h-3 ${s <= (myReview.rating || 0) ? 'fill-[#F5C518] text-[#F5C518]' : 'text-outline-variant'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={startEdit}
                      className="p-1.5 rounded-lg hover:bg-surface-container text-outline transition-colors"
                      title="Edit review"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleDeleteReview}
                      disabled={submitting}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors disabled:opacity-50"
                      title="Delete review"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {myReview.comment && (
                  <p className="text-xs text-on-surface-variant leading-relaxed">{myReview.comment}</p>
                )}
              </div>
            )}

            {/* Edit form for own review */}
            {myReview && editingReview && (
              <div className="bg-surface-container-low border border-outline-variant/70 rounded-xl p-4 space-y-3">
                <div className="text-xs font-bold text-on-surface">Edit your review</div>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map((s) => (
                    <button key={s} type="button" onClick={() => setEditRating(s)}>
                      <Star className={`w-5 h-5 cursor-pointer transition-colors ${s <= editRating ? 'fill-[#F5C518] text-[#F5C518]' : 'text-outline-variant hover:text-[#F5C518]'}`} />
                    </button>
                  ))}
                </div>
                <textarea
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  rows={3}
                  className="w-full text-xs px-3 py-2.5 border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none bg-white"
                  placeholder="Update your review..."
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleEditSave}
                    disabled={submitting}
                    className="px-4 py-1.5 bg-[#0056D2] text-white text-xs font-bold rounded-lg disabled:opacity-50 hover:bg-[#00419E] transition-colors"
                  >
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => setEditingReview(false)}
                    className="px-4 py-1.5 border border-outline-variant text-xs font-bold rounded-lg hover:bg-surface-container transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Submit new review form (only if no existing review) */}
            {!myReview && userId && (
              <div className="bg-surface-container-low border border-outline-variant/70 rounded-xl p-4 space-y-3">
                <div className="text-xs font-bold text-on-surface">Write a review</div>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map((s) => (
                    <button key={s} type="button" onClick={() => setSubmitRating(s)}>
                      <Star className={`w-6 h-6 cursor-pointer transition-colors ${s <= submitRating ? 'fill-[#F5C518] text-[#F5C518]' : 'text-outline-variant hover:text-[#F5C518]'}`} />
                    </button>
                  ))}
                  {submitRating > 0 && (
                    <span className="ml-2 text-xs text-outline">{['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][submitRating]}</span>
                  )}
                </div>
                <textarea
                  value={submitComment}
                  onChange={(e) => setSubmitComment(e.target.value)}
                  rows={3}
                  className="w-full text-xs px-3 py-2.5 border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none bg-white"
                  placeholder="Share your experience with this course..."
                />
                <button
                  onClick={handleSubmitReview}
                  disabled={submitting || submitRating === 0}
                  className="flex items-center gap-2 px-4 py-1.5 bg-[#0056D2] text-white text-xs font-bold rounded-lg disabled:opacity-50 hover:bg-[#00419E] transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Submitting...' : 'Submit Review'}</span>
                </button>
              </div>
            )}

            {/* Other reviews list */}
            {reviewsLoading ? (
              <div className="text-xs text-outline italic">Loading reviews...</div>
            ) : otherReviews.length === 0 && !myReview ? (
              <div className="text-xs text-on-surface-variant italic bg-surface-container-low rounded-xl p-4 border border-outline-variant/70">
                No reviews yet. Be the first to review this course!
              </div>
            ) : (
              <div className="space-y-4">
                {otherReviews.map((review) => (
                  <div key={review.id} className="border-b border-outline-variant/40 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <HumanAvatar name={review.learnerName || 'Student'} size="sm" />
                      <div>
                        <div className="text-xs font-bold text-on-surface">{review.learnerName || 'Student'}</div>
                        <div className="flex items-center gap-0.5 mt-0.5">
                          {[1,2,3,4,5].map((s) => (
                            <Star key={s} className={`w-3 h-3 ${s <= (review.rating || 0) ? 'fill-[#F5C518] text-[#F5C518]' : 'text-outline-variant'}`} />
                          ))}
                          {review.createdAt && (
                            <span className="ml-2 text-[11px] text-outline">
                              {new Date(review.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-xs text-on-surface-variant leading-relaxed">{review.comment}</p>
                    )}
                    {review.response && (
                      <div className="mt-2 ml-4 bg-surface-container-low rounded-lg p-3 border-l-2 border-primary/30">
                        <div className="text-[11px] font-bold text-primary mb-1">Instructor Response</div>
                        <p className="text-xs text-on-surface-variant">{review.response}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>

        {/* Right Column: Sticky Sidebar (~35% / 4 cols) */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 bg-surface-container-lowest rounded-xl shadow-ambient border border-outline-variant/80 overflow-hidden">

            {/* Video Thumbnail Preview */}
            <div className="relative w-full aspect-video bg-surface-container group cursor-pointer overflow-hidden">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                <div className="w-14 h-14 bg-white/95 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <PlayCircle className="w-8 h-8 text-primary" />
                </div>
              </div>
              <div className="absolute bottom-2.5 right-2.5 bg-black/70 text-white font-label-md text-[11px] font-bold px-2 py-0.5 rounded">
                Preview Course
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <div className="font-headline-lg text-2xl font-bold text-on-surface mb-0.5">
                  ₹{Number(course.price || 0).toLocaleString('en-IN')}
                </div>
                <div className="font-body-md text-xs text-on-surface-variant font-medium">
                  Full Lifetime Access • Accredited Certification
                </div>
              </div>

              <button
                onClick={() => navigate('/student/checkout', { state: { course } })}
                className="w-full bg-[#0056D2] hover:bg-[#00419E] text-white font-title-md text-xs font-bold py-3 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Enroll in Course</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleBookmarkToggle}
                  disabled={bookmarkLoading}
                  className="flex-1 py-2 rounded-lg border border-outline-variant hover:bg-surface-container text-xs font-bold text-on-surface flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60"
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-primary text-primary' : ''}`} />
                  <span>{isSaved ? 'Saved to Wishlist' : 'Add to Wishlist'}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="p-2 rounded-lg border border-outline-variant hover:bg-surface-container text-on-surface-variant transition-colors"
                  title="Share Course"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {course.enrolledCount > 0 && (
                <div className="text-center font-label-md text-[11px] text-outline">
                  Starts immediately. Join {course.enrolledCount} learners.
                </div>
              )}

              <hr className="border-outline-variant/60" />

              {/* Course Features */}
              <ul className="space-y-3 text-xs text-on-surface-variant">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                  <span className="font-medium text-on-surface">Verified University Certificate</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                  <span className="font-medium text-on-surface">Interactive Quizzes & Assignments</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                  <span className="font-medium text-on-surface">Self-paced learning • 100% Online</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-medium text-on-surface">30-day money-back guarantee</span>
                </li>
              </ul>
            </div>

          </div>
        </div>

      </main>
    </PageLayout>
  );
}
