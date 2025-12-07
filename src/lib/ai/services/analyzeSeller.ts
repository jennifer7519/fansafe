import { zodResponseFormat } from 'openai/helpers/zod';
import { openai, DEFAULT_CONFIG, isOpenAIConfigured } from '../openai';
import { SELLER_ANALYSIS_SYSTEM_PROMPT } from '../prompts';
import { sellerAnalysisOutputSchema, type SellerAnalysisOutput } from '../schemas';

export interface AnalyzeSellerParams {
  username: string;
  platform: 'twitter' | 'instagram' | 'unknown';
  accountAge?: number; // days
  followerCount?: number;
  followingCount?: number;
  postCount?: number;
  bio?: string;
  recentActivity?: string;
}

export interface AnalyzeSellerResult {
  success: boolean;
  data?: SellerAnalysisOutput;
  error?: string;
}

/**
 * K-pop 굿즈 판매자의 신뢰도를 평가합니다.
 *
 * @param params - 판매자 정보
 * @returns 판매자 신뢰도 분석 결과
 */
export async function analyzeSeller(
  params: AnalyzeSellerParams
): Promise<AnalyzeSellerResult> {
  if (!isOpenAIConfigured()) {
    return {
      success: false,
      error: 'OpenAI API key is not configured',
    };
  }

  try {
    const userMessage = buildSellerAnalysisMessage(params);

    const completion = await openai.beta.chat.completions.parse({
      model: DEFAULT_CONFIG.model,
      messages: [
        {
          role: 'system',
          content: SELLER_ANALYSIS_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
      response_format: zodResponseFormat(sellerAnalysisOutputSchema, 'seller_analysis'),
      temperature: DEFAULT_CONFIG.temperature,
      max_tokens: DEFAULT_CONFIG.max_tokens,
    });

    const analysis = completion.choices[0].message.parsed;

    if (!analysis) {
      return {
        success: false,
        error: 'Failed to parse seller analysis result',
      };
    }

    return {
      success: true,
      data: analysis,
    };
  } catch (error) {
    console.error('Error analyzing seller:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

function buildSellerAnalysisMessage(params: AnalyzeSellerParams): string {
  const parts: string[] = [];

  parts.push('Please analyze this K-pop merchandise seller for trustworthiness:\n');

  parts.push(`## Seller Information`);
  parts.push(`Username: ${params.username}`);
  parts.push(`Platform: ${params.platform}\n`);

  if (params.accountAge !== undefined) {
    parts.push(`## Account Metrics`);
    parts.push(`Account Age: ${params.accountAge} days`);

    if (params.followerCount !== undefined) {
      parts.push(`Followers: ${params.followerCount}`);
    }

    if (params.followingCount !== undefined) {
      parts.push(`Following: ${params.followingCount}`);
    }

    if (params.postCount !== undefined) {
      parts.push(`Posts: ${params.postCount}`);
    }

    parts.push('');
  }

  if (params.bio) {
    parts.push(`## Bio\n${params.bio}\n`);
  }

  if (params.recentActivity) {
    parts.push(`## Recent Activity\n${params.recentActivity}\n`);
  }

  parts.push(
    '## Analysis Request\nEvaluate the seller\'s trustworthiness and provide specific recommendations for safe trading.'
  );

  return parts.join('\n');
}
