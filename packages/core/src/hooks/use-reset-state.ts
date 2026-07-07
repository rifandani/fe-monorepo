/* oxlint-disable eslint/func-style */
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";

type ResetState = () => void;

/**
 * `useResetState` works similar to `React.useState`, it provides a `reset` method
 */
export function useResetState<S>(
  initialState: S | (() => S)
): [S, Dispatch<SetStateAction<S>>, ResetState] {
  const [state, setState] = useState(initialState);
  const resetState = () => {
    setState(initialState);
  };
  return [state, setState, resetState];
}
