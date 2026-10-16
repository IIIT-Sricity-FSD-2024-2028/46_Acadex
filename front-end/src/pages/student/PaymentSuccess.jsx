import React, { useState, useEffect } from 'react';
import { Link, Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Play, Receipt, BookOpen } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import api from '../../services/api';

export default function PaymentSuccess() {
  const { state: locationState } = useLocation();
  const [searchParams] = useSearchParams();
  const [payment, setPayment] = useState(() => {
    if (locationState?.transactionId) return locationState;
    try {
      const stored = sessionStorage.getItem('nexuspay_last_payment');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    const txn = searchParams.get('transactionId');
    const crs = searchParams.get('courseId');
    if (txn) {
      return {
        transactionId: txn,
        courseId: crs || '',
        courseTitle: 'Enrolled Course',
        amount: 0,
        method: 'Card / UPI',
        date: new Date().toISOString(),
      };
    }
    return null;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Payment Successful | NexusEdu';
    const courseId = payment?.courseId || searchParams.get('courseId');
    if (courseId && (!payment?.courseTitle || payment.courseTitle === 'Enrolled Course')) {
      setLoading(true);
      api.courses
        .get(courseId)
        .then((course) => {
          setPayment((prev) => ({
            ...(prev || {}),
            courseId,
            courseTitle: course?.title || 'Enrolled Course',
            amount: prev?.amount || course?.price || 0,
          }));
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [payment?.courseId, searchParams]);

  if (!payment && !searchParams.get('transactionId')) {
    return <Navigate to="/student/my-learning" replace />;
  }

  const transactionId = payment?.transactionId || searchParams.get('transactionId') || 'TXN-CONFIRMED';
  const courseId = payment?.courseId || searchParams.get('courseId') || '';
  const courseTitle = payment?.courseTitle || 'Enrolled Course';
  const amount = payment?.amount !== undefined ? Number(payment.amount) : 0;
  const method = payment?.method || 'Card •••• 4242';
  const dateStr = payment?.date
    ? new Date(payment.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    : new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  const rows = [
    ['Course', courseTitle],
    ['Amount paid', `₹${amount.toLocaleString('en-IN')}`],
    ['Payment method', method],
    ['Transaction ID', transactionId],
    ['Date', dateStr],
  ];

  return (
    <PageLayout>
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-5 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Payment successful</h1>
            <p className="text-sm text-slate-500 mt-1">You are now enrolled in this course.</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#0056D2] border-t-transparent" />
            </div>
          ) : (
            <dl className="text-left text-sm divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
              {rows.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 px-4 py-2.5">
                  <dt className="text-slate-500 font-medium">{k}</dt>
                  <dd className="font-semibold text-slate-900 text-right">{v}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            {courseId ? (
              <Link
                to={`/student/learn/${courseId}`}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#0056D2] text-white text-sm font-bold hover:bg-[#00419E] transition-colors"
              >
                <Play className="w-4 h-4 fill-current" /> Start course
              </Link>
            ) : (
              <Link
                to="/student/my-learning"
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#0056D2] text-white text-sm font-bold hover:bg-[#00419E] transition-colors"
              >
                <BookOpen className="w-4 h-4" /> Go to my learning
              </Link>
            )}
            <Link
              to="/student/billing"
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-lg border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Receipt className="w-4 h-4" /> View billing
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
