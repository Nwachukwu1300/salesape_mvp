/**
 * Content Input Service
 * Manages user-uploaded content (text, video, audio, blog URLs)
 */

import { prisma } from '../prisma.js';
import type { ContentInput, CreateContentInputInput, UpdateContentInputInput, ContentInputStatus } from '../types/workflow.types.js';

/**
 * Create a new content input
 */
export async function createContentInput(input: CreateContentInputInput): Promise<ContentInput> {
  try {
    const data: any = {
      businessId: input.businessId,
      type: input.type,
      status: 'processing',
    };
    
    // Only add optional fields if they're defined and not null
    if (input.title !== undefined && input.title !== null) data.title = input.title;
    if (input.content !== undefined && input.content !== null) data.content = input.content;
    if (input.url !== undefined && input.url !== null) data.url = input.url;
    if (input.storagePath !== undefined && input.storagePath !== null) data.storagePath = input.storagePath;
    if (input.metadata !== undefined && input.metadata !== null) data.metadata = input.metadata;

    const content = await prisma.contentInput.create({ data } as any);
    return content as ContentInput;
  } catch (error) {
    console.error('Failed to create content input:', error);
    throw error;
  }
}

/**
 * Get content input by ID
 */
export async function getContentInput(id: string): Promise<ContentInput | null> {
  try {
    const content = await prisma.contentInput.findUnique({
      where: { id },
    });
    return (content as ContentInput) || null;
  } catch (error) {
    console.error('Failed to get content input:', error);
    throw error;
  }
}

/**
 * Get all content inputs for a business
 */
export async function getBusinessContentInputs(businessId: string): Promise<ContentInput[]> {
  try {
    const contents = await prisma.contentInput.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
    });
    return contents as ContentInput[];
  } catch (error) {
    console.error('Failed to get business content inputs:', error);
    throw error;
  }
}

/**
 * Get content inputs by status
 */
export async function getContentInputsByStatus(
  businessId: string,
  status: ContentInputStatus
): Promise<ContentInput[]> {
  try {
    const contents = await prisma.contentInput.findMany({
      where: { businessId, status },
      orderBy: { createdAt: 'desc' },
    });
    return contents as ContentInput[];
  } catch (error) {
    console.error('Failed to get content inputs by status:', error);
    throw error;
  }
}

/**
 * Update content input status
 */
export async function updateContentInputStatus(id: string, status: ContentInputStatus): Promise<ContentInput> {
  try {
    const content = await prisma.contentInput.update({
      where: { id },
      data: { status },
    });
    return content as ContentInput;
  } catch (error) {
    console.error('Failed to update content input status:', error);
    throw error;
  }
}

/**
 * Update content input metadata
 */
export async function updateContentInputMetadata(id: string, metadata: Record<string, any>): Promise<ContentInput> {
  try {
    const content = await prisma.contentInput.update({
      where: { id },
      data: { metadata },
    });
    return content as ContentInput;
  } catch (error) {
    console.error('Failed to update content input metadata:', error);
    throw error;
  }
}

/**
 * Update content input fields
 */
export async function updateContentInput(
  id: string,
  input: UpdateContentInputInput
): Promise<ContentInput> {
  try {
    const content = await prisma.contentInput.update({
      where: { id },
      data: input as any,
    });
    return content as ContentInput;
  } catch (error) {
    console.error('Failed to update content input:', error);
    throw error;
  }
}

/**
 * Delete content input
 */
export async function deleteContentInput(id: string): Promise<void> {
  try {
    await prisma.contentInput.delete({
      where: { id },
    });
  } catch (error) {
    console.error('Failed to delete content input:', error);
    throw error;
  }
}

/**
 * Get processing content inputs (for worker jobs)
 */
export async function getProcessingContentInputs(): Promise<ContentInput[]> {
  try {
    const contents = await prisma.contentInput.findMany({
      where: { status: 'processing' },
      take: 10,
      orderBy: { createdAt: 'asc' },
    });
    return contents as ContentInput[];
  } catch (error) {
    console.error('Failed to get processing content inputs:', error);
    throw error;
  }
}
