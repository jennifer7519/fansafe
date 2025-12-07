import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SellerAnalysisResult } from '../SellerAnalysisResult';
import type { SellerAnalysisOutput } from '@/lib/ai/schemas';
import '@/lib/i18n/config';

describe('SellerAnalysisResult', () => {
  const mockResult: SellerAnalysisOutput = {
    trustScore: 65,
    trustLevel: 'medium',
    strengths: ['Active account', 'Good feedback'],
    concerns: ['New account', 'Limited history'],
    recommendations: ['Proceed with caution', 'Use escrow'],
    reasoning:
      'The seller shows mixed signals with some positive indicators but also concerning factors.',
  };

  it('should render loading state', () => {
    const { container } = render(<SellerAnalysisResult result={mockResult} isLoading={true} />);
    expect(container.querySelector('.loading-spinner')).toBeInTheDocument();
  });

  it('should render trust badge with score', () => {
    render(<SellerAnalysisResult result={mockResult} />);
    expect(screen.getByText(/medium trust/i)).toBeInTheDocument();
    // Score can appear in badge or progress bar, just check it exists
    const scoreElements = screen.getAllByText(/65/);
    expect(scoreElements.length).toBeGreaterThan(0);
  });

  it('should render trust score progress bar', () => {
    const { container } = render(<SellerAnalysisResult result={mockResult} />);
    const progress = container.querySelector('progress');
    expect(progress).toBeInTheDocument();
    expect(progress?.getAttribute('value')).toBe('65');
  });

  it('should render strengths', () => {
    render(<SellerAnalysisResult result={mockResult} />);
    expect(screen.getByText('Active account')).toBeInTheDocument();
    expect(screen.getByText('Good feedback')).toBeInTheDocument();
  });

  it('should render concerns', () => {
    render(<SellerAnalysisResult result={mockResult} />);
    expect(screen.getByText('New account')).toBeInTheDocument();
    expect(screen.getByText('Limited history')).toBeInTheDocument();
  });

  it('should render recommendations', () => {
    render(<SellerAnalysisResult result={mockResult} />);
    expect(screen.getByText('Proceed with caution')).toBeInTheDocument();
    expect(screen.getByText('Use escrow')).toBeInTheDocument();
  });

  it('should not render strengths section when empty', () => {
    const resultWithoutStrengths = { ...mockResult, strengths: [] };
    render(<SellerAnalysisResult result={resultWithoutStrengths} />);
    expect(screen.queryByText(/strengths/i)).not.toBeInTheDocument();
  });

  it('should not render concerns section when empty', () => {
    const resultWithoutConcerns = { ...mockResult, concerns: [] };
    render(<SellerAnalysisResult result={resultWithoutConcerns} />);
    expect(screen.queryByText(/concerns/i)).not.toBeInTheDocument();
  });

  it('should render different trust levels correctly', () => {
    const lowTrustResult = { ...mockResult, trustLevel: 'low' as const, trustScore: 20 };
    const { rerender } = render(<SellerAnalysisResult result={lowTrustResult} />);
    expect(screen.getByText(/low trust/i)).toBeInTheDocument();

    const highTrustResult = { ...mockResult, trustLevel: 'high' as const, trustScore: 90 };
    rerender(<SellerAnalysisResult result={highTrustResult} />);
    expect(screen.getByText(/high trust/i)).toBeInTheDocument();
  });
});
