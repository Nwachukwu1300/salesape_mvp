/**
 * AI Content Repurposing Service
 * Uses Claude or OpenAI API to intelligently repurpose content for different platforms
 */

import Anthropic from '@anthropic-ai/sdk';
import type { Platform } from '../types/workflow.types.js';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const openaiApiKey = process.env.OPENAI_API_KEY || '';

interface RepurposedContentOutput {
  content: string;
  caption?: string;
  hashtags?: string[];
  callToAction?: string;
  bestTimeToPost?: string;
}

/**
 * Generate platform-specific content using Claude AI
 * Intelligently adapts content for each platform's best practices
 */
export async function repurposeContentWithClaude(
  sourceContent: string,
  platform: Platform,
  businessName: string,
  businessContext?: string
): Promise<RepurposedContentOutput> {
  try {
    if (!anthropic.apiKey) {
      return generateFallbackContent(sourceContent, platform, businessName);
    }

    const platformPrompts: { [key: string]: string } = {
      instagram: `Transform this content into an engaging Instagram post. Keep it visually-focused and use line breaks for readability. Include a compelling caption (max 2200 chars), relevant hashtags (5-10), and a call-to-action.`,
      twitter: `Create a thread-able Twitter post. Keep individual tweets to 280 characters. Make it punchy, witty, and shareable. Include 1-3 tweet versions.`,
      linkedin: `Repurpose this as a professional LinkedIn post. Make it thought-provoking and industry-relevant. Include hook, body, and call-to-action. Add relevant professional hashtags.`,
      tiktok: `Transform this into a TikTok script. Make it entertaining, trendy, and scroll-stopping. Include trending sounds/hashtags and a hook that grabs attention in first 3 seconds.`,
      facebook: `Adapt this for Facebook. Make it conversational and community-focused. Include engaging copy, question to spark comments, and relevant emojis. Aim for 500-2000 characters.`,
    };

    const prompt = platformPrompts[platform.toLowerCase()] || platformPrompts.instagram;

    const businessInfo = businessContext ? `\n\nBusiness Context: ${businessContext}` : '';

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are an expert social media content strategist. 
        
${prompt}

Original Content: "${sourceContent}"
Business Name: ${businessName}${businessInfo}

Respond with a JSON object containing: { "content": string, "caption": string, "hashtags": string[], "callToAction": string, "bestTimeToPost": string }`,
        },
      ],
    });

    // Extract text from response
    const content = message.content[0];
    const responseText = content && content.type === 'text' ? content.text : '';

    // Parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          content: parsed.content || sourceContent.substring(0, 2200),
          caption: parsed.caption || undefined,
          hashtags: parsed.hashtags || [],
          callToAction: parsed.callToAction || undefined,
          bestTimeToPost: parsed.bestTimeToPost || undefined,
        };
      } catch (parseErr) {
        console.warn('Failed to parse Claude response as JSON', parseErr);
        return generateFallbackContent(sourceContent, platform, businessName);
      }
    }

    return generateFallbackContent(sourceContent, platform, businessName);
  } catch (error) {
    console.warn('Claude repurposing error, falling back to template', { error: String(error) });
    return generateFallbackContent(sourceContent, platform, businessName);
  }
}

/**
 * Generate platform-specific content using OpenAI API
 * Alternative to Claude with similar intelligence
 */
export async function repurposeContentWithOpenAI(
  sourceContent: string,
  platform: Platform,
  businessName: string,
  businessContext?: string
): Promise<RepurposedContentOutput> {
  try {
    if (!openaiApiKey) {
      return generateFallbackContent(sourceContent, platform, businessName);
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an expert social media strategist specializing in content repurposing. 
Your job is to adapt content intelligently for different social media platforms while maintaining brand voice and maximizing engagement.`,
          },
          {
            role: 'user',
            content: `Please repurpose this content for ${platform}:
            
Original Content: "${sourceContent}"
Business: ${businessName}${businessContext ? `\nContext: ${businessContext}` : ''}

Respond with ONLY a valid JSON object (no markdown, no code blocks) with these fields:
{
  "content": "platform-specific content",
  "caption": "the main caption/post text",
  "hashtags": ["tag1", "tag2"],
  "callToAction": "what action should people take",
  "bestTimeToPost": "when to post on this platform"
}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data: any = await response.json();
    const responseText = data.choices?.[0]?.message?.content || '';

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          content: parsed.content || sourceContent.substring(0, 2200),
          caption: parsed.caption || undefined,
          hashtags: parsed.hashtags || [],
          callToAction: parsed.callToAction || undefined,
          bestTimeToPost: parsed.bestTimeToPost || undefined,
        };
      } catch (parseErr) {
        console.warn('Failed to parse OpenAI response', parseErr);
        return generateFallbackContent(sourceContent, platform, businessName);
      }
    }

    return generateFallbackContent(sourceContent, platform, businessName);
  } catch (error) {
    console.warn('OpenAI repurposing error, falling back to template', { error: String(error) });
    return generateFallbackContent(sourceContent, platform, businessName);
  }
}

/**
 * Intelligently choose between Claude and OpenAI based on availability
 */
export async function repurposeContentWithAI(
  sourceContent: string,
  platform: Platform,
  businessName: string,
  businessContext?: string,
  preferredProvider?: 'claude' | 'openai'
): Promise<RepurposedContentOutput> {
  if (preferredProvider === 'openai' && openaiApiKey) {
    return repurposeContentWithOpenAI(sourceContent, platform, businessName, businessContext);
  }

  if (preferredProvider === 'claude' && process.env.ANTHROPIC_API_KEY) {
    return repurposeContentWithClaude(sourceContent, platform, businessName, businessContext);
  }

  // Auto-select based on availability
  if (process.env.ANTHROPIC_API_KEY) {
    return repurposeContentWithClaude(sourceContent, platform, businessName, businessContext);
  }

  if (openaiApiKey) {
    return repurposeContentWithOpenAI(sourceContent, platform, businessName, businessContext);
  }

  // Fallback to template-based generation
  return generateFallbackContent(sourceContent, platform, businessName);
}

/**
 * Template-based fallback content generation
 * Used when AI services are unavailable
 */
function generateFallbackContent(
  sourceContent: string,
  platform: Platform,
  businessName: string
): RepurposedContentOutput {
  const templates: { [key: string]: (src: string, bn: string) => RepurposedContentOutput } = {
    instagram: (src, bn) => ({
      content: src.substring(0, 2200),
      caption: `✨ New from ${bn}\n\n${src.substring(0, 100)}...\n\nClick the link in bio to learn more!`,
      hashtags: ['#business', '#socialmedia', '#content', `#${bn.toLowerCase().replace(/\s+/g, '')}`],
      callToAction: 'Follow for more updates',
      bestTimeToPost: 'Tuesday-Thursday, 7-9 PM',
    }),
    twitter: (src, bn) => ({
      content: src.substring(0, 280),
      caption: `💡 From ${bn}: ${src.substring(0, 150)}...`,
      hashtags: ['#business', '#news'],
      callToAction: 'Retweet and share your thoughts',
      bestTimeToPost: 'Monday-Friday, 8-10 AM',
    }),
    linkedin: (src, bn) => ({
      content: src.substring(0, 3000),
      caption: `📊 Insights from ${bn}\n\n${src}\n\nWhat are your thoughts?`,
      hashtags: ['#business', '#insights', '#professional', '#industry'],
      callToAction: 'Comment with your perspective',
      bestTimeToPost: 'Tuesday-Wednesday, 10 AM-12 PM',
    }),
    tiktok: (src, bn) => ({
      content: src.substring(0, 1500),
      caption: `🎬 Check out ${bn}! ${src.substring(0, 80)}...`,
      hashtags: ['#trending', '#business', '#foryou', '#viral'],
      callToAction: 'Like and follow for more',
      bestTimeToPost: 'Wednesday-Friday, 6-9 PM',
    }),
    facebook: (src, bn) => ({
      content: src.substring(0, 5000),
      caption: `👋 Welcome to ${bn}!\n\n${src}\n\nWe'd love to hear from you! Comment below 👇`,
      hashtags: ['#business', '#community', '#updates'],
      callToAction: 'Join our community',
      bestTimeToPost: 'Thursday, 1-3 PM',
    }),
  };

  const generator = templates[platform.toLowerCase()] || templates.instagram;
  if (!generator) {
    throw new Error(`No template generator found for platform: ${platform}`);
  }
  return generator(sourceContent, businessName);
}

/**
 * Batch repurpose content for multiple platforms
 */
export async function batchRepurposeContent(
  sourceContent: string,
  platforms: Platform[],
  businessName: string,
  businessContext?: string
): Promise<{ [platform: string]: RepurposedContentOutput }> {
  const results: { [platform: string]: RepurposedContentOutput } = {};

  for (const platform of platforms) {
    try {
      results[platform] = await repurposeContentWithAI(
        sourceContent,
        platform,
        businessName,
        businessContext
      );
    } catch (err) {
      console.error(`Failed to repurpose for ${platform}:`, err);
      results[platform] = generateFallbackContent(sourceContent, platform, businessName);
    }
  }

  return results;
}
