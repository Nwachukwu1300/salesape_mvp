import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { PlanType, PRICING_PLANS } from '../lib/stripe';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/g, '');

interface SubscriptionContextType {
  currentPlan: PlanType;
  loading: boolean;
  usage: {
    websites: number;
    leads: number;
    seoAudits: number;
  };
  seoAuditsRemaining: number;
  canCreateWebsite: boolean;
  canCaptureLead: boolean;
  canRunSEOAudit: boolean;
  refreshUsage: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user, getToken } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<PlanType>('free');
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState({
    websites: 0,
    leads: 0,
    seoAudits: 0,
  });

  useEffect(() => {
    if (user) {
      fetchSubscription();
      fetchUsage();
    }
  }, [user]);

  const fetchSubscription = async () => {
    setLoading(true);
    try {
      const token = getToken ? getToken() : null;
      if (!token || !user) {
        setCurrentPlan('free');
        return;
      }

      // Get user's businesses and pick the first one
      const bizRes = await fetch(`${API_BASE}/businesses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!bizRes.ok) {
        setCurrentPlan('free');
        return;
      }
      const bizList = await bizRes.json();
      const firstBiz = Array.isArray(bizList) && bizList.length > 0 ? bizList[0] : null;
      if (!firstBiz || !firstBiz.id) {
        setCurrentPlan('free');
        return;
      }

      const subRes = await fetch(`${API_BASE}/businesses/${firstBiz.id}/subscription`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!subRes.ok) {
        setCurrentPlan('free');
        return;
      }
      const subscription = await subRes.json();

      // Map backend plan ids to UI plan keys
      const planMap: Record<string, PlanType> = { basic: 'free', pro: 'pro', enterprise: 'enterprise' };
      const planKey = (subscription && subscription.planId && planMap[subscription.planId]) || 'free';
      setCurrentPlan(planKey);
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setCurrentPlan('free');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsage = async () => {
    try {
      const token = getToken ? getToken() : null;
      if (!token || !user) {
        setUsage({ websites: 0, leads: 0, seoAudits: 0 });
        return;
      }

      // Get user's businesses and pick the first one
      const bizRes = await fetch(`${API_BASE}/businesses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!bizRes.ok) {
        setUsage({ websites: 0, leads: 0, seoAudits: 0 });
        return;
      }
      const bizList = await bizRes.json();
      const websites = Array.isArray(bizList) ? bizList.length : 0;
      const firstBiz = websites > 0 ? bizList[0] : null;

      // Fetch analytics summary for usage metrics (use first business if available)
      let analytics: any = {};
      if (firstBiz && firstBiz.id) {
        try {
          const analyticsRes = await fetch(`${API_BASE}/businesses/${firstBiz.id}/analytics`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (analyticsRes.ok) {
            analytics = await analyticsRes.json();
          }
        } catch (err) {
          console.warn('Unable to fetch analytics for first business:', err);
        }
      }

      const leads = analytics?.summary?.totalLeads ?? analytics?.summary?.leadsCreated ?? 0;

      // Fetch dedicated usage endpoint for SEO/free audits
      let seoAudits = 0;
      try {
        const usageRes = await fetch(`${API_BASE}/businesses/${firstBiz.id}/usage`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (usageRes.ok) {
          const usageBody = await usageRes.json();
          seoAudits = usageBody?.seoAudits ?? 0;
        }
      } catch (err) {
        console.warn('Unable to fetch seo audit usage:', err);
      }

      setUsage({ websites, leads, seoAudits });
    } catch (error) {
      console.error('Error fetching usage:', error);
      setUsage({ websites: 0, leads: 0, seoAudits: 0 });
    }
  };

  const refreshUsage = async () => {
    await fetchUsage();
  };

  const planLimits = PRICING_PLANS[currentPlan].limits;

  // Calculate remaining SEO audits
  const seoAuditsRemaining = Math.max(0, planLimits.seoAudits - usage.seoAudits);

  const canCreateWebsite = usage.websites < planLimits.websites;
  const canCaptureLead = usage.leads < planLimits.leads;
  const canRunSEOAudit = usage.seoAudits < planLimits.seoAudits;

  return (
    <SubscriptionContext.Provider
      value={{
        currentPlan,
        loading,
        usage,
        seoAuditsRemaining,
        canCreateWebsite,
        canCaptureLead,
        canRunSEOAudit,
        refreshUsage,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
