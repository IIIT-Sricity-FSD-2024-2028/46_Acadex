import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, X, BookOpen, Star, Clock, CheckCircle2 } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import api from '../../services/api';
import { useStudent } from '../../context/StudentContext';

export default function ExploreCourses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { enrollments } = useStudent();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    document.title = 'Browse Catalog | NexusEdu';
    api.student
      .getCatalog()
      .then((res) => setCourses(Array.isArray(res) ? res : []))
      .catch((err) => setError(err.message || 'Could not load the catalog'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const updateQuery = (value) => {
    setQuery(value);
    const params = new URLSearchParams(searchParams);
    if (value.trim()) params.set('q', value);
    else params.delete('q');
    setSearchParams(params, { replace: true });
  };

  const enrolledIds = useMemo(() => new Set(enrollments.map((e) => e.courseId)), [enrollments]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = courses.filter(
      (c) =>
        !q ||
        [c.title, c.description, c.category, c.level, c.instructorName, c.leadInstructorName, c.organizationName]
          .some((v) => v?.toLowerCase().includes(q))
    );
    return [...list].sort((a, b) => {
      if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'popular') return (b.enrolledCount || 0) - (a.enrolledCount || 0);
      return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
    });
  }, [courses, query, sortBy]);

  return (
    <PageLayout>
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 space-y-6">
        <header>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Browse catalog</h1>
          <p className="text-sm text-slate-500 mt-1">Published courses taught by verified instructors.</p>
        </header>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              autoComplete="off"
              value={query}
              onChange={(e) => updateQuery(e.target.value)}
              placeholder="Search by course title, topic, instructor or organization"
              className="w-full h-11 pl-10 pr-10 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0056D2] focus:ring-2 focus:ring-[#0056D2]/20"
            />
            {query && (
              <button
                onClick={() => updateQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-11 bg-white border border-slate-200 rounded-xl px-3 text-sm font-medium text-slate-700 focus:outline-none focus:border-[#0056D2]"
          >
            <option value="newest">Newest</option>
            <option value="popular">Most enrolled</option>
            <option value="rating">Highest rated</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
          </select>
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#0056D2] border-t-transparent mx-auto" />
          </div>
        ) : error ? (
          <div className="py-12 text-center text-sm text-rose-600 bg-white border border-rose-200 rounded-xl">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-slate-200">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">
              {query ? `No courses match "${query}"` : 'No courses are available yet'}
            </p>
            {query && (
              <button onClick={() => updateQuery('')} className="mt-4 text-xs font-bold text-[#0056D2] hover:underline">
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-500">
              {filtered.length} course{filtered.length === 1 ? '' : 's'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((c) => (
                <Link
                  key={c.id}
                  to={`/student/course/${c.id}`}
                  className="bg-white border border-slate-200/80 rounded-xl overflow-hidden flex flex-col hover:shadow-md transition-shadow group"
                >
                  <div className="relative h-40 bg-slate-100 overflow-hidden">
                    {c.thumbnail && (
                      <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    )}
                    {enrolledIds.has(c.id) && (
                      <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3" /> Enrolled
                      </span>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col gap-1.5">
                    <p className="text-[11px] font-semibold text-[#0056D2]">
                      {[c.category, c.level].filter(Boolean).join(' • ')}
                    </p>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-2">{c.title}</h3>
                    <p className="text-xs text-slate-500">
                      {c.leadInstructorName || c.instructorName}
                      {c.organizationName ? ` · ${c.organizationName}` : ''}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-auto pt-2">
                      {c.rating > 0 && (
                        <span className="flex items-center gap-0.5 font-semibold text-slate-700">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {c.rating}
                          {c.reviewsCount ? <span className="text-slate-400 font-normal">({c.reviewsCount})</span> : null}
                        </span>
                      )}
                      {c.totalHours && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {c.totalHours}
                        </span>
                      )}
                      <span className="ml-auto text-sm font-bold text-slate-900">
                        {Number(c.price) > 0 ? `₹${Number(c.price).toLocaleString('en-IN')}` : 'Free'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </PageLayout>
  );
}
