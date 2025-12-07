import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import type { ImageAnalysisOutput } from '@/lib/ai/schemas';
import { PatternBadge } from './common/PatternBadge';
import { RecommendationList } from './common/RecommendationList';

export interface ImageAnalysisResultProps {
  /**
   * Analysis result from AI service
   */
  result: ImageAnalysisOutput;

  /**
   * Optional loading state
   */
  isLoading?: boolean;
}

/**
 * Image analysis result display component
 *
 * Shows image authenticity assessment including:
 * - Authenticity verdict and confidence
 * - Detected issues
 * - Observations
 * - Recommendations
 * - AI reasoning
 *
 * @example
 * ```tsx
 * <ImageAnalysisResult result={imageAnalysisData} />
 * ```
 */
export function ImageAnalysisResult({ result, isLoading = false }: ImageAnalysisResultProps) {
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

  const authenticityColor = result.isAuthentic ? 'badge-success' : 'badge-error';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="card bg-base-100 shadow-xl"
    >
      <div className="card-body">
        {/* Header with Authenticity Badge */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="card-title">{t('analysis.image.title')}</h2>
          <div className={`badge ${authenticityColor} badge-lg gap-1 font-semibold`}>
            {result.isAuthentic
              ? t('analysis.image.authentic')
              : t('analysis.image.notAuthentic')}
            <span className="opacity-80">({result.confidence}%)</span>
          </div>
        </div>

        {/* Confidence Progress Bar */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-4"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">{t('analysis.image.confidence')}</span>
            <span className="text-sm font-medium">{result.confidence}%</span>
          </div>
          <progress
            className={`progress ${result.confidence >= 70 ? 'progress-success' : result.confidence >= 40 ? 'progress-warning' : 'progress-error'} w-full`}
            value={result.confidence}
            max="100"
          ></progress>
        </motion.div>

        {/* Detected Issues */}
        {result.detectedIssues && result.detectedIssues.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="mb-4"
          >
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-error"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {t('analysis.image.detectedIssues')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.detectedIssues.map((issue, index) => (
                <motion.div
                  key={issue}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <PatternBadge pattern={issue} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Observations */}
        {result.observations && result.observations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
            className="alert alert-info mb-4"
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
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                <h3 className="font-bold">{t('analysis.image.observations')}</h3>
              </div>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {result.observations.map((observation, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.1 }}
                  >
                    {observation}
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}

        {/* Recommendations */}
        {result.recommendations && result.recommendations.length > 0 && (
          <RecommendationList recommendations={result.recommendations} />
        )}

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
              {t('analysis.image.reasoning')}
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
