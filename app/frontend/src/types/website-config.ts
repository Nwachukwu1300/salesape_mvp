/**
 * Website Configuration Types for Frontend
 * Matches the backend WebsiteConfig structure
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

export interface ImageAssets {
  hero: string;
  gallery: string[];
}

export interface WebsiteTemplate {
  id: string;
  name: string;
  description: string;
  layout: {
    heroStyle: 'image-left' | 'image-full' | 'centered';
    servicesLayout: 'grid' | 'list';
    typography: 'modern' | 'classic' | 'luxury';
  };
  defaultSections: string[];
  stylingRules: {
    spacing: 'compact' | 'comfortable' | 'spacious';
    imageRadius: number;
    shadowIntensity: 'none' | 'light' | 'medium' | 'heavy';
    borderStyle: 'none' | 'subtle' | 'bold';
  };
}

export type GenerationStatus = 'idle' | 'queued' | 'processing' | 'completed' | 'failed';
export type GenerationStep =
  | 'queued'
  | 'scraping'
  | 'analyzing'
  | 'selecting_template'
  | 'generating_config'
  | 'enriching_images'
  | 'completed'
  | 'failed';
