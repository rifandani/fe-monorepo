import { useRef } from "react";

interface RefObject<T> {
  current: T;
}

interface RefIterator<T> {
  next: () => { done: boolean; value: RefObject<T> };
  [Symbol.iterator]: () => RefIterator<T>;
}

export const useMultipleRefs = <T>(initialValue: T) => {
  const cache = useRef<RefObject<T>[]>([]);
  const callIndex = useRef(0);

  const iterator: RefIterator<T> = {
    next: () => {
      const index = callIndex.current;
      const ref = cache.current[index] ?? { current: initialValue };
      cache.current[index] = ref;
      callIndex.current = index + 1;

      return {
        done: false,
        value: ref,
      };
    },
    [Symbol.iterator]: () => {
      callIndex.current = 0;

      return iterator;
    },
  };

  return iterator;
};
