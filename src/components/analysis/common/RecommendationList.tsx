import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export interface RecommendationListProps {
  /**
   * List of recommendation messages
   */
  recommendations: string[];

  /**
   * Optional title (defaults to i18n key)
   */
  title?: string;
}

/**
 * Recommendation list component with info styling
 *
 * @example
 * ```tsx
 * <RecommendationList recommendations={['Use escrow', 'Verify seller']} />
 * ```
 */
export function RecommendationList({ recommendations, title }: RecommendationListProps) {
  const { t } = useTranslation();

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="alert alert-info"
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
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="font-bold">{title || t('analysis.recommendations')}</h3>
        </div>
        <ul className="list-disc list-inside space-y-1 text-sm">
          {recommendations.map((recommendation, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.1 }}
            >
              {recommendation}
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
