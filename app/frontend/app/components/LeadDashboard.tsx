'use client';

import React, { useState, useEffect } from 'react';
import ClientDateTime from './ClientDateTime';
import { Skeleton } from '@/components/ui/skeleton';

interface Lead {
  id: string;
  name: string;
  email: string;
  company?: string;
  message?: string;
  createdAt: string;
}

export default function LeadDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetchLeads();
    const interval = setInterval(fetchLeads, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await fetch(`${API_URL}/leads`);
      if (!response.ok) throw new Error('Failed to fetch leads');
      const data = await response.json();
      setLeads(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        <h2 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-zinc-50">Lead Dashboard</h2>
        <div className="space-y-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-zinc-50">
        Lead Dashboard
      </h2>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {leads.length === 0 ? (
        <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
          <p className="text-zinc-600 dark:text-zinc-400">No leads yet. Submit the form to see leads appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 enter-up hover-raise"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                    {lead.name}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {lead.email}
                  </p>
                </div>
                
                {lead.company && (
                  <div>
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Company
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {lead.company}
                    </p>
                  </div>
                )}
              </div>

              {lead.message && (
                <div className="mt-4 p-3 bg-zinc-50 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700">
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Message
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {lead.message}
                  </p>
                </div>
              )}

              <div className="mt-4 flex justify-between items-center">
                <span className="text-xs text-zinc-500 dark:text-zinc-500">
                  <ClientDateTime value={lead.createdAt} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 text-center">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Total leads: <span className="font-semibold">{leads.length}</span>
        </p>
      </div>
    </div>
  );
}
