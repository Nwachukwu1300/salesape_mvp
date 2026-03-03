import React, { useState, useEffect } from "react";
import { getAccessToken } from "../lib/supabase";
import { Card, CardHeader, CardContent } from "../components/Card";
import { Button } from "../components/Button";
import { Badge } from "../components/Badge";
import { Shield, Lock, Bell } from "lucide-react";
import { ConfirmModal } from "../components/ConfirmModal";
import { useAuth } from "../contexts/AuthContext";
import { ThemeToggle } from "../components/ThemeToggle";
import { toast } from "sonner";

export function Settings() {
  const { user } = useAuth();
  const [businessData, setBusinessData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  // local settings state
  const [memoryEnabled, setMemoryEnabled] = useState(false);
  const [topK, setTopK] = useState(5);
  const [ttlDays, setTtlDays] = useState(30);
  const [twoFA, setTwoFA] = useState(false);

  useEffect(() => {
    fetchBusinessData();
    fetchUserSettings();
  }, []);

  const fetchBusinessData = async () => {
    try {
      setLoading(true);
      const token = getAccessToken();
      if (!token) return;

      // use relative path; dev server proxy will forward to backend
      const response = await fetch("/businesses", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const businesses = await response.json();
        if (businesses.length > 0) {
          setBusinessData(businesses[0]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch business data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSettings = async () => {
    try {
      setLoading(true);
      const token = getAccessToken();
      if (!token) return;

      // relative /api path to be proxied by vite dev server
      const res = await fetch(`/api/settings`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const s = await res.json();
        setMemoryEnabled(!!s.memoryEnabled);
        setTopK(s.topK || 5);
        setTtlDays(s.ttlDays || 30);
        setTwoFA(!!s.twoFA);
      }
    } catch (err) {
      console.error('Failed to load settings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    try {
      const token = getAccessToken();
      if (!token) { toast.error('Not authenticated'); return; }

      const payload = { memoryEnabled, topK, ttlDays, twoFA };
      const res = await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const err = await res.json();
        toast.error('Save failed: ' + (err?.error || res.statusText));
      }
    } catch (err) {
      console.error('Failed to save settings', err);
      toast.error('Save failed');
    }
  };

  const handleDeleteContent = async () => {
    setShowDeleteContentModal(true);
  };

  const handleScheduleAccountDeletion = async () => {
    setShowAccountDeleteModal(true);
  };


  // Confirm modals state
  const [showDeleteContentModal, setShowDeleteContentModal] = useState(false);
  const [showAccountDeleteModal, setShowAccountDeleteModal] = useState(false);

  const doDeleteContent = async () => {
    const token = getAccessToken();
    if (!token) { toast.error('Not authenticated'); return; }
    const res = await fetch('/api/settings/delete-content', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      const j = await res.json();
      toast.success(`Deleted content: repurposed=${j.deletedRepurposed}, inputs=${j.deletedInputs}`);
    } else {
      const e = await res.json();
      toast.error('Delete content failed: '+ (e?.error || res.statusText));
    }
    setShowDeleteContentModal(false);
  };

  const doScheduleAccountDeletion = async (typed?: string) => {
    if (String(typed || '').trim() !== 'DELETE MY ACCOUNT') return toast.error('Confirmation mismatch');
    const token = getAccessToken();
    if (!token) { toast.error('Not authenticated'); return; }

    const res = await fetch('/api/settings/delete-account', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ typedConfirmation: typed }) });
    if (res.ok) {
      const j = await res.json();
      toast.success('Account deletion scheduled for: '+ new Date(j.scheduledAt).toLocaleString());
      setShowAccountDeleteModal(false);
    } else {
      const e = await res.json();
      toast.error('Account deletion scheduling failed: '+ (e?.error || res.statusText));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-gray-500">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">Theme</span>
            <ThemeToggle />
          </div>
        </div>

        <div className="space-y-6">
          {/* Assistant Memory Section */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">Assistant Memory</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Configure how much context APE stores and retrieves.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium">Enable memory</span>
                <input
                  type="checkbox"
                  checked={memoryEnabled}
                  onChange={(e) => setMemoryEnabled(e.target.checked)}
                  className="w-4 h-4"
                />
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium">Retrieval depth (topK)</span>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={topK}
                    onChange={(e) => setTopK(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium">Memory retention (days)</span>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={ttlDays}
                    onChange={(e) => setTtlDays(Math.max(1, Math.min(365, Number(e.target.value) || 1)))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600"
                  />
                </label>
              </div>
              <div className="pt-4">
                <Button variant="primary" onClick={handleSaveAll}>Save Settings</Button>
                {saved && <p className="text-green-600 text-sm mt-2">Settings saved successfully.</p>}
              </div>
            </CardContent>
          </Card>

          {/* Account Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-green-600" />
                <h2 className="text-xl font-bold">Account</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Business Name</label>
                <input type="text" value={businessData?.name || ""} disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-600 disabled:opacity-50" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Business Email</label>
                <input type="email" value={user?.email || ""} disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-600 disabled:opacity-50" />
              </div>
            </CardContent>
          </Card>

          {/* Brand Identity Section */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">Brand Identity</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Brand Voice</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600">
                  <option>Professional</option>
                  <option>Casual</option>
                  <option>Creative</option>
                  <option>Authoritative</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Notifications Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-orange-600" />
                <h2 className="text-xl font-bold">Notifications</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Notification preferences are currently managed by email defaults and will become configurable here.
              </p>
            </CardContent>
          </Card>

          {/* Security Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-red-600" />
                <h2 className="text-xl font-bold">Security</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => toast.info("Password changes are managed by your auth provider.")}
              >
                Change Password
              </Button>
              <Button
                variant={twoFA ? "primary" : "outline"}
                className="w-full"
                onClick={() => setTwoFA((v) => !v)}
              >
                Two-Factor Authentication: {twoFA ? "Enabled" : "Disabled"}
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200 dark:border-red-900">
            <CardHeader>
              <h2 className="text-xl font-bold text-red-600">Danger Zone</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full border-red-500 text-red-600 hover:bg-red-50" onClick={handleDeleteContent}>Delete All Content</Button>
              <Button variant="outline" className="w-full border-red-500 text-red-600 hover:bg-red-50" onClick={handleScheduleAccountDeletion}>Delete Business Account</Button>
            </CardContent>
          </Card>

          {/* Confirm Modals */}
          <ConfirmModal open={showDeleteContentModal} title="Delete all content" description="This will permanently delete application-owned content for your business (repurposed content, inputs, assets)." confirmText="Delete content" cancelText="Cancel" onCancel={() => setShowDeleteContentModal(false)} onConfirm={() => doDeleteContent()} />

          <ConfirmModal open={showAccountDeleteModal} title="Schedule account deletion" description="This schedules deletion of your account and all application data in 14 days. To confirm, type DELETE MY ACCOUNT below." confirmText="Schedule deletion" cancelText="Cancel" typedConfirmation="DELETE MY ACCOUNT" onCancel={() => setShowAccountDeleteModal(false)} onConfirm={(typed) => doScheduleAccountDeletion(typed)} />
        </div>
      </div>
    </div>
  );
}
