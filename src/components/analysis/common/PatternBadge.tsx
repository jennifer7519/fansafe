import { useTranslation } from 'react-i18next';

export interface PatternBadgeProps {
  /**
   * Fraud pattern key (e.g., "urgent_language", "prepayment_demand")
   */
  pattern: string;

  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Fraud pattern badge component
 *
 * @example
 * ```tsx
 * <PatternBadge pattern="urgent_language" />
 * <PatternBadge pattern="prepayment_demand" size="sm" />
 * ```
 */
export function PatternBadge({ pattern, size = 'sm' }: PatternBadgeProps) {
  const { t } = useTranslation();

  const sizeClasses = {
    sm: 'badge-sm',
    md: 'badge-md',
    lg: 'badge-lg',
  };

  return (
    <div className={`badge badge-outline badge-error ${sizeClasses[size]}`}>
      {t(`analysis.patterns.${pattern}`, pattern)}
    </div>
  );
}
