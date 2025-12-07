import { z } from 'zod';

/**
 * 플랫폼 타입
 */
export const platformSchema = z.enum(['twitter', 'instagram', 'unknown']);

/**
 * 분석 타입
 */
export const analysisTypeSchema = z.enum(['listing', 'seller', 'image']);

/**
 * 거래 글 분석 요청 스키마
 */
export const analyzeListingRequestSchema = z.object({
  url: z.string().url('유효한 URL을 입력해주세요'),
  text: z.string().min(1, '거래 글 내용을 입력해주세요').max(10000),
  images: z.array(z.string().url()).optional().default([]),
  price: z.number().positive().optional(), // 가격 정보 (선택)
  itemName: z.string().optional(), // 아이템명 (선택)
});

export type AnalyzeListingRequest = z.infer<typeof analyzeListingRequestSchema>;

/**
 * 판매자 분석 요청 스키마
 */
export const analyzeSellerRequestSchema = z.object({
  url: z.string().url('유효한 판매자 프로필 URL을 입력해주세요'),
  username: z.string().min(1).max(100),
  platform: platformSchema,
  accountAge: z.number().int().positive().optional(), // 계정 생성 후 일수
  followerCount: z.number().int().nonnegative().optional(),
  postCount: z.number().int().nonnegative().optional(),
});

export type AnalyzeSellerRequest = z.infer<typeof analyzeSellerRequestSchema>;

/**
 * 이미지 분석 요청 스키마
 */
export const analyzeImageRequestSchema = z.object({
  imageUrls: z.array(z.string().url()).min(1, '최소 1개의 이미지가 필요합니다').max(10),
  itemName: z.string().optional(),
  expectedCondition: z.enum(['new', 'like_new', 'used', 'unknown']).optional(),
});

export type AnalyzeImageRequest = z.infer<typeof analyzeImageRequestSchema>;

/**
 * 가격 체크 요청 스키마
 */
export const checkPriceRequestSchema = z.object({
  itemName: z.string().min(1, '아이템명을 입력해주세요').max(200),
  price: z.number().positive('가격은 0보다 커야 합니다'),
  currency: z.string().length(3).default('KRW'), // ISO 4217
  itemType: z.enum(['photocard', 'album', 'lightstick', 'other']).default('photocard'),
  artist: z.string().optional(),
});

export type CheckPriceRequest = z.infer<typeof checkPriceRequestSchema>;

/**
 * 분석 결과 응답 스키마
 */
export const analysisResponseSchema = z.object({
  success: z.boolean(),
  data: z
    .object({
      riskScore: z.number().int().min(0).max(100),
      riskLevel: z.enum(['low', 'medium', 'high']),
      warnings: z.array(z.string()),
      recommendations: z.array(z.string()),
      reasoning: z.string(),
      detectedPatterns: z.array(z.string()).optional(),
      priceAnalysis: z
        .object({
          inputPrice: z.number().optional(),
          averagePrice: z.number().optional(),
          minPrice: z.number().optional(),
          maxPrice: z.number().optional(),
          isPriceNormal: z.boolean().optional(),
          priceDeviation: z.number().optional(), // 평균 대비 편차 (%)
        })
        .optional(),
      imageAnalysis: z
        .object({
          isAuthentic: z.boolean().optional(),
          isPotentialFake: z.boolean().optional(),
          detectedIssues: z.array(z.string()).optional(),
        })
        .optional(),
    })
    .optional(),
  error: z.string().optional(),
});

export type AnalysisResponse = z.infer<typeof analysisResponseSchema>;

/**
 * 피드백 제출 요청 스키마
 */
export const submitFeedbackRequestSchema = z.object({
  analysisId: z.number().int().positive(),
  wasAccurate: z.boolean(),
  actualOutcome: z.enum(['safe_transaction', 'scam_detected', 'price_issue', 'other']),
  comments: z.string().max(1000).optional(),
});

export type SubmitFeedbackRequest = z.infer<typeof submitFeedbackRequestSchema>;

/**
 * 헬퍼: 위험도 레벨 계산
 */
export function getRiskLevel(score: number): 'low' | 'medium' | 'high' {
  if (score < 30) return 'low';
  if (score < 70) return 'medium';
  return 'high';
}

/**
 * 헬퍼: URL에서 플랫폼 감지
 */
export function detectPlatform(url: string): 'twitter' | 'instagram' | 'unknown' {
  const urlLower = url.toLowerCase();
  if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) {
    return 'twitter';
  }
  if (urlLower.includes('instagram.com')) {
    return 'instagram';
  }
  return 'unknown';
}
