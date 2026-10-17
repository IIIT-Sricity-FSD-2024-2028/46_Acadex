import React, { useEffect, useState } from 'react';
import { Eye, Copy, Printer, X } from 'lucide-react';
import { api, getItems } from '../../utils/api';
import { DataTable } from '../../components/admin/DataTable';
import { Pagination } from '../../components/admin/Pagination';
import { StatusBadge } from '../../components/admin/StatusBadge';
import '../../styles/admin-panels.css';

const PAGE_SIZE = 10;
export const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    api.get('/certificates').then(data => setCertificates(getItems(data)))
      .catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);
  useEffect(() => { setPage(1); }, [search]);
  useEffect(() => {
    function escape(event) { if (event.key === 'Escape') setSelected(null); }
    window.addEventListener('keydown', escape);
    return () => { window.removeEventListener('keydown', escape); document.body.classList.remove('admin-print-certificate'); };
  }, []);
  async function view(row) {
    setError(''); setBusy(true); setCopied(false);
    try { setSelected(await api.get(`/certificates/${encodeURIComponent(row.id)}`)); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  async function copy() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard is unavailable. Open the verification link below to copy it.');
      await navigator.clipboard.writeText(`${window.location.origin}/verify/${encodeURIComponent(selected.credentialId || selected.id)}`);
      setCopied(true);
    } catch (e) { setError(e.message); }
  }
  function print() {
    document.body.classList.add('admin-print-certificate');
    window.addEventListener('afterprint', () => document.body.classList.remove('admin-print-certificate'), { once: true });
    window.print();
  }
  const filtered = certificates.filter(cert => [cert.learnerName, cert.learnerEmail, cert.courseTitle, cert.credentialId, cert.id].some(value => String(value || '').toLowerCase().includes(search.toLowerCase())));
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const columns = [
    { header: 'Credential', cell: row => <span className="font-mono text-xs">{row.credentialId || row.id}</span> },
    { header: 'Learner', cell: row => <div><p className="font-semibold">{row.learnerName || 'Name not recorded'}</p><p className="text-xs text-slate-500 mt-1">{row.learnerEmail || 'Email not recorded'}</p></div> },
    { header: 'Course', accessor: 'courseTitle' },
    { header: 'Status', cell: row => <StatusBadge status={row.status} /> },
    { header: 'Actions', cell: row => <button disabled={busy} onClick={() => view(row)} className="admin-button text-blue-700"><Eye size={16} /> View</button> },
  ];
  return <div className="admin-page">
    <header><h1 className="admin-heading">Certificates</h1><p className="admin-muted mt-2">Learner credentials and completed courses.</p></header>
    {error && <p role="alert" className="admin-alert">{error}</p>}
    <section className="admin-card !p-0 overflow-hidden"><div className="p-4 border-b border-slate-200"><input aria-label="Search certificates" className="admin-input sm:max-w-xl" placeholder="Search learner, email, course or credential" value={search} onChange={e => setSearch(e.target.value)} /></div>{loading ? <p className="admin-muted p-8">Loading certificates…</p> : <DataTable columns={columns} data={filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)} />}{totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}</section>
    {selected && <div className="admin-modal-backdrop" onClick={() => setSelected(null)}><section role="dialog" aria-modal="true" aria-labelledby="certificate-title" className="admin-modal" onClick={e => e.stopPropagation()}><div className="flex justify-between gap-3 mb-5"><h2 className="font-bold" id="certificate-title">Certificate preview</h2><button autoFocus className="admin-button !p-2" aria-label="Close certificate" onClick={() => setSelected(null)}><X size={18} /></button></div><article className="admin-certificate-document border-4 border-double border-blue-200 rounded-xl p-8 text-center space-y-4"><p className="text-blue-700 text-sm font-semibold uppercase tracking-wider">Certificate of completion</p><h3 className="text-3xl font-bold">{selected.learnerName}</h3><p className="admin-muted">{selected.learnerEmail || 'Email not recorded'}</p><p className="admin-muted pt-4">Completed course</p><p className="font-bold text-xl">{selected.courseTitle}</p><p className="text-xs text-slate-600 break-all pt-4">Credential: {selected.credentialId || selected.id}</p><StatusBadge status={selected.status} /></article>{error && <p className="admin-alert mt-4">{error}</p>}<div className="flex flex-wrap gap-3 mt-5"><button className="admin-button" onClick={copy}><Copy size={16} />{copied ? 'Link copied' : 'Copy verification link'}</button><button className="admin-button" onClick={print}><Printer size={16} /> Print certificate</button><a className="admin-button admin-button-primary" target="_blank" rel="noreferrer" href={`/verify/${encodeURIComponent(selected.credentialId || selected.id)}`}>Verify credential</a></div></section></div>}
  </div>;
};
