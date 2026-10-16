import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Receipt, X } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import api from '../../services/api';

const formatINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const formatDate = (d) => (d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '');

export default function Billing() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    document.title = 'Billing & Payments | NexusEdu';
    api.student
      .getPayments()
      .then((p) => setPayments(Array.isArray(p) ? p : []))
      .catch((err) => setError(err.message || 'Could not load payments'))
      .finally(() => setLoading(false));
  }, []);

  const totalPaid = useMemo(
    () => payments.filter((p) => p.status === 'Completed' && p.type === 'Payment').reduce((s, p) => s + Number(p.amount || 0), 0),
    [payments]
  );

  return (
    <PageLayout>
      <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-8 space-y-6">
        <header>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Billing</h1>
        </header>

        <div className="grid grid-cols-2 gap-4 max-w-md">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xl font-extrabold text-slate-900">{formatINR(totalPaid)}</p>
            <p className="text-xs text-slate-500">Total paid</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xl font-extrabold text-slate-900">{payments.length}</p>
            <p className="text-xs text-slate-500">Transactions</p>
          </div>
        </div>

        <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#0056D2] border-t-transparent" />
            </div>
          ) : error ? (
            <p className="p-6 text-sm text-rose-600">{error}</p>
          ) : payments.length === 0 ? (
            <div className="py-14 text-center">
              <CreditCard className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">No payments yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Purchases appear here after checkout.{' '}
                <Link to="/student/explore" className="text-[#0056D2] font-bold hover:underline">Browse catalog</Link>
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500 text-left">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Course</th>
                    <th className="px-4 py-3 font-semibold">Method</th>
                    <th className="px-4 py-3 font-semibold text-right">Amount</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">{formatDate(p.createdAt || p.date)}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{p.course}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{p.method}</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900">{formatINR(p.amount)}</td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">{p.status}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setReceipt(p)} className="text-xs font-bold text-[#0056D2] hover:underline inline-flex items-center gap-1">
                          <Receipt className="w-3.5 h-3.5" /> Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {receipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 print:shadow-none">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-900">Payment receipt</h3>
              <button onClick={() => setReceipt(null)} className="text-slate-400 hover:text-slate-600 print:hidden"><X className="w-4 h-4" /></button>
            </div>
            <dl className="text-sm divide-y divide-slate-100 border border-slate-200 rounded-xl">
              {[
                ['Transaction ID', receipt.id],
                ['Date', formatDate(receipt.createdAt || receipt.date)],
                ['Billed to', receipt.payer],
                ['Course', receipt.course],
                ['Provider', receipt.organizationName],
                ['Method', receipt.method],
                ['Amount', formatINR(receipt.amount)],
                ['Status', receipt.status],
              ]
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 px-3 py-2">
                    <dt className="text-slate-500">{k}</dt>
                    <dd className="font-semibold text-slate-900 text-right">{v}</dd>
                  </div>
                ))}
            </dl>
            <button onClick={() => window.print()} className="w-full py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 print:hidden">
              Print
            </button>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
