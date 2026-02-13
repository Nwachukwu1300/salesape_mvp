import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Send, ArrowLeft, Loader } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Logo } from '../components/Logo';
import { ThemeToggle } from '../components/ThemeToggle';
import {
  startConversation,
  sendConversationMessage,
  getConversationSession,
  completeConversation,
} from '../lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ConversationState {
  sessionId: string;
  messages: Message[];
  stage: string;
  extracted: any;
  isComplete: boolean;
}

export const ConversationUI: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [state, setState] = useState<ConversationState | null>(null);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const businessId = location.state?.businessId;

  // Initialize conversation on mount
  useEffect(() => {
    const initConversation = async () => {
      try {
        setLoading(true);
        const response = await startConversation();
        setState({
          sessionId: response.sessionId,
          messages: response.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          })),
          stage: response.stage,
          extracted: {},
          isComplete: false,
        });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to start conversation');
        logger.error('Conversation init error', { error: err });
      } finally {
        setLoading(false);
      }
    };

    initConversation();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state?.messages]);

  // Focus input on mount and after sending
  useEffect(() => {
    if (!loading && !sending) {
      inputRef.current?.focus();
    }
  }, [loading, sending]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userInput.trim() || !state || sending) {
      return;
    }

    try {
      setSending(true);
      setError(null);
      const trimmedInput = userInput.trim();
      setUserInput('');

      const response = await sendConversationMessage(state.sessionId, trimmedInput);

      setState({
        sessionId: response.sessionId,
        messages: response.messages.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        })),
        stage: response.stage,
        extracted: response.extracted || state.extracted,
        isComplete: response.isComplete || false,
      });

      // If conversation is complete, show completion prompt
      if (response.isComplete) {
        setUserInput('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      // Restore user input on error
      setUserInput(userInput);
      logger.error('Send message error', { error: err });
    } finally {
      setSending(false);
    }
  };

  const handleStartSite = async () => {
    if (!state || !businessId) {
      setError('Missing required information');
      return;
    }

    try {
      setSending(true);
      await completeConversation(state.sessionId, businessId);
      // Navigate to website creation with extracted data
      navigate('/create-website', {
        state: {
          businessUnderstanding: state.extracted,
          businessId,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete onboarding');
      logger.error('Start site error', { error: err });
    } finally {
      setSending(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Starting conversation...</p>
        </div>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <div className="space-y-4">
            <p className="text-red-600 dark:text-red-400">{error || 'Failed to start conversation'}</p>
            <Button onClick={handleGoBack} variant="outline">
              Go Back
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const lastMessage = state.messages[state.messages.length - 1];
  const isAssistantTurn = lastMessage?.role === 'assistant';

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-4 flex items-center justify-between">
        <button
          onClick={handleGoBack}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
        
        <div className="flex-1 text-center">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Website Builder
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Step {Math.ceil((state.messages.length - 1) / 2)} of 12
          </p>
        </div>

        <ThemeToggle />
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
        {state.messages.map((message, idx) => (
          <div
            key={idx}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {message.content}
              </p>
              <p
                className={`text-xs mt-2 ${
                  message.role === 'user'
                    ? 'text-blue-100'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-lg rounded-bl-none">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 mx-4 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Input Area - Sticky Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 space-y-3">
        {!state.isComplete ? (
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your answer..."
              disabled={sending || !isAssistantTurn}
              className="flex-1 text-sm"
              autoComplete="off"
              autoFocus
            />
            <Button
              type="submit"
              disabled={sending || !userInput.trim() || !isAssistantTurn}
              className="px-4 py-2"
            >
              {sending ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
        ) : (
          <Button
            onClick={handleStartSite}
            disabled={sending}
            className="w-full py-3 text-base font-semibold"
            variant="primary"
          >
            {sending ? (
              <>
                <Loader className="w-4 h-4 animate-spin mr-2" />
                Creating Your Website...
              </>
            ) : (
              '✨ Create My Website'
            )}
          </Button>
        )}

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {state.isComplete
            ? 'Click below to create your website'
            : 'Powered by SalesAPE AI'}
        </p>
      </div>

      <style>{`
        .delay-100 {
          animation-delay: 0.1s;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  );
};

// Simple logger (use your actual logger)
const logger = {
  error: (msg: string, data?: any) => console.error(msg, data),
  warn: (msg: string, data?: any) => console.warn(msg, data),
  info: (msg: string, data?: any) => console.log(msg, data),
};

export default ConversationUI;
