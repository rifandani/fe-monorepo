import { useMemoizedFn } from "@workspace/core/hooks/use-memoized-fn";
import { useUpdateEffect } from "@workspace/core/hooks/use-update-effect";
import { isFunction } from "radashi";
import { useState } from "react";

export type SetState<S> = S | ((prevState?: S) => S);

export interface Options<T> {
  defaultValue?: T | (() => T);
  serializer?: (value: T) => string;
  deserializer?: (value: string) => T;
  onError?: (error: Error) => void;
}

const toError = (cause: unknown) =>
  cause instanceof Error ? cause : new Error(String(cause));

const logError = (error: Error) => {
  console.error(error);
};

const serialize = <T>(value: T, options: Options<T>) => {
  if (options.serializer) {
    return options.serializer(value);
  }

  return JSON.stringify(value);
};

const deserialize = <T>(value: string, options: Options<T>): T => {
  if (options.deserializer) {
    return options.deserializer(value);
  }

  // oxlint-disable-next-line typescript/no-unsafe-return
  return JSON.parse(value);
};

const resolveDefaultValue = <T>(options: Options<T>) => {
  if (isFunction(options.defaultValue)) {
    return options.defaultValue();
  }

  return options.defaultValue;
};

const hasStoredValue = (value: string | null | undefined): value is string =>
  Boolean(value);

const readStoredValue = <T>(
  storage: Storage | undefined,
  key: string,
  options: Options<T>,
  onError: (error: Error) => void
) => {
  try {
    const raw = storage?.getItem(key);

    if (hasStoredValue(raw)) {
      return deserialize(raw, options);
    }
  } catch (error) {
    onError(toError(error));
  }

  return resolveDefaultValue(options);
};

export const createUseStorageState = (
  getStorage: () => Storage | undefined
) => {
  const useStorageState = <T>(key: string, options: Options<T> = {}) => {
    let storage: Storage | undefined;
    const { onError = logError } = options;

    try {
      storage = getStorage();
    } catch (error) {
      onError(toError(error));
    }

    const getStoredValue = () =>
      readStoredValue(storage, key, options, onError);

    const [state, setState] = useState(getStoredValue);
    useUpdateEffect(() => {
      setState(getStoredValue());
    }, [key]);

    const updateState = (value?: SetState<T>) => {
      const currentState = isFunction(value) ? value(state) : value;
      setState(currentState);

      if (currentState === undefined) {
        storage?.removeItem(key);
      } else {
        try {
          storage?.setItem(key, serialize(currentState, options));
        } catch (error) {
          console.error(error);
        }
      }
    };

    return [state, useMemoizedFn(updateState)] as const;
  };

  return useStorageState;
};
