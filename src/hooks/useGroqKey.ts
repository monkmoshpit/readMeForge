import { useState, useCallback } from 'react';

const STORAGE_KEY = 'forge_groq_api_key';

export function useGroqKey() {
  const [apiKey, setApiKey] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY);
  });

  const saveKey = useCallback((key: string) => {
    const trimmed = key.trim();
    if (trimmed) {
      localStorage.setItem(STORAGE_KEY, trimmed);
      setApiKey(trimmed);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      setApiKey(null);
    }
  }, []);

  const clearKey = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setApiKey(null);
  }, []);

  return {
    apiKey,
    saveKey,
    clearKey,
    hasKey: !!apiKey,
  };
}
