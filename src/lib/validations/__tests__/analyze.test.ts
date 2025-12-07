import { describe, it, expect } from 'vitest';
import {
  analyzeListingRequestSchema,
  analyzeSellerRequestSchema,
  analyzeImageRequestSchema,
  checkPriceRequestSchema,
  analysisResponseSchema,
  getRiskLevel,
  detectPlatform,
} from '../analyze';

describe('Zod Validation Schemas', () => {
  describe('analyzeListingRequestSchema', () => {
    it('should validate a valid listing request', () => {
      const validData = {
        url: 'https://twitter.com/user/status/123',
        text: '포토카드 양도합니다. 5000원',
        images: ['https://example.com/image.jpg'],
        price: 5000,
        itemName: 'BTS 포토카드',
      };

      const result = analyzeListingRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid URL', () => {
      const invalidData = {
        url: 'not-a-url',
        text: '포토카드 양도',
      };

      const result = analyzeListingRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty text', () => {
      const invalidData = {
        url: 'https://twitter.com/user/status/123',
        text: '',
      };

      const result = analyzeListingRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should default images to empty array if not provided', () => {
      const validData = {
        url: 'https://twitter.com/user/status/123',
        text: '포토카드 양도합니다',
      };

      const result = analyzeListingRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.images).toEqual([]);
      }
    });

    it('should reject text longer than 10000 characters', () => {
      const invalidData = {
        url: 'https://twitter.com/user/status/123',
        text: 'a'.repeat(10001),
      };

      const result = analyzeListingRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('analyzeSellerRequestSchema', () => {
    it('should validate a valid seller request', () => {
      const validData = {
        url: 'https://twitter.com/user',
        username: 'kpop_seller',
        platform: 'twitter' as const,
        accountAge: 365,
        followerCount: 1000,
        postCount: 500,
      };

      const result = analyzeSellerRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should allow optional fields to be omitted', () => {
      const validData = {
        url: 'https://twitter.com/user',
        username: 'kpop_seller',
        platform: 'twitter' as const,
      };

      const result = analyzeSellerRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid platform', () => {
      const invalidData = {
        url: 'https://twitter.com/user',
        username: 'kpop_seller',
        platform: 'facebook',
      };

      const result = analyzeSellerRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject negative follower count', () => {
      const invalidData = {
        url: 'https://twitter.com/user',
        username: 'kpop_seller',
        platform: 'twitter' as const,
        followerCount: -10,
      };

      const result = analyzeSellerRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('analyzeImageRequestSchema', () => {
    it('should validate a valid image request', () => {
      const validData = {
        imageUrls: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
        itemName: 'BTS 포토카드',
        expectedCondition: 'new' as const,
      };

      const result = analyzeImageRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should require at least one image URL', () => {
      const invalidData = {
        imageUrls: [],
      };

      const result = analyzeImageRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject more than 10 images', () => {
      const invalidData = {
        imageUrls: Array(11).fill('https://example.com/image.jpg'),
      };

      const result = analyzeImageRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid image URLs', () => {
      const invalidData = {
        imageUrls: ['not-a-url'],
      };

      const result = analyzeImageRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('checkPriceRequestSchema', () => {
    it('should validate a valid price check request', () => {
      const validData = {
        itemName: 'BTS 포토카드',
        price: 5000,
        currency: 'KRW',
        itemType: 'photocard' as const,
        artist: 'BTS',
      };

      const result = checkPriceRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should default currency to KRW', () => {
      const validData = {
        itemName: 'BTS 포토카드',
        price: 5000,
      };

      const result = checkPriceRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currency).toBe('KRW');
      }
    });

    it('should default itemType to photocard', () => {
      const validData = {
        itemName: 'BTS 포토카드',
        price: 5000,
      };

      const result = checkPriceRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.itemType).toBe('photocard');
      }
    });

    it('should reject negative price', () => {
      const invalidData = {
        itemName: 'BTS 포토카드',
        price: -5000,
      };

      const result = checkPriceRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject zero price', () => {
      const invalidData = {
        itemName: 'BTS 포토카드',
        price: 0,
      };

      const result = checkPriceRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('analysisResponseSchema', () => {
    it('should validate a successful analysis response', () => {
      const validData = {
        success: true,
        data: {
          riskScore: 45,
          riskLevel: 'medium' as const,
          warnings: ['긴급성이 감지되었습니다'],
          recommendations: ['판매자 프로필을 확인하세요'],
          reasoning: 'AI 분석 결과...',
          detectedPatterns: ['urgent'],
          priceAnalysis: {
            inputPrice: 5000,
            averagePrice: 4500,
            isPriceNormal: true,
            priceDeviation: 11.1,
          },
        },
      };

      const result = analysisResponseSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate an error response', () => {
      const validData = {
        success: false,
        error: '분석에 실패했습니다',
      };

      const result = analysisResponseSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject riskScore outside 0-100 range', () => {
      const invalidData = {
        success: true,
        data: {
          riskScore: 150,
          riskLevel: 'high' as const,
          warnings: [],
          recommendations: [],
          reasoning: 'test',
        },
      };

      const result = analysisResponseSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});

describe('Helper Functions', () => {
  describe('getRiskLevel', () => {
    it('should return "low" for scores below 30', () => {
      expect(getRiskLevel(0)).toBe('low');
      expect(getRiskLevel(15)).toBe('low');
      expect(getRiskLevel(29)).toBe('low');
    });

    it('should return "medium" for scores 30-69', () => {
      expect(getRiskLevel(30)).toBe('medium');
      expect(getRiskLevel(50)).toBe('medium');
      expect(getRiskLevel(69)).toBe('medium');
    });

    it('should return "high" for scores 70 and above', () => {
      expect(getRiskLevel(70)).toBe('high');
      expect(getRiskLevel(85)).toBe('high');
      expect(getRiskLevel(100)).toBe('high');
    });
  });

  describe('detectPlatform', () => {
    it('should detect Twitter from twitter.com URL', () => {
      expect(detectPlatform('https://twitter.com/user/status/123')).toBe('twitter');
      expect(detectPlatform('https://www.twitter.com/user')).toBe('twitter');
    });

    it('should detect Twitter from x.com URL', () => {
      expect(detectPlatform('https://x.com/user/status/123')).toBe('twitter');
      expect(detectPlatform('https://www.x.com/user')).toBe('twitter');
    });

    it('should detect Instagram from instagram.com URL', () => {
      expect(detectPlatform('https://instagram.com/user')).toBe('instagram');
      expect(detectPlatform('https://www.instagram.com/p/ABC123')).toBe('instagram');
    });

    it('should return "unknown" for other URLs', () => {
      expect(detectPlatform('https://facebook.com/user')).toBe('unknown');
      expect(detectPlatform('https://example.com')).toBe('unknown');
    });

    it('should be case-insensitive', () => {
      expect(detectPlatform('HTTPS://TWITTER.COM/USER')).toBe('twitter');
      expect(detectPlatform('HTTPS://INSTAGRAM.COM/USER')).toBe('instagram');
    });
  });
});
