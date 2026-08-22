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

/** Storage and `JSON.parse` both throw `Error` subclasses; anything else is wrapped. */
const toError = <T>(thrown: T) =>
  thrown instanceof Error ? thrown : new Error(String(thrown));

const logError = (error: Error) => {
  console.error(error);
};

/**
 * Serializes a value before storing in storage
 * Uses custom serializer if provided, otherwise JSON.stringify
 */
const serialize = <T>(value: T, options: Options<T>) => {
  if (options.serializer) {
    return options.serializer(value);
  }
  return JSON.stringify(value);
};

/**
 * Deserializes a value retrieved from storage
 * Uses custom deserializer if provided, otherwise JSON.parse
 */
const deserialize = <T>(value: string, options: Options<T>): T => {
  if (options.deserializer) {
    return options.deserializer(value);
  }
  return JSON.parse(value);
};

/** Resolves `defaultValue`, calling it when it is a factory */
const resolveDefaultValue = <T>(options: Options<T>) => {
  if (isFunction(options.defaultValue)) {
    return options.defaultValue();
  }
  return options.defaultValue;
};

/**
 * Retrieves and deserializes the stored value from storage
 * Falls back to defaultValue if storage access fails or value doesn't exist
 */
const readStoredValue = <T>(
  storage: Storage | undefined,
  key: string,
  options: Options<T>,
  onError: (error: Error) => void
) => {
  try {
    const raw = storage?.getItem(key);
    if (raw) {
      return deserialize(raw, options);
    }
  } catch (error) {
    onError(toError(error));
  }
  return resolveDefaultValue(options);
};

/**
 * Creates a custom hook for managing state in browser storage (localStorage/sessionStorage)
 * @param getStorage Function that returns the storage object to use (localStorage or sessionStorage)
 * @returns A hook that manages state with the specified storage
 */
export const createUseStorageState = (
  getStorage: () => Storage | undefined
) => {
  /**
   * Custom hook for managing state that persists in browser storage
   * @param key Storage key to store/retrieve the value
   * @param options Configuration options for storage behavior
   * @returns [storedValue, setValue] tuple for reading/writing storage
   */
  const useStorageState = <T>(key: string, options: Options<T> = {}) => {
    let storage: Storage | undefined;
    const { onError = logError } = options;
    // Try to get storage instance, with error handling
    // https://github.com/alibaba/hooks/issues/800
    try {
      storage = getStorage();
    } catch (error) {
      onError(toError(error));
    }
    const getStoredValue = () =>
      readStoredValue(storage, key, options, onError);
    const [state, setState] = useState(getStoredValue);
    // Update state when key changes
    useUpdateEffect(() => {
      setState(getStoredValue());
    }, [key]);
    /**
     * Updates both the React state and storage value
     * @param value New value or function to update current value
     */
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
