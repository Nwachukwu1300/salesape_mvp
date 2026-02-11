import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card, CardContent } from '../components/Card';
import { BrandExtractor, ExtractedBranding } from '../components/BrandExtractor';
import { ThemeToggle } from '../components/ThemeToggle';
import { PricingModal } from '../components/PricingModal';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft, 
  MessageSquare, 
  Sparkles,
  Check,
  Loader2,
} from 'lucide-react';

const API_BASE = ((import.meta.env as any).VITE_API_URL || 'http://localhost:3001').replace(/\/+$/g, '');

type Mode = 'select' | 'questionnaire' | 'chat' | 'loading' | 'results' | 'branding';

interface Question {
  id: number;
  category: string;
  question: string;
  type: 'select' | 'text' | 'checkbox';
  options?: string[];
  placeholder?: string;
}

interface Recommendation {
  suggestedPageTypes: string[];
  suggestedFeatures: string[];
  insights: string[];
  estimatedTimeframe: string;
  estimatedCost: string;
}

export function CreateWebsite() {
  const navigate = useNavigate();
  const { canCreateWebsite } = useSubscription();
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>('select');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPricing, setShowPricing] = useState(false);

  // Questionnaire state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [businessId, setBusinessId] = useState<string | null>(null);

  // Chat state
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: "Hi! I'm your AI website builder assistant. Tell me about your business, and I'll create a perfect website for you. What kind of business do you run?",
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Brand extractor state
  const [extractedBranding, setExtractedBranding] = useState<ExtractedBranding | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Check if user can create website
  if (!canCreateWebsite && mode !== 'select') {
    setShowPricing(true);
    setMode('select');
  }

  // Load questionnaire questions
  const loadQuestionnaire = async () => {
    console.log('=== loadQuestionnaire called ===');
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('supabase.auth.token');
      console.log('Token exists:', !!token);
      console.log('Token value (first 50 chars):', token ? token.substring(0, 50) + '...' : 'NULL');
      console.log('Token length:', token ? token.length : 0);
      console.log('API_BASE:', API_BASE);
      
      if (!token) {
        throw new Error('No token found - you must be logged in first');
      }
      
      // Use local questions for now - no backend call needed for initial load
      const localQuestions: Question[] = [
        {
          id: 1,
          category: 'businessType',
          question: 'What type of business are you?',
          type: 'select',
          options: ['E-commerce', 'Services', 'SaaS', 'Freelancer', 'Agency', 'Other']
        },
        {
          id: 2,
          category: 'businessName',
          question: 'What is your business name?',
          type: 'text',
          placeholder: 'E.g., Acme Consulting'
        },
        {
          id: 3,
          category: 'industry',
          question: 'What industry are you in?',
          type: 'text',
          placeholder: 'E.g., Digital Marketing'
        },
        {
          id: 4,
          category: 'primaryGoal',
          question: 'What is your primary goal?',
          type: 'select',
          options: ['Generate Leads', 'Make Sales', 'Build Brand', 'Get Bookings', 'Get Inquiries']
        },
        {
          id: 5,
          category: 'targetAudience',
          question: 'Describe your target audience',
          type: 'text',
          placeholder: 'E.g., Small business owners aged 25-45'
        },
        {
          id: 6,
          category: 'uniqueValue',
          question: 'What makes you unique?',
          type: 'text',
          placeholder: 'E.g., 10 years of experience, affordable prices'
        },
        {
          id: 7,
          category: 'desiredFeatures',
          question: 'Which features do you want?',
          type: 'checkbox',
          options: ['Contact Form', 'Online Booking', 'Blog', 'Testimonials', 'Gallery', 'Pricing Table', 'Live Chat']
        },
        {
          id: 8,
          category: 'phone',
          question: 'What is your phone number?',
          type: 'text',
          placeholder: 'E.g., (555) 123-4567'
        },
        {
          id: 9,
          category: 'address',
          question: 'What is your business address?',
          type: 'text',
          placeholder: 'E.g., 123 Main Street, Downtown, CA 90210'
        },
        // budget question intentionally removed — pricing handled at upgrade
      ];
      
      setQuestions(localQuestions);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setMode('questionnaire');
    } catch (err: any) {
      console.error('Error loading questionnaire:', err);
      setError(err.message || 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerQuestion = (value: any) => {
    const currentQuestion = questions[currentQuestionIndex];
    setAnswers({ ...answers, [currentQuestion.category]: value });
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIndex === questions.length - 1) {
      submitQuestionnaire();
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const submitQuestionnaire = async () => {
    setLoading(true);
    setMode('loading');
    setError('');
    try {
      const token = localStorage.getItem('supabase.auth.token');
      console.log('=== Questionnaire Submit ===');
      console.log('Token exists:', !!token);
      console.log('Token value (first 50 chars):', token ? token.substring(0, 50) + '...' : 'NULL');
      console.log('Answers:', answers);
      
      if (!token) {
        throw new Error('No token found - you must be logged in first');
      }
      
      // Normalize URLs: add https:// if no protocol is specified
      const normalizedAnswers = { ...answers };
      ['businessUrl', 'websiteUrl', 'url', 'website'].forEach(key => {
        if (normalizedAnswers[key] && typeof normalizedAnswers[key] === 'string') {
          const urlValue = normalizedAnswers[key].trim();
          if (urlValue && !urlValue.match(/^https?:\/\//)) {
            normalizedAnswers[key] = `https://${urlValue}`;
          }
        }
      });
      
      const response = await fetch(`${API_BASE}/websites/questionnaire/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ answers: normalizedAnswers }),
      });
      console.log('Submit response status:', response.status);
      const data = await response.json();
      console.log('Submit response data:', data);
      
      if (!response.ok) throw new Error(data.error || data.message || `HTTP ${response.status}`);
      setBusinessId(data.businessId);
      setRecommendation(data.recommendation);
      setMode('results');
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err.message || 'Failed to create website');
      setMode('questionnaire');
    } finally {
      setLoading(false);
    }
  };

  const generateLocalChatResponse = (message: string): string => {
    const lowerMsg = message.toLowerCase();
    
    // Context-aware responses - informative, not asking about pricing
    if (lowerMsg.includes('photography') || lowerMsg.includes('photo')) {
      return "Excellent! For a photography business, I recommend featuring: Portfolio/Gallery to showcase your work, Services/Packages to highlight different offerings, About section with your story and experience, Testimonials from happy clients, and a Contact form for inquiries. Would you like a client testimonials section?";
    }
    if (lowerMsg.includes('service')) {
      return "Perfect for a service-based business. Key pages to include: Services overview, Pricing/Packages, About your expertise, Client testimonials, and a Contact/Booking form. This helps clients understand your offerings quickly.";
    }
    if (lowerMsg.includes('e-commerce') || lowerMsg.includes('sell') || lowerMsg.includes('product')) {
      return "Great! For e-commerce, we'll set up: Product catalog with images and descriptions, Shopping cart, Easy checkout process, Payment integration, Order tracking, and Customer reviews. This will give your customers a smooth buying experience.";
    }
    if (lowerMsg.includes('blog') || lowerMsg.includes('content')) {
      return "Adding a blog is excellent for SEO and engagement. We'll include a blog section where you can publish articles, tips, and industry insights. This helps attract customers through search engines and establishes your expertise.";
    }
    if (lowerMsg.includes('seo') || lowerMsg.includes('google') || lowerMsg.includes('search')) {
      return "Your site will be built with SEO best practices: mobile responsive, fast loading, proper meta tags, XML sitemap, and optimized images. This helps customers find you on Google and other search engines.";
    }
    if (lowerMsg.includes('booking') || lowerMsg.includes('appointment') || lowerMsg.includes('reserve')) {
      return "Perfect! I'll add an online booking system where clients can schedule appointments directly. They'll see available time slots, receive confirmation emails, and you'll get instant notifications.";
    }
    if (lowerMsg.includes('feature') || lowerMsg.includes('add')) {
      return "Popular features we can add: Contact forms, Online booking system, Photo gallery, Testimonials section, Blog, Newsletter signup, Google Maps, Social media links, Live chat, and Email capture forms.";
    }
    if (lowerMsg.includes('contact form')) {
      return "Contact form included! Visitors can message you directly from the site, and you'll receive their inquiries via email.";
    }
    if (lowerMsg.includes('mobile') || lowerMsg.includes('phone')) {
      return "Your website will be fully responsive - looks perfect on phones, tablets, and desktops. Customers can browse and book from any device.";
    }
    
    // Confirmations and acknowledgments
    const confirmationResponses = [
      "Got it! That's helpful information. What's your primary business goal - generating leads, making sales, getting bookings, or building your brand?",
      "Understood. What are the most important features you'd want on your site?",
      "Thanks for that detail. What should be the main focus of your homepage - showcasing your work, explaining your services, or gathering customer inquiries?",
      "That's valuable. To summarize: your focus is on [their input]. We'll build a site optimized for that. Anything else important to include?",
      "Perfect. Based on everything you've told me, I'm building a professional site with the features that matter most to your business.",
    ];
    
    return confirmationResponses[Math.floor(Math.random() * confirmationResponses.length)];
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    const userMessage = chatInput;
    setChatInput('');
    setChatMessages([...chatMessages, { role: 'user', content: userMessage }]);
    setChatLoading(true);
    setError('');
    try {
      // If the user posted a URL or Instagram handle, call backend scrapers and analysis
      const urlMatch = userMessage.match(/https?:\/\/(\S+)/i);
      const igMatch = userMessage.match(/instagram\.com\/[A-Za-z0-9_.]+/i);

      if (igMatch || urlMatch) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: 'Let me analyze that source for your business...' }]);

        try {
          let scraped: any = {};
          if (igMatch) {
            const res = await fetch(`${API_BASE}/parse-instagram`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url: igMatch[0] }),
            });
            scraped = await res.json();
          } else if (urlMatch) {
            const fullUrl = urlMatch[0];
            const res = await fetch(`${API_BASE}/scrape-website`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url: fullUrl }),
            });
            scraped = await res.json();
          }

          // Run analysis (analyze-business can accept scraped data)
          const analysisRes = await fetch(`${API_BASE}/analyze-business`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ scraped: scraped, description: userMessage }),
          });
          const intelligence = await analysisRes.json();

          // Wire AI intelligence into UI state: recommendation + branding
          const rec: Recommendation = {
            suggestedPageTypes: (intelligence.services || []).slice(0,3),
            suggestedFeatures: intelligence.suggestedFeatures || [],
            insights: intelligence.marketingCopy ? [intelligence.marketingCopy] : (intelligence.leadQualificationQuestions || []),
            estimatedTimeframe: '3-5 days',
            estimatedCost: '',
          };
          setRecommendation(rec);

          // Map simple brand/colors if available
          if (intelligence.brandColors && Array.isArray(intelligence.brandColors)) {
            setExtractedBranding({
              colors: {
                primary: intelligence.brandColors[0] || '#8B5CF6',
                secondary: intelligence.brandColors[1] || '#6366F1',
                accent: intelligence.brandColors[2] || '#EC4899',
                background: intelligence.brandColors[3] || '#FFFFFF',
                text: intelligence.brandColors[4] || '#1F2937',
              },
              fonts: { heading: 'Inter', body: 'Inter' },
            });
          }

          const aiResponse = `I've analyzed the source and prepared recommendations. Headline: ${intelligence.heroHeadline || '—'}. Key services: ${(intelligence.services || []).slice(0,3).join(', ') || '—'}.`; 
          setChatMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
        } catch (innerErr) {
          console.error('Scrape/analysis failed', innerErr);
          const aiResponse = generateLocalChatResponse(userMessage);
          setChatMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
        }
      } else {
        // Generate response locally - no backend call needed for general chat
        const aiResponse = generateLocalChatResponse(userMessage);
        setChatMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err.message || 'Failed to send message');
      setChatMessages(prev => prev.slice(0, -1)); // Remove the user message if failed
    } finally {
      setChatLoading(false);
    }
  };

  const handleBrandingComplete = (branding: ExtractedBranding) => {
    setExtractedBranding(branding);
    generateWebsite();
  };

  const generateWebsite = () => {
    setIsGenerating(true);
    setTimeout(() => {
      if (businessId) {
        // Navigate to the real business website preview
        navigate(`/website-preview/${businessId}`);
      } else {
        // Fallback if businessId is not available
        navigate('/website-preview/new');
      }
    }, 3000);
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#f4f0e5' }}>
        <Card className="max-w-md w-full">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse" style={{ backgroundColor: '#f724de' }}>
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Creating your website...
            </h2>
            <p className="text-gray-600 mb-6">
              Our AI is analyzing your business and building your perfect website
            </p>
            <div className="space-y-3 text-left max-w-xs mx-auto">
              {[
                'Analyzing your business...',
                'Designing your pages...',
                'Setting up lead capture...',
                'Configuring booking system...'
              ].map((text, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#f724de' }} />
                  <span className="text-sm text-gray-600">{text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading && mode === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#f4f0e5' }}>
        <Card className="max-w-md w-full">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse" style={{ backgroundColor: '#f724de' }}>
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Analyzing your answers...
            </h2>
            <p className="text-gray-600 mb-6">
              Our AI is generating your personalized website plan
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = mode === 'questionnaire' && questions[currentQuestionIndex] ? questions[currentQuestionIndex] : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Logo size="sm" className="md:hidden" />
            <Logo size="md" className="hidden md:block" />
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Dashboard</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {mode === 'select' && (
          <div>
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Create Your Website
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Choose how you'd like to create your website
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="cursor-pointer" onClick={loadQuestionnaire}>
                <Card hover className="h-full">
                  <CardContent className="py-12 text-center">
                    <div className="w-16 h-16 bg-linear-to-br from-violet-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-violet-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Answer Questions
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Quick and structured approach - we'll ask you a few questions about your business
                  </p>
                  <Badge className="bg-green-100 text-green-700">
                    Recommended • 2-3 minutes
                    </Badge>
                  </CardContent>
                </Card>
              </div>

              <div className="cursor-pointer" onClick={() => setMode('chat')}>
                <Card hover className="h-full">
                <CardContent className="py-12 text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#f4f0e5' }}>
                    <Sparkles className="w-8 h-8" style={{ color: '#f724de' }} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Chat with AI
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Have a conversation with our AI assistant - more flexible and personalized
                  </p>
                  <Badge className="bg-violet-100 text-violet-700">
                    Conversational • 3-5 minutes
                    </Badge>
                  </CardContent>
                </Card>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm max-w-2xl mx-auto">
                {error}
              </div>
            )}
          </div>
        )}

        {mode === 'questionnaire' && currentQuestion && (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-8">
                {/* Progress */}
                <div className="mb-8">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </span>
                    <span className="text-sm text-gray-600">
                      {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Question */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {currentQuestion.question}
                  </h2>

                  {currentQuestion.type === 'select' && (
                    <div className="space-y-2">
                      {currentQuestion.options?.map((option) => (
                        <button
                          key={option}
                          onClick={() => handleAnswerQuestion(option)}
                          className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                            answers[currentQuestion.category] === option
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}

                  {currentQuestion.type === 'text' && (
                    <Input
                      value={answers[currentQuestion.category] || ''}
                      onChange={(e) => handleAnswerQuestion(e.target.value)}
                      placeholder={currentQuestion.placeholder}
                      label="Your Answer"
                    />
                  )}

                  {currentQuestion.type === 'checkbox' && (
                    <div className="space-y-3 mb-6">
                      {currentQuestion.options?.map((option) => (
                        <label key={option} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={(answers[currentQuestion.category] || []).includes(option)}
                            onChange={(e) => {
                              const current = answers[currentQuestion.category] || [];
                              const updated = e.target.checked
                                ? [...current, option]
                                : current.filter((o: string) => o !== option);
                              handleAnswerQuestion(updated);
                            }}
                            className="mr-3 w-4 h-4 rounded"
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex gap-3 justify-between">
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                    disabled={currentQuestionIndex === 0}
                  >
                    Back
                  </Button>

                  <Button
                    variant="primary"
                    onClick={() => handleNextQuestion()}
                    disabled={!answers[currentQuestion.category]}
                  >
                    {currentQuestionIndex === questions.length - 1 ? 'See Results' : 'Next Question'}
                  </Button>
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                    {error}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {mode === 'results' && recommendation && (
          <div className="max-w-2xl mx-auto">
            <Card className="mb-6">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Here's Your Website Plan
                  </h2>
                </div>

                {/* Recommended Pages */}
                <div className="mb-8">
                  <h3 className="font-bold text-gray-900 mb-4">📄 Recommended Pages</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {recommendation.suggestedPageTypes?.map((page: string) => (
                      <div key={page} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-gray-700">{page}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Features */}
                <div className="mb-8">
                  <h3 className="font-bold text-gray-900 mb-4">⚙️ Recommended Features</h3>
                  <ul className="space-y-2">
                    {recommendation.suggestedFeatures?.slice(0, 5).map((feature: string) => (
                      <li key={feature} className="text-sm text-gray-700 flex items-center">
                        <Check className="w-4 h-4 mr-2 text-green-600" /> {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Insights */}
                {recommendation.insights?.length > 0 && (
                  <div className="mb-8 p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <h3 className="font-bold text-gray-900 mb-3">💡 Key Insights</h3>
                    <ul className="space-y-2">
                      {recommendation.insights.map((insight: string, idx: number) => (
                        <li key={idx} className="text-sm text-gray-700">
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Cost and Timeline */}
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  <div className="p-4 bg-gray-100 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Estimated Cost</p>
                    <p className="text-lg font-bold text-gray-900">{recommendation.estimatedCost}</p>
                  </div>
                  <div className="p-4 bg-gray-100 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Timeline</p>
                    <p className="text-lg font-bold text-gray-900">{recommendation.estimatedTimeframe}</p>
                  </div>
                </div>

                <Button 
                  variant="primary" 
                  className="w-full mb-3"
                  onClick={() => generateWebsite()}
                >
                  Create My Website Now
                </Button>

                <Button 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => setMode('select')}
                >
                  Start Over
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {mode === 'chat' && (
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardContent className="p-0">
                {/* Chat Messages */}
                <div className="h-[500px] overflow-y-auto p-6 space-y-4 bg-gray-50">
                  {chatMessages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-violet-600 text-white'
                            : 'bg-white text-gray-900 border border-gray-200'
                        }`}
                      >
                        {message.role === 'assistant' && (
                          <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="w-4 h-4" style={{ color: '#f724de' }} />
                            <span className="text-xs font-medium" style={{ color: '#f724de' }}>
                              AI Assistant
                            </span>
                          </div>
                        )}
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                        <div className="flex gap-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="border-t border-gray-200 p-4">
                  <form onSubmit={handleChatSubmit} className="flex gap-3">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                      style={{
                        '--tw-ring-color': '#f724de'
                      } as React.CSSProperties}
                      disabled={chatLoading}
                    />
                    <Button type="submit" variant="primary" disabled={!chatInput.trim() || chatLoading}>
                      Send
                    </Button>
                  </form>
                  {chatMessages.length > 5 && (
                    <div className="mt-3">
                      <Button
                        type="button"
                        variant="primary"
                        className="w-full"
                        onClick={() => generateWebsite()}
                      >
                        <Sparkles className="w-5 h-5" />
                        Generate My Website Now
                      </Button>
                    </div>
                  )}
                  {error && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                      {error}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {mode === 'branding' && (
          <div className="max-w-3xl mx-auto">
            <BrandExtractor
              onComplete={handleBrandingComplete}
            />
          </div>
        )}
      </main>

      {showPricing && (
        <PricingModal
          isOpen={showPricing}
          onClose={() => setShowPricing(false)}
        />
      )}
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${className}`}>
      {children}
    </span>
  );
}