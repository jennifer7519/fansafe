import { getOpenAIClient, DEFAULT_CONFIG, isOpenAIConfigured } from '../openai';
import { FRAUD_DETECTION_SYSTEM_PROMPT } from '../prompts';
import { listingAnalysisOutputSchema, type ListingAnalysisOutput } from '../schemas';

// Manual JSON Schema for OpenAI Structured Outputs (Zod v4 compatibility)
const listingAnalysisJsonSchema = {
  type: 'object' as const,
  properties: {
    riskScore: {
      type: 'integer',
      minimum: 0,
      maximum: 100,
      description: 'Risk score from 0 (safe) to 100 (very dangerous)',
    },
    detectedPatterns: {
      type: 'array',
      items: { type: 'string' },
      description: 'List of detected fraud patterns (e.g., "urgent_language", "prepayment_demand")',
    },
    warnings: {
      type: 'array',
      items: { type: 'string' },
      description: 'Specific warnings for the user in English, must have at least one warning',
    },
    recommendations: {
      type: 'array',
      items: { type: 'string' },
      description: 'Actionable safety recommendations, must have at least one recommendation',
    },
    reasoning: {
      type: 'string',
      description: 'Detailed explanation of the analysis in English (minimum 50 characters)',
    },
    priceAnalysis: {
      anyOf: [
        {
          type: 'object',
          properties: {
            isPriceNormal: {
              type: 'boolean',
              description: 'Whether the price seems normal for the item',
            },
            priceComment: {
              type: 'string',
              description: 'Brief comment about the price',
            },
          },
          required: ['isPriceNormal', 'priceComment'],
          additionalProperties: false,
        },
        { type: 'null' },
      ],
      description: 'Price analysis if price information was provided, or null if not applicable',
    },
    translatedText: {
      anyOf: [
        { type: 'string' },
        { type: 'null' },
      ],
      description: 'English translation of the original Korean text if it was in Korean, or null if not needed',
    },
  },
  required: ['riskScore', 'detectedPatterns', 'warnings', 'recommendations', 'reasoning', 'priceAnalysis', 'translatedText'],
  additionalProperties: false,
};

export interface AnalyzeListingParams {
  text: string;
  url?: string;
  price?: number;
  itemName?: string;
  images?: string[];
}

export interface AnalyzeListingResult {
  success: boolean;
  data?: ListingAnalysisOutput;
  error?: string;
}

/**
 * K-pop 거래 글을 분석하여 사기 위험도를 평가합니다.
 *
 * @param params - 분석할 거래 글 정보
 * @returns 분석 결과 (Structured Output)
 *
 * @example
 * ```ts
 * const result = await analyzeListing({
 *   text: "포토카드 양도합니다! 급해요! 선입금만 받아요",
 *   price: 3000,
 *   itemName: "BTS 포토카드"
 * });
 *
 * if (result.success) {
 *   console.log(`Risk Score: ${result.data.riskScore}`);
 *   console.log(`Warnings: ${result.data.warnings.join(', ')}`);
 * }
 * ```
 */
export async function analyzeListing(
  params: AnalyzeListingParams
): Promise<AnalyzeListingResult> {
  // API 키 확인
  if (!isOpenAIConfigured()) {
    return {
      success: false,
      error: 'OpenAI API key is not configured',
    };
  }

  try {
    // 사용자 메시지 구성
    const userMessage = buildUserMessage(params);

    // OpenAI API 호출 with Structured Outputs (manual JSON schema for Zod v4 compatibility)
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: DEFAULT_CONFIG.model,
      messages: [
        {
          role: 'system',
          content: FRAUD_DETECTION_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'listing_analysis',
          strict: true,
          schema: listingAnalysisJsonSchema,
        },
      },
      temperature: DEFAULT_CONFIG.temperature,
      max_tokens: DEFAULT_CONFIG.max_tokens,
    });

    // Parse JSON response
    const content = completion.choices[0].message.content;
    if (!content) {
      return {
        success: false,
        error: 'No response content from OpenAI',
      };
    }

    // Validate with Zod schema
    const parsed = JSON.parse(content);
    const validation = listingAnalysisOutputSchema.safeParse(parsed);

    if (!validation.success) {
      console.error('Validation error:', validation.error);
      // Return parsed data anyway since OpenAI enforces schema
      return {
        success: true,
        data: parsed as ListingAnalysisOutput,
      };
    }

    const analysis = validation.data;

    return {
      success: true,
      data: analysis,
    };
  } catch (error) {
    console.error('Error analyzing listing:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * 사용자 메시지를 구성합니다.
 */
function buildUserMessage(params: AnalyzeListingParams): string {
  const parts: string[] = [];

  parts.push('Please analyze this K-pop merchandise trading post for fraud risk:\n');

  // 거래 글 텍스트
  parts.push(`## Trading Post Content\n${params.text}\n`);

  // URL (선택)
  if (params.url) {
    parts.push(`## Source URL\n${params.url}\n`);
  }

  // 가격 정보 (선택)
  if (params.price !== undefined) {
    parts.push(`## Price Information\nAsked Price: ${params.price} KRW`);
    if (params.itemName) {
      parts.push(`Item: ${params.itemName}`);
    }
    parts.push('\n');
  }

  // 이미지 정보 (선택)
  if (params.images && params.images.length > 0) {
    parts.push(`## Images Provided\n${params.images.length} image(s) attached\n`);
  }

  parts.push(
    '## Analysis Request\nProvide a comprehensive fraud risk analysis with specific warnings and recommendations for international K-pop fans.'
  );

  return parts.join('\n');
}

/**
 * 분석 결과에서 위험도 레벨을 계산합니다.
 */
export function getRiskLevelFromScore(
  score: number
): 'low' | 'medium' | 'high' {
  if (score < 30) return 'low';
  if (score < 70) return 'medium';
  return 'high';
}
