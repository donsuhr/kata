import { describe, it, expect, vi, afterEach } from 'vitest';
import { debouncePromise } from './utils.js';
describe('utils', () => {
  describe('debouncePromise', () => {
    afterEach(() => {
      vi.useRealTimers();
    });
    it('only calls a debounced function once', () => {
      const spy = vi.fn();
      const debouncedSpy = debouncePromise(spy);
      expect(spy).not.toHaveBeenCalled();
      vi.useFakeTimers();
      /* eslint-disable @typescript-eslint/no-floating-promises */
      debouncedSpy();
      debouncedSpy();
      debouncedSpy();
      debouncedSpy();
      /* eslint-enable @typescript-eslint/no-floating-promises */
      vi.runAllTimers();
      expect(spy).toHaveBeenCalledOnce();
    });
    it('can throw an error', async () => {
      const spy = vi.fn(() => {
        throw Error('fake error');
      });
      const debouncedSpy = debouncePromise(spy);
      expect(spy).not.toHaveBeenCalled();
      /* eslint-disable @typescript-eslint/no-floating-promises */
      debouncedSpy();
      debouncedSpy();
      debouncedSpy();
      await expect(() => debouncedSpy()).rejects.toThrow('fake error');
      /* eslint-enable @typescript-eslint/no-floating-promises */
    });
  });
});