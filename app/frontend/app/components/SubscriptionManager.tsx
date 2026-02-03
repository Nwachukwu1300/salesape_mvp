'use client';

import { useState, useEffect, FormEvent } from 'react';
import { apiFetch } from '../lib/api';
import { Button } from '@/components/ui/button';

interface Subscription {
  id: string;
  planId: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  description: string;
  createdAt: string;
}

const PLANS = [
  { id: 'basic', name: 'Basic', price: 29, features: ['Up to 100 leads/month', '1 user', 'Email support'] },
  { id: 'pro', name: 'Pro', price: 99, features: ['Unlimited leads', 'Up to 5 users', 'Priority support', 'Advanced analytics'] },
  { id: 'enterprise', name: 'Enterprise', price: 299, features: ['Everything in Pro', 'Up to 20 users', 'Dedicated support', 'Custom integrations'] },
];

export default function SubscriptionManager({ businessId }: { businessId: string }) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetchSubscription();
    fetchPayments();
  }, [businessId]);

  const fetchSubscription = async () => {
    try {
      const res = await apiFetch(`/businesses/${businessId}/subscription`);
      if (!res.ok) throw new Error('Failed to fetch subscription');
      const data = await res.json();
      setSubscription(data);
    } catch (err) {
      console.error('Fetch subscription error:', err);
    }
  };

  const fetchPayments = async () => {
    try {
      const res = await apiFetch(`/businesses/${businessId}/payments`);
      if (!res.ok) throw new Error('Failed to fetch payments');
      const data = await res.json();
      setPayments(data);
    } catch (err) {
      console.error('Fetch payments error:', err);
    }
  };

  const handleUpgradePlan = async (planId: string) => {
    const plan = PLANS.find(p => p.id === planId);
    if (!plan) return;

    setLoading(true);
    setMessage('');

    try {
      const res = await apiFetch(`/businesses/${businessId}/payments`, {
        method: 'POST',
        body: JSON.stringify({ amount: plan.price, planId }),
      });

      if (!res.ok) throw new Error('Failed to process payment');
      const data = await res.json();
      setMessage(`✓ Successfully upgraded to ${plan.name} plan`);
      await fetchSubscription();
      await fetchPayments();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const currentPlan = subscription ? PLANS.find(p => p.id === subscription.planId) : null;

  if (!expanded) {
    return (
      <div className="mb-4">
        <Button variant="ghost" size="sm" onClick={() => setExpanded(true)}>
          💳 Subscription & Billing
        </Button>
      </div>
    );
  }

  return (
    <div className="mb-6 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 enter-up">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Subscription & Billing</h3>
        <Button variant="ghost" size="sm" onClick={() => setExpanded(false)}>
          ✕
        </Button>
      </div>

      {subscription && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
          <div className="text-sm">
            <strong className="text-zinc-900 dark:text-zinc-100">Current Plan: {currentPlan?.name || 'Unknown'}</strong>
            <div className="text-zinc-600 dark:text-zinc-400 text-xs mt-1">
              Status: <span className="font-semibold">{subscription.status}</span>
            </div>
            <div className="text-zinc-600 dark:text-zinc-400 text-xs mt-1">
              Valid until: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Choose Your Plan</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map(plan => (
            <div
              key={plan.id}
              className={`p-4 rounded-lg border-2 transition-all enter-up hover-raise ${
                currentPlan?.id === plan.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-blue-300 dark:hover:border-blue-600'
              }`}
            >
              <h5 className="font-semibold text-zinc-900 dark:text-zinc-100">{plan.name}</h5>
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 my-2">${plan.price}<span className="text-sm text-zinc-600 dark:text-zinc-400">/mo</span></div>
              <ul className="text-xs text-zinc-700 dark:text-zinc-300 space-y-1 mb-4">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span>✓</span> {feature}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => handleUpgradePlan(plan.id)}
                disabled={loading || currentPlan?.id === plan.id}
                className="w-full"
                size="sm"
                variant={currentPlan?.id === plan.id ? 'outline' : 'default'}
              >
                {currentPlan?.id === plan.id ? 'Current Plan' : loading ? 'Processing...' : 'Select Plan'}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {payments.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Payment History</h4>
          <div className="space-y-2">
            {payments.slice(0, 5).map(payment => (
              <div
                key={payment.id}
                className="flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 text-sm"
              >
                <div>
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100">{payment.description}</div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">{new Date(payment.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100">${(payment.amount / 100).toFixed(2)}</div>
                  <div className={`text-xs ${payment.status === 'succeeded' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                    {payment.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {message && (
        <div className={`p-3 rounded text-sm ${message.includes('✓') ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
          {message}
        </div>
      )}
    </div>
  );
}
