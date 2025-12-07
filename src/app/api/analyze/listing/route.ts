import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { analyzeListingRequestSchema } from '@/lib/validations/analyze';
import { analyzeListing } from '@/lib/ai/services/analyzeListing';
import { db } from '@/lib/db/client';
import { analyses } from '@/lib/db/schema';
import { detectPlatform, getRiskLevel } from '@/lib/validations/analyze';

/**
 * POST /api/analyze/listing
 *
 * Analyzes a K-pop merchandise trading post for fraud risk using AI.
 * Validates input, calls OpenAI service, saves results to database, and returns analysis.
 *
 * @param request - Next.js request object containing listing details
 * @returns JSON response with risk analysis or error
 *
 * @example
 * ```typescript
 * POST /api/analyze/listing
 * {
 *   "url": "https://twitter.com/user/status/123",
 *   "text": "포토카드 양도합니다! 급해요!",
 *   "price": 3000
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "riskScore": 75,
 *     "riskLevel": "high",
 *     "warnings": ["긴급성 감지", "선입금 요구"],
 *     "recommendations": ["안전결제 사용"],
 *     "reasoning": "...",
 *     "detectedPatterns": ["urgent_language"]
 *   }
 * }
 * ```
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Parse and validate request body
    const body = await request.json();
    const validatedData = analyzeListingRequestSchema.parse(body);

    // 2. Call AI service for fraud analysis
    const result = await analyzeListing({
      text: validatedData.text,
      url: validatedData.url,
      price: validatedData.price,
      itemName: validatedData.itemName,
      images: validatedData.images,
    });

    // 3. Handle service failure
    if (!result.success || !result.data) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Analysis failed',
        },
        { status: 500 }
      );
    }

    // 4. Calculate risk level from score
    const riskLevel = getRiskLevel(result.data.riskScore);

    // 5. Detect platform from URL
    const platform = detectPlatform(validatedData.url);

    // 6. Extract IP address from headers
    const ipAddress = extractIpAddress(request);

    // 7. Save analysis results to database
    try {
      await db.insert(analyses).values({
        url: validatedData.url,
        platform,
        analysisType: 'listing',
        riskScore: result.data.riskScore,
        warnings: result.data.warnings,
        recommendations: result.data.recommendations,
        reasoning: result.data.reasoning,
        analysisData: {
          detectedPatterns: result.data.detectedPatterns,
          priceAnalysis: result.data.priceAnalysis
            ? {
                inputPrice: validatedData.price,
                isPriceNormal: result.data.priceAnalysis.isPriceNormal,
              }
            : undefined,
        },
        ipAddress,
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Analysis succeeded but database failed
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to save analysis results',
        },
        { status: 500 }
      );
    }

    // 8. Return success response
    return NextResponse.json(
      {
        success: true,
        data: {
          riskScore: result.data.riskScore,
          riskLevel,
          warnings: result.data.warnings,
          recommendations: result.data.recommendations,
          reasoning: result.data.reasoning,
          detectedPatterns: result.data.detectedPatterns,
          priceAnalysis: result.data.priceAnalysis,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON',
        },
        { status: 400 }
      );
    }

    // Handle unexpected errors
    console.error('Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analyze/listing
 *
 * Reject GET requests with 405 Method Not Allowed
 */
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

/**
 * PUT /api/analyze/listing
 *
 * Reject PUT requests with 405 Method Not Allowed
 */
export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

/**
 * DELETE /api/analyze/listing
 *
 * Reject DELETE requests with 405 Method Not Allowed
 */
export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

/**
 * Extract IP address from request headers
 *
 * Checks multiple headers in order of priority:
 * 1. x-forwarded-for (most common, used by proxies/load balancers)
 * 2. x-real-ip (alternative header)
 * 3. x-vercel-forwarded-for (Vercel-specific)
 *
 * @param request - Next.js request object
 * @returns IP address string or null if not found
 */
function extractIpAddress(request: NextRequest): string | null {
  // Try x-forwarded-for first (common in proxies/load balancers)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can be comma-separated list, take first
    return forwardedFor.split(',')[0].trim();
  }

  // Try x-real-ip
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to Vercel-specific header
  const vercelIp = request.headers.get('x-vercel-forwarded-for');
  if (vercelIp) {
    return vercelIp;
  }

  return null;
}
