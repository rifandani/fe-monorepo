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

type TriggerFn<T> = (value: T, ...args: unknown[]) => void;

type Props<T> = Record<string, T | TriggerFn<T> | undefined>;

interface StandardProps<T> {
  value: T;
  defaultValue?: T;
  onChange: (val: T) => void;
}

// oxlint-disable-next-line typescript/no-explicit-any -- TS overloads
export function useControllableValue<T = any>(
  props: StandardProps<T>
): [T, (v: SetStateAction<T>) => void];
// oxlint-disable-next-line typescript/no-explicit-any -- TS overloads
export function useControllableValue<T = any>(
  props?: Props<T>,
  options?: Options<T>
): [T, (v: SetStateAction<T>, ...args: unknown[]) => void];
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

  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  const bag = props as Props<T>;
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  const value = bag[valuePropName] as T;
  const isControlled = Object.hasOwn(bag, valuePropName);

  const initialValue = useMemo(() => {
    if (isControlled) {
      return value;
    }

    if (Object.hasOwn(bag, defaultValuePropName)) {
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion
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

  const setState = (v: SetStateAction<T>, ...args: unknown[]) => {
    const r = isFunction(v)
      ? // oxlint-disable-next-line typescript/no-unsafe-type-assertion
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
