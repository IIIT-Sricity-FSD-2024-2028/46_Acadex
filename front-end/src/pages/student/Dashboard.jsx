import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Receipt, ArrowUpRight } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import LearningOverview from '../../components/workspace/LearningOverview';
import PaymentCard from '../../components/student/PaymentCard';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchStudentBilling } from '../../store/actions/paymentsActions';
import {
  AdminMetric,
  AdminDataState,
  AdminEmpty,
} from '../../components/admin/AdminUI';
import { money } from '../../utils/adminDisplay';
export default function Dashboard() {
  const dispatch = useAppDispatch();
  const billing = useAppSelector((s) => s.payments.studentBilling);
  const data = billing.data;
  useEffect(() => {
    dispatch(fetchStudentBilling({ limit: 3 }));
  }, [dispatch]);
  return (
    <PageLayout className="p-5 md:p-8">
      <LearningOverview role="Student" />
      <section className="admin-page dashboard-page dashboard-billing !pt-0">
        <div className="admin-section-header">
          <h2>My payments</h2>
          <Link className="admin-button" to="/student/billing">
            View billing
            <ArrowUpRight size={14} />
          </Link>
        </div>
        <AdminDataState
          loading={billing.loading}
          error={billing.error}
          refresh={() => dispatch(fetchStudentBilling({ limit: 3 }))}
        />
        {data && !billing.error && (
          <>
            <div className="admin-stats-grid">
              <AdminMetric
                icon={CreditCard}
                label="Total paid"
                value={
                  data.summary.totals.length
                    ? data.summary.totals.map((t) => (
                        <div key={t.currency}>
                          {money(t.amount, t.currency)}
                        </div>
                      ))
                    : money(0, data.summary.currency)
                }
              />
              <AdminMetric
                icon={Receipt}
                label="Completed payments"
                value={data.summary.completedPayments}
              />
            </div>
            <div className="admin-grid">
              {data.items.map((p) => (
                <PaymentCard key={p.id} payment={p} />
              ))}
            </div>
            {!data.items.length && (
              <AdminEmpty
                title="No payments recorded"
                description="Your course purchases will appear here and in billing."
              />
            )}
          </>
        )}
      </section>
    </PageLayout>
  );
}
