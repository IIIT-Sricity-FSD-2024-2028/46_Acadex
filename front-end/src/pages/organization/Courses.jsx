import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Plus,
  Edit,
  Eye,
  Users,
  Trash2,
  RotateCcw
} from 'lucide-react';
import OrgLayout from '../../components/organization/OrgLayout';
import { useOrg } from '../../context/useOrg';
import { useToast } from '../../components/common/Toast';
import HumanAvatar from '../../components/common/HumanAvatar';

const getLessonCount = (module) => {
  if (Array.isArray(module?.lessons)) return module.lessons.length;
  if (Array.isArray(module?.items)) return module.items.length;
  return Number(module?.lessons ?? module?.lessonsCount ?? 0) || 0;
};

export default function Courses() {
  const { courses, deleteCourse, updateCourse } = useOrg();
  const { addToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  // Read initial search query from URL if passed from TopNav search
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('search') || '';

  const [search, setSearch] = useState(initialSearch);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showArchived, setShowArchived] = useState(false);

  const filteredCourses = courses.filter(c => {
    if (showArchived ? c.status !== 'Archived' : c.status === 'Archived') return false;
    const matchesCat = categoryFilter === 'All' || c.category === categoryFilter;
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
                          c.instructorName.toLowerCase().includes(search.toLowerCase()) ||
                          c.category.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleDeleteCourse = async (id, title) => {
    try {
      await deleteCourse(id);
      addToast(`Course "${title}" was archived.`, 'success');
    } catch (err) {
      addToast(`Failed to delete course: ${err.message || 'Server error'}`, 'error');
    }
  };

  const handleRestoreCourse = async (id, title) => {
    try {
      await updateCourse(id, { status: 'Published' });
      addToast(`Course "${title}" was restored.`, 'success');
    } catch (err) {
      addToast(`Failed to restore course: ${err.message || 'Server error'}`, 'error');
    }
  };

  const categories = ['All', 'Cloud Architecture', 'Machine Learning', 'Cybersecurity', 'DevOps', 'Data Engineering'];

  return (
    <OrgLayout
      breadcrumbs={[{ label: 'Courses' }]}
      actions={
        <div className="flex items-center gap-2">
          <Link
            to="/org/courses/create"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Course</span>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        
        {/* Header & Counters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-on-surface">Courses</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-surface-container border border-outline-variant text-xs font-semibold text-on-surface">
              Published: <strong>{courses.filter(c => c.status === 'Published').length}</strong>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-surface-container border border-outline-variant text-xs font-semibold text-on-surface">
              Total Enrolled: <strong>{courses.reduce((sum, c) => sum + (c.enrolledCount || 0), 0)}</strong>
            </div>
            <button onClick={() => setShowArchived((value) => !value)} className="px-3 py-1.5 rounded-xl bg-surface-container border border-outline-variant text-xs font-semibold text-primary">
              {showArchived ? 'Active Courses' : `Archived (${courses.filter((course) => course.status === 'Archived').length})`}
            </button>
          </div>
        </div>

        {/* Category Pills & Search */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-4 shadow-elevation-1 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                  categoryFilter === cat
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:border-primary text-on-surface font-medium"
            />
          </div>
        </div>

        {/* Active / archived courses */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-elevation-1 overflow-hidden">
          <h2 className="text-base font-bold text-on-surface mb-4">{showArchived ? 'Archived Courses' : 'Active Courses'}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-outline uppercase text-[10px] tracking-wider border-b border-outline-variant">
                  <th className="pb-3 font-bold">Course Title</th>
                  <th className="pb-3 font-bold">Category</th>
                  <th className="pb-3 font-bold">Teaching Faculty</th>
                  <th className="pb-3 font-bold">Enrolled</th>
                  <th className="pb-3 font-bold">Price</th>
                  {!showArchived && <th className="pb-3 font-bold">Status</th>}
                  <th className="pb-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {filteredCourses.length === 0 ? (
                  <tr>
                    <td colSpan={showArchived ? 6 : 7} className="py-12 text-center text-outline">
                      No courses found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredCourses.map((c) => {
                    const instList = c.instructors && c.instructors.length > 0
                      ? c.instructors
                      : [{ name: c.instructorName, role: 'Lead Instructor' }];
                    const lessonCount = Array.isArray(c.modules)
                      ? c.modules.reduce((total, module) => total + getLessonCount(module), 0)
                      : Number(c.lessonsCount) || 0;
                    
                    return (
                      <tr key={c.id} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <img src={c.thumbnail} alt={c.title} className="w-14 h-10 rounded-xl object-cover" />
                            <div>
                              <Link to={`/org/courses/${c.id}`} className="font-bold text-sm text-on-surface hover:text-primary transition-colors">
                                {c.title}
                              </Link>
                              <p className="text-[10px] text-outline">{lessonCount} lessons</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 font-semibold text-primary">{c.category}</td>
                        <td className="py-4 text-on-surface">
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-2 overflow-hidden">
                              {instList.map((inst, i) => inst.avatar ? (
                                <img key={inst.id || i} src={inst.avatar} alt={inst.name} title={`${inst.name} (${inst.role || 'Instructor'})`} className="inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover" />
                              ) : (
                                <HumanAvatar key={inst.id || i} name={inst.name} size="xs" className="ring-2 ring-white" />
                              ))}
                            </div>
                            <div>
                              <span className="font-medium text-xs text-on-surface block line-clamp-1">{c.instructorName}</span>
                              {instList.length > 1 && (
                                <span className="text-[10px] text-secondary font-bold">
                                  {instList.length} Faculty Members
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 font-bold text-on-surface">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-outline" />
                            <span>{c.enrolledCount || 0}</span>
                          </span>
                        </td>
                        <td className="py-4 font-bold text-emerald-700">₹{c.price}</td>
                        {!showArchived && <td className="py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            c.status === 'Published' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {c.status}
                          </span>
                        </td>}
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/org/courses/${c.id}/edit`}
                              title="Edit course details"
                              className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => navigate(`/org/courses/${c.id}`, { state: { course: c } })}
                              className="px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs inline-flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View</span>
                            </button>
                            {showArchived ? (
                              <button
                                title="Restore course"
                                onClick={() => handleRestoreCourse(c.id, c.title)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs inline-flex items-center gap-1"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Restore</span>
                              </button>
                            ) : (
                              <button
                                title="Archive course"
                                onClick={() => handleDeleteCourse(c.id, c.title)}
                                className="p-2 rounded-xl bg-surface-container hover:bg-red-50 text-red-600 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </OrgLayout>
  );
}
