import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import OrgLayout from '../../components/organization/OrgLayout';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchOrgLearners } from '../../store/actions/learnersActions';
import {
  AdminHeader,
  AdminSearch,
  AdminDataState,
  AdminEmpty,
} from '../../components/admin/AdminUI';
export default function Learners() {
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.learners.orgLearners);
  const [search, setSearch] = useState('');
  useEffect(() => {
    dispatch(fetchOrgLearners());
  }, [dispatch]);
  const rows =
    state.data?.filter((l) =>
      `${l.name} ${l.email}`.toLowerCase().includes(search.toLowerCase())
    ) || [];
  return (
    <OrgLayout>
      <div className="admin-page">
        <AdminHeader title="Learners" />
        <div className="admin-toolbar">
          <AdminSearch
            value={search}
            onChange={setSearch}
            placeholder="Search learners by name or email…"
          />
        </div>
        <AdminDataState
          loading={state.loading}
          error={state.error}
          refresh={() => dispatch(fetchOrgLearners())}
        />
        {state.data && !state.error && (
          <section className="admin-card">
            <div className="operations-table-scroll">
              <table className="operations-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((l) => (
                    <tr key={l.id}>
                      <td>
                        <strong>{l.name}</strong>
                      </td>
                      <td>{l.email}</td>
                      <td>
                        <Link
                          className="admin-button"
                          to={`/org/learners/${l.id}`}
                        >
                          View learner
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!rows.length && (
              <AdminEmpty title="No learners match your search" />
            )}
          </section>
        )}
      </div>
    </OrgLayout>
  );
}
