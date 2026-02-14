import React, { useState } from 'react';
import { WebsiteConfig } from '../types/website-config';
import { ImageHeavyTemplate, ServiceHeavyTemplate, LuxuryTemplate } from '../templates';

interface WebsiteRendererProps {
  config: WebsiteConfig;
  templateId: string;
  businessId: string;
  onLeadSubmit?: (data: { name: string; email: string; phone?: string; message?: string }) => Promise<void>;
  onBookingClick?: () => void;
  isPreview?: boolean;
}

export const WebsiteRenderer: React.FC<WebsiteRendererProps> = ({
  config,
  templateId,
  businessId,
  onLeadSubmit,
  onBookingClick,
  isPreview = false,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleLeadSubmit = async (data: { name: string; email: string; phone?: string; message?: string }) => {
    if (isPreview) {
      // In preview mode, just show success
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
      return;
    }

    if (!onLeadSubmit) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onLeadSubmit(data);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      setSubmitError('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookingClick = () => {
    if (isPreview) {
      alert('Booking would open here in the live site.');
      return;
    }
    onBookingClick?.();
  };

  // Select template based on templateId
  const renderTemplate = () => {
    const commonProps = {
      config,
      businessId,
      onLeadSubmit: handleLeadSubmit,
      onBookingClick: handleBookingClick,
    };

    switch (templateId) {
      case 'image-heavy':
        return <ImageHeavyTemplate {...commonProps} />;
      case 'service-heavy':
        return <ServiceHeavyTemplate {...commonProps} />;
      case 'luxury':
        return <LuxuryTemplate {...commonProps} />;
      default:
        // Default to service-heavy if unknown template
        return <ServiceHeavyTemplate {...commonProps} />;
    }
  };

  return (
    <div className="relative">
      {/* Status Messages */}
      {(submitSuccess || submitError || isSubmitting) && (
        <div className="fixed top-4 right-4 z-[9999]">
          {isSubmitting && (
            <div className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Sending...
            </div>
          )}
          {submitSuccess && (
            <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Message sent successfully!
            </div>
          )}
          {submitError && (
            <div className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              {submitError}
            </div>
          )}
        </div>
      )}

      {/* Preview Badge */}
      {isPreview && (
        <div className="fixed bottom-4 left-4 z-[9999] bg-yellow-500 text-black px-4 py-2 rounded-lg shadow-lg text-sm font-medium">
          Preview Mode
        </div>
      )}

      {/* Render the selected template */}
      {renderTemplate()}
    </div>
  );
};

export default WebsiteRenderer;
