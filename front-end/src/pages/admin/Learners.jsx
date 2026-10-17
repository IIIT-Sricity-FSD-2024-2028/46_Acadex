import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { DataTable } from '../../components/admin/DataTable';
import { SearchBar } from '../../components/admin/SearchBar';
import { FilterBar } from '../../components/admin/FilterBar';
import { Pagination } from '../../components/admin/Pagination';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { ConfirmModal } from '../../components/admin/Modals';
import HumanAvatar from '../../components/common/HumanAvatar';
import { api } from '../../utils/api';

export const Learners = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [learnerToDelete, setLearnerToDelete] = useState(null);

  useEffect(() => {
    api.get('/learners?limit=1000', 'admin')
      .then(data => { setLearners(Array.isArray(data) ? data : (data?.items || [])); setLoading(false); })
      .catch(err => { console.error('Error fetching learners:', err); setLearners([]); setLoading(false); });
  }, []);

  const handleDeleteLearner = async () => {
    if (!learnerToDelete) return;
    try {
      await api.delete(`/learners/${learnerToDelete.id}`, 'admin');
      setLearners(prev => prev.filter(l => l.id !== learnerToDelete.id));
    } catch (err) {
      console.error('Error removing learner:', err);
    } finally {
      setLearnerToDelete(null);
    }
  };

  const columns = [
    { 
      header: 'Name', 
      cell: (row) => (
        <div className="flex items-center gap-2.5">
          <HumanAvatar name={row.name} size="xs" />
          <span className="font-semibold text-slate-800">{row.name}</span>
        </div>
      )
    },
    { header: 'Email', accessor: 'email' },
    { header: 'Institution', accessor: 'institution' },
    { header: 'Verification', cell: (row) => <StatusBadge status={row.verificationStatus} /> },
    { header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
    { 
      header: 'Actions', 
      cell: (row) => (
        <div className="flex items-center gap-3">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/learners/${row.id}`);
            }}
            className="text-[#0056D2] hover:text-[#00419E] font-semibold text-xs text-xs"
          >
            View
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setLearnerToDelete(row);
            }}
            className="text-rose-600 hover:text-rose-700 font-medium text-xs flex items-center gap-1"
            title="Remove learner"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove</span>
          </button>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Learners</h1>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/80">
          <SearchBar placeholder="Search learners..." value={searchTerm} onChange={setSearchTerm} />
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <FilterBar 
              options={[{ label: 'Active', value: 'Active' }, { label: 'Suspended', value: 'Suspended' }]} 
              value={statusFilter} 
              onChange={setStatusFilter} 
              placeholder="All Statuses" 
            />
          </div>
        </div>

        <DataTable 
          columns={columns} 
          data={learners} 
          onRowClick={(row) => navigate(`/admin/learners/${row.id}`)}
        />
        
        <Pagination currentPage={page} totalPages={1} onPageChange={setPage} />
      </div>

      <ConfirmModal
        isOpen={!!learnerToDelete}
        onClose={() => setLearnerToDelete(null)}
        onConfirm={handleDeleteLearner}
        title="Remove Learner"
        message={`Are you sure you want to remove learner "${learnerToDelete?.name}"? This will deactivate their academic profile and enrollments.`}
        confirmText="Remove Learner"
        variant="danger"
      />
    </div>
  );
};
