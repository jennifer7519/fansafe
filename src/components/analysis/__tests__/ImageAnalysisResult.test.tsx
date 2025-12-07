import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ImageAnalysisResult } from '../ImageAnalysisResult';
import type { ImageAnalysisOutput } from '@/lib/ai/schemas';
import '@/lib/i18n/config';

describe('ImageAnalysisResult', () => {
  const mockResult: ImageAnalysisOutput = {
    isAuthentic: false,
    confidence: 75,
    detectedIssues: ['poor_quality', 'stock_photo'],
    observations: ['Image quality is poor', 'Appears to be a stock photo'],
    recommendations: ['Request additional photos', 'Ask for verification'],
    reasoning: 'The images show several red flags indicating potential fraud.',
  };

  it('should render loading state', () => {
    const { container } = render(<ImageAnalysisResult result={mockResult} isLoading={true} />);
    expect(container.querySelector('.loading-spinner')).toBeInTheDocument();
  });

  it('should render authenticity badge for suspicious images', () => {
    render(<ImageAnalysisResult result={mockResult} />);
    expect(screen.getByText(/suspicious/i)).toBeInTheDocument();
  });

  it('should render authenticity badge for authentic images', () => {
    const authenticResult = { ...mockResult, isAuthentic: true };
    render(<ImageAnalysisResult result={authenticResult} />);
    expect(screen.getByText(/authentic/i)).toBeInTheDocument();
  });

  it('should display confidence score', () => {
    render(<ImageAnalysisResult result={mockResult} />);
    expect(screen.getAllByText(/75/)[0]).toBeInTheDocument();
  });

  it('should render confidence progress bar', () => {
    const { container } = render(<ImageAnalysisResult result={mockResult} />);
    const progress = container.querySelector('progress');
    expect(progress).toBeInTheDocument();
    expect(progress?.getAttribute('value')).toBe('75');
  });

  it('should render detected issues', () => {
    const { container } = render(<ImageAnalysisResult result={mockResult} />);
    const badges = container.querySelectorAll('.badge-outline');
    expect(badges.length).toBeGreaterThan(0);
    expect(screen.getByText(/detected issues/i)).toBeInTheDocument();
  });

  it('should render observations', () => {
    render(<ImageAnalysisResult result={mockResult} />);
    expect(screen.getByText('Image quality is poor')).toBeInTheDocument();
    expect(screen.getByText('Appears to be a stock photo')).toBeInTheDocument();
  });

  it('should render recommendations', () => {
    render(<ImageAnalysisResult result={mockResult} />);
    expect(screen.getByText('Request additional photos')).toBeInTheDocument();
    expect(screen.getByText('Ask for verification')).toBeInTheDocument();
  });

  it('should not render detected issues section when empty', () => {
    const resultWithoutIssues = { ...mockResult, detectedIssues: [] };
    render(<ImageAnalysisResult result={resultWithoutIssues} />);
    expect(screen.queryByText(/detected issues/i)).not.toBeInTheDocument();
  });

  it('should not render recommendations when empty', () => {
    const resultWithoutRecs = { ...mockResult, recommendations: [] };
    render(<ImageAnalysisResult result={resultWithoutRecs} />);
    expect(screen.queryByText(/recommendations/i)).not.toBeInTheDocument();
  });
});
