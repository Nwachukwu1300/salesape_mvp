'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/app/lib/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select } from './ui/select';
import { toast } from 'sonner';

interface Lead {
  id: string;
  name: string;
  email: string;
  company?: string;
  message?: string;
  status: string;
  source?: string;
  createdAt: string;
  score?: number;
}

interface CRMDashboardProps {
  businessId: string;
}

export default function CRMDashboard({ businessId }: CRMDashboardProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    converted: 0,
  });

  useEffect(() => {
    fetchLeads();
  }, [businessId]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(
        `/businesses/${businessId}/leads`,
        { method: 'GET' }
      );
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
        updateStats(data.leads || []);
      }
    } catch (err) {
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (leadsList: Lead[]) => {
    setStats({
      total: leadsList.length,
      new: leadsList.filter(l => l.status === 'new').length,
      contacted: leadsList.filter(l => l.status === 'contacted').length,
      converted: leadsList.filter(l => l.status === 'converted').length,
    });
  };

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const res = await apiFetch(
        `/businesses/${businessId}/leads/${leadId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (res.ok) {
        fetchLeads();
        toast.success('Lead status updated');
      }
    } catch (err) {
      toast.error('Failed to update lead');
    }
  };

  const sendEmail = async (leadId: string) => {
    try {
      const res = await apiFetch(
        `/businesses/${businessId}/leads/${leadId}/send-email`,
        { method: 'POST' }
      );
      if (res.ok) {
        toast.success('Email sent');
      }
    } catch (err) {
      toast.error('Failed to send email');
    }
  };

  const filteredLeads = filterStatus === 'all'
    ? leads
    : leads.filter(l => l.status === filterStatus);

  const conversionRate = stats.total > 0
    ? Math.round((stats.converted / stats.total) * 100)
    : 0;

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Lead Management
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Track and manage all your incoming leads in one place
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {stats.total}
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">Total Leads</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.new}
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">New</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {stats.contacted}
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">Contacted</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {conversionRate}%
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">Conversion</div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <Select
          value={filterStatus}
          onChange={(e: any) => setFilterStatus(e.target.value)}
          className="w-40 rounded px-3 py-2"
        >
          <option value="all">All Leads</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="converted">Converted</option>
          <option value="declined">Declined</option>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leads List */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
                Leads ({filteredLeads.length})
              </h2>
            </div>
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-zinc-500">Loading...</div>
              ) : filteredLeads.length === 0 ? (
                <div className="p-4 text-center text-zinc-500">No leads yet</div>
              ) : (
                filteredLeads.map(lead => (
                  <div
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className={`p-4 cursor-pointer transition ${
                      selectedLead?.id === lead.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-l-blue-600'
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    <div className="font-medium text-zinc-900 dark:text-zinc-50">
                      {lead.name}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                      {lead.email}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <span className="inline-block text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-700 dark:text-zinc-300">
                        {lead.status}
                      </span>
                      {lead.score && (
                        <span className="inline-block text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/30 rounded text-amber-700 dark:text-amber-400">
                          Score: {lead.score}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Lead Detail */}
        <div className="lg:col-span-2">
          {selectedLead ? (
            <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  {selectedLead.name}
                </h2>
                <div className="mt-2 space-y-1 text-zinc-600 dark:text-zinc-400">
                  <div>Email: <a href={`mailto:${selectedLead.email}`} className="text-blue-600 dark:text-blue-400 hover:underline">{selectedLead.email}</a></div>
                  {selectedLead.company && <div>Company: {selectedLead.company}</div>}
                  {selectedLead.source && <div>Source: {selectedLead.source}</div>}
                  <div>Received: {new Date(selectedLead.createdAt).toLocaleDateString()}</div>
                </div>
              </div>

              {selectedLead.message && (
                <div className="mb-6 p-4 bg-zinc-50 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700">
                  <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                    Message
                  </div>
                  <div className="text-zinc-700 dark:text-zinc-300">{selectedLead.message}</div>
                </div>
              )}

              {/* Status Update */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                  Lead Status
                </label>
                <Select
                  value={selectedLead.status}
                  onChange={(e: any) => updateLeadStatus(selectedLead.id, e.target.value)}
                  className="w-full rounded px-3 py-2"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="converted">Converted</option>
                  <option value="declined">Declined</option>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={() => sendEmail(selectedLead.id)}
                  className="flex-1"
                >
                  Send Email
                </Button>
                <Button variant="ghost" className="flex-1">
                  Call/SMS
                </Button>
                <Button variant="ghost" className="flex-1">
                  Schedule Follow-up
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-12 text-center text-zinc-500 dark:text-zinc-400">
              Select a lead to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
