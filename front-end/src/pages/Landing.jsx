import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Users,
  Building2,
  ShieldCheck,
  Shield,
  Search,
  Compass,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ArrowRight,
  BookOpen,
  Star,
  Play,
  CheckCircle2,
  Award,
  Brain,
  Code,
  BarChart3,
  Cloud,
  Briefcase,
  Lock,
  Cpu,
  TrendingUp,
} from 'lucide-react';
import { api } from '../services/api';


export default function Landing() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [showAllFaqs, setShowAllFaqs] = useState(false);

  /**
   * Protected navigation interceptor for landing page buttons.
   * All Explore, Learn More, and Student entry actions from the landing page
   * safely navigate to /signin?role=Student, passing the intended destination in location state.
   */
  const handleProtectedNavigation = (e, destination) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    const target = destination || '/student/explore';
    navigate('/signin?role=Student', {
      state: { from: { pathname: target } },
    });
  };

  // Categories list
  const categories = [
    { name: 'All', icon: Compass, count: '200+' },
    { name: 'AI & Machine Learning', icon: Brain, count: '48' },
    { name: 'Computer Science', icon: Code, count: '62' },
    { name: 'Data Science & Analytics', icon: BarChart3, count: '35' },
    { name: 'Cloud Architecture & DevOps', icon: Cloud, count: '28' },
    { name: 'Business Leadership', icon: Briefcase, count: '40' },
    { name: 'Cybersecurity', icon: Lock, count: '18' },
  ];

  // Default rich curated cards matching the Stitch design
  const defaultCards = [
    {
      id: 'crs-1',
      title: 'Machine Learning Specialization',
      category: 'AI & Machine Learning',
      institution: 'STANFORD ONLINE',
      instructorName: 'Andrew Ng & Stanford Team',
      rating: 4.9,
      reviewCount: '18,400',
      totalHours: '32 hours',
      level: 'Intermediate',
      badge: 'Specialization',
      badgeIcon: 'workspace_premium',
      techPill: 'Neural Networks • PyTorch',
      gradient: 'from-[#002D7A] via-[#0056D2] to-[#3B82F6]',
      iconName: 'neurology',
      gridType: 'grid-ml',
    },
    {
      id: 'crs-2',
      title: 'Cloud Architecture & Kubernetes',
      category: 'Cloud Architecture & DevOps',
      institution: 'GOOGLE CLOUD ACADEMY',
      instructorName: 'Maya Lin, Lead Systems Architect',
      rating: 4.88,
      reviewCount: '12,150',
      totalHours: '26 hours',
      level: 'Advanced',
      badge: 'Certificate',
      badgeIcon: 'verified',
      techPill: 'K8s • Microservices',
      gradient: 'from-[#1E1B4B] via-[#4338CA] to-[#6366F1]',
      iconName: 'cloud_sync',
      gridType: 'grid-cloud',
    },
    {
      id: 'crs-3',
      title: 'Full Stack Modern Web Engineering',
      category: 'Computer Science',
      institution: 'MITX OPEN LEARNING',
      instructorName: 'David J. Malan & CS Faculty',
      rating: 4.92,
      reviewCount: '24,800',
      totalHours: '40 hours',
      level: 'Beginner',
      badge: 'Certificate',
      badgeIcon: 'code',
      techPill: 'React • Node • TypeScript',
      gradient: 'from-[#064E3B] via-[#059669] to-[#10B981]',
      iconName: 'terminal',
      gridType: 'grid-code',
    },
    {
      id: 'crs-4',
      title: 'Applied Data Science with Python',
      category: 'Data Science & Analytics',
      institution: 'IBM SKILLS NETWORK',
      instructorName: 'Elena Rostova, Senior Data Scientist',
      rating: 4.85,
      reviewCount: '9,420',
      totalHours: '28 hours',
      level: 'Intermediate',
      badge: 'Specialization',
      badgeIcon: 'insights',
      techPill: 'Pandas • SQL • Analytics',
      gradient: 'from-[#0C4A6E] via-[#0284C7] to-[#0EA5E9]',
      iconName: 'query_stats',
      gridType: 'grid-data',
    },
    {
      id: 'crs-5',
      title: 'Cybersecurity Threat Defense & Zero Trust',
      category: 'Cybersecurity',
      institution: 'DEEPLEARN INSTITUTE',
      instructorName: 'Marcus Vance, CISO Advisor',
      rating: 4.89,
      reviewCount: '7,310',
      totalHours: '22 hours',
      level: 'Advanced',
      badge: 'Certificate',
      badgeIcon: 'security',
      techPill: 'Zero Trust • SIEM Defense',
      gradient: 'from-[#4C0519] via-[#881337] to-[#BE123C]',
      iconName: 'encrypted',
      gridType: 'grid-sec',
    },
    {
      id: 'crs-6',
      title: 'Strategic Tech Leadership & AI Ethics',
      category: 'Business Leadership',
      institution: 'IMPERIAL COLLEGE LONDON',
      instructorName: 'Prof. Alan Sterling, Dean',
      rating: 4.91,
      reviewCount: '5,890',
      totalHours: '18 hours',
      level: 'All Levels',
      badge: 'Executive',
      badgeIcon: 'military_tech',
      techPill: 'Strategy • Governance • AI',
      gradient: 'from-[#451A03] via-[#78350F] to-[#B45309]',
      iconName: 'corporate_fare',
      gridType: 'grid-circles',
    },
  ];

  // FAQs list
  const faqs = [
    {
      q: 'How does the 7-day free trial work?',
      a: 'You get complete, unrestricted access to all 200+ courses, labs, and interactive sessions for 7 days. If you cancel before the trial ends, you will not be billed.',
    },
    {
      q: 'Are the certificates recognized and shareable on LinkedIn?',
      a: 'Yes. Every credential issued by EduSphere carries a unique cryptographic ID and 1-click LinkedIn badge integration verified by partnering academic faculties.',
    },
    {
      q: 'Can I cancel my subscription anytime?',
      a: 'Absolutely. You can cancel your subscription from your billing dashboard with 1 click anytime without cancellation penalties or hidden fees.',
    },
    {
      q: 'Does EduSphere provide enterprise invoicing and team reporting?',
      a: 'Yes, our Teams and Enterprise tiers support GST invoicing, PO payment terms, SSO integrations, and team progress analytics.',
    },
    {
      q: 'How do educator royalties and university accreditation work?',
      a: 'EduSphere partners directly with faculty and academic institutions through revenue-sharing models governed by university research agreements.',
    },
    {
      q: 'Can I switch between the Student, Instructor, and Admin portals?',
      a: 'Yes, you can utilize the Quick Access Portal Switcher on the top ribbon to seamlessly navigate across your authenticated roles.',
    },
    {
      q: 'Are courses self-paced or do they have fixed schedule deadlines?',
      a: 'All courses are 100% self-paced with lifetime access to materials, video recordings, and code repositories.',
    },
    {
      q: 'Can I download videos and course materials for offline study?',
      a: 'Yes, our student mobile and desktop player allows downloading course modules, lecture slides, and practice labs for offline study.',
    },
  ];

  useEffect(() => {
    const id = 'material-symbols-font';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href =
        'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200';
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    async function loadCourses() {
      try {
        setLoadingCourses(true);
        const data = await api.courses.list();
        if (data && Array.isArray(data) && data.length > 0) {
          setCourses(data);
        }
      } catch (err) {
        console.warn('Using default featured courses for landing page:', err.message);
      } finally {
        setLoadingCourses(false);
      }
    }
    loadCourses();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const filteredCards = defaultCards.filter((card) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      card.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      (selectedCategory === 'AI & Machine Learning' && card.category.includes('AI'));

    const matchesSearch =
      !searchQuery.trim() ||
      card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.instructorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.institution.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const displayedFaqs = showAllFaqs ? faqs : faqs.slice(0, 6);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] antialiased selection:bg-[#0056D2] selection:text-white flex flex-col justify-between font-sans">
      {/* ────────────────────────────────────────────────────────────── */}
      {/* 1. TOP RIBBON: Quick Access Portal Switcher (h-10)             */}
      {/* ────────────────────────────────────────────────────────────── */}
      <aside className="h-10 w-full bg-[#FFFFFF] border-b border-[#E2E8F0] px-8 sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto h-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#475569]">
              QUICK ACCESS PORTALS:
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/signin?role=Student"
              onClick={(e) => handleProtectedNavigation(e, '/student')}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">school</span> STUDENT
            </a>
            <Link
              to="/instructor"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors"
            >
              <span className="material-symbols-outlined text-[15px]">group</span> INSTRUCTOR
            </Link>
            <Link
              to="/org/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold hover:bg-purple-100 transition-colors"
            >
              <span className="material-symbols-outlined text-[15px]">apartment</span> ORGANISATION
            </Link>
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 transition-colors"
            >
              <span className="material-symbols-outlined text-[15px]">verified_user</span> ADMIN
            </Link>
            <Link
              to="/super-admin/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold hover:bg-amber-100 transition-colors"
            >
              <span className="material-symbols-outlined text-[15px]">security</span> SUPER ADMIN
            </Link>
          </div>
        </div>
      </aside>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* 2. MAIN NAVBAR (80px height, sticky top-10)                   */}
      {/* ────────────────────────────────────────────────────────────── */}
      <header className="h-20 w-full bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-8 sticky top-10 z-40">
        <div className="max-w-[1440px] mx-auto h-full flex items-center justify-between gap-6">
          {/* Left: Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0056D2] to-[#2563EB] flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <span className="material-symbols-outlined text-[24px]">school</span>
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-xl font-bold tracking-tight text-[#0F172A] leading-none">
                  Edu<span className="text-[#0056D2]">Sphere</span>
                </span>
                <span className="text-[11px] text-[#64748B] font-medium tracking-normal mt-0.5">
                  Learn Without Limits
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Search Input */}
          <div className="flex-1 max-w-md">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
              <span className="material-symbols-outlined absolute left-3.5 text-slate-400 text-[20px]">
                search
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-11 pr-24 rounded-full bg-white border border-[#E2E8F0] text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-[#0056D2] focus:ring-2 focus:ring-blue-100 transition-all"
                placeholder="What do you want to learn today? (e.g., AI, React, Cloud)"
                type="text"
              />
              <button
                type="submit"
                className="absolute right-1.5 px-3 py-1.5 rounded-full bg-[#0056D2] hover:bg-[#00419E] text-white text-xs font-semibold shadow-sm transition-colors"
              >
                Search
              </button>
            </form>
          </div>

          {/* Right: Links & Actions */}
          <div className="flex items-center gap-4">
            <a
              href="/signin?role=Student"
              onClick={(e) => handleProtectedNavigation(e, '/student')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">school</span> Student Portal
            </a>
            <a
              href="#catalog-section"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Courses
            </a>
            <Link
              to="/organization/landing"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              For Enterprise
            </Link>
            <div className="h-6 w-px bg-slate-200"></div>
            <Link
              to="/signin"
              className="text-sm font-semibold text-slate-700 hover:text-[#0056D2] px-3 py-2 transition-colors"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2.5 rounded-xl bg-[#0056D2] hover:bg-[#00419E] text-white text-sm font-semibold shadow-md shadow-blue-500/20 transition-all"
            >
              Join for Free
            </Link>
          </div>
        </div>
      </header>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* 3. HERO SECTION (12-Column Split: 7 Cols Left, 5 Cols Right)   */}
      {/* ────────────────────────────────────────────────────────────── */}
      <section className="relative w-full max-w-[1440px] mx-auto px-8 pt-16 pb-20 overflow-hidden">
        {/* Subtle ambient lighting */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute -top-10 right-10 w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="grid grid-cols-12 gap-10 items-center">
          {/* Left Column (7 cols) */}
          <div className="col-span-7 flex flex-col items-start pr-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFF6FF] border border-blue-200/60 shadow-sm mb-6">
              <span className="text-sm">✨</span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0056D2]">
                Online Learning Platform
              </span>
            </div>
            <h1 className="font-heading text-5xl font-extrabold tracking-tight text-[#0F172A] leading-[1.12] mb-6">
              Master In-Demand Skills. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0056D2] via-[#2563EB] to-[#4F46E5]">
                Advance Your Career.
              </span>
            </h1>
            <p className="text-lg text-[#475569] max-w-xl leading-relaxed mb-8">
              Learn from leading institutions and instructors with self-paced courses, hands-on projects, and verified credentials.
            </p>
            {/* CTA Buttons */}
            <div className="flex items-center gap-4 mb-10 w-full">
              <Link
                to="/signup"
                className="px-7 py-4 rounded-xl bg-[#0056D2] hover:bg-[#00419E] text-white font-semibold text-base shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all hover:-translate-y-0.5"
              >
                <span>Join EduSphere for Free</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </Link>
              <a
                href="/signin?role=Student"
                onClick={(e) => handleProtectedNavigation(e, '/student/explore')}
                className="px-6 py-4 rounded-xl bg-white border border-[#E2E8F0] hover:bg-slate-50 text-[#0F172A] font-semibold text-base shadow-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px] text-[#0056D2]">menu_book</span>
                <span>Explore Courses</span>
              </a>
            </div>
            {/* Trust Metrics Strip */}
            <div className="w-full grid grid-cols-3 gap-6 pt-8 border-t border-[#E2E8F0]">
              <div>
                <div className="font-heading text-3xl font-extrabold text-[#0F172A]">120K+</div>
                <div className="text-xs font-medium text-[#64748B] uppercase tracking-wider mt-0.5">
                  Enrolled Learners
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-heading text-3xl font-extrabold text-[#0F172A]">
                  <span>4.9</span>
                  <span className="material-symbols-outlined fill-icon text-amber-500 text-[26px]">star</span>
                </div>
                <div className="text-xs font-medium text-[#64748B] uppercase tracking-wider mt-0.5">
                  Average Rating
                </div>
              </div>
              <div>
                <div className="font-heading text-3xl font-extrabold text-emerald-600">100%</div>
                <div className="text-xs font-medium text-[#64748B] uppercase tracking-wider mt-0.5">
                  Online &amp; Self-Paced
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Live Active Session Interactive Preview Card */}
          <div className="col-span-5 relative">
            <div className="relative rounded-2xl bg-white border border-[#E2E8F0] shadow-xl p-6 transition-transform hover:-translate-y-1 duration-300 w-full">
              {/* Top Badges */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                    Live Active Session
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-blue-50 text-[#0056D2] font-semibold text-xs border border-blue-100">
                  Stanford Online Partner
                </span>
              </div>
              {/* Video Thumbnail Container */}
              <div
                onClick={(e) => handleProtectedNavigation(e, '/student/explore')}
                className="relative mt-4 h-52 rounded-xl bg-slate-900 overflow-hidden flex flex-col justify-between p-4 group cursor-pointer shadow-inner"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-500"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&auto=format&fit=crop&q=80')`,
                  }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent"></div>
                <div className="relative z-10 self-end px-2 py-0.5 rounded bg-black/70 backdrop-blur text-white text-xs font-mono">
                  42:15 / 55:00
                </div>
                <div className="relative z-10 self-center my-auto w-12 h-12 rounded-full bg-[#0056D2] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined fill-icon text-[24px]">play_arrow</span>
                </div>
                <div className="relative z-10">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300">
                    Machine Learning Specialization
                  </span>
                  <p className="text-sm font-semibold text-white leading-tight mt-0.5">
                    Module 3 of 5: Transformer Attention &amp; PyTorch Implementations
                  </p>
                </div>
              </div>
              {/* Interactive Progress Gauge */}
              <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700">Specialization Progress</span>
                  <span className="text-[#0056D2]">78% Complete</span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#0056D2] to-[#2563EB] rounded-full" style={{ width: '78%' }}></div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 mt-2.5">
                  <span className="flex items-center gap-1 font-medium text-emerald-700">
                    <span className="material-symbols-outlined fill-icon text-[15px] text-emerald-600">
                      check_circle
                    </span>
                    14 Lessons Mastered
                  </span>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-[#0056D2] font-semibold text-[11px]">
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                    Verified Certificate Pending
                  </span>
                </div>
              </div>
              {/* Instructor Footer */}
              <div className="mt-4 pt-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#0056D2] text-white font-bold text-xs flex items-center justify-center shadow-sm">
                    SJ
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-900">Dr. Sarah Jenkins</span>
                    <span className="text-[11px] text-slate-500">Stanford AI Lab Faculty</span>
                  </div>
                </div>
                <a
                  href="/signin?role=Student"
                  onClick={(e) => handleProtectedNavigation(e, '/student/explore')}
                  className="text-xs font-bold text-[#0056D2] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  View Curriculum <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* 4. PARTNER INSTITUTIONS & ACCREDITATION BAR                    */}
      {/* ────────────────────────────────────────────────────────────── */}
      <section className="w-full bg-white border-y border-[#E2E8F0] py-10 px-8">
        <div className="max-w-[1440px] mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#64748B]">
              We collaborate with 150+ leading universities &amp; enterprise organizations
            </h2>
          </div>
          {/* 6 Clean Desktop Cards */}
          <div className="grid grid-cols-6 gap-4">
            <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200/60 transition-all text-center">
              <span className="text-2xl mb-1">🏛️</span>
              <span className="text-sm font-bold text-slate-800">Stanford</span>
              <span className="text-xs text-slate-500">Top Academic Partner</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200/60 transition-all text-center">
              <span className="text-2xl mb-1">🔬</span>
              <span className="text-sm font-bold text-slate-800">MITx</span>
              <span className="text-xs text-slate-500">Pioneer in Engineering</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200/60 transition-all text-center">
              <span className="text-2xl mb-1">☁️</span>
              <span className="text-sm font-bold text-slate-800">Google Cloud</span>
              <span className="text-xs text-slate-500">Industry Certification</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200/60 transition-all text-center">
              <span className="text-2xl mb-1">💻</span>
              <span className="text-sm font-bold text-slate-800">IBM Tech</span>
              <span className="text-xs text-slate-500">Enterprise AI &amp; Data</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200/60 transition-all text-center">
              <span className="text-2xl mb-1">🎓</span>
              <span className="text-sm font-bold text-slate-800">Imperial College</span>
              <span className="text-xs text-slate-500">Global Research</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200/60 transition-all text-center">
              <span className="text-2xl mb-1">⚡</span>
              <span className="text-sm font-bold text-slate-800">DeepLearn AI</span>
              <span className="text-xs text-slate-500">Specialized Neural Nets</span>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* 5. INTERACTIVE COURSE CATALOG & FILTER (ID: catalog-section)   */}
      {/* ────────────────────────────────────────────────────────────── */}
      <section className="w-full max-w-[1440px] mx-auto px-8 py-20" id="catalog-section">
        <div className="flex flex-col gap-8">
          {/* Section Header */}
          <div className="flex items-end justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0056D2]">
                Explore Programs
              </span>
              <h2 className="font-heading text-3xl font-extrabold text-[#0F172A] mt-1">
                Explore Courses &amp; Specializations
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Acquire job-ready engineering and executive credentials taught by globally recognized professors.
              </p>
            </div>
            <a
              href="/signin?role=Student"
              onClick={(e) => handleProtectedNavigation(e, '/student/explore')}
              className="text-xs font-bold text-[#0056D2] hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
            >
              See Full 200+ Course Catalog{' '}
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </a>
          </div>

          {/* Horizontal Category Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
            {categories.map((cat, idx) => {
              const isSelected = selectedCategory === cat.name;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-5 py-2.5 rounded-full text-xs whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-[#0056D2] text-white font-bold shadow-sm'
                      : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* 3-Column Desktop Course Cards Grid (6 Cards) */}
          <div className="grid grid-cols-3 gap-8">
            {filteredCards.map((card, idx) => (
              <div
                key={card.id || idx}
                className="rounded-2xl bg-white border border-[#E2E8F0] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1"
              >
                {/* Visual Header */}
                <div
                  onClick={(e) => handleProtectedNavigation(e, `/student/course/${card.id}`)}
                  className={`relative h-44 w-full bg-gradient-to-br ${card.gradient} overflow-hidden flex items-center justify-center border-b border-blue-100 cursor-pointer`}
                >
                  <svg
                    className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <pattern id={`pattern-${idx}`} width="24" height="24" patternUnits="userSpaceOnUse">
                        <path d="M 24 0 L 0 0 0 24" fill="none" stroke="white" strokeWidth="0.75" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill={`url(#pattern-${idx})`} />
                  </svg>
                  <div className="absolute -right-8 -top-8 w-44 h-44 rounded-full bg-blue-300/20 blur-2xl pointer-events-none"></div>
                  <div className="absolute -left-6 -bottom-6 w-36 h-36 rounded-full bg-indigo-500/25 blur-xl pointer-events-none"></div>
                  <div className="relative z-10 flex flex-col items-center justify-center text-center p-3">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/25 shadow-lg flex items-center justify-center text-white mb-1.5 group-hover:scale-110 transition-all duration-300">
                      <span className="material-symbols-outlined text-3xl text-blue-100">
                        {card.iconName}
                      </span>
                    </div>
                    <span className="text-[11px] tracking-wider uppercase font-mono font-semibold text-blue-200/90">
                      {card.techPill}
                    </span>
                  </div>
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-md text-[#0056D2] text-[11px] font-bold shadow-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px] text-[#0056D2]">
                      {card.badgeIcon}
                    </span>{' '}
                    {card.badge}
                  </div>
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-900/70 backdrop-blur-md border border-white/10 text-white text-[11px] font-medium tracking-wide">
                    {card.level}
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-6 flex flex-col flex-1 justify-between">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0056D2]">
                      {card.institution}
                    </span>
                    <h3
                      onClick={(e) => handleProtectedNavigation(e, `/student/course/${card.id}`)}
                      className="font-heading text-lg font-bold text-[#0F172A] mt-1 leading-snug cursor-pointer hover:text-[#0056D2] transition-colors"
                    >
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Instructor: {card.instructorName}</p>
                  </div>
                  <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <span className="material-symbols-outlined fill-icon text-amber-500 text-[16px]">
                        star
                      </span>
                      <span className="font-bold text-slate-900">{card.rating}</span>
                      <span>({card.reviewCount})</span>
                      <span>•</span>
                      <span>{card.totalHours}</span>
                    </div>
                    <a
                      href="/signin?role=Student"
                      onClick={(e) => handleProtectedNavigation(e, `/student/course/${card.id}`)}
                      className="text-xs font-bold text-[#0056D2] hover:text-[#00419E] flex items-center gap-0.5 cursor-pointer"
                    >
                      Enroll &amp; Learn More{' '}
                      <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* 6. SUBSCRIBER TESTIMONIALS SECTION                             */}
      {/* ────────────────────────────────────────────────────────────── */}
      <section className="w-full bg-white border-y border-[#E2E8F0] py-20 px-8">
        <div className="max-w-[1440px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="font-heading text-3xl font-extrabold text-[#0F172A]">
              Is EduSphere Plus worth it? Hear from subscribers
            </h2>
            <p className="text-base text-slate-500 mt-2">
              Over 120,000 professionals and students have accelerated their careers.
            </p>
          </div>
          {/* 3 Desktop Testimonial Cards */}
          <div className="grid grid-cols-3 gap-8 items-stretch">
            {/* Testimonial 1 */}
            <div className="p-8 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex text-amber-500 gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined fill-icon text-[18px]">
                      star
                    </span>
                  ))}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed italic">
                  &ldquo;I have a full-time job and 3 kids. The flexibility motivated me to achieve my goals without compromising family time.&rdquo;
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-900">Abigail P.</div>
                  <div className="text-xs text-slate-500">Product Lead &amp; Lifelong Learner</div>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <span className="material-symbols-outlined text-[13px]">check_circle</span> Active Student
                </span>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="p-8 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex text-amber-500 gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined fill-icon text-[18px]">
                      star
                    </span>
                  ))}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed italic">
                  &ldquo;With each course, I&apos;m getting more value out of my subscription. Hands-on labs made complex transformer architectures intuitive.&rdquo;
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-900">Warner K.</div>
                  <div className="text-xs text-slate-500">AI Researcher &amp; Data Engineer</div>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <span className="material-symbols-outlined text-[13px]">check_circle</span> Active Student
                </span>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="p-8 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex text-amber-500 gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined fill-icon text-[18px]">
                      star
                    </span>
                  ))}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed italic">
                  &ldquo;I can try any course and switch to another one for no additional cost. The university accredited certificates are verified instantly on LinkedIn.&rdquo;
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-900">Swapna N.</div>
                  <div className="text-xs text-slate-500">Cloud Architect &amp; Educator</div>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <span className="material-symbols-outlined text-[13px]">check_circle</span> Active Student
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* 7. FREQUENTLY ASKED QUESTIONS (Accordion)                     */}
      {/* ────────────────────────────────────────────────────────────── */}
      <section className="w-full max-w-[1440px] mx-auto px-8 pb-20 pt-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-heading text-3xl font-extrabold text-[#0F172A]">
              Frequently asked questions
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Everything you need to know about EduSphere subscriptions and certificates.
            </p>
          </div>
          <div className="divide-y divide-slate-200 border-y border-slate-200">
            {displayedFaqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="py-5">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between cursor-pointer text-left group"
                  >
                    <span className="font-semibold text-sm text-slate-900 group-hover:text-[#0056D2] transition-colors">
                      {faq.q}
                    </span>
                    <span
                      className={`material-symbols-outlined text-slate-400 text-[20px] transition-transform ${
                        isOpen ? 'rotate-180 text-[#0056D2]' : ''
                      }`}
                    >
                      expand_more
                    </span>
                  </button>
                  {isOpen && (
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed animate-fadeIn">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => setShowAllFaqs(!showAllFaqs)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0056D2] hover:underline"
            >
              <span>
                {showAllFaqs ? 'Show fewer questions' : `Show all ${faqs.length} frequently asked questions`}
              </span>
              <span
                className={`material-symbols-outlined text-[16px] transition-transform ${
                  showAllFaqs ? 'rotate-180' : ''
                }`}
              >
                expand_more
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* 8. PRE-FOOTER BANNER & 5-COLUMN FOOTER                         */}
      {/* ────────────────────────────────────────────────────────────── */}
      <section className="w-full bg-[#00419E] py-12 px-8 text-white">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <div>
            <h2 className="font-heading text-2xl font-bold">
              Start in minutes today. Build skills this week.
            </h2>
            <p className="text-xs text-blue-200 mt-1">
              Join over 120,000 engineers and leaders advancing their careers.
            </p>
          </div>
          <Link
            to="/signup"
            className="px-6 py-3 rounded-xl bg-white text-[#0056D2] font-bold text-sm shadow hover:bg-slate-50 transition-colors"
          >
            Get Started for Free
          </Link>
        </div>
      </section>

      {/* 5-Column Desktop Footer */}
      <footer className="w-full bg-white border-t border-[#E2E8F0] pt-16 pb-12 px-8">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-5 gap-10 pb-12 border-b border-slate-200">
            {/* Col 1: Skills */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
                Skills
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-500">
                <li>
                  <a
                    href="/signin?role=Student"
                    onClick={(e) => handleProtectedNavigation(e, '/student/explore')}
                    className="hover:text-[#0056D2] transition-colors cursor-pointer"
                  >
                    Accounting &amp; Finance
                  </a>
                </li>
                <li>
                  <a
                    href="/signin?role=Student"
                    onClick={(e) => handleProtectedNavigation(e, '/student/explore')}
                    className="hover:text-[#0056D2] transition-colors cursor-pointer"
                  >
                    Artificial Intelligence
                  </a>
                </li>
                <li>
                  <a
                    href="/signin?role=Student"
                    onClick={(e) => handleProtectedNavigation(e, '/student/explore')}
                    className="hover:text-[#0056D2] transition-colors cursor-pointer"
                  >
                    Cybersecurity Threat Hunting
                  </a>
                </li>
                <li>
                  <a
                    href="/signin?role=Student"
                    onClick={(e) => handleProtectedNavigation(e, '/student/explore')}
                    className="hover:text-[#0056D2] transition-colors cursor-pointer"
                  >
                    Data Analytics with Python
                  </a>
                </li>
                <li>
                  <a
                    href="/signin?role=Student"
                    onClick={(e) => handleProtectedNavigation(e, '/student/explore')}
                    className="hover:text-[#0056D2] transition-colors cursor-pointer"
                  >
                    Cloud DevOps &amp; SRE
                  </a>
                </li>
                <li>
                  <a
                    href="/signin?role=Student"
                    onClick={(e) => handleProtectedNavigation(e, '/student/explore')}
                    className="hover:text-[#0056D2] transition-colors cursor-pointer"
                  >
                    Full Stack Web Engineering
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 2: Professional Certificates */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
                Certificates
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-500">
                <li>
                  <a
                    href="/signin?role=Student"
                    onClick={(e) => handleProtectedNavigation(e, '/student/explore')}
                    className="hover:text-[#0056D2] transition-colors cursor-pointer"
                  >
                    Google Cloud Architect
                  </a>
                </li>
                <li>
                  <a
                    href="/signin?role=Student"
                    onClick={(e) => handleProtectedNavigation(e, '/student/explore')}
                    className="hover:text-[#0056D2] transition-colors cursor-pointer"
                  >
                    Google Cybersecurity Spec
                  </a>
                </li>
                <li>
                  <a
                    href="/signin?role=Student"
                    onClick={(e) => handleProtectedNavigation(e, '/student/explore')}
                    className="hover:text-[#0056D2] transition-colors cursor-pointer"
                  >
                    IBM Data Scientist
                  </a>
                </li>
                <li>
                  <a
                    href="/signin?role=Student"
                    onClick={(e) => handleProtectedNavigation(e, '/student/explore')}
                    className="hover:text-[#0056D2] transition-colors cursor-pointer"
                  >
                    Stanford Machine Learning
                  </a>
                </li>
                <li>
                  <a
                    href="/signin?role=Student"
                    onClick={(e) => handleProtectedNavigation(e, '/student/explore')}
                    className="hover:text-[#0056D2] transition-colors cursor-pointer"
                  >
                    AWS Solutions Architect
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3: Courses & Specializations */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
                Specializations
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-500">
                <li>
                  <a
                    href="/signin?role=Student"
                    onClick={(e) => handleProtectedNavigation(e, '/student/explore')}
                    className="hover:text-[#0056D2] transition-colors cursor-pointer"
                  >
                    AI Essentials for Leaders
                  </a>
                </li>
                <li>
                  <a
                    href="/signin?role=Student"
                    onClick={(e) => handleProtectedNavigation(e, '/student/explore')}
                    className="hover:text-[#0056D2] transition-colors cursor-pointer"
                  >
                    Deep Learning &amp; PyTorch
                  </a>
                </li>
                <li>
                  <a
                    href="/signin?role=Student"
                    onClick={(e) => handleProtectedNavigation(e, '/student/explore')}
                    className="hover:text-[#0056D2] transition-colors cursor-pointer"
                  >
                    Financial Markets &amp; Quant
                  </a>
                </li>
                <li>
                  <a
                    href="/signin?role=Student"
                    onClick={(e) => handleProtectedNavigation(e, '/student/explore')}
                    className="hover:text-[#0056D2] transition-colors cursor-pointer"
                  >
                    Kubernetes Enterprise Ops
                  </a>
                </li>
                <li>
                  <a
                    href="/signin?role=Student"
                    onClick={(e) => handleProtectedNavigation(e, '/student/explore')}
                    className="hover:text-[#0056D2] transition-colors cursor-pointer"
                  >
                    Zero-Trust Network Defense
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 4: Career Resources */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
                Career Resources
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-500">
                <li>
                  <a
                    href="/signin?role=Student"
                    onClick={(e) => handleProtectedNavigation(e, '/student/explore')}
                    className="hover:text-[#0056D2] transition-colors cursor-pointer"
                  >
                    Career Assessment Test
                  </a>
                </li>
                <li>
                  <a
                    href="/signin?role=Student"
                    onClick={(e) => handleProtectedNavigation(e, '/student/explore')}
                    className="hover:text-[#0056D2] transition-colors cursor-pointer"
                  >
                    CompTIA Security+ Prep
                  </a>
                </li>
                <li>
                  <a
                    href="/signin?role=Student"
                    onClick={(e) => handleProtectedNavigation(e, '/student/explore')}
                    className="hover:text-[#0056D2] transition-colors cursor-pointer"
                  >
                    IT Certifications Roadmap
                  </a>
                </li>
                <li>
                  <a
                    href="/signin?role=Student"
                    onClick={(e) => handleProtectedNavigation(e, '/student/explore')}
                    className="hover:text-[#0056D2] transition-colors cursor-pointer"
                  >
                    Resume &amp; Portfolio Review
                  </a>
                </li>
                <li>
                  <a
                    href="/signin?role=Student"
                    onClick={(e) => handleProtectedNavigation(e, '/student/explore')}
                    className="hover:text-[#0056D2] transition-colors cursor-pointer"
                  >
                    LinkedIn Credential Sync
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 5: Portals & Gateways */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
                Portals &amp; Gateways
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a
                    href="/signin?role=Student"
                    onClick={(e) => handleProtectedNavigation(e, '/student')}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[13px]">school</span> STUDENT PORTAL
                  </a>
                </li>
                <li>
                  <Link
                    to="/instructor"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-50 text-blue-800 font-bold hover:bg-blue-100 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[13px]">group</span> EDUCATOR STUDIO
                  </Link>
                </li>
                <li>
                  <Link
                    to="/organization/landing"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-purple-50 text-purple-800 font-bold hover:bg-purple-100 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[13px]">apartment</span> ORGANIZATION PORTAL
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-50 text-indigo-800 font-bold hover:bg-indigo-100 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[13px]">verified_user</span> ADMIN CENTER
                  </Link>
                </li>
                <li>
                  <Link
                    to="/super-admin/dashboard"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 text-amber-800 font-bold hover:bg-amber-100 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[13px]">security</span> SUPER ADMIN PORTAL
                  </Link>
                </li>
                <li className="pt-2 text-slate-600">
                  <Link to="/signin" className="hover:text-[#0056D2] font-semibold">
                    Sign In
                  </Link>{' '}
                  •{' '}
                  <Link to="/signup" className="hover:text-[#0056D2] font-semibold">
                    Create Account
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 flex items-center justify-between text-xs text-slate-500">
            <div>&copy; 2026 EduSphere Global Inc. All rights reserved.</div>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="hover:text-slate-800 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-slate-800 transition-colors">
                Terms of Service
              </Link>
              <Link to="/honor-code" className="hover:text-slate-800 transition-colors">
                Honor Code
              </Link>
              <a
                href="#catalog-section"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Cookie preferences updated.');
                }}
                className="hover:text-slate-800 transition-colors"
              >
                Cookie Preferences
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
