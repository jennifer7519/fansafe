import { describe, it, expect } from 'vitest';
import {
  listingAnalysisOutputSchema,
  imageAnalysisOutputSchema,
  sellerAnalysisOutputSchema,
  FRAUD_PATTERN_CATEGORIES,
} from '../schemas';

describe('AI Output Schemas', () => {
  describe('listingAnalysisOutputSchema', () => {
    it('should validate a complete listing analysis output', () => {
      const validData = {
        riskScore: 75,
        detectedPatterns: ['urgent_language', 'prepayment_demand'],
        warnings: ['This is a warning'],
        recommendations: ['This is a recommendation'],
        reasoning: 'This is a detailed reasoning that is definitely more than 50 characters long.',
        priceAnalysis: {
          isPriceNormal: false,
          priceComment: 'Too cheap',
        },
        translatedText: 'English translation here',
      };

      const result = listingAnalysisOutputSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject riskScore outside 0-100 range', () => {
      const invalidData = {
        riskScore: 150,
        detectedPatterns: [],
        warnings: ['Warning'],
        recommendations: ['Recommendation'],
        reasoning: 'Reasoning that is long enough to pass the minimum requirement.',
      };

      const result = listingAnalysisOutputSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty warnings array', () => {
      const invalidData = {
        riskScore: 50,
        detectedPatterns: [],
        warnings: [],
        recommendations: ['Recommendation'],
        reasoning: 'Reasoning that is long enough to pass the minimum requirement.',
      };

      const result = listingAnalysisOutputSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty recommendations array', () => {
      const invalidData = {
        riskScore: 50,
        detectedPatterns: [],
        warnings: ['Warning'],
        recommendations: [],
        reasoning: 'Reasoning that is long enough to pass the minimum requirement.',
      };

      const result = listingAnalysisOutputSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject reasoning shorter than 50 characters', () => {
      const invalidData = {
        riskScore: 50,
        detectedPatterns: [],
        warnings: ['Warning'],
        recommendations: ['Recommendation'],
        reasoning: 'Too short',
      };

      const result = listingAnalysisOutputSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should allow optional fields to be omitted', () => {
      const validData = {
        riskScore: 30,
        detectedPatterns: [],
        warnings: ['Warning'],
        recommendations: ['Recommendation'],
        reasoning: 'This is a detailed reasoning that is definitely more than 50 characters.',
      };

      const result = listingAnalysisOutputSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('imageAnalysisOutputSchema', () => {
    it('should validate a complete image analysis output', () => {
      const validData = {
        isAuthentic: true,
        confidence: 85,
        detectedIssues: ['poor_quality'],
        observations: ['Image quality is acceptable', 'No obvious editing detected'],
        recommendations: ['Request additional photos'],
        reasoning: 'Based on the analysis, the image appears authentic.',
      };

      const result = imageAnalysisOutputSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject confidence outside 0-100 range', () => {
      const invalidData = {
        isAuthentic: true,
        confidence: 150,
        detectedIssues: [],
        observations: ['Observation'],
        recommendations: [],
        reasoning: 'Reasoning here with enough length',
      };

      const result = imageAnalysisOutputSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty observations array', () => {
      const invalidData = {
        isAuthentic: true,
        confidence: 80,
        detectedIssues: [],
        observations: [],
        recommendations: [],
        reasoning: 'Reasoning here with enough length',
      };

      const result = imageAnalysisOutputSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject reasoning shorter than 30 characters', () => {
      const invalidData = {
        isAuthentic: true,
        confidence: 80,
        detectedIssues: [],
        observations: ['Observation'],
        recommendations: [],
        reasoning: 'Too short',
      };

      const result = imageAnalysisOutputSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('sellerAnalysisOutputSchema', () => {
    it('should validate a complete seller analysis output', () => {
      const validData = {
        trustScore: 65,
        trustLevel: 'medium' as const,
        strengths: ['Active account', 'Good feedback'],
        concerns: ['New account', 'Limited history'],
        recommendations: ['Proceed with caution', 'Use escrow'],
        reasoning:
          'The seller shows mixed signals with some positive indicators but also concerning factors.',
      };

      const result = sellerAnalysisOutputSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate all trust levels', () => {
      const levels: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];

      levels.forEach((level) => {
        const validData = {
          trustScore: 50,
          trustLevel: level,
          strengths: [],
          concerns: [],
          recommendations: ['Recommendation'],
          reasoning: 'This is a detailed reasoning with sufficient length for validation.',
        };

        const result = sellerAnalysisOutputSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid trust level', () => {
      const invalidData = {
        trustScore: 50,
        trustLevel: 'very_high',
        strengths: [],
        concerns: [],
        recommendations: ['Recommendation'],
        reasoning: 'This is a detailed reasoning with sufficient length for validation.',
      };

      const result = sellerAnalysisOutputSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject trustScore outside 0-100 range', () => {
      const invalidData = {
        trustScore: -10,
        trustLevel: 'low' as const,
        strengths: [],
        concerns: [],
        recommendations: ['Recommendation'],
        reasoning: 'This is a detailed reasoning with sufficient length for validation.',
      };

      const result = sellerAnalysisOutputSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty recommendations array', () => {
      const invalidData = {
        trustScore: 50,
        trustLevel: 'medium' as const,
        strengths: [],
        concerns: [],
        recommendations: [],
        reasoning: 'This is a detailed reasoning with sufficient length for validation.',
      };

      const result = sellerAnalysisOutputSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('FRAUD_PATTERN_CATEGORIES', () => {
    it('should have all expected fraud pattern categories', () => {
      expect(FRAUD_PATTERN_CATEGORIES.URGENT_LANGUAGE).toBe('urgent_language');
      expect(FRAUD_PATTERN_CATEGORIES.PREPAYMENT_DEMAND).toBe('prepayment_demand');
      expect(FRAUD_PATTERN_CATEGORIES.VAGUE_DESCRIPTION).toBe('vague_description');
      expect(FRAUD_PATTERN_CATEGORIES.SUSPICIOUS_PRICE).toBe('suspicious_price');
      expect(FRAUD_PATTERN_CATEGORIES.NO_VERIFICATION).toBe('no_verification');
      expect(FRAUD_PATTERN_CATEGORIES.POOR_PHOTOS).toBe('poor_photos');
      expect(FRAUD_PATTERN_CATEGORIES.PRESSURE_TACTICS).toBe('pressure_tactics');
      expect(FRAUD_PATTERN_CATEGORIES.NEW_ACCOUNT).toBe('new_account');
      expect(FRAUD_PATTERN_CATEGORIES.NO_PAYMENT_PROTECTION).toBe('no_payment_protection');
    });
  });
});
