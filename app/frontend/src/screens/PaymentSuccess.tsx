import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import { CheckCircle, Sparkles } from 'lucide-react';

export function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <Logo size="md" className="justify-center mb-8" />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center border border-gray-200 dark:border-gray-700">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6" style={{ backgroundColor: '#f724de' }}>
            <CheckCircle className="w-12 h-12 text-white" />
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Pro! 🎉
          </h1>

          {/* Description */}
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            Your payment was successful! You now have access to unlimited websites, leads, and SEO audits.
          </p>

          {/* Features Unlocked */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" style={{ color: '#f724de' }} />
              Features Unlocked
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <div className="font-semibold text-gray-900 dark:text-white mb-1">∞</div>
                <div className="text-gray-600 dark:text-gray-400">Unlimited Websites</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <div className="font-semibold text-gray-900 dark:text-white mb-1">∞</div>
                <div className="text-gray-600 dark:text-gray-400">Unlimited Leads</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <div className="font-semibold text-gray-900 dark:text-white mb-1">∞</div>
                <div className="text-gray-600 dark:text-gray-400">Unlimited SEO Audits</div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-4">
            <Button variant="primary" size="lg" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Redirecting in {countdown} seconds...
            </p>
          </div>

          {/* Receipt */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              A receipt has been sent to your email address.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
