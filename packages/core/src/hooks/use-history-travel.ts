import { useMemoizedFn } from "@workspace/core/hooks/use-memoized-fn";
import { isNumber } from "radashi";
import { useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

interface IData<T> {
  present?: T;
  past: T[];
  future: T[];
}

const dumpIndex = (step: number, length: number) => {
  let index = step > 0 ? step - 1 : length + step;

  if (index >= length - 1) {
    index = length - 1;
  }

  if (index < 0) {
    index = 0;
  }

  return index;
};

const split = <T>(step: number, targetArr: T[]) => {
  const index = dumpIndex(step, targetArr.length);

  return {
    _after: targetArr.slice(index + 1),
    _before: targetArr.slice(0, index),
    _current: targetArr[index],
  };
};

const pushValue = <T>(
  history: IData<T>,
  val: T,
  maxLength: number
): IData<T> => {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  const _past = [...history.past, history.present as T];
  const maxLengthNum = isNumber(maxLength) ? maxLength : Number(maxLength);

  if (maxLengthNum > 0 && _past.length > maxLengthNum) {
    _past.splice(0, 1);
  }

  return {
    future: [],
    past: _past,
    present: val,
  };
};

const travelForward = <T>(history: IData<T>, step: number): IData<T> => {
  const { _before, _current, _after } = split(step, history.future);

  return {
    future: _after,
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    past: [...history.past, history.present as T, ..._before],
    present: _current,
  };
};

const travelBackward = <T>(history: IData<T>, step: number): IData<T> => {
  const { _before, _current, _after } = split(step, history.past);

  return {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    future: [..._after, history.present as T, ...history.future],
    past: _before,
    present: _current,
  };
};

const createHistoryActions = <T>(
  history: IData<T | undefined>,
  setHistory: Dispatch<SetStateAction<IData<T | undefined>>>,
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
  updateValue: (val: T) => {
    setHistory(pushValue(history, val, maxLength));
  },
});

const useHistoryTravel = <T>(initialValue?: T, maxLength = 0) => {
  const [history, setHistory] = useState<IData<T | undefined>>({
    future: [],
    past: [],
    present: initialValue,
  });

  const { present, past, future } = history;
  const initialValueRef = useRef(initialValue);

  const { go, updateValue } = createHistoryActions<T>(
    history,
    setHistory,
    maxLength
  );

  const reset = (...params: [initial?: T]) => {
    const _initial = params.length > 0 ? params[0] : initialValueRef.current;
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
