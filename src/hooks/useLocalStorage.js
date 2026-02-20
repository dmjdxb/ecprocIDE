import { useState, useEffect, useRef } from 'react';

const STORAGE_KEY = 'ecproc-ide-state';

export function useLocalStorage(defaultMetadata, defaultSteps) {
  const [metadata, setMetadata] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.metadata && typeof parsed.metadata === 'object') {
          return { ...defaultMetadata, ...parsed.metadata };
        }
      }
    } catch {
      // Corrupted data — fall through to default
    }
    return defaultMetadata;
  });

  const [steps, setSteps] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.steps) && parsed.steps.length > 0) {
          return parsed.steps;
        }
      }
    } catch {
      // Corrupted data — fall through to default
    }
    return defaultSteps;
  });

  const timerRef = useRef(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ metadata, steps }));
      } catch {
        // Storage full or unavailable — silently ignore
      }
    }, 500);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [metadata, steps]);

  return [metadata, setMetadata, steps, setSteps];
}
