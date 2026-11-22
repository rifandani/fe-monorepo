import { useMemoizedFn } from "@workspace/core/hooks/use-memoized-fn";
import {
  pushValue,
  travelBackward,
  travelForward,
} from "@workspace/core/utils/history-travel";
import type { History } from "@workspace/core/utils/history-travel";
import { useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

const createHistoryActions = <V>(
  history: History<V>,
  setHistory: Dispatch<SetStateAction<History<V>>>,
  maxLength: number
) => ({
  go: (step: number) => {
    const [source, travel] =
      step > 0
        ? ([history.future, travelForward] as const)
        : ([history.past, travelBackward] as const);

    if (step === 0 || source.length === 0) {
      return;
    }

    setHistory(travel(history, step));
  },
  updateValue: (val: V) => {
    setHistory(pushValue(history, val, maxLength));
  },
});

const useHistoryTravel = <T>(initialValue?: T, maxLength = 0) => {
  const [history, setHistory] = useState<History<T | undefined>>({
    future: [],
    past: [],
    present: initialValue,
  });

  const { present, past, future } = history;
  const initialValueRef = useRef(initialValue);

  const { go, updateValue } = createHistoryActions(
    history,
    setHistory,
    maxLength
  );

  const reset = (...params: [] | [initial: T | undefined]) => {
    const [_initial] = params.length > 0 ? params : [initialValueRef.current];
    initialValueRef.current = _initial;
    setHistory({
      future: [],
      past: [],
      present: _initial,
    });
  };

  return {
    back: useMemoizedFn(() => {
      go(-1);
    }),
    backLength: past.length,
    forward: useMemoizedFn(() => {
      go(1);
    }),
    forwardLength: future.length,
    go: useMemoizedFn(go),
    reset: useMemoizedFn(reset),
    setValue: useMemoizedFn(updateValue),
    value: present,
  };
};

export default useHistoryTravel;
