/* oxlint-disable react/react-compiler react-doctor/react-compiler-no-manual-memoization eslint/func-style */
import { useMemoizedFn } from "@workspace/core/hooks/use-memoized-fn";
import { useUpdate } from "@workspace/core/hooks/use-update";
import { isFunction } from "radashi";
import type { SetStateAction } from "react";
import { useMemo, useRef } from "react";

interface Options<T> {
  defaultValue?: T;
  defaultValuePropName?: string;
  valuePropName?: string;
  trigger?: string;
}
/** The change handler a component passes under the configured `trigger` name. */
type TriggerFn<T> = (value: T, ...args: unknown[]) => void;
/**
 * A component's props addressed by caller-supplied names: this hook reads the
 * value, the default value and the change trigger, and nothing else.
 */
type Props<T> = Record<string, T | TriggerFn<T> | undefined>;
interface StandardProps<T> {
  value: T;
  defaultValue?: T;
  onChange: (val: T) => void;
}
/**
 * In some components, we need the state to be managed by itself or controlled by it's parent.
 * This hook helps you manage this kind of state.
 *
 * - If there is no value in props, the component manage state by self (Uncontrolled Component)
 * - If props has the value field, then the state is controlled by it's parent (Controlled Component)
 * - If there is an `onChange` field in props, the `onChange` will be trigger when state change
 *
 * @example
 *
 * ```tsx
 * const [value, setValue] = useControllableValue({
 *   value: 1,
 *   onChange: (v) => {
 *     console.log(v)
 *   }
 * })
 */
// oxlint-disable-next-line typescript/no-explicit-any -- TS overloads
export function useControllableValue<T = any>(
  props: StandardProps<T>
): [T, (v: SetStateAction<T>) => void];
// oxlint-disable-next-line typescript/no-explicit-any -- TS overloads
export function useControllableValue<T = any>(
  props?: Props<T>,
  options?: Options<T>
  // oxlint-disable-next-line typescript/no-explicit-any
): [T, (v: SetStateAction<T>, ...args: any[]) => void];
// oxlint-disable-next-line typescript/no-explicit-any -- TS overloads
export function useControllableValue<T = any>(
  props: Props<T> | StandardProps<T> = {},
  options: Options<T> = {}
) {
  const {
    defaultValue,
    defaultValuePropName = "defaultValue",
    valuePropName = "value",
    trigger = "onChange",
  } = options;
  // SAFETY: the standard `{ value, defaultValue, onChange }` shape is exactly the
  // name-addressed bag under this hook's default prop names.
  const bag = props as Props<T>;
  // SAFETY: `valuePropName` names the prop holding this hook's value, whose type
  // the caller states as `T` when instantiating the hook.
  const value = bag[valuePropName] as T;
  const isControlled = Object.hasOwn(bag, valuePropName);
  const initialValue = useMemo(() => {
    if (isControlled) {
      return value;
    }
    if (Object.hasOwn(bag, defaultValuePropName)) {
      // SAFETY: as above, for the prop named by `defaultValuePropName`.
      return bag[defaultValuePropName] as T;
    }
    return defaultValue;
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const stateRef = useRef(initialValue);
  if (isControlled) {
    stateRef.current = value;
  }
  const update = useUpdate();
  // oxlint-disable-next-line typescript/no-explicit-any
  const setState = (v: SetStateAction<T>, ...args: any[]) => {
    const r = isFunction(v)
      ? // SAFETY: `stateRef` is seeded from the controlled value or the default, so
        // it holds `undefined` only when the caller's own `T` includes it.
        v(stateRef.current as T)
      : v;
    if (!isControlled) {
      stateRef.current = r;
      update();
    }
    const onChange = bag[trigger];
    if (isFunction(onChange)) {
      onChange(r, ...args);
    }
  };
  return [stateRef.current, useMemoizedFn(setState)] as const;
}
