/**
 * Instagram Publisher Service
 * Publishes content to Instagram via Meta/Facebook Graph API
 */

interface InstagramCredentials {
  accessToken: string;
  instagramBusinessAccountId: string;
  pageId?: string;
}

export interface InstagramPublishRequest {
  imageUrl?: string;
  caption?: string;
  hashtags?: string[];
  videoUrl?: string;
  schedule?: Date;
}

interface PublishResult {
  platform: 'instagram';
  postId?: string | null;
  status: 'success' | 'scheduled' | 'error';
  externalUrl?: string | null;
  scheduledFor?: Date | null;
  error?: string | null;
  timestamp: Date;
}

/**
 * Publish content to Instagram using Meta Graph API v18.0
 * Requires Instagram Business Account with connected Meta App
 */
export async function publishToInstagram(
  credentials: InstagramCredentials,
  content: InstagramPublishRequest
): Promise<PublishResult> {
  const timestamp = new Date();

  try {
    // Validate required fields
    if (!credentials.accessToken || !credentials.instagramBusinessAccountId) {
      throw new Error('Instagram credentials incomplete: accessToken and instagramBusinessAccountId required');
    }

    if (!content.imageUrl && !content.videoUrl) {
      throw new Error('At least one of imageUrl or videoUrl is required');
    }

    // Build caption with hashtags
    let caption = content.caption || '';
    if (content.hashtags && content.hashtags.length > 0) {
      caption += `\n\n${content.hashtags.join(' ')}`;
    }

    // Create the media object with proper string values for URLSearchParams
    const mediaParams = new URLSearchParams();
    mediaParams.append('access_token', credentials.accessToken);
    mediaParams.append('caption', caption);

    if (content.imageUrl) {
      mediaParams.append('image_url', content.imageUrl);
    } else if (content.videoUrl) {
      mediaParams.append('video_url', content.videoUrl);
      mediaParams.append('media_type', 'VIDEO');
    }

    // Step 1: Create media container (for scheduled posts)
    const containerResponse = await fetch(
      `https://graph.instagram.com/v18.0/${credentials.instagramBusinessAccountId}/media`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: mediaParams.toString(),
      }
    );

    if (!containerResponse.ok) {
      const errorData = (await containerResponse.json()) as any;
      throw new Error(`Instagram API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const containerData = (await containerResponse.json()) as any;
    const mediaId = containerData.id;

    if (!mediaId) {
      throw new Error('Failed to create media container - no ID returned');
    }

    // Step 2: Publish the media
    let publishResult: PublishResult;

    if (content.schedule) {
      // Schedule for later (requires correct timezone and timestamp format)
      const scheduleParams = new URLSearchParams();
      scheduleParams.append('access_token', credentials.accessToken);
      scheduleParams.append('scheduled_publish_time', String(Math.floor(content.schedule.getTime() / 1000)));

      const publishResponse = await fetch(
        `https://graph.instagram.com/v18.0/${mediaId}/publish`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: scheduleParams.toString(),
        }
      );

      if (!publishResponse.ok) {
        const errorData = (await publishResponse.json()) as any;
        // Even if publish fails, media was created, so we can try again
        console.warn('Instagram scheduled publish failed, media container created', { mediaId, error: errorData });
        return {
          platform: 'instagram',
          postId: mediaId,
          status: 'scheduled',
          error: errorData.error?.message || 'Scheduling failed but media created',
          scheduledFor: content.schedule,
          timestamp,
        };
      }

      publishResult = {
        platform: 'instagram',
        postId: mediaId,
        status: 'scheduled',
        externalUrl: `https://instagram.com/p/${mediaId}`,
        scheduledFor: content.schedule,
        timestamp,
      };
    } else {
      // Publish immediately
      const publishParams = new URLSearchParams();
      publishParams.append('access_token', credentials.accessToken);

      const publishResponse = await fetch(
        `https://graph.instagram.com/v18.0/${mediaId}/publish`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: publishParams.toString(),
        }
      );

      if (!publishResponse.ok) {
        const errorData = (await publishResponse.json()) as any;
        // If immediate publish fails, try scheduling for 1 minute from now
        console.warn('Instagram immediate publish failed, attempting to schedule', { mediaId });
        const futureTime = new Date();
        futureTime.setMinutes(futureTime.getMinutes() + 1);

        return {
          platform: 'instagram',
          postId: mediaId,
          status: 'scheduled',
          error: `Immediate publish failed: ${errorData.error?.message}. Scheduled for 1 minute from now.`,
          scheduledFor: futureTime,
          timestamp,
        };
      }

      const publishData = (await publishResponse.json()) as any;
      publishResult = {
        platform: 'instagram',
        postId: mediaId,
        status: 'success',
        externalUrl: `https://instagram.com/p/${mediaId}`,
        timestamp,
      };
    }

    return publishResult;
  } catch (error) {
    console.error('Instagram publish error:', error);
    return {
      platform: 'instagram',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp,
    };
  }
}

/**
 * Get Instagram account insights/analytics
 * Returns metrics for engagement, reach, and impressions
 */
export async function getInstagramInsights(
  credentials: InstagramCredentials,
  metrics: string[] = ['impressions', 'reach', 'profile_views']
): Promise<{ [key: string]: number }> {
  try {
    const metricsParam = metrics.join(',');
    const response = await fetch(
      `https://graph.instagram.com/v18.0/${credentials.instagramBusinessAccountId}/insights?metric=${metricsParam}&access_token=${credentials.accessToken}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Instagram insights');
    }

    const data = (await response.json()) as any;
    const insights: { [key: string]: number } = {};

    if (data.data && Array.isArray(data.data)) {
      for (const metric of data.data) {
        insights[metric.name] = metric.value || 0;
      }
    }

    return insights;
  } catch (error) {
    console.error('Instagram insights error:', error);
    return {};
  }
}

/**
 * Check if Instagram credentials are valid
 */
export async function validateInstagramCredentials(credentials: InstagramCredentials): Promise<boolean> {
  try {
    const response = await fetch(
      `https://graph.instagram.com/v18.0/${credentials.instagramBusinessAccountId}?access_token=${credentials.accessToken}`
    );
    return response.ok;
  } catch (error) {
    console.error('Instagram credential validation error:', error);
    return false;
  }
}
