import React from 'react';
import { WebsiteConfig } from '../types/website-config';

interface TemplateProps {
  config: WebsiteConfig;
  businessId: string;
  onLeadSubmit?: (data: { name: string; email: string; phone?: string; message?: string }) => void;
  onBookingClick?: () => void;
}

export const LuxuryTemplate: React.FC<TemplateProps> = ({
  config,
  businessId,
  onLeadSubmit,
  onBookingClick,
}) => {
  const primaryColor = config.branding.colors[0] || '#C4A052';
  const secondaryColor = config.branding.colors[1] || '#1A1A1A';

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
      className="min-h-screen bg-black text-white"
      style={{ fontFamily: config.branding.fontFamily || '"Playfair Display", serif' }}
    >
      {/* Elegant Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          {config.branding.logoUrl ? (
            <img src={config.branding.logoUrl} alt="Logo" className="h-12" loading="lazy" />
          ) : (
            <span className="text-2xl font-serif tracking-widest" style={{ color: primaryColor }}>
              {config.meta.title.split('|')[0].toUpperCase()}
            </span>
          )}
          <nav className="hidden md:flex gap-10 text-sm tracking-widest uppercase">
            <a href="#services" className="text-white/70 hover:text-white transition-colors">Services</a>
            <a href="#about" className="text-white/70 hover:text-white transition-colors">About</a>
            <a href="#testimonials" className="text-white/70 hover:text-white transition-colors">Testimonials</a>
            <a href="#contact" className="text-white/70 hover:text-white transition-colors">Contact</a>
          </nav>
          <a
            href={config.hero.ctaLink || '#contact'}
            className="px-6 py-2 text-sm tracking-widest uppercase border transition-all hover:bg-white"
            style={{ borderColor: primaryColor, color: primaryColor }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = primaryColor;
              e.currentTarget.style.color = '#000';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = primaryColor;
            }}
          >
            Inquire
          </a>
        </div>
      </header>

      {/* Hero Section - Centered Elegant */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${config.hero.heroImage})` }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <div
            className="w-24 h-[1px] mx-auto mb-10"
            style={{ backgroundColor: primaryColor }}
          />
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif tracking-wide leading-tight mb-8">
            {config.hero.headline}
          </h1>
          <p className="text-lg md:text-xl text-white/80 tracking-wide max-w-2xl mx-auto mb-12">
            {config.hero.subheadline}
          </p>
          <a
            href={config.hero.ctaLink || '#contact'}
            className="inline-block px-10 py-4 text-sm tracking-[0.2em] uppercase border-2 transition-all hover:bg-white hover:text-black"
            style={{ borderColor: primaryColor }}
            onClick={(e) => {
              if (config.hero.ctaLink === '#booking' && onBookingClick) {
                e.preventDefault();
                onBookingClick();
              }
            }}
          >
            {config.hero.ctaText}
          </a>
          <div
            className="w-24 h-[1px] mx-auto mt-10"
            style={{ backgroundColor: primaryColor }}
          />
        </div>
      </section>

      {/* Trust Signals - Elegant Strip */}
      {config.trustSignals.items.length > 0 && (
        <section className="py-8 border-y border-white/10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-wrap justify-center items-center gap-10 text-sm tracking-widest uppercase text-white/60">
              {config.trustSignals.items.map((signal, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span className="w-1 h-1 rounded-full" style={{ backgroundColor: primaryColor }} />}
                  <span>{signal}</span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services Section - Spacious Grid */}
      <section id="services" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span
              className="text-sm tracking-[0.3em] uppercase block mb-4"
              style={{ color: primaryColor }}
            >
              What We Offer
            </span>
            <h2 className="text-4xl md:text-5xl font-serif mb-6">
              {config.services.title}
            </h2>
            {config.services.subtitle && (
              <p className="text-white/60 text-lg max-w-2xl mx-auto">
                {config.services.subtitle}
              </p>
            )}
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-1">
            {config.services.items.map((service, idx) => (
              <div
                key={idx}
                className="group relative aspect-square overflow-hidden"
              >
                {service.image && (
                  <img
                    src={service.image}
                    alt={service.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                )}
                <div className="absolute inset-0 bg-black/60 group-hover:bg-black/80 transition-colors" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                  <h3 className="text-2xl font-serif mb-4 tracking-wide">{service.name}</h3>
                  <p className="text-white/70 text-sm tracking-wide opacity-0 group-hover:opacity-100 transition-opacity">
                    {service.description}
                  </p>
                  {service.price && (
                    <p
                      className="mt-4 text-sm tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: primaryColor }}
                    >
                      {service.price}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section - Elegant Split */}
      <section id="about" className="py-32 px-6 bg-neutral-950">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <span
                className="text-sm tracking-[0.3em] uppercase block mb-6"
                style={{ color: primaryColor }}
              >
                Our Story
              </span>
              <h2 className="text-4xl md:text-5xl font-serif mb-8 leading-tight">
                {config.about.title}
              </h2>
              <div
                className="w-20 h-[1px] mb-8"
                style={{ backgroundColor: primaryColor }}
              />
              <p className="text-white/70 text-lg leading-relaxed mb-10">
                {config.about.content}
              </p>
              {config.about.highlights && config.about.highlights.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {config.about.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div
                        className="w-2 h-2"
                        style={{ backgroundColor: primaryColor }}
                      />
                      <span className="text-sm tracking-wide text-white/80">{highlight}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {config.about.image && (
              <div className="relative">
                <div
                  className="absolute -inset-4 border"
                  style={{ borderColor: primaryColor }}
                />
                <img
                  src={config.about.image}
                  alt="About"
                  className="w-full grayscale hover:grayscale-0 transition-all duration-700"
                  loading="lazy"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials - Elegant Cards */}
      {config.testimonials.items.length > 0 && (
        <section id="testimonials" className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <span
                className="text-sm tracking-[0.3em] uppercase block mb-4"
                style={{ color: primaryColor }}
              >
                Client Experiences
              </span>
              <h2 className="text-4xl md:text-5xl font-serif">
                {config.testimonials.title}
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-10">
              {config.testimonials.items.map((testimonial, idx) => (
                <div
                  key={idx}
                  className="text-center p-10 border border-white/10 hover:border-white/30 transition-colors"
                >
                  <div className="flex justify-center gap-1 mb-8">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-4 h-4"
                        fill={i < (testimonial.rating || 5) ? primaryColor : 'transparent'}
                        stroke={primaryColor}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-white/80 italic mb-8 leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div
                    className="w-10 h-[1px] mx-auto mb-6"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <p className="font-serif tracking-wide">{testimonial.name}</p>
                  {testimonial.title && (
                    <p className="text-sm text-white/50 mt-1">{testimonial.title}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section - Elegant Form */}
      <section id="contact" className="py-32 px-6 bg-neutral-950">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span
              className="text-sm tracking-[0.3em] uppercase block mb-4"
              style={{ color: primaryColor }}
            >
              Get in Touch
            </span>
            <h2 className="text-4xl md:text-5xl font-serif mb-6">
              {config.contact.title}
            </h2>
            {config.contact.subtitle && (
              <p className="text-white/60">{config.contact.subtitle}</p>
            )}
          </div>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm tracking-widest uppercase mb-3 text-white/60">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-0 py-4 bg-transparent border-0 border-b border-white/30 focus:border-white outline-none text-white"
                />
              </div>
              <div>
                <label className="block text-sm tracking-widest uppercase mb-3 text-white/60">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-0 py-4 bg-transparent border-0 border-b border-white/30 focus:border-white outline-none text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm tracking-widest uppercase mb-3 text-white/60">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                className="w-full px-0 py-4 bg-transparent border-0 border-b border-white/30 focus:border-white outline-none text-white"
              />
            </div>
            <div>
              <label className="block text-sm tracking-widest uppercase mb-3 text-white/60">
                Message
              </label>
              <textarea
                name="message"
                rows={4}
                className="w-full px-0 py-4 bg-transparent border-0 border-b border-white/30 focus:border-white outline-none text-white resize-none"
              />
            </div>
            <div className="text-center pt-8">
              <button
                type="submit"
                className="px-16 py-5 text-sm tracking-[0.2em] uppercase border-2 transition-all hover:bg-white hover:text-black"
                style={{ borderColor: primaryColor }}
              >
                Send Inquiry
              </button>
            </div>
          </form>

          {/* Contact Details */}
          <div className="mt-20 pt-20 border-t border-white/10 grid md:grid-cols-3 gap-10 text-center">
            {config.contact.email && (
              <div>
                <p className="text-sm tracking-widest uppercase text-white/40 mb-3">Email</p>
                <a href={`mailto:${config.contact.email}`} className="text-white hover:underline">
                  {config.contact.email}
                </a>
              </div>
            )}
            {config.contact.phone && (
              <div>
                <p className="text-sm tracking-widest uppercase text-white/40 mb-3">Phone</p>
                <a href={`tel:${config.contact.phone}`} className="text-white hover:underline">
                  {config.contact.phone}
                </a>
              </div>
            )}
            {config.contact.address && (
              <div>
                <p className="text-sm tracking-widest uppercase text-white/40 mb-3">Location</p>
                <span className="text-white">{config.contact.address}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Booking Section */}
      {config.booking && (
        <section id="booking" className="py-24 px-6 border-y border-white/10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-serif mb-6">
              {config.booking.title}
            </h2>
            {config.booking.subtitle && (
              <p className="text-white/60 mb-10">{config.booking.subtitle}</p>
            )}
            <button
              onClick={onBookingClick}
              className="px-12 py-5 text-sm tracking-[0.2em] uppercase transition-all"
              style={{ backgroundColor: primaryColor, color: '#000' }}
            >
              Reserve Your Experience
            </button>
          </div>
        </section>
      )}

      {/* Footer - Minimal Elegant */}
      <footer className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center gap-8">
            {config.footer.quickLinks && (
              <nav className="flex gap-10 text-sm tracking-widest uppercase">
                {config.footer.quickLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.anchor}
                    className="text-white/50 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            )}
            <div
              className="w-20 h-[1px]"
              style={{ backgroundColor: primaryColor }}
            />
            <p className="text-sm text-white/40 tracking-wide">
              {config.footer.copyrightText}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LuxuryTemplate;
