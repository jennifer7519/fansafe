'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Header() {
  const { t } = useTranslation();

  return (
    <header className="navbar bg-base-100 shadow-md sticky top-0 z-50">
      <div className="container mx-auto">
        <div className="flex-1">
          <Link href="/" className="btn btn-ghost text-xl font-bold">
            <span className="text-primary">Fan</span>
            <span className="text-secondary">Safe</span>
          </Link>
        </div>
        <div className="flex-none gap-2">
          <nav className="hidden md:flex gap-2">
            <Link href="/" className="btn btn-ghost btn-sm">
              {t('nav.home')}
            </Link>
            <Link href="/analyze" className="btn btn-ghost btn-sm">
              {t('nav.analyze')}
            </Link>
          </nav>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
