import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter, Button, Input } from "../../../components/common";
import { User, Shield, Bell, Settings as SettingsIcon, EyeOff, Smartphone, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "../../../utils/cn";
import { api } from "../../../utils/api";
import { useInstructor } from "../../../context/InstructorContext";

const Toggle = ({ checked, onChange }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      className="sr-only peer"
      checked={checked}
      onChange={(e) => onChange && onChange(e.target.checked)}
    />
    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0056D2]"></div>
  </label>
);

export function Settings() {
  const { instructor } = useInstructor();
  const instructorId = instructor?.id || localStorage.getItem('nexuspay_instructor_id') || 'inst-1';
  const [activeTab, setActiveTab] = useState('account');
  const [settings, setSettings] = useState({
    email: instructor?.email || "",
    phone: instructor?.phone || "",
    courseActivityNotifs: true,
    studentActivityNotifs: true,
    marketingUpdates: false,
    language: "English (US)",
    timeZone: "Pacific Time (PT)",
    profileVisibility: true,
  });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordStatus, setPasswordStatus] = useState({ success: '', error: '', loading: false });

  useEffect(() => {
    if (!instructorId) return;
    api.get(`/instructors/${instructorId}`, "instructor")
      .then((data) => {
        if (data) {
          setSettings(prev => ({
            ...prev,
            email: data.email || prev.email,
            phone: data.phone || prev.phone,
          }));
        }
      })
      .catch((err) => console.error("Error fetching settings:", err));
  }, [instructorId]);

  const handleSave = () => {
    if (!instructorId) return;
    api.patch(`/instructors/${instructorId}`, {
      email: settings.email,
      phone: settings.phone,
    }, "instructor")
      .then(() => {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      })
      .catch((err) => console.error("Error updating settings:", err));
  };

  const handleChangePassword = async (e) => {
    e?.preventDefault();
    setPasswordStatus({ success: '', error: '', loading: true });

    if (!passwordData.currentPassword || !passwordData.newPassword) {
      setPasswordStatus({ success: '', error: 'Please enter both current and new password.', loading: false });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordStatus({ success: '', error: 'New password and confirm password do not match.', loading: false });
      return;
    }

    try {
      await api.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      }, 'instructor');
      setPasswordStatus({ success: 'Password changed successfully!', error: '', loading: false });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordStatus({ success: '', error: '', loading: false }), 4000);
    } catch (err) {
      setPasswordStatus({ success: '', error: err.message || 'Failed to update password. Please check your current password.', loading: false });
    }
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: SettingsIcon },
    { id: 'privacy', label: 'Privacy', icon: EyeOff },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto pb-12">
      <div className="w-full md:w-64 shrink-0 space-y-1">
        <div className="font-extrabold text-slate-900 px-3 mb-4 text-xl tracking-tight">Studio Settings</div>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold rounded-xl transition-colors",
              activeTab === tab.id 
                ? "bg-blue-50 text-[#0056D2] shadow-2xs border border-blue-200/60" 
                : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 space-y-6">
        {savedSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4" /> Settings updated successfully!
          </div>
        )}

        {activeTab === 'account' && (
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>Manage your primary instructor contact email and phone number.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Official University Email Address</label>
                <div className="flex gap-3">
                  <Input 
                    value={settings.email} 
                    onChange={e => setSettings({ ...settings, email: e.target.value })} 
                    className="max-w-md" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number</label>
                <div className="flex gap-3">
                  <Input 
                    type="tel" 
                    value={settings.phone} 
                    onChange={e => setSettings({ ...settings, phone: e.target.value })} 
                    className="max-w-md" 
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-slate-100 mt-6 pt-6">
              <Button onClick={handleSave}>Save Changes</Button>
            </CardFooter>
          </Card>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your instructor portal credentials.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 max-w-md">
                {passwordStatus.success && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0 text-emerald-600" /> {passwordStatus.success}
                  </div>
                )}
                {passwordStatus.error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
                    {passwordStatus.error}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Current Password</label>
                  <Input 
                    type="password" 
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">New Password</label>
                  <Input 
                    type="password" 
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Enter new password (min. 8 characters)"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Confirm New Password</label>
                  <Input 
                    type="password" 
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                  />
                </div>
                <Button 
                  onClick={handleChangePassword} 
                  disabled={passwordStatus.loading}
                  className="mt-2"
                >
                  {passwordStatus.loading ? 'Updating Password...' : 'Update Password'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>Add an extra layer of security to your academic account.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Authenticator App</h4>
                      <p className="text-xs text-slate-500">Not configured</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Set Up</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'notifications' && (
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Control when and how you receive alerts and student submissions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2 text-sm">Email Notifications</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">Course Activity</h5>
                    <p className="text-xs text-slate-500">When someone reviews your course or a course is approved.</p>
                  </div>
                  <Toggle 
                    checked={settings.courseActivityNotifs} 
                    onChange={v => setSettings({ ...settings, courseActivityNotifs: v })} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">Student Activity</h5>
                    <p className="text-xs text-slate-500">When a student enrolls or completes a course.</p>
                  </div>
                  <Toggle 
                    checked={settings.studentActivityNotifs} 
                    onChange={v => setSettings({ ...settings, studentActivityNotifs: v })} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">Platform Updates & Announcements</h5>
                    <p className="text-xs text-slate-500">Receive platform updates and instructor studio tips.</p>
                  </div>
                  <Toggle 
                    checked={settings.marketingUpdates} 
                    onChange={v => setSettings({ ...settings, marketingUpdates: v })} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'preferences' && (
          <Card>
            <CardHeader>
              <CardTitle>Platform Preferences</CardTitle>
              <CardDescription>Select language and time zone.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 max-w-md">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Language</label>
                <select 
                  value={settings.language}
                  onChange={e => setSettings({ ...settings, language: e.target.value })}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0056D2]"
                >
                  <option>English (US)</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Time Zone</label>
                <select 
                  value={settings.timeZone}
                  onChange={e => setSettings({ ...settings, timeZone: e.target.value })}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0056D2]"
                >
                  <option>Pacific Time (PT)</option>
                  <option>Eastern Time (ET)</option>
                  <option>Greenwich Mean Time (GMT)</option>
                </select>
              </div>
              <Button onClick={handleSave}>Save Preferences</Button>
            </CardContent>
          </Card>
        )}

        {activeTab === 'privacy' && (
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-slate-900 text-xs">Public Faculty Profile Visibility</h5>
                  <p className="text-xs text-slate-500">Allow students and organizations to view your verified educator credentials.</p>
                </div>
                <Toggle 
                  checked={settings.profileVisibility} 
                  onChange={v => setSettings({ ...settings, profileVisibility: v })} 
                />
              </div>
              <div className="pt-6 border-t border-slate-100">
                <h5 className="font-bold text-rose-600 mb-1 text-xs">Danger Zone</h5>
                <p className="text-xs text-slate-500 mb-4">Deleting your account is permanent and deletes all track curriculums.</p>
                <Button variant="danger" size="sm">Delete Account</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
