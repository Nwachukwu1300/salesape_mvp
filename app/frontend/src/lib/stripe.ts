import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');
  }
  return stripePromise;
};

export const PRICING_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    interval: 'forever',
    features: [
      '1 Website',
      '10 Leads per month',
      '2 SEO Audits',
      'Basic templates',
      'Email support',
    ],
    limits: {
      websites: 1,
      leads: 10,
      seoAudits: 2,
    },
  },
  pro: {
    name: 'Pro',
    price: 29,
    interval: 'month',
    stripePriceId: 'price_pro_monthly', // Replace with your Stripe Price ID
    features: [
      'Unlimited Websites',
      'Unlimited Leads',
      'Unlimited SEO Audits',
      'Advanced AI customization',
      'Custom domains',
      'Priority support',
      'Remove SalesAPE.ai branding',
      'Advanced analytics',
    ],
    limits: {
      websites: Infinity,
      leads: Infinity,
      seoAudits: Infinity,
    },
  },
  enterprise: {
    name: 'Enterprise',
    price: 99,
    interval: 'month',
    stripePriceId: 'price_enterprise_monthly', // Replace with your Stripe Price ID
    features: [
      'Everything in Pro',
      'White-label solution',
      'API access',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
      '24/7 phone support',
    ],
    limits: {
      websites: Infinity,
      leads: Infinity,
      seoAudits: Infinity,
    },
  },
};

export type PlanType = keyof typeof PRICING_PLANS;
