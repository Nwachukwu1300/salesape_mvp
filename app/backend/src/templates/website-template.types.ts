/**
 * Website Template Type Definitions
 * Defines the structure for website templates used in the generation engine
 */

export type HeroStyle = 'image-left' | 'image-full' | 'centered';
export type ServicesLayout = 'grid' | 'list';
export type Typography = 'modern' | 'classic' | 'luxury';
export type Spacing = 'compact' | 'comfortable' | 'spacious';
export type SectionType = 'hero' | 'services' | 'about' | 'testimonials' | 'contact' | 'booking';

export interface TemplateLayout {
  heroStyle: HeroStyle;
  servicesLayout: ServicesLayout;
  typography: Typography;
}

export interface StylingRules {
  spacing: Spacing;
  imageRadius: number;
  shadowIntensity: 'none' | 'light' | 'medium' | 'heavy';
  borderStyle: 'none' | 'subtle' | 'bold';
}

export interface WebsiteTemplate {
  id: string;
  name: string;
  description: string;
  layout: TemplateLayout;
  defaultSections: SectionType[];
  stylingRules: StylingRules;
  previewImage?: string;
  categories: string[]; // Industries this template works well for
  tones: string[]; // Brand tones this template matches
}

export interface TemplateSelectionCriteria {
  category: string;
  brandTone: string;
  services?: string[];
  hasImages?: boolean;
}

export interface TemplateSelectionResult {
  template: WebsiteTemplate;
  confidence: number; // 0-100
  reason: string;
}
