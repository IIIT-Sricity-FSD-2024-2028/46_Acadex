import { Card, CardContent, Badge, Button, Input, Avatar } from "../../../components/common";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/instructor/ui/Table";
import { Search, Users, Activity, CheckCircle, TrendingUp, MessageSquare, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { cn } from "../../../utils/cn";
import { api } from "../../../utils/api";
import { useInstructor } from "../../../hooks/useInstructor";

export function Students() {
  const { instructor } = useInstructor();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("All Courses");
  const [selectedStatus, setSelectedStatus] = useState("All");

  useEffect(() => {
    Promise.all([
      api.get('/learners', 'instructor'),
      api.get('/enrollments', 'instructor'),
      api.get('/courses', 'instructor'),
    ])
      .then(([l, e, c]) => {
        const learnersArray = Array.isArray(l) ? l : (l?.items || []);
        const enrollmentsArray = Array.isArray(e) ? e : (e?.items || []);
        const allCourses = Array.isArray(c) ? c : (c?.items || []);

        const instructorCourseIds = instructor?.id
          ? allCourses
              .filter(course => {
                const isDirect = course.instructorId === instructor.id;
                const isInTeam = (course.instructors || []).some(inst => inst.id === instructor.id);
                return isDirect || isInTeam;
              })
              .map(course => course.id)
          : allCourses.map(course => course.id);

        const instructorEnrollments = enrollmentsArray.filter(en => instructorCourseIds.includes(en.courseId));

        const studentList = instructorEnrollments.map(en => {
          const learner = learnersArray.find(lrn => lrn.id === en.learnerId) || {};
          return {
            id: en.learnerId || en.id,
            name: en.learnerName || learner.name || 'Student',
            email: en.learnerEmail || learner.email || 'student@domain.edu',
            course: en.courseTitle || en.course || '—',
            progress: en.progress ?? 0,
            lastActive: en.lastAccessed || en.lastAccessedLesson || 'Recently',
            status: en.status || 'Active',
          };
        });
        setStudents(studentList);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching students:', err);
        setStudents([]);
        setLoading(false);
      });
  }, [instructor?.id]);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      if (selectedCourse !== "All Courses" && student.course !== selectedCourse) {
        return false;
      }
      if (selectedStatus !== "All" && student.status !== selectedStatus) {
        return false;
      }
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchName = student.name?.toLowerCase().includes(q);
        const matchEmail = student.email?.toLowerCase().includes(q);
        const matchCourse = student.course?.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchCourse) return false;
      }
      return true;
    });
  }, [students, searchQuery, selectedCourse, selectedStatus]);

  const uniqueCourses = useMemo(() => {
    return Array.from(new Set(students.map(s => s.course)));
  }, [students]);

  const activeCount = students.filter(s => s.status === 'Active').length;
  const completedCount = students.filter(s => s.progress === 100).length;
  const avgProgress = students.length > 0
    ? Math.round(students.reduce((acc, s) => acc + (s.progress || 0), 0) / students.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Enrolled Students & Progress</h1>
          <p className="text-slate-500 text-sm mt-1">Monitor learner progress, evaluate module completions, and manage engagement.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-blue-50 border border-blue-200/60 rounded-xl flex items-center justify-center text-[#0056D2]">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">{students.length}</h3>
            <p className="text-xs text-slate-500 font-semibold mt-1">Total Enrolled</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-emerald-50 border border-emerald-200/60 rounded-xl flex items-center justify-center text-emerald-600">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">{activeCount}</h3>
            <p className="text-xs text-slate-500 font-semibold mt-1">Active Learners (30d)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-purple-50 border border-purple-200/60 rounded-xl flex items-center justify-center text-purple-600">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">{avgProgress}%</h3>
            <p className="text-xs text-slate-500 font-semibold mt-1">Average Track Completion</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-amber-50 border border-amber-200/60 rounded-xl flex items-center justify-center text-amber-600">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">{completedCount}</h3>
            <p className="text-xs text-slate-500 font-semibold mt-1">Certified Track Graduates</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/70">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search students by name, email..." 
                className="pl-10 pr-9 h-10 bg-white" 
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
            <div className="flex gap-2 w-full sm:w-auto">
              <select 
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="border border-slate-200 rounded-xl text-xs font-semibold px-3 py-2 bg-white flex-1 sm:flex-none focus:ring-2 focus:ring-[#0056D2]/20 focus:border-[#0056D2] outline-none text-slate-700 shadow-2xs"
              >
                <option value="All Courses">All Courses</option>
                {uniqueCourses.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
              <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-slate-200 rounded-xl text-xs font-semibold px-3 py-2 bg-white flex-1 sm:flex-none focus:ring-2 focus:ring-[#0056D2]/20 focus:border-[#0056D2] outline-none text-slate-700 shadow-2xs"
              >
                <option value="All">Status: All</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500">Loading student roster...</div>
          ) : filteredStudents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar fallback={student.name.charAt(0)} />
                        <div>
                          <div className="font-semibold text-slate-900">{student.name}</div>
                          <div className="text-xs text-slate-500">{student.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-700 font-medium">{student.course}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden shrink-0">
                          <div 
                            className={cn("h-full", student.progress === 100 ? "bg-emerald-500" : "bg-[#0056D2]")}
                            style={{ width: `${student.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-slate-700 font-bold">{student.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-500 text-xs">{student.lastActive}</TableCell>
                    <TableCell>
                      <Badge variant={
                        student.status === 'Active' ? 'success' : 
                        student.status === 'Completed' ? 'primary' : 'default'
                      }>
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/instructor/students/${student.id}`}>
                          <Button variant="ghost" size="sm" className="text-[#0056D2] font-semibold">View</Button>
                        </Link>
                        <button className="text-slate-400 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">No students found</h3>
              <p className="text-sm text-slate-500 mt-1">
                {searchQuery ? `No students matching "${searchQuery}"` : "No students matching current filters."}
              </p>
            </div>
          )}

          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs font-medium text-slate-500">
            <span>
              Showing <strong className="text-slate-700">{filteredStudents.length}</strong> of <strong className="text-slate-700">{students.length}</strong> total enrollees
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
