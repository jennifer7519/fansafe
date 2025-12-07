import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import type { ListingAnalysisOutput } from '@/lib/ai/schemas';
import { RiskBadge } from './common/RiskBadge';
import { PatternBadge } from './common/PatternBadge';
import { WarningList } from './common/WarningList';
import { RecommendationList } from './common/RecommendationList';

export interface ListingAnalysisResultProps {
  /**
   * Analysis result from AI service
   */
  result: ListingAnalysisOutput;

  /**
   * Risk level calculated from score
   */
  riskLevel: 'low' | 'medium' | 'high';

  /**
   * Optional loading state
   */
  isLoading?: boolean;
}

/**
 * Listing analysis result display component
 *
 * Shows comprehensive fraud detection results including:
 * - Risk score and level
 * - Detected fraud patterns
 * - Warnings and recommendations
 * - Price analysis
 * - AI reasoning
 *
 * @example
 * ```tsx
 * <ListingAnalysisResult
 *   result={analysisData}
 *   riskLevel="high"
 * />
 * ```
 */
export function ListingAnalysisResult({
  result,
  riskLevel,
  isLoading = false,
}: ListingAnalysisResultProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex justify-center items-center h-64">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="card bg-base-100 shadow-xl"
    >
      <div className="card-body">
        {/* Header with Risk Score */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="card-title">{t('analysis.listing.title')}</h2>
          <RiskBadge level={riskLevel} score={result.riskScore} size="lg" />
        </div>

        {/* Detected Patterns */}
        {result.detectedPatterns && result.detectedPatterns.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mb-4"
          >
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              {t('analysis.listing.detectedPatterns')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.detectedPatterns.map((pattern, index) => (
                <motion.div
                  key={pattern}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <PatternBadge pattern={pattern} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Price Analysis */}
        {result.priceAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className={`alert ${result.priceAnalysis.isPriceNormal ? 'alert-success' : 'alert-warning'} mb-4`}
          >
            <div>
              <h3 className="font-bold flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {t('analysis.listing.priceAnalysis')}
              </h3>
              <p className="text-sm mt-1">{result.priceAnalysis.priceComment}</p>
            </div>
          </motion.div>
        )}

        {/* Warnings */}
        <WarningList warnings={result.warnings} />

        {/* Recommendations */}
        <RecommendationList recommendations={result.recommendations} />

        {/* AI Reasoning */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="mt-4"
        >
          <div className="collapse collapse-arrow bg-base-200">
            <input type="checkbox" />
            <div className="collapse-title font-medium">
              {t('analysis.listing.reasoning')}
            </div>
            <div className="collapse-content">
              <p className="text-sm">{result.reasoning}</p>
            </div>
          </div>
        </motion.div>

        {/* Translated Text (if available) */}
        {result.translatedText && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="mt-2"
          >
            <div className="collapse collapse-arrow bg-base-200">
              <input type="checkbox" />
              <div className="collapse-title font-medium">
                {t('analysis.listing.translation')}
              </div>
              <div className="collapse-content">
                <p className="text-sm">{result.translatedText}</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
