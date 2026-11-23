/* oxlint-disable react/refs -- the hook keeps the latest function in a ref, so the returned function stays stable */
import { useMemo, useRef } from "react";

// oxlint-disable-next-line typescript/no-explicit-any -- the hook accepts a function of any signature
type AnyFunction = (...args: any[]) => any;

export const useMemoizedFn = <T extends AnyFunction>(fn: T) => {
  const fnRef = useRef<T>(fn);
  fnRef.current = useMemo(() => fn, [fn]);

  const memoizedFnRef = useRef<
    ((...args: Parameters<T>) => ReturnType<T>) | null
  >(null);

  // oxlint-disable-next-line typescript/prefer-nullish-coalescing -- the function is created once, and an explicit null check shows that
  if (memoizedFnRef.current === null) {
    memoizedFnRef.current = (...args: Parameters<T>): ReturnType<T> =>
      // oxlint-disable-next-line typescript/no-unsafe-return -- the result is ReturnType<T> of the caller's function
      fnRef.current(...args);
  }

  return memoizedFnRef.current;
};
