import { useTranslation } from 'react-i18next';

export interface TrustBadgeProps {
  /**
   * Trust level
   */
  level: 'low' | 'medium' | 'high';

  /**
   * Optional trust score to display
   */
  score?: number;

  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Trust level badge component for seller analysis
 *
 * @example
 * ```tsx
 * <TrustBadge level="high" score={85} />
 * <TrustBadge level="medium" />
 * ```
 */
export function TrustBadge({ level, score, size = 'md' }: TrustBadgeProps) {
  const { t } = useTranslation();

  const badgeColors = {
    low: 'badge-error',
    medium: 'badge-warning',
    high: 'badge-success',
  };

  const sizeClasses = {
    sm: 'badge-sm',
    md: 'badge-md',
    lg: 'badge-lg',
  };

  return (
    <div className={`badge ${badgeColors[level]} ${sizeClasses[size]} gap-1 font-semibold`}>
      {t(`analysis.trust.${level}`)}
      {score !== undefined && <span className="opacity-80">({score})</span>}
    </div>
  );
}
