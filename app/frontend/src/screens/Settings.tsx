import React, { useState, useEffect } from "react";
import { getAccessToken } from "../lib/supabase";
import { Card, CardHeader, CardContent } from "../components/Card";
import { Button } from "../components/Button";
import { Badge } from "../components/Badge";
import { SidebarNav } from "../components/SidebarNav";
import { Shield, Lock, Bell, Zap } from "lucide-react";
import { ConfirmModal } from "../components/ConfirmModal";
import { useTheme } from "../contexts/ThemeContext";
import { ThemeToggle } from "../components/ThemeToggle";
import { toast } from "sonner";

export function Settings() {
  const [businessData, setBusinessData] = useState<any>(null);
  const { theme, setTheme } = useTheme();
  const [growthMode, setGrowthMode] = useState("BALANCED");
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

      const response = await fetch("http://localhost:3001/businesses", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const businesses = await response.json();
        if (businesses.length > 0) {
          setBusinessData(businesses[0]);
          setGrowthMode(businesses[0].growthMode || "BALANCED");
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

      const res = await fetch(`/api/settings`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const s = await res.json();
        setMemoryEnabled(!!s.memoryEnabled);
        setTopK(s.topK || 5);
        setTtlDays(s.ttlDays || 30);
        setTwoFA(!!s.twoFA);
        setGrowthMode(s.growthMode || "BALANCED");
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

      const payload = { memoryEnabled, topK, ttlDays, twoFA, growthMode };
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


  useEffect(() => {
    // wire theme buttons
    const sys = document.getElementById('theme-system');
    const lt = document.getElementById('theme-light');
    const dk = document.getElementById('theme-dark');
    if (sys) sys.onclick = () => setTheme('system');
    if (lt) lt.onclick = () => setTheme('light');
    if (dk) dk.onclick = () => setTheme('dark');
    return () => {
      if (sys) sys.onclick = null;
      if (lt) lt.onclick = null;
      if (dk) dk.onclick = null;
    };
  }, [setTheme]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <SidebarNav collapsed={false} setCollapsed={() => {}} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-gray-500">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
     <SidebarNav collapsed={false} setCollapsed={() => {}} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">Theme</span>
            <button id="theme-system" className="px-2 py-1 rounded border">System</button>
            <button id="theme-light" className="px-2 py-1 rounded border">Light</button>
            <button id="theme-dark" className="px-2 py-1 rounded border">Dark</button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Growth Strategy Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold">Growth Strategy</h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Choose how aggressively your content repurposing system works</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div onClick={() => setGrowthMode("CONSERVATIVE")} className={`p-4 border rounded-lg cursor-pointer transition-all ${growthMode === "CONSERVATIVE" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-gray-600 hover:border-gray-400"}`}>
                  <h3 className="font-semibold mb-2">Conservative</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Minimal rewriting, minimal variants</p>
                  <Badge variant="info">1 variant</Badge>
                </div>

                <div onClick={() => setGrowthMode("BALANCED")} className={`p-4 border rounded-lg cursor-pointer transition-all ${growthMode === "BALANCED" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-gray-600 hover:border-gray-400"}`}>
                  <h3 className="font-semibold mb-2">Balanced</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">3-5 variants, moderate rewriting</p>
                  <Badge variant="success">3 variants</Badge>
                </div>

                <div onClick={() => setGrowthMode("AGGRESSIVE")} className={`p-4 border rounded-lg cursor-pointer transition-all ${growthMode === "AGGRESSIVE" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-gray-600 hover:border-gray-400"}`}>
                  <h3 className="font-semibold mb-2">Aggressive</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">5-10 variants, stronger hooks</p>
                  <Badge variant="warning">5+ variants</Badge>
                </div>
              </div>

              <div className="pt-4">
                <Button variant="primary" onClick={handleSaveAll}>Save Settings</Button>
                {saved && <p className="text-green-600 text-sm mt-2">✓ Settings saved successfully</p>}
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
                <input type="email" value={businessData?.email || ""} disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-600 disabled:opacity-50" />
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
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span>Content generation completed</span>
              </label>
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
              <Button variant="outline" className="w-full">Change Password</Button>
              <Button variant="outline" className="w-full">Two-Factor Authentication</Button>
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
