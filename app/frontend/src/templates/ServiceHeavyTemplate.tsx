import React from 'react';
import { WebsiteConfig } from '../types/website-config';

interface TemplateProps {
  config: WebsiteConfig;
  businessId: string;
  onLeadSubmit?: (data: { name: string; email: string; phone?: string; message?: string }) => void;
  onBookingClick?: () => void;
}

export const ServiceHeavyTemplate: React.FC<TemplateProps> = ({
  config,
  businessId,
  onLeadSubmit,
  onBookingClick,
}) => {
  const primaryColor = config.branding.colors[0] || '#3B82F6';
  const secondaryColor = config.branding.colors[1] || '#1E40AF';

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onLeadSubmit?.({
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      message: formData.get('message') as string,
    });
  };

  return (
    <div
      className="min-h-screen"
      style={{ fontFamily: config.branding.fontFamily || 'Georgia, serif' }}
    >
      {/* Header Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          {config.branding.logoUrl ? (
            <img src={config.branding.logoUrl} alt="Logo" className="h-10" loading="lazy" />
          ) : (
            <span className="text-xl font-bold" style={{ color: primaryColor }}>
              {config.meta.title.split('|')[0]}
            </span>
          )}
          <nav className="hidden md:flex gap-6">
            <a href="#services" className="text-gray-600 hover:text-gray-900">Services</a>
            <a href="#about" className="text-gray-600 hover:text-gray-900">About</a>
            <a href="#testimonials" className="text-gray-600 hover:text-gray-900">Testimonials</a>
            <a href="#contact" className="text-gray-600 hover:text-gray-900">Contact</a>
          </nav>
          <a
            href={config.hero.ctaLink || '#contact'}
            className="px-5 py-2 rounded-md text-white text-sm font-medium"
            style={{ backgroundColor: primaryColor }}
          >
            {config.hero.ctaText}
          </a>
        </div>
      </header>

      {/* Hero Section - Image Left Layout */}
      <section id="hero" className="pt-24 pb-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <img
                src={config.hero.heroImage}
                alt="Hero"
                className="rounded-lg shadow-lg w-full"
                loading="lazy"
              />
            </div>
            <div className="order-1 md:order-2">
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
                {config.hero.headline}
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                {config.hero.subheadline}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={config.hero.ctaLink || '#contact'}
                  className="inline-block px-8 py-4 text-center font-semibold rounded-md text-white transition-colors"
                  style={{ backgroundColor: primaryColor }}
                  onClick={(e) => {
                    if (config.hero.ctaLink === '#booking' && onBookingClick) {
                      e.preventDefault();
                      onBookingClick();
                    }
                  }}
                >
                  {config.hero.ctaText}
                </a>
                <a
                  href="#services"
                  className="inline-block px-8 py-4 text-center font-semibold rounded-md border-2 transition-colors"
                  style={{ borderColor: primaryColor, color: primaryColor }}
                >
                  View Services
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals Bar */}
      {config.trustSignals.items.length > 0 && (
        <section className="py-8 bg-white border-y border-gray-200">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {config.trustSignals.items.slice(0, 4).map((signal, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
                    style={{ backgroundColor: `${primaryColor}15` }}
                  >
                    <svg className="w-6 h-6" fill={primaryColor} viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-700 font-medium">{signal}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services Section - List Layout */}
      <section id="services" className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {config.services.title}
            </h2>
            {config.services.subtitle && (
              <p className="text-gray-600 text-lg">{config.services.subtitle}</p>
            )}
          </div>
          <div className="space-y-6">
            {config.services.items.map((service, idx) => (
              <div
                key={idx}
                className="flex gap-6 p-6 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
              >
                <div
                  className="w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${primaryColor}15` }}
                >
                  <span className="text-2xl font-bold" style={{ color: primaryColor }}>
                    {idx + 1}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{service.name}</h3>
                  <p className="text-gray-600 leading-relaxed">{service.description}</p>
                  {service.price && (
                    <p className="mt-3 font-semibold" style={{ color: primaryColor }}>
                      Starting at {service.price}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-5 gap-12">
            <div className="md:col-span-3">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {config.about.title}
              </h2>
              <div className="prose prose-lg text-gray-600">
                <p className="leading-relaxed">{config.about.content}</p>
              </div>
            </div>
            <div className="md:col-span-2">
              {config.about.highlights && config.about.highlights.length > 0 && (
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-4">Why Choose Us</h3>
                  <ul className="space-y-3">
                    {config.about.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 mt-0.5 flex-shrink-0"
                          fill={primaryColor}
                          viewBox="0 0 20 20"
                        >
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {config.about.image && (
                <img
                  src={config.about.image}
                  alt="About"
                  className="rounded-lg mt-6 w-full"
                  loading="lazy"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {config.testimonials && config.testimonials.items.length > 0 && (
        <section id="testimonials" className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {config.testimonials.title}
              </h2>
              {config.testimonials.subtitle && (
                <p className="text-gray-600">{config.testimonials.subtitle}</p>
              )}
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {config.testimonials.items.map((testimonial, idx) => (
                <div
                  key={idx}
                  className="p-6 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < (testimonial.rating || 5) ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <blockquote className="text-gray-700 mb-4">
                    "{testimonial.content}"
                  </blockquote>
                  <div className="flex items-center gap-3">
                    {testimonial.image ? (
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-10 h-10 rounded-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {testimonial.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      {testimonial.title && (
                        <p className="text-sm text-gray-500">{testimonial.title}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      {config.contact && (
        <section id="contact" className="py-20 px-4 bg-gray-900">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              <div className="text-white">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  {config.contact.title}
                </h2>
                {config.contact.subtitle && (
                  <p className="text-gray-400 mb-8">{config.contact.subtitle}</p>
                )}
                <div className="space-y-4">
                  {config.contact.email && (
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <a href={`mailto:${config.contact.email}`} className="text-white hover:underline">
                        {config.contact.email}
                      </a>
                    </div>
                  )}
                  {config.contact.phone && (
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <a href={`tel:${config.contact.phone}`} className="text-white hover:underline">
                        {config.contact.phone}
                      </a>
                    </div>
                  )}
                  {config.contact.address && (
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{config.contact.address}</span>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 shadow-lg">
                  <div className="space-y-4">
                    <input
                      type="text"
                      name="name"
                      placeholder="Your Name"
                      required
                      className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="Your Email"
                      required
                      className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Your Phone"
                      className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                    <textarea
                      name="message"
                      rows={4}
                      placeholder="How can we help?"
                      className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                    />
                    <button
                      type="submit"
                      className="w-full py-3 font-semibold rounded-md text-white transition-colors hover:opacity-90"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Send Message
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Booking CTA */}
      {config.booking && (
        <section id="booking" className="py-16 px-4" style={{ backgroundColor: primaryColor }}>
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              {config.booking.title}
            </h2>
            {config.booking.subtitle && (
              <p className="mb-6 opacity-90">{config.booking.subtitle}</p>
            )}
            <button
              onClick={onBookingClick}
              className="px-8 py-4 bg-white font-semibold rounded-md transition-colors hover:bg-gray-100"
              style={{ color: primaryColor }}
            >
              Schedule a Consultation
            </button>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-900 border-t border-gray-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">{config.footer.copyrightText}</p>
          {config.footer.quickLinks && (
            <nav className="flex gap-6 text-sm">
              {config.footer.quickLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link.anchor}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          )}
        </div>
      </footer>
    </div>
  );
};

export default ServiceHeavyTemplate;
