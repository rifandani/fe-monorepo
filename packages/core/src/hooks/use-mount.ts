import { isFunction } from "radashi";
import { useEffect } from "react";

/**
 * A hook that executes a function after the component is mounted.
 */
export const useMount = (fn: () => void) => {
  if (!isFunction(fn)) {
    console.error(
      `useMount: parameter \`fn\` expected to be a function, but got "${typeof fn}".`
    );
  }

  useEffect(() => {
    if (!isFunction(fn)) {
      return;
    }
    fn();
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
