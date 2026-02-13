import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card, CardHeader, CardContent } from '../components/Card';
import { ThemeToggle } from '../components/ThemeToggle';
import {
  ArrowLeft,
  ArrowRight,
  Edit2,
  Check,
  AlertCircle,
} from 'lucide-react';

interface BusinessUnderstanding {
  name: string;
  category: string;
  location: string;
  services: string[];
  valueProposition: string;
  targetAudience: string;
  brandTone: 'professional' | 'friendly' | 'luxury' | 'bold' | 'casual';
  brandColors: string[];
  trustSignals: string[];
  seoKeywords: string[];
  contactPreferences: {
    email: boolean;
    phone: boolean;
    booking: boolean;
  };
  logoUrl?: string;
  imageAssets?: {
    hero?: string;
    gallery?: string[];
  };
}

export function RecapScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get business data from route state
  const businessData = (location.state as { businessUnderstanding?: BusinessUnderstanding })?.businessUnderstanding;
  
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState<BusinessUnderstanding>(
    businessData || {
      name: '',
      category: '',
      location: '',
      services: [],
      valueProposition: '',
      targetAudience: '',
      brandTone: 'professional',
      brandColors: ['#3B82F6'],
      trustSignals: [],
      seoKeywords: [],
      contactPreferences: {
        email: true,
        phone: true,
        booking: true,
      },
    }
  );

  const [errors, setErrors] = useState<string[]>([]);

  // Handle back navigation
  const handleBack = () => {
    navigate(-1);
  };

  // Handle field changes
  const handleFieldChange = (field: keyof BusinessUnderstanding, value: any) => {
    setData({
      ...data,
      [field]: value,
    });
  };

  const handleArrayFieldChange = (field: 'services' | 'trustSignals' | 'seoKeywords' | 'brandColors', index: number, value: string) => {
    const updatedArray = [...(data[field] as string[])];
    updatedArray[index] = value;
    handleFieldChange(field, updatedArray);
  };

  const handleAddArrayItem = (field: 'services' | 'trustSignals' | 'seoKeywords' | 'brandColors') => {
    const array = (data[field] as string[]) || [];
    handleFieldChange(field, [...array, '']);
  };

  const handleRemoveArrayItem = (field: 'services' | 'trustSignals' | 'seoKeywords' | 'brandColors', index: number) => {
    const updatedArray = (data[field] as string[]).filter((_, i) => i !== index);
    handleFieldChange(field, updatedArray);
  };

  // Validate data (basic validation)
  const validateData = () => {
    const newErrors: string[] = [];

    if (!data.name || data.name.trim().length === 0) newErrors.push('Business name is required');
    if (!data.category || data.category.trim().length === 0) newErrors.push('Category is required');
    if (!data.location || data.location.trim().length === 0) newErrors.push('Location is required');
    if (!data.services || data.services.length === 0) newErrors.push('At least one service is required');
    if (!data.valueProposition || data.valueProposition.trim().length < 10) newErrors.push('Value proposition must be at least 10 characters');
    if (!data.targetAudience || data.targetAudience.trim().length === 0) newErrors.push('Target audience is required');
    if (!data.trustSignals || data.trustSignals.length === 0) newErrors.push('At least one trust signal is required');
    if (!data.seoKeywords || data.seoKeywords.length < 5) newErrors.push('At least 5 SEO keywords are required');

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  // Handle confirm and proceed
  const handleConfirm = async () => {
    if (!validateData()) {
      return;
    }

    // Save to state and navigate to create website
    navigate('/create-website', {
      state: { businessUnderstanding: data },
    });
  };

  if (!businessData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <AlertCircle className="w-12 h-12 text-yellow-600 mb-4" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Data Found</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Unable to load business data. Please start from the onboarding flow.
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              Go Back to Onboarding
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Logo />
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Review Your Business Profile
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {isEditing
              ? 'Edit your business information before we create your website'
              : 'Here\'s what we understand about your business. Edit anything that needs adjustment.'}
          </p>
        </div>

        {/* errors */}
        {errors.length > 0 && (
          <Card className="border-red-200 dark:border-red-900 mb-6 bg-red-50 dark:bg-red-950/20">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-600 dark:text-red-400 mb-2">
                    Please fix the following issues:
                  </h3>
                  <ul className="space-y-1">
                    {errors.map((error, idx) => (
                      <li key={idx} className="text-sm text-red-700 dark:text-red-300">
                        • {error}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Core Information Card */}
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Core Information</h2>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Business Name
                </label>
                <Input
                  value={data.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Your business name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Category / Industry
                </label>
                <Input
                  value={data.category}
                  onChange={(e) => handleFieldChange('category', e.target.value)}
                  disabled={!isEditing}
                  placeholder="e.g., Consulting, Design, Photography"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Location
                </label>
                <Input
                  value={data.location}
                  onChange={(e) => handleFieldChange('location', e.target.value)}
                  disabled={!isEditing}
                  placeholder="City, State or Service Area"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Brand Tone
                </label>
                <select
                  value={data.brandTone}
                  onChange={(e) => handleFieldChange('brandTone', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white disabled:opacity-50"
                >
                  <option value="professional">Professional</option>
                  <option value="friendly">Friendly</option>
                  <option value="luxury">Luxury</option>
                  <option value="bold">Bold</option>
                  <option value="casual">Casual</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Value Proposition
              </label>
              <textarea
                value={data.valueProposition}
                onChange={(e) => handleFieldChange('valueProposition', e.target.value)}
                disabled={!isEditing}
                placeholder="What makes your business unique?"
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Target Audience
              </label>
              <Input
                value={data.targetAudience}
                onChange={(e) => handleFieldChange('targetAudience', e.target.value)}
                disabled={!isEditing}
                placeholder="Who do you serve?"
              />
            </div>
          </CardContent>
        </Card>

        {/* Services Card */}
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Services</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            {(data.services || []).map((service, idx) => (
              <div key={idx} className="flex gap-2 items-end">
                <Input
                  value={service}
                  onChange={(e) => handleArrayFieldChange('services', idx, e.target.value)}
                  disabled={!isEditing}
                  placeholder="Service name"
                  className="flex-1"
                />
                {isEditing && (
                  <Button
                    onClick={() => handleRemoveArrayItem('services', idx)}
                    variant="outline"
                    size="sm"
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
            {isEditing && (
              <Button
                onClick={() => handleAddArrayItem('services')}
                variant="outline"
                size="sm"
              >
                + Add Service
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Trust Signals Card */}
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Trust Signals</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            {(data.trustSignals || []).map((signal, idx) => (
              <div key={idx} className="flex gap-2 items-end">
                <Input
                  value={signal}
                  onChange={(e) => handleArrayFieldChange('trustSignals', idx, e.target.value)}
                  disabled={!isEditing}
                  placeholder="e.g., Award-winning, 10+ years experience"
                  className="flex-1"
                />
                {isEditing && (
                  <Button
                    onClick={() => handleRemoveArrayItem('trustSignals', idx)}
                    variant="outline"
                    size="sm"
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
            {isEditing && (
              <Button
                onClick={() => handleAddArrayItem('trustSignals')}
                variant="outline"
                size="sm"
              >
                + Add Trust Signal
              </Button>
            )}
          </CardContent>
        </Card>

        {/* SEO Keywords Card */}
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              SEO Keywords (Minimum 5 required)
            </h2>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              {(data.seoKeywords || []).map((keyword, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    value={keyword}
                    onChange={(e) => handleArrayFieldChange('seoKeywords', idx, e.target.value)}
                    disabled={!isEditing}
                    placeholder="Keyword"
                    className="flex-1"
                  />
                  {isEditing && (
                    <Button
                      onClick={() => handleRemoveArrayItem('seoKeywords', idx)}
                      variant="outline"
                      size="sm"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {isEditing && (
              <Button
                onClick={() => handleAddArrayItem('seoKeywords')}
                variant="outline"
                size="sm"
              >
                + Add Keyword
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Brand Colors Card */}
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Brand Colors</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              {(data.brandColors || []).map((color, idx) => (
                <div key={idx} className="flex gap-2 items-end">
                  <Input
                    type="text"
                    value={color}
                    onChange={(e) => handleArrayFieldChange('brandColors', idx, e.target.value)}
                    disabled={!isEditing}
                    placeholder="#FF0000"
                    className="flex-1"
                  />
                  <div
                    className="w-10 h-10 rounded border-2 border-slate-300 dark:border-slate-600"
                    style={{ backgroundColor: color || '#fff' }}
                  />
                  {isEditing && (
                    <Button
                      onClick={() => handleRemoveArrayItem('brandColors', idx)}
                      variant="outline"
                      size="sm"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {isEditing && (
              <Button
                onClick={() => handleAddArrayItem('brandColors')}
                variant="outline"
                size="sm"
              >
                + Add Color
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Contact Preferences Card */}
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Contact Preferences</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={data.contactPreferences.email}
                onChange={(e) =>
                  handleFieldChange('contactPreferences', {
                    ...data.contactPreferences,
                    email: e.target.checked,
                  })
                }
                disabled={!isEditing}
              />
              <span className="text-slate-700 dark:text-slate-300">Email contact enabled</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={data.contactPreferences.phone}
                onChange={(e) =>
                  handleFieldChange('contactPreferences', {
                    ...data.contactPreferences,
                    phone: e.target.checked,
                  })
                }
                disabled={!isEditing}
              />
              <span className="text-slate-700 dark:text-slate-300">Phone contact enabled</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={data.contactPreferences.booking}
                onChange={(e) =>
                  handleFieldChange('contactPreferences', {
                    ...data.contactPreferences,
                    booking: e.target.checked,
                  })
                }
                disabled={!isEditing}
              />
              <span className="text-slate-700 dark:text-slate-300">Calendar booking enabled</span>
            </label>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-between">
          <Button
            onClick={handleBack}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="flex gap-4">
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isEditing ? (
                <>
                  <Check className="w-4 h-4" />
                  Done Editing
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4" />
                  Edit
                </>
              )}
            </Button>

            <Button
              onClick={handleConfirm}
              disabled={errors.length > 0}
              className="flex items-center gap-2"
            >
              Create Website
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
