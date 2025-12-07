import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import type { SellerAnalysisOutput } from '@/lib/ai/schemas';
import { TrustBadge } from './common/TrustBadge';
import { RecommendationList } from './common/RecommendationList';

export interface SellerAnalysisResultProps {
  /**
   * Analysis result from AI service
   */
  result: SellerAnalysisOutput;

  /**
   * Optional loading state
   */
  isLoading?: boolean;
}

/**
 * Seller analysis result display component
 *
 * Shows seller trust assessment including:
 * - Trust score and level
 * - Strengths and concerns
 * - Recommendations
 * - AI reasoning
 *
 * @example
 * ```tsx
 * <SellerAnalysisResult result={sellerAnalysisData} />
 * ```
 */
export function SellerAnalysisResult({ result, isLoading = false }: SellerAnalysisResultProps) {
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
        {/* Header with Trust Badge */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="card-title">{t('analysis.seller.title')}</h2>
          <TrustBadge level={result.trustLevel} score={result.trustScore} size="lg" />
        </div>

        {/* Trust Score Progress */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-4"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">{t('analysis.seller.trustScore')}</span>
            <span className="text-sm font-medium">{result.trustScore}/100</span>
          </div>
          <progress
            className={`progress ${result.trustScore >= 70 ? 'progress-success' : result.trustScore >= 40 ? 'progress-warning' : 'progress-error'} w-full`}
            value={result.trustScore}
            max="100"
          ></progress>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {/* Strengths */}
          {result.strengths && result.strengths.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="alert alert-success"
            >
              <div className="w-full">
                <div className="flex items-center gap-2 mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="font-bold">{t('analysis.seller.strengths')}</h3>
                </div>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {result.strengths.map((strength, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.1 }}
                    >
                      {strength}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}

          {/* Concerns */}
          {result.concerns && result.concerns.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.25 }}
              className="alert alert-warning"
            >
              <div className="w-full">
                <div className="flex items-center gap-2 mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 shrink-0"
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
                  <h3 className="font-bold">{t('analysis.seller.concerns')}</h3>
                </div>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {result.concerns.map((concern, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.1 }}
                    >
                      {concern}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </div>

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
              {t('analysis.seller.reasoning')}
            </div>
            <div className="collapse-content">
              <p className="text-sm">{result.reasoning}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
