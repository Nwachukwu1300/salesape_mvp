/**
 * TikTok Publisher Service
 * Publishes videos to TikTok via Business Account API
 */

interface TikTokCredentials {
  accessToken: string;
  refreshToken?: string;
  clientKey: string;
  clientSecret: string;
  businessAccountId: string;
}

export interface TikTokPublishRequest {
  videoUrl: string;
  caption?: string | null;
  hashtags?: string[] | null;
  coverUrl?: string | null;
  disableComment?: boolean;
  disableDuet?: boolean;
  disableStitch?: boolean;
}

interface PublishResult {
  platform: 'tiktok';
  postId?: string | null;
  status: 'success' | 'processing' | 'pending' | 'error';
  externalUrl?: string | null;
  error?: string | null;
  timestamp: Date;
}

/**
 * Publish video to TikTok using Business Account API v1
 * Video requirements:
 * - Format: MP4, MOV, WebM, AVI
 * - Duration: 3 seconds to 10 minutes
 * - File size: up to 287.6 MB
 * - Resolution: 540x960 (portrait) minimum
 */
export async function publishToTikTok(
  credentials: TikTokCredentials,
  content: TikTokPublishRequest
): Promise<PublishResult> {
  const timestamp = new Date();

  try {
    // Validate required fields
    if (!credentials.accessToken || !credentials.businessAccountId) {
      throw new Error('TikTok credentials incomplete: accessToken and businessAccountId required');
    }

    if (!content.videoUrl) {
      throw new Error('Video URL is required for TikTok posting');
    }

    // Build caption with hashtags
    let fullCaption = content.caption || '';
    if (content.hashtags && content.hashtags.length > 0) {
      // TikTok caption limit is 2200 characters
      const hashtags = content.hashtags.join(' ');
      if ((fullCaption + ' ' + hashtags).length <= 2200) {
        fullCaption += ` ${hashtags}`;
      } else {
        fullCaption = content.caption?.substring(0, 2100) || '';
        fullCaption += ` ${hashtags.substring(0, 100)}`;
      }
    }

    // Step 1: Initialize the upload
    const initPayload = {
      source_info: {
        source: 'FILE_UPLOAD',
        video_name: `video_${Date.now()}`,
      },
      post_info: {
        caption: fullCaption.substring(0, 2200),
        post_mode: 'DRAFT',
        disable_comment: content.disableComment || false,
        disable_duet: content.disableDuet || false,
        disable_stitch: content.disableStitch || false,
      },
    };

    const initResponse = await fetch(
      `https://open.tiktokapis.com/v1/post/publish/video/init/?access_token=${credentials.accessToken}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(initPayload),
      }
    );

    if (!initResponse.ok) {
      const errorData = (await initResponse.json()) as any;
      throw new Error(`TikTok init error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const initData = (await initResponse.json()) as any;
    const uploadUrl = initData.data?.upload_url;
    const uploadToken = initData.data?.publish_id;

    if (!uploadUrl || !uploadToken) {
      throw new Error('Failed to get upload URL from TikTok');
    }

    // Step 2: Upload the video
    let videoBuffer: Buffer;
    try {
      const response = await fetch(content.videoUrl);
      if (!response.ok) throw new Error('Failed to fetch video from URL');
      const arrayBuffer = await response.arrayBuffer();
      videoBuffer = Buffer.from(arrayBuffer);
    } catch (err) {
      throw new Error(`Failed to download video from URL: ${err}`);
    }

    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'video/mp4',
      },
      body: videoBuffer as any,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Video upload failed: HTTP ${uploadResponse.status}`);
    }

    // Step 3: Publish the video
    const publishPayload = {
      source_info: {
        source: 'FILE_UPLOAD',
        video_name: `video_${Date.now()}`,
      },
      post_info: {
        caption: fullCaption.substring(0, 2200),
        post_mode: 'PUBLISH',
        disable_comment: content.disableComment || false,
        disable_duet: content.disableDuet || false,
        disable_stitch: content.disableStitch || false,
      },
    };

    const publishResponse = await fetch(
      `https://open.tiktokapis.com/v1/post/publish/video/?access_token=${credentials.accessToken}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(publishPayload),
      }
    );

    if (!publishResponse.ok) {
      const errorData = (await publishResponse.json()) as any;
      throw new Error(`TikTok publish error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const publishData = (await publishResponse.json()) as any;
    const postId = publishData.data?.video_id || uploadToken;

    // TikTok videos are often processing, so initial status is 'processing'
    return {
      platform: 'tiktok',
      postId: postId,
      status: 'processing',
      externalUrl: `https://www.tiktok.com/@business/video/${postId}`,
      timestamp,
    };
  } catch (error) {
    console.error('TikTok publish error:', error);
    return {
      platform: 'tiktok',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp,
    };
  }
}

/**
 * Get TikTok video analytics
 * Requires business account with analytics permissions
 */
export async function getTikTokVideoStats(
  credentials: TikTokCredentials,
  videoId: string
): Promise<{ [key: string]: number }> {
  try {
    const response = await fetch(
      `https://open.tiktokapis.com/v1/video/query/?video_id=${videoId}&fields=like_count,comment_count,share_count,view_count&access_token=${credentials.accessToken}`,
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch TikTok video stats');
    }

    const data = (await response.json()) as any;
    const stats = data.data?.[0] || {};

    return {
      views: stats.view_count || 0,
      likes: stats.like_count || 0,
      comments: stats.comment_count || 0,
      shares: stats.share_count || 0,
    };
  } catch (error) {
    console.error('TikTok stats error:', error);
    return {};
  }
}

/**
 * Get TikTok account analytics
 */
export async function getTikTokAccountStats(
  credentials: TikTokCredentials
): Promise<{ [key: string]: number }> {
  try {
    const response = await fetch(
      `https://open.tiktokapis.com/v1/user/info/?fields=follower_count,video_count,like_count&access_token=${credentials.accessToken}`,
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch TikTok account stats');
    }

    const data = (await response.json()) as any;
    const stats = data.data?.user || {};

    return {
      followers: stats.follower_count || 0,
      videos: stats.video_count || 0,
      totalLikes: stats.like_count || 0,
    };
  } catch (error) {
    console.error('TikTok account stats error:', error);
    return {};
  }
}

/**
 * Validate TikTok credentials
 */
export async function validateTikTokCredentials(credentials: TikTokCredentials): Promise<boolean> {
  try {
    const response = await fetch(
      `https://open.tiktokapis.com/v1/user/info/?fields=id&access_token=${credentials.accessToken}`,
      {
        method: 'GET',
      }
    );
    return response.ok;
  } catch (error) {
    console.error('TikTok credential validation error:', error);
    return false;
  }
}

/**
 * Refresh TikTok access token when expired
 */
export async function refreshTikTokToken(
  credentials: TikTokCredentials
): Promise<{ accessToken: string; refreshToken?: string; expiresIn?: number } | null> {
  if (!credentials.refreshToken) {
    console.warn('No refresh token available for TikTok');
    return null;
  }

  try {
    const response = await fetch(
      `https://open.tiktokapis.com/v1/oauth/token/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_key: credentials.clientKey,
          client_secret: credentials.clientSecret,
          grant_type: 'refresh_token',
          refresh_token: credentials.refreshToken,
        }).toString(),
      }
    );

    if (!response.ok) {
      console.error('TikTok token refresh failed', { status: response.status });
      return null;
    }

    const data = (await response.json()) as any;
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || credentials.refreshToken,
      expiresIn: data.expires_in,
    };
  } catch (error) {
    console.error('TikTok token refresh error:', error);
    return null;
  }
}
