import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Users as UsersIcon,
  GraduationCap,
  BookOpen,
  Building2,
  Search,
  ExternalLink,
  Trash2,
  Ban,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ShieldCheck,
  Shield,
  Plus
} from 'lucide-react';
import { DataTable } from '../../components/admin/DataTable';
import { SearchBar } from '../../components/admin/SearchBar';
import { Pagination } from '../../components/admin/Pagination';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { UserAvatar } from '../../components/admin/UserAvatar';
import { ConfirmModal } from '../../components/admin/Modals';
import { api } from '../../utils/api';

export const Users = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialRoleParam = searchParams.get('role') || '';
  const [activeRoleFilter, setActiveRoleFilter] = useState(initialRoleParam);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal actions
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToToggleStatus, setUserToToggleStatus] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  // Sync role param with URL
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam !== null && roleParam !== activeRoleFilter) {
      setActiveRoleFilter(roleParam);
      setPage(1);
    }
  }, [searchParams]);

  const handleRoleTabChange = (role) => {
    setActiveRoleFilter(role);
    setPage(1);
    if (role) {
      setSearchParams({ role });
    } else {
      setSearchParams({});
    }
  };

  const fetchUsers = () => {
    setLoading(true);
    api.get('/users', 'admin')
      .then((data) => {
        setUsers(Array.isArray(data) ? data : (data?.items || []));
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching users:', err);
        setUsers([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Stats calculation
  const stats = useMemo(() => {
    const total = users.length;
    const learners = users.filter((u) => u.role === 'Learner' || u.role === 'Student').length;
    const organizations = users.filter((u) => u.role === 'Organization').length;
    const instructors = users.filter((u) => u.role === 'Instructor').length;
    return { total, learners, organizations, instructors };
  }, [users]);

  // Filtering
  const filteredData = useMemo(() => {
    return users.filter((user) => {
      const s = searchTerm.toLowerCase();
      const matchesSearch =
        (user.name || '').toLowerCase().includes(s) ||
        (user.email || '').toLowerCase().includes(s) ||
        (user.institution || '').toLowerCase().includes(s) ||
        (user.organization || user.organizationName || '').toLowerCase().includes(s) ||
        (user.expertise || user.domain || '').toLowerCase().includes(s);

      let matchesRole = true;
      if (activeRoleFilter) {
        const target = activeRoleFilter.toLowerCase();
        const userRole = (user.role || '').toLowerCase();
        if (target === 'learner' || target === 'student') {
          matchesRole = userRole === 'learner' || userRole === 'student';
        } else {
          matchesRole = userRole === target;
        }
      }

      const matchesStatus = statusFilter ? user.status === statusFilter : true;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, activeRoleFilter, statusFilter]);

  // Suspend / Activate toggle handler
  const handleToggleStatus = async () => {
    if (!userToToggleStatus) return;
    setActionLoading(true);
    const newStatus = userToToggleStatus.status === 'Suspended' ? 'Active' : 'Suspended';
    try {
      await api.patch(`/users/${userToToggleStatus.id}`, { status: newStatus }, 'admin');
      setUsers((prev) =>
        prev.map((u) => (u.id === userToToggleStatus.id ? { ...u, status: newStatus } : u))
      );
      setActionSuccess(`User ${userToToggleStatus.name} is now ${newStatus}.`);
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setActionLoading(false);
      setUserToToggleStatus(null);
    }
  };

  // Permanent Delete handler (strictly Organization & Learner)
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setActionLoading(true);
    try {
      await api.delete(`/users/${userToDelete.id}`, 'admin');
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setActionSuccess(`User ${userToDelete.name} has been permanently deleted.`);
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      console.error('Error removing user:', err);
    } finally {
      setActionLoading(false);
      setUserToDelete(null);
    }
  };

  const renderRoleBadge = (role) => {
    switch (role) {
      case 'Learner':
      case 'Student':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <GraduationCap className="w-3.5 h-3.5" />
            Learner
          </span>
        );
      case 'Organization':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-50 text-purple-700 border border-purple-200">
            <Building2 className="w-3.5 h-3.5" />
            Organization
          </span>
        );
      case 'Instructor':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <BookOpen className="w-3.5 h-3.5" />
            Instructor
          </span>
        );
      case 'Admin':
      case 'SuperAdmin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <Shield className="w-3.5 h-3.5" />
            {role === 'SuperAdmin' ? 'Super Admin' : 'Admin'}
          </span>
        );
      default:
        return <span className="text-xs text-slate-600 font-medium">{role}</span>;
    }
  };

  const renderAffiliation = (user) => {
    if (user.role === 'Learner' || user.role === 'Student') {
      return (
        <div className="text-xs">
          <p className="font-semibold text-slate-800">{user.university || user.institution || 'Enrolled Student'}</p>
          <span className="text-[11px] text-blue-600 font-medium">Click to view enrolled curriculum</span>
        </div>
      );
    }
    if (user.role === 'Organization') {
      return (
        <div className="text-xs">
          <p className="font-semibold text-slate-800">{user.domain || user.name}</p>
          <span className="text-[11px] text-purple-600 font-medium">Click to view teaching courses & instructors</span>
        </div>
      );
    }
    if (user.role === 'Instructor') {
      return (
        <div className="text-xs">
          <p className="font-semibold text-slate-800">{user.expertise || 'Academic Faculty'}</p>
          <span className="text-[11px] text-slate-400">{user.organizationName || 'Teaching Partner'}</span>
        </div>
      );
    }
    return <span className="text-xs text-slate-400">—</span>;
  };

  const columns = [
    {
      header: 'User & Identity',
      cell: (row) => (
        <div
          onClick={() => navigate(`/admin/users/${row.id}`)}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <UserAvatar name={row.name} size="sm" />
          <div>
            <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-sm">
              {row.name}
            </div>
            <div className="text-xs text-slate-500">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Actor Role',
      cell: (row) => renderRoleBadge(row.role),
    },
    {
      header: 'Affiliation & Data',
      cell: (row) => renderAffiliation(row),
    },
    {
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status || 'Active'} />,
    },
    {
      header: 'Actions',
      cell: (row) => {
        const isInstructor = row.role === 'Instructor';
        const isProtectedAdmin = row.role === 'Admin' || row.role === 'SuperAdmin';
        const canManage = !isInstructor && !isProtectedAdmin;

        return (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {/* View Details */}
            <button
              onClick={() => navigate(`/admin/users/${row.id}`)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs transition-colors"
              title="View full user details, enrollments, or courses"
            >
              <span>View</span>
              <ExternalLink className="w-3 h-3" />
            </button>

            {/* Suspend / Activate toggle (Only for Learner & Organization) */}
            {canManage && (
              <button
                onClick={() => setUserToToggleStatus(row)}
                className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  row.status === 'Suspended'
                    ? 'text-emerald-700 hover:bg-emerald-50'
                    : 'text-amber-700 hover:bg-amber-50'
                }`}
                title={row.status === 'Suspended' ? 'Activate Account' : 'Suspend Account'}
              >
                <Ban className="w-4 h-4" />
              </button>
            )}

            {/* Permanent Delete (Only for Learner & Organization) */}
            {canManage && (
              <button
                onClick={() => setUserToDelete(row)}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                title="Permanently Delete User"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {/* Instructor notice (Admin cannot remove instructors) */}
            {isInstructor && (
              <span
                className="text-[10px] text-slate-400 font-semibold px-2 py-0.5 rounded bg-slate-100 border border-slate-200 select-none"
                title="Instructors cannot be removed directly by Admin. Managed by parent Organization."
              >
                Org Managed
              </span>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            User & Institutional Directory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Centralized registry for Organizations, Learners, and Faculty across Acadex
          </p>
        </div>

        {actionSuccess && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl animate-fadeIn shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => handleRoleTabChange('')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            activeRoleFilter === ''
              ? 'bg-slate-900 text-white border-slate-900 shadow-md'
              : 'bg-white border-slate-200 hover:bg-slate-50 shadow-xs'
          }`}
        >
          <div className="text-xs font-bold uppercase tracking-wider opacity-70">All Users</div>
          <div className="text-2xl font-black mt-1">{stats.total}</div>
        </button>

        <button
          onClick={() => handleRoleTabChange('Organization')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            activeRoleFilter === 'Organization'
              ? 'bg-purple-700 text-white border-purple-700 shadow-md'
              : 'bg-white border-slate-200 hover:bg-purple-50/50 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider opacity-70">
            <span>Organizations</span>
            <Building2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black mt-1">{stats.organizations}</div>
        </button>

        <button
          onClick={() => handleRoleTabChange('Learner')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            activeRoleFilter === 'Learner'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
              : 'bg-white border-slate-200 hover:bg-blue-50/50 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider opacity-70">
            <span>Learners</span>
            <GraduationCap className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black mt-1">{stats.learners}</div>
        </button>

        <button
          onClick={() => handleRoleTabChange('Instructor')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            activeRoleFilter === 'Instructor'
              ? 'bg-emerald-700 text-white border-emerald-700 shadow-md'
              : 'bg-white border-slate-200 hover:bg-emerald-50/50 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider opacity-70">
            <span>Instructors</span>
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black mt-1">{stats.instructors}</div>
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Filter Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/80">
          <div className="w-full md:w-96">
            <SearchBar
              placeholder="Search by name, email, institution, or domain..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 rounded-xl">
              <button
                onClick={() => handleRoleTabChange('')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  activeRoleFilter === '' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => handleRoleTabChange('Organization')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  activeRoleFilter === 'Organization' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Orgs
              </button>
              <button
                onClick={() => handleRoleTabChange('Learner')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  activeRoleFilter === 'Learner' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Learners
              </button>
              <button
                onClick={() => handleRoleTabChange('Instructor')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  activeRoleFilter === 'Instructor' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Faculty
              </button>
            </div>

            {/* Status Select */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        {loading ? (
          <div className="p-16 text-center text-slate-500">Loading directory from backend database...</div>
        ) : filteredData.length === 0 ? (
          <div className="p-16 text-center text-slate-500">No users found matching your filters.</div>
        ) : (
          <DataTable columns={columns} data={filteredData} />
        )}
        <Pagination currentPage={page} totalPages={1} onPageChange={setPage} />
      </div>

      {/* Confirmation Modal for Delete */}
      {userToDelete && (
        <ConfirmModal
          isOpen={!!userToDelete}
          onClose={() => setUserToDelete(null)}
          onConfirm={handleDeleteUser}
          title={`Permanently Delete ${userToDelete.role}: ${userToDelete.name}`}
          message={`Are you sure you want to permanently delete this ${userToDelete.role}? This will remove their record from backend database files completely.`}
          confirmText="Yes, Permanently Delete"
          cancelText="Cancel"
          variant="danger"
          loading={actionLoading}
        />
      )}

      {/* Confirmation Modal for Suspend / Activate */}
      {userToToggleStatus && (
        <ConfirmModal
          isOpen={!!userToToggleStatus}
          onClose={() => setUserToToggleStatus(null)}
          onConfirm={handleToggleStatus}
          title={`${userToToggleStatus.status === 'Suspended' ? 'Re-activate' : 'Suspend'} Account: ${userToToggleStatus.name}`}
          message={`Are you sure you want to ${
            userToToggleStatus.status === 'Suspended' ? 're-activate' : 'suspend'
          } this account? Status will update in backend database.`}
          confirmText={userToToggleStatus.status === 'Suspended' ? 'Activate Account' : 'Suspend Account'}
          cancelText="Cancel"
          variant={userToToggleStatus.status === 'Suspended' ? 'primary' : 'warning'}
          loading={actionLoading}
        />
      )}
    </div>
  );
};

export default Users;
