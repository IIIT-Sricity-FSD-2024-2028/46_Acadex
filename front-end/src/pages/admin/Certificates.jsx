import React, { useEffect, useState } from 'react';
import { Eye, Copy, Printer, X, Award, BookOpen, ArrowUpRight } from 'lucide-react';
import { api, getItems } from '../../utils/api';
import { AdminHeader, AdminSearch, AdminEmpty } from '../../components/admin/AdminUI';
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
  return <div className="admin-page">
    <AdminHeader eyebrow="Learning achievements" title="Certificates" description="Every learner, course, and earned credential."/>
    {error && <p role="alert" className="admin-alert">{error}</p>}
    <div className="admin-toolbar"><AdminSearch label="Search certificates" value={search} onChange={setSearch} placeholder="Search learner, email, course or credential…"/><span className="admin-count-label">{loading?'Loading…':`${filtered.length} credentials`}</span></div>
    {loading?<div className="admin-card admin-empty"><p className="admin-muted">Loading certificates…</p></div>:!error&&<><div className="admin-grid">{filtered.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE).map(cert=><article className="admin-card admin-record" key={cert.id}><div className="admin-record-top"><span className="admin-icon-tile admin-icon-amber"><Award size={22}/></span><StatusBadge status={cert.status}/></div><p className="admin-record-category">Certificate of completion</p><h2 className="text-sm font-semibold mt-2">{cert.learnerName||'Name not recorded'}</h2><p className="admin-record-meta break-all">{cert.learnerEmail||'Email not recorded'}</p><div className="flex gap-2 mt-5 mb-5 rounded-xl bg-[#f6f8f2] p-3"><BookOpen size={15} className="shrink-0 mt-0.5"/><p className="text-xs leading-5">{cert.courseTitle||'Course not recorded'}</p></div><div className="admin-record-footer"><span className="admin-record-code">{cert.credentialId||cert.id}</span><button className="admin-button" disabled={busy} onClick={()=>view(cert)}>View<ArrowUpRight size={14}/></button></div></article>)}</div>{!filtered.length&&<AdminEmpty icon={Award} title="No certificates found" description="Earned credentials will appear here. Try a different search."/>}<Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage}/></>}

    {selected && <div className="admin-modal-backdrop" onClick={() => setSelected(null)}><section role="dialog" aria-modal="true" aria-labelledby="certificate-title" className="admin-modal" onClick={e => e.stopPropagation()}><div className="flex justify-between gap-3 mb-5"><h2 className="font-bold" id="certificate-title">Certificate preview</h2><button autoFocus className="admin-button !p-2" aria-label="Close certificate" onClick={() => setSelected(null)}><X size={18} /></button></div><article className="admin-certificate-document border-4 border-double border-blue-200 rounded-xl p-8 text-center space-y-4"><p className="text-blue-700 text-sm font-semibold uppercase tracking-wider">Certificate of completion</p><h3 className="text-3xl font-bold">{selected.learnerName}</h3><p className="admin-muted">{selected.learnerEmail || 'Email not recorded'}</p><p className="admin-muted pt-4">Completed course</p><p className="font-bold text-xl">{selected.courseTitle}</p><p className="text-xs text-slate-600 break-all pt-4">Credential: {selected.credentialId || selected.id}</p><StatusBadge status={selected.status} /></article>{error && <p className="admin-alert mt-4">{error}</p>}<div className="flex flex-wrap gap-3 mt-5"><button className="admin-button" onClick={copy}><Copy size={16} />{copied ? 'Link copied' : 'Copy verification link'}</button><button className="admin-button" onClick={print}><Printer size={16} /> Print certificate</button><a className="admin-button admin-button-primary" target="_blank" rel="noreferrer" href={`/verify/${encodeURIComponent(selected.credentialId || selected.id)}`}>Verify credential</a></div></section></div>}
  </div>;
};
