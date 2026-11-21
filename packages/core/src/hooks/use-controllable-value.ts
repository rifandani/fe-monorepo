/* oxlint-disable react/react-compiler react-doctor/react-compiler-no-manual-memoization eslint/func-style */
import { useMemoizedFn } from "@workspace/core/hooks/use-memoized-fn";
import { useUpdate } from "@workspace/core/hooks/use-update";
import { isFunction } from "radashi";
import type { SetStateAction } from "react";
import { useMemo, useRef } from "react";

interface Options<
  T,
  V extends string = "value",
  D extends string = "defaultValue",
  C extends string = "onChange",
> {
  defaultValue?: T;
  defaultValuePropName?: D;
  valuePropName?: V;
  trigger?: C;
}

type TriggerFn<T> = (value: T, ...args: unknown[]) => void;

type NonInferredKey<N> = N extends string ? N : never;

type ControllableProps<
  T,
  V extends string = "value",
  D extends string = "defaultValue",
  C extends string = "onChange",
> = { [K in NonInferredKey<V>]?: T } & { [K in NonInferredKey<D>]?: T } & {
  [K in NonInferredKey<C>]?: TriggerFn<T>;
};

type ValueAt<P, K extends string> = P extends { [Q in K]?: infer X }
  ? Exclude<X, undefined>
  : never;

type StandardProps<T> = ControllableProps<T> & {
  value: T;
  onChange: (val: T) => void;
};

type Updater<T> = T | ((prevState: T | undefined) => T);

const readProp = <K extends string, X>(
  props: { [P in K]?: X },
  key: K
): X | undefined => props[key];

// oxlint-disable-next-line typescript/no-explicit-any -- TS overloads
export function useControllableValue<T = any>(
  props: StandardProps<T>
): readonly [T, (v: SetStateAction<T>) => void];
export function useControllableValue<
  P extends object,
  V extends string = "value",
  D extends string = "defaultValue",
  C extends string = "onChange",
  T = ValueAt<P, V | D>,
>(
  props?: P & ControllableProps<T, V, D, C>,
  options?: Options<T, V, D, C>
): readonly [T | undefined, (v: Updater<T>, ...args: unknown[]) => void];
export function useControllableValue<
  T,
  V extends string,
  D extends string,
  C extends string,
>(
  props: ControllableProps<
    T,
    V | "value",
    D | "defaultValue",
    C | "onChange"
  > = {},
  options: Options<T, V, D, C> = {}
) {
  const { defaultValue } = options;
  const valuePropName = options.valuePropName ?? "value";
  const defaultValuePropName = options.defaultValuePropName ?? "defaultValue";
  const trigger = options.trigger ?? "onChange";

  const value = readProp<V | "value", T>(props, valuePropName);
  const isControlled = Object.hasOwn(props, valuePropName);

  const initialValue = useMemo(() => {
    if (isControlled) {
      return value;
    }

    if (Object.hasOwn(props, defaultValuePropName)) {
      return readProp<D | "defaultValue", T>(props, defaultValuePropName);
    }

    return defaultValue;
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stateRef = useRef(initialValue);

  if (isControlled) {
    stateRef.current = value;
  }

  const update = useUpdate();

  const setState = (v: Updater<T>, ...args: unknown[]) => {
    const r = isFunction(v) ? v(stateRef.current) : v;

    if (!isControlled) {
      stateRef.current = r;
      update();
    }

    const onChange = readProp<C | "onChange", TriggerFn<T>>(props, trigger);

    if (isFunction(onChange)) {
      onChange(r, ...args);
    }
  };

  return [stateRef.current, useMemoizedFn(setState)] as const;
}
