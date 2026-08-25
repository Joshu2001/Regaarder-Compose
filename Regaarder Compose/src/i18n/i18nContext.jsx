import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

// Import local catalogs
import en from './locales/en.json';
import zhTW from './locales/zh-TW.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import fr from './locales/fr.json';
import es from './locales/es.json';
import vi from './locales/vi.json';
import id from './locales/id.json';
import ar from './locales/ar.json';

export const LOCALES_CATALOG = {
  en,
  'zh-TW': zhTW,
  ja,
  ko,
  fr,
  es,
  vi,
  id,
  ar
};

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr', locale: 'en-US' },
  { code: 'zh-TW', name: 'Traditional Chinese', nativeName: '繁體中文', dir: 'ltr', locale: 'zh-TW' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', dir: 'ltr', locale: 'ja-JP' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', dir: 'ltr', locale: 'ko-KR' },
  { code: 'fr', name: 'French', nativeName: 'Français', dir: 'ltr', locale: 'fr-FR' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', dir: 'ltr', locale: 'es-ES' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', dir: 'ltr', locale: 'vi-VN' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', dir: 'ltr', locale: 'id-ID' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl', locale: 'ar-SA' }
];

export const AI_LANGUAGES = [
  { code: 'auto', name: 'Auto (Match Prompt Language)', nativeName: 'Auto / 智慧比對' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'zh-TW', name: 'Traditional Chinese', nativeName: '繁體中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' }
];

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [uiLanguage, setUiLanguageState] = useState(() => {
    try {
      return localStorage.getItem('rc.uiLanguage') || 'en';
    } catch {
      return 'en';
    }
  });

  const [aiLanguage, setAiLanguageState] = useState(() => {
    try {
      return localStorage.getItem('rc.aiLanguage') || 'auto';
    } catch {
      return 'auto';
    }
  });

  const [regionalLocale, setRegionalLocaleState] = useState(() => {
    try {
      return localStorage.getItem('rc.regionalLocale') || 'en-US';
    } catch {
      return 'en-US';
    }
  });

  const currentLangConfig = useMemo(() => {
    return SUPPORTED_LANGUAGES.find(l => l.code === uiLanguage) || SUPPORTED_LANGUAGES[0];
  }, [uiLanguage]);

  const dir = currentLangConfig.dir || 'ltr';

  const setUiLanguage = useCallback((code) => {
    if (!LOCALES_CATALOG[code]) return;
    setUiLanguageState(code);
    try {
      localStorage.setItem('rc.uiLanguage', code);
    } catch {}
  }, []);

  const setAiLanguage = useCallback((code) => {
    setAiLanguageState(code);
    try {
      localStorage.setItem('rc.aiLanguage', code);
    } catch {}
  }, []);

  const setRegionalLocale = useCallback((locale) => {
    setRegionalLocaleState(locale);
    try {
      localStorage.setItem('rc.regionalLocale', locale);
    } catch {}
  }, []);

  // Update HTML document dir and lang attribute
  useEffect(() => {
    document.documentElement.lang = uiLanguage;
    document.documentElement.dir = dir;
    if (dir === 'rtl') {
      document.documentElement.classList.add('rtl-layout');
    } else {
      document.documentElement.classList.remove('rtl-layout');
    }
  }, [uiLanguage, dir]);

  /**
   * Translate key with fallback and param interpolation
   */
  const t = useCallback((key, params = {}) => {
    if (!key || typeof key !== 'string') return '';
    const parts = key.split('.');

    // Lookup in active language catalog
    let val = LOCALES_CATALOG[uiLanguage];
    for (const p of parts) {
      if (val && typeof val === 'object' && p in val) {
        val = val[p];
      } else {
        val = null;
        break;
      }
    }

    // Fallback to English catalog
    if (val === null || val === undefined) {
      let fallback = LOCALES_CATALOG.en;
      for (const p of parts) {
        if (fallback && typeof fallback === 'object' && p in fallback) {
          fallback = fallback[p];
        } else {
          fallback = null;
          break;
        }
      }
      val = fallback;
    }

    if (val === null || val === undefined) {
      return key; // return the key itself if missing
    }

    if (typeof val !== 'string') return String(val);

    // Param interpolation: {{varName}}
    let interpolated = val;
    Object.keys(params).forEach(k => {
      interpolated = interpolated.replace(new RegExp(`{{\\s*${k}\\s*}}`, 'g'), String(params[k]));
    });

    return interpolated;
  }, [uiLanguage]);

  // Formatter functions
  const formatDate = useCallback((date, options = {}) => {
    try {
      const d = date instanceof Date ? date : new Date(date);
      return new Intl.DateTimeFormat(regionalLocale || currentLangConfig.locale, options).format(d);
    } catch {
      return String(date);
    }
  }, [regionalLocale, currentLangConfig]);

  const formatNumber = useCallback((num, options = {}) => {
    try {
      return new Intl.NumberFormat(regionalLocale || currentLangConfig.locale, options).format(num);
    } catch {
      return String(num);
    }
  }, [regionalLocale, currentLangConfig]);

  const formatCurrency = useCallback((amount, currency = 'USD') => {
    try {
      return new Intl.NumberFormat(regionalLocale || currentLangConfig.locale, {
        style: 'currency',
        currency
      }).format(amount);
    } catch {
      return `${currency} ${amount}`;
    }
  }, [regionalLocale, currentLangConfig]);

  const value = useMemo(() => ({
    uiLanguage,
    setUiLanguage,
    aiLanguage,
    setAiLanguage,
    regionalLocale,
    setRegionalLocale,
    dir,
    isRtl: dir === 'rtl',
    currentLangConfig,
    supportedLanguages: SUPPORTED_LANGUAGES,
    aiLanguages: AI_LANGUAGES,
    t,
    formatDate,
    formatNumber,
    formatCurrency
  }), [uiLanguage, setUiLanguage, aiLanguage, setAiLanguage, regionalLocale, setRegionalLocale, dir, currentLangConfig, t, formatDate, formatNumber, formatCurrency]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Fallback if rendered outside provider
    return {
      t: (k, p = {}) => {
        let text = k.split('.').pop() || k;
        Object.keys(p).forEach(param => {
          text = text.replace(new RegExp(`{{\\s*${param}\\s*}}`, 'g'), String(p[param]));
        });
        return text;
      },
      uiLanguage: 'en',
      setUiLanguage: () => {},
      aiLanguage: 'auto',
      setAiLanguage: () => {},
      dir: 'ltr',
      isRtl: false,
      supportedLanguages: SUPPORTED_LANGUAGES,
      aiLanguages: AI_LANGUAGES
    };
  }
  return ctx;
}

export function useLocaleFormatter() {
  const ctx = useContext(I18nContext);
  return {
    formatDate: ctx?.formatDate || ((d) => String(d)),
    formatNumber: ctx?.formatNumber || ((n) => String(n)),
    formatCurrency: ctx?.formatCurrency || ((a, c = 'USD') => `${c} ${a}`)
  };
}

export default I18nContext;
