import { Crown, TrendingUp, Sparkles } from 'lucide-react';
import { Button } from './Button';
import { Card, CardContent } from './Card';
import { useSubscription } from '../contexts/SubscriptionContext';
import { PRICING_PLANS } from '../lib/stripe';

interface UpgradePromptProps {
  feature: 'website' | 'leads' | 'seoAudit';
  onUpgrade: () => void;
}

export function UpgradePrompt({ feature, onUpgrade }: UpgradePromptProps) {
  const { usage, currentPlan } = useSubscription();

  const messages = {
    website: {
      title: '🚀 Create Unlimited Websites',
      description: 'Upgrade to Pro to create unlimited AI-powered websites for all your clients and projects.',
      stat: `${usage.websites} / ${PRICING_PLANS[currentPlan].limits.websites} websites used`,
    },
    leads: {
      title: '📈 Capture Unlimited Leads',
      description: 'Never miss a potential customer. Upgrade to Pro for unlimited lead capture and management.',
      stat: `${usage.leads} / ${PRICING_PLANS[currentPlan].limits.leads} leads this month`,
    },
    seoAudit: {
      title: '🔍 Unlimited SEO Audits',
      description: 'Run unlimited SEO audits to optimize all your websites and boost search rankings.',
      stat: `${usage.seoAudits} / ${PRICING_PLANS[currentPlan].limits.seoAudits} audits used`,
    },
  };

  const message = messages[feature];

  return (
    <Card className="border-2" style={{ borderColor: '#f724de' }}>
      <CardContent className="p-8">
        <div className="flex items-start gap-6">
          <div className="p-4 rounded-xl" style={{ backgroundColor: '#f724de' }}>
            <Crown className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {message.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {message.description}
            </p>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${Math.min((usage[feature === 'website' ? 'websites' : feature === 'leads' ? 'leads' : 'seoAudits'] / PRICING_PLANS[currentPlan].limits[feature === 'website' ? 'websites' : feature === 'leads' ? 'leads' : 'seoAudits']) * 100, 100)}%`,
                    backgroundColor: '#f724de',
                  }}
                />
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                {message.stat}
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" onClick={onUpgrade}>
                <Sparkles className="w-5 h-5" />
                Upgrade to Pro - $29/month
              </Button>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <TrendingUp className="w-4 h-4" />
                <span>Join 1,000+ businesses growing with Pro</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
