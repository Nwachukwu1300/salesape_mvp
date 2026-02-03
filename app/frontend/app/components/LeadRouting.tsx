'use client';

import { useState, useEffect, FormEvent } from 'react';
import { apiFetch } from '../lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { toast } from 'sonner';

interface LeadRoutingRule {
  id: string;
  assignTo: string;
  service: string | null;
  leadSource: string | null;
  priority: number;
  isActive: boolean;
}

export default function LeadRouting({ businessId }: { businessId: string }) {
  const [rules, setRules] = useState<LeadRoutingRule[]>([]);
  const [assignTo, setAssignTo] = useState('');
  const [service, setService] = useState('');
  const [leadSource, setLeadSource] = useState('');
  const [priority, setPriority] = useState('0');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetchRules();
  }, [businessId]);

  const fetchRules = async () => {
    try {
      const res = await apiFetch(`/businesses/${businessId}/lead-routing`);
      if (!res.ok) throw new Error('Failed to fetch rules');
      const data = await res.json();
      setRules(data);
    } catch (err) {
      console.error('Fetch rules error:', err);
    }
  };

  const handleCreateRule = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!assignTo.trim()) {
      setMessage('Please enter an email address');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const res = await apiFetch(`/businesses/${businessId}/lead-routing`, {
        method: 'POST',
        body: JSON.stringify({
          assignTo,
          service: service || null,
          leadSource: leadSource || null,
          priority: parseInt(priority),
        }),
      });

      if (!res.ok) throw new Error('Failed to create rule');
      setMessage('Routing rule created');
      toast.success('Routing rule created');
      setAssignTo('');
      setService('');
      setLeadSource('');
      setPriority('0');
      await fetchRules();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create rule';
      setMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRule = async (ruleId: string, isActive: boolean) => {
    try {
      await apiFetch(`/lead-routing/${ruleId}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !isActive }),
      });
      await fetchRules();
    } catch (err) {
      console.error('Toggle rule error:', err);
    }
  };

  if (!expanded) {
    return (
      <div className="mb-4">
        <Button variant="ghost" size="sm" onClick={() => setExpanded(true)}>
          🔀 Lead Routing
        </Button>
      </div>
    );
  }

  return (
    <div className="mb-6 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 enter-up">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Lead Routing Rules</h3>
        <Button variant="ghost" size="sm" onClick={() => setExpanded(false)}>
          ✕
        </Button>
      </div>

      <div className="mb-6">
        <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Active Rules</h4>
        <div className="space-y-2">
          {rules?.length ? (
            rules.map(rule => (
              <div
                key={rule.id}
                className="flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700"
              >
                <div className="flex-1">
                  <div className="text-sm">
                    <strong>Assign to:</strong> {rule.assignTo}
                  </div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                    {rule.service && `Service: ${rule.service} • `}
                    {rule.leadSource && `Source: ${rule.leadSource} • `}
                    Priority: {rule.priority}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleToggleRule(rule.id, rule.isActive)}
                  className={rule.isActive ? 'px-3 py-1' : 'px-3 py-1'}
                  variant={rule.isActive ? 'secondary' : 'ghost'}
                >
                  {rule.isActive ? 'Active' : 'Inactive'}
                </Button>
              </div>
            ))
          ) : (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">No routing rules yet</p>
          )}
        </div>
      </div>

      <div className="mb-4">
        <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Create New Rule</h4>
        <form onSubmit={handleCreateRule} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold mb-1">Assign To (Email) *</label>
            <Input
              type="email"
              value={assignTo}
              onChange={e => setAssignTo(e.target.value)}
              placeholder="team@example.com"
              disabled={loading}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Service (optional)</label>
              <Input
                type="text"
                value={service}
                onChange={e => setService(e.target.value)}
                placeholder="e.g., consultation"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Lead Source (optional)</label>
              <Select
                value={leadSource}
                onChange={e => setLeadSource(e.target.value)}
                className="w-full rounded px-3 py-2"
                disabled={loading}
              >
                <option value="">All Sources</option>
                <option value="web">Web</option>
                <option value="instagram">Instagram</option>
                <option value="direct">Direct</option>
                <option value="sms">SMS</option>
              </Select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Priority</label>
            <Input
              type="number"
              value={priority}
              onChange={e => setPriority(e.target.value)}
              min={0}
              max={10}
              disabled={loading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Create Rule'}
          </Button>
        </form>
      </div>

      {message && (
        <div className={`p-3 rounded text-sm ${message.includes('created') ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
          {message}
        </div>
      )}
    </div>
  );
}
