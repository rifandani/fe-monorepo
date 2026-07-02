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
type Props = Record<string, unknown>;
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
 */
export const useControllableValue: {
  <T>(props: StandardProps<T>): [T, (v: SetStateAction<T>) => void];
  <T = unknown>(
    props?: Props,
    options?: Options<T>
  ): [T, (v: SetStateAction<T>, ...args: unknown[]) => void];
} = <T = unknown>(props: Props = {}, options: Options<T> = {}) => {
  const {
    defaultValue,
    defaultValuePropName = "defaultValue",
    valuePropName = "value",
    trigger = "onChange",
  } = options;
  const value = props[valuePropName] as T;
  const isControlled = Object.hasOwn(props, valuePropName);
  const initialValue = useMemo(() => {
    if (isControlled) {
      return value;
    }
    if (Object.hasOwn(props, defaultValuePropName)) {
      return props[defaultValuePropName] as T;
    }
    return defaultValue;
  }, []);
  const stateRef = useRef(initialValue);
  if (isControlled) {
    stateRef.current = value;
  }
  const update = useUpdate();
  const setState = function setState(v: SetStateAction<T>, ...args: unknown[]) {
    const r = isFunction(v) ? v(stateRef.current) : v;
    if (!isControlled) {
      stateRef.current = r;
      update();
    }
    const onChange = props[trigger];
    if (isFunction(onChange)) {
      onChange(r, ...args);
    }
  };
  return [stateRef.current, useMemoizedFn(setState)] as const;
};
