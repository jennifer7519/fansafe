import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ListingAnalysisResult } from '../ListingAnalysisResult';
import type { ListingAnalysisOutput } from '@/lib/ai/schemas';
import '@/lib/i18n/config';

describe('ListingAnalysisResult', () => {
  const mockResult: ListingAnalysisOutput = {
    riskScore: 85,
    detectedPatterns: ['urgent_language', 'prepayment_demand'],
    warnings: ['This is a warning', 'Another warning'],
    recommendations: ['Use escrow', 'Verify seller'],
    reasoning: 'This listing shows multiple red flags typical of scams.',
    priceAnalysis: {
      isPriceNormal: false,
      priceComment: 'Price is suspiciously low',
    },
  };

  it('should render loading state', () => {
    const { container } = render(
      <ListingAnalysisResult result={mockResult} riskLevel="high" isLoading={true} />
    );
    expect(container.querySelector('.loading-spinner')).toBeInTheDocument();
  });

  it('should render risk badge with score', () => {
    render(<ListingAnalysisResult result={mockResult} riskLevel="high" />);
    expect(screen.getByText(/high risk/i)).toBeInTheDocument();
    expect(screen.getByText(/85/)).toBeInTheDocument();
  });

  it('should render detected patterns', () => {
    render(<ListingAnalysisResult result={mockResult} riskLevel="high" />);
    expect(screen.getByText(/urgent language/i)).toBeInTheDocument();
    expect(screen.getByText(/prepayment demand/i)).toBeInTheDocument();
  });

  it('should render warnings', () => {
    render(<ListingAnalysisResult result={mockResult} riskLevel="high" />);
    expect(screen.getByText('This is a warning')).toBeInTheDocument();
    expect(screen.getByText('Another warning')).toBeInTheDocument();
  });

  it('should render recommendations', () => {
    render(<ListingAnalysisResult result={mockResult} riskLevel="high" />);
    expect(screen.getByText('Use escrow')).toBeInTheDocument();
    expect(screen.getByText('Verify seller')).toBeInTheDocument();
  });

  it('should render price analysis when available', () => {
    render(<ListingAnalysisResult result={mockResult} riskLevel="high" />);
    expect(screen.getByText('Price is suspiciously low')).toBeInTheDocument();
  });

  it('should not render price analysis when not provided', () => {
    const resultWithoutPrice = { ...mockResult, priceAnalysis: undefined };
    render(<ListingAnalysisResult result={resultWithoutPrice} riskLevel="high" />);
    expect(screen.queryByText(/price analysis/i)).not.toBeInTheDocument();
  });

  it('should render reasoning in collapsible section', () => {
    render(<ListingAnalysisResult result={mockResult} riskLevel="high" />);
    expect(screen.getByText(/detailed analysis/i)).toBeInTheDocument();
  });

  it('should render translated text when available', () => {
    const resultWithTranslation = {
      ...mockResult,
      translatedText: 'English translation here',
    };
    const { container } = render(
      <ListingAnalysisResult result={resultWithTranslation} riskLevel="high" />
    );
    // Check for translation section in collapse
    const collapses = container.querySelectorAll('.collapse');
    expect(collapses.length).toBeGreaterThan(1);
  });
});
