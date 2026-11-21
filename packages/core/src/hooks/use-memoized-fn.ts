/* oxlint-disable react/react-compiler react/refs react-doctor/react-compiler-no-manual-memoization */
import { useMemo, useRef } from "react";

// oxlint-disable-next-line typescript/no-explicit-any
type AnyFunction = (...args: any[]) => any;

export const useMemoizedFn = <T extends AnyFunction>(fn: T) => {
  const fnRef = useRef<T>(fn);
  fnRef.current = useMemo(() => fn, [fn]);
  const memoizedFnRef = useRef<T>(null);

  // oxlint-disable-next-line typescript/prefer-nullish-coalescing
  if (memoizedFnRef.current === null) {
    const forward = (...args: Parameters<T>): ReturnType<T> =>
      // oxlint-disable-next-line typescript/no-unsafe-return
      fnRef.current(...args);

    // SAFETY: forward takes the parameters of T and returns the result of the latest T.
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    memoizedFnRef.current = forward as T;
  }

  return memoizedFnRef.current;
};
