import { Card, CardContent, Button, Input } from "../../../components/common";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../components/instructor/ui/Tabs";
import { 
  Search, 
  Star, 
  Users, 
  X, 
  BookOpen, 
  Inbox, 
  Check, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Loader2 
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { api } from "../../../utils/api";
import { useInstructor } from "../../../hooks/useInstructor";

export function MyCourses() {
  const { 
    instructor, 
    pendingCourseRequests = [], 
    acceptCourseRequest, 
    declineCourseRequest, 
    actionLoading, 
    refreshInstructor 
  } = useInstructor();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [actionFeedback, setActionFeedback] = useState(null);
  const [confirmDeclineId, setConfirmDeclineId] = useState(null);

  const fetchCourses = () => {
    setLoading(true);
    api.get('/courses', 'instructor')
      .then(data => {
        const list = Array.isArray(data) ? data : (data?.items || []);
        if (instructor?.id) {
          const myCourses = list.filter(course => {
            const isDirect = course.instructorId === instructor.id;
            const isInTeam = (course.instructors || []).some(
              inst => inst.id === instructor.id ||
                      (instructor.email && inst.email?.toLowerCase() === instructor.email.toLowerCase()) ||
                      (instructor.name && inst.name?.toLowerCase() === instructor.name.toLowerCase())
            );
            return isDirect || isInTeam;
          });
          setCourses(myCourses);
        } else {
          setCourses([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching courses:', err);
        setCourses([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCourses();
  }, [instructor]);

  const handleAcceptCourse = async (requestId, courseTitle) => {
    setActionFeedback(null);
    try {
      await acceptCourseRequest(requestId);
      setActionFeedback({
        type: 'success',
        message: `Successfully accepted assignment for "${courseTitle}"! Course is now editable in your studio.`,
      });
      await refreshInstructor();
      fetchCourses();
      setTimeout(() => setActionFeedback(null), 5000);
    } catch (err) {
      setActionFeedback({
        type: 'error',
        message: err?.message || 'Failed to accept course assignment.',
      });
    }
  };

  const handleDeclineCourse = async (requestId) => {
    setActionFeedback(null);
    setConfirmDeclineId(null);
    try {
      await declineCourseRequest(requestId);
      setActionFeedback({
        type: 'info',
        message: 'Course teaching request was declined.',
      });
      await refreshInstructor();
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (err) {
      setActionFeedback({
        type: 'error',
        message: err?.message || 'Failed to decline course request.',
      });
    }
  };

  const filteredCourses = useMemo(() => {
    return courses
      .filter((course) => {
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
        if (sortBy === "popular") return (b.enrolledCount ?? b.students ?? 0) - (a.enrolledCount ?? a.students ?? 0);
        if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
        return 0;
      });
  }, [courses, searchQuery, sortBy]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">My Courses</h1>
        </div>
      </div>

      {/* Action Feedback Notification */}
      {actionFeedback && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-3 animate-in fade-in duration-200 ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : actionFeedback.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : actionFeedback.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <Inbox className="w-4 h-4 text-blue-600 shrink-0" />
            )}
            <span>{actionFeedback.message}</span>
          </div>
          <button onClick={() => setActionFeedback(null)} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Banner: Pending Course Assignment Requests */}
      {pendingCourseRequests.length > 0 && activeTab !== "requests" && (
        <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-blue-50/90 border border-blue-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#0056D2] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-sm">
                  {pendingCourseRequests.length} Course Assignment Request{pendingCourseRequests.length > 1 ? 's' : ''} Pending
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  Action Required
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Your institution ({instructor?.organizationName || 'your university'}) has requested you to instruct new course tracks. Review and accept below to begin authoring curriculum.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setActiveTab('requests')}
            className="bg-[#0056D2] hover:bg-[#0040A1] text-white font-bold text-xs shrink-0 shadow-xs"
          >
            Review Requests ({pendingCourseRequests.length})
          </Button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="relative w-full md:w-96 shrink-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
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
          <TabsTrigger value="all">
            All Courses ({courses.length})
          </TabsTrigger>
          <TabsTrigger value="requests" className="relative">
            Course Requests
            {pendingCourseRequests.length > 0 && (
              <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0056D2] text-white">
                {pendingCourseRequests.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Tab: Course Requests / Invitations ── */}
        <TabsContent value="requests">
          {pendingCourseRequests.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Incoming Course Teaching Requests</h3>
                  <p className="text-xs text-slate-500">
                    Review faculty assignment offers from your university administration. Once accepted, you gain full editorial access.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {pendingCourseRequests.map((req) => {
                  const matched = courses.find(
                    (c) => c.id === req.courseId || c.title?.toLowerCase() === req.courseTitle?.toLowerCase()
                  );
                  const thumb =
                    matched?.thumbnail ||
                    matched?.image ||
                    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop';

                  return (
                    <Card
                      key={req.id}
                      className="overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col group border-slate-200 hover:border-blue-300"
                    >
                      <div className="aspect-[16/9] relative overflow-hidden bg-slate-100">
                        <img
                          src={thumb}
                          alt={req.courseTitle}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute top-3 right-3 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs backdrop-blur-md">
                            Pending Request
                          </span>
                        </div>
                        {req.organizationName && (
                          <div className="absolute top-3 left-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/95 text-slate-800 shadow-xs backdrop-blur-md border border-slate-200/80">
                              {req.organizationName}
                            </span>
                          </div>
                        )}
                      </div>

                      <CardContent className="p-5 flex flex-col flex-1 bg-white">
                        <h3 className="font-bold text-slate-900 leading-snug mb-3 line-clamp-2 flex-1 group-hover:text-[#0056D2] transition-colors">
                          {req.courseTitle}
                        </h3>

                        <div className="flex items-center justify-between border-t border-slate-100 pt-3.5 mt-auto gap-2">
                          {confirmDeclineId === req.id ? (
                            <div className="flex items-center gap-2 w-full justify-between">
                              <span className="text-[11px] font-semibold text-rose-700">Decline?</span>
                              <div className="flex gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeclineId(null)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  disabled={actionLoading}
                                  onClick={() => handleDeclineCourse(req.id)}
                                  className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-bold hover:bg-rose-700 transition-colors"
                                >
                                  Confirm
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={actionLoading}
                                onClick={() => setConfirmDeclineId(req.id)}
                                className="h-8 text-xs font-semibold text-slate-500 hover:text-rose-700 hover:bg-rose-50 px-2.5"
                              >
                                Decline
                              </Button>
                              <Button
                                size="sm"
                                disabled={actionLoading}
                                onClick={() => handleAcceptCourse(req.id, req.courseTitle)}
                                className="h-8 shadow-2xs font-semibold text-xs bg-[#0056D2] hover:bg-[#00419E] text-white flex items-center gap-1.5 px-3"
                              >
                                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                Accept Course
                              </Button>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center bg-white">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3 text-[#0056D2]">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">All Caught Up!</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                You have no pending course teaching requests from your institution. Newly assigned courses from your university dean will appear here for your confirmation.
              </p>
            </div>
          )}
        </TabsContent>

        {/* ── Tab: Active Courses ── */}
        <TabsContent value="all">
          {loading ? (
              <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
                Loading courses...
              </div>
            ) : filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCourses.map((course) => {
                    return (
                    <Card key={course.id} className="overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col group border-slate-200 hover:border-blue-300">
                      <div className="aspect-[16/9] relative overflow-hidden bg-slate-100">
                        <img 
                          src={course.thumbnail || course.image || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop'} 
                          alt={course.title} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <CardContent className="p-5 flex flex-col flex-1 bg-white">
                        <h3 className="font-bold text-slate-900 leading-snug mb-3 line-clamp-2 flex-1 group-hover:text-[#0056D2] transition-colors">
                          {course.title}
                        </h3>
                        <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 mb-5">
                          <span className="flex items-center gap-1.5 text-amber-600">
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                            {course.rating != null ? course.rating : "—"}
                          </span>
                          <span className="flex items-center gap-1.5 text-slate-600">
                            <Users className="w-4 h-4 text-slate-400" />
                            {(course.enrolledCount ?? course.students ?? 0).toLocaleString()} Enrolled
                          </span>
                        </div>
                        <div className="border-t border-slate-100 pt-3.5 mt-auto">
                          <Link to={`/instructor/courses/${course.id}/content`} className="w-full block">
                            <Button className="w-full h-8.5 bg-[#0056D2] hover:bg-[#00419E] text-white text-xs font-bold rounded-xl shadow-2xs flex items-center justify-center gap-1.5 transition-colors">
                              <Layers className="w-3.5 h-3.5" />
                              <span>Manage Curriculum</span>
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center bg-white">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  {searchQuery ? 'No courses found' : 'No Courses Assigned Yet'}
                </h3>
                <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                  {searchQuery
                    ? `No courses matching "${searchQuery}"`
                    : `Your affiliated institution (${instructor?.organizationName || 'your university'}) has not assigned any active course tracks to your profile yet.`}
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

export default MyCourses;
