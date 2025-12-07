import { zodResponseFormat } from 'openai/helpers/zod';
import { openai, DEFAULT_CONFIG, isOpenAIConfigured } from '../openai';
import { IMAGE_ANALYSIS_SYSTEM_PROMPT } from '../prompts';
import { imageAnalysisOutputSchema, type ImageAnalysisOutput } from '../schemas';

export interface AnalyzeImageParams {
  imageUrls: string[];
  itemName?: string;
  expectedCondition?: 'new' | 'like_new' | 'used' | 'unknown';
}

export interface AnalyzeImageResult {
  success: boolean;
  data?: ImageAnalysisOutput;
  error?: string;
}

/**
 * K-pop 굿즈 이미지를 분석하여 진위 여부를 평가합니다.
 *
 * @param params - 분석할 이미지 정보
 * @returns 이미지 분석 결과
 */
export async function analyzeImage(
  params: AnalyzeImageParams
): Promise<AnalyzeImageResult> {
  if (!isOpenAIConfigured()) {
    return {
      success: false,
      error: 'OpenAI API key is not configured',
    };
  }

  if (!params.imageUrls || params.imageUrls.length === 0) {
    return {
      success: false,
      error: 'At least one image URL is required',
    };
  }

  try {
    const userMessage = buildImageAnalysisMessage(params);

    const completion = await openai.beta.chat.completions.parse({
      model: DEFAULT_CONFIG.model,
      messages: [
        {
          role: 'system',
          content: IMAGE_ANALYSIS_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
      response_format: zodResponseFormat(imageAnalysisOutputSchema, 'image_analysis'),
      temperature: DEFAULT_CONFIG.temperature,
      max_tokens: DEFAULT_CONFIG.max_tokens,
    });

    const analysis = completion.choices[0].message.parsed;

    if (!analysis) {
      return {
        success: false,
        error: 'Failed to parse image analysis result',
      };
    }

    return {
      success: true,
      data: analysis,
    };
  } catch (error) {
    console.error('Error analyzing images:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

function buildImageAnalysisMessage(params: AnalyzeImageParams): string {
  const parts: string[] = [];

  parts.push('Please analyze these K-pop merchandise images for authenticity:\n');

  parts.push(`## Number of Images\n${params.imageUrls.length}\n`);

  if (params.itemName) {
    parts.push(`## Item\n${params.itemName}\n`);
  }

  if (params.expectedCondition) {
    parts.push(`## Expected Condition\n${params.expectedCondition}\n`);
  }

  parts.push(
    '## Analysis Request\nEvaluate image quality, authenticity indicators, and any red flags. Provide specific observations.'
  );

  return parts.join('\n');
}
