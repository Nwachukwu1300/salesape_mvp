import { useState } from 'react';
import { X, Check, Zap, Crown, Building2, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { Card, CardContent } from './Card';
import { PRICING_PLANS, PlanType } from '../lib/stripe';
import { useAuth } from '../contexts/AuthContext';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  highlightPlan?: PlanType;
}

export function PricingModal({ isOpen, onClose, highlightPlan }: PricingModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState<PlanType | null>(null);

  if (!isOpen) return null;

  const handleSubscribe = async (plan: PlanType) => {
    if (plan === 'free') {
      onClose();
      return;
    }

    setLoading(plan);

    try {
      // Mock Stripe checkout - replace with real Stripe integration
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate redirect to success page
      alert(`Redirecting to Stripe checkout for ${PRICING_PLANS[plan].name} plan...`);
      
      // In production, redirect to Stripe Checkout:
      // window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const planIcons = {
    free: Zap,
    pro: Crown,
    enterprise: Building2,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Header */}
        <div className="p-8 text-center border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Unlock unlimited websites, leads, and SEO audits with our Pro plan
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="p-8 grid md:grid-cols-3 gap-6">
          {(Object.keys(PRICING_PLANS) as PlanType[]).map((planKey) => {
            const plan = PRICING_PLANS[planKey];
            const Icon = planIcons[planKey];
            const isHighlighted = planKey === highlightPlan || planKey === 'pro';
            const isLoading = loading === planKey;

            return (
              <Card
                key={planKey}
                className={`relative ${
                  isHighlighted
                    ? 'ring-2 ring-offset-2 dark:ring-offset-gray-800 shadow-xl scale-105'
                    : ''
                }`}
                style={isHighlighted ? { ringColor: '#f724de' } : {}}
              >
                {isHighlighted && (
                  <div
                    className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white text-sm font-medium"
                    style={{ backgroundColor: '#f724de' }}
                  >
                    Most Popular
                  </div>
                )}

                <CardContent className="p-6">
                  {/* Icon & Name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="p-3 rounded-lg"
                      style={{
                        backgroundColor: planKey === 'pro' ? '#f724de' : '#f4f0e5',
                      }}
                    >
                      <Icon
                        className="w-6 h-6"
                        style={{
                          color: planKey === 'pro' ? 'white' : '#f724de',
                        }}
                      />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {plan.name}
                      </h3>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-gray-900 dark:text-white">
                        ${plan.price}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        /{plan.interval}
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check
                          className="w-5 h-5 flex-shrink-0 mt-0.5"
                          style={{ color: '#f724de' }}
                        />
                        <span className="text-gray-600 dark:text-gray-400">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Button
                    variant={isHighlighted ? 'primary' : 'outline'}
                    className="w-full"
                    onClick={() => handleSubscribe(planKey)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : planKey === 'free' ? (
                      'Current Plan'
                    ) : planKey === 'enterprise' ? (
                      'Contact Sales'
                    ) : (
                      'Get Started'
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p className="mb-2">
              🔒 Secure payment powered by Stripe • Cancel anytime
            </p>
            <p>
              Need help choosing? <a href="#" className="font-medium" style={{ color: '#f724de' }}>Contact our sales team</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}