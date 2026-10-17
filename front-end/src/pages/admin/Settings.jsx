import React, { useEffect, useState } from 'react';
import { Bell, Send, Settings as SettingsIcon } from 'lucide-react';
import { api, getItems } from '../../utils/api';
import '../../styles/admin-panels.css';

export const Settings = () => {
  const [settings, setSettings] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [form, setForm] = useState({ title: '', desc: '', recipientRole: 'all' });

  const loadNotifications = async () => {
    const data = await api.get('/notifications?role=admin&limit=1000');
    setNotifications(getItems(data));
  };
  useEffect(() => {
    Promise.all([api.get('/settings').then(setSettings), loadNotifications()])
      .catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  async function run(action, success) {
    setError(''); setMessage(''); setBusy(true);
    try { await action(); setMessage(success); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  function save(event) {
    event.preventDefault();
    run(async () => {
      const { emailAlerts, weeklyDigest, royaltyAlerts, defaultCurrency } = settings;
      setSettings(await api.patch('/settings', { emailAlerts: !!emailAlerts, weeklyDigest: !!weeklyDigest, royaltyAlerts: !!royaltyAlerts, defaultCurrency }));
    }, 'Preferences saved.');
  }
  function markRead(id) {
    run(async () => {
      await api.patch(`/notifications/${id}/read`, {});
      await loadNotifications();
    }, 'Notification marked as read.');
  }
  function markAllRead() {
    run(async () => {
      await api.patch('/notifications/mark-all-read?role=admin', {});
      await loadNotifications();
    }, 'Notifications marked as read.');
  }
  function broadcast(event) {
    event.preventDefault();
    run(async () => {
      await api.post('/notifications', { title: form.title.trim(), desc: form.desc.trim(), recipientRole: form.recipientRole, category: 'System' });
      setForm({ title: '', desc: '', recipientRole: 'all' });
      await loadNotifications();
    }, 'Notification created for the selected audience.');
  }
  const unread = notifications.filter(n => !n.read).length;
  return <div className="admin-page">
    <header><h1 className="admin-heading">Settings & Notifications</h1><p className="admin-muted mt-2">Preferences and updates for platform operations.</p></header>
    {error && <p role="alert" className="admin-alert">{error}</p>}
    {message && <p role="status" className="admin-success">{message}</p>}
    {loading ? <p className="admin-muted">Loading settings and notifications…</p> : <div className="grid gap-6 xl:grid-cols-[minmax(18rem,1fr)_2fr] items-start">
      <div className="grid gap-6">
        <form className="admin-card space-y-5" onSubmit={save}>
          <h2 className="font-bold text-lg flex gap-2 items-center"><SettingsIcon size={20} /> Preferences</h2>
          {settings ? <>
            {[['emailAlerts', 'Email alerts'], ['weeklyDigest', 'Weekly digest'], ['royaltyAlerts', 'Payment alerts']].map(([key, label]) => <label key={key} className="flex justify-between gap-4 border-b border-slate-100 pb-4 text-sm font-medium"><span>{label}</span><input type="checkbox" className="w-5 h-5 accent-blue-600" checked={!!settings[key]} onChange={e => setSettings({ ...settings, [key]: e.target.checked })} /></label>)}
            <label className="block text-sm font-medium">Currency<select className="admin-input mt-2" value={settings.defaultCurrency || 'USD'} onChange={e => setSettings({ ...settings, defaultCurrency: e.target.value })}>{['USD', 'INR', 'EUR', 'GBP'].map(c => <option key={c}>{c}</option>)}</select></label>
            <button disabled={busy} className="admin-button admin-button-primary">Save preferences</button>
          </> : <p className="admin-muted">Settings could not be loaded.</p>}
        </form>
        <form className="admin-card space-y-4" onSubmit={broadcast}>
          <h2 className="font-bold text-lg flex gap-2 items-center"><Send size={20} /> Create notification</h2>
          <label className="block text-sm font-medium">Title<input className="admin-input mt-2" required maxLength={160} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></label>
          <label className="block text-sm font-medium">Message<textarea className="admin-input mt-2" required rows={3} value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} /></label>
          <label className="block text-sm font-medium">Audience<select className="admin-input mt-2" value={form.recipientRole} onChange={e => setForm({ ...form, recipientRole: e.target.value })}>{[['all', 'All actors'], ['student', 'Learners'], ['organization', 'Organizations'], ['instructor', 'Instructors'], ['admin', 'Admins']].map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          <button className="admin-button admin-button-primary" disabled={busy || !form.title.trim() || !form.desc.trim()}>Create notification</button>
        </form>
      </div>
      <section className="admin-card space-y-5">
        <div className="flex flex-wrap justify-between items-center gap-3"><h2 className="font-bold text-lg flex items-center gap-2"><Bell size={20} /> Notifications <span className="text-sm text-slate-500">{unread} unread</span></h2><button disabled={busy || !unread} onClick={markAllRead} className="admin-button">Mark all as read</button></div>
        <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={unreadOnly} onChange={e => setUnreadOnly(e.target.checked)} /> Show unread only</label>
        <div className="space-y-3">{notifications.filter(n => !unreadOnly || !n.read).map(n => <article key={n.id} className={`rounded-xl p-4 border ${n.read ? 'border-slate-200 bg-slate-50' : 'border-blue-200 bg-blue-50/50'}`}><div className="flex flex-wrap justify-between items-start gap-3"><h3 className="font-semibold text-sm">{n.title}</h3>{!n.read && <button disabled={busy} onClick={() => markRead(n.id)} className="text-xs text-blue-700 font-semibold">Mark as read</button>}</div><p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap">{n.desc || n.message}</p><p className="text-xs text-slate-500 mt-3">{n.createdAt ? new Date(n.createdAt).toLocaleString() : n.time}</p></article>)}</div>
        {!notifications.some(n => !unreadOnly || !n.read) && <p className="admin-muted py-6 text-center">{unreadOnly ? 'No unread notifications.' : 'No notifications recorded.'}</p>}
      </section>
    </div>}
  </div>;
};
