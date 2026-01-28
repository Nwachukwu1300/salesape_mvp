'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface Business {
  id: string;
  name: string;
  url: string;
  description?: string;
  createdAt: string;
  publishedUrl?: string;
}

interface Lead {
  id: string;
  businessId: string;
  name: string;
  email: string;
  company?: string;
  message?: string;
  createdAt: string;
}

export default function BusinessDashboard() {
  const params = useParams();
  const businessId = params.businessId as string;
  const [business, setBusiness] = useState<Business | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [businessRes, leadsRes] = await Promise.all([
          fetch(`${API_URL}/businesses/${businessId}`),
          fetch(`${API_URL}/businesses/${businessId}/leads`),
        ]);

        if (businessRes.ok) {
          const businessData = await businessRes.json();
          setBusiness(businessData);
        }

        if (leadsRes.ok) {
          const leadsData = await leadsRes.json();
          setLeads(leadsData);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [businessId]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-zinc-600">Loading...</div>;
  }

  if (!business) {
    return <div className="flex items-center justify-center min-h-screen text-red-600">Business not found</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <div className="bg-white border-b border-zinc-200 py-6 px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">{business.name} Dashboard</h1>
          <p className="text-zinc-600">Manage your business and track incoming leads</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto py-8 px-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-zinc-200 p-6">
            <p className="text-zinc-600 text-sm">Total Leads</p>
            <p className="text-3xl font-bold text-zinc-900 mt-2">{leads.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-zinc-200 p-6">
            <p className="text-zinc-600 text-sm">Website Status</p>
            <p className="text-xl font-semibold text-green-600 mt-2">✓ Live</p>
          </div>
          <div className="bg-white rounded-lg border border-zinc-200 p-6">
            <p className="text-zinc-600 text-sm">Your Website</p>
            <a
              href={`//${businessId}.localhost:3000/website`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 font-semibold mt-2 hover:underline block"
            >
              View Website →
            </a>
          </div>
        </div>

        {/* Leads Section */}
        <div className="bg-white rounded-lg border border-zinc-200 p-8">
          <h2 className="text-2xl font-bold text-zinc-900 mb-6">Incoming Leads</h2>

          {leads.length === 0 ? (
            <div className="text-center py-12 text-zinc-600">
              <p className="text-lg">No leads yet</p>
              <p className="text-sm mt-2">Share your website link to start receiving leads</p>
            </div>
          ) : (
            <div className="space-y-4">
              {leads.map((lead) => (
                <div key={lead.id} className="border border-zinc-200 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-zinc-900">{lead.name}</h3>
                      <p className="text-zinc-600 text-sm">{lead.email}</p>
                      {lead.company && <p className="text-zinc-600 text-sm">Company: {lead.company}</p>}
                    </div>
                    <span className="text-xs text-zinc-500">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {lead.message && (
                    <p className="text-zinc-700 mt-3 p-3 bg-zinc-50 rounded text-sm">
                      {lead.message}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
