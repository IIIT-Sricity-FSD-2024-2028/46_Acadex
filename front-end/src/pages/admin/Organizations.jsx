import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { DataTable } from '../../components/admin/DataTable';
import { SearchBar } from '../../components/admin/SearchBar';
import { FilterBar } from '../../components/admin/FilterBar';
import { Pagination } from '../../components/admin/Pagination';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { ConfirmModal } from '../../components/admin/Modals';
import { api } from '../../utils/api';

export const Organizations = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orgToDelete, setOrgToDelete] = useState(null);

  useEffect(() => {
    api.get('/organizations', 'admin')
      .then(data => { setOrganizations(Array.isArray(data) ? data : (data?.items || [])); setLoading(false); })
      .catch(err => { console.error('Error fetching organizations:', err); setOrganizations([]); setLoading(false); });
  }, []);

  const handleDeleteOrg = async () => {
    if (!orgToDelete) return;
    try {
      await api.delete(`/organizations/${orgToDelete.id}`, 'admin');
      setOrganizations(prev => prev.filter(o => o.id !== orgToDelete.id));
    } catch (err) {
      console.error('Error removing organization:', err);
    } finally {
      setOrgToDelete(null);
    }
  };

  const columns = [
    { header: 'Organization', accessor: 'name' },
    { header: 'Domain', accessor: 'domain' },
    { header: 'Type', accessor: 'type' },
    { header: 'Verification', cell: (row) => <StatusBadge status={row.verificationStatus} /> },
    { header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
    { 
      header: 'Actions', 
      cell: (row) => (
        <div className="flex items-center gap-3">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/organizations/${row.id}`);
            }}
            className="text-[#0056D2] hover:text-[#00419E] font-semibold text-xs text-xs"
          >
            View
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setOrgToDelete(row);
            }}
            className="text-rose-600 hover:text-rose-700 font-medium text-xs flex items-center gap-1"
            title="Remove organization"
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Organizations</h1>
          <p className="text-slate-500">Manage university and corporate partners.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/80">
          <SearchBar placeholder="Search organizations..." value={searchTerm} onChange={setSearchTerm} />
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <FilterBar 
              options={[{ label: 'Verified', value: 'Verified' }, { label: 'Pending', value: 'Pending' }]} 
              value={statusFilter} 
              onChange={setStatusFilter} 
              placeholder="All Verification" 
            />
          </div>
        </div>

        <DataTable 
          columns={columns} 
          data={organizations} 
          onRowClick={(row) => navigate(`/admin/organizations/${row.id}`)}
        />
        
        <Pagination currentPage={page} totalPages={1} onPageChange={setPage} />
      </div>

      <ConfirmModal
        isOpen={!!orgToDelete}
        onClose={() => setOrgToDelete(null)}
        onConfirm={handleDeleteOrg}
        title="Remove Organization"
        message={`Are you sure you want to remove institution "${orgToDelete?.name}"? All associated seats, faculty rosters, and verifications will be decommissioned.`}
        confirmText="Remove Organization"
        variant="danger"
      />
    </div>
  );
};
