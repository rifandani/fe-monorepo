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
  const memoizedFnRef = useRef<AnyFunction>(null);
  if (!memoizedFnRef.current) {
    memoizedFnRef.current = (...args: Parameters<T>) => fnRef.current(...args);
  }
  // SAFETY: the wrapper forwards every argument to the latest `fn` and returns
  // its result, so it is call-compatible with `T` while keeping a stable identity.
  return memoizedFnRef.current as T;
};
