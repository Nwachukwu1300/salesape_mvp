/**
 * Connected Account Service
 * Manages social media and platform account credentials
 */

import { prisma } from '../prisma.js';
import type { ConnectedAccount, CreateConnectedAccountInput, UpdateConnectedAccountInput, Platform } from '../types/workflow.types.js';

/**
 * Create a new connected account
 */
export async function createConnectedAccount(input: CreateConnectedAccountInput): Promise<ConnectedAccount> {
  try {
    // Disable other accounts for same platform
    await prisma.connectedAccount.updateMany({
      where: {
        businessId: input.businessId,
        platform: input.platform,
      },
      data: { isActive: false },
    });

    const data: any = {
      businessId: input.businessId,
      platform: input.platform,
      accountId: input.accountId,
      accessToken: input.accessToken,
      isActive: true,
    };
    if (input.accountName !== undefined) data.accountName = input.accountName;
    if (input.refreshToken !== undefined) data.refreshToken = input.refreshToken;
    if (input.expiresAt !== undefined) data.expiresAt = input.expiresAt;

    const account = await prisma.connectedAccount.create({ data } as any);
    return account as ConnectedAccount;
  } catch (error) {
    console.error('Failed to create connected account:', error);
    throw error;
  }
}

/**
 * Get connected account by ID
 */
export async function getConnectedAccount(id: string): Promise<ConnectedAccount | null> {
  try {
    const account = await prisma.connectedAccount.findUnique({
      where: { id },
    });
    return (account as ConnectedAccount) || null;
  } catch (error) {
    console.error('Failed to get connected account:', error);
    throw error;
  }
}

/**
 * Get active account for platform
 */
export async function getActiveAccountForPlatform(
  businessId: string,
  platform: Platform
): Promise<ConnectedAccount | null> {
  try {
    const account = await prisma.connectedAccount.findFirst({
      where: {
        businessId,
        platform,
        isActive: true,
      },
    });
    return (account as ConnectedAccount) || null;
  } catch (error) {
    console.error('Failed to get active account for platform:', error);
    throw error;
  }
}

/**
 * Get all connected accounts for a business
 */
export async function getBusinessConnectedAccounts(businessId: string): Promise<ConnectedAccount[]> {
  try {
    const accounts = await prisma.connectedAccount.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
    });
    return accounts as ConnectedAccount[];
  } catch (error) {
    console.error('Failed to get business connected accounts:', error);
    throw error;
  }
}

/**
 * Get all active accounts for a business
 */
export async function getActiveBusinessAccounts(businessId: string): Promise<ConnectedAccount[]> {
  try {
    const accounts = await prisma.connectedAccount.findMany({
      where: { businessId, isActive: true },
      orderBy: { platform: 'asc' },
    });
    return accounts as ConnectedAccount[];
  } catch (error) {
    console.error('Failed to get active business accounts:', error);
    throw error;
  }
}

/**
 * Update connected account
 */
export async function updateConnectedAccount(
  id: string,
  input: UpdateConnectedAccountInput
): Promise<ConnectedAccount> {
  try {
    const account = await prisma.connectedAccount.update({
      where: { id },
      data: input,
    });
    return account as ConnectedAccount;
  } catch (error) {
    console.error('Failed to update connected account:', error);
    throw error;
  }
}

/**
 * Disable connected account
 */
export async function disableConnectedAccount(id: string): Promise<ConnectedAccount> {
  try {
    const account = await prisma.connectedAccount.update({
      where: { id },
      data: { isActive: false },
    });
    return account as ConnectedAccount;
  } catch (error) {
    console.error('Failed to disable connected account:', error);
    throw error;
  }
}

/**
 * Delete connected account
 */
export async function deleteConnectedAccount(id: string): Promise<void> {
  try {
    await prisma.connectedAccount.delete({
      where: { id },
    });
  } catch (error) {
    console.error('Failed to delete connected account:', error);
    throw error;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(account: ConnectedAccount): boolean {
  if (!account.expiresAt) return false;
  return new Date() > account.expiresAt;
}

/**
 * Get accounts needing token refresh
 */
export async function getAccountsNeedingRefresh(): Promise<ConnectedAccount[]> {
  try {
    const accounts = await prisma.connectedAccount.findMany({
      where: {
        isActive: true,
        expiresAt: {
          lte: new Date(Date.now() + 24 * 60 * 60 * 1000), // Next 24 hours
        },
      },
    });
    return accounts as ConnectedAccount[];
  } catch (error) {
    console.error('Failed to get accounts needing refresh:', error);
    throw error;
  }
}
