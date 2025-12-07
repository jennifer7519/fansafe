'use client';

import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ListingAnalysisForm } from '@/components/forms/ListingAnalysisForm';

export default function AnalyzePage() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        {/* Page Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t('analyze.title')}
          </h1>
          <p className="text-lg text-base-content/70">
            {t('analyze.subtitle')}
          </p>
        </div>

        {/* How It Works */}
        <div className="alert alert-info mb-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="h-6 w-6 shrink-0 stroke-current"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <div>
            <h3 className="font-bold">{t('analyze.howItWorks.title')}</h3>
            <div className="text-sm">
              {t('analyze.howItWorks.description')}
            </div>
          </div>
        </div>

        {/* Form */}
        <ListingAnalysisForm />

        {/* Disclaimer */}
        <div className="mt-8 text-center text-sm text-base-content/60">
          <p>{t('analyze.disclaimer')}</p>
        </div>
      </motion.div>
    </div>
  );
}
