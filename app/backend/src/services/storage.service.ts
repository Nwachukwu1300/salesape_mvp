/**
 * Storage Service
 * 
 * Abstracts Supabase storage operations with type safety.
 * Provides unified interface for uploading, downloading, and managing files across buckets.
 * 
 * Supported Buckets:
 * - websites: HTML/CSS assets for generated websites
 * - videos: Raw video files for reel generation
 * - audio: Audio files, voice transcripts, background music
 * - generated-assets: AI-generated images, processed videos, reels
 */

import { supabaseServer, isSupabaseConfigured } from '../lib/supabase.server.js';
import type { SupabaseClient } from '@supabase/supabase-js';

// Bucket configuration from environment
const BUCKETS = {
  WEBSITES: process.env.SUPABASE_BUCKET_WEBSITES || 'websites',
  VIDEOS: process.env.SUPABASE_BUCKET_VIDEOS || 'videos',
  AUDIO: process.env.SUPABASE_BUCKET_AUDIO || 'audio',
  ASSETS: process.env.SUPABASE_BUCKET_ASSETS || 'generated-assets',
} as const;

export type BucketName = keyof typeof BUCKETS;

/**
 * Storage file metadata
 */
export interface StorageFile {
  name: string;
  size?: number;
  mimetype?: string;
  created?: Date;
  updated?: Date;
  publicUrl?: string;
}

/**
 * Upload options
 */
export interface UploadOptions {
  /** Override default MIME type detection */
  contentType?: string;
  /** Cache-Control header value */
  cacheControl?: string;
  /** Whether file should overwrite existing file with same name */
  upsert?: boolean;
  /** Custom metadata to store with file */
  metadata?: Record<string, any>;
}

/**
 * Storage service for file operations
 */
class StorageService {
  private client: SupabaseClient | null;
  private configured: boolean;

  constructor() {
    this.client = supabaseServer as SupabaseClient | null;
    this.configured = isSupabaseConfigured();

    if (!this.configured) {
      console.warn('[StorageService] Supabase not configured. File operations will fail.');
    }
  }

  /**
   * Upload file to specified bucket
   *
   * @param bucketKey - Bucket name (WEBSITES, VIDEOS, AUDIO, ASSETS)
   * @param filePath - Path within bucket (e.g., "business-123/website.html")
   * @param fileData - File content (Buffer or string)
   * @param options - Upload options
   * @returns File metadata and public URL if successful
   */
  async uploadFile(
    bucketKey: BucketName,
    filePath: string,
    fileData: Buffer | string | Uint8Array,
    options?: UploadOptions
  ): Promise<{ path: string; publicUrl: string | null }> {
    if (!this.configured || !this.client) {
      throw new Error('StorageService: Supabase not configured. Check SUPABASE_URL and SUPABASE_SERVICE_KEY.');
    }

    try {
      const bucketName = BUCKETS[bucketKey];

      const uploadOptions: any = {
        cacheControl: options?.cacheControl || '3600',
        upsert: options?.upsert || false,
      };

      if (options?.contentType) {
        uploadOptions.contentType = options.contentType;
      }

      if (options?.metadata) {
        uploadOptions.metadata = options.metadata;
      }

      console.log(`[StorageService] Uploading to ${bucketName}/${filePath}`);

      const { data, error } = await this.client.storage
        .from(bucketName)
        .upload(filePath, fileData, uploadOptions);

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      if (!data) {
        throw new Error('Upload returned no data');
      }

      // Get public URL
      const { data: publicData } = this.client.storage.from(bucketName).getPublicUrl(data.path);

      console.log(`[StorageService] Uploaded successfully: ${bucketName}/${filePath}`);

      return {
        path: data.path,
        publicUrl: publicData?.publicUrl || null,
      };
    } catch (error: any) {
      console.error(`[StorageService] Upload error for ${filePath}:`, error.message);
      throw error;
    }
  }

  /**
   * Download file from specified bucket
   *
   * @param bucketKey - Bucket name
   * @param filePath - Path within bucket
   * @returns File data as Buffer
   */
  async downloadFile(bucketKey: BucketName, filePath: string): Promise<Buffer> {
    if (!this.configured) {
      throw new Error('StorageService: Supabase not configured.');
    }

    try {
      const bucketName = BUCKETS[bucketKey];

      console.log(`[StorageService] Downloading from ${bucketName}/${filePath}`);

      const { data, error } = await this.client.storage.from(bucketName).download(filePath);

      if (error) {
        throw new Error(`Download failed: ${error.message}`);
      }

      if (!data) {
        throw new Error('Download returned no data');
      }

      return Buffer.from(await data.arrayBuffer());
    } catch (error: any) {
      console.error(`[StorageService] Download error for ${filePath}:`, error.message);
      throw error;
    }
  }

  /**
   * Delete file from specified bucket
   *
   * @param bucketKey - Bucket name
   * @param filePath - Path within bucket
   */
  async deleteFile(bucketKey: BucketName, filePath: string): Promise<void> {
    if (!this.configured) {
      throw new Error('StorageService: Supabase not configured.');
    }

    try {
      const bucketName = BUCKETS[bucketKey];

      console.log(`[StorageService] Deleting from ${bucketName}/${filePath}`);

      const { error } = await this.client.storage.from(bucketName).remove([filePath]);

      if (error) {
        throw new Error(`Delete failed: ${error.message}`);
      }

      console.log(`[StorageService] Deleted successfully: ${bucketName}/${filePath}`);
    } catch (error: any) {
      console.error(`[StorageService] Delete error for ${filePath}:`, error.message);
      throw error;
    }
  }

  /**
   * Get public URL for file (does not verify file exists)
   *
   * @param bucketKey - Bucket name
   * @param filePath - Path within bucket
   * @returns Public URL for the file
   */
  getPublicUrl(bucketKey: BucketName, filePath: string): string | null {
    if (!this.configured) {
      return null;
    }

    try {
      const bucketName = BUCKETS[bucketKey];
      const { data } = this.client.storage.from(bucketName).getPublicUrl(filePath);
      return data?.publicUrl || null;
    } catch (error: any) {
      console.error(`[StorageService] Error getting public URL:`, error.message);
      return null;
    }
  }

  /**
   * List files in a bucket path
   *
   * @param bucketKey - Bucket name
   * @param folderPath - Optional folder path to list (e.g., "business-123/")
   * @returns Array of file metadata
   */
  async listFiles(bucketKey: BucketName, folderPath?: string): Promise<StorageFile[]> {
    if (!this.configured) {
      throw new Error('StorageService: Supabase not configured.');
    }

    try {
      const bucketName = BUCKETS[bucketKey];

      console.log(`[StorageService] Listing files in ${bucketName}/${folderPath || ''}`);

      const { data, error } = await this.client.storage
        .from(bucketName)
        .list(folderPath || '', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'updated_at', order: 'desc' },
        });

      if (error) {
        throw new Error(`List failed: ${error.message}`);
      }

      const results: StorageFile[] = [];
      for (const file of (data || [])) {
        const item: StorageFile = { name: file.name };
        if (file.metadata?.size !== undefined) item.size = file.metadata.size;
        if (file.metadata?.mimetype !== undefined) item.mimetype = file.metadata.mimetype;
        if (file.created_at) item.created = new Date(file.created_at);
        if (file.updated_at) item.updated = new Date(file.updated_at);
        results.push(item);
      }
      return results;
    } catch (error: any) {
      console.error(`[StorageService] List error:`, error.message);
      throw error;
    }
  }

  /**
   * Get bucket configuration
   */
  getBucketConfig() {
    return {
      websites: BUCKETS.WEBSITES,
      videos: BUCKETS.VIDEOS,
      audio: BUCKETS.AUDIO,
      assets: BUCKETS.ASSETS,
      configured: this.configured,
    };
  }
}

// Export singleton instance
export const storageService = new StorageService();

export default storageService;
