/**
 * Publisher Module Index & Type Adapter
 * Provides type-safe exports for all publisher modules with proper type conversions
 */

// Import publishers for use in factory
import { publishToInstagram } from './instagram-publisher.js';
import { publishToTwitter } from './twitter-publisher.js';
import { publishToLinkedIn } from './linkedin-publisher.js';
import { publishToTikTok } from './tiktok-publisher.js';
import { publishToFacebook } from './facebook-publisher.js';

// Re-export Instagram publisher
export {
  publishToInstagram,
  getInstagramInsights,
  validateInstagramCredentials,
} from './instagram-publisher.js';
export type { InstagramPublishRequest } from './instagram-publisher.js';

// Re-export Twitter publisher
export {
  publishToTwitter,
  uploadTwitterMedia,
  getTwitterMetrics,
  validateTwitterCredentials,
} from './twitter-publisher.js';
export type { TwitterPublishRequest } from './twitter-publisher.js';

// Re-export LinkedIn publisher
export {
  publishToLinkedIn,
  uploadLinkedInMedia,
  getLinkedInMetrics,
  validateLinkedInCredentials,
} from './linkedin-publisher.js';
export type { LinkedInPublishRequest } from './linkedin-publisher.js';

// Re-export TikTok publisher
export {
  publishToTikTok,
  getTikTokVideoStats,
  getTikTokAccountStats,
  validateTikTokCredentials,
  refreshTikTokToken,
} from './tiktok-publisher.js';
export type { TikTokPublishRequest } from './tiktok-publisher.js';

// Re-export Facebook publisher
export {
  publishToFacebook,
  uploadFacebookPhoto,
  uploadFacebookVideo,
  getFacebookPageInsights,
  getFacebookPostMetrics,
  validateFacebookCredentials,
  getUserFacebookPages,
} from './facebook-publisher.js';
export type { FacebookPublishRequest } from './facebook-publisher.js';

// Re-export unified orchestrator
export {
  publishToAllPlatforms,
  validateContentForPlatform,
  getPlatformRequirements,
  getOptimalPostingTime,
} from './unified-publisher.js';
export type { PlatformCredentials, UnifiedPublishRequest, PublishResult } from './unified-publisher.js';

// Type definitions for platform-specific publish results
export type PublishRequestByPlatform = {
  instagram: import('./instagram-publisher.js').InstagramPublishRequest;
  twitter: import('./twitter-publisher.js').TwitterPublishRequest;
  linkedin: import('./linkedin-publisher.js').LinkedInPublishRequest;
  tiktok: import('./tiktok-publisher.js').TikTokPublishRequest;
  facebook: import('./facebook-publisher.js').FacebookPublishRequest;
};

// Type-safe publisher factory
export async function createPublishedContent(
  platform: 'instagram' | 'twitter' | 'linkedin' | 'tiktok' | 'facebook',
  credentials: any,
  content: any
): Promise<any> {
  switch (platform) {
    case 'instagram':
      return publishToInstagram(credentials, content);
    case 'twitter':
      return publishToTwitter(credentials, content);
    case 'linkedin':
      return publishToLinkedIn(credentials, content);
    case 'tiktok':
      return publishToTikTok(credentials, content);
    case 'facebook':
      return publishToFacebook(credentials, content);
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}
