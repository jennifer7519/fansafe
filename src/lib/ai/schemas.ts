import { z } from 'zod';

/**
 * 거래 글 분석 결과 스키마 (OpenAI Structured Outputs용)
 */
export const listingAnalysisOutputSchema = z.object({
  riskScore: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe('Risk score from 0 (safe) to 100 (very dangerous)'),

  detectedPatterns: z
    .array(z.string())
    .describe('List of detected fraud patterns (e.g., "urgent_language", "prepayment_demand")'),

  warnings: z
    .array(z.string())
    .min(1)
    .describe('Specific warnings for the user in English, must have at least one warning'),

  recommendations: z
    .array(z.string())
    .min(1)
    .describe('Actionable safety recommendations, must have at least one recommendation'),

  reasoning: z
    .string()
    .min(50)
    .describe('Detailed explanation of the analysis in English (minimum 50 characters)'),

  priceAnalysis: z
    .object({
      isPriceNormal: z.boolean().describe('Whether the price seems normal for the item'),
      priceComment: z
        .string()
        .describe('Brief comment about the price (e.g., "Seems reasonable", "Too cheap, suspicious")'),
    })
    .optional()
    .describe('Price analysis if price information was provided'),

  translatedText: z
    .string()
    .optional()
    .describe('English translation of the original Korean text if it was in Korean'),
});

export type ListingAnalysisOutput = z.infer<typeof listingAnalysisOutputSchema>;

/**
 * 이미지 분석 결과 스키마
 */
export const imageAnalysisOutputSchema = z.object({
  isAuthentic: z
    .boolean()
    .describe('Whether the images appear to show an authentic item'),

  confidence: z
    .number()
    .min(0)
    .max(100)
    .describe('Confidence level of the authenticity assessment (0-100)'),

  detectedIssues: z
    .array(z.string())
    .describe('List of issues found (e.g., "stock_photo", "heavy_editing", "poor_quality")'),

  observations: z
    .array(z.string())
    .min(1)
    .describe('Specific observations about the images'),

  recommendations: z
    .array(z.string())
    .describe('Recommendations based on image analysis'),

  reasoning: z
    .string()
    .min(30)
    .describe('Detailed reasoning for the assessment'),
});

export type ImageAnalysisOutput = z.infer<typeof imageAnalysisOutputSchema>;

/**
 * 판매자 분석 결과 스키마
 */
export const sellerAnalysisOutputSchema = z.object({
  trustScore: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe('Trust score from 0 (untrustworthy) to 100 (very trustworthy)'),

  trustLevel: z
    .enum(['low', 'medium', 'high'])
    .describe('Overall trust level categorization'),

  strengths: z
    .array(z.string())
    .describe('Positive factors about the seller'),

  concerns: z
    .array(z.string())
    .describe('Concerns or red flags about the seller'),

  recommendations: z
    .array(z.string())
    .min(1)
    .describe('Specific recommendations for dealing with this seller'),

  reasoning: z
    .string()
    .min(50)
    .describe('Detailed explanation of the trust assessment'),
});

export type SellerAnalysisOutput = z.infer<typeof sellerAnalysisOutputSchema>;

/**
 * 사기 패턴 카테고리
 */
export const FRAUD_PATTERN_CATEGORIES = {
  URGENT_LANGUAGE: 'urgent_language',
  PREPAYMENT_DEMAND: 'prepayment_demand',
  VAGUE_DESCRIPTION: 'vague_description',
  SUSPICIOUS_PRICE: 'suspicious_price',
  NO_VERIFICATION: 'no_verification',
  POOR_PHOTOS: 'poor_photos',
  PRESSURE_TACTICS: 'pressure_tactics',
  NEW_ACCOUNT: 'new_account',
  NO_PAYMENT_PROTECTION: 'no_payment_protection',
} as const;
