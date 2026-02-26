/**
 * Unified Publisher Orchestrator
 * Handles publishing content to multiple social media platforms with centralized logic
 */

import { publishToInstagram } from './instagram-publisher.js';
import { publishToTwitter } from './twitter-publisher.js';
import { publishToLinkedIn } from './linkedin-publisher.js';
import { publishToTikTok } from './tiktok-publisher.js';
import { publishToFacebook } from './facebook-publisher.js';

import type { Platform } from '../types/workflow.types.js';

export interface PlatformCredentials {
  platform: Platform;
  credentials: any; // Platform-specific credentials object
}

export interface UnifiedPublishRequest {
  content: string;
  caption?: string;
  hashtags?: string[];
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  platforms: Platform[];
  schedule?: Date;
}

export interface PublishResult {
  platform: Platform;
  postId?: string | null;
  status: 'success' | 'scheduled' | 'processing' | 'pending' | 'error';
  externalUrl?: string | null;
  scheduledFor?: Date | null;
  error?: string | null;
  timestamp: Date;
}

/**
 * Intelligently publish content to multiple platforms
 * Handles platform-specific requirements and formats
 */
export async function publishToAllPlatforms(
  credentials: { [platform in Platform]?: any },
  content: UnifiedPublishRequest
): Promise<PublishResult[]> {
  const results: PublishResult[] = [];
  const publishingTasks: Promise<void>[] = [];

  for (const platform of content.platforms) {
    const platformCredentials = credentials[platform];
    if (!platformCredentials) {
      results.push({
        platform,
        status: 'error',
        error: `No credentials available for ${platform}`,
        timestamp: new Date(),
      });
      continue;
    }

    // Launch publishing task for each platform
    const task = publishToPlatform(platform, platformCredentials, content)
      .then((result) => {
        results.push(result);
      })
      .catch((error) => {
        results.push({
          platform,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date(),
        });
      });

    publishingTasks.push(task);
  }

  // Wait for all publishing tasks to complete
  await Promise.allSettled(publishingTasks);

  return results;
}

/**
 * Publish to a single platform
 * Routes to the appropriate publisher based on platform type
 */
async function publishToPlatform(
  platform: Platform,
  credentials: any,
  content: UnifiedPublishRequest
): Promise<PublishResult> {
  switch (platform.toLowerCase()) {
    case 'instagram': {
      const payload: any = {
        caption: content.caption || content.content,
        hashtags: content.hashtags,
        schedule: content.schedule,
      };
      if (content.mediaUrl && content.mediaType === 'image') {
        payload.imageUrl = content.mediaUrl;
      } else if (content.mediaUrl && content.mediaType === 'video') {
        payload.videoUrl = content.mediaUrl;
      }
      return publishToInstagram(credentials, payload);
    }

    case 'twitter': {
      const payload: any = {
        text: (content.caption || content.content).substring(0, 280),
        schedule: content.schedule,
      };
      if (content.mediaUrl) {
        payload.mediaIds = [content.mediaUrl];
      }
      return publishToTwitter(credentials, payload);
    }

    case 'linkedin': {
      const payload: any = {
        text: content.content,
        schedule: content.schedule,
      };
      if (content.mediaUrl) {
        payload.mediaUrl = content.mediaUrl;
        payload.mediaType = content.mediaType;
      }
      return publishToLinkedIn(credentials, payload);
    }

    case 'tiktok': {
      if (!content.mediaUrl || content.mediaType !== 'video') {
        return {
          platform,
          status: 'error',
          error: 'TikTok requires a video URL',
          timestamp: new Date(),
        };
      }
      return publishToTikTok(credentials, {
        videoUrl: content.mediaUrl,
        caption: content.caption || content.content,
        hashtags: content.hashtags || null,
      });
    }

    case 'facebook': {
      const payload: any = {
        message: content.content,
        publishedAt: content.schedule,
        isScheduled: !!content.schedule,
      };
      if (content.mediaUrl && content.mediaType === 'image') {
        payload.imageUrl = content.mediaUrl;
      } else if (content.mediaUrl && content.mediaType === 'video') {
        payload.videoUrl = content.mediaUrl;
      }
      return publishToFacebook(credentials, payload);
    }

    default:
      return {
        platform,
        status: 'error',
        error: `Unsupported platform: ${platform}`,
        timestamp: new Date(),
      };
  }
}

/**
 * Get platform-specific content requirements
 * Helps validate content before publishing
 */
export function getPlatformRequirements(platform: Platform): {
  maxCaptionLength: number;
  maxHashtags: number;
  requiresMedia: boolean;
  supportedMediaTypes: string[];
  recommendations: string[];
} {
  const requirements: {
    [key: string]: {
      maxCaptionLength: number;
      maxHashtags: number;
      requiresMedia: boolean;
      supportedMediaTypes: string[];
      recommendations: string[];
    };
  } = {
    instagram: {
      maxCaptionLength: 2200,
      maxHashtags: 30,
      requiresMedia: true,
      supportedMediaTypes: ['image', 'video'],
      recommendations: [
        'Use 5-30 hashtags for maximum reach',
        'Best times: Tuesday-Thursday 7-9 PM',
        'Include call-to-action in caption',
      ],
    },
    twitter: {
      maxCaptionLength: 280,
      maxHashtags: 5,
      requiresMedia: false,
      supportedMediaTypes: ['image', 'video'],
      recommendations: [
        'Keep tweets concise and engaging',
        'Use 1-3 relevant hashtags',
        'Best times: Monday-Friday 8 AM-10 AM',
      ],
    },
    linkedin: {
      maxCaptionLength: 3000,
      maxHashtags: 5,
      requiresMedia: false,
      supportedMediaTypes: ['image', 'video', 'document'],
      recommendations: [
        'Focus on professional insights',
        'Encourage comments with questions',
        'Best times: Tuesday-Wednesday 10 AM-12 PM',
      ],
    },
    tiktok: {
      maxCaptionLength: 2200,
      maxHashtags: 10,
      requiresMedia: true,
      supportedMediaTypes: ['video'],
      recommendations: [
        'Videos perform best 3 seconds to 10 minutes',
        'Use trending sounds and hashtags',
        'Best times: Wednesday-Friday 6-9 PM',
      ],
    },
    facebook: {
      maxCaptionLength: 5000,
      maxHashtags: 10,
      requiresMedia: false,
      supportedMediaTypes: ['image', 'video', 'link'],
      recommendations: [
        'Keep tone conversational and friendly',
        'Encourage community engagement',
        'Best times: Thursday 1-3 PM',
      ],
    },
  };

  return (
    requirements[platform.toLowerCase()] || {
      maxCaptionLength: 280,
      maxHashtags: 5,
      requiresMedia: false,
      supportedMediaTypes: ['image', 'video'],
      recommendations: [],
    }
  );
}

/**
 * Validate content against platform requirements
 */
export function validateContentForPlatform(
  platform: Platform,
  content: UnifiedPublishRequest
): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const requirements = getPlatformRequirements(platform);

  // Check caption length
  const caption = content.caption || content.content;
  if (caption.length > requirements.maxCaptionLength) {
    errors.push(
      `Caption exceeds ${platform} limit of ${requirements.maxCaptionLength} characters (${caption.length} chars)`
    );
  }

  // Check hashtag count
  if (content.hashtags && content.hashtags.length > requirements.maxHashtags) {
    warnings.push(
      `Using ${content.hashtags.length} hashtags, ${platform} recommends max ${requirements.maxHashtags}`
    );
  }

  // Check media requirements
  if (requirements.requiresMedia && !content.mediaUrl) {
    errors.push(`${platform} requires media (image or video)`);
  }

  // Check media type support
  if (content.mediaUrl && content.mediaType) {
    if (!requirements.supportedMediaTypes.includes(content.mediaType)) {
      errors.push(
        `${platform} does not support ${content.mediaType}. Supported types: ${requirements.supportedMediaTypes.join(', ')}`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get optimal posting time for platform
 */
export function getOptimalPostingTime(platform: Platform): { day: string; timeRange: string } {
  const optimalTimes: { [key: string]: { day: string; timeRange: string } } = {
    instagram: { day: 'Tuesday-Thursday', timeRange: '7-9 PM' },
    twitter: { day: 'Monday-Friday', timeRange: '8-10 AM' },
    linkedin: { day: 'Tuesday-Wednesday', timeRange: '10 AM-12 PM' },
    tiktok: { day: 'Wednesday-Friday', timeRange: '6-9 PM' },
    facebook: { day: 'Thursday', timeRange: '1-3 PM' },
  };

  return (
    optimalTimes[platform.toLowerCase()] || {
      day: 'Tuesday',
      timeRange: '12-2 PM',
    }
  );
}
