import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronLeft,
  Mail,
  Calendar,
  Award,
  CreditCard,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import OrgLayout from '../../components/organization/OrgLayout';
import { useOrg } from '../../context/useOrg';
import { api } from '../../services/api';

export default function LearnerDetails() {
  const { id } = useParams();
  const { learners, courses, enrollments, isLoading } = useOrg();
  const learner = learners.find((item) => item.id === id);
  const [certificates, setCertificates] = useState([]);

  useEffect(() => {
    let active = true;
    api.certificates.list()
      .then((result) => {
        const items = Array.isArray(result) ? result : result?.items || result?.data || [];
        if (active) setCertificates(items);
      })
      .catch(() => active && setCertificates([]));
    return () => { active = false; };
  }, []);

  if (!learner) {
    return (
      <OrgLayout breadcrumbs={[{ label: 'Learners', path: '/org/learners' }, { label: isLoading ? 'Loading' : 'Learner Not Found' }]}>
        <div className="p-8 text-center">
          <p className="text-sm font-bold text-on-surface">{isLoading ? 'Loading learner profile…' : 'Learner not found'}</p>
          {!isLoading && (
            <Link to="/org/learners" className="text-xs text-primary font-bold hover:underline mt-2 inline-block">
              Return to Learners
            </Link>
          )}
        </div>
      </OrgLayout>
    );
  }

  const learnerEnrollments = enrollments.filter((enrollment) => enrollment.learnerId === learner.id);
  const learnerCourses = learnerEnrollments.map((enrollment) => ({
    enrollment,
    course: courses.find((course) => course.id === enrollment.courseId),
  })).filter(({ course }) => course);
  const enrolledCourseCount = learnerEnrollments.length;
  const certificateCount = certificates.filter((certificate) => certificate.learnerId === learner.id).length;
  const learnerCertificates = certificates.filter((certificate) => certificate.learnerId === learner.id);
  const enrolledSince = learner.joinedDate || (learner.createdAt
    ? new Date(learner.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    : 'Not available');

  return (
    <OrgLayout
      breadcrumbs={[
        { label: 'Learners', path: '/org/learners' },
        { label: learner.name }
      ]}
    >
      <div className="space-y-6">
        {/* Back Link */}
        <Link to="/org/learners" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Learners List</span>
        </Link>

        {/* Profile Card */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 md:p-8 shadow-elevation-1 flex flex-col md:flex-row items-center gap-6">
          <img src={learner.avatar} alt={learner.name} className="w-24 h-24 rounded-3xl object-cover shadow-sm flex-shrink-0" />
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <h1 className="text-2xl font-bold text-on-surface">{learner.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>{learner.status || 'Active'}</span>
              </span>
            </div>
            <p className="text-xs text-on-surface-variant">{learner.university}</p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-outline pt-1">
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {learner.email}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Enrolled since {enrolledSince}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrolled Courses Section */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-elevation-1 space-y-4">
          <h2 className="text-base font-bold text-on-surface pb-3 border-b border-outline-variant">
            Enrolled Courses
          </h2>
          <div className="divide-y divide-outline-variant/40">
            {learnerCourses.length === 0 ? (
              <p className="py-4 text-xs text-outline">No enrolled courses are recorded for this learner.</p>
            ) : learnerCourses.map(({ course: c }) => (
              <div key={c.id} className="py-4 flex items-center gap-3">
                <div className="flex items-center gap-3 max-w-md">
                  <img src={c.thumbnail} alt={c.title} className="w-12 h-9 rounded-lg object-cover" />
                  <div>
                    <h3 className="font-bold text-xs text-on-surface">{c.title}</h3>
                    <p className="text-[11px] text-outline">{c.instructorName} • {c.category}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Certificates Earned Section */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-elevation-1 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
            <h2 className="text-base font-bold text-on-surface">Certificates Earned ({certificateCount})</h2>
            <span className="text-xs text-outline font-medium">Cryptographically Verified</span>
          </div>

          <div className="divide-y divide-outline-variant/60">
            {learnerCertificates.length === 0 ? (
              <p className="py-4 text-xs text-outline">No certificates have been issued yet.</p>
            ) : learnerCertificates.map((certificate) => (
              <div key={certificate.id} className="py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-xs text-on-surface truncate">{certificate.courseTitle || 'Course Certificate'}</h3>
                  <p className="text-[11px] text-outline truncate">Credential ID: {certificate.credentialId || certificate.id}</p>
                </div>
                <span className="text-[10px] text-emerald-700 font-bold whitespace-nowrap">{certificate.issueDate || 'Issued'}</span>
              </div>
            ))}
          </div>
        </div>
        </div>

        {false && <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-elevation-1 space-y-4">
          <h2 className="text-base font-bold text-on-surface pb-3 border-b border-outline-variant">
            Payment History
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-outline uppercase text-[10px] tracking-wider border-b border-outline-variant/60">
                  <th className="pb-3 font-bold">Transaction ID</th>
                  <th className="pb-3 font-bold">Course Track</th>
                  <th className="pb-3 font-bold">Method</th>
                  <th className="pb-3 font-bold">Date</th>
                  <th className="pb-3 font-bold">Amount</th>
                  <th className="pb-3 font-bold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {(learnerTransactions.length > 0 ? learnerTransactions : [
                  { id: "TXN-884920", course: "Advanced Enterprise Architecture", method: "Visa •••• 4242", date: "Oct 24, 2026", amount: 89.99, status: "Completed" },
                  { id: "TXN-884812", course: "Machine Learning for Fraud Detection", method: "Visa •••• 4242", date: "Jul 15, 2026", amount: 99.99, status: "Completed" },
                  { id: "TXN-884701", course: "Zero-Trust Cybersecurity & Banking", method: "Visa •••• 4242", date: "Apr 02, 2026", amount: 79.99, status: "Completed" }
                ]).map((tx) => (
                  <tr key={tx.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-3 font-mono font-bold text-on-surface">{tx.id}</td>
                    <td className="py-3 text-on-surface-variant font-medium">{tx.course}</td>
                    <td className="py-3 text-outline">{tx.method}</td>
                    <td className="py-3 text-outline">{tx.date}</td>
                    <td className="py-3 font-bold text-emerald-700">₹{tx.amount.toFixed(2)}</td>
                    <td className="py-3 text-right">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>}

        {/* Recent learner activity is intentionally omitted from this profile. */}
        {false && <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-elevation-1 space-y-3">
          <h2 className="text-base font-bold text-on-surface pb-2 border-b border-outline-variant">
            Recent Student Activity
          </h2>
          <div className="space-y-3 pt-1 text-xs">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <p className="text-on-surface font-medium">Completed Quiz: "Consensus Protocols & Two-Phase Locking" (Score: 95%)</p>
              <span className="text-[10px] text-outline ml-auto">2 hours ago</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <p className="text-on-surface font-medium">Watched Lesson 4: "Multi-Region AWS Replication Architecture"</p>
              <span className="text-[10px] text-outline ml-auto">Yesterday</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <p className="text-on-surface font-medium">Submitted Lab Exercise: "Building High Throughput Event Streaming"</p>
              <span className="text-[10px] text-outline ml-auto">3 days ago</span>
            </div>
          </div>
        </div>}

      </div>
    </OrgLayout>
  );
}
