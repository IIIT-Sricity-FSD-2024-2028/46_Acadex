// =========================================================================================
// FDFED M2026 - Student Individual Contribution
// Module: Verified Digital Certificates & Academic Credential Ledger
// Design: Stitch Academic Precision (Desktop Layout) - NexusPay Learning
// Author: Student Portal Implementation | IIIT Sri City
// =========================================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Award, 
  ExternalLink, 
  Search,
  Bookmark,
  RotateCcw,
  Share2,
  CheckCircle,
  Linkedin
} from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import CertificateModal from '../../components/common/CertificateModal';
import { useToast } from '../../components/common/Toast';
import api from '../../services/api';

const CATEGORIES = ['All', 'Course Certificates', 'Specializations', 'Professional Certificates'];

const CERTIFICATE_PREVIEWS = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAFUFMpxaYpnB7YbyjsY0_5q1c6Tfm2NJ9hagoK4AJ4fxocSuKKhNcK8ulP2ORjVxZET-fZCnDTub5y3RU0ktfm_nNhzsDqvFtrxvdr9lcqQHJA9pTarIBfQ_Kv5CeXXm04nd7G_X1xhSjd8bhpxC9LJgc0Yb8iQ0vOh7DLZkZbh_h0ZmW2q1bDsJSnKMIZKLU9DMIoKX-G79q4_BYmnDR-fMHDlcc64dl6GFB8fn9azPoFS37WSaTRXMgVB-K9NHBdOgNGIC5lTfvr',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBbWo_3EV1qholRg_5dAzsHZ0qDx5i6iKJNHN9OTErpnVHtZ2owHKyj-lhnd_IxDIM5W-hEFJH2XQPAjY8Rj99-u-GOl67wzvjvJ2tURpRkFgx56kMtcKKUVYPxVFyt02HhoE3xOnIeThkFS-_l6r2Zqh6z67UKU2H06GNoz_QbpWq5nANC7xcn_ci4u4ZUJPp0jT1iD7gk9E5m9d4bEs1n-Bp9xy9JZgxHx7506_DnmJTgjghp3tJuaW28-0V3EUomUpDM-H4jgTej',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBme0HhpMofbQXObnJkkggswScmZEDjh7WWXcf3C4C7D9WeireXI1IJeKOwj5dwCEV7lISAh3WCs0QFId0qT9vitXFtZ9jORTpugsZFNz7CASNUQgScb6D9K79v3lPzjR-HI3-4Jk2u0219wq127M9YIJZq65ej7FnBT6Ozkm7ALVoMJTeXHzVCHidbeJ1yig_kI_5Mqw1fBVTabGMw97miQI8TrpU8-L91jlGYAr_h1lQtN6OhIdCZH9Pk6KB0otaHo9MBWIWJ1FGh'
];

const INSTITUTION_LOGOS = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCl14WMWxJtMRcgECUtYTjmFtcb3REmqDqhuEaS3tCTBgbptx9-dZYQb6NBVB8IpDzBgq1hDdrcka79_FP5q40d-EHJ85EuseuEOPldxiqmFRr6cuIwGjtgFPGKObLGhp_4LoOVV46-uWCMMtyxS7NBxvffI59xgiUM-YMCHm0QcMRCtKvOjjyHcptXe97hHiCCGqU2vmAFH0AWd8FH6JH5yiTRsJJqBSeeJXb_Z4fdUQoGnhk8Z72Z_vCtbla_rB5WVSA21THzYO-2',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBaKSI94oMTMollDWiSWn4aJugS6Xv97uxBMuGtP0xSuNOBXhAMMy7ey2q6iTMzg-A-CSEB4x-gB0xYsVv3v5znGIOBJrKkTCExBzWnFUx9HQcWqen1tq93dy4AKJMoDZ5n6SykcwiQ1NWn3sZael2ZJzhkGe7_Y9KU3c2mexTyLtv9vnNRJcLQ5iunDroJM6MYMomePQRKpOhR7z6l32Ojru-QewUEGg7iKmSLvu69feY5qBFDTnsjXA0p4wloH32dMvVNkY_Otvhh',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD8simy5kY0l4l77LArHKGA0FP1fTmIC7A6vRz4dT3wyYMvUR6H2Y8ZdIYRqpvivCxY41EZO0lZw3-rEkfkzRbxhDAcrwK8ZBGo-x9eJSY3ysd0JQKKSfj47x2qzhfaLf1LQDzvgdo_F1mDB01wYSs1jqcPd7F886eatrqeMyNipnGfkB1SAag127b5O-2FjIKRui6UrzPNYmzHTiQi4MP4RBC9kyqHjD9z3rwEHkhoSDqGT9MlYfxjaHecX6fJnAT6paTSSTqD-Vik'
];

const FALLBACK_CERTIFICATES = [
  {
    id: 'crt-101',
    learnerId: 'lrn-1',
    courseTitle: 'Advanced Payment Systems Architecture',
    institution: 'NexusTech Institute',
    category: 'Course Certificates',
    issueDate: 'October 15, 2024',
    credentialId: 'NX-CERT-884920',
    status: 'Verified',
    grade: '98.4% (Honors Distinction)',
    skills: ['Payment Gateways', 'Distributed Systems', 'Idempotency', 'Kafka'],
    instructor: 'Dr. Marcus Vance',
    previewImage: CERTIFICATE_PREVIEWS[0],
    institutionLogo: INSTITUTION_LOGOS[0],
    verifiedUrl: 'https://nexuspay.enterprise.io/verify/NX-CERT-884920'
  },
  {
    id: 'crt-102',
    learnerId: 'lrn-1',
    courseTitle: 'Fraud Prevention Strategies in FinTech',
    institution: 'Global Security Academics',
    category: 'Professional Certificates',
    issueDate: 'September 02, 2024',
    credentialId: 'NX-CERT-773821',
    status: 'Verified',
    grade: '95.0% (First Class)',
    skills: ['SOC 2', 'PCI-DSS v4.0', 'Zero Trust', 'Cloud Vaults'],
    instructor: 'Prof. Elena Rostova',
    previewImage: CERTIFICATE_PREVIEWS[1],
    institutionLogo: INSTITUTION_LOGOS[1],
    verifiedUrl: 'https://nexuspay.enterprise.io/verify/NX-CERT-773821'
  },
  {
    id: 'crt-103',
    learnerId: 'lrn-1',
    courseTitle: 'API Integration Fundamentals',
    institution: 'DevCore Learning',
    category: 'Course Certificates',
    issueDate: 'July 18, 2024',
    credentialId: 'NX-CERT-552190',
    status: 'Verified',
    grade: '99.1% (Summa Cum Laude)',
    skills: ['REST APIs', 'GraphQL', 'Authentication', 'Webhooks'],
    instructor: 'Dr. Sarah Mitchell',
    previewImage: CERTIFICATE_PREVIEWS[2],
    institutionLogo: INSTITUTION_LOGOS[2],
    verifiedUrl: 'https://nexuspay.enterprise.io/verify/NX-CERT-552190'
  },
  {
    id: 'crt-104',
    learnerId: 'lrn-1',
    courseTitle: 'Machine Learning for Real-Time Risk Scoring',
    institution: 'Carnegie Mellon University',
    category: 'Specializations',
    issueDate: 'June 20, 2024',
    credentialId: 'NX-CERT-663819',
    status: 'Verified',
    grade: '97.5% (Distinction)',
    skills: ['Machine Learning', 'Risk Models', 'PyTorch', 'Anomaly Detection'],
    instructor: 'Prof. James Wilson',
    previewImage: CERTIFICATE_PREVIEWS[0],
    institutionLogo: INSTITUTION_LOGOS[0],
    verifiedUrl: 'https://nexuspay.enterprise.io/verify/NX-CERT-663819'
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// 1. STATS BANNER (Stitch Achievement Stats Banner)
// ─────────────────────────────────────────────────────────────────────────────
function StatBanner({ totalCount = 12, hoursLearned = '140+', skillsCount = 24 }) {
  return (
    <div className="bg-[#f6f3f2] rounded-xl p-6 lg:p-8 mb-8 border border-slate-200/90 shadow-xs flex flex-col md:flex-row gap-6 justify-around items-center">
      <div className="text-center">
        <div className="text-4xl lg:text-5xl font-black text-[#0040a1]">{totalCount}</div>
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">Total Earned</div>
      </div>
      <div className="hidden md:block w-px h-16 bg-slate-200"></div>
      <div className="text-center">
        <div className="text-4xl lg:text-5xl font-black text-slate-900">{hoursLearned}</div>
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">Hours Learned</div>
      </div>
      <div className="hidden md:block w-px h-16 bg-slate-200"></div>
      <div className="text-center">
        <div className="text-4xl lg:text-5xl font-black text-slate-900">{skillsCount}</div>
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">Skills Gained</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. CATEGORY FILTER TABS (Stitch Filter Tabs Specification)
// ─────────────────────────────────────────────────────────────────────────────
function CategoryFilterBar({ categories, activeCategory, onSelectCategory }) {
  return (
    <div className="flex gap-4 border-b border-slate-200 mb-6 overflow-x-auto pb-2 scrollbar-none">
      {categories.map((cat) => {
        const isActive = activeCategory === cat;
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onSelectCategory(cat)}
            className={`px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 -mb-[10px] ${
              isActive
                ? 'text-[#0040a1] border-[#0040a1] font-bold'
                : 'text-slate-600 border-transparent hover:text-[#0040a1]'
            }`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. CONTROLLED SEARCH FORM
// ─────────────────────────────────────────────────────────────────────────────
function CertificateSearchForm({
  searchQuery,
  onSearchChange,
  verifiedOnly,
  onVerifiedChange,
  onReset,
  totalMatches,
  hasFilters
}) {
  return (
    <form 
      onSubmit={(e) => e.preventDefault()}
      className="bg-white border border-slate-200/90 rounded-xl p-3.5 mb-8 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3"
    >
      <div className="flex-1 relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          autoComplete="off"
          spellCheck="false"
          placeholder="Filter by certificate title, institution, skill, or ID..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0040a1] focus:bg-white text-slate-900 font-medium transition-all"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <label className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold cursor-pointer select-none px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => onVerifiedChange(e.target.checked)}
            className="w-3.5 h-3.5 text-[#0040a1] rounded focus:ring-0 cursor-pointer"
          />
          <span>Verified Only</span>
        </label>

        {hasFilters && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}

        <span className="text-xs font-bold text-slate-400 px-2">
          {totalMatches} {totalMatches === 1 ? 'result' : 'results'}
        </span>
      </div>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. CERTIFICATE CARD SUB-COMPONENT (Stitch Certificate Card Specification)
// ─────────────────────────────────────────────────────────────────────────────
function CertificateCard({ 
  certificate, 
  isBookmarked, 
  onBookmarkToggle, 
  onView,
  onShare,
  onAddToProfile 
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col group">
      
      {/* Top Preview Canvas Frame with Certified badge */}
      <div className="w-full aspect-video bg-[#eae7e7] relative border-b border-slate-200 flex items-center justify-center overflow-hidden p-4">
        <img
          src={certificate.previewImage || CERTIFICATE_PREVIEWS[0]}
          alt={certificate.courseTitle || certificate.title}
          className="w-full h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Green "Certified" Tag (Stitch Badge) */}
        <div className="absolute top-2 right-2 bg-[#00A657] text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
          <CheckCircle className="w-3 h-3 fill-current" />
          <span>Certified</span>
        </div>

        {/* Bookmark toggle */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onBookmarkToggle(certificate.id);
          }}
          title={isBookmarked ? 'Remove bookmark' : 'Bookmark certificate'}
          className="absolute top-2 left-2 p-1.5 rounded-md bg-white/90 hover:bg-white text-slate-500 hover:text-[#0040a1] transition-colors shadow-xs"
        >
          <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-[#0040a1] text-[#0040a1]' : ''}`} />
        </button>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-grow flex flex-col">
        {/* Institution Logo and Name */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded bg-[#f0eded] flex items-center justify-center border border-slate-200 overflow-hidden flex-shrink-0">
            {certificate.institutionLogo ? (
              <img 
                src={certificate.institutionLogo} 
                alt={certificate.institution} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <span className="text-[10px] font-bold text-slate-700">🏛️</span>
            )}
          </div>
          <span className="text-xs font-semibold text-slate-600 truncate">
            {certificate.institution || 'NexusTech Institute'}
          </span>
        </div>

        {/* Course Title */}
        <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0040a1] transition-colors mb-2 leading-tight line-clamp-2">
          {certificate.courseTitle || certificate.title || 'Advanced Payment Systems Architecture'}
        </h3>

        {/* Skills Tag Cloud */}
        {certificate.skills && certificate.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {certificate.skills.slice(0, 3).map((skill, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-semibold text-slate-600">
                {skill}
              </span>
            ))}
          </div>
        )}

        {/* Issue Date */}
        <p className="text-xs text-slate-500 mt-auto font-medium">
          Issued: {certificate.issueDate || 'October 15, 2024'}
        </p>
      </div>

      {/* Card Action Footer Bar */}
      <div className="border-t border-slate-200 p-4 flex gap-2 justify-between items-center bg-[#fcf9f8]">
        <button
          type="button"
          onClick={() => onView(certificate)}
          className="text-xs font-bold text-[#0040a1] hover:text-[#002d73] transition-colors flex items-center gap-1 group/btn"
        >
          <span>View Certificate</span>
          <ExternalLink className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
        </button>

        <div className="flex items-center gap-2">
          {/* Share Button */}
          <button
            type="button"
            aria-label="Share"
            onClick={() => onShare(certificate)}
            title="Copy verification link"
            className="p-2 text-slate-600 hover:text-[#0040a1] hover:bg-slate-200/60 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Add to Profile (LinkedIn Blue) */}
          <button
            type="button"
            onClick={() => onAddToProfile(certificate)}
            title="Add credential to LinkedIn / Professional Profile"
            className="bg-[#0A66C2] hover:bg-[#004182] text-white px-3.5 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
          >
            <span>Add to Profile</span>
          </button>
        </div>
      </div>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. EMPTY STATE SUB-COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function EmptyState({ onReset }) {
  return (
    <div className="py-16 text-center bg-white rounded-xl border border-slate-200 p-8 shadow-xs">
      <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
        <Award className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-slate-800">No matching certificates found</h3>
      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
        No credentials match your current filter parameters. Try clearing your filters or search keywords.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-4 px-4 py-2 text-xs font-bold text-[#0040a1] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
      >
        Clear All Filters
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. MAIN CERTIFICATES PAGE CONTAINER
// ─────────────────────────────────────────────────────────────────────────────
export default function Certificates() {
  const { addToast } = useToast();

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  // LocalStorage-backed state for persistent bookmarks [Side Effect]
  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('nexuspay_bookmarked_certs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Side Effect: Fetch certificates from NestJS Backend on mount
  useEffect(() => {
    let isMounted = true;

    api.student.getCertificates('lrn-1')
      .then((res) => {
        if (!isMounted) return;
        const raw = Array.isArray(res) && res.length > 0 ? res : FALLBACK_CERTIFICATES;
        
        // Enrich data with preview images and institution logos
        const enriched = raw.map((cert, idx) => ({
          ...cert,
          previewImage: cert.previewImage || cert.image || CERTIFICATE_PREVIEWS[idx % CERTIFICATE_PREVIEWS.length],
          institutionLogo: cert.institutionLogo || INSTITUTION_LOGOS[idx % INSTITUTION_LOGOS.length]
        }));

        setCertificates(enriched);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn('Backend API unreachable, using resilient fallback credentials:', err.message);
        setCertificates(FALLBACK_CERTIFICATES);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync bookmarks with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('nexuspay_bookmarked_certs', JSON.stringify(bookmarkedIds));
    } catch (e) {
      console.error('Failed to sync bookmarks:', e);
    }
  }, [bookmarkedIds]);

  const handleBookmarkToggle = (certId) => {
    setBookmarkedIds((prev) => {
      const isAlready = prev.includes(certId);
      if (isAlready) {
        addToast('Certificate removed from bookmarks', 'info');
        return prev.filter((id) => id !== certId);
      } else {
        addToast('Certificate bookmarked successfully', 'success');
        return [...prev, certId];
      }
    });
  };

  const handleResetFilters = () => {
    setActiveCategory('All');
    setSearchQuery('');
    setVerifiedOnly(false);
    addToast('Filters reset to default view', 'info');
  };

  const handleShare = (cert) => {
    const url = cert.verifiedUrl || cert.certificateUrl || `https://nexuspay.enterprise.io/verify/${cert.credentialId || cert.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      addToast('Verification URL copied to clipboard!', 'success');
    } else {
      addToast(`Credential Link: ${url}`, 'info');
    }
  };

  const handleAddToProfile = (cert) => {
    const org = encodeURIComponent(cert.institution || 'NexusTech Institute');
    const name = encodeURIComponent(cert.courseTitle || cert.title);
    const certUrl = encodeURIComponent(cert.verifiedUrl || cert.certificateUrl || `https://nexuspay.enterprise.io/verify/${cert.credentialId || cert.id}`);
    const certId = encodeURIComponent(cert.credentialId || cert.id || 'NX-CERT-884920');
    const linkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${name}&organizationName=${org}&certUrl=${certUrl}&certId=${certId}`;

    window.open(linkedInUrl, '_blank', 'noopener,noreferrer');
    addToast('Opening LinkedIn to add verified certificate to your profile!', 'success');
  };

  const filteredCerts = useMemo(() => {
    return certificates.filter((cert) => {
      const matchesCategory = activeCategory === 'All' || cert.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const titleMatch = (cert.courseTitle || cert.title || '').toLowerCase().includes(q);
      const idMatch = (cert.credentialId || cert.id || '').toLowerCase().includes(q);
      const instMatch = (cert.institution || '').toLowerCase().includes(q);
      const skillMatch = cert.skills && cert.skills.some((s) => s.toLowerCase().includes(q));
      const matchesSearch = !q || titleMatch || idMatch || instMatch || skillMatch;
      const matchesVerified = !verifiedOnly || (cert.status === 'Verified');

      return matchesCategory && matchesSearch && matchesVerified;
    });
  }, [certificates, activeCategory, searchQuery, verifiedOnly]);

  const hasFilters = searchQuery || activeCategory !== 'All' || verifiedOnly;
  const totalCount = certificates.length || 12;

  return (
    <PageLayout>
      <div className="bg-[#fcf9f8] min-h-screen py-10">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          {/* Header Section (Stitch Spec) */}
          <div className="mb-6">
            <h1 className="text-3xl lg:text-4xl font-extrabold text-[#1b1b1c] tracking-tight flex items-baseline gap-2 mb-2">
              <span>My Certificates</span>
              <span className="text-xl lg:text-2xl font-bold text-slate-500">({totalCount})</span>
            </h1>
            <p className="text-base text-slate-600">
              Manage and share your verified professional accomplishments.
            </p>
          </div>

          {/* Achievement Stats Banner (Stitch Spec: 12 Total Earned / 140+ Hours / 24 Skills) */}
          <StatBanner 
            totalCount={totalCount}
            hoursLearned="140+"
            skillsCount={24}
          />

          {/* Filter Tabs (Stitch Spec: All / Course Certificates / Specializations / Professional Certificates) */}
          <CategoryFilterBar
            categories={CATEGORIES}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
          />

          {/* Controlled Search & Verified Filter Form */}
          <CertificateSearchForm
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            verifiedOnly={verifiedOnly}
            onVerifiedChange={setVerifiedOnly}
            onReset={handleResetFilters}
            totalMatches={filteredCerts.length}
            hasFilters={hasFilters}
          />

          {/* Certificates Grid (1, 2, 3 Columns Matching Spec) */}
          {loading ? (
            <div className="py-20 text-center text-slate-400 text-xs animate-pulse flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-[#0040a1] border-t-transparent rounded-full animate-spin"></div>
              <span>Loading verified credentials...</span>
            </div>
          ) : filteredCerts.length === 0 ? (
            <EmptyState onReset={handleResetFilters} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCerts.map((cert) => (
                <CertificateCard
                  key={cert.id}
                  certificate={cert}
                  isBookmarked={bookmarkedIds.includes(cert.id)}
                  onBookmarkToggle={handleBookmarkToggle}
                  onView={setSelectedCert}
                  onShare={handleShare}
                  onAddToProfile={handleAddToProfile}
                />
              ))}
            </div>
          )}

        </div>

        {/* Verifiable Certificate Modal */}
        {selectedCert && (
          <CertificateModal
            certificate={selectedCert}
            cert={selectedCert}
            onClose={() => setSelectedCert(null)}
          />
        )}

      </div>
    </PageLayout>
  );
}
