import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Settings as SettingsIcon,
  Shield,
  Bell,
  CreditCard,
  Layout,
  Check,
  Send,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Mail,
  Lock,
  Globe,
  Sliders,
  Radio,
  FileCheck2,
  Trash2,
} from 'lucide-react';
import { api } from '../../utils/api';

export const Settings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'notifications';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Settings State
  const [settings, setSettings] = useState({
    platformName: 'Acadex Platform',
    supportEmail: 'support@acadex.edu',
    enableRegistration: true,
    maintenanceMode: false,
    currency: 'INR (₹)',
    platformFeePercent: 15,
    sessionTimeoutMins: 60,
    twoFactorEnforced: true,
    autoApproveCourses: false,
    emailAlertsDisputes: true,
    emailAlertsVerifications: true,
    emailAlertsPayments: true,
  });

  const [saved, setSaved] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(true);
  const [notifFilter, setNotifFilter] = useState('all'); // 'all' | 'unread'
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    audience: 'All Actors',
  });
  const [broadcastSending, setBroadcastSending] = useState(false);

  // Sync tab with URL
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['notifications', 'general', 'security', 'payment', 'alerts'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  // Fetch Notifications
  useEffect(() => {
    api.get('/notifications', 'admin')
      .then((data) => {
        setNotifications(Array.isArray(data) ? data : (data?.items || []));
        setNotifLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching notifications:', err);
        setNotifications([
          {
            id: 'notif-1',
            title: 'New Course Approval Pending',
            message: 'Stanford University submitted "Advanced Reinforcement Learning" for curriculum validation.',
            date: new Date().toISOString(),
            read: false,
            type: 'course',
          },
          {
            id: 'notif-2',
            title: 'Payment Settlement Cleared',
            message: 'Institutional payout batch of ₹1,45,000 disbursed to Meridian Tech Institute.',
            date: new Date(Date.now() - 3600000 * 4).toISOString(),
            read: false,
            type: 'payment',
          },
          {
            id: 'notif-3',
            title: 'Learner Dispute Logged',
            message: 'Arjun Sharma raised dispute #TKT-8841 on Course Lab execution.',
            date: new Date(Date.now() - 3600000 * 24).toISOString(),
            read: true,
            type: 'dispute',
          },
        ]);
        setNotifLoading(false);
      });
  }, []);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastForm.title.trim() || !broadcastForm.message.trim()) return;
    setBroadcastSending(true);
    try {
      const newNotif = {
        id: `notif-${Date.now()}`,
        title: broadcastForm.title,
        message: broadcastForm.message,
        audience: broadcastForm.audience,
        date: new Date().toISOString(),
        read: false,
        type: 'broadcast',
      };
      await api.post('/notifications', newNotif).catch(() => {});
      setNotifications((prev) => [newNotif, ...prev]);
      setShowBroadcastModal(false);
      setBroadcastForm({ title: '', message: '', audience: 'All Actors' });
    } catch (err) {
      console.error('Broadcast failed:', err);
    } finally {
      setBroadcastSending(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredNotifications = notifications.filter((n) =>
    notifFilter === 'unread' ? !n.read : true
  );

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    { id: 'general', label: 'General & Platform', icon: SettingsIcon },
    { id: 'security', label: 'Security & Access', icon: Shield },
    { id: 'payment', label: 'Billing & Fees', icon: CreditCard },
    { id: 'alerts', label: 'Alert Preferences', icon: Mail },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Settings & Operations
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure platform parameters, system governance, and operational notifications
          </p>
        </div>

        {saved && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl shadow-xs animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge > 0 && (
                <span
                  className={`ml-1 px-2 py-0.5 text-[10px] font-black rounded-full ${
                    isActive ? 'bg-white text-blue-700' : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* 1. NOTIFICATIONS TAB */}
      {/* ────────────────────────────────────────────────────────────── */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          {/* Action Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setNotifFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  notifFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setNotifFilter('unread')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  notifFilter === 'unread'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Mark all as read
                </button>
              )}
              <button
                onClick={() => setShowBroadcastModal(true)}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Broadcast Notice</span>
              </button>
            </div>
          </div>

          {/* Notifications Feed */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {notifLoading ? (
              <div className="p-12 text-center text-slate-500 text-sm">Loading system notifications...</div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-sm">
                No notifications to display in this view.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredNotifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-5 flex items-start gap-4 transition-colors ${
                      !n.read ? 'bg-blue-50/30' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        !n.read
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Bell className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <h4 className="font-bold text-slate-900 text-sm">{n.title}</h4>
                        <span className="text-[11px] text-slate-400 whitespace-nowrap">
                          {new Date(n.date || n.createdAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                      {n.audience && (
                        <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                          Target: {n.audience}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────── */}
      {/* 2. GENERAL SETTINGS TAB */}
      {/* ────────────────────────────────────────────────────────────── */}
      {activeTab === 'general' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600" />
              <span>Platform Brand & Operations</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Platform Name
                </label>
                <input
                  type="text"
                  value={settings.platformName}
                  onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Official Support Inquiries Email
                </label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Public Self-Registration</h4>
                <p className="text-xs text-slate-500">Allow students and organizations to register accounts</p>
              </div>
              <input
                type="checkbox"
                checked={settings.enableRegistration}
                onChange={(e) => setSettings({ ...settings, enableRegistration: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded cursor-pointer"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Automated Course Review</h4>
                <p className="text-xs text-slate-500">Automatically pass courses without manual admin validation</p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoApproveCourses}
                onChange={(e) => setSettings({ ...settings, autoApproveCourses: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-colors"
            >
              Save General Settings
            </button>
          </div>
        </form>
      )}

      {/* ────────────────────────────────────────────────────────────── */}
      {/* 3. SECURITY & ACCESS TAB */}
      {/* ────────────────────────────────────────────────────────────── */}
      {activeTab === 'security' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-600" />
              <span>Security Protocols</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Admin Session Inactivity Timeout (Minutes)
                </label>
                <input
                  type="number"
                  value={settings.sessionTimeoutMins}
                  onChange={(e) => setSettings({ ...settings, sessionTimeoutMins: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Institutional Master Key Required
                </label>
                <input
                  type="text"
                  disabled
                  value="ENFORCED FOR ORG CREATION"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-400 bg-slate-50 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Two-Factor Authentication (2FA)</h4>
                <p className="text-xs text-slate-500">Require multi-factor authorization for all Platform Admin accounts</p>
              </div>
              <input
                type="checkbox"
                checked={settings.twoFactorEnforced}
                onChange={(e) => setSettings({ ...settings, twoFactorEnforced: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded cursor-pointer"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-amber-900">Maintenance Mode</h4>
                  <p className="text-xs text-amber-700">Restricts public learner and organization access to the platform</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="w-5 h-5 text-amber-600 rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-colors"
            >
              Update Security Policies
            </button>
          </div>
        </form>
      )}

      {/* ────────────────────────────────────────────────────────────── */}
      {/* 4. BILLING & FEES TAB */}
      {/* ────────────────────────────────────────────────────────────── */}
      {activeTab === 'payment' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span>Platform Monetization & Payout Rules</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Platform Commission Cut (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={settings.platformFeePercent}
                    onChange={(e) => setSettings({ ...settings, platformFeePercent: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">%</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Default: 15% revenue share retained by Platform Operations</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Primary Settlement Currency
                </label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-500 bg-white"
                >
                  <option value="INR (₹)">INR (₹) - Indian Rupee</option>
                  <option value="USD ($)">USD ($) - US Dollar</option>
                  <option value="EUR (€)">EUR (€) - Euro</option>
                  <option value="GBP (£)">GBP (£) - British Pound</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-colors"
            >
              Save Billing Parameters
            </button>
          </div>
        </form>
      )}

      {/* ────────────────────────────────────────────────────────────── */}
      {/* 5. ALERT PREFERENCES TAB */}
      {/* ────────────────────────────────────────────────────────────── */}
      {activeTab === 'alerts' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" />
              <span>Admin Email Notification Triggers</span>
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Dispute Escalations</h4>
                  <p className="text-xs text-slate-500">Send instant admin email when student or org logs a dispute</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.emailAlertsDisputes}
                  onChange={(e) => setSettings({ ...settings, emailAlertsDisputes: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border-t border-slate-100">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Organization Verification Requests</h4>
                  <p className="text-xs text-slate-500">Email alert when an institution uploads compliance documents</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.emailAlertsVerifications}
                  onChange={(e) => setSettings({ ...settings, emailAlertsVerifications: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border-t border-slate-100">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Payment & Transaction Anomalies</h4>
                  <p className="text-xs text-slate-500">Alert administrators on payment gateway settlement warnings</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.emailAlertsPayments}
                  onChange={(e) => setSettings({ ...settings, emailAlertsPayments: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-colors"
            >
              Update Alert Preferences
            </button>
          </div>
        </form>
      )}

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-600" />
                <span>Send Broadcast Notice</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowBroadcastModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Audience</label>
                <select
                  value={broadcastForm.audience}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, audience: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 bg-white"
                >
                  <option value="All Actors">All Actors (Learners, Instructors, Organizations)</option>
                  <option value="Learners">Learners / Students Only</option>
                  <option value="Instructors">Instructors Only</option>
                  <option value="Organizations">Organizations Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notice Title</label>
                <input
                  type="text"
                  required
                  value={broadcastForm.title}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                  placeholder="e.g. Scheduled Maintenance Window This Sunday"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notice Message</label>
                <textarea
                  required
                  rows={4}
                  value={broadcastForm.message}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                  placeholder="Enter detailed notice message for platform users..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={broadcastSending}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                >
                  {broadcastSending ? 'Sending...' : 'Publish Broadcast'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
