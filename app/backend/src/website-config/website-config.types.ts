/**
 * Website Configuration Type Definitions
 * Defines the complete structure for rendering a generated website
 */

export interface MetaConfig {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  favicon?: string;
}

export interface BrandingConfig {
  colors: string[];
  tone: string;
  logoUrl?: string;
  fontFamily?: string;
}

export interface HeroConfig {
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaLink?: string;
  heroImage: string;
  overlayOpacity?: number;
}

export interface ServiceItem {
  name: string;
  description: string;
  icon?: string;
  image?: string;
  price?: string;
}

export interface ServicesConfig {
  title: string;
  subtitle?: string;
  items: ServiceItem[];
}

export interface AboutConfig {
  title: string;
  content: string;
  image?: string;
  highlights?: string[];
}

export interface TestimonialItem {
  name: string;
  title?: string;
  content: string;
  rating?: number;
  image?: string;
}

export interface TestimonialsConfig {
  title: string;
  subtitle?: string;
  items: TestimonialItem[];
}

export interface ContactConfig {
  title: string;
  subtitle?: string;
  email?: string;
  phone?: string;
  address?: string;
  formFields: string[];
  showMap?: boolean;
}

export interface BookingConfig {
  title: string;
  subtitle?: string;
  provider: 'internal' | 'google' | 'calendly';
  calendarId?: string;
  availableSlots?: boolean;
}

export interface LocalSEOConfig {
  location: string;
  keywords: string[];
  serviceArea?: string[];
  businessHours?: string;
}

export interface TrustSignalsConfig {
  items: string[];
  badges?: string[];
  certifications?: string[];
}

export interface FooterConfig {
  copyrightText: string;
  socialLinks?: {
    platform: string;
    url: string;
  }[];
  quickLinks?: {
    label: string;
    anchor: string;
  }[];
}

export interface WebsiteConfig {
  meta: MetaConfig;
  branding: BrandingConfig;
  hero: HeroConfig;
  services: ServicesConfig;
  about: AboutConfig;
  testimonials: TestimonialsConfig;
  contact: ContactConfig;
  booking?: BookingConfig;
  localSEO: LocalSEOConfig;
  trustSignals: TrustSignalsConfig;
  footer: FooterConfig;
  templateId: string;
  generatedAt: string;
}

export interface WebsiteConfigGenerationInput {
  businessUnderstanding: {
    name: string;
    category: string;
    location: string;
    services: string[];
    valueProposition: string;
    targetAudience: string;
    brandTone: string;
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
  };
  templateId: string;
  scrapedData?: {
    email?: string;
    phone?: string;
    images?: string[];
    title?: string;
    description?: string;
  };
}
