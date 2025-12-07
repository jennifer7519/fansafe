import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from '@/locales/en/common.json';
import koCommon from '@/locales/ko/common.json';
import jaCommon from '@/locales/ja/common.json';

export const defaultNS = 'common';
export const resources = {
  en: {
    common: enCommon,
  },
  ko: {
    common: koCommon,
  },
  ja: {
    common: jaCommon,
  },
} as const;

i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  defaultNS,
  ns: ['common'],
  resources,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
