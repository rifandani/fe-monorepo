import { useMemoizedFn } from "@workspace/core/hooks/use-memoized-fn";
import { isNumber } from "radashi";
import { useRef, useState } from "react";
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
  let index = step > 0 ? step - 1 : arr.length + step;
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
  /**
   * Reference to track initial value for reset functionality
   */
  const initialValueRef = useRef(initialValue);
  /**
   * Resets history state back to initial or specified value
   * @param params Optional new initial value
   */
  const reset = (...params: unknown[]) => {
    const _initial =
      params.length > 0 ? (params[0] as T) : initialValueRef.current;
    initialValueRef.current = _initial;
    setHistory({
      future: [],
      past: [],
      present: _initial,
    });
  };
  /**
   * Updates current value and manages history state
   * @param val New value to set as present
   */
  const updateValue = (val: T) => {
    const _past = [...past, present];
    const maxLengthNum = isNumber(maxLength) ? maxLength : Number(maxLength);
    // maximum number of records exceeded
    if (maxLengthNum > 0 && _past.length > maxLengthNum) {
      // delete first
      _past.splice(0, 1);
    }
    setHistory({
      future: [],
      past: _past,
      present: val,
    });
  };
  /**
   * Moves forward in history by specified number of steps
   * @param step Number of steps to move forward (default: 1)
   */
  const _forward = (step = 1) => {
    if (future.length === 0) {
      return;
    }
    const { _before, _current, _after } = split(step, future);
    setHistory({
      future: _after,
      past: [...past, present, ..._before],
      present: _current,
    });
  };
  /**
   * Moves backward in history by specified number of steps
   * @param step Number of steps to move backward (default: -1)
   */
  const _backward = (step = -1) => {
    if (past.length === 0) {
      return;
    }
    const { _before, _current, _after } = split(step, past);
    setHistory({
      future: [..._after, present, ...future],
      past: _before,
      present: _current,
    });
  };
  /**
   * Moves through history by specified number of steps
   * @param step Positive for forward, negative for backward movement
   */
  const go = (step: number) => {
    const stepNum = isNumber(step) ? step : Number(step);
    if (stepNum === 0) {
      return;
    }
    if (stepNum > 0) {
      return _forward(stepNum);
    }
    _backward(stepNum);
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
