import React, { useState, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  BookOpen,
  Building2,
  FolderOpen,
  Award,
  DollarSign,
  Clock,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';
import { StatCard } from '../../components/admin/StatCard';
import { ChartCard } from '../../components/admin/ChartCard';
import { DataTable } from '../../components/admin/DataTable';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Area,
  AreaChart,
} from 'recharts';
import { Avatar } from '../../components/common/Avatar';
import { api } from '../../utils/api';

export const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper: extract array from paginated { items: [] } or plain array
  const getItems = (res) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.items)) return res.items;
    return [];
  };

  useEffect(() => {
    Promise.all([
      api.get('/users'),
      api.get('/courses'),
      api.get('/payments/transactions'),
      api.get('/analytics/overview'),
    ])
      .then(([u, c, t, a]) => {
        setUsers(getItems(u));
        setCourses(getItems(c));
        setTransactions(getItems(t));
        setAnalytics(a || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching dashboard data:', err);
        setLoading(false);
      });
  }, []);

  const recentUsersCols = [
    {
      header: 'Name',
      cell: (row) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={row.name} size="xs" />
          <span className="font-semibold text-slate-800 text-sm">{row.name}</span>
        </div>
      ),
    },
    {
      header: 'Role',
      cell: (row) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80">
          {row.role}
        </span>
      ),
    },
    {
      header: 'Joined',
      cell: (row) => (
        <span className="text-xs text-slate-500">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'Recent'}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status || 'Active'} />,
    },
  ];

  const courseColumns = [
    {
      header: 'Course Title',
      cell: (course) => (
        <div className="font-semibold text-slate-900 text-sm line-clamp-1 max-w-xs">
          {course.title}
        </div>
      ),
    },
    {
      header: 'Faculty / Lead',
      cell: (course) => (
        <span className="text-xs text-slate-600 font-medium">
          {course.instructorName ||
            course.leadInstructorName ||
            course.instructors?.map((instructor) => instructor.name).filter(Boolean).join(', ') ||
            'Accredited Faculty'}
        </span>
      ),
    },
    {
      header: 'Category',
      cell: (course) => (
        <span className="text-xs text-slate-500 font-medium">{course.category || 'Technology'}</span>
      ),
    },
    {
      header: 'Status',
      cell: (course) => <StatusBadge status={course.status || 'Published'} />,
    },
  ];

  const stats = {
    totalUsers: analytics?.stats?.totalUsers || users.length.toString(),
    totalLearners:
      analytics?.stats?.totalLearners ||
      users.filter((u) => u.role === 'Student' || u.role === 'Learner').length.toString(),
    totalInstructors:
      analytics?.stats?.totalInstructors ||
      users.filter((u) => u.role === 'Instructor').length.toString(),
    totalRevenue:
      analytics?.stats?.totalRevenue ||
      `₹${transactions.reduce((acc, t) => acc + (t.amount || 0), 0).toLocaleString('en-IN')}`,
    organizations:
      analytics?.stats?.organizations ||
      users.filter((u) => u.role === 'Organization').length.toString(),
    courses: analytics?.stats?.courses || courses.length.toString(),
    enrollments: analytics?.stats?.enrollments ?? '0',
    pendingApprovals:
      analytics?.stats?.pendingApprovals ||
      courses.filter((c) => c.status === 'Pending Approval' || c.status === 'Draft').length.toString(),
  };

  const userGrowthData = analytics?.userGrowth || [];
  const revenueData = analytics?.revenueData || [];
  const pendingApprovals = analytics?.pendingApprovals || [];

  return (
    <div className="space-y-8">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* SIGNATURE COURSERA BLUE WELCOME BANNER (Exact Student Aesthetic) */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="w-full bg-gradient-to-r from-[#002554] via-[#0040A1] to-[#0056D2] text-white rounded-3xl p-6 md:p-8 lg:p-10 shadow-md relative overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-white/5 pointer-events-none blur-2xl"></div>
        <div className="absolute right-40 -bottom-20 w-64 h-64 rounded-full bg-blue-400/10 pointer-events-none blur-xl"></div>

        <div className="relative z-10 max-w-4xl">
          {/* Status Pill */}
          <div className="mb-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-xs font-semibold backdrop-blur-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Platform Administration Console</span>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold mb-6 tracking-tight">
            Platform Administration
          </h1>

          {/* Banner Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/admin/courses"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-[#0040A1] text-xs font-bold hover:bg-blue-50 shadow-sm transition-all hover:scale-[1.01]"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Curriculum Catalog ({stats.courses})</span>
            </Link>
            <Link
              to="/admin/courses/approval"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all backdrop-blur-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Review Approvals ({stats.pendingApprovals})</span>
            </Link>
            <Link
              to="/admin/users"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all backdrop-blur-sm"
            >
              <Users className="w-3.5 h-3.5" />
              <span>User Directory</span>
            </Link>
            <Link
              to="/admin/payments"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all backdrop-blur-sm"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Tuition Settlements</span>
            </Link>
          </div>
        </div>

        {/* 4-Tile Frosted Stat Grid inside Banner */}
        <div className="mt-8 pt-6 border-t border-white/15 grid grid-cols-2 lg:grid-cols-4 gap-3.5 relative z-10">
          <div className="flex items-center gap-3 bg-white/10 p-3.5 rounded-2xl backdrop-blur-md border border-white/15 shadow-2xs hover:bg-white/15 transition-all">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-base font-bold leading-tight">{stats.totalUsers}</p>
              <p className="text-[11px] text-blue-200 truncate font-medium">Platform Users</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/10 p-3.5 rounded-2xl backdrop-blur-md border border-white/15 shadow-2xs hover:bg-white/15 transition-all">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
              <FolderOpen className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-base font-bold leading-tight">{stats.courses}</p>
              <p className="text-[11px] text-blue-200 truncate font-medium">Active Courses</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/10 p-3.5 rounded-2xl backdrop-blur-md border border-white/15 shadow-2xs hover:bg-white/15 transition-all">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-base font-bold leading-tight truncate">{stats.totalRevenue}</p>
              <p className="text-[11px] text-blue-200 truncate font-medium">Platform Revenue</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/10 p-3.5 rounded-2xl backdrop-blur-md border border-white/15 shadow-2xs hover:bg-white/15 transition-all">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-amber-300" />
            </div>
            <div className="min-w-0">
              <p className="text-base font-bold leading-tight text-amber-200">
                {stats.pendingApprovals} Pending
              </p>
              <p className="text-[11px] text-blue-200 truncate font-medium">Approvals Queue</p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* METRIC KPI TILES (Coursera Slate Tokens)                      */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Active Learners"
          value={stats.totalLearners}
          icon={GraduationCap}
          color="success"
        />
        <StatCard
          title="Teaching Faculty"
          value={stats.totalInstructors}
          icon={BookOpen}
          color="primary"
        />
        <StatCard
          title="Organizations & Tenancies"
          value={stats.organizations}
          icon={Building2}
          color="purple"
        />
        <StatCard
          title="Active Enrollments"
          value={stats.enrollments}
          icon={Award}
          color="warning"
        />
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TELEMETRY ANALYTICS CHARTS                                    */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Platform Learner Registration Growth</h3>
              <p className="text-xs text-slate-500 mt-0.5">Monthly trajectory of student and faculty signups</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-[#0056D2] border border-blue-200/60">
              Live Telemetry
            </span>
          </div>
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={userGrowthData} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="learnerGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0056D2" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0056D2" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="learners"
                  name="Enrolled Learners"
                  stroke="#0056D2"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#learnerGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Tuition Collections & Settlements</h3>
              <p className="text-xs text-slate-500 mt-0.5">Monthly transaction revenue processed via NexusPay</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              Processed
            </span>
          </div>
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  }}
                  formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Gross Revenue']}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="revenue" name="Revenue" fill="#0056D2" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TABLES SECTION: RECENT USERS & ACTION ITEMS                   */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Registrations Table Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/60">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recent User Registrations</h3>
                <p className="text-xs text-slate-500">Newly onboarded learners, faculty, and org admins</p>
              </div>
              <Link
                to="/admin/users"
                className="text-xs font-bold text-[#0056D2] hover:text-[#00419E] flex items-center gap-1 hover:underline"
              >
                <span>View Full Directory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <DataTable columns={recentUsersCols} data={users.slice(0, 5)} />
          </div>

          {/* Published Courses Overview */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/60">
              <div>
                <h3 className="text-base font-bold text-slate-900">Academic Curriculum Roster</h3>
                <p className="text-xs text-slate-500">Active university tracks and certifications</p>
              </div>
              <Link
                to="/admin/courses"
                className="text-xs font-bold text-[#0056D2] hover:text-[#00419E] flex items-center gap-1 hover:underline"
              >
                <span>Browse All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {loading ? (
              <div className="p-8 text-center text-slate-500 text-sm">Loading curriculum tracks...</div>
            ) : (
              <DataTable columns={courseColumns} data={courses.slice(0, 5)} />
            )}
          </div>
        </div>

        {/* Right Sidebar: Action Required & Operational Shortcuts */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Pending Actions</h3>
                <p className="text-xs text-slate-500">Items requiring verification</p>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
            </div>

            <div className="divide-y divide-slate-100">
              {pendingApprovals.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 hover:bg-slate-50/80 transition-colors flex items-start justify-between group"
                >
                  <div className="space-y-1 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                        {item.type}
                      </span>
                      <span className="text-[11px] text-slate-400">{item.date}</span>
                    </div>
                    <p className="font-semibold text-slate-800 text-xs leading-snug">{item.name}</p>
                  </div>
                  <Link
                    to="/admin/courses/approval"
                    className="p-1 text-slate-400 group-hover:text-[#0056D2] transition-colors"
                    title="Review item"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
              <div className="p-4 text-center bg-slate-50/40">
                <Link
                  to="/admin/courses/approval"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0056D2] hover:text-[#00419E]"
                >
                  <span>Open Approvals Desk</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Platform Governance Card */}
          <div className="bg-gradient-to-br from-slate-900 to-[#002554] rounded-2xl p-6 text-white shadow-xs">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <h4 className="text-sm font-bold">Audit & Governance</h4>
                <p className="text-[11px] text-slate-300">Level 2 Operational Mode</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              All platform changes, dispute arbitration notes, and course publications are recorded in the
              system ledger.
            </p>
            <div className="flex items-center gap-2">
              <Link
                to="/admin/reports"
                className="w-full text-center px-4 py-2 rounded-xl bg-white/15 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all"
              >
                View System Reports
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
