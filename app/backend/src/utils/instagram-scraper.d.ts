/**
 * Enhanced Instagram Scraper
 * Scrapes public Instagram profile data without API
 */
interface InstagramProfile {
    username?: string;
    displayName?: string;
    bio?: string;
    followers?: number;
    posts?: number;
    following?: number;
    profileImage?: string;
    posts_preview?: string[];
    isVerified?: boolean;
    externalUrl?: string;
    email?: string;
    phone?: string;
}
/**
 * Scrape Instagram profile using public data
 */
export declare function scrapeInstagramProfile(username: string): Promise<InstagramProfile>;
/**
 * Extract business contact info from Instagram bio
 */
export declare function extractContactFromBio(bio: string): {
    email?: string;
    phone?: string;
    website?: string;
};
/**
 * Convert Instagram profile to business data
 */
export declare function instagramProfileToBusinessData(profile: InstagramProfile): {
    businessName: string;
    description: string;
    logo: string | undefined;
    socialLinks: {
        instagram: string;
    };
    followers: number | undefined;
    email: string | undefined;
    phone: string | undefined;
};
/**
 * Generate mock Instagram hashtags for content
 */
export declare function generateInstagramHashtags(businessType: string): string[];
/**
 * Generate Instagram post caption template
 */
export declare function generateInstagramCaption(businessName: string, service?: string | undefined, cta?: string): string;
export {};
//# sourceMappingURL=instagram-scraper.d.ts.map