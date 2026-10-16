import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Users,
  BookOpen,
  TrendingUp,
  ArrowRight,
  Check,
  X,
  Plus,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Send,
  RotateCcw
} from 'lucide-react';
import OrgLayout from '../../components/organization/OrgLayout';
import { useOrg } from '../../context/useOrg';
import { useToast } from '../../components/common/Toast';
import OrgAnalytics from './Analytics';

export default function OrgDashboard() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { courses, enrollments, instructorRequests, stats, respondToTeachingRequest, info } = useOrg();
  const [revenueRange, setRevenueRange] = React.useState('6m');

  // Aggregate the JSON-backed enrollment records by month using each course's price.
  const revenueDataPoints = React.useMemo(() => {
    const monthCount = revenueRange === '1y' ? 12 : 6;
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const coursePrices = new Map(courses.map((course) => [course.id, Number(course.price) || 0]));
    const months = Array.from({ length: monthCount }, (_, index) => ({
      date: new Date(currentMonth.getFullYear(), currentMonth.getMonth() - (monthCount - 1 - index), 1),
      amount: 0,
    }));

    enrollments.forEach((enrollment) => {
      const recordedAt = enrollment.enrolledAt || enrollment.enrolledDate || enrollment.createdAt;
      const date = recordedAt ? new Date(recordedAt) : null;
      if (!date || Number.isNaN(date.getTime())) return;

      const monthIndex = (date.getFullYear() - months[0].date.getFullYear()) * 12 + date.getMonth() - months[0].date.getMonth();
      if (monthIndex >= 0 && monthIndex < monthCount) {
        months[monthIndex].amount += coursePrices.get(enrollment.courseId) || 0;
      }
    });

    const maxAmount = Math.max(...months.map((month) => month.amount), 1);
    return months.map((month, index) => ({
      cx: 15 + (435 * index) / (monthCount - 1),
      cy: 125 - (month.amount / maxAmount) * 116,
      month: month.date.toLocaleString('en-US', { month: 'short' }),
      amount: month.amount,
    }));
  }, [courses, enrollments, revenueRange]);

  const selectedPeriodRevenue = revenueDataPoints.reduce((total, point) => total + point.amount, 0);
  const currentMonthRevenue = revenueDataPoints.at(-1)?.amount || 0;
  const yMax = Math.max(5000, Math.ceil(Math.max(...revenueDataPoints.map((point) => point.amount), 1) / 5000) * 5000);
  const yMid = Math.round(yMax * 0.67);
  const yLow = Math.round(yMax * 0.33);
  const revenueLinePath = revenueDataPoints.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.cx},${point.cy}`).join(' ');
  const revenueAreaPath = `${revenueLinePath} L ${revenueDataPoints.at(-1)?.cx || 450},125 L ${revenueDataPoints[0]?.cx || 15},125 Z`;

  const handleResendMail = (email) => {
    addToast(`Resent invitation request email to ${email}!`, 'info');
  };

  const handleWithdrawInvitation = async (id, name) => {
    try {
      await respondToTeachingRequest(id, 'Declined', 'Invitation withdrawn by organization');
      addToast(`Withdrew recruitment invitation for ${name}`, 'error');
    } catch (e) {
      addToast(`Failed to withdraw invitation`, 'error');
    }
  };

  const handleMarkAccepted = async (id, name) => {
    try {
      await respondToTeachingRequest(id, 'Accepted', 'Accepted by educator • Onboarded');
      addToast(`${name} confirmed and accepted faculty invitation!`, 'success');
    } catch (e) {
      addToast(`Failed to mark as accepted`, 'error');
    }
  };

  const pendingInvitations = instructorRequests.filter(r => r.status.includes('Pending') || r.status === 'Invite Sent');


  return (
    <OrgLayout
      breadcrumbs={[{ label: 'Dashboard' }]}
      actions={
        <div className="flex items-center gap-2">
          <Link
            to="/org/courses/create"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Course</span>
          </Link>
          <Link
            to="/org/instructor-requests"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold transition-all border border-outline-variant"
          >
            <Send className="w-4 h-4 text-primary" />
            <span>Send Request</span>
          </Link>
        </div>
      }
    >
      <div className="space-y-8">
        
        {/* Top Hero Banner with Real Dynamic KPIs */}
        <section className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#312E81] text-white rounded-3xl p-6 md:p-8 shadow-elevation-2 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                {info.name || 'Organization'} Dashboard
              </h1>
            </div>
            {/* <div className="flex items-center gap-3">
              <Link
                to="/org/reports"
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors border border-white/20 flex items-center gap-2"
              >
                <span>Executive Reports</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div> */}
          </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/15">
              <Link to="/org/instructors" className="bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-2xl p-4 transition-all group">
                <span className="text-[10px] text-white/70 uppercase font-bold tracking-wider block">Faculty Members</span>
                <p className="text-2xl md:text-3xl font-black mt-1 group-hover:scale-105 transition-transform">{stats.totalInstructors}</p>
                <span className="text-[10px] text-emerald-300 font-semibold mt-1 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Accredited
                </span>
              </Link>

              <Link to="/org/learners" className="bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-2xl p-4 transition-all group">
                <span className="text-[10px] text-white/70 uppercase font-bold tracking-wider block">Active Learners</span>
                <p className="text-2xl md:text-3xl font-black mt-1 group-hover:scale-105 transition-transform">{stats.totalLearners.toLocaleString()}</p>
                <span className="text-[10px] text-emerald-300 font-semibold mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Enrolled learners
                </span>
              </Link>

              <Link to="/org/courses" className="bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-2xl p-4 transition-all group">
                <span className="text-[10px] text-white/70 uppercase font-bold tracking-wider block">Course Tracks</span>
                <p className="text-2xl md:text-3xl font-black mt-1 group-hover:scale-105 transition-transform">{stats.activeCourses}</p>
                <span className="text-[10px] text-[#C7D2FE] font-semibold mt-1 flex items-center gap-1">
                  <BookOpen className="w-3 h-3" /> Published courses
                </span>
              </Link>

              <div className="bg-white/10 rounded-2xl p-4 transition-all group">
                <span className="text-[10px] text-white/70 uppercase font-bold tracking-wider block">Gross Revenue YTD</span>
                <p className="text-2xl md:text-3xl font-black mt-1 group-hover:scale-105 transition-transform">₹{stats.annualRevenue.toLocaleString()}</p>
                <span className="text-[10px] text-emerald-300 font-semibold mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> ₹{stats.monthlyRevenue.toLocaleString()} this month
                </span>
              </div>

              <OrgAnalytics
                showDetails={false}
                showHeading={false}
                dashboardStyle
                inlineSummary
              />

              <Link to="/org/instructor-requests" className="bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-2xl p-4 transition-all group">
                <span className="text-[10px] text-white/70 uppercase font-bold tracking-wider block">Pending Faculty Requests</span>
                <p className="text-2xl md:text-3xl font-black mt-1 group-hover:scale-105 transition-transform">{pendingInvitations.length}</p>
                <span className="text-[10px] text-amber-300 font-semibold mt-1 flex items-center gap-1">
                  <Send className="w-3 h-3" /> Awaiting a response
                </span>
              </Link>
            </div>
        </section>

        {/* Faculty teaching requests and revenue overview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Right: Revenue Overview Interactive Line Graph (5 cols) */}
          <div className="lg:order-2 lg:col-span-5 lg:h-[460px] bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-elevation-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant mb-4">
                <div>
                  <h2 className="text-base font-bold text-on-surface">Revenue Overview</h2>
                  <p className="text-xs text-on-surface-variant">Live enrollment revenue by month</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center p-0.5 rounded-lg bg-surface-container-low border border-outline-variant text-[10px] font-bold">
                    <button type="button" onClick={() => setRevenueRange('6m')} className={`px-2 py-0.5 rounded-md transition-colors ${revenueRange === '6m' ? 'bg-primary text-white' : 'text-outline hover:text-on-surface'}`}>
                      6M
                    </button>
                    <button type="button" onClick={() => setRevenueRange('1y')} className={`px-2 py-0.5 rounded-md transition-colors ${revenueRange === '1y' ? 'bg-primary text-white' : 'text-outline hover:text-on-surface'}`}>
                      1Y
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
                <div>
                  <span className="text-[10px] text-outline uppercase font-bold tracking-wider block">Current Month Revenue</span>
                  <p className="text-2xl font-black text-on-surface">₹{currentMonthRevenue.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-semibold text-outline">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                    <span className="text-on-surface font-medium">Revenue Trend</span>
                  </span>
                </div>
              </div>

              {/* Live revenue graph derived from enrollment records and course prices */}
              <div className="relative flex gap-3 h-44 pt-1">
                <div className="flex flex-col justify-between text-[10px] font-semibold text-outline pb-5 select-none text-right w-10">
                  <span>₹{Math.round(yMax / 1000)}k</span>
                  <span>₹{Math.round(yMid / 1000)}k</span>
                  <span>₹{Math.round(yLow / 1000)}k</span>
                  <span>₹0</span>
                </div>

                <div className="flex-1 flex flex-col justify-between relative">
                  <svg viewBox="0 0 460 130" className="w-full h-36 overflow-visible" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="revAreaGradDash" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.28" />
                        <stop offset="80%" stopColor="#4F46E5" stopOpacity="0.04" />
                        <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.00" />
                      </linearGradient>
                    </defs>

                    <line x1="0" y1="5" x2="460" y2="5" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.8" />
                    <line x1="0" y1="45" x2="460" y2="45" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.8" />
                    <line x1="0" y1="85" x2="460" y2="85" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.8" />
                    <line x1="0" y1="125" x2="460" y2="125" stroke="#CBD5E1" strokeWidth="1" strokeOpacity="0.9" />

                    {/* Dynamic area fill */}
                    <path
                      d={revenueAreaPath}
                      fill="url(#revAreaGradDash)"
                    />

                    {/* Dynamic trend line */}
                    <path
                      d={revenueLinePath}
                      fill="none"
                      stroke="#4F46E5"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />

                    {revenueDataPoints.map((pt, i) => (
                      <g key={i} className="group cursor-pointer">
                        <circle cx={pt.cx} cy={pt.cy} r="4.5" fill="#FFFFFF" stroke="#4F46E5" strokeWidth="3" className="transition-transform group-hover:scale-150" />
                        <g className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <rect x={pt.cx - 24} y={pt.cy - 28} width="48" height="18" rx="4" fill="#0F172A" />
                          <text x={pt.cx} y={pt.cy - 16} fill="#FFFFFF" fontSize="9" fontWeight="700" textAnchor="middle">₹{pt.amount.toLocaleString()}</text>
                        </g>
                      </g>
                    ))}
                  </svg>

                  <div className="flex justify-between text-[10px] font-bold text-outline uppercase tracking-wider pt-1 px-1">
                    {revenueDataPoints.map((pt) => (
                      <span key={pt.month}>{pt.month}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-outline-variant/60 mt-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-outline uppercase font-bold tracking-wider">{revenueRange === '6m' ? 'Revenue in the last 6 months' : 'Revenue in the last 12 months'}</span>
                <p className="text-xl font-black text-primary">₹{selectedPeriodRevenue.toLocaleString()}</p>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-lg">
                Live from enrollments
              </span>
            </div>
          </div>

          {/* Faculty Course Teaching Requests */}
        <section className="lg:order-1 lg:col-span-7 lg:h-[460px] bg-surface-container-lowest border border-outline-variant rounded-3xl shadow-elevation-1 flex flex-col overflow-hidden">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6 py-5 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-outline-variant">
            <div className="min-w-0">
              <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shadow-sm">
                  <GraduationCap className="w-4 h-4" />
                </span>
                <span>Faculty Course Teaching Requests</span>
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold whitespace-nowrap">
                  {pendingInvitations.length} Awaiting Acceptance
                </span>
              </h2>
              <p className="text-xs text-on-surface-variant mt-1">Review faculty invitations and follow up on teaching assignments.</p>
            </div>
            <Link to="/org/instructor-requests" className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-container-lowest hover:bg-surface-container border border-outline-variant text-xs font-bold text-primary transition-colors whitespace-nowrap">
              <span>Manage requests</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-3 custom-scrollbar">
            {pendingInvitations.map((inv) => (
              <div key={inv.id} className="p-3.5 mb-2 last:mb-0 rounded-2xl border border-transparent hover:border-outline-variant hover:bg-surface-container-low transition-colors flex flex-col gap-4 sm:flex-row sm:items-center">
                <img src={inv.avatar} alt={inv.name} className="w-11 h-11 rounded-xl object-cover flex-none ring-2 ring-primary/10" />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <h3 className="font-bold text-sm text-on-surface">{inv.name}</h3>
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{inv.specialization || 'Faculty'}</span>
                  </div>
                  <p className="text-[11px] text-outline truncate">{inv.email}</p>
                  <p className="text-xs text-on-surface-variant mt-1 line-clamp-1">{inv.description || inv.bio || 'Teaching request awaiting a faculty response.'}</p>
                </div>

                <div className="flex items-center gap-2 sm:ml-auto">
                  <button
                    title="Resend teaching request email"
                    onClick={() => handleResendMail(inv.email)}
                    className="p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary border border-outline-variant transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <Link
                    to={`/org/instructor-requests/${inv.id}`}
                    className="py-2.5 px-3 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold text-center transition-colors whitespace-nowrap"
                  >
                    View details
                  </Link>
                </div>
              </div>
            ))}
            {pendingInvitations.length === 0 && (
              <div className="h-full min-h-44 flex flex-col items-center justify-center text-center p-6">
                <div className="w-10 h-10 rounded-2xl bg-surface-container flex items-center justify-center text-outline mb-3">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <p className="text-sm font-bold text-on-surface">No pending faculty requests</p>
                <p className="text-xs text-outline mt-1">New teaching invitations will appear here.</p>
              </div>
            )}
          </div>
        </section>

        </div>

        {/* Remaining organization analytics */}
        <OrgAnalytics showSummary={false} showHeading={false} />

      </div>
    </OrgLayout>
  );
}
