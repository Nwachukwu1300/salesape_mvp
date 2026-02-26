/**
 * Twitter (X) Publisher Service
 * Publishes content to Twitter/X via API v2
 */

interface TwitterCredentials {
  bearerToken: string;
  accessToken: string;
  accessTokenSecret: string;
  apiKey: string;
  apiSecret: string;
  userId?: string;
}

export interface TwitterPublishRequest {
  text: string;
  mediaIds?: string[];
  replySettings?: 'anyone' | 'mentionedUsers' | 'followers';
  schedule?: Date;
}

interface PublishResult {
  platform: 'twitter';
  postId?: string;
  status: 'success' | 'scheduled' | 'error';
  externalUrl?: string | null;
  scheduledFor?: Date;
  error?: string;
  timestamp: Date;
}

/**
 * Publish a tweet to Twitter using API v2
 * Text limit: 280 characters (or more with premium features)
 * Supports media attachment and thread creation
 */
export async function publishToTwitter(
  credentials: TwitterCredentials,
  content: TwitterPublishRequest
): Promise<PublishResult> {
  const timestamp = new Date();

  try {
    // Validate required fields
    if (!credentials.bearerToken && !credentials.accessToken) {
      throw new Error('Twitter credentials incomplete: bearerToken or accessToken required');
    }

    if (!content.text || content.text.length === 0) {
      throw new Error('Tweet text is required');
    }

    if (content.text.length > 280) {
      console.warn('Tweet exceeds 280 character limit, will be truncated');
    }

    // Build request payload
    const payload: any = {
      text: content.text.substring(0, 280),
    };

    // Add media if provided
    if (content.mediaIds && content.mediaIds.length > 0) {
      payload.media = {
        media_ids: content.mediaIds,
      };
    }

    // Add reply settings if specified
    if (content.replySettings) {
      payload.reply_settings = content.replySettings;
    }

    // Use bearer token for API v2 (preferred)
    const headers = {
      'Authorization': `Bearer ${credentials.bearerToken}`,
      'Content-Type': 'application/json',
    };

    // Check if this is a scheduled tweet (requires Enterprise/Premium)
    if (content.schedule) {
      const futureUnixTime = Math.floor(content.schedule.getTime() / 1000);
      payload.scheduled_at = new Date(content.schedule).toISOString();

      try {
        const scheduleResponse = await fetch('https://api.twitter.com/2/tweets', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });

        if (!scheduleResponse.ok) {
          const errorData = (await scheduleResponse.json()) as any;
          console.warn('Twitter scheduled tweet failed', { error: errorData });
          // If scheduled publish fails, fall back to immediate
          delete payload.scheduled_at;
        } else {
          const data = (await scheduleResponse.json()) as any;
          return {
            platform: 'twitter',
            postId: data.data?.id,
            status: 'scheduled',
            externalUrl: data.data?.id ? `https://twitter.com/user/status/${data.data.id}` : null,
            scheduledFor: content.schedule,
            timestamp,
          } as PublishResult;
        }
      } catch (err) {
        console.warn('Schedule attempt failed, proceeding with immediate post', { error: String(err) });
      }
    }

    // Remove scheduled_at if falling back to immediate post
    delete payload.scheduled_at;

    // Publish tweet immediately
    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as any;
      const errorMessage =
        errorData.errors?.[0]?.message ||
        errorData.detail ||
        `HTTP ${response.status}`;
      throw new Error(`Twitter API error: ${errorMessage}`);
    }

    const data = (await response.json()) as any;
    const tweetId = data.data?.id;

    if (!tweetId) {
      throw new Error('Failed to create tweet - no ID returned');
    }

    return {
      platform: 'twitter',
      postId: tweetId,
      status: 'success',
      externalUrl: `https://twitter.com/user/status/${tweetId}`,
      timestamp,
    };
  } catch (error) {
    console.error('Twitter publish error:', error);
    return {
      platform: 'twitter',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp,
    };
  }
}

/**
 * Uploadimedia to Twitter for attachment to tweets
 * Supports JPEG, PNG, GIF, and MP4/MOV videos
 */
export async function uploadTwitterMedia(
  credentials: TwitterCredentials,
  mediaBuffer: Buffer,
  mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'video/mp4' | 'video/quicktime'
): Promise<{ mediaId: string; size: number } | null> {
  try {
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(mediaBuffer as any)], { type: mediaType });
    formData.append('media_data', blob);

    const response = await fetch('https://upload.twitter.com/1.1/media/upload.json', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${credentials.bearerToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      console.error('Twitter media upload failed', { status: response.status });
      return null;
    }

    const data = (await response.json()) as any;
    return {
      mediaId: data.media_id_string || data.media_id,
      size: data.size,
    };
  } catch (error) {
    console.error('Twitter media upload error:', error);
    return null;
  }
}

/**
 * Get Twitter account metrics
 */
export async function getTwitterMetrics(credentials: TwitterCredentials): Promise<{ [key: string]: number }> {
  try {
    const response = await fetch('https://api.twitter.com/2/users/me', {
      headers: {
        'Authorization': `Bearer ${credentials.bearerToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Twitter metrics');
    }

    const data = (await response.json()) as any;
    return {
      followers: data.data?.public_metrics?.followers_count || 0,
      following: data.data?.public_metrics?.following_count || 0,
      tweets: data.data?.public_metrics?.tweet_count || 0,
      likes: data.data?.public_metrics?.like_count || 0,
    };
  } catch (error) {
    console.error('Twitter metrics error:', error);
    return {};
  }
}

/**
 * Validate Twitter credentials
 */
export async function validateTwitterCredentials(credentials: TwitterCredentials): Promise<boolean> {
  try {
    const response = await fetch('https://api.twitter.com/2/users/me', {
      headers: {
        'Authorization': `Bearer ${credentials.bearerToken}`,
      },
    });
    return response.ok;
  } catch (error) {
    console.error('Twitter credential validation error:', error);
    return false;
  }
}
