/**
 * AI Business Intelligence Generator
 * Extracts business profile, generates marketing copy, lead questions, SEO keywords
 */
/**
 * Analyze scraped business data and generate AI intelligence
 */
export async function generateBusinessIntelligence(scraped, conversationalInput) {
    try {
        // Extract basic info from scraped data
        const businessName = scraped.title || 'Business';
        const description = scraped.description || conversationalInput || '';
        // Use simple text analysis + pattern matching (without OpenAI for now)
        // In production, this would call OpenAI GPT-4
        const intelligence = {
            businessName,
            services: extractServices(description, businessName),
            industryCategory: detectIndustry(description, businessName),
            targetAudience: generateTargetAudience(description),
            uniqueValue: extractUniqueValue(description),
            marketingCopy: generateMarketingCopy(businessName, description),
            heroHeadline: generateHeroHeadline(businessName, description),
            seoKeywords: generateSEOKeywords(businessName, description),
            leadQualificationQuestions: generateLeadQuestions(description),
            brandColors: extractBrandColors(),
            tone: detectTone(description),
        };
        return intelligence;
    }
    catch (err) {
        console.error('[AI Intelligence Error]', err);
        return { businessName: 'Business' };
    }
}
/**
 * Extract service offerings from description
 */
function extractServices(description, name) {
    const services = [];
    const keywords = {
        design: ['design', 'ui', 'ux', 'branding', 'logo', 'visual'],
        development: ['development', 'coding', 'programming', 'software', 'app', 'web'],
        marketing: ['marketing', 'seo', 'advertising', 'social', 'content'],
        consulting: ['consulting', 'advisory', 'strategy', 'business'],
        services: ['services', 'repair', 'maintenance', 'cleaning', 'installation'],
        landscaping: ['garden', 'landscaping', 'landscape', 'outdoor', 'plants'],
        photography: ['photography', 'photo', 'portrait', 'wedding', 'event'],
    };
    const lowerDesc = (description + ' ' + name).toLowerCase();
    Object.entries(keywords).forEach(([service, keywordList]) => {
        if (keywordList.some(kw => lowerDesc.includes(kw))) {
            services.push(service.charAt(0).toUpperCase() + service.slice(1));
        }
    });
    return services.length > 0 ? services : ['Services'];
}
/**
 * Detect industry category
 */
function detectIndustry(description, name) {
    const text = (description + ' ' + name).toLowerCase();
    if (text.match(/landscape|garden|plant|outdoor/))
        return 'Landscaping';
    if (text.match(/photo|event|wedding|portrait/))
        return 'Photography';
    if (text.match(/design|graphic|ui|ux|branding/))
        return 'Design';
    if (text.match(/develop|code|software|web/))
        return 'Software Development';
    if (text.match(/consult|advise|strategy/))
        return 'Consulting';
    if (text.match(/market|advertis|social|content/))
        return 'Marketing';
    if (text.match(/teach|train|course|education/))
        return 'Education';
    if (text.match(/retail|shop|store|ecommerce/))
        return 'Retail';
    return 'Services';
}
/**
 * Generate target audience description
 */
function generateTargetAudience(description) {
    const text = description.toLowerCase();
    if (text.includes('local'))
        return 'Local businesses and homeowners';
    if (text.includes('b2b'))
        return 'Other businesses';
    if (text.includes('b2c'))
        return 'Individual consumers';
    if (text.includes('startup'))
        return 'Startups and entrepreneurs';
    if (text.includes('enterprise'))
        return 'Large organizations';
    return 'Businesses and entrepreneurs';
}
/**
 * Extract unique value proposition
 */
function extractUniqueValue(description) {
    if (!description || description.length < 10) {
        return 'Professional services delivered with attention to detail';
    }
    // Take first meaningful sentence
    const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 20);
    return sentences[0]?.trim() || 'Quality service you can trust';
}
/**
 * Generate marketing copy
 */
function generateMarketingCopy(name, description) {
    const industry = detectIndustry(description, name);
    const services = extractServices(description, name);
    const copies = {
        Landscaping: `Transform your outdoor space with ${name}'s professional landscaping services. We design and maintain beautiful gardens that enhance your property.`,
        Photography: `Capture your most precious moments with ${name}. Professional photography for weddings, events, and portraits.`,
        Design: `Elevate your brand with ${name}'s creative design solutions. From logos to complete visual identities.`,
        'Software Development': `${name} builds custom software solutions for modern businesses. Fast, reliable, and scalable.`,
        Consulting: `Strategic guidance for your business growth. ${name} provides expert consulting tailored to your needs.`,
        Marketing: `Grow your business with ${name}'s proven marketing strategies. Increase leads, sales, and customer loyalty.`,
    };
    return (copies[industry] ||
        `Experience professional ${services.join(' and ')} from ${name}. Quality service, guaranteed results.`);
}
/**
 * Generate hero headline for website
 */
function generateHeroHeadline(name, description) {
    const industry = detectIndustry(description, name);
    const headlines = {
        Landscaping: 'Beautiful Gardens, Expertly Designed',
        Photography: 'Moments Captured, Memories Preserved',
        Design: 'Design That Tells Your Story',
        'Software Development': 'Technology Built for Your Success',
        Consulting: 'Strategic Growth, Proven Results',
        Marketing: 'Grow Your Business Online',
    };
    return (headlines[industry] ||
        `Professional ${industry} from ${name}`);
}
/**
 * Generate SEO keywords
 */
function generateSEOKeywords(name, description) {
    const industry = detectIndustry(description, name);
    const keywords = [name];
    const industryKeywords = {
        Landscaping: ['landscaping', 'garden design', 'lawn care', 'outdoor design'],
        Photography: ['photography', 'photographer', 'photo services', 'event photography'],
        Design: ['graphic design', 'web design', 'branding', 'ui design'],
        'Software Development': ['web development', 'software development', 'app development', 'coding'],
        Consulting: ['consulting', 'business consulting', 'strategy', 'advisory'],
        Marketing: ['digital marketing', 'social media marketing', 'seo services', 'marketing'],
    };
    const kw = industryKeywords[industry] || [];
    keywords.push(...kw);
    keywords.push('local services', 'professional services');
    return keywords;
}
/**
 * Generate lead qualification questions
 */
function generateLeadQuestions(description) {
    const industry = detectIndustry(description, description);
    const questions = {
        Landscaping: [
            'What is the size of your garden or outdoor space?',
            'What is your budget for this project?',
            'When would you like to start?',
        ],
        Photography: [
            'What type of event is this for?',
            'How many hours of coverage do you need?',
            'What is your preferred photography style?',
        ],
        Design: [
            'What is the scope of your design project?',
            'What is your brand vision?',
            'When do you need the designs completed?',
        ],
        'Software Development': [
            'What problem does your software need to solve?',
            'What is your timeline?',
            'What features are essential?',
        ],
        Consulting: [
            'What are your main business challenges?',
            'What is your growth target?',
            'What is your timeline?',
        ],
        Marketing: [
            'What are your marketing goals?',
            'What is your current budget?',
            'What platforms do you want to focus on?',
        ],
    };
    return (questions[industry] || [
        'What are your main needs?',
        'What is your budget?',
        'When do you need this completed?',
    ]);
}
/**
 * Extract brand colors from description or use defaults
 */
function extractBrandColors() {
    // In production, could analyze images or ask AI
    // For now, return professional color palette
    return ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
}
/**
 * Detect tone/style of business
 */
function detectTone(description) {
    const text = description.toLowerCase();
    if (text.includes('professional') || text.includes('corporate'))
        return 'Professional';
    if (text.includes('fun') || text.includes('creative'))
        return 'Creative';
    if (text.includes('casual') || text.includes('friendly'))
        return 'Friendly';
    if (text.includes('luxury') || text.includes('premium'))
        return 'Premium';
    return 'Professional';
}
/**
 * Generate lead score based on engagement and source
 */
export function calculateLeadScore(lead) {
    let score = 0;
    // Source scoring
    const sourceScores = {
        instagram: 70,
        web: 80,
        direct: 90,
        referral: 85,
        organic: 75,
    };
    score += sourceScores[lead.source] || 60;
    // Message length scoring (longer = more interested)
    if (lead.messageLength) {
        score += Math.min(20, Math.floor(lead.messageLength / 10));
    }
    // Response time scoring (faster = more interested)
    if (lead.responseTime) {
        if (lead.responseTime < 300)
            score += 20; // < 5 min
        else if (lead.responseTime < 3600)
            score += 15; // < 1 hour
        else if (lead.responseTime < 86400)
            score += 10; // < 1 day
    }
    // Engagement level
    if (lead.engagementLevel) {
        score += Math.min(20, lead.engagementLevel);
    }
    return Math.min(100, score);
}
//# sourceMappingURL=ai-intelligence.js.map