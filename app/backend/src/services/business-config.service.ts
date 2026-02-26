/**
 * Business Configuration Service
 * Manages GrowthModeSettings, PublishingControl, and BookingConfig
 */

import { prisma } from '../prisma.js';
import type {
  GrowthModeSettings,
  PublishingControl,
  BookingConfig,
  UpdateGrowthModeSettingsInput,
  UpdatePublishingControlInput,
  UpdateBookingConfigInput,
  GrowthMode,
  GROWTH_MODE_LIMITS,
} from '../types/workflow.types.js';

// ===== Growth Mode Settings =====

/**
 * Get or create growth mode settings
 */
export async function getOrCreateGrowthModeSettings(businessId: string): Promise<GrowthModeSettings> {
  try {
    let settings = await prisma.growthModeSettings.findUnique({
      where: { businessId },
    });

    if (!settings) {
      settings = await prisma.growthModeSettings.create({
        data: {
          businessId,
          mode: 'BALANCED',
          outputLimit: 5,
        },
      });
    }

    return settings as GrowthModeSettings;
  } catch (error) {
    console.error('Failed to get or create growth mode settings:', error);
    throw error;
  }
}

/**
 * Update growth mode settings
 */
export async function updateGrowthModeSettings(
  businessId: string,
  input: UpdateGrowthModeSettingsInput
): Promise<GrowthModeSettings> {
  try {
    const settings = await prisma.growthModeSettings.upsert({
      where: { businessId },
      update: input,
      create: {
        businessId,
        mode: input.mode || 'BALANCED',
        outputLimit: input.outputLimit || 5,
      },
    });

    return settings as GrowthModeSettings;
  } catch (error) {
    console.error('Failed to update growth mode settings:', error);
    throw error;
  }
}

/**
 * Get growth limits for mode
 */
export function getGrowthModeLimits(mode: GrowthMode) {
  const limits: Record<GrowthMode, { min: number; max: number; default: number }> = {
    CONSERVATIVE: { min: 1, max: 3, default: 2 },
    BALANCED: { min: 3, max: 5, default: 5 },
    AGGRESSIVE: { min: 5, max: 10, default: 8 },
  };
  return limits[mode];
}

/**
 * Validate output count against growth mode
 */
export function validateOutputLimit(mode: GrowthMode, desiredCount: number): number {
  const limits = getGrowthModeLimits(mode);
  if (desiredCount < limits.min) return limits.min;
  if (desiredCount > limits.max) return limits.max;
  return desiredCount;
}

// ===== Publishing Control =====

/**
 * Get or create publishing control
 */
export async function getOrCreatePublishingControl(businessId: string): Promise<PublishingControl> {
  try {
    let control = await prisma.publishingControl.findUnique({
      where: { businessId },
    });

    if (!control) {
      control = await prisma.publishingControl.create({
        data: {
          businessId,
          requiresApproval: false,
          autoPublish: false,
        },
      });
    }

    return control as PublishingControl;
  } catch (error) {
    console.error('Failed to get or create publishing control:', error);
    throw error;
  }
}

/**
 * Update publishing control
 */
export async function updatePublishingControl(
  businessId: string,
  input: UpdatePublishingControlInput
): Promise<PublishingControl> {
  try {
    const control = await prisma.publishingControl.upsert({
      where: { businessId },
      update: input,
      create: {
        businessId,
        requiresApproval: input.requiresApproval ?? false,
        autoPublish: input.autoPublish ?? false,
      },
    });

    return control as PublishingControl;
  } catch (error) {
    console.error('Failed to update publishing control:', error);
    throw error;
  }
}

/**
 * Check if content needs approval before publishing
 */
export async function needsApprovalBeforePublishing(businessId: string): Promise<boolean> {
  try {
    const control = await getOrCreatePublishingControl(businessId);
    return control.requiresApproval;
  } catch (error) {
    console.error('Failed to check approval requirement:', error);
    throw error;
  }
}

/**
 * Check if auto-publish is enabled
 */
export async function isAutoPublishEnabled(businessId: string): Promise<boolean> {
  try {
    const control = await getOrCreatePublishingControl(businessId);
    return control.autoPublish;
  } catch (error) {
    console.error('Failed to check auto-publish:', error);
    throw error;
  }
}

// ===== Booking Config =====

/**
 * Get or create booking config
 */
export async function getOrCreateBookingConfig(businessId: string): Promise<BookingConfig> {
  try {
    let config = await prisma.bookingConfig.findUnique({
      where: { businessId },
    });

    if (!config) {
      config = await prisma.bookingConfig.create({
        data: {
          businessId,
          isEnabled: true,
          timezone: 'UTC',
          requiresApproval: false,
        },
      });
    }

    return config as BookingConfig;
  } catch (error) {
    console.error('Failed to get or create booking config:', error);
    throw error;
  }
}

/**
 * Update booking config
 */
export async function updateBookingConfig(
  businessId: string,
  input: UpdateBookingConfigInput
): Promise<BookingConfig> {
  try {
    const createData: any = {
      businessId,
      isEnabled: input.isEnabled ?? true,
      timezone: input.timezone ?? 'UTC',
      requiresApproval: input.requiresApproval ?? false,
    };
    if (input.notificationEmail !== undefined) {
      createData.notificationEmail = input.notificationEmail;
    }

    const config = await prisma.bookingConfig.upsert({
      where: { businessId },
      update: input,
      create: createData as any,
    });

    return config as BookingConfig;
  } catch (error) {
    console.error('Failed to update booking config:', error);
    throw error;
  }
}

/**
 * Check if bookings are enabled
 */
export async function areBookingsEnabled(businessId: string): Promise<boolean> {
  try {
    const config = await getOrCreateBookingConfig(businessId);
    return config.isEnabled;
  } catch (error) {
    console.error('Failed to check bookings enabled:', error);
    throw error;
  }
}

/**
 * Get business timezone
 */
export async function getBusinessTimezone(businessId: string): Promise<string> {
  try {
    const config = await getOrCreateBookingConfig(businessId);
    return config.timezone;
  } catch (error) {
    console.error('Failed to get business timezone:', error);
    throw error;
  }
}
