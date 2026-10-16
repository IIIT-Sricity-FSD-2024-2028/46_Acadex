import React from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { CheckCircle2, Play, Receipt } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';

export default function PaymentSuccess() {
  const { state } = useLocation();
  if (!state?.transactionId) return <Navigate to="/student/my-learning" replace />;

  const rows = [
    ['Course', state.courseTitle],
    ['Amount paid', `₹${Number(state.amount || 0).toLocaleString('en-IN')}`],
    ['Payment method', state.method],
    ['Transaction ID', state.transactionId],
    ['Date', new Date(state.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })],
  ];

  return (
    <PageLayout>
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Payment successful</h1>
            <p className="text-sm text-slate-500 mt-1">You are now enrolled.</p>
          </div>
          <dl className="text-left text-sm divide-y divide-slate-100 border border-slate-200 rounded-xl">
            {rows.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 px-4 py-2.5">
                <dt className="text-slate-500">{k}</dt>
                <dd className="font-semibold text-slate-900 text-right">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-col sm:flex-row gap-2">
            <Link
              to={`/student/learn/${state.courseId}`}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#0056D2] text-white text-sm font-bold hover:bg-[#00419E]"
            >
              <Play className="w-4 h-4 fill-current" /> Start course
            </Link>
            <Link
              to="/student/billing"
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-lg border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              <Receipt className="w-4 h-4" /> View billing
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
