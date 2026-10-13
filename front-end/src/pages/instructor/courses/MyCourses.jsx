import { Card, CardContent } from "../../../components/instructor/ui/Card";
import { Badge } from "../../../components/instructor/ui/Badge";
import { Button } from "../../../components/instructor/ui/Button";
import { Input } from "../../../components/instructor/ui/Input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../components/instructor/ui/Tabs";
import { Search, Star, Users, X, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { api } from "../../../utils/api";

export function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    api.get('/courses', 'instructor')
      .then(data => {
        const list = Array.isArray(data) ? data : (data?.items || []);
        setCourses(list);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching courses:', err);
        setCourses([]);
        setLoading(false);
      });
  }, []);

  const filteredCourses = useMemo(() => {
    return courses
      .filter((course) => {
        if (activeTab === "published" && course.status !== "Published") return false;
        if (activeTab === "draft" && course.status !== "Draft") return false;
        if (activeTab === "archived" && course.status !== "Archived") return false;

        if (searchQuery.trim() !== "") {
          const q = searchQuery.toLowerCase();
          const matchTitle = course.title?.toLowerCase().includes(q);
          const matchCat = course.category?.toLowerCase().includes(q);
          const matchLevel = course.level?.toLowerCase().includes(q);
          if (!matchTitle && !matchCat && !matchLevel) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "newest") return (b.timestamp || 0) - (a.timestamp || 0);
        if (sortBy === "oldest") return (a.timestamp || 0) - (b.timestamp || 0);
        if (sortBy === "popular") return (b.students || 0) - (a.students || 0);
        if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
        return 0;
      });
  }, [courses, activeTab, searchQuery, sortBy]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">My Courses & Curricula</h1>
          <p className="text-slate-500 text-sm mt-1">Manage, search, publish and organize your department course offerings.</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="relative w-full md:w-96 shrink-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your courses by title or topic..." 
            className="pl-10 pr-9 bg-slate-50/60 border-slate-200 focus:bg-white transition-colors" 
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        
        <div className="flex items-center justify-end w-full md:w-auto">
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-slate-200 rounded-xl text-sm px-3.5 py-2.5 bg-white w-full md:w-auto focus:ring-2 focus:ring-[#0056D2]/20 focus:border-[#0056D2] outline-none transition-all shadow-2xs font-medium text-slate-700"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="popular">Most Enrollees</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-100/90 border border-slate-200/80 shadow-2xs p-1 rounded-xl">
          <TabsTrigger value="all">All Courses ({courses.length})</TabsTrigger>
          <TabsTrigger value="published">Published ({courses.filter(c => c.status === "Published").length})</TabsTrigger>
          <TabsTrigger value="draft">Drafts ({courses.filter(c => c.status === "Draft").length})</TabsTrigger>
          <TabsTrigger value="archived">Archived (0)</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {loading ? (
            <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
              Loading courses...
            </div>
          ) : filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCourses.map((course) => (
                <Card key={course.id} className="overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col group border-slate-200 hover:border-blue-300">
                  <div className="aspect-[16/9] relative overflow-hidden bg-slate-100">
                    <img src={course.image || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop'} alt={course.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-3 right-3">
                      <Badge variant={course.status === "Published" ? "success" : "warning"} className="shadow-xs backdrop-blur-md bg-white/95">
                        {course.status}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-5 flex flex-col flex-1 bg-white">
                    <h3 className="font-bold text-slate-900 leading-snug mb-3 line-clamp-2 flex-1 group-hover:text-[#0056D2] transition-colors">
                      {course.title}
                    </h3>
                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 mb-5">
                      <span className="flex items-center gap-1.5 text-amber-600">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        {course.rating > 0 ? course.rating : "4.9"}
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <Users className="w-4 h-4 text-slate-400" />
                        {(course.students || 0).toLocaleString()} Enrolled
                      </span>
                    </div>
                    <div className="flex items-center justify-end border-t border-slate-100 pt-3.5 mt-auto">
                      <div className="flex items-center gap-2">
                        <Link to={`/instructor/courses/${course.id}/content`}>
                          <Button variant="outline" size="sm" className="h-8 shadow-2xs font-semibold">
                            Manage Curriculum
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center bg-white">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">No courses found</h3>
              <p className="text-sm text-slate-500 mt-1">
                {searchQuery ? `No courses matching "${searchQuery}"` : "No courses in this category."}
              </p>
              {searchQuery && (
                <Button variant="outline" size="sm" onClick={() => setSearchQuery("")} className="mt-4">
                  Clear Search
                </Button>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
