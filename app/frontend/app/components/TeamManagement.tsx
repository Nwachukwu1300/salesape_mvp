'use client';

import { useState, useEffect, FormEvent } from 'react';
import { apiFetch } from '../lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { toast } from 'sonner';

interface TeamMember {
  id: string;
  email: string;
  role: string;
  status: string;
  joinedAt?: string;
}

interface TeamData {
  id: string;
  name: string;
  members: TeamMember[];
}

export default function TeamManagement({ businessId }: { businessId: string }) {
  const [team, setTeam] = useState<TeamData | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetchTeam();
  }, [businessId]);

  const fetchTeam = async () => {
    try {
      const res = await apiFetch(`/businesses/${businessId}/team`);
      if (!res.ok) throw new Error('Failed to fetch team');
      const data = await res.json();
      setTeam(data);
    } catch (err) {
      console.error('Fetch team error:', err);
    }
  };

  const handleInvite = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setLoading(true);
    setMessage('');

    try {
      const res = await apiFetch(`/businesses/${businessId}/team/invite`, {
        method: 'POST',
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to invite');
      }

      setMessage(`Invitation sent to ${inviteEmail}`);
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
      setInviteRole('member');
      await fetchTeam();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Invitation failed';
      setMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!expanded) {
    return (
      <div className="mb-4">
        <Button variant="ghost" onClick={() => setExpanded(true)} size="sm">
          👥 Team Management
        </Button>
      </div>
    );
  }

  return (
    <div className="mb-6 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 enter-up">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Team Management</h3>
        <Button variant="ghost" size="sm" onClick={() => setExpanded(false)}>
          ✕
        </Button>
      </div>

        <div className="mb-6">
        <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Team Members</h4>
        <div className="space-y-2">
          {team?.members?.length ? (
            team.members.map(member => (
              <div
                key={member.id}
                className="flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700"
              >
                <div>
                  <div className="font-semibold text-sm">{member.email}</div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">
                    {member.role} • {member.status}
                  </div>
                </div>
                <div className="text-xs text-zinc-500">{member.status === 'active' ? '✓ Active' : '⏳ Pending'}</div>
              </div>
            ))
          ) : (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">No team members yet</p>
          )}
        </div>
      </div>

      <div className="mb-4">
        <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Invite Team Member</h4>
        <form onSubmit={handleInvite} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold mb-1">Email</label>
            <Input
              type="email"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              placeholder="team@example.com"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Role</label>
            <Select
              value={inviteRole}
              onChange={e => setInviteRole(e.target.value)}
              className="w-full rounded px-3 py-2"
              disabled={loading}
            >
              <option value="member">Member</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Inviting...' : 'Send Invitation'}
          </Button>
        </form>
      </div>

      {message && (
        <div className={`p-3 rounded text-sm ${message.includes('sent') ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
          {message}
        </div>
      )}
    </div>
  );
}
