/**
 * LinkedIn Publisher Service
 * Publishes content to LinkedIn via API v2
 */

interface LinkedInCredentials {
  accessToken: string;
  organizationId?: string;
  userId?: string;
}

export interface LinkedInPublishRequest {
  text: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'document';
  visibility?: 'PUBLIC' | 'CONNECTIONS' | 'LOGGED_IN' | 'PRIVATE';
  schedule?: Date;
}

interface PublishResult {
  platform: 'linkedin';
  postId?: string | null;
  status: 'success' | 'scheduled' | 'pending' | 'error';
  externalUrl?: string | null;
  scheduledFor?: Date | null;
  error?: string | null;
  timestamp: Date;
}

/**
 * Publish content to LinkedIn
 * Can post as personal or organization (requires organizationId)
 * Text limit: 3000 characters
 */
export async function publishToLinkedIn(
  credentials: LinkedInCredentials,
  content: LinkedInPublishRequest
): Promise<PublishResult> {
  const timestamp = new Date();

  try {
    // Validate required fields
    if (!credentials.accessToken) {
      throw new Error('LinkedIn accessToken is required');
    }

    if (!content.text || content.text.length === 0) {
      throw new Error('Post text is required');
    }

    if (content.text.length > 3000) {
      console.warn('LinkedIn post exceeds 3000 character limit, will be truncated');
    }

    // Determine the target (user or organization)
    const target = credentials.organizationId
      ? `urn:li:organization:${credentials.organizationId}`
      : `urn:li:person:${credentials.userId || 'unknown'}`;

    // Build the post object
    const postPayload: any = {
      author: target,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content.text.substring(0, 3000),
          },
          shareMediaCategory: 'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': content.visibility || 'PUBLIC',
      },
    };

    // Add media if provided
    if (content.mediaUrl && content.mediaType) {
      const mediaCategory =
        content.mediaType === 'image'
          ? 'IMAGE'
          : content.mediaType === 'video'
            ? 'VIDEO'
            : 'DOCUMENT';

      postPayload.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = mediaCategory;
      postPayload.specificContent['com.linkedin.ugc.ShareContent'].media = [
        {
          status: 'READY',
          description: {
            text: content.text.substring(0, 200),
          },
          media: content.mediaUrl,
          title: {
            text: content.text.substring(0, 100),
          },
        },
      ];
    }

    const headers = {
      'Authorization': `Bearer ${credentials.accessToken}`,
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    };

    // Check if post should be scheduled
    if (content.schedule) {
      // LinkedIn doesn't have native scheduling via API, so we store for later publishing
      console.warn('LinkedIn API does not support native scheduling. Post marked as scheduled but requires manual publish or third-party scheduler.');
      return {
        platform: 'linkedin',
        status: 'scheduled',
        error: 'LinkedIn API v2 does not support scheduled posting. Use LinkedIn Scheduler tool or third-party scheduler.',
        scheduledFor: content.schedule,
        timestamp,
      };
    }

    // Publish the post
    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers,
      body: JSON.stringify(postPayload),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as any;
      const errorMessage =
        errorData.message ||
        errorData.serviceErrorCode ||
        `HTTP ${response.status}`;
      throw new Error(`LinkedIn API error: ${errorMessage}`);
    }

    const data = (await response.json()) as any;
    const postId = data.id?.split('/')?.pop();

    if (!postId) {
      throw new Error('Failed to create post - no ID returned');
    }

    return {
      platform: 'linkedin',
      postId: postId,
      status: 'success',
      externalUrl: `https://www.linkedin.com/feed/update/${postId}`,
      timestamp,
    };
  } catch (error) {
    console.error('LinkedIn publish error:', error);
    return {
      platform: 'linkedin',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp,
    };
  }
}

/**
 * Upload image media to LinkedIn for attachment to posts
 */
export async function uploadLinkedInMedia(
  credentials: LinkedInCredentials,
  imageBuffer: Buffer,
  fileName: string
): Promise<{ mediaUrl: string; uploadToken: string } | null> {
  try {
    // Step 1: Register upload
    const registerResponse = await fetch('https://api.linkedin.com/v2/assets?action=registerUpload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${credentials.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        registerUploadRequest: {
          recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
          owner: `urn:li:person:${credentials.userId}`,
          serviceRelationships: [
            {
              relationshipType: 'OWNER',
              identifier: `urn:li:userGeneratedContent`,
            },
          ],
        },
      }),
    });

    if (!registerResponse.ok) {
      console.error('LinkedIn media registration failed', { status: registerResponse.status });
      return null;
    }

    const registerData = (await registerResponse.json()) as any;
    const uploadUrl = registerData.value?.uploadMechanism?.['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest']
      ?.uploadUrl;
    const uploadToken = registerData.value?.id;

    if (!uploadUrl) {
      console.error('No upload URL returned from LinkedIn');
      return null;
    }

    // Step 2: Upload the image
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      body: imageBuffer as any,
    });

    if (!uploadResponse.ok) {
      console.error('LinkedIn image upload failed', { status: uploadResponse.status });
      return null;
    }

    return {
      mediaUrl: uploadUrl,
      uploadToken: uploadToken,
    };
  } catch (error) {
    console.error('LinkedIn media upload error:', error);
    return null;
  }
}

/**
 * Get LinkedIn profile/organization metrics
 */
export async function getLinkedInMetrics(
  credentials: LinkedInCredentials,
  isOrganization: boolean = false
): Promise<{ [key: string]: number }> {
  try {
    const endpoint = isOrganization
      ? `https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee&roleAssignee=${credentials.organizationId}`
      : `https://api.linkedin.com/v2/me?projection=(id,localizedFirstName,localizedLastName)`;

    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${credentials.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch LinkedIn metrics');
    }

    const data = (await response.json()) as any;
    return {
      followers: data.followers || 0,
      connections: data.numConnections || 0,
      posts: data.numShares || 0,
    };
  } catch (error) {
    console.error('LinkedIn metrics error:', error);
    return {};
  }
}

/**
 * Validate LinkedIn credentials
 */
export async function validateLinkedInCredentials(credentials: LinkedInCredentials): Promise<boolean> {
  try {
    const response = await fetch('https://api.linkedin.com/v2/me', {
      headers: {
        'Authorization': `Bearer ${credentials.accessToken}`,
      },
    });
    return response.ok;
  } catch (error) {
    console.error('LinkedIn credential validation error:', error);
    return false;
  }
}
