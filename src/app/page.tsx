'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export default function Home() {
  const { t } = useTranslation();

  const features = [
    {
      icon: '🤖',
      titleKey: 'home.features.ai.title',
      descriptionKey: 'home.features.ai.description',
    },
    {
      icon: '🌍',
      titleKey: 'home.features.multilingual.title',
      descriptionKey: 'home.features.multilingual.description',
    },
    {
      icon: '⚡',
      titleKey: 'home.features.instant.title',
      descriptionKey: 'home.features.instant.description',
    },
    {
      icon: '🔒',
      titleKey: 'home.features.privacy.title',
      descriptionKey: 'home.features.privacy.description',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {t('home.hero.title')}
          </h1>
          <p className="text-xl md:text-2xl text-base-content/80 mb-8">
            {t('home.hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/analyze" className="btn btn-primary btn-lg gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {t('home.hero.cta')}
            </Link>
            <a href="#features" className="btn btn-outline btn-lg">
              {t('home.hero.learnMore')}
            </a>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="stats stats-vertical lg:stats-horizontal shadow-xl bg-base-100 w-full"
        >
          <div className="stat">
            <div className="stat-figure text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="stat-title">{t('home.stats.patterns.title')}</div>
            <div className="stat-value text-primary">9+</div>
            <div className="stat-desc">{t('home.stats.patterns.description')}</div>
          </div>

          <div className="stat">
            <div className="stat-figure text-secondary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                />
              </svg>
            </div>
            <div className="stat-title">{t('home.stats.languages.title')}</div>
            <div className="stat-value text-secondary">3</div>
            <div className="stat-desc">{t('home.stats.languages.description')}</div>
          </div>

          <div className="stat">
            <div className="stat-figure text-accent">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div className="stat-title">{t('home.stats.speed.title')}</div>
            <div className="stat-value text-accent">&lt;5s</div>
            <div className="stat-desc">{t('home.stats.speed.description')}</div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4">{t('home.features.title')}</h2>
          <p className="text-lg text-base-content/70">{t('home.features.subtitle')}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.titleKey}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
            >
              <div className="card-body items-center text-center">
                <div className="text-6xl mb-4">{feature.icon}</div>
                <h3 className="card-title">{t(feature.titleKey)}</h3>
                <p className="text-base-content/70">{t(feature.descriptionKey)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="card bg-gradient-to-br from-primary to-secondary text-primary-content shadow-2xl"
        >
          <div className="card-body items-center text-center py-16">
            <h2 className="card-title text-4xl mb-4">{t('home.cta.title')}</h2>
            <p className="text-xl mb-8 max-w-2xl">{t('home.cta.description')}</p>
            <Link href="/analyze" className="btn btn-neutral btn-lg">
              {t('home.cta.button')}
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
