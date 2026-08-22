import { useMemoizedFn } from "@workspace/core/hooks/use-memoized-fn";
import { isNumber } from "radashi";
import { useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
/**
 * Interface representing the history data structure
 * @template T Type of the value being tracked
 */
interface IData<T> {
  present?: T;
  past: T[];
  future: T[];
}

/**
 * Calculates the target index in an array based on step direction
 * @template T Array element type
 * @param step Number of steps to move (positive for forward, negative for backward)
 * @param arr Target array
 * @returns Clamped index within array bounds
 */
const dumpIndex = <T>(step: number, arr: T[]) => {
  let index =
    step > 0
      ? step - 1 // move forward
      : arr.length + step; // move backward
  if (index >= arr.length - 1) {
    index = arr.length - 1;
  }
  if (index < 0) {
    index = 0;
  }
  return index;
};

/**
 * Splits an array into three parts based on a target index
 * @template T Array element type
 * @param step Number of steps to determine split point
 * @param targetArr Array to split
 * @returns Object containing current element and arrays before/after it
 */
const split = <T>(step: number, targetArr: T[]) => {
  const index = dumpIndex(step, targetArr);
  return {
    _after: targetArr.slice(index + 1),
    _before: targetArr.slice(0, index),
    _current: targetArr[index],
  };
};

/**
 * Records `val` as the new present, dropping the oldest entry once `maxLength` is exceeded
 * @template T Type of value to track history for
 */
const pushValue = <T>(
  history: IData<T>,
  val: T,
  maxLength: number
): IData<T> => {
  // SAFETY: `present` is only absent before the first value is set, and every
  // caller of this helper has already committed one.
  const _past = [...history.past, history.present as T];
  const maxLengthNum = isNumber(maxLength) ? maxLength : Number(maxLength);
  // maximum number of records exceeded
  if (maxLengthNum > 0 && _past.length > maxLengthNum) {
    // delete first
    _past.splice(0, 1);
  }
  return {
    future: [],
    past: _past,
    present: val,
  };
};

/**
 * Moves `step` entries out of the future and into the past
 * @template T Type of value to track history for
 */
const travelForward = <T>(history: IData<T>, step: number): IData<T> => {
  const { _before, _current, _after } = split(step, history.future);
  return {
    future: _after,
    // SAFETY: travelling implies a committed `present` - see `updateHistory`.
    past: [...history.past, history.present as T, ..._before],
    present: _current,
  };
};

/**
 * Moves `step` entries out of the past and into the future
 * @template T Type of value to track history for
 */
const travelBackward = <T>(history: IData<T>, step: number): IData<T> => {
  const { _before, _current, _after } = split(step, history.past);
  return {
    // SAFETY: travelling implies a committed `present` - see `updateHistory`.
    future: [..._after, history.present as T, ...history.future],
    past: _before,
    present: _current,
  };
};

/**
 * Builds the history actions over the current `history` snapshot.
 *
 * Kept outside the hook so its body stays a thin `useMemoizedFn` wiring layer.
 */
const createHistoryActions = <T>(
  history: IData<T | undefined>,
  setHistory: Dispatch<SetStateAction<IData<T | undefined>>>,
  maxLength: number
) => ({
  /**
   * Moves through history by specified number of steps
   * @param step Positive for forward, negative for backward movement
   */
  go: (step: number) => {
    // `Number` is identity for numbers and coerces stray string callers, so it
    // subsumes the `isNumber` guard this used to branch on.
    const stepNum = Number(step);
    // Travelling forward consumes `future`, backward consumes `past`; a zero
    // step, or an empty source stack, is a no-op.
    const [source, travel] =
      stepNum > 0
        ? ([history.future, travelForward] as const)
        : ([history.past, travelBackward] as const);
    if (stepNum === 0 || source.length === 0) {
      return;
    }
    setHistory(travel(history, stepNum));
  },
  /**
   * Updates current value and manages history state
   * @param val New value to set as present
   */
  updateValue: (val: T) => {
    setHistory(pushValue(history, val, maxLength));
  },
});

/**
 * A hook to manage state change history. It provides encapsulation methods to travel through the history.
 * @template T Type of value to track history for
 * @param initialValue Initial value to start with
 * @param maxLength Maximum number of past states to keep (0 for unlimited)
 * @returns Object containing current value and methods to traverse history
 *
 * @example
 * ```ts
 * const { value, back, forward, go, reset } = useHistoryTravel(0)
 * // Update value
 * setValue(1)
 * // Go back one step
 * back()
 * ```
 */
const useHistoryTravel = <T>(initialValue?: T, maxLength = 0) => {
  /**
   * Main history state containing past, present and future values
   */
  const [history, setHistory] = useState<IData<T | undefined>>({
    future: [],
    past: [],
    present: initialValue,
  });
  const { present, past, future } = history;
  // Reference to track initial value for reset functionality
  const initialValueRef = useRef(initialValue);
  const { go, updateValue } = createHistoryActions<T>(
    history,
    setHistory,
    maxLength
  );
  // Stays in the hook body: the react-compiler rule forbids handing a ref
  // across a function boundary during render.
  // oxlint-disable-next-line typescript/no-explicit-any
  const reset = (...params: any[]) => {
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
