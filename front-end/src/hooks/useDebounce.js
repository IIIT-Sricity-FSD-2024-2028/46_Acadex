import { useState, useEffect } from 'react';

/**
 * useDebounce Hook
 * Debounces a fast-changing value (such as live search inputs)
 * by delaying update until after the specified delay has elapsed without new changes.
 *
 * @param {*} value - The input value to debounce
 * @param {number} delay - Delay in milliseconds (default: 300ms)
 * @returns {*} The debounced value
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
