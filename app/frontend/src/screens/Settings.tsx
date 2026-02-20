import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { SidebarNav } from '../components/SidebarNav';
import { Shield, Lock, Bell, Zap } from 'lucide-react';

export function Settings() {
  const [businessData, setBusinessData] = useState<any>(null);
  const [growthMode, setGrowthMode] = useState('BALANCED');
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchBusinessData();
  }, []);

  const fetchBusinessData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('supabase.auth.token');
      if (!token) return;

      const response = await fetch('http://localhost:3001/businesses', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const businesses = await response.json();
        if (businesses.length > 0) {
          setBusinessData(businesses[0]);
          setGrowthMode(businesses[0].growthMode || 'BALANCED');
        }
      }
    } catch (error) {
      console.error('Failed to fetch business data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGrowthMode = async () => {
    try {
      if (!businessData?.id) return;
      
      const token = localStorage.getItem('supabase.auth.token');
      const response = await fetch(`http://localhost:3001/businesses/${businessData.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ growthMode }),
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save growth mode:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <SidebarNav currentPath="/settings" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-gray-500">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SidebarNav currentPath="/settings" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Settings
        </h1>

        <div className="space-y-6">
          {/* Growth Strategy Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold">Growth Strategy</h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Choose how aggressively your content repurposing system works
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* CONSERVATIVE Option */}
                <div
                  onClick={() => setGrowthMode('CONSERVATIVE')}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    growthMode === 'CONSERVATIVE'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <h3 className="font-semibold mb-2">Conservative</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Minimal rewriting, minimal variants
                  </p>
                  <Badge variant="info">1 variant</Badge>
                </div>

                {/* BALANCED Option */}
                <div
                  onClick={() => setGrowthMode('BALANCED')}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    growthMode === 'BALANCED'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <h3 className="font-semibold mb-2">Balanced</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    3-5 variants, moderate rewriting
                  </p>
                  <Badge variant="success">3 variants</Badge>
                </div>

                {/* AGGRESSIVE Option */}
                <div
                  onClick={() => setGrowthMode('AGGRESSIVE')}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    growthMode === 'AGGRESSIVE'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <h3 className="font-semibold mb-2">Aggressive</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    5-10 variants, stronger hooks
                  </p>
                  <Badge variant="warning">5+ variants</Badge>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  variant="primary"
                  onClick={handleSaveGrowthMode}
                >
                  Save Growth Strategy
                </Button>
                {saved && (
                  <p className="text-green-600 text-sm mt-2">✓ Settings saved successfully</p>
                )}
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
                <input
                  type="text"
                  value={businessData?.name || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-600 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Business Email</label>
                <input
                  type="email"
                  value={businessData?.email || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-600 disabled:opacity-50"
                />
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
              <div>
                <label className="block text-sm font-medium mb-2">Primary Colors</label>
                <div className="flex gap-3">
                  <input type="color" defaultValue="#f724de" className="w-12 h-10 rounded" />
                  <input type="color" defaultValue="#ffffff" className="w-12 h-10 rounded" />
                </div>
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
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span>Weekly performance digest</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="w-4 h-4" />
                <span>New features announced</span>
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
              <Button variant="outline" className="w-full">
                Change Password
              </Button>
              <Button variant="outline" className="w-full">
                Two-Factor Authentication
              </Button>
              <Button variant="outline" className="w-full">
                Connected Accounts
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200 dark:border-red-900">
            <CardHeader>
              <h2 className="text-xl font-bold text-red-600">Danger Zone</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full border-red-500 text-red-600 hover:bg-red-50">
                Delete All Content
              </Button>
              <Button variant="outline" className="w-full border-red-500 text-red-600 hover:bg-red-50">
                Delete Business Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
