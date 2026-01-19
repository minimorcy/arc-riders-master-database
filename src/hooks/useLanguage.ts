import { useState, useEffect, useCallback } from 'react';
import type { LanguageCode } from '../i18n/translations';
import { getTranslation, LANGUAGES } from '../i18n/translations';

const STORAGE_KEY = 'arc_raiders_language';
const EVENT_KEY = 'language-local-update';

// Get initial language from storage or browser
function getInitialLanguage(): LanguageCode {
    if (typeof window === 'undefined') return 'es'; // SSR default
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && LANGUAGES.some(l => l.code === stored)) {
            return stored as LanguageCode;
        }
        // Browser detection
        const browserLang = navigator.language.split('-')[0];
        if (LANGUAGES.some(l => l.code === browserLang)) {
            return browserLang as LanguageCode;
        }
    } catch (e) {
        console.error("Failed to load language", e);
    }
    return 'es'; // Default fallback
}

export function useLanguage() {
    const [language, setLanguageState] = useState<LanguageCode>(() => {
        // Hydration check to avoid mismatch
        if (typeof window === 'undefined') return 'es';
        return getInitialLanguage();
    });

    // Translation helper
    const t = useCallback((key: string) => {
        return getTranslation(language, key);
    }, [language]);

    // Change language -> Persist -> Dispatch Event
    const setLanguage = useCallback((code: LanguageCode) => {
        setLanguageState(code);
        try {
            localStorage.setItem(STORAGE_KEY, code);
            window.dispatchEvent(new Event(EVENT_KEY));
        } catch (e) {
            console.error("Failed to save language", e);
        }
    }, []);

    // Listen for updates from other components/tabs
    useEffect(() => {
        const handleLocalUpdate = () => {
            setLanguageState(getInitialLanguage());
        };

        const handleStorageUpdate = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY && e.newValue) {
                setLanguageState(e.newValue as LanguageCode);
            }
        };

        window.addEventListener(EVENT_KEY, handleLocalUpdate);
        window.addEventListener('storage', handleStorageUpdate);

        return () => {
            window.removeEventListener(EVENT_KEY, handleLocalUpdate);
            window.removeEventListener('storage', handleStorageUpdate);
        };
    }, []);

    return {
        language,
        setLanguage,
        t,
        LANGUAGES
    };
}
