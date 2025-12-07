import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RiskBadge } from '../RiskBadge';
import '@/lib/i18n/config';

describe('RiskBadge', () => {
  it('should render low risk badge', () => {
    render(<RiskBadge level="low" />);
    expect(screen.getByText(/low risk/i)).toBeInTheDocument();
  });

  it('should render medium risk badge', () => {
    render(<RiskBadge level="medium" />);
    expect(screen.getByText(/medium risk/i)).toBeInTheDocument();
  });

  it('should render high risk badge', () => {
    render(<RiskBadge level="high" />);
    expect(screen.getByText(/high risk/i)).toBeInTheDocument();
  });

  it('should display score when provided', () => {
    render(<RiskBadge level="high" score={85} />);
    expect(screen.getByText(/85/)).toBeInTheDocument();
  });

  it('should apply correct color classes', () => {
    const { container: lowContainer } = render(<RiskBadge level="low" />);
    expect(lowContainer.querySelector('.badge-success')).toBeInTheDocument();

    const { container: mediumContainer } = render(<RiskBadge level="medium" />);
    expect(mediumContainer.querySelector('.badge-warning')).toBeInTheDocument();

    const { container: highContainer } = render(<RiskBadge level="high" />);
    expect(highContainer.querySelector('.badge-error')).toBeInTheDocument();
  });

  it('should apply correct size classes', () => {
    const { container: smContainer } = render(<RiskBadge level="low" size="sm" />);
    expect(smContainer.querySelector('.badge-sm')).toBeInTheDocument();

    const { container: mdContainer } = render(<RiskBadge level="low" size="md" />);
    expect(mdContainer.querySelector('.badge-md')).toBeInTheDocument();

    const { container: lgContainer } = render(<RiskBadge level="low" size="lg" />);
    expect(lgContainer.querySelector('.badge-lg')).toBeInTheDocument();
  });
});
