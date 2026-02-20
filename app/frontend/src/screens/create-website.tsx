import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { SidebarNav } from '../components/SidebarNav';
import { useAuth } from '../contexts/AuthContext';
import { startConversation } from '../lib/api';

export function CreateWebsite() {
  const navigate = useNavigate();
  const { user, loading: authLoading, getToken } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    // If auth is still loading, don't do anything yet
    if (authLoading) {
      console.log('Auth is loading, waiting...');
      return;
    }

    // If no user and auth is done loading, redirect to login
    if (!user && !authLoading) {
      console.log('No user found and auth loaded - redirecting to login');
      setError('You must be logged in to create a website.');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    // Auth is ready and we have a user - start conversation
    if (user) {
      initConversation();
    }
  }, [user, authLoading]);

  const initConversation = async () => {
    try {
      setIsInitializing(true);
      
      // Check for valid token
      const token = getToken();
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      console.log('Starting conversation with token:', token.substring(0, 20) + '...');
      
      // Call the conversation start API with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch('http://localhost:3001/conversation/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({}),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Conversation started:', data);
      
      if (data?.sessionId) {
        // Save conversation state to sessionStorage
        const conversationState = {
          sessionId: data.sessionId,
          stage: data.stage || 'initial',
          currentQuestion: data.currentQuestion || 'What is your business name?',
          extracted: data.extracted || {},
          isComplete: data.isComplete || false,
          questionNumber: data.questionNumber || 1,
          totalQuestions: data.totalQuestions || 10,
        };
        sessionStorage.setItem(`conv_${data.sessionId}`, JSON.stringify(conversationState));
        
        // Navigate to conversation page
        navigate(`/conversation/${data.sessionId}/question`);
      } else {
        throw new Error('No session ID received from server');
      }
    } catch (err: any) {
      console.error('Error starting conversation:', err);
      let errorMsg = 'Failed to start conversation';
      
      if (err.name === 'AbortError') {
        errorMsg = 'Request timeout - server took too long to respond. Please try again.';
      } else if (err?.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err?.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err?.message) {
        errorMsg = err.message;
      }
      
      setError(`Error: ${errorMsg}. Please try again.`);
      setTimeout(() => navigate('/dashboard'), 3000);
    } finally {
      setIsInitializing(false);
    }
  };

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // Show initialization state
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Starting website creation wizard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <SidebarNav currentPath="/create-website" />
      
      <div className="text-center">
        {error ? (
          <div className="max-w-md">
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Starting conversation...
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Initializing AI conversation for your website
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default CreateWebsite;
