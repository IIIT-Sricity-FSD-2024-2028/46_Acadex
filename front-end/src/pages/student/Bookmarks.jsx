import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, BookOpen, Search, Star, Clock, ArrowRight, Trash2 } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import { useToast } from '../../components/common/Toast';
import api from '../../services/api';

export default function Bookmarks() {
  const { addToast } = useToast();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    api.bookmarks.list()
      .then((res) => {
        setBookmarks(Array.isArray(res) ? res : []);
        setLoading(false);
      })
      .catch(() => {
        setBookmarks([]);
        setLoading(false);
      });
  }, []);

  const handleRemove = async (courseId, courseTitle) => {
    setRemoving(courseId);
    try {
      await api.bookmarks.remove(courseId);
      setBookmarks((prev) => prev.filter((b) => b.courseId !== courseId));
      addToast(`"${courseTitle}" removed from wishlist.`, 'info');
    } catch {
      addToast('Failed to remove. Please try again.', 'error');
    } finally {
      setRemoving(null);
    }
  };

  const filtered = bookmarks.filter((b) => {
    const q = search.toLowerCase();
    return (
      !q ||
      (b.courseTitle || b.course?.title || '').toLowerCase().includes(q) ||
      (b.course?.category || '').toLowerCase().includes(q)
    );
  });

  return (
    <PageLayout>
      <main className="max-w-[1100px] mx-auto px-4 md:px-8 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-on-surface flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-primary fill-primary" />
              Saved Courses
            </h1>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {bookmarks.length} course{bookmarks.length !== 1 ? 's' : ''} saved to your wishlist
            </p>
          </div>
          <Link
            to="/student/explore"
            className="flex items-center gap-2 px-4 py-2 bg-[#0056D2] text-white text-xs font-bold rounded-lg hover:bg-[#00419E] transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Explore More
          </Link>
        </div>

        {/* Search */}
        {bookmarks.length > 0 && (
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-outline" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search saved courses..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
            />
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#E8EDF5] flex items-center justify-center">
              <Bookmark className="w-8 h-8 text-[#0056D2]" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700">
                {search ? 'No saved courses match your search.' : 'No saved courses yet.'}
              </p>
              {!search && (
                <p className="text-xs text-slate-500 mt-1">
                  Browse the course catalog and click "Add to Wishlist" to save courses for later.
                </p>
              )}
            </div>
            {!search && (
              <Link
                to="/student/explore"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#0056D2] text-white text-xs font-bold hover:bg-[#00419E] transition-colors"
              >
                <span>Explore Courses</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((bookmark) => {
              const course = bookmark.course || {};
              const title = bookmark.courseTitle || course.title || 'Course';
              const courseId = bookmark.courseId;

              return (
                <div key={bookmark.id || courseId} className="bg-white rounded-xl border border-outline-variant/80 shadow-xs overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                  {/* Thumbnail */}
                  <div className="relative w-full aspect-video bg-surface-container overflow-hidden">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#E8EDF5]">
                        <BookOpen className="w-8 h-8 text-[#0056D2]/40" />
                      </div>
                    )}
                    {course.level && (
                      <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        {course.level.toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4 flex flex-col flex-1 space-y-2">
                    <div>
                      {course.category && (
                        <span className="text-[10px] text-[#0056D2] font-bold uppercase tracking-wide">
                          {course.category}
                        </span>
                      )}
                      <h3 className="text-xs font-bold text-on-surface leading-snug mt-0.5 line-clamp-2">
                        {title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-outline">
                      {course.rating != null && (
                        <span className="flex items-center gap-0.5 text-[#F5C518]">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="text-on-surface font-semibold">{course.rating}</span>
                        </span>
                      )}
                      {course.totalHours && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {course.totalHours}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 mt-auto border-t border-outline-variant/40">
                      <span className="text-sm font-bold text-on-surface">
                        ₹{Number(course.price || 0).toLocaleString('en-IN')}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleRemove(courseId, title)}
                          disabled={removing === courseId}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 disabled:opacity-50 transition-colors"
                          title="Remove from wishlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <Link
                          to={`/student/course/${courseId}`}
                          className="flex items-center gap-1 px-3 py-1.5 bg-[#0056D2] text-white text-[11px] font-bold rounded-lg hover:bg-[#00419E] transition-colors"
                        >
                          <span>View</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </PageLayout>
  );
}
