import { i18n } from "@lingui/core";
import { Platform } from "react-native";

// Loader map for compiled Lingui catalogs
const localeLoaders: Record<string, () => Promise<any>> = {
  en: () => import("./locales/en/messages"),
  // Add other supported locales here as you add them
  es: () => import("./locales/es/messages"),
};

/**
 * Load messages for requested locale and activate it.
 * This function isn't part of the LinguiJS library because there are
 * many ways how to load messages — from REST API, from file, from cache, etc.
 */
export async function activateLocale(locale: string = 'en') {
  try {
    const loader = localeLoaders[locale] || localeLoaders['en'];
    const mod = await loader();
    // Handle different export shapes from Lingui compile:
    // - CJS: module.exports = { messages }
    // - ESM default: export default { messages }
    // - Direct export: export const messages = { ... }
    const catalog =
      (mod && mod.messages) ??
      (mod && mod.default && mod.default.messages) ??
      (mod && mod.default) ??
      mod;
    i18n.load(locale, catalog);
    i18n.activate(locale);
  } catch (error) {
    console.error(`Failed to load locale: ${locale}`, error);
    // Fallback to English if the requested locale fails to load
    if (locale !== 'en') {
      await activateLocale('en');
    }
  }
}

/**
 * Resolve the initial locale using the following precedence:
 * 1) Web: window.localStorage 'locale'
 * 2) Browser language (navigator.language)
 * 3) Native: expo-localization language code
 * 4) Fallback: 'en'
 */
function resolveInitialLocale(): string {
  // Web persisted
  if (typeof window !== 'undefined' && 'localStorage' in window) {
    try {
      const saved = window.localStorage.getItem('locale');
      if (saved && (saved === 'en' || saved === 'es')) return saved;
    } catch {}
  }

  // Browser language
  if (typeof navigator !== 'undefined' && (navigator as any).language) {
    const lang = (navigator as any).language as string;
    const lc = lang.toLowerCase();
    if (lc.startsWith('es')) return 'es';
    if (lc.startsWith('en')) return 'en';
  }

  // Native OS language via expo-localization
  if (Platform.OS !== 'web') {
    try {
      // dynamic import to avoid web bundling issues
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Localization = require('expo-localization');
      const locales = Localization?.getLocales?.() ?? [];
      const code: string | undefined = locales[0]?.languageCode || Localization?.locale;
      if (code) {
        const lc = String(code).toLowerCase();
        if (lc.startsWith('es')) return 'es';
        if (lc.startsWith('en')) return 'en';
      }
    } catch {}
  }

  return 'en';
}

// Initialize with detected locale
activateLocale(resolveInitialLocale());

export { i18n };
