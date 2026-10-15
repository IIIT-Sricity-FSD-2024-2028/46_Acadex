import React from 'react';
import {
  CreditCard,
  Download,
  TrendingUp,
  Receipt,
  ArrowUpRight
} from 'lucide-react';
import OrgLayout from '../../components/organization/OrgLayout';
import { useOrg } from '../../context/useOrg';
import { useToast } from '../../components/common/Toast';
import { exportToCSV } from '../../utils/csvDownload';

export default function Payments() {
  const { transactions, courses, stats } = useOrg();
  const { addToast } = useToast();

  const getCoursePrice = (transaction) => {
    const course = courses.find((item) =>
      item.id === transaction.courseId ||
      item.title?.trim().toLowerCase() === String(transaction.course || '').trim().toLowerCase()
    );
    return Number(course?.price) || 0;
  };

  const handleDownloadStatement = () => {
    const headers = ['Record ID', 'Payer', 'Description', 'Gross Amount (₹)', 'Method', 'Date', 'Status'];
    const rows = transactions.map(t => [
      t.id,
      t.payer,
      t.course,
      getCoursePrice(t),
      t.method,
      t.date,
      t.status
    ]);

    exportToCSV('financial_statement_2026.csv', headers, rows);
    addToast('Downloaded financial statement CSV!', 'success');
  };

  return (
    <OrgLayout
      breadcrumbs={[{ label: 'Payments & Revenue' }]}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Payments & Revenue Settlement</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Monitor institutional tuition collections, gateway processor fees, and educator royalty splits.
          </p>
        </div>

        {/* Financial Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-elevation-1">
            <span className="text-[10px] text-outline uppercase font-bold tracking-wider">Gross Tuition Collected</span>
            <p className="text-3xl font-black text-on-surface mt-2">₹{stats.annualRevenue.toLocaleString()}</p>
            <span className="text-xs text-emerald-700 font-bold mt-2 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +18.4% compared to last cycle
            </span>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-elevation-1">
            <span className="text-[10px] text-outline uppercase font-bold tracking-wider">Net Monthly Settlement</span>
            <p className="text-3xl font-black text-primary mt-2">₹{stats.monthlyRevenue.toLocaleString()}</p>
            <span className="text-xs text-on-surface-variant font-medium mt-2 block">
              Auto-disbursed every 15th via Automated Clearing House (ACH)
            </span>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-elevation-1">
            <span className="text-[10px] text-outline uppercase font-bold tracking-wider">Faculty Royalty Pool</span>
            <p className="text-3xl font-black text-emerald-700 mt-2">₹{Math.round(stats.annualRevenue * 0.7).toLocaleString()}</p>
            <span className="text-xs text-emerald-800 font-medium mt-2 block">
              Contracted 70% educator revenue share
            </span>
          </div>
        </div>

        {/* Recent Inflows Table */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-elevation-1">
          <h2 className="text-base font-bold text-on-surface pb-4 border-b border-outline-variant mb-4">
            Recent Tuition Settlement Batches
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-outline uppercase text-[10px] tracking-wider border-b border-outline-variant">
                  <th className="pb-3 font-bold">Transaction ID</th>
                  <th className="pb-3 font-bold">Learner</th>
                  <th className="pb-3 font-bold">Course Track</th>
                  <th className="pb-3 font-bold">Amount</th>
                  <th className="pb-3 font-bold">Payment Method</th>
                  <th className="pb-3 font-bold">Date</th>
                  <th className="pb-3 font-bold text-right">Settlement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {transactions.slice(0, 6).map((t) => {
                  const coursePrice = getCoursePrice(t);
                  return (
                  <tr key={t.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-4 font-mono font-bold text-primary">{t.id}</td>
                    <td className="py-4 font-bold text-on-surface">{t.payer}</td>
                    <td className="py-4 text-on-surface-variant font-medium">{t.course}</td>
                    <td className="py-4 font-bold text-emerald-700">₹{coursePrice.toLocaleString()}</td>
                    <td className="py-4 text-outline">{t.method}</td>
                    <td className="py-4 text-outline">{t.date}</td>
                    <td className="py-4 text-right">
                      <span className = {t.status?.toLowerCase() === "pending" ? "px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-800" : "px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800" }>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </OrgLayout>
  );
}
