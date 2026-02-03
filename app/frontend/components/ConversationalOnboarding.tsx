'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';

interface Message {
  id: string;
  type: 'bot' | 'user';
  text: string;
  timestamp: Date;
}

interface ConversationData {
  businessName?: string;
  businessType?: string;
  services?: string[];
  targetAudience?: string;
  description?: string;
  websiteUrl?: string;
  instagramUrl?: string;
}

interface ConversationalOnboardingProps {
  onComplete: (data: ConversationData) => void;
}

export default function ConversationalOnboarding({ onComplete }: ConversationalOnboardingProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationData, setConversationData] = useState<ConversationData>({});
  const [currentQuestion, setCurrentQuestion] = useState<'greeting' | 'name' | 'type' | 'services' | 'audience' | 'contact' | 'complete'>('greeting');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Start conversation
    addBotMessage("Hi there! 👋 I'm your SalesAPE Assistant. Let's get your business online in minutes. What's your name?");
    setCurrentQuestion('name');
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (type: 'bot' | 'user', text: string) => {
    const msg: Message = {
      id: Date.now().toString(),
      type,
      text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, msg]);
  };

  const addBotMessage = (text: string) => {
    addMessage('bot', text);
  };

  const addUserMessage = (text: string) => {
    addMessage('user', text);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userInput = input.trim();
    addUserMessage(userInput);
    setInput('');
    setLoading(true);

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 800));

    // Process conversation based on current question
    let nextQuestion: typeof currentQuestion = 'complete';
    let botResponse = '';

    switch (currentQuestion) {
      case 'name':
        setConversationData(prev => ({ ...prev, businessName: userInput }));
        botResponse = `Nice to meet you, ${userInput}! 🚀\n\nWhat type of business are you in? (e.g., landscaping, photography, consulting, etc.)`;
        nextQuestion = 'type';
        break;

      case 'type':
        setConversationData(prev => ({ ...prev, businessType: userInput }));
        botResponse = `${userInput} - great! What services or products do you offer? (comma-separated is fine)`;
        nextQuestion = 'services';
        break;

      case 'services':
        setConversationData(prev => ({
          ...prev,
          services: userInput.split(',').map(s => s.trim()),
          description: userInput,
        }));
        botResponse = `Perfect! Now, who is your ideal customer or target audience?`;
        nextQuestion = 'audience';
        break;

      case 'audience':
        setConversationData(prev => ({ ...prev, targetAudience: userInput }));
        botResponse = `Excellent! Last question - do you have a website or Instagram page? (paste the URL or just say "no")`;
        nextQuestion = 'contact';
        break;

      case 'contact':
        if (userInput.toLowerCase() !== 'no') {
          if (userInput.includes('instagram.com')) {
            setConversationData(prev => ({ ...prev, instagramUrl: userInput }));
          } else {
            setConversationData(prev => ({ ...prev, websiteUrl: userInput }));
          }
        }
        botResponse = `Perfect! I've got all the info I need. Let me analyze your business and create your custom website... 🎨`;
        nextQuestion = 'complete';
        break;
    }

    addBotMessage(botResponse);
    setCurrentQuestion(nextQuestion);
    setLoading(false);

    // If complete, call onComplete
    if (nextQuestion === 'complete') {
      setTimeout(() => {
        onComplete(conversationData);
      }, 1500);
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast.error('Voice input not supported in your browser');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };
    recognition.start();
  };

  return (
    <div className="w-full max-w-2xl mx-auto h-screen flex flex-col bg-white dark:bg-zinc-900">
      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 p-4 text-center">
        <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
          SALESAPE.ai Assistant
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Conversational onboarding
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs rounded-lg px-4 py-3 whitespace-pre-wrap ${
                msg.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg px-4 py-3">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Type your response..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !loading) {
                handleSendMessage();
              }
            }}
            disabled={loading || currentQuestion === 'complete'}
            className="flex-1"
          />
          <Button
            onClick={handleVoiceInput}
            variant="ghost"
            size="sm"
            disabled={loading || currentQuestion === 'complete'}
            title="Use voice input"
          >
            🎤
          </Button>
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || loading || currentQuestion === 'complete'}
          >
            Send
          </Button>
        </div>
        <div className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
          {currentQuestion === 'complete' ? '✓ Processing your information...' : 'Press Enter or click Send'}
        </div>
      </div>
    </div>
  );
}
