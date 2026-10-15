import React, { useState, useEffect } from 'react';
import { ChartCard } from '../../components/admin/ChartCard';
import { StatCard } from '../../components/admin/StatCard';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Legend 
} from 'recharts';
import { DollarSign, Users, Award, TrendingUp, CheckCircle, ArrowUpRight } from 'lucide-react';
import { api } from '../../utils/api';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/overview')
      .then(res => {
        setAnalytics(res);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching admin analytics:', err);
        setLoading(false);
      });
  }, []);

  const weeklyData = (analytics?.weeklyActiveUsers && analytics.weeklyActiveUsers.length > 0)
    ? analytics.weeklyActiveUsers
    : [];

  const categoryData = (analytics?.categoryData && analytics.categoryData.length > 0)
    ? analytics.categoryData
    : (analytics?.categoryBreakdown && analytics.categoryBreakdown.length > 0)
      ? analytics.categoryBreakdown.map(c => ({ name: c.category || c.name, value: c.coursesCount || c.value || 1 }))
      : [];

  const userGrowth = (analytics?.userGrowth && analytics.userGrowth.length > 0)
    ? analytics.userGrowth
    : [];

  const totalRevenue = analytics?.stats?.totalRevenue ?? '—';
  const totalLearners = analytics?.stats?.totalLearners ?? '—';
  const completionRate = analytics?.kpis?.completionRate != null ? `${analytics.kpis.completionRate}%` : '—';
  const retentionRate = analytics?.kpis?.retentionRate != null ? `${analytics.kpis.retentionRate}%` : '—';

  const topInstructors = analytics?.topInstructorsByRevenue || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Platform Analytics</h1>
          <p className="text-slate-500">Deep dive into platform metrics, user engagement, and revenue analytics.</p>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Gross Platform Revenue" value={totalRevenue} icon={DollarSign} trend="up" trendValue="18.4%" color="primary" />
        <StatCard title="Active Learners" value={totalLearners} icon={Users} trend="up" trendValue="12.5%" color="success" />
        <StatCard title="Course Completion Rate" value={completionRate} icon={CheckCircle} trend="up" trendValue="4.2%" color="purple" />
        <StatCard title="Learner Retention Rate" value={retentionRate} icon={TrendingUp} trend="up" trendValue="2.1%" color="warning" />
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
          Loading analytics visualizations...
        </div>
      ) : (
        <>
          {/* Main Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="User Growth & Revenue Velocity">
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={userGrowth} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value, name) => [name === 'revenue' ? `₹${value.toLocaleString()}` : value, name === 'revenue' ? 'Revenue' : 'Learners']}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="learners" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} name="Learners" activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} name="Revenue (₹)" />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Weekly Active Learners">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={weeklyData} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    formatter={(value) => [`${value} active users`, 'Daily Active']}
                  />
                  <Bar dataKey="active" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Active Users" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Course Distribution by Subject Track">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={categoryData} layout="vertical" margin={{ top: 10, right: 30, bottom: 5, left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} width={120} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    formatter={(val) => [`${val} courses`, 'Total Tracks']}
                  />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[0, 6, 6, 0]} name="Courses" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Subject Track Proportions">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={105}
                    paddingAngle={4}
                    dataKey="value"
                    nameKey="name"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Top Faculty / Instructors by Revenue */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-800">Top Performing Educators by Revenue</h3>
                <p className="text-xs text-slate-500">Highest grossing instructor tracks and learner satisfaction.</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-500 uppercase tracking-wider text-[11px] border-b border-slate-200 bg-slate-50/80">
                    <th className="px-6 py-3.5 font-bold">Faculty Educator</th>
                    <th className="px-6 py-3.5 font-bold">Specialization</th>
                    <th className="px-6 py-3.5 font-bold">Total Students</th>
                    <th className="px-6 py-3.5 font-bold">Rating</th>
                    <th className="px-6 py-3.5 font-bold text-right">Gross Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topInstructors.map((inst, i) => (
                    <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800 text-sm">{inst.name}</td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{inst.specialization || 'Enterprise Architecture'}</td>
                      <td className="px-6 py-4 text-slate-600">{(inst.enrolledStudents ?? 0).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        {inst.avgRating ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                            ★ {inst.avgRating}
                          </span>
                        ) : <span className="text-slate-400 text-xs">—</span>}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-emerald-700 text-sm">
                        ₹{(inst.revenueGenerated ?? 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
