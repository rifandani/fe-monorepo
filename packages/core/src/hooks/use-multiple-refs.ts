/* oxlint-disable eslint/func-style -- function declarations */
import { useRef } from "react";

interface RefObject<T> {
  current: T;
}

/**
 * Hook that creates an iterable collection of refs with the same initial value.
 * Useful when you need multiple refs with the same initialization, like in a list of elements.
 *
 * @template T Type of the ref value
 * @param initialValue Initial value for all created refs
 * @returns An iterable object that creates new refs on each iteration
 *
 * @example
 * ```tsx
 * const refs = useMultipleRefs<HTMLDivElement>(null)
 *
 * // Use in array mapping
 * {items.map((item, i) => {
 *   const [ref] = [...refs]
 *   return <div key={i} ref={ref}>{item}</div>
 * })}
 *
 * // Use in for...of loop
 * for (const ref of refs) {
 *   // Each ref is a new React ref with the initial value
 * }
 * ```
 */
export function useMultipleRefs<T>(initialValue: T) {
  const cache = useRef<RefObject<T>[]>([]);
  const callIndex = useRef(0);

  return {
    next() {
      const index = callIndex.current;
      if (!cache.current[index]) {
        cache.current[index] = { current: initialValue };
      }
      const value = cache.current[index];
      callIndex.current = index + 1;
      return {
        done: false,
        value,
      };
    },
    [Symbol.iterator]() {
      callIndex.current = 0;
      return this;
    },
  };
}
