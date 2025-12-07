'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import type { ListingAnalysisOutput } from '@/lib/ai/schemas';
import { ListingAnalysisResult } from '@/components/analysis';

interface AnalysisFormData {
  url: string;
  text: string;
  price?: number;
  itemName?: string;
}

export function ListingAnalysisForm() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<AnalysisFormData>({
    url: '',
    text: '',
    price: undefined,
    itemName: '',
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    data: ListingAnalysisOutput;
    riskLevel: 'low' | 'medium' | 'high';
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/analyze/listing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      setResult({
        data: data.data,
        riskLevel: data.data.riskLevel,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setFormData({
      url: '',
      text: '',
      price: undefined,
      itemName: '',
    });
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-8">
      {/* Form */}
      {!result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="card bg-base-100 shadow-xl"
        >
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">{t('analyze.form.title')}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* URL Input */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    {t('analyze.form.url.label')}
                  </span>
                  <span className="label-text-alt text-error">*</span>
                </label>
                <input
                  type="url"
                  placeholder={t('analyze.form.url.placeholder')}
                  className="input input-bordered w-full"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  required
                />
                <label className="label">
                  <span className="label-text-alt">{t('analyze.form.url.hint')}</span>
                </label>
              </div>

              {/* Text Input */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    {t('analyze.form.text.label')}
                  </span>
                  <span className="label-text-alt text-error">*</span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-32"
                  placeholder={t('analyze.form.text.placeholder')}
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  required
                  maxLength={10000}
                />
                <label className="label">
                  <span className="label-text-alt">{formData.text.length} / 10,000</span>
                </label>
              </div>

              {/* Optional Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Price Input */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">
                      {t('analyze.form.price.label')}
                    </span>
                    <span className="label-text-alt">{t('analyze.form.optional')}</span>
                  </label>
                  <input
                    type="number"
                    placeholder={t('analyze.form.price.placeholder')}
                    className="input input-bordered w-full"
                    value={formData.price || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    min={0}
                  />
                </div>

                {/* Item Name Input */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">
                      {t('analyze.form.itemName.label')}
                    </span>
                    <span className="label-text-alt">{t('analyze.form.optional')}</span>
                  </label>
                  <input
                    type="text"
                    placeholder={t('analyze.form.itemName.placeholder')}
                    className="input input-bordered w-full"
                    value={formData.itemName || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, itemName: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="alert alert-error">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 shrink-0 stroke-current"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="card-actions justify-end">
                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  disabled={isAnalyzing}
                >
                  {isAnalyzing && <span className="loading loading-spinner"></span>}
                  {isAnalyzing ? t('analyze.form.analyzing') : t('analyze.form.submit')}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}

      {/* Result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          <ListingAnalysisResult result={result.data} riskLevel={result.riskLevel} />

          <div className="flex gap-4 justify-center">
            <button onClick={handleReset} className="btn btn-outline">
              {t('analyze.form.newAnalysis')}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
