/**
 * Generated Type Definitions for New Workflow Models
 * These types are derived from the updated Prisma schema
 */

// ===== WebsiteVersion =====
export interface WebsiteVersion {
  id: string;
  businessId: string;
  versionNumber: number;
  config: Record<string, any>;
  template: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWebsiteVersionInput {
  businessId: string;
  versionNumber: number;
  config: Record<string, any>;
  template: string;
  status?: 'draft' | 'published' | 'archived';
}

export interface UpdateWebsiteVersionInput {
  status?: 'draft' | 'published' | 'archived';
  config?: Record<string, any>;
}

// ===== WebsiteAsset =====
export interface WebsiteAsset {
  id: string;
  businessId: string;
  type: 'logo' | 'image' | 'icon' | string;
  url: string;
  source: 'extracted' | 'generated' | 'uploaded' | string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWebsiteAssetInput {
  businessId: string;
  type: string;
  url: string;
  source: string;
  metadata?: Record<string, any>;
}

// ===== ContentInput =====
export type ContentInputType = 'text' | 'video' | 'audio' | 'blog_url';
export type ContentInputStatus = 'processing' | 'ready' | 'failed';

export interface ContentInput {
  id: string;
  businessId: string;
  type: ContentInputType;
  title?: string;
  content?: string;
  url?: string;
  storagePath?: string;
  status: ContentInputStatus;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateContentInputInput {
  businessId: string;
  type: ContentInputType;
  title?: string;
  content?: string;
  url?: string;
  storagePath?: string;
  metadata?: Record<string, any>;
}

export interface UpdateContentInputInput {
  status?: ContentInputStatus;
  metadata?: Record<string, any>;
}

// ===== RepurposedContent =====
export type Platform = 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'linkedin' | 'facebook';
export type RepurposedContentStatus = 'draft' | 'approved' | 'published';

export interface RepurposedContent {
  id: string;
  businessId: string;
  contentInputId: string;
  platform: Platform;
  content: string;
  caption?: string;
  hashtags?: string[];
  status: RepurposedContentStatus;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRepurposedContentInput {
  businessId: string;
  contentInputId: string;
  platform: Platform;
  content: string;
  caption?: string;
  hashtags?: string[];
  status?: RepurposedContentStatus;
}

export interface UpdateRepurposedContentInput {
  status?: RepurposedContentStatus;
  content?: string;
  caption?: string;
  hashtags?: string[];
}

// ===== PlatformDistribution =====
export interface PlatformDistributionMetrics {
  views?: number;
  likes?: number;
  shares?: number;
  comments?: number;
  saves?: number;
  clicks?: number;
  impressions?: number;
  [key: string]: number | undefined;
}

export interface PlatformDistribution {
  id: string;
  businessId: string;
  repurposedContentId: string;
  platform: Platform;
  externalId?: string;
  url?: string;
  metrics?: PlatformDistributionMetrics;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePlatformDistributionInput {
  businessId: string;
  repurposedContentId: string;
  platform: Platform;
  externalId?: string;
  url?: string;
  metrics?: PlatformDistributionMetrics;
  publishedAt?: Date;
}

export interface UpdatePlatformDistributionInput {
  metrics?: PlatformDistributionMetrics;
  url?: string;
  externalId?: string;
}

// ===== AnalyticsSnapshot =====
export type TrendDirection = 'positive' | 'neutral' | 'negative';

export interface AnalyticsSnapshot {
  id: string;
  businessId: string;
  snapshotDate: Date;
  engagementRate: number;
  completionRate: number;
  viewVelocity: number;
  ctr: number;
  conversionSignals: number;
  aiCitationFrequency: number;
  seoImpactTrend: TrendDirection;
  aeoImpactTrend: TrendDirection;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface CreateAnalyticsSnapshotInput {
  businessId: string;
  snapshotDate: Date;
  engagementRate?: number;
  completionRate?: number;
  viewVelocity?: number;
  ctr?: number;
  conversionSignals?: number;
  aiCitationFrequency?: number;
  seoImpactTrend?: TrendDirection;
  aeoImpactTrend?: TrendDirection;
  metadata?: Record<string, any>;
}

// ===== ConnectedAccount =====
export interface ConnectedAccount {
  id: string;
  businessId: string;
  platform: Platform;
  accountId: string;
  accountName?: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateConnectedAccountInput {
  businessId: string;
  platform: Platform;
  accountId: string;
  accountName?: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}

export interface UpdateConnectedAccountInput {
  isActive?: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
}

// ===== PublishingControl =====
export interface PublishingControl {
  id: string;
  businessId: string;
  requiresApproval: boolean;
  autoPublish: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePublishingControlInput {
  businessId: string;
  requiresApproval?: boolean;
  autoPublish?: boolean;
}

export interface UpdatePublishingControlInput {
  requiresApproval?: boolean;
  autoPublish?: boolean;
}

// ===== GrowthModeSettings =====
export type GrowthMode = 'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE';

export const GROWTH_MODE_LIMITS: Record<GrowthMode, { min: number; max: number; default: number }> = {
  CONSERVATIVE: { min: 1, max: 3, default: 2 },
  BALANCED: { min: 3, max: 5, default: 5 },
  AGGRESSIVE: { min: 5, max: 10, default: 8 },
};

export interface GrowthModeSettings {
  id: string;
  businessId: string;
  mode: GrowthMode;
  outputLimit: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateGrowthModeSettingsInput {
  businessId: string;
  mode?: GrowthMode;
  outputLimit?: number;
}

export interface UpdateGrowthModeSettingsInput {
  mode?: GrowthMode;
  outputLimit?: number;
}

// ===== BookingConfig =====
export interface BookingConfig {
  id: string;
  businessId: string;
  isEnabled: boolean;
  timezone: string;
  requiresApproval: boolean;
  notificationEmail?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBookingConfigInput {
  businessId: string;
  isEnabled?: boolean;
  timezone?: string;
  requiresApproval?: boolean;
  notificationEmail?: string;
}

export interface UpdateBookingConfigInput {
  isEnabled?: boolean;
  timezone?: string;
  requiresApproval?: boolean;
  notificationEmail?: string;
}

// ===== Aggregate Interfaces =====

export interface BusinessWithWorkflow {
  id: string;
  userId: string;
  name: string;
  websiteVersions: WebsiteVersion[];
  websiteAssets: WebsiteAsset[];
  contentInputs: ContentInput[];
  repurposedContent: RepurposedContent[];
  analyticsSnapshots: AnalyticsSnapshot[];
  connectedAccounts: ConnectedAccount[];
  publishingControl?: PublishingControl;
  growthModeSettings?: GrowthModeSettings;
  bookingConfig?: BookingConfig;
}
