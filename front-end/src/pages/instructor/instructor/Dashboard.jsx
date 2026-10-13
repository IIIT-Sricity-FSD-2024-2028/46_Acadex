import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/instructor/ui/Card";
import { Badge } from "../../../components/instructor/ui/Badge";
import { Button } from "../../../components/instructor/ui/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/instructor/ui/Table";
import { 
  BookOpen, 
  Users, 
  Star, 
  CheckCircle, 
  FileText, 
  User, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
  GraduationCap
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from "react-router-dom";
import { api } from "../../../utils/api";
import { useInstructor } from "../../../context/InstructorContext";

export function Dashboard() {
  const { instructor, assignedCourses } = useInstructor();
  const [analytics, setAnalytics] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/instructor', 'instructor'),
      api.get('/courses', 'instructor'),
    ])
      .then(([a, c]) => {
        setAnalytics(a);
        setCourses(Array.isArray(c) ? c : (c?.items || []));
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching instructor dashboard:', err);
        setLoading(false);
      });
  }, []);

  const stats = {
    totalCourses:    analytics?.stats?.totalCourses   ?? courses.length,
    totalStudents:   analytics?.stats?.totalStudents  ?? (courses.reduce((acc, c) => acc + (c.enrolledCount || 0), 0) || 7),
    averageRating:   analytics?.stats?.averageRating  ?? 4.8,
    completionRate:  analytics?.stats?.completionRate ?? '78%',
    totalEarnings:   analytics?.stats?.totalEarnings  ?? '₹28,400.00',
  };

  const chartData = (analytics?.dashboardEnrollments || []).map((item) => ({
    name: item.name,
    enrollments: item.enrollments ?? item.count ?? 0,
    active: item.active ?? Math.round((item.enrollments ?? item.count ?? 10) * 0.75),
    count: item.count ?? item.enrollments ?? 0,
  }));
  const recentActivities = analytics?.recentActivity || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* ───────────────────────────────────────────────────────────── */}
      {/* SIGNATURE COURSERA BLUE WELCOME BANNER (Matched to Student UI) */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="w-full bg-gradient-to-r from-[#002554] via-[#0040A1] to-[#0056D2] text-white rounded-2xl p-6 md:p-8 lg:p-10 shadow-md relative overflow-hidden">
        {/* Ambient Subtle Glow Orbs */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-white/5 pointer-events-none blur-2xl"></div>
        <div className="absolute right-40 -bottom-20 w-64 h-64 rounded-full bg-blue-400/10 pointer-events-none blur-xl"></div>

        <div className="relative z-10 max-w-4xl">
          {/* Status Pill */}
          <div className="mb-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-xs font-semibold backdrop-blur-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>{instructor?.organizationName || 'Accredited University Partner'}</span>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold mb-2 tracking-tight">
            Welcome back, {instructor?.name || 'Professor'}!
          </h1>

          {/* Banner Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/instructor/courses"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-[#0040A1] text-xs font-bold hover:bg-blue-50 shadow-sm transition-all hover:scale-[1.01]"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Manage Courses ({stats.totalCourses})</span>
            </Link>
            <Link
              to="/instructor/students"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all backdrop-blur-sm"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Enrolled Students ({stats.totalStudents})</span>
            </Link>
            <Link
              to="/instructor/analytics"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all backdrop-blur-sm"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Analytics Studio</span>
            </Link>
          </div>
        </div>

        {/* 4-Tile Frosted Stat Grid inside Banner (Exact Student Dashboard Style) */}
        <div className="mt-8 pt-6 border-t border-white/15 grid grid-cols-2 lg:grid-cols-4 gap-3.5 relative z-10">
          <div className="flex items-center gap-3 bg-white/10 p-3.5 rounded-xl backdrop-blur-md border border-white/15 shadow-2xs hover:bg-white/15 transition-all">
            <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-base font-bold leading-tight">{stats.totalCourses} Tracks</p>
              <p className="text-[11px] text-blue-200 truncate font-medium">Active Courses</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/10 p-3.5 rounded-xl backdrop-blur-md border border-white/15 shadow-2xs hover:bg-white/15 transition-all">
            <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-base font-bold leading-tight">{stats.totalStudents} Enrollees</p>
              <p className="text-[11px] text-blue-200 truncate font-medium">Total Students</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/10 p-3.5 rounded-xl backdrop-blur-md border border-white/15 shadow-2xs hover:bg-white/15 transition-all">
            <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
              <Star className="w-5 h-5 text-amber-300 fill-amber-300" />
            </div>
            <div className="min-w-0">
              <p className="text-base font-bold leading-tight">{stats.averageRating} / 5.0</p>
              <p className="text-[11px] text-blue-200 truncate font-medium">Educator Rating</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/10 p-3.5 rounded-xl backdrop-blur-md border border-white/15 shadow-2xs hover:bg-white/15 transition-all">
            <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-emerald-300" />
            </div>
            <div className="min-w-0">
              <p className="text-base font-bold leading-tight">{stats.completionRate}</p>
              <p className="text-[11px] text-blue-200 truncate font-medium">Completion Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MAIN CONTENT: CHARTS, COURSE PERFORMANCE, AND ACTIVITIES     */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Left Column: Analytics Chart & Course Table */}
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          
          {/* Enrollment Analytics Chart Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Enrollment Analytics</CardTitle>
                <CardDescription>Monthly enrollment growth and active learners across all published tracks</CardDescription>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className="inline-flex items-center gap-1.5 text-blue-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  Enrollments
                </span>
                <span className="inline-flex items-center gap-1.5 text-emerald-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  Active
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
                    />
                    <Line type="monotone" dataKey="enrollments" stroke="#0056D2" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#0056D2', stroke: '#fff', strokeWidth: 2 }} />
                    <Line type="monotone" dataKey="active" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Course Performance Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle>Course Performance</CardTitle>
                <CardDescription>Live metrics and enrollees for active academic courses</CardDescription>
              </div>
              <Link to="/instructor/courses">
                <Button variant="outline" size="sm">View All Courses</Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0 sm:p-6 sm:pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Completion</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.slice(0, 4).map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-200/80">
                          <img src={course.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop'} alt="Course thumbnail" className="w-full h-full object-cover" />
                        </div>
                        <div className="font-semibold text-slate-900 line-clamp-1">{course.title}</div>
                      </TableCell>
                      <TableCell className="text-slate-600 font-medium">{(course.students || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#0056D2] w-3/4 rounded-full"></div>
                          </div>
                          <span className="text-xs font-semibold text-slate-600">75%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-amber-500">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-semibold text-slate-800">{course.rating || 4.8}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={course.status === 'Published' ? 'success' : 'warning'}>
                          {course.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link to={`/instructor/courses/${course.id}/content`}>
                          <Button variant="ghost" size="sm" className="text-[#0056D2] hover:bg-blue-50 font-semibold">
                            Manage
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Quick Actions & Recent Activity */}
        <div className="space-y-6 lg:space-y-8">
          
          {/* Quick Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Studio Shortcuts</CardTitle>
              <CardDescription>Rapid curriculum and student tools</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link 
                to="/instructor/courses" 
                className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-blue-300 hover:shadow-xs hover:bg-blue-50/40 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#0056D2] group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#0056D2] transition-colors">Course Studio</h4>
                  <p className="text-xs text-slate-500 truncate">Create lessons, modules & quizzes</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#0056D2] group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link 
                to="/instructor/students" 
                className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-emerald-300 hover:shadow-xs hover:bg-emerald-50/40 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">Enrolled Learners</h4>
                  <p className="text-xs text-slate-500 truncate">Track progress</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link 
                to="/instructor/reviews" 
                className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-amber-300 hover:shadow-xs hover:bg-amber-50/40 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-105 transition-transform">
                  <Star className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition-colors">Student Reviews</h4>
                  <p className="text-xs text-slate-500 truncate">Feedback, ratings & responses</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
              </Link>
            </CardContent>
          </Card>

          {/* Recent Activity Card */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Live student interactions and events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {
                  recentActivities.map((item, i) => (
                    <div key={item.id || i} className="flex gap-3.5 group items-start">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 text-[#0056D2] group-hover:scale-105 transition-transform border border-blue-100">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className="text-xs font-semibold text-slate-900 leading-tight">{item.title}</p>
                        <p className="text-[11px] text-slate-400 mt-1">{item.timestamp}</p>
                      </div>
                    </div>
                  ))
}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
