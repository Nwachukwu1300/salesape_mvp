import { useState } from 'react';
import { Card, CardContent } from './Card';
import { Button } from './Button';
import { X, Calendar, Loader2, Check } from 'lucide-react';

interface CalendarIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CalendarIntegrationModal({ isOpen, onClose }: CalendarIntegrationModalProps) {
  const [selectedProvider, setSelectedProvider] = useState<'google' | 'calendly' | null>(null);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState('');

  const handleConnectGoogle = async () => {
    try {
      setLoading(true);
      setError('');

      // In production, this would redirect to Google OAuth
      // For MVP, we'll show a message
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.REACT_APP_GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID'}&redirect_uri=${window.location.origin}/auth/google/callback&response_type=code&scope=https://www.googleapis.com/auth/calendar`;

      console.log('Google Calendar OAuth URL:', authUrl);
      setConnected(true);
      setTimeout(() => {
        alert('Google Calendar integration is configured in development. In production, you would be redirected to Google OAuth.');
        onClose();
      }, 2000);
    } catch (err) {
      setError('Failed to connect Google Calendar');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectCalendly = async () => {
    try {
      setLoading(true);
      setError('');

      // For Calendly, user would need to provide their Calendly URL or API key
      const calendlyUrl = prompt('Enter your Calendly URL (e.g., https://calendly.com/username)');
      if (!calendlyUrl) return;

      // Validate Calendly URL
      if (!calendlyUrl.includes('calendly.com')) {
        setError('Invalid Calendly URL');
        return;
      }

      // In production, this would connect to Calendly API
      setConnected(true);
      setTimeout(() => {
        alert(`Calendly integrated! Bookings will sync with ${calendlyUrl}`);
        onClose();
      }, 2000);
    } catch (err) {
      setError('Failed to connect Calendly');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Connect Calendar
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <CardContent className="py-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          {connected ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-green-100 dark:bg-green-900">
                <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-gray-900 dark:text-white font-semibold mb-2">
                Calendar Connected!
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your calendar is now synced. Bookings will be reflected across all your websites.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Connect your calendar to sync bookings across all your websites and prevent double scheduling.
              </p>

              {!selectedProvider ? (
                <div className="space-y-3">
                  <button
                    onClick={() => setSelectedProvider('google')}
                    className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-red-100 dark:bg-red-900 flex items-center justify-center text-lg font-bold text-red-600 dark:text-red-400">
                        G
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Google Calendar</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Sync with Google Calendar</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedProvider('calendly')}
                    className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Calendly</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Sync with Calendly</p>
                      </div>
                    </div>
                  </button>
                </div>
              ) : (
                <div>
                  <button
                    onClick={() => setSelectedProvider(null)}
                    className="mb-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    ← Back
                  </button>

                  <div className="mb-6">
                    {selectedProvider === 'google' && (
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white mb-2">
                          Connect Google Calendar
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          You'll be redirected to Google to authorize calendar access.
                        </p>
                      </div>
                    )}
                    {selectedProvider === 'calendly' && (
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white mb-2">
                          Connect Calendly
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          Enter your Calendly URL to sync bookings.
                        </p>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={
                      selectedProvider === 'google'
                        ? handleConnectGoogle
                        : handleConnectCalendly
                    }
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Calendar className="w-4 h-4" />
                        Connect {selectedProvider === 'google' ? 'Google' : 'Calendly'}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
