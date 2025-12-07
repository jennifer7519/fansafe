import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeListing, getRiskLevelFromScore } from '../analyzeListing';
import type { ListingAnalysisOutput } from '../../schemas';

// Mock OpenAI
vi.mock('../../openai', () => ({
  openai: {
    beta: {
      chat: {
        completions: {
          parse: vi.fn(),
        },
      },
    },
  },
  DEFAULT_CONFIG: {
    model: 'gpt-4o',
    temperature: 0.3,
    max_tokens: 2000,
  },
  isOpenAIConfigured: vi.fn(() => true),
}));

describe('analyzeListing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should analyze a suspicious listing and return high risk score', async () => {
    const mockAnalysis: ListingAnalysisOutput = {
      riskScore: 85,
      detectedPatterns: ['urgent_language', 'prepayment_demand'],
      warnings: [
        'Seller is using urgent language to pressure buyers',
        'Requesting prepayment without buyer protection',
      ],
      recommendations: [
        'Do not send payment before receiving the item',
        'Use a platform with buyer protection',
        'Ask for additional verification photos',
      ],
      reasoning:
        'This listing shows multiple red flags typical of K-pop trading scams. The seller uses urgent language (급해요) and demands prepayment (선입금만), which are common scam tactics.',
      priceAnalysis: {
        isPriceNormal: false,
        priceComment: 'Price is suspiciously low, 40% below market average',
      },
    };

    const { openai } = await import('../../openai');
    vi.mocked(openai.beta.chat.completions.parse).mockResolvedValue({
      choices: [
        {
          message: {
            parsed: mockAnalysis,
            role: 'assistant',
            content: JSON.stringify(mockAnalysis),
          },
          finish_reason: 'stop',
          index: 0,
        },
      ],
    } as any);

    const result = await analyzeListing({
      text: '포토카드 양도합니다! 급해요! 선입금만 받아요',
      price: 3000,
      itemName: 'BTS 포토카드',
    });

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.riskScore).toBe(85);
    expect(result.data?.detectedPatterns).toContain('urgent_language');
    expect(result.data?.detectedPatterns).toContain('prepayment_demand');
    expect(result.data?.warnings).toHaveLength(2);
    expect(result.data?.recommendations).toHaveLength(3);
    expect(result.data?.priceAnalysis?.isPriceNormal).toBe(false);
  });

  it('should analyze a safe listing and return low risk score', async () => {
    const mockAnalysis: ListingAnalysisOutput = {
      riskScore: 15,
      detectedPatterns: [],
      warnings: ['Always verify seller reputation before purchasing'],
      recommendations: [
        'Request additional photos with timestamp',
        'Use secure payment methods',
      ],
      reasoning:
        'This listing appears legitimate with clear description, reasonable price, and proper payment methods mentioned.',
      priceAnalysis: {
        isPriceNormal: true,
        priceComment: 'Price is within normal market range',
      },
    };

    const { openai } = await import('../../openai');
    vi.mocked(openai.beta.chat.completions.parse).mockResolvedValue({
      choices: [
        {
          message: {
            parsed: mockAnalysis,
            role: 'assistant',
            content: JSON.stringify(mockAnalysis),
          },
          finish_reason: 'stop',
          index: 0,
        },
      ],
    } as any);

    const result = await analyzeListing({
      text: 'BTS 포토카드 양도합니다. 택배 거래 가능하고 번개페이 사용 가능합니다.',
      price: 5000,
      itemName: 'BTS 포토카드',
    });

    expect(result.success).toBe(true);
    expect(result.data?.riskScore).toBe(15);
    expect(result.data?.detectedPatterns).toHaveLength(0);
    expect(result.data?.priceAnalysis?.isPriceNormal).toBe(true);
  });

  it('should return error when OpenAI API key is not configured', async () => {
    const { isOpenAIConfigured } = await import('../../openai');
    vi.mocked(isOpenAIConfigured).mockReturnValue(false);

    const result = await analyzeListing({
      text: '포토카드 양도',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('OpenAI API key is not configured');
  });

  it('should handle API errors gracefully', async () => {
    const { openai, isOpenAIConfigured } = await import('../../openai');
    vi.mocked(isOpenAIConfigured).mockReturnValue(true);
    vi.mocked(openai.beta.chat.completions.parse).mockRejectedValue(
      new Error('API rate limit exceeded')
    );

    const result = await analyzeListing({
      text: '포토카드 양도',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('API rate limit exceeded');
  });

  it('should handle null parsed response', async () => {
    const { openai, isOpenAIConfigured } = await import('../../openai');
    vi.mocked(isOpenAIConfigured).mockReturnValue(true);
    vi.mocked(openai.beta.chat.completions.parse).mockResolvedValue({
      choices: [
        {
          message: {
            parsed: null,
            role: 'assistant',
            content: 'error',
          },
          finish_reason: 'stop',
          index: 0,
        },
      ],
    } as any);

    const result = await analyzeListing({
      text: '포토카드 양도',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to parse analysis result');
  });

  it('should include all parameters in the API call', async () => {
    const mockAnalysis: ListingAnalysisOutput = {
      riskScore: 50,
      detectedPatterns: [],
      warnings: ['Standard warning'],
      recommendations: ['Standard recommendation'],
      reasoning: 'Analysis complete',
    };

    const { openai, isOpenAIConfigured } = await import('../../openai');
    vi.mocked(isOpenAIConfigured).mockReturnValue(true);
    vi.mocked(openai.beta.chat.completions.parse).mockResolvedValue({
      choices: [
        {
          message: {
            parsed: mockAnalysis,
            role: 'assistant',
            content: JSON.stringify(mockAnalysis),
          },
          finish_reason: 'stop',
          index: 0,
        },
      ],
    } as any);

    await analyzeListing({
      text: '포토카드 양도합니다',
      url: 'https://twitter.com/user/status/123',
      price: 5000,
      itemName: 'BTS 포토카드',
      images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    });

    expect(openai.beta.chat.completions.parse).toHaveBeenCalledTimes(1);
    const callArgs = vi.mocked(openai.beta.chat.completions.parse).mock.calls[0][0];

    expect(callArgs.model).toBe('gpt-4o');
    expect(callArgs.temperature).toBe(0.3);
    expect(callArgs.messages).toHaveLength(2);
    expect(callArgs.messages[0].role).toBe('system');
    expect(callArgs.messages[1].role).toBe('user');
  });
});

describe('getRiskLevelFromScore', () => {
  it('should return "low" for scores below 30', () => {
    expect(getRiskLevelFromScore(0)).toBe('low');
    expect(getRiskLevelFromScore(15)).toBe('low');
    expect(getRiskLevelFromScore(29)).toBe('low');
  });

  it('should return "medium" for scores 30-69', () => {
    expect(getRiskLevelFromScore(30)).toBe('medium');
    expect(getRiskLevelFromScore(50)).toBe('medium');
    expect(getRiskLevelFromScore(69)).toBe('medium');
  });

  it('should return "high" for scores 70 and above', () => {
    expect(getRiskLevelFromScore(70)).toBe('high');
    expect(getRiskLevelFromScore(85)).toBe('high');
    expect(getRiskLevelFromScore(100)).toBe('high');
  });
});
