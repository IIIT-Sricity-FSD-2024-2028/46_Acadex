import React, { useState, useEffect } from 'react';
import { Award, Eye, Download, Printer, CheckCircle2, X, Copy, Check } from 'lucide-react';
import { DataTable } from '../../components/admin/DataTable';
import { SearchBar } from '../../components/admin/SearchBar';
import { Pagination } from '../../components/admin/Pagination';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { api } from '../../utils/api';

export const Certificates = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get('/certificates', 'admin')
      .then(data => {
        setCertificates(Array.isArray(data) ? data : (data?.items || []));
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching certificates:', err);
        setCertificates([]);
        setLoading(false);
      });
  }, []);

  const handleCopyLink = (certId) => {
    navigator.clipboard?.writeText?.(`${window.location.origin}/verify/${certId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const columns = [
    {
      header: 'Certificate ID',
      cell: (row) => (
        <span className="font-mono text-xs font-semibold text-slate-800">
          {row.credentialId || row.id}
        </span>
      ),
    },
    {
      header: 'Learner',
      cell: (row) => (
        <div>
          <div className="font-semibold text-slate-900 text-sm">{row.learner || 'Learner'}</div>
          <div className="text-xs text-slate-500">{row.learnerEmail || 'learner@platform.io'}</div>
        </div>
      ),
    },
    {
      header: 'Course',
      cell: (row) => (
        <span className="font-medium text-slate-800 text-sm">
          {row.course || row.courseTitle || 'Curriculum Course'}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status || 'Verified'} />,
    },
    {
      header: 'Actions',
      cell: (row) => (
        <button
          onClick={() => setSelectedCert(row)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View</span>
        </button>
      ),
    },
  ];

  const filteredData = certificates.filter((c) => {
    const s = searchTerm.toLowerCase();
    return (
      (c.learner || '').toLowerCase().includes(s) ||
      (c.learnerEmail || '').toLowerCase().includes(s) ||
      (c.course || c.courseTitle || '').toLowerCase().includes(s) ||
      (c.id || '').toLowerCase().includes(s) ||
      (c.credentialId || '').toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Certificates</h1>
          <p className="text-sm text-slate-500 mt-1">Verified credentials and course completion certificates awarded to learners</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/80">
          <SearchBar
            placeholder="Search by learner name, email, course or certificate ID..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading certificates from backend...</div>
        ) : filteredData.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No certificates match your search query.</div>
        ) : (
          <DataTable columns={columns} data={filteredData} />
        )}
        <Pagination currentPage={page} totalPages={1} onPageChange={setPage} />
      </div>

      {/* Certificate Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Certificate Preview</h3>
                  <p className="text-xs text-slate-500">Credential ID: {selectedCert.credentialId || selectedCert.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCert(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Certificate Decorative Display */}
            <div className="p-8 bg-gradient-to-br from-slate-50 via-white to-amber-50/20 text-center border-b border-slate-200 relative">
              <div className="border-4 border-double border-amber-500/40 rounded-2xl p-8 bg-white/80 shadow-sm relative">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-700 text-white flex items-center justify-center shadow-md">
                    <Award className="w-6 h-6" />
                  </div>
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-blue-700 mb-1">
                  Acadex Academic Credential
                </div>
                <h2 className="text-2xl font-serif font-black text-slate-900 mb-4">
                  Certificate of Completion
                </h2>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">This is proudly certified to</p>
                <div className="text-2xl font-bold text-slate-900 mb-1">
                  {selectedCert.learner || 'Learner'}
                </div>
                <p className="text-xs text-slate-500 mb-6">{selectedCert.learnerEmail || 'learner@platform.io'}</p>

                <p className="text-xs text-slate-600 max-w-md mx-auto mb-2">
                  for successfully demonstrating mastery and completing the verified course curriculum:
                </p>
                <div className="text-lg font-bold text-indigo-900 mb-6">
                  {selectedCert.course || selectedCert.courseTitle || 'Curriculum Course'}
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-4 text-xs text-slate-600 text-left">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Credential Hash</span>
                    <span className="font-mono font-semibold text-slate-800">{selectedCert.credentialId || selectedCert.id}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Verification Status</span>
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {selectedCert.status || 'Verified on Public Ledger'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => handleCopyLink(selectedCert.credentialId || selectedCert.id)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                <span>{copied ? 'Verification URL Copied!' : 'Copy Verification Link'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl shadow-xs transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Certificate</span>
                </button>
                <button
                  onClick={() => setSelectedCert(null)}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
