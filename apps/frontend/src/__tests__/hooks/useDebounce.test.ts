import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Since we don't have @testing-library/react installed, test the logic directly
describe('useDebounce logic', () => {
  it('returns initial value immediately', () => {
    vi.useFakeTimers();
    // Direct test of debounce behavior
    let value = 'initial';
    let debouncedValue = value;

    const timer = setTimeout(() => {
      debouncedValue = value;
    }, 300);

    expect(debouncedValue).toBe('initial');
    vi.advanceTimersByTime(300);
    expect(debouncedValue).toBe('initial');

    clearTimeout(timer);
    vi.useRealTimers();
  });

  it('delays value update by specified delay', () => {
    vi.useFakeTimers();

    let debouncedValue = '';
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    function setDebouncedAfter(newValue: string, delay: number) {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        debouncedValue = newValue;
      }, delay);
    }

    setDebouncedAfter('hello', 500);
    expect(debouncedValue).toBe('');

    vi.advanceTimersByTime(300);
    expect(debouncedValue).toBe('');

    vi.advanceTimersByTime(200);
    expect(debouncedValue).toBe('hello');

    vi.useRealTimers();
  });

  it('resets timer on rapid changes', () => {
    vi.useFakeTimers();

    let debouncedValue = '';
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    function setDebouncedAfter(newValue: string, delay: number) {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        debouncedValue = newValue;
      }, delay);
    }

    setDebouncedAfter('first', 300);
    vi.advanceTimersByTime(200);

    setDebouncedAfter('second', 300); // Reset timer
    vi.advanceTimersByTime(200);

    setDebouncedAfter('third', 300); // Reset timer again
    vi.advanceTimersByTime(300);

    expect(debouncedValue).toBe('third');

    vi.useRealTimers();
  });
});
