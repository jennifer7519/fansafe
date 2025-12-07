import { useTranslation } from 'react-i18next';

export interface RiskBadgeProps {
  /**
   * Risk level: low (0-29), medium (30-69), high (70-100)
   */
  level: 'low' | 'medium' | 'high';

  /**
   * Optional risk score to display
   */
  score?: number;

  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Risk level badge component using DaisyUI badge styles
 *
 * @example
 * ```tsx
 * <RiskBadge level="high" score={85} />
 * <RiskBadge level="low" />
 * ```
 */
export function RiskBadge({ level, score, size = 'md' }: RiskBadgeProps) {
  const { t } = useTranslation();

  const badgeColors = {
    low: 'badge-success',
    medium: 'badge-warning',
    high: 'badge-error',
  };

  const sizeClasses = {
    sm: 'badge-sm',
    md: 'badge-md',
    lg: 'badge-lg',
  };

  return (
    <div className={`badge ${badgeColors[level]} ${sizeClasses[size]} gap-1 font-semibold`}>
      {t(`analysis.risk.${level}`)}
      {score !== undefined && <span className="opacity-80">({score})</span>}
    </div>
  );
}
