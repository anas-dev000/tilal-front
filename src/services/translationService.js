/**
 * Translation Service for Frontend
 * Handles dynamic translation of database content
 * Uses in-memory cache to minimize API calls
 */

import axios from 'axios';

// Translation cache (in-memory)
const translationCache = new Map();
const CACHE_LIMIT = 5000; // Smaller limit for frontend

/**
 * Get localized text from multilingual object
 * @param {Object|String} multiLangObj - Object with {ar, en, bn} or plain string
 * @param {String} language - Target language (ar, en, bn)
 * @returns {String} Localized text
 */
export const getLocalizedText = (multiLangObj, language = 'en') => {
  if (!multiLangObj) return '';
  
  // If it's already a string, return it
  if (typeof multiLangObj === 'string') return multiLangObj;
  
  // If it's an object with language keys
  if (typeof multiLangObj === 'object') {
    // Try to get the requested language
    if (multiLangObj[language]) return multiLangObj[language];
    
    // Fallback to English, then Arabic, then any available
    return multiLangObj.en || multiLangObj.ar || multiLangObj.bn || 
           Object.values(multiLangObj)[0] || '';
  }
  
  return '';
};

/**
 * Translate text using MyMemory API (free tier)
 * @param {String} text - Text to translate
 * @param {String} targetLang - Target language (ar, en, bn)
 * @param {String} sourceLang - Source language (default: 'en')
 * @returns {Promise<String>} Translated text
 */
export const translateText = async (text, targetLang, sourceLang = 'en') => {
  if (!text || !targetLang) return text;
  
  // If source and target are the same, return original
  if (sourceLang === targetLang) return text;
  
  // Check cache first
  const cacheKey = `${sourceLang}:${targetLang}:${text}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }
  
  try {
    // Use MyMemory Translation API (free tier)
    const response = await axios.get('https://api.mymemory.translated.net/get', {
      params: {
        q: text,
        langpair: `${sourceLang}|${targetLang}`
      }
    });
    
    if (response.data && response.data.responseData) {
      const translatedText = response.data.responseData.translatedText;
      
      // Cache the translation
      if (translationCache.size >= CACHE_LIMIT) {
        // Remove oldest 20% of entries
        const entriesToRemove = Math.floor(CACHE_LIMIT * 0.2);
        const keys = Array.from(translationCache.keys());
        for (let i = 0; i < entriesToRemove; i++) {
          translationCache.delete(keys[i]);
        }
      }
      
      translationCache.set(cacheKey, translatedText);
      return translatedText;
    }
    
    return text; // Return original if translation fails
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original text on error
  }
};

/**
 * Translate multilingual object to target language
 * @param {Object} multiLangObj - Object with {ar, en, bn}
 * @param {String} targetLang - Target language
 * @returns {Promise<String>} Translated text
 */
export const translateMultiLangObject = async (multiLangObj, targetLang) => {
  // First try to get the text in target language
  const directText = getLocalizedText(multiLangObj, targetLang);
  if (directText) return directText;
  
  // If not available, translate from English
  const englishText = getLocalizedText(multiLangObj, 'en');
  if (englishText && targetLang !== 'en') {
    return await translateText(englishText, targetLang, 'en');
  }
  
  return englishText || '';
};

/**
 * Translate array of texts
 * @param {Array<String>} texts - Array of texts to translate
 * @param {String} targetLang - Target language
 * @param {String} sourceLang - Source language
 * @returns {Promise<Array<String>>} Array of translated texts
 */
export const translateBatch = async (texts, targetLang, sourceLang = 'en') => {
  const promises = texts.map(text => translateText(text, targetLang, sourceLang));
  return await Promise.all(promises);
};

/**
 * Create multilingual object
 * @param {String} ar - Arabic text
 * @param {String} en - English text
 * @param {String} bn - Bengali text
 * @returns {Object} Multilingual object
 */
export const createMultiLangObject = (ar = '', en = '', bn = '') => ({
  ar,
  en,
  bn
});

/**
 * Auto-translate to all languages from source
 * @param {String} sourceText - Source text
 * @param {String} sourceLang - Source language
 * @returns {Promise<Object>} Multilingual object with all translations
 */
export const autoTranslateToAll = async (sourceText, sourceLang = 'en') => {
  const result = {
    ar: '',
    en: '',
    bn: ''
  };
  
  // Set source language text
  result[sourceLang] = sourceText;
  
  // Translate to other languages
  const targetLangs = ['ar', 'en', 'bn'].filter(lang => lang !== sourceLang);
  
  for (const targetLang of targetLangs) {
    result[targetLang] = await translateText(sourceText, targetLang, sourceLang);
    // Add small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return result;
};

/**
 * Clear translation cache
 */
export const clearTranslationCache = () => {
  translationCache.clear();
};

/**
 * Get cache size
 */
export const getCacheSize = () => {
  return translationCache.size;
};

/**
 * React Hook for using translations
 */
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const useLocalizedText = (multiLangObj) => {
  const { i18n } = useTranslation();
  const [text, setText] = useState('');
  
  useEffect(() => {
    const currentLang = i18n.language || 'en';
    const localizedText = getLocalizedText(multiLangObj, currentLang);
    setText(localizedText);
  }, [multiLangObj, i18n.language]);
  
  return text;
};

/**
 * React Hook for dynamic translation
 */
export const useDynamicTranslation = (sourceText, sourceLang = 'en') => {
  const { i18n } = useTranslation();
  const [translatedText, setTranslatedText] = useState(sourceText);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const currentLang = i18n.language || 'en';
    
    if (currentLang === sourceLang) {
      setTranslatedText(sourceText);
      return;
    }
    
    setLoading(true);
    translateText(sourceText, currentLang, sourceLang)
      .then(translated => {
        setTranslatedText(translated);
        setLoading(false);
      })
      .catch(() => {
        setTranslatedText(sourceText);
        setLoading(false);
      });
  }, [sourceText, sourceLang, i18n.language]);
  
  return { text: translatedText, loading };
};

export default {
  getLocalizedText,
  translateText,
  translateMultiLangObject,
  translateBatch,
  createMultiLangObject,
  autoTranslateToAll,
  clearTranslationCache,
  getCacheSize,
  useLocalizedText,
  useDynamicTranslation
};

