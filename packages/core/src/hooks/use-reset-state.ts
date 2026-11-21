import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";

type ResetState = () => void;

export const useResetState = <S>(
  initialState: S | (() => S)
): [S, Dispatch<SetStateAction<S>>, ResetState] => {
  const [state, setState] = useState(initialState);

  const resetState = () => {
    setState(initialState);
  };

  return [state, setState, resetState];
};
