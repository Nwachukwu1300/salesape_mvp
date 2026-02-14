import React from 'react';
import { WebsiteConfig } from '../types/website-config';

interface TemplateProps {
  config: WebsiteConfig;
  businessId: string;
  onLeadSubmit?: (data: { name: string; email: string; phone?: string; message?: string }) => void;
  onBookingClick?: () => void;
}

export const ImageHeavyTemplate: React.FC<TemplateProps> = ({
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
    <div className="min-h-screen font-sans" style={{ fontFamily: config.branding.fontFamily || 'Inter' }}>
      {/* Hero Section - Full Width Image */}
      <section
        id="hero"
        className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${config.hero.heroImage})` }}
        />
        <div
          className="absolute inset-0"
          style={{ backgroundColor: `rgba(0,0,0,${config.hero.overlayOpacity || 0.4})` }}
        />
        <div className="relative z-10 text-center text-white px-4 max-w-4xl">
          {config.branding.logoUrl && (
            <img
              src={config.branding.logoUrl}
              alt="Logo"
              className="h-16 mx-auto mb-8"
              loading="lazy"
            />
          )}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            {config.hero.headline}
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            {config.hero.subheadline}
          </p>
          <a
            href={config.hero.ctaLink || '#contact'}
            className="inline-block px-8 py-4 text-lg font-semibold rounded-xl transition-all transform hover:scale-105 hover:shadow-xl"
            style={{ backgroundColor: primaryColor, color: '#fff' }}
            onClick={(e) => {
              if (config.hero.ctaLink === '#booking' && onBookingClick) {
                e.preventDefault();
                onBookingClick();
              }
            }}
          >
            {config.hero.ctaText}
          </a>
        </div>
      </section>

      {/* Trust Signals */}
      {config.trustSignals.items.length > 0 && (
        <section className="py-6 bg-gray-100">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-wrap justify-center items-center gap-6 text-gray-600">
              {config.trustSignals.items.map((signal, idx) => (
                <span key={idx} className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {signal}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services Section - Grid Layout */}
      <section id="services" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            {config.services.title}
          </h2>
          {config.services.subtitle && (
            <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
              {config.services.subtitle}
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {config.services.items.map((service, idx) => (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all"
              >
                {service.image && (
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="p-6 bg-white">
                  <h3 className="text-xl font-bold mb-2">{service.name}</h3>
                  <p className="text-gray-600">{service.description}</p>
                  {service.price && (
                    <p className="mt-4 font-semibold" style={{ color: primaryColor }}>
                      {service.price}
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
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {config.about.image && (
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <img
                  src={config.about.image}
                  alt="About us"
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
            )}
            <div className={!config.about.image ? 'md:col-span-2 text-center' : ''}>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {config.about.title}
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                {config.about.content}
              </p>
              {config.about.highlights && config.about.highlights.length > 0 && (
                <ul className="space-y-3">
                  {config.about.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm"
                        style={{ backgroundColor: primaryColor }}
                      >
                        ✓
                      </span>
                      {highlight}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {config.testimonials.items.length > 0 && (
        <section id="testimonials" className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              {config.testimonials.title}
            </h2>
            {config.testimonials.subtitle && (
              <p className="text-gray-600 text-center mb-12">
                {config.testimonials.subtitle}
              </p>
            )}
            <div className="grid md:grid-cols-3 gap-8">
              {config.testimonials.items.map((testimonial, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-gray-50 shadow-lg"
                >
                  {testimonial.rating && (
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${i < testimonial.rating! ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  )}
                  <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    {testimonial.image && (
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full object-cover"
                        loading="lazy"
                      />
                    )}
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
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
      <section id="contact" className="py-20 px-4" style={{ backgroundColor: secondaryColor }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-4">
            {config.contact.title}
          </h2>
          {config.contact.subtitle && (
            <p className="text-white/80 text-center mb-12">
              {config.contact.subtitle}
            </p>
          )}
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <input
                type="tel"
                name="phone"
                placeholder="Your Phone (optional)"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <textarea
                name="message"
                rows={4}
                placeholder="Your Message"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              />
              <button
                type="submit"
                className="w-full py-4 text-lg font-semibold rounded-lg text-white transition-all hover:opacity-90"
                style={{ backgroundColor: primaryColor }}
              >
                Send Message
              </button>
            </form>

            {/* Contact Info */}
            <div className="mt-8 pt-8 border-t border-gray-200 grid md:grid-cols-3 gap-4 text-center">
              {config.contact.email && (
                <a href={`mailto:${config.contact.email}`} className="text-gray-600 hover:text-gray-900">
                  {config.contact.email}
                </a>
              )}
              {config.contact.phone && (
                <a href={`tel:${config.contact.phone}`} className="text-gray-600 hover:text-gray-900">
                  {config.contact.phone}
                </a>
              )}
              {config.contact.address && (
                <span className="text-gray-600">{config.contact.address}</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Booking Section */}
      {config.booking && (
        <section id="booking" className="py-20 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {config.booking.title}
            </h2>
            {config.booking.subtitle && (
              <p className="text-gray-600 mb-8">{config.booking.subtitle}</p>
            )}
            <button
              onClick={onBookingClick}
              className="inline-block px-8 py-4 text-lg font-semibold rounded-xl text-white transition-all hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
            >
              Book an Appointment
            </button>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-gray-400">{config.footer.copyrightText}</p>
            {config.footer.quickLinks && (
              <nav className="flex gap-6">
                {config.footer.quickLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.anchor}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ImageHeavyTemplate;
