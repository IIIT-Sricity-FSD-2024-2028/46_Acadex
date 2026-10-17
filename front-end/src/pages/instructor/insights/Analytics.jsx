import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button } from "../../../components/common";
import { Download, CheckCircle, TrendingUp, Star } from "lucide-react";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from "../../../utils/api";
import { useInstructor } from "../../../hooks/useInstructor";

export function Analytics() {
  const { instructor } = useInstructor();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!instructor?.id) return;
    const q = instructor?.id ? `?instructorId=${instructor.id}` : '';
    api.get(`/analytics/instructor${q}`, 'instructor')
      .then(data => {
        setAnalytics(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching instructor analytics:', err);
        setLoading(false);
      });
  }, [instructor?.id]);

  const stats = analytics?.stats || {
    totalEnrollments: '—',
    activeLearners: '—',
    completionRate: '—',
    averageRating: '—',
  };

  const enrollmentData = analytics?.enrollmentTrend || [];
  const coursePerformance = analytics?.coursePerformance || [];
  const engagementData = analytics?.engagementData || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Studio Performance & Analytics</h1>
        </div>

      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <TrendingUp className="w-20 h-20 text-emerald-600" />
          </div>
          <CardContent className="p-6 relative z-10">
            <p className="text-xs font-semibold text-slate-500 mb-1">Total Track Enrollments</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mb-2">{stats.totalEnrollments ?? '—'}</h3>
            {stats.enrollmentGrowth ? (
              <div className="flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full w-fit">
                <TrendingUp className="w-3.5 h-3.5 mr-1" /> {stats.enrollmentGrowth}
              </div>
            ) : (
              <div className="text-xs text-slate-400 font-medium">All student registrations</div>
            )}
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <TrendingUp className="w-20 h-20 text-emerald-600" />
          </div>
          <CardContent className="p-6 relative z-10">
            <p className="text-xs font-semibold text-slate-500 mb-1">Active Learners</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mb-2">{stats.activeLearners ?? '—'}</h3>
            {stats.activeRate ? (
              <div className="flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full w-fit">
                <TrendingUp className="w-3.5 h-3.5 mr-1" /> {stats.activeRate}
              </div>
            ) : (
              <div className="text-xs text-slate-400 font-medium">Currently progressing in tracks</div>
            )}
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <CheckCircle className="w-20 h-20 text-blue-600" />
          </div>
          <CardContent className="p-6 relative z-10">
            <p className="text-xs font-semibold text-slate-500 mb-1">Average Completion Rate</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mb-2">{stats.completionRate ?? '—'}</h3>
            <div className="text-xs text-slate-400 font-medium">Completed module curriculum</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Star className="w-20 h-20 text-amber-600" />
          </div>
          <CardContent className="p-6 relative z-10">
            <p className="text-xs font-semibold text-slate-500 mb-1">Average Course Rating</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mb-2">{stats.averageRating ? `${stats.averageRating} / 5.0` : '—'}</h3>
            <div className="text-xs text-slate-400 font-medium">
              {analytics?.stats?.totalReviews ? `${analytics.stats.totalReviews} verified reviews` : 'Verified student ratings'}
            </div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          Loading analytics...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Enrollment Trend</CardTitle>
              <CardDescription>New student enrollments across published tracks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={enrollmentData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} />
                    <Tooltip contentStyle={{ borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }} />
                    <Line type="monotone" dataKey="value" stroke="#0056D2" strokeWidth={3} dot={{r: 4, fill: '#0056D2', strokeWidth: 0}} activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Course Enrollment Breakdown</CardTitle>
              <CardDescription>Total enrolled learners per course</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={coursePerformance} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }} />
                    <Bar dataKey="students" fill="#0056D2" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Learner Engagement Hours</CardTitle>
              <CardDescription>Total hours of active lecture engagement and lab exercises completed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={engagementData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <defs>
                      <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0056D2" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#0056D2" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} />
                    <Tooltip contentStyle={{ borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }} />
                    <Area type="monotone" dataKey="hours" stroke="#0056D2" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
