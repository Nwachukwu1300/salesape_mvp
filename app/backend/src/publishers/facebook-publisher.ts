/**
 * Facebook Publisher Service
 * Publishes content to Facebook Pages via Graph API
 */

interface FacebookCredentials {
  accessToken: string;
  pageId: string;
  pageAccessToken?: string;
}

export interface FacebookPublishRequest {
  message: string;
  imageUrl?: string;
  videoUrl?: string;
  link?: string;
  linkCaption?: string;
  linkDescription?: string;
  publishedAt?: Date;
  isScheduled?: boolean;
}

interface PublishResult {
  platform: 'facebook';
  postId?: string | null;
  status: 'success' | 'scheduled' | 'pending' | 'error';
  externalUrl?: string | null;
  scheduledFor?: Date | null;
  error?: string | null;
  timestamp: Date;
}

/**
 * Publish to Facebook Page using Graph API v18.0
 * Can publish text-only, with image, with video, or with link
 */
export async function publishToFacebook(
  credentials: FacebookCredentials,
  content: FacebookPublishRequest
): Promise<PublishResult> {
  const timestamp = new Date();

  try {
    // Validate required fields
    if (!credentials.accessToken || !credentials.pageId) {
      throw new Error('Facebook credentials incomplete: accessToken and pageId required');
    }

    if (!content.message) {
      throw new Error('Message is required for Facebook posting');
    }

    // Use page access token if available, otherwise use user token (less secure)
    const token = credentials.pageAccessToken || credentials.accessToken;

    // Build the post payload
    const payload: any = {
      message: content.message,
    };

    // Add media or link
    if (content.imageUrl) {
      payload.picture = content.imageUrl;
      payload.type = 'photo';
    } else if (content.videoUrl) {
      payload.video_url = content.videoUrl;
      payload.type = 'video';
    } else if (content.link) {
      payload.link = content.link;
      if (content.linkCaption) payload.caption = content.linkCaption;
      if (content.linkDescription) payload.description = content.linkDescription;
    }

    // Handle scheduling
    if (content.isScheduled && content.publishedAt) {
      // Facebook requires Unix timestamp in seconds
      const unixTimestamp = Math.floor(content.publishedAt.getTime() / 1000);
      payload.scheduled_publish_time = unixTimestamp;
      payload.status = 'SCHEDULED';

      // Timeline must be at least 10 minutes in future and within 6 months
      const now = Math.floor(Date.now() / 1000);
      const minTime = now + 600; // 10 minutes from now
      const maxTime = now + 15778800; // 6 months from now

      if (unixTimestamp < minTime) {
        throw new Error('Scheduled post must be at least 10 minutes in the future');
      }

      if (unixTimestamp > maxTime) {
        throw new Error('Scheduled post must be within 6 months');
      }
    }

    // Make the API call
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${credentials.pageId}/feed?access_token=${token}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorData = (await response.json()) as any;
      const errorMessage =
        errorData.error?.message ||
        errorData.message ||
        `HTTP ${response.status}`;
      throw new Error(`Facebook API error: ${errorMessage}`);
    }

    const data = (await response.json()) as any;
    const postId = data.id;

    if (!postId) {
      throw new Error('Failed to create post - no ID returned');
    }

    if (content.isScheduled && content.publishedAt) {
      return {
        platform: 'facebook',
        postId: postId,
        status: 'scheduled',
        externalUrl: `https://www.facebook.com/${credentials.pageId}/posts/${postId}`,
        scheduledFor: content.publishedAt,
        timestamp,
      };
    }

    return {
      platform: 'facebook',
      postId: postId,
      status: 'success',
      externalUrl: `https://www.facebook.com/${credentials.pageId}/posts/${postId}`,
      timestamp,
    };
  } catch (error) {
    console.error('Facebook publish error:', error);
    return {
      platform: 'facebook',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp,
    };
  }
}

/**
 * Upload image to Facebook
 * Returns image hash for use in photo posts
 */
export async function uploadFacebookPhoto(
  credentials: FacebookCredentials,
  imageUrl: string
): Promise<{ photoId: string; imageHash: string } | null> {
  try {
    const payload = {
      url: imageUrl,
      published: false,
    };

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${credentials.pageId}/photos?access_token=${credentials.accessToken}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      console.error('Facebook photo upload failed', { status: response.status });
      return null;
    }

    const data = (await response.json()) as any;
    return {
      photoId: data.id,
      imageHash: data.image,
    };
  } catch (error) {
    console.error('Facebook photo upload error:', error);
    return null;
  }
}

/**
 * Upload video to Facebook
 * Returns video ID for use in video posts
 */
export async function uploadFacebookVideo(
  credentials: FacebookCredentials,
  videoUrl: string,
  title?: string,
  description?: string
): Promise<{ videoId: string } | null> {
  try {
    const payload: any = {
      video_url: videoUrl,
      published: false,
    };

    if (title) payload.title = title;
    if (description) payload.description = description;

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${credentials.pageId}/videos?access_token=${credentials.accessToken}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      console.error('Facebook video upload failed', { status: response.status });
      return null;
    }

    const data = (await response.json()) as any;
    return {
      videoId: data.id,
    };
  } catch (error) {
    console.error('Facebook video upload error:', error);
    return null;
  }
}

/**
 * Get Facebook page metrics/insights
 */
export async function getFacebookPageInsights(
  credentials: FacebookCredentials,
  metrics: string[] = ['page_fan_adds', 'page_engaged_users', 'page_views_total']
): Promise<{ [key: string]: number }> {
  try {
    const metricsList = metrics.join(',');
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${credentials.pageId}/insights?metric=${metricsList}&access_token=${credentials.accessToken}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Facebook insights');
    }

    const data = (await response.json()) as any;
    const insights: { [key: string]: number } = {};

    if (data.data && Array.isArray(data.data)) {
      for (const metric of data.data) {
        insights[metric.name] = metric.values?.[0]?.value || 0;
      }
    }

    return insights;
  } catch (error) {
    console.error('Facebook insights error:', error);
    return {};
  }
}

/**
 * Get Facebook post performance metrics
 */
export async function getFacebookPostMetrics(
  credentials: FacebookCredentials,
  postId: string
): Promise<{ [key: string]: number }> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${postId}/insights?metric=post_impressions,post_engaged_users,post_clicks&access_token=${credentials.accessToken}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Facebook post metrics');
    }

    const data = (await response.json()) as any;
    const metrics: { [key: string]: number } = {};

    if (data.data && Array.isArray(data.data)) {
      for (const metric of data.data) {
        metrics[metric.name] = metric.values?.[0]?.value || 0;
      }
    }

    return metrics;
  } catch (error) {
    console.error('Facebook post metrics error:', error);
    return {};
  }
}

/**
 * Validate Facebook credentials
 */
export async function validateFacebookCredentials(credentials: FacebookCredentials): Promise<boolean> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${credentials.pageId}?access_token=${credentials.accessToken}`
    );
    return response.ok;
  } catch (error) {
    console.error('Facebook credential validation error:', error);
    return false;
  }
}

/**
 * Get list of user's Facebook pages for which they have admin/editor access
 */
export async function getUserFacebookPages(
  accessToken: string
): Promise<Array<{ id: string; name: string; accessLevel: string }>> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?fields=id,name,access_level&access_token=${accessToken}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Facebook pages');
    }

    const data = (await response.json()) as any;
    return data.data || [];
  } catch (error) {
    console.error('Facebook pages error:', error);
    return [];
  }
}
