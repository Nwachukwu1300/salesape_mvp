import { useNavigate } from 'react-router';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import { Card, CardHeader, CardContent } from '../components/Card';
import { StatCard } from '../components/StatCard';
import { Badge } from '../components/Badge';
import { ThemeToggle } from '../components/ThemeToggle';
import { PricingModal } from '../components/PricingModal';
import { UpgradePrompt } from '../components/UpgradePrompt';
import { CalendarIntegrationModal } from '../components/CalendarIntegrationModal';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useAuth } from '../contexts/AuthContext';
import { PRICING_PLANS } from '../lib/stripe';
import { useState } from 'react';
import React from 'react';
import { 
  Plus, 
  Search, 
  Calendar, 
  Globe, 
  Users, 
  TrendingUp, 
  Eye,
  ExternalLink,
  Settings,
  LogOut,
  Zap,
  Crown,
  Trash2
} from 'lucide-react';

export function Dashboard() {
  const navigate = useNavigate();
  const { currentPlan, canCreateWebsite, canRunSEOAudit, usage, seoAuditsRemaining, refreshUsage } = useSubscription();
  const [showPricing, setShowPricing] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [websites, setWebsites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { user, signOut } = useAuth();

  // Fetch user's websites from backend
  React.useEffect(() => {
    const fetchWebsites = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('supabase.auth.token');
        if (!token) {
          setWebsites([]);
          return;
        }

        const response = await fetch('http://localhost:3001/businesses', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          // Map business records to website format for display
          const websitesList = (Array.isArray(data) ? data : []).map((business: any) => ({
            id: business.id,
            name: business.name,
            url: business.slug ? `${business.slug}.salesape.ai` : `website-${business.id.substring(0, 8)}.salesape.ai`,
            status: business.isPublished ? 'Live' : 'Draft',
            leads: business.leads?.length || 0,
            bookings: business.bookings?.length || 0,
            lastUpdated: new Date(business.updatedAt || business.createdAt).toLocaleDateString(),
          }));
          setWebsites(websitesList);
        }
      } catch (error) {
        console.error('Failed to fetch websites:', error);
        setWebsites([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWebsites();
  }, []);

  const handleCreateWebsite = () => {
    if (!canCreateWebsite) {
      setShowPricing(true);
      return;
    }
    navigate('/create-website');
  };

  const handleSignOut = async () => {
    try {
      if (signOut) {
        await signOut();
      }
      localStorage.clear();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
      alert('Error signing out. Please try again.');
    }
  };

  const handleDeleteWebsite = async (websiteId: string, websiteName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${websiteName}"? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      setDeletingId(websiteId);
      const token = localStorage.getItem('supabase.auth.token');
      
      const response = await fetch(`http://localhost:3001/businesses/${websiteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setWebsites(websites.filter(w => w.id !== websiteId));
        alert(`Website "${websiteName}" deleted successfully`);
        try {
          if (refreshUsage) await refreshUsage();
        } catch (err) {
          console.warn('Failed to refresh usage after delete', err);
        }
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to delete website'}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Error deleting website. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PricingModal 
        isOpen={showPricing} 
        onClose={() => setShowPricing(false)}
        highlightPlan="pro"
      />
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Logo size="sm" className="md:hidden" />
            <Logo size="md" className="hidden md:block" />
            <div className="flex items-center gap-3">
              {currentPlan !== 'free' && (
                <Badge 
                  variant="warning" 
                  className="hidden sm:flex"
                  style={{ backgroundColor: '#f724de', color: 'white', border: 'none' }}
                >
                  <Crown className="w-3 h-3" />
                  {PRICING_PLANS[currentPlan].name}
                </Badge>
              )}
              {currentPlan === 'free' && (
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => setShowPricing(true)}
                  className="hidden sm:flex"
                >
                  <Crown className="w-4 h-4" />
                  <span className="hidden lg:inline">Upgrade to Pro</span>
                  <span className="lg:hidden">Upgrade</span>
                </Button>
              )}
              <ThemeToggle />
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <Settings className="w-4 h-4" />
                <span className="hidden lg:inline">Settings</span>
              </Button>
              <Button variant="ghost" size="sm" className="hidden sm:flex" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
                <span className="hidden lg:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Here's what's happening with your websites today
            </p>
          </div>
          {currentPlan === 'free' && (
            <Button 
              variant="primary"
              onClick={() => setShowPricing(true)}
              className="hidden md:flex"
            >
              <Crown className="w-5 h-5" />
              Upgrade Now
            </Button>
          )}
        </div>

        {/* Upgrade Prompt for Free Users */}
        {currentPlan === 'free' && !canCreateWebsite && (
          <div className="mb-8">
            <UpgradePrompt 
              feature="website" 
              onUpgrade={() => setShowPricing(true)}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Button 
            variant="primary" 
            size="lg" 
            className="w-full"
            onClick={handleCreateWebsite}
          >
            <Plus className="w-5 h-5" />
            Create New Website
            {!canCreateWebsite && <Crown className="w-4 h-4 ml-2" />}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => {
              if (currentPlan === 'free' && !canRunSEOAudit) {
                setShowPricing(true);
              } else {
                navigate('/seo-audit');
              }
            }}
            disabled={currentPlan === 'free' && !canRunSEOAudit}
          >
            <Search className="w-5 h-5" />
            Run SEO Audit
            <span className="text-xs font-semibold">
              {currentPlan === 'free' ? `(${seoAuditsRemaining}/2)` : ''}
            </span>
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full"
            onClick={() => navigate('/manage-bookings')}
          >
            <Calendar className="w-5 h-5" />
            Manage Bookings
          </Button>
        </div>

        {/* Stats Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Active Websites"
              value={websites.filter(w => w.status === 'Live').length}
              icon={Globe}
              trend={{ value: `${websites.length} total`, positive: websites.length > 0 }}
            />
            <StatCard
              title="Total Leads"
              value={websites.reduce((sum, w) => sum + w.leads, 0)}
              icon={Users}
              trend={{ value: websites.length > 0 ? '+0 this week' : 'Start with a website', positive: true }}
            />
            <StatCard
              title="Total Bookings"
              value={websites.reduce((sum, w) => sum + w.bookings, 0)}
              icon={TrendingUp}
              trend={{ value: websites.length > 0 ? '+0 this week' : 'Start with a website', positive: true }}
            />
            <StatCard
              title="Free Audits"
              value={`${usage.seoAudits}/${PRICING_PLANS[currentPlan].limits.seoAudits}`}
              icon={Search}
              trend={{ value: currentPlan === 'free' ? 'Reset monthly' : 'Unlimited', positive: currentPlan !== 'free' }}
            />
          </div>
        )}

        {/* Websites List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Websites</h2>
              <Badge variant="info">{websites.filter(w => w.status === 'Live').length} Live</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {websites.map((website) => (
                <div
                  key={website.id}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  onClick={() => navigate(`/website-preview/${website.id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {website.name}
                      </h3>
                      <a
                        href={`https://${website.url}`}
                        className="text-sm flex items-center gap-1"
                        style={{ color: '#f724de' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {website.url}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <Badge variant="success">
                      {website.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">{website.leads} leads</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">{website.bookings} bookings</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Zap className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">Updated {website.lastUpdated}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 md:flex-none"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/website-preview/${website.id}`);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                      View & Edit
                    </Button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteWebsite(website.id, website.name);
                      }}
                      disabled={deletingId === website.id}
                      style={{
                        border: '2px solid #dc2626',
                        color: '#dc2626',
                        backgroundColor: 'transparent',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: deletingId === website.id ? 'not-allowed' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        opacity: deletingId === website.id ? 0.6 : 1,
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (deletingId !== website.id) {
                          e.currentTarget.style.backgroundColor = '#fee2e2';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                      {deletingId === website.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Empty State for No Websites */}
        {websites.length === 0 && (
          <Card>
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#f4f0e5' }}>
                <Globe className="w-8 h-8" style={{ color: '#f724de' }} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                No websites yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Create your first AI-powered website in just 2 minutes. We'll handle everything from design to lead capture.
              </p>
              <Button 
                variant="primary"
                onClick={() => navigate('/create-website')}
              >
                <Plus className="w-5 h-5" />
                Create Your First Website
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Connect Calendar Button */}
        <div className="fixed bottom-8 right-8">
          <Button
            variant="primary"
            onClick={() => setShowCalendarModal(true)}
            className="rounded-full shadow-lg hover:shadow-xl"
          >
            <Calendar className="w-5 h-5" />
            <span className="hidden sm:inline">Connect Calendar</span>
          </Button>
        </div>

        {/* Pricing Modal */}
        <PricingModal
          isOpen={showPricing}
          onClose={() => setShowPricing(false)}
          plans={PRICING_PLANS}
        />

        {/* Calendar Integration Modal */}
        <CalendarIntegrationModal 
          isOpen={showCalendarModal}
          onClose={() => setShowCalendarModal(false)}
        />
      </main>
    </div>
  );
}
