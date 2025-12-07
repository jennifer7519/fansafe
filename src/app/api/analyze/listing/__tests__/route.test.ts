import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import type { ListingAnalysisOutput } from '@/lib/ai/schemas';

// Mock modules BEFORE imports
vi.mock('@/lib/ai/openai', () => ({
  openai: {},
  isOpenAIConfigured: vi.fn(() => true),
  MODELS: { GPT4O: 'gpt-4o', GPT4O_MINI: 'gpt-4o-mini' },
  DEFAULT_CONFIG: { model: 'gpt-4o', temperature: 0.3, max_tokens: 2000 },
}));

vi.mock('@/lib/ai/services/analyzeListing');
vi.mock('@/lib/db/client');

import { POST, GET } from '../route';

describe('POST /api/analyze/listing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Request Validation', () => {
    it('should accept valid request with all fields', async () => {
      const { analyzeListing } = await import('@/lib/ai/services/analyzeListing');
      const { db } = await import('@/lib/db/client');

      const mockAnalysis: ListingAnalysisOutput = {
        riskScore: 45,
        detectedPatterns: ['urgent_language'],
        warnings: ['Warning message'],
        recommendations: ['Recommendation message'],
        reasoning: 'This is a detailed reasoning that meets the minimum length requirement.',
      };

      vi.mocked(analyzeListing).mockResolvedValue({
        success: true,
        data: mockAnalysis,
      });

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      } as any);

      const request = createTestRequest({
        url: 'https://twitter.com/user/status/123',
        text: '포토카드 양도합니다',
        price: 5000,
        itemName: 'BTS 포토카드',
        images: ['https://example.com/image1.jpg'],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should accept valid request with minimal fields', async () => {
      const { analyzeListing } = await import('@/lib/ai/services/analyzeListing');
      const { db } = await import('@/lib/db/client');

      const mockAnalysis: ListingAnalysisOutput = {
        riskScore: 20,
        detectedPatterns: [],
        warnings: ['Standard warning'],
        recommendations: ['Standard recommendation'],
        reasoning: 'Minimal analysis reasoning with sufficient character length.',
      };

      vi.mocked(analyzeListing).mockResolvedValue({
        success: true,
        data: mockAnalysis,
      });

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      } as any);

      const request = createTestRequest({
        url: 'https://twitter.com/user/status/123',
        text: '포토카드 양도합니다',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should reject invalid URL format', async () => {
      const request = createTestRequest({
        url: 'not-a-valid-url',
        text: '포토카드 양도',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Validation failed');
    });

    it('should reject empty text', async () => {
      const request = createTestRequest({
        url: 'https://twitter.com/user/status/123',
        text: '',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should reject text exceeding 10000 characters', async () => {
      const request = createTestRequest({
        url: 'https://twitter.com/user/status/123',
        text: 'a'.repeat(10001),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should reject negative price', async () => {
      const request = createTestRequest({
        url: 'https://twitter.com/user/status/123',
        text: '포토카드 양도',
        price: -1000,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should reject zero price', async () => {
      const request = createTestRequest({
        url: 'https://twitter.com/user/status/123',
        text: '포토카드 양도',
        price: 0,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/analyze/listing', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: 'invalid json{',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  describe('Service Integration', () => {
    it('should successfully analyze low-risk listing', async () => {
      const { analyzeListing } = await import('@/lib/ai/services/analyzeListing');
      const { db } = await import('@/lib/db/client');

      const mockAnalysis: ListingAnalysisOutput = {
        riskScore: 15,
        detectedPatterns: [],
        warnings: ['Always verify seller reputation'],
        recommendations: ['Use secure payment methods'],
        reasoning: 'This listing appears legitimate with clear description.',
      };

      vi.mocked(analyzeListing).mockResolvedValue({
        success: true,
        data: mockAnalysis,
      });

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      } as any);

      const request = createTestRequest({
        url: 'https://twitter.com/user/status/123',
        text: 'BTS 포토카드 양도합니다. 택배 거래 가능하고 번개페이 사용 가능합니다.',
        price: 5000,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.riskScore).toBe(15);
      expect(data.data.riskLevel).toBe('low');
    });

    it('should successfully analyze high-risk listing', async () => {
      const { analyzeListing } = await import('@/lib/ai/services/analyzeListing');
      const { db } = await import('@/lib/db/client');

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
        ],
        reasoning: 'Multiple red flags detected including urgent language and prepayment demands.',
      };

      vi.mocked(analyzeListing).mockResolvedValue({
        success: true,
        data: mockAnalysis,
      });

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      } as any);

      const request = createTestRequest({
        url: 'https://twitter.com/user/status/123',
        text: '포토카드 양도합니다! 급해요! 선입금만 받아요',
        price: 3000,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.riskScore).toBe(85);
      expect(data.data.riskLevel).toBe('high');
      expect(data.data.detectedPatterns).toContain('urgent_language');
    });

    it('should handle OpenAI API failure', async () => {
      const { analyzeListing } = await import('@/lib/ai/services/analyzeListing');

      vi.mocked(analyzeListing).mockResolvedValue({
        success: false,
        error: 'API rate limit exceeded',
      });

      const request = createTestRequest({
        url: 'https://twitter.com/user/status/123',
        text: '포토카드 양도',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it('should handle missing OpenAI API key', async () => {
      const { analyzeListing } = await import('@/lib/ai/services/analyzeListing');

      vi.mocked(analyzeListing).mockResolvedValue({
        success: false,
        error: 'OpenAI API key is not configured',
      });

      const request = createTestRequest({
        url: 'https://twitter.com/user/status/123',
        text: '포토카드 양도',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('OpenAI API key');
    });
  });

  describe('Database Integration', () => {
    it('should save analysis to database on success', async () => {
      const { analyzeListing } = await import('@/lib/ai/services/analyzeListing');
      const { db } = await import('@/lib/db/client');

      const mockAnalysis: ListingAnalysisOutput = {
        riskScore: 50,
        detectedPatterns: [],
        warnings: ['Warning'],
        recommendations: ['Recommendation'],
        reasoning: 'Analysis reasoning with sufficient length for validation.',
      };

      vi.mocked(analyzeListing).mockResolvedValue({
        success: true,
        data: mockAnalysis,
      });

      const mockInsert = vi.fn().mockResolvedValue(undefined);
      vi.mocked(db.insert).mockReturnValue({
        values: mockInsert,
      } as any);

      const request = createTestRequest({
        url: 'https://twitter.com/user/status/123',
        text: '포토카드 양도',
      });

      await POST(request);

      expect(db.insert).toHaveBeenCalled();
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://twitter.com/user/status/123',
          platform: 'twitter',
          analysisType: 'listing',
          riskScore: 50,
          warnings: ['Warning'],
          recommendations: ['Recommendation'],
          reasoning: 'Analysis reasoning with sufficient length for validation.',
        })
      );
    });

    it('should save all optional fields to database', async () => {
      const { analyzeListing } = await import('@/lib/ai/services/analyzeListing');
      const { db } = await import('@/lib/db/client');

      const mockAnalysis: ListingAnalysisOutput = {
        riskScore: 30,
        detectedPatterns: ['pattern1'],
        warnings: ['Warning'],
        recommendations: ['Recommendation'],
        reasoning: 'Detailed reasoning with all fields present.',
        priceAnalysis: {
          isPriceNormal: false,
          priceComment: 'Too cheap',
        },
      };

      vi.mocked(analyzeListing).mockResolvedValue({
        success: true,
        data: mockAnalysis,
      });

      const mockInsert = vi.fn().mockResolvedValue(undefined);
      vi.mocked(db.insert).mockReturnValue({
        values: mockInsert,
      } as any);

      const request = createTestRequest({
        url: 'https://twitter.com/user/status/123',
        text: '포토카드 양도',
        price: 2000,
        itemName: 'BTS 포토카드',
      });

      await POST(request);

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          analysisData: expect.objectContaining({
            detectedPatterns: ['pattern1'],
            priceAnalysis: expect.objectContaining({
              isPriceNormal: false,
            }),
          }),
        })
      );
    });

    it('should handle database errors gracefully', async () => {
      const { analyzeListing } = await import('@/lib/ai/services/analyzeListing');
      const { db } = await import('@/lib/db/client');

      const mockAnalysis: ListingAnalysisOutput = {
        riskScore: 50,
        detectedPatterns: [],
        warnings: ['Warning'],
        recommendations: ['Recommendation'],
        reasoning: 'Analysis reasoning',
      };

      vi.mocked(analyzeListing).mockResolvedValue({
        success: true,
        data: mockAnalysis,
      });

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockRejectedValue(new Error('Database connection failed')),
      } as any);

      const request = createTestRequest({
        url: 'https://twitter.com/user/status/123',
        text: '포토카드 양도',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('save');
    });

    it('should extract IP address from x-forwarded-for header', async () => {
      const { analyzeListing } = await import('@/lib/ai/services/analyzeListing');
      const { db } = await import('@/lib/db/client');

      const mockAnalysis: ListingAnalysisOutput = {
        riskScore: 50,
        detectedPatterns: [],
        warnings: ['Warning'],
        recommendations: ['Recommendation'],
        reasoning: 'Analysis reasoning',
      };

      vi.mocked(analyzeListing).mockResolvedValue({
        success: true,
        data: mockAnalysis,
      });

      const mockInsert = vi.fn().mockResolvedValue(undefined);
      vi.mocked(db.insert).mockReturnValue({
        values: mockInsert,
      } as any);

      const request = createTestRequest(
        {
          url: 'https://twitter.com/user/status/123',
          text: '포토카드 양도',
        },
        {
          'x-forwarded-for': '192.168.1.100, 10.0.0.1',
        }
      );

      await POST(request);

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          ipAddress: '192.168.1.100',
        })
      );
    });
  });

  describe('Response Format', () => {
    it('should return correct success response structure', async () => {
      const { analyzeListing } = await import('@/lib/ai/services/analyzeListing');
      const { db } = await import('@/lib/db/client');

      const mockAnalysis: ListingAnalysisOutput = {
        riskScore: 45,
        detectedPatterns: ['pattern1'],
        warnings: ['Warning1', 'Warning2'],
        recommendations: ['Rec1', 'Rec2'],
        reasoning: 'Detailed reasoning text',
        priceAnalysis: {
          isPriceNormal: true,
          priceComment: 'Normal price',
        },
      };

      vi.mocked(analyzeListing).mockResolvedValue({
        success: true,
        data: mockAnalysis,
      });

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      } as any);

      const request = createTestRequest({
        url: 'https://twitter.com/user/status/123',
        text: '포토카드 양도',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data).toEqual({
        success: true,
        data: {
          riskScore: 45,
          riskLevel: 'medium',
          warnings: ['Warning1', 'Warning2'],
          recommendations: ['Rec1', 'Rec2'],
          reasoning: 'Detailed reasoning text',
          detectedPatterns: ['pattern1'],
          priceAnalysis: {
            isPriceNormal: true,
            priceComment: 'Normal price',
          },
        },
      });
    });

    it('should return correct error response structure', async () => {
      const request = createTestRequest({
        url: 'invalid-url',
        text: '포토카드',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data).toMatchObject({
        success: false,
        error: expect.any(String),
      });
    });

    it('should return 200 status on success', async () => {
      const { analyzeListing } = await import('@/lib/ai/services/analyzeListing');
      const { db } = await import('@/lib/db/client');

      vi.mocked(analyzeListing).mockResolvedValue({
        success: true,
        data: {
          riskScore: 50,
          detectedPatterns: [],
          warnings: ['W'],
          recommendations: ['R'],
          reasoning: 'Reasoning',
        },
      });

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      } as any);

      const request = createTestRequest({
        url: 'https://twitter.com/user/status/123',
        text: '포토카드',
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });

    it('should return 400 for validation errors', async () => {
      const request = createTestRequest({
        url: '',
        text: '',
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should return 500 for server errors', async () => {
      const { analyzeListing } = await import('@/lib/ai/services/analyzeListing');

      vi.mocked(analyzeListing).mockResolvedValue({
        success: false,
        error: 'Server error',
      });

      const request = createTestRequest({
        url: 'https://twitter.com/user/status/123',
        text: '포토카드',
      });

      const response = await POST(request);
      expect(response.status).toBe(500);
    });

    it('should include calculated risk level in response', async () => {
      const { analyzeListing } = await import('@/lib/ai/services/analyzeListing');
      const { db } = await import('@/lib/db/client');

      const testCases = [
        { score: 15, expectedLevel: 'low' },
        { score: 45, expectedLevel: 'medium' },
        { score: 85, expectedLevel: 'high' },
      ];

      for (const testCase of testCases) {
        vi.clearAllMocks();

        vi.mocked(analyzeListing).mockResolvedValue({
          success: true,
          data: {
            riskScore: testCase.score,
            detectedPatterns: [],
            warnings: ['W'],
            recommendations: ['R'],
            reasoning: 'Reasoning',
          },
        });

        vi.mocked(db.insert).mockReturnValue({
          values: vi.fn().mockResolvedValue(undefined),
        } as any);

        const request = createTestRequest({
          url: 'https://twitter.com/user/status/123',
          text: '포토카드',
        });

        const response = await POST(request);
        const data = await response.json();

        expect(data.data.riskLevel).toBe(testCase.expectedLevel);
      }
    });
  });

  describe('Platform Detection', () => {
    it('should detect twitter platform from twitter.com URL', async () => {
      const { analyzeListing } = await import('@/lib/ai/services/analyzeListing');
      const { db } = await import('@/lib/db/client');

      vi.mocked(analyzeListing).mockResolvedValue({
        success: true,
        data: {
          riskScore: 50,
          detectedPatterns: [],
          warnings: ['W'],
          recommendations: ['R'],
          reasoning: 'Reasoning',
        },
      });

      const mockInsert = vi.fn().mockResolvedValue(undefined);
      vi.mocked(db.insert).mockReturnValue({
        values: mockInsert,
      } as any);

      const request = createTestRequest({
        url: 'https://twitter.com/user/status/123',
        text: '포토카드',
      });

      await POST(request);

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          platform: 'twitter',
        })
      );
    });

    it('should detect twitter platform from x.com URL', async () => {
      const { analyzeListing } = await import('@/lib/ai/services/analyzeListing');
      const { db } = await import('@/lib/db/client');

      vi.mocked(analyzeListing).mockResolvedValue({
        success: true,
        data: {
          riskScore: 50,
          detectedPatterns: [],
          warnings: ['W'],
          recommendations: ['R'],
          reasoning: 'Reasoning',
        },
      });

      const mockInsert = vi.fn().mockResolvedValue(undefined);
      vi.mocked(db.insert).mockReturnValue({
        values: mockInsert,
      } as any);

      const request = createTestRequest({
        url: 'https://x.com/user/status/123',
        text: '포토카드',
      });

      await POST(request);

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          platform: 'twitter',
        })
      );
    });

    it('should detect instagram platform from instagram.com URL', async () => {
      const { analyzeListing } = await import('@/lib/ai/services/analyzeListing');
      const { db } = await import('@/lib/db/client');

      vi.mocked(analyzeListing).mockResolvedValue({
        success: true,
        data: {
          riskScore: 50,
          detectedPatterns: [],
          warnings: ['W'],
          recommendations: ['R'],
          reasoning: 'Reasoning',
        },
      });

      const mockInsert = vi.fn().mockResolvedValue(undefined);
      vi.mocked(db.insert).mockReturnValue({
        values: mockInsert,
      } as any);

      const request = createTestRequest({
        url: 'https://instagram.com/p/ABC123',
        text: '포토카드',
      });

      await POST(request);

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          platform: 'instagram',
        })
      );
    });

    it('should default to unknown platform for other URLs', async () => {
      const { analyzeListing } = await import('@/lib/ai/services/analyzeListing');
      const { db } = await import('@/lib/db/client');

      vi.mocked(analyzeListing).mockResolvedValue({
        success: true,
        data: {
          riskScore: 50,
          detectedPatterns: [],
          warnings: ['W'],
          recommendations: ['R'],
          reasoning: 'Reasoning',
        },
      });

      const mockInsert = vi.fn().mockResolvedValue(undefined);
      vi.mocked(db.insert).mockReturnValue({
        values: mockInsert,
      } as any);

      const request = createTestRequest({
        url: 'https://example.com/post/123',
        text: '포토카드',
      });

      await POST(request);

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          platform: 'unknown',
        })
      );
    });
  });

  describe('Method Rejection', () => {
    it('should reject GET requests with 405', async () => {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(405);
      expect(data.error).toBe('Method not allowed');
    });
  });
});

// Helper function to create test requests
function createTestRequest(
  body: any,
  headers: Record<string, string> = {}
): NextRequest {
  return new NextRequest('http://localhost:3000/api/analyze/listing', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  });
}
