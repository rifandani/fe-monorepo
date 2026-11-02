/* oxlint-disable react/react-compiler react/refs react-doctor/react-compiler-no-manual-memoization */
import { useMemo, useRef } from "react";

// oxlint-disable-next-line typescript/no-explicit-any
type AnyFunction = (...args: any[]) => any;

/**
 * Hooks for persistent functions.
 * In general, `useMemoizedFn` can be used instead of useCallback.
 *
 * In some scenarios, we need to use `useCallback` to cache a function,
 * but when the second parameter deps changes, the function will be regenerated,
 * causing the function reference to change.
 *
 * Using `useMemoizedFn`, you can omit the second parameter deps,
 * and ensure that the function reference never change.
 */
export const useMemoizedFn = <T extends AnyFunction>(fn: T) => {
  const fnRef = useRef<T>(fn);
  // why not write `fnRef.current = fn`?
  // https://github.com/alibaba/hooks/issues/728
  fnRef.current = useMemo(() => fn, [fn]);
  const memoizedFnRef = useRef<T>(null);

  // The React Compiler does not support `??=`, so this stays an `if`.
  // oxlint-disable-next-line typescript/prefer-nullish-coalescing
  if (memoizedFnRef.current === null) {
    const forward = (...args: Parameters<T>): ReturnType<T> =>
      // `AnyFunction` returns `any`, so the call result is `any` too.
      // oxlint-disable-next-line typescript/no-unsafe-return
      fnRef.current(...args);

    // SAFETY: the wrapper forwards every argument to the latest `fn` and returns
    // its result, so it is call-compatible with `T` while keeping a stable identity.
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    memoizedFnRef.current = forward as T;
  }

  return memoizedFnRef.current;
};
