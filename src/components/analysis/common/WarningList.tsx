import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export interface WarningListProps {
  /**
   * List of warning messages
   */
  warnings: string[];

  /**
   * Optional title (defaults to i18n key)
   */
  title?: string;
}

/**
 * Warning list component with alert styling
 *
 * @example
 * ```tsx
 * <WarningList warnings={['Warning 1', 'Warning 2']} />
 * ```
 */
export function WarningList({ warnings, title }: WarningListProps) {
  const { t } = useTranslation();

  if (!warnings || warnings.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
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
          <h3 className="font-bold">{title || t('analysis.warnings')}</h3>
        </div>
        <ul className="list-disc list-inside space-y-1 text-sm">
          {warnings.map((warning, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.1 }}
            >
              {warning}
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
